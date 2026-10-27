// ScriptureBridge UI — Flow Visual Language components + GSAP with the FVL springs.
// Browse (list, threads, map, saved, index) → tap → Reader: one bridge, nothing else on screen.
import { toast } from '/apps/vendor/fvl/ui/fvl-components.js';

const gsap = window.gsap;
if (window.DrawSVGPlugin) gsap.registerPlugin(window.DrawSVGPlugin);

// ---------- FVL motion ----------
const root = document.documentElement;
const css = getComputedStyle(root);
const token = (n) => css.getPropertyValue(n).trim();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
function linearEase(str) {
  const m = str.match(/linear\(([^)]*)\)/);
  if (!m) return 'power2.out';
  const pts = m[1].split(',').map(Number).filter((n) => !isNaN(n));
  const n = pts.length - 1;
  return (p) => (p <= 0 ? pts[0] : p >= 1 ? pts[n] : pts[Math.floor(p * n)] + (pts[Math.floor(p * n) + 1] - pts[Math.floor(p * n)]) * (p * n - Math.floor(p * n)));
}
const spring = {};
['settle', 'arrive', 'carve', 'grow'].forEach((k) => {
  gsap.registerEase('fvl-' + k, linearEase(token('--fvl-motion-spring-' + k + '-easing')));
  spring[k] = { ease: 'fvl-' + k, duration: reduced ? 0 : (parseFloat(token('--fvl-motion-spring-' + k + '-duration')) / 1000 || 0.8) };
});
const quick = { duration: reduced ? 0 : 0.16, ease: 'power1.in' };

// ---------- helpers ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
};
function copy(text, msg) {
  const done = () => toast(msg);
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => fallback());
  else fallback();
  function fallback() {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove(); done();
  }
}
function highlight(text, phrase) {
  const i = phrase ? text.indexOf(phrase) : -1;
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(phrase) + '</mark>' + esc(text.slice(i + phrase.length));
}
const refTouches = (ref, book) => ref.split(/;\s*/).some((r) => r === book || r.startsWith(book + ' '));

// ---------- state ----------
const CATS = ['birth', 'ministry', 'passion', 'resurrection', 'covenant'];
const TABS = ['bridges', 'threads', 'map', 'saved', 'index'];
const S = { tab: null, cat: 'all', type: 'all', book: null, q: '', mapCat: 'all', mapSel: null, iq: '', imin: 0, thread: null, mapDrawn: false };
const D = { P: [], byId: new Map(), T: {}, OT: [], NT: [], TSK: [], catLabel: {} };
let saved = store.get('scripturebridge_saved_v2', []);
const readSet = new Set(store.get('sb_read_v1', []));
let lastRead = store.get('sb_last_v1', null);

// ---------- data ----------
async function load() {
  const get = (f) => fetch('data/' + f).then((r) => { if (!r.ok) throw new Error(f); return r.json(); });
  const [books, P, T, TSK] = await Promise.all([get('books_66.json'), get('prophecies_66_books.json'), get('canonical_threads.json'), get('tsk_high_impact_index.json')]);
  D.P = P; D.T = T; D.TSK = TSK; D.OT = books.old_testament; D.NT = books.new_testament;
  P.forEach((p) => { D.byId.set(p.id, p); D.catLabel[p.category] = D.catLabel[p.category] || p.categoryLabel; });
}

function filtered() {
  const q = S.q.toLowerCase();
  return D.P.filter((p) => {
    if (S.cat !== 'all' && p.category !== S.cat) return false;
    if (S.type !== 'all' && p.type !== S.type) return false;
    if (S.book && !(p.ot.book === S.book || p.nt.book === S.book || refTouches(p.ot.ref, S.book) || refTouches(p.nt.ref, S.book))) return false;
    if (!q) return true;
    return [p.title, p.ot.ref, p.nt.ref, p.ot.book, p.nt.book, p.ot.text, p.nt.text, p.bridge, ...p.keywords].some((s) => s.toLowerCase().includes(q));
  });
}

