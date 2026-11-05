// Slipbox — a Luhmann-style zettelkasten for the phone.
// Method: Bob Doto, "A System for Writing" (2024). Capture → main notes → connections → ways in → writing.
// Everything is stored on this device (localStorage). Back up from More.

const KEY = 'slipbox_v1';
const html = document.documentElement;
const view = document.getElementById('view');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2, 9) + now().toString(36).slice(-5);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const coarse = matchMedia('(pointer: coarse)').matches;

// ---------------------------------------------------------------- store
const blank = () => ({ v: 1, notes: {}, inbox: [], sources: {}, maps: {}, drafts: {}, sections: {}, meta: { created: now(), backupAt: 0 } });
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return Object.assign(blank(), s); } catch (e) { /* fall through */ }
  return blank();
}
let S = load();
let persistAsked = false;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save on this device. Export a backup from More.', { warn: true }); }
  if (!persistAsked && navigator.storage?.persist) { persistAsked = true; navigator.storage.persist().catch(() => {}); }
  updateCount();
}
let saveT;
const saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(save, 400); };
addEventListener('pagehide', () => { clearTimeout(saveT); save(); });

// ---------------------------------------------------------------- addresses (folgezettel)
// An address like 1.2a1 records which idea a note grew from. It is a street address, not a category or a hierarchy.
const Z = {
  tok: (z) => (String(z).toLowerCase().match(/\d+|[a-z]+/g) || []).map((t) => (/\d/.test(t) ? +t : t)),
  fmt: (t) => (t.length ? String(t[0]) + (t.length > 1 ? '.' + t.slice(1).join('') : '') : ''),
  norm: (z) => Z.fmt(Z.tok(z)),
  valid(z) {
    const t = Z.tok(z);
    if (t.length < 2 || typeof t[0] !== 'number' || typeof t[1] !== 'number' || t[0] < 1) return false;
    for (let i = 2; i < t.length; i++) if (typeof t[i] === typeof t[i - 1]) return false;
    return Z.fmt(t) === String(z).toLowerCase().replace(/\s+/g, '');
  },
  cmp(a, b) {
    const A = Z.tok(a), B = Z.tok(b);
    for (let i = 0; i < Math.max(A.length, B.length); i++) {
      if (i >= A.length) return -1;
      if (i >= B.length) return 1;
      const x = A[i], y = B[i];
      if (typeof x !== typeof y) return typeof x === 'number' ? -1 : 1;
      if (typeof x === 'number') { if (x !== y) return x - y; } else { if (x.length !== y.length) return x.length - y.length; if (x !== y) return x < y ? -1 : 1; }
    }
    return 0;
  },
  incL(s) { // a → b … z → aa
    const a = s.split('');
    for (let i = a.length - 1; i >= 0; i--) { if (a[i] !== 'z') { a[i] = String.fromCharCode(a[i].charCodeAt(0) + 1); return a.join(''); } a[i] = 'a'; }
    return 'a' + a.join('');
  },
  inc: (x) => (typeof x === 'number' ? x + 1 : Z.incL(x)),
  free(t, except) { const z = Z.fmt(t); const n = byZid(z); return !n || n.uid === except; },
  child(z, except) { // a note that continues this one: 1.2 → 1.2a, 1.2a → 1.2a1
    const t = Z.tok(z), last = t[t.length - 1];
    const c = [...t, t.length === 1 ? 1 : typeof last === 'number' ? 'a' : 1];
    while (!Z.free(c, except)) c[c.length - 1] = Z.inc(c[c.length - 1]);
    return Z.fmt(c);
  },
  next(z, except) { // a new idea on the same subject that doesn't follow from this note: 1.2 → 1.3
    const t = Z.tok(z);
    do t[t.length - 1] = Z.inc(t[t.length - 1]); while (!Z.free(t, except));
    return Z.fmt(t);
  },
  newArea() { // nothing to do with anything yet: the next first number, 2.1, 3.1 …
    let max = 0;
    for (const n of notes()) max = Math.max(max, Z.tok(n.zid)[0] || 0);
    return `${max + 1}.1`;
  },
  depth: (z) => Z.tok(z).length - 1,
  area: (z) => Z.tok(z)[0],
  under(z, of) { const a = Z.tok(z), b = Z.tok(of); return a.length > b.length && b.every((x, i) => x === a[i]); },
};

