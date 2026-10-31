const T = Math.PI / 180, g = (s, t, e) => Math.min(e, Math.max(t, s)), Z = (s) => s * s * (3 - 2 * s);
function j(s, t, e) {
  const i = t * Math.cos(e * T), r = t * Math.sin(e * T), n = s + 0.3963377774 * i + 0.2158037573 * r, a = s - 0.1055613458 * i - 0.0638541728 * r, o = s - 0.0894841775 * i - 1.291485548 * r, h = n ** 3, l = a ** 3, u = o ** 3;
  return [4.0767416621 * h - 3.3077115913 * l + 0.2309699292 * u, -1.2684380046 * h + 2.6097574011 * l - 0.3413193965 * u, -0.0041960863 * h - 0.7034186147 * l + 1.707614701 * u];
}
const Q = (s) => s <= 31308e-7 ? 12.92 * s : 1.055 * s ** (1 / 2.4) - 0.055, S = (s) => s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
function ot(s, t, e) {
  return j(s, t, e).map((i) => Math.round(255 * Q(g(i, 0, 1))));
}
function at(s, t, e) {
  return j(s, t, e).map((i) => Q(g(i, 0, 1)));
}
const N = ([s, t, e]) => [s, t * Math.cos(e * T), t * Math.sin(e * T)], J = ([s, t, e]) => [s, Math.hypot(t, e), (Math.atan2(e, t) / T + 360) % 360], lt = (s, t, e) => [s[0] + (t[0] - s[0]) * e, s[1] + (t[1] - s[1]) * e, s[2] + (t[2] - s[2]) * e], O = ([s, t, e]) => 0.2126 * S(s) + 0.7152 * S(t) + 0.0722 * S(e);
function ht(s, t) {
  const e = O(s), i = O(t);
  return (Math.max(e, i) + 0.05) / (Math.min(e, i) + 0.05);
}
const x = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?%?`, ut = new RegExp(String.raw`^oklch\(\s*(${x})\s+(${x})\s+(${x})(?:deg)?\s*(?:\/\s*(${x})\s*)?\)$`), ct = new RegExp(String.raw`^rgba?\(\s*(${x})[\s,]+(${x})[\s,]+(${x})\s*(?:[,/]\s*(${x})\s*)?\)$`), dt = new RegExp(String.raw`^color\(\s*srgb\s+(${x})\s+(${x})\s+(${x})\s*(?:\/\s*(${x})\s*)?\)$`);
function ft(s) {
  const t = s.trim().toLowerCase();
  if (!t) return null;
  const e = (n, a = 1) => n.endsWith("%") ? parseFloat(n) / 100 * a : parseFloat(n), i = (n) => n === void 0 ? 1 : g(e(n), 0, 1);
  let r = ut.exec(t);
  if (r) {
    const n = r[1].endsWith("%") ? parseFloat(r[1]) / 100 : parseFloat(r[1]), a = r[2].endsWith("%") ? parseFloat(r[2]) / 100 * 0.4 : parseFloat(r[2]);
    return { rgb: at(n, a, parseFloat(r[3]) || 0), alpha: i(r[4]) };
  }
  if (r = /^#([0-9a-f]{3,8})$/.exec(t), r) {
    let n = r[1];
    if ((n.length === 3 || n.length === 4) && (n = [...n].map((o) => o + o).join("")), n.length !== 6 && n.length !== 8) return null;
    const a = (o) => parseInt(n.slice(o, o + 2), 16) / 255;
    return { rgb: [a(0), a(2), a(4)], alpha: n.length === 8 ? a(6) : 1 };
  }
  return r = ct.exec(t), r ? { rgb: [e(r[1], 255), e(r[2], 255), e(r[3], 255)].map((n) => g(n / 255, 0, 1)), alpha: i(r[4]) } : (r = dt.exec(t), r ? { rgb: [e(r[1]), e(r[2]), e(r[3])].map((n) => g(n, 0, 1)), alpha: i(r[4]) } : null);
}
function z(s, t, e = !1) {
  let i = s;
  for (i && e && (i = $(i)); i; ) {
    if (i.hasAttribute(t)) return i;
    i = $(i);
  }
  return null;
}
const $ = (s) => s.parentElement ?? s.getRootNode().host ?? null, tt = (s) => typeof matchMedia == "function" && matchMedia(s).matches;
function mt(s, t = !1) {
  const e = z(s, "data-theme", t)?.getAttribute("data-theme");
  return e === "light" || e === "dark" ? e : tt("(prefers-color-scheme: dark)") ? "dark" : "light";
}
function pt(s) {
  const t = z(s, "data-daylight", !0)?.getAttribute("data-daylight");
  return t === "dawn" || t === "dusk" || t === "night" ? t : "day";
}
function M(s) {
  const t = z(s, "data-motion")?.getAttribute("data-motion");
  return t === "reduced" ? !0 : t === "standard" ? !1 : tt("(prefers-reduced-motion: reduce)");
}
const Ht = 72, gt = 2.1, xt = 1966, et = 22, _t = [0.6, 1, 1.4, 1.9], F = 2560 * et, it = (() => {
  const s = Array.from({ length: 256 }, (i, r) => r);
  let t = xt;
  for (let i = 255; i > 0; i--) {
    t = t * 16807 % 2147483647;
    const r = t % (i + 1);
    [s[i], s[r]] = [s[r], s[i]];
  }
  const e = new Uint8Array(512);
  for (let i = 0; i < 512; i++) e[i] = s[i & 255];
  return e;
})(), D = (s) => s * s * s * (s * (s * 6 - 15) + 10), E = (s, t, e) => s + e * (t - s), v = (s, t, e, i) => {
  const r = s < 8 ? t : e, n = s < 4 ? e : s === 12 || s === 14 ? t : i;
  return (s & 1 ? -r : r) + (s & 2 ? -n : n);
};
function R(s, t, e) {
  const i = it, r = Math.floor(s), n = Math.floor(t), a = Math.floor(e), o = r & 255, h = n & 255, l = a & 255;
  s -= r, t -= n, e -= a;
  const u = D(s), d = D(t), c = D(e), f = i[o] + h, p = i[f] + l, _ = i[f + 1] + l, m = i[o + 1] + h, X = i[m] + l, V = i[m + 1] + l;
  return E(
    E(E(v(i[p] & 15, s, t, e), v(i[X] & 15, s - 1, t, e), u), E(v(i[_] & 15, s, t - 1, e), v(i[V] & 15, s - 1, t - 1, e), u), d),
    E(E(v(i[p + 1] & 15, s, t, e - 1), v(i[X + 1] & 15, s - 1, t, e - 1), u), E(v(i[_ + 1] & 15, s, t - 1, e - 1), v(i[V + 1] & 15, s - 1, t - 1, e - 1), u), d),
    c
  );
}
function st(s) {
  const t = s % F, e = (t < 0 ? t + F : t) / et;
  return _t.map((i) => e * i % 256);
}
function vt(s, t, e) {
  const i = R(s * 0.7, t * 0.7, e[0]) * 0.8, r = R(s + i, t - i * 0.5, e[1]) * 0.62 + R(s * 2.3, t * 2.3, e[2]) * 0.26 + R(s * 4.1, t * 4.1, e[3]) * 0.12;
  return Math.min(0.999, Math.max(0, r * 0.95 + 0.5));
}
function q(s, t, e, i, r = 1) {
  const n = gt * r, a = Math.max(s, t, 1e-6), o = s / a * n, h = t / a * n;
  return { origin: [(n - o) / 2, (n - h) / 2], step: [o / Math.max(1, e - 1), h / Math.max(1, i - 1)] };
}
function At(s, t, e, i, r) {
  const n = st(r);
  let a = 0;
  for (let o = 0; o < e; o++) {
    const h = i.origin[1] + o * i.step[1];
    for (let l = 0; l < t; l++) s[a++] = vt(i.origin[0] + l * i.step[0], h, n);
  }
  return s;
}
const bt = { settle: { stiffness: 34, damping: 11.7 } }, Et = { "field-fps": 30 }, wt = { spark: { dawn: [[0.5, 0.17, 265], [0.62, 0.15, 283], [0.74, 0.09, 305], [0.57, 0.16, 272]], day: [[0.49, 0.17, 265], [0.61, 0.16, 258], [0.73, 0.12, 245], [0.56, 0.17, 272]], dusk: [[0.49, 0.17, 267], [0.6, 0.15, 290], [0.7, 0.1, 302], [0.55, 0.16, 278]], night: [[0.46, 0.15, 266], [0.56, 0.16, 262], [0.67, 0.13, 275], [0.5, 0.14, 284]] }, form: { dawn: { light: [[0.27, 0.1275, 265], [0.324, 0.1125, 283], [0.378, 0.0675, 305], [0.3015, 0.12, 272]], dark: [[0.8, 0.051, 265], [0.86, 0.045, 283], [0.92, 0.027, 305], [0.835, 0.048, 272]] }, day: { light: [[0.2655, 0.1275, 265], [0.3195, 0.1124, 258], [0.3735, 0.0893, 245], [0.297, 0.1275, 272]], dark: [[0.795, 0.051, 265], [0.855, 0.048, 258], [0.915, 0.036, 245], [0.83, 0.051, 272]] }, dusk: { light: [[0.2655, 0.1275, 267], [0.315, 0.1125, 290], [0.36, 0.075, 302], [0.2925, 0.12, 278]], dark: [[0.795, 0.051, 267], [0.85, 0.045, 290], [0.9, 0.03, 302], [0.825, 0.048, 278]] }, night: { light: [[0.252, 0.1125, 266], [0.297, 0.12, 262], [0.3465, 0.0975, 275], [0.27, 0.105, 284]], dark: [[0.78, 0.045, 266], [0.83, 0.048, 262], [0.885, 0.039, 275], [0.8, 0.042, 284]] } } }, yt = { "atmosphere.dpr-max": 1.5 }, Tt = { dawn: [[0.2, 0.06, 285], [0.27, 0.07, 330], [0.33, 0.08, 45], [0.24, 0.05, 300]], day: [[0.2, 0.09, 265], [0.28, 0.0876, 255], [0.34, 0.074, 240], [0.24, 0.07, 275]], dusk: [[0.18, 0.06, 285], [0.25, 0.075, 335], [0.31, 0.085, 25], [0.22, 0.05, 300]], night: [[0.13, 0.03, 270], [0.18, 0.06, 268], [0.23, 0.08, 280], [0.16, 0.04, 290]] }, Rt = {
  spring: bt,
  loop: Et,
  liquid: wt,
  component: yt,
  atmos: Tt
}, nt = ["dawn", "day", "dusk", "night"], U = { dawn: 5, day: 9, dusk: 17, night: 21 }, B = 30, y = Rt, Ft = y.loop["field-fps"], Lt = y.component["atmosphere.dpr-max"], Y = y.spring.settle ?? { stiffness: 34, damping: 11.7 }, I = (s) => s.map(([t, e, i]) => [t, e, i]);
function k(s, t, e) {
  return I(s === "liquid" ? y.liquid.spark[t] : s === "form" ? y.liquid.form[t][e] : y.atmos[t]);
}
function St(s, t, e) {
  return e <= 0 ? s : e >= 1 ? t : s.map((i, r) => J(lt(N(i), N(t[r % t.length]), e)));
}
function Mt(s) {
  const t = s.getHours() * 60 + s.getMinutes() + s.getSeconds() / 60, e = (a) => a * 60, i = nt;
  for (let a = 0; a < i.length; a++) {
    const o = i[a], h = i[(a + i.length - 1) % i.length];
    let l = t - e(U[o]);
    if (l < -720 ? l += 1440 : l > 720 && (l -= 1440), Math.abs(l) < B) return { from: h, to: o, t: Z((l + B) / (2 * B)) };
  }
  const r = i.slice().reverse().find((a) => t >= e(U[a])) ?? "night", n = t < e(U.dawn) ? "night" : r;
  return { from: n, to: n, t: 0 };
}
function C(s, t = 0) {
  const e = new Uint8ClampedArray(768), i = s.map((n) => N([n[0] + t, n[1], n[2]])), r = i.length;
  for (let n = 0; n < 256; n++) {
    const a = n / 256 * r, o = Math.floor(a), h = Z(a - o), l = i[o % r], u = i[(o + 1) % r], [d, c, f] = ot(...J([l[0] + (u[0] - l[0]) * h, l[1] + (u[1] - l[1]) * h, l[2] + (u[2] - l[2]) * h]));
    e[n * 3] = d, e[n * 3 + 1] = c, e[n * 3 + 2] = f;
  }
  return e;
}
function Dt(s) {
  const t = new Uint8Array(1024);
  for (let e = 0; e < 256; e++)
    t[e * 4] = s[e * 3], t[e * 4 + 1] = s[e * 3 + 1], t[e * 4 + 2] = s[e * 3 + 2], t[e * 4 + 3] = 255;
  return t;
}
const Ut = (s) => s.reduce((t, e) => t + e[0], 0) / s.length, Bt = (s) => Ut(s) < 0.62 ? "dark" : "light";
function P(s, t) {
  let e = 1 / 0;
  const i = t[0] + t[1] + t[2] > 1.5, r = i ? 1 : -1;
  for (let n = 0; n < 256; n++) {
    const a = [g((s[n * 3] + r) / 255, 0, 1), g((s[n * 3 + 1] + r) / 255, 0, 1), g((s[n * 3 + 2] + r) / 255, 0, 1)];
    e = Math.min(e, ht(a, t));
  }
  return e;
}
function H(s, t, e) {
  return t >= 1 ? s : s.map(([i, r, n]) => [e ? i * t : 1 - (1 - i) * t, r * t, n]);
}
function It(s, t, e, i = 0) {
  const r = C(s, i), n = P(r, t);
  if (e <= 1 || n >= e) return { stops: s, lut: r, k: 1, contrast: n };
  const a = t[0] + t[1] + t[2] > 1.5;
  let o = 0, h = 1, l = null;
  for (let c = 0; c < 18; c++) {
    const f = (o + h) / 2, p = H(s, f, a), _ = C(p, i), m = P(_, t);
    m >= e ? (l = { stops: p, lut: _, k: f, contrast: m }, o = f) : h = f;
  }
  if (l) return l;
  const u = H(s, 0.02, a), d = C(u, i);
  return { stops: u, lut: d, k: 0.02, contrast: P(d, t) };
}
const kt = `#version 300 es
// FVL Temporal Flux: full-screen triangle from gl_VertexID. Draw with gl.drawArrays(gl.TRIANGLES, 0, 3)
// and an empty vertex array object; no attributes.
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`, Ct = `#version 300 es
// FVL Temporal Flux: the living field. GLSL ES 3.00 (WebGL2).
//
// The maths are identical to the liquid runtime (components src/runtime/field.ts), to the CPU port
// (atmosphere src/field.ts) and to the Rust crate's WGSL shader:
//   wx = noise(0.7 q, z_warp) * 0.8
//   s  = 0.62 noise(q.x + wx, q.y - 0.5 wx, z_base) + 0.26 noise(2.3 q, z_2) + 0.12 noise(4.1 q, z_3)
//   v  = clamp(0.95 s + 0.5, 0, 0.999)   then a 256-entry cyclic palette LUT
// noise is Ken Perlin's improved noise with the mark's permutation (seed 1966), uploaded as u_perm.
//
// Entry points: insert one #define right after the #version line.
//   (none)            single pass: field, palette and dither for every pixel. Simplest to embed.
//   FLUX_PASS_FIELD   writes the field value for a low-resolution grid, packed into RGBA8:
//                     R = whole 1/255 steps, G = remainder (16-bit precision without float targets).
//   FLUX_PASS_COLOUR  reads that grid (bilinear), maps it through the LUT and dithers. <fvl-atmosphere> runs
//                     FIELD at about one sample per 6 CSS px, then COLOUR at device resolution.
//
// Uniforms
//   u_perm       usampler2D 512 x 1 R8UI   the doubled permutation table (FIELD, single pass)
//   u_origin     vec2   field coordinate of the top-left sample
//   u_step       vec2   field units per sample (FIELD) or per pixel (single pass), x and y
//   u_z          vec4   z for the warp, base, second and third octave, each wrapped into [0, 256)
//                       (z = t / 22 s; multipliers 0.6, 1, 1.4, 1.9)
//   u_rows       float  render-target height in pixels: rows are counted from the top, like the CPU grid
//   u_field      sampler2D  packed field grid (COLOUR)      u_fieldSize vec2  its size in samples
//   u_size       vec2   output size in pixels (COLOUR)
//   u_lutA/B     sampler2D 256 x 1 RGBA8   palettes, crossfaded by u_mix (0 = A)
//   u_exact      int    1 = nearest LUT entry, texel-exact field, no dither (golden tests)
//   u_dither     float  triangular dither amplitude in 8-bit steps (1.0 hides banding in dark fields)