// ---------- rows ----------
function rowHTML(p, { summary = true } = {}) {
  const isRead = readSet.has(p.id), isSaved = saved.includes(p.id);
  return `<li><button type="button" class="row${isRead ? ' is-read' : ''}" data-id="${esc(p.id)}">
    <span class="row-head">
      <span class="kicker"><span class="dot c-${esc(p.category)}"></span>${esc(p.categoryLabel)}</span>
      <span class="row-marks">${isSaved ? '<fvl-icon class="saved" name="star" label="Saved"></fvl-icon>' : ''}${isRead ? '<fvl-icon name="check" label="Read"></fvl-icon>' : ''}</span>
    </span>
    <span class="row-title">${esc(p.title)}</span>
    <span class="refs">${esc(p.ot.ref)} <span aria-hidden="true">→</span><span class="sr"> fulfilled in </span> ${esc(p.nt.ref)}</span>
    ${summary ? `<span class="row-sum">${esc(p.bridge)}</span>` : ''}
  </button></li>`;
}

// ---------- bridges ----------
function buildFilters() {
  const tag = (v, label, sel) => `<fvl-tag selectable value="${v}"${sel ? ' selected' : ''}>${v === 'all' ? '' : `<span slot="leading" class="dot c-${v}"></span>`}${esc(label)}</fvl-tag>`;
  const tags = (cur) => tag('all', 'All', cur === 'all') + CATS.map((c) => tag(c, D.catLabel[c] || c, cur === c)).join('');
  $('#cats').innerHTML = tags(S.cat);
  $('#mapCats').innerHTML = tags(S.mapCat);
  const types = [...new Set(D.P.map((p) => p.type))];
  $('#types').innerHTML = ['all', ...types].map((t) => `<fvl-tag selectable value="${esc(t)}"${t === S.type ? ' selected' : ''}>${t === 'all' ? 'All' : esc(t)}</fvl-tag>`).join('');
  const groups = [['Old Testament', D.OT], ['New Testament', D.NT]];
  const count = (b) => D.P.filter((p) => p.ot.book === b || p.nt.book === b || refTouches(p.ot.ref, b) || refTouches(p.nt.ref, b)).length;
  $('#bookGroups').innerHTML = `<div class="book-grid"><button type="button" class="book all" data-book="" aria-pressed="true">All books <span>${D.P.length}</span></button></div>` +
    groups.map(([name, list]) => `<div class="book-group"><h3>${name}</h3><div class="book-grid">${list.map((b) =>
      `<button type="button" class="book" data-book="${esc(b.name)}" aria-pressed="false">${esc(b.name)} <span>${count(b.name)}</span></button>`).join('')}</div></div>`).join('');
}
function syncChips(group, cur) { $$('fvl-tag', group).forEach((t) => { t.selected = t.getAttribute('value') === cur; }); }

function renderBridges() {
  const list = filtered();
  $('#count').textContent = `${list.length} ${list.length === 1 ? 'bridge' : 'bridges'}`;
  $('#applyBtn').textContent = list.length ? `Show ${list.length} ${list.length === 1 ? 'bridge' : 'bridges'}` : 'No bridges match';
  const active = [S.book, S.type !== 'all' && S.type].filter(Boolean);
  $('#filterLabel').textContent = active.length ? active.join(' · ') : 'Book and relationship';
  $('#clearBtn').hidden = !(active.length || S.cat !== 'all' || S.q);
  const last = lastRead && D.byId.get(lastRead);
  $('#continue').innerHTML = last && !S.q && S.cat === 'all' && !S.book && S.type === 'all'
    ? `<button type="button" class="continue" data-id="${esc(last.id)}"><span><small>Continue reading</small><b>${esc(last.title)}</b></span><fvl-icon name="arrow-right" size="md"></fvl-icon></button>` : '';
  $('#list').innerHTML = list.length ? list.map((p) => rowHTML(p)).join('')
    : `<li><fvl-empty icon="search" heading="No bridges match" description="Try another word, or clear the filters."><fvl-button slot="actions" variant="secondary" id="reset">Clear filters</fvl-button></fvl-empty></li>`;
  $('#reset')?.addEventListener('click', resetFilters);
}
function resetFilters() {
  S.cat = 'all'; S.type = 'all'; S.book = null; S.q = '';
  $('#q').value = ''; syncChips($('#cats'), 'all'); syncChips($('#types'), 'all'); syncBookUI(); renderBridges();
}
function syncBookUI() {
  $$('.book').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.book || null) === S.book)));
}

