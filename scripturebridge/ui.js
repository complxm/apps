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
// The app language follows the Bible translation: KJV / NLT = English, Słowo Życia / UBG = Polish.
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
    'th.mode': 'Kind of thread', 'th.threads': 'Threads', 'th.studies': 'Studies',
    'st.lead': 'Bible studies from The Berean Study on YouTube, followed passage by passage in the order the teacher takes them. Each step opens the verses he turns to, with what he draws from them.',
    'st.series': 'Series', 'st.single': 'Single studies', 'st.part': 'Part {n}', 'st.all': 'All studies', 'st.follow': 'Follow the study',
    'st.question': 'The question', 'st.concludes': 'What he concludes', 'st.topics': 'Topics',
    'st.about': 'Teaching by The Berean Study. The notes put his reading in our own words; the views are the teacher’s own. Times are from the start of the video.',
    'st.read': 'read from the {v}', 'st.readU': 'read aloud', 'st.cited': 'mentioned', 'st.draws': 'What he draws from it', 'st.watch': 'Watch from {time}',
    'st.loading': 'Loading the study…', 'st.err': 'The study could not be loaded.',
    'st.verses': 'In the studies', 'st.versesHint': 'Studies that turn to this verse. Tap one to follow it from there.',
    'pos.study': '{title} · step {i} of {n}', 'st.alsoAt': 'Also at {times}', 'st.video': 'Video: {title}',
    'st.single1': 'Single study', 'st.done': '{r} of {n} read', 'st.continue': 'Continue from step {n}', 'st.fromStart': 'From the start',
    'st.summary': 'What the study covers', 'st.stepsH': 'The {n} steps, in his order',
    'st.coverHint': 'Each cover draws the study’s route: the line runs from Genesis to Revelation (the tick marks where the New Testament begins), and every arc is one move from a passage to the next.',
    'st.routeHint': 'The route above: every arc is one move from a passage to the next, along the Bible from Genesis to Revelation. Filled points are books he reads from; open rings, books he only mentions.',
    'share.img': 'Share as picture', 'share.saved': 'Picture saved', 'share.err': 'Could not make the picture.',
    'cn.title': 'Constellation', 'cn.hint': 'Every line is a link from this verse: gold for bridges, the study colours for studies, the brightest stars for the strongest cross-references. Tap a star.',
    'cn.centre': 'Centre here', 'cn.read': 'Read in the Bible', 'cn.bridge': 'Read the bridge', 'cn.study': 'Open the study',
    'cn.out': 'This verse points to it', 'cn.inc': 'It points to this verse', 'cn.kBridge': 'Bridge', 'cn.kStudy': 'Study', 'cn.pick': 'Tap a star to see where it leads.',
    'link.follow': 'Follow the link to {ref}', 'link.hint': 'Tap the marked words to follow the link from promise to fulfilment.',
    'vb.title': 'Bridges', 'vb.hint': 'This verse is part of these bridges.', 'vb.aria': 'part of {n} bridge(s)',
    'cmp.open': 'Compare Bibles', 'cmp.close': 'Hide comparison', 'cmp.na': 'Not available right now.',
    'nlt.fail': 'The NLT text could not be loaded from Tyndale’s NLT API, so the KJV is shown here instead.', 'st.stepN': 'Step {n}', 'st.stepOf': 'Step {n} of {t}', 'st.into': '{time} into the video', 'st.inVer': 'He reads this from the {v}.', 'st.toVer': 'Show in the {v}', 'st.len': '{h} h {m} min', 'st.lenM': '{m} min',
    'threads.lead': 'Paths through Scripture from Genesis to Revelation. Each one reads as a sequence, step by step.', allThreads: 'All threads', readThread: 'Read this thread',
    'map.title': 'Bridge map', 'map.lead': 'Old Testament on the left, New Testament on the right. Tap a book to see where its promises lead.',
    'map.clear': 'Clear selection', list: 'List', read: 'Read',
    'map.mode': 'Map view', 'map.books': 'Books', 'map.time': 'Time', 'map.timeLead': 'Each arc runs from a promise to its fulfilment, oldest promise first. Tap a bridge to read it.',
    'tl.bc': '{n} BC', 'tl.ad': 'AD {n}', 'tl.years': '{n} years', 'tl.later': '{n} years later',
    'hero.title': 'The promise, and the day it was kept.',
    'hero.sub': '{n} bridges across two thousand years of Scripture. Each arc runs from a promise to its fulfilment. Tap one to read it.',
    'hero.aria': 'Every bridge as an arc on a timeline, from the year of the promise to the year it was fulfilled',
    'hero.kick': '{n} promises and the day each was kept', 'bento.today': 'Bridge of the day', 'bento.start': 'Start here', 'bento.study': 'Continue the study', 'bento.studies': 'Bible studies',
    'bento.studiesD': 'Follow The Berean Study passage by passage', 'bento.step': 'Step {i} of {n}', 'bento.saved': 'Saved',
    'bento.saved0': 'Star a bridge to keep it here', 'bento.savedN': '{n} saved', 'bento.sky': 'Every bridge',
    'hero.next': 'Next appointed time', 'hero.progress': 'You have read {r} of {n}. Read bridges are drawn solid.', 'hero.progress0': 'Bridges you read will be drawn solid here.', 'pos.time': 'In time order · {i} of {n}',
    'saved.emptyH': 'Nothing saved yet', 'saved.emptyD': 'Open a bridge and tap the star to keep it here.', 'saved.lead': '{n} {bridge}, in the order you saved them.',
    readSaved: 'Read saved', copyMd: 'Copy as Markdown', copiedMd: 'Copied as Markdown',
    'bible.lead': '{name}, with every OpenBible.info cross-reference. Tap any verse to see everything it connects to.',
    'cmp.nt': 'New Testament only', 'tr.otFrom': 'This Bible has the New Testament only, so the Old Testament is read from the {name}.', 'tr.otShort': 'Old Testament: {name}',
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
    'tr.title': 'Bible translation', 'tr.desc': 'Also sets the app language: a Polish Bible switches the whole app to Polish. Cross-references work with every Bible here.',
    'tr.aria': 'Bible translation: {name}', lang: 'English', classic: 'Classic layout', creditsSum: 'Sources and licences',
    credits: 'Bible text: King James Version (public domain outside the UK); New Living Translation © Tyndale House Foundation, read live from the <a href="https://api.nlt.to" target="_blank" rel="noopener">NLT API</a> and not stored; Uwspółcześniona Biblia Gdańska © Fundacja Wrota Nadziei, <a href="https://creativecommons.org/licenses/by-nd/4.0/" target="_blank" rel="noopener">CC BY-ND 4.0</a>, shown unchanged; Biblica® Słowo Życia, otwarty dostęp (New Testament) © 1991, 2005, 2016 Biblica, Inc., <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>, shown unchanged; original work available for free at <a href="https://www.biblica.com" target="_blank" rel="noopener">www.biblica.com</a> and <a href="https://open.bible" target="_blank" rel="noopener">open.bible</a>. Cross-references: <a href="https://www.openbible.info/labs/cross-references/" target="_blank" rel="noopener">OpenBible.info</a>, CC BY. Hebrew and Greek: <a href="https://github.com/STEPBible/STEPBible-Data" target="_blank" rel="noopener">STEPBible.org</a> (Tyndale House, Cambridge), CC BY 4.0. People: <a href="https://github.com/BradyStephenson/bible-data" target="_blank" rel="noopener">BibleData</a> (Brady Stephenson), CC BY 4.0. Places: <a href="https://www.openbible.info/geo/" target="_blank" rel="noopener">OpenBible.info</a> Bible Geocoding, CC BY 4.0. Maps: Natural Earth.',
    hebrew: 'Hebrew', greek: 'Greek', origWords: '{n} {word}', origHint: 'Tap a word for its meaning and every verse that uses it.', origHint2: 'Tap a word to see what it means.',
    defMore: 'Full definition', defLess: 'Shorter definition', occOpen: 'Where it appears · {n} {verse}', occClose: 'Hide the verses',
    wordTimes: 'Used {n} {time} in the Bible', backTo: 'Back to {ref}', definition: 'Definition', occurrences: 'Where it appears',
    wordsLink: 'Words & cross-references', wordErr: 'Could not load this word.',
    passageErr: 'Could not load this passage.', retry: 'Try again', drawErr: 'Something went wrong while opening the app.', loadErr: 'Could not load the bridges. Check your connection and reload.',
    'ev.title': 'How strong is this link', 'ev.strong': 'Strong link', 'ev.moderate': 'Moderate link', 'ev.weak': 'Weak link',
    'ev.quotation': 'Quoted', 'ev.allusion': 'Echoed', 'ev.theme': 'Shared theme',
    'ev.prophecy': 'Prophecy', 'ev.typology': 'Typology', 'ev.promise': 'Promise', 'ev.parallel': 'Parallel',
    'ev.votes': 'Strongest OpenBible.info cross-reference: {a} → {b}, {n} {vote}.', 'ev.noVotes': 'OpenBible.info lists no direct cross-reference between these passages.',
    'ev.overlap': 'Shared wording, {n} {word} in a row:', 'ev.formula': '{ref} refers to Scripture:',
    'who.title': 'People and places', 'who.hint': 'Tap a name for more.', 'who.verses': 'In {n} {verse}', 'who.site': 'Modern site: {m}',
    'who.conf': '{n}% confidence', 'who.noMap': 'The location is not known.', 'who.src': 'Location: OpenBible.info', 'who.tribe': 'Tribe: {t}',
    'who.err': 'Could not load this.', 'who.en': '', 'who.person': 'Person', 'who.place': 'Place',
    'moed.title': 'The appointed time', 'moed.next': 'Next', 'moed.today': 'today', 'moed.now': 'now, until {date}',
    'moed.words': 'Key words', 'moed.reading': 'A reading', 'moed.part': 'Partly a reading', 'moed.nt': 'In the New Testament', 'moed.noCal': 'This browser cannot show Hebrew calendar dates.',
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
    'th.mode': 'Rodzaj wątku', 'th.threads': 'Wątki', 'th.studies': 'Studia',
    'st.lead': 'Studia biblijne z kanału The Berean Study na YouTube, prowadzone fragment po fragmencie w kolejności, w jakiej przechodzi przez nie nauczyciel. Każdy krok otwiera wersety, do których sięga, i to, co z nich wyprowadza.',
    'st.series': 'Serie', 'st.single': 'Pojedyncze studia', 'st.part': 'Część {n}', 'st.all': 'Wszystkie studia', 'st.follow': 'Prowadź przez studium',
    'st.question': 'Pytanie', 'st.concludes': 'Jego wnioski', 'st.topics': 'Tematy',
    'st.about': 'Nauczanie kanału The Berean Study. Notatki oddają jego odczytanie naszymi słowami; poglądy są poglądami nauczyciela. Czas liczony od początku filmu (nauczanie po angielsku).',
    'st.read': 'czytane z {v}', 'st.readU': 'czytane na głos', 'st.cited': 'wspomniane', 'st.draws': 'Co z tego wyprowadza', 'st.watch': 'Oglądaj od {time}',
    'st.loading': 'Wczytywanie studium…', 'st.err': 'Nie udało się wczytać studium.',
    'st.verses': 'W studiach', 'st.versesHint': 'Studia, które sięgają do tego wersetu. Dotknij, aby iść dalej od tego miejsca.',
    'pos.study': '{title} · krok {i} z {n}', 'st.alsoAt': 'Także: {times}', 'st.video': 'Film: {title}',
    'st.single1': 'Pojedyncze studium', 'st.done': 'Przeczytano {r} z {n}', 'st.continue': 'Kontynuuj od kroku {n}', 'st.fromStart': 'Od początku',
    'st.summary': 'O czym jest studium', 'st.stepsH': '{n} kroków w jego kolejności',
    'st.coverHint': 'Każda okładka rysuje trasę studium: linia biegnie od Księgi Rodzaju do Objawienia (kreska oznacza początek Nowego Testamentu), a każdy łuk to jedno przejście od fragmentu do następnego.',
    'st.routeHint': 'Trasa powyżej: każdy łuk to jedno przejście od fragmentu do następnego, wzdłuż Biblii od Księgi Rodzaju do Objawienia. Pełne punkty to księgi, z których czyta; puste kółka – księgi tylko wspomniane.',
    'share.img': 'Udostępnij jako obraz', 'share.saved': 'Zapisano obraz', 'share.err': 'Nie udało się utworzyć obrazu.',
    'cn.title': 'Konstelacja', 'cn.hint': 'Każda linia to połączenie z tym wersetem: złote to mosty, kolory studiów to studia, najjaśniejsze gwiazdy to najsilniejsze odnośniki. Dotknij gwiazdy.',
    'cn.centre': 'Ustaw w centrum', 'cn.read': 'Czytaj w Biblii', 'cn.bridge': 'Czytaj most', 'cn.study': 'Otwórz studium',
    'cn.out': 'Ten werset na niego wskazuje', 'cn.inc': 'On wskazuje na ten werset', 'cn.kBridge': 'Most', 'cn.kStudy': 'Studium', 'cn.pick': 'Dotknij gwiazdy, aby zobaczyć, dokąd prowadzi.',
    'link.follow': 'Przejdź do powiązanego miejsca: {ref}', 'link.hint': 'Dotknij zaznaczonych słów, aby przejść od obietnicy do wypełnienia.',
    'vb.title': 'Mosty', 'vb.hint': 'Ten werset należy do tych mostów.', 'vb.aria': 'część mostów: {n}',
    'cmp.open': 'Porównaj Biblie', 'cmp.close': 'Ukryj porównanie', 'cmp.na': 'Teraz niedostępne.',
    'nlt.fail': 'Nie udało się wczytać tekstu NLT z NLT API wydawnictwa Tyndale, dlatego pokazano tu KJV.', 'st.stepN': 'Krok {n}', 'st.stepOf': 'Krok {n} z {t}', 'st.into': '{time} od początku filmu', 'st.inVer': 'Czyta ten fragment z {v}.', 'st.toVer': 'Pokaż w {v}', 'st.len': '{h} godz. {m} min', 'st.lenM': '{m} min',
    'threads.lead': 'Ścieżki przez Pismo od Księgi Rodzaju do Objawienia. Każdą czyta się po kolei, krok po kroku.', allThreads: 'Wszystkie wątki', readThread: 'Czytaj ten wątek',
    'map.title': 'Mapa mostów', 'map.lead': 'Stary Testament po lewej, Nowy po prawej. Dotknij księgi, aby zobaczyć, dokąd prowadzą jej obietnice.',
    'map.clear': 'Wyczyść wybór', list: 'Lista', read: 'Czytaj',
    'map.mode': 'Widok mapy', 'map.books': 'Księgi', 'map.time': 'Czas', 'map.timeLead': 'Każdy łuk biegnie od obietnicy do jej wypełnienia, od najstarszej obietnicy. Dotknij mostu, aby go przeczytać.',
    'tl.bc': '{n} p.n.e.', 'tl.ad': '{n} n.e.', 'tl.years': '{n} lat', 'tl.later': '{n} lat później',
    'hero.title': 'Obietnica i dzień, w którym się spełniła.',
    'hero.sub': '{n} mostów przez dwa tysiące lat Pisma. Każdy łuk biegnie od obietnicy do jej spełnienia. Dotknij go, aby przeczytać.',
    'hero.aria': 'Każdy most jako łuk na osi czasu, od roku obietnicy do roku spełnienia',
    'hero.kick': 'Obietnic i dni ich wypełnienia: {n}', 'bento.today': 'Most dnia', 'bento.start': 'Zacznij tutaj', 'bento.study': 'Kontynuuj studium', 'bento.studies': 'Studia biblijne',
    'bento.studiesD': 'Krok po kroku za The Berean Study', 'bento.step': 'Krok {i} z {n}', 'bento.saved': 'Zapisane',
    'bento.saved0': 'Oznacz most gwiazdką, aby go tu zachować', 'bento.savedN': 'Zapisane: {n}', 'bento.sky': 'Wszystkie mosty',
    'hero.next': 'Najbliższy wyznaczony czas', 'hero.progress': 'Przeczytano {r} z {n}. Przeczytane mosty są narysowane pełną linią.', 'hero.progress0': 'Mosty, które przeczytasz, będą tu narysowane pełną linią.', 'pos.time': 'Według czasu · {i} z {n}',
    'saved.emptyH': 'Nic jeszcze nie zapisano', 'saved.emptyD': 'Otwórz most i dotknij gwiazdki, aby go tu zachować.', 'saved.lead': '{n} {bridge}, w kolejności zapisywania.',
    readSaved: 'Czytaj zapisane', copyMd: 'Kopiuj jako Markdown', copiedMd: 'Skopiowano jako Markdown',
    'bible.lead': '{name} ze wszystkimi odnośnikami OpenBible.info. Dotknij dowolnego wersetu, aby zobaczyć wszystko, z czym się łączy.',
    'cmp.nt': 'Tylko Nowy Testament', 'tr.otFrom': 'Ten przekład obejmuje tylko Nowy Testament, więc Stary Testament jest czytany z przekładu: {name}.', 'tr.otShort': 'Stary Testament: {name}',
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
    'tr.title': 'Przekład Biblii', 'tr.desc': 'Ustawia też język aplikacji: polski przekład przełącza całą aplikację na polski. Odnośniki działają z każdym przekładem.',
    'tr.aria': 'Przekład Biblii: {name}', lang: 'Polski', classic: 'Układ klasyczny', creditsSum: 'Źródła i licencje',
    credits: 'Tekst Biblii: King James Version (domena publiczna poza Wielką Brytanią); New Living Translation © Tyndale House Foundation, wczytywany na bieżąco z <a href="https://api.nlt.to" target="_blank" rel="noopener">NLT API</a> i nieprzechowywany; Uwspółcześniona Biblia Gdańska © Fundacja Wrota Nadziei, <a href="https://creativecommons.org/licenses/by-nd/4.0/" target="_blank" rel="noopener">CC BY-ND 4.0</a>, bez zmian; Biblica® Słowo Życia, otwarty dostęp (Nowy Testament) © 1991, 2005, 2016 Biblica, Inc., <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>, bez zmian; oryginał dostępny bezpłatnie na <a href="https://www.biblica.com" target="_blank" rel="noopener">www.biblica.com</a> i <a href="https://open.bible" target="_blank" rel="noopener">open.bible</a>. Odnośniki: <a href="https://www.openbible.info/labs/cross-references/" target="_blank" rel="noopener">OpenBible.info</a>, CC BY. Hebrajski i grecki: <a href="https://github.com/STEPBible/STEPBible-Data" target="_blank" rel="noopener">STEPBible.org</a> (Tyndale House, Cambridge), CC BY 4.0. Osoby: <a href="https://github.com/BradyStephenson/bible-data" target="_blank" rel="noopener">BibleData</a> (Brady Stephenson), CC BY 4.0. Miejsca: <a href="https://www.openbible.info/geo/" target="_blank" rel="noopener">OpenBible.info</a> Bible Geocoding, CC BY 4.0. Mapy: Natural Earth.',
    hebrew: 'Hebrajski', greek: 'Grecki', origWords: '{n} {word}', origHint: 'Dotknij słowa, aby zobaczyć jego znaczenie i wszystkie wersety, w których występuje.', origHint2: 'Dotknij słowa, aby zobaczyć, co znaczy.',
    defMore: 'Pełna definicja (po angielsku)', defLess: 'Krótsza definicja', occOpen: 'Gdzie występuje · {n} {verse}', occClose: 'Ukryj wersety',
    wordTimes: 'Występuje {n} {time} w Biblii', backTo: 'Wróć do {ref}', definition: 'Definicja (po angielsku)', occurrences: 'Gdzie występuje',
    wordsLink: 'Słowa i odnośniki', wordErr: 'Nie udało się wczytać słowa.',
    passageErr: 'Nie udało się wczytać fragmentu.', retry: 'Spróbuj ponownie', drawErr: 'Coś poszło nie tak podczas otwierania aplikacji.', loadErr: 'Nie udało się wczytać mostów. Sprawdź połączenie i odśwież stronę.',
    'ev.title': 'Jak mocne jest to powiązanie', 'ev.strong': 'Mocne powiązanie', 'ev.moderate': 'Umiarkowane powiązanie', 'ev.weak': 'Słabe powiązanie',
    'ev.quotation': 'Cytat', 'ev.allusion': 'Nawiązanie', 'ev.theme': 'Wspólny temat',
    'ev.prophecy': 'Proroctwo', 'ev.typology': 'Typologia', 'ev.promise': 'Obietnica', 'ev.parallel': 'Paralela',
    'ev.votes': 'Najmocniejszy odnośnik OpenBible.info: {a} → {b}, {n} {vote}.', 'ev.noVotes': 'OpenBible.info nie podaje bezpośredniego odnośnika między tymi fragmentami.',
    'ev.overlap': 'Wspólne sformułowanie w angielskim BSB, {n} {word} z rzędu:', 'ev.formula': '{ref} odwołuje się do Pisma:',
    'who.title': 'Ludzie i miejsca', 'who.hint': 'Dotknij nazwy, aby zobaczyć więcej.', 'who.verses': 'Wersety: {n}', 'who.site': 'Współczesne miejsce: {m}',
    'who.conf': 'pewność {n}%', 'who.noMap': 'Położenie nie jest znane.', 'who.src': 'Położenie: OpenBible.info', 'who.tribe': 'Pokolenie: {t}',
    'who.err': 'Nie udało się wczytać.', 'who.en': 'Imiona, nazwy i opisy po angielsku.', 'who.person': 'Osoba', 'who.place': 'Miejsce',
    'moed.title': 'Wyznaczony czas', 'moed.next': 'Najbliższy termin', 'moed.today': 'dziś', 'moed.now': 'trwa, do {date}',
    'moed.words': 'Słowa kluczowe', 'moed.reading': 'Interpretacja', 'moed.part': 'Częściowo interpretacja', 'moed.nt': 'W Nowym Testamencie', 'moed.noCal': 'Ta przeglądarka nie pokazuje dat kalendarza hebrajskiego.',
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
// Like t(), escaped, with some placeholders filled by ready-made HTML (links).
function tHTML(key, vars = {}, html = {}) {
  const marks = [];
  const v = { ...vars };
  Object.keys(html).forEach((k, i) => { v[k] = `\u0001${i}\u0001`; marks.push(html[k]); });
  return esc(t(key, v)).replace(/\u0001(\d+)\u0001/g, (m, i) => marks[+i]);
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
const S = { mapMode: 'books', tab: null, cat: 'all', type: 'all', book: null, q: '', mapCat: 'all', mapBook: null, mapScroll: false, bible: {}, thread: null, mapDrawn: false, thMode: 'threads', study: null, thSub: null };
const D = { P: [], byId: new Map(), T: {}, OT: [], NT: [], catLabel: {}, PL: {}, TPL: {}, EV: {}, RV: null, TIMES: [], TIMEBY: new Map(), CALNOTE: {}, SI: null, SD: {} };
let saved = store.get('scripturebridge_saved_v2', []);
const readSet = new Set(store.get('sb_read_v1', []));
let lastRead = store.get('sb_last_v1', null);

// ---------- data ----------
// Fetch JSON, trying again twice on a flaky connection; the error names the file and what went wrong.
async function fetchJSON(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
      try { return await r.json(); } catch { throw new Error(`${url}: the file arrived incomplete`); }
    } catch (e) {
      last = e instanceof Error && e.message.startsWith(url) ? e : new Error(`${url}: ${e?.message || 'network error'}`);
      if (i < tries - 1) await new Promise((res) => setTimeout(res, 600 * (i + 1) ** 2));
    }
  }
  throw last;
}
async function load() {
  const get = (f) => fetchJSON('data/' + f);
  const [books, P, T] = await Promise.all([get('books_66.json'), get('prophecies_66_books.json'), get('canonical_threads.json'), bibleMeta()]);
  D.P = P; D.T = T; D.OT = books.old_testament; D.NT = books.new_testament;
  P.forEach((p) => { D.byId.set(p.id, p); D.catLabel[p.category] = D.catLabel[p.category] || p.categoryLabel; });
  // Polish versions of the bridges and threads (English stays the master; missing pieces fall back to it).
  const [pl, tpl, ev, at, atPl] = await Promise.all([get('pl/prophecies.json').catch(() => []), get('pl/threads.json').catch(() => ({})), get('evidence.json').catch(() => ({})),
    get('appointed_times.json').catch(() => null), get('pl/appointed_times.json').catch(() => null)]);
  D.EV = ev; // checks computed from the texts and OpenBible (scripts/build_evidence.py)
  pl.forEach((x) => { D.PL[x.id] = x; });
  D.TPL = tpl;
  // The appointed times of Leviticus 23: their bridges and thread live in their own file, beside the original data.
  if (at) {
    at.bridges.forEach((p) => { if (!D.byId.has(p.id)) { D.P.push(p); D.byId.set(p.id, p); } });
    Object.assign(D.T, at.threads);
    D.TIMES = at.times || [];
    D.CALNOTE = at.calendarNote || {};
    D.TIMES.forEach((x) => D.TIMEBY.set(x.bridge, x));
  }
  if (atPl) { atPl.bridges.forEach((x) => { D.PL[x.id] = x; }); Object.assign(D.TPL, atPl.threads); }
  loadReview(); // notes, link strength and key phrases: only the reader needs them
}
// The review of each bridge (data/review.json): fetched after the first screen.
let reviewP = null;
function loadReview() {
  reviewP ??= fetch('data/review.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((d) => { D.RV = d.bridges || {}; return D.RV; });
  return reviewP;
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
// ---------- spans ----------
// Every bridge sits on one shared axis, 2100 BC to AD 150: an open ring at the year of the promise,
// a filled point at the year it was fulfilled, the line between them in its category colour.
const SPAN = { y0: -2100, y1: 150 };
const spanPct = (yr) => ((yr - SPAN.y0) / (SPAN.y1 - SPAN.y0)) * 100;
const yearsOf = (p) => { const y = eraYears(p); return y ? y.nt - y.ot : null; };
function spanHTML(p) {
  const y = eraYears(p);
  return y ? `<span class="span c-${esc(p.category)}" aria-hidden="true" style="--a:${spanPct(y.ot).toFixed(2)}%;--b:${spanPct(y.nt).toFixed(2)}%"><i></i></span>` : '';
}
// A thread on the same axis: an open ring at each step's promise, converging on the fulfilment.
function threadSpanHTML(th) {
  const ps = th.steps.map((st) => D.byId.get(st.prophecyId)).filter(Boolean).map((p) => ({ p, y: eraYears(p) })).filter((x) => x.y);
  if (!ps.length) return '<span class="span"></span>';
  const a = Math.min(...ps.map((x) => x.y.ot)), b = Math.max(...ps.map((x) => x.y.nt));
  const dots = ps.map(({ p, y }) => `<b class="c-${esc(p.category)}" style="left:${spanPct(y.ot).toFixed(2)}%"></b>`).join('');
  return `<span class="span tspan" aria-hidden="true" style="--a:${spanPct(a).toFixed(2)}%;--b:${spanPct(b).toFixed(2)}%"><i></i>${dots}</span>`;
}
// The arcs of many bridges over one axis (the home screen and the Time map).
function fanSVG(list, { W = 1000, H = 280, cls = '' } = {}) {
  const base = H - 10, X = (yr) => 16 + ((yr - SPAN.y0) / (SPAN.y1 - SPAN.y0)) * (W - 32);
  const label = (yr) => (yr === 0 ? t('tl.ad', { n: '1' }) : t('tl.bc', { n: String(-yr) }));
  const years = [-2000, -1500, -1000, -500, 0];
  const ticks = years.map((yr) => `<line class="tl-tick" x1="${X(yr)}" x2="${X(yr)}" y1="${base}" y2="${base + 8}"/>`).join('');
  const arcs = list.map(({ p, y }) => {
    const a = X(y.ot), b = X(y.nt), rx = (b - a) / 2, ry = Math.min(base - 12, rx * 0.58);
    const d = `M${a.toFixed(1)} ${base} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${b.toFixed(1)} ${base}`;
    return `<g class="tl-bridge c-${esc(p.category)}" data-id="${esc(p.id)}" data-ends="${a.toFixed(1)} ${b.toFixed(1)}" data-arc="${((a + b) / 2).toFixed(1)} ${rx.toFixed(1)} ${ry.toFixed(1)} ${base}"><path class="tl-arc" d="${d}"/></g>`;
  }).join('');
  // Year labels are HTML under the drawing, so they keep a readable size at any width.
  // The ends of read bridges are HTML dots over the drawing (data-geo says where the axis is), so they stay round
  // however the drawing stretches.
  return `<div class="tl-wrap ${cls}"><div class="tl-fan-box"><svg class="tl-fan" viewBox="0 0 ${W} ${H + 8}" preserveAspectRatio="none" role="img" aria-label="${esc(t('hero.aria'))}" data-cat="${esc(S.cat)}">
    <line class="tl-axis" x1="16" x2="${W - 16}" y1="${base}" y2="${base}"/>${ticks}<g class="tl-arcs">${arcs}</g></svg><div class="tl-feet" aria-hidden="true" data-geo="${W} ${H + 8} ${base}"></div></div>
    <div class="tl-years" aria-hidden="true">${years.map((yr) => `<span${yr === -1500 || yr === -500 ? ' class="minor"' : ''} style="left:${((X(yr) / W) * 100).toFixed(2)}%">${esc(label(yr))}</span>`).join('')}</div>
    <p class="tl-cap" aria-live="polite"></p></div>`;
}
// Arcs cross, so a tap or a pointer picks the arc nearest to it on screen (within a finger's width), not the one on top.
function nearestArc(svg, x, y, within = 22) {
  const m = svg.getScreenCTM();
  if (!m) return null;
  let best = null, bd = within;
  $$('.tl-bridge', svg).forEach((g) => {
    if (getComputedStyle(g.querySelector('.tl-arc')).opacity < 0.3) return; // stepped back by a filter
    const [cx, rx, ry, base] = g.dataset.arc.split(' ').map(Number);
    for (let k = 0; k <= 48; k++) {
      const th = Math.PI * (k / 48), px = cx - rx * Math.cos(th), py = base - ry * Math.sin(th);
      const sx = px * m.a + m.e, sy = py * m.d + m.f, d = Math.hypot(sx - x, sy - y);
      if (d < bd) { bd = d; best = g; }
    }
  });
  return best;
}
function fanPoint(e) {
  const svg = e.target.closest?.('.tl-fan');
  if (!svg) return;
  const g = nearestArc(svg, e.clientX, e.clientY);
  $$('.tl-bridge.is-near', svg).forEach((x) => { if (x !== g) x.classList.remove('is-near'); });
  svg.classList.toggle('has-near', !!g);
  const cap = svg.closest('.tl-wrap')?.querySelector('.tl-cap');
  if (g) {
    g.classList.add('is-near');
    const p = D.byId.get(g.dataset.id);
    if (cap && p) cap.textContent = `${L(p).title} · ${locRef(p.ot.ref)} → ${locRef(L(p).nt.ref)}`;
  } else if (cap) cap.textContent = '';
}
// Arcs of bridges you have read are drawn solid and thicker.
function markReadArcs() {
  $$('#hero .tl-bridge, #timeView .tl-bridge').forEach((g) => g.classList.toggle('read', readSet.has(g.dataset.id)));
  // The sky draws each read bridge's ring and point where its arc meets the axis.
  const feet = $('#hero .tl-feet');
  if (feet) {
    const [W, H, base] = feet.dataset.geo.split(' ').map(Number), top = ((base / H) * 100).toFixed(2);
    feet.innerHTML = $$('#hero .tl-bridge.read').map((g) => {
      const [a, b] = g.dataset.ends.split(' ').map(Number);
      return `<i class="tl-foot o" style="left:${((a / W) * 100).toFixed(2)}%;top:${top}%"></i><i class="tl-foot k" style="left:${((b / W) * 100).toFixed(2)}%;top:${top}%"></i>`;
    }).join('');
  }
  const pr = $('#hero .hero-progress'); if (pr) pr.textContent = heroProgress(timeList(() => true).length);
}
const timeList = (filter) => D.P.filter(filter).map((p) => ({ p, y: eraYears(p) })).filter((x) => x.y).sort((a, b) => a.y.ot - b.y.ot || a.y.nt - b.y.nt);
let heroDrawn = false;
// The next appointed time of Leviticus 23 (the weekly Sabbath aside), from the same calendar as the feasts thread.
function nextMoed() {
  let best = null;
  for (const tm of D.TIMES) {
    if (tm.key === 'sabbath') continue;
    const r = moedNext(tm);
    if (r && (!best || r.s < best.r.s)) best = { tm, r };
  }
  return best;
}
function heroNextHTML() {
  const n = nextMoed();
  if (!n) return '';
  const lg = lang(), when = rangeText(n.r, true), until = untilText(n.r);
  return `<button type="button" class="hero-next" data-moed="${esc(n.tm.bridge)}"><span class="hn-well"><fvl-icon name="calendar"></fvl-icon></span>
    <span class="hn-text"><small>${esc(t('hero.next'))}</small><b>${esc(n.tm.name[lg])}</b><span class="hn-when">${esc(when)} · ${esc(until)}</span></span><fvl-icon class="hn-go" name="chevron-right"></fvl-icon></button>`;
}
// How much of the collection you have read, as words under the arcs (the arcs themselves show which).
const heroProgress = (n) => { const r = D.P.filter((p) => readSet.has(p.id)).length; return r ? t('hero.progress', { r: num(r), n: num(n) }) : t('hero.progress0'); };
function renderHero() {
  const el = $('#hero');
  const list = timeList(() => true);
  // The sky: a still night panel in both themes; only the arcs sit on it, the words stay on the page.
  // The Continue card keeps its own element (#continue), moved into the bento.
  const cont = $('#continue'); cont.remove();
  el.innerHTML = `<div class="hero-text"><p class="hero-kick"><i aria-hidden="true"></i>${esc(t('hero.kick', { n: num(list.length) }))}</p><h1 class="hero-title">${esc(t('hero.title'))}</h1>
    <p class="hero-sub">${esc(t('hero.sub', { n: num(list.length) }))}</p></div>
    <div class="bento">
      <div class="hero-sky b-sky" data-theme="dark" data-daylight="night"><div class="hero-in"><p class="b-kick">${esc(t('bento.sky'))}</p>${fanSVG(list, { cls: 'hero-fan' })}
        <p class="hero-progress">${esc(heroProgress(list.length))}</p></div></div>
      <div class="b-slot b-today" id="bToday"></div>
      <div class="b-slot b-cont" id="bCont"></div>
      <div class="b-slot b-next" id="bNext">${heroNextHTML()}</div>
      <div class="b-slot b-study" id="bStudy"></div>
      <div class="b-slot b-saved" id="bSaved"></div>
    </div>`;
  $('#bCont').append(cont);
  renderBento();
  markReadArcs();
  // One orchestrated moment: the first time the home screen opens, the arcs draw in, oldest promise first.
  if (!heroDrawn && window.DrawSVGPlugin && !reduced) {
    // Unread arcs are dotted; the dots are switched off while the lines draw in, then come back.
    const fan = $('#hero .tl-fan'); fan.classList.add('drawing');
    gsap.from('#hero .tl-arc', { drawSVG: '0%', stagger: 0.012, ...spring.grow, onComplete: () => {
      $$('#hero .tl-arc').forEach((x) => { x.style.removeProperty('stroke-dasharray'); x.style.removeProperty('stroke-dashoffset'); });
      fan.classList.remove('drawing');
    } });
  }
  heroDrawn = true;
  el.dataset.lang = lang();
}

// The bento cards that change as you read: the bridge of the day, where you left off, the study you are in, your saved bridges.
const dayIndex = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
function miniArcSVG(cls = '') {
  return `<svg class="b-arc ${cls}" viewBox="0 0 120 44" aria-hidden="true"><path d="M8 38A52 32 0 0 1 112 38"/><circle class="o" cx="8" cy="38" r="4"/><circle class="k" cx="112" cy="38" r="4"/></svg>`;
}
function renderBento() {
  if (!$('#bToday')) return;
  const all = D.P, pick = all[dayIndex() % all.length], p = L(pick), yrs = yearsOf(pick);
  $('#bToday').innerHTML = `<button type="button" class="bento-card b-day" data-id="${esc(pick.id)}">
    <span class="b-kick">${esc(t('bento.today'))}</span>
    <span class="b-title">${esc(p.title)}</span>
    <span class="bento-quote" lang="${lang() === 'pl' ? 'pl' : 'en'}">“${esc(p.ot.keyPhrase || p.ot.text || '')}”</span>
    <span class="b-foot">${miniArcSVG(`c-${esc(pick.category)}`)}<span class="b-refs">${esc(locRef(p.ot.ref))} <span aria-hidden="true">→</span> ${esc(locRef(p.nt.ref))}${yrs != null ? ` · ${esc(t('tl.years', { n: num(yrs) }))}` : ''}</span></span></button>`;
  const last = lastRead && D.byId.get(lastRead), start = last || timeList(() => true)[0]?.p;
  $('#continue').innerHTML = start ? `<button type="button" class="continue bento-card" data-id="${esc(start.id)}"><span><small>${esc(t(last ? 'continue' : 'bento.start'))}</small><b>${esc(L(start).title)}</b></span><fvl-icon name="arrow-right" size="md"></fvl-icon></button>` : '';
  const n = saved.length;
  $('#bSaved').innerHTML = `<button type="button" class="bento-card b-sv" data-go="#/saved"><span class="b-kick">${esc(t('bento.saved'))}</span>
    <span class="b-big">${num(n)}</span><span class="b-sub">${esc(n ? saved.slice(-2).reverse().map((id) => L(D.byId.get(id) || { title: '' }).title).filter(Boolean).join(' · ') : t('bento.saved0'))}</span></button>`;
  // The study you were last in (the most recent step read), else the way into the studies.
  const keys = [...sRead], lastKey = keys[keys.length - 1], sid = lastKey && lastKey.slice(0, lastKey.lastIndexOf(':'));
  const studyCard = (I) => {
    const m = sid && I?.studies[sid];
    if (!m) return `<button type="button" class="bento-card b-st" data-go="#/threads/studies"><span class="b-kick">${esc(t('bento.studies'))}</span><span class="b-title">${esc(t('bento.studiesD'))}</span>${miniArcSVG('many')}</button>`;
    const done = Array.from({ length: m.steps }, (_, i) => sRead.has(sReadKey(sid, i)));
    let nxt = done.indexOf(false); if (nxt < 0) nxt = 0;
    const pct = (done.filter(Boolean).length / m.steps) * 100;
    return `<button type="button" class="bento-card b-st hue-${studyHue(sid)}" data-go="#/study/${encodeURIComponent(sid)}/${nxt}"><span class="b-kick">${esc(t('bento.study'))}</span>
      <span class="b-title">${esc(LS(m).name || LS(m).title)}</span><span class="b-sub">${esc(t('bento.step', { i: num(nxt + 1), n: num(m.steps) }))}</span>
      <span class="sc-prog" style="--p:${pct.toFixed(1)}%"><i></i></span></button>`;
  };
  $('#bStudy').innerHTML = studyCard(D.SI);
  if (sid && !D.SI) loadStudyIndex().then((I) => { if ($('#bStudy')) $('#bStudy').innerHTML = studyCard(I); }).catch(() => {});
}

function rowHTML(p0, { summary = true } = {}) {
  const p = L(p0);
  const isRead = readSet.has(p.id), isSaved = saved.includes(p.id), yrs = yearsOf(p0);
  // Span and years share the first line; the years have a fixed width, so every row's timeline lines up.
  return `<li><button type="button" class="row span-row${isRead ? ' is-read' : ''}" data-id="${esc(p.id)}">
    <span class="span-line">${spanHTML(p0)}<span class="row-gap">${yrs != null ? esc(t('tl.years', { n: num(yrs) })) : ''}</span><span class="sr">${esc(catLabel(p))}</span></span>
    <span class="row-head">
      <span class="row-title">${esc(p.title)}</span>
      <span class="row-marks">${isSaved ? `<fvl-icon class="saved" name="star" label="${esc(t('rowSaved'))}"></fvl-icon>` : ''}${isRead ? `<fvl-icon name="check" label="${esc(t('rowRead'))}"></fvl-icon>` : ''}</span>
    </span>
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
  if (!$('#hero .tl-fan') || $('#hero').dataset.lang !== lang()) renderHero();
  $('#hero .tl-fan')?.setAttribute('data-cat', S.cat);
  markReadArcs();
  const list = filtered();
  $('#count').textContent = `${num(list.length)} ${pluralForm(list.length, 'bridge')}`;
  $('#applyBtn').textContent = list.length ? t('apply', { n: list.length }) : t('noMatch');
  const active = [S.book && dispBook(S.book), S.type !== 'all' && typeLabel(S.type)].filter(Boolean);
  $('#filterLabel').textContent = active.length ? active.join(' · ') : t('filterBtn');
  $('#clearBtn').hidden = !(active.length || S.cat !== 'all' || S.q);
  renderBento();
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

// ---------- appointed times (Leviticus 23) ----------
// Dates come from the Hebrew calendar built into the browser (Intl), the fixed calendar of Jewish practice today.
// Days are handled as UTC noons, so time zones and daylight saving never move a date.
const DAY = 864e5;
const HEBF = (() => {
  try {
    const f = new Intl.DateTimeFormat('en-u-ca-hebrew', { day: 'numeric', month: 'long', timeZone: 'UTC' });
    return /Nisan/.test(f.format(Date.UTC(2027, 3, 21, 12))) ? f : null;
  } catch { return null; }
})();
const todayNoon = () => { const d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12); };
let moedDays = null; // { today, marks: Map('Nisan 15' -> [dates]) } for 70 days back to 420 ahead
function moedMarks() {
  const today = todayNoon();
  if (moedDays?.today === today) return moedDays;
  const marks = new Map();
  for (let i = -70; i <= 420; i++) {
    const ms = today + i * DAY, parts = HEBF.formatToParts(ms);
    const k = `${parts.find((x) => x.type === 'month').value} ${parts.find((x) => x.type === 'day').value}`;
    if (!marks.has(k)) marks.set(k, []);
    marks.get(k).push(ms);
  }
  return (moedDays = { today, marks });
}
// Next (or current) occurrence: { s, e } first and last day, plus alt (the other reckoning, or the eighth day).
function moedNext(tm) {
  const today = todayNoon(), w = tm.when;
  if (w === 'weekly') { const s = today + ((6 - new Date(today).getUTCDay() + 7) % 7) * DAY; return { s, e: s }; }
  if (!HEBF) return null;
  const { marks } = moedMarks();
  if (w === 'firstfruits' || w === 'weeks') {
    // The Sunday within the seven days of Unleavened Bread (15–21 Nisan); Weeks is 49 days after it.
    const add = w === 'weeks' ? 49 * DAY : 0;
    for (const n15 of marks.get('Nisan 15') || []) {
      let sun = n15;
      while (new Date(sun).getUTCDay() !== 0) sun += DAY;
      if (sun + add >= today) return { s: sun + add, e: sun + add, alt: n15 + DAY + add };
    }
    return null;
  }
  const len = (w.days || 1) - 1;
  for (const s of marks.get(`${w.m} ${w.d}`) || []) {
    if (s + len * DAY >= today) return { s, e: s + len * DAY, alt: w.eighth ? s + (len + 1) * DAY : null };
  }
  return null;
}
const dateLoc = () => (lang() === 'pl' ? 'pl-PL' : 'en-GB');
const fmtDate = (ms, o) => new Intl.DateTimeFormat(dateLoc(), { timeZone: 'UTC', ...o }).format(ms);
const longDate = (ms) => fmtDate(ms, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
function rangeText(r, short) {
  const o = { weekday: short ? 'short' : 'long', day: 'numeric', month: 'long', year: 'numeric' };
  if (r.s === r.e) return fmtDate(r.s, o);
  const f = new Intl.DateTimeFormat(dateLoc(), { timeZone: 'UTC', ...o, weekday: 'short' });
  try { return f.formatRange(r.s, r.e); } catch { return `${f.format(r.s)} – ${f.format(r.e)}`; }
}
function untilText(r) {
  const today = todayNoon();
  if (today >= r.s && today <= r.e) return r.s === r.e ? t('moed.today') : t('moed.now', { date: fmtDate(r.e, { day: 'numeric', month: 'long' }) });
  const n = Math.round((r.s - today) / DAY);
  try { return new Intl.RelativeTimeFormat(lang(), { numeric: 'auto' }).format(n, 'day'); } catch { return `+${n}`; }
}
function moedWhen(tm, short) {
  const r = moedNext(tm);
  return r ? `<span class="when-date">${esc(rangeText(r, short))}</span><span class="when-until">${esc(untilText(r))}</span>` : '';
}

// ---------- threads ----------
function renderThreads() {
  const v = $('#view-threads');
  if (S.thMode === 'studies') return renderStudies();
  const th = S.thread && D.T[S.thread] && LT(S.thread);
  if (!th) {
    v.innerHTML = `<div class="nav-scroll">${thModeHTML('threads')}</div><div class="section-head"><p>${esc(t('threads.lead'))}</p></div>
      <ol class="list card-list" id="threadList">${Object.keys(D.T).map((k) => { const x = LT(k); return `<li><button type="button" class="row" data-thread="${esc(k)}">
        <span class="span-line">${threadSpanHTML(D.T[k])}<span class="row-gap">${num(x.steps.length)} ${pluralForm(x.steps.length, 'step')}</span></span><span class="row-title">${esc(x.title)}</span><span class="row-sum">${esc(x.subtitle)}</span></button></li>`; }).join('')}</ol>`;
    wireThMode(v);
    return;
  }
  // A calendar thread (the appointed times) shows each step's next date.
  const cal = th.calendar;
  v.innerHTML = `<div class="actions"><fvl-button variant="tertiary" size="sm" data-go="#/threads"><fvl-icon name="arrow-left"></fvl-icon>${esc(t('allThreads'))}</fvl-button></div>
    <div class="section-head"><h2>${esc(th.title)}</h2><p>${esc(th.description)}</p>${cal && D.CALNOTE[lang()] ? `<p class="note">${esc(D.CALNOTE[lang()])}</p>` : ''}</div>
    <div class="actions"><fvl-button variant="secondary" class="cta" data-read-thread="${esc(S.thread)}">${esc(t('readThread'))}</fvl-button></div>
    <ol class="list path">${th.steps.map((st, i) => {
      const p = D.byId.get(st.prophecyId);
      const tm = cal && D.TIMEBY.get(st.prophecyId), when = tm ? moedWhen(tm, true) : '';
      return `<li><button type="button" class="row${p && readSet.has(p.id) ? ' is-read' : ''}" data-id="${esc(st.prophecyId)}" data-step="${i}">
        <span class="kicker"><span class="step-n">${i + 1}</span><span aria-hidden="true">·</span>${esc(locRef(st.ref))}</span>
        <span class="row-title">${esc(st.stage.replace(/^\d+\.\s*/, ''))}</span><span class="row-sum">${esc(st.note)}</span>
        ${when ? `<span class="row-when"><fvl-icon name="calendar"></fvl-icon>${when}</span>` : ''}</button></li>`;
    }).join('')}</ol>`;
}

// ---------- studies (The Berean Study) ----------
// A study is one video: the passages the teacher turns to, in his order, each with what he draws from it.
// data/studies/index.json lists series and studies; data/studies/<id>.json holds the steps; verses.json maps verses to steps.
let studyIndexP = null;
const loadStudyIndex = () => (studyIndexP ??= getJSON('data/studies/index.json').then((d) => { D.SI = d; return d; }).catch((e) => { studyIndexP = null; throw e; }));
const loadStudy = (id) => cached(BIB.xref, `study:${id}`, () => getJSON(`data/studies/${encodeURIComponent(id)}.json`)).then((d) => { D.SD[id] = d; return d; });
let studyVersesP = null;
const loadStudyVerses = () => (studyVersesP ??= getJSON('data/studies/verses.json').catch(() => ({})));
// Polish where it exists, English otherwise.
function LS(x) {
  if (!x) return x;
  const pl = lang() === 'pl' && x.pl;
  if (!pl) return x;
  return { ...x, name: pl.name || x.name, title: pl.title || x.title, question: pl.question || x.question, summary: pl.summary || x.summary, claims: pl.claims || x.claims, topics: pl.topics || x.topics,
    steps: !Array.isArray(x.steps) ? x.steps : x.steps.map((st, i) => ({ ...st, point: pl.steps?.[i]?.point || st.point, note: pl.steps?.[i]?.note ?? st.note })) };
}
const hms = (t) => { const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + ':' + String(s).padStart(2, '0'); };
const lenText = (sec) => { const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60); return h ? t('st.len', { h, m }) : t('st.lenM', { m }); };
const videoAt = (st, sec) => st.video ? `${st.video}${st.video.includes('?') ? '&' : '?'}t=${sec}s` : '';
const sReadKey = (id, i) => `${id}:${i}`;
const sRead = new Set(store.get('sb_sread_v1', []));
function stepKicker(st, i, total) {
  const how = st.kind === 'cited' ? t('st.cited') : st.version && st.version !== 'unknown' && st.version !== '-' ? t('st.read', { v: st.version }) : t('st.readU');
  // In the reader the line is spelled out: "Step 4 of 104 · 12:00 into the video · read from the KJV".
  return total ? `<span>${esc(t('st.stepOf', { n: i + 1, t: total }))}</span><span aria-hidden="true">·</span><span>${esc(t('st.into', { time: hms(st.t) }))}</span><span aria-hidden="true">·</span><span>${esc(how)}</span>`
    : `<span class="step-n">${i + 1}</span><span aria-hidden="true">·</span><span class="st-time">${esc(hms(st.t))}</span><span aria-hidden="true">·</span><span>${esc(how)}</span>`;
}
function thModeHTML(mode) {
  return `<fvl-segmented id="thMode" value="${mode}" aria-label="${esc(t('th.mode'))}"><fvl-segment value="threads">${esc(t('th.threads'))}</fvl-segment><fvl-segment value="studies">${esc(t('th.studies'))}</fvl-segment></fvl-segmented>`;
}
function wireThMode(v) {
  $('#thMode', v)?.addEventListener('change', (e) => { const m = e.target.value; location.hash = m === 'studies' ? '#/threads/studies' : '#/threads'; });
}
// Each study keeps one hue: the Blessed Hope series, the Salvation series, and each single study its own.
const STUDY_HUE = { hope: 1, saved: 3, godhead: 2, passion: 5 };
const studyHue = (id) => { const m = D.SI?.studies[id]; return STUDY_HUE[m?.series] || STUDY_HUE[id] || 4; };
// A study's cover is its route through Scripture as arcs: a line from Genesis (left) to Revelation (right), and an arc
// for every move he makes from one passage to the next. A filled point marks a book he reads from, an open ring a book he
// only mentions. No two covers are alike, and they share the app's one shape: the arc.
function coverSVG(route, W = 300, H = 400) {
  if (!route?.length) return '';
  const px = 16, base = H * 0.9, ntX = px + (39 / 66) * (W - 2 * px), X = (x) => px + (x / 1000) * (W - 2 * px), maxH = H * 0.74;
  let arcs = '';
  for (let i = 1; i < route.length; i++) {
    const a = X(route[i - 1][0]), b = X(route[i][0]);
    if (Math.abs(b - a) < 1.5) continue;
    const l = Math.min(a, b), r = Math.max(a, b), rx = (r - l) / 2, ry = Math.min(maxH, rx * (W < H ? 2.2 : 1.1));
    arcs += `M${l.toFixed(1)} ${base.toFixed(1)}A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${r.toFixed(1)} ${base.toFixed(1)}`;
  }
  const pts = new Map();
  route.forEach(([x, , k]) => { const key = Math.round(X(x)); pts.set(key, (pts.get(key) || 0) | k); });
  const pt = (x) => `M${x} ${base.toFixed(1)}h0.01`;
  const rd = [...pts].filter(([, k]) => k).map(([x]) => pt(x)).join(''), mt = [...pts].filter(([, k]) => !k).map(([x]) => pt(x)).join('');
  return `<svg class="sc-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <line class="sc-axis" x1="${px}" x2="${W - px}" y1="${base.toFixed(1)}" y2="${base.toFixed(1)}"/><line class="sc-nt" x1="${ntX.toFixed(1)}" x2="${ntX.toFixed(1)}" y1="${(base - 10).toFixed(1)}" y2="${(base + 10).toFixed(1)}"/>
    <path class="sc-route" d="${arcs}"/><path class="mt-o" d="${mt}"/><path class="mt-i" d="${mt}"/><path class="rd" d="${rd}"/></svg>`;
}
// Each study is named by what it is about; the video's own title is shown on the study page.
const cardTitle = (x) => x.name || x.title;
function studyCardHTML(id) {
  const m = D.SI.studies[id], x = LS(m), se = m.series && D.SI.series.find((q) => q.id === m.series);
  const done = Array.from({ length: m.steps }, (_, i) => sRead.has(sReadKey(id, i))).filter(Boolean).length;
  return `<li><button type="button" class="study-card hue-${studyHue(id)}" data-study="${esc(id)}">
    <span class="sc-cover" data-theme="dark" data-daylight="night">${coverSVG(m.route, 200, 200)}${m.part ? `<span class="sc-num" aria-hidden="true">${String(m.part).padStart(2, '0')}</span>` : ''}</span>
    <span class="sc-body"><span class="sc-title">${esc(cardTitle({ ...x, series: m.series, part: m.part }))}</span>
      <span class="sc-q">${esc(x.question)}</span>
      <span class="sc-meta">${esc(`${num(m.steps)} ${pluralForm(m.steps, 'step')} · ${lenText(m.dur)}`)}</span>
      ${done ? `<span class="sc-prog" style="--p:${(done / m.steps * 100).toFixed(1)}%" aria-label="${esc(t('st.done', { r: num(done), n: num(m.steps) }))}"><i></i></span>` : ''}</span>
  </button></li>`;
}
async function renderStudies() {
  const v = $('#view-threads');
  const want = S.study;
  if (!D.SI || (want && !D.SD[want])) {
    v.innerHTML = `<div class="nav-scroll">${thModeHTML('studies')}</div><p class="note" aria-busy="true">${esc(t('st.loading'))}</p>`;
    wireThMode(v);
    try { await loadStudyIndex(); if (want) await loadStudy(want); }
    catch { if (S.study === want && S.thMode === 'studies') $('.note', v).textContent = t('st.err'); return; }
    if (S.study !== want || S.thMode !== 'studies' || S.tab !== 'threads') return;
  }
  const I = D.SI;
  if (!want) {
    const card = (id) => studyCardHTML(id);
    const singles = Object.keys(I.studies).filter((id) => !I.studies[id].series);
    v.innerHTML = `<div class="nav-scroll">${thModeHTML('studies')}</div>
      <div class="section-head"><p>${esc(t('st.lead'))}</p></div>
      ${I.series.map((se) => `<section class="st-group" aria-label="${esc(LS(se).title)}"><h3 class="st-group-h"><span class="p-label">${esc(t('st.series'))}</span>${esc(LS(se).title)}</h3>
        <ol class="study-grid">${se.parts.map(card).join('')}</ol></section>`).join('')}
      ${singles.length ? `<section class="st-group" aria-label="${esc(t('st.single'))}"><h3 class="st-group-h"><span class="p-label">${esc(t('st.single'))}</span></h3><ol class="study-grid">${singles.map(card).join('')}</ol></section>` : ''}
      <p class="note">${esc(t('st.coverHint'))}</p>
      <p class="note">${esc(t('st.about'))}</p>`;
    wireThMode(v);
    return;
  }
  const x = LS(D.SD[want]), meta = I.studies[want], se = meta.series && I.series.find((q) => q.id === meta.series);
  const done = x.steps.filter((_, i) => sRead.has(sReadKey(want, i))).length;
  // Where to carry on: the first step not yet read after the last one read.
  let last = -1; x.steps.forEach((_, i) => { if (sRead.has(sReadKey(want, i))) last = i; });
  const next = done && last < x.steps.length - 1 ? last + 1 : -1;
  v.innerHTML = `<div class="actions"><fvl-button variant="tertiary" size="sm" data-go="#/threads/studies"><fvl-icon name="arrow-left"></fvl-icon>${esc(t('st.all'))}</fvl-button></div>
    <div class="st-hero hue-${studyHue(want)}">
      <div class="sc-cover wide" data-theme="dark" data-daylight="night">${coverSVG(meta.route, 640, 240)}<span class="sc-label">${esc(se ? `${LS(se).title} · ${t('st.part', { n: meta.part })}` : t('st.single1'))}</span></div>
      <div class="st-hero-text">
        <h2>${esc(x.name || x.title)}</h2>
        <p class="st-video">${esc(t('st.video', { title: x.title }))}</p>
        <p class="st-question">${esc(x.question)}</p>
        <p class="st-meta">${esc(`${num(x.steps.length)} ${pluralForm(x.steps.length, 'step')} · ${lenText(meta.dur)}`)}${done ? ` · ${esc(t('st.done', { r: num(done), n: num(x.steps.length) }))}` : ''}</p>
        <div class="actions">${next >= 0 ? `<fvl-button variant="secondary" class="cta" data-study-at="${next}">${esc(t('st.continue', { n: next + 1 }))}</fvl-button><fvl-button variant="secondary" data-read-study="${esc(want)}">${esc(t('st.fromStart'))}</fvl-button>`
          : `<fvl-button variant="secondary" class="cta" data-read-study="${esc(want)}">${esc(t('st.follow'))}</fvl-button>`}${meta.video ? `<a class="ext" href="${esc(meta.video)}" target="_blank" rel="noopener">YouTube<fvl-icon name="external-link"></fvl-icon></a>` : ''}</div>
      </div>
    </div>
    <p class="note">${esc(t('st.routeHint'))}</p>
    <section class="st-about"><p class="p-label">${esc(t('st.summary'))}</p><p>${esc(x.summary)}</p></section>
    <section class="st-claims" aria-label="${esc(t('st.concludes'))}"><p class="p-label">${esc(t('st.concludes'))}</p><ul>${x.claims.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>
    <div class="motifs" aria-label="${esc(t('st.topics'))}">${x.topics.map((k) => `<fvl-tag>${esc(k)}</fvl-tag>`).join('')}</div>
    <h3 class="st-steps-h">${esc(t('st.stepsH', { n: num(x.steps.length) }))}</h3>
    <ol class="list path">${x.steps.map((st, i) => `<li><button type="button" class="row${sRead.has(sReadKey(want, i)) ? ' is-read' : ''}${st.kind === 'cited' ? ' is-cited' : ''}" data-sstep="${i}">
      <span class="kicker">${stepKicker(st, i)}</span><span class="row-title">${esc(locRef(st.ref))}</span><span class="row-sum">${esc(st.point)}</span></button></li>`).join('')}</ol>
    <p class="note">${esc(t('st.about'))}</p>`;
  // Opening a study draws its route in his order, one arc after another (once per visit to the page).
  if (S.drawnStudy !== want && window.DrawSVGPlugin && !reduced) {
    const route = $('.st-hero .sc-route', v), dots = $$('.st-hero .sc-art path:not(.sc-route)', v);
    if (route) gsap.from(route, { drawSVG: '0%', duration: 1.8, ease: 'power1.inOut', onComplete: () => { route.style.removeProperty('stroke-dasharray'); route.style.removeProperty('stroke-dashoffset'); } });
    gsap.from(dots, { opacity: 0, duration: 0.5, delay: 0.2 });
  }
  S.drawnStudy = want;
}
function openStudyStep(id, i, src) {
  pendingSrc = src || null;
  pushed = true;
  cur = { pendingStep: i };
  location.hash = `#/study/${encodeURIComponent(id)}/${i}`;
}
// The passage verse by verse, in the chosen Bible (one line per verse, as in the Bible view).
async function studyPassageHTML(ref) {
  const segs = parseRefList(ref);
  const arrays = await Promise.all(segs.map((sg) => chapterText(sg.osis, sg.c)));
  return segs.map((sg, k) => {
    const vs = arrays[k];
    const ranges = sg.ranges.length ? sg.ranges : [[1, vs.length]];
    const head = segs.length > 1 ? `<p class="seg-ref">${esc(refName(BIB.byOsis.get(sg.osis)))} ${sg.c}</p>` : '';
    const jn = joinedNow(sg.osis, sg.c);
    // A range that starts on a joined verse begins at the verse it is joined to, so no line is empty.
    return head + ranges.map(([a, b], j) => (j ? '<p class="seg-gap" aria-hidden="true">…</p>' : '') + vs.slice((jn[a] || a) - 1, b).map((vt, q) => {
      const n = (jn[a] || a) + q;
      if (jn[n]) return '';
      return `<span class="verse" data-sv="${esc(`${sg.osis}.${sg.c}.${n}`)}" role="button" tabindex="0" aria-label="${esc(t('verseAria', { n }))}"><span class="vn" aria-hidden="true">${verseLabel(jn, n)}</span><span class="vt">${vt ? esc(vt) : emptyVerse()}</span></span>`;
    }).join('')).join('');
  }).join('');
}
// What he draws from a passage. A step that gathers several moments on the same verses shows each one
// as its own paragraph, headed by its time in the video (a link to that moment when the video is known).
function pointHTML(st, meta) {
  const paras = st.point.split('\n\n');
  if (!st.at || st.at.length !== paras.length) return paras.map((x) => `<p>${esc(x)}</p>`).join('');
  return paras.map((x, i) => {
    const tm = esc(t('st.into', { time: hms(st.at[i]) })), url = videoAt(meta, st.at[i]);
    return `<p class="st-para"><span class="st-at">${url ? `<a class="ext" href="${esc(url)}" target="_blank" rel="noopener">${tm}</a>` : tm}</span>${esc(x)}</p>`;
  }).join('');
}
function renderStudyReader() {
  const id = cur.ctx.key, x = LS(D.SD[id]), meta = D.SI.studies[id];
  const st = x.steps[cur.idx], nx = x.steps[cur.idx + 1];
  // A merged step may name several versions ("NLT, KJV"): offer the first one the app has.
  const verName = String(st.version).split(', ').find((v) => v === 'KJV' || v === 'NLT');
  const verId = { KJV: 'kjv', NLT: 'nlt' }[verName];
  const showKjv = st.kind === 'read' && verId && trInfo().id !== verId && lang() === 'en' && BIB.meta?.translations.some((q) => q.id === verId);
  const vid = videoAt(meta, st.t);
  rBody.innerHTML = `<div class="r-in">
    ${cur.idx === 0 ? `<div class="r-step"><span class="kicker">${esc(x.name || x.title)}</span><p>${esc(x.question)}</p></div>` : ''}
    <p class="kicker">${stepKicker(st, cur.idx, cur.seq.length)}</p>
    <h2 class="r-title" id="rTitle" tabindex="-1">${esc(locRef(st.ref))}</h2>
    <section class="passage" aria-label="${esc(locRef(st.ref))}">
      <p class="p-label st-tr">${esc(trNameFor(parseRefList(st.ref)[0]?.osis))}</p>
      <div class="p-text st-text" lang="${esc(trInfo().lang)}"><span class="p-loading">…</span></div>
      ${showKjv ? `<p class="note st-kjv">${esc(t('st.inVer', { v: verName }))} <button type="button" class="link-btn" data-to-ver="${verId}">${esc(t('st.toVer', { v: verName }))}</button></p>` : ''}
      ${trInfo().notice ? `<p class="note">${esc(trInfo().notice)}</p>` : ''}
      ${passageLinks(st.ref)}
    </section>
    <section class="why" aria-label="${esc(t('st.draws'))}">
      <p class="p-label">${esc(t('st.draws'))}</p>
      <div class="st-points">${pointHTML(st, meta)}</div>
      ${st.note ? `<p class="note">${esc(st.note)}</p>` : ''}
      ${vid ? `<p class="p-links"><a class="ext" href="${esc(vid)}" target="_blank" rel="noopener">${esc(t('st.watch', { time: hms(st.t) }))}<fvl-icon name="external-link"></fvl-icon></a></p>` : ''}
    </section>
  </div>`;
  $('#star').hidden = true;
  $('#prev').disabled = cur.idx <= 0;
  const last = cur.idx >= cur.seq.length - 1, next = $('#next');
  next.textContent = last ? t('finish') : t('next');
  next.setAttribute('aria-label', last ? t('finishA') : t('nextA', { t: nx ? locRef(nx.ref) : '' }));
  const tok = ++passageToken;
  studyPassageHTML(st.ref).then((html) => {
    if (tok !== passageToken) return;
    $('.st-text', rBody).innerHTML = html;
    // If the NLT could not be read for this passage, the label names the KJV and a plain note under the text says why.
    if (trInfo().id === 'nlt' && parseRefList(st.ref).some((sg) => nltFell.has(`${sg.osis}/${sg.c}`))) {
      $('.st-tr', rBody).textContent = trMeta('kjv')?.name || 'King James Version';
      if (!$('.st-fell', rBody)) $('.st-text', rBody).insertAdjacentHTML('afterend', `<p class="note st-fell">${esc(t('nlt.fail'))}</p>`);
    }
  })
    .catch(() => { if (tok === passageToken) $('.st-text', rBody).textContent = t('passageErr'); });
  // The next passage is likely to be read next.
  if (nx) parseRefList(nx.ref).forEach((sg) => chapterText(sg.osis, sg.c).catch(() => {}));
}
// The verse sheet's "In the studies" list for one verse.
async function studyVersesHTML(osis, c, v) {
  const map = await loadStudyVerses();
  const hits = map[`${osis}.${c}`]?.[v];
  if (!hits?.length) return '';
  const I = await loadStudyIndex().catch(() => null);
  if (!I) return '';
  // One row per study: it opens where he reads the verse aloud (else where he first mentions it); other moments are listed.
  const by = new Map();
  hits.forEach((h) => { if (!by.has(h[0])) by.set(h[0], []); by.get(h[0]).push(h); });
  const groups = [...by].map(([sid, all]) => ({ sid, all, best: all.find((h) => h[3] === 'read') || all[0] }));
  return `<section class="xgroup" aria-label="${esc(t('st.verses'))}">
    <div class="xgroup-head"><p class="p-label">${esc(t('st.verses'))} · ${num(groups.length)}</p><p class="note">${esc(t('st.versesHint'))}</p></div>
    <ol class="list sheet-list">${groups.map(({ sid, best, all }) => { const m = LS(I.studies[sid]); if (!m) return ''; const others = all.filter((h) => h !== best);
      return `<li><button type="button" class="row" data-go-study="${esc(sid)}" data-i="${best[1]}">
      <span class="kicker"><span class="st-time">${esc(hms(best[2]))}</span><span aria-hidden="true">·</span><span>${esc(best[3] === 'cited' ? t('st.cited') : t('st.readU'))}</span></span><span class="row-title">${esc(m.name || m.title)}</span>
      ${others.length ? `<span class="row-sum">${esc(t('st.alsoAt', { times: others.map((h) => hms(h[2])).join(', ') }))}</span>` : ''}</button></li>`; }).join('')}</ol></section>`;
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

// ---------- time: every bridge as an arc from promise to fulfilment ----------
// Years come from each bridge's era line ("c. 1400 BC → c. AD 50"): the earliest promise date and the first fulfilment date.
function eraYears(p) {
  const [a, b] = String(p.eraGap || '').replace(/\([^)]*\)/g, '').split('→');
  if (!b) return null;
  const ot = Math.max(...(a.match(/\d[\d,]*/g) || []).map((x) => +x.replace(/,/g, '')));
  const m = b.match(/(\d[\d,]*)\s*BC|AD\s*(\d[\d,]*)/);
  if (!isFinite(ot) || !m) return null;
  return { ot: -ot, nt: m[1] ? -(+m[1].replace(/,/g, '')) : +m[2].replace(/,/g, '') };
}
function timeBridges() {
  return D.P.filter(inMapCat).map((p) => ({ p, y: eraYears(p) })).filter((x) => x.y).sort((a, b) => a.y.ot - b.y.ot || a.y.nt - b.y.nt);
}
function renderTime(animate) {
  const list = timeBridges();
  $('#timeView').innerHTML = `${fanSVG(list, { H: 320 })}<ol class="list card-list">${list.map(({ p }) => rowHTML(p)).join('')}</ol>`;
  if (animate && window.DrawSVGPlugin && !reduced) gsap.from('#timeView .tl-arc', { drawSVG: '0%', stagger: 0.008, ...spring.grow, onComplete: () => $$('#timeView .tl-arc').forEach((x) => { x.style.removeProperty('stroke-dasharray'); x.style.removeProperty('stroke-dashoffset'); }) });
}
function showMapMode() {
  const time = S.mapMode === 'time';
  $('#mapMode').value = S.mapMode;
  $('#mapLead').textContent = t(time ? 'map.timeLead' : 'map.lead');
  $('#timeView').hidden = !time;
  $('#bmap').hidden = time;
  if (time) { $('#mapBar').hidden = true; $('#view-map').classList.remove('with-bar'); }
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
    <div class="actions"><fvl-button variant="secondary" class="cta" data-read-saved>${esc(t('readSaved'))}</fvl-button><fvl-button variant="secondary" data-copy-md><fvl-icon name="copy"></fvl-icon>${esc(t('copyMd'))}</fvl-button></div>
    <ol class="list card-list">${items.map((p) => rowHTML(p)).join('')}</ol>`;
}

// ---------- Bible: BSB text + OpenBible cross-references, one small file per chapter ----------
const BIB = { meta: null, byOsis: new Map(), byName: new Map(), text: new Map(), done: new Map(), xref: new Map() };
async function bibleMeta() {
  if (BIB.meta) return BIB.meta;
  const m = await fetchJSON('data/bible/books.json');
  m.books.forEach((b, i) => { b.index = i; BIB.byOsis.set(b.osis, b); BIB.byName.set(b.name.toLowerCase(), b); });
  [['psalm', 'Ps'], ['song of songs', 'Song'], ['revelation of john', 'Rev']].forEach(([n, o]) => BIB.byName.set(n, BIB.byOsis.get(o)));
  // The NLT is not stored here: it is read live from Tyndale's NLT API (see nltChapter).
  m.translations = m.translations.filter((x) => !RETIRED.has(x.id));
  const at = m.translations.findIndex((x) => x.id === 'kjv') + 1 || 1;
  m.translations.splice(at, 0, NLT);
  BIB.meta = m;
  return m;
}
function cached(map, key, load) {
  if (!map.has(key)) map.set(key, load().catch((err) => { map.delete(key); throw err; }));
  return map.get(key);
}
const getJSON = (url) => fetchJSON(url, 2);
// ---------- NLT, live from Tyndale's NLT API (https://api.nlt.to, non-commercial use) ----------
// The New Living Translation is copyrighted, so its text is never stored in this app: each chapter is fetched
// when it is read and kept only in memory. Without a key the API serves 50 verses a request and 500 requests a day
// per reader; a free key (api.nlt.to → Sign Up) raises that to 500 verses and 5,000 requests.
const NLT_KEY = 'TEST';
const NLT = { id: 'nlt', label: 'NLT', name: 'New Living Translation', lang: 'en', remote: true,
  licence: '© Tyndale House Foundation, read live from the NLT API', url: 'https://api.nlt.to',
  empty: 'The NLT translates this verse together with the verse before it.',
  notice: 'Scripture quotations are taken from the Holy Bible, New Living Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers, Carol Stream, Illinois 60188. All rights reserved.' };
// The API returns an HTML excerpt. Rather than rely on one exact layout, the reply is read in document order:
// any element with a vn="16" attribute, or a verse-number span (class "vn") or <sup> holding only a number, starts
// that verse, and the text that follows belongs to it until the next number. A range ("16-17") means the NLT
// translates those verses together. Footnotes, footnote markers and headings are dropped.
function nltVerses(html, c, n, into, joined) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('.tn, .a-tn, script, style, h1, h2, h3, h4, h5, h6').forEach((q) => q.remove());
  let v = 0, found = false;
  const start = (raw) => {
    const m = String(raw).trim().match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
    if (!m) return false;
    v = +m[1]; found = true;
    if (m[2]) for (let k = v + 1; k <= Math.min(+m[2], n); k++) joined[k] = v;
    return true;
  };
  const walk = (node) => {
    for (const ch of node.childNodes) {
      if (ch.nodeType === 3) { if (v >= 1 && v <= n) into[v - 1] += ch.nodeValue; continue; }
      if (ch.nodeType !== 1) continue;
      const chap = ch.getAttribute('ch');
      if (chap && +chap !== c) continue;
      if (ch.hasAttribute('vn')) start(ch.getAttribute('vn'));
      if ((ch.classList.contains('vn') || ch.tagName === 'SUP') && start(ch.textContent)) continue;
      walk(ch);
      if (/^(P|DIV|SECTION|LI|BR)$/.test(ch.tagName) && v >= 1 && v <= n) into[v - 1] += ' ';
    }
  };
  walk(doc.body);
  if (!found) throw new Error('NLT: no verse numbers in reply');
}
const nltJoined = new Map(); // "Osis/c" -> { verse: first verse it is joined to }
async function nltFetch(b, c, a, z, n, out, joined) {
  const url = `https://api.nlt.to/api/passages?ref=${encodeURIComponent(`${b.name} ${c}:${a}-${z}`)}&version=NLT&key=${encodeURIComponent(NLT_KEY)}`;
  const r = await fetch(url, { credentials: 'omit' });
  if (!r.ok) throw new Error('NLT ' + r.status);
  nltVerses(await r.text(), c, n, out, joined);
}
async function nltChapter(osis, c) {
  const b = BIB.byOsis.get(osis), n = b.verses[c - 1];
  const out = new Array(n).fill(''), joined = {};
  const step = NLT_KEY === 'TEST' ? 50 : 500;
  const ranges = [];
  for (let a = 1; a <= n; a += step) ranges.push([a, Math.min(n, a + step - 1)]);
  // The BSB says which verses really exist (a few are not in the earliest manuscripts and are blank in both).
  const [bsb] = await Promise.all([chapterText(osis, c, 'bsb'), ...ranges.map(([a, z]) => nltFetch(b, c, a, z, n, out, joined))]);
  const missing = () => {
    const tidy = out.map((x) => x.replace(/\s+/g, ' ').trim());
    const gaps = [];
    tidy.forEach((x, i) => { if (!x && !joined[i + 1] && bsb[i]) { const last = gaps[gaps.length - 1]; if (last && last[1] === i) last[1] = i + 1; else gaps.push([i + 1, i + 1]); } });
    return gaps;
  };
  // Verses the reply left out are asked for again; if any are still missing, the chapter is not shown half-empty.
  let gaps = missing();
  if (gaps.length && gaps.length <= 8) { await Promise.all(gaps.map(([a, z]) => nltFetch(b, c, a, z, n, out, joined))); gaps = missing(); }
  if (gaps.length) throw new Error('NLT: verses missing ' + JSON.stringify(gaps));
  nltJoined.set(`${osis}/${c}`, joined);
  return out.map((x) => x.replace(/\s+/g, ' ').trim());
}
// Where the NLT translates verses together, show one line numbered "23–24" instead of an empty verse.
function joinedNow(osis, c) {
  const tr = trInfo();
  if (tr.id === 'nlt') return !nltFell.has(`${osis}/${c}`) ? nltJoined.get(`${osis}/${c}`) || {} : {};
  return (!otBorrowed(osis) && tr.joined?.[`${osis}/${c}`]) || {};
}
function verseLabel(j, v) { let last = v; while (j[last + 1] === v) last++; return last > v ? `${v}–${last}` : String(v); }
// If the NLT cannot be reached, say so once and read the KJV instead.
let nltWarned = false;
const nltFell = new Set();
function nltFallback(osis, c) {
  nltFell.add(`${osis}/${c}`);
  if (!nltWarned) { nltWarned = true; toast.warning(t('nlt.fail')); }
  return getJSON(`data/bible/kjv/${osis}/${c}.json`);
}

// Translations: KJV and NLT (English), Słowo Życia (Polish), UBG as the Polish backup. Same versification throughout.
// Retired Bibles are kept only for internal use, never offered; a reader who had chosen one moves to its successor.
const RETIRED = new Map([['bsb', 'nlt'], ['gdanska', 'sz']]);
// Backup Bibles sit in a folded "Backup" section of the pickers (UBG: complete and offline, also Słowo Życia's Old Testament).
const BACKUP = new Set(['ubg']);
const TR = { id: store.get('sb_tr', 'nlt') };
if (RETIRED.has(TR.id)) { TR.id = RETIRED.get(TR.id); store.set('sb_tr', TR.id); }
const trInfo = () => BIB.meta?.translations.find((t) => t.id === TR.id) || BIB.meta?.translations[0] || { id: 'kjv', lang: 'en', empty: '' };
const bookName = (b) => (trInfo().lang === 'pl' ? b.namePl : b.name) || b.name;
const trMeta = (id) => BIB.meta?.translations.find((t) => t.id === id);
const isOT = (osis) => BIB.byOsis?.get(osis)?.testament === 'OT';
function trFor(osis, id = trInfo().id) { const m = trMeta(id); return m?.nt && isOT(osis) ? m.fallback : id; }
const trNameFor = (osis) => trMeta(trFor(osis))?.name || trInfo().name;
const otBorrowed = (osis) => trFor(osis) !== trInfo().id;
// In references the Psalter reads as one psalm ("Psalm 23:1"), not "Psalms 23:1".
const refName = (b) => (b.osis === 'Ps' ? 'Psalm' : bookName(b));
const emptyVerse = () => `<em class="omit">${esc(trInfo().empty || 'Not in the earliest manuscripts.')}</em>`;
const textKey = (osis, c, tr) => `${tr}:${osis}/${c}`;
const chapterText = (osis, c, tr0 = trInfo().id, tr = trFor(osis, tr0)) => cached(BIB.text, textKey(osis, c, tr), () => (tr === 'nlt' ? nltChapter(osis, c).catch(() => nltFallback(osis, c)) : getJSON(`data/bible/${tr}/${osis}/${c}.json`)).then((vs) => { BIB.done.set(textKey(osis, c, tr), vs); return vs; }));
const chapterXref = (osis, c) => cached(BIB.xref, `${osis}/${c}`, () => getJSON(`data/bible/xref/${osis}/${c}.json`).catch(() => ({})));
const chapterXin = (osis, c) => cached(BIB.xref, `in:${osis}/${c}`, () => getJSON(`data/bible/xin/${osis}/${c}.json`).catch(() => ({})));
// Hebrew / Greek words per chapter, lexicon and occurrence buckets (STEPBible data, CC BY 4.0).
const chapterOrig = (osis, c) => cached(BIB.xref, `orig:${osis}/${c}`, () => getJSON(`data/orig/${osis}/${c}.json`).catch(() => ({})));
const bucketOf = (strong) => `${strong[0]}/${Math.floor(Number(strong.slice(1, 5)) / 100)}`;
const lexEntry = (strong) => cached(BIB.xref, `lex:${bucketOf(strong)}`, () => getJSON(`data/lex/${bucketOf(strong)}.json`)).then((d) => d[strong]);
const occList = (strong) => cached(BIB.xref, `occ:${bucketOf(strong)}`, () => getJSON(`data/occ/${bucketOf(strong)}.json`)).then((d) => d[strong] || []);
// People and places per chapter (BibleData, CC BY 4.0; OpenBible.info geocoding, CC BY 4.0), details by bucket, two base maps.
const chapterWho = (osis, c) => cached(BIB.xref, `who:${osis}/${c}`, () => getJSON(`data/who/${osis}/${c}.json`).catch(() => ({})));
const idBucket = (key) => { let a = 0; for (const ch of key) a = (a * 31 + ch.codePointAt(0)) % 64; return a; };
const entity = (kind, id) => cached(BIB.xref, `${kind}:${idBucket(id)}`, () => getJSON(`data/${kind}/${idBucket(id)}.json`)).then((d) => d[id]);
let mapsP = null;
const loadMaps = () => (mapsP ??= getJSON('data/maps.json').catch(() => null));
const TYPE_PLACE_PL = { settlement: 'miejscowość', region: 'kraina', mountain: 'góra', campsite: 'obozowisko', river: 'rzeka', valley: 'dolina', gate: 'brama',
  island: 'wyspa', hill: 'wzgórze', 'body of water': 'zbiornik wodny', 'natural area': 'obszar naturalny', structure: 'budowla', spring: 'źródło',
  'mountain range': 'pasmo górskie', pool: 'sadzawka', road: 'droga', 'district in settlement': 'dzielnica', tree: 'drzewo', altar: 'ołtarz', well: 'studnia',
  'people group': 'lud', hall: 'sala', garden: 'ogród', field: 'pole', room: 'izba', promontory: 'przylądek', ford: 'bród', rock: 'skała', cliff: 'urwisko',
  fortification: 'twierdza', canal: 'kanał', 'stone heap': 'kopiec kamieni', forest: 'las', 'mountain pass': 'przełęcz' };
const placeType = (ty) => { const s = (lang() === 'pl' ? TYPE_PLACE_PL[ty] : ty) || ty || ''; return s && s[0].toUpperCase() + s.slice(1); };
// A small map with the place marked: the Holy Land when it lies there, else the Mediterranean and Near East.
function miniMap(maps, lon, lat, label) {
  const inside = (f) => lon >= f.bbox[0] && lon <= f.bbox[2] && lat >= f.bbox[1] && lat <= f.bbox[3];
  const f = maps && [maps.holy, maps.region].find(inside);
  if (!f) return '';
  const [x0, y0, , y1] = f.bbox, cosm = Math.cos(((y0 + y1) / 2) * Math.PI / 180), k = f.w / ((f.bbox[2] - x0) * cosm);
  const x = (lon - x0) * cosm * k, y = (y1 - lat) * k, r = f.w / 36;
  // A 16:10 window of the map, as wide as the map, centred on the place (never letterboxed).
  const vh = Math.min(f.h, f.w / 1.6), vy = Math.max(0, Math.min(f.h - vh, y - vh / 2));
  return `<svg class="mini-map" viewBox="0 ${vy.toFixed(1)} ${f.w} ${vh.toFixed(1)}" role="img" aria-label="${esc(label)}">
    <rect class="mm-sea" width="${f.w}" height="${f.h}"/><path class="mm-land" d="${f.land}"/><path class="mm-coast" d="${f.coast || ''}"/><path class="mm-water" d="${f.water}"/><path class="mm-river" d="${f.rivers}"/>
    <circle class="mm-halo" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"/><circle class="mm-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r / 3).toFixed(1)}"/>
    <text class="mm-label" x="${(x > f.w * 0.7 ? x - r * 1.3 : x + r * 1.3).toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${x > f.w * 0.7 ? 'end' : 'start'}" dominant-baseline="central" font-size="${(f.w / 26).toFixed(1)}" lang="en">${esc(label)}</text></svg>`;
}
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
// A verse the Bible translates together with the one before it has no text of its own: a passage that starts there
// starts at the verse it was joined to, so its words are not lost.
function versesText(vs, joined, a, b) { let s = a; while (s > 1 && !vs[s - 1] && joined[s]) s = joined[s]; return vs.slice(s - 1, b).filter(Boolean).join(' '); }
// The verse where a phrase begins, found in the stored text that has the phrase (its first words, else its last).
function verseOfPhrase(segs, ref, phrase) {
  const w = String(phrase).split(/\s+/).filter(Boolean);
  if (!w.length) return null;
  const probes = [w.slice(0, Math.min(5, w.length)).join(' '), w.slice(-Math.min(4, w.length)).join(' ')];
  for (const probe of probes) for (let i = 0; i < segs.length; i++) {
    const vs = ref[i]; if (!vs) continue;
    for (const [a, b] of segs[i].ranges.length ? segs[i].ranges : [[1, vs.length]]) for (let v = a; v <= b; v++) if (vs[v - 1]?.includes(probe)) return { i, v };
  }
  return null;
}
const MARK_A = '\u0001', MARK_B = '\u0002';
function partsHTML(segs, arrays, key0, ref) {
  const key = typeof key0 === 'function' ? key0() : key0;
  // A verse to mark (the live NLT): its words are wrapped whole.
  const at = key && typeof key === 'object' ? verseOfPhrase(segs, ref || [], key.verseOf) : null;
  const parts = segs.map((sg, i) => {
    let vs = arrays[i];
    const jn = joinedNow(sg.osis, sg.c);
    if (at && at.i === i) {
      let v = at.v; while (v > 1 && !vs[v - 1] && jn[v]) v = jn[v];
      if (vs[v - 1]) { vs = vs.slice(); vs[v - 1] = MARK_A + vs[v - 1] + MARK_B; }
    }
    const pieces = (sg.ranges.length ? sg.ranges : [[1, vs.length]]).map(([a, b]) => versesText(vs, jn, a, b));
    return { label: `${refName(BIB.byOsis.get(sg.osis))} ${sg.c}${sg.spec ? ':' + sg.spec : ''}`, text: pieces.filter(Boolean).join(' … ') };
  });
  const mark = (text) => (at ? esc(text).split(MARK_A).join('<mark>').split(MARK_B).join('</mark>') : highlight(text, typeof key === 'string' ? key : ''));
  if (parts.length === 1) return mark(parts[0].text);
  return parts.map((x) => `<span class="seg"><span class="seg-ref">${esc(x.label)}</span> ${mark(x.text)}</span>`).join(' ');
}
// The stored text a verse-mark is found in (the BSB, kept for this and no longer offered).
const markRef = (segs) => Promise.all(segs.map((sg) => chapterText(sg.osis, sg.c, 'bsb').catch(() => null)));
async function passageHTML(ref, key) {
  const segs = parseRefList(ref);
  const [arrays, bsb] = await Promise.all([Promise.all(segs.map((sg) => chapterText(sg.osis, sg.c))), trInfo().id === 'nlt' ? markRef(segs) : null]);
  return partsHTML(segs, arrays, key, bsb);
}
// The same, only if every chapter is already loaded (null otherwise).
function passageHTMLNow(ref, key) {
  const segs = parseRefList(ref);
  const arrays = segs.map((sg) => BIB.done.get(textKey(sg.osis, sg.c, trFor(sg.osis))));
  if (!arrays.every(Boolean)) return null;
  const bsb = trInfo().id === 'nlt' ? segs.map((sg) => BIB.done.get(textKey(sg.osis, sg.c, 'bsb'))) : null;
  if (bsb && !bsb.every(Boolean)) return null;
  return partsHTML(segs, arrays, key, bsb);
}
function prefetchBridge(id) {
  const p = D.byId.get(id);
  if (!p || !BIB.meta) return;
  [p.ot.ref, p.nt.ref].forEach((ref) => parseRefList(ref).forEach((sg) => chapterText(sg.osis, sg.c).catch(() => {})));
  loadReview();
}
async function passagePlain(ref) {
  const segs = parseRefList(ref);
  const texts = await Promise.all(segs.map(async (sg) => { const vs = await chapterText(sg.osis, sg.c), jn = joinedNow(sg.osis, sg.c); return (sg.ranges.length ? sg.ranges : [[1, vs.length]]).map(([a, b]) => versesText(vs, jn, a, b)).join(' … '); }));
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
    <h2 class="ch-title">${esc(refName(b))} ${c}</h2>
    <p class="ch-text" id="chText" aria-busy="true" lang="${esc(trInfo().lang)}"></p>
    ${trInfo().notice ? `<p class="note tr-notice">${esc(trInfo().notice)}</p>` : ''}
    <nav class="ch-nav" aria-label="${esc(t('chaptersNav'))}">
      ${prev ? `<fvl-button variant="secondary" data-go="${bibleHash(prev)}"><fvl-icon name="chevron-left"></fvl-icon>${esc(chName(prev))}</fvl-button>` : '<span></span>'}
      ${next ? `<fvl-button variant="secondary" class="cta" data-go="${bibleHash(next)}">${esc(chName(next))}<fvl-icon name="chevron-right"></fvl-icon></fvl-button>` : '<span></span>'}
    </nav>`;
  let text, xr;
  try { [text, xr] = await Promise.all([chapterText(osis, c), chapterXref(osis, c)]); }
  catch { if (token === bibleToken) $('#chText').textContent = t('chapterErr'); return; }
  if (token !== bibleToken) return;
  const el = $('#chText');
  el.removeAttribute('aria-busy');
  if (trInfo().id === 'nlt' && nltFell.has(`${osis}/${c}`)) { const n = $('.tr-notice', v); if (n) n.textContent = t('nlt.fail'); }
  if (otBorrowed(osis)) $('#chText').insertAdjacentHTML('beforebegin', `<p class="note tr-notice tr-borrow">${esc(t('tr.otFrom', { name: trNameFor(osis) }))}</p>`);
  const jn = joinedNow(osis, c);
  const bv = bridgeVerses()[`${osis}.${c}`] || {};
  el.innerHTML = text.map((vt, i) => {
    const n = i + 1;
    if (jn[n]) return '';
    const br = bv[n];
    // A verse that begins or completes a bridge carries the arc under its number (open ring: a promise; filled: a fulfilment).
    const mark = br ? `<svg class="vb-mark${br.some((x) => x.side === 'nt') ? ' kept' : ''}" viewBox="0 0 16 9" aria-hidden="true"><path d="M2 7A6 6 0 0 1 14 7"/><circle cx="2" cy="7" r="1.6"/><circle cx="14" cy="7" r="1.6"/></svg>` : '';
    return `<span class="verse${br ? ' has-bridge' : ''}" data-v="${n}" role="button" tabindex="0" aria-label="${esc(t('verseAria', { n }))}${br ? esc(', ' + t('vb.aria', { n: br.length })) : ''}"><span class="vn" aria-hidden="true">${verseLabel(jn, n)}${mark}</span><span class="vt">${vt ? esc(vt) : emptyVerse()}</span></span>`;
  }).join('');
  store.set('sb_bible_pos', { osis, c });
  if (verse) {
    const vEl = $(`.verse[data-v="${verse}"]`, el);
    if (vEl) { vEl.classList.add('sel'); requestAnimationFrame(() => vEl.scrollIntoView({ block: 'center' })); }
  }
}

// Which verses begin or complete a bridge: "Osis.c" -> { verse: [{ id, side }] }, built once from the bridges' references.
let BV = null;
function bridgeVerses() {
  if (BV || !BIB.meta) return BV || {};
  BV = {};
  for (const p of D.P) for (const side of ['ot', 'nt']) for (const sg of parseRefList(p[side].ref)) {
    for (const [a, z] of sg.ranges) for (let v = a; v <= z; v++) {
      const ch = (BV[`${sg.osis}.${sg.c}`] ??= {});
      (ch[v] ??= []).some((x) => x.id === p.id) || ch[v].push({ id: p.id, side });
    }
  }
  return BV;
}
// The same verse in every Bible the app has, side by side (NLT read live, so it may be unavailable).
async function compareHTML(osis, c, v) {
  const ts = BIB.meta.translations;
  const rows = await Promise.all(ts.map(async (tr) => {
    let txt;
    if (tr.nt && isOT(osis)) txt = null;
    else try { txt = (await chapterText(osis, c, tr.id))[v - 1]; } catch { txt = null; }
    const fell = tr.id === 'nlt' && nltFell.has(`${osis}/${c}`);
    if (tr.nt && isOT(osis)) return `<div class="cmp-row"><dt>${esc(tr.label)}</dt><dd><em class="omit">${esc(t('cmp.nt'))}</em></dd></div>`;
    return `<div class="cmp-row"><dt>${esc(tr.label)}</dt><dd lang="${esc(tr.lang)}">${fell || txt == null ? `<em class="omit">${esc(t('cmp.na'))}</em>` : txt ? esc(txt) : `<em class="omit">${esc(tr.empty || '')}</em>`}</dd></div>`;
  }));
  return `<dl class="cmp">${rows.join('')}</dl>`;
}

// OpenBible lists each link one way, so a verse shows two groups:
// "Points to" (its own links) and "Referenced by" (verses whose links land here).
async function openXref(osis, c, v) {
  const b = BIB.byOsis.get(osis);
  const [text, xo, xi, og, who] = await Promise.all([chapterText(osis, c), chapterXref(osis, c), chapterXin(osis, c), chapterOrig(osis, c), chapterWho(osis, c)]);
  const out = xo[v] || [], inc = xi[v] || [], ow = og[v] || [];
  const [pv, lv] = who.v?.[v] || [[], []];
  const chip = (kind, id, name, icon) => `<button type="button" class="who-chip" data-${kind}="${esc(id)}"><fvl-icon name="${icon}"></fvl-icon><span lang="en">${esc(name)}</span></button>`;
  const whoHTML = pv.length || lv.length ? `<section class="xgroup" aria-label="${esc(t('who.title'))}">
      <div class="xgroup-head"><p class="p-label">${esc(t('who.title'))}</p><p class="note">${esc(t('who.hint'))}${t('who.en') ? ` ${esc(t('who.en'))}` : ''}</p></div>
      <div class="who-row">${pv.map((id) => chip('person', id, who.p[id]?.[0] || id, 'users')).join('')}${lv.map((id) => chip('place', id, who.l[id]?.[0] || id, 'map')).join('')}</div>
    </section>` : '';
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
    <div class="actions"><button type="button" class="link-btn" data-compare="${esc(`${osis}.${c}.${v}`)}" aria-expanded="false">${esc(t('cmp.open'))}</button>${nltLink(`${b.name} ${c}:${v}`)}</div>
    <div class="cmp-slot" hidden></div>
    ${constellationHTML(osis, c, v, out, inc)}
    ${(bridgeVerses()[`${osis}.${c}`]?.[v] || []).length ? `<section class="xgroup" aria-label="${esc(t('vb.title'))}">
      <div class="xgroup-head"><p class="p-label">${esc(t('vb.title'))}</p><p class="note">${esc(t('vb.hint'))}</p></div>
      <ol class="list sheet-list">${bridgeVerses()[`${osis}.${c}`][v].map((x) => rowHTML(D.byId.get(x.id), { summary: false })).join('')}</ol></section>` : ''}
    ${whoHTML}
    ${ow.length ? `<section class="xgroup" aria-label="${esc(t(heb ? 'hebrew' : 'greek'))}">
      <div class="xgroup-head"><p class="p-label">${esc(t(heb ? 'hebrew' : 'greek'))} · ${esc(t('origWords', { n: ow.length }))}</p><p class="note">${esc(t('origHint2'))}</p></div>
      <div class="ilin ${heb ? 'he' : 'grc'}" dir="${heb ? 'rtl' : 'ltr'}">${ow.map(([w, , gl, st]) => `<button type="button" class="iw" data-iw="${esc(st || '')}" aria-pressed="false" ${st ? '' : 'disabled'}>
        <span class="w" lang="${heb ? 'he' : 'grc'}">${esc(w.replace(/[\u05C3¶]+$/, ''))}</span><span class="gl" dir="ltr">${esc(gl.replace(/[<>\[\]]/g, ''))}</span></button>`).join('')}</div>
      <div class="wdetail" id="wDetail" hidden></div>
    </section>` : ''}
    ${group('out', t('pointsTo'), t('pointsToHint'), out)}
    ${group('inc', t('refBy'), t('refByHint'), inc)}`;
  if (out.length) renderXrefItems('out');
  if (inc.length) renderXrefItems('inc');
  const xtok = (S.xrefTok = (S.xrefTok || 0) + 1);
  studyVersesHTML(osis, c, v).then((html) => { if (html && xtok === S.xrefTok) $('#xrefBody .actions')?.insertAdjacentHTML('afterend', html); }).catch(() => {});
  constellationStudies(osis, c, v, xtok);
  if (!reduced) requestAnimationFrame(() => $('#cnSky')?.classList.add('on')); else $('#cnSky')?.classList.add('on');
  S.sheetBack = null;
  S.sheetVerse = { osis, c, v };
  dr.show();
}
// ---------- the verse constellation ----------
// A verse at the centre of its own small sky: its bridges (gold) and studies (in their colours) close in, its strongest
// cross-references further out, brighter and larger the more readers linked them; an open ring where another verse points
// to this one, a filled star where this verse points on. Tap a star to see it below; from there read it, or centre the sky on it.
const bookAbbr = (name) => { const w = String(name).split(' '); return /^\d/.test(w[0]) ? `${w[0]} ${w[1]?.slice(0, 3) || ''}` : w[0].slice(0, 4).replace(/(\w{3})s$/, '$1'); };
// Short book names: the standard abbreviations in English ("1 Cor", "Isa"), the first letters in Polish.
const shortBook = (osis) => { const b = BIB.byOsis.get(osis); if (!b) return osis; return lang() === 'pl' ? bookAbbr(refName(b)) : osis.replace(/^(\d)/, '$1 ').replace(/^Ps$/, 'Ps').replace(/^Song$/, 'Song'); };
function cnShort(tg) { const r = parseTarget(tg); return `${shortBook(r.osis)} ${r.c}:${r.v}`; }
function constellationHTML(osis, c, v, out, inc) {
  const b = BIB.byOsis.get(osis);
  const bridges = (bridgeVerses()[`${osis}.${c}`]?.[v] || []).map((x) => D.byId.get(x.id)).filter(Boolean).slice(0, 5);
  const refs = [...out.map(([tg, n]) => ({ tg, n, dir: 'out' })), ...inc.map(([tg, n]) => ({ tg, n, dir: 'inc' }))]
    .sort((a, z) => z.n - a.n).filter((x, i, arr) => arr.findIndex((y) => y.tg === x.tg) === i).slice(0, 16);
  if (!refs.length && !bridges.length) return '';
  const max = Math.max(1, ...refs.map((x) => x.n));
  const nodes = [];
  // Inner ring: bridges (studies join it when they arrive).
  bridges.forEach((p) => nodes.push({ kind: 'bridge', id: p.id, label: L(p).title, short: L(p).title.split(/[:(&]/)[0].trim(), cat: p.category }));
  refs.forEach((x, i) => nodes.push({ kind: x.dir, tg: x.tg, n: x.n, label: refLabel(x.tg), short: cnShort(x.tg), w: Math.sqrt(x.n / max), named: i < 8 }));
  S.cn = { nodes, centre: { osis, c, v } };
  return `<section class="cn" aria-label="${esc(t('cn.title'))}">
    <div class="xgroup-head"><p class="p-label">${esc(t('cn.title'))}</p><p class="note">${esc(t('cn.hint'))}</p></div>
    <div class="cn-sky" id="cnSky" data-theme="dark" data-daylight="night">${cnInner()}</div>
    <div class="cn-cap" id="cnCap" aria-live="polite"><p class="note">${esc(t('cn.pick'))}</p></div>
  </section>`;
}
// Place the stars: the inner ring evenly, the outer ring evenly with a gentle in-and-out, so it reads as a sky, not a clock.
function cnInner() {
  const { nodes, centre } = S.cn, b = BIB.byOsis.get(centre.osis);
  const inner = nodes.filter((n) => n.kind === 'bridge' || n.kind === 'study'), outer = nodes.filter((n) => n.kind === 'out' || n.kind === 'inc');
  const place = (list, r0, wob, rot) => list.forEach((n, i) => {
    const a = rot + (i / Math.max(1, list.length)) * Math.PI * 2, r = r0 + (i % 2 ? wob : -wob) * (list.length > 5 ? 1 : 0);
    n.x = 50 + Math.cos(a) * r; n.y = 50 + Math.sin(a) * r; n.a = a;
  });
  place(inner, 17, 0, -Math.PI / 2 + 0.4);
  place(outer, 30, 3, -Math.PI / 2);
  const lines = nodes.map((n, i) => `<line class="cn-l ${n.kind}" pathLength="1" data-i="${i}" x1="50" y1="50" x2="${n.x.toFixed(2)}" y2="${n.y.toFixed(2)}" style="--w:${(n.w ?? 1).toFixed(2)}"/>`).join('');
  const stars = nodes.map((n, i) => {
    const size = n.kind === 'bridge' || n.kind === 'study' ? 14 : 6 + Math.round((n.w ?? 0.5) * 8);
    const side = Math.cos(n.a) < -0.2 ? 'l' : Math.cos(n.a) > 0.2 ? 'r' : Math.sin(n.a) < 0 ? 't' : 'b';
    return `<button type="button" class="cn-node ${n.kind}${n.cat ? ` c-${esc(n.cat)}` : ''}${n.hue ? ` hue-${n.hue}` : ''}" data-cn="${i}" style="left:${n.x.toFixed(2)}%;top:${n.y.toFixed(2)}%;--s:${size}px;--d:${(i * 0.04).toFixed(2)}s" aria-label="${esc(n.label)}">
      <i></i>${n.named !== false ? `<span class="cn-lab ${side}">${esc(n.short)}</span>` : ''}</button>`;
  }).join('');
  return `<svg class="cn-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
    <span class="cn-core"><i></i><span>${esc(`${shortBook(centre.osis)} ${centre.c}:${centre.v}`)}</span></span>${stars}`;
}
// Studies that turn to this verse join the inner ring once their index arrives.
async function constellationStudies(osis, c, v, xtok) {
  if (!S.cn || !$('#cnSky')) return;
  const map = await loadStudyVerses().catch(() => ({}));
  const hits = map[`${osis}.${c}`]?.[v];
  if (!hits?.length) return;
  const I = await loadStudyIndex().catch(() => null);
  if (!I || xtok !== S.xrefTok || !$('#cnSky')) return;
  const seen = new Set();
  hits.forEach((h) => { if (seen.has(h[0]) || seen.size >= 4) return; seen.add(h[0]); const m = I.studies[h[0]]; if (!m) return;
    const name = LS(m).name || LS(m).title;
    S.cn.nodes.push({ kind: 'study', sid: h[0], i: h[1], label: name, short: name, hue: studyHue(h[0]) }); });
  const sky = $('#cnSky'); sky.innerHTML = cnInner(); sky.classList.add('on', 'still');
}
function cnPick(i) {
  const n = S.cn?.nodes[i]; if (!n) return;
  $$('#cnSky .sel').forEach((x) => x.classList.remove('sel'));
  $(`#cnSky .cn-node[data-cn="${i}"]`)?.classList.add('sel'); $(`#cnSky .cn-l[data-i="${i}"]`)?.classList.add('sel');
  $('#cnSky').classList.add('has-sel');
  const cap = $('#cnCap');
  if (n.kind === 'bridge') {
    const p = L(D.byId.get(n.id));
    cap.innerHTML = `<p class="cn-k">${esc(t('cn.kBridge'))}</p><p class="cn-t">${esc(p.title)}</p><p class="xtext">${esc(locRef(p.ot.ref))} → ${esc(locRef(p.nt.ref))}</p>
      <div class="actions"><fvl-button variant="secondary" class="cta" size="sm" data-cn-bridge="${esc(n.id)}">${esc(t('cn.bridge'))}</fvl-button></div>`;
  } else if (n.kind === 'study') {
    cap.innerHTML = `<p class="cn-k">${esc(t('cn.kStudy'))}</p><p class="cn-t">${esc(n.label)}</p>
      <div class="actions"><fvl-button variant="secondary" class="cta" size="sm" data-go-study="${esc(n.sid)}" data-i="${n.i}">${esc(t('cn.study'))}</fvl-button></div>`;
  } else {
    const r = parseTarget(n.tg);
    cap.innerHTML = `<p class="cn-k">${esc(t(n.kind === 'out' ? 'cn.out' : 'cn.inc'))} · ${esc(t('votesTotal', { n: n.n }))}</p><p class="cn-t">${esc(n.label)}</p>
      <p class="xtext" lang="${esc(trInfo().lang)}">…</p>
      <div class="actions"><fvl-button variant="secondary" class="cta" size="sm" data-cn-centre="${esc(`${r.osis}.${r.c}.${r.v}`)}">${esc(t('cn.centre'))}</fvl-button><fvl-button variant="tertiary" size="sm" data-go="${bibleHash(r)}">${esc(t('cn.read'))}</fvl-button></div>`;
    const tok = S.xrefTok;
    targetText(n.tg).then((txt) => { const x = $('#cnCap .xtext'); if (x && tok === S.xrefTok) x.textContent = txt || trInfo().empty; }).catch(() => {});
  }
  if (!reduced) gsap.fromTo(cap, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out', clearProps: 'opacity,transform' });
}
$('#xrefBody').addEventListener('click', (e) => {
  const node = e.target.closest('.cn-node');
  if (node) { e.stopPropagation(); cnPick(+node.dataset.cn); return; }
  const ce = e.target.closest('[data-cn-centre]');
  if (ce) {
    e.stopPropagation();
    const [o, c, v] = ce.dataset.cnCentre.split('.');
    const body = $('#xrefBody');
    if (!reduced) gsap.to(body, { opacity: 0, duration: 0.15, onComplete: () => openXref(o, +c, +v).then(() => gsap.fromTo(body, { opacity: 0 }, { opacity: 1, duration: 0.25, clearProps: 'opacity' })) });
    else openXref(o, +c, +v);
    $('#xrefSheet').shadowRoot?.querySelector('[part="body"]')?.scrollTo({ top: 0 });
    return;
  }
  const br = e.target.closest('[data-cn-bridge]');
  if (br) { e.stopPropagation(); $('#xrefSheet').close(); pushed = false; openReader(br.dataset.cnBridge, { kind: 'list' }, null); }
});

// A word's meaning: the dictionary form, a short definition (the full one on request) and the verses that use it.
// The first line that says what the word means: not the headword line, not the "[in LXX …]" note, at least two English words;
// cut before the references and scholarly asides that follow.
function shortDef(d) {
  const full = String(d || '').trim();
  const lines = full.split('\n').map((x) => x.trim()).filter(Boolean);
  const plain = (x) => (x.replace(/[^\x00-\x7F]+/g, ' ').match(/[A-Za-z]{2,}/g) || []).length;
  let line = lines.find((x) => /^[\x00-\x7F]/.test(x) && !/^[([:]/.test(x) && !/in LXX/.test(x) && plain(x) >= 2) || lines[0] || '';
  const cut = line.slice(12).search(/[(:]/);
  if (cut >= 0) line = line.slice(0, 12 + cut).replace(/[\s,;]+$/, '');
  const short = line.length > 200 ? line.slice(0, 200).replace(/\s+\S*$/, '') + ' …' : line;
  return { short, full, more: full.length > short.length + 2 };
}
function wordPanelHTML(strong, e, occ, { head = true } = {}) {
  const heb = strong[0] === 'H', d = shortDef(e.d);
  return `${head ? `<div class="wd-head"><span class="wd-lemma" lang="${heb ? 'he' : 'grc'}" dir="${heb ? 'rtl' : 'ltr'}">${esc(e.l)}</span>
      <span class="wd-names"><span class="wd-tr">${esc(e.t)}</span><span class="wd-gl">${esc(e.g)}</span></span></div>` : ''}
    <p class="wd-meta">${esc(t(heb ? 'hebrew' : 'greek'))} · ${esc(strong)} · ${esc(t('wordTimes', { n: e.n }))}</p>
    <p class="wd-def" lang="en">${esc(d.short)}</p>
    ${d.more ? `<button type="button" class="link-btn" data-def-more aria-expanded="false">${esc(t('defMore'))}</button>` : ''}
    <div class="wd-occ"><button type="button" class="link-btn" data-occ-open aria-expanded="false">${esc(t('occOpen', { n: occ.length }))}</button><div class="occ" hidden></div></div>`;
}
function fillOcc(box, list, all) {
  const shown = all ? list.length : 40;
  box.innerHTML = list.slice(0, shown).map((r) => { const [o, c, v] = r.split('.'); const b = BIB.byOsis.get(o);
    return `<button type="button" class="occ-ref" data-go="#/bible/${o}/${c}/${v}">${esc(`${refName(b)} ${c}:${v}`)}</button>`; }).join('') +
    (list.length > shown ? `<fvl-button variant="secondary" size="sm" data-occ-all>${esc(t('showAll', { n: list.length }))}</fvl-button>` : '');
}
// Inside a word panel: the full definition, and the verses, open and close in place.
function wordPanelClick(e) {
  const panel = e.target.closest('.wdetail');
  if (!panel?._word) return false;
  const { e: entry, occ } = panel._word;
  const dm = e.target.closest('[data-def-more]');
  if (dm) {
    const open = dm.getAttribute('aria-expanded') !== 'true', d = shortDef(entry.d);
    $('.wd-def', panel).textContent = open ? d.full : d.short;
    $('.wd-def', panel).classList.toggle('full', open);
    dm.setAttribute('aria-expanded', String(open));
    dm.textContent = t(open ? 'defLess' : 'defMore');
    return true;
  }
  const oo = e.target.closest('[data-occ-open]');
  if (oo) {
    const box = $('.wd-occ .occ', panel), open = oo.getAttribute('aria-expanded') !== 'true';
    if (open) fillOcc(box, occ, false);
    box.hidden = !open;
    oo.setAttribute('aria-expanded', String(open));
    oo.textContent = open ? t('occClose') : t('occOpen', { n: occ.length });
    if (open && !reduced) gsap.fromTo(box, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.24, ease: 'power2.out', clearProps: 'opacity,transform' });
    return true;
  }
  if (e.target.closest('[data-occ-all]')) { fillOcc($('.wd-occ .occ', panel), occ, true); return true; }
  return false;
}
let wordTok = 0;
async function selectWord(btn) {
  const panel = $('#wDetail');
  if (!panel) return;
  const wasOn = btn.getAttribute('aria-pressed') === 'true';
  $$('.iw[aria-pressed="true"]', $('#xrefBody')).forEach((b) => b.setAttribute('aria-pressed', 'false'));
  const tok = ++wordTok;
  if (wasOn) {
    if (reduced) { panel.hidden = true; return; }
    gsap.to(panel, { opacity: 0, y: -4, duration: 0.14, ease: 'power1.in', onComplete: () => { if (tok === wordTok) panel.hidden = true; gsap.set(panel, { clearProps: 'opacity,transform' }); } });
    return;
  }
  btn.setAttribute('aria-pressed', 'true');
  const strong = btn.dataset.iw;
  let e, occ;
  try { [e, occ] = await Promise.all([lexEntry(strong), occList(strong)]); } catch { toast.warning(t('wordErr')); return; }
  if (tok !== wordTok || !e) return;
  const wasOpen = !panel.hidden;
  panel._word = { e, occ };
  panel.innerHTML = wordPanelHTML(strong, e, occ);
  panel.hidden = false;
  if (!reduced) {
    if (wasOpen) gsap.fromTo([...panel.children], { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out', clearProps: 'opacity' });
    else gsap.fromTo(panel, { opacity: 0, y: -6 }, { opacity: 1, y: 0, ...spring.arrive, clearProps: 'opacity,transform' });
  }
  requestAnimationFrame(() => panel.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }));
}
// A word opened on its own (the reader's key words): the same panel, filling the sheet.
async function openWord(strong, { fresh = false } = {}) {
  const body = $('#xrefBody'), dr = $('#xrefSheet');
  const back = fresh ? null : { html: body.innerHTML, heading: dr.getAttribute('heading'), description: dr.getAttribute('description') };
  let e, occ;
  try { [e, occ] = await Promise.all([lexEntry(strong), occList(strong)]); } catch { toast.warning(t('wordErr')); return; }
  if (!e) { toast.warning(t('wordErr')); return; }
  S.sheetBack = back;
  if (fresh) S.sheetVerse = null;
  const sv = S.sheetVerse;
  const heb = strong[0] === 'H';
  dr.setAttribute('heading', `${e.l} · ${e.t}`);
  dr.setAttribute('description', e.g);
  S.occ = { list: occ, shown: 40 };
  const backRef = sv ? `${refName(BIB.byOsis.get(sv.osis))} ${sv.c}:${sv.v}` : '';
  body.innerHTML = `${back && sv ? `<div class="actions"><fvl-button variant="tertiary" size="sm" data-sheet-back><fvl-icon name="arrow-left"></fvl-icon>${esc(t('backTo', { ref: backRef }))}</fvl-button></div>` : ''}
    <div class="wdetail solo">${wordPanelHTML(strong, e, occ)}</div>`;
  const panel = $('.wdetail', body);
  panel._word = { e, occ };
  // On its own, the verses are open from the start.
  $('[data-occ-open]', panel)?.click();
  if (fresh) { dr.show(); return; }
  gsap.fromTo(body, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: reduced ? 0 : 0.28, ease: 'power2.out', clearProps: 'opacity,transform' });
}
// A person or a place, inside the same sheet, with a step back to the verse.
async function openEntity(kind, id) {
  const body = $('#xrefBody'), dr = $('#xrefSheet'), sv = S.sheetVerse;
  const back = { html: body.innerHTML, heading: dr.getAttribute('heading'), description: dr.getAttribute('description') };
  let e, maps;
  try { [e, maps] = await Promise.all([entity(kind, id), kind === 'place' ? loadMaps() : null]); } catch { toast.warning(t('who.err')); return; }
  if (!e) { toast.warning(t('who.err')); return; }
  S.sheetBack = back;
  S.occ = { list: e.r, shown: 40 };
  const backRef = sv ? `${refName(BIB.byOsis.get(sv.osis))} ${sv.c}:${sv.v}` : '';
  let head = '';
  if (kind === 'person') {
    dr.setAttribute('heading', e.n);
    dr.setAttribute('description', [t('who.person'), e.t && t('who.tribe', { t: e.t })].filter(Boolean).join(' · '));
    const on = e.on;
    head = `${on ? `<div class="wordhead"><span class="lemma" lang="${on[2]}" dir="${on[2] === 'he' ? 'rtl' : 'ltr'}">${esc(on[0])}</span>${on[1] ? `<span class="gloss" lang="en">${esc(on[1])}</span>` : ''}</div>` : ''}
      <p class="ent-about" lang="en">${esc(e.a)}</p>`;
  } else {
    dr.setAttribute('heading', e.n);
    dr.setAttribute('description', [placeType(e.ty), e.ll && e.c ? t('who.conf', { n: e.c }) : ''].filter(Boolean).join(' · '));
    const map = e.ll ? miniMap(maps, e.ll[0], e.ll[1], e.n) : '';
    head = `${map ? `<div class="mm-wrap">${map}</div>` : `<p class="note">${esc(t('who.noMap'))}</p>`}
      <p class="ent-about">${e.m ? `${esc(t('who.site', { m: e.m }))} · ` : ''}<a class="ext" href="${esc(e.u)}" target="_blank" rel="noopener">${esc(t('who.src'))}<fvl-icon name="external-link"></fvl-icon></a></p>`;
  }
  body.innerHTML = `${sv ? `<div class="actions"><fvl-button variant="tertiary" size="sm" data-sheet-back><fvl-icon name="arrow-left"></fvl-icon>${esc(t('backTo', { ref: backRef }))}</fvl-button></div>` : ''}
    ${head}
    <section class="xgroup"><p class="p-label">${esc(t('who.verses', { n: e.r.length }))}</p><div class="occ" id="occList"></div><div id="occMore"></div></section>`;
  renderOcc();
  gsap.fromTo(body, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: reduced ? 0 : 0.28, ease: 'power2.out', clearProps: 'opacity,transform' });
  const halo = $('.mm-halo', body);
  if (halo && !reduced) gsap.from(halo, { attr: { r: 0 }, ...spring.arrive, delay: 0.12 });
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

// ---------- share a bridge as a picture ----------
// A 4:5 card on the night sky (the same in light and dark): the title, the bridge's arc in gold with both dates and the
// years between, both passages from the chosen Bible (named at the foot), in the app's own colours and type. Sent to the
// share sheet where the phone has one, otherwise downloaded.
async function bridgeImage(p0) {
  const p = L(p0), W = 1080, H = 1350, M = 88;
  const css = getComputedStyle(document.body), tok = (n) => css.getPropertyValue(n).trim();
  // Colours come from a hidden night-theme probe, each turned into plain rgb so every canvas draws it the same.
  const night = document.createElement('div'); night.dataset.theme = 'dark'; night.dataset.daylight = 'night'; night.hidden = true;
  const probe = document.createElement('span'); night.append(probe); document.body.append(night);
  const px = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgb = (c) => { px.clearRect(0, 0, 1, 1); px.fillStyle = '#000'; px.fillStyle = c; px.fillRect(0, 0, 1, 1); const d = px.getImageData(0, 0, 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; }; // lint-allow: a canvas needs plain rgb, read back from the token
  const col = (v) => { probe.style.color = v.startsWith('--') ? `var(${v})` : v; return rgb(getComputedStyle(probe).color); };
  const C = { bg: col('color-mix(in oklab, var(--fvl-color-data-1) 7%, var(--fvl-color-bg-sunken))'), low: col('color-mix(in oklab, var(--fvl-color-data-1) 16%, var(--fvl-color-bg-surface))'),
    text: col('--fvl-color-text-primary'), soft: col('--fvl-color-text-secondary'), muted: col('--fvl-color-text-muted'),
    line: col('--fvl-color-line-strong'), accent: col('--fvl-color-accent-default') };
  probe.className = 'c-' + p0.category; probe.style.color = ''; const cat = rgb(getComputedStyle(probe).color); night.remove();
  const family = tok('--fvl-type-body-family') || 'Inter, sans-serif';
  await Promise.all([document.fonts.load(`600 64px ${family}`), document.fonts.load(`400 32px ${family}`)]).catch(() => {});
  const [ot, nt] = await Promise.all([passagePlain(p.ot.ref), passagePlain(p.nt.ref)]).catch(() => [p.ot.text, p.nt.text]);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, C.bg); sky.addColorStop(1, C.low);
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // a fine field of stars
  g.fillStyle = C.line; g.globalAlpha = 0.35;
  for (let sy = 24; sy < H; sy += 36) for (let sx = 24; sx < W; sx += 36) { g.beginPath(); g.arc(sx, sy, 1.2, 0, 2 * Math.PI); g.fill(); }
  g.globalAlpha = 1;
  const font = (w, px) => { g.font = `${w} ${px}px ${family}`; };
  // Wrap text into at most `max` lines of width `w`, ending with … when cut.
  const wrap = (txt, w, max) => {
    const words = String(txt).split(/\s+/), lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (g.measureText(test).width > w && line) { lines.push(line); line = word; if (lines.length === max) break; } else line = test;
    }
    if (lines.length < max && line) lines.push(line);
    if (lines.length === max && words.join(' ').length > lines.join(' ').length) {
      let last = lines[max - 1];
      while (g.measureText(last + ' …').width > w && last.includes(' ')) last = last.slice(0, last.lastIndexOf(' '));
      lines[max - 1] = last + ' …';
    }
    return lines;
  };
  let y = M;
  // wordmark
  g.strokeStyle = C.accent; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.ellipse(M + 22, y + 26, 20, 18, 0, Math.PI, 0); g.stroke();
  font(600, 30); g.fillStyle = C.text; g.textBaseline = 'middle'; g.fillText('ScriptureBridge', M + 58, y + 18);
  y += 96;
  // title
  font(600, 64); g.textBaseline = 'alphabetic'; g.fillStyle = C.text;
  for (const l of wrap(p.title, W - 2 * M, 3)) { y += 72; g.fillText(l, M, y); }
  y += 72;
  // the arc
  const [a, b] = String(p.eraGap || '').replace(/\s*\([^)]*\)\s*$/, '').split('→').map((x) => (x || '').trim());
  const yrs = yearsOf(p0), base = y + 150;
  g.strokeStyle = C.accent; g.lineWidth = 5; g.shadowColor = C.accent; g.shadowBlur = 24;
  g.beginPath(); g.ellipse(W / 2, base, (W - 2 * M) / 2, 140, 0, Math.PI, 0); g.stroke();
  g.shadowBlur = 0;
  g.fillStyle = C.bg; g.beginPath(); g.arc(M, base, 11, 0, 2 * Math.PI); g.fill(); g.stroke();
  g.fillStyle = C.accent; g.beginPath(); g.arc(W - M, base, 11, 0, 2 * Math.PI); g.fill();
  if (yrs != null) { font(600, 34); g.fillStyle = C.text; g.textAlign = 'center'; g.fillText(t('tl.later', { n: num(yrs) }), W / 2, base - 30); }
  font(600, 30); g.fillStyle = C.text; g.textAlign = 'left'; g.fillText(a, M, base + 52); g.textAlign = 'right'; g.fillText(b, W - M, base + 52); g.textAlign = 'left';
  y = base + 120;
  // both passages
  const passage = (label, ref, txt, maxLines) => {
    font(400, 26); g.fillStyle = C.muted; g.fillText(label, M, y); y += 46;
    font(600, 36); g.fillStyle = C.text; g.fillText(locRef(ref), M, y); y += 22;
    font(400, 32); g.fillStyle = C.soft;
    const lines = wrap(txt, W - 2 * M - 28, maxLines);
    const top = y + 8;
    for (const l of lines) { y += 46; g.fillText(l, M + 28, y); }
    g.fillStyle = cat; g.fillRect(M, top, 4, y - top + 14);
    y += 56;
  };
  passage(t('promise'), p.ot.ref, ot, 4);
  passage(t('fulfilment'), p.nt.ref, nt, 4);
  // foot
  font(400, 24); g.fillStyle = C.muted; g.fillText([...new Set([p.ot.ref, p.nt.ref].map((r) => trNameFor(parseRefList(r)[0]?.osis)))].join(' · '), M, H - M + 10);
  return new Promise((res) => cv.toBlob(res, 'image/png'));
}
async function shareBridgeImage(p0) {
  let blob;
  try { blob = await bridgeImage(p0); } catch { blob = null; }
  if (!blob) { toast.warning(t('share.err')); return; }
  const name = `${L(p0).title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'bridge'}.png`;
  const file = new File([blob], name, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: L(p0).title }); return; } catch (e) { if (e?.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(t('share.saved'));
}

// Citation text in the current language; Polish quotes come from the chosen Polish Bible, with its name.
async function citation(p0) {
  const p = L(p0);
  const [ot, nt] = await Promise.all([passagePlain(p.ot.ref), passagePlain(p.nt.ref)]).catch(() => [p.ot.text, p.nt.text]);
  const srcOf = (r) => ` (${trNameFor(parseRefList(r)[0]?.osis)})`, sa = srcOf(p.ot.ref), sb = srcOf(p.nt.ref);
  const head = `${p.title} (${typeLabel(p.type)})`, a = locRef(p.ot.ref), b = locRef(p.nt.ref);
  return {
    plain: `${head}\n${a}: "${ot}"${sa}\n${b}: "${nt}"${sb}\n${t('why')}: ${p.bridge}`,
    md: `### ${head}\n- **${a}:** "${ot}"${sa}\n- **${b}:** "${nt}"${sb}\n- **${t('why')}:** ${p.bridge}`,
  };
}

// ---------- tabs ----------
const views = Object.fromEntries(TABS.map((t) => [t, $('#view-' + t)]));
function renderTab(t, animate) {
  if (t === 'bridges') renderBridges();
  else if (t === 'threads') renderThreads();
  else if (t === 'map') {
    showMapMode();
    if (S.mapMode === 'time') { renderTime(animate); return; }
    renderMap(animate && !S.mapDrawn); S.mapDrawn = true;
    if (S.mapScroll && S.mapBook) { S.mapScroll = false; requestAnimationFrame(() => $(`.bbook[data-book="${CSS.escape(S.mapBook)}"]`)?.scrollIntoView({ block: 'center' })); }
  }
  else if (t === 'saved') renderSaved();
  else if (t === 'bible') renderBible();
}
function showTab(t, sub) {
  const bibleKey = (x) => [x?.osis, x?.c, x?.v].join('/');
  const mode = t === 'map' && sub === 'time' ? 'time' : 'books';
  const changed = S.tab !== t || (t === 'threads' && S.thSub !== (sub || null)) || (t === 'bible' && bibleKey(S.bible) !== bibleKey(sub)) || (t === 'map' && S.mapMode !== mode);
  if (t === 'map') S.mapMode = mode;
  const verseOnly = t === 'bible' && S.tab === 'bible' && S.bible.osis === sub?.osis && S.bible.c === sub?.c && sub?.c;
  S.tab = t;
  if (t === 'threads') {
    S.thSub = sub || null;
    const sm = /^study:(.+)$/.exec(sub || '');
    S.thMode = sub === 'studies' || sm ? 'studies' : 'threads';
    S.study = sm ? sm[1] : null;
    S.thread = S.thMode === 'threads' && sub && D.T[sub] ? sub : null;
  }
  if (t === 'bible') S.bible = sub || {};
  setTabs(t);
  TABS.forEach((k) => { views[k].hidden = k !== t; });
  renderTab(t, changed);
  if (changed && !verseOnly) {
    window.scrollTo(0, 0);
    gsap.fromTo(views[t], { opacity: 0, y: 8 }, { opacity: 1, y: 0, ...spring.arrive, clearProps: 'opacity,transform' });
  }
}

// ---------- reader ----------
const reader = $('#reader'), rBody = $('#rBody'), rBar = $('#rBar'), browse = $('#browse');
let cur = null;          // { id, ctx, seq, idx }
let pendingSrc = null;   // element the reader grows from
let pushed = false;      // did we push a history entry to open the reader?

function sequence(ctx) {
  if (ctx.kind === 'thread' && D.T[ctx.key]) return D.T[ctx.key].steps.map((s) => s.prophecyId).filter((id) => D.byId.has(id));
  if (ctx.kind === 'study') return (D.SD[ctx.key]?.steps || []).map((_, i) => String(i));
  if (ctx.kind === 'saved') return saved.filter((id) => D.byId.has(id));
  if (ctx.kind === 'map') return mapBridges(ctx.book).map((p) => p.id);
  if (ctx.kind === 'time') return timeBridges().map((x) => x.p.id);
  return filtered().map((p) => p.id);
}
const ctxHash = (ctx) => (ctx.kind === 'thread' ? `/thread/${ctx.key}` : ctx.kind === 'saved' ? '/saved' : ctx.kind === 'time' ? '/time' : ctx.kind === 'map' ? '/map' + (ctx.book ? '/' + encodeURIComponent(ctx.book) : '') : '');
const hashFor = (c) => (c.ctx.kind === 'study' ? `#/study/${encodeURIComponent(c.ctx.key)}/${c.id}` : `#/read/${c.id}${ctxHash(c.ctx)}`);

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
// A study step from the route: load the study (and its list) first.
async function showStudyReader(key, i) {
  try { await Promise.all([loadStudyIndex(), loadStudy(key)]); } catch { toast.warning(t('st.err')); location.replace('#/threads/studies'); return; }
  if (!location.hash.startsWith(`#/study/${encodeURIComponent(key)}/`)) return;
  if (!D.SD[key].steps[i]) i = 0;
  if (!S.tab) showTab('threads', 'study:' + key);
  showReader(String(i), { kind: 'study', key });
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
  if (ctx.kind === 'time') return t('pos.time', v);
  return t('pos.of', v);
}

// The words that carry the link, as an exact phrase of the translation being read (from the review, else the bridge).
function keyOf(p0, side) {
  const r = D.RV?.[p0.id];
  // Słowo Życia words the New Testament its own way, so it has its own phrases (its Old Testament is UBG's).
  if (lang() === 'pl' && side === 'nt' && trInfo().id === 'sz' && r?.keyNtSz) return r.keyNtSz;
  if (lang() === 'pl') return (side === 'ot' ? r?.keyOtPl : r?.keyNtPl) || D.PL[p0.id]?.key?.[side] || '';
  const kjv = () => (side === 'ot' ? r?.keyOtKjv : r?.keyNtKjv) || '';
  if (trInfo().id === 'kjv') return kjv();
  if (trInfo().id === 'nlt') {
    // Read live, the NLT has no stored phrases: mark the verse that holds the link (found in the stored text), or, where
    // the NLT could not be reached and the KJV is shown, the KJV's phrase.
    if (parseRefList(p0[side].ref).some((sg) => nltFell.has(`${sg.osis}/${sg.c}`))) return kjv();
    return { verseOf: (side === 'ot' ? r?.keyOt : r?.keyNt) || p0[side].keyPhrase || '' };
  }
  return (side === 'ot' ? r?.keyOt : r?.keyNt) || p0[side].keyPhrase || '';
}
// How we know: the review's judgement, then the checks computed from the texts and OpenBible.
function evidenceHTML(id) {
  const r = D.RV?.[id], e = D.EV[id];
  if (!r && !e) return '';
  const facts = [];
  if (e) {
    const top = e.links?.[0];
    facts.push(top ? esc(t('ev.votes', { n: top[2], a: refLabel(top[0]), b: refLabel(top[1]) })) : esc(t('ev.noVotes')));
    if (e.overlap?.words >= 4) facts.push(`${esc(t('ev.overlap', { n: e.overlap.words }))} <q lang="en">${esc(e.overlap.text)}</q>`);
    if (e.formula) {
      const f = parseTarget(e.formula.ref);
      const link = `<a class="ext" href="${bibleHash(f)}" data-verse="${esc(e.formula.ref)}">${esc(refLabel(e.formula.ref))}</a>`;
      facts.push(`${tHTML('ev.formula', {}, { ref: link })} <q class="ev-fq" lang="${esc(trInfo().lang)}" data-t="${esc(e.formula.ref)}">${trInfo().id === 'bsb' ? esc(e.formula.phrase) : '…'}</q>`);
    }
  }
  const tone = { strong: 'success', moderate: 'info', weak: 'warning' };
  return `<section class="evidence" aria-label="${esc(t('ev.title'))}">
    <p class="p-label">${esc(t('ev.title'))}</p>
    ${r ? `<div class="ev-badges"><fvl-badge variant="${tone[r.strength] || 'neutral'}">${esc(t('ev.' + r.strength))}</fvl-badge><fvl-badge>${esc(t('ev.' + r.link))}</fvl-badge><fvl-badge>${esc(t('ev.' + r.reading))}</fvl-badge></div>
    <p class="ev-note">${esc(lang() === 'pl' ? r.notePl : r.note)}</p>` : ''}
    ${facts.length ? `<ul class="ev-facts">${facts.map((f) => `<li>${f}</li>`).join('')}</ul>` : ''}
  </section>`;
}
// For a feast: its date in the Hebrew calendar, the next date, what the New Testament says, and its key words.
function moedHTML(id) {
  const tm = D.TIMEBY.get(id);
  if (!tm) return '';
  const lg = lang(), r = moedNext(tm), lev = humanRef(tm.lev);
  const note = tm.note[lg].replace('{alt}', r?.alt ? longDate(r.alt) : '…');
  const chips = (tm.words || []).map((st) => `<button type="button" class="wchip${st[0] === 'H' ? ' he' : ''}" data-word="${esc(st)}" data-lex="${esc(st)}">
    <span class="w" lang="${st[0] === 'H' ? 'he' : 'grc'}" dir="${st[0] === 'H' ? 'rtl' : 'ltr'}">…</span><span class="tr"></span><span class="gl"></span></button>`).join('');
  return `<section class="moed" aria-label="${esc(t('moed.title'))}">
    <p class="p-label">${esc(t('moed.title'))}</p>
    <div class="moed-card">
      <p class="moed-head"><b>${esc(tm.name[lg])}</b><span>${esc(tm.heb[lg])}</span>${lev ? `<a class="ext" href="${bibleHash(lev)}" data-bible="${bibleHash(lev)}">${esc(locRef(tm.lev))}</a>` : ''}</p>
      ${r ? `<p class="moed-date"><fvl-icon name="calendar" size="md"></fvl-icon><span><small>${esc(t('moed.next'))}</small><b>${esc(rangeText(r))}</b><span class="when-until">${esc(untilText(r))}</span></span></p>`
        : `<p class="note">${esc(t('moed.noCal'))}</p>`}
      <p class="note">${esc(note)}</p>
    </div>
    <p class="moed-basis"><fvl-badge variant="${{ reading: 'warning', part: 'neutral' }[tm.basis] || 'info'}">${esc(t({ reading: 'moed.reading', part: 'moed.part' }[tm.basis] || 'moed.nt'))}</fvl-badge><span>${esc(tm.basisText[lg])}</span></p>
    ${chips ? `<div class="moed-words"><p class="p-label">${esc(t('moed.words'))}</p><div class="wgrid">${chips}</div></div>` : ''}
    ${D.CALNOTE[lg] ? `<p class="note">${esc(D.CALNOTE[lg])}</p>` : ''}
  </section>`;
}

// The bridge as one arc: the year of the promise under an open ring, the year it was kept under a filled point,
// and the time between them written under the arc.
function spanFigure(p0, p) {
  const [a, b] = String(p.eraGap || '').replace(/\s*\([^)]*\)\s*$/, '').split('→').map((x) => x.trim());
  const yrs = yearsOf(p0);
  if (!a || !b) return '';
  return `<figure class="r-span c-${esc(p0.category)}">
    <div class="rs-arc" aria-hidden="true"><i class="rs-open"></i><i class="rs-kept"></i>${yrs != null ? `<span class="rs-gap">${esc(t('tl.later', { n: num(yrs) }))}</span>` : ''}</div>
    <figcaption class="rs-ends">
      <span><b>${esc(a)}</b><small>${esc(locRef(p.ot.ref))}</small></span>
      <span class="rs-b"><b>${esc(b)}</b><small>${esc(locRef(p.nt.ref))}</small></span>
    </figcaption></figure>`;
}
let passageToken = 0;
function renderReader() {
  if (cur.ctx.kind === 'study') return renderStudyReader();
  $('#star').hidden = false;
  const p0 = D.byId.get(cur.id), p = L(p0);
  const nx = D.byId.get(cur.seq[cur.idx + 1]);
  const nextP = nx && L(nx);
  const step = cur.ctx.kind === 'thread' ? LT(cur.ctx.key).steps[cur.idx] : null;
  // Both passages are read from the chosen Bible, with the words that carry the link marked.
  // Already-loaded chapters render at once; otherwise a placeholder fills in when they arrive.
  const pl = lang() === 'pl';
  const quote = (side) => (D.RV && passageHTMLNow(p[side].ref, keyOf(p0, side))) ?? `<span class="p-loading" data-side="${side}" data-ref="${esc(p[side].ref)}">…</span>`;
  rBody.innerHTML = `<div class="r-in">
    ${step ? `<div class="r-step"><span class="kicker">${esc(step.stage)}</span><p>${esc(step.note)}</p></div>` : ''}
    <p class="kicker"><span class="dot c-${esc(p.category)}"></span>${esc(catLabel(p))}<span aria-hidden="true">·</span>${esc(typeLabel(p.type))}${cur.ctx.kind !== 'all' ? `<span aria-hidden="true">·</span><span>${esc(positionLabel())}</span>` : ''}</p>
    <h2 class="r-title" id="rTitle" tabindex="-1">${esc(p.title)}</h2>
    ${spanFigure(p0, p)}
    <div class="r-pair c-${esc(p0.category)}">
    <section class="passage" aria-label="${esc(t('promise'))}">
      <p class="p-label p-sym"><i class="sym-open" aria-hidden="true"></i>${esc(t('promise'))}</p>
      <h3 class="p-ref">${esc(locRef(p.ot.ref))} <small>${esc(p.ot.author)}</small></h3>
      <blockquote class="p-text" lang="${pl ? 'pl' : 'en'}">${quote('ot')}</blockquote>
      <p class="p-context">${esc(p.ot.context)}</p>
      ${otBorrowed(parseRefList(p.ot.ref)[0]?.osis) ? `<p class="note tr-borrow">${esc(t('tr.otShort', { name: trNameFor(parseRefList(p.ot.ref)[0]?.osis) }))}</p>` : ''}
      ${passageLinks(p.ot.ref)}
    </section>
    <div class="r-gutter" aria-hidden="true"></div>
    <section class="passage" aria-label="${esc(t('fulfilment'))}">
      <p class="p-label p-sym"><i class="sym-kept" aria-hidden="true"></i>${esc(t('fulfilment'))}</p>
      <h3 class="p-ref">${esc(locRef(p.nt.ref))} <small>${esc(p.nt.author)}</small></h3>
      <blockquote class="p-text" lang="${pl ? 'pl' : 'en'}">${quote('nt')}</blockquote>
      <p class="p-context">${esc(p.nt.context)}</p>
      ${passageLinks(p.nt.ref)}
    </section>
    <svg class="r-links" aria-hidden="true"></svg>${yearsOf(p0) != null ? `<span class="r-links-gap" aria-hidden="true">${esc(t('tl.years', { n: num(yearsOf(p0)) }))}</span>` : ''}
    </div>
    <p class="note r-links-hint">${esc(t('link.hint'))}</p>
    <section class="why" aria-label="${esc(t('why'))}">
      <p class="p-label">${esc(t('why'))}</p>
      <p>${esc(p.bridge)}</p>
    </section>
    ${moedHTML(p.id)}
    <div class="ev-slot">${evidenceHTML(p.id)}</div>
    <div class="motifs" aria-label="${esc(t('motifs'))}">${p.keywords.map((k) => `<fvl-tag data-kw="${esc(k)}" tabindex="0" role="button">${esc(k)}</fvl-tag>`).join('')}</div>
    <div class="r-tools">
      <fvl-button variant="tertiary" size="sm" data-share-img><fvl-icon name="image"></fvl-icon>${esc(t('share.img'))}</fvl-button>
      <fvl-button variant="tertiary" size="sm" data-cite><fvl-icon name="copy"></fvl-icon>${esc(t('copyCite'))}</fvl-button>
      <fvl-button variant="tertiary" size="sm" data-onmap><fvl-icon name="map"></fvl-icon>${esc(t('onMap'))}</fvl-button>
    </div>
  </div>`;
  const arc = $('.rs-arc', rBody);
  if (arc && !reduced) gsap.fromTo(arc, { clipPath: 'inset(-16px 100% -16px -16px)' }, { clipPath: 'inset(-16px -16px -16px -16px)', ...spring.grow, delay: 0.1, clearProps: 'clipPath' });
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
  const tok = ++passageToken;
  // Passages and the review arrive together, so the marked phrase is right the first time.
  $$('.p-loading', rBody).forEach(async (el) => {
    try {
      await loadReview();
      const html = await passageHTML(el.dataset.ref, () => keyOf(p0, el.dataset.side));
      if (tok === passageToken) { el.outerHTML = html; drawLinks(true); }
    } catch { if (tok === passageToken) el.textContent = t('passageErr'); }
  });
  linksDrawn = false;
  requestAnimationFrame(() => drawLinks(true));
  document.fonts?.ready.then(() => { if (tok === passageToken) drawLinks(false); });
  if (!D.RV) loadReview().then(() => { if (tok === passageToken) { const slot = $('.ev-slot', rBody); if (slot) slot.innerHTML = evidenceHTML(p.id); fillEvidence(tok); } });
  fillEvidence(tok);
  $$('[data-lex]', rBody).forEach(async (b) => {
    const e = await lexEntry(b.dataset.lex).catch(() => null);
    if (!e || tok !== passageToken) return;
    $('.w', b).textContent = e.l; $('.tr', b).textContent = e.t; $('.gl', b).textContent = e.g;
  });
  // The next bridge is likely to be read next.
  const nid = cur.seq[cur.idx + 1];
  if (nid) prefetchBridge(nid);
}
// ---------- the connection: promise words to fulfilment words ----------
// A gold curve runs from each marked phrase of the promise to each marked phrase of the fulfilment: an open ring where it
// leaves the promise, a filled point where it arrives. Side by side, the curves cross the gutter between the two passages;
// stacked on a phone, they arc down the right edge. Tapping a marked phrase lights its curves and brings the other end
// into view. Where a passage has no marked words, the curve joins the passages themselves.
let linksDrawn = false;
const SVGNS = 'http://www.w3.org/2000/svg';
function linkAnchors(sec) {
  const marks = $$('.p-text mark', sec).slice(0, 3);
  if (marks.length) return marks;
  const q = $('.p-text', sec);
  return q ? [q] : [];
}
function drawLinks(animate) {
  const pair = $('.r-pair', rBody), svg = pair && $('.r-links', pair);
  if (!svg) return;
  const [ps, fs] = $$('.passage', pair);
  if (!ps || !fs) return;
  const box = pair.getBoundingClientRect();
  if (!box.width) return;
  const side = getComputedStyle($('.r-gutter', pair)).display !== 'none';
  const pr = ps.getBoundingClientRect(), fr = fs.getBoundingClientRect();
  const A = linkAnchors(ps), B = linkAnchors(fs);
  // The y of a phrase: the middle of its last line (leaving) or its first line (arriving).
  const yOf = (el, last) => { const rs = el.getClientRects(); const r = rs.length ? rs[last ? rs.length - 1 : 0] : el.getBoundingClientRect(); return (el.tagName === 'MARK' ? r.top + r.height / 2 : r.top + Math.min(r.height / 2, 48)) - box.top; };
  const edgeR = (side ? pr.right : pr.right - 10) - box.left, edgeL = (side ? fr.left : fr.right - 10) - box.left;
  let out = '', nodes = '', first = null;
  A.forEach((a, i) => B.forEach((b, j) => {
    const ay = yOf(a, true), by = yOf(b, false);
    const d = side
      ? `M${edgeR} ${ay}C${edgeR + (edgeL - edgeR) / 2} ${ay} ${edgeL - (edgeL - edgeR) / 2} ${by} ${edgeL} ${by}`
      : `M${edgeR} ${ay}C${edgeR + 30} ${ay + 40} ${edgeL + 30} ${by - 40} ${edgeL} ${by}`;
    if (!first) first = { x: side ? (edgeR + edgeL) / 2 : edgeR + 22, y: (ay + by) / 2 };
    out += `<g class="lk" data-a="${i}" data-b="${j}"><path class="lk-halo" d="${d}"/><path class="lk-line" pathLength="1" d="${d}"/></g>`;
    if (j === 0) nodes += `<circle class="lk-node o" data-a="${i}" cx="${edgeR}" cy="${ay}" r="5"/>`;
    if (i === 0) nodes += `<circle class="lk-node k" data-b="${j}" cx="${edgeL}" cy="${by}" r="5"/>`;
  }));
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  svg.innerHTML = out + nodes;
  const gap = $('.r-links-gap', pair);
  if (gap && first) { gap.style.left = `${first.x}px`; gap.style.top = `${first.y}px`; gap.classList.toggle('side', side); }
  // The marked words lead to the other end.
  A.forEach((a, i) => { if (a.tagName === 'MARK') { a.dataset.a = i; a.tabIndex = 0; a.setAttribute('role', 'button'); a.setAttribute('aria-label', `${a.textContent} · ${t('link.follow', { ref: $('.p-ref', fs).firstChild.textContent.trim() })}`); } });
  B.forEach((b, j) => { if (b.tagName === 'MARK') { b.dataset.b = j; b.tabIndex = 0; b.setAttribute('role', 'button'); b.setAttribute('aria-label', `${b.textContent} · ${t('link.follow', { ref: $('.p-ref', ps).firstChild.textContent.trim() })}`); } });
  if (animate && !linksDrawn && !reduced) svg.classList.remove('drawn'), void svg.getBoundingClientRect(), svg.classList.add('drawing');
  else svg.classList.remove('drawing');
  svg.classList.add('drawn');
  linksDrawn = true;
  // A redraw (a passage arriving, the page reflowing) keeps the lit connection lit.
  if (pair.dataset.lit) { const [k, v] = pair.dataset.lit.split(':'); $$('.lk, .lk-node', pair).forEach((g) => g.classList.toggle('lit', g.dataset[k] === v)); }
}
function lightLinks(mark, follow) {
  const pair = mark.closest('.r-pair'); if (!pair) return;
  const k = mark.dataset.a != null ? ['a', mark.dataset.a] : ['b', mark.dataset.b];
  $$('.lk, .lk-node', pair).forEach((g) => g.classList.toggle('lit', g.dataset[k[0]] === k[1]));
  pair.classList.add('has-lit'); pair.dataset.lit = k.join(':');
  $$('mark', pair).forEach((m) => m.classList.remove('lit'));
  mark.classList.add('lit');
  const other = k[0] === 'a' ? $('.passage:last-of-type mark[data-b="0"]', pair) || $$('.passage', pair)[1] : $('.passage mark[data-a="0"]', pair) || $$('.passage', pair)[0];
  if (!other) return;
  other.classList?.add('lit');
  if (follow) {
    const r = other.getBoundingClientRect(), top = 0, bot = rBar.getBoundingClientRect().top;
    if (r.top < top + 8 || r.bottom > bot - 8) rBody.closest('.reader').scrollBy({ top: r.top - (top + bot) / 2 + r.height / 2, behavior: reduced ? 'auto' : 'smooth' });
  }
}
function unlightLinks(pair) {
  pair.classList.remove('has-lit'); delete pair.dataset.lit;
  $$('.lit', pair).forEach((x) => x.classList.remove('lit'));
}
if (window.ResizeObserver) new ResizeObserver(() => { if (!reader.hidden) drawLinks(false); }).observe(rBody);
// A tap or click pins the connection (it stays lit while the page scrolls to the other end); hovering only previews it.
rBody.addEventListener('click', (e) => {
  const m = e.target.closest('.r-pair mark[data-a], .r-pair mark[data-b]');
  if (m) { m.closest('.r-pair').dataset.pinned = '1'; lightLinks(m, true); return; }
  const pair = e.target.closest('.r-pair'); if (pair?.classList.contains('has-lit')) { delete pair.dataset.pinned; unlightLinks(pair); }
});
rBody.addEventListener('keydown', (e) => { const m = e.target.closest?.('.r-pair mark[role="button"]'); if (m && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); m.closest('.r-pair').dataset.pinned = '1'; lightLinks(m, true); } });
rBody.addEventListener('pointerover', (e) => { if (e.pointerType === 'touch') return; const m = e.target.closest('.r-pair mark[data-a], .r-pair mark[data-b]'); if (m && !m.closest('.r-pair').dataset.pinned) lightLinks(m, false); });
rBody.addEventListener('pointerout', (e) => { if (e.pointerType === 'touch') return; const m = e.target.closest('.r-pair mark'); const pair = m?.closest('.r-pair'); if (m && !pair.dataset.pinned && !m.contains(e.relatedTarget)) unlightLinks(pair); });

// Other than the BSB: the verse that refers to Scripture, in the chosen Bible.
function fillEvidence(tok) {
  $$('.ev-fq', rBody).forEach(async (q) => {
    if (trInfo().id === 'bsb' || q.dataset.done) return;
    q.dataset.done = '1';
    try { const s = await targetText(q.dataset.t); if (tok === passageToken) q.textContent = s; } catch { q.remove(); }
  });
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
  gsap.fromTo(rBar, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.3, delay: 0.12, clearProps: 'opacity' });
  softFocus($('#rTitle'));
}
function closeReader() {
  if (reader.hidden) return;
  const id = cur?.id;
  root.classList.remove('reading');
  browse.inert = false;
  renderTab(S.tab, false);
  const row = id && views[S.tab] && $(cur.ctx?.kind === 'study' ? `.row[data-sstep="${CSS.escape(id)}"]` : `.row[data-id="${CSS.escape(id)}"]`, views[S.tab]);
  const done = () => {
    reader.hidden = true;
    gsap.set([reader, rBar], { clearProps: 'clipPath,opacity,transform' });
    if (row) softFocus(row);
  };
  if (row && !reduced) {
    // Shrink onto the row and fade out on the way, so nothing is left sitting over the list.
    // FVL carve curve, compressed so its settle tail does not linger.
    row.scrollIntoView({ block: 'center' });
    gsap.timeline({ onComplete: done })
      .to($$('.r-in > *', rBody).concat([rBar]), { opacity: 0, duration: 0.12, ease: 'power1.in' }, 0)
      .to(reader, { clipPath: insetFor(row.getBoundingClientRect()), duration: 0.42, ease: 'fvl-carve' }, 0)
      .to(reader, { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0.16);
  } else {
    gsap.to(reader, { opacity: 0, duration: reduced ? 0 : 0.2, onComplete: done });
  }
}
// Closing the reader returns to the list it was read from: the thread or study page, the map, saved, or the bridges.
function listHash(ctx) {
  if (!ctx) return '#/' + (S.tab || 'bridges');
  if (ctx.kind === 'study') return `#/threads/study/${encodeURIComponent(ctx.key)}`;
  if (ctx.kind === 'thread') return `#/threads/${ctx.key}`;
  if (ctx.kind === 'time') return S.tab === 'map' ? '#/map/time' : '#/bridges';
  if (ctx.kind === 'map') return '#/map';
  if (ctx.kind === 'saved') return '#/saved';
  return '#/' + (S.tab || 'bridges');
}
function back() {
  if (pushed) { pushed = false; history.back(); }
  else location.replace(listHash(cur?.ctx));
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
  if (cur?.ctx?.kind === 'study') { sRead.add(sReadKey(cur.ctx.key, id)); store.set('sb_sread_v1', [...sRead]); return; }
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
  gsap.to(rBar, { yPercent: 0, ...(instant ? { duration: 0 } : spring.settle) });
}
function hideBars() {
  if (barsHidden) return;
  barsHidden = true;
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
  if (parts[0] === 'study' && parts[1]) { showStudyReader(decodeURIComponent(parts[1]), Math.max(0, parseInt(parts[2], 10) || 0)); return; }
  if (parts[0] === 'read' && D.byId.has(parts[1])) {
    const ctx = parts[2] === 'thread' ? { kind: 'thread', key: parts[3] } : parts[2] === 'saved' ? { kind: 'saved' } : parts[2] === 'time' ? { kind: 'time' } : parts[2] === 'map' ? { kind: 'map', book: parts[3] ? decodeURIComponent(parts[3]) : null } : { kind: 'list' };
    if (!S.tab) showTab(ctx.kind === 'thread' ? 'threads' : ctx.kind === 'saved' ? 'saved' : ctx.kind === 'map' || ctx.kind === 'time' ? 'map' : 'bridges', ctx.kind === 'time' ? 'time' : ctx.key);
    showReader(parts[1], ctx);
    return;
  }
  const tab = TABS.includes(parts[0]) ? parts[0] : 'bridges';
  const sub = tab === 'bible' ? { osis: parts[1] || null, c: parts[2] ? +parts[2] : null, v: parts[3] ? +parts[3] : null }
    : tab === 'threads' && parts[1] === 'study' && parts[2] ? 'study:' + decodeURIComponent(parts[2]) : parts[1];
  if (!reader.hidden) {
    if (S.tab !== tab || tab === 'bible' || (tab === 'threads' && S.thSub !== (sub || null)) || (tab === 'map' && S.mapMode !== (sub === 'time' ? 'time' : 'books'))) { reader.hidden = true; root.classList.remove('reading'); browse.inert = false; showTab(tab, sub); }
    else closeReader();
    pushed = false;
    return;
  }
  showTab(tab, sub);
}
window.addEventListener('hashchange', route);

// ---------- events ----------
$('#nav').addEventListener('click', (e) => { const b = e.target.closest('.tab'); if (b && TABS.includes(b.dataset.tab)) location.hash = '#/' + b.dataset.tab; });
let qTimer;
$('#q').addEventListener('input', (e) => { clearTimeout(qTimer); qTimer = setTimeout(() => { S.q = (e.target.value || '').trim(); renderBridges(); }, 120); });
$('#cats').addEventListener('change', (e) => { const v = e.target.getAttribute?.('value'); if (!v) return; S.cat = e.target.selected || v === 'all' ? v : 'all'; syncChips($('#cats'), S.cat); renderBridges(); });
$('#mapCats').addEventListener('change', (e) => { const v = e.target.getAttribute?.('value'); if (!v) return; S.mapCat = e.target.selected || v === 'all' ? v : 'all'; syncChips($('#mapCats'), S.mapCat); if (S.mapMode === 'time') { renderTime(true); return; } if (S.mapBook && !mapBridges(S.mapBook).length) S.mapBook = null; renderMap(true); });
$('#mapMode').addEventListener('change', (e) => { const v = e.target.value; if (v === 'time' || v === 'books') location.hash = v === 'time' ? '#/map/time' : '#/map'; });
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
  const cur = trInfo(), all = BIB.meta?.translations || [];
  const opt = (x) => `<button type="button" class="tr-opt" role="radio" aria-checked="${checked && x.id === cur.id}" data-tr="${esc(x.id)}">
      <span><b>${esc(x.name)}</b><small>${BACKUP.has(x.id) ? 'Polski · pełna Biblia, działa offline' : x.lang === 'pl' ? `Polski · cała aplikacja po polsku${x.nt ? ' · współczesny język, Nowy Testament (Stary z UBG)' : ''}` : 'English · the whole app in English'}</small></span>
      <fvl-icon name="check" size="md" class="tr-check"></fvl-icon></button>`;
  // English first, then Polish; the backup folded away (open when it is the Bible in use).
  const main = all.filter((x) => !BACKUP.has(x.id)).sort((a, b) => (a.lang === b.lang ? 0 : a.lang === 'en' ? -1 : 1)), back = all.filter((x) => BACKUP.has(x.id));
  return main.map(opt).join('') + (back.length ? `<details class="tr-more"${checked && BACKUP.has(cur.id) ? ' open' : ''}>
      <summary><span>Backup · Zapasowa</span><fvl-icon name="chevron-down" size="sm"></fvl-icon></summary>
      <div class="tr-list">${back.map(opt).join('')}</div></details>` : '');
}
function syncTrUI() {
  const cur = trInfo();
  $('#trBtnLabel').textContent = cur.label || 'NLT';
  $('#trBtn').setAttribute('aria-label', STR[lang()]['tr.aria'].replace('{name}', cur.name || 'New Living Translation'));
  $('#trList').innerHTML = trOptionsHTML(true);
}

// Globe menu: a small popover that springs from the button and closes fast.
const trPop = $('#trPop'), trBtn = $('#trBtn');
function openTrMenu() {
  syncTrUI();
  // The menu opens towards the free space: down from the phone's top bar, up from the bottom of the desktop sidebar.
  const r = trBtn.getBoundingClientRect(), up = r.top > innerHeight / 2, left = r.left < innerWidth / 2;
  Object.assign(trPop.style, { top: up ? '' : `${Math.round(r.bottom + 8)}px`, bottom: up ? `${Math.round(innerHeight - r.top + 8)}px` : '',
    right: left ? '' : `${Math.round(Math.max(16, innerWidth - r.right))}px`, left: left ? `${Math.round(Math.max(16, r.left))}px` : '' });
  const origin = `${up ? 'bottom' : 'top'} ${left ? 'left' : 'right'}`;
  trPop.hidden = false;
  trBtn.setAttribute('aria-expanded', 'true');
  if (!reduced) {
    gsap.fromTo(trPop, { opacity: 0, scale: 0.94, y: up ? 6 : -6 }, { opacity: 1, scale: 1, y: 0, duration: 0.36, ease: 'fvl-arrive', transformOrigin: origin });
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
    const opts = $$('.tr-opt', trPop).filter((x) => (x.checkVisibility ? x.checkVisibility() : x.offsetParent)), i = opts.indexOf(document.activeElement);
    e.preventDefault(); opts[(i + (e.key === 'ArrowDown' ? 1 : opts.length - 1)) % opts.length]?.focus();
  }
});
addEventListener('resize', () => closeTrMenu());

