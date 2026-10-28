// ScriptureBridge UI — Flow Visual Language components + GSAP with the FVL springs.
// Browse (bridges, Bible, threads, map, saved) → tap → Reader: one bridge, nothing else on screen.
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
// Move focus programmatically only for keyboard users: with touch or a mouse it would wake FVL's focus ring
// on an element that is still animating in, which looks like a stray outline.
let keyboardMode = false;
addEventListener('keydown', (e) => { if (!e.metaKey && !e.ctrlKey && !e.altKey) keyboardMode = true; }, true);
addEventListener('pointerdown', () => { keyboardMode = false; }, true);
const softFocus = (el) => { if (el && keyboardMode) el.focus({ preventScroll: true }); };

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

// ---------- language ----------
// The app language follows the Bible translation: BSB = English, UBG / Gdańska = Polish.
const STR = {
  en: {
    tagline: 'Old Testament promises and their New Testament fulfilments, across all 66 books.',
    'tab.bridges': 'Bridges', 'tab.bible': 'Bible', 'tab.threads': 'Threads', 'tab.map': 'Map', 'tab.saved': 'Saved', sections: 'Sections',
    'search.ph': 'Search verses, books or words', 'search.label': 'Search bridges', 'search.clear': 'Clear search',
    filterBtn: 'Book and relationship', clear: 'Clear', loading: 'Loading…', category: 'Category',
    apply: 'Show {n} {bridge}', noMatch: 'No bridges match', continue: 'Continue reading',
    'empty.desc': 'Try another word, or clear the filters.', clearFilters: 'Clear filters',
    all: 'All', allBooks: 'All books', ot: 'Old Testament', nt: 'New Testament', otBooks: 'Old Testament books', ntBooks: 'New Testament books',
    'filter.title': 'Filter bridges', 'filter.desc': 'Narrow the list by relationship and by book.', 'filter.rel': 'Relationship',
    'threads.lead': 'Six paths from Genesis to Revelation. Each one reads as a sequence, step by step.', allThreads: 'All threads', readThread: 'Read this thread',
    'map.title': 'Bridge map', 'map.lead': 'Old Testament on the left, New Testament on the right. Tap a book to see where its promises lead.',
    'map.clear': 'Clear selection', list: 'List', read: 'Read',
    'saved.emptyH': 'Nothing saved yet', 'saved.emptyD': 'Open a bridge and tap the star to keep it here.', 'saved.lead': '{n} {bridge}, in the order you saved them.',
    readSaved: 'Read saved', copyMd: 'Copy as Markdown', copiedMd: 'Copied as Markdown',
    'bible.lead': '{name}, with every OpenBible.info cross-reference. Tap any verse to see everything it connects to.',
    chooseCh: '{n} {chapter}. Choose one to read.', chapterErr: 'Could not load this chapter. Check your connection and try again.',
    verseAria: 'Verse {n}, show cross-references', chaptersNav: 'Chapters', translation: 'Translation',
    'xref.desc': '{n} {xref}, strongest first by OpenBible.info reader votes.', 'xref.none': 'No cross-references for this verse.',
    pointsTo: 'Points to', pointsToHint: 'Where this verse leads.', refBy: 'Referenced by', refByHint: 'Verses that point here.',
    showAll: 'Show all {n}', verseErr: 'Could not load this verse.', xrefErr: 'Could not load cross-references',
    nlt: 'Read in NLT', openBible: 'Open in Bible',
    'pos.step': '{title} · step {i} of {n}', 'pos.saved': 'Saved · {i} of {n}', 'pos.of': '{i} of {n}',
    promise: 'Promise', fulfilment: 'Fulfilment', why: 'Why they connect', motifs: 'Motifs',
    copyCite: 'Copy citation', citeCopied: 'Citation copied', onMap: 'Show on map', upNext: 'Up next',
    save: 'Save', unsave: 'Remove from saved', savedToast: 'Saved', removedToast: 'Removed from saved',
    next: 'Next', finish: 'Finish', finishA: 'Finish and go back', nextA: 'Next: {t}',
    back: 'Back to list', prevA: 'Previous bridge', readerNav: 'Bridge navigation', reader: 'Reader',
    fulfilledIn: ' fulfilled in ', rowSaved: 'Saved', rowRead: 'Read', votesTotal: '{n} {vote}', votesReal: 'OpenBible link: {n} {vote}',
    'tr.title': 'Bible translation', 'tr.desc': 'Also sets the app language: a Polish Bible switches the whole app to Polish. Cross-references work with all three.',
    'tr.aria': 'Bible translation: {name}', lang: 'English', classic: 'Classic layout',
    credits: 'Bible text: Berean Standard Bible (public domain); Uwspółcześniona Biblia Gdańska © Fundacja Wrota Nadziei, <a href="https://creativecommons.org/licenses/by-nd/4.0/" target="_blank" rel="noopener">CC BY-ND 4.0</a>, shown unchanged; Biblia Gdańska (1881), public domain. Cross-references: <a href="https://www.openbible.info/labs/cross-references/" target="_blank" rel="noopener">OpenBible.info</a>, CC BY. Hebrew and Greek: <a href="https://github.com/STEPBible/STEPBible-Data" target="_blank" rel="noopener">STEPBible.org</a> (Tyndale House, Cambridge), CC BY 4.0.',
    hebrew: 'Hebrew', greek: 'Greek', origWords: '{n} {word}', origHint: 'Tap a word for its meaning and every verse that uses it.',
    wordTimes: 'Used {n} {time} in the Bible', backTo: 'Back to {ref}', definition: 'Definition', occurrences: 'Where it appears',
    wordsLink: 'Words & cross-references', wordErr: 'Could not load this word.',
    passageErr: 'Could not load this passage.', loadErr: 'Could not load the bridges. Check your connection and reload.',
  },
  pl: {
    tagline: 'Obietnice Starego Testamentu i ich wypełnienie w Nowym Testamencie, we wszystkich 66 księgach.',
    'tab.bridges': 'Mosty', 'tab.bible': 'Biblia', 'tab.threads': 'Wątki', 'tab.map': 'Mapa', 'tab.saved': 'Zapisane', sections: 'Sekcje',
    'search.ph': 'Szukaj wersetów, ksiąg lub słów', 'search.label': 'Szukaj mostów', 'search.clear': 'Wyczyść wyszukiwanie',
    filterBtn: 'Księga i rodzaj powiązania', clear: 'Wyczyść', loading: 'Wczytywanie…', category: 'Kategoria',
    apply: 'Pokaż {n} {bridge}', noMatch: 'Brak pasujących mostów', continue: 'Czytaj dalej',
    'empty.desc': 'Spróbuj innego słowa albo wyczyść filtry.', clearFilters: 'Wyczyść filtry',
    all: 'Wszystkie', allBooks: 'Wszystkie księgi', ot: 'Stary Testament', nt: 'Nowy Testament', otBooks: 'Księgi Starego Testamentu', ntBooks: 'Księgi Nowego Testamentu',
    'filter.title': 'Filtruj mosty', 'filter.desc': 'Zawęź listę według rodzaju powiązania i księgi.', 'filter.rel': 'Rodzaj powiązania',
    'threads.lead': 'Sześć ścieżek od Księgi Rodzaju do Objawienia. Każdą czyta się po kolei, krok po kroku.', allThreads: 'Wszystkie wątki', readThread: 'Czytaj ten wątek',
    'map.title': 'Mapa mostów', 'map.lead': 'Stary Testament po lewej, Nowy po prawej. Dotknij księgi, aby zobaczyć, dokąd prowadzą jej obietnice.',
    'map.clear': 'Wyczyść wybór', list: 'Lista', read: 'Czytaj',
    'saved.emptyH': 'Nic jeszcze nie zapisano', 'saved.emptyD': 'Otwórz most i dotknij gwiazdki, aby go tu zachować.', 'saved.lead': '{n} {bridge}, w kolejności zapisywania.',
    readSaved: 'Czytaj zapisane', copyMd: 'Kopiuj jako Markdown', copiedMd: 'Skopiowano jako Markdown',
    'bible.lead': '{name} ze wszystkimi odnośnikami OpenBible.info. Dotknij dowolnego wersetu, aby zobaczyć wszystko, z czym się łączy.',
    chooseCh: '{n} {chapter}. Wybierz, który czytać.', chapterErr: 'Nie udało się wczytać rozdziału. Sprawdź połączenie i spróbuj ponownie.',
    verseAria: 'Werset {n}, pokaż odnośniki', chaptersNav: 'Rozdziały', translation: 'Przekład',
    'xref.desc': '{n} {xref}, najmocniejsze najpierw według głosów czytelników OpenBible.info.', 'xref.none': 'Brak odnośników dla tego wersetu.',
    pointsTo: 'Odsyła do', pointsToHint: 'Dokąd prowadzi ten werset.', refBy: 'Odsyłają tutaj', refByHint: 'Wersety, które odsyłają do tego miejsca.',
    showAll: 'Pokaż wszystkie ({n})', verseErr: 'Nie udało się wczytać wersetu.', xrefErr: 'Nie udało się wczytać odnośników',
    nlt: 'Czytaj w NLT (ang.)', openBible: 'Otwórz w Biblii',
    'pos.step': '{title} · krok {i} z {n}', 'pos.saved': 'Zapisane · {i} z {n}', 'pos.of': '{i} z {n}',
    promise: 'Obietnica', fulfilment: 'Wypełnienie', why: 'Dlaczego się łączą', motifs: 'Motywy',
    copyCite: 'Kopiuj cytat', citeCopied: 'Skopiowano cytat', onMap: 'Pokaż na mapie', upNext: 'Następny',
    save: 'Zapisz', unsave: 'Usuń z zapisanych', savedToast: 'Zapisano', removedToast: 'Usunięto z zapisanych',
    next: 'Dalej', finish: 'Zakończ', finishA: 'Zakończ i wróć', nextA: 'Dalej: {t}',
    back: 'Wróć do listy', prevA: 'Poprzedni most', readerNav: 'Nawigacja mostów', reader: 'Czytnik',
    fulfilledIn: ' wypełnione w ', rowSaved: 'Zapisane', rowRead: 'Przeczytane', votesTotal: '{n} {vote}', votesReal: 'Powiązanie w OpenBible: {n} {vote}',
    'tr.title': 'Przekład Biblii', 'tr.desc': 'Ustawia też język aplikacji: polski przekład przełącza całą aplikację na polski. Odnośniki działają ze wszystkimi trzema.',
    'tr.aria': 'Przekład Biblii: {name}', lang: 'Polski', classic: 'Układ klasyczny',
    credits: 'Tekst Biblii: Berean Standard Bible (domena publiczna); Uwspółcześniona Biblia Gdańska © Fundacja Wrota Nadziei, <a href="https://creativecommons.org/licenses/by-nd/4.0/" target="_blank" rel="noopener">CC BY-ND 4.0</a>, bez zmian; Biblia Gdańska (1881), domena publiczna. Odnośniki: <a href="https://www.openbible.info/labs/cross-references/" target="_blank" rel="noopener">OpenBible.info</a>, CC BY. Hebrajski i grecki: <a href="https://github.com/STEPBible/STEPBible-Data" target="_blank" rel="noopener">STEPBible.org</a> (Tyndale House, Cambridge), CC BY 4.0.',
    hebrew: 'Hebrajski', greek: 'Grecki', origWords: '{n} {word}', origHint: 'Dotknij słowa, aby zobaczyć jego znaczenie i wszystkie wersety, w których występuje.',
    wordTimes: 'Występuje {n} {time} w Biblii', backTo: 'Wróć do {ref}', definition: 'Definicja (po angielsku)', occurrences: 'Gdzie występuje',
    wordsLink: 'Słowa i odnośniki', wordErr: 'Nie udało się wczytać słowa.',
    passageErr: 'Nie udało się wczytać fragmentu.', loadErr: 'Nie udało się wczytać mostów. Sprawdź połączenie i odśwież stronę.',
  },
};
// Plural forms: English [one, other]; Polish [one, few (2–4, 22–24…), many].
const FORMS = {
  en: { bridge: ['bridge', 'bridges'], chapter: ['chapter', 'chapters'], xref: ['cross-reference', 'cross-references'], vote: ['vote', 'votes'], step: ['step', 'steps'], word: ['word', 'words'], time: ['time', 'times'], verse: ['verse', 'verses'] },
  pl: { bridge: ['most', 'mosty', 'mostów'], chapter: ['rozdział', 'rozdziały', 'rozdziałów'], xref: ['odnośnik', 'odnośniki', 'odnośników'], vote: ['głos', 'głosy', 'głosów'], step: ['krok', 'kroki', 'kroków'], word: ['słowo', 'słowa', 'słów'], time: ['raz', 'razy', 'razy'], verse: ['werset', 'wersety', 'wersetów'] },
};
const CAT_PL = { birth: 'Narodziny i rodowód', ministry: 'Posługa i znaki', passion: 'Męka i krzyż', resurrection: 'Zmartwychwstanie i panowanie', covenant: 'Przymierza i mądrość' };
const TYPE_PL = { 'Direct Prophecy': 'Proroctwo bezpośrednie', 'Typological Foreshadowing': 'Zapowiedź typologiczna', 'Direct Quotation': 'Bezpośredni cytat', 'Covenantal Promise': 'Obietnica przymierza', 'Thematic Parallel': 'Paralela tematyczna' };
const lang = () => (typeof trInfo === 'function' ? trInfo().lang : 'en') === 'pl' ? 'pl' : 'en';
function pluralForm(n, word) {
  const f = FORMS[lang()][word], a = Math.abs(n);
  if (lang() === 'en') return a === 1 ? f[0] : f[1];
  if (a === 1) return f[0];
  const d = a % 10, h = a % 100;
  return d >= 2 && d <= 4 && !(h >= 12 && h <= 14) ? f[1] : f[2];
}
const num = (n) => Number(n).toLocaleString(lang() === 'pl' ? 'pl-PL' : 'en-GB');
function t(key, vars = {}) {
  let s = STR[lang()][key] ?? STR.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (m, k) => {
    if (k in vars) return typeof vars[k] === 'number' ? num(vars[k]) : vars[k];
    if (FORMS.en[k]) return pluralForm(vars.n ?? 0, k);
    return m;
  });
}
const catLabel = (p) => (lang() === 'pl' ? CAT_PL[p.category] : p.categoryLabel) || p.categoryLabel;
const typeLabel = (ty) => (lang() === 'pl' ? TYPE_PL[ty] : ty) || ty;
// Localised bridge / thread: Polish fields merged over the English master when a Polish Bible is chosen.
function L(p) {
  const x = lang() === 'pl' && D.PL[p.id];
  if (!x) return p;
  return { ...p, title: x.title || p.title, eraGap: x.eraGap || p.eraGap, bridge: x.bridge || p.bridge, keywords: x.keywords || p.keywords,
    ot: { ...p.ot, author: x.ot?.author || p.ot.author, context: x.ot?.context || p.ot.context },
    nt: { ...p.nt, author: x.nt?.author || p.nt.author, context: x.nt?.context || p.nt.context } };
}
function LT(key) {
  const th = D.T[key], x = lang() === 'pl' && D.TPL[key];
  if (!x) return th;
  return { ...th, title: x.title || th.title, subtitle: x.subtitle || th.subtitle, description: x.description || th.description,
    steps: th.steps.map((st, i) => ({ ...st, stage: x.steps?.[i]?.stage || st.stage, note: x.steps?.[i]?.note || st.note, highlight: x.steps?.[i]?.highlight || st.highlight })) };
}
// Book names in references ("Isaiah 53:5" -> "Izajasza 53:5"), longest names first so "1 John" wins over "John".
let REF_RE = null;
function locRef(ref) {
  if (lang() !== 'pl' || !BIB.meta) return ref;
  if (!REF_RE) {
    const names = [...BIB.byName.keys()].sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    REF_RE = new RegExp(`(^|;\\s*)(${names.join('|')})(?=\\s+\\d)`, 'gi');
  }
  return ref.replace(REF_RE, (m, pre, name) => pre + refName(BIB.byName.get(name.toLowerCase())));
}
const dispBook = (name) => { const b = BIB.byName.get(String(name).toLowerCase()); return b ? bookName(b) : name; };
function applyStatic() {
  root.lang = lang();
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  $$('[data-i18n-attr]').forEach((el) => el.dataset.i18nAttr.split(';').forEach((pair) => { const [a, k] = pair.split(':'); el.setAttribute(a, t(k)); }));
}