// ---------- threads ----------
function renderThreads() {
  const v = $('#view-threads');
  const th = S.thread && D.T[S.thread];
  if (!th) {
    v.innerHTML = `<div class="section-head"><h2>Threads</h2><p>Six paths from Genesis to Revelation. Each one reads as a sequence, step by step.</p></div>
      <ol class="list">${Object.entries(D.T).map(([k, t]) => `<li><button type="button" class="row" data-thread="${esc(k)}">
        <span class="kicker">${t.steps.length} steps</span><span class="row-title">${esc(t.title)}</span><span class="row-sum">${esc(t.subtitle)}</span></button></li>`).join('')}</ol>`;
    return;
  }
  v.innerHTML = `<div class="actions"><fvl-button variant="tertiary" size="sm" data-go="#/threads"><fvl-icon name="arrow-left"></fvl-icon>All threads</fvl-button></div>
    <div class="section-head"><h2>${esc(th.title)}</h2><p>${esc(th.description)}</p></div>
    <div class="actions"><fvl-button variant="primary" data-read-thread="${esc(S.thread)}">Read this thread</fvl-button></div>
    <ol class="list">${th.steps.map((st, i) => {
      const p = D.byId.get(st.prophecyId);
      return `<li><button type="button" class="row${p && readSet.has(p.id) ? ' is-read' : ''}" data-id="${esc(st.prophecyId)}" data-step="${i}">
        <span class="kicker"><span class="step-n">${i + 1}</span><span aria-hidden="true">·</span>${esc(st.ref)}</span>
        <span class="row-title">${esc(st.stage.replace(/^\d+\.\s*/, ''))}</span><span class="row-sum">${esc(st.note)}</span></button></li>`;
    }).join('')}</ol>`;
}

// ---------- map ----------
const BASE = 395;
function bookX(name) { const b = D.OT.concat(D.NT).find((x) => x.name === name || x.abbrev === name); return b ? b.x : 500; }
function arcPath(p) {
  const x1 = bookX(p.ot.book), x2 = bookX(p.nt.book), h = Math.min(350, Math.max(65, Math.abs(x2 - x1) * 0.56)), y = BASE - h;
  return `M ${x1} ${BASE} C ${x1 + (x2 - x1) * 0.15} ${y}, ${x2 - (x2 - x1) * 0.15} ${y}, ${x2} ${BASE}`;
}
function renderMap(animate) {
  const arcs = D.P.filter((p) => S.mapCat === 'all' || p.category === S.mapCat);
  if (!arcs.some((p) => p.id === S.mapSel)) S.mapSel = arcs[0]?.id || null;
  const books = D.OT.concat(D.NT);
  $('#arc').innerHTML = `
    <line class="divider" x1="526" y1="28" x2="526" y2="455"/>
    <text class="side-label" x="518" y="22" font-size="10" text-anchor="end">OLD TESTAMENT</text>
    <text class="side-label" x="534" y="22" font-size="10">NEW TESTAMENT</text>
    <line class="axis" x1="8" y1="${BASE}" x2="992" y2="${BASE}"/>
    ${arcs.map((p) => `<g><path class="arc-hit" d="${arcPath(p)}" data-arc="${esc(p.id)}" tabindex="0" role="button" aria-label="${esc(p.title)}: ${esc(p.ot.ref)} to ${esc(p.nt.ref)}"/><path class="arc c-${esc(p.category)}${p.id === S.mapSel ? ' sel' : ''}" d="${arcPath(p)}"/></g>`).join('')}
    ${books.map((b) => `<circle class="tick ${b.testament === 'NT' ? 'nt' : ''}" cx="${b.x}" cy="${BASE}" r="2.5"/><text class="book-label" x="${b.x}" y="${BASE + 10}" font-size="8.5" text-anchor="end" transform="rotate(-55 ${b.x} ${BASE + 10})">${esc(b.abbrev)}</text>`).join('')}`;
  if (animate && !reduced && window.DrawSVGPlugin) gsap.from('#arc .arc', { drawSVG: '0%', stagger: 0.006, ...spring.grow });
  renderMapPreview();
}
function renderMapPreview() {
  const p = D.byId.get(S.mapSel);
  $('#mapPreview').innerHTML = p ? `<ol class="list">${rowHTML(p)}</ol>` : '';
  $$('#arc .arc').forEach((a) => a.classList.toggle('sel', a.previousElementSibling?.dataset.arc === S.mapSel));
}