// First visit: a calm centred card; the choice also sets the language.
function showWelcome() {
  const w = $('#welcome'), card = $('.welcome-card', w);
  $('#welcomeList').innerHTML = trOptionsHTML(false);
  w.hidden = false; w.scrollTop = 0;
  browse.inert = true;
  document.documentElement.classList.add('sb-modal');
  if (!reduced) {
    gsap.fromTo(w, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' });
    gsap.fromTo(card, { opacity: 0, y: 24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'fvl-arrive', delay: 0.06 });
    gsap.fromTo($$('.tr-opt', card), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, delay: 0.2, ease: 'power2.out', clearProps: 'opacity,transform' });
  }
  softFocus($('.tr-opt', card)); // keyboard users land on the first choice; touch users see no ring
}
// iOS can still drag the page under a fixed layer: when the card fits, a swipe on it does nothing.
$('#welcome').addEventListener('touchmove', (e) => { const w = e.currentTarget; if (w.scrollHeight <= w.clientHeight + 1) e.preventDefault(); }, { passive: false });
$('#welcomeList').addEventListener('click', (e) => {
  const o = e.target.closest('[data-tr]'); if (!o) return;
  const id = o.dataset.tr, w = $('#welcome');
  $$('.tr-opt', w).forEach((x) => x.setAttribute('aria-checked', String(x === o)));
  w.style.pointerEvents = 'none';
  const finish = () => { w.hidden = true; document.documentElement.classList.remove('sb-modal'); w.style.pointerEvents = ''; browse.inert = false; gsap.set([w, $('.welcome-card', w)], { clearProps: 'opacity,transform' }); };
  if (reduced) { setTranslation(id, { instant: true }); finish(); return; }
  // The tick shows, the card leaves, the language switches behind the backdrop, then the backdrop lifts.
  // The card stays solid and slides away (no see-through text over the page), then the backdrop lifts.
  const card = $('.welcome-card', w), travel = innerHeight - card.getBoundingClientRect().top + 24;
  gsap.timeline({ onComplete: finish })
    .to(card, { y: travel, duration: 0.34, ease: 'power2.in', delay: 0.16 })
    .add(() => setTranslation(id, { instant: true }))
    .to(w, { opacity: 0, duration: 0.28, ease: 'power2.out' });
});
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
  if (wordPanelClick(e)) return;
  const iw = e.target.closest('[data-iw]'); if (iw && iw.dataset.iw) { selectWord(iw); return; }
  const wd = e.target.closest('[data-word]'); if (wd && wd.dataset.word) { openWord(wd.dataset.word); return; }
  const pe = e.target.closest('[data-person]'); if (pe) { openEntity('person', pe.dataset.person); return; }
  const pl = e.target.closest('[data-place]'); if (pl) { openEntity('place', pl.dataset.place); return; }
  if (e.target.closest('[data-sheet-back]')) { sheetBack(); return; }
  const cmp = e.target.closest('[data-compare]');
  if (cmp) {
    const slot = $('#xrefBody .cmp-slot'), open = cmp.getAttribute('aria-expanded') === 'true';
    cmp.setAttribute('aria-expanded', String(!open)); cmp.textContent = t(open ? 'cmp.open' : 'cmp.close');
    if (open) { slot.hidden = true; return; }
    slot.hidden = false; slot.innerHTML = `<p class="note">${esc(t('loading'))}</p>`;
    const [o, c, v] = cmp.dataset.compare.split('.');
    compareHTML(o, +c, +v).then((h) => { slot.innerHTML = h; if (!reduced) gsap.from($$('.cmp-row', slot), { opacity: 0, y: 6, stagger: 0.04, ...spring.arrive, clearProps: 'opacity,transform' }); });
    return;
  }
  const brow = e.target.closest('.row[data-id]');
  if (brow) { $('#xrefSheet').close(); pushed = false; openReader(brow.dataset.id, { kind: 'list' }, null); return; }
  const gs = e.target.closest('[data-go-study]');
  if (gs) { $('#xrefSheet').close(); if (!reader.hidden) pushed = false; location.hash = `#/study/${encodeURIComponent(gs.dataset.goStudy)}/${gs.dataset.i}`; return; }
  if (e.target.closest('[data-occ-more]')) { S.occ.shown = S.occ.list.length; renderOcc(); return; }
  const more = e.target.closest('[data-more]');
  if (more) { const g = S.xref[more.dataset.more]; g.shown = g.list.length; renderXrefItems(more.dataset.more); return; }
  const link = e.target.closest('[data-go]'); if (!link) return;
  $('#xrefSheet').close();
  location.hash = link.dataset.go;
});