// ---------- state ----------
const CATS = ['birth', 'ministry', 'passion', 'resurrection', 'covenant'];
const TABS = ['bridges', 'bible', 'threads', 'map', 'saved'];
const S = { tab: null, cat: 'all', type: 'all', book: null, q: '', mapCat: 'all', mapBook: null, mapScroll: false, bible: {}, thread: null, mapDrawn: false };
const D = { P: [], byId: new Map(), T: {}, OT: [], NT: [], catLabel: {}, PL: {}, TPL: {}, EV: {} };
let saved = store.get('scripturebridge_saved_v2', []);
const readSet = new Set(store.get('sb_read_v1', []));
let lastRead = store.get('sb_last_v1', null);

// ---------- data ----------
async function load() {
  const get = (f) => fetch('data/' + f).then((r) => { if (!r.ok) throw new Error(f); return r.json(); });
  const [books, P, T] = await Promise.all([get('books_66.json'), get('prophecies_66_books.json'), get('canonical_threads.json'), bibleMeta()]);
  D.P = P; D.T = T; D.OT = books.old_testament; D.NT = books.new_testament;
  P.forEach((p) => { D.byId.set(p.id, p); D.catLabel[p.category] = D.catLabel[p.category] || p.categoryLabel; });
  // Polish versions of the bridges and threads (English stays the master; missing pieces fall back to it).
  const [pl, tpl, ev] = await Promise.all([get('pl/prophecies.json').catch(() => []), get('pl/threads.json').catch(() => ({})), get('evidence.json').catch(() => ({}))]);
  D.EV = ev; // checks computed from the texts and OpenBible (scripts/build_evidence.py)
  pl.forEach((x) => { D.PL[x.id] = x; });
  D.TPL = tpl;
}

function filtered() {
  const q = S.q.toLowerCase();
  return D.P.filter((p) => {
    if (S.cat !== 'all' && p.category !== S.cat) return false;
    if (S.type !== 'all' && p.type !== S.type) return false;
    if (S.book && !(p.ot.book === S.book || p.nt.book === S.book || refTouches(p.ot.ref, S.book) || refTouches(p.nt.ref, S.book))) return false;
    if (!q) return true;
    const x = L(p);
    return [p.title, p.ot.ref, p.nt.ref, p.ot.book, p.nt.book, p.ot.text, p.nt.text, p.bridge, ...p.keywords, x.title, x.bridge, ...x.keywords, locRef(p.ot.ref), locRef(p.nt.ref)]
      .some((s) => String(s).toLowerCase().includes(q));
  });
}

