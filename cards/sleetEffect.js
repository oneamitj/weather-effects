var SleetModule = (() => {
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

  // src/app/components/weather/sleetEffect.ts
  var sleetEffect_exports = {};
  __export(sleetEffect_exports, {
    SleetEffect: () => SleetEffect
  });
  var INTENSITY = {
    low: { density: 0.22, opacity: 0.45, slushRate: 6e-3 },
    mid: { density: 0.55, opacity: 0.6, slushRate: 0.012 },
    high: { density: 1.1, opacity: 0.75, slushRate: 0.024 }
  };
  var REFERENCE_H = 800;
  var rand = (min, max) => min + Math.random() * (max - min);
  var Drop = class {
    x = 0;
    y = 0;
    vy = 0;
    len = 0;
    lw = 0;
    alpha = 0;
    ground = 0;
    constructor(w, h, cfg, sizeMul) {
      this.reset(w, h, cfg, sizeMul, true);
    }
    reset(w, h, cfg, sizeMul, anywhere = false) {
      this.x = rand(-w * 0.15, w * 1.15);
      this.y = anywhere ? rand(-h, h) : rand(-h * 0.2, -10);
      this.vy = rand(12, 18) * sizeMul;
      this.len = this.vy * rand(0.9, 1.3);
      this.lw = Math.max(0.9, rand(1, 1.6) * sizeMul);
      this.alpha = Math.min(0.85, cfg.opacity * rand(0.4, 1.4));
      this.ground = h - rand(0, h * 0.04);
    }
  };
  var Flake = class {
    x = 0;
    y = 0;
    r = 0;
    vy = 0;
    wobble = 0;
    phase = 0;
    alpha = 0;
    ground = 0;
    constructor(w, h, cfg, sizeMul) {
      this.reset(w, h, cfg, sizeMul, true);
    }
    reset(w, h, cfg, sizeMul, anywhere = false) {
      this.x = rand(-w * 0.15, w * 1.15);
      this.y = anywhere ? rand(-h, h) : rand(-h * 0.2, -8);
      this.r = Math.max(0.5, rand(1.8, 3.6) * sizeMul);
      this.vy = rand(2.6, 4.6) * sizeMul + this.r * 0.3;
      this.wobble = rand(0.3, 0.9) * sizeMul;
      this.phase = rand(0, Math.PI * 2);
      this.alpha = Math.min(1, cfg.opacity * rand(0.7, 1.5));
      this.ground = h - rand(0, h * 0.04);
    }
  };
  var Pellet = class {
    x = 0;
    y = 0;
    r = 0;
    terminal = 0;
    vy = 0;
    vx = 0;
    bounced = false;
    alpha = 0;
    ground = 0;
    constructor(w, h, cfg, sizeMul) {
      this.reset(w, h, cfg, sizeMul, true);
    }
    reset(w, h, cfg, sizeMul, anywhere = false) {
      this.x = rand(-w * 0.15, w * 1.15);
      this.y = anywhere ? rand(-h, h) : rand(-h * 0.2, -8);
      this.r = Math.max(0.6, rand(1, 1.8) * sizeMul);
      this.terminal = rand(9, 14) * sizeMul;
      this.vy = this.terminal * rand(0.5, 0.8);
      this.vx = rand(-0.3, 0.3) * sizeMul;
      this.bounced = false;
      this.alpha = Math.min(1, cfg.opacity * rand(0.9, 1.6));
      this.ground = h - rand(0, h * 0.04);
    }
  };
  var Splash = class {
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
      this.vx = rand(-1.4, 1.4) * sizeMul;
      this.vy = rand(-2.8, -1) * sizeMul;
      this.r = Math.max(0.3, rand(0.5, 1.2) * sizeMul);
      this.g = 0.25 * sizeMul;
    }
    step(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += this.g * dt;
      this.life -= 0.06 * dt;
      return this.life > 0;
    }
  };
  var SleetEffect = class {
    canvas;
    ctx;
    wind;
    // public so wrappers/tests can read the clamped value
    intensity;
    slushOn;
    sizeMul;
    cfg;
    drops = [];
    flakes = [];
    pellets = [];
    splashes = [];
    slushH = 0;
    bumps = [];
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
      const n = Number(options.wind ?? 3);
      this.wind = Number.isFinite(n) ? Math.max(-10, Math.min(10, n)) : 3;
      this.intensity = options.intensity ?? "mid";
      if (!INTENSITY[this.intensity]) throw new Error(`unknown intensity: ${this.intensity}`);
      this.slushOn = options.slush ?? true;
      this.sizeMul = options.sizeMul ?? 1;
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
      const spacing = this.bumpSpacing;
      this.bumps = [];
      for (let x = 0; x <= this.w + spacing; x += spacing) this.bumps.push(rand(-3, 2) * this.sizeMul);
      this.populate();
      if (!this.running) this.renderStill();
    }
    get bumpSpacing() {
      return 22 * this.sizeMul;
    }
    populate() {
      const total = this.w * this.cfg.density * (this.h / REFERENCE_H);
      const counts = [
        [this.drops, Math.round(total * 0.5), Drop],
        [this.flakes, Math.round(total * 0.25), Flake],
        [this.pellets, Math.round(total * 0.25), Pellet]
      ];
      for (const [arr, target, Cls] of counts) {
        while (arr.length < target) arr.push(new Cls(this.w, this.h, this.cfg, this.sizeMul));
        arr.length = target;
      }
    }
    setWind(v) {
      const n = Number(v);
      if (Number.isFinite(n)) this.wind = Math.max(-10, Math.min(10, n));
    }
    setIntensity(level) {
      if (!INTENSITY[level]) throw new Error(`unknown intensity: ${level}`);
      if (!this.ctx) return;
      this.intensity = level;
      this.cfg = INTENSITY[level];
      for (const d of this.drops) d.alpha = Math.min(0.85, this.cfg.opacity * rand(0.4, 1.4));
      for (const f of this.flakes) f.alpha = Math.min(1, this.cfg.opacity * rand(0.7, 1.5));
      for (const p of this.pellets) p.alpha = Math.min(1, this.cfg.opacity * rand(0.9, 1.6));
      this.populate();
      if (!this.running) this.renderStill();
    }
    setSlush(on) {
      this.slushOn = !!on;
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
    /** PORT: one static frame for prefers-reduced-motion — a scattered mix,
     *  nothing moving. */
    renderStill() {
      if (!this.ctx) return;
      this.lastT = 0;
      this.tick(0);
    }
    tick(t) {
      const dt = this.lastT ? Math.min((t - this.lastT) / 16.67, 3) : 1;
      this.lastT = t;
      const { w, h, cfg } = this;
      const ctx = this.ctx;
      const mul = this.sizeMul;
      const maxSlush = h * 0.045 * mul;
      if (this.slushOn) {
        this.slushH = Math.min(maxSlush, this.slushH + cfg.slushRate * mul * dt);
      } else if (this.slushH > 0) {
        this.slushH = Math.max(0, this.slushH - 0.08 * mul * dt);
      }
      const slushTop = h - this.slushH;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#e8f0f4";
      for (const f of this.flakes) {
        f.y += f.vy * dt;
        f.x += (this.wind * 0.5 * mul + Math.sin(t * 3e-3 + f.phase) * f.wobble) * dt;
        if (f.x < -w * 0.16) f.x += w * 1.32;
        else if (f.x > w * 1.16) f.x -= w * 1.32;
        if (f.y >= Math.min(f.ground, slushTop)) {
          f.reset(w, h, cfg, mul);
          continue;
        }
        ctx.globalAlpha = f.alpha;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.r, f.r * 1.35, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "#abc2e9";
      ctx.lineCap = "round";
      const rvx = this.wind * 0.9 * mul;
      for (const d of this.drops) {
        d.y += d.vy * dt;
        d.x += rvx * dt;
        if (d.x < -w * 0.16) d.x += w * 1.32;
        else if (d.x > w * 1.16) d.x -= w * 1.32;
        const gy = Math.min(d.ground, slushTop);
        if (d.y >= gy) {
          if (Math.random() < 0.35) {
            const c = 2 + (Math.random() * 2 | 0);
            for (let i = 0; i < c; i++) this.splashes.push(new Splash(d.x, gy, mul));
          }
          d.reset(w, h, cfg, mul);
          continue;
        }
        const k = d.len / Math.hypot(rvx, d.vy);
        ctx.globalAlpha = d.alpha;
        ctx.lineWidth = d.lw;
        ctx.beginPath();
        ctx.moveTo(d.x - rvx * k, d.y - d.vy * k);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
      ctx.fillStyle = "#dce8ee";
      for (const p of this.pellets) {
        p.vy = Math.min(p.vy + 0.5 * mul * dt, p.terminal);
        p.y += p.vy * dt;
        p.x += (p.vx + this.wind * 0.6 * mul) * dt;
        if (p.x < -w * 0.16) p.x += w * 1.32;
        else if (p.x > w * 1.16) p.x -= w * 1.32;
        const gy = Math.min(p.ground, slushTop);
        if (p.y >= gy && p.vy > 0) {
          if (!p.bounced && p.vy > 3 * mul) {
            p.bounced = true;
            p.y = gy;
            p.vy = -p.vy * rand(0.25, 0.42);
            p.vx += rand(-0.9, 0.9) * mul;
          } else {
            p.reset(w, h, cfg, mul);
            continue;
          }
        }
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(200, 216, 226, 0.6)";
      this.splashes = this.splashes.filter((s) => {
        if (!s.step(dt)) return false;
        ctx.globalAlpha = s.life;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;
      if (this.slushH > 0.5 * mul) {
        const spacing = this.bumpSpacing;
        const bumpK = Math.min(1, this.slushH / (12 * mul));
        ctx.fillStyle = "rgba(210, 222, 229, 0.92)";
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let i = 0; i < this.bumps.length; i++) {
          ctx.lineTo(i * spacing, slushTop + this.bumps[i] * bumpK);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(240, 248, 252, 0.4)";
        ctx.lineWidth = Math.max(0.8, 1.5 * mul);
        ctx.beginPath();
        for (let i = 0; i < this.bumps.length; i++) {
          const y = slushTop + this.bumps[i] * bumpK;
          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * spacing, y);
        }
        ctx.stroke();
      }
    }
    destroy() {
      this.running = false;
      this.destroyed = true;
    }
  };
  return __toCommonJS(sleetEffect_exports);
})();