browse.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') fanPoint(e); }, { passive: true });
browse.addEventListener('pointerleave', () => $$('.tl-fan.has-near').forEach((f) => { f.classList.remove('has-near'); $$('.is-near', f).forEach((x) => x.classList.remove('is-near')); const c = f.closest('.tl-wrap')?.querySelector('.tl-cap'); if (c) c.textContent = ''; }), true);
// Start loading a bridge's passages the moment a finger lands on it.
browse.addEventListener('pointerdown', (e) => { const row = e.target.closest('.row[data-id], .continue[data-id], .b-day[data-id]'); if (row) prefetchBridge(row.dataset.id); }, { passive: true });
// Browse: one delegated handler for rows and actions.
browse.addEventListener('click', (e) => {
  const link = e.target.closest('[data-go]'); if (link) { location.hash = link.dataset.go; return; }
  const mo = e.target.closest('[data-moed]');
  if (mo) { const k = 'feasts', i = D.T[k]?.steps.findIndex((st) => st.prophecyId === mo.dataset.moed); openReader(mo.dataset.moed, i >= 0 ? { kind: 'thread', key: k } : { kind: 'list' }, mo, i >= 0 ? i : undefined); return; }
  const fan = e.target.closest('.tl-fan');
  if (fan) { const g = nearestArc(fan, e.clientX, e.clientY); if (g) openReader(g.dataset.id, { kind: 'time' }, null); return; }
  const th = e.target.closest('[data-thread]'); if (th) { location.hash = '#/threads/' + th.dataset.thread; return; }
  const sd = e.target.closest('[data-study]'); if (sd) { location.hash = '#/threads/study/' + encodeURIComponent(sd.dataset.study); return; }
  const sa = e.target.closest('[data-study-at]'); if (sa && S.study) { openStudyStep(S.study, Number(sa.dataset.studyAt), $(`#view-threads .row[data-sstep="${sa.dataset.studyAt}"]`)); return; }
  const rs = e.target.closest('[data-read-study]'); if (rs) { openStudyStep(rs.dataset.readStudy, 0, $('#view-threads .row[data-sstep="0"]')); return; }
  const ss = e.target.closest('.row[data-sstep]'); if (ss && S.study) { openStudyStep(S.study, Number(ss.dataset.sstep), ss); return; }
  const rt = e.target.closest('[data-read-thread]');
  if (rt) { const k = rt.dataset.readThread; const first = D.T[k].steps[0]; openReader(first.prophecyId, { kind: 'thread', key: k }, $('#view-threads .row[data-step="0"]'), 0); return; }
  if (e.target.closest('[data-read-saved]')) { const ids = sequence({ kind: 'saved' }); if (ids.length) openReader(ids[0], { kind: 'saved' }, $(`#view-saved .row[data-id="${CSS.escape(ids[0])}"]`)); return; }
  if (e.target.closest('[data-copy-md]')) {
    Promise.all(saved.map((id) => D.byId.get(id)).filter(Boolean).map(citation)).then((cs) => copy(cs.map((c) => c.md).join('\n\n'), t('copiedMd')));
    return;
  }
  const row = e.target.closest('.row[data-id], .continue[data-id], .b-day[data-id]');
  if (!row) return;
  const id = row.dataset.id;
  if (S.tab === 'threads' && row.dataset.step != null) openReader(id, { kind: 'thread', key: S.thread }, row, Number(row.dataset.step));
  else if (S.tab === 'saved') openReader(id, { kind: 'saved' }, row);
  else if (S.tab === 'map' && S.mapMode === 'time') openReader(id, { kind: 'time' }, row);
  else openReader(id, { kind: 'list' }, row);
});