// ---------- rows ----------
function rowHTML(p0, { summary = true } = {}) {
  const p = L(p0);
  const isRead = readSet.has(p.id), isSaved = saved.includes(p.id);
  return `<li><button type="button" class="row${isRead ? ' is-read' : ''}" data-id="${esc(p.id)}">
    <span class="row-head">
      <span class="kicker"><span class="dot c-${esc(p.category)}"></span>${esc(catLabel(p))}</span>
      <span class="row-marks">${isSaved ? `<fvl-icon class="saved" name="star" label="${esc(t('rowSaved'))}"></fvl-icon>` : ''}${isRead ? `<fvl-icon name="check" label="${esc(t('rowRead'))}"></fvl-icon>` : ''}</span>
    </span>
    <span class="row-title">${esc(p.title)}</span>
    <span class="refs">${esc(locRef(p.ot.ref))} <span aria-hidden="true">→</span><span class="sr">${esc(t('fulfilledIn'))}</span> ${esc(locRef(p.nt.ref))}</span>
    ${summary ? `<span class="row-sum">${esc(p.bridge)}</span>` : ''}
  </button></li>`;
}

// ---------- bridges ----------
function buildFilters() {
  const tag = (v, label, sel) => `<fvl-tag selectable value="${v}"${sel ? ' selected' : ''}>${v === 'all' ? '' : `<span slot="leading" class="dot c-${v}"></span>`}${esc(label)}</fvl-tag>`;
  const tags = (cur) => tag('all', t('all'), cur === 'all') + CATS.map((c) => tag(c, lang() === 'pl' ? CAT_PL[c] : (D.catLabel[c] || c), cur === c)).join('');
  $('#cats').innerHTML = tags(S.cat);
  $('#mapCats').innerHTML = tags(S.mapCat);
  const types = [...new Set(D.P.map((p) => p.type))];
  $('#types').innerHTML = ['all', ...types].map((ty) => `<fvl-tag selectable value="${esc(ty)}"${ty === S.type ? ' selected' : ''}>${ty === 'all' ? esc(t('all')) : esc(typeLabel(ty))}</fvl-tag>`).join('');
  const groups = [[t('ot'), D.OT], [t('nt'), D.NT]];
  const count = (b) => D.P.filter((p) => p.ot.book === b || p.nt.book === b || refTouches(p.ot.ref, b) || refTouches(p.nt.ref, b)).length;
  $('#bookGroups').innerHTML = `<div class="book-grid"><button type="button" class="book all" data-book="" aria-pressed="true">${esc(t('allBooks'))} <span>${D.P.length}</span></button></div>` +
    groups.map(([name, list]) => `<div class="book-group"><h3>${name}</h3><div class="book-grid">${list.map((b) =>
      `<button type="button" class="book" data-book="${esc(b.name)}" aria-pressed="false">${esc(dispBook(b.name))} <span>${count(b.name)}</span></button>`).join('')}</div></div>`).join('');
  syncBookUI();
}
function syncChips(group, cur) { $$('fvl-tag', group).forEach((t) => { t.selected = t.getAttribute('value') === cur; }); }

function renderBridges() {
  const list = filtered();
  $('#count').textContent = `${num(list.length)} ${pluralForm(list.length, 'bridge')}`;
  $('#applyBtn').textContent = list.length ? t('apply', { n: list.length }) : t('noMatch');
  const active = [S.book && dispBook(S.book), S.type !== 'all' && typeLabel(S.type)].filter(Boolean);
  $('#filterLabel').textContent = active.length ? active.join(' · ') : t('filterBtn');
  $('#clearBtn').hidden = !(active.length || S.cat !== 'all' || S.q);
  const last = lastRead && D.byId.get(lastRead);
  $('#continue').innerHTML = last && !S.q && S.cat === 'all' && !S.book && S.type === 'all'
    ? `<button type="button" class="continue" data-id="${esc(last.id)}"><span><small>${esc(t('continue'))}</small><b>${esc(L(last).title)}</b></span><fvl-icon name="arrow-right" size="md"></fvl-icon></button>` : '';
  $('#list').innerHTML = list.length ? list.map((p) => rowHTML(p)).join('')
    : `<li><fvl-empty icon="search" heading="${esc(t('noMatch'))}" description="${esc(t('empty.desc'))}"><fvl-button slot="actions" variant="secondary" id="reset">${esc(t('clearFilters'))}</fvl-button></fvl-empty></li>`;
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
  const th = S.thread && D.T[S.thread] && LT(S.thread);
  if (!th) {
    v.innerHTML = `<div class="section-head"><h2>${esc(t('tab.threads'))}</h2><p>${esc(t('threads.lead'))}</p></div>
      <ol class="list">${Object.keys(D.T).map((k) => { const x = LT(k); return `<li><button type="button" class="row" data-thread="${esc(k)}">
        <span class="kicker">${num(x.steps.length)} ${pluralForm(x.steps.length, 'step')}</span><span class="row-title">${esc(x.title)}</span><span class="row-sum">${esc(x.subtitle)}</span></button></li>`; }).join('')}</ol>`;
    return;
  }
  v.innerHTML = `<div class="actions"><fvl-button variant="tertiary" size="sm" data-go="#/threads"><fvl-icon name="arrow-left"></fvl-icon>${esc(t('allThreads'))}</fvl-button></div>
    <div class="section-head"><h2>${esc(th.title)}</h2><p>${esc(th.description)}</p></div>
    <div class="actions"><fvl-button variant="primary" data-read-thread="${esc(S.thread)}">${esc(t('readThread'))}</fvl-button></div>
    <ol class="list">${th.steps.map((st, i) => {
      const p = D.byId.get(st.prophecyId);
      return `<li><button type="button" class="row${p && readSet.has(p.id) ? ' is-read' : ''}" data-id="${esc(st.prophecyId)}" data-step="${i}">
        <span class="kicker"><span class="step-n">${i + 1}</span><span aria-hidden="true">·</span>${esc(locRef(st.ref))}</span>
        <span class="row-title">${esc(st.stage.replace(/^\d+\.\s*/, ''))}</span><span class="row-sum">${esc(st.note)}</span></button></li>`;
    }).join('')}</ol>`;
}

// ---------- map ----------
// Two columns (OT left, NT right) in canonical order, bridges drawn as curves between them.
// Books are the tap targets; tapping one lights its bridges and slides up a bar to list or read them.
const ROW = 32; // px per Old Testament book; the New Testament column spreads over the same height
const touches = (p, b) => p.ot.book === b || p.nt.book === b || refTouches(p.ot.ref, b) || refTouches(p.nt.ref, b);
const inMapCat = (p) => S.mapCat === 'all' || p.category === S.mapCat;
function mapBridges(book) { return D.P.filter((p) => inMapCat(p) && (!book || touches(p, book))); }
function renderMap(animate, grow) {
  const H = D.OT.length * ROW;
  const P = mapBridges(null);
  const sel = S.mapBook;
  const selP = sel ? P.filter((p) => touches(p, sel)) : [];
  const onIds = new Set(selP.map((p) => p.id));
  const linked = new Set(selP.flatMap((p) => [p.ot.book, p.nt.book]));
  const bmap = $('#bmap');
  bmap.style.setProperty('--bmap-h', H + 'px');
  bmap.classList.toggle('has-sel', !!sel);
  const col = (books) => books.map((b) => {
    const n = P.filter((p) => touches(p, b.name)).length;
    const cls = ['bbook', n ? '' : 'none', b.name === sel ? 'sel' : '', sel && b.name !== sel && linked.has(b.name) ? 'linked' : ''].filter(Boolean).join(' ');
    return `<button type="button" class="${cls}" data-book="${esc(b.name)}" aria-pressed="${b.name === sel}"${n ? '' : ' disabled'} aria-label="${esc(dispBook(b.name))}, ${num(n)} ${pluralForm(n, 'bridge')}"><span class="bname">${esc(dispBook(b.name))}</span><span class="n">${n || ''}</span></button>`;
  }).join('');
  $('#otCol').innerHTML = col(D.OT);
  $('#ntCol').innerHTML = col(D.NT);
  const oi = new Map(D.OT.map((b, i) => [b.name, i])), ni = new Map(D.NT.map((b, i) => [b.name, i]));
  const yO = (i) => (i + 0.5) * (H / D.OT.length), yN = (i) => (i + 0.5) * (H / D.NT.length);
  const curve = (p) => {
    if (!oi.has(p.ot.book) || !ni.has(p.nt.book)) return '';
    const a = yO(oi.get(p.ot.book)), b = yN(ni.get(p.nt.book));
    return `<path class="curve c-${esc(p.category)}${onIds.has(p.id) ? ' on' : ''}" d="M0 ${a} C50 ${a}, 50 ${b}, 100 ${b}"/>`;
  };
  const svg = $('#curves');
  svg.setAttribute('viewBox', `0 0 100 ${H}`);
  svg.innerHTML = P.filter((p) => !onIds.has(p.id)).map(curve).join('') + selP.map(curve).join('');
  if (window.DrawSVGPlugin && !reduced) {
    if (animate) gsap.from('#curves .curve', { drawSVG: '0%', stagger: 0.004, ...spring.grow });
    else if (grow && sel) {
      const fromRight = D.NT.some((b) => b.name === sel);
      gsap.from('#curves .curve.on', { drawSVG: fromRight ? '100% 100%' : '0%', stagger: 0.02, ...spring.carve });
    }
  }
  renderMapBar(selP);
}
function renderMapBar(selP) {
  const bar = $('#mapBar'), sel = S.mapBook, was = !bar.hidden;
  $('#view-map').classList.toggle('with-bar', !!sel);
  if (!sel) {
    if (was) gsap.to(bar, { yPercent: 100, duration: reduced ? 0 : 0.2, ease: 'power1.in', onComplete: () => { bar.hidden = true; gsap.set(bar, { clearProps: 'transform' }); } });
    return;
  }
  $('#mbSide').textContent = D.NT.some((b) => b.name === sel) ? t('nt') : t('ot');
  $('#mbBook').textContent = dispBook(sel);
  $('#mbCount').textContent = `${num(selP.length)} ${pluralForm(selP.length, 'bridge')}`;
  if (!was) { bar.hidden = false; gsap.fromTo(bar, { yPercent: 100 }, { yPercent: 0, ...spring.arrive }); }
}
function selectMapBook(name) {
  S.mapBook = S.mapBook === name ? null : name;
  renderMap(false, true);
}

