var SkyModule = (() => {
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
  var skyEffect_exports = {};
  __export(skyEffect_exports, {
    SkyEffect: () => SkyEffect
  });
  const PHASES = {
    dawn: {
      sky: [[52, 63, 114], [164, 120, 146], [248, 180, 136]],
      gray: [[58, 60, 84], [96, 92, 112], [142, 120, 124]],
      sun: { x: 0.24, y: 0.6, size: 36, bright: 0.8, core: [255, 214, 170], glow: [255, 170, 110] },
      moon: 0,
      stars: 0.2,
      cirrusMul: 0.8,
      hazeColor: [255, 205, 175]
    },
    day: {
      sky: [[43, 111, 196], [125, 180, 232], [217, 236, 251]],
      gray: [[92, 109, 128], [132, 148, 166], [174, 185, 196]],
      sun: { x: 0.72, y: 0.2, size: 30, bright: 1, core: [255, 252, 240], glow: [255, 240, 200] },
      moon: 0,
      stars: 0,
      cirrusMul: 1,
      hazeColor: [255, 250, 240]
    },
    dusk: {
      sky: [[40, 48, 96], [150, 90, 120], [244, 140, 94]],
      gray: [[48, 50, 76], [88, 78, 100], [130, 100, 98]],
      sun: { x: 0.78, y: 0.66, size: 40, bright: 0.7, core: [255, 190, 130], glow: [255, 140, 80] },
      moon: 0,
      stars: 0.25,
      cirrusMul: 0.8,
      hazeColor: [255, 190, 150]
    },
    night: {
      sky: [[6, 10, 24], [16, 26, 48], [36, 52, 82]],
      gray: [[10, 12, 20], [22, 28, 42], [40, 50, 66]],
      sun: { x: 0.72, y: 0.2, size: 30, bright: 0, core: [255, 252, 240], glow: [255, 240, 200] },
      moon: 1,
      stars: 1,
      cirrusMul: 0.4,
      hazeColor: [90, 110, 145]
    }
  };
  const LIGHT = {
    dawn: {
      white: { base: [255, 215, 190], top: "rgba(255, 225, 200, 0.35)", bottom: "rgba(150, 110, 130, 0.45)" },
      storm: { base: [150, 130, 135], top: "rgba(230, 190, 180, 0.25)", bottom: "rgba(60, 45, 65, 0.6)" }
    },
    day: {
      white: { base: [255, 255, 255], top: "rgba(255, 255, 255, 0.3)", bottom: "rgba(140, 158, 184, 0.38)" },
      storm: { base: [150, 160, 175], top: "rgba(210, 218, 228, 0.25)", bottom: "rgba(28, 36, 50, 0.6)" }
    },
    dusk: {
      white: { base: [255, 200, 175], top: "rgba(255, 205, 170, 0.35)", bottom: "rgba(115, 85, 110, 0.5)" },
      storm: { base: [140, 120, 125], top: "rgba(225, 170, 150, 0.25)", bottom: "rgba(50, 38, 58, 0.62)" }
    },
    night: {
      white: { base: [150, 165, 195], top: "rgba(190, 205, 235, 0.25)", bottom: "rgba(18, 26, 46, 0.55)" },
      storm: { base: [70, 80, 100], top: "rgba(120, 135, 165, 0.2)", bottom: "rgba(8, 12, 24, 0.6)" }
    }
  };
  const MODES = {
    clear: { cirrus: 3, cumulus: 0, deck: 0, mix: 0, haze: 0.12 },
    partly: { cirrus: 2, cumulus: 5, deck: 0, mix: 0.16, haze: 0.16 },
    cloudy: { cirrus: 0, cumulus: 3, deck: 7, mix: 0.8, haze: 0.3 }
  };
  const INTENSITY = {
    partly: {
      low: { cloudMul: 0.6, sun: 0.92, haze: 0.14, mix: 0.1, skyShade: 1 },
      mid: { cloudMul: 1, sun: 0.85, haze: 0.16, mix: 0.16, skyShade: 1 },
      high: { cloudMul: 1.7, sun: 0.75, haze: 0.2, mix: 0.25, skyShade: 0.96 }
    },
    cloudy: {
      low: { cloudMul: 0.7, sun: 0.3, haze: 0.24, mix: 0.6, skyShade: 1.08 },
      mid: { cloudMul: 1, sun: 0.15, haze: 0.3, mix: 0.8, skyShade: 1 },
      high: { cloudMul: 1.5, sun: 0.05, haze: 0.4, mix: 0.92, skyShade: 0.85 }
    }
  };
  const LEVELS = ["low", "mid", "high"];
  const CLOUD_TYPES = {
    cirrus: { yBand: [0.04, 0.3], scale: [0.9, 1.5], drift: 0.05, windMul: 0.06, alpha: [0.25, 0.45] },
    cumulus: {
      yBand: [0.12, 0.52],
      scale: [0.5, 1.15],
      drift: 0.12,
      windMul: 0.22,
      alpha: [0.9, 1],
      baseSize: 300,
      count: [6, 14],
      spreadX: 0.35,
      spreadY: 0.14,
      size: [0.45, 1.2],
      puffAlpha: [0.45, 0.8]
    },
    deck: {
      yBand: [-0.02, 0.38],
      scale: [1.4, 2.4],
      drift: 0.08,
      windMul: 0.12,
      alpha: [0.85, 1],
      baseSize: 260,
      count: [10, 16],
      spreadX: 0.5,
      spreadY: 0.12,
      size: [0.35, 0.85],
      puffAlpha: [0.55, 0.9]
    }
  };
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (range) => rand(range[0], range[1]);
  const approach = (cur, target, k) => cur + (target - cur) * k;
  const rgb = (c) => `rgb(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0})`;
  const rgba = (c, a) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
  const makeCirrusSprite = () => {
    const c = document.createElement("canvas");
    c.width = 420;
    c.height = 120;
    const g = c.getContext("2d");
    if (!g) return c;
    const hasFilter = typeof g.filter === "string";
    if (hasFilter) {
      g.filter = "blur(5px)";
      g.fillStyle = "rgba(255, 255, 255, 0.7)";
    } else {
      g.fillStyle = "rgba(255, 255, 255, 0.7)";
      g.shadowColor = "rgba(255, 255, 255, 0.7)";
      g.shadowBlur = 10;
      g.shadowOffsetX = 600;
    }
    for (let i = 0; i < 4; i++) {
      const len = rand(120, 340);
      const x = rand(0, c.width - len);
      const y = rand(22, 92);
      g.beginPath();
      g.ellipse(x + len / 2 - (hasFilter ? 0 : 600), y, len / 2, rand(3, 9), 0, 0, Math.PI * 2);
      g.fill();
    }
    return c;
  };
  const makePuffTexture = (kind, phase) => {
    const S = 256;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d");
    if (!g) return c;
    const L = LIGHT[phase][kind];
    const base = L.base;
    for (let i = 0; i < 54; i++) {
      const a = rand(0, Math.PI * 2);
      const d = Math.sqrt(Math.random()) * S * 0.3;
      const x = S / 2 + Math.cos(a) * d * 1.2;
      const y = S / 2 + Math.sin(a) * d * 0.75;
      const r = Math.max(4, rand(S * 0.07, S * 0.16) * (1.1 - d / (S * 0.45)));
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, rgba(base, 0.22));
      grad.addColorStop(1, rgba(base, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = "destination-in";
    const mask = g.createRadialGradient(S / 2, S / 2, S * 0.1, S / 2, S / 2, S * 0.48);
    mask.addColorStop(0, "rgba(0, 0, 0, 1)");
    mask.addColorStop(0.6, "rgba(0, 0, 0, 0.85)");
    mask.addColorStop(1, "rgba(0, 0, 0, 0)");
    g.fillStyle = mask;
    g.fillRect(0, 0, S, S);
    g.globalCompositeOperation = "source-atop";
    const sh = g.createLinearGradient(0, S * 0.15, 0, S * 0.9);
    sh.addColorStop(0, L.top);
    sh.addColorStop(1, L.bottom);
    g.fillStyle = sh;
    g.fillRect(0, 0, S, S);
    return c;
  };
  const TEXTURES = {};
  const getTextures = (kind, phase) => {
    const pool = TEXTURES[`${kind}:${phase}`] ??= [];
    while (pool.length < 4) pool.push(makePuffTexture(kind, phase));
    return pool;
  };
  class Cloud {
    type;
    gray;
    light;
    scale;
    sprite;
    puffs;
    dw = 0;
    dh = 0;
    cx;
    cy;
    alpha;
    fade;
    dying = false;
    bobPhase;
    constructor(w, h, type, gray, phase, initial, sizeMul) {
      const T = CLOUD_TYPES[type];
      this.type = type;
      this.gray = gray;
      this.light = phase;
      this.scale = pick(T.scale);
      if (type === "cirrus") {
        this.sprite = makeCirrusSprite();
        this.dw = this.sprite.width * this.scale * sizeMul;
        this.dh = this.sprite.height * this.scale * sizeMul;
      } else {
        const texs = getTextures(gray ? "storm" : "white", phase);
        const B = T.baseSize * this.scale * sizeMul;
        const count = Math.round(pick(T.count));
        this.puffs = [];
        let mx = 0;
        let my = 0;
        for (let i = 0; i < count; i++) {
          const size = B * pick(T.size);
          const p = {
            tex: texs[Math.random() * texs.length | 0],
            dx: rand(-1, 1) * B * T.spreadX,
            dy: rand(-1, 1) * B * T.spreadY,
            size,
            rot: rand(0, Math.PI * 2),
            spin: rand(-1, 1) * 15e-4,
            alpha: pick(T.puffAlpha)
          };
          mx = Math.max(mx, Math.abs(p.dx) + size / 2);
          my = Math.max(my, Math.abs(p.dy) + size / 2);
          this.puffs.push(p);
        }
        this.dw = mx * 2;
        this.dh = my * 2;
      }
      this.cx = rand(-w * 0.15, w * 1.15);
      this.cy = h * pick(T.yBand);
      this.alpha = pick(T.alpha);
      this.fade = initial ? 1 : 0;
      this.bobPhase = rand(0, Math.PI * 2);
    }
    step(w, wind, dt) {
      const T = CLOUD_TYPES[this.type];
      this.cx += (T.drift + wind * T.windMul) * (0.5 + this.scale * 0.5) * dt;
      this.bobPhase += 3e-3 * dt;
      if (this.puffs) {
        for (const p of this.puffs) p.rot += p.spin * dt;
      }
      const half = this.dw / 2;
      if (this.cx - half > w + 40) this.cx -= w + this.dw + 80;
      else if (this.cx + half < -40) this.cx += w + this.dw + 80;
      this.fade = this.dying ? Math.max(0, this.fade - 6e-3 * dt) : Math.min(1, this.fade + 6e-3 * dt);
    }
    draw(ctx, dim = 1) {
      const y = this.cy + Math.sin(this.bobPhase) * 5;
      if (this.type === "cirrus") {
        ctx.globalAlpha = this.alpha * this.fade * dim;
        ctx.drawImage(this.sprite, this.cx - this.dw / 2, y - this.dh / 2, this.dw, this.dh);
        return;
      }
      const a = this.alpha * this.fade;
      for (const p of this.puffs) {
        ctx.save();
        ctx.translate(this.cx + p.dx, y + p.dy);
        ctx.rotate(p.rot);
        ctx.globalAlpha = a * p.alpha;
        ctx.drawImage(p.tex, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    }
  }
  class Bird {
    x;
    y;
    vx;
    s;
    phase;
    flap;
    wave;
    constructor(x, y, vx, s) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.s = s;
      this.phase = rand(0, Math.PI * 2);
      this.flap = rand(0.18, 0.26);
      this.wave = rand(0, Math.PI * 2);
    }
    step(dt) {
      this.phase += this.flap * dt;
      this.wave += 0.01 * dt;
      this.x += this.vx * dt;
      this.y += Math.sin(this.wave) * 0.15 * dt;
    }
    draw(ctx) {
      const { x, y, s } = this;
      const wy = Math.sin(this.phase) * s * 0.55;
      ctx.lineWidth = Math.max(1, s * 0.22);
      ctx.beginPath();
      ctx.moveTo(x - s, y - wy);
      ctx.quadraticCurveTo(x - s * 0.45, y + s * 0.25, x, y);
      ctx.quadraticCurveTo(x + s * 0.45, y + s * 0.25, x + s, y - wy);
      ctx.stroke();
    }
  }
  class SkyEffect {
    canvas;
    ctx;
    wind;
    phase;
    mode;
    intensity;
    birdsOn;
    sizeMul;
    minFrameMs;
    tcfg;
    cur;
    sunB = 0;
    clouds = [];
    birds = [];
    stars = [];
    nextFlockAt = 0;
    running = false;
    destroyed = false;
    lastT = 0;
    lastDraw = 0;
    w = 0;
    h = 0;
    frame = () => {
    };
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.wind = options.wind ?? 0;
      this.phase = options.phase ?? "day";
      this.mode = options.mode ?? "partly";
      this.intensity = options.intensity ?? "mid";
      this.birdsOn = options.birds ?? true;
      this.sizeMul = options.sizeMul ?? 1;
      this.minFrameMs = 1e3 / (options.fpsCap ?? 30);
      if (!PHASES[this.phase]) throw new Error(`unknown phase: ${this.phase}`);
      if (!MODES[this.mode]) throw new Error(`unknown mode: ${this.mode}`);
      if (!LEVELS.includes(this.intensity)) throw new Error(`unknown intensity: ${this.intensity}`);
      if (!this.ctx) return;
      this.tcfg = this.computeTarget();
      const T0 = this.tcfg;
      this.cur = {
        sky: T0.sky.map((c) => [...c]),
        hazeColor: [...T0.hazeColor],
        sunCore: [...T0.sunCore],
        sunGlow: [...T0.sunGlow],
        haze: T0.haze,
        sunX: T0.sunX,
        sunY: T0.sunY,
        sunSize: T0.sunSize,
        sunBright: T0.sunBright,
        moon: T0.moon,
        stars: T0.stars,
        cirrusMul: T0.cirrusMul
      };
      this.sunB = T0.sunBright;
      this.resize(true);
      this.frame = (t) => {
        if (!this.running) return;
        if (t - this.lastDraw >= this.minFrameMs) {
          this.lastDraw = t;
          this.tick(t);
        }
        requestAnimationFrame(this.frame);
      };
      this.resume();
    }
    // Phase lighting blended toward its overcast gray by the mode/intensity
    // mix, then intensity overrides applied.
    computeTarget() {
      const M = MODES[this.mode];
      const P = PHASES[this.phase];
      const I = INTENSITY[this.mode]?.[this.intensity];
      const mix = I ? I.mix : M.mix;
      const shade = I ? I.skyShade : 1;
      const mul = I ? I.cloudMul : 1;
      const sunMul = I ? I.sun : 1;
      const blend = (a, b, m) => a.map((v, j) => Math.min(255, (v + (b[j] - v) * m) * shade));
      return {
        sky: P.sky.map((c, i) => blend(c, P.gray[i], mix)),
        hazeColor: blend(P.hazeColor, P.gray[1], mix * 0.7),
        haze: I ? I.haze : M.haze,
        sunX: P.sun.x,
        sunY: P.sun.y,
        sunSize: P.sun.size * this.sizeMul,
        // PORT: sizeMul
        sunBright: P.sun.bright * sunMul,
        sunCore: P.sun.core,
        sunGlow: P.sun.glow,
        moon: P.moon * Math.max(0, 1 - mix * 0.85),
        stars: P.stars * Math.max(0, 1 - mix * 1.1),
        cirrusMul: P.cirrusMul,
        counts: { cirrus: M.cirrus * mul, cumulus: M.cumulus * mul, deck: M.deck * mul }
      };
    }
    resize(initial = false) {
      if (!this.ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = this.canvas.clientWidth;
      this.h = this.canvas.clientHeight;
      this.canvas.width = this.w * dpr;
      this.canvas.height = this.h * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.stars = [];
      const n = Math.round(this.w * this.h / (4500 * this.sizeMul));
      for (let i = 0; i < n; i++) {
        this.stars.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h * 0.75,
          r: rand(0.4, 1.3),
          a: rand(0.3, 0.9),
          tw: rand(0, Math.PI * 2),
          tws: rand(0.01, 0.04)
        });
      }
      this.populate(initial);
      if (!this.running) this.renderStill();
    }
    // Match cloud cover to the mode: spawn missing clouds (fade in), retire the
    // rest (fade out). Wrong-palette clouds retire too, so a mode switch
    // crossfades white cumulus against gray ones instead of recoloring.
    populate(initial = false) {
      const wf = Math.max(0.6, this.w / 1200);
      const grayFor = { cirrus: 0, cumulus: this.mode === "cloudy" ? 1 : 0, deck: 1 };
      for (const type of Object.keys(CLOUD_TYPES)) {
        const count = this.tcfg.counts[type];
        const want = count ? Math.max(1, Math.round(count * wf)) : 0;
        const alive = [];
        for (const c of this.clouds) {
          if (c.type !== type || c.dying) continue;
          if (c.gray !== grayFor[type] || c.puffs && c.light !== this.phase) c.dying = true;
          else alive.push(c);
        }
        for (let i = alive.length; i < want; i++) {
          this.clouds.push(new Cloud(this.w, this.h, type, grayFor[type], this.phase, initial, this.sizeMul));
        }
        for (let i = want; i < alive.length; i++) alive[i].dying = true;
      }
    }
    setWind(v) {
      this.wind = Math.max(-10, Math.min(10, v));
    }
    setPhase(phase) {
      if (!PHASES[phase]) throw new Error(`unknown phase: ${phase}`);
      if (!this.ctx) return;
      this.phase = phase;
      this.tcfg = this.computeTarget();
      this.populate();
      if (!this.running) this.renderStill();
    }
    setMode(mode) {
      if (!MODES[mode]) throw new Error(`unknown mode: ${mode}`);
      if (!this.ctx) return;
      this.mode = mode;
      this.tcfg = this.computeTarget();
      this.populate();
      if (!this.running) this.renderStill();
    }
    setIntensity(level) {
      if (!LEVELS.includes(level)) throw new Error(`unknown intensity: ${level}`);
      if (!this.ctx) return;
      this.intensity = level;
      this.tcfg = this.computeTarget();
      this.populate();
      if (!this.running) this.renderStill();
    }
    setBirds(on) {
      this.birdsOn = on;
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
    /**
     * PORT: settle and draw one static frame for prefers-reduced-motion — the
     * eased values snap to target, clouds render fully faded-in, nothing moves.
     */
    renderStill() {
      if (!this.ctx) return;
      const T = this.tcfg;
      this.cur = {
        sky: T.sky.map((c) => [...c]),
        hazeColor: [...T.hazeColor],
        sunCore: [...T.sunCore],
        sunGlow: [...T.sunGlow],
        haze: T.haze,
        sunX: T.sunX,
        sunY: T.sunY,
        sunSize: T.sunSize,
        sunBright: T.sunBright,
        moon: T.moon,
        stars: T.stars,
        cirrusMul: T.cirrusMul
      };
      this.sunB = T.sunBright;
      for (const c of this.clouds) {
        if (c.dying) c.fade = 0;
        else c.fade = 1;
      }
      this.clouds = this.clouds.filter((c) => !c.dying);
      this.lastT = 0;
      this.tick(0);
    }
    spawnFlock(t) {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const count = 3 + (Math.random() * 4 | 0);
      const startX = dir === 1 ? -60 : this.w + 60;
      const baseY = this.h * rand(0.12, 0.42);
      const speed = dir * rand(1.3, 1.9);
      const s0 = rand(3.5, 5.5) * Math.max(0.6, this.sizeMul);
      for (let i = 0; i < count; i++) {
        const row = Math.ceil(i / 2);
        const side = i % 2 === 0 ? 1 : -1;
        this.birds.push(new Bird(
          startX - dir * row * rand(16, 26),
          baseY + side * row * rand(8, 14),
          speed * rand(0.96, 1.04),
          s0 * rand(0.85, 1.15)
        ));
      }
      this.nextFlockAt = t + rand(14e3, 3e4);
    }
    drawType(type, dt) {
      const ctx = this.ctx;
      const dim = type === "cirrus" ? this.cur.cirrusMul : 1;
      for (const c of this.clouds) {
        if (c.type !== type) continue;
        c.step(this.w, this.wind, dt);
        c.draw(ctx, dim);
      }
      ctx.globalAlpha = 1;
    }
    tick(t) {
      const dt = this.lastT ? Math.min((t - this.lastT) / 16.67, 3) : 1;
      this.lastT = t;
      const { w, h, cur } = this;
      const ctx = this.ctx;
      const T = this.tcfg;
      const k = 1 - Math.pow(0.97, dt);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) cur.sky[i][j] = approach(cur.sky[i][j], T.sky[i][j], k);
        cur.hazeColor[i] = approach(cur.hazeColor[i], T.hazeColor[i], k);
        cur.sunCore[i] = approach(cur.sunCore[i], T.sunCore[i], k);
        cur.sunGlow[i] = approach(cur.sunGlow[i], T.sunGlow[i], k);
      }
      for (const f of ["haze", "sunX", "sunY", "sunSize", "sunBright", "moon", "stars", "cirrusMul"]) {
        cur[f] = approach(cur[f], T[f], k);
      }
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, rgb(cur.sky[0]));
      bg.addColorStop(0.55, rgb(cur.sky[1]));
      bg.addColorStop(1, rgb(cur.sky[2]));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      if (cur.stars > 0.01) {
        ctx.fillStyle = "#ffffff";
        for (const s of this.stars) {
          s.tw += s.tws * dt;
          ctx.globalAlpha = s.a * cur.stars * (0.55 + 0.45 * Math.sin(s.tw));
          ctx.fillRect(s.x, s.y, s.r, s.r);
        }
        ctx.globalAlpha = 1;
      }
      const sx = w * cur.sunX;
      const sy = h * cur.sunY;
      const mx = w * 0.75;
      const my = h * 0.16;
      let occ = 0;
      for (const c of this.clouds) {
        if (c.type === "cirrus") continue;
        const lx = cur.moon > 0.5 ? mx : sx;
        const ly = cur.moon > 0.5 ? my : sy;
        const ox = 1 - Math.abs(lx - c.cx) / (c.dw * 0.5);
        const oy = 1 - Math.abs(ly - c.cy) / (c.dh * 0.5);
        if (ox > 0 && oy > 0) occ = Math.max(occ, ox * oy * c.fade);
      }
      this.sunB = approach(this.sunB, cur.sunBright * (1 - 0.85 * occ), 1 - Math.pow(0.93, dt));
      const b = this.sunB;
      if (b > 0.01) {
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.min(w, h) * 0.5);
        glow.addColorStop(0, rgba(cur.sunGlow, 0.55 * b));
        glow.addColorStop(0.3, rgba(cur.sunGlow, 0.18 * b));
        glow.addColorStop(1, rgba(cur.sunGlow, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
        const ds = cur.sunSize;
        const disc = ctx.createRadialGradient(sx, sy, 0, sx, sy, ds);
        disc.addColorStop(0, rgba(cur.sunCore, 0.95 * b));
        disc.addColorStop(0.75, rgba(cur.sunGlow, 0.85 * b));
        disc.addColorStop(1, rgba(cur.sunGlow, 0));
        ctx.fillStyle = disc;
        ctx.fillRect(sx - ds - 2, sy - ds - 2, ds * 2 + 4, ds * 2 + 4);
      }
      const ma = cur.moon * (1 - 0.7 * occ);
      if (ma > 0.01) {
        const mr = 24 * this.sizeMul;
        const mglow = ctx.createRadialGradient(mx, my, 0, mx, my, Math.min(w, h) * 0.45);
        mglow.addColorStop(0, `rgba(200, 220, 250, ${0.3 * ma})`);
        mglow.addColorStop(0.3, `rgba(190, 212, 245, ${0.1 * ma})`);
        mglow.addColorStop(1, "rgba(190, 212, 245, 0)");
        ctx.fillStyle = mglow;
        ctx.fillRect(0, 0, w, h);
        const mdisc = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
        mdisc.addColorStop(0, `rgba(238, 244, 252, ${0.95 * ma})`);
        mdisc.addColorStop(0.85, `rgba(205, 220, 242, ${0.9 * ma})`);
        mdisc.addColorStop(1, "rgba(205, 220, 242, 0)");
        ctx.fillStyle = mdisc;
        ctx.fillRect(mx - mr - 2, my - mr - 2, mr * 2 + 4, mr * 2 + 4);
      }
      this.drawType("cirrus", dt);
      this.drawType("deck", dt);
      this.drawType("cumulus", dt);
      this.clouds = this.clouds.filter((c) => !(c.dying && c.fade <= 0));
      const haze = ctx.createLinearGradient(0, h * 0.55, 0, h);
      haze.addColorStop(0, rgba(cur.hazeColor, 0));
      haze.addColorStop(1, rgba(cur.hazeColor, cur.haze));
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, w, h);
      if (this.birdsOn && this.phase !== "night" && this.running) {
        if (this.nextFlockAt === 0) this.nextFlockAt = t + rand(2e3, 6e3);
        if (t >= this.nextFlockAt) this.spawnFlock(t);
      }
      if (this.birds.length) {
        ctx.strokeStyle = "rgba(25, 34, 46, 0.75)";
        ctx.lineCap = "round";
        this.birds = this.birds.filter((bird) => {
          bird.step(dt);
          bird.draw(ctx);
          return bird.vx > 0 ? bird.x < w + 80 : bird.x > -80;
        });
      }
    }
    destroy() {
      this.running = false;
      this.destroyed = true;
    }
  }
  return __toCommonJS(skyEffect_exports);
})();
