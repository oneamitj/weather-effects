var HailModule = (() => {
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

  // src/app/components/weather/hailEffect.ts
  var hailEffect_exports = {};
  __export(hailEffect_exports, {
    HailEffect: () => HailEffect
  });
  var INTENSITY = {
    low: { density: 0.08, speed: [10, 15], radius: [1.4, 2.6], bigChance: 0.02, opacity: 0.6, chipChance: 0.3 },
    mid: { density: 0.22, speed: [13, 19], radius: [1.7, 3.4], bigChance: 0.05, opacity: 0.75, chipChance: 0.5 },
    high: { density: 0.48, speed: [16, 24], radius: [2, 4.6], bigChance: 0.1, opacity: 0.85, chipChance: 0.7 }
  };
  var REFERENCE_H = 800;
  var rand = (min, max) => min + Math.random() * (max - min);
  var pick = (range) => rand(range[0], range[1]);
  var Stone = class {
    x = 0;
    y = 0;
    r = 0;
    terminal = 0;
    vy = 0;
    vx = 0;
    phase = 0;
    wobble = 0;
    alpha = 0;
    ground = 0;
    bouncesLeft = 0;
    rest = 0;
    // >0: lying on the ground, fading out
    constructor(w, h, cfg, sizeMul) {
      this.reset(w, h, cfg, sizeMul, true);
    }
    reset(w, h, cfg, sizeMul, anywhere = false) {
      this.x = rand(-w * 0.1, w * 1.1);
      this.y = anywhere ? rand(-h, h) : rand(-h * 0.25, -12);
      this.r = Math.max(0.5, pick(cfg.radius) * (Math.random() < cfg.bigChance ? rand(1.5, 2) : 1) * sizeMul);
      this.terminal = pick(cfg.speed) * sizeMul + this.r * 0.8;
      this.vy = this.terminal * rand(0.5, 0.75);
      this.vx = rand(-0.4, 0.4) * sizeMul;
      this.phase = rand(0, Math.PI * 2);
      this.wobble = rand(0.15, 0.5) * sizeMul;
      this.alpha = Math.min(1, cfg.opacity * rand(0.55, 1.35));
      this.ground = h - rand(0, h * 0.07);
      this.bouncesLeft = 1 + (Math.random() * 2.4 | 0);
      this.rest = 0;
    }
  };
  var Chip = class {
    x;
    y;
    vx;
    vy;
    r;
    life = 1;
    g;
    constructor(x, y, sizeMul) {
      this.x = x;
      this.y = y;
      this.vx = rand(-2.6, 2.6) * sizeMul;
      this.vy = rand(-4.4, -1.4) * sizeMul;
      this.r = Math.max(0.3, rand(0.5, 1.3) * sizeMul);
      this.g = 0.3 * sizeMul;
    }
    step(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += this.g * dt;
      this.life -= 0.055 * dt;
      return this.life > 0;
    }
  };
  var HailEffect = class {
    canvas;
    ctx;
    wind;
    // public so wrappers/tests can read the clamped value
    intensity;
    sizeMul;
    cfg;
    stones = [];
    chips = [];
    running = false;
    destroyed = false;
    lastT = 0;
    w = 0;
    h = 0;
    frame = () => {
    };
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.wind = Math.max(-10, Math.min(10, options.wind ?? 2));
      this.intensity = options.intensity ?? "mid";
      this.sizeMul = options.sizeMul ?? 1;
      if (!INTENSITY[this.intensity]) throw new Error(`unknown intensity: ${this.intensity}`);
      this.cfg = INTENSITY[this.intensity];
      if (!this.ctx) return;
      this.resize();
      this.frame = (t) => {
        if (!this.running) return;
        this.tick(t);
        requestAnimationFrame(this.frame);
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
      this.populate();
      if (!this.running) this.renderStill();
    }
    populate() {
      const target = Math.round(this.w * this.cfg.density * (this.h / REFERENCE_H));
      while (this.stones.length < target) {
        this.stones.push(new Stone(this.w, this.h, this.cfg, this.sizeMul));
      }
      this.stones.length = target;
    }
    setWind(v) {
      this.wind = Math.max(-10, Math.min(10, v));
    }
    setIntensity(level) {
      if (!INTENSITY[level]) throw new Error(`unknown intensity: ${level}`);
      if (!this.ctx) return;
      this.intensity = level;
      this.cfg = INTENSITY[level];
      for (const s of this.stones) {
        s.r = Math.max(0.5, pick(this.cfg.radius) * (Math.random() < this.cfg.bigChance ? rand(1.5, 2) : 1) * this.sizeMul);
        s.terminal = pick(this.cfg.speed) * this.sizeMul + s.r * 0.8;
        s.alpha = Math.min(1, this.cfg.opacity * rand(0.55, 1.35));
      }
      this.populate();
      if (!this.running) this.renderStill();
    }
    /** PORT: stop the loop without teardown (offscreen row, reduced motion). */
    pause() {
      this.running = false;
      this.lastT = 0;
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
    /** PORT: one static frame for prefers-reduced-motion — scattered pellets,
     *  nothing moving. */
    renderStill() {
      if (!this.ctx) return;
      this.lastT = 0;
      this.tick(0);
    }
    spawnChips(x, y, count) {
      for (let i = 0; i < count; i++) this.chips.push(new Chip(x, y, this.sizeMul));
    }
    tick(t) {
      const dt = this.lastT ? Math.min((t - this.lastT) / 16.67, 3) : 1;
      this.lastT = t;
      const { w, h, cfg } = this;
      const ctx = this.ctx;
      const drift = this.wind * 0.35 * this.sizeMul;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const s of this.stones) {
        if (s.rest > 0) {
          s.rest -= 0.035 * dt;
          if (s.rest <= 0) {
            s.reset(w, h, cfg, this.sizeMul);
            continue;
          }
          ctx.globalAlpha = s.alpha * s.rest * 0.8;
          ctx.fillStyle = "#d8e8f0";
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 0.9, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        s.vy = Math.min(s.vy + (0.55 * this.sizeMul + s.r * 0.05) * dt, s.terminal);
        s.x += (s.vx + drift + Math.sin(t * 8e-3 + s.phase) * s.wobble) * dt;
        s.y += s.vy * dt;
        if (s.x < -w * 0.12) s.x += w * 1.24;
        else if (s.x > w * 1.12) s.x -= w * 1.24;
        if (s.y >= s.ground) {
          s.y = s.ground;
          if (s.bouncesLeft > 0 && s.vy > 4 * this.sizeMul) {
            s.vy = -s.vy * rand(0.32, 0.5);
            s.vx = s.vx * 0.5 + rand(-2.2, 2.2) * this.sizeMul;
            s.bouncesLeft--;
            if (Math.random() < cfg.chipChance) {
              this.spawnChips(s.x, s.y, 2 + (Math.random() * 3 | 0));
            }
          } else {
            s.rest = 1;
            if (s.r > 2 * this.sizeMul && Math.random() < cfg.chipChance * 0.5) {
              this.spawnChips(s.x, s.y, 2);
            }
            continue;
          }
        }
        if (s.vy > s.terminal * 0.5) {
          const k = 0.8;
          ctx.globalAlpha = s.alpha * 0.3;
          ctx.strokeStyle = "#d8e8f0";
          ctx.lineWidth = s.r * 2;
          ctx.beginPath();
          ctx.moveTo(s.x - (s.vx + drift) * k, s.y - s.vy * k);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        }
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = "#d8e8f0";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r >= 1.8 * this.sizeMul) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.beginPath();
          ctx.arc(s.x - s.r * 0.3, s.y - s.r * 0.32, s.r * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(224, 240, 248, 0.7)";
      this.chips = this.chips.filter((c) => {
        if (!c.step(dt)) return false;
        ctx.globalAlpha = c.life;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;
    }
    destroy() {
      this.running = false;
      this.destroyed = true;
    }
  };
  return __toCommonJS(hailEffect_exports);
})();