// ---------- saved ----------
function renderSaved() {
  const v = $('#view-saved');
  const items = saved.map((id) => D.byId.get(id)).filter(Boolean);
  if (!items.length) {
    v.innerHTML = `<fvl-empty icon="star" heading="${esc(t('saved.emptyH'))}" description="${esc(t('saved.emptyD'))}"></fvl-empty>`;
    return;
  }
  v.innerHTML = `<div class="section-head"><h2>${esc(t('tab.saved'))}</h2><p>${esc(t('saved.lead', { n: items.length }))}</p></div>
    <div class="actions"><fvl-button variant="primary" data-read-saved>${esc(t('readSaved'))}</fvl-button><fvl-button variant="secondary" data-copy-md><fvl-icon name="copy"></fvl-icon>${esc(t('copyMd'))}</fvl-button></div>
    <ol class="list">${items.map((p) => rowHTML(p)).join('')}</ol>`;
}

// ---------- Bible: BSB text + OpenBible cross-references, one small file per chapter ----------
const BIB = { meta: null, byOsis: new Map(), byName: new Map(), text: new Map(), xref: new Map() };
async function bibleMeta() {
  if (BIB.meta) return BIB.meta;
  const m = await fetch('data/bible/books.json').then((r) => { if (!r.ok) throw new Error('books.json'); return r.json(); });
  m.books.forEach((b, i) => { b.index = i; BIB.byOsis.set(b.osis, b); BIB.byName.set(b.name.toLowerCase(), b); });
  [['psalm', 'Ps'], ['song of songs', 'Song'], ['revelation of john', 'Rev']].forEach(([n, o]) => BIB.byName.set(n, BIB.byOsis.get(o)));
  BIB.meta = m;
  return m;
}
function cached(map, key, load) {
  if (!map.has(key)) map.set(key, load().catch((err) => { map.delete(key); throw err; }));
  return map.get(key);
}
const getJSON = (url) => fetch(url).then((r) => { if (!r.ok) throw new Error(url); return r.json(); });
// Translation: BSB (English), UBG or Gdańska (Polish). Same versification, so cross-references work for all three.
const TR = { id: store.get('sb_tr', 'bsb') };
const trInfo = () => BIB.meta?.translations.find((t) => t.id === TR.id) || BIB.meta?.translations[0] || { id: 'bsb', lang: 'en', empty: '' };
const bookName = (b) => (trInfo().lang === 'pl' ? b.namePl : b.name) || b.name;
// In references the Psalter reads as one psalm ("Psalm 23:1"), not "Psalms 23:1".
const refName = (b) => (b.osis === 'Ps' ? 'Psalm' : bookName(b));
const emptyVerse = () => `<em class="omit">${esc(trInfo().empty || 'Not in the earliest manuscripts.')}</em>`;
const chapterText = (osis, c, tr = trInfo().id) => cached(BIB.text, `${tr}:${osis}/${c}`, () => getJSON(`data/bible/${tr}/${osis}/${c}.json`));
function trPicker() {
  const ts = BIB.meta.translations;
  if (ts.length < 2) return '';
  return `<fvl-segmented id="trPick" value="${esc(trInfo().id)}" aria-label="${esc(t('translation'))}">${ts.map((t) => `<fvl-segment value="${esc(t.id)}">${esc(t.label)}</fvl-segment>`).join('')}</fvl-segmented>`;
}
const chapterXref = (osis, c) => cached(BIB.xref, `${osis}/${c}`, () => getJSON(`data/bible/xref/${osis}/${c}.json`).catch(() => ({})));
const chapterXin = (osis, c) => cached(BIB.xref, `in:${osis}/${c}`, () => getJSON(`data/bible/xin/${osis}/${c}.json`).catch(() => ({})));
// Hebrew / Greek words per chapter, lexicon and occurrence buckets (STEPBible data, CC BY 4.0).
const chapterOrig = (osis, c) => cached(BIB.xref, `orig:${osis}/${c}`, () => getJSON(`data/orig/${osis}/${c}.json`).catch(() => ({})));
const bucketOf = (strong) => `${strong[0]}/${Math.floor(Number(strong.slice(1, 5)) / 100)}`;
const lexEntry = (strong) => cached(BIB.xref, `lex:${bucketOf(strong)}`, () => getJSON(`data/lex/${bucketOf(strong)}.json`)).then((d) => d[strong]);
const occList = (strong) => cached(BIB.xref, `occ:${bucketOf(strong)}`, () => getJSON(`data/occ/${bucketOf(strong)}.json`)).then((d) => d[strong] || []);
const nltUrl = (q) => 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(q) + '&version=NLT';
const nltLink = (q, label = t('nlt')) => `<a class="ext" href="${nltUrl(q)}" target="_blank" rel="noopener">${label}<fvl-icon name="external-link"></fvl-icon></a>`;

// "Rom.5.8", "1John.4.9-10", "Gen.1.31-Gen.2.3"
function parseTarget(t) {
  const [a, b] = t.split('-');
  const [osis, c, v] = a.split('.');
  let end = null;
  if (b) { const q = b.split('.'); end = q.length === 3 ? { osis: q[0], c: +q[1], v: +q[2] } : { osis, c: +c, v: +q[0] }; }
  return { osis, c: +c, v: +v, end };
}
function refLabel(t) {
  const r = parseTarget(t), name = (o) => (BIB.byOsis.get(o) ? refName(BIB.byOsis.get(o)) : o);
  let s = `${name(r.osis)} ${r.c}:${r.v}`;
  if (r.end) s += r.end.osis !== r.osis ? `–${name(r.end.osis)} ${r.end.c}:${r.end.v}` : r.end.c !== r.c ? `–${r.end.c}:${r.end.v}` : `–${r.end.v}`;
  return s;
}
async function targetText(t) {
  const r = parseTarget(t);
  const vs = await chapterText(r.osis, r.c);
  const sameCh = !r.end || (r.end.osis === r.osis && r.end.c === r.c);
  const last = r.end ? (sameCh ? r.end.v : vs.length) : r.v;
  const cap = Math.min(last, r.v + 3);
  let s = vs.slice(r.v - 1, cap).filter(Boolean).join(' ');
  if (cap < last || !sameCh) s += ' …';
  return s;
}
// "Luke 1:46-55, 69; Acts 2" -> { osis: 'Luke', c: 1, v: 46 }
function humanRef(ref) {
  const m = ref.split(';')[0].trim().match(/^((?:[123]\s)?[A-Za-z][A-Za-z ]*?)\s+(\d+)(?::(\d+))?/);
  const b = m && BIB.byName.get(m[1].toLowerCase());
  return b ? { osis: b.osis, c: +m[2], v: m[3] ? +m[3] : null } : null;
}
// "Exodus 16:15; 17:6", "Psalm 22:1, 7-8", "Galatians 4:4; Revelation 12:5" -> [{ osis, c, ranges: [[v1, v2], ...], label }]
function parseRefList(ref) {
  const out = [];
  let book = null, ch = null;
  for (const raw of ref.split(';')) {
    const seg = raw.trim();
    if (!seg) continue;
    let rest = seg;
    const m = seg.match(/^((?:[123]\s)?[A-Za-z][A-Za-z ]*?)\s+(\d.*)$/);
    if (m && BIB.byName.get(m[1].toLowerCase())) { book = BIB.byName.get(m[1].toLowerCase()); rest = m[2]; }
    if (!book) continue;
    const cm = rest.match(/^(\d+):(.+)$/);
    let spec;
    if (cm) { ch = +cm[1]; spec = cm[2]; } else if (ch) spec = rest; else { ch = +rest; spec = ''; }
    const ranges = spec.split(',').map((x) => x.trim()).filter(Boolean).map((x) => { const [a, b] = x.split('-').map(Number); return [a, b || a]; });
    out.push({ osis: book.osis, c: ch, ranges, spec });
  }
  return out;
}
async function passageHTML(ref) {
  const segs = parseRefList(ref);
  const parts = await Promise.all(segs.map(async (sg) => {
    const vs = await chapterText(sg.osis, sg.c);
    const pieces = (sg.ranges.length ? sg.ranges : [[1, vs.length]]).map(([a, b]) => vs.slice(a - 1, b).filter(Boolean).join(' '));
    return { label: `${refName(BIB.byOsis.get(sg.osis))} ${sg.c}${sg.spec ? ':' + sg.spec : ''}`, text: pieces.filter(Boolean).join(' … ') };
  }));
  if (parts.length === 1) return esc(parts[0].text);
  return parts.map((x) => `<span class="seg"><span class="seg-ref">${esc(x.label)}</span> ${esc(x.text)}</span>`).join(' ');
}
async function passagePlain(ref) {
  const segs = parseRefList(ref);
  const texts = await Promise.all(segs.map(async (sg) => { const vs = await chapterText(sg.osis, sg.c); return (sg.ranges.length ? sg.ranges : [[1, vs.length]]).map(([a, b]) => vs.slice(a - 1, b).filter(Boolean).join(' ')).join(' … '); }));
  return texts.join(' … ');
}
const bibleHash = (r) => `#/bible/${r.osis}/${r.c}${r.v ? '/' + r.v : ''}`;
function neighbour(osis, c, d) {
  const b = BIB.byOsis.get(osis);
  if (d < 0) { if (c > 1) return { osis, c: c - 1 }; const pb = BIB.meta.books[b.index - 1]; return pb ? { osis: pb.osis, c: pb.verses.length } : null; }
  if (c < b.verses.length) return { osis, c: c + 1 };
  const nb = BIB.meta.books[b.index + 1]; return nb ? { osis: nb.osis, c: 1 } : null;
}
const chName = (r) => `${refName(BIB.byOsis.get(r.osis))} ${r.c}`;
let bibleToken = 0;

