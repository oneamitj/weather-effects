var WindModule = (() => {
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

  // src/app/components/weather/windEffect.ts
  var windEffect_exports = {};
  __export(windEffect_exports, {
    WindEffect: () => WindEffect
  });
  var INTENSITY = {
    low: { burstRate: 1.6, maxLines: 10, leafDensity: 0.09, speed: 0.8, gust: 0.35, opacity: 0.45 },
    mid: { burstRate: 3.2, maxLines: 20, leafDensity: 0.18, speed: 1, gust: 0.6, opacity: 0.6 },
    high: { burstRate: 5.6, maxLines: 34, leafDensity: 0.32, speed: 1.25, gust: 0.9, opacity: 0.7 }
  };
  var REFERENCE_H = 800;
  var PATH_N = 56;
  var LEAF_COLORS = ["#c48a4a", "#a86a3a", "#b89a4a", "#8a9a4a", "#9a5a3a", "#c4a05a"];
  var rand = (min, max) => min + Math.random() * (max - min);
  var Streak = class {
    dir;
    len;
    startX;
    pts;
    maxWindow;
    head;
    speedMul;
    alphaMul;
    width;
    waveAmp;
    wavePh;
    constructor(w, _h, dir, yBase, delay, sizeMul) {
      this.dir = dir;
      this.len = rand(w * 0.25, w * 0.6);
      this.startX = dir > 0 ? rand(-this.len * 0.2, w * 0.85) : rand(w * 0.15, w + this.len * 0.2);
      const stepLen = this.len / PATH_N;
      let ang = rand(-0.12, 0.12);
      let turn = 0;
      const curl = Math.random() < 0.3;
      const curlAt = PATH_N * rand(0.3, 0.65) | 0;
      const curlSteps = PATH_N * rand(0.14, 0.22) | 0;
      const curlDir = Math.random() < 0.5 ? 1 : -1;
      let x = 0;
      let y = yBase;
      this.pts = [x, y];
      for (let i = 1; i <= PATH_N; i++) {
        if (curl && i >= curlAt && i < curlAt + curlSteps) {
          ang += Math.PI * 2 / curlSteps * curlDir;
        } else {
          if (curl && i === curlAt + curlSteps) ang -= Math.PI * 2 * curlDir;
          turn = turn * 0.8 + rand(-0.1, 0.1);
          ang = Math.max(-0.5, Math.min(0.5, ang + turn));
        }
        x += Math.cos(ang) * stepLen;
        y += Math.sin(ang) * stepLen;
        this.pts.push(x, y);
      }
      this.maxWindow = rand(0.3, 0.45);
      this.head = -delay;
      this.speedMul = rand(0.8, 1.4);
      this.alphaMul = rand(0.5, 1);
      this.width = rand(1.1, 2.1) * sizeMul;
      this.waveAmp = rand(1, 3) * sizeMul;
      this.wavePh = rand(0, Math.PI * 2);
    }
  };
  var Leaf = class {
    x = 0;
    y = 0;
    r = 0;
    drag = 0;
    vx = 0;
    vy = 0;
    maxFall = 0;
    rot = 0;
    spin = 0;
    flip = 0;
    flipSpeed = 0;
    flutter = 0;
    phase = 0;
    alpha = 0;
    color = "";
    constructor(w, h, sizeMul) {
      this.reset(w, h, 0, sizeMul, true);
    }
    reset(w, h, windSpeed, sizeMul, anywhere = false) {
      if (anywhere) {
        this.x = rand(0, w);
        this.y = rand(0, h);
      } else if (Math.abs(windSpeed) < 1 * sizeMul) {
        this.x = rand(0, w);
        this.y = rand(-h * 0.1, -12 * sizeMul);
      } else if (windSpeed > 0) {
        this.x = rand(-w * 0.15, -12 * sizeMul);
        this.y = rand(-20 * sizeMul, h * 0.85);
      } else {
        this.x = rand(w + 12 * sizeMul, w * 1.15);
        this.y = rand(-20 * sizeMul, h * 0.85);
      }
      this.r = Math.max(1.6, rand(3, 6.5) * sizeMul);
      this.drag = rand(0.5, 1.1);
      this.vx = windSpeed * this.drag * rand(0.4, 0.9);
      this.vy = rand(0.2, 0.9) * sizeMul;
      this.maxFall = rand(0.9, 1.6) * sizeMul;
      this.rot = rand(0, Math.PI * 2);
      this.spin = rand(-0.05, 0.05);
      this.flip = rand(0, Math.PI * 2);
      this.flipSpeed = rand(0.04, 0.12);
      this.flutter = rand(0.6, 1.6);
      this.phase = rand(0, Math.PI * 2);
      this.alpha = rand(0.7, 1);
      this.color = LEAF_COLORS[Math.random() * LEAF_COLORS.length | 0];
    }
  };
  var WindEffect = class {
    wind;
    canvas;
    ctx;
    intensity;
    leavesOn;
    sizeMul;
    cfg;
    streaks = [];
    leaves = [];
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
      const n = Number(options.wind ?? 6);
      this.wind = Number.isFinite(n) ? Math.max(-10, Math.min(10, n)) : 6;
      this.intensity = options.intensity ?? "mid";
      if (!INTENSITY[this.intensity]) throw new Error(`unknown intensity: ${this.intensity}`);
      this.leavesOn = options.leaves ?? true;
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
      this.populate();
      if (!this.running) this.renderStill();
    }
    populate() {
      if (this.streaks.length > this.cfg.maxLines) this.streaks.length = this.cfg.maxLines;
      const lt = this.leavesOn ? Math.round(this.w * this.cfg.leafDensity * (this.h / REFERENCE_H)) : 0;
      while (this.leaves.length < lt) this.leaves.push(new Leaf(this.w, this.h, this.sizeMul));
      this.leaves.length = lt;
    }
    setWind(v) {
      const n = Number(v);
      if (Number.isFinite(n)) this.wind = Math.max(-10, Math.min(10, n));
    }
    setIntensity(level) {
      if (!INTENSITY[level]) throw new Error(`unknown intensity: ${level}`);
      this.intensity = level;
      this.cfg = INTENSITY[level];
      if (!this.ctx) return;
      this.populate();
      if (!this.running) this.renderStill();
    }
    setLeaves(on) {
      this.leavesOn = !!on;
      if (!this.leavesOn) this.leaves.length = 0;
      if (!this.ctx) return;
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
    /**
     * PORT: one static frame for prefers-reduced-motion — scattered leaves,
     * no streaks (a frozen gust line reads as a scratch on the card).
     */
    renderStill() {
      if (!this.ctx) return;
      this.streaks.length = 0;
      this.lastT = 0;
      this.tick(0);
    }
    tick(t) {
      const dt = this.lastT ? Math.min((t - this.lastT) / 16.67, 3) : 1;
      this.lastT = t;
      const { w, h, cfg, sizeMul } = this;
      const ctx = this.ctx;
      const noise = Math.sin(t * 42e-5) * 0.55 + Math.sin(t * 11e-4 + 2.1) * 0.3 + Math.sin(t * 27e-4 + 5) * 0.15;
      const gust = Math.max(0.15, 1 + noise * cfg.gust);
      const windSpeed = this.wind * 1.1 * cfg.speed * gust;
      const moveSpeed = windSpeed * sizeMul;
      const dir = windSpeed >= 0 ? 1 : -1;
      ctx.clearRect(0, 0, w, h);
      const gustFactor = Math.pow(Math.max(0, (gust - 1) / cfg.gust), 1.5);
      const windNorm = Math.min(1, Math.abs(this.wind) / 6);
      const pFrame = cfg.burstRate / 60 * gustFactor * windNorm;
      if (pFrame > 0 && this.streaks.length < cfg.maxLines && Math.random() < 1 - Math.pow(1 - pFrame, dt)) {
        const count = 1 + (Math.random() * 3 | 0);
        const yBase = rand(h * 0.08, h * 0.85);
        for (let i = 0; i < count && this.streaks.length < cfg.maxLines; i++) {
          this.streaks.push(
            new Streak(w, h, dir, yBase + rand(-36, 36) * sizeMul, i * rand(0.05, 0.12), sizeMul)
          );
        }
      }
      const streakAlpha = cfg.opacity * Math.min(1, Math.abs(windSpeed) / 5);
      ctx.strokeStyle = "#e6eef2";
      ctx.lineCap = "round";
      this.streaks = this.streaks.filter((s) => {
        const q = Math.min(1, Math.max(0, s.head) / 1.15);
        const ease = 0.55 + Math.sin(q * Math.PI) * 0.7;
        s.head += Math.abs(moveSpeed) * 1.6 * s.speedMul * ease * dt / s.len;
        if (s.head >= 1.15) return false;
        if (s.head <= 0) return true;
        const win = s.maxWindow * Math.sin(s.head / 1.15 * Math.PI);
        const a = Math.max(0, s.head - win);
        const b = Math.min(1, s.head);
        const span = b - a;
        if (span <= 2e-3) return s.head < 0.5;
        if (streakAlpha < 0.01) return true;
        const i0 = Math.max(0, Math.floor(a * PATH_N));
        const i1 = Math.min(PATH_N, Math.ceil(b * PATH_N));
        for (let i = i0; i < i1; i++) {
          const k = Math.max(0, Math.min(1, (i / PATH_N - a) / span));
          const env = Math.sin(k * Math.PI);
          ctx.globalAlpha = streakAlpha * s.alphaMul * env;
          ctx.lineWidth = 0.4 * sizeMul + s.width * env;
          const rip1 = Math.sin(i / PATH_N * 5 + t * 4e-3 + s.wavePh) * s.waveAmp;
          const rip2 = Math.sin((i + 1) / PATH_N * 5 + t * 4e-3 + s.wavePh) * s.waveAmp;
          ctx.beginPath();
          ctx.moveTo(s.startX + s.dir * s.pts[i * 2], s.pts[i * 2 + 1] + rip1);
          ctx.lineTo(s.startX + s.dir * s.pts[i * 2 + 2], s.pts[i * 2 + 3] + rip2);
          ctx.stroke();
        }
        return true;
      });
      ctx.globalAlpha = 1;
      for (const l of this.leaves) {
        const target = moveSpeed * l.drag;
        l.vx += (target - l.vx) * 0.04 * dt;
        l.vy = Math.min(l.vy + 0.045 * sizeMul * dt, l.maxFall);
        if (gust > 1.05) l.vy = Math.max(l.vy - (gust - 1) * 0.16 * sizeMul * dt, -1.2 * sizeMul);
        l.x += l.vx * dt;
        l.y += (l.vy + Math.sin(t * 4e-3 * l.flutter + l.phase) * 0.6 * sizeMul) * dt;
        l.rot += (l.spin + l.vx * 4e-3 / sizeMul) * dt;
        l.flip += l.flipSpeed * dt;
        const m = 40 * sizeMul;
        if (l.y > h + m || l.y < -m * 2 || dir > 0 && l.x > w + m || dir < 0 && l.x < -m) {
          l.reset(w, h, moveSpeed, sizeMul);
        }
        const squish = 0.18 + 0.5 * Math.abs(Math.sin(l.flip));
        ctx.globalAlpha = l.alpha;
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.ellipse(l.x, l.y, l.r, l.r * squish, l.rot, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    destroy() {
      this.running = false;
      this.destroyed = true;
    }
  };
  return __toCommonJS(windEffect_exports);
})();
