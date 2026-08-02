var RainModule = (() => {
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
  var rainEffect_exports = {};
  __export(rainEffect_exports, {
    RainEffect: () => RainEffect
  });
  const INTENSITY = {
    low: { density: 0.35, speed: [13, 21], length: [10, 32], width: [1.2, 2.2], opacity: 0.5, splashChance: 0.45, thunderGap: [5e3, 9e3] },
    mid: { density: 0.8, speed: [16, 25], length: [12, 37], width: [1.3, 2.5], opacity: 0.58, splashChance: 0.55, thunderGap: [3e3, 6e3] },
    high: { density: 1.4, speed: [19, 29], length: [14, 42], width: [1.4, 2.8], opacity: 0.65, splashChance: 0.65, thunderGap: [1e3, 3e3] }
  };
  const REFERENCE_H = 800;
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (range) => rand(range[0], range[1]);
  class Drop {
    x = 0;
    y = 0;
    terminal = 0;
    vy = 0;
    len = 0;
    w = 0;
    alpha = 0;
    ground = 0;
    constructor(w, h, cfg, slope, sizeMul) {
      this.reset(w, h, cfg, slope, sizeMul, true);
    }
    reset(w, h, cfg, slope, sizeMul, anywhere = false) {
      const overshoot = Math.abs(slope) * h;
      this.x = rand(-overshoot, w + overshoot);
      this.y = anywhere ? rand(-h, h) : rand(-h * 0.2, -10);
      this.terminal = pick(cfg.speed) * sizeMul;
      this.vy = this.terminal * rand(0.45, 0.7);
      this.len = pick(cfg.length) * sizeMul;
      this.w = Math.max(0.7, pick(cfg.width) * sizeMul);
      this.alpha = Math.min(0.9, Math.max(0.02, cfg.opacity * rand(0.1, 1.7)));
      this.ground = h - rand(0, h * 0.05);
    }
  }
  class Splash {
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
      this.vx = rand(-1.6, 1.6) * sizeMul;
      this.vy = rand(-3.4, -1.2) * sizeMul;
      this.r = Math.max(0.4, rand(0.6, 1.6) * sizeMul);
      this.g = 0.22 * sizeMul;
    }
    step(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += this.g * dt;
      this.life -= 0.045 * dt;
      return this.life > 0;
    }
  }
  class Thunder {
    effect;
    flash = 0;
    // current screen flash alpha
    bolt = null;
    // active bolt segments
    boltTtl = 0;
    nextAt = 0;
    constructor(effect) {
      this.effect = effect;
    }
    schedule(now) {
      this.nextAt = now + pick(this.effect.cfg.thunderGap);
    }
    strike(now, w, h) {
      this.flash = rand(0.5, 0.9);
      this.bolt = this.makeBolt(w, h);
      this.boltTtl = rand(180, 320);
      this.schedule(now);
    }
    makeBolt(w, h) {
      const mul = this.effect.sizeMul;
      const segs = [];
      const walk = (x, y, angle, len, width, depth) => {
        const targetY = h * rand(0.55, 0.9);
        let steps = 0;
        while (y < targetY && steps++ < 200 && segs.length < 350) {
          angle = Math.max(-1, Math.min(1, angle + rand(-0.5, 0.5)));
          const nx = x + Math.sin(angle) * len;
          const ny = y + Math.max(Math.cos(angle), 0.3) * len;
          segs.push({ x1: x, y1: y, x2: nx, y2: ny, w: width });
          x = nx;
          y = ny;
          if (depth < 3 && Math.random() < 0.12) {
            walk(x, y, angle + rand(-0.9, 0.9), len * 0.7, width * 0.5, depth + 1);
          }
        }
      };
      walk(rand(w * 0.15, w * 0.85), 0, rand(-0.3, 0.3), rand(14, 26) * mul, rand(2, 3.2) * Math.max(0.6, mul), 0);
      return segs;
    }
    step(now, dt, w, h) {
      if (this.nextAt === 0) this.schedule(now);
      if (now >= this.nextAt) this.strike(now, w, h);
      if (this.flash > 0) this.flash = Math.max(0, this.flash - 0.045 * dt);
      if (this.boltTtl > 0) this.boltTtl -= dt * 16.67;
      if (this.boltTtl > 0 && Math.random() < 0.12) this.flash = Math.max(this.flash, rand(0.2, 0.5));
    }
    draw(ctx, w, h) {
      if (this.boltTtl > 0 && this.bolt) {
        ctx.save();
        ctx.strokeStyle = "rgba(230, 240, 255, 0.95)";
        ctx.shadowColor = "rgba(160, 190, 255, 0.9)";
        ctx.shadowBlur = 18 * Math.max(0.5, this.effect.sizeMul);
        ctx.lineCap = "round";
        for (const s of this.bolt) {
          ctx.lineWidth = s.w;
          ctx.beginPath();
          ctx.moveTo(s.x1, s.y1);
          ctx.lineTo(s.x2, s.y2);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (this.flash > 0) {
        ctx.fillStyle = `rgba(220, 230, 255, ${this.flash})`;
        ctx.fillRect(0, 0, w, h);
      }
    }
  }
  class RainEffect {
    canvas;
    ctx;
    angle;
    intensity;
    thunderOn;
    sizeMul;
    cfg;
    drops = [];
    splashes = [];
    thunder;
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
      this.angle = Math.max(-45, Math.min(45, options.angle ?? 0));
      this.intensity = options.intensity ?? "mid";
      this.thunderOn = options.thunder ?? true;
      this.sizeMul = options.sizeMul ?? 1;
      if (!INTENSITY[this.intensity]) throw new Error(`unknown intensity: ${this.intensity}`);
      this.cfg = INTENSITY[this.intensity];
      this.thunder = new Thunder(this);
      if (!this.ctx) return;
      this.resize();
      this.frame = (t) => {
        if (!this.running) return;
        this.tick(t);
        requestAnimationFrame(this.frame);
      };
      this.resume();
    }
    get slope() {
      return Math.tan(this.angle * Math.PI / 180);
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
      while (this.drops.length < target) {
        this.drops.push(new Drop(this.w, this.h, this.cfg, this.slope, this.sizeMul));
      }
      this.drops.length = target;
    }
    setAngle(deg) {
      this.angle = Math.max(-45, Math.min(45, deg));
    }
    setIntensity(level) {
      if (!INTENSITY[level]) throw new Error(`unknown intensity: ${level}`);
      if (!this.ctx) return;
      this.intensity = level;
      this.cfg = INTENSITY[level];
      for (const d of this.drops) {
        d.terminal = pick(this.cfg.speed) * this.sizeMul;
        d.vy = d.terminal * rand(0.45, 0.7);
        d.len = pick(this.cfg.length) * this.sizeMul;
        d.w = Math.max(0.7, pick(this.cfg.width) * this.sizeMul);
        d.alpha = Math.min(0.9, Math.max(0.02, this.cfg.opacity * rand(0.1, 1.7)));
      }
      this.populate();
      if (!this.running) this.renderStill();
    }
    setThunder(on) {
      this.thunderOn = on;
      if (on && this.ctx) this.thunder.schedule(performance.now());
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
     * PORT: one static frame for prefers-reduced-motion — scattered streaks,
     * no flash, no bolt, nothing moving.
     */
    renderStill() {
      if (!this.ctx) return;
      this.thunder.flash = 0;
      this.thunder.boltTtl = 0;
      this.lastT = 0;
      this.tick(0);
    }
    tick(t) {
      const dt = this.lastT ? Math.min((t - this.lastT) / 16.67, 3) : 1;
      this.lastT = t;
      const { w, h, cfg } = this;
      const ctx = this.ctx;
      const slope = this.slope;
      ctx.clearRect(0, 0, w, h);
      if (this.thunderOn) {
        this.thunder.step(t, dt, w, h);
        this.thunder.draw(ctx, w, h);
      }
      const norm = 1 / Math.sqrt(1 + slope * slope);
      const ux = slope * norm;
      const uy = norm;
      const px = -uy;
      const py = ux;
      ctx.fillStyle = "#abc2e9";
      for (const d of this.drops) {
        d.vy = Math.min(d.vy + 0.5 * this.sizeMul * dt, d.terminal);
        d.x += d.vy * slope * dt;
        d.y += d.vy * dt;
        if (d.y >= d.ground) {
          if (Math.random() < cfg.splashChance) {
            const n = 2 + (Math.random() * 3 | 0);
            for (let i = 0; i < n; i++) this.splashes.push(new Splash(d.x, d.ground, this.sizeMul));
          }
          d.reset(w, h, cfg, slope, this.sizeMul);
          continue;
        }
        const hw = d.w / 2;
        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.moveTo(d.x - ux * d.len, d.y - uy * d.len);
        ctx.lineTo(d.x + px * hw, d.y + py * hw);
        ctx.quadraticCurveTo(d.x + ux * hw * 2, d.y + uy * hw * 2, d.x - px * hw, d.y - py * hw);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(171, 194, 233, 0.55)";
      this.splashes = this.splashes.filter((s) => {
        if (!s.step(dt)) return false;
        ctx.globalAlpha = s.life;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;
    }
    destroy() {
      this.running = false;
      this.destroyed = true;
    }
  }
  return __toCommonJS(rainEffect_exports);
})();