async function renderBible() {
  const v = $('#view-bible');
  await bibleMeta();
  const { osis, c, v: verse } = S.bible;
  const b = osis && BIB.byOsis.get(osis);
  if (!b) {
    const pos = store.get('sb_bible_pos', null);
    const posOk = pos && BIB.byOsis.get(pos.osis);
    v.innerHTML = `<div class="section-head"><h2>${esc(t('tab.bible'))}</h2><p>${esc(t('bible.lead', { name: trInfo().name }))}</p></div>
      <div class="nav-scroll">${trPicker()}</div>
      ${posOk ? `<button type="button" class="continue" data-go="#/bible/${pos.osis}/${pos.c}"><span><small>${esc(t('continue'))}</small><b>${esc(chName(pos))}</b></span><fvl-icon name="arrow-right" size="md"></fvl-icon></button>` : ''}
      <div>${['OT', 'NT'].map((tt) => `<div class="book-group"><h3>${esc(t(tt === 'OT' ? 'ot' : 'nt'))}</h3><div class="book-grid">${BIB.meta.books.filter((x) => x.testament === tt).map((x) =>
        `<button type="button" class="book" data-go="#/bible/${x.osis}">${esc(bookName(x))} <span>${x.verses.length}</span></button>`).join('')}</div></div>`).join('')}</div>`;
    return;
  }
  if (!c || !b.verses[c - 1]) {
    v.innerHTML = `<div class="actions"><fvl-button variant="tertiary" size="sm" data-go="#/bible"><fvl-icon name="arrow-left"></fvl-icon>${esc(t('allBooks'))}</fvl-button></div>
      <div class="section-head"><h2>${esc(bookName(b))}</h2><p>${esc(t('chooseCh', { n: b.verses.length }))}</p></div>
      <div class="ch-grid">${b.verses.map((_, i) => `<button type="button" class="ch" data-go="#/bible/${b.osis}/${i + 1}">${i + 1}</button>`).join('')}</div>`;
    return;
  }
  const token = ++bibleToken;
  const prev = neighbour(osis, c, -1), next = neighbour(osis, c, 1);
  v.innerHTML = `<div class="ch-head">
      <fvl-button variant="tertiary" size="sm" data-go="#/bible/${b.osis}"><fvl-icon name="arrow-left"></fvl-icon>${esc(bookName(b))}</fvl-button>
      ${nltLink(`${b.name} ${c}`)}
    </div>
    <div class="nav-scroll">${trPicker()}</div>
    <h2 class="ch-title">${esc(refName(b))} ${c}</h2>
    <p class="ch-text" id="chText" aria-busy="true" lang="${esc(trInfo().lang)}"></p>
    <nav class="ch-nav" aria-label="${esc(t('chaptersNav'))}">
      ${prev ? `<fvl-button variant="secondary" data-go="${bibleHash(prev)}"><fvl-icon name="chevron-left"></fvl-icon>${esc(chName(prev))}</fvl-button>` : '<span></span>'}
      ${next ? `<fvl-button variant="primary" data-go="${bibleHash(next)}">${esc(chName(next))}<fvl-icon name="chevron-right"></fvl-icon></fvl-button>` : '<span></span>'}
    </nav>`;
  let text, xr;
  try { [text, xr] = await Promise.all([chapterText(osis, c), chapterXref(osis, c)]); }
  catch { if (token === bibleToken) $('#chText').textContent = t('chapterErr'); return; }
  if (token !== bibleToken) return;
  const el = $('#chText');
  el.removeAttribute('aria-busy');
  el.innerHTML = text.map((vt, i) => {
    const n = i + 1;
    return `<span class="verse" data-v="${n}" role="button" tabindex="0" aria-label="${esc(t('verseAria', { n }))}"><sup>${n}</sup>${vt ? esc(vt) : emptyVerse()}</span> `;
  }).join('');
  store.set('sb_bible_pos', { osis, c });
  if (verse) {
    const vEl = $(`.verse[data-v="${verse}"]`, el);
    if (vEl) { vEl.classList.add('sel'); requestAnimationFrame(() => vEl.scrollIntoView({ block: 'center' })); }
  }
}

// OpenBible lists each link one way, so a verse shows two groups:
// "Points to" (its own links) and "Referenced by" (verses whose links land here).
async function openXref(osis, c, v) {
  const b = BIB.byOsis.get(osis);
  const [text, xo, xi, og] = await Promise.all([chapterText(osis, c), chapterXref(osis, c), chapterXin(osis, c), chapterOrig(osis, c)]);
  const out = xo[v] || [], inc = xi[v] || [], ow = og[v] || [];
  const heb = b.testament === 'OT';
  const dr = $('#xrefSheet');
  dr.setAttribute('heading', `${refName(b)} ${c}:${v}`);
  const n = out.length + inc.length;
  dr.setAttribute('description', n ? t('xref.desc', { n }) : t('xref.none'));
  S.xref = { out: { list: out, shown: 12 }, inc: { list: inc, shown: 12 } };
  const group = (key, label, hint, list) => list.length ? `<section class="xgroup" aria-label="${label}">
      <div class="xgroup-head"><p class="p-label">${label} · ${num(list.length)}</p><p class="note">${hint}</p></div>
      <ol class="list sheet-list" id="x-${key}"></ol><div id="x-${key}-more"></div></section>` : '';
  $('#xrefBody').innerHTML = `<blockquote class="p-text" lang="${esc(trInfo().lang)}">${text[v - 1] ? esc(text[v - 1]) : emptyVerse()}</blockquote>
    <div class="actions">${nltLink(`${b.name} ${c}:${v}`)}</div>
    ${ow.length ? `<section class="xgroup" aria-label="${esc(t(heb ? 'hebrew' : 'greek'))}">
      <div class="xgroup-head"><p class="p-label">${esc(t(heb ? 'hebrew' : 'greek'))} · ${esc(t('origWords', { n: ow.length }))}</p><p class="note">${esc(t('origHint'))}</p></div>
      <div class="wgrid ${heb ? 'he' : 'grc'}" dir="${heb ? 'rtl' : 'ltr'}">${ow.map(([w, tr, gl, st]) => `<button type="button" class="wchip" data-word="${esc(st || '')}" ${st ? '' : 'disabled'}>
        <span class="w" lang="${heb ? 'he' : 'grc'}">${esc(w)}</span><span class="tr" dir="ltr">${esc(tr)}</span><span class="gl" dir="ltr">${esc(gl.replace(/[<>]/g, ''))}</span></button>`).join('')}</div>
    </section>` : ''}
    ${group('out', t('pointsTo'), t('pointsToHint'), out)}
    ${group('inc', t('refBy'), t('refByHint'), inc)}`;
  if (out.length) renderXrefItems('out');
  if (inc.length) renderXrefItems('inc');
  S.sheetBack = null;
  S.sheetVerse = { osis, c, v };
  dr.show();
}
// A word opens inside the same sheet (no second layer): meaning, Strong's number, every verse that uses it.
async function openWord(strong) {
  const body = $('#xrefBody'), dr = $('#xrefSheet'), sv = S.sheetVerse;
  S.sheetBack = { html: body.innerHTML, heading: dr.getAttribute('heading'), description: dr.getAttribute('description'), scroll: body.closest('fvl-drawer') ? 0 : 0 };
  let e, occ;
  try { [e, occ] = await Promise.all([lexEntry(strong), occList(strong)]); } catch { toast.warning(t('wordErr')); return; }
  if (!e) { toast.warning(t('wordErr')); return; }
  const heb = strong[0] === 'H';
  dr.setAttribute('heading', `${e.l} · ${e.t}`);
  dr.setAttribute('description', `${t(heb ? 'hebrew' : 'greek')} · ${strong} · ${t('wordTimes', { n: e.n })}`);
  S.occ = { list: occ, shown: 40 };
  const backRef = sv ? `${refName(BIB.byOsis.get(sv.osis))} ${sv.c}:${sv.v}` : '';
  body.innerHTML = `<div class="actions"><fvl-button variant="tertiary" size="sm" data-sheet-back><fvl-icon name="arrow-left"></fvl-icon>${esc(t('backTo', { ref: backRef }))}</fvl-button></div>
    <div class="wordhead"><span class="lemma" lang="${heb ? 'he' : 'grc'}" dir="${heb ? 'rtl' : 'ltr'}">${esc(e.l)}</span><span class="gloss">${esc(e.g)}</span></div>
    <section class="xgroup"><p class="p-label">${esc(t('definition'))}</p><p class="wdef" lang="en">${esc(e.d)}</p></section>
    <section class="xgroup"><p class="p-label">${esc(t('occurrences'))} · ${num(occ.length)} ${pluralForm(occ.length, 'verse')}</p><div class="occ" id="occList"></div><div id="occMore"></div></section>`;
  renderOcc();
  gsap.fromTo(body, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: reduced ? 0 : 0.28, ease: 'power2.out', clearProps: 'opacity,transform' });
}
function renderOcc() {
  const { list, shown } = S.occ;
  $('#occList').innerHTML = list.slice(0, shown).map((r) => { const [o, c, v] = r.split('.'); const b = BIB.byOsis.get(o);
    return `<button type="button" class="occ-ref" data-go="#/bible/${o}/${c}/${v}">${esc(`${refName(b)} ${c}:${v}`)}</button>`; }).join('');
  $('#occMore').innerHTML = list.length > shown ? `<fvl-button variant="secondary" size="sm" data-occ-more>${esc(t('showAll', { n: list.length }))}</fvl-button>` : '';
}
function sheetBack() {
  const sb = S.sheetBack; if (!sb) return;
  const body = $('#xrefBody'), dr = $('#xrefSheet');
  body.innerHTML = sb.html; dr.setAttribute('heading', sb.heading); dr.setAttribute('description', sb.description);
  S.sheetBack = null;
  gsap.fromTo(body, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: reduced ? 0 : 0.28, ease: 'power2.out', clearProps: 'opacity,transform' });
}
function renderXrefItems(key) {
  const g = S.xref[key];
  $(`#x-${key}`).innerHTML = g.list.slice(0, g.shown).map(([tg, votes]) => {
    const r = parseTarget(tg);
    return `<li><button type="button" class="row xref" data-go="${bibleHash(r)}"><span class="row-head"><span class="refs">${esc(refLabel(tg))}</span><span class="kicker">${t('votesTotal', { n: votes })}</span></span><span class="xtext" lang="${esc(trInfo().lang)}" data-t="${esc(tg)}">…</span></button></li>`;
  }).join('');
  $(`#x-${key}-more`).innerHTML = g.list.length > g.shown ? `<fvl-button variant="secondary" size="sm" data-more="${key}">${esc(t('showAll', { n: g.list.length }))}</fvl-button>` : '';
  $$(`#x-${key} .xtext`).forEach(async (el) => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    try { el.textContent = (await targetText(el.dataset.t)) || trInfo().empty; } catch { el.textContent = t('verseErr'); }
  });
}