// ---------------------------------------------------------------- queries
const notes = () => Object.values(S.notes);
const sorted = () => notes().sort((a, b) => Z.cmp(a.zid, b.zid));
const byZid = (z) => { const k = Z.norm(z); return notes().find((n) => n.zid === k); };
const label = (n) => (n ? `${n.zid} ${n.title}` : 'missing note');
const areaName = (a) => S.sections[a] || '';
function parentOf(n) {
  const t = Z.tok(n.zid);
  for (let k = t.length - 1; k >= 2; k--) { const p = byZid(Z.fmt(t.slice(0, k))); if (p) return p; }
  return null;
}
const childrenOf = (n) => { const d = Z.depth(n.zid) + 1; return sorted().filter((m) => Z.depth(m.zid) === d && Z.under(m.zid, n.zid)); };
function nextBeside(n) {
  const t = Z.tok(n.zid), pre = t.slice(0, -1), d = t.length;
  return sorted().find((m) => { const u = Z.tok(m.zid); return u.length === d && pre.every((x, i) => x === u[i]) && Z.cmp(m.zid, n.zid) > 0; }) || null;
}
const refsIn = (text) => [...String(text || '').matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => byZid(m[1].trim())).filter(Boolean);
function backlinks(n) {
  const out = [];
  for (const m of notes()) {
    if (m.uid === n.uid) continue;
    const l = (m.links || []).find((x) => x.to === n.uid);
    if (l) out.push({ m, why: l.why });
    else if (refsIn(m.body).some((r) => r.uid === n.uid)) out.push({ m, why: '', inline: true });
  }
  return out.sort((a, b) => Z.cmp(a.m.zid, b.m.zid));
}
const descendants = (n) => notes().filter((m) => Z.under(m.zid, n.zid)).length;
const sourceLabel = (s) => (s ? s.title + (s.author ? ` — ${s.author}` : '') : '');
function keywords() {
  const map = new Map();
  for (const n of sorted()) for (const k of n.kw || []) {
    const key = k.toLowerCase();
    if (!map.has(key)) map.set(key, { name: k, notes: [] });
    map.get(key).notes.push(n);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------- small helpers
const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  fwd: '<path d="m9 18 6-6-6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  branch: '<circle cx="6" cy="18" r="2"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 8v8M18 10c0 4-4 5-12 6"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>',
  shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  hub: '<circle cx="12" cy="12" r="2.5"/><circle cx="5" cy="5" r="1.8"/><circle cx="19" cy="5" r="1.8"/><circle cx="5" cy="19" r="1.8"/><circle cx="19" cy="19" r="1.8"/><path d="m6.4 6.4 3.8 3.8M17.6 6.4l-3.8 3.8M6.4 17.6l3.8-3.8M17.6 17.6l-3.8-3.8"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
  upload: '<path d="M12 15V3M7 8l5-5 5 5M4 20h16"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  box: '<rect x="3.5" y="8" width="17" height="12" rx="2"/><path d="M6 5h12M8.5 2.5h7"/>',
  inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z"/>',
  book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14"/><path d="M9 7h7"/>',
  pen: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
};
const I = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
function ago(t) {
  const s = (now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86400);
  if (d < 14) return d === 1 ? 'yesterday' : `${d} days ago`;
  return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: d > 300 ? 'numeric' : undefined });
}
const dayStr = (t) => new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
function rich(text) {
  return esc(text).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, '<br>').replace(/\[\[([^\]]+)\]\]/g, (m, z) => {
    const n = byZid(z.trim());
    return n ? `<a class="ref" href="#/n/${n.uid}">${z}</a>` : `<span class="ref missing" title="No note with this address">${z}</span>`;
  })}</p>`).join('');
}
function hl(text, q) {
  const t = esc(text);
  if (!q) return t;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return t.replace(re, '<mark>$1</mark>');
}
const firstSentence = (s) => { const t = String(s || '').trim().split(/(?<=[.!?])\s|\n/)[0] || ''; return t.length > 100 ? t.slice(0, 97).trimEnd() + '…' : t.replace(/[.]$/, ''); };
const go = (h) => { if (location.hash === h) render(); else location.hash = h; };
const replaceTo = (h) => { history.replaceState(null, '', h); render(); };
function download(name, text, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
const safeName = (s) => (String(s || 'untitled').replace(/[^\p{L}\p{N} _-]+/gu, '').trim().slice(0, 60) || 'untitled');

// toasts
function toast(msg, opt = {}) {
  const box = $('#toasts'), el = document.createElement('div');
  el.className = 'toast' + (opt.warn ? ' warn' : '');
  el.innerHTML = `<span>${esc(msg)}</span>${opt.label ? `<button type="button">${esc(opt.label)}</button>` : ''}`;
  if (opt.label) el.querySelector('button').onclick = () => { el.remove(); opt.fn(); };
  box.appendChild(el);
  while (box.children.length > 2) box.firstChild.remove();
  setTimeout(() => el.remove(), opt.label ? 6000 : 3200);
}

// bottom sheet
const sheet = $('#sheet');
let sheetDone = null;
function openSheet(title, body, mount) {
  return new Promise((res) => {
    if (sheetDone) sheetDone(null);
    sheet.innerHTML = `<div class="grab"></div><div class="sh-head"><h2>${esc(title)}</h2><button class="btn ghost icon sm" type="button" data-sh-close aria-label="Close">${I('x')}</button></div><div class="sh-body">${body}</div>`;
    sheetDone = res;
    if (!sheet.open) sheet.showModal();
    html.classList.add('sheet-open');
    if (mount) mount(sheet);
    else if (coarse) sheet.querySelector('[data-sh-close]').blur();
  });
}
function closeSheet(v = null) {
  const r = sheetDone; sheetDone = null;
  if (sheet.open) sheet.close();
  html.classList.remove('sheet-open', 'typing');
  if (r) r(v);
}
sheet.addEventListener('close', () => { if (sheet.open) return; html.classList.remove('sheet-open'); if (sheetDone) { const r = sheetDone; sheetDone = null; r(null); } });
sheet.addEventListener('click', (e) => { if (e.target === sheet || e.target.closest('[data-sh-close]')) closeSheet(null); });

// pick a note
function pickNote(title = 'Choose a note', exclude = []) {
  const ex = new Set(exclude);
  const all = sorted().filter((n) => !ex.has(n.uid));
  if (!all.length) { toast('No other notes yet.'); return Promise.resolve(null); }
  const rows = (q) => {
    const k = q.trim().toLowerCase();
    const list = k ? all.filter((n) => (n.zid + ' ' + n.title + ' ' + n.body + ' ' + (n.kw || []).join(' ')).toLowerCase().includes(k)) : all;
    return list.length ? list.slice(0, 200).map((n) => `<button type="button" class="item" data-pick="${n.uid}"><span class="zid">${esc(n.zid)}</span><span class="t"><b>${hl(n.title, k)}</b></span></button>`).join('') : '<p class="muted small" style="padding:1rem">Nothing matches.</p>';
  };
  return openSheet(title, `<div class="search">${I('search')}<input type="search" id="pickQ" placeholder="Search titles, text, addresses" autocomplete="off"></div><div class="list" id="pickList">${rows('')}</div>`, (sh) => {
    const q = sh.querySelector('#pickQ');
    q.addEventListener('input', () => { sh.querySelector('#pickList').innerHTML = rows(q.value); });
    sh.querySelector('#pickList').addEventListener('click', (e) => { const b = e.target.closest('[data-pick]'); if (b) closeSheet(b.dataset.pick); });
    if (!coarse) q.focus(); else sh.querySelector('[data-sh-close]').blur();
  });
}
// ask for one line of text (why a link was made, a name…)
function askText(title, { hint = '', value = '', placeholder = '', okLabel = 'Save', multiline = true } = {}) {
  return openSheet(title, `${hint ? `<p class="tip">${hint}</p>` : ''}${multiline ? `<textarea id="askT" rows="3" data-grow placeholder="${esc(placeholder)}">${esc(value)}</textarea>` : `<input id="askT" value="${esc(value)}" placeholder="${esc(placeholder)}" autocomplete="off">`}
    <div class="row-btns" style="margin-top:0.75rem"><button class="btn primary wide" type="button" id="askOk">${esc(okLabel)}</button></div>`, (sh) => {
    const t = sh.querySelector('#askT');
    sh.querySelector('#askOk').onclick = () => closeSheet(t.value.trim());
    if (!multiline) t.addEventListener('keydown', (e) => { if (e.key === 'Enter') closeSheet(t.value.trim()); });
    setTimeout(() => t.focus(), 60);
  });
}
function choose(title, options, intro = '') {
  return openSheet(title, `${intro ? `<p class="tip">${intro}</p>` : ''}<div class="list">${options.map((o, i) => `<button type="button" class="item" data-choice="${i}">${o.icon ? I(o.icon) : ''}<span class="t"><b>${esc(o.label)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span></button>`).join('')}</div>`, (sh) => {
    sh.querySelector('.list').addEventListener('click', (e) => { const b = e.target.closest('[data-choice]'); if (b) closeSheet(options[+b.dataset.choice].value); });
  });
}

// ---------------------------------------------------------------- views
const top = (title, { back, right = '' } = {}) => `<div class="top">${back ? `<a class="btn ghost icon back" href="${back}" aria-label="Back">${I('back')}</a>` : ''}<h1>${title}</h1>${right}</div>`;
const moreBtn = `<a class="btn ghost icon" href="#/more" aria-label="More: backup, help">${I('more')}</a>`;
const empty = (icon, h, p, btns = '') => `<div class="empty">${I(icon)}<h3>${h}</h3><p>${p}</p>${btns ? `<div class="row-btns">${btns}</div>` : ''}</div>`;

// Inbox — fleeting notes wait here until they become main notes, sleep, or go.
function vInbox(sleeping) {
  const inbox = S.inbox.filter((i) => !i.sleep), sleep = S.inbox.filter((i) => i.sleep);
  const items = (sleeping ? sleep : inbox).slice().sort((a, b) => b.at - a.at);
  const week = 7 * 864e5, old = !sleeping && inbox.filter((i) => now() - i.at > week).length;
  const stale = sleeping && sleep.filter((i) => now() - (i.sleptAt || i.at) > 90 * 864e5).length;
  return `${top('Inbox', { right: moreBtn })}
  ${sleeping ? '' : `<div class="card capture"><label class="sr" for="cap">Capture a thought</label>
    <textarea id="cap" rows="3" data-grow placeholder="What's on your mind? Get it down. Sort it later."></textarea>
    <div class="bar"><span class="tip" style="margin:0">Rough is fine.</span><button class="btn primary sm" type="button" data-act="capture">Save to Inbox</button></div></div>
  <div style="height:1rem"></div>`}
  <div class="seg" role="group" aria-label="Inbox or sleeping">
    <a href="#/inbox" ${sleeping ? '' : 'aria-current="page"'}>${I('inbox')}Inbox <span class="n">${inbox.length}</span></a>
    <a href="#/inbox/sleeping" ${sleeping ? 'aria-current="page"' : ''}>${I('moon')}Sleeping <span class="n">${sleep.length}</span></a>
  </div>
  ${old ? `<div class="banner">${I('info')}<div>${old === 1 ? 'One thought has' : `${old} thoughts have`} waited over a week. Process a few: keep what still interests you.</div></div>` : ''}
  ${stale ? `<div class="banner">${I('moon')}<div>Some thoughts have slept for three months. Wake what matters; let the rest go.</div></div>` : ''}
  ${items.length ? items.map((i) => `<div class="card fleet"><p>${esc(i.text)}</p><div class="meta">${ago(i.at)}${i.sleep ? ` · asleep since ${ago(i.sleptAt || i.at)}` : ''}</div>
    <div class="row-btns"><button class="btn primary sm" type="button" data-act="process" data-id="${i.uid}">${I('plus')}Make note</button>
    <button class="btn sm" type="button" data-act="sleep" data-id="${i.uid}">${i.sleep ? `${I('sun')}Wake` : `${I('moon')}Sleep`}</button>
    <button class="btn ghost sm icon" type="button" data-act="discard" data-id="${i.uid}" aria-label="Let it go">${I('trash')}</button></div></div>`).join('')
    : sleeping ? empty('moon', 'Nothing sleeping', 'Thoughts you keep passing over, but aren\'t ready to drop, can sleep here. Check them every few months.')
      : empty('inbox', 'Inbox is clear', 'What you capture lands here. Later, turn each thought into a main note, put it to sleep, or let it go.')}
  ${!sleeping && items.length ? '<p class="tip" style="margin-top:1rem">Tasks and reminders aren\'t ideas. Let them go once they\'re handled elsewhere.</p>' : ''}`;
}

// Box — every main note in address order. The long addresses show where thinking has grown.
let boxQ = '';
function boxList() {
  const all = sorted(), q = boxQ.trim().toLowerCase();
  if (!all.length) return '';
  if (q) {
    const hits = all.filter((n) => (n.zid + ' ' + n.title + ' ' + n.body + ' ' + (n.kw || []).join(' ') + ' ' + (n.quote || '')).toLowerCase().includes(q));
    return hits.length ? `<p class="tip">${hits.length} found</p><div class="list">${hits.map((n) => `<a class="zrow" href="#/n/${n.uid}"><span class="zid">${esc(n.zid)}</span><span class="t">${hl(n.title, q)}${!n.title.toLowerCase().includes(q) ? `<br><small class="muted">${hl(snippet(n.body + ' ' + (n.quote || ''), q), q)}</small>` : ''}</span></a>`).join('')}</div>` : '<p class="muted" style="padding:1rem 0">Nothing matches.</p>';
  }
  const groups = new Map();
  for (const n of all) { const a = Z.area(n.zid); if (!groups.has(a)) groups.set(a, []); groups.get(a).push(n); }
  return [...groups].map(([a, ns]) => `<div class="area"><span class="num">${a}</span><b>${esc(areaName(a)) || '<span class="muted">Unnamed area</span>'}</b><button class="btn ghost sm" type="button" data-act="name-area" data-a="${a}">${areaName(a) ? 'Rename' : 'Name'}</button></div>
    <div class="list">${ns.map((n) => `<a class="zrow" href="#/n/${n.uid}" style="--d:${Math.min(Z.depth(n.zid) - 1, 6)}"><span class="zid">${esc(n.zid)}</span><span class="t">${esc(n.title)}</span></a>`).join('')}</div>`).join('');
}
function snippet(t, q) { const i = t.toLowerCase().indexOf(q); if (i < 0) return t.slice(0, 90); const s = Math.max(0, i - 40); return (s ? '…' : '') + t.slice(s, i + q.length + 50) + '…'; }
function vBox() {
  const n = notes().length;
  const nudge = n >= 10 && now() - (S.meta.backupAt || 0) > 14 * 864e5;
  return `${top('Box', { right: `<a class="btn primary sm" href="#/new">${I('plus')}Note</a>${moreBtn}` })}
  ${n ? `<p class="lead">${n} main note${n === 1 ? '' : 's'}. Addresses record where each idea grew from, not a category.</p>
  ${nudge ? `<div class="banner">${I('download')}<div>Your notes live only on this phone. Save a backup now and then.</div><button class="btn sm primary" type="button" data-act="export">Back up</button></div>` : ''}
  <div class="search">${I('search')}<input type="search" id="boxQ" value="${esc(boxQ)}" placeholder="Search notes" autocomplete="off" aria-label="Search notes"></div>
  <div id="boxList">${boxList()}</div>`
    : empty('box', 'Your box is empty', 'Main notes live here: one idea each, in your own words, linked to others. Start by capturing a thought in Inbox, or try the examples to see how it works.',
      `<a class="btn primary" href="#/new">${I('plus')}Write a main note</a><button class="btn" type="button" data-act="examples">Try with examples</button>`)}`;
}

// A main note.
function vNote(id) {
  const n = S.notes[id];
  if (!n) return `${top('Not found', { back: '#/box' })}<p class="muted">This note no longer exists.</p>`;
  const list = sorted(), i = list.findIndex((x) => x.uid === id), prev = list[i - 1], next = list[i + 1];
  const par = parentOf(n), kids = childrenOf(n), beside = nextBeside(n), back = backlinks(n);
  const src = n.src && S.sources[n.src.id];
  const maps = Object.values(S.maps).filter((m) => m.items.some((x) => x.to === id));
  const drafts = (n.used || []).map((d) => S.drafts[d]).filter(Boolean);
  const train = [
    par && { n: par, kind: 'Grew from' },
    ...kids.map((k) => ({ n: k, kind: 'Continues here' })),
    beside && { n: beside, kind: 'Next beside it' },
  ].filter(Boolean);
  const linkRow = (m, why, kind, inline) => `<a class="link" href="#/n/${m.uid}">${kind ? `<span class="kind">${kind}</span>` : ''}<span class="lt"><span class="zid">${esc(m.zid)}</span><b>${esc(m.title)}</b></span>${why ? `<p class="why">${esc(why)}</p>` : inline ? '<p class="why">Mentioned in its text</p>' : kind ? '' : '<p class="why none">No reason given for this link</p>'}</a>`;
  return `<div class="note-view">${top('', { back: '#/box', right: `<span class="grow"></span><a class="btn sm" href="#/edit/${id}">${I('edit')}Edit</a>` })}
  <div class="note-head"><div class="addr-line"><span class="zid">${esc(n.zid)}</span>${areaName(Z.area(n.zid)) ? `<span class="tag">${esc(areaName(Z.area(n.zid)))}</span>` : ''}</div><h1>${esc(n.title)}</h1></div>
  ${n.body && n.body.replace(/[.!?\s]+$/, '').toLowerCase() !== n.title.replace(/[.!?\s]+$/, '').toLowerCase() ? `<div class="body">${rich(n.body)}</div>` : ''}
  ${n.quote || src ? `<blockquote>${n.quote ? esc(n.quote) : ''}${src ? `<cite>${n.quote ? '— ' : 'Source: '}<a href="#/s/${src.uid}">${esc(sourceLabel(src))}</a>${n.src.loc ? `, ${esc(n.src.loc)}` : ''}</cite>` : ''}</blockquote>` : ''}
  ${train.length ? `<h2 class="sec">Train of thought</h2><div class="list">${train.map((x) => linkRow(x.n, '', x.kind)).join('')}</div>` : ''}
  <h2 class="sec">See also</h2>
  ${(n.links || []).length ? `<div class="list">${n.links.map((l) => S.notes[l.to] && linkRow(S.notes[l.to], l.why)).filter(Boolean).join('')}</div>` : '<p class="muted small">No links yet. Which other ideas does this one speak to?</p>'}
  ${back.length ? `<h2 class="sec">Linked from</h2><div class="list">${back.map((b) => linkRow(b.m, b.why, '', b.inline)).join('')}</div>` : ''}
  ${(n.kw || []).length ? `<h2 class="sec">In the index</h2><div class="chips">${n.kw.map((k) => `<a class="chip" href="#/views/index?k=${encodeURIComponent(k.toLowerCase())}">${esc(k)}</a>`).join('')}</div>` : ''}
  ${maps.length ? `<h2 class="sec">In hubs and structures</h2><div class="list">${maps.map((m) => `<a class="item" href="#/m/${m.uid}">${I(m.kind === 'hub' ? 'hub' : 'list')}<span class="t"><b>${esc(m.title)}</b><small>${m.kind === 'hub' ? 'Hub note' : 'Structure note'}</small></span>${I('chev', 'chev')}</a>`).join('')}</div>` : ''}
  ${drafts.length ? `<h2 class="sec">Used in</h2><div class="list">${drafts.map((d) => `<a class="item" href="#/d/${d.uid}">${I('pen')}<span class="t"><b>${esc(d.title)}</b></span>${I('chev', 'chev')}</a>`).join('')}</div>` : ''}
  <div class="actions">
    <a class="btn" href="#/new?follow=${id}&mode=branch">${I('branch')}Continue it</a>
    <button class="btn" type="button" data-act="link-add" data-id="${id}">${I('link')}Link a note</button>
    <button class="btn" type="button" data-act="map-add" data-id="${id}">${I('hub')}Add to hub…</button>
    <button class="btn" type="button" data-act="draft-add" data-id="${id}">${I('pen')}Use in writing</button>
  </div></div>
  <div class="reader-bar" role="group" aria-label="Read through the box">
    ${prev ? `<a class="btn ghost icon" href="#/n/${prev.uid}" aria-label="Previous note: ${esc(prev.zid)}">${I('back')}</a>` : `<span class="btn ghost icon" aria-hidden="true" style="opacity:.3">${I('back')}</span>`}
    <span class="pos">${i + 1} / ${list.length}</span>
    ${next ? `<a class="btn ghost icon" href="#/n/${next.uid}" aria-label="Next note: ${esc(next.zid)}">${I('fwd')}</a>` : `<span class="btn ghost icon" aria-hidden="true" style="opacity:.3">${I('fwd')}</span>`}
  </div>`;
}

// ---------------------------------------------------------------- editor (make or edit a main note)
let E = null;
function initEditor(parts, q) {
  const key = location.hash;
  if (E && E.key === key) return;
  if (parts[0] === 'edit') {
    const n = S.notes[parts[1]];
    if (!n) { E = null; return; }
    E = { key, uid: n.uid, title: n.title, body: n.body, quote: n.quote || '', src: n.src?.id || '', loc: n.src?.loc || '', links: (n.links || []).map((l) => ({ ...l })), kw: (n.kw || []).join(', '), place: 'keep', zid: n.zid, zidTouched: true, follow: null, mode: 'branch' };
  } else {
    const from = q.get('from'), item = from && S.inbox.find((i) => i.uid === from);
    const [sid, cid] = (q.get('cap') || '').split(':');
    const cap = sid && S.sources[sid]?.caps.find((c) => c.uid === cid);
    const follow = q.get('follow') && S.notes[q.get('follow')] ? q.get('follow') : null;
    E = { key, uid: null, title: '', body: item ? item.text : '', quote: cap ? cap.text : '', src: cap ? sid : '', loc: cap ? cap.loc : '', links: [], kw: cap?.topic || '', place: follow ? 'follow' : notes().length ? 'follow' : 'new', follow, mode: q.get('mode') === 'next' ? 'next' : 'branch', zid: '', zidTouched: false, from: item ? from : null, cap: cap ? `${sid}:${cid}` : null };
  }
  E.base = JSON.stringify([E.title, E.body, E.quote, E.links, E.kw]);
  autoAddr();
}
function autoAddr() {
  if (!E || E.zidTouched) return;
  const f = E.follow && S.notes[E.follow];
  E.zid = E.place === 'new' ? Z.newArea() : f ? (E.mode === 'branch' ? Z.child(f.zid, E.uid) : Z.next(f.zid, E.uid)) : '';
}
const dirty = () => E && JSON.stringify([E.title, E.body, E.quote, E.links, E.kw]) !== E.base;
function vEditor() {
  if (!E) return `${top('Not found', { back: '#/box' })}`;
  const f = E.follow && S.notes[E.follow];
  const srcs = Object.values(S.sources).sort((a, b) => b.created - a.created);
  const existing = E.place === 'keep';
  return `<div class="editor">
  <div class="top"><button class="btn ghost sm" type="button" data-act="ed-cancel">Cancel</button><h1>${existing ? 'Edit note' : E.from ? 'Make a main note' : 'New main note'}</h1><button class="btn primary sm" type="button" data-act="ed-save">Save</button></div>
  ${E.from ? `<div class="hint"><span>${I('inbox')}</span><div>From your inbox. Rewrite it so it makes sense on its own, years from now.</div></div><div style="height:1rem"></div>` : ''}
  <section class="step"><h3><span class="no">1</span>The idea</h3>
    <p class="tip">One idea, in full sentences, in your own words. To point at another note in the text, type its address in double brackets: [[1.2a]].</p>
    <textarea id="eBody" data-bind="e.body" data-grow rows="5" placeholder="Write the idea…">${esc(E.body)}</textarea>
    <div id="hBody"></div></section>
  <section class="step"><h3><span class="no">2</span>Title</h3>
    <p class="tip">Say the idea as a statement. "Not all apples are edible", not "Apples and edibility".</p>
    <input id="eTitle" data-bind="e.title" value="${esc(E.title)}" placeholder="${esc(firstSentence(E.body) || 'A statement of the idea')}" autocomplete="off">
    <div id="hTitle"></div></section>
  <section class="step"><h3><span class="no">3</span>Where it lives</h3>
    ${existing ? `<p class="tip">Its address. There's no need to change it when you see new connections: add links instead.</p>
      <div class="addr-row"><input class="addr" id="eZid" data-bind="e.zid" value="${esc(E.zid)}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Address"><span class="muted">Numbers and letters take turns: 1.2, 1.2a, 1.2a1…</span></div>`
    : `<p class="tip">Did this idea grow out of a note you already have? The address records that. It's an address, not a category.</p>
    <div class="seg" role="group" aria-label="Placement">
      <button type="button" data-act="ed-place" data-v="follow" aria-pressed="${E.place === 'follow'}">Follows a note</button>
      <button type="button" data-act="ed-place" data-v="new" aria-pressed="${E.place === 'new'}">Starts a new area</button>
    </div>
    ${E.place === 'follow' ? `<button type="button" class="picked ${f ? 'set' : ''}" data-act="ed-follow">${f ? `<span class="zid">${esc(f.zid)}</span><span class="t">${esc(f.title)}</span>${I('edit')}` : `${I('search')}<span class="t">Choose the note it grew from…</span>`}</button>
      ${f ? `<label class="radio"><input type="radio" name="mode" data-act="ed-mode" data-v="branch" ${E.mode === 'branch' ? 'checked' : ''}><span><b>It continues that note</b><small>A direct response or development: ${esc(Z.child(f.zid, E.uid))}</small></span></label>
      <label class="radio"><input type="radio" name="mode" data-act="ed-mode" data-v="next" ${E.mode === 'next' ? 'checked' : ''}><span><b>It's a new point beside it</b><small>Same subject, but not a response to it: ${esc(Z.next(f.zid, E.uid))}</small></span></label>` : ''}`
    : '<p class="tip">For an idea that doesn\'t speak to anything in your box yet.</p>'}
    <div class="addr-row"><input class="addr" id="eZid" data-bind="e.zid" value="${esc(E.zid)}" placeholder="—" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Address"><span class="muted">Address. Suggested for you; you can type your own.</span></div>`}
    <div id="hPlace"></div></section>
  <section class="step"><h3><span class="no">4</span>Links</h3>
    <p class="tip">Which other ideas does it speak to? Think beyond the topic. Say why for each one, or you'll forget.</p>
    <div id="eLinks">${E.links.map((l, i) => { const m = S.notes[l.to]; return m ? `<div class="lrow"><div class="lt"><span class="zid">${esc(m.zid)}</span><b>${esc(m.title)}</b><button class="btn ghost icon sm" type="button" data-act="ed-unlink" data-i="${i}" aria-label="Remove link">${I('x')}</button></div>
      <textarea data-bind="e.why.${i}" data-grow rows="1" placeholder="Why does it connect? One line.">${esc(l.why)}</textarea>${l.why.trim() ? '' : '<div class="hint warn">' + I('alert') + '<div>Say why. A link with no reason won\'t mean much later.</div></div>'}</div>` : ''; }).join('')}</div>
    <button class="btn wide" type="button" data-act="ed-link">${I('link')}Link a note</button></section>
  <details class="more step" ${E.quote || E.src ? 'open' : ''}><summary>${I('chev')}<span><span class="no mono small" style="color:var(--accent-text)">5</span> Quote and source</span> <small class="muted" style="font-weight:500">optional</small></summary>
    <label class="field"><span>Quote</span><textarea data-bind="e.quote" data-grow rows="2" placeholder="The passage your idea builds on">${esc(E.quote)}</textarea></label>
    <div class="capform"><label class="field"><span>Where</span><input data-bind="e.loc" value="${esc(E.loc)}" placeholder="p. 42" autocomplete="off"></label>
    <label class="field"><span>Source</span><select data-bind="e.src"><option value="">None</option>${srcs.map((s) => `<option value="${s.uid}" ${s.uid === E.src ? 'selected' : ''}>${esc(s.title)}</option>`).join('')}<option value="__new">New source…</option></select></label></div></details>
  <details class="more step" ${E.kw ? 'open' : ''}><summary>${I('chev')}<span><span class="no mono small" style="color:var(--accent-text)">6</span> Index keywords</span> <small class="muted" style="font-weight:500">optional</small></summary>
    <p class="tip">A few words to enter the box by later. Separate with commas.</p>
    <input data-bind="e.kw" value="${esc(E.kw)}" placeholder="e.g. relationships, naming" autocomplete="off" autocapitalize="off">
    ${keywords().length ? `<div class="chips" style="margin-top:0.5rem">${keywords().slice(0, 24).map((k) => `<button type="button" class="chip" data-act="ed-kw" data-k="${esc(k.name)}">${esc(k.name)}</button>`).join('')}</div>` : ''}</details>
  ${existing ? `<button class="btn danger wide" type="button" data-act="ed-delete" style="margin-top:1rem">${I('trash')}Delete note</button>` : ''}
  </div>`;
}
function edHints() {
  if (!E) return;
  const b = $('#hBody'), t = $('#hTitle'), p = $('#hPlace');
  if (b) {
    const m = E.body.match(/\b(but|however)\b/i);
    b.innerHTML = m && E.body.slice(m.index).trim().split(/\s+/).length > 3 ? `<div class="hint">${I('info')}<div>You wrote "${esc(m[1])}". What comes after it is often a second idea. Split it off, and each half connects more freely.<br><button class="btn sm" type="button" data-act="ed-split">Send the rest to Inbox</button></div></div>` : '';
  }
  if (t) {
    const v = E.title.trim(), dup = v && notes().find((n) => n.uid !== E.uid && n.title.trim().toLowerCase() === v.toLowerCase());
    t.innerHTML = dup ? `<div class="hint warn">${I('alert')}<div>You already have a note saying this: <a href="#/n/${dup.uid}">${esc(label(dup))}</a></div></div>`
      : /\?$/.test(v) ? `<div class="hint">${I('info')}<div>A question. Try saying what you <i>do</i> know about it, so the note can connect to others.</div></div>`
        : /^[\p{L}'-]+( [\p{L}'-]+)? (and|&|vs\.?) [\p{L}'-]+( [\p{L}'-]+)?$/iu.test(v) ? `<div class="hint">${I('info')}<div>That reads like a topic. What does the note <i>claim</i>?</div></div>` : '';
  }
  if (p) {
    const z = Z.norm(E.zid), clash = E.zid && notes().find((n) => n.zid === z && n.uid !== E.uid);
    p.innerHTML = E.zid && !Z.valid(E.zid.trim()) ? `<div class="hint warn">${I('alert')}<div>Addresses look like 1.2, 1.2a or 1.2a1: a first number, a dot, then numbers and letters taking turns.</div></div>`
      : clash ? `<div class="hint warn">${I('alert')}<div>${esc(z)} is already taken by "${esc(clash.title)}".</div></div>`
        : E.place === 'follow' && !E.follow ? `<div class="hint">${I('info')}<div>Choose the note it grew from, or start a new area.</div></div>`
          : E.place === 'new' && !E.links.length && notes().length > 2 ? `<div class="hint">${I('info')}<div>Not connected yet. That's fine for a new area, but do add a link below if anything comes to mind: unlinked notes get lost.</div></div>` : '';
  }
}
function saveEditor() {
  const body = E.body.trim(), title = (E.title.trim() || firstSentence(body)).trim();
  if (!body && !title) return toast('Write the idea first.', { warn: true });
  if (!E.zid) return toast(E.place === 'follow' ? 'Choose the note it grew from, or start a new area.' : 'Give it an address.', { warn: true });
  const zid = Z.norm(E.zid);
  if (!Z.valid(E.zid.trim())) return toast('That address doesn\'t look right. Try something like 1.2a.', { warn: true });
  const clash = notes().find((n) => n.zid === zid && n.uid !== E.uid);
  if (clash) return toast(`${zid} is already taken.`, { warn: true });
  const id = E.uid || uid(), old = S.notes[id];
  const kw = []; for (const k of E.kw.split(',').map((s) => s.trim()).filter(Boolean)) if (!kw.some((x) => x.toLowerCase() === k.toLowerCase())) kw.push(k);
  S.notes[id] = {
    ...(old || { uid: id, created: now(), used: [] }),
    zid, title, body, quote: E.quote.trim(), src: E.src ? { id: E.src, loc: E.loc.trim() } : null,
    links: E.links.filter((l) => S.notes[l.to] && l.to !== id).map((l) => ({ to: l.to, why: l.why.trim() })), kw, updated: now(),
  };
  if (old?.sample) S.notes[id].sample = true;
  if (E.from) S.inbox = S.inbox.filter((i) => i.uid !== E.from);
  if (E.cap) { const [sid, cid] = E.cap.split(':'); const c = S.sources[sid]?.caps.find((x) => x.uid === cid); if (c) c.note = id; }
  const from = E.from, cap = E.cap;
  save(); E = null;
  if (from) { replaceTo('#/inbox'); toast(`Saved as ${zid}.`, { label: 'Open', fn: () => go(`#/n/${id}`) }); }
  else if (cap) { replaceTo(`#/s/${cap.split(':')[0]}`); toast(`Saved as ${zid}.`, { label: 'Open', fn: () => go(`#/n/${id}`) }); }
  else { replaceTo(`#/n/${id}`); toast(old ? 'Saved.' : `Saved as ${zid}.`); }
}