// ---------- saved ----------
function renderSaved() {
  const v = $('#view-saved');
  const items = saved.map((id) => D.byId.get(id)).filter(Boolean);
  if (!items.length) {
    v.innerHTML = `<fvl-empty icon="star" heading="Nothing saved yet" description="Open a bridge and tap the star to keep it here."></fvl-empty>`;
    return;
  }
  v.innerHTML = `<div class="section-head"><h2>Saved</h2><p>${items.length} ${items.length === 1 ? 'bridge' : 'bridges'}, in the order you saved them.</p></div>
    <div class="actions"><fvl-button variant="primary" data-read-saved>Read saved</fvl-button><fvl-button variant="secondary" data-copy-md><fvl-icon name="copy"></fvl-icon>Copy as Markdown</fvl-button></div>
    <ol class="list">${items.map((p) => rowHTML(p)).join('')}</ol>`;
}

// ---------- index ----------
function renderIndex() {
  const q = S.iq.toLowerCase();
  const rows = D.TSK.filter((r) => r.votes >= S.imin && (!q || [r.fromRef, r.toRef, r.type, r.summary].some((s) => String(s).toLowerCase().includes(q))));
  const shown = rows.slice(0, 200);
  $('#icount').textContent = `${rows.length.toLocaleString()} links${rows.length > shown.length ? ` · showing the first ${shown.length}, narrow with the filter` : ''}`;
  $('#ilist').innerHTML = shown.map((r) => {
    const inner = `<span class="row-head"><span class="kicker">${esc(r.type)}<span aria-hidden="true">·</span>${Number(r.votes).toLocaleString()} votes</span></span>
      <span class="refs">${esc(r.fromRef)} <span aria-hidden="true">→</span><span class="sr"> to </span> ${esc(r.toRef)}</span><span class="row-sum">${esc(r.summary)}</span>`;
    return r.prophecyId && D.byId.has(r.prophecyId)
      ? `<li><button type="button" class="row idx-row" data-id="${esc(r.prophecyId)}">${inner}</button></li>`
      : `<li><div class="row idx-row">${inner}</div></li>`;
  }).join('');
}
function importFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = [];
    for (const raw of String(reader.result).split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#') || /^from/i.test(line)) continue;
      const parts = line.split(/\t|,/);
      if (parts.length < 2) continue;
      const votes = parts.length >= 3 ? (parseInt(parts[2], 10) || 0) : 0;
      parsed.push({ fromRef: parts[0].trim(), toRef: parts[1].trim(), votes, type: 'OpenBible cross-reference', summary: '', prophecyId: null });
    }
    if (!parsed.length) { toast.warning('Nothing to import', { description: 'Use a tab- or comma-separated file.' }); return; }
    D.TSK = parsed.concat(D.TSK);
    renderIndex();
    toast.success(`Imported ${parsed.length.toLocaleString()} links`);
  };
  reader.readAsText(file);
}

// ---------- tabs ----------
const views = Object.fromEntries(TABS.map((t) => [t, $('#view-' + t)]));
function renderTab(t, animate) {
  if (t === 'bridges') renderBridges();
  else if (t === 'threads') renderThreads();
  else if (t === 'map') renderMap(animate && !S.mapDrawn), (S.mapDrawn = true);
  else if (t === 'saved') renderSaved();
  else if (t === 'index') renderIndex();
}
function showTab(t, sub) {
  const changed = S.tab !== t || (t === 'threads' && S.thread !== sub);
  S.tab = t;
  if (t === 'threads') S.thread = sub && D.T[sub] ? sub : null;
  $('#nav').value = t;
  TABS.forEach((k) => { views[k].hidden = k !== t; });
  renderTab(t, changed);
  if (changed) {
    window.scrollTo(0, 0);
    gsap.fromTo(views[t], { opacity: 0, y: 8 }, { opacity: 1, y: 0, ...spring.arrive, clearProps: 'opacity,transform' });
  }
}

// ---------- reader ----------
const reader = $('#reader'), rBody = $('#rBody'), rTop = $('#rTop'), rBar = $('#rBar'), browse = $('#browse');
let cur = null;          // { id, ctx, seq, idx }
let pendingSrc = null;   // element the reader grows from
let pushed = false;      // did we push a history entry to open the reader?

function sequence(ctx) {
  if (ctx.kind === 'thread' && D.T[ctx.key]) return D.T[ctx.key].steps.map((s) => s.prophecyId).filter((id) => D.byId.has(id));
  if (ctx.kind === 'saved') return saved.filter((id) => D.byId.has(id));
  if (ctx.kind === 'map') return D.P.filter((p) => S.mapCat === 'all' || p.category === S.mapCat).map((p) => p.id);
  return filtered().map((p) => p.id);
}
const ctxHash = (ctx) => (ctx.kind === 'thread' ? `/thread/${ctx.key}` : ctx.kind === 'saved' ? '/saved' : ctx.kind === 'map' ? '/map' : '');
const hashFor = (c) => `#/read/${c.id}${ctxHash(c.ctx)}`;