// Citation text in the current language; Polish quotes come from the chosen Polish Bible, with its name.
async function citation(p0) {
  const p = L(p0), pl = lang() === 'pl';
  const [ot, nt] = pl ? await Promise.all([passagePlain(p.ot.ref), passagePlain(p.nt.ref)]).catch(() => [p.ot.text, p.nt.text]) : [p.ot.text, p.nt.text];
  const src = pl ? ` (${trInfo().name})` : '';
  const head = `${p.title} (${typeLabel(p.type)})`, a = locRef(p.ot.ref), b = locRef(p.nt.ref);
  return {
    plain: `${head}\n${a}: "${ot}"${src}\n${b}: "${nt}"${src}\n${t('why')}: ${p.bridge}`,
    md: `### ${head}\n- **${a}:** "${ot}"${src}\n- **${b}:** "${nt}"${src}\n- **${t('why')}:** ${p.bridge}`,
  };
}

// ---------- tabs ----------
const views = Object.fromEntries(TABS.map((t) => [t, $('#view-' + t)]));
function renderTab(t, animate) {
  if (t === 'bridges') renderBridges();
  else if (t === 'threads') renderThreads();
  else if (t === 'map') {
    renderMap(animate && !S.mapDrawn); S.mapDrawn = true;
    if (S.mapScroll && S.mapBook) { S.mapScroll = false; requestAnimationFrame(() => $(`.bbook[data-book="${CSS.escape(S.mapBook)}"]`)?.scrollIntoView({ block: 'center' })); }
  }
  else if (t === 'saved') renderSaved();
  else if (t === 'bible') renderBible();
}
function showTab(t, sub) {
  const bibleKey = (x) => [x?.osis, x?.c, x?.v].join('/');
  const changed = S.tab !== t || (t === 'threads' && S.thread !== sub) || (t === 'bible' && bibleKey(S.bible) !== bibleKey(sub));
  const verseOnly = t === 'bible' && S.tab === 'bible' && S.bible.osis === sub?.osis && S.bible.c === sub?.c && sub?.c;
  S.tab = t;
  if (t === 'threads') S.thread = sub && D.T[sub] ? sub : null;
  if (t === 'bible') S.bible = sub || {};
  $('#nav').value = t;
  TABS.forEach((k) => { views[k].hidden = k !== t; });
  renderTab(t, changed);
  if (changed && !verseOnly) {
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
  if (ctx.kind === 'map') return mapBridges(ctx.book).map((p) => p.id);
  return filtered().map((p) => p.id);
}
const ctxHash = (ctx) => (ctx.kind === 'thread' ? `/thread/${ctx.key}` : ctx.kind === 'saved' ? '/saved' : ctx.kind === 'map' ? '/map' + (ctx.book ? '/' + encodeURIComponent(ctx.book) : '') : '');
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

function passageLinks(ref) {
  const r = humanRef(ref);
  return `<p class="p-links">${r ? `<a class="ext" href="${bibleHash(r)}" data-bible="${bibleHash(r)}">${esc(t('openBible'))}<fvl-icon name="book-open"></fvl-icon></a>` : ''}${r && r.v ? `<a class="ext" href="${bibleHash(r)}" data-verse="${esc(`${r.osis}.${r.c}.${r.v}`)}">${esc(t('wordsLink'))}<fvl-icon name="search"></fvl-icon></a>` : ''}${nltLink(ref)}</p>`;
}

function positionLabel() {
  const { ctx, idx, seq } = cur;
  const v = { i: idx + 1, n: seq.length };
  if (ctx.kind === 'thread') return t('pos.step', { ...v, title: LT(ctx.key).title });
  if (ctx.kind === 'saved') return t('pos.saved', v);
  if (ctx.kind === 'map' && ctx.book) return `${dispBook(ctx.book)} · ${t('pos.of', v)}`;
  return t('pos.of', v);
}

let passageToken = 0;
function renderReader() {
  const p = L(D.byId.get(cur.id));
  const nx = D.byId.get(cur.seq[cur.idx + 1]);
  const nextP = nx && L(nx);
  const step = cur.ctx.kind === 'thread' ? LT(cur.ctx.key).steps[cur.idx] : null;
  // English keeps the bridge's own quotation with its key phrase; Polish reads the passage from the chosen Polish Bible.
  const pl = lang() === 'pl';
  const quote = (side) => (pl ? `<span class="p-loading" data-ref="${esc(p[side].ref)}">…</span>` : highlight(p[side].text, p[side].keyPhrase));
  rBody.innerHTML = `<div class="r-in">
    ${step ? `<div class="r-step"><span class="kicker">${esc(step.stage)}</span><p>${esc(step.note)}</p></div>` : ''}
    <p class="kicker"><span class="dot c-${esc(p.category)}"></span>${esc(catLabel(p))}<span aria-hidden="true">·</span>${esc(typeLabel(p.type))}</p>
    <h2 class="r-title" id="rTitle" tabindex="-1">${esc(p.title)}</h2>
    <p class="r-meta">${esc(p.eraGap)}${D.EV[p.id]?.votes != null ? ` · ${t('votesReal', { n: D.EV[p.id].votes })}` : ''}</p>
    <section class="passage" aria-label="${esc(t('promise'))}">
      <p class="p-label">${esc(t('promise'))}</p>
      <h3 class="p-ref">${esc(locRef(p.ot.ref))} <small>${esc(p.ot.author)}</small></h3>
      <blockquote class="p-text" lang="${pl ? 'pl' : 'en'}">${quote('ot')}</blockquote>
      <p class="p-context">${esc(p.ot.context)}</p>
      ${passageLinks(p.ot.ref)}
    </section>
    <section class="passage" aria-label="${esc(t('fulfilment'))}">
      <p class="p-label">${esc(t('fulfilment'))}</p>
      <h3 class="p-ref">${esc(locRef(p.nt.ref))} <small>${esc(p.nt.author)}</small></h3>
      <blockquote class="p-text" lang="${pl ? 'pl' : 'en'}">${quote('nt')}</blockquote>
      <p class="p-context">${esc(p.nt.context)}</p>
      ${passageLinks(p.nt.ref)}
    </section>
    <section class="why" aria-label="${esc(t('why'))}">
      <p class="p-label">${esc(t('why'))}</p>
      <p>${esc(p.bridge)}</p>
    </section>
    <div class="motifs" aria-label="${esc(t('motifs'))}">${p.keywords.map((k) => `<fvl-tag data-kw="${esc(k)}" tabindex="0" role="button">${esc(k)}</fvl-tag>`).join('')}</div>
    <div class="r-tools">
      <fvl-button variant="tertiary" size="sm" data-cite><fvl-icon name="copy"></fvl-icon>${esc(t('copyCite'))}</fvl-button>
      <fvl-button variant="tertiary" size="sm" data-onmap><fvl-icon name="map"></fvl-icon>${esc(t('onMap'))}</fvl-button>
    </div>
    ${nextP ? `<button type="button" class="upnext" data-next><span><small>${esc(t('upNext'))}</small><b>${esc(nextP.title)}</b></span><fvl-icon name="arrow-right" size="md"></fvl-icon></button>` : ''}
  </div>`;
  $('#rPos').textContent = positionLabel();
  const isSaved = saved.includes(p.id);
  const star = $('#star');
  star.setAttribute('aria-pressed', String(isSaved));
  star.setAttribute('aria-label', isSaved ? t('unsave') : t('save'));
  star.variant = isSaved ? 'secondary' : 'tertiary';
  $('#prev').disabled = cur.idx <= 0;
  const last = cur.idx >= cur.seq.length - 1;
  const next = $('#next');
  next.textContent = last ? t('finish') : t('next');
  next.setAttribute('aria-label', last ? t('finishA') : t('nextA', { t: nextP?.title || '' }));
  if (pl) {
    const tok = ++passageToken;
    $$('.p-loading', rBody).forEach(async (el) => {
      try { const html = await passageHTML(el.dataset.ref); if (tok === passageToken) el.outerHTML = html; }
      catch { if (tok === passageToken) el.textContent = t('passageErr'); }
    });
  }
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
  softFocus($('#rTitle'));
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
    gsap.set([reader, rTop, rBar], { clearProps: 'clipPath,opacity,transform' });
    if (row) softFocus(row);
  };
  if (row && !reduced) {
    // Shrink onto the row and fade out on the way, so nothing is left sitting over the list.
    // FVL carve curve, compressed so its settle tail does not linger.
    row.scrollIntoView({ block: 'center' });
    gsap.timeline({ onComplete: done })
      .to($$('.r-in > *', rBody).concat([rTop, rBar]), { opacity: 0, duration: 0.12, ease: 'power1.in' }, 0)
      .to(reader, { clipPath: insetFor(row.getBoundingClientRect()), duration: 0.42, ease: 'fvl-carve' }, 0)
      .to(reader, { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0.16);
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
      softFocus($('#rTitle'));
    },
  });
}

