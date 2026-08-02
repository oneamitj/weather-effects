var SnowModule = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/app/components/weather/snowEffect.ts
  var snowEffect_exports = {};
  __export(snowEffect_exports, {
    SnowEffect: () => SnowEffect
  });
  var INTENSITY = {
    low: { density: 0.35, speedMul: 1, deposit: 0.1, gust: 0.6 },
    mid: { density: 0.7, speedMul: 1.4, deposit: 0.2, gust: 1.4 },
    high: { density: 1.4, speedMul: 1.9, deposit: 0.3, gust: 2.4 }
  };
  var LAYERS = [
    { share: 0.45, radius: [0.6, 1.4], speed: [0.25, 0.55], blur: 0.7, alpha: [0.15, 0.4], windMul: 0.15, sway: [0.1, 0.3], settle: false },
    { share: 0.3, radius: [1.2, 2.2], speed: [0.5, 0.95], blur: 0.45, alpha: [0.3, 0.65], windMul: 0.3, sway: [0.2, 0.5], settle: true },
    { share: 0.2, radius: [2, 3.2], speed: [0.9, 1.6], blur: 0.15, alpha: [0.5, 0.9], windMul: 0.55, sway: [0.25, 0.6], settle: true },
    { share: 0.05, radius: [6, 12], speed: [1.6, 2.8], blur: 0.85, alpha: [0.06, 0.18], windMul: 0.9, sway: [0.4, 0.9], settle: false }
  ];
  var CELL = 4;
  var MAX_PILE_FRAC = 0.2;
  var REFERENCE_H = 800;
  var rand = (min, max) => min + Math.random() * (max - min);
  var pick = (range) => rand(range[0], range[1]);
  var makeSprite = (blur) => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    const core = Math.max(0.05, 1 - blur);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(core, "rgba(255, 255, 255, 0.85)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return c;
  };
  var SPRITES = null;
  var getSprites = () => SPRITES ??= LAYERS.map((L) => makeSprite(L.blur));
  var Flake = class {
    layer;
    x = 0;
    y = 0;
    r = 0;
    vy = 0;
    phase = 0;
    swaySpeed = 0;
    sway = 0;
    alpha = 0;
    constructor(w, h, layer, cfg, sizeMul) {
      this.layer = layer;
      this.reset(w, h, cfg, sizeMul, true);
    }
    reset(w, h, cfg, sizeMul, anywhere = false) {
      const L = LAYERS[this.layer];
      this.x = rand(0, w);
      this.y = anywhere ? rand(-h, h) : rand(-h * 0.1, -15);
      this.r = Math.max(0.5, pick(L.radius) * sizeMul);
      this.vy = pick(L.speed) * cfg.speedMul * sizeMul;
      this.phase = rand(0, Math.PI * 2);
      this.swaySpeed = rand(0.015, 0.05);
      this.sway = pick(L.sway) * sizeMul;
      this.alpha = pick(L.alpha);
    }
  };
  var SnowEffect = class {
    canvas;
    ctx;
    wind;
    intensity;
    settleOn;
    sizeMul;
    cfg;
    layers;
    pile = [];
    effWind = 0;
    running = false;
    destroyed = false;
    lastT = 0;
    lastDraw = 0;
    minFrameMs;
    w = 0;
    h = 0;
    frame = () => {
    };
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.wind = Math.max(-10, Math.min(10, options.wind ?? 0));
      this.intensity = options.intensity ?? "mid";
      this.settleOn = options.settle ?? true;
      this.sizeMul = options.sizeMul ?? 1;
      this.minFrameMs = 1e3 / (options.fpsCap ?? 30);
      if (!INTENSITY[this.intensity]) throw new Error(`unknown intensity: ${this.intensity}`);
      this.cfg = INTENSITY[this.intensity];
      this.layers = LAYERS.map(() => []);
      if (!this.ctx) return;
      this.resize();
      this.frame = (t) => {
        if (!this.running) return;
        requestAnimationFrame(this.frame);
        if (t - this.lastDraw < this.minFrameMs) return;
        this.lastDraw = t;
        this.tick(t);
      };
      this.resume();
    }
    resize() {
      if (!this.ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = this.canvas.clientWidth;
      this.h = this.canvas.clientHeight;
      this.canvas.width = this.w * dpr;
      this.canvas.height = this.h * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.pile = new Array(Math.ceil(this.w / CELL) + 1).fill(0);
      this.populate();
      if (!this.running) this.renderStill();
    }
    populate() {
      for (let li = 0; li < LAYERS.length; li++) {
        const flakes = this.layers[li];
        const target = Math.round(this.w * this.cfg.density * (this.h / REFERENCE_H) * LAYERS[li].share);
        while (flakes.length < target) flakes.push(new Flake(this.w, this.h, li, this.cfg, this.sizeMul));
        flakes.length = target;
      }
    }
    setWind(v) {
      this.wind = Math.max(-10, Math.min(10, v));
    }
    setIntensity(level) {
      if (!INTENSITY[level]) throw new Error(`unknown intensity: ${level}`);
      if (!this.ctx) return;
      this.intensity = level;
      this.cfg = INTENSITY[level];
      for (let li = 0; li < LAYERS.length; li++) {
        for (const f of this.layers[li]) {
          f.vy = pick(LAYERS[li].speed) * this.cfg.speedMul * this.sizeMul;
        }
      }
      this.populate();
      if (!this.running) this.renderStill();
    }
    setSettle(on) {
      this.settleOn = on;
    }
    /** PORT: stop the loop without teardown (offscreen row, reduced motion). */
    pause() {
      this.running = false;
      this.lastT = 0;
      this.lastDraw = 0;
    }
    /** PORT: restart after pause(). No-op if destroyed or already running. */
    resume() {
      if (this.destroyed || this.running || !this.ctx) return;
      this.running = true;
      requestAnimationFrame(this.frame);
    }
    get isRunning() {
      return this.running;
    }
    /**
     * PORT: one static frame for prefers-reduced-motion — flakes scattered
     * mid-fall, whatever pile has formed, nothing moving.
     */
    renderStill() {
      if (!this.ctx) return;
      this.lastT = 0;
      this.tick(0);
    }
    // Move snow from tall columns to shorter neighbours so piles keep a natural slope.
    relaxPile() {
      const p = this.pile;
      for (let i = 0; i < p.length - 1; i++) {
        const diff = p[i] - p[i + 1];
        if (Math.abs(diff) > 6) {
          p[i] -= diff * 0.25;
          p[i + 1] += diff * 0.25;
        }
      }
    }
    stepLayer(li, dt) {
      const { w, h, cfg } = this;
      const ctx = this.ctx;
      const L = LAYERS[li];
      const sprite = getSprites()[li];
      const maxPile = h * MAX_PILE_FRAC * this.sizeMul;
      for (const f of this.layers[li]) {
        f.phase += f.swaySpeed * dt;
        f.x += (this.effWind * 0.35 * L.windMul * this.sizeMul + Math.sin(f.phase) * f.sway) * dt;
        f.y += f.vy * dt;
        const m = f.r * 3;
        if (f.x < -m) f.x += w + m * 2;
        else if (f.x > w + m) f.x -= w + m * 2;
        if (L.settle) {
          const col = Math.min(this.pile.length - 1, Math.max(0, Math.round(f.x / CELL)));
          if (f.y + f.r >= h - this.pile[col]) {
            if (this.settleOn && this.pile[col] < maxPile) {
              this.pile[col] = Math.min(maxPile, this.pile[col] + f.r * cfg.deposit);
            }
            f.reset(w, h, cfg, this.sizeMul);
            continue;
          }
        } else if (f.y - m > h) {
          f.reset(w, h, cfg, this.sizeMul);
          continue;
        }
        const d = f.r * 3;
        ctx.globalAlpha = f.alpha;
        ctx.drawImage(sprite, f.x - d / 2, f.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
    }
    tick(t) {
      const dt = this.lastT ? Math.min((t - this.lastT) / 16.67, 3) : 1;
      this.lastT = t;
      const { w, h } = this;
      const ctx = this.ctx;
      const g = this.cfg.gust;
      this.effWind = this.wind + Math.sin(t * 3e-4) * g + Math.sin(t * 13e-5 + 1.7) * g * 0.6;
      ctx.clearRect(0, 0, w, h);
      this.stepLayer(0, dt);
      this.stepLayer(1, dt);
      this.stepLayer(2, dt);
      if (this.settleOn) {
        this.relaxPile();
      } else {
        for (let i = 0; i < this.pile.length; i++) this.pile[i] = Math.max(0, this.pile[i] - 0.06 * dt);
      }
      let hasPile = false;
      for (let i = 0; i < this.pile.length; i++) {
        if (this.pile[i] > 0.5) {
          hasPile = true;
          break;
        }
      }
      if (hasPile) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let i = 0; i < this.pile.length; i++) ctx.lineTo(i * CELL, h - this.pile[i]);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = "rgba(238, 244, 251, 0.92)";
        ctx.fill();
      }
      this.stepLayer(3, dt);
    }
    destroy() {
      this.running = false;
      this.destroyed = true;
    }
  };
  return __toCommonJS(snowEffect_exports);
})();