function openReader(id, ctx, src, stepIdx) {
  pendingSrc = src || null;
  pushed = true;
  cur = { pendingStep: stepIdx };
  location.hash = `#/read/${id}${ctxHash(ctx)}`;
}

function showReader(id, ctx) {
  let seq = sequence(ctx);
  let idx = cur?.pendingStep ?? seq.indexOf(id);
  if (seq[idx] !== id) idx = seq.indexOf(id);
  if (idx < 0) { ctx = { kind: 'all' }; seq = D.P.map((p) => p.id); idx = seq.indexOf(id); }
  const wasOpen = !reader.hidden;
  cur = { id, ctx, seq, idx };
  renderReader();
  if (!wasOpen) animateOpen(pendingSrc);
  pendingSrc = null;
  markRead(id);
}

function positionLabel() {
  const { ctx, idx, seq } = cur;
  if (ctx.kind === 'thread') return `${D.T[ctx.key].title} · step ${idx + 1} of ${seq.length}`;
  if (ctx.kind === 'saved') return `Saved · ${idx + 1} of ${seq.length}`;
  return `${idx + 1} of ${seq.length}`;
}

function renderReader() {
  const p = D.byId.get(cur.id);
  const nextP = D.byId.get(cur.seq[cur.idx + 1]);
  const step = cur.ctx.kind === 'thread' ? D.T[cur.ctx.key].steps[cur.idx] : null;
  rBody.innerHTML = `<div class="r-in">
    ${step ? `<div class="r-step"><span class="kicker">${esc(step.stage)}</span><p>${esc(step.note)}</p></div>` : ''}
    <p class="kicker"><span class="dot c-${esc(p.category)}"></span>${esc(p.categoryLabel)}<span aria-hidden="true">·</span>${esc(p.type)}</p>
    <h2 class="r-title" id="rTitle" tabindex="-1">${esc(p.title)}</h2>
    <p class="r-meta">${esc(p.eraGap)} · ${Number(p.votes).toLocaleString()} votes</p>
    <section class="passage" aria-label="Promise">
      <p class="p-label">Promise</p>
      <h3 class="p-ref">${esc(p.ot.ref)} <small>${esc(p.ot.author)}</small></h3>
      <blockquote class="p-text">${highlight(p.ot.text, p.ot.keyPhrase)}</blockquote>
      <p class="p-context">${esc(p.ot.context)}</p>
    </section>
    <section class="passage" aria-label="Fulfilment">
      <p class="p-label">Fulfilment</p>
      <h3 class="p-ref">${esc(p.nt.ref)} <small>${esc(p.nt.author)}</small></h3>
      <blockquote class="p-text">${highlight(p.nt.text, p.nt.keyPhrase)}</blockquote>
      <p class="p-context">${esc(p.nt.context)}</p>
    </section>
    <section class="why" aria-label="Why they connect">
      <p class="p-label">Why they connect</p>
      <p>${esc(p.bridge)}</p>
    </section>
    <div class="motifs" aria-label="Motifs">${p.keywords.map((k) => `<fvl-tag data-kw="${esc(k)}" tabindex="0" role="button">${esc(k)}</fvl-tag>`).join('')}</div>
    <div class="r-tools">
      <fvl-button variant="tertiary" size="sm" data-cite><fvl-icon name="copy"></fvl-icon>Copy citation</fvl-button>
      <fvl-button variant="tertiary" size="sm" data-onmap><fvl-icon name="map"></fvl-icon>Show on map</fvl-button>
    </div>
    ${nextP ? `<button type="button" class="upnext" data-next><span><small>Up next</small><b>${esc(nextP.title)}</b></span><fvl-icon name="arrow-right" size="md"></fvl-icon></button>` : ''}
  </div>`;
  $('#rPos').textContent = positionLabel();
  const isSaved = saved.includes(p.id);
  const star = $('#star');
  star.setAttribute('aria-pressed', String(isSaved));
  star.setAttribute('aria-label', isSaved ? 'Remove from saved' : 'Save');
  star.variant = isSaved ? 'secondary' : 'tertiary';
  $('#prev').disabled = cur.idx <= 0;
  const last = cur.idx >= cur.seq.length - 1;
  const next = $('#next');
  next.textContent = last ? 'Finish' : 'Next';
  next.setAttribute('aria-label', last ? 'Finish and go back' : `Next: ${nextP?.title || ''}`);
}