function markRead(id) {
  readSet.add(id); store.set('sb_read_v1', [...readSet]);
  lastRead = id; store.set('sb_last_v1', id);
}
function toggleSave(id) {
  const i = saved.indexOf(id);
  if (i > -1) { saved.splice(i, 1); toast(t('removedToast')); } else { saved.push(id); toast(t('savedToast')); }
  store.set('scripturebridge_saved_v2', saved);
  if (!reader.hidden && cur?.id === id) renderReaderChrome();
}
function renderReaderChrome() {
  const isSaved = saved.includes(cur.id);
  const star = $('#star');
  star.setAttribute('aria-pressed', String(isSaved));
  star.setAttribute('aria-label', isSaved ? t('unsave') : t('save'));
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
    const ctx = parts[2] === 'thread' ? { kind: 'thread', key: parts[3] } : parts[2] === 'saved' ? { kind: 'saved' } : parts[2] === 'map' ? { kind: 'map', book: parts[3] ? decodeURIComponent(parts[3]) : null } : { kind: 'list' };
    if (!S.tab) showTab(ctx.kind === 'thread' ? 'threads' : ctx.kind === 'saved' ? 'saved' : ctx.kind === 'map' ? 'map' : 'bridges', ctx.key);
    showReader(parts[1], ctx);
    return;
  }
  const tab = TABS.includes(parts[0]) ? parts[0] : 'bridges';
  const sub = tab === 'bible' ? { osis: parts[1] || null, c: parts[2] ? +parts[2] : null, v: parts[3] ? +parts[3] : null } : parts[1];
  if (!reader.hidden) {
    if (S.tab !== tab || tab === 'bible' || (tab === 'threads' && S.thread !== (parts[1] || null))) { reader.hidden = true; root.classList.remove('reading'); browse.inert = false; showTab(tab, sub); }
    else closeReader();
    pushed = false;
    return;
  }
  showTab(tab, sub);
}
window.addEventListener('hashchange', route);

// ---------- events ----------
$('#nav').addEventListener('change', (e) => { const v = e.target.value; if (TABS.includes(v)) location.hash = '#/' + v; });
let qTimer;
$('#q').addEventListener('input', (e) => { clearTimeout(qTimer); qTimer = setTimeout(() => { S.q = (e.target.value || '').trim(); renderBridges(); }, 120); });
$('#cats').addEventListener('change', (e) => { const v = e.target.getAttribute?.('value'); if (!v) return; S.cat = e.target.selected || v === 'all' ? v : 'all'; syncChips($('#cats'), S.cat); renderBridges(); });
$('#mapCats').addEventListener('change', (e) => { const v = e.target.getAttribute?.('value'); if (!v) return; S.mapCat = e.target.selected || v === 'all' ? v : 'all'; syncChips($('#mapCats'), S.mapCat); if (S.mapBook && !mapBridges(S.mapBook).length) S.mapBook = null; renderMap(true); });
$('#otCol').addEventListener('click', (e) => { const b = e.target.closest('.bbook'); if (b) selectMapBook(b.dataset.book); });
$('#ntCol').addEventListener('click', (e) => { const b = e.target.closest('.bbook'); if (b) selectMapBook(b.dataset.book); });
$('#mbClear').addEventListener('click', () => { S.mapBook = null; renderMap(false); });
$('#mbRead').addEventListener('click', () => { const ids = mapBridges(S.mapBook).map((p) => p.id); if (ids.length) openReader(ids[0], { kind: 'map', book: S.mapBook }, null); });
$('#mbList').addEventListener('click', () => {
  const list = mapBridges(S.mapBook);
  const dr = $('#mapList');
  dr.setAttribute('heading', `${dispBook(S.mapBook)} · ${num(list.length)} ${pluralForm(list.length, 'bridge')}`);
  $('#mapListRows').innerHTML = list.map((p) => rowHTML(p, { summary: false })).join('');
  dr.show();
});
$('#mapListRows').addEventListener('click', (e) => {
  const row = e.target.closest('.row[data-id]'); if (!row) return;
  const book = S.mapBook;
  $('#mapList').close();
  openReader(row.dataset.id, { kind: 'map', book }, null);
});
$('#types').addEventListener('change', (e) => { const v = e.target.getAttribute?.('value'); if (!v) return; S.type = e.target.selected || v === 'all' ? v : 'all'; syncChips($('#types'), S.type); renderBridges(); });
$('#filterBtn').addEventListener('click', () => $('#books').show());
$('#clearBtn').addEventListener('click', resetFilters);
$('#applyBtn').addEventListener('click', () => $('#books').close());
$('#bookGroups').addEventListener('click', (e) => {
  const b = e.target.closest('.book'); if (!b) return;
  S.book = b.dataset.book || null; syncBookUI(); renderBridges();
  gsap.fromTo(b, { scale: 0.96 }, { scale: 1, ...spring.arrive, clearProps: 'transform' });
});
// Bible: tap a verse for its cross-references; swipe between chapters.
const bibleView = $('#view-bible');
function verseTap(el) {
  $$('.verse.sel', bibleView).forEach((x) => x.classList.remove('sel'));
  el.classList.add('sel');
  openXref(S.bible.osis, S.bible.c, Number(el.dataset.v)).catch(() => toast.warning(t('xrefErr')));
}
// One place sets the translation (and so the language): the globe menu, the first-run card and the in-chapter switch.
function setTranslation(id, { instant = false } = {}) {
  store.set('sb_tr_chosen', true);
  if (!id || id === TR.id || !BIB.meta?.translations.some((x) => x.id === id)) { syncTrUI(); return; }
  const langBefore = lang();
  TR.id = id; store.set('sb_tr', id);
  REF_RE = null;
  syncTrUI();
  const changed = lang() !== langBefore;
  const apply = () => {
    if (changed) { applyStatic(); buildFilters(); }
    const y = scrollY;
    Promise.resolve(renderTab(S.tab, false)).then(() => window.scrollTo(0, y));
    if (!reader.hidden && cur) renderReader();
  };
  // Fade the page out, swap the words, fade back in: nothing redraws while it is visible.
  const target = reader.hidden ? $('main') : rBody;
  if (reduced || instant) { apply(); return; }
  gsap.to(target, { opacity: 0, duration: 0.12, ease: 'power1.in', onComplete: () => {
    apply();
    gsap.to(target, { opacity: 1, duration: 0.28, ease: 'power2.out', clearProps: 'opacity' });
  } });
}
function trOptionsHTML(checked) {
  const cur = trInfo();
  return (BIB.meta?.translations || []).map((x) => {
    const on = checked && x.id === cur.id;
    return `<button type="button" class="tr-opt" role="radio" aria-checked="${on}" data-tr="${esc(x.id)}">
      <span><b>${esc(x.name)}</b><small>${x.lang === 'pl' ? 'Polski · cała aplikacja po polsku' : 'English · the whole app in English'}</small></span>
      <fvl-icon name="check" size="md" class="tr-check"></fvl-icon></button>`;
  }).join('');
}
function syncTrUI() {
  const cur = trInfo();
  $('#trBtnLabel').textContent = cur.label || 'BSB';
  $('#trBtn').setAttribute('aria-label', STR[lang()]['tr.aria'].replace('{name}', cur.name || 'BSB'));
  $('#trList').innerHTML = trOptionsHTML(true);
  const pick = $('#trPick'); if (pick) pick.value = cur.id;
}