// Reader controls.
$('#back').addEventListener('click', back);
$('#prev').addEventListener('click', () => go(-1));
$('#next').addEventListener('click', () => go(1));
$('#star').addEventListener('click', () => cur && toggleSave(cur.id));
rBody.addEventListener('click', (e) => {
  if (e.target.closest('[data-next]')) { go(1); return; }
  const tv = e.target.closest('[data-to-ver]'); if (tv) { setTranslation(tv.dataset.toVer); return; }
  const sv = e.target.closest('[data-sv]');
  if (sv && !getSelection()?.toString()) { const [o, c, v] = sv.dataset.sv.split('.'); openXref(o, +c, +v).catch(() => toast.warning(t('xrefErr'))); return; }
  const wd = e.target.closest('[data-word]');
  if (wd) { openWord(wd.dataset.word, { fresh: true }); return; }
  const vl = e.target.closest('[data-verse]');
  if (vl) { e.preventDefault(); const [o, c, v] = vl.dataset.verse.split('.'); openXref(o, +c, +v).catch(() => toast.warning(t('xrefErr'))); return; }
  const bl = e.target.closest('[data-bible]');
  if (bl) { e.preventDefault(); pushed = false; location.hash = bl.dataset.bible; return; }
  if (e.target.closest('[data-share-img]')) { shareBridgeImage(D.byId.get(cur.id)); return; }
  if (e.target.closest('[data-cite]')) { citation(D.byId.get(cur.id)).then((c) => copy(c.plain, t('citeCopied'))); return; }
  if (e.target.closest('[data-onmap]')) { S.mapBook = D.byId.get(cur.id).ot.book; S.mapScroll = true; S.mapCat = 'all'; syncChips($('#mapCats'), 'all'); pushed = false; location.hash = '#/map'; return; }
  const kw = e.target.closest('[data-kw]');
  if (kw) { resetFilters(); S.q = kw.dataset.kw; $('#q').value = S.q; pushed = false; location.hash = '#/bridges'; renderBridges(); }
});
rBody.addEventListener('keydown', (e) => { const kw = e.target.closest('[data-kw], [data-sv]'); if (kw && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); kw.click(); } });
document.addEventListener('keydown', (e) => {
  if (reader.hidden || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  // A sheet over the reader takes its own keys: Escape closes the sheet, not the reader beneath it.
  if (document.querySelector('fvl-drawer[open]') || !trPop.hidden) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  else if (e.key === 'Escape') { e.preventDefault(); back(); }
});

// ---------- the phone tab bar ----------
// One glass pill slides to the section you choose and opens to show its name; the other icons glide to their new places
// (first, last, invert, play: measure before, switch, then animate from the old place to the new).
const tabInd = $('#nav .tab-ind');
function placeTabInd() {
  const cur = $('#nav .tab[aria-current="page"]');
  if (!cur || getComputedStyle(tabInd).display === 'none') return;
  gsap.set(tabInd, { left: cur.offsetLeft, top: cur.offsetTop, width: cur.offsetWidth, height: cur.offsetHeight });
}
function setTabs(t) {
  const tabs = $$('#nav .tab'), was = tabs.find((b) => b.hasAttribute('aria-current'));
  const phone = getComputedStyle(tabInd).display !== 'none';
  const first = phone ? tabs.map((b) => b.offsetLeft) : null;
  const from = phone && was ? { left: was.offsetLeft, width: was.offsetWidth } : null;
  tabs.forEach((b) => { if (b.dataset.tab === t) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  if (!phone) return;
  gsap.killTweensOf(tabInd);
  placeTabInd();
  if (reduced || !was || was.dataset.tab === t || !from) return;
  const cur = tabs.find((b) => b.dataset.tab === t);
  gsap.fromTo(tabInd, from, { left: cur.offsetLeft, width: cur.offsetWidth, duration: 0.5, ease: 'back.out(1.3)' });
  tabs.forEach((b, i) => {
    const dx = first[i] - b.offsetLeft;
    if (Math.abs(dx) > 0.5) gsap.fromTo(b, { x: dx }, { x: 0, duration: 0.45, ease: 'power3.out', clearProps: 'transform' });
  });
  const name = $('span:not(.tab-ic)', cur);
  if (name) gsap.fromTo(name, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.28, delay: 0.1, ease: 'power2.out', clearProps: 'opacity,transform' });
}
if (window.ResizeObserver) { const ro = new ResizeObserver(() => { if (!gsap.isTweening(tabInd)) placeTabInd(); }); $$('#nav .tab').forEach((b) => ro.observe(b)); }
document.fonts?.ready.then(placeTabInd);

// The tab bar's real height (it grows with the text size), so nothing sits under it.
const tabbar = $('.tabbar');
if (window.ResizeObserver) new ResizeObserver(() => {
  const fixed = getComputedStyle(tabbar).position === 'fixed';
  document.documentElement.style.setProperty('--tabbar-h', fixed ? `${Math.ceil(tabbar.getBoundingClientRect().height)}px` : '0px');
}).observe(tabbar);

// ---------- offline ----------
// The worker keeps the app and what you read. Once per version and Bible, while the device is idle, it is also asked
// to keep every bridge's passages and the studies, so they read without a connection (never the NLT, which is live only).
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === '127.0.0.1' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
function warmOffline() {
  const sw = navigator.serviceWorker?.controller, tr = trInfo().id;
  if (!sw || tr === 'nlt' || navigator.connection?.saveData) return;
  const key = `sb_warm_${tr}_5`;
  if (store.get(key, false)) return;
  const urls = new Set(['data/studies/index.json']);
  for (const p of D.P) for (const side of ['ot', 'nt']) for (const sg of parseRefList(p[side].ref)) urls.add(`data/bible/${trFor(sg.osis, tr)}/${sg.osis}/${sg.c}.json`);
  Object.keys(D.SI?.studies || { hope1: 1, hope2: 1, hope3: 1, hope4: 1, hope5: 1, saved1: 1, saved2: 1, saved3: 1, godhead: 1, passion: 1 }).forEach((id) => urls.add(`data/studies/${id}.json`));
  // and every chapter the studies turn to
  getJSON('data/studies/chapters.json').catch(() => []).then((chs) => {
    chs.forEach((oc) => urls.add(`data/bible/${trFor(oc.split('/')[0], tr)}/${oc}.json`));
    sw.postMessage({ warm: [...urls].map((u) => new URL(u, location.href).href) });
    store.set(key, true);
  });
}

// ---------- start ----------
// Loading failed: keep the loader up with what went wrong (so it can be reported) and a way to try again.
// "Try again" starts clean: it drops the copies kept on this device and fetches everything afresh.
function loadFailed(err, drawing) {
  console.error(err);
  clearTimeout(window.SB_SLOW);
  $('#count').textContent = t('loadErr');
  const n = $('#splashNote');
  if (!n) return;
  n.textContent = t(drawing ? 'drawErr' : 'loadErr');
  n.insertAdjacentHTML('afterend', `<p class="sp-detail">${esc(String(err?.message || err))}</p><button type="button" class="link-btn sp-retry" id="spRetry">${esc(t('retry'))}</button>`);
  $$('.sp-drop, .sp-tail, .sp-kept').forEach((x) => { x.style.animationPlayState = 'paused'; });
  $('#spRetry').addEventListener('click', async () => {
    try {
      const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
      await Promise.all(regs.map((r) => r.unregister()));
      const keys = await caches?.keys?.() || [];
      await Promise.all(keys.filter((k) => k.startsWith('sb-')).map((k) => caches.delete(k)));
      Object.keys(localStorage).filter((k) => k.startsWith('sb_warm_')).forEach((k) => localStorage.removeItem(k));
    } catch {}
    location.reload();
  });
}
// The loader leaves once the first screen is drawn: the page fades in under it.
function appReady() {
  clearTimeout(window.SB_SLOW);
  document.documentElement.classList.add('app-ready');
  const sp = $('#splash');
  if (!sp) return;
  if (reduced) { sp.remove(); return; }
  gsap.to(sp, { opacity: 0, duration: 0.32, ease: 'power2.out', onComplete: () => sp.remove() });
}
load().then(() => {
  try {
    applyStatic();
    syncTrUI();
    buildFilters();
    syncBookUI();
    route();
  } catch (err) { console.error(err); loadFailed(err, true); return; }
  requestAnimationFrame(appReady);
  // First visit: ask which Bible (and so which language) to use.
  if (!store.get('sb_tr_chosen', false)) showWelcome();
  // Keep the passages for offline reading a few seconds after the app settles (and once the worker controls the page).
  const warm = () => (window.requestIdleCallback || setTimeout)(warmOffline, { timeout: 4000 });
  setTimeout(warm, 5000);
  navigator.serviceWorker?.addEventListener('controllerchange', () => setTimeout(warm, 3000));
}).catch((err) => {
  loadFailed(err, false);
  console.error(err);
});