function insetFor(r) {
  const rad = token('--fvl-radius-container') || '12px';
  return `inset(${Math.max(0, r.top)}px ${Math.max(0, innerWidth - r.right)}px ${Math.max(0, innerHeight - r.bottom)}px ${Math.max(0, r.left)}px round ${rad})`;
}
function animateOpen(src) {
  root.classList.add('reading');
  browse.inert = true;
  reader.hidden = false;
  reader.scrollTop = 0;
  showBars(true);
  const r = src?.isConnected ? src.getBoundingClientRect() : null;
  if (r && !reduced) {
    gsap.fromTo(reader, { clipPath: insetFor(r) }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', ...spring.settle, clearProps: 'clipPath' });
  } else {
    gsap.fromTo(reader, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.2, clearProps: 'opacity' });
  }
  gsap.fromTo($$('.r-in > *', rBody), { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.035, ...spring.arrive, delay: r ? 0.08 : 0, clearProps: 'opacity,transform' });
  gsap.fromTo([rTop, rBar], { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.3, delay: 0.12, clearProps: 'opacity' });
  $('#rTitle').focus({ preventScroll: true });
}
function closeReader() {
  if (reader.hidden) return;
  const id = cur?.id;
  root.classList.remove('reading');
  browse.inert = false;
  renderTab(S.tab, false);
  const row = id && views[S.tab] && $(`.row[data-id="${CSS.escape(id)}"]`, views[S.tab]);
  const done = () => {
    reader.hidden = true;
    gsap.set(reader, { clearProps: 'clipPath,opacity,transform' });
    if (row) {
      row.focus({ preventScroll: true });
      gsap.fromTo(row, { backgroundColor: token('--fvl-color-bg-selected') }, { backgroundColor: token('--fvl-color-bg-surface'), ...spring.settle, clearProps: 'backgroundColor' });
    }
  };
  if (row && !reduced) {
    row.scrollIntoView({ block: 'center' });
    gsap.to($$('.r-in > *', rBody).concat([rTop, rBar]), { opacity: 0, ...quick });
    gsap.to(reader, { clipPath: insetFor(row.getBoundingClientRect()), ...spring.carve, onComplete: done });
  } else {
    gsap.to(reader, { opacity: 0, duration: reduced ? 0 : 0.2, onComplete: done });
  }
}
function back() {
  if (pushed) { pushed = false; history.back(); }
  else location.replace('#/' + (S.tab || 'bridges'));
}

function go(d) {
  if (!cur) return;
  const ni = cur.idx + d;
  if (ni < 0) return;
  if (ni >= cur.seq.length) { back(); return; }
  const out = $$('.r-in > *', rBody);
  gsap.to(out, {
    opacity: 0, x: -24 * d, ...quick, onComplete: () => {
      cur.idx = ni; cur.id = cur.seq[ni];
      history.replaceState(history.state, '', hashFor(cur));
      renderReader();
      markRead(cur.id);
      reader.scrollTop = 0;
      showBars();
      gsap.fromTo($$('.r-in > *', rBody), { opacity: 0, x: 24 * d }, { opacity: 1, x: 0, stagger: 0.02, ...spring.arrive, clearProps: 'opacity,transform' });
      $('#rTitle').focus({ preventScroll: true });
    },
  });
}

function markRead(id) {
  readSet.add(id); store.set('sb_read_v1', [...readSet]);
  lastRead = id; store.set('sb_last_v1', id);
}
function toggleSave(id) {
  const i = saved.indexOf(id);
  if (i > -1) { saved.splice(i, 1); toast('Removed from saved'); } else { saved.push(id); toast('Saved'); }
  store.set('scripturebridge_saved_v2', saved);
  if (!reader.hidden && cur?.id === id) renderReaderChrome();
}
function renderReaderChrome() {
  const isSaved = saved.includes(cur.id);
  const star = $('#star');
  star.setAttribute('aria-pressed', String(isSaved));
  star.setAttribute('aria-label', isSaved ? 'Remove from saved' : 'Save');
  star.variant = isSaved ? 'secondary' : 'tertiary';
  gsap.fromTo(star, { scale: 0.85 }, { scale: 1, ...spring.arrive, clearProps: 'transform' });
}