// Globe menu: a small popover that springs from the button and closes fast.
const trPop = $('#trPop'), trBtn = $('#trBtn');
function openTrMenu() {
  syncTrUI();
  const r = trBtn.getBoundingClientRect();
  trPop.style.top = `${Math.round(r.bottom + 8)}px`;
  trPop.style.right = `${Math.round(Math.max(16, innerWidth - r.right))}px`;
  trPop.hidden = false;
  trBtn.setAttribute('aria-expanded', 'true');
  if (!reduced) {
    gsap.fromTo(trPop, { opacity: 0, scale: 0.94, y: -6 }, { opacity: 1, scale: 1, y: 0, duration: 0.36, ease: 'fvl-arrive', transformOrigin: 'top right' });
    gsap.fromTo($$('.tr-opt', trPop), { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.24, stagger: 0.035, delay: 0.05, ease: 'power2.out', clearProps: 'opacity,transform' });
  }
  softFocus($('.tr-opt[aria-checked="true"]', trPop) || $('.tr-opt', trPop));
}
function closeTrMenu(then, { focusButton = false } = {}) {
  if (trPop.hidden) { then?.(); return; }
  trBtn.setAttribute('aria-expanded', 'false');
  const done = () => { trPop.hidden = true; gsap.set(trPop, { clearProps: 'opacity,transform' }); if (focusButton) trBtn.focus(); then?.(); };
  if (reduced) { done(); return; }
  gsap.to(trPop, { opacity: 0, scale: 0.97, y: -4, duration: 0.12, ease: 'power1.in', onComplete: done });
}
trBtn.addEventListener('click', () => (trPop.hidden ? openTrMenu() : closeTrMenu()));
$('#trList').addEventListener('click', (e) => {
  const o = e.target.closest('[data-tr]'); if (!o) return;
  const id = o.dataset.tr;
  $$('.tr-opt', trPop).forEach((x) => x.setAttribute('aria-checked', String(x === o)));
  closeTrMenu(() => setTranslation(id));
});
document.addEventListener('pointerdown', (e) => { if (!trPop.hidden && !trPop.contains(e.target) && !trBtn.contains(e.target)) closeTrMenu(); });
document.addEventListener('keydown', (e) => {
  if (trPop.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); closeTrMenu(null, { focusButton: true }); return; }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const opts = $$('.tr-opt', trPop), i = opts.indexOf(document.activeElement);
    e.preventDefault(); opts[(i + (e.key === 'ArrowDown' ? 1 : opts.length - 1)) % opts.length]?.focus();
  }
});
addEventListener('resize', () => closeTrMenu());

// First visit: a calm centred card; the choice also sets the language.
function showWelcome() {
  const w = $('#welcome'), card = $('.welcome-card', w);
  $('#welcomeList').innerHTML = trOptionsHTML(false);
  w.hidden = false;
  browse.inert = true;
  if (!reduced) {
    gsap.fromTo(w, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' });
    gsap.fromTo(card, { opacity: 0, y: 24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'fvl-arrive', delay: 0.06 });
    gsap.fromTo($$('.tr-opt', card), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, delay: 0.2, ease: 'power2.out', clearProps: 'opacity,transform' });
  }
  softFocus($('.tr-opt', card)); // keyboard users land on the first choice; touch users see no ring
}
$('#welcomeList').addEventListener('click', (e) => {
  const o = e.target.closest('[data-tr]'); if (!o) return;
  const id = o.dataset.tr, w = $('#welcome');
  $$('.tr-opt', w).forEach((x) => x.setAttribute('aria-checked', String(x === o)));
  w.style.pointerEvents = 'none';
  const finish = () => { w.hidden = true; w.style.pointerEvents = ''; browse.inert = false; gsap.set([w, $('.welcome-card', w)], { clearProps: 'opacity,transform' }); };
  if (reduced) { setTranslation(id, { instant: true }); finish(); return; }
  // The tick shows, the card leaves, the language switches behind the backdrop, then the backdrop lifts.
  // The card stays solid and slides away (no see-through text over the page), then the backdrop lifts.
  const card = $('.welcome-card', w), travel = innerHeight - card.getBoundingClientRect().top + 24;
  gsap.timeline({ onComplete: finish })
    .to(card, { y: travel, duration: 0.34, ease: 'power2.in', delay: 0.16 })
    .add(() => setTranslation(id, { instant: true }))
    .to(w, { opacity: 0, duration: 0.28, ease: 'power2.out' });
});
bibleView.addEventListener('change', (e) => { if (e.target.id === 'trPick') setTranslation(e.target.value); });
bibleView.addEventListener('click', (e) => { const el = e.target.closest('.verse'); if (el && !getSelection()?.toString()) verseTap(el); });
bibleView.addEventListener('keydown', (e) => { const el = e.target.closest('.verse'); if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); verseTap(el); } });
let chTouch = null;
bibleView.addEventListener('touchstart', (e) => { if (!e.target.closest('.ch-text')) return; const t = e.touches[0]; chTouch = { x: t.clientX, y: t.clientY, t: Date.now() }; }, { passive: true });
bibleView.addEventListener('touchend', (e) => {
  if (!chTouch || !S.bible.c) return;
  const t = e.changedTouches[0], dx = t.clientX - chTouch.x, dy = t.clientY - chTouch.y, dt = Date.now() - chTouch.t;
  chTouch = null;
  if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 2 && dt < 700) { const n = neighbour(S.bible.osis, S.bible.c, dx < 0 ? 1 : -1); if (n) location.hash = bibleHash(n); }
}, { passive: true });
$('#xrefSheet').addEventListener('click', (e) => {
  const wd = e.target.closest('[data-word]'); if (wd && wd.dataset.word) { openWord(wd.dataset.word); return; }
  if (e.target.closest('[data-sheet-back]')) { sheetBack(); return; }
  if (e.target.closest('[data-occ-more]')) { S.occ.shown = S.occ.list.length; renderOcc(); return; }
  const more = e.target.closest('[data-more]');
  if (more) { const g = S.xref[more.dataset.more]; g.shown = g.list.length; renderXrefItems(more.dataset.more); return; }
  const link = e.target.closest('[data-go]'); if (!link) return;
  $('#xrefSheet').close();
  location.hash = link.dataset.go;
});

// Browse: one delegated handler for rows and actions.
browse.addEventListener('click', (e) => {
  const link = e.target.closest('[data-go]'); if (link) { location.hash = link.dataset.go; return; }
  const th = e.target.closest('[data-thread]'); if (th) { location.hash = '#/threads/' + th.dataset.thread; return; }
  const rt = e.target.closest('[data-read-thread]');
  if (rt) { const k = rt.dataset.readThread; const first = D.T[k].steps[0]; openReader(first.prophecyId, { kind: 'thread', key: k }, $('#view-threads .row[data-step="0"]'), 0); return; }
  if (e.target.closest('[data-read-saved]')) { const ids = sequence({ kind: 'saved' }); if (ids.length) openReader(ids[0], { kind: 'saved' }, $(`#view-saved .row[data-id="${CSS.escape(ids[0])}"]`)); return; }
  if (e.target.closest('[data-copy-md]')) {
    Promise.all(saved.map((id) => D.byId.get(id)).filter(Boolean).map(citation)).then((cs) => copy(cs.map((c) => c.md).join('\n\n'), t('copiedMd')));
    return;
  }
  const row = e.target.closest('.row[data-id], .continue[data-id]');
  if (!row) return;
  const id = row.dataset.id;
  if (S.tab === 'threads' && row.dataset.step != null) openReader(id, { kind: 'thread', key: S.thread }, row, Number(row.dataset.step));
  else if (S.tab === 'saved') openReader(id, { kind: 'saved' }, row);
  else openReader(id, { kind: 'list' }, row);
});

// Reader controls.
$('#back').addEventListener('click', back);
$('#prev').addEventListener('click', () => go(-1));
$('#next').addEventListener('click', () => go(1));
$('#star').addEventListener('click', () => cur && toggleSave(cur.id));
rBody.addEventListener('click', (e) => {
  if (e.target.closest('[data-next]')) { go(1); return; }
  const vl = e.target.closest('[data-verse]');
  if (vl) { e.preventDefault(); const [o, c, v] = vl.dataset.verse.split('.'); openXref(o, +c, +v).catch(() => toast.warning(t('xrefErr'))); return; }
  const bl = e.target.closest('[data-bible]');
  if (bl) { e.preventDefault(); pushed = false; location.hash = bl.dataset.bible; return; }
  if (e.target.closest('[data-cite]')) { citation(D.byId.get(cur.id)).then((c) => copy(c.plain, t('citeCopied'))); return; }
  if (e.target.closest('[data-onmap]')) { S.mapBook = D.byId.get(cur.id).ot.book; S.mapScroll = true; S.mapCat = 'all'; syncChips($('#mapCats'), 'all'); pushed = false; location.hash = '#/map'; return; }
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
  applyStatic();
  syncTrUI();
  buildFilters();
  syncBookUI();
  route();
  // First visit: ask which Bible (and so which language) to use.
  if (!store.get('sb_tr_chosen', false)) showWelcome();
}).catch((err) => {
  $('#count').textContent = t('loadErr');
  console.error(err);
});
