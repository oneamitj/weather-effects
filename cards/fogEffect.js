var FogModule = (() => {
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

  // src/app/components/weather/fogEffect.ts
  var fogEffect_exports = {};
  __export(fogEffect_exports, {
    FogEffect: () => FogEffect
  });
  var FOG_WHITE = [236, 241, 245];
  var INTENSITY = {
    low: { fog: 0.7, veil: 0.5, ground: 0.6 },
    mid: { fog: 1, veil: 0.9, ground: 0.9 },
    high: { fog: 1.6, veil: 1.4, ground: 1.3 }
  };
  var FOG_LAYERS = [
    { tex: 1, yTop: 0.4, yH: 0.5, moveDur: 3e4, opDur: 2e4, stops: [[0, 0.1], [0.22, 0.5], [0.4, 0.28], [0.58, 0.4], [0.8, 0.16], [1, 0.1]] },
    { tex: 0, yTop: 0.5, yH: 0.55, moveDur: 26e3, opDur: 42e3, stops: [[0, 0.5], [0.25, 0.2], [0.5, 0.1], [0.8, 0.3], [1, 0.5]] },
    { tex: 0, yTop: 0.34, yH: 0.7, moveDur: 22e3, opDur: 42e3, stops: [[0, 0.8], [0.27, 0.2], [0.52, 0.6], [0.68, 0.3], [1, 0.8]] }
  ];
  var rand = (min, max) => min + Math.random() * (max - min);
  var approach = (cur, target, k) => cur + (target - cur) * k;
  var rgba = (c, a) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
  var kf = (stops, frac) => {
    for (let i = 1; i < stops.length; i++) {
      if (frac <= stops[i][0]) {
        const [f0, v0] = stops[i - 1];
        const [f1, v1] = stops[i];
        return v0 + (v1 - v0) * ((frac - f0) / (f1 - f0));
      }
    }
    return stops[stops.length - 1][1];
  };
  var noiseOctave = (W, H, cx, cy) => {
    const lat = new Float32Array(cx * cy);
    for (let i = 0; i < lat.length; i++) lat[i] = Math.random();
    const out = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      const gy = y / H * cy;
      const y0 = Math.floor(gy) % cy;
      const y1 = (y0 + 1) % cy;
      let fy = gy - Math.floor(gy);
      fy = fy * fy * (3 - 2 * fy);
      for (let x = 0; x < W; x++) {
        const gx = x / W * cx;
        const x0 = Math.floor(gx) % cx;
        const x1 = (x0 + 1) % cx;
        let fx = gx - Math.floor(gx);
        fx = fx * fx * (3 - 2 * fx);
        const a = lat[y0 * cx + x0];
        const b = lat[y0 * cx + x1];
        const c = lat[y1 * cx + x0];
        const d = lat[y1 * cx + x1];
        out[y * W + x] = a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
      }
    }
    return out;
  };
  var makeFogTexture = (wispy) => {
    const W = 512;
    const H = 256;
    const octs = wispy ? [[4, 10, 1], [8, 22, 0.5], [16, 48, 0.28]] : [[3, 7, 1], [6, 14, 0.55], [12, 30, 0.3], [24, 60, 0.16]];
    const fields = octs.map(([cx, cy]) => noiseOctave(W, H, cx, cy));
    let ampSum = 0;
    for (const o of octs) ampSum += o[2];
    const lo = wispy ? 0.46 : 0.37;
    const hi = wispy ? 0.82 : 0.78;
    const gamma = wispy ? 1.35 : 1.05;
    const maxA = wispy ? 185 : 215;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    const img = g.createImageData(W, H);
    const data = img.data;
    for (let y = 0; y < H; y++) {
      const vy = y / H;
      const up = Math.min(1, vy / 0.3);
      const soft = up * up * (3 - 2 * up);
      const down = Math.min(1, (1 - vy) / 0.06);
      const bias = 0.5 + 0.5 * Math.min(1, vy / 0.7);
      const env = soft * down * bias;
      for (let x = 0; x < W; x++) {
        let v = 0;
        for (let o = 0; o < octs.length; o++) v += fields[o][y * W + x] * octs[o][2];
        v /= ampSum;
        let a = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
        a = a * a * (3 - 2 * a);
        a = Math.pow(a, gamma) * env;
        const i = (y * W + x) * 4;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = a * maxA;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  };
  var FOG_TEXTURES = null;
  var getFogTextures = () => FOG_TEXTURES ??= [makeFogTexture(false), makeFogTexture(true)];
  var FogEffect = class {
    wind;
    canvas;
    ctx;
    intensity;
    cur = { fog: 0, veil: 0, ground: 0 };
    textures = [];
    layers = [];
    minFrameMs;
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
      this.wind = Math.max(-10, Math.min(10, options.wind ?? 3));
      this.intensity = options.intensity ?? "mid";
      this.minFrameMs = 1e3 / (options.fpsCap ?? 30);
      if (!INTENSITY[this.intensity]) throw new Error(`unknown intensity: ${this.intensity}`);
      if (!this.ctx) return;
      const I = INTENSITY[this.intensity];
      this.cur = { fog: I.fog, veil: I.veil, ground: I.ground };
      this.textures = getFogTextures();
      this.layers = FOG_LAYERS.map((L) => ({
        o: rand(0, 4e3),
        opT: rand(0, L.opDur),
        phase: rand(0, Math.PI * 2)
      }));
      this.resize();
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
    resize() {
      if (!this.ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = this.canvas.clientWidth;
      this.h = this.canvas.clientHeight;
      this.canvas.width = this.w * dpr;
      this.canvas.height = this.h * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!this.running) this.renderStill();
    }
    setWind(v) {
      this.wind = Math.max(-10, Math.min(10, v));
    }
    setIntensity(level) {
      if (!INTENSITY[level]) throw new Error(`unknown intensity: ${level}`);
      this.intensity = level;
      if (!this.ctx) return;
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
     * PORT: settle and draw one static frame for prefers-reduced-motion — the
     * eased densities snap to target and the banks hold their current swell.
     */
    renderStill() {
      if (!this.ctx) return;
      const I = INTENSITY[this.intensity];
      this.cur = { fog: I.fog, veil: I.veil, ground: I.ground };
      this.lastT = 0;
      this.tick(0);
    }
    tick(t) {
      const dt = this.lastT ? Math.min((t - this.lastT) / 16.67, 3) : 1;
      this.lastT = t;
      const dtMs = dt * 16.67;
      const { w, h, cur } = this;
      const ctx = this.ctx;
      const I = INTENSITY[this.intensity];
      const k = 1 - Math.pow(0.96, dt);
      cur.fog = approach(cur.fog, I.fog, k);
      cur.veil = approach(cur.veil, I.veil, k);
      cur.ground = approach(cur.ground, I.ground, k);
      ctx.clearRect(0, 0, w, h);
      const ground = ctx.createLinearGradient(0, h * 0.6, 0, h);
      ground.addColorStop(0, rgba(FOG_WHITE, 0));
      ground.addColorStop(1, rgba(FOG_WHITE, Math.min(0.75, 0.5 * cur.ground)));
      ctx.fillStyle = ground;
      ctx.fillRect(0, h * 0.5, w, h * 0.5);
      for (let i = 0; i < FOG_LAYERS.length; i++) {
        const L = FOG_LAYERS[i];
        const S = this.layers[i];
        const speed = w * 16.67 / L.moveDur * (this.wind / 3);
        S.o += speed * dt;
        S.opT = (S.opT + dtMs) % L.opDur;
        const op = kf(L.stops, S.opT / L.opDur) * cur.fog;
        if (op <= 3e-3) continue;
        const x = (S.o % w + w) % w - w;
        const y = L.yTop * h + Math.sin(t * 5e-5 + S.phase) * h * 0.012;
        const dh = L.yH * h;
        ctx.globalAlpha = Math.min(1, op);
        const tex = this.textures[L.tex];
        ctx.drawImage(tex, x, y, w, dh);
        ctx.drawImage(tex, x + w, y, w, dh);
      }
      ctx.globalAlpha = 1;
      const veil = ctx.createLinearGradient(0, 0, 0, h);
      veil.addColorStop(0, `rgba(255, 255, 255, ${Math.min(0.6, 0.3 * cur.veil)})`);
      veil.addColorStop(1, `rgba(255, 255, 255, ${Math.min(0.8, 0.5 * cur.veil)})`);
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, w, h);
    }
    destroy() {
      this.running = false;
      this.destroyed = true;
    }
  };
  return __toCommonJS(fogEffect_exports);
})();