// Bars step aside while reading down, return on the way up or at the end.
let lastY = 0, barsHidden = false;
function showBars(instant) {
  if (!barsHidden && !instant) return;
  barsHidden = false;
  gsap.to(rTop, { yPercent: 0, ...(instant ? { duration: 0 } : spring.settle) });
  gsap.to(rBar, { yPercent: 0, ...(instant ? { duration: 0 } : spring.settle) });
}
function hideBars() {
  if (barsHidden) return;
  barsHidden = true;
  gsap.to(rTop, { yPercent: -100, ...spring.settle });
  gsap.to(rBar, { yPercent: 100, ...spring.settle });
}
reader.addEventListener('scroll', () => {
  const y = reader.scrollTop, dy = y - lastY;
  lastY = y;
  const atEnd = y + reader.clientHeight >= reader.scrollHeight - 48;
  if (atEnd || y < 48 || dy < -8) showBars();
  else if (dy > 8) hideBars();
}, { passive: true });

// Swipe left / right between bridges (touch only, horizontal-dominant).
let touch = null;
rBody.addEventListener('touchstart', (e) => { const t = e.touches[0]; touch = { x: t.clientX, y: t.clientY, t: Date.now() }; }, { passive: true });
rBody.addEventListener('touchend', (e) => {
  if (!touch) return;
  const t = e.changedTouches[0], dx = t.clientX - touch.x, dy = t.clientY - touch.y, dt = Date.now() - touch.t;
  touch = null;
  if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 2 && dt < 700 && !getSelection()?.toString()) go(dx < 0 ? 1 : -1);
}, { passive: true });

// ---------- routing ----------
function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'read' && D.byId.has(parts[1])) {
    const ctx = parts[2] === 'thread' ? { kind: 'thread', key: parts[3] } : parts[2] === 'saved' ? { kind: 'saved' } : parts[2] === 'map' ? { kind: 'map' } : { kind: 'list' };
    if (!S.tab) showTab(ctx.kind === 'thread' ? 'threads' : ctx.kind === 'saved' ? 'saved' : ctx.kind === 'map' ? 'map' : 'bridges', ctx.key);
    showReader(parts[1], ctx);
    return;
  }
  const tab = TABS.includes(parts[0]) ? parts[0] : 'bridges';
  if (!reader.hidden) {
    if (S.tab !== tab || (tab === 'threads' && S.thread !== (parts[1] || null))) { reader.hidden = true; root.classList.remove('reading'); browse.inert = false; showTab(tab, parts[1]); }
    else closeReader();
    pushed = false;
    return;
  }
  showTab(tab, parts[1]);
}
window.addEventListener('hashchange', route);

// ---------- events ----------
$('#nav').addEventListener('change', (e) => { const v = e.target.value; if (TABS.includes(v)) location.hash = '#/' + v; });
let qTimer;
$('#q').addEventListener('input', (e) => { clearTimeout(qTimer); qTimer = setTimeout(() => { S.q = (e.target.value || '').trim(); renderBridges(); }, 120); });
$('#cats').addEventListener('change', (e) => { const v = e.target.getAttribute?.('value'); if (!v) return; S.cat = e.target.selected || v === 'all' ? v : 'all'; syncChips($('#cats'), S.cat); renderBridges(); });
$('#mapCats').addEventListener('change', (e) => { const v = e.target.getAttribute?.('value'); if (!v) return; S.mapCat = e.target.selected || v === 'all' ? v : 'all'; syncChips($('#mapCats'), S.mapCat); renderMap(true); });
$('#types').addEventListener('change', (e) => { const v = e.target.getAttribute?.('value'); if (!v) return; S.type = e.target.selected || v === 'all' ? v : 'all'; syncChips($('#types'), S.type); renderBridges(); });
$('#filterBtn').addEventListener('click', () => $('#books').show());
$('#clearBtn').addEventListener('click', resetFilters);
$('#applyBtn').addEventListener('click', () => $('#books').close());
$('#bookGroups').addEventListener('click', (e) => {
  const b = e.target.closest('.book'); if (!b) return;
  S.book = b.dataset.book || null; syncBookUI(); renderBridges();
  gsap.fromTo(b, { scale: 0.96 }, { scale: 1, ...spring.arrive, clearProps: 'transform' });
});
let iqTimer;
$('#iq').addEventListener('input', (e) => { clearTimeout(iqTimer); iqTimer = setTimeout(() => { S.iq = (e.target.value || '').trim(); renderIndex(); }, 150); });
$('#minVotes').addEventListener('input', (e) => { S.imin = Number(e.target.value) || 0; $('#minLabel').textContent = `Minimum votes: ${S.imin}`; renderIndex(); });
$('#importBtn').addEventListener('click', () => $('#file').click());
$('#file').addEventListener('change', (e) => { const f = e.target.files?.[0]; if (f) importFile(f); e.target.value = ''; });