// ---------------------------------------------------------------- sources (reference notes)
const KINDS = { book: 'Book', article: 'Article', video: 'Video', podcast: 'Podcast', talk: 'Talk', conversation: 'Conversation', journal: 'Journal', other: 'Other' };
function vSources() {
  const list = Object.values(S.sources).sort((a, b) => (b.touched || b.created) - (a.touched || a.created));
  return `${top('Sources', { right: `<button class="btn primary sm" type="button" data-act="src-new">${I('plus')}Source</button>${moreBtn}` })}
  <p class="lead">One reference note per book, video, talk or conversation: where something caught your attention, in a few words. Turn the best captures into main notes later.</p>
  ${list.length ? `<div class="list">${list.map((s) => { const made = s.caps.filter((c) => c.note).length; return `<a class="item" href="#/s/${s.uid}">${I('book')}<span class="t"><b>${esc(s.title)}</b><small>${esc([KINDS[s.kind] || '', s.author].filter(Boolean).join(' · '))} · ${s.caps.length} capture${s.caps.length === 1 ? '' : 's'}${made ? `, ${made} made into notes` : ''}</small></span>${I('chev', 'chev')}</a>`; }).join('')}</div>`
    : empty('book', 'No sources yet', 'Reading a book or watching a talk? Add it here and jot page numbers or timestamps with a few words as you go, without stopping to write full notes.', `<button class="btn primary" type="button" data-act="src-new">${I('plus')}Add a source</button>`)}`;
}
function vSource(id) {
  const s = S.sources[id];
  if (!s) return `${top('Not found', { back: '#/sources' })}`;
  const topics = new Map();
  for (const c of s.caps) if (c.topic) for (const t of c.topic.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean)) topics.set(t, (topics.get(t) || 0) + 1);
  const tlist = [...topics].sort((a, b) => b[1] - a[1]);
  const locPh = { video: '12:30', podcast: '12:30', talk: '12:30', conversation: 'dinner', journal: '3 Nov' }[s.kind] || 'p. 42';
  return `${top(esc(s.title), { back: '#/sources', right: `<button class="btn ghost icon" type="button" data-act="src-edit" data-id="${id}" aria-label="Edit source">${I('edit')}</button>` })}
  <p class="lead">${esc([KINDS[s.kind], s.author].filter(Boolean).join(' · '))}${s.link ? ` · <a href="${esc(s.link)}" target="_blank" rel="noopener">link</a>` : ''}</p>
  <div class="card"><div class="capform">
    <label class="field"><span>Where</span><input id="capLoc" placeholder="${locPh}" autocomplete="off"></label>
    <label class="field"><span>Topic <small class="muted">optional</small></span><input id="capTopic" placeholder="e.g. psychology" autocomplete="off" autocapitalize="off"></label>
    <label class="field full"><span>What caught your attention</span><textarea id="capText" data-grow rows="2" placeholder="A few words to jog your memory"></textarea></label></div>
    <button class="btn primary wide" type="button" data-act="cap-add" data-id="${id}">${I('plus')}Add capture</button></div>
  ${tlist.length > 1 ? `<h2 class="sec">What keeps catching your attention</h2><div class="chips">${tlist.map(([t, c]) => `<span class="chip">${esc(t)} ×${c}</span>`).join('')}</div>` : ''}
  <h2 class="sec">Captures</h2>
  ${s.caps.length ? `<div class="list">${s.caps.map((c) => { const n = c.note && S.notes[c.note]; return `<div class="cap"><span class="loc">${esc(c.loc) || '—'}</span><span class="t">${esc(c.text)}${c.topic ? `<small>${esc(c.topic)}</small>` : ''}</span>
    ${n ? `<a class="done" href="#/n/${n.uid}">${I('check')}${esc(n.zid)}</a>` : `<a class="btn sm" href="#/new?cap=${id}:${c.uid}">Make note</a>`}
    <button class="btn ghost icon sm" type="button" data-act="cap-del" data-id="${id}" data-c="${c.uid}" aria-label="Remove capture">${I('x')}</button></div>`; }).join('')}</div>` : '<p class="muted small">Nothing captured yet.</p>'}
  <p class="tip" style="margin-top:1rem">Not every capture needs to become a note. Come back to this list later and pick what still interests you.</p>`;
}
async function editSource(s) {
  const isNew = !s;
  const v = s || { title: '', author: '', kind: 'book', link: '' };
  const r = await openSheet(isNew ? 'New source' : 'Edit source', `
    <label class="field"><span>Title</span><input id="sTitle" value="${esc(v.title)}" placeholder="What are you reading, watching or hearing?" autocomplete="off"></label>
    <label class="field"><span>Author or speaker</span><input id="sAuthor" value="${esc(v.author)}" autocomplete="off"></label>
    <label class="field"><span>Kind</span><select id="sKind">${Object.entries(KINDS).map(([k, l]) => `<option value="${k}" ${k === v.kind ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="field"><span>Link <small class="muted">optional</small></span><input id="sLink" value="${esc(v.link || '')}" inputmode="url" autocomplete="off" autocapitalize="off"></label>
    <div class="row-btns"><button class="btn primary wide" type="button" id="sOk">${isNew ? 'Add source' : 'Save'}</button>${isNew ? '' : `<button class="btn danger wide" type="button" id="sDel">${I('trash')}Delete source</button>`}</div>`, (sh) => {
    sh.querySelector('#sOk').onclick = () => {
      const title = sh.querySelector('#sTitle').value.trim();
      if (!title) { sh.querySelector('#sTitle').focus(); return; }
      closeSheet({ title, author: sh.querySelector('#sAuthor').value.trim(), kind: sh.querySelector('#sKind').value, link: sh.querySelector('#sLink').value.trim() });
    };
    const d = sh.querySelector('#sDel'); if (d) d.onclick = () => closeSheet('delete');
    if (isNew) setTimeout(() => sh.querySelector('#sTitle').focus(), 60);
  });
  if (!r) return null;
  if (r === 'delete') {
    if (!confirm(`Delete "${s.title}" and its ${s.caps.length} captures? Notes made from it stay.`)) return null;
    delete S.sources[s.uid];
    for (const n of notes()) if (n.src?.id === s.uid) n.src = null;
    save(); replaceTo('#/sources'); return null;
  }
  if (isNew) { const id = uid(); S.sources[id] = { uid: id, ...r, caps: [], created: now() }; save(); return id; }
  Object.assign(s, r); save(); render(); return s.uid;
}

// ---------------------------------------------------------------- views: index, hubs, structures, clusters
function vViews(sub, q) {
  const tabs = [['index', 'Index'], ['hubs', 'Hubs'], ['structures', 'Structures'], ['clusters', 'Clusters']];
  const seg = `<div class="seg" role="group" aria-label="Ways into the box">${tabs.map(([k, l]) => `<a href="#/views/${k}" ${k === sub ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</div>`;
  let body = '';
  if (sub === 'index') {
    const kws = keywords(), k = q.get('k');
    body = `<p class="lead">Keywords that point into the box at a few places. Enter there, then follow the links.</p>
    ${notes().length ? `<button class="btn wide" type="button" data-act="random" style="margin-bottom:1rem">${I('shuffle')}Surprise me: open a random note</button>` : ''}
    ${kws.length ? `<div class="list">${kws.map((x) => `<div class="mrow" ${x.name.toLowerCase() === k ? 'style="background:var(--accent-subtle)"' : ''} id="kw-${encodeURIComponent(x.name.toLowerCase())}"><div class="lt"><b style="flex:1">${esc(x.name)}</b><span class="muted small">${x.notes.length}</span></div><div class="chips" style="margin-top:0.4rem">${x.notes.map((n) => `<a class="chip" href="#/n/${n.uid}"><span class="zid">${esc(n.zid)}</span>${esc(n.title.length > 38 ? n.title.slice(0, 36) + '…' : n.title)}</a>`).join('')}</div></div>`).join('')}</div>`
      : empty('compass', 'No keywords yet', 'Add a few index keywords when you write or edit a note. They\'re doors into the box, not labels for everything.')}`;
  } else if (sub === 'hubs' || sub === 'structures') {
    const kind = sub === 'hubs' ? 'hub' : 'structure';
    const maps = Object.values(S.maps).filter((m) => m.kind === kind).sort((a, b) => b.updated - a.updated);
    body = `<p class="lead">${kind === 'hub' ? 'A hub lists where trains of thought on a theme begin, with a line on where each leads. It points to where things are happening, not to everything.' : 'A structure note pulls notes into an order that makes sense and says how they connect. It\'s where a train of thought becomes an argument, and often a first draft.'}</p>
    <button class="btn primary wide" type="button" data-act="map-new" data-kind="${kind}" style="margin-bottom:1rem">${I('plus')}New ${kind === 'hub' ? 'hub' : 'structure note'}</button>
    ${maps.length ? `<div class="list">${maps.map((m) => `<a class="item" href="#/m/${m.uid}">${I(kind === 'hub' ? 'hub' : 'list')}<span class="t"><b>${esc(m.title || 'Untitled')}</b><small>${m.items.length} note${m.items.length === 1 ? '' : 's'}${m.intro ? ' · ' + esc(m.intro.slice(0, 60)) : ''}</small></span>${I('chev', 'chev')}</a>`).join('')}</div>`
      : `<p class="muted small">${kind === 'hub' ? 'Make one when an area of your box has grown in several directions.' : 'Make one when you want to think a topic through, or before writing.'}</p>`}`;
  } else {
    const all = sorted();
    const trains = all.map((n) => ({ n, d: descendants(n) })).filter((x) => x.d >= 2).sort((a, b) => b.d - a.d || Z.cmp(a.n.zid, b.n.zid)).slice(0, 8);
    const conn = all.map((n) => ({ n, c: (n.links || []).length + backlinks(n).length })).filter((x) => x.c >= 2).sort((a, b) => b.c - a.c).slice(0, 8);
    const topics = new Map();
    for (const s of Object.values(S.sources)) for (const c of s.caps) if (c.topic) for (const t of c.topic.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean)) topics.set(t, (topics.get(t) || 0) + 1);
    const tl = [...topics].sort((a, b) => b[1] - a[1]).slice(0, 12);
    const lonely = all.filter((n) => !(n.links || []).length && !backlinks(n).length && !parentOf(n) && !childrenOf(n).length);
    const maxT = trains[0]?.d || 1, maxC = conn[0]?.c || 1;
    body = `<p class="lead">Where your box is swelling. Busy areas are often ideas ready to be written about.</p>
    <div class="stat-grid"><div class="stat"><b>${all.length}</b><span>main notes</span></div><div class="stat"><b>${all.reduce((s, n) => s + (n.links || []).length, 0)}</b><span>links</span></div>
    <div class="stat"><b>${S.inbox.filter((i) => !i.sleep).length}</b><span>in inbox</span></div><div class="stat"><b>${Object.values(S.sources).reduce((s, x) => s + x.caps.filter((c) => !c.note).length, 0)}</b><span>captures waiting</span></div></div>
    <h2 class="sec">Longest trains of thought</h2>
    ${trains.length ? `<div class="list">${trains.map((x) => `<a class="link" href="#/n/${x.n.uid}"><span class="lt"><span class="zid">${esc(x.n.zid)}</span><b>${esc(x.n.title)}</b><span class="muted small">+${x.d}</span></span><div class="bar-meter"><i style="width:${(x.d / maxT) * 100}%"></i></div></a>`).join('')}</div>` : '<p class="muted small">No train has grown past two notes yet.</p>'}
    <h2 class="sec">Most connected ideas</h2>
    ${conn.length ? `<div class="list">${conn.map((x) => `<a class="link" href="#/n/${x.n.uid}"><span class="lt"><span class="zid">${esc(x.n.zid)}</span><b>${esc(x.n.title)}</b><span class="muted small">${x.c}</span></span><div class="bar-meter"><i style="width:${(x.c / maxC) * 100}%"></i></div></a>`).join('')}</div>` : '<p class="muted small">Links will show up here.</p>'}
    ${tl.length ? `<h2 class="sec">What your reading keeps returning to</h2><div class="chips">${tl.map(([t, c]) => `<span class="chip">${esc(t)} ×${c}</span>`).join('')}</div>` : ''}
    ${lonely.length ? `<h2 class="sec">Not connected to anything</h2><p class="tip">Notes with no links get lost. Does any of these speak to another idea?</p><div class="list">${lonely.slice(0, 12).map((n) => `<a class="zrow" href="#/n/${n.uid}"><span class="zid">${esc(n.zid)}</span><span class="t">${esc(n.title)}</span></a>`).join('')}</div>` : ''}`;
  }
  return `${top('Views', { right: moreBtn })}${seg}${body}`;
}
function vMap(id) {
  const m = S.maps[id];
  if (!m) return `${top('Not found', { back: '#/views/hubs' })}`;
  const hub = m.kind === 'hub';
  return `${top(hub ? 'Hub note' : 'Structure note', { back: `#/views/${hub ? 'hubs' : 'structures'}`, right: `<button class="btn ghost icon" type="button" data-act="map-del" data-id="${id}" aria-label="Delete">${I('trash')}</button>` })}
  <label class="field"><span>Title</span><input data-bind="map.title.${id}" value="${esc(m.title)}" placeholder="${hub ? 'The theme, e.g. Note-making' : 'What you\'re thinking through'}" autocomplete="off"></label>
  <label class="field"><span>${hub ? 'About this hub' : 'Where this is going'} <small class="muted">optional</small></span><textarea data-bind="map.intro.${id}" data-grow rows="2">${esc(m.intro)}</textarea></label>
  <h2 class="sec">${hub ? 'Entry points' : 'Notes, in order'}</h2>
  ${m.items.length ? `<div class="list">${m.items.map((x, i) => { const n = S.notes[x.to]; return n ? `<div class="mrow"><div class="lt"><span class="zid">${esc(n.zid)}</span><a href="#/n/${n.uid}">${esc(n.title)}</a></div>
    <textarea data-bind="map.why.${id}.${i}" data-grow rows="1" placeholder="${hub ? 'Where this train of thought leads' : 'How it fits here'}">${esc(x.why)}</textarea>
    <span class="ord">${hub ? '' : `<button class="btn ghost icon sm" type="button" data-act="map-mv" data-id="${id}" data-i="${i}" data-d="-1" aria-label="Move up" ${i ? '' : 'disabled'}>${I('up')}</button><button class="btn ghost icon sm" type="button" data-act="map-mv" data-id="${id}" data-i="${i}" data-d="1" aria-label="Move down" ${i < m.items.length - 1 ? '' : 'disabled'}>${I('down')}</button>`}<button class="btn ghost icon sm" type="button" data-act="map-rm" data-id="${id}" data-i="${i}" aria-label="Remove">${I('x')}</button></span></div>` : ''; }).join('')}</div>` : '<p class="muted small">No notes yet.</p>'}
  <div class="row-btns" style="margin-top:0.75rem"><button class="btn wide" type="button" data-act="map-pick" data-id="${id}">${I('plus')}Add a note</button>
  ${hub ? '' : `<button class="btn primary wide" type="button" data-act="map-draft" data-id="${id}" ${m.items.length ? '' : 'disabled'}>${I('pen')}Start a draft from this</button>`}</div>`;
}

// ---------------------------------------------------------------- writing (drafts + creative logs)
const PHASES = [
  ['Brain dump', 'List every idea and note that might belong. No order yet.'],
  ['Say more', 'Under each point, write what you\'d actually say about it.'],
  ['Break it up', 'Split big points into sections and move pieces to where they fit.'],
  ['Back and forth', 'Move between outline and draft, rewriting both until the piece finds its shape.'],
];
function vWrite() {
  const list = Object.values(S.drafts).sort((a, b) => b.updated - a.updated);
  return `${top('Write', { right: `<button class="btn primary sm" type="button" data-act="draft-new">${I('plus')}Draft</button>${moreBtn}` })}
  <p class="lead">Pull notes into a draft, then rewrite them so they fit. Your notes are raw material; the box doesn't write for you.</p>
  ${list.length ? `<div class="list">${list.map((d) => { const last = d.log[0]; return `<a class="item" href="#/d/${d.uid}">${I('pen')}<span class="t"><b>${esc(d.title || 'Untitled')}</b><small>${PHASES[d.phase][0]}${last?.next ? ` · Next: ${esc(last.next.slice(0, 60))}` : ''}</small></span>${I('chev', 'chev')}</a>`; }).join('')}</div>`
    : empty('pen', 'Nothing in progress', 'Look at Clusters for areas that have grown, or build a structure note, then start a draft from it.', `<button class="btn primary" type="button" data-act="draft-new">${I('plus')}Start a draft</button><a class="btn" href="#/views/clusters">See clusters</a>`)}`;
}
function vDraft(id) {
  const d = S.drafts[id];
  if (!d) return `${top('Not found', { back: '#/write' })}`;
  const words = (d.body.match(/\S+/g) || []).length;
  return `${top('Draft', { back: '#/write', right: `<button class="btn ghost icon" type="button" data-act="draft-md" data-id="${id}" aria-label="Download as Markdown">${I('download')}</button><button class="btn ghost icon" type="button" data-act="draft-del" data-id="${id}" aria-label="Delete draft">${I('trash')}</button>` })}
  <input data-bind="draft.title.${id}" value="${esc(d.title)}" placeholder="Working title" autocomplete="off" style="font-size:1.25rem;font-weight:650;border:0;background:none;padding:0.25rem 0;box-shadow:none">
  <details class="more" ${d.forOthers || d.forMe ? '' : 'open'}><summary>${I('chev')}Why write this?</summary>
    <label class="field"><span>For others: what will a reader get?</span><textarea data-bind="draft.forOthers.${id}" data-grow rows="2">${esc(d.forOthers)}</textarea></label>
    <label class="field"><span>For me: what do I get from it?</span><textarea data-bind="draft.forMe.${id}" data-grow rows="2">${esc(d.forMe)}</textarea></label></details>
  <h2 class="sec">Outline stage</h2>
  <div class="seg grid2" role="group" aria-label="Outline stage">${PHASES.map((p, i) => `<button type="button" data-act="draft-phase" data-id="${id}" data-v="${i}" aria-pressed="${d.phase === i}">${p[0]}</button>`).join('')}</div>
  <p class="tip" style="margin-top:-0.5rem">${PHASES[d.phase][1]}</p>
  <h2 class="sec">Draft <span style="text-transform:none;letter-spacing:0;font-weight:500">· ${words} words</span></h2>
  <textarea class="draft-body" id="dBody" data-bind="draft.body.${id}" data-grow placeholder="Start anywhere. Insert notes, then rewrite them in the voice of the piece.">${esc(d.body)}</textarea>
  <div class="row-btns" style="margin-top:0.5rem"><button class="btn" type="button" data-act="draft-insert" data-id="${id}">${I('plus')}Insert a note</button><button class="btn ghost" type="button" data-act="draft-copy" data-id="${id}">${I('copy')}Copy</button></div>
  <h2 class="sec">Creative log</h2>
  <p class="tip">At the end of each session: what you did, what needs attention, what to do next. Newest first.</p>
  <div class="card"><label class="field"><span>Did</span><textarea id="lgDid" data-grow rows="1"></textarea></label>
  <label class="field"><span>Needs attention</span><textarea id="lgNeed" data-grow rows="1"></textarea></label>
  <label class="field"><span>Next time</span><textarea id="lgNext" data-grow rows="1"></textarea></label>
  <button class="btn primary wide" type="button" data-act="log-add" data-id="${id}">Add to log</button></div>
  ${d.log.length ? `<div class="log">${d.log.map((e) => `<div class="e"><time>${dayStr(e.at)}</time>${e.did ? `<p><b>Did</b> ${esc(e.did)}</p>` : ''}${e.need ? `<p><b>Needs attention</b> ${esc(e.need)}</p>` : ''}${e.next ? `<p><b>Next</b> ${esc(e.next)}</p>` : ''}</div>`).join('')}</div>` : ''}`;
}
function newDraft(title = '', body = '') {
  const id = uid();
  S.drafts[id] = { uid: id, title, forOthers: '', forMe: '', phase: 0, body, log: [], created: now(), updated: now() };
  save(); return id;
}
const noteBlock = (n) => `[${n.zid}] ${n.title}\n${n.body}${n.quote ? `\n> ${n.quote}` : ''}\n`;
function markUsed(n, did) { n.used = n.used || []; if (!n.used.includes(did)) n.used.push(did); }

// ---------------------------------------------------------------- more: help, backup, examples
function vMore() {
  const persisted = html.dataset.persist;
  const hasReal = notes().some((n) => !n.sample) || Object.values(S.sources).some((s) => !s.sample);
  const hasSample = notes().some((n) => n.sample);
  return `${top('More', { back: '#/box' })}
  <h2 class="sec">How it works</h2>
  <div class="card prose"><ol>
    <li><b>Capture.</b> Get thoughts out of your head into the Inbox, rough. Most will be let go; that's fine.</li>
    <li><b>Read with a pen.</b> In Sources, keep one reference note per book or video: a page or timestamp and a few words.</li>
    <li><b>Make main notes.</b> One idea each, in full sentences, in your own words, titled as a statement. Give it an address that says which idea it grew from.</li>
    <li><b>Connect.</b> Link it to other ideas, even far-off ones, and always say why. Ideas get their value from their links.</li>
    <li><b>Find your way in.</b> Hubs point to where trains of thought start. Structure notes put ideas in order. The index gives you a few doors in, and leaves room for surprise.</li>
    <li><b>Write.</b> Clusters show where the box is growing. Pull those notes into a draft and rewrite them. Keep a log so you know where to pick up.</li>
  </ol><p class="muted small">Based on Bob Doto's <i>A System for Writing</i> (2024), a guide to Niklas Luhmann's zettelkasten. Slipbox is an independent tool.</p></div>
  <h2 class="sec">Your data</h2>
  <div class="card"><p class="small" style="margin-top:0">Everything is stored on this device only, in this browser.${persisted === 'yes' ? ' The browser has agreed to keep it.' : ' Add Slipbox to your Home Screen and save backups now and then: Safari can clear website data that hasn\'t been used for a while.'}</p>
  <p class="small muted">${S.meta.backupAt ? `Last backup ${ago(S.meta.backupAt)}.` : 'No backup yet.'}</p>
  <div class="row-btns"><button class="btn primary" type="button" data-act="export">${I('download')}Back up</button><button class="btn" type="button" data-act="import">${I('upload')}Restore</button><button class="btn" type="button" data-act="export-md">${I('download')}Notes as Markdown</button></div>
  <input type="file" id="importFile" accept="application/json,.json" hidden></div>
  <h2 class="sec">Examples</h2>
  <div class="card"><p class="small" style="margin-top:0">A small box about note-making, with a source, a hub, a structure note and a draft, so you can see how the pieces fit.</p>
  <div class="row-btns">${hasSample ? `<button class="btn" type="button" data-act="examples-off">${I('trash')}Remove examples</button>` : `<button class="btn" type="button" data-act="examples" ${hasReal ? 'disabled' : ''}>Load examples</button>`}</div>
  ${!hasSample && hasReal ? '<p class="tip">Examples load only into an empty box, so they don\'t mix with your own notes.</p>' : ''}</div>
  <h2 class="sec">Start over</h2>
  <button class="btn danger" type="button" data-act="wipe">${I('trash')}Erase everything on this device</button>`;
}
function toMarkdown() {
  const out = ['# Slipbox', ''];
  let area = null;
  for (const n of sorted()) {
    const a = Z.area(n.zid);
    if (a !== area) { area = a; out.push(`## ${a}${areaName(a) ? ' ' + areaName(a) : ''}`, ''); }
    out.push(`### ${n.zid} ${n.title}`, '', n.body, '');
    if (n.quote) out.push(`> ${n.quote.replace(/\n/g, '\n> ')}`, '');
    const s = n.src && S.sources[n.src.id];
    if (s) out.push(`Source: ${sourceLabel(s)}${n.src.loc ? ', ' + n.src.loc : ''}`, '');
    for (const l of n.links || []) { const m = S.notes[l.to]; if (m) out.push(`- See ${m.zid} ${m.title}${l.why ? ' — ' + l.why : ''}`); }
    if ((n.links || []).length) out.push('');
    if ((n.kw || []).length) out.push(`Index: ${n.kw.join(', ')}`, '');
  }
  return out.join('\n');
}
function loadExamples() {
  if (notes().length) return;
  const t = now(), N = {};
  const mk = (k, zid, title, body, extra = {}) => { N[k] = { uid: 'ex-' + k, zid, title, body, quote: '', src: null, links: [], kw: [], used: [], created: t, updated: t, sample: true, ...extra }; };
  mk('a', '1.1', 'A thought only becomes usable once it is written in full sentences', 'A jotted reminder stops a thought from vanishing, but it stays vague. Writing it out in full sentences is where I find out what I actually think, and whether it holds up.', { kw: ['writing'] });
  mk('b', '1.1a', 'Most quick captures should be let go', 'Captures are cheap on purpose. When I process the inbox, only the thoughts that still interest me become main notes. Tasks and reminders never do: they aren\'t ideas.', { src: { id: 'ex-src', loc: '§1.9' } });
  mk('c', '1.2', 'A note\'s value comes from its links, not from how polished it is', 'A note on its own is easily forgotten. Linked to other ideas, even a rough note keeps coming back whenever I follow a train of thought. So I spend my time on connections rather than on perfect wording.', { kw: ['links'], src: { id: 'ex-src', loc: '§3.7' } });
  mk('d', '1.2a', 'An unexplained link is almost as useless as no link', 'Each time I link two notes I add one line saying why. Months later the reason is what I need; a bare link only tells me that past-me saw something.', { kw: ['links'], src: { id: 'ex-src', loc: '§4.4' } });
  mk('e', '1.2b', 'Splitting a note at "but" gives each half more places to connect', 'When I write "but" or "however" inside a note, what follows is usually a second idea. Split in two, each idea can join trains of thought the combined note never could.', { kw: ['atomicity'], src: { id: 'ex-src', loc: '§4.5' } });
  mk('f', '1.3', 'An address records where an idea grew from, not which category it belongs to', '1.2a only says this note was written in response to 1.2. It isn\'t a folder and it isn\'t a family tree: ideas on very different subjects can sit side by side if one sparked the other.', { kw: ['addresses'] });
  mk('g', '2.1', 'Walking without a destination loosens stuck thinking', 'When a problem won\'t move at the desk, a walk with no goal often frees it. The point isn\'t exercise; it\'s letting attention drift until something connects.', { kw: ['thinking', 'walking'] });
  mk('h', '2.1a', 'Ideas that arrive on walks need a capture tool in the pocket', 'The best walk-thoughts are gone by the time I\'m home. A phone note or a folded card catches them; sorting can wait for the inbox.', { kw: ['walking'] });
  N.a.links = [{ to: 'ex-c', why: 'Writing a thought out is also what makes it linkable: a vague jot has nothing to connect by.' }];
  N.b.links = [{ to: 'ex-h', why: 'Pocket captures are exactly the cheap, mostly-discarded kind. This is where they come from.' }];
  N.e.links = [{ to: 'ex-g', why: 'The same move as walking off a stuck problem: separate the parts and each moves more freely.' }];
  N.g.links = [{ to: 'ex-a', why: 'Both are about getting a thought moving before judging it: walking in the head, writing on the page.' }];
  for (const n of Object.values(N)) S.notes[n.uid] = n;
  S.sections = { ...S.sections, 1: 'Note-making', 2: 'Walking' };
  S.sources['ex-src'] = { uid: 'ex-src', title: 'A System for Writing', author: 'Bob Doto', kind: 'book', link: '', created: t, sample: true, caps: [
    { uid: 'c1', loc: '§1.4', text: 'keep an inbox; process it weekly', topic: 'capture', note: null },
    { uid: 'c2', loc: '§1.9', text: 'tasks never become main notes', topic: 'capture', note: 'ex-b' },
    { uid: 'c3', loc: '§3.7', text: 'notes needn\'t be perfect; value comes from relations', topic: 'main notes', note: 'ex-c' },
    { uid: 'c4', loc: '§4.4', text: 'always say why you linked', topic: 'links', note: 'ex-d' },
    { uid: 'c5', loc: '§4.5', text: 'pause at "but" / "however"', topic: 'atomicity', note: 'ex-e' },
    { uid: 'c6', loc: '§6.5', text: 'keyword index: few entry points, room for surprise', topic: 'index', note: null },
  ] };
  S.maps['ex-hub'] = { uid: 'ex-hub', kind: 'hub', title: 'Note-making', intro: 'Where my thinking about notes starts.', sample: true, created: t, updated: t, items: [
    { to: 'ex-a', why: 'Capturing, and writing thoughts out' }, { to: 'ex-c', why: 'Why links matter more than polish' }, { to: 'ex-f', why: 'What addresses mean' }] };
  S.maps['ex-st'] = { uid: 'ex-st', kind: 'structure', title: 'Links over polish', intro: 'A short piece for people starting a slip box.', sample: true, created: t, updated: t - 1, items: [
    { to: 'ex-c', why: 'The core claim. Open with it.' }, { to: 'ex-d', why: 'The practical rule that follows: every link gets a reason.' },
    { to: 'ex-e', why: 'Second rule: split at "but" so ideas connect more.' }, { to: 'ex-g', why: 'A comparison from outside note-making: getting thought moving matters more than neatness.' }] };
  S.drafts['ex-d'] = { uid: 'ex-d', title: 'Links over polish', forOthers: 'Help someone starting a slip box stop over-editing their notes.', forMe: 'Get clear on why I spend my time on links.', phase: 0, sample: true, created: t, updated: t,
    body: '- Open with the claim: a rough linked note beats a polished lonely one\n- Every link gets a reason\n- Split at "but"\n- MORE NEEDED: an example from my own box\n',
    log: [{ uid: 'l1', at: t, did: 'Pulled four notes from the structure note into an outline.', need: 'No real example yet.', next: 'Find one train of thought to show.' }] };
  for (const k of ['c', 'd', 'e']) N[k].used.push('ex-d');
  S.inbox.push({ uid: 'ex-i1', text: 'Could my old journals be a source? Date the entries and treat them like a book.', at: t - 3 * 864e5, sample: true },
    { uid: 'ex-i2', text: 'Buy index cards', at: t - 864e5, sample: true },
    { uid: 'ex-i3', text: 'Libraries: getting lost on purpose, finding the book next to the one you wanted', at: t - 40 * 864e5, sleep: true, sleptAt: t - 20 * 864e5, sample: true });
  save();
}
function removeExamples() {
  for (const n of notes()) if (n.sample) delete S.notes[n.uid];
  for (const [k, v] of Object.entries(S.sources)) if (v.sample) delete S.sources[k];
  for (const [k, v] of Object.entries(S.maps)) if (v.sample) delete S.maps[k];
  for (const [k, v] of Object.entries(S.drafts)) if (v.sample) delete S.drafts[k];
  for (const n of notes()) {
    n.links = (n.links || []).filter((l) => S.notes[l.to]);
    n.used = (n.used || []).filter((d) => S.drafts[d]);
    if (n.src && !S.sources[n.src.id]) n.src = null;
  }
  for (const m of Object.values(S.maps)) m.items = m.items.filter((x) => S.notes[x.to]);
  S.inbox = S.inbox.filter((i) => !i.sample);
  if (!notes().some((n) => Z.area(n.zid) === 1) && S.sections[1] === 'Note-making') delete S.sections[1];
  if (!notes().some((n) => Z.area(n.zid) === 2) && S.sections[2] === 'Walking') delete S.sections[2];
  save();
}

// ---------------------------------------------------------------- actions
const A = {
  capture() {
    const t = $('#cap'), text = t.value.trim();
    if (!text) { t.focus(); return; }
    S.inbox.push({ uid: uid(), text, at: now() });
    save(); render(); toast('In your inbox.');
    if (!coarse) $('#cap')?.focus();
  },
  process: (el) => go(`#/new?from=${el.dataset.id}`),
  sleep(el) {
    const i = S.inbox.find((x) => x.uid === el.dataset.id); if (!i) return;
    i.sleep = !i.sleep; i.sleptAt = now(); save(); render();
    toast(i.sleep ? 'Sleeping. Check back in a few months.' : 'Back in the inbox.');
  },
  discard(el) {
    const idx = S.inbox.findIndex((x) => x.uid === el.dataset.id); if (idx < 0) return;
    const [gone] = S.inbox.splice(idx, 1); save(); render();
    toast('Let go.', { label: 'Undo', fn: () => { S.inbox.splice(idx, 0, gone); save(); render(); } });
  },
  async 'name-area'(el) {
    const a = el.dataset.a;
    const v = await askText(`Name area ${a}`, { value: S.sections[a] || '', multiline: false, hint: 'A label to help you find your way back. Add it once ideas are there, and change it whenever you like. It\'s not a category to sort new notes into.', placeholder: 'e.g. Note-making' });
    if (v === null) return;
    if (v) S.sections[a] = v; else delete S.sections[a];
    save(); render();
  },
  async 'link-add'(el) {
    const n = S.notes[el.dataset.id];
    const to = await pickNote('Link to which idea?', [n.uid, ...(n.links || []).map((l) => l.to)]);
    if (!to) return;
    const why = await askText('Why do they connect?', { hint: `${esc(label(n))} → ${esc(label(S.notes[to]))}`, placeholder: 'One line. You won\'t remember later.' });
    if (why === null) return;
    n.links = n.links || []; n.links.push({ to, why }); n.updated = now(); save(); render();
    toast(why ? 'Linked.' : 'Linked. Add a reason later from Edit.');
  },
  async 'map-add'(el) {
    const n = S.notes[el.dataset.id];
    const maps = Object.values(S.maps).sort((a, b) => b.updated - a.updated);
    const v = await choose('Add to a hub or structure note', [
      ...maps.map((m) => ({ label: m.title || 'Untitled', sub: (m.kind === 'hub' ? 'Hub' : 'Structure') + (m.items.some((x) => x.to === n.uid) ? ' · already in it' : ''), value: m.uid, icon: m.kind === 'hub' ? 'hub' : 'list' })),
      { label: 'New hub', sub: 'Entry points into a theme', value: '+hub', icon: 'plus' },
      { label: 'New structure note', sub: 'Ideas in order, with how they connect', value: '+structure', icon: 'plus' },
    ]);
    if (!v) return;
    let id = v;
    if (v.startsWith('+')) { id = uid(); S.maps[id] = { uid: id, kind: v.slice(1), title: '', intro: '', items: [], created: now(), updated: now() }; }
    const m = S.maps[id];
    if (!m.items.some((x) => x.to === n.uid)) m.items.push({ to: n.uid, why: '' });
    m.updated = now(); save(); go(`#/m/${id}`);
  },
  async 'draft-add'(el) {
    const n = S.notes[el.dataset.id];
    const ds = Object.values(S.drafts).sort((a, b) => b.updated - a.updated);
    const v = await choose('Use in which draft?', [...ds.map((d) => ({ label: d.title || 'Untitled', sub: PHASES[d.phase][0], value: d.uid, icon: 'pen' })), { label: 'New draft', value: '+', icon: 'plus' }], 'The note is added at the end of the draft. Rewrite it to fit.');
    if (!v) return;
    const id = v === '+' ? newDraft(n.title) : v, d = S.drafts[id];
    d.body = (d.body.trimEnd() ? d.body.trimEnd() + '\n\n' : '') + noteBlock(n);
    d.updated = now(); markUsed(n, id); save(); go(`#/d/${id}`);
  },
  random() { const all = notes(); if (all.length) go(`#/n/${all[Math.floor(Math.random() * all.length)].uid}`); },

  // editor
  'ed-place'(el) { E.place = el.dataset.v; E.zidTouched = false; autoAddr(); render(); },
  'ed-mode'(el) { E.mode = el.dataset.v; E.zidTouched = false; autoAddr(); render(); },
  async 'ed-follow'() {
    const v = await pickNote('Which note did it grow from?', E.uid ? [E.uid] : []);
    if (!v) return;
    E.follow = v; E.zidTouched = false; autoAddr(); render();
  },
  async 'ed-link'() {
    const v = await pickNote('Link to which idea?', [E.uid, ...E.links.map((l) => l.to)].filter(Boolean));
    if (!v) return;
    E.links.push({ to: v, why: '' }); render();
    const ts = $$('#eLinks textarea'); ts[ts.length - 1]?.focus();
  },
  'ed-unlink'(el) { E.links.splice(+el.dataset.i, 1); render(); },
  'ed-kw'(el) {
    const k = el.dataset.k, cur = E.kw.split(',').map((s) => s.trim()).filter(Boolean);
    if (!cur.some((x) => x.toLowerCase() === k.toLowerCase())) cur.push(k);
    E.kw = cur.join(', '); render();
  },
  'ed-split'() {
    const m = E.body.match(/\b(but|however)\b/i); if (!m) return;
    const before = E.body.slice(0, m.index).replace(/[\s,;:—–-]+$/, '').trim();
    let rest = E.body.slice(m.index + m[0].length).replace(/^[\s,]+/, '').trim();
    if (!rest) return;
    rest = rest[0].toUpperCase() + rest.slice(1);
    S.inbox.push({ uid: uid(), text: `${rest}\n\n(Split from: ${E.title.trim() || firstSentence(before)})`, at: now() });
    E.body = before + (/[.!?]$/.test(before) ? '' : '.');
    save(); render(); toast('The rest is in your inbox.');
  },
  'ed-save': () => saveEditor(),
  'ed-cancel'() {
    if (dirty() && !confirm('Discard your changes?')) return;
    const back = E.uid ? `#/n/${E.uid}` : E.from ? '#/inbox' : E.cap ? `#/s/${E.cap.split(':')[0]}` : E.follow ? `#/n/${E.follow}` : '#/box';
    E = null; replaceTo(back);
  },
  'ed-delete'() {
    const n = S.notes[E.uid]; if (!n) return;
    const back = backlinks(n).length;
    if (!confirm(`Delete ${n.zid} "${n.title}"?${back ? ` ${back} note${back === 1 ? ' links' : 's link'} to it; those links will go.` : ''}`)) return;
    delete S.notes[n.uid];
    for (const m of notes()) m.links = (m.links || []).filter((l) => l.to !== n.uid);
    for (const m of Object.values(S.maps)) m.items = m.items.filter((x) => x.to !== n.uid);
    for (const s of Object.values(S.sources)) for (const c of s.caps) if (c.note === n.uid) c.note = null;
    E = null; save(); replaceTo('#/box'); toast('Deleted.');
  },

  // sources
  async 'src-new'() { const id = await editSource(null); if (id) go(`#/s/${id}`); },
  'src-edit'(el) { editSource(S.sources[el.dataset.id]); },
  'cap-add'(el) {
    const s = S.sources[el.dataset.id], text = $('#capText').value.trim();
    if (!text) { $('#capText').focus(); return; }
    s.caps.push({ uid: uid(), loc: $('#capLoc').value.trim(), text, topic: $('#capTopic').value.trim(), note: null });
    s.touched = now(); save();
    const topic = $('#capTopic').value; render();
    $('#capTopic').value = topic; // the topic often repeats; the place moves on
    if (!coarse) $('#capLoc').focus();
    toast('Captured.');
  },
  'cap-del'(el) {
    const s = S.sources[el.dataset.id], i = s.caps.findIndex((c) => c.uid === el.dataset.c); if (i < 0) return;
    const [gone] = s.caps.splice(i, 1); save(); render();
    toast('Capture removed.', { label: 'Undo', fn: () => { s.caps.splice(i, 0, gone); save(); render(); } });
  },

  // maps
  'map-new'(el) { const id = uid(); S.maps[id] = { uid: id, kind: el.dataset.kind, title: '', intro: '', items: [], created: now(), updated: now() }; save(); go(`#/m/${id}`); setTimeout(() => $('[data-bind^="map.title"]')?.focus(), 50); },
  async 'map-pick'(el) {
    const m = S.maps[el.dataset.id];
    const v = await pickNote(m.kind === 'hub' ? 'Where does a train of thought start?' : 'Add which note?', m.items.map((x) => x.to));
    if (!v) return;
    m.items.push({ to: v, why: '' }); m.updated = now(); save(); render();
    const ts = $$('.mrow textarea'); ts[ts.length - 1]?.focus();
  },
  'map-mv'(el) { const m = S.maps[el.dataset.id], i = +el.dataset.i, j = i + +el.dataset.d; [m.items[i], m.items[j]] = [m.items[j], m.items[i]]; m.updated = now(); save(); render(); },
  'map-rm'(el) { const m = S.maps[el.dataset.id]; m.items.splice(+el.dataset.i, 1); m.updated = now(); save(); render(); },
  'map-del'(el) { const m = S.maps[el.dataset.id]; if (!confirm(`Delete "${m.title || 'this'}"? The notes in it stay.`)) return; delete S.maps[m.uid]; save(); replaceTo(`#/views/${m.kind === 'hub' ? 'hubs' : 'structures'}`); },
  'map-draft'(el) {
    const m = S.maps[el.dataset.id];
    const ns = m.items.map((x) => ({ n: S.notes[x.to], why: x.why })).filter((x) => x.n);
    const body = ns.map((x) => noteBlock(x.n) + (x.why ? `(${x.why})\n` : '')).join('\n');
    const id = newDraft(m.title, body);
    for (const x of ns) markUsed(x.n, id);
    save(); go(`#/d/${id}`); toast('Draft started. Now rewrite each piece to fit.');
  },

  // drafts
  'draft-new'() { const id = newDraft(); go(`#/d/${id}`); setTimeout(() => $('[data-bind^="draft.title"]')?.focus(), 50); },
  'draft-phase'(el) { const d = S.drafts[el.dataset.id]; d.phase = +el.dataset.v; d.updated = now(); save(); render(); },
  async 'draft-insert'(el) {
    const d = S.drafts[el.dataset.id], ta = $('#dBody');
    const pos = ta ? ta.selectionStart ?? d.body.length : d.body.length;
    const v = await pickNote('Insert which note?');
    if (!v) return;
    const n = S.notes[v], block = noteBlock(n);
    const pre = d.body.slice(0, pos), post = d.body.slice(pos);
    d.body = pre + (pre && !pre.endsWith('\n\n') ? (pre.endsWith('\n') ? '\n' : '\n\n') : '') + block + (post && !post.startsWith('\n') ? '\n' : '') + post;
    d.updated = now(); markUsed(n, d.uid); save(); render(); toast(`${n.zid} inserted. Rewrite it to fit.`);
  },
  async 'draft-copy'(el) { try { await navigator.clipboard.writeText(S.drafts[el.dataset.id].body); toast('Copied.'); } catch (e) { toast('Couldn\'t copy. Select the text and copy it.', { warn: true }); } },
  'draft-md'(el) { const d = S.drafts[el.dataset.id]; download(`${safeName(d.title)}.md`, `# ${d.title || 'Untitled'}\n\n${d.body}`, 'text/markdown'); },
  'draft-del'(el) {
    const d = S.drafts[el.dataset.id]; if (!confirm(`Delete the draft "${d.title || 'Untitled'}"?`)) return;
    delete S.drafts[d.uid]; for (const n of notes()) n.used = (n.used || []).filter((x) => x !== d.uid);
    save(); replaceTo('#/write');
  },
  'log-add'(el) {
    const d = S.drafts[el.dataset.id], did = $('#lgDid').value.trim(), need = $('#lgNeed').value.trim(), next = $('#lgNext').value.trim();
    if (!did && !need && !next) { $('#lgDid').focus(); return; }
    d.log.unshift({ uid: uid(), at: now(), did, need, next }); d.updated = now(); save(); render(); toast('Logged. You\'ll know where to pick up.');
  },

  // data
  export() {
    S.meta.backupAt = now(); save();
    download(`slipbox-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(S, null, 1), 'application/json');
    render(); toast('Backup saved to your downloads.');
  },
  'export-md'() { download(`slipbox-notes-${new Date().toISOString().slice(0, 10)}.md`, toMarkdown(), 'text/markdown'); },
  import() { $('#importFile').click(); },
  examples() { loadExamples(); go('#/box'); toast('Examples loaded. Remove them any time from More.'); },
  'examples-off'() { if (!confirm('Remove the example notes, source, hub, structure note and draft?')) return; removeExamples(); render(); toast('Examples removed.'); },
  wipe() {
    if (!confirm('Erase all notes, sources, drafts and your inbox from this device?')) return;
    if (!confirm('This can\'t be undone. Erase everything?')) return;
    S = blank(); save(); go('#/inbox'); toast('Everything erased.');
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.closest('#sheet')) return;
  const fn = A[el.dataset.act];
  if (!fn) return;
  if (el.type !== 'radio') e.preventDefault();
  fn(el, e);
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'importFile') {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => {
      const d = JSON.parse(t);
      if (!d || d.v !== 1 || typeof d.notes !== 'object') throw new Error('not a backup');
      if (!confirm(`Replace what's on this device with this backup (${Object.keys(d.notes).length} notes)?`)) return;
      S = Object.assign(blank(), d); save(); go('#/box'); toast('Backup restored.');
    }).catch(() => toast('That file isn\'t a Slipbox backup.', { warn: true }));
    e.target.value = '';
  }
  if (e.target.dataset.bind === 'e.src' && e.target.value === '__new') {
    editSource(null).then((id) => { if (id) E.src = id; render(); });
  }
});
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.matches('textarea[data-grow]')) grow(el);
  if (el.id === 'boxQ') { boxQ = el.value; $('#boxList').innerHTML = boxList(); return; }
  const b = el.dataset.bind; if (!b) return;
  const [obj, field, id, i] = b.split('.');
  if (obj === 'e' && E) {
    if (field === 'why') { E.links[+id].why = el.value; const row = el.closest('.lrow'), w = row?.querySelector('.hint.warn'); if (el.value.trim() && w) w.remove(); }
    else if (field === 'zid') { E.zid = el.value.trim(); E.zidTouched = true; }
    else if (field !== 'src') E[field] = el.value;
    if (field === 'body') { const t = $('#eTitle'); if (t) t.placeholder = firstSentence(E.body) || 'A statement of the idea'; }
    edHints();
  } else if (obj === 'map') {
    const m = S.maps[id]; if (!m) return;
    if (field === 'why') m.items[+i].why = el.value; else m[field] = el.value;
    m.updated = now(); saveSoon();
  } else if (obj === 'draft') {
    const d = S.drafts[id]; if (!d) return;
    d[field] = el.value; d.updated = now(); saveSoon();
  }
});
document.addEventListener('change', (e) => { const el = e.target; if (el.dataset.bind === 'e.src' && E && el.value !== '__new') E.src = el.value; });
document.addEventListener('keydown', (e) => {
  if (e.target.id === 'cap' && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); A.capture(); }
  if (e.target.matches('#capText, #capLoc, #capTopic') && e.key === 'Enter' && (e.metaKey || e.ctrlKey || e.target.tagName === 'INPUT')) { e.preventDefault(); $('[data-act="cap-add"]').click(); }
});
// While typing on a phone, hide the tab bar so it doesn't ride on top of the keyboard.
document.addEventListener('focusin', (e) => { if (coarse && e.target.matches('input:not([type=radio]):not([type=checkbox]), textarea, select')) html.classList.add('typing'); });
document.addEventListener('focusout', () => { if (coarse) setTimeout(() => { if (!document.activeElement?.matches('input, textarea, select')) html.classList.remove('typing'); }, 60); });