precision highp float;
precision highp int;
precision highp usampler2D;

out vec4 fragColor;

uniform usampler2D u_perm;
uniform vec2 u_origin;
uniform vec2 u_step;
uniform vec4 u_z;
uniform float u_rows;
uniform sampler2D u_field;
uniform vec2 u_fieldSize;
uniform vec2 u_size;
uniform sampler2D u_lutA;
uniform sampler2D u_lutB;
uniform float u_mix;
uniform int u_exact;
uniform float u_dither;

int perm(int i) { return int(texelFetch(u_perm, ivec2(i, 0), 0).r); }
float fade(float t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float grad(int h, float x, float y, float z) {
  float u = h < 8 ? x : y;
  float v = h < 4 ? y : ((h == 12 || h == 14) ? x : z);
  return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
}

float fluxNoise(vec3 p) {
  vec3 f = floor(p);
  int X = int(f.x) & 255, Y = int(f.y) & 255, Z = int(f.z) & 255;
  vec3 r = p - f;
  float x = r.x, y = r.y, z = r.z;
  float u = fade(x), v = fade(y), w = fade(z);
  int A = perm(X) + Y, AA = perm(A) + Z, AB = perm(A + 1) + Z;
  int B = perm(X + 1) + Y, BA = perm(B) + Z, BB = perm(B + 1) + Z;
  return mix(
    mix(mix(grad(perm(AA) & 15, x, y, z), grad(perm(BA) & 15, x - 1.0, y, z), u),
        mix(grad(perm(AB) & 15, x, y - 1.0, z), grad(perm(BB) & 15, x - 1.0, y - 1.0, z), u), v),
    mix(mix(grad(perm(AA + 1) & 15, x, y, z - 1.0), grad(perm(BA + 1) & 15, x - 1.0, y, z - 1.0), u),
        mix(grad(perm(AB + 1) & 15, x, y - 1.0, z - 1.0), grad(perm(BB + 1) & 15, x - 1.0, y - 1.0, z - 1.0), u), v),
    w);
}

float fluxValue(vec2 q) {
  float wx = fluxNoise(vec3(q * 0.7, u_z.x)) * 0.8;
  float s = fluxNoise(vec3(q.x + wx, q.y - wx * 0.5, u_z.y)) * 0.62
          + fluxNoise(vec3(q * 2.3, u_z.z)) * 0.26
          + fluxNoise(vec3(q * 4.1, u_z.w)) * 0.12;
  return clamp(s * 0.95 + 0.5, 0.0, 0.999);
}

vec3 lutAt(sampler2D l, int i) { return texelFetch(l, ivec2(i & 255, 0), 0).rgb; }

vec3 palette(float v) {
  if (u_exact == 1) {
    int i = clamp(int(floor(v * 256.0)), 0, 255);
    return mix(lutAt(u_lutA, i), lutAt(u_lutB, i), u_mix);
  }
  float x = v * 256.0, fi = floor(x), f = x - fi;
  int i = int(fi);
  vec3 a = mix(lutAt(u_lutA, i), lutAt(u_lutA, i + 1), f);
  vec3 b = mix(lutAt(u_lutB, i), lutAt(u_lutB, i + 1), f);
  return mix(a, b, u_mix);
}

// Interleaved gradient noise (Jimenez 2014); two taps make a triangular distribution in (-1, 1).
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
vec3 dither(vec3 c) {
  if (u_exact == 1 || u_dither <= 0.0) return c;
  float n = ign(gl_FragCoord.xy) + ign(gl_FragCoord.xy + vec2(47.0, 17.0)) - 1.0;
  return c + n * u_dither / 255.0;
}

#if defined(FLUX_PASS_FIELD)

void main() {
  vec2 cell = vec2(gl_FragCoord.x - 0.5, u_rows - gl_FragCoord.y - 0.5);
  float a = fluxValue(u_origin + cell * u_step) * 255.0, hi = floor(a);
  fragColor = vec4(hi / 255.0, a - hi, 0.0, 1.0);
}

#elif defined(FLUX_PASS_COLOUR)

float fieldAt(ivec2 p) {
  vec4 t = texelFetch(u_field, p, 0);
  return (floor(t.r * 255.0 + 0.5) + t.g) / 255.0;
}

void main() {
  float v;
  if (u_exact == 1) {
    v = fieldAt(ivec2(gl_FragCoord.xy));
  } else {
    // Sample i of the grid sits at output position i / (n - 1): edge to edge, like the CPU grid.
    vec2 p = gl_FragCoord.xy / u_size * (u_fieldSize - 1.0);
    vec2 i = floor(p), f = p - i;
    ivec2 m = ivec2(u_fieldSize) - 1, a = min(ivec2(i), m), b = min(a + 1, m);
    v = mix(mix(fieldAt(a), fieldAt(ivec2(b.x, a.y)), f.x), mix(fieldAt(ivec2(a.x, b.y)), fieldAt(b), f.x), f.y);
  }
  fragColor = vec4(dither(palette(v)), 1.0);
}

#else

void main() {
  vec2 cell = vec2(gl_FragCoord.x - 0.5, u_rows - gl_FragCoord.y - 0.5);
  fragColor = vec4(dither(palette(fluxValue(u_origin + cell * u_step))), 1.0);
}

#endif
`, Pt = ["u_perm", "u_origin", "u_step", "u_z", "u_rows", "u_field", "u_fieldSize", "u_size", "u_lutA", "u_lutB", "u_mix", "u_exact", "u_dither"], Nt = (s, t) => t ? s.replace(/^(#version[^\n]*\n)/, `$1#define ${t}
`) : s;
class G {
  constructor(t, e) {
    this.gl = null, this.lost = !1, this.vao = null, this.perm = null, this.lutA = null, this.lutB = null, this.grid = null, this.fbo = null, this.gridSize = [0, 0], this.lutBytes = [new Uint8Array(1024), new Uint8Array(1024)], this.onLost = (r) => {
      r.preventDefault(), this.lost = !0, this.drop(), this.opts.onLost?.();
    }, this.onRestored = () => {
      this.lost = !1, this.init() && this.opts.onRestored?.();
    }, this.canvas = t, this.opts = e;
    const i = t.getContext("webgl2", {
      alpha: !1,
      antialias: !1,
      depth: !1,
      stencil: !1,
      premultipliedAlpha: !0,
      preserveDrawingBuffer: !1,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: e.requireGpu !== !1
    });
    i && (this.gl = i, t.addEventListener("webglcontextlost", this.onLost, !1), t.addEventListener("webglcontextrestored", this.onRestored, !1), this.init() || (this.gl = null));
  }
  /** Returns null when WebGL2 (or, with requireGpu, a hardware-accelerated WebGL2) is not available. */
  static create(t, e = {}) {
    const i = new G(t, e);
    return i.gl ? i : null;
  }
  compile(t) {
    const e = this.gl, i = (h, l) => {
      const u = e.createShader(h);
      return e.shaderSource(u, l), e.compileShader(u), !e.getShaderParameter(u, e.COMPILE_STATUS) && !e.isContextLost() && console.error("fvl-atmosphere: shader", e.getShaderInfoLog(u)), u;
    }, r = e.createProgram(), n = i(e.VERTEX_SHADER, kt), a = i(e.FRAGMENT_SHADER, Nt(Ct, t));
    if (e.attachShader(r, n), e.attachShader(r, a), e.linkProgram(r), e.deleteShader(n), e.deleteShader(a), !e.getProgramParameter(r, e.LINK_STATUS)) {
      e.isContextLost() || console.error("fvl-atmosphere: link", e.getProgramInfoLog(r));
      return;
    }
    const o = {};
    for (const h of Pt) o[h] = e.getUniformLocation(r, h);
    return { p: r, u: o };
  }
  texture(t, e, i, r, n, a) {
    const o = this.gl, h = o.createTexture();
    return o.bindTexture(o.TEXTURE_2D, h), o.pixelStorei(o.UNPACK_ALIGNMENT, 1), o.texImage2D(o.TEXTURE_2D, 0, i, t, e, 0, r, n, a), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MIN_FILTER, o.NEAREST), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MAG_FILTER, o.NEAREST), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_S, o.CLAMP_TO_EDGE), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_T, o.CLAMP_TO_EDGE), h;
  }
  /** (Re)create every GPU resource; used at start and after a context restore. */
  init() {
    const t = this.gl;
    return !t || t.isContextLost() || (this.field = this.compile("FLUX_PASS_FIELD"), this.colour = this.compile("FLUX_PASS_COLOUR"), this.single = void 0, !this.field || !this.colour) ? !1 : (this.vao = t.createVertexArray(), this.perm = this.texture(512, 1, t.R8UI, t.RED_INTEGER, t.UNSIGNED_BYTE, it), this.lutA = this.texture(256, 1, t.RGBA8, t.RGBA, t.UNSIGNED_BYTE, this.lutBytes[0]), this.lutB = this.texture(256, 1, t.RGBA8, t.RGBA, t.UNSIGNED_BYTE, this.lutBytes[1]), this.grid = null, this.fbo = null, this.gridSize = [0, 0], !0);
  }
  /** Forget GPU handles (the context is gone; nothing can be deleted). */
  drop() {
    this.field = this.colour = this.single = void 0, this.vao = this.perm = this.lutA = this.lutB = this.grid = this.fbo = null, this.gridSize = [0, 0];
  }
  /** Upload palettes (RGBA, 256 × 1). A and B are crossfaded by FluxFrame.mix. */
  setLuts(t, e = t) {
    this.lutBytes = [t.slice(), e.slice()];
    const i = this.gl;
    !i || this.lost || i.isContextLost() || (i.pixelStorei(i.UNPACK_ALIGNMENT, 1), i.bindTexture(i.TEXTURE_2D, this.lutA), i.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, 256, 1, i.RGBA, i.UNSIGNED_BYTE, this.lutBytes[0]), i.bindTexture(i.TEXTURE_2D, this.lutB), i.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, 256, 1, i.RGBA, i.UNSIGNED_BYTE, this.lutBytes[1]));
  }
  ensureGrid(t, e) {
    const i = this.gl;
    this.grid && this.gridSize[0] === t && this.gridSize[1] === e || (this.grid && i.deleteTexture(this.grid), this.fbo && i.deleteFramebuffer(this.fbo), this.grid = this.texture(t, e, i.RGBA8, i.RGBA, i.UNSIGNED_BYTE, null), this.fbo = i.createFramebuffer(), i.bindFramebuffer(i.FRAMEBUFFER, this.fbo), i.framebufferTexture2D(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, this.grid, 0), i.bindFramebuffer(i.FRAMEBUFFER, null), this.gridSize = [t, e]);
  }
  /** Draw one frame at the canvas's current size. Returns false when nothing could be drawn (no context). */
  render(t) {
    const e = this.gl;
    if (!e || this.lost || e.isContextLost() || !this.field || !this.colour) return !1;
    const i = e.drawingBufferWidth, r = e.drawingBufferHeight;
    if (!i || !r) return !1;
    const n = st(t.time), a = t.exact ? 1 : 0, o = t.dither ?? 1, h = t.mix ?? 0;
    e.bindVertexArray(this.vao), e.disable(e.BLEND), e.disable(e.DEPTH_TEST);
    const l = (c) => {
      e.activeTexture(e.TEXTURE1), e.bindTexture(e.TEXTURE_2D, this.lutA), e.uniform1i(c.u.u_lutA, 1), e.activeTexture(e.TEXTURE2), e.bindTexture(e.TEXTURE_2D, this.lutB), e.uniform1i(c.u.u_lutB, 2), e.uniform1f(c.u.u_mix, h), e.uniform1i(c.u.u_exact, a), e.uniform1f(c.u.u_dither, o);
    }, u = (c, f, p) => {
      e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, this.perm), e.uniform1i(c.u.u_perm, 0), e.uniform2f(c.u.u_origin, t.window.origin[0], t.window.origin[1]), e.uniform2f(c.u.u_step, p[0], p[1]), e.uniform4f(c.u.u_z, n[0], n[1], n[2], n[3]), e.uniform1f(c.u.u_rows, f);
    };
    if (t.singlePass) {
      this.single || (this.single = this.compile());
      const c = this.single;
      return e.useProgram(c.p), u(c, r, [t.window.step[0] * (t.cols - 1) / Math.max(1, i - 1), t.window.step[1] * (t.rows - 1) / Math.max(1, r - 1)]), l(c), e.bindFramebuffer(e.FRAMEBUFFER, null), e.viewport(0, 0, i, r), e.drawArrays(e.TRIANGLES, 0, 3), !0;
    }
    this.ensureGrid(t.cols, t.rows), e.useProgram(this.field.p), u(this.field, t.rows, t.window.step), e.bindFramebuffer(e.FRAMEBUFFER, this.fbo), e.viewport(0, 0, t.cols, t.rows), e.drawArrays(e.TRIANGLES, 0, 3);
    const d = this.colour;
    return e.useProgram(d.p), e.activeTexture(e.TEXTURE3), e.bindTexture(e.TEXTURE_2D, this.grid), e.uniform1i(d.u.u_field, 3), e.uniform2f(d.u.u_fieldSize, t.cols, t.rows), e.uniform2f(d.u.u_size, i, r), l(d), e.bindFramebuffer(e.FRAMEBUFFER, null), e.viewport(0, 0, i, r), e.drawArrays(e.TRIANGLES, 0, 3), !0;
  }
  /** Read the drawing buffer as top-to-bottom RGBA rows. Call right after render(), in the same task. */
  read() {
    const t = this.gl;
    if (!t || this.lost || t.isContextLost()) return null;
    const e = t.drawingBufferWidth, i = t.drawingBufferHeight, r = new Uint8Array(e * i * 4), n = new Uint8ClampedArray(e * i * 4);
    t.bindFramebuffer(t.FRAMEBUFFER, null), t.readPixels(0, 0, e, i, t.RGBA, t.UNSIGNED_BYTE, r);
    for (let a = 0; a < i; a++) n.set(r.subarray((i - 1 - a) * e * 4, (i - a) * e * 4), a * e * 4);
    return new ImageData(n, e, i);
  }
  /** Largest drawing buffer side this context supports. */
  get maxSize() {
    const t = this.gl;
    return t ? Math.min(t.getParameter(t.MAX_TEXTURE_SIZE), t.getParameter(t.MAX_VIEWPORT_DIMS)[0]) : 4096;
  }
  dispose() {
    const t = this.gl;
    if (this.canvas.removeEventListener("webglcontextlost", this.onLost), this.canvas.removeEventListener("webglcontextrestored", this.onRestored), t && !t.isContextLost()) {
      for (const e of [this.field, this.colour, this.single]) e && t.deleteProgram(e.p);
      for (const e of [this.perm, this.lutA, this.lutB, this.grid]) e && t.deleteTexture(e);
      this.fbo && t.deleteFramebuffer(this.fbo), this.vao && t.deleteVertexArray(this.vao);
    }
    this.drop(), this.gl = null;
  }
}
const zt = 6, Gt = 72, Xt = 384, W = 96, Vt = 42e5, Ot = 4.5, $t = `
  :host { display: block; position: relative; isolation: isolate; overflow: hidden; contain: paint; color: var(--fvl-color-text-primary); }
  :host([hidden]) { display: none !important; }
  .field { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
  canvas { position: absolute; inset: 0; inline-size: 100%; block-size: 100%; display: block; }
  canvas[hidden] { display: none; }
  .content { display: contents; }
`, qt = typeof HTMLElement < "u" ? HTMLElement : class {
}, w = /* @__PURE__ */ new Set();
let L = 0, A = null;
function rt(s) {
  L = 0;
  let t = !1;
  for (const e of w)
    try {
      e._tick(s) && (t = !0);
    } catch (i) {
      console.error(i);
    }
  t && (L = requestAnimationFrame(rt));
}
function b() {
  !L && w.size && typeof requestAnimationFrame == "function" && (L = requestAnimationFrame(rt));
}
function K(s) {
  if (s && !A) {
    const t = () => {
      for (const n of w) n._context();
    }, e = () => {
      if (!document.hidden) {
        for (const n of w) n._dirty();
        b();
      }
    }, i = new MutationObserver(t);
    i.observe(document.documentElement, { attributes: !0, subtree: !0, attributeFilter: ["data-theme", "data-daylight", "data-motion"] });
    const r = ["(prefers-color-scheme: dark)", "(prefers-reduced-motion: reduce)"].map((n) => matchMedia(n));
    r.forEach((n) => n.addEventListener("change", t)), document.addEventListener("visibilitychange", e), A = { mo: i, mq: r, vis: e, change: t };
  } else !s && A && !w.size && (A.mo.disconnect(), A.mq.forEach((t) => t.removeEventListener("change", A.change)), document.removeEventListener("visibilitychange", A.vis), A = null);
}
class Yt extends qt {
  constructor() {
    super(...arguments), this.ready = !1, this.flux = null, this._mode = "none", this.announced = "none", this.t = 0, this.last = 0, this.lastTick = 0, this.firstFrameAt = 0, this.visible = !0, this.dirty = !0, this.size = { w: 0, h: 0, cols: 0, rows: 0, bw: 0, bh: 0 }, this.from = new Uint8Array(1024), this.to = new Uint8Array(1024), this.mixV = 1, this.mixVel = 0, this.paletteKey = "", this.cpuKey = "", this.managedTheme = null, this._stops = null, this._tone = "dark", this._contrast = 0, this._frames = 0, this.onDpr = () => {
      this.watchDpr(), this.measure();
    };
  }
  static {
    this.observedAttributes = ["palette", "daylight", "speed", "scale", "time", "contrast", "paused", "renderer"];
  }
  // ——— public API ———
  /** Palette: `atmos` (Temporal Flux, default), `liquid` (the spark palette) or `form` (full-liquid hero, per theme). */
  get palette() {
    const t = this.getAttribute("palette");
    return t === "liquid" || t === "form" ? t : "atmos";
  }
  set palette(t) {
    this.setAttribute("palette", t);
  }
  /** `inherit` (nearest data-daylight, default), `auto` (from the clock, blended across boundaries), or a context name. */
  get daylight() {
    return this.getAttribute("daylight") ?? "inherit";
  }
  set daylight(t) {
    this.setAttribute("daylight", t);
  }
  /** Time multiplier (default 1; 0 holds the field still). */
  get speed() {
    const t = parseFloat(this.getAttribute("speed") ?? "");
    return Number.isFinite(t) ? Math.max(0, t) : 1;
  }
  set speed(t) {
    this.setAttribute("speed", String(t));
  }
  /** Lattice units across the longer side, as a multiple of the reference 2.1 (default 1; larger shows more, smaller features). */
  get scale() {
    const t = parseFloat(this.getAttribute("scale") ?? "");
    return Number.isFinite(t) && t > 0 ? t : 1;
  }
  set scale(t) {
    this.setAttribute("scale", String(t));
  }
  /** Freeze the field at this many seconds (for stills, wallpapers and tests). Unset to animate. */
  get time() {
    const t = this.getAttribute("time"), e = t === null ? NaN : parseFloat(t);
    return Number.isFinite(e) ? e : null;
  }
  set time(t) {
    t === null ? this.removeAttribute("time") : this.setAttribute("time", String(t));
  }
  /** Minimum WCAG contrast between the text colour and every pixel (default 4.5; 0 turns the scrim off). */
  get contrast() {
    const t = this.getAttribute("contrast"), e = t === null ? NaN : parseFloat(t);
    return Number.isFinite(e) ? Math.max(0, e) : Ot;
  }
  set contrast(t) {
    this.setAttribute("contrast", String(t));
  }
  /** Hold the current frame. */
  get paused() {
    return this.hasAttribute("paused");
  }
  set paused(t) {
    this.toggleAttribute("paused", !!t);
  }
  /** `auto` (WebGL2 on a GPU, else the still canvas; default), `webgl2` (allow software WebGL2) or `canvas`. */
  get renderer() {
    return this.getAttribute("renderer") ?? "auto";
  }
  set renderer(t) {
    this.setAttribute("renderer", t);
  }
  /** Custom OKLCH stops ([L, C, H] × 4, cyclic). Overrides `palette` and `daylight`; set null to go back. */
  get stops() {
    return this._stops;
  }
  set stops(t) {
    this._stops = t && t.length >= 2 ? t.map((e) => [e[0], e[1], e[2]]) : null, this._context();
  }
  /** What is drawing now. */
  get renderMode() {
    return this._mode;
  }
  /** The field's tone: dark fields carry light text. */
  get tone() {
    return this._tone;
  }
  /** The lowest contrast any pixel has against the text colour after the scrim. */
  get contrastReached() {
    return this._contrast;
  }
  /** Frames drawn so far (diagnostic). */
  get frames() {
    return this._frames;
  }
  /** Seconds of field time on screen. */
  get fieldTime() {
    return this.time ?? this.t;
  }
  /** Draw a frame now and return its pixels (device resolution for WebGL2, grid resolution for the still canvas). */
  snapshot() {
    if (!this.ready) return null;
    if (this._mode === "webgl2" && this.flux)
      return this.drawGL(), this.flux.read();
    if (this._mode === "canvas" && this.cpu) {
      this.drawCPU();
      const t = this.cpu.getContext("2d");
      return t ? t.getImageData(0, 0, this.cpu.width, this.cpu.height) : null;
    }
    return null;
  }
  /** Re-read context and size and redraw (call after changing the text colour). */
  refresh() {
    this.paletteKey = "", this._context(), this.measure();
  }
  // ——— lifecycle ———
  connectedCallback() {
    if (!this.shadow) {
      this.shadow = this.attachShadow({ mode: "open" });
      const t = document.createElement("style");
      t.textContent = $t, this.layer = document.createElement("div"), this.layer.className = "field", this.cpu = document.createElement("canvas"), this.cpu.setAttribute("part", "fallback"), this.cpu.setAttribute("aria-hidden", "true"), this.cpu.hidden = !0;
      const e = document.createElement("div");
      e.className = "content", e.append(document.createElement("slot")), this.layer.append(this.cpu), this.shadow.append(t, this.layer, e);
    }
    this.ready = !0, this.t = this.time ?? Date.now() / 1e3 % F, w.add(this), K(!0), this.ro = new ResizeObserver(() => this.measure()), this.ro.observe(this.layer), this.io = new IntersectionObserver((t) => {
      this.visible = t.some((e) => e.isIntersecting), this.visible && (this.dirty = !0, b());
    }, { rootMargin: "64px" }), this.io.observe(this), this.watchDpr(), this.setRenderer(), this._context(), this.syncClock(), this.measure();
  }
  disconnectedCallback() {
    this.ready = !1, w.delete(this), K(!1), this.ro?.disconnect(), this.io?.disconnect(), this.dprQuery?.removeEventListener("change", this.onDpr), this.clock && clearInterval(this.clock), this.clock = void 0, this.flux?.dispose(), this.flux = null, this.gl?.remove(), this.gl = void 0, this._mode = this.announced = "none", this.firstFrameAt = 0, this.paletteKey = "", this.managedTheme = this.getAttribute("data-theme") === this.managedTheme ? this.managedTheme : null;
  }
  attributeChangedCallback(t, e, i) {
    if (!(!this.ready || e === i)) {
      if (t === "renderer") {
        this.setRenderer(), this.measure();
        return;
      }
      t === "time" && this.time !== null && (this.t = this.time), (t === "palette" || t === "daylight" || t === "contrast") && (this._context(), this.syncClock()), t === "scale" && this.measure(), this.dirty = !0, b();
    }
  }
  // ——— internals (called by the shared loop and observers) ———
  /** @internal */
  _dirty() {
    this.dirty = !0;
  }
  /** @internal Recompute the palette from context; crossfade to it when it changed. */
  _context() {
    if (!this.ready) return;
    const t = mt(this, !0);
    let e;
    if (this._stops) e = this._stops;
    else {
      const h = this.daylight;
      if (h === "auto") {
        const l = Mt(/* @__PURE__ */ new Date());
        e = St(k(this.palette, l.from, t), k(this.palette, l.to, t), l.t);
      } else e = k(this.palette, nt.includes(h) ? h : pt(this), t);
    }
    this._tone = Bt(e), this.manageTheme(this._tone);
    const i = ft(getComputedStyle(this).color)?.rgb ?? (this._tone === "dark" ? [1, 1, 1] : [0, 0, 0]), r = It(e, i, this.contrast);
    this._contrast = r.contrast;
    const n = Dt(r.lut), a = n.join(",");
    if (a === this.paletteKey) {
      b();
      return;
    }
    const o = this.paletteKey !== "" && this.firstFrameAt > 0 && performance.now() - this.firstFrameAt > 400 && this.visible && !document.hidden && !M(this);
    if (this.paletteKey = a, !o)
      this.from = n, this.to = n, this.mixV = 1, this.mixVel = 0;
    else {
      const h = g(this.mixV, 0, 1), l = new Uint8Array(1024);
      for (let u = 0; u < 1024; u++) l[u] = Math.round(this.from[u] + (this.to[u] - this.from[u]) * h);
      this.from = l, this.to = n, this.mixV = 0, this.mixVel = 0;
    }
    this.flux?.setLuts(this.from, this.to), this.layer?.style.setProperty("background", `rgb(${n[0]} ${n[1]} ${n[2]})`), this.dirty = !0, b();
  }
  /** @internal One frame of the shared loop. Returns true while more frames are wanted. */
  _tick(t) {
    if (!this.ready || !this.size.w || !this.size.h || this._mode === "none") return !1;
    if (document.hidden || !this.visible)
      return this.lastTick = 0, this.dirty && (this.mixV = 1, this.mixVel = 0, this.draw()), !1;
    const e = this.lastTick ? Math.min(0.1, (t - this.lastTick) / 1e3) : 1 / 60;
    this.lastTick = t;
    let i = !1;
    if (this.mixV < 1 || this.mixVel !== 0) {
      if (M(this))
        this.mixV = 1, this.mixVel = 0;
      else {
        const a = Y.stiffness, o = Y.damping, h = Math.max(1, Math.ceil(e * 120)), l = e / h;
        for (let u = 0; u < h; u++)
          this.mixVel += (-a * (this.mixV - 1) - o * this.mixVel) * l, this.mixV += this.mixVel * l;
        Math.abs(this.mixVel) < 1e-3 && Math.abs(this.mixV - 1) < 1e-3 && (this.mixV = 1, this.mixVel = 0);
      }
      this.dirty = !0, i = this.mixV !== 1;
    }
    const r = this._mode === "webgl2" && !this.paused && this.time === null && this.speed > 0 && !M(this), n = t - this.last >= 1e3 / Ft - 2;
    return r && (i = !0, n && (this.last && (this.t = (this.t + Math.min(0.1, (t - this.last) / 1e3) * this.speed) % F), this.dirty = !0)), this.dirty && n && (this.last = t, this.draw()), i || this.dirty;
  }
  draw() {
    this.dirty = !1, (this._mode === "webgl2" ? this.drawGL() : this.drawCPU()) && (this._frames++, this.firstFrameAt || (this.firstFrameAt = performance.now()), this.announced !== this._mode && (this.announced = this._mode, this.dispatchEvent(new CustomEvent("fvl-ready", { bubbles: !0, composed: !0, detail: { renderer: this._mode } }))));
  }
  drawGL() {
    const t = this.flux, e = this.size;
    return !t || !this.gl || !e.w ? !1 : ((this.gl.width !== e.bw || this.gl.height !== e.bh) && (this.gl.width = e.bw, this.gl.height = e.bh), t.render({ time: this.fieldTime, cols: e.cols, rows: e.rows, window: q(e.w, e.h, e.cols, e.rows, this.scale), mix: g(this.mixV, 0, 1) }));
  }
  drawCPU() {
    const t = this.cpu, e = this.size;
    if (!t || !e.w) return !1;
    const i = Math.max(e.w, e.h), r = Math.max(2, Math.round(W * e.w / i)), n = Math.max(2, Math.round(W * e.h / i));
    (t.width !== r || t.height !== n) && (t.width = r, t.height = n);
    const a = `${r}x${n}:${this.fieldTime}:${this.scale}`;
    (!this.cpuValues || this.cpuKey !== a) && (this.cpuValues = At(new Float32Array(r * n), r, n, q(e.w, e.h, r, n, this.scale), this.fieldTime), this.cpuKey = a);
    const o = t.getContext("2d");
    if (!o) return !1;
    const h = o.createImageData(r, n), l = h.data, u = this.cpuValues, d = g(this.mixV, 0, 1), c = this.from, f = this.to;
    for (let p = 0, _ = 0; p < u.length; p++) {
      const m = (u[p] * 256 | 0) * 4;
      l[_++] = c[m] + (f[m] - c[m]) * d, l[_++] = c[m + 1] + (f[m + 1] - c[m + 1]) * d, l[_++] = c[m + 2] + (f[m + 2] - c[m + 2]) * d, l[_++] = 255;
    }
    return o.putImageData(h, 0, 0), !0;
  }
  /** Choose the renderer from the attribute and what the browser offers. */
  setRenderer() {
    this.flux?.dispose(), this.flux = null, this.gl?.remove(), this.gl = void 0;
    const t = this.renderer;
    if (t !== "canvas") {
      const e = document.createElement("canvas");
      e.setAttribute("part", "field"), e.setAttribute("aria-hidden", "true"), this.flux = G.create(e, {
        requireGpu: t !== "webgl2",
        onLost: () => {
          this.show("canvas"), this.dirty = !0, b();
        },
        onRestored: () => {
          this.flux?.setLuts(this.from, this.to), this.show("webgl2"), this.dirty = !0, b();
        }
      }), this.flux && (this.gl = e, this.layer.prepend(e), this.flux.setLuts(this.from, this.to));
    }
    this.show(this.flux ? "webgl2" : "canvas");
  }
  show(t) {
    this._mode = t, this.gl && (this.gl.hidden = t !== "webgl2"), this.cpu && (this.cpu.hidden = t !== "canvas"), this.dirty = !0;
  }
  /** Size the canvases from the layer's box and the (capped) device pixel ratio. */
  measure() {
    if (!this.ready || !this.layer) return;
    const t = this.layer.clientWidth, e = this.layer.clientHeight;
    if (!t || !e) {
      this.size = { w: 0, h: 0, cols: 0, rows: 0, bw: 0, bh: 0 };
      return;
    }
    const i = Math.min(typeof devicePixelRatio == "number" ? devicePixelRatio : 1, Lt);
    let r = Math.max(1, Math.round(t * i)), n = Math.max(1, Math.round(e * i));
    const a = this.flux?.maxSize ?? 4096, o = Math.min(1, Math.sqrt(Vt / (r * n)), a / r, a / n);
    o < 1 && (r = Math.max(1, Math.floor(r * o)), n = Math.max(1, Math.floor(n * o)));
    const h = Math.max(t, e), l = g(Math.round(h / zt), Gt, Xt), u = Math.max(2, Math.round(l * t / h)), d = Math.max(2, Math.round(l * e / h));
    this.size = { w: t, h: e, cols: u, rows: d, bw: r, bh: n }, this.dirty = !0, this._mode !== "none" && !document.hidden && this.draw(), b();
  }
  watchDpr() {
    this.dprQuery?.removeEventListener("change", this.onDpr), typeof matchMedia == "function" && (this.dprQuery = matchMedia(`(resolution: ${typeof devicePixelRatio == "number" ? devicePixelRatio : 1}dppx)`), this.dprQuery.addEventListener("change", this.onDpr));
  }
  syncClock() {
    const t = this.daylight === "auto" && !this._stops;
    t && !this.clock && (this.clock = setInterval(() => this._context(), 6e4)), !t && this.clock && (clearInterval(this.clock), this.clock = void 0);
  }
  /** Give slotted content the theme that matches the field, unless the author set data-theme. */
  manageTheme(t) {
    const e = this.getAttribute("data-theme");
    e !== null && e !== this.managedTheme || e !== t && (this.managedTheme = t, this.setAttribute("data-theme", t));
  }
}
typeof customElements < "u" && !customElements.get("fvl-atmosphere") && customElements.define("fvl-atmosphere", Yt);
const Wt = (s, t) => t ? s.replace(/^(#version[^\n]*\n)/, `$1#define ${t}
`) : s;
export {
  nt as DAYLIGHTS,
  B as DAYLIGHT_BLEND_MIN,
  U as DAYLIGHT_START,
  Lt as DPR_MAX,
  et as FIELD_CYCLE,
  Ft as FIELD_FPS,
  Ht as FIELD_GRID,
  F as FIELD_PERIOD,
  xt as FIELD_SEED,
  gt as FIELD_SPAN,
  _t as FIELD_Z,
  Ct as FLUX_FRAGMENT,
  kt as FLUX_VERTEX,
  G as FluxRenderer,
  Yt as FvlAtmosphere,
  it as PERM,
  St as blendStops,
  ht as contrast,
  Mt as daylightAt,
  vt as fieldValue,
  q as fieldWindow,
  st as fieldZ,
  Wt as fluxShader,
  O as luminance,
  C as lut,
  Dt as lutRGBA,
  Ut as meanLightness,
  P as minContrast,
  R as noise,
  at as oklchToSrgb,
  k as paletteStops,
  ft as parseColour,
  At as sampleField,
  H as scrimStops,
  Bt as toneOf,
  It as withContrast
};
//# sourceMappingURL=fvl-atmosphere.js.map