// Browse: one delegated handler for rows and actions.
browse.addEventListener('click', (e) => {
  const link = e.target.closest('[data-go]'); if (link) { location.hash = link.dataset.go; return; }
  const th = e.target.closest('[data-thread]'); if (th) { location.hash = '#/threads/' + th.dataset.thread; return; }
  const rt = e.target.closest('[data-read-thread]');
  if (rt) { const k = rt.dataset.readThread; const first = D.T[k].steps[0]; openReader(first.prophecyId, { kind: 'thread', key: k }, $('#view-threads .row[data-step="0"]'), 0); return; }
  if (e.target.closest('[data-read-saved]')) { const ids = sequence({ kind: 'saved' }); if (ids.length) openReader(ids[0], { kind: 'saved' }, $(`#view-saved .row[data-id="${CSS.escape(ids[0])}"]`)); return; }
  if (e.target.closest('[data-copy-md]')) {
    const md = saved.map((id) => D.byId.get(id)).filter(Boolean).map((p) => `### ${p.title} (${p.type})\n- **${p.ot.ref}:** "${p.ot.text}"\n- **${p.nt.ref}:** "${p.nt.text}"\n- **Why they connect:** ${p.bridge}`).join('\n\n');
    copy(md, 'Copied as Markdown'); return;
  }
  const row = e.target.closest('.row[data-id], .continue[data-id]');
  if (!row) return;
  const id = row.dataset.id;
  if (S.tab === 'threads' && row.dataset.step != null) openReader(id, { kind: 'thread', key: S.thread }, row, Number(row.dataset.step));
  else if (S.tab === 'saved') openReader(id, { kind: 'saved' }, row);
  else if (S.tab === 'map') openReader(id, { kind: 'map' }, row);
  else if (S.tab === 'index') { resetFilters(); openReader(id, { kind: 'list' }, row); }
  else openReader(id, { kind: 'list' }, row);
});
$('#arc').addEventListener('click', (e) => { const a = e.target.closest('[data-arc]'); if (a) { S.mapSel = a.dataset.arc; renderMapPreview(); } });
$('#arc').addEventListener('keydown', (e) => { const a = e.target.closest('[data-arc]'); if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); S.mapSel = a.dataset.arc; renderMapPreview(); } });

// Reader controls.
$('#back').addEventListener('click', back);
$('#prev').addEventListener('click', () => go(-1));
$('#next').addEventListener('click', () => go(1));
$('#star').addEventListener('click', () => cur && toggleSave(cur.id));
rBody.addEventListener('click', (e) => {
  if (e.target.closest('[data-next]')) { go(1); return; }
  if (e.target.closest('[data-cite]')) {
    const p = D.byId.get(cur.id);
    copy(`${p.title} (${p.type})\n${p.ot.ref}: "${p.ot.text}"\n${p.nt.ref}: "${p.nt.text}"\nWhy they connect: ${p.bridge}`, 'Citation copied'); return;
  }
  if (e.target.closest('[data-onmap]')) { S.mapSel = cur.id; S.mapCat = 'all'; syncChips($('#mapCats'), 'all'); pushed = false; location.hash = '#/map'; return; }
  const kw = e.target.closest('[data-kw]');
  if (kw) { resetFilters(); S.q = kw.dataset.kw; $('#q').value = S.q; pushed = false; location.hash = '#/bridges'; renderBridges(); }
});
rBody.addEventListener('keydown', (e) => { const kw = e.target.closest('[data-kw]'); if (kw && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); kw.click(); } });
document.addEventListener('keydown', (e) => {
  if (reader.hidden || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  else if (e.key === 'Escape') { e.preventDefault(); back(); }
});
window.addEventListener('scroll', () => $('#top').classList.toggle('scrolled', scrollY > 4), { passive: true });

// ---------- start ----------
load().then(() => {
  buildFilters();
  syncBookUI();
  route();
}).catch((err) => {
  $('#count').textContent = 'Could not load the bridges. Check your connection and reload.';
  console.error(err);
});