function grow(t) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }
function updateCount() {
  const c = $('#inboxCount'), n = S.inbox.filter((i) => !i.sleep).length;
  if (c) { c.hidden = !n; c.textContent = n > 99 ? '99+' : n; }
}

// ---------------------------------------------------------------- router
let lastKey = '';
function render() {
  const h = location.hash.slice(1) || '/inbox';
  const [path, qs] = h.split('?');
  const parts = path.split('/').filter(Boolean), q = new URLSearchParams(qs || '');
  const key = parts.join('/') + '?' + (qs || '');
  const same = key === lastKey;
  // keep focus and scroll when re-rendering the same screen
  const ae = document.activeElement, focusKey = same && ae && (ae.id || ae.dataset?.bind), sel = focusKey && 'selectionStart' in ae ? [ae.selectionStart, ae.selectionEnd] : null;
  const y = same ? scrollY : 0;
  let out = '', tab = '', noTabs = false;
  if (parts[0] !== 'new' && parts[0] !== 'edit' && E && !same) E = null;
  switch (parts[0]) {
    case 'inbox': out = vInbox(parts[1] === 'sleeping'); tab = 'inbox'; break;
    case 'box': out = vBox(); tab = 'box'; break;
    case 'n': out = vNote(parts[1]); tab = 'box'; break;
    case 'new': case 'edit': initEditor(parts, q); out = vEditor(); noTabs = true; break;
    case 'sources': out = vSources(); tab = 'sources'; break;
    case 's': out = vSource(parts[1]); tab = 'sources'; break;
    case 'views': out = vViews(parts[1] || 'index', q); tab = 'views'; break;
    case 'm': out = vMap(parts[1]); tab = 'views'; break;
    case 'write': out = vWrite(); tab = 'write'; break;
    case 'd': out = vDraft(parts[1]); tab = 'write'; break;
    case 'more': out = vMore(); break;
    default: out = vInbox(false); tab = 'inbox';
  }
  view.innerHTML = out;
  html.classList.toggle('no-tabs', noTabs);
  for (const a of $$('.tab')) { if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }
  for (const t of $$('textarea[data-grow]', view)) grow(t);
  if (parts[0] === 'new' || parts[0] === 'edit') edHints();
  if (focusKey) {
    const el = $(`#${CSS.escape(focusKey)}`, view) || $(`[data-bind="${focusKey}"]`, view);
    if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(...sel); } catch (e) { /* not a text field */ } }
  }
  if (!same) { lastKey = key; scrollTo(0, 0); if (!coarse && parts[0] === 'new' && !E?.body) $('#eBody')?.focus(); }
  else scrollTo(0, y);
  if (parts[0] === 'views' && q.get('k')) document.getElementById('kw-' + encodeURIComponent(q.get('k')))?.scrollIntoView({ block: 'center' });
  const titles = { inbox: 'Inbox', box: 'Box', sources: 'Sources', views: 'Views', write: 'Write', more: 'More' };
  document.title = (titles[parts[0]] ? titles[parts[0]] + ' · ' : '') + 'Slipbox';
}
addEventListener('hashchange', () => {
  if (E && dirty() && !/^#\/(new|edit)/.test(location.hash)) {
    if (!confirm('Leave without saving this note?')) { history.back(); return; }
    E = null;
  }
  if (sheet.open) closeSheet(null);
  render();
});
addEventListener('storage', (e) => { if (e.key === KEY) { S = load(); render(); } });

if (navigator.storage?.persisted) navigator.storage.persisted().then((p) => { html.dataset.persist = p ? 'yes' : 'no'; }).catch(() => {});
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
updateCount();
render();
window.__slipbox = { get S() { return S; }, Z }; // for tests
