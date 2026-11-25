/* ИСУЛ — multi-page layer shared by variants C and D.
   Every page of isul.eu is rendered from assets/content/isul-content.js
   (migrated content) in the visual language of the current variant.
   Home stays in the HTML (#home); routes '#/…' render into #page. */
(function () {
  'use strict';
  const V = document.body.dataset.variant || 'c';
  const C = window.ISUL_CONTENT || { pages: {}, clinics: {}, news: [] };
  // clinics with a local photo (assets/photos/clinics/c<id>.jpg). Variant X uses the official isul.eu photo of
  // every clinic; Ортопедия и травматология (9) has none on isul.eu — c9.jpg is a TEMPORARY stock image (Canva preview, low-res).
  const CLINIC_IMG = new Set(window.ISUL_X ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27] : [2, 3, 4, 5, 8, 10, 12, 13, 15, 17, 18, 20, 24]);
  // news photos: local copies without the grey side bars of the isul.eu uploads (1200 × 630)
  C.news.forEach((n) => { if (n.img && !n.imgOrig) { n.imgOrig = n.img; n.img = 'assets/photos/news-c/' + n.id + '.jpg'; } });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // variant X: the verified SuperDoc profile of Медицински център „ИСУЛ – Царица Йоанна“ (ул. „Бяло море“ 8, тел. 02 9432 207);
  // not „МЦ ИСУЛ ООД“ (ул. „Макгахан“), which is a different company. Other variants keep the SuperDoc home page.
  // „Как да се прегледам“: through the clinic's кабинет in ДКБ — SuperDoc books only Медицински център and stays on its page
  const BOOK = '#/book';
  const SUPERDOC = window.ISUL_X ? 'https://superdoc.bg/klinika/mdts-isul-tsaritsa-yoanna' : 'https://www.superdoc.bg', LAB = 'https://lab.isul.eu/';
  // variant X: personal SuperDoc profiles linked from isul.eu itself (news 878 and 896); everybody else books through the centre
  const SD_DR = window.ISUL_X ? [['Петър Калайджиев', 'https://superdoc.bg/lekar/petar-kalaydzhiev'], ['Стойка Радева', 'https://superdoc.bg/lekar/stoyka-radeva']] : [];
  const bookFor = (name) => { const f = String(name || '').toLowerCase(); const m = SD_DR.find(([n]) => n.toLowerCase().split(' ').every((w) => f.includes(w))); return m ? m[1] : SUPERDOC; };

  /* ---------- Information architecture (mirrors isul.eu) ---------- */
  const SECTIONS = [
    { id: 'about', title: 'За нас', items: [['about', 'За нас'], ['history', 'История'], ['management', 'Ръководство'], ['structure', 'Структура'], ['administration', 'Администрация'], ['pdpac', 'Защита на личните данни и противодействие на корупцията'], ['signals', 'Сигнали за нарушения'], ['privacy', 'Политика за защита на личните данни'], ['other', 'Други структури на територията на ИСУЛ']] },
    { id: 'history-archive', title: 'История', items: [['history', 'История на УМБАЛ „Царица Йоанна – ИСУЛ“'], ['history_04', 'Указ на Цар Борис ІІІ'], ['history_03', 'Медицински вестник'], ['history_02', 'Пощенска марка'], ['history_01', 'История на хирургията в България']] },
    { id: 'patients', title: 'За пациента', items: [['patient', 'За пациента'], ['book', 'Как да се прегледам'], ['admission', 'Прием в болницата'], ['pricelist', 'Ценоразпис'], ['insurance', 'Здравни фондове'], ['trials', 'Клинични изпитвания'], ['covid', 'COVID-19'], ['navigator', 'Анатомичен навигатор'], ['contacts', 'Контакти']] },
    { id: 'profile', title: 'Профил на купувача', items: [['profile', 'Профил на купувача'], ['profile/1', 'Обществени поръчки'], ['profile/2', 'По чл.20, ал.2 от ЗОП'], ['profile/3', 'По чл.20, ал.3 от ЗОП. Събиране на оферти'], ['profile/4', 'По чл.20, ал.3 от ЗОП. Покана до определени лица'], ['profile/5', 'Публични покани'], ['profile/6', 'Предварителни обявления'], ['profile/7', 'ЦОП – вътрешен конкурентен избор'], ['profile/8', 'Пазарни проучвания и консултации']] },
    { id: 'clinics', title: 'Клиники', items: [['clinics', 'Клиники и отделения'], ['doctors', 'Екип'], ['navigator', 'Анатомичен навигатор']] },
    { id: 'media', title: 'Прес център', items: [['news', 'Прес център'], ['events', 'Събития'], ['videos', 'Видео']] },
    { id: 'careers', title: 'Кариери', items: [['careers', 'Кариери']] },
    { id: 'contact', title: 'Контакти', items: [['contacts', 'Контакти'], ['book', 'Как да се прегледам'], ['sitemap', 'Карта на сайта']] },
    { id: 'notices', title: 'Обяви', items: [['competition', 'Конкурси'], ['auction', 'Търгове'], ['invitations', 'Покани'], ['projects', 'Проекти'], ['donation', 'Дарителска кампания'], ['financial', 'Финансови отчети']] }
  ];
  // variant X: these pages leave the „За нас“ menu and tabs; they are linked from the footer group „Обществена информация“
  const X_FOOTER_ONLY = window.ISUL_X ? ['pdpac', 'signals', 'privacy'] : [];
  // variant X: pages merged into Структура and История — their old addresses redirect to the matching section
  const X_MERGED = window.ISUL_X ? { administration: 'structure?s=administration', other: 'structure?s=other', history_02: 'history?s=archive', history_03: 'history?s=archive', history_04: 'history?s=archive' } : {};
  const navItems = (items) => items.filter(([k]) => !X_FOOTER_ONLY.includes(k) && !X_MERGED[k]);
  // variant X: the main-menu item each section belongs to (the menu stays active on every page of its section)
  const X_SEC_TOP = { about: '#/about', 'history-archive': '#/about', notices: '#/about', profile: '#/about', patients: '#/patient', clinics: '#/clinics', media: '#/news', careers: '#/careers', contact: '#/contacts' };
  // variant X: type of every unit (official clinic id), as listed on isul.eu/structure.html — Стационарен блок · Отделения · Лаборатории
  const X_UNIT_TYPE = { clinic: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], dept: [20, 21, 26], lab: [22, 23, 24, 25] };
  // variant X: the generic video band only where it fits — patient and medical pages, not administrative ones
  const X_VIDEO = ['admission', 'trials', 'covid'];
  const PREF = { navigator: 'patients', book: 'patients', contacts: 'contact', history: 'about' };
  // variant X: „Къде да отида?“ (the board in front of the hospital as a map) under За пациента
  if (window.ISUL_X && window.ISUL_PLACES) SECTIONS.find((x) => x.id === 'patients').items.splice(1, 0, ['kade', 'Къде да отида?']);
  const sectionOf = (key) => (PREF[key] && SECTIONS.find((s) => s.id === PREF[key])) || SECTIONS.find((s) => s.items.some(([k]) => k === key && s.id !== 'history-archive')) || SECTIONS.find((s) => s.items.some(([k]) => k === key));
  const labelOf = (key) => { for (const s of SECTIONS) for (const [k, t] of s.items) if (k === key) return t; return (C.pages[key] || {}).title || key; };

  /* data.js clinic slugs → official isul.eu clinic ids */
  const SLUG2ID = { icu: 1, gastro: 2, cardiology: 3, oncology: 4, neurology: 5, neurosurgery: 6, nephrology: 7, imaging: 8, orthopedics: 9, ophthalmology: 10, endocrinology: 11, ent: 12, rehab: 13, dialysis: 14, surgery: 15, pharmacology: 16, 'ped-onco': 17, urology: 18, dkb: 19, emergency: 20, forensic: 21, transfusion: 22, virology: 23, 'clinical-lab': 24, microbiology: 25, pathology: 26, medcenter: 27 };
  /* official clinic id → group (independent of data.js, which B and D may not load) */
  const GROUP_OF = {}; const GROUPS_ORDER = ['Хирургични', 'Терапевтични', 'Онкология и рехабилитация', 'Диагностика', 'Спешна и интензивна помощ', 'Лаборатории и отделения', 'Извънболнична помощ'];
  [[[6, 9, 10, 12, 15, 18], 0], [[2, 3, 5, 7, 11, 14, 16], 1], [[4, 13, 17], 2], [[8], 3], [[1, 20], 4], [[21, 22, 23, 24, 25, 26], 5], [[19, 27], 6]].forEach(([ids, g]) => ids.forEach((i) => { GROUP_OF[i] = GROUPS_ORDER[g]; }));
  if (!window.CLINIC_GROUPS) window.CLINIC_GROUPS = GROUPS_ORDER;
  const shortName = (n) => n.replace(/^Клиника по /, '').replace(/^(.)/, (m) => m.toUpperCase()).replace(' за лечение на метаболитни заболявания', '').replace(' с извършване на специфична дейност по андрология', ' и андрология');
  const clinicList = () => Object.values(C.clinics).sort((a, b) => a.id - b.id);
  /* one line icon per clinic (Lucide, ISC licence — same set as the МБАЛ Благоевград site) */
  const CLINIC_ICON = {"1":"<path d=\"M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8\"/><path d=\"M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4\"/><path d=\"M12 4v6\"/><path d=\"M2 18h20\"/>","2":"<path d=\"M11 2v3c4.5 0 9 2.6 9 8.3 0 4.6-3.6 8.7-9 8.7-3.4 0-5.8-1.9-6.9-4.3L3 17.5\"/><path d=\"M8 2v4.2c0 2 1.3 3.4 3 4.4 2 1.2 3 2.8 2.5 4.4-.5 1.6-2.6 2.2-4.3 1.2C7.6 15.3 5.6 14.5 3 14.5\"/>","3":"<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\"/><path d=\"M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27\"/>","4":"<path d=\"M12 11.22C11 9.997 10 9 10 8a2 2 0 0 1 4 0c0 1-.998 2.002-2.01 3.22\"/><path d=\"m12 18 2.57-3.5\"/><path d=\"M6.243 9.016a7 7 0 0 1 11.507-.009\"/><path d=\"M9.35 14.53 12 11.22\"/><path d=\"M9.35 14.53C7.728 12.246 6 10.221 6 7a6 5 0 0 1 12 0c-.005 3.22-1.778 5.235-3.43 7.5l3.557 4.527a1 1 0 0 1-.203 1.43l-1.894 1.36a1 1 0 0 1-1.384-.215L12 18l-2.679 3.593a1 1 0 0 1-1.39.213l-1.865-1.353a1 1 0 0 1-.203-1.422z\"/>","5":"<path d=\"M12 18V5\"/><path d=\"M15 13a4.17 4.17 0 01-3-4 4.17 4.17 0 01-3 4\"/><path d=\"M17.707 6.294A3 3 0 1012 5a3 3 0 10-5.707 1.294\"/><path d=\"M17.996 5.125a4 4 0 012.526 5.77\"/><path d=\"M18 18a4 4 0 002-7.465\"/><path d=\"M19.967 17.482a4 4 0 11-7.967.517 4 4 0 11-7.967-.517\"/><path d=\"M6 18a4 4 0 01-2-7.465\"/><path d=\"M6.004 5.125a4 4 0 00-2.526 5.77\"/>","6":"<path d=\"m10.852 14.772-.383.923\"/><path d=\"m10.852 9.228-.383-.923\"/><path d=\"m13.148 14.772.382.924\"/><path d=\"m13.53 8.305-.382.923\"/><path d=\"m14.772 10.852.923-.383\"/><path d=\"m14.772 13.148.923.383\"/><path d=\"M17.997 5.125a4 4 0 012.526 5.77\"/><path d=\"M18 18a4 4 0 002-7.464\"/><path d=\"M4.033 17.483A4 4 0 0011.46 20c.184-.31.896-.31 1.076 0a4 4 0 007.43-2.517\"/><path d=\"M6 18a4 4 0 01-2-7.464\"/><path d=\"M6.002 5.125a4 4 0 00-2.525 5.77\"/><path d=\"M6.293 6.294a3 3 0 01-.287-1.098l-.004-.07a3 3 0 015.968-.543c.05.02.057.01.059 0a3 3 0 015.968.542l-.004.071a3 3 0 01-.287 1.098\"/><path d=\"m9.228 10.852-.923-.383\"/><path d=\"m9.228 13.148-.923.383\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","7":"<path d=\"M10.165 6.598C9.954 7.478 9.64 8.36 9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22c7.732 0 14-6.268 14-14a6 6 0 0 0-11.835-1.402Z\"/><path d=\"M5.341 10.62a4 4 0 1 0 5.279-5.28\"/>","8":"<path d=\"M3 7V5a2 2 0 0 1 2-2h2\"/><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"/><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"/><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"/><path d=\"M7 12h10\"/>","9":"<path d=\"M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z\"/>","10":"<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","11":"<path d=\"m18 2 4 4\"/><path d=\"m17 7 3-3\"/><path d=\"M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5\"/><path d=\"m9 11 4 4\"/><path d=\"m5 19-3 3\"/><path d=\"m14 4 6 6\"/>","12":"<path d=\"M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0\"/><path d=\"M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4\"/>","13":"<circle cx=\"16\" cy=\"4\" r=\"1\"/><path d=\"m18 19 1-7-6 1\"/><path d=\"m5 8 3-3 5.5 3-2.36 3.5\"/><path d=\"M4.24 14.5a5 5 0 0 0 6.88 6\"/><path d=\"M13.76 17.5a5 5 0 0 0-6.88-6\"/>","14":"<path d=\"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z\"/><path d=\"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97\"/>","15":"<circle cx=\"6\" cy=\"6\" r=\"3\"/><path d=\"M8.12 8.12 12 12\"/><path d=\"M20 4 8.12 15.88\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M14.8 14.8 20 20\"/>","16":"<path d=\"m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z\"/><path d=\"m8.5 8.5 7 7\"/>","17":"<path d=\"M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5\"/><path d=\"M15 12h.01\"/><path d=\"M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1\"/><path d=\"M9 12h.01\"/>","18":"<path d=\"M16 3h5v5\"/><path d=\"m21 3-6.75 6.75\"/><circle cx=\"10\" cy=\"14\" r=\"6\"/>","19":"<path d=\"M11 2v2\"/><path d=\"M5 2v2\"/><path d=\"M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1\"/><path d=\"M8 15a6 6 0 0 0 12 0v-3\"/><circle cx=\"20\" cy=\"10\" r=\"2\"/>","20":"<path d=\"M10 10H6\"/><path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"/><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14\"/><path d=\"M8 8v4\"/><path d=\"M9 18h6\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/>","21":"<path d=\"M12 3v18\"/><path d=\"m19 8 3 8a5 5 0 0 1-6 0zV7\"/><path d=\"M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1\"/><path d=\"m5 8 3 8a5 5 0 0 1-6 0zV7\"/><path d=\"M7 21h10\"/>","22":"<path d=\"M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z\"/>","23":"<path d=\"M12 14.991h.01\"/><path d=\"M12 22v-3\"/><path d=\"M12 2v3\"/><path d=\"M13 22h-2\"/><path d=\"M13 2h-2\"/><path d=\"M13.99 10H14\"/><path d=\"m16.5 19.794-1-1.733\"/><path d=\"m16.5 4.205-1 1.732\"/><path d=\"m19.794 16.5-1.732-1\"/><path d=\"m19.794 7.5-1.732 1\"/><path d=\"M2 12h3\"/><path d=\"M2 13v-2\"/><path d=\"M22 12h-3\"/><path d=\"M22 13v-2\"/><path d=\"m4.206 16.5 1.732-1\"/><path d=\"m4.206 7.5 1.732 1\"/><path d=\"m7.5 19.794 1-1.733\"/><path d=\"m7.5 4.205 1 1.732\"/><path d=\"M9 12h.01\"/><circle cx=\"12\" cy=\"12\" r=\"7\"/>","24":"<path d=\"M9 2v17.5A2.5 2.5 0 0 1 6.5 22A2.5 2.5 0 0 1 4 19.5V2\"/><path d=\"M20 2v17.5a2.5 2.5 0 0 1-2.5 2.5a2.5 2.5 0 0 1-2.5-2.5V2\"/><path d=\"M3 2h7\"/><path d=\"M14 2h7\"/><path d=\"M9 16H4\"/><path d=\"M20 16h-5\"/>","25":"<path d=\"M6 18h8\"/><path d=\"M3 22h18\"/><path d=\"M14 22a7 7 0 1 0 0-14h-1\"/><path d=\"M9 14h2\"/><path d=\"M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z\"/><path d=\"M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3\"/>","26":"<path d=\"m10 16 1.5 1.5\"/><path d=\"m14 8-1.5-1.5\"/><path d=\"M15 2c-1.798 1.998-2.518 3.995-2.807 5.993\"/><path d=\"m16.5 10.5 1 1\"/><path d=\"m17 6-2.891-2.891\"/><path d=\"M2 15c6.667-6 13.333 0 20-6\"/><path d=\"m20 9 .891.891\"/><path d=\"M3.109 14.109 4 15\"/><path d=\"m6.5 12.5 1 1\"/><path d=\"m7 18 2.891 2.891\"/><path d=\"M9 22c1.798-1.998 2.518-3.995 2.807-5.993\"/>","27":"<path d=\"M12 7v4\"/><path d=\"M14 21v-3a2 2 0 0 0-4 0v3\"/><path d=\"M14 9h-4\"/><path d=\"M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2\"/><path d=\"M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16\"/>"};
  const clinicIcon = (id, cls) => CLINIC_ICON[id] ? `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CLINIC_ICON[id]}</svg>` : '';

  /* ---------- Events & videos (shared components) ---------- */
  const EVENTS = [
    { d: '11', m: 'ноември 2026', t: '90 години УМБАЛ „Царица Йоанна – ИСУЛ“', p: 'Рождената дата на болницата: заповедта от 11 ноември 1936 г.', tag: 'ИСУЛ 90', real: true, img: 'assets/photos/1791358806.jpg' },
    { d: '06', m: 'октомври 2026', t: 'Обучителна програма „Сила“', p: 'Подкрепа за жени с рак на гърдата: информираност, подкрепа, последователност.', tag: 'Пациенти', real: true, img: 'assets/photos/1791287080.jpg' },
    { d: '··', m: 'ноември 2026', t: 'Научна конференция „90 години ИСУЛ“', p: 'Дата и програма предстоят.', tag: 'Наука', img: 'assets/video/v4773.jpg' },
    { d: '··', m: 'ноември 2026', t: 'Изложба с архивни фотографии', p: 'Историята на болницата от 1936 г. до днес.', tag: 'ИСУЛ 90', img: 'assets/brand/banner_89.png' },
    { d: '··', m: 'декември 2026', t: 'Ден на отворените врати за студенти', p: 'Запознаване с клиниките и специализациите.', tag: 'Обучение', img: 'assets/video/hero-students-poster.jpg' },
    { d: '··', m: 'декември 2026', t: 'Безплатни профилактични прегледи', p: 'Кампания за профилактика: дата и клиники предстоят.', tag: 'Профилактика', img: 'assets/video/v6562.jpg' }
  ];
  const VIDEOS = [
    { src: 'assets/video/hero-students.mp4', poster: 'assets/video/hero-students-poster.jpg', t: 'Университетска болница', p: 'Обучение на студенти и специализанти', tag: 'Обучение' },
    { src: 'assets/video/v46365.mp4', poster: 'assets/video/v46365.jpg', t: 'Интензивно наблюдение', p: 'Мониторинг на жизнени показатели', tag: 'Кардиология' },
    { src: 'assets/video/v4773.mp4', poster: 'assets/video/v4773.jpg', t: 'В лабораторията', p: 'Клинична лаборатория и микробиология', tag: 'Лаборатории' },
    { src: 'assets/video/v17625.mp4', poster: 'assets/video/v17625.jpg', t: 'Образна диагностика', p: 'ЯМР и КТ изследвания', tag: 'Диагностика' },
    { src: 'assets/video/v6562.mp4', poster: 'assets/video/v6562.jpg', t: 'Преглед при специалист', p: 'Медицински център „ИСУЛ – Царица Йоанна“', tag: 'Пациенти' }
  ];
  const evCard = (e) => `<article class="evc"><div class="evc__img"><img src="${e.img}" alt="" loading="lazy"><span class="evc__date"><b>${e.d}</b>${e.m}</span></div><div class="evc__body"><span class="evc__tag${e.real ? '' : ' is-sample'}">${e.real ? e.tag : e.tag + ' · примерно'}</span><h3>${esc(e.t)}</h3><p>${esc(e.p)}</p></div></article>`;
  const eventsMarquee = () => `<div class="evm" role="region" aria-label="Събития"><div class="evm__track">${EVENTS.map(evCard).join('')}${EVENTS.map(evCard).join('').replace(/<article class="evc">/g, '<article class="evc" aria-hidden="true">')}</div></div>`;
  const vCard = (v, i) => `<button type="button" class="vcard" data-v="${i}"><span class="vcard__img"><img src="${v.poster}" alt="" loading="lazy"><span class="vcard__play" aria-hidden="true"></span></span><span class="vcard__tag">${v.tag}</span><b>${esc(v.t)}</b><small>${esc(v.p)}</small></button>`;
  const videoBand = (title = 'ИСУЛ във видео') => window.ISUL_V2 && CUR && CUR !== 'videos' ? '' : `<section class="vband" aria-labelledby="vb-h"><div class="vwrap"><div class="vband__head"><h2 id="vb-h">${title}</h2><a href="#/videos">Всички видеа →</a></div><div class="vband__row">${VIDEOS.map(vCard).join('')}</div><p class="vband__note">Временни клипове (Mixkit). Ще бъдат заменени с видеа, заснети в ИСУЛ.</p></div></section>`;

  /* ---------- Block renderer (migrated content) ---------- */
  const isDoc = (l) => /\.(pdf|docx?|xlsx?|zip|rar)(\?|$)/i.test(l) || /\/upload\//.test(l);
  const ext = (l) => (l.match(/\.(pdf|docx?|xlsx?|zip|rar)/i) || ['', 'файл'])[1].toUpperCase();
  const linkAttrs = (l) => (/^https?:/.test(l) ? ' target="_blank" rel="noopener"' : '');
  function para(b) {
    const x = esc(b.x), L = b.links || [];
    if (!L.length) return `<p>${x}</p>`;
    if (L.length === 1) {
      const l = L[0];
      if (isDoc(l)) return `<p><a class="doc" href="${esc(l)}"${linkAttrs(l)}><span class="doc__ext">${ext(l)}</span>${x}</a></p>`;
      return `<p><a href="${esc(l)}"${linkAttrs(l)}>${x}</a></p>`;
    }
    return `<p>${x}</p><p class="links">${L.map((l, i) => `<a href="${esc(l)}"${linkAttrs(l)}>${isDoc(l) ? ext(l) + ' ' : ''}връзка ${i + 1}</a>`).join(' · ')}</p>`;
  }
  function blocks(list) {
    let out = '', ul = [], rows = [];
    const flushUl = () => { if (ul.length) { out += `<ul>${ul.map((b) => `<li>${(b.links || []).length === 1 ? `<a href="${esc(b.links[0])}"${linkAttrs(b.links[0])}>${esc(b.x)}</a>` : esc(b.x)}</li>`).join('')}</ul>`; ul = []; } };
    const flushRows = () => {
      if (!rows.length) return;
      out += `<div class="tbl"><table>${rows.map((r) => `<tr>${r.cells.map((c) => `<td>${c.links.length ? c.links.map((l) => `<a href="${esc(l)}"${linkAttrs(l)}>${esc(c.x || (isDoc(l) ? ext(l) : 'Връзка'))}</a>`).join('<br>') : esc(c.x)}</td>`).join('')}</tr>`).join('')}</table></div>`; rows = [];
    };
    for (const b of list) {
      if (b.t !== 'li') flushUl(); if (b.t !== 'row') flushRows();
      if (b.t === 'li') ul.push(b);
      else if (b.t === 'row') rows.push(b);
      else if (b.t === 'h') out += `<h3>${esc(b.x)}</h3>`;
      else if (b.t === 'img') { if (b.src) out += `<figure><img src="${esc(b.src)}" alt="${esc(b.alt)}" loading="lazy"></figure>`; }
      else out += para(b);
    }
    flushUl(); flushRows();
    return out || '<p class="muted">Няма съдържание на тази страница в официалния сайт.</p>';
  }

  /* ---------- Page chrome ---------- */
  const crumbs = (items) => `<nav class="crumbs" aria-label="Навигационна пътека"><a href="#/">Начало</a>${items.map(([t, u]) => u ? ` <span>/</span> <a href="${u}">${esc(t)}</a>` : ` <span>/</span> <span aria-current="page">${esc(t)}</span>`).join('')}</nav>`;
  const NEW = V === 'd';
  const V2 = NEW && !!window.ISUL_V2;          // D and D2: revised inner pages (compact header, no repeated video band)                       // variants B and D: header + colour bands, no side menu
  const BG = ['assets/photos/clinics/c15.jpg', 'assets/photos/clinics/c8.jpg', 'assets/photos/clinics/c24.jpg', 'assets/photos/clinics/c3.jpg', 'assets/video/hero-students-poster.jpg', 'assets/photos/clinics/c5.jpg', 'assets/video/v17625.jpg', 'assets/photos/clinics/c2.jpg', 'assets/video/v4773.jpg', 'assets/photos/clinics/c17.jpg', 'assets/video/v6562.jpg', 'assets/photos/clinics/c13.jpg'];
  const bgFor = (k) => { let h = 0; for (const ch of String(k)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return BG[h % BG.length]; };
  const HX = { sec: null, cur: '', img: '', noSub: false };
  let CUR = '';          // context for the next hero (set by the page builders)
  const CROWN = '<img class="crown-mark" src="assets/brand/isul-crown-white.svg" alt="" aria-hidden="true">';
  const subNav = (sec, cur) => sec ? `<nav class="pg-sub" aria-label="${esc(sec.title)}">${navItems(sec.items).map(([k, t]) => `<a href="#/${k}"${k === cur ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</nav>` : '';
  const hero = (title, crumbItems, lead = '', extra = '') => {
    if (!NEW) return `<header class="pg-hero"><div class="vwrap">${crumbs(crumbItems)}<h1>${esc(title)}</h1>${lead ? `<p class="pg-lead">${lead}</p>` : ''}${extra}</div></header>`;
    const img = HX.img || bgFor(title), sec = HX.sec || (HX.noSub ? null : sectionOf(CUR)), cur = HX.cur || CUR; HX.noSub = false; HX.sec = null; HX.cur = ''; HX.img = '';
    if (V2) {
      const sub = cur === 'news' ? '' : subNav(sec, cur), kick = sec && sec.title !== title ? sec.title : 'УМБАЛ „Царица Йоанна – ИСУЛ“';
      return `<header class="h3"><div class="vwrap h3__in"><div class="h3__copy">${crumbs(crumbItems)}<p class="h3__kick"><span></span>${esc(kick)}</p><h1>${esc(title)}</h1>${lead ? `<p class="h3__lead">${lead}</p>` : ''}${extra}</div><figure class="h3__fig nwm"><img src="${img}" alt=""></figure></div></header>${sub ? `<div class="h3-sub"><div class="vwrap">${sub}</div></div>` : ''}`;
    }
    // variant X: the „За нас“ pages share one navigation bar above the page header (xAboutBar)
    const xBar = window.ISUL_X && sec && sec.id === 'about';
    // a relative url() inside the custom property resolves against the stylesheet (assets/assets/… → 404) and never showed;
    // variant X keeps its plain burgundy header and no longer requests the missing file
    const bg = window.ISUL_X && !/^(https?:|data:)/.test(img) ? 'none' : `url('${img}')`;
    return `${xBar ? xAboutBar(cur) : ''}<header class="pg-hero pg-hero--x" style="--bg:${bg}"><img class="pg-hero__crown" src="assets/brand/isul-crown-white.svg" alt="" aria-hidden="true"><div class="vwrap pg-hero__in">${crumbs(crumbItems)}<h1>${esc(title)}</h1>${lead ? `<p class="pg-lead">${lead}</p>` : ''}${extra}${(cur === 'news' && NEW) || xBar ? '' : subNav(sec, cur)}</div></header>`;
  };
  /* split migrated blocks into readable chunks and paint them as alternating colour bands */
  const CYCLE = ['white', 'blue', 'white', 'isul'];
  // short stand-alone lines such as "ИСТОРИЯ", "Дейност", "Главни направления са:" act as headings
  const asHead = (b) => b.t === 'p' && !(b.links || []).length && b.x.length < 48 && (b.x === b.x.toUpperCase() && /[А-Я]{3}/.test(b.x) || /:$/.test(b.x) || /^[А-Я][а-я]+$/.test(b.x)) ? { t: 'h', x: b.x.replace(/:$/, '') } : b;
  function chunks(list) {
    const out = []; let cur = [], len = 0;
    list = list.map(asHead);
    for (const b of list) {
      const split = cur.length && ((b.t === 'h' && len > 650) || (b.t === 'p' && len > 1800));
      if (split) { out.push(cur); cur = []; len = 0; }
      cur.push(b); len += (b.x || '').length + (b.t === 'row' ? 90 : 0) + (b.t === 'img' ? 260 : 0);
    }
    if (cur.length) out.push(cur);
    return out;
  }
  const band = (html, i, extra = '') => `<section class="band band--${CYCLE[i % CYCLE.length]}${extra}"><div class="vwrap band__in">${i ? CROWN : ''}<div class="band__body">${html}</div></div></section>`;
  const bands = (list, tail = '', start = 0) => {
    if (V2) return richPage({ blocks: list, after: tail }); const g = chunks(list); return g.map((x, i) => band(blocks(x) + (i === g.length - 1 ? tail : ''), i + start)).join('') || band(tail || blocks([]), start); };
  const sideNav = (sec, cur) => sec ? `<nav class="pg-side" aria-label="${esc(sec.title)}"><b>${esc(sec.title)}</b>${sec.items.map(([k, t]) => `<a href="#/${k}"${k === cur ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</nav>` : '';
  const layout = (sec, cur, body) => NEW ? band(body, 0) : `<div class="vwrap pg-grid${sec ? '' : ' pg-grid--solo'}">${sideNav(sec, cur)}<article class="pg-body">${body}</article></div>`;
  const source = (url) => url ? `<p class="pg-src">Съдържанието е мигрирано от <a href="${esc(url)}" target="_blank" rel="noopener">${esc(url.replace('https://', ''))}</a></p>` : '';

  /* ---------- Pages ---------- */
  /* =========================================================
     RICH PAGE RENDERER (variants B & D)
     Migrated blocks → numbered section cards + sticky side column,
     with page search, collapsible long sections, doc cards, contact buttons,
     link-card grids, check-grids, image gallery and scroll-spy.
     ========================================================= */
  const RX_PHONE = /(?:\+359\s?|0)(?:2\s?\d{2,3}\s?\d{2,3}\s?\d{2,3}|8[789]\s?\d{3}\s?\d{4})/g;
  const RX_MAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g;
  const telOf = (p) => 'tel:+359' + p.replace(/\D/g, '').replace(/^359/, '').replace(/^0/, '');
  const linkify = (raw) => esc(raw).replace(RX_MAIL, (m) => `<a class="rx-mail" href="mailto:${m}">${m}</a>`).replace(RX_PHONE, (m) => `<a class="rx-tel" href="${telOf(m)}">${m}</a>`);
  const ICON = {
    doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    tel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>'
  };
  const niceTitle = (t) => { let x = String(t || '').trim().replace(/[\s:–\-—]+$/, ''); if (x.length > 3 && x === x.toUpperCase() && /[А-Я]{3}/.test(x)) x = x.charAt(0) + x.slice(1).toLowerCase().replace(/(„|"|«)([а-я])/g, (m, a, b) => a + b.toUpperCase()).replace(/\bисул\b/g, 'ИСУЛ').replace(/\bумбал\b/g, 'УМБАЛ').replace(/\b(дкб|мдц|нзок|телк|всд|оп)\b/g, (m) => m.toUpperCase()); return x; };
  function sectionize(list) {
    const out = []; let cur = { title: '', items: [] };
    list.map(asHead).forEach((b) => {
      if (b.t === 'h') { if (cur.items.length || cur.title) out.push(cur); cur = { title: niceTitle(b.x), items: [] }; }
      else cur.items.push(b);
    });
    if (cur.items.length || cur.title) out.push(cur);
    // merge heading-only sections into the next one as a subtitle
    const merged = [];
    out.forEach((s) => { const prev = merged[merged.length - 1]; if (prev && !prev.items.length) { prev.sub = s.title; prev.items = s.items; } else merged.push(s); });
    return merged.filter((s) => s.items.length || s.title);
  }
  function richBody(items, acc) {
    let html = '', ul = [], imgs = [];
    const flushUl = () => {
      if (!ul.length) return;
      const linked = ul.every((b) => (b.links || []).length === 1), short = ul.every((b) => (b.x || '').length < 70);
      if (linked) html += `<div class="rl-links">${ul.map((b) => { const l = b.links[0], d = isDoc(l); if (d) acc.docs.push([b.x, l]); return `<a class="rl-link${d ? ' is-doc' : ''}" href="${esc(l)}"${linkAttrs(l)}><span class="rl-link__ic">${d ? ext(l) : ICON.link}</span><span>${esc(b.x)}</span></a>`; }).join('')}</div>`;
      else if (short && ul.length >= 3) html += `<ul class="rl-checks">${ul.map((b) => `<li>${ICON.check}<span>${linkify(b.x)}</span></li>`).join('')}</ul>`;
      else html += `<ul class="rl-list">${ul.map((b) => `<li>${linkify(b.x)}</li>`).join('')}</ul>`;
      ul = [];
    };
    const flushImgs = () => { if (!imgs.length) return; html += `<div class="rl-gallery rl-gallery--${Math.min(imgs.length, 3)}">${imgs.map((b) => `<button type="button" class="rl-img" data-zoom="${esc(b.src)}"><img src="${esc(b.src)}" alt="${esc(b.alt || '')}" loading="lazy"></button>`).join('')}</div>`; imgs = []; };
    let rows = [];
    const flushRows = () => { if (!rows.length) return; html += `<div class="rl-table"><table>${rows.map((r, i) => `<tr>${r.cells.map((c) => `<${i ? 'td' : 'th'}>${c.links.length ? c.links.map((l) => { if (isDoc(l)) acc.docs.push([c.x || ext(l), l]); return `<a href="${esc(l)}"${linkAttrs(l)}>${esc(c.x || (isDoc(l) ? ext(l) : 'Връзка'))}</a>`; }).join('<br>') : esc(c.x)}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</table></div>`; rows = []; };
    items.forEach((b) => {
      if (b.t !== 'li') flushUl(); if (b.t !== 'img') flushImgs(); if (b.t !== 'row') flushRows();
      (b.x || '').replace(RX_PHONE, (m) => acc.tels.add(m.trim())); (b.x || '').replace(RX_MAIL, (m) => acc.mails.add(m));
      (b.links || []).forEach((l) => { if (l.startsWith('mailto:')) acc.mails.add(l.slice(7)); });
      if (b.t === 'li') ul.push(b);
      else if (b.t === 'img') { if (b.src) imgs.push(b); }
      else if (b.t === 'row') rows.push(b);
      else {
        const L = b.links || [];
        if (L.length === 1 && isDoc(L[0])) { acc.docs.push([b.x, L[0]]); html += `<a class="rl-doc" href="${esc(L[0])}"${linkAttrs(L[0])}><span class="rl-doc__ext">${ext(L[0])}</span><span class="rl-doc__t">${esc(b.x)}</span><span class="rl-doc__go">${ICON.link}</span></a>`; }
        else if (L.length === 1 && !/^(tel|mailto):/.test(L[0])) html += `<p><a class="rl-inline" href="${esc(L[0])}"${linkAttrs(L[0])}>${esc(b.x)} →</a></p>`;
        else html += `<p>${linkify(niceTitle(b.x) + (/[:：]$/.test(b.x.trim()) ? ':' : ''))}</p>`;
      }
    });
    flushUl(); flushImgs(); flushRows();
    return html;
  }
  /* section hub: one tile per page of the section (first page of "За пациента", "За нас" …) */
  const TILE_IC = { book: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>', admission: '<path d="M3 20V9l9-5 9 5v11"/><path d="M9 20v-6h6v6"/>', pricelist: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>', insurance: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>', trials: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>', covid: '<circle cx="12" cy="12" r="5"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>', navigator: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M8 11h8M10 22l2-7 2 7"/>', history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', management: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 3-6 6-6s6 2.5 6 6M15 15c3 0 6 2 6 5"/>', structure: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>', administration: '<path d="M4 20h16M6 20V9M10 20V9M14 20V9M18 20V9M3 9l9-5 9 5z"/>', pdpac: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>', signals: '<path d="M4 11v2a2 2 0 0 0 2 2h2l5 4V5L8 9H6a2 2 0 0 0-2 2zM17 9a4 4 0 0 1 0 6"/>' };
  const tileIc = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${TILE_IC[k] || '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>'}</svg>`;
  const hubTiles = (sec, cur) => `<div class="t3">${sec.items.filter(([k]) => k !== cur).map(([k, t]) => `<a class="t3__c" href="#/${k}">${tileIc(k)}<b>${esc(t)}</b><span class="t3__go" aria-hidden="true">→</span></a>`).join('')}</div>`;
  /* closing band on every inner page */
  const helpBand = () => `<section class="hb3"><div class="vwrap hb3__in"><div class="hb3__t"><p class="h3__kick"><span></span>Как можем да помогнем</p><h2>Нужна Ви е помощ?</h2><p>Записване, спешна помощ и път до болницата — на едно място.</p></div>
    <a class="hb3__c" href="${BOOK}"><small>Преглед</small><b>Как да се прегледам</b><span>Кабинетите на клиниките в ДКБ</span></a>
    <a class="hb3__c hb3__c--emg" href="tel:+35929432203"><small>Спешно отделение · 24/7</small><b>02 9432 203</b><span>При спешен случай се обадете на 112</span></a>
    <a class="hb3__c" href="route.html"><small>Как да стигна</small><b>ул. „Бяло море“ 8</b><span>Маршрут с кола, пеша или градски транспорт</span></a></div></section>`;
  function richRows(o) {
    const acc = { tels: new Set(), mails: new Set(), docs: [] };
    const secs = sectionize(o.blocks || []);
    const isRight = (b) => b.t === 'li' || b.t === 'row' || ((b.links || []).length === 1 && isDoc(b.links[0]));
    const rows = secs.map((s, i) => {
      const L = s.items.filter((b) => !isRight(b)), R = s.items.filter(isRight);
      const left = richBody(L, acc), right = richBody(R, acc);
      const len = L.reduce((n, b) => n + (b.x || '').length, 0);
      const kickR = R.some((b) => (b.links || []).some(isDoc)) ? 'Документи' : R.some((b) => b.t === 'row') ? 'Таблица' : 'Накратко';
      const title = s.title || (i ? 'Още информация' : 'Обща информация');
      return `<section class="r3 rs${len > 1100 ? ' is-long' : ''}${right ? '' : ' r3--solo'}" id="rs-${i}" data-title="${esc(title)}"><span class="r3__n">${String(i + 1).padStart(2, '0')}</span><div class="r3__main"><h2>${esc(title)}</h2>${s.sub ? `<p class="r3__sub">${esc(s.sub)}</p>` : ''}<div class="r3__body">${left || ''}</div>${len > 1100 ? '<button type="button" class="rs__more" aria-expanded="false">Покажи още ↓</button>' : ''}</div>${right ? `<aside class="r3__card"><p class="r3__k"><span></span>${kickR}</p>${right}</aside>` : ''}</section>`;
    }).join('');
    const toc = secs.length >= 3 ? `<nav class="r3-toc" aria-label="На тази страница"><div class="vwrap r3-toc__in">${secs.map((s, i) => `<a href="#rs-${i}" data-spy="rs-${i}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.title || (i ? 'Още информация' : 'Обща информация'))}</a>`).join('')}</div></nav>` : '';
    const tels = [...acc.tels].slice(0, 5), mails = [...acc.mails].slice(0, 4);
    const useful = tels.length || mails.length ? `<div class="r3-use"><h2>Контакти от страницата</h2><div class="r3-use__g">${tels.map((t) => `<a href="${telOf(t)}">${ICON.tel}<span>${esc(t)}</span></a>`).join('')}${mails.map((m) => `<a href="mailto:${esc(m)}">${ICON.mail}<span>${esc(m)}</span></a>`).join('')}</div></div>` : '';
    return `<div class="rp rp3">${toc}<div class="vwrap rp3__in">${o.intro || ''}${rows}${o.after || ''}${useful}${source(o.src)}</div></div>`;
  }
  function richPage(o) {
    if (V2) return richRows(o);
    // o: { title, crumbs, lead, heroExtra, blocks, src, aside: [html], intro: html, kpis: [[label, value, href]] }
    const acc = { tels: new Set(), mails: new Set(), docs: [] };
    const secs = sectionize(o.blocks || []);
    const cards = secs.map((s, i) => {
      const body = richBody(s.items, acc), len = s.items.reduce((n, b) => n + (b.x || '').length, 0);
      const long = len > 1300, simple = s.items.every((b) => b.t === 'p' || b.t === 'li'), half = simple && len < 420 && s.items.length <= 5;
      return `<section class="rs${long ? ' is-long' : ''}${half ? ' rs--half' : ''}" id="rs-${i}" data-title="${esc(s.title || 'Обща информация')}"><header class="rs__head"><span class="rs__n">${String(i + 1).padStart(2, '0')}</span><div><h2>${esc(s.title || (i ? 'Още информация' : 'Обща информация'))}</h2>${s.sub ? `<p>${esc(s.sub)}</p>` : ''}</div></header><div class="rs__body">${body || '<p class="muted">—</p>'}</div>${long ? '<button type="button" class="rs__more" aria-expanded="false">Покажи още ↓</button>' : ''}</section>`;
    }).join('');
    const toc = secs.length >= 3 ? `<nav class="ra ra--toc" aria-label="На тази страница"><h3>На тази страница</h3>${secs.map((s, i) => `<a href="#rs-${i}" data-spy="rs-${i}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.title || (i ? 'Още информация' : 'Обща информация'))}</a>`).join('')}</nav>` : '';
    const tels = [...acc.tels].slice(0, 5), mails = [...acc.mails].slice(0, 4);
    const contact = tels.length || mails.length ? `<div class="ra ra--contact"><h3>Контакти от страницата</h3>${tels.map((t) => `<a class="ra__btn" href="${telOf(t)}">${ICON.tel}<span>${esc(t)}</span></a>`).join('')}${mails.map((m) => `<a class="ra__btn" href="mailto:${esc(m)}">${ICON.mail}<span>${esc(m)}</span></a>`).join('')}</div>` : '';
    const docs = acc.docs.length ? `<div class="ra ra--docs"><h3>Документи <span>${acc.docs.length}</span></h3>${acc.docs.slice(0, 6).map(([t, l]) => `<a href="${esc(l)}"${linkAttrs(l)}><b>${ext(l)}</b><span>${esc(t.length > 70 ? t.slice(0, 68) + '…' : t)}</span></a>`).join('')}${acc.docs.length > 6 ? `<p class="ra__more">и още ${acc.docs.length - 6} в страницата</p>` : ''}</div>` : '';
    const actions = `<div class="ra ra--act"><h3>Бързи действия</h3><a class="ra__cta" href="${BOOK}">${ICON.cal}Как да се прегледам</a><a class="ra__cta ra__cta--l" href="route.html">${ICON.pin}Как да стигна</a><a class="ra__cta ra__cta--l" href="tel:+35929432170">${ICON.tel}Централа 02 9432 170</a></div>`;
    const kpis = o.kpis && o.kpis.length ? `<div class="rk">${o.kpis.map(([l, v, h]) => h ? `<a class="rk__c" href="${esc(h)}"><span>${esc(l)}</span><b>${esc(v)}</b></a>` : `<div class="rk__c"><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join('')}</div>` : '';
    const find = secs.length > 1 ? `<div class="rfind"><span>${ICON.search}</span><label class="vh" for="rfind">Търси в тази страница</label><input id="rfind" type="search" placeholder="Търси в тази страница…" autocomplete="off"><small id="rfind-n"></small></div>` : '';
    return `<div class="rp"><div class="vwrap rp__grid"><div class="rp__main">${o.intro || ''}${kpis}${find}${cards}${o.after || ''}${source(o.src)}</div><aside class="rp__side">${(o.aside || []).join('')}${toc}${contact}${docs}${actions}</aside></div></div>`;
  }
  function richInit() {
    const root = $('.rp', page); if (!root) return;
    // collapsible sections
    $$('.rs__more', root).forEach((b) => b.addEventListener('click', () => { const s = b.closest('.rs'), open = s.classList.toggle('is-open'); b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Покажи по-малко ↑' : 'Покажи още ↓'; }));
    // scroll-spy
    const links = $$('[data-spy]', root);
    if (links.length) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle('is-on', a.dataset.spy === e.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
      $$('.rs', root).forEach((s) => io.observe(s));
      links.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const t = document.getElementById(a.dataset.spy); t.classList.add('is-open'); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    }
    // find in page
    const inp = $('#rfind', root);
    if (inp) inp.addEventListener('input', () => {
      const q = fold(inp.value.trim()); let n = 0;
      $$('.rs', root).forEach((s) => { const hit = !q || fold(s.textContent).includes(q); s.hidden = !hit; if (hit && q) { n++; s.classList.add('is-open'); } });
      $('#rfind-n', root).textContent = q ? (n ? n + ' секции' : 'Няма съвпадение') : '';
    });
    // gallery lightbox
    root.addEventListener('click', (e) => {
      const z = e.target.closest('[data-zoom]'); if (!z) return;
      const lb = document.createElement('div'); lb.className = 'rlb'; lb.innerHTML = `<img src="${z.dataset.zoom}" alt=""><button type="button" aria-label="Затвори">×</button>`;
      document.body.appendChild(lb); const close = () => lb.remove(); lb.addEventListener('click', close); addEventListener('keydown', function k(ev) { if (ev.key === 'Escape') { close(); removeEventListener('keydown', k); } });
    });
    // copy link
    const cp = $('[data-copylink]', root); if (cp) cp.addEventListener('click', () => { (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(() => { cp.textContent = 'Връзката е копирана ✓'; }, () => { cp.textContent = location.href; }); });
    // clinic switcher
    const sw = $('#rclin', root); if (sw) sw.addEventListener('change', () => { if (sw.value) location.hash = '#/clinic/' + sw.value; });
    // team filter
    const df = $('#dfind', root); if (df) df.addEventListener('input', () => { const q = fold(df.value.trim()); $$('#dlist .dcard, #dlist .dline', root).forEach((x) => { x.hidden = q && !fold(x.textContent).includes(q); }); });
    const tf = $('#rteam', root);
    if (tf) tf.addEventListener('input', () => { const q = fold(tf.value.trim()); $$('.rtm', root).forEach((c) => { c.hidden = q && !fold(c.textContent).includes(q); }); });
  }

  /* =========================================================
     CLINIC PAGE — editorial one-page layout (variants B & D)
     hero split · sticky anchor bar · about · departments (chips) ·
     head of clinic · team · equipment · activities · admission steps ·
     price list · phones · other clinics
     ========================================================= */
  // the old site's empty „Допълнителна информация“ links (the text behind them was never published)
  const DOP = /;?\s*Допълнителна информация(\s*\([^)]*\))?\s*$/i;
  const noDop = (bs) => bs.filter((b) => !/^\s*Допълнителна информация\s*$/i.test(b.x || '')).map((b) => DOP.test(b.x || '') ? { ...b, x: b.x.replace(DOP, '').trim() } : b);
  function clinicFull(c, id, tab) {
    c = clinicRest(c);
    if (window.ISUL_X) c = { ...c, blocks: noDop(c.blocks), patient: noDop(c.patient) };
    const leaders = c.leaders.filter((l) => l.name && !/awesome image/i.test(l.name));
    const head = leaders[0];
    const shortN = c.name.replace(/^Клиника по /, '');
    const isClinic = /^Клиника по /.test(c.name);
    const phones = (c.phones.join('; ') || '02 9432 170').split(/;|,| и /).map((x) => x.trim()).filter((x) => /\d{3}/.test(x));
    const allTxt = c.patient.concat(c.blocks).map((b) => b.x || '').join('\n');
    const visit = (allTxt.match(/Свиждане[^:\n]*:\s*([^\n]{4,80})/i) || [])[1] || '';
    const floor = c.floor || (allTxt.match(/\b([IVXІ]{1,4}|\d+)\s*(?:-?ти|-?ри)?\s*етаж\b/i) || [])[0] || '';
    // split the migrated "about" content
    const pre = []; let firstStructured = c.blocks.findIndex((b) => b.t !== 'p' || (b.links || []).length);
    if (firstStructured < 0) firstStructured = c.blocks.length;
    c.blocks.slice(0, Math.min(firstStructured, 3)).forEach((b) => pre.push(b));
    const rest = c.blocks.slice(pre.length);
    // variant X: the header opens with what the clinic does; its history („създадена през 1986 г.“) moves to „За клиниката“
    const XC = !!window.ISUL_X;
    const HIST = /(създаден|основан|открит|учреден)[аио]? (е |през |в )|история|\b(19|20)\d{2}\s*г/i;
    let li = XC ? pre.findIndex((b) => !HIST.test(b.x)) : 0; if (li < 0) li = 0;
    const lead = pre[li] ? pre[li].x : '';
    const aboutP = pre.filter((b, i) => i !== li);
    const secs = sectionize(rest);
    // equipment: a long list of short items near the words "оборудван/апарат"
    let equip = null;
    secs.forEach((s) => { if (equip) return; const lis = s.items.filter((b) => b.t === 'li'); const ctx = (s.title + ' ' + s.items.filter((b) => b.t === 'p').map((b) => b.x).join(' ')).toLowerCase(); if (lis.length >= 4 && /оборудван|апарат|техника|апаратур/.test(ctx) && !/лекува|направлени|дейност|лечени/i.test(s.title || '')) { equip = lis; s.items = s.items.filter((b) => b.t !== 'li'); } });
    const depts = secs.filter((s) => /отделени|сектор|кабинет|лаборатор|звено|стационар/i.test(s.title) && s.items.length);
    const acts = secs.filter((s) => !depts.includes(s) && (s.items.length || s.title));
    const acc = { tels: new Set(), mails: new Set(), docs: [] };
    const hasUnits = PP && PP.unitsOf(id).length;
    const teamPP = PP && PP.inClinic(id).length;
    const noHead = (V2 || XC) && teamPP;
    const noAbout = V2 && !XC && !aboutP.length;
    // X: a clinic without opening paragraphs takes its first activity as the description
    const aboutSec = XC && !pre.length && acts.length ? acts.shift() : null;
    const wherePs = XC ? placesOf(id) : [];
    const prices = XC ? kxPrices(c) : [];
    const onlyGal = XC && acts.length && acts.every((sx) => /галери/i.test(sx.title || ''));   // the head is already the first card of the team
    const nav = [noAbout ? null : ['about', 'За клиниката'], wherePs.length ? ['where', 'Къде се намира'] : null, hasUnits ? ['depts', 'Звена'] : depts.length ? ['depts', 'Отделения'] : null, head && !noHead ? ['head', 'Ръководител'] : null, ['team', 'Екип'], equip && !XC ? ['equip', 'Апаратура'] : null, XC && (prices.length || equip) ? ['exam', prices.length ? 'Изследвания' : equip.filter((x) => /^(лечение|извършва|диагност|операци|андролог|фертилит|хирург|оператив)/i.test(x.x || '')).length >= equip.length / 2 ? 'Методи' : 'Апаратура'] : null, acts.length ? ['acts', onlyGal ? 'Галерия' : 'Дейности'] : null, ['admit', 'Прием'], ['contacts', 'Контакти']].filter(Boolean);
    const tel1 = phones[0] || '02 9432 170';
    const kick = (t) => `<p class="ck"><span></span>${esc(t)}</p>`;
    const where = XC ? placeLine(placesOf(id)).slice(0, 2) : [];
    const whereDd = where.length ? `${where.map(esc).join('<br>')} <a class="ch__map" href="#/kade/c${id}">на картата →</a>` : esc(floor || 'УМБАЛ „Царица Йоанна – ИСУЛ“');

    const heroHtml = `<header class="ch"><div class="vwrap ch__in">
      <div class="ch__copy">
        ${crumbs([['Клиники и отделения', '#/clinics'], [c.name]])}
        ${kick((GROUP_OF[id] || 'Клиника') + ' · УМБАЛ „Царица Йоанна – ИСУЛ“')}
        <h1>${isClinic ? `Клиника по <em>${esc(shortN)}</em>` : esc(c.name)}</h1>
        ${lead ? `<p class="ch__lead">${esc(lead.length > 260 ? lead.slice(0, lead.lastIndexOf(' ', 250)) + '…' : lead)}</p>` : ''}
        <div class="ch__cta"><a class="chb chb--w" href="${telOf(tel1)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>${esc(tel1)}</a><a class="chb" href="${BOOK}">Как да се прегледам</a></div>
        <dl class="ch__facts">
          ${head ? `<div><dt>Началник</dt><dd>${esc(head.name)}</dd></div>` : ''}
          <div><dt>${where.length ? 'Къде се намира' : 'Разположение'}</dt><dd>${whereDd}</dd></div>
          ${visit ? `<div><dt>Свиждане</dt><dd>${esc(visit)}</dd></div>` : ''}
          ${c.emails[0] ? `<div><dt>Имейл</dt><dd><a href="mailto:${esc(c.emails[0])}">${esc(c.emails[0])}</a></dd></div>` : ''}
        </dl>
      </div>
      <figure class="ch__fig nwm">${c.hero ? `<img src="${esc(c.hero)}" alt="">` : '<span class="ch__ph"></span>'}<figcaption>${esc(c.name)}</figcaption></figure>
    </div></header>
    <nav class="cnav" aria-label="Съдържание на страницата"><div class="vwrap cnav__in"><div class="cnav__links">${nav.map(([k, t]) => `<a href="#c-${k}" data-cj="c-${k}">${t}</a>`).join('')}</div><a class="cnav__tel" href="${telOf(tel1)}">${esc(tel1)}</a></div></nav>`;

    const sec = (key, kickT, title, body, mod = '') => `<section class="cs ${mod}" id="c-${key}"><div class="vwrap">${kickT ? kick(kickT) : ''}${title ? `<h2 class="cs__h">${title}</h2>` : ''}${body}</div></section>`;

    const about = sec('about', 'За клиниката', '', `<div class="cs__about"><div class="cs__lead">${aboutP.map((b) => `<p>${linkify(b.x)}</p>`).join('') || (aboutSec ? richBody(aboutSec.items, acc) : '') || (lead ? `<p>${linkify(lead)}</p>` : '<p class="muted">Описанието на клиниката предстои.</p>')}</div>
      <div class="cs__stats">${(XC ? [[teamPP || leaders.length + c.members.length, teamPP ? (teamPP === 1 ? 'лекар в екипа' : 'лекари в екипа') : 'специалисти в екипа'], [hasUnits || depts.length, hasUnits ? (hasUnits === 1 ? 'звено' : 'звена') : depts.length === 1 ? 'отделение' : 'отделения'], [equip ? equip.length : 0, 'вида апаратура']] : [[leaders.length + c.members.length, 'специалисти в екипа'], [depts.length, depts.length === 1 ? 'отделение' : 'отделения'], [equip ? equip.length : 0, 'вида апаратура'], [phones.length, phones.length === 1 ? 'телефон' : 'телефона']]).filter(([n]) => n > 0).map(([n, t]) => `<div><b>${n}</b><span>${t}</span></div>`).join('')}</div></div>`);

    const whereHtml = wherePs.length ? sec('where', 'Къде се намира', esc(placeLine(wherePs)[0]), `<div class="kx cs__where"><div>
        <ul class="kx-wh__list">${wherePs.map((p) => `<li><span class="kx-wh__n">${p.b.id}</span><span><b>${esc(p.b.name)}${/^Сграда/.test(p.floor) ? '' : ' · ' + esc(p.floor)}</b><small>${esc(p.label)}</small>${p.note ? `<em>${esc(p.note)}</em>` : ''}</span></li>`).join('')}</ul>
        <div class="kx-wh__act"><a class="kx-btn kx-btn--d" href="#/kade/c${id}">Покажи на картата ${IC.arrow}</a><a class="chb chb--o" href="route.html">Как да стигна →</a></div>
        <p class="kx-wh__src">${esc(PL.source)} Вход за пациенти — от ул. „Бяло море“ № 8.</p></div>
      <a class="kx-wh__map" href="#/kade/c${id}" aria-label="Отвори картата на болницата">${planSvg({ hi: [...new Set(wherePs.map((p) => p.b.id).concat(wherePs.map((p) => p.via).filter(Boolean)))], small: true, label: 'Схема: ' + placeLine(wherePs).join(', ') })}</a></div>`, 'cs--panel cs--where') : '';
    const deptHtml = depts.length ? sec('depts', 'Структура', `${depts.length === 1 ? 'Едно' : depts.length} ${depts.length === 1 ? 'отделение' : 'отделения'},<br><em>една клиника.</em>`,
      `<div class="cd"><div class="cd__chips" role="tablist">${depts.map((d, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-d="${i}">${esc(d.title)}</button>`).join('')}</div>${depts.map((d, i) => `<div class="cd__panel"${i ? ' hidden' : ''} data-dp="${i}"><h3>${esc(d.title)}</h3>${richBody(d.items, acc)}</div>`).join('')}</div>`, 'cs--panel') : '';

    const headHtml = head ? sec('head', '', '', `<div class="chd">${head.img && !/team\.jpg/.test(head.img) ? `<img src="${esc(head.img)}" alt="${esc(head.name)}">` : '<span class="chd__ph"></span>'}<div>${kick('Началник на клиниката')}<h2>${esc(head.name)}</h2><p class="chd__role">${esc(head.role)}</p>${PP && PP.inClinic(id).find((d) => d.head) ? `<a class="chb chb--o" href="${drUrl(PP.inClinic(id).find((d) => d.head))}">Профил →</a>` : ''}<a class="chb chb--o" href="#c-team" data-cj="c-team">Екипът на клиниката →</a></div></div>`) : '';

    const initials = (x) => x.replace(/^(Професор|Доцент|Проф|Доц|Д-р|Др|Гл\. ас|Ас)\.?\s*(д-р\s*)?/i, '').split(/[\s,]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
    const seenN = new Set(leaders.map((l) => fold(l.name).replace(/^(професор|доцент|проф|доц|д-р|др)[.\s]*(д-р\s*)?/g, '').split(',')[0].trim()));
    const members = []; c.members.forEach((m) => { const nm = fold(m.x).replace(/^(професор|доцент|проф|доц|д-р|др|гл\. ас|ас)[.\s]*(д-р\s*)?/g, '').split(/,|–| - /)[0].trim(); if (seenN.has(nm)) return; seenN.add(nm); members.push(m); });
    const teamHtml = sec('team', 'Екип', 'Началници на отделения<br>и специалисти', `
      ${leaders.length > 1 ? `<div class="ct3">${leaders.slice(1).map((l) => `<article class="ct3__c">${l.img && !/team\.jpg/.test(l.img) ? `<img src="${esc(l.img)}" alt="">` : '<span class="ct3__ph"></span>'}<b>${esc(l.name)}</b><small>${esc(l.role)}</small></article>`).join('')}</div>` : ''}
      ${members.length ? `<div class="ctm"><div class="rfind"><span>${ICON.search}</span><label class="vh" for="rteam">Търси в екипа</label><input id="rteam" type="search" placeholder="Търси в екипа (${members.length} души)…" autocomplete="off"></div><div class="rtm-grid">${members.map((m) => { const gm = m.x.match(/^([А-ЯA-Zа-я ]{3,40}):\s*(.+)$/); if (gm && gm[2].length > 40) return `<div class="rtm rtm--group"><span><b>${esc(gm[1])}</b><small>${esc(gm[2])}</small></span></div>`; const [nm, ...r] = m.x.split(/,\s*/); return `<div class="rtm"><span class="rtm__av">${esc(initials(nm))}</span><span><b>${esc(nm)}</b>${r.length ? `<small>${esc(r.join(', '))}</small>` : ''}</span></div>`; }).join('')}</div></div>` : (leaders.length > 1 ? '' : '<p class="muted">Екипът не е публикуван в официалния сайт.</p>')}`, 'cs--panel');

    const eur = (v) => v.toFixed(2).replace('.', ',') + ' €';
    const PRF = 12;
    // the old site's link labels („; Допълнителна информация (тук в последствие ще се линкне…)“) are not part of the item
    const eqList = equip ? equip.map((b) => ({ ...b, x: (b.x || '').replace(/;?\s*Допълнителна информация(\s*\([^)]*\))?\s*$/i, '').trim() })) : null;
    // a list of treatments found next to the word „апаратура“ is not equipment
    const eqTreat = eqList && eqList.filter((b) => /^(лечение|извършва|диагност|операци|андролог|фертилит|хирург|оператив)/i.test(b.x)).length >= eqList.length / 2;
    const eqT = eqTreat ? 'Лечение и методи' : 'Апаратура';
    // fold by text, not by count: long descriptions fold sooner
    let eqN = 0; const eqI = eqList ? eqList.findIndex((b) => (eqN += Math.max(60, b.x.length)) > 700) : -1;
    const EQF = eqI < 0 ? 9 : Math.max(3, Math.min(9, eqI));
    let pn = 0;
    const prSubs = [...new Set(prices.map((p) => p.sub))];
    const prRows = prSubs.map((sb) => `${sb ? `<li class="kx-pr__sub${pn >= PRF ? ' kx-late' : pn >= 6 ? ' kx-late-m' : ''}">${esc(sb)}</li>` : ''}${prices.filter((p) => p.sub === sb).map((p) => `<li class="kx-pr__it${pn >= PRF ? ' kx-late' : pn >= 6 ? ' kx-late-m' : ''}${(pn++, '')}" data-q="${esc(fold(p.code + ' ' + p.name + ' ' + sb))}"><span><b>${esc(p.name)}</b><small>${esc(p.code)} · ${esc(p.unit)}</small></span><em>${eur(p.price)}</em></li>`).join('')}`).join('');
    const examHtml = XC && (prices.length || equip) ? sec('exam', prices.length ? 'Изследвания и апаратура' : eqT, prices.length ? 'Изследвания и услуги' : eqTreat ? 'Лечение и методи' : 'Оборудване на клиниката', `<div class="kx cx-ex">
      ${prices.length ? `<div class="kx-pr"><div class="cx-ex__top"><h3 class="kx-h3">Услуги с цени <span>${prices.length}</span></h3>${prices.length > 8 ? `<div class="kx-find"><span>${ICON.search}</span><label class="vh" for="kx-pq">Търси услуга</label><input id="kx-pq" type="search" placeholder="Търси изследване или код…" autocomplete="off"></div>` : ''}</div>
        <ul class="kx-pr__list${prices.length > 6 ? ' is-clip' : ''}" id="kx-pl">${prRows}</ul>
        <p class="kx-pr__none" hidden>Няма услуга по това търсене. Попитайте на <a href="${telOf(tel1)}">${esc(tel1)}</a>.</p>
        <div class="kx-pr__foot">${prices.length > 6 ? `<button type="button" class="kx-btn kx-btn--d${prices.length > PRF ? '' : ' is-m'}" id="kx-pall">Покажи всички ${prices.length}</button>` : ''}<a class="kx-link" href="#/pricelist">Целият ценоразпис ${IC.arrow}</a><small>Цени от утвърдения ценоразпис на болницата — за пациенти без здравна осигуровка или извън НЗОК.</small></div></div>` : ''}
      ${eqList ? `<div class="kx-eq"><h3 class="kx-h3">${eqT} <span>${eqList.length}</span></h3><ul${eqList.length > EQF ? ' class="is-clip"' : ''}>${eqList.map((b, i) => `<li${i >= EQF ? ' class="kx-late"' : ''}>${ICON.check}<span>${linkify(b.x)}</span></li>`).join('')}</ul>${eqList.length > EQF ? `<button type="button" class="kx-more" data-eqall>Покажи всички (${eqList.length}) ↓</button>` : ''}</div>` : ''}
    </div>`) : '';
    const equipHtml = XC ? '' : equip ? sec('equip', '', '', `<div class="ceq"><figure>${c.hero ? `<img src="${esc(c.hero)}" alt="">` : ''}<figcaption>Апаратура</figcaption></figure><div>${kick('Апаратура')}<h2 class="cs__h cs__h--s">Оборудване на клиниката</h2><ul class="ceq__list">${equip.map((b) => `<li>${ICON.check}<span>${linkify(b.x)}</span></li>`).join('')}</ul></div></div>`) : '';

    const teaser = (sx) => { const t = sx.items.find((b) => b.t === 'p' && (b.x || '').length > 30), n = sx.items.filter((b) => b.t === 'img').length; return t ? (t.x.length > 90 ? t.x.slice(0, t.x.lastIndexOf(' ', 84)) + '…' : t.x) : n ? n + ' снимки' : ''; };
    const actLen = (sx) => sx.items.reduce((n, b) => n + (b.x || '').length, 0);
    const actsX = () => `<div class="cmod${acts.length === 1 ? ' cmod--one' : acts.length > 6 ? ' cmod--many' : ''}">
      ${acts.length > 1 ? `<div class="cmod__tabs" role="tablist" aria-label="Дейности">${acts.map((sx, i) => `<button type="button" role="tab" id="cm-t${i}" aria-controls="cm-p${i}" aria-selected="${!i}" tabindex="${i ? -1 : 0}" data-cm="${i}"><span class="cmod__n">${String(i + 1).padStart(2, '0')}</span><span class="cmod__tt"><b>${shy(esc(sx.title || 'Медицинска дейност'))}</b>${teaser(sx) ? `<small>${esc(teaser(sx))}</small>` : ''}</span></button>`).join('')}</div>` : ''}
      <div class="cmod__panels">${acts.map((sx, i) => `<div class="cmod__p${actLen(sx) > 1100 ? ' is-cols' : ''}${actLen(sx) > 1700 ? ' is-long' : ''}" role="tabpanel" id="cm-p${i}" aria-labelledby="cm-t${i}"${i ? ' hidden' : ''}><h3>${esc(sx.title || 'Медицинска дейност')}</h3><div class="cmod__b">${richBody(sx.items, acc)}</div>${actLen(sx) > 1700 ? '<button type="button" class="xfold__btn" data-cmmore>Прочети всичко ↓</button>' : ''}</div>`).join('')}</div>
    </div>`;
    const actsHtml = acts.length && XC ? sec('acts', onlyGal ? 'Снимки' : 'Дейности', onlyGal ? 'Галерия' : 'Какво правим', actsX(), 'cs--panel') : acts.length ? sec('acts', 'Дейности', 'Какво правим', `<div class="cact">${acts.map((s) => { const body = richBody(s.items, acc), len = s.items.reduce((n, b) => n + (b.x || '').length, 0); return `<article class="cact__c${len > 700 ? ' is-long' : ''}"><h3>${esc(s.title || 'Медицинска дейност')}</h3><div class="cact__b">${body}</div>${len > 700 ? '<button type="button" class="rs__more">Покажи още ↓</button>' : ''}</article>`; }).join('')}</div>`, 'cs--panel') : '';

    const patientBlocks = c.patient.filter((b) => !phones.some((p) => (b.x || '').includes(p)) && !c.emails.some((e) => (b.x || '').includes(e)) && !/^Свиждане/i.test(b.x || ''));
    const steps = [['Консултация', `Преглед в кабинета на клиниката в Диагностично-консултативния блок (ДКБ, II етаж над Спешно отделение), в работни дни от 8 до 14 ч. Информация: ${esc(tel1)}.`], ['Направление', 'Направление за хоспитализация (бл. МЗ-НЗОК № 7) от личен лекар или специалист, или при спешност — през Спешно отделение.'], ['Хоспитализация', `${floor ? esc(floor) + ' · ' : ''}носете лична карта, епикризи, изследвания и списък с лекарствата.`], ['Сведения за близките', visit ? 'Свиждане: ' + esc(visit) : 'Информация по телефона на клиниката.']];
    const admitHtml = sec('admit', 'Прием', 'Как да постъпите<br>в клиниката', `<a class="cs__more" href="#/admission">Пълен наръчник за прием →</a><ol class="cstep">${steps.map(([t, d], i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><b>${t}</b><p>${d}</p></li>`).join('')}</ol>${patientBlocks.length && !(XC && patientBlocks.reduce((n, b) => n + (b.x || '').length, 0) < 40) ? `<div class="cs__extra">${richBody(patientBlocks, acc)}</div>` : ''}
      <div class="cprice">${kick('Ценоразпис')}<h3>Цени на услугите в <em>${esc(isClinic ? 'Клиниката по ' + shortN : c.name)}</em></h3><p>Консултации, изследвания, процедури и престой — за пациенти без здравна осигуровка или извън НЗОК.</p><a class="chb chb--d" href="#/pricelist">Виж цените →</a></div>`);

    const telItems = phones.map((p, i) => [i ? 'Клиника · ' + (i + 1) : 'Клиника', p]).concat([['Спешно отделение · регистратура', '02 9432 203']]);
    const contactsHtml = sec('contacts', 'Контакти', 'Телефони на клиниката', `<div class="ctel">${telItems.map(([t, p]) => `<a href="${telOf(p)}"><span>${esc(t)}</span><b>${esc(p)}</b></a>`).join('')}${c.emails.map((e) => `<a href="mailto:${esc(e)}"><span>Имейл</span><b>${esc(e)}</b></a>`).join('')}</div><div class="cs__row">${XC ? `<a class="chb chb--o" href="#/kade/c${id}">Къде е в болницата →</a>` : ''}<a class="chb chb--o" href="route.html">Как да стигна →</a><a class="chb chb--o" href="#/navigator">Анатомичен навигатор →</a></div>`, 'cs--panel');

    const grp = GROUP_OF[id], near = XC && grp ? clinicList().filter((x) => x.id != id && GROUP_OF[x.id] === grp) : [];
    const others = near.length ? `<section class="cs cs--dark cs--near"><div class="vwrap">${kick(grp + ' клиники и отделения')}<div class="chips-row">${near.map((x) => `<a href="#/clinic/${x.id}">${esc(x.name)}</a>`).join('')}<a class="is-all" href="#/clinics">Всички клиники и отделения →</a></div></div></section>`
      : `<section class="cs cs--dark"><div class="vwrap">${kick('Други клиники и отделения')}<div class="chips-row">${clinicList().filter((x) => x.id != id).map((x) => `<a href="#/clinic/${x.id}">${esc(x.name)}</a>`).join('')}</div></div></section>`;
    return { title: c.name, og: `assets/og/clinic-${id}.jpg`, desc: lead ? lead.slice(0, 180) : c.name, ld: { '@context': 'https://schema.org', '@type': 'MedicalClinic', name: c.name, telephone: tel1, parentOrganization: { '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“' } }, html: oneLine(XC, heroHtml + (noAbout ? '' : about) + whereHtml + (hasUnits ? unitsSection(c) : deptHtml) + (noHead ? '' : headHtml) + (PP && PP.inClinic(id).length ? teamSection(c) : teamHtml) + examHtml + equipHtml + actsHtml + admitHtml + contactsHtml + others + `<div class="vwrap">${source(c.src)}</div>`), init: () => clinicInit(tab) };
  }
  /* =========================================================
     CLINIC PAGE — variant X
     B's look; the bands are chosen by what the unit is (clinic · laboratory/diagnostics · emergency · outpatient)
     and by how much content there is, so every band has its natural height. Only migrated data.
     ========================================================= */
  const KIND_OF = { 20: 'er', 8: 'lab', 21: 'lab', 22: 'lab', 23: 'lab', 24: 'lab', 25: 'lab', 26: 'lab', 19: 'amb', 27: 'amb' };
  const ACRO = /(^|[^а-яё])(умбал|исул|омо|му|нзок|каил|унг|екг|кт|ямр|днк|рнк|пкр)(?=[^а-яё]|$)/gi;
  /** „СТРУКТУРА НА СПЕШНОТО ОТДЕЛЕНИЕ:“ → „Структура на спешното отделение“ */
  const tidyT = (t) => {
    t = (t || '').replace(/[\s:–-]+$/, '').trim();
    if (t && t === t.toUpperCase() && /[А-Я]{4}/.test(t)) { t = t.toLowerCase(); t = t[0].toUpperCase() + t.slice(1); }
    // abbreviations and the hospital's name keep their capitals (titles may arrive already lower-cased)
    return t.replace(ACRO, (m, a, w) => a + w.toUpperCase()).replace(/царица\s+йоанна/gi, 'Царица Йоанна');
  };
  /** a short profile that ends with a whole sentence */
  // (whole sentences — „проф.“, „д-р“, „1956 г.“ and initials are not sentence ends; a long first sentence stays whole up to 400)
  const cutS = (t, n = 240) => {
    const ss = sentences(t);
    // a closing fragment that leads into a list („В кабинетите на ДКБ се извършват“) is dropped
    if (ss.length > 1 && !/[.!?…“”"»)]$/.test(ss[ss.length - 1].trim())) ss.pop();
    let out = '';
    for (const x of ss) { if (out && (out + ' ' + x).length > n) break; out += (out ? ' ' : '') + x; }
    return out.length <= 500 ? out : out.slice(0, out.lastIndexOf(' ', n)) + '…';
  };
  const NAMES = /(проф\.|доц\.|д-р|гл\.\s*ас\.|ас\.)\s*[а-яa-z]/gi;
  /** sentences, without breaking after „проф.“, „д-р“, „1956 г.“ or an initial („А. Бовянски“) */
  const sentences = (t) => t.split(/(?<=[.!?])\s+(?=[А-ЯA-Z„"])/).reduce((out, x) => { const prev = out[out.length - 1]; if (prev && /(^|[\s(])([А-ЯA-Z]|проф|доц|ас|гл|г|бл|ул|др|т\.е|напр|св|акад)\.$/i.test(prev)) out[out.length - 1] = prev + ' ' + x; else out.push(x); return out; }, []);
  /** history as milestones: each sentence that names a year opens one, the sentences after it belong to it */
  const milestones = (t) => {
    const ms = []; let intro = '';
    sentences(t).forEach((x) => { const y = (x.match(/\b(1[89]\d{2}|20\d{2})\b/) || [])[1]; if (y && !(ms.length && ms[ms.length - 1].y === y)) ms.push({ y, t: x }); else if (ms.length) ms[ms.length - 1].t += ' ' + x; else intro += (intro ? ' ' : '') + x; });
    return { intro, ms: ms.sort((a, b) => a.y - b.y) };
  };
  /** the head of a clinic: a band of its own in warm gold — photo, title, the last steps of the migrated CV, profile and booking */
  function chiefBand(chief, { isClinic, kind, sid }) {
    const cs = cvSections(chief);
    const introS = cs.find((x) => !x.t && !x.dated);
    let about = introS ? introS.rows.map((r) => r.x).join(' ') : '';
    if (!about) { const area = cs.find((x) => /интерес|област|насок|профил|компетент/i.test(x.t)); if (area) about = area.rows.map((r) => r.x).join('; '); }
    about = about ? cutS(about, 280) : '';
    const path = cs.find((x) => x.dated && x.kind === 'work') || cs.find((x) => x.dated);
    const steps = path ? path.rows.filter((r) => r.when).slice(0, 3) : [];
    const chiefT = /ръковод/i.test(chief.role || '') ? 'Ръководител' : 'Началник на ' + (isClinic ? 'клиниката' : kind === 'lab' ? 'звеното' : 'отделението');
    return `<section class="cs cs--chief" id="${sid}"><div class="vwrap chf${about || steps.length ? '' : ' chf--s'}">
      <a class="chf__ph${chief.img ? ' nwm' : ''}" href="${drUrl(chief)}" tabindex="-1" aria-hidden="true">${chief.img ? `<img src="${esc(chief.img)}" alt="">` : `<span>${initialsOf(chief)}</span>`}</a>
      <div class="chf__t"><p class="ck"><span></span>${esc(chiefT)}</p><h2><a href="${drUrl(chief)}">${esc(chief.name)}</a></h2>${chief.role ? `<p class="chf__r">${esc(chief.role)}</p>` : ''}
        ${about ? `<p class="chf__d">${esc(about)}</p>` : ''}
        ${steps.length ? `<ol class="chf__tl">${steps.map((r) => `<li><time>${esc(r.when)}</time><span>${esc(r.x.length > 120 ? r.x.slice(0, r.x.lastIndexOf(' ', 114)) + '…' : r.x)}</span></li>`).join('')}</ol>` : ''}
        <div class="chf__act"><a class="chb chb--d" href="${drUrl(chief)}">Профил и биография →</a>${kind === 'clinic' || kind === 'amb' ? `<a class="chb chb--o" href="${BOOK}">Как да се прегледам</a>` : ''}${chief.cv ? `<a class="chb chb--o" href="${esc(chief.cv)}" target="_blank" rel="noopener">CV · PDF</a>` : ''}</div>
      </div></div></section>`;
  }
  /** where it is: the places on the board beside a small plan; the full map opens on #/kade */
  function whereBand(id, sid, kick = (t) => `<p class="ck"><span></span>${esc(t)}</p>`) {
    const ps = placesOf(id); if (!ps.length) return '';
    return `<section class="cs cs--where" id="${sid}"><div class="vwrap">${kick('Къде се намира')}<div class="kx cs__where${ps.length > 2 ? ' is-many' : ''}"><div>
        <ul class="kx-wh__list">${ps.map((p) => `<li><span class="kx-wh__n">${p.b.id}</span><span><b>${esc(p.b.name)}${/^Сграда/.test(p.floor) ? '' : ' · ' + esc(p.floor)}</b><small>${esc(p.label)}</small>${p.note ? `<em>${esc(p.note)}</em>` : ''}</span></li>`).join('')}</ul>
        <div class="kx-wh__act"><a class="kx-btn kx-btn--d" href="#/kade/c${id}">Покажи на картата ${IC.arrow}</a><a class="chb chb--o" href="route.html">Как да стигна →</a><span class="kx-wh__src">Вход за пациенти — от ул. „Бяло море“ № 8. ${esc(PL.source)}</span></div></div>
      <a class="kx-wh__map" href="#/kade/c${id}" aria-label="Отвори картата на болницата">${planSvg({ hi: [...new Set(ps.map((p) => p.b.id).concat(ps.map((p) => p.via).filter(Boolean)))], small: true, label: 'Схема: ' + placeLine(ps).join(', ') })}</a></div></div></section>`;
  }
  function clinicX2(c, id, tab) {
    c = clinicRest(c);
    c = { ...c, blocks: noDop(c.blocks), patient: noDop(c.patient) };
    const kind = KIND_OF[id] || 'clinic';
    // a person, not a label like „Екип“
    const leaders = c.leaders.filter((l) => l.name && !/awesome image/i.test(l.name) && /\S+\s+\S+/.test(l.name) && !/^(екип|персонал|ръководство)$/i.test(l.name.trim()));
    const shortN = c.name.replace(/^Клиника по /, '');
    const isClinic = /^Клиника по /.test(c.name);
    const phones = (c.phones.join('; ') || '02 9432 170').split(/;|,| и /).map((x) => x.trim()).filter((x) => /\d{3}/.test(x));
    const tel1 = kind === 'er' ? '02 9432 203' : phones[0] || '02 9432 170';
    const allTxt = c.patient.concat(c.blocks).map((b) => b.x || '').join('\n');
    const visit = kind === 'clinic' ? (allTxt.match(/Свиждане[^:\n]*:\s*([^\n]{4,80})/i) || [])[1] || '' : '';
    const kick = (t) => `<p class="ck"><span></span>${esc(t)}</p>`;
    const sec = (key, kickT, title, body, mod = '') => `<section class="cs ${mod}" id="c-${key}"><div class="vwrap">${kickT ? kick(kickT) : ''}${title ? `<h2 class="cs__h">${title}</h2>` : ''}${body}</div></section>`;
    const acc = { tels: new Set(), mails: new Set(), docs: [] };

    /* ---- the migrated text: profile, history, activities, structure, gallery ---- */
    const pre = []; let firstStructured = c.blocks.findIndex((b) => b.t !== 'p' || (b.links || []).length);
    if (firstStructured < 0) firstStructured = c.blocks.length;
    c.blocks.slice(0, Math.min(firstStructured, 3)).forEach((b) => pre.push(b));
    // history: founding, dates, and who first brought a method to the country („въвежда в страната“, „за първи път в България“)
    const HIST = /(създаден|основан|открит|учреден)[аио]? (е |през |в )|история|\b(19|20)\d{2}\s*г|въвежда(т)? (в страната|в България|за първи път)|за първи път в (България|страната)/i;
    // the profile is a real sentence, not a label like „Западен блок 4“ (the place is shown from the board)
    let li = pre.findIndex((b) => !HIST.test(b.x) && b.x.length >= 60); if (li < 0) li = pre.findIndex((b) => b.x.length >= 60);
    let lead = li >= 0 ? pre[li].x : '';
    const introP = pre.filter((b, i) => i !== li && !HIST.test(b.x) && b.x.length >= 30), histP = pre.filter((b, i) => i !== li && HIST.test(b.x));
    const secs = sectionize(c.blocks.slice(pre.length));
    let equip = null;
    secs.forEach((s) => { if (equip) return; const lis = s.items.filter((b) => b.t === 'li'); const ctx = (s.title + ' ' + s.items.filter((b) => b.t === 'p').map((b) => b.x).join(' ')).toLowerCase(); if (lis.length >= 4 && /оборудван|апарат|техника|апаратур/.test(ctx) && !/лекува|направлени|дейност|лечени/i.test(s.title || '')) { equip = lis; s.items = s.items.filter((b) => b.t !== 'li'); } });
    const acts = [], org = [], hist = [], phoneSec = [], gal = [];
    secs.forEach((s) => {
      let t = s.title || '';
      // a whole paragraph that the old site set as a heading is text, not a title
      if (t.length > 70 || /[.!?]\s/.test(t) || (/[.!?]$/.test(t) && t.length > 40)) { s.items.unshift({ t: 'p', x: t }); t = ''; }
      t = tidyT(t);
      // the clinic's own name or a quoted name („"Академик Ташо Ташев"“) is not a topic
      if (/^["„“]/.test(t) && /["“”]$/.test(t) || (/^Клиника/i.test(t) && fold(t).includes(fold(shortN)))) t = '';
      // a lead-in to a list („Диагностика и лечение на:“, „Клиниката е една от водещите в страната по:“) is text of the topic before it
      if (t && (/\s(по|на|в|във|за|с|със|и|от|при|като|чрез)$/i.test(t) || (/:\s*$/.test(s.title || '') && t.split(/\s+/).length >= 5))) { s.items.unshift({ t: 'p', x: t + ':' }); t = ''; }
      s.title = t;
      const txt = s.items.map((b) => b.x || '').join(' ');
      if (/галери/i.test(s.title)) { s.items.forEach((b) => { if (b.t === 'img' && b.src) gal.push(b); }); return; }
      if (!s.items.length) return;
      if (/истори/i.test(s.title)) return hist.push(s);
      if (/телефон/i.test(s.title)) return phoneSec.push(s);
      const names = (txt.match(NAMES) || []).length;
      if (/структура|отделени|сектор|кабинет|звено|стационар|зона \d/i.test(s.title) || (names >= 3 && txt.length / Math.max(1, s.items.length) < 140)) return org.push(s);
      if (!s.title && acts.length) { acts[acts.length - 1].items.push(...s.items); return; }
      // untitled opening text: the history goes to „История“, labels like „ет. 2“ are dropped
      if (!s.title && !acts.length) { s.items.forEach((b) => { if (b.t !== 'p' || (b.x || '').length < 30) return; (HIST.test(b.x) ? histP : introP).push(b); }); const other = s.items.filter((b) => b.t !== 'p'); if (other.length) acts.push({ title: 'Дейност', items: other }); return; }
      acts.push(s);
    });
    // no opening paragraph before the first heading: the profile is the first describing paragraph
    // (a paragraph about the clinic itself — „Клиниката по … има …“ — before one about a person)
    if (!lead) {
      const self = (b) => /^(Клиниката|Отделението|Лабораторията|Центърът|Звеното)\s/.test(b.x) && b.x.length >= 60;
      let k = introP.findIndex(self), from = introP;
      if (k < 0) { k = histP.findIndex(self); from = histP; }
      if (k < 0) { k = introP.findIndex((b) => b.x.length >= 60); from = introP; }
      if (k >= 0) lead = from.splice(k, 1)[0].x;
    }
    const units = PP ? PP.unitsOf(id) : [];
    const docs = PP ? PP.inClinic(id) : [];
    const prices = kxPrices(c);
    const wherePs = placesOf(id);

    const chief = docs.find((d) => /(началник|н-к|ръководител)\s+(на\s+)?(клиник|отделени|лаборатори|центр|звен)/i.test(d.role || '')) || docs.find((d) => d.head);

    /* ---- header: name → short profile → main action → head, block and floor ---- */
    const whereShort = placeLine(wherePs);
    const cta = kind === 'er'
      ? `<a class="chb chb--w" href="${telOf(tel1)}">${IC.phone}Спешно · ${esc(tel1)}</a><a class="chb" href="tel:112">При опасност за живота — 112</a>`
      : `<a class="chb chb--w" href="${telOf(tel1)}">${IC.phone}${esc(tel1)}</a>${kind === 'lab' ? '' : `<a class="chb" href="${BOOK}">Как да се прегледам</a>`}`;
    // the facts in the header row: visiting hours, booking, e-mail
    const strip = [
      kind === 'er' && ['Работи', 'Денонощно, 24/7'],
      visit && ['Свиждане', esc(visit)],
      kind === 'clinic' || kind === 'amb' ? ['Преглед', `<a href="${BOOK}">Как да се прегледам</a>`] : null,
      c.emails[0] && ['Имейл', `<a href="mailto:${esc(c.emails[0])}">${esc(c.emails[0])}</a>`]].filter(Boolean);
    const head0 = leaders[0];
    const headN = ((n) => n && n[0].toUpperCase() + n.slice(1))(chief ? chief.name : head0 ? head0.name : '');
    const headR = (chief ? chief.role : head0 ? head0.role : '') || '';
    const headLine = headN ? `<div><dt>${/ръковод/i.test(headR) ? 'Ръководител' : 'Началник'}</dt><dd>${chief ? `<a href="${drUrl(chief)}">${esc(headN)}</a>` : esc(headN)}</dd></div>` : '';
    const heroHtml = `<header class="ch ch--x"><div class="vwrap ch__in">
      <div class="ch__copy">
        ${crumbs([['Клиники и отделения', '#/clinics'], [c.name]])}
        ${kick((GROUP_OF[id] || 'Клиника') + ' · УМБАЛ „Царица Йоанна – ИСУЛ“')}
        <h1>${isClinic ? `Клиника по <em>${esc(shortN)}</em>` : esc(c.name)}</h1>
        ${lead ? `<p class="ch__lead">${esc(cutS(lead))}</p>` : ''}
        <div class="ch__cta">${cta}</div>
        ${headLine || whereShort.length || strip.length ? `<dl class="ch__meta">${headLine}${whereShort.length ? `<div><dt>Къде се намира</dt><dd>${esc(whereShort[0])}${whereShort.length > 1 ? ` <small>и още ${whereShort.length - 1}</small>` : ''} <a href="#c-where" data-cj="c-where">Виж повече ↓</a></dd></div>` : ''}${strip.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
      </div>
      <figure class="ch__fig nwm">${c.hero ? `<img src="${esc(c.hero)}" alt="">` : '<span class="ch__ph"></span>'}<figcaption>${esc(c.name)}</figcaption></figure>
    </div></header>`;

    /* ---- activities: the profile text, then one module per topic ---- */
    const teaser = (sx) => { const t = sx.items.find((b) => b.t === 'p' && (b.x || '').length > 30); return t ? (t.x.length > 90 ? t.x.slice(0, t.x.lastIndexOf(' ', 84)) + '…' : t.x) : ''; };
    const actLen = (sx) => sx.items.reduce((n, b) => n + (b.x || '').length, 0);
    const lay = acts.length === 1 ? ' cmod--one' : acts.length <= 3 ? ' cmod--top' : acts.length > 6 ? ' cmod--many' : '';
    const mods = acts.length ? `<div class="cmod${lay}">
      ${acts.length > 1 ? `<div class="cmod__tabs" role="tablist" aria-label="Дейности">${acts.map((sx, i) => `<button type="button" role="tab" id="cm-t${i}" aria-controls="cm-p${i}" aria-selected="${!i}" tabindex="${i ? -1 : 0}"><span class="cmod__n">${String(i + 1).padStart(2, '0')}</span><span class="cmod__tt"><b>${shy(esc(sx.title || 'Дейност'))}</b>${teaser(sx) ? `<small>${esc(teaser(sx))}</small>` : ''}</span></button>`).join('')}</div>` : ''}
      <div class="cmod__panels">${acts.map((sx, i) => `<div class="cmod__p${actLen(sx) > 1100 ? ' is-cols' : ''}${actLen(sx) > 1700 ? ' is-long' : ''}" role="tabpanel" id="cm-p${i}"${acts.length > 1 ? ` aria-labelledby="cm-t${i}"` : ''}${i ? ' hidden' : ''}>${acts.length > 1 || sx.title ? `<h3>${esc(sx.title || 'Дейност')}</h3>` : ''}<div class="cmod__b">${richBody(sx.items, acc)}</div>${actLen(sx) > 1700 ? '<button type="button" class="xfold__btn" data-cmmore>Прочети всичко ↓</button>' : ''}</div>`).join('')}</div>
    </div>` : '';
    const introLen = introP.reduce((n, b) => n + b.x.length, 0);
    const intro = introP.length ? `<div class="cs__intro${introLen > 900 ? ' is-cols' : ''}${introLen > 1500 ? ' is-long' : ''}"><div class="cs__intro-b">${introP.map((b) => `<p>${linkify(b.x)}</p>`).join('')}</div>${introLen > 1500 ? '<button type="button" class="kx-more" data-intro>Прочети още ↓</button>' : ''}</div>` : '';
    const actsHtml = acts.length || intro ? sec('acts', acts.length ? 'Дейности' : 'За ' + (isClinic ? 'клиниката' : 'звеното'), acts.length ? 'Какво правим' : '', intro + mods, 'cs--panel') : '';

    /* ---- examinations and prices ---- */
    const eur = (v) => v.toFixed(2).replace('.', ',') + ' €';
    const PRF = 12;
    const eqList = equip ? equip.map((b) => ({ ...b, x: (b.x || '').replace(DOP, '').trim() })) : null;
    // a list of treatments found next to the word „апаратура“ is not equipment
    const eqTreat = eqList && eqList.filter((b) => /^(лечение|извършва|диагност|операци|андролог|фертилит|хирург|оператив)/i.test(b.x)).length >= eqList.length / 2;
    const eqT = eqTreat ? (kind === 'lab' ? 'Методи' : 'Лечение и методи') : 'Апаратура';
    let eqN = 0; const eqI = eqList ? eqList.findIndex((b) => (eqN += Math.max(60, b.x.length)) > 700) : -1;
    const EQF = eqI < 0 ? 9 : Math.max(3, Math.min(9, eqI));
    let pn = 0;
    const prSubs = [...new Set(prices.map((p) => p.sub))];
    const prRows = prSubs.map((sb) => `${sb ? `<li class="kx-pr__sub${pn >= PRF ? ' kx-late' : pn >= 6 ? ' kx-late-m' : ''}">${esc(sb)}</li>` : ''}${prices.filter((p) => p.sub === sb).map((p) => `<li class="kx-pr__it${pn >= PRF ? ' kx-late' : pn >= 6 ? ' kx-late-m' : ''}${(pn++, '')}" data-q="${esc(fold(p.code + ' ' + p.name + ' ' + sb))}"><span><b>${esc(p.name)}</b><small>${esc(p.code)} · ${esc(p.unit)}</small></span><em>${eur(p.price)}</em></li>`).join('')}`).join('');
    const examHtml = prices.length || eqList ? sec('exam', prices.length ? 'Изследвания и цени' : eqT, prices.length ? 'Изследвания и услуги' : eqT, `<div class="kx cx-ex">
      ${prices.length ? `<div class="kx-pr"><div class="cx-ex__top"><h3 class="kx-h3">Услуги с цени <span>${prices.length}</span></h3>${prices.length > 8 ? `<div class="kx-find"><span>${ICON.search}</span><label class="vh" for="kx-pq">Търси услуга</label><input id="kx-pq" type="search" placeholder="Търси изследване или код…" autocomplete="off"></div>` : ''}</div>
        <ul class="kx-pr__list${prices.length > 6 ? ' is-clip' : ''}" id="kx-pl">${prRows}</ul>
        <p class="kx-pr__none" hidden>Няма услуга по това търсене. Попитайте на <a href="${telOf(tel1)}">${esc(tel1)}</a>.</p>
        <div class="kx-pr__foot">${prices.length > 6 ? `<button type="button" class="kx-btn kx-btn--d${prices.length > PRF ? '' : ' is-m'}" id="kx-pall">Покажи всички ${prices.length}</button>` : ''}<a class="kx-link" href="#/pricelist">Целият ценоразпис ${IC.arrow}</a><small>Цени от утвърдения ценоразпис на болницата — за пациенти без здравна осигуровка или извън НЗОК.</small></div></div>` : ''}
      ${eqList ? `<div class="kx-eq"><h3 class="kx-h3">${eqT} <span>${eqList.length}</span></h3><ul${eqList.length > EQF ? ' class="is-clip"' : ''}>${eqList.map((b, i) => `<li${i >= EQF ? ' class="kx-late"' : ''}>${ICON.check}<span>${linkify(b.x)}</span></li>`).join('')}</ul>${eqList.length > EQF ? `<button type="button" class="kx-more" data-eqall>Покажи всички (${eqList.length}) ↓</button>` : ''}</div>` : ''}
    </div>`) : '';

    /* ---- the head of the clinic: a band of its own, a short description from the migrated CV ---- */
    const chiefHtml = chief ? chiefBand(chief, { isClinic, kind, sid: 'c-head' }) : '';
    const docsT = chief ? docs.filter((d) => d !== chief) : docs;

    /* ---- team: laid out by how many doctors have a profile ---- */
    const vcard = (d) => `<a class="tvc" href="${drUrl(d)}"><span class="tvc__ph${d.img ? ' nwm' : ''}">${d.img ? `<img src="${esc(d.img)}" alt="" loading="lazy">` : `<span>${initialsOf(d)}</span>`}</span><span class="tvc__t"><b>${esc(d.name)}</b>${d.role ? `<small>${esc(d.role)}</small>` : ''}<em>Профил →</em></span></a>`;
    const heads = docsT.filter((d) => d.head), rest = docsT.filter((d) => !d.head);
    const careG = {}; c.members.filter((m) => /сестр|санитар|лаборант|фелдшер|рехабилитатор|акушер/i.test(m.g)).forEach((m) => { (careG[m.g] = careG[m.g] || []).push(m.x); });
    const care = Object.keys(careG).length ? `<details class="dother"><summary>Медицински сестри и друг персонал (${Object.values(careG).flat().length})</summary>${Object.entries(careG).map(([g, xs]) => `<h4>${esc(g)}</h4><p>${xs.map(esc).join(' · ')}</p>`).join('')}</details>` : '';
    const note = `<p class="cs__note">Лекари с публикуван профил в сайта${docsT.length > 1 ? ': ' + docsT.length : ''}${chief ? ', без началника' : ''}.</p>`;
    let teamBody = '';
    if (docsT.length && docsT.length <= 4) teamBody = `<div class="tvc-row" style="--n:${docs.length}">${heads.concat(rest).map(vcard).join('')}</div>`;
    else if (docsT.length) teamBody = `${heads.length ? `<div class="tvc-row" style="--n:${Math.min(heads.length, 4)}">${heads.map(vcard).join('')}</div>` : ''}
      ${rest.length > 8 ? `<div class="rfind"><span>${ICON.search}</span><label class="vh" for="dfind">Търси лекар</label><input id="dfind" type="search" placeholder="Търси лекар (${rest.length})…" autocomplete="off"></div>` : ''}${drBlock(rest, 'dlist')}`;
    else if (!docs.length && (leaders.length || c.members.length)) teamBody = `<div class="dlines">${leaders.concat(c.members.filter((m) => !/сестр|санитар|лаборант|фелдшер|рехабилитатор|акушер/i.test(m.g)).map((m) => { const [nm, ...r] = m.x.split(/,\s*/); return { name: nm, role: r.join(', ') }; })).map((l) => `<div class="dline"><span class="dline__av">${l.img && !/team\.jpg/.test(l.img) ? `<img src="${esc(l.img)}" alt="" loading="lazy">` : esc(l.name.replace(/^(Професор|Доцент|Проф|Доц|Д-р|Др|Гл\. ас|Ас)\.?\s*(д-р\s*)?/i, '').split(/\s+/).slice(0, 2).map((w) => w[0] || '').join(''))}</span><span><b>${esc(l.name)}</b>${l.role ? `<small>${esc(l.role)}</small>` : ''}</span></div>`).join('')}</div>`;
    const teamHtml = teamBody ? sec('team', 'Екип', docsT.length === 1 ? 'Лекар' : 'Лекари', (docsT.length ? note : '') + teamBody + care, docsT.length <= 4 ? 'cs--team-x' : '') : '';

    /* ---- structure: departments with their pages, sectors and the people responsible ---- */
    const uLabel = units.length && units.every((u) => u.kind === 'Апаратура') ? 'Изследвания и апаратура' : 'Отделения и звена';
    const orgCards = org.map((s) => { const len = s.items.reduce((n, b) => n + (b.x || '').length, 0); return `<article class="cact__c${len > 600 ? ' is-long' : ''}"><h3>${esc(s.title || 'Структура')}</h3><div class="cact__b">${richBody(s.items, acc)}</div>${len > 600 ? '<button type="button" class="rs__more">Покажи още ↓</button>' : ''}</article>`; }).join('');
    const structHtml = units.length || org.length ? sec('depts', units.length ? uLabel : 'Структура', units.length ? `${units.length} ${uLabel === 'Изследвания и апаратура' ? (units.length === 1 ? 'изследване' : 'вида изследвания') : units.length === 1 ? 'звено' : 'звена'} — <em>със своя страница</em>` : 'Отделения и сектори',
      `${units.length ? `<div class="ucards">${units.map(unitCard).join('')}</div>` : ''}${org.length ? `${units.length ? '<h3 class="dgrp cs__sub">Структура и отговорници</h3>' : ''}<div class="cact cact--org">${orgCards}</div>` : ''}`, 'cs--units') : '';

    /* ---- the visit: what it takes, by the kind of unit ---- */
    const patientBlocks = c.patient.filter((b) => !phones.some((p) => (b.x || '').includes(p)) && !c.emails.some((e) => (b.x || '').includes(e)) && !/^Свиждане/i.test(b.x || '') && !(b.t !== 'row' && (b.x || '').trim().length < 25 && !/\d{1,2}[.:]\d{2}/.test(b.x || '')));
    const extra = patientBlocks.reduce((n, b) => n + (b.x || '').length, 0) >= 40 ? `<div class="cs__extra">${richBody(patientBlocks, acc)}</div>` : '';
    const steps = kind === 'clinic' ? [['Консултация', `Преглед в кабинета на клиниката в Диагностично-консултативния блок (ДКБ, II етаж над Спешно отделение), в работни дни от 8 до 14 ч. Информация: ${esc(tel1)}.`], ['Направление', 'Направление за хоспитализация (бл. МЗ-НЗОК № 7) от личен лекар или специалист, или при спешност — през Спешно отделение.'], ['Хоспитализация', 'Носете лична карта, епикризи, изследвания и списък с лекарствата.'], ['Сведения за близките', visit ? 'Свиждане: ' + esc(visit) : 'Информация по телефона на клиниката.']]
      : kind === 'amb' ? [['Информация', `На ${esc(tel1)}.`]] : [];
    const priceCard = !prices.length && kind !== 'er' ? `<div class="cprice">${kick('Ценоразпис')}<h3>Цени на услугите</h3><p>Консултации, изследвания, процедури и престой — за пациенти без здравна осигуровка или извън НЗОК.</p><a class="chb chb--d" href="#/pricelist">Виж цените →</a></div>` : '';
    const visitT = { clinic: ['Прием', 'Как да постъпите в клиниката'], amb: ['Прием', 'Как да се запишете'], lab: ['За пациента', 'Информация за пациента'], er: ['Достъп', 'Кога и как да дойдете'] }[kind];
    const visitHtml = steps.length || extra || priceCard ? sec('admit', visitT[0], visitT[1], `${kind === 'clinic' ? '<a class="cs__more" href="#/admission">Пълен наръчник за прием →</a>' : ''}${steps.length > 1 ? `<ol class="cstep">${steps.map(([t, d], i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><b>${t}</b><p>${d}</p></li>`).join('')}</ol>` : steps.length ? `<p class="cs__one"><b>${steps[0][0]}:</b> ${steps[0][1]}</p>` : ''}${extra}${priceCard}`) : '';

    /* ---- where: a compact strip with a small plan; the full map opens on its own page ---- */
    const whereHtml = wherePs.length ? whereBand(id, 'c-where') : '';

    /* ---- history and gallery ---- */
    const histTxt = histP.map((b) => b.x).concat(hist.flatMap((s) => s.items.filter((b) => b.t === 'p' || b.t === 'li').map((b) => b.x))).join(' ').replace(/\s+/g, ' ').trim();
    const HM = milestones(histTxt);
    const histName = 'История на ' + (isClinic ? 'клиниката' : 'звеното');
    const histAll = HM.ms.length >= 2 ? `<div class="chx" data-chx>
        <header class="chx__h"><h3>${histName}</h3><span class="chx__n" aria-live="polite">1 / ${HM.ms.length}</span><button type="button" class="chx__a" data-chx-go="-1" aria-label="По-рано">‹</button><button type="button" class="chx__a" data-chx-go="1" aria-label="По-късно">›</button></header>
        ${HM.intro ? `<p class="chx__intro">${linkify(HM.intro)}</p>` : ''}
        <ol class="chx__v">${HM.ms.map((m, i) => `<li class="chx__i${i ? '' : ' is-on'}"><button type="button" class="chx__b" aria-expanded="${!i}" aria-controls="hx-p${i}"><span class="chx__dot" aria-hidden="true"></span><b>${m.y}</b><small>${esc(m.t.length > 110 ? m.t.slice(0, m.t.lastIndexOf(' ', 104)) + '…' : m.t)}</small></button><div class="chx__body" id="hx-p${i}"${i ? ' hidden' : ''}><p>${linkify(m.t)}</p></div></li>`).join('')}</ol>
      </div>`
      : histP.map((b) => `<p>${linkify(b.x)}</p>`).join('') + hist.map((s) => (s.title && !/^истори/i.test(s.title) ? `<h4>${esc(s.title)}</h4>` : '') + richBody(s.items, acc)).join('');
    const GALF = 8;
    const galHtml = gal.length ? `<div class="cgal">${gal.map((b, i) => `<button type="button" class="rl-img${i >= GALF ? ' is-late' : ''}" data-zoom="${esc(b.src)}"><img src="${esc(b.src)}" alt="${esc(b.alt || '')}" loading="lazy"></button>`).join('')}</div>${gal.length > GALF ? `<button type="button" class="kx-more" data-galall>Всички снимки (${gal.length}) ↓</button>` : ''}` : '';
    const histHtml = histAll || galHtml ? sec('hist', histAll && galHtml ? 'История и галерия' : histAll ? 'История' : 'Галерия', '', `${histAll ? HM.ms.length >= 2 ? histAll : `<div class="chist"><h3>${histName}</h3><div class="chist__b">${histAll}</div></div>` : ''}${galHtml}`, 'cs--panel') : '';

    /* ---- contacts ---- */
    const FIXED = ['02 9432 203'];
    const telItems = [].concat(phones.filter((p) => !FIXED.includes(p)).map((p, i) => [i ? (isClinic ? 'Клиника' : 'Звено') + ' · ' + (i + 1) : isClinic ? 'Клиника' : 'Звено', p]), [['Спешно отделение · регистратура', '02 9432 203']]);
    const contactsHtml = sec('contacts', 'Контакти', 'Телефони', `<div class="ctel">${telItems.map(([t, p]) => `<a href="${telOf(p)}"><span>${esc(t)}</span><b>${esc(p)}</b></a>`).join('')}${c.emails.map((e) => `<a href="mailto:${esc(e)}"><span>Имейл</span><b>${esc(e)}</b></a>`).join('')}</div>${phoneSec.length ? `<div class="cs__extra">${phoneSec.map((s) => richBody(s.items, acc)).join('')}</div>` : ''}`, 'cs--panel');

    const grp = GROUP_OF[id], near = grp ? clinicList().filter((x) => x.id != id && GROUP_OF[x.id] === grp) : [];
    const others = `<section class="cs cs--dark cs--near"><div class="vwrap">${kick((near.length ? grp : 'Други') + ' клиники и отделения')}<div class="chips-row">${near.map((x) => `<a href="#/clinic/${x.id}">${esc(x.name)}</a>`).join('')}<a class="is-all" href="#/clinics">Всички клиники и отделения →</a></div></div></section>`;

    /* ---- order by the kind of unit ---- */
    const B = { head: [chiefHtml, /ръковод/i.test((chief || {}).role || '') ? 'Ръководител' : 'Началник'], acts: [actsHtml, 'Дейности'], exam: [examHtml, prices.length ? 'Изследвания' : eqTreat ? 'Методи' : 'Апаратура'], team: [teamHtml, 'Екип'], depts: [structHtml, units.length ? 'Звена' : 'Структура'], admit: [visitHtml, visitT[0]], where: [whereHtml, 'Къде се намира'], hist: [histHtml, histAll ? 'История' : 'Галерия'], contacts: [contactsHtml, 'Контакти'] };
    const ORDER = { clinic: ['acts', 'head', 'exam', 'team', 'depts', 'admit', 'where', 'hist', 'contacts'], amb: ['admit', 'acts', 'head', 'exam', 'team', 'depts', 'where', 'hist', 'contacts'], lab: ['exam', 'admit', 'acts', 'head', 'team', 'depts', 'where', 'hist', 'contacts'], er: ['where', 'admit', 'acts', 'head', 'exam', 'team', 'depts', 'hist', 'contacts'] }[kind].filter((k) => B[k][0]);
    const navHtml = `<nav class="cnav" aria-label="Съдържание на страницата"><div class="vwrap cnav__in"><div class="cnav__links">${ORDER.map((k) => `<a href="#c-${k}" data-cj="c-${k}">${B[k][1]}</a>`).join('')}</div><a class="cnav__tel" href="${telOf(tel1)}">${esc(tel1)}</a></div></nav>`;
    const html = heroHtml + navHtml + ORDER.map((k) => B[k][0]).join('') + others;
    return { title: c.name, og: `assets/og/clinic-${id}.jpg`, desc: lead ? lead.slice(0, 180) : c.name, ld: { '@context': 'https://schema.org', '@type': 'MedicalClinic', name: c.name, telephone: tel1, parentOrganization: { '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“' } }, html, init: () => clinicInit(tab) };
  }
  /** variant X: section titles on one line („5 звена —<br><em>всяко…“ → „5 звена — всяко…“) */
  const oneLine = (on, html) => on ? html.replace(/<h2 class="cs__h">[^]*?<\/h2>/g, (h) => h.replace(/\s*<br>\s*/g, ' ')) : html;
  /** variant X: bands of about the same height — a band whose content runs well past FOLD_H folds, „Покажи всичко“ opens it */
  const FOLD_H = 640;
  function xFold(root) {
    if (!window.ISUL_X) return;
    $$('section.cs', root).forEach((s) => {
      if (['c-contacts', 'c-exam', 'c-acts', 'c-where'].includes(s.id) || s.classList.contains('cs--dark')) return;
      // „Прием“: the steps and the price list stay, only the long extra text folds
      const adm = s.id === 'c-admit', w = adm ? $('.cs__extra', s) : s.firstElementChild, lim = adm ? 300 : FOLD_H;
      if (!w || w.classList.contains('xfold') || w.scrollHeight <= lim + (adm ? 80 : 180)) return;
      const top = w.getBoundingClientRect().top;
      // the lowest whole card that fits; when no card fits, the lowest whole paragraph or row
      const lowest = (sel) => $$(sel, w).reduce((m, e) => { const b = e.getBoundingClientRect().bottom - top; return b <= lim && b > m ? b : m; }, 0);
      let cut = $$('.dcard, .ucard, .cact__c', w).length ? lowest('.dcard, .ucard, .cact__c, .dline, .rtm, h2, h3') : 0;
      if (cut < lim / 2) cut = lowest('p, li, h3, img, .dcard, .ucard, .dline, .cact__c, .rtm, figure, .cs__extra > *');
      w.style.setProperty('--fold', Math.round(cut > lim / 2 ? cut + 20 : lim) + 'px');
      w.classList.add('xfold');
      const row = document.createElement('div'); row.className = adm ? 'xfold__row xfold__row--in' : 'vwrap xfold__row';
      row.innerHTML = '<button type="button" class="xfold__btn" aria-expanded="false">Покажи всичко ↓</button>';
      const b = row.firstChild;
      b.addEventListener('click', () => {
        const o = w.classList.toggle('is-open'); b.setAttribute('aria-expanded', String(o)); b.textContent = o ? 'Покажи по-малко ↑' : 'Покажи всичко ↓';
        if (!o && s.getBoundingClientRect().top < 0) window.scrollTo({ top: s.getBoundingClientRect().top + scrollY - 150 });
      });
      if (adm) w.after(row); else s.appendChild(row);
    });
  }
  function clinicInit(tab) {
    const root = page;
    setTimeout(() => xFold(root), 60);
    // bound once on the page element; the flag must not be „data-zoom“, which marks the photos themselves
    if (window.ISUL_X && !root.dataset.lbBound) {
      root.dataset.lbBound = '1';
      // the photos of the same gallery change with the arrows, the ← → keys or a swipe
      root.addEventListener('click', (e) => {
        const z = e.target.closest('[data-zoom]'); if (!z) return;
        const set = $$('[data-zoom]', z.closest('.cgal, .rl-gallery, .cmod__b, section') || root);
        let i = Math.max(0, set.indexOf(z));
        const many = set.length > 1;
        const lb = document.createElement('div'); lb.className = 'rlb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Снимка');
        lb.innerHTML = `<img alt=""><button type="button" class="rlb__x" aria-label="Затвори">×</button>${many ? '<button type="button" class="rlb__nav rlb__nav--p" aria-label="Предишна снимка">‹</button><button type="button" class="rlb__nav rlb__nav--n" aria-label="Следваща снимка">›</button><span class="rlb__n"></span>' : ''}`;
        const img = $('img', lb), num = $('.rlb__n', lb);
        const show = (k) => { i = (k + set.length) % set.length; img.src = set[i].dataset.zoom; if (num) num.textContent = `${i + 1} / ${set.length}`; };
        const close = () => { lb.remove(); removeEventListener('keydown', key); z.focus(); };
        const key = (ev) => { if (ev.key === 'Escape') close(); else if (many && ev.key === 'ArrowRight') show(i + 1); else if (many && ev.key === 'ArrowLeft') show(i - 1); };
        lb.addEventListener('click', (ev) => { const n = ev.target.closest('.rlb__nav'); if (n) { show(i + (n.classList.contains('rlb__nav--n') ? 1 : -1)); return; } if (ev.target !== img) close(); });
        let tx = null; lb.addEventListener('touchstart', (ev) => { tx = ev.touches[0].clientX; }, { passive: true });
        lb.addEventListener('touchend', (ev) => { if (tx === null || !many) return; const dx = ev.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); });
        addEventListener('keydown', key); show(i); document.body.appendChild(lb); $('.rlb__x', lb).focus();
      });
    }
    // activity modules: click or arrow keys
    const tabs = $$('.cmod__tabs [role=tab]', root);
    const pick = (t, focus) => { tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls'), root).hidden = !on; }); if (focus) t.focus(); };
    tabs.forEach((t, i) => { t.addEventListener('click', () => pick(t)); t.addEventListener('keydown', (e) => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); } }); });
    const df = $('#dfind', root); if (df) df.addEventListener('input', () => { const q = fold(df.value.trim()); $$('#dlist .dcard, #dlist .dline', root).forEach((x) => { x.hidden = !!q && !fold(x.textContent).includes(q); }); });
    $$('[data-chx]', root).forEach((h) => {
      // vertical: the chosen year opens under itself
      const ts = $$('.chx__b', h), n = $('.chx__n', h); let cur = 0;
      const go = (k, focus) => { cur = (k + ts.length) % ts.length; ts.forEach((t, i) => { const on = i === cur; t.setAttribute('aria-expanded', String(on)); t.parentNode.classList.toggle('is-on', on); $('#' + t.getAttribute('aria-controls'), h).hidden = !on; }); n.textContent = `${cur + 1} / ${ts.length}`; if (focus) ts[cur].focus(); };
      ts.forEach((t, i) => { t.addEventListener('click', () => go(i)); t.addEventListener('keydown', (e) => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); go(cur + d, true); } }); });
      $$('[data-chx-go]', h).forEach((b) => b.addEventListener('click', () => go(cur + +b.dataset.chxGo)));
    });
    $$('[data-intro]', root).forEach((b) => b.addEventListener('click', () => { const o = b.parentNode.classList.toggle('is-open'); b.textContent = o ? 'Покажи по-малко ↑' : 'Прочети още ↓'; }));
    const ga = $('[data-galall]', root); if (ga) ga.addEventListener('click', () => { ga.previousElementSibling.classList.add('is-all'); ga.remove(); });
    $$('[data-cmmore]', root).forEach((b) => b.addEventListener('click', () => { const o = b.parentNode.classList.toggle('is-open'); b.textContent = o ? 'Покажи по-малко ↑' : 'Прочети всичко ↓'; }));
    const eqb = $('[data-eqall]', root); if (eqb) eqb.addEventListener('click', () => { eqb.previousElementSibling.classList.remove('is-clip'); eqb.remove(); });
    const pl = $('#kx-pl', root), pq = $('#kx-pq', root), pall = $('#kx-pall', root);
    if (pall) pall.addEventListener('click', () => { pl.classList.remove('is-clip'); pall.remove(); });
    if (pq) pq.addEventListener('input', () => {
      const q = fold(pq.value.trim()); if (q && pall && pall.isConnected) { pl.classList.remove('is-clip'); pall.remove(); }
      $$('.kx-pr__it', pl).forEach((li) => { li.hidden = !!q && !li.dataset.q.includes(q); });
      $$('.kx-pr__sub', pl).forEach((h) => { let n = h.nextElementSibling, any = false; while (n && !n.classList.contains('kx-pr__sub')) { if (!n.hidden) any = true; n = n.nextElementSibling; } h.hidden = !any; });
      $('.kx-pr__none', root).hidden = $$('.kx-pr__it', pl).some((li) => !li.hidden);
    });
    $$('.cd__chips button', root).forEach((b) => b.addEventListener('click', () => { $$('.cd__chips button', root).forEach((x) => x.setAttribute('aria-selected', String(x === b))); $$('.cd__panel', root).forEach((p) => { p.hidden = p.dataset.dp !== b.dataset.d; }); }));
    $$('[data-eqmore]', root).forEach((b) => { const t = b.textContent; b.addEventListener('click', () => { const o = b.parentNode.classList.toggle('is-eqopen'); b.textContent = o ? 'Покажи по-малко ↑' : t; }); });
    $$('.rs__more:not([data-eqmore])', root).forEach((b) => b.addEventListener('click', () => { const s = b.closest('.cact__c'); const o = s.classList.toggle('is-open'); b.textContent = o ? 'Покажи по-малко ↑' : 'Покажи още ↓'; }));
    const tf = $('#rteam', root); if (tf) tf.addEventListener('input', () => { const q = fold(tf.value.trim()); $$('.rtm', root).forEach((x) => { x.hidden = q && !fold(x.textContent).includes(q); }); });
    const jump = (idd) => { const t = document.getElementById(idd); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 150, behavior: reduce ? 'auto' : 'smooth' }); };
    $$('[data-cj]', root).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); jump(a.dataset.cj); }));
    const links = $$('.cnav__links a', root);
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle('is-on', a.dataset.cj === e.target.id)); }), { rootMargin: '-35% 0px -55% 0px' });
    $$('.cs[id]', root).forEach((s) => io.observe(s));
    if (tab === 'team') setTimeout(() => jump('c-team'), 60);
    if (tab === 'patient') setTimeout(() => jump('c-admit'), 60);
  }

  /* =========================================================
     CLINIC MINI-SITE — variant X
     Every clinic and department as its own small site, composed like a homepage:
     photo hero · own sticky menu · quick tiles · about with a photo collage · photo band with key numbers ·
     examinations with prices · team with CVs · gallery · news · for the patient · contacts.
     Data only from the migrated isul.eu pages, the price list, units.js, bios.js and cv.js.
     ========================================================= */
  // price-list groups whose title is not the clinic's own name (everything else matches by name)
  const KX_PRICE = { 11: /^Клиника по ендокринология/, 1: /^КАИЛ/, 5: /^Клиника по интензивно лечение на нервни болести/, 4: /^Отделение по (медицинска онкология|лъчелечение)/, 10: /^Очни прегледи/, 12: /ушно-носно-гърлени/i, 20: /^Мултипрофилно спешно/ };
  const kxPrices = (c) => {
    const P = window.ISUL_PRICES; if (!P) return [];
    const f = fold(c.name);
    const gs = P.groups.filter((g) => KX_PRICE[c.id] ? KX_PRICE[c.id].test(g.t) : fold(g.t).startsWith(f));
    const out = [];
    gs.forEach((g) => g.subs.forEach((s) => s.items.forEach((it) => { if (typeof it[3] === 'number') out.push({ code: it[0], name: it[1], unit: it[2], price: it[3], sub: s.t || (gs.length > 1 ? g.t : '') }); })));
    return out;
  };
  /** news about the clinic: articles that name it, plus the Press centre articles of its doctors */
  const kxNews = (c, docs) => {
    const isClinic = /^Клиника по /.test(c.name);
    const key = fold(isClinic ? c.name.replace(/^Клиника по /, '') : c.name.replace(/[„“”"].*$/, '')).trim();
    const rx = new RegExp('(^|[^а-яa-z])' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const press = new Set(docs.flatMap((d) => (d.press || []).map((n) => n.id)));
    const iso = (d) => d.split('.').reverse().join('-');
    return C.news.filter((n) => press.has(n.id) || rx.test(fold(n.title + ' ' + (n.blocks || []).map((b) => b.x || '').join(' '))))
      .sort((a, b) => iso(b.date).localeCompare(iso(a.date)));
  };

  /* ---------- doctor CV: the migrated biography as titled sections with a timeline ---------- */
  // a line that starts with a date or a period („От 25.10.2016 …“, „1996 – 2013 г. …“, „18 - 19.06.2021 г. – …“)
  const CV_PRE = /^[\s\dОоТтДд.,\/\-–]*?((?:19|20)\d{2})(?:\s*г\.?)?(?:\s*(?:до|-|–)\s*[\d.,\s]*?((?:19|20)\d{2}|днес|момента)(?:\s*г\.?)?)?/;
  const CV_KIND = [['work', /стаж|работа|длъжност|професионално развитие/i], ['edu', /образование|обучение|специализац|курс|квалификац/i], ['sci', /научн|публикац|форум|награ|грант|проучван|лектор/i], ['org', /членств/i]];
  const CV_IC = { work: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>', edu: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>', sci: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>', org: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 3-6 6-6s6 2.5 6 6M15 15c3 0 6 2 6 5"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>' };
  function cvSections(d) {
    const out = []; let cur = { t: '', rows: [] };
    (d.biography || []).forEach((b) => { if (b.t === 'h') { if (cur.rows.length) out.push(cur); cur = { t: b.x.replace(/[:：]\s*$/, '').trim(), rows: [] }; } else if (b.x) cur.rows.push(b); });
    if (cur.rows.length) out.push(cur);
    return out.map((s) => {
      const rows = s.rows.map((b) => {
        const m = b.t !== 'li' && b.x.match(CV_PRE), rest = m ? b.x.slice(m[0].length).replace(/^[\s,;:.\-–]+/, '') : '';
        return m && rest.length > 2 ? { when: m[2] ? `${m[1]} – ${m[2]}` : (/^\s*от\s/i.test(b.x) ? 'от ' + m[1] : m[1]), x: rest } : { x: b.x };
      });
      const kind = (CV_KIND.find(([, rx]) => rx.test(s.t)) || ['info'])[0];
      return { t: s.t, kind, rows, dated: rows.filter((r) => r.when).length >= Math.max(2, rows.length / 2) };
    });
  }
  /** the CV markup; sections longer than `fold` rows open with „Покажи всички“ */
  const cvHtml = (secs, foldAt = 6) => secs.map((s) => {
    const row = (r, i) => s.dated
      ? `<li${i >= foldAt ? ' class="cv-late"' : ''}><time>${esc(r.when || '')}</time><p>${linkify(r.x)}</p></li>`
      : `<li${i >= foldAt ? ' class="cv-late"' : ''}>${r.when ? `<b>${esc(r.when)}</b> ` : ''}${linkify(r.x)}</li>`;
    const intro = !s.t && !s.dated;
    if (intro) return `<div class="cv-intro">${s.rows.map((r) => `<p>${linkify((r.when ? r.when + ' ' : '') + r.x)}</p>`).join('')}</div>`;
    return `<section class="cv-s cv-s--${s.kind}"><header class="cv-s__h"><span class="cv-ic"><svg viewBox="0 0 24 24" aria-hidden="true">${CV_IC[s.kind]}</svg></span><h3>${esc(s.t || 'Професионален път')}</h3><small>${s.rows.length}</small></header>
      <${s.dated ? 'ol class="cv-tl"' : 'ul class="cv-ls"'}>${s.rows.map(row).join('')}</${s.dated ? 'ol' : 'ul'}>
      ${s.rows.length > foldAt ? `<button type="button" class="cv-more" data-cvmore>Покажи всички ${s.rows.length} ↓</button>` : ''}</section>`;
  }).join('');
  const cvBind = (root) => root.querySelectorAll('[data-cvmore]').forEach((b) => b.addEventListener('click', () => { const s = b.closest('.cv-s'); const o = s.classList.toggle('is-open'); b.textContent = o ? 'Покажи по-малко ↑' : `Покажи всички ${s.querySelectorAll('li').length} ↓`; }));
  const acadOf = (d) => d.title ? (/проф/i.test(d.title) ? 'Професор' : /доц/i.test(d.title) ? 'Доцент' : /гл/i.test(d.title) ? 'Главен асистент' : /ас/i.test(d.title) ? 'Асистент' : '') : '';
  const degreeOf = (d) => d.degree ? (d.degree === 'дмн' ? 'Доктор на медицинските науки' : 'Доктор по медицина') : '';

  /** „СПЕШНИТЕ СЪСТОЯНИЯ …“ in a clinic's patient text: a heading paragraph, one paragraph per condition
      („ЗАГЛАВИЕ В ГЛАВНИ – описание; - симптом; - симптом“) and a closing „* …“ note.
      Returns the conditions as title + lead + points, the „where and when“ paragraphs before it, and the used blocks. */
  const KX_URG_IC = [[/травм/i, '<path d="M4 14l6-6 6 6-6 6z"/><path d="M14 4l6 6-3 3-6-6zM9 13h2M10 12v2"/>'], [/чужди тела/i, '<circle cx="12" cy="12" r="8"/><path d="M12 8v5M12 16h.01"/>'], [/дихат|задух/i, '<path d="M12 4v8M12 12c-2 0-6 1-6 6v2h4v-4M12 12c2 0 6 1 6 6v2h-4v-4"/>'], [/кървене/i, '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'], [/вътречерепни|орбитал/i, '<path d="M8 4a5 5 0 0 0-4 8c0 3 2 5 4 6v2h8v-2c2-1 4-3 4-6a5 5 0 0 0-4-8 4 4 0 0 0-8 0z"/>'], [/слух/i, '<path d="M8 10a4 4 0 1 1 8 0c0 3-3 3.5-3 6a2.5 2.5 0 0 1-5 0M10 10a2 2 0 1 1 4 0"/>']];
  function kxUrgent(c) {
    const P = c.patient, ui = P.findIndex((b) => /^СПЕШНИТЕ СЪСТОЯНИЯ/.test(b.x || '')); if (ui < 0) return null;
    const used = new Set([ui]), items = [];
    let note = '';
    for (let i = ui + 1; i < P.length; i++) {
      const x = (P[i].x || '').trim();
      if (/^\*/.test(x)) { note = x.replace(/^\*\s*/, ''); used.add(i); break; }
      const w = x.split(/\s+/), k = w.findIndex((t) => !/[А-ЯA-Z]/.test(t) || t !== t.toUpperCase() || /^[-–]/.test(t));
      if (k < 2) break;
      used.add(i);
      const title = w.slice(0, k).join(' ').replace(/[\s:–-]+$/, '');
      const nice = title.toLowerCase().replace(/^./, (m) => m.toUpperCase()).replace(/(^|[^а-я])унг(?=[^а-я]|$)/g, '$1УНГ');
      const rest = w.slice(k).join(' ').replace(/^[\s:–-]+/, '');
      const parts = rest.split(/\s*(?:;\s*)?[-–]\s*(?=[А-ЯA-Z])/).map((t) => t.replace(/[\s;]+$/, '').trim()).filter(Boolean);
      const lead = parts.length > 1 && (/\.\s/.test(parts[0]) || /:$/.test(parts[0])) ? parts.shift() : (parts.length === 1 ? parts.shift() : '');
      // the closing „Това са състояние, при които … може да загине“ line is left out on request
      const wi = parts.findIndex((t) => /^Това са /.test(t)); if (wi >= 0) parts.splice(wi, 1);
      items.push({ t: nice, lead, pts: parts, ic: (KX_URG_IC.find(([rx]) => rx.test(title)) || [0, '<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>'])[1] });
    }
    const where = P.slice(0, ui).map((b, i) => [b, i]).filter(([b]) => /кабинет/i.test(b.x || '')).map(([b, i]) => { used.add(i); return b.x; });
    const head = (P[ui].x.match(/\(([^)]+)\)/) || [])[1] || '';
    const title = P[ui].x.replace(/\(.*$/, '').replace(/[\s:]+$/, '').toLowerCase().replace(/^./, (m) => m.toUpperCase());
    return items.length ? { title, head, items, note, where, used } : null;
  }

  /* =========================================================
     WHERE IS IT — variant X: the information board „Структурна карта“ as a patient tool
     data: assets/content/places.js (window.ISUL_PLACES) · page #/kade[/goal | /c<clinic> | /b<block>] ·
     the „Къде се намира“ block of every clinic page uses the same data and the same plan
     ========================================================= */
  const PL = window.ISUL_PLACES || null;
  const plBlock = (id) => PL && PL.blocks.find((b) => b.id === +id);
  /** every place on the board that belongs to a clinic: [{ b, floor, label, note }] */
  const placesOf = (cid) => {
    if (!PL) return [];
    const out = [];
    Object.entries(PL.floors).forEach(([bid, fl]) => fl.forEach(([floor, items]) => items.forEach(([label, id, note, via]) => { if (id === +cid) out.push({ b: plBlock(bid), floor, label, note: note || '', via: via || 0 }); })));
    return out;
  };
  /** a department sits where the board names it („Детско УНГ отделение“ → „детска оториноларингология“), else with its clinic */
  const PL_STOP = /^(клиника|клиниката|отделение|отделения|лаборатория|по|на|и|за|с|болести|унг|център|центр|звено|кабинет|кабинети)$/;
  const plKeyW = (n) => fold(n).replace(/[„“"()–-]/g, ' ').split(/\s+/).filter((w) => w.length > 4 && !PL_STOP.test(w)).map((w) => w.slice(0, Math.max(5, w.length - 2)));
  const placesOfUnit = (u) => { const ps = placesOf(u.clinic), ws = plKeyW(u.name), hit = ps.filter((p) => ws.some((w) => fold(p.label).includes(w))); return hit.length ? hit : ps; };
  /** short „Западен блок · 4 етаж“ lines of a clinic, one per block and floor */
  const placeLine = (ps) => [...new Set(ps.map((p) => p.b.name + (/^Сграда/.test(p.floor) ? '' : ' · ' + p.floor)))];
  const PL_IC = { er: '<path d="M12 4v16M4 12h16"/>', lab: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>', bed: '<path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>', pay: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>', doc: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>', scan: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M8 10h8"/>', pill: '<rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M9.5 9.5l5 5"/>', park: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>' };
  /** the real streets (OpenStreetMap, osm-isul.js) drawn into the plan: metres → the board's pixel space with the inverse of
      the affine fit used for the 3D view; built once, only the pieces inside the plan */
  let plRoads = null, plRoadNames = '';
  const roadsSvg = () => {
    if (plRoads !== null) return plRoads;
    const O = window.ISUL_OSM; if (!O) return (plRoads = '');
    const [a, b, c] = O.geo.cx, [d, e, f] = O.geo.cy, det = a * e - b * d;
    const toPx = ([X, Y]) => [(e * (X - c) - b * (Y - f)) / det, (-d * (X - c) + a * (Y - f)) / det];
    const inV = ([x, y]) => x > -200 && x < 2100 && y > -100 && y < 1500;
    const k = Math.hypot(a, d);   // metres per board pixel
    let casing = '', fill = '', names = '';
    const inPlan = ([x, y]) => x > 300 && x < 1600 && y > 200 && y < 1230;   // names away from the edges, so none is cut off
    O.streets.forEach((st) => {
      let best = null;   // the longest straight piece of the street inside the plan carries its name
      st.s.forEach((w) => {
        const ps = w.p.map(toPx); if (!ps.some(inV)) return;
        const dd = 'M' + ps.map(([x, y]) => x.toFixed(0) + ' ' + y.toFixed(0)).join('L'), wd = Math.max(6, w.w / k * 0.6);
        casing += `<path d="${dd}" stroke-width="${(wd + 6).toFixed(0)}"/>`; fill += `<path d="${dd}" stroke-width="${wd.toFixed(0)}"/>`;
        if (st.n) for (let i = 1; i < ps.length; i++) { const p0 = ps[i - 1], p1 = ps[i], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2]; if (inPlan(m) && (!best || L > best.L)) best = { L, m, a: Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math.PI }; }
      });
      if (best && best.L > 120) { let ang = best.a; if (ang > 90) ang -= 180; if (ang < -90) ang += 180; names += `<text class="pl-street" x="${best.m[0].toFixed(0)}" y="${best.m[1].toFixed(0)}" dy="10" transform="rotate(${ang.toFixed(1)} ${best.m[0].toFixed(0)} ${best.m[1].toFixed(0)})" text-anchor="middle">${esc(/^(бул|ул)\./.test(st.n) ? st.n : 'ул. ' + st.n)}</text>`; }
    });
    plRoadNames = names;
    return (plRoads = `<g class="pl-road-c">${casing}</g><g class="pl-road">${fill}</g>`);
  };
  /** the plan: the board's layout, simplified; `hi` = block ids to highlight, `park` = show the parking pins strongly */
  function planSvg({ hi = [], park = false, small = false, label = '', tags = [] } = {}) {
    if (!PL) return '';
    const H = new Set(hi.map(Number)), any = H.size > 0;
    const pts = (p) => p.map(([x, y]) => x + ',' + y).join(' ');
    const g = PL.green.map((p) => `<polygon points="${pts(p)}" class="pl-green"/>`).join('');
    const t = PL.tech.map((p) => `<polygon points="${pts(p)}" class="pl-tech"/>`).join('');
    // street names follow the real streets when the OpenStreetMap data is loaded, else the board's labels
    const roads = roadsSvg();
    const st = small ? '' : (plRoadNames || PL.streets.map(([x, y, s, r]) => `<text class="pl-street" x="${x}" y="${y}" transform="rotate(${r} ${x} ${y})" text-anchor="middle">${esc(s)}</text>`).join(''));
    const bl = PL.blocks.map((b) => { const on = H.has(b.id), dim = any && !on; return `<g class="pl-b pl-b--${b.kind}${on ? ' is-on' : ''}${dim ? ' is-dim' : ''}" data-b="${b.id}"${small ? '' : ` tabindex="0" role="button" aria-label="${esc(b.id + '. ' + b.name)}"`}><polygon points="${pts(b.poly)}"/><circle cx="${b.c[0]}" cy="${b.c[1]}" r="${on ? 40 : 30}"/><text x="${b.c[0]}" y="${b.c[1] + (on ? 15 : 11)}" text-anchor="middle">${b.id}</text></g>`; }).join('');
    // a pill with what is there, above the highlighted building
    const tg = small ? '' : tags.map(({ b, t: txt }) => { const B = plBlock(b); if (!B) return ''; const t = txt.length > 34 ? txt.slice(0, 33) + '…' : txt, w = t.length * 17 + 44, [x, y] = B.c, x0 = Math.max(75, Math.min(x - w / 2, 1830 - w));   // kept inside the plan
      return `<g class="pl-tag"><rect x="${x0}" y="${y - 108}" width="${w}" height="54" rx="27"/><path d="M${x - 12} ${y - 55}l12 14 12-14z"/><text x="${x0 + w / 2}" y="${y - 72}" text-anchor="middle">${esc(t)}</text></g>`; }).join('');
    const pk = PL.parking.map(([x, y]) => `<g class="pl-park${park ? ' is-on' : ''}"><rect x="${x - 26}" y="${y - 30}" width="52" height="60" rx="10"/><text x="${x}" y="${y + 18}" text-anchor="middle">P</text></g>`).join('');
    const [ex, ey] = PL.entrance, [rx, ry] = PL.er;
    const marks = `<g class="pl-er"><circle cx="${rx}" cy="${ry}" r="34"/><path d="M${rx} ${ry - 18}v36M${rx - 18} ${ry}h36"/></g>${small ? '' : `<g class="pl-in"><circle cx="${ex}" cy="${ey}" r="16"/><text x="${ex + 26}" y="${ey + 52}">Вход · ул. „Бяло море“ № 8</text></g>`}`;
    return `<svg class="pl-svg${small ? ' pl-svg--s' : ''}" viewBox="${PL.view}" role="img" aria-label="${esc(label || 'Схема на болничния комплекс')}"><rect x="40" y="100" width="1820" height="1200" class="pl-bg"/>${g}${roads}${t}${bl}${st}${pk}${marks}${tg}<g class="pl-n" transform="translate(1720 230)"><circle r="44"/><path d="M0 -26 12 14 0 6 -12 14z"/><text y="38" text-anchor="middle">С</text></g></svg>`;
  }
  /** 3D view of the hospital in its real neighbourhood: streets and buildings from OpenStreetMap (osm-isul.js, ~1.6 × 1.3 km),
      the hospital blocks from the board (places.js) placed with the affine fit `geo` — schematic. Canvas, no libraries.
      Drag to turn, wheel or +/− to zoom (towards the pointer), slow turn around the hospital until the first touch.
      Returns { set(hi) } to highlight blocks; `onPick(blockId)` when a hospital block is clicked. */
  function view3d(host, onPick) {
    const O = window.ISUL_OSM; if (!O || !PL) return null;
    const G = O.geo, toM = ([x, y]) => [G.cx[0] * x + G.cx[1] * y + G.cx[2], G.cy[0] * x + G.cy[1] * y + G.cy[2]];
    const cen = (p) => [p.reduce((n, q) => n + q[0], 0) / p.length, p.reduce((n, q) => n + q[1], 0) / p.length];
    const FL = 3.4, LEV = { 1: 5, 2: 5, 3: 4, 4: 4, 5: 5 };   // floors above ground, as listed on the board
    const isul = PL.blocks.map((b) => { const p = b.poly.map(toM); return { id: b.id, name: b.name, p, h: (LEV[b.id] || 2) * FL, c: toM(b.c), m: cen(p), kind: b.kind }; });
    const DEF = { apartments: 5, residential: 5, office: 6, commercial: 3, retail: 2, house: 2, detached: 2, semidetached_house: 2, warehouse: 1.5, industrial: 1.5, construction: 1, garage: 1, garages: 1, shed: 1, church: 4, school: 3 };
    const others = O.buildings.map((b) => ({ p: b.p, h: b.h || (b.l || DEF[b.k] || 3) * FL, m: cen(b.p) }));
    host.innerHTML = `<canvas class="k3__cv" aria-label="3D изглед на болницата и квартала" role="img"></canvas>
      <div class="k3__ctl"><button type="button" data-r="-1" aria-label="Завърти наляво">↺</button><button type="button" data-r="1" aria-label="Завърти надясно">↻</button><button type="button" data-z="1" aria-label="Приближи">+</button><button type="button" data-z="-1" aria-label="Отдалечи">−</button><button type="button" data-home aria-label="Към болницата">⌂</button><button type="button" data-fs aria-label="Цял екран">⛶</button></div>
      <p class="k3__hint"><span>Плъзгане — местене</span><span>Колелце — мащаб</span><span>Десен бутон или Ctrl + плъзгане — завъртане и наклон</span><span>Двоен клик — по-близо</span><small class="k3__osm">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></small></p>
      <p class="k3__two" hidden>Използвайте два пръста, за да местите картата</p>`;
    const cv = $('canvas', host), ctx = cv.getContext('2d');
    const pts5 = isul.filter((b) => b.kind === 'block').flatMap((b) => b.p);
    const HX0 = pts5.reduce((n, p) => n + p[0], 0) / pts5.length, HY0 = pts5.reduce((n, p) => n + p[1], 0) / pts5.length;
    const RAD = Math.max(...isul.flatMap((b) => b.p).map(([x, y]) => Math.hypot(x - HX0, y - HY0)));
    let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), CX = HX0, CY = HY0, yaw = -0.35, tilt = 0.95, hi = new Set(), raf = 0, tgtYaw = null;
    // the view opens a little wider than the hospital, so the neighbourhood around it reads as a map
    const Z0 = innerWidth < 600 ? 1.15 : 0.82;
    let zoom = Z0, spin = !reduce, visible = true, lastT = 0;
    const R0 = 1100;   // stay within the downloaded area (metres from the hospital)
    const kOf = () => Math.min(W, H * 1.45) / (RAD * 2.5) * zoom;
    const proj = (x, y, z = 0) => {
      const dx = x - CX, dy = y - CY, c = Math.cos(yaw), s = Math.sin(yaw), k = kOf();
      const u = dx * c - dy * s, v = dx * s + dy * c;
      return [W / 2 + u * k, H * 0.56 - v * k * Math.cos(tilt) - z * k * Math.sin(tilt), v];
    };
    // screen → ground (z = 0), for zooming towards the pointer
    const unproj = (X, Y) => { const k = kOf(), c = Math.cos(yaw), s = Math.sin(yaw), u = (X - W / 2) / k, v = -(Y - H * 0.56) / (k * Math.cos(tilt)); return [CX + u * c + v * s, CY - u * s + v * c]; };
    const ptIn = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
    let roofs = [];
    function prism(b, roof, wall, wallD, stroke) {
      const base = b.p.map(([x, y]) => proj(x, y, 0)), top = b.p.map(([x, y]) => proj(x, y, b.h));
      const faces = b.p.map((p, i) => { const j = (i + 1) % b.p.length; return { i, j, d: (base[i][2] + base[j][2]) / 2 }; }).sort((a, c) => c.d - a.d);
      faces.forEach(({ i, j }) => {
        ctx.beginPath(); ctx.moveTo(base[i][0], base[i][1]); ctx.lineTo(base[j][0], base[j][1]); ctx.lineTo(top[j][0], top[j][1]); ctx.lineTo(top[i][0], top[i][1]); ctx.closePath();
        const ex = b.p[j][0] - b.p[i][0], ey = b.p[j][1] - b.p[i][1], lit = (ex * 0.6 + ey * 0.8) / (Math.hypot(ex, ey) || 1);
        ctx.fillStyle = lit > 0 ? wall : wallD; ctx.fill();
      });
      ctx.beginPath(); top.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
      ctx.fillStyle = roof; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
      return top;
    }
    const onScreen = ([x, y], m = 80) => x > -m && x < W + m && y > -m - 120 && y < H + m;
    function draw() {
      if (!W) return;
      const k = kOf();
      ctx.fillStyle = '#F1ECE7'; ctx.fillRect(0, 0, W, H);
      const ground = (pts, fill) => { ctx.beginPath(); pts.forEach(([x, y], i) => { const [a, b] = proj(x, y); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); }); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
      O.green.forEach((g) => ground(g, '#DDE6D5'));
      if (O.area) ground(O.area, '#F3E3EA');
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#fff';
      O.streets.forEach((st) => st.s.forEach((w) => { ctx.beginPath(); w.p.forEach(([x, y], i) => { const [a, b] = proj(x, y); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); }); ctx.lineWidth = Math.max(1, w.w * k * 0.55); ctx.stroke(); }));
      // street names: on the longest piece of each named street, only when they fit
      ctx.font = `600 ${Math.round(Math.max(10, Math.min(13, 9 + k * 1.2)))}px Onest, system-ui, sans-serif`; ctx.fillStyle = '#8E8489'; ctx.textAlign = 'center';
      O.streets.forEach((st) => { if (!st.n) return; const w = st.s.slice().sort((a, b) => b.p.length - a.p.length)[0], m = w.p[Math.floor(w.p.length / 2)], [a, b] = proj(m[0], m[1]); if (a > 30 && a < W - 30 && b > 18 && b < H - 18) ctx.fillText(st.n, a, b - 4); });
      // buildings far → near; only those on screen; the hospital in colour
      const any = hi.size > 0;
      const list = [];
      others.forEach((b) => { const p = proj(b.m[0], b.m[1]); if (onScreen(p)) list.push({ b, d: p[2], o: 1 }); });
      isul.forEach((b) => list.push({ b, d: proj(b.m[0], b.m[1])[2], o: 0 }));
      list.sort((a, c) => c.d - a.d);
      roofs = [];
      list.forEach(({ b, o }) => {
        if (o) { prism(b, '#E6E1DD', '#D9D3CF', '#CBC4BF'); return; }
        const on = hi.has(b.id), dim = any && !on;
        const top = prism(b, on ? '#9D305C' : dim ? '#E9DDE3' : (b.kind === 'block' ? '#D4BCC8' : '#E0D2D9'), on ? '#782B4A' : dim ? '#DCCDD4' : '#C2A6B4', on ? '#5E1F38' : dim ? '#CFBEC6' : '#A98B9A', '#fff');
        roofs.push({ id: b.id, top });
      });
      isul.forEach((b) => {
        const on = hi.has(b.id), [a, c] = proj(b.c[0], b.c[1], b.h), r = on ? 15 : 11;
        ctx.beginPath(); ctx.arc(a, c, r, 0, 7); ctx.fillStyle = on ? '#fff' : any ? '#A89BA1' : '#2B1E24'; ctx.fill();
        ctx.font = `700 ${on ? 14 : 11}px Onest, system-ui, sans-serif`; ctx.fillStyle = on ? '#782B4A' : '#fff'; ctx.textAlign = 'center'; ctx.fillText(String(b.id), a, c + (on ? 5 : 4));
        if (on) { ctx.font = '700 12px Onest, system-ui, sans-serif'; const w2 = ctx.measureText(b.name).width + 18; ctx.fillStyle = '#782B4A'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(a - w2 / 2, c - 44, w2, 24, 12) : ctx.rect(a - w2 / 2, c - 44, w2, 24); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(b.name, a, c - 28); }
      });
      const [ex, ey] = proj(...toM(PL.entrance)); ctx.beginPath(); ctx.arc(ex, ey, 7, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#782B4A'; ctx.stroke();
      ctx.font = '700 12px Onest, system-ui, sans-serif'; ctx.fillStyle = '#782B4A'; ctx.textAlign = 'left'; ctx.fillText(W < 500 ? 'Вход' : 'Вход · ул. „Бяло море“ № 8', ex + 12, ey + 4);
      ctx.save(); ctx.translate(W - 34, 34); ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.rotate(-yaw); ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(6, 6); ctx.lineTo(0, 2); ctx.lineTo(-6, 6); ctx.closePath(); ctx.fillStyle = '#2B1E24'; ctx.fill(); ctx.restore();
      ctx.font = '700 10px Onest, sans-serif'; ctx.fillStyle = '#2B1E24'; ctx.textAlign = 'center'; ctx.fillText('С', W - 34, 64);
    }
    // one loop: the slow turn on opening, eased turns from the buttons
    const loop = (t) => {
      raf = 0;
      const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0; lastT = t;
      let again = false;
      if (tgtYaw !== null) { const d = tgtYaw - yaw; yaw += d * 0.18; if (Math.abs(d) < 0.002) { yaw = tgtYaw; tgtYaw = null; } else again = true; }
      else if (spin && visible) { yaw += dt * 0.12; again = true; }
      draw();
      if (again) raf = requestAnimationFrame(loop); else lastT = 0;
    };
    const kick = () => { if (!raf) { lastT = 0; raf = requestAnimationFrame(loop); } };
    const stop = () => { spin = false; };
    // zoom by a factor towards a screen point (keeps that point under the pointer)
    const zoomAt = (f, X = W / 2, Y = H * 0.56) => {
      const before = unproj(X, Y); zoom = Math.max(0.25, Math.min(9, zoom * f)); const after = unproj(X, Y);
      CX += before[0] - after[0]; CY += before[1] - after[1]; clampC(); draw();
    };
    host.addEventListener('click', (e) => {
      const b = e.target.closest('[data-r],[data-z],[data-home],[data-fs]'); if (!b) return; stop();
      if (b.dataset.r) { tgtYaw = (tgtYaw ?? yaw) + b.dataset.r * Math.PI / 4; kick(); }
      else if (b.dataset.z) zoomAt(b.dataset.z > 0 ? 1.3 : 1 / 1.3);
      else if (b.hasAttribute('data-home')) { CX = HX0; CY = HY0; zoom = Z0; tilt = 0.95; draw(); }
      else if (b.hasAttribute('data-fs')) { const el = host; if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen(); }
    });
    cv.addEventListener('wheel', (e) => { e.preventDefault(); stop(); const r = cv.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    /* Moving around as in Google Maps:
       mouse — drag moves the map, wheel zooms towards the pointer, double-click zooms in,
               right button / Ctrl / Shift + drag turns (sideways) and tilts (up–down);
       touch — one finger scrolls the page (a hint asks for two), two fingers move, pinch to zoom and twist to turn;
       keyboard — arrows move, + / − zoom, Q / E turn. */
    function clampC() { const dx = CX - HX0, dy = CY - HY0, d = Math.hypot(dx, dy); if (d > R0) { CX = HX0 + dx / d * R0; CY = HY0 + dy / d * R0; } }
    const panBy = (ax, ay, bx, by) => { const a = unproj(ax, ay), b = unproj(bx, by); CX += a[0] - b[0]; CY += a[1] - b[1]; clampC(); };
    const pts = new Map(); let gest = null, moved = false, hintT = 0;
    const loc = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const twoHint = () => { const h = $('.k3__two', host); if (!h) return; h.hidden = false; clearTimeout(hintT); hintT = setTimeout(() => { h.hidden = true; }, 1600); };
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    cv.addEventListener('pointerdown', (e) => {
      stop(); pts.set(e.pointerId, loc(e)); moved = false;
      if (e.pointerType === 'touch' && pts.size === 1) { gest = { touch1: true, at: loc(e) }; return; }   // one finger: let the page scroll
      cv.setPointerCapture(e.pointerId);
      if (pts.size === 2) { const [a, b] = [...pts.values()]; gest = { two: true, d: Math.hypot(b[0] - a[0], b[1] - a[1]), ang: Math.atan2(b[1] - a[1], b[0] - a[0]), mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; return; }
      const turn = e.button === 2 || e.ctrlKey || e.shiftKey || e.metaKey;
      gest = { turn, last: loc(e), y0: yaw, t0: tilt, at: loc(e) };
      cv.classList.add(turn ? 'is-turn' : 'is-pan');
    });
    cv.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId) || !gest) return;
      const p = loc(e); pts.set(e.pointerId, p);
      if (gest.touch1) { if (Math.hypot(p[0] - gest.at[0], p[1] - gest.at[1]) > 12) { moved = true; twoHint(); } return; }
      if (gest.two && pts.size >= 2) {
        const [a, b] = [...pts.values()], d = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        panBy(gest.mid[0], gest.mid[1], mid[0], mid[1]);
        yaw -= ang - gest.ang;
        zoomAt(d / (gest.d || d), mid[0], mid[1]);
        Object.assign(gest, { d, ang, mid }); moved = true; return;
      }
      if (Math.hypot(p[0] - gest.at[0], p[1] - gest.at[1]) > 4) moved = true;
      if (!moved) return;
      if (gest.turn) { yaw = gest.y0 + (p[0] - gest.at[0]) / 180; tilt = Math.max(0.35, Math.min(1.35, gest.t0 - (p[1] - gest.at[1]) / 260)); }
      else panBy(gest.last[0], gest.last[1], p[0], p[1]);
      gest.last = p; draw();
    });
    const end = (e) => {
      const was = gest; pts.delete(e.pointerId); cv.classList.remove('is-pan', 'is-turn');
      if (pts.size === 1 && was && was.two) { const [a] = [...pts.values()]; gest = { turn: false, last: a, at: a, y0: yaw, t0: tilt }; return; }
      if (pts.size) return;
      gest = null;
      if (!was || moved || e.type === 'pointercancel') return;
      const pt = loc(e);
      for (let i = roofs.length - 1; i >= 0; i--) if (ptIn(pt, roofs[i].top)) { if (onPick) onPick(roofs[i].id); return; }
    };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    cv.addEventListener('dblclick', (e) => { e.preventDefault(); const p = loc(e); zoomAt(e.shiftKey ? 1 / 1.8 : 1.8, p[0], p[1]); });
    cv.tabIndex = 0;
    cv.addEventListener('keydown', (e) => {
      const step = 60, k = e.key; let used = true; stop();
      if (k === 'ArrowLeft') panBy(W / 2, H / 2, W / 2 + step, H / 2); else if (k === 'ArrowRight') panBy(W / 2, H / 2, W / 2 - step, H / 2);
      else if (k === 'ArrowUp') panBy(W / 2, H / 2, W / 2, H / 2 + step); else if (k === 'ArrowDown') panBy(W / 2, H / 2, W / 2, H / 2 - step);
      else if (k === '+' || k === '=') zoomAt(1.3); else if (k === '-') zoomAt(1 / 1.3);
      else if (k === 'q' || k === 'Q') yaw -= Math.PI / 16; else if (k === 'e' || k === 'E') yaw += Math.PI / 16;
      else used = false;
      if (used) { e.preventDefault(); draw(); }
    });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && spin) kick(); }).observe(cv);
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); };
    new ResizeObserver(size).observe(cv); size(); kick();
    return { set(ids) { hi = new Set((ids || []).map(Number)); draw(); } };
  }

  /** a clinic's „Къде се намира“ section (variant X clinic pages) */
  function whereSection(cid, A) {
    const ps = placesOf(cid); if (!ps.length) return '';
    const blocks = [...new Set(ps.map((p) => p.b.id).concat(ps.map((p) => p.via).filter(Boolean)))];   // and the block you enter through
    const rows = ps.map((p) => `<li><span class="kx-wh__n">${p.b.id}</span><span><b>${esc(p.b.name)}${/^Сграда/.test(p.floor) ? '' : ' · ' + esc(p.floor)}</b><small>${esc(p.label)}</small>${p.note ? `<em>${esc(p.note)}</em>` : ''}</span></li>`).join('');
    return `<section class="kx-sec kx-wh" id="kx-where"><div class="vwrap kx-wh__g">
      <div>${'<p class="kx-kick">Къде се намира</p>'}<h2 class="kx-h2">${esc(placeLine(ps)[0])}</h2>
        <ul class="kx-wh__list">${rows}</ul>
        <div class="kx-wh__act"><a class="kx-btn kx-btn--d" href="#/kade/c${cid}">Покажи на картата ${A}</a><a class="kx-btn kx-btn--l" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('УМБАЛ Царица Йоанна ИСУЛ, ул. Бяло море 8, София')}" target="_blank" rel="noopener">Google Maps ↗</a></div>
        <p class="kx-wh__src">${PL.confirmed && PL.confirmed[cid] ? 'Мястото е потвърдено.' : esc(PL.source)} Вход за пациенти — от ул. „Бяло море“ № 8. За маршрута вътре в сградата питайте на регистратурата: <a href="${telOf('02 9432 170')}">02 9432 170</a>.</p></div>
      <a class="kx-wh__map" href="#/kade/c${cid}" aria-label="Отвори картата на болницата">${planSvg({ hi: blocks, small: true, label: 'Схема: ' + placeLine(ps).join(', ') })}</a>
    </div></section>`;
  }
  /** #/kade — „Къде да отида?“ */
  /** the hospital map of „Къде да отида?“ — goals, search, plan / 3D and the information screen; also on „Контакти“
      (full = false: without the list by building, with a link to the whole page instead) */
  function whereBody(full = true) {
    const A = IC.arrow;
    const goalHtml = PL.goals.map((g) => `<button type="button" class="kd-goal" data-go="${g.k}" aria-pressed="false"><span class="kd-goal__ic"><svg viewBox="0 0 24 24" aria-hidden="true">${PL_IC[g.ic]}</svg></span><b>${esc(g.t)}</b><small>${esc(g.p)}</small></button>`).join('');
    const byBlock = PL.blocks.filter((b) => PL.floors[b.id]).map((b) => `<details class="kd-bl" data-bl="${b.id}"><summary><span class="kx-wh__n">${b.id}</span><b>${esc(b.name)}</b><small>${PL.floors[b.id].length > 1 ? PL.floors[b.id].length + ' нива' : ''}</small></summary>
      <div class="kd-bl__fl">${PL.floors[b.id].map(([f, items]) => `<div><h4>${esc(f)}</h4><ul>${items.map(([l, id]) => `<li>${id ? `<a href="#/clinic/${id}">${esc(l)}</a>` : esc(l)}</li>`).join('')}</ul></div>`).join('')}</div></details>`).join('');
    return `<div class="kx kd"><section class="kx-sec"><div class="vwrap">
        <div class="kd-goals" role="group" aria-label="Най-често търсено">${goalHtml}</div>
        <div class="kd-main">
          <div class="kd-map">
            <div class="kd-bar"><div class="kd-mode" role="group" aria-label="Изглед"><button type="button" data-mode="2d" aria-pressed="true">План</button>${window.ISUL_OSM ? '<button type="button" data-mode="3d" aria-pressed="false">3D</button>' : ''}</div>
              <div class="kd-findw"><div class="kx-find"><span>${ICON.search}</span><label class="vh" for="kd-q">Търси клиника или отделение</label><input id="kd-q" type="search" placeholder="Търси клиника или отделение…" autocomplete="off"></div><ul class="kd-sug" id="kd-sug" hidden></ul></div></div>
            <div id="kd-map"></div><div class="k3" id="kd-3d" hidden></div>
            <p class="kd-tip">Изберете сграда на схемата — <span class="kd-tip__w">вляво</span><span class="kd-tip__n">отдолу</span> ще видите какво има на всеки етаж.</p>
          </div>
          <aside class="kd-res" id="kd-res" aria-live="polite"></aside>
        </div>
        ${full ? `<div class="kd-blocks"><div class="kx-head"><div><p class="kx-kick">По сгради</p><h2 class="kx-h2">Какво има във всеки блок</h2><p>Етажите, както са изписани на табелата пред болницата.</p></div></div>${byBlock}</div>` : `<p class="kd-more"><a class="kx-link" href="#/kade">Цялата карта — какво има във всеки блок и етаж ${A}</a></p>`}
        <p class="kd-note"><b>Важно</b><span>${esc(PL.source)} Маршрутите вътре в сградите, асансьорите и достъпните входове не са отбелязани — питайте на регистратурата: <a href="${telOf('02 9432 170')}">02 9432 170</a>. При спешност — <a href="tel:112">112</a>.</span></p>
      </div></section></div>`;
  }
  function wherePage(key = '') {
    if (!PL) return notFound();
    HX.sec = sectionOf('patient'); HX.cur = 'kade';
    const html = hero('Къде да отида?', [['За пациента', '#/patient'], ['Къде да отида?']], 'Изберете какво търсите — ще видите сградата и етажа. По информационната табела пред болницата.') + whereBody();
    return { title: 'Къде да отида?', html, desc: 'Сгради и етажи на УМБАЛ „Царица Йоанна – ИСУЛ“ — къде е Спешно отделение, лабораторията, касата и всяка клиника.', init: () => whereInit(key) };
  }
  // route = false on „Контакти“: a choice does not rewrite the address to #/kade/…
  function whereInit(key, route = true) {
    const root = page, map = $('#kd-map', root), res = $('#kd-res', root), q = $('#kd-q', root), sug = $('#kd-sug', root), A = IC.arrow;
    // План | 3D в квартала: the 3D view is built the first time it is opened and follows every choice after that
    const s3 = $('#kd-3d', root); let v3 = null, last = [];
    $$('[data-mode]', root).forEach((b) => b.addEventListener('click', () => {
      const three = b.dataset.mode === '3d';
      $$('[data-mode]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      map.hidden = three; s3.hidden = !three;
      if (three && !v3) v3 = view3d(s3, (id) => go('b' + id));
      if (v3) v3.set(last);
    }));
    // everything that can be found: goals, clinics on the board, every listed label, blocks
    const all = [];
    Object.entries(PL.floors).forEach(([bid, fl]) => fl.forEach(([floor, items]) => items.forEach(([label, id, note, via]) => all.push({ b: plBlock(bid), floor, label, id, note, via }))));
    const flShort = (f) => f.replace(/^(\d) етаж$/, '$1 ет.');
    // one building as a stack of floors, top floor first; the found entries and their floors stand out,
    // the other floors shrink to one line, so what you look for is in view at once
    const stack = (bid, ps) => {
      const b = plBlock(bid), fl = PL.floors[bid], on = new Set(ps.map((p) => p.b.id + '|' + p.floor + '|' + p.label)), onFl = new Set(ps.filter((p) => p.b.id === +bid).map((p) => p.floor));
      if (!fl) return `<div class="kd-bk"><header><span class="kx-wh__n">${b.id}</span><b>${esc(b.name)}</b></header><p class="kd-p">Обектът е отбелязан на табелата без разбивка по етажи. Подробности — на централата: <a href="tel:+35929432170">02 9432 170</a>.</p></div>`;
      return `<div class="kd-bk"><header><span class="kx-wh__n">${b.id}</span><b>${esc(b.name)}</b><small>${fl.length > 1 ? fl.length + ' нива' : ''}</small></header>
        <ol class="kd-fls">${fl.slice().reverse().map(([f, items]) => `<li class="kd-fl${onFl.has(f) ? ' is-on' : onFl.size ? ' is-min' : ''}"><span class="kd-fl__n">${esc(/^Сграда/.test(f) ? 'Сграда' : flShort(f))}</span><ul>${items.map(([l, id, note]) => { const hit = on.has(b.id + '|' + f + '|' + l); return `<li${hit ? ' class="is-hit"' : ''}>${id ? `<a href="#/clinic/${id}">${esc(l)}</a>` : esc(l)}${hit && note ? `<em>${esc(note)}</em>` : ''}</li>`; }).join('')}</ul></li>`).join('')}</ol></div>`;
    };
    const show = (title, sub, ps, opts = {}) => {
      const hi = [...new Set(ps.map((p) => p.b.id).concat(ps.map((p) => p.via).filter(Boolean)))].concat(opts.hi || []);
      last = hi;
      // on the plan: a tag with what is there, not only the number of the building
      const tags = opts.hi && !ps.length ? hi.map((b) => ({ b, t: plBlock(b).name })) : [...new Set(ps.map((p) => p.b.id))].map((b) => { const here = ps.filter((p) => p.b.id === b), f = [...new Set(here.map((p) => flShort(p.floor)))].filter((x) => !/^Сграда/.test(x)); return { b, t: (here.length === 1 ? here[0].label : title).replace(/^Клиника по /, '') + (f.length ? ' · ' + f.join(', ') : '') }; });
      map.innerHTML = planSvg({ hi, park: !!opts.park, label: title, tags });
      if (v3) v3.set(hi);
      const lines = placeLine(ps);
      // one information screen beside the map: what you are looking for and where it is → what is on every floor → help
      res.innerHTML = `<div class="kd-info">
        <header class="kd-info__h"><p class="kx-kick kx-kick--g">${esc(sub)}</p><h2>${esc(title)}</h2>${lines.length && !opts.hi ? `<ul class="kd-info__at">${lines.map((l) => `<li>${IC.pin}<span>${esc(l)}</span></li>`).join('')}</ul>` : ''}${opts.extra ? `<div class="kd-info__x">${opts.extra}</div>` : ''}</header>
        <div class="kd-info__b">${hi.map((b) => stack(b, ps)).join('') || ''}</div>
        <footer class="kd-info__f"><span>Вход за пациенти — от ул. „Бяло море“ № 8.</span><span>Не намирате? Регистратура: <a href="tel:+35929432170">02 9432 170</a></span></footer>
      </div>`;
      // the floor you are looking for comes into view inside the screen (the building is listed top floor first)
      const hit = $('.kd-fl.is-on', res); res.scrollTop = 0;
      if (hit && res.scrollHeight > res.clientHeight) res.scrollTop = Math.max(0, hit.offsetTop - res.clientHeight / 2 + hit.offsetHeight / 2);
      bindMap();
    };
    const goal = (k) => {
      const g = PL.goals.find((x) => x.k === k); if (!g) return false;
      const ps = g.at.map(([bid, fl, lab]) => all.find((p) => p.b.id === bid && p.floor === fl && p.label === lab)).filter(Boolean);
      show(g.t, 'Къде да отида', ps, { park: g.park, extra: g.park ? '<p class="kd-p">Паркингите са отбелязани на схемата със синьо „P“. За свободни места и условия — на централата: <a href="tel:+35929432170">02 9432 170</a>.</p>' : g.tel ? `<p class="kd-p"><a class="kx-btn kx-btn--d" href="${telOf(g.tel)}">${IC.phone}${esc(g.tel)}</a></p>` : '' });
      $$('.kd-goal', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.go === k)));
      return true;
    };
    const notOn = `<p class="kd-p">Не е отбелязано на табелата пред болницата. Попитайте на регистратурата: <a href="tel:+35929432170">02 9432 170</a>.</p>`;
    let unitGo = () => false;
    const clinic = (cid) => { const c = C.clinics[cid], ps = all.filter((p) => p.id === +cid); if (!c) return false; show(c.name, 'Клиника', ps, { extra: `<p class="kd-p"><a class="kx-link" href="#/clinic/${cid}">Страницата на клиниката ${A}</a></p>${ps.length ? '' : notOn}` }); $$('.kd-goal', root).forEach((b) => b.setAttribute('aria-pressed', 'false')); return true; };
    const block = (bid) => { const b = plBlock(bid); if (!b) return false; show(b.name, (b.kind === 'block' ? 'Блок ' + b.id : 'Сграда ' + b.id) + ' · какво има на всеки етаж', [], { hi: [b.id] }); $$('.kd-goal', root).forEach((x) => x.setAttribute('aria-pressed', 'false')); const d = $(`.kd-bl[data-bl="${b.id}"]`, root); if (d) d.open = true; return true; };
    // a single board entry („Болнична каса“, „Катедра по неврология“…)
    const one = (i) => { const p = all[+i]; if (!p) return false; show(p.label, p.b.name, [p]); $$('.kd-goal', root).forEach((x) => x.setAttribute('aria-pressed', 'false')); return true; };
    const go = (k, push = true) => { const ok = /^c\d+$/.test(k) ? clinic(k.slice(1)) : /^u\d+:/.test(k) ? unitGo(k.slice(1)) : /^b\d+$/.test(k) ? block(k.slice(1)) : /^p\d+$/.test(k) ? one(k.slice(1)) : goal(k); if (ok && push && route) { try { history.replaceState(null, '', '#/kade/' + k); } catch (e) { /* sandbox */ } } return ok; };
    function bindMap() { $$('.pl-b', map).forEach((g) => { const f = () => { go('b' + g.dataset.b); if (innerWidth <= 860) res.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }; g.addEventListener('click', f); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } }); }); }
    // after a choice the map and the information screen come fully into view (on a phone: the information below the map)
    const toMain = () => { if (innerWidth <= 860) { res.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); return; } const m = $('.kd-main', root), t = m.getBoundingClientRect().top; if (t < 70 || t > innerHeight * 0.35) scrollTo({ top: t + scrollY - 90, behavior: reduce ? 'auto' : 'smooth' }); };
    $$('.kd-goal', root).forEach((b) => b.addEventListener('click', () => { go(b.dataset.go); toMain(); }));
    // search: clinics and departments only (not buildings) — the map then shows where each one is
    // a department: its own place on the board (placesOfUnit), as entries of this page's list
    const unitPlaces = (u) => placesOfUnit(u).map((p) => all.find((q) => q.b.id === p.b.id && q.floor === p.floor && q.label === p.label)).filter(Boolean);
    const IX = clinicList().map((c) => { const ps = all.filter((p) => p.id === +c.id); return { k: 'c' + c.id, t: c.name, s: ps.length ? placeLine(ps).join('; ') : 'Не е на табелата', q: fold(c.name), kind: 'Клиника' }; })
      .concat(PP ? PP.units.map((u) => { const ps = unitPlaces(u); return { k: 'u' + u.clinic + ':' + u.slug, t: u.name, s: (ps.length ? placeLine(ps).join('; ') : 'Не е на табелата') + ' · ' + clinicShort(C.clinics[u.clinic]), q: fold(u.name + ' ' + C.clinics[u.clinic].name), kind: u.kind }; }) : []);
    // a department of a clinic: its own place on the board, highlighted on the plan
    unitGo = (key) => { const [cid, slug] = key.split(':'), u = PP && PP.unit(+cid, slug); if (!u) return false; const ps = unitPlaces(u); show(u.name, u.kind + ' · ' + clinicShort(C.clinics[u.clinic]), ps, { extra: `<p class="kd-p"><a class="kx-link" href="${unitUrl(u)}">Страницата на звеното ${A}</a></p>${ps.length ? '' : notOn}` }); $$('.kd-goal', root).forEach((b) => b.setAttribute('aria-pressed', 'false')); return true; };
    q.addEventListener('input', () => {
      const v = fold(q.value.trim()); if (v.length < 2) { sug.hidden = true; return; }
      const ts = v.split(/\s+/), hits = IX.filter((x) => ts.every((t) => x.q.includes(t))).slice(0, 8);
      sug.innerHTML = hits.length ? hits.map((x) => `<li><button type="button" data-k="${x.k}"><b>${esc(x.t)}</b><small>${esc(x.kind)} · ${esc(x.s)}</small></button></li>`).join('') : `<li class="kd-none">Няма клиника или отделение с това име. Попитайте на <a href="tel:+35929432170">02 9432 170</a>.</li>`;
      sug.hidden = false;
    });
    sug.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (!b) return; go(b.dataset.k); sug.hidden = true; q.value = ''; toMain(); });
    if (!(key && go(key, false))) go('er', false);
  }

  /** clinic and unit header: the plain burgundy page header of „Кариери“ (gradient, crown) with the clinic photo on the right */
  const kxHead = ({ crumbs: cr, kick: k = '', title, lead = '', cta = '', img = '', cap = '' }) => `<header class="pg-hero pg-hero--x kx-ph" style="--bg:none"><img class="pg-hero__crown" src="assets/brand/isul-crown-white.svg" alt="" aria-hidden="true"><div class="vwrap kx-ph__in">
      <div class="kx-ph__t">${crumbs(cr)}${k ? `<p class="kx-kick kx-kick--g">${esc(k)}</p>` : ''}<h1>${title}</h1>${lead ? `<p class="pg-lead">${esc(lead)}</p>` : ''}${cta}</div>
      ${img ? `<figure class="kx-ph__fig nwm"><img src="${esc(img)}" alt="">${cap}</figure>` : ''}
    </div></header>`;

  /* ---------- clinic and unit pages: a band of vertical videos, as in the Press centre ----------
     For now sample clips (PRESS_VIDEOS — the clips tagged for the clinic first) and the film „90 години“;
     to be replaced with videos filmed in each clinic. */
  const FILM90 = { src: 'assets/video/isul-90-1080.mp4', srcS: 'assets/video/isul-90-720.mp4', poster: 'assets/photos/film90/f2.jpg', t: '90 години УМБАЛ „Царица Йоанна – ИСУЛ“', p: 'ИСУЛ · 90', dur: '1:00' };
  const REEL_TAG = { 3: 'Кардиология', 8: 'Образна диагностика', 22: 'Лаборатории', 23: 'Лаборатории', 24: 'Лаборатории', 25: 'Лаборатории' };
  const reelsFor = (cid) => { const tag = REEL_TAG[cid]; return PRESS_VIDEOS.filter((v) => v.p === tag).concat([FILM90], PRESS_VIDEOS.filter((v) => v.p !== tag)).slice(0, 6); };
  const reelsBand = (cid, sid, name) => {
    const vs = reelsFor(cid);
    return `<section class="pc-video kx-reels" id="${sid}" aria-labelledby="${sid}-h"><div class="vwrap"><header class="pc-sec__h pc-sec__h--d"><h2 id="${sid}-h">Видео</h2><span>${vs.length}</span><a class="kx-reels__all" href="#/news">Всички видеа →</a></header>
      <div class="pc-vgrid">${vs.map((v) => `<button type="button" class="pc-v" data-reel="${esc(v.src)}"${v.srcS ? ` data-reel-s="${esc(v.srcS)}"` : ''} data-reel-t="${esc(v.t)}" data-reel-p="${esc(v.poster)}"><span class="pc-v__img"><img src="${esc(v.poster)}" alt="" loading="lazy"><i aria-hidden="true"></i><em>${esc(v.dur)}</em></span><span class="pc-meta"><span class="pc-rb pc-rb--video">Видео</span><time>${esc(v.p)}</time></span><b>${esc(v.t)}</b></button>`).join('')}</div>
      <p class="pc-note">Примерни видеа — ще бъдат заменени с видеа, заснети в ${esc(name)}.</p></div></section>`;
  };
  /** plays a reel in a dialog over the page (sized to the clip: upright clips get an upright frame) */
  function reelsBind(root) {
    if (root.dataset.reelBound) return; root.dataset.reelBound = '1';
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-reel]'); if (!b) return;
      const dlg = document.createElement('dialog'); dlg.className = 'film-lb'; dlg.setAttribute('aria-label', b.dataset.reelT || 'Видео');
      dlg.innerHTML = '<div class="film-lb__in"><button type="button" class="film-lb__x" aria-label="Затвори">×</button></div>';
      const v = document.createElement('video'); v.controls = true; v.playsInline = true; v.poster = b.dataset.reelP || '';
      v.src = b.dataset.reelS && !matchMedia('(min-width: 900px)').matches ? b.dataset.reelS : b.dataset.reel;
      v.addEventListener('loadedmetadata', () => { if (v.videoWidth && v.videoHeight) { dlg.style.setProperty('--ar', String(v.videoWidth / v.videoHeight)); dlg.classList.toggle('is-tall', v.videoHeight > v.videoWidth); } });
      $('.film-lb__in', dlg).appendChild(v); document.body.appendChild(dlg);
      dlg.addEventListener('click', (ev) => { if (ev.target === dlg || ev.target.closest('.film-lb__x')) dlg.close(); });
      dlg.addEventListener('close', () => { v.pause(); dlg.remove(); b.focus(); });
      dlg.showModal(); v.play().catch(() => { /* the controls stay */ });
    });
  }
  function clinicXPage(c0, id, tab) {
    const c1 = clinicRest(c0), c = { ...c1, blocks: noDop(c1.blocks), patient: noDop(c1.patient) };
    const A = IC.arrow;
    // #/clinic/<id>/nova — a calmer version of the page (fewer colours, no repeats), kept beside the current one to compare
    const CLEAN = /^nova/.test(tab || '');
    // three looks for the head's band, to choose from: #/clinic/<id>/nova-a | nova-b | nova-c
    const CHF = CLEAN ? ((tab.split('-')[1] || '').match(/^[abc]$/) || [''])[0] : '';
    // the Благоевград / НКБ order („Подредба“) is the clinic page; #/clinic/<id>/team and /patient open it at that
    // section; the earlier page stays at #/clinic/<id>/staro to compare
    const PODR = !tab || ['podredba', 'team', 'patient'].includes(tab);
    const isClinic = /^Клиника по /.test(c.name), shortN = clinicShort(c);
    const phones = (c.phones.join('; ') || '02 9432 170').split(/;|,| и /).map((x) => x.trim()).filter((x) => /\d{3}/.test(x));
    const tel1 = phones[0] || '02 9432 170';
    const allTxt = c.patient.concat(c.blocks).map((b) => b.x || '').join('\n');
    const visit = (allTxt.match(/Свиждане[^:\n]*:\s*([^\n]{4,80})/i) || [])[1] || '';
    // a short patient line such as „Западен блок 4“ is the location when the clinic has no floor
    const locLine = ((c.patient.find((b) => /^.{0,30}(блок|етаж).{0,10}$/i.test((b.x || '').trim()) && !/[.:]/.test(b.x || '')) || {}).x || '').trim();
    // the clinic's own text, as before; only where the place is confirmed (Спешно отделение: Западен блок, 1 етаж) the board comes first
    const floor = (PL && PL.confirmed && PL.confirmed[id] && placeLine(placesOf(id))[0]) || c.floor || (allTxt.match(/\b([IVXІ]{1,4}|\d+)\s*(?:-?ти|-?ри)?\s*етаж\b/i) || [])[0] || locLine;
    // the migrated text: a short lead, the rest split into titled sections (gallery images go to the gallery)
    // a bare location line („Западен блок 4“) is not the lead — the place comes from the board
    const cb = c.blocks.filter((b) => !(b.t === 'p' && locLine && (b.x || '').trim() === locLine));
    let first = cb.findIndex((b) => b.t !== 'p' || (b.links || []).length); if (first < 0) first = cb.length;
    let pre = cb.slice(0, Math.min(first, 3));
    // pieces of the old page with almost no text (a heading „„Академик Ташо Ташев““ with only „ет. 2“ under it) are left out
    let secs = sectionize(cb.slice(pre.length).filter((b) => b.t !== 'img')).filter((sc) => sc.items.some((b) => b.t === 'li') || sc.items.reduce((n, b) => n + (b.x || '').length, 0) >= 40);
    // a text that starts with a heading: its first real section is the description of the clinic
    if (!pre.length) { const k = secs.findIndex((sc) => !/галери/i.test(sc.title) && sc.items.filter((b) => b.t === 'p').length); if (k >= 0) { pre = secs[k].items.filter((b) => b.t === 'p'); secs = secs.filter((_, i) => i !== k).concat(secs[k].items.some((b) => b.t !== 'p') ? [{ ...secs[k], items: secs[k].items.filter((b) => b.t !== 'p') }] : []); } }
    const SG = SECTION_GROUPS[id];
    if (SG) {
      const T = (b) => (b.x || '').trim(), isLead = (b) => (SG.lead || []).some((re) => re.test(T(b)));
      const at = SG.groups.map(([re]) => cb.findIndex((b) => re.test(T(b))));
      if (at.every((k) => k >= 0)) {
        const stops = at.concat(cb.map((b, i) => ((SG.end || []).some((re) => re.test(T(b))) ? i : -1)).filter((i) => i >= 0));
        const shape = (b) => (SG.subs || []).some((re) => re.test(T(b))) ? { t: 'h', x: T(b) } : SG.dash && b.t === 'p' && /^[-–]\s+/.test(T(b)) ? { t: 'li', x: T(b).replace(/^[-–]\s+/, '') } : capsLine(b);
        pre = cb.filter(isLead).map((b) => ({ ...b, t: 'p' }));
        secs = SG.groups.map(([, title, drop], n) => { const end = Math.min(cb.length, ...stops.filter((p) => p > at[n]));
          return { title, items: cb.slice(at[n] + 1, end).filter((b) => b.t !== 'img' && !isLead(b) && !(drop && drop.test(T(b)))).map(shape) }; });
      }
    }
    const lead = pre[0] ? pre[0].x : '';
    let equip = null;
    secs.forEach((s) => { if (equip) return; const lis = s.items.filter((b) => b.t === 'li'); const ctx = (s.title + ' ' + s.items.filter((b) => b.t === 'p').map((b) => b.x).join(' ')).toLowerCase(); if (lis.length >= 4 && /оборудван|апарат|техника|апаратур/.test(ctx) && !/лекува|направлени|дейност|лечени/i.test(s.title || '')) { equip = lis; s.items = s.items.filter((b) => b.t !== 'li'); } });
    const acts = secs.filter((s) => s.items.length && !/галери/i.test(s.title));
    const acc = { tels: new Set(), mails: new Set(), docs: [] };
    const units = PP.unitsOf(id);
    const docs = PP.inClinic(id).slice().sort((a, b) => (b.head - a.head) || (!!b.img - !!a.img));
    const staff = (window.ISUL_STAFF || []).filter((x) => x.clinic === +id);
    const prices = kxPrices(c);
    const news = kxNews(c, docs);
    const hasCv = (d) => (d.biography && d.biography.length) || d.cv;
    const withBio = docs.filter(hasCv);

    /* gallery: the clinic photo, the isul.eu gallery of the clinic, photos of its news */
    const G = [], seen = new Set();
    const addG = (src, cap, href = '') => { if (!src) return; const k = (src.match(/(\d{9,})/) || [])[1] || src; if (seen.has(k)) return; seen.add(k); G.push({ src, cap, href }); };
    // the local clinic photo is a copy of the isul.eu one, so the remote one is added only when there is no local copy
    addG(heroOf(c), c.name); if (!LOCAL_HERO.has(+id)) addG(c.hero, c.name);
    c0.blocks.filter((b) => b.t === 'img').forEach((b) => addG(b.src, c.name));
    news.forEach((n) => addG('assets/photos/news-c/' + n.id + '.jpg', n.title, '#/news/' + n.id));
    // the collage and the band use only the clinic's own photos (news photos are often posters with text)
    const GC = G.filter((g) => !g.href).map((g) => g.src);
    // the booking band stays a plain burgundy field with the crown — no full-width photo on the clinic pages
    const colA = GC[1] || GC[0] || '', colB = GC[2] || '', bandImg = '';

    const kick = (t, mod = '') => `<p class="kx-kick${mod}">${esc(t)}</p>`;
    // columns for a row of n cards, chosen so the last row is not left with a lone card
    const cols = (n) => n <= 5 ? n : n % 3 === 0 ? 3 : n % 4 === 0 || n % 4 === 3 ? 4 : n % 5 === 0 ? 5 : 3;
    // portrait cards stay small (4–6 per row): a full last row first, else the fullest last row, five on a tie
    const colsD = (n) => n <= 6 ? Math.max(n, 4) : [5, 4, 6].map((c) => [c, n % c || c]).sort((x, y) => (y[1] / y[0]) - (x[1] / x[0]) || (x[0] === 5 ? -1 : y[0] === 5 ? 1 : 0))[0][0];
    const head2 = (k, t, sub = '', side = '') => `<div class="kx-head"><div>${kick(k)}<h2 class="kx-h2">${t}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${side}</div>`;
    const urg = kxUrgent(c);
    const where = PL ? whereBand(id, 'kx-where') : '', signAt = placeLine(placesOf(id));
    // the head of the clinic has a band of its own (as on the clinic pages of the other layout); the team shows the others
    const chief = docs.find((d) => /(началник|н-к|ръководител)\s+(на\s+)?(клиник|отделени|лаборатори|центр|звен)/i.test(d.role || '')) || docs.find((d) => d.head);
    const chiefHtml = chief ? chiefBand(chief, { isClinic, kind: KIND_OF[id] || 'clinic', sid: 'kx-head' }) : '';
    const teamDocs = chief ? docs.filter((d) => d !== chief) : docs;
    // calm version: what is treated, then who treats it, then the examinations
    const nav = CLEAN ? [['about', 'За клиниката'], (chief || teamDocs.length) && [chief ? 'head' : 'team', 'Екип'], (prices.length || units.length || equip) && ['exam', 'Изследвания'], G.length > 1 && ['gallery', 'Галерия'], urg && ['urgent', 'Спешно'], ['patient', 'За пациента'], ['contacts', 'Контакти']].filter(Boolean) : [['about', 'За клиниката'], (prices.length || units.length || equip) && ['exam', 'Изследвания'], chief && ['head', /ръковод/i.test(chief.role || '') ? 'Ръководител' : 'Началник'], teamDocs.length && ['team', 'Екип'], G.length > 1 && ['gallery', 'Галерия'], ['video', 'Видео'], news.length && ['news', 'Новини'], urg && ['urgent', 'Спешно'], ['patient', 'За пациента'], where && ['where', 'Къде се намира'], ['contacts', 'Контакти']].filter(Boolean);
    // the name in the clinic's menu, on one line: the official name without its qualifier („… с извършване на …“, „… и болести на обмяната …“)
    const mark = (isClinic ? shortN : c.name.replace(/^(Отделение|Лаборатория) по /, '')).replace(/\s+(с|със)\s+.*$|\s+и болести на .*$|\s+[„"].*$/, '').replace(/^(.)/, (m) => m.toUpperCase());
    const headD = docs.find((d) => d.head);

    /* ---- header: as on „Кариери“, with the clinic photo on the right ---- */
    const hero = kxHead({ crumbs: [['Клиники и отделения', '#/clinics'], [c.name]], kick: (GROUP_OF[id] || 'Клиника') + ' · УМБАЛ „Царица Йоанна – ИСУЛ“', title: CLEAN && CLINIC_ICON[id] ? `<span class="kxc-ic">${clinicIcon(id)}</span><span>${esc(c.name)}</span>` : esc(c.name),
      lead: lead ? cutS(lead, CLEAN ? 170 : 230) : '',
      cta: `<div class="kx-cta"><a class="kx-btn kx-btn--w" href="${BOOK}">Как да се прегледам</a><a class="kx-btn kx-btn--o" href="${telOf(tel1)}">${IC.phone}${esc(tel1)}</a></div>`,
      img: heroOf(c), cap: G.length > 1 ? `<a class="kx-ph__gal" href="#kx-gallery" data-kj="kx-gallery">${G.length} снимки ${A}</a>` : '' });
    // the clinic's own menu comes after the strip, so the strip can rise into the hero photo
    const navHtml = `<nav class="kx-nav" aria-label="${esc(c.name)} — съдържание"><div class="vwrap kx-nav__in">
      <a class="kx-nav__mark" href="#kx-about" data-kj="kx-about"><img src="assets/brand/isul-crest.svg" alt="" width="1017" height="1737"><span>${esc(mark)}</span></a>
      <div class="kx-nav__links">${nav.map(([k, t]) => `<a href="#kx-${k}" data-kj="kx-${k}">${t}</a>`).join('')}</div>
    </div></nav>`;

    /* ---- facts + quick tiles in one strip, pulled up into the hero ---- */
    const facts = [headD && [/ръковод/i.test(headD.role) ? 'Ръководител' : 'Началник', `<a href="${drUrl(headD)}">${esc(headD.name)}</a>`], (signAt.length || floor) && ['Разположение', esc(signAt.length ? signAt.join('; ') : floor)], visit && ['Свиждане', esc(visit)], c.emails[0] && ['Имейл', `<a href="mailto:${esc(c.emails[0])}">${esc(c.emails[0])}</a>`]].filter(Boolean);
    const tiles = [
      (prices.length || units.length || equip) && ['Изследвания и цени', prices.length ? `${prices.length} ${prices.length === 1 ? 'услуга' : 'услуги'} с цени` : units.length ? `${units.length} ${units.length === 1 ? 'звено' : 'звена'}` : `${equip.length} вида апаратура`, 'kx-exam'],
      docs.length && ['Лекарите', `${docs.length} ${docs.length === 1 ? 'лекар' : 'лекари'}${withBio.length ? ` · ${withBio.length} с биография` : ''}`, 'kx-team'],
      ['Прием и свиждане', visit ? esc(visit) : 'Как да постъпите', 'kx-patient']
    ].filter(Boolean);
    const strip = `<section class="kx-strip" aria-label="Накратко"><div class="vwrap"><div class="kx-strip__in">
      ${facts.length ? `<dl class="kx-strip__facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
      <div class="kx-strip__tiles">${tiles.map(([t, p, to]) => `<a class="kx-tile" href="#${to}" data-kj="${to}"><b>${t}</b><span>${p}</span><i aria-hidden="true">${A}</i></a>`).join('')}</div>
    </div></div></section>`;

    const cleanFacts = [headD && [/ръковод/i.test(headD.role) ? 'Ръководител' : 'Началник', `<a href="${drUrl(headD)}">${esc(headD.name)}</a>`], (signAt.length || floor) && ['Разположение', esc(signAt.length ? signAt.join('; ') : floor)], ['Телефон', phones.slice(0, 2).map((x) => `<a href="${telOf(x)}">${esc(x)}</a>`).join('<br>')], visit && ['Свиждане', esc(visit)], c.emails[0] && ['Имейл', `<a href="mailto:${esc(c.emails[0])}">${esc(c.emails[0])}</a>`]].filter(Boolean);
    // calm version: the band sits in a wrapper (so it can be a card); option А adds the clinic's phone and e-mail beside it
    const chiefC = CLEAN && chiefHtml ? chiefHtml.replace('<div class="vwrap chf', '<div class="vwrap"><div class="chf').replace(/<\/div><\/div><\/section>$/, CHF === 'a'
      ? `</div><aside class="chf__ct"><p>Връзка с клиниката</p><a href="${telOf(tel1)}">${IC.phone}<span>${esc(tel1)}</span></a>${c.emails[0] ? `<a href="mailto:${esc(c.emails[0])}">${IC.mail}<span>${esc(c.emails[0])}</span></a>` : ''}</aside></div></div></section>`
      : '</div></div></div></section>') : chiefHtml;
    const factsHtml = `<section class="kxc-facts" aria-label="Накратко"><div class="vwrap"><dl>${cleanFacts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div></section>`;

    /* ---- about: text beside a photo collage, activities as tabs (no ragged card grid) ---- */
    const prose = (pre.length > 1 ? pre.slice(1) : pre);   // the first paragraph is already the hero lead
    const stats = [[docs.length, docs.length === 1 ? 'лекар' : 'лекари'], [units.length, units.length === 1 ? 'звено' : 'звена'], [equip ? equip.length : 0, 'вида апаратура'], [prices.length, 'услуги с цени']].filter(([n]) => n > 0).slice(0, 3);
    const actsHtml = acts.length ? `<div class="kx-acts">${acts.length > 1 ? `<div class="kx-acts__tabs" role="tablist" aria-label="Дейности">${acts.map((s, i) => `<button type="button" role="tab" id="kx-at${i}" aria-controls="kx-ap${i}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}">${esc(s.title || 'Медицинска дейност')}</button>`).join('')}</div>` : ''}
      ${acts.map((s, i) => `<div class="kx-acts__p" role="tabpanel" id="kx-ap${i}"${acts.length > 1 ? ` aria-labelledby="kx-at${i}"` : ''}${i ? ' hidden' : ''}>${acts.length === 1 ? `<h3>${esc(s.title || 'Медицинска дейност')}</h3>` : ''}<div class="kx-acts__b">${richBody(s.items, acc)}</div></div>`).join('')}</div>` : '';
    const about = `<section class="kx-sec kx-about" id="kx-about"><div class="vwrap">
      <div class="kx-about__g">
        <div class="kx-about__t">${kick('За клиниката')}<h2 class="kx-h2">${isClinic ? 'Клиниката' : 'Звеното'} накратко</h2>
          <div class="kx-prose${prose.reduce((n, b) => n + b.x.length, 0) > 900 ? ' is-long' : ''}">${prose.map((b) => `<p>${linkify(b.x)}</p>`).join('') || '<p class="muted">Описанието предстои.</p>'}</div>
          ${prose.reduce((n, b) => n + b.x.length, 0) > 900 ? '<button type="button" class="kx-more" data-more>Прочети цялото ↓</button>' : ''}</div>
        ${CLEAN ? '' : `<div class="kx-collage">
          <span class="kx-collage__a nwm"><img src="${esc(colA)}" alt="" loading="lazy"></span>
          ${colB ? `<span class="kx-collage__b nwm"><img src="${esc(colB)}" alt="" loading="lazy"></span>` : ''}
          ${stats.length ? `<dl class="kx-collage__st">${stats.map(([n, t]) => `<div><dd>${n}</dd><dt>${t}</dt></div>`).join('')}</dl>` : ''}
        </div>`}
      </div>
      ${actsHtml}
    </div></section>`;

    /* ---- photo band: a gallery photo across the page, with the way to book ---- */
    const band = `<section class="kx-band${bandImg ? '' : ' kx-band--plain'}" aria-label="Запишете час">${bandImg ? `<span class="kx-band__bg nwm"><img src="${esc(bandImg)}" alt="" loading="lazy"></span>` : ''}<div class="vwrap kx-band__in">
      <div><p class="kx-kick kx-kick--g">${esc(c.name)}</p><h2>Преглед в клиниката</h2><p>В кабинета на клиниката в ДКБ — II етаж над Спешно отделение, в работни дни от 8 до 14 ч. За хоспитализация — с направление № 7 от личен лекар или специалист.</p></div>
      <div class="kx-band__act"><a class="kx-btn kx-btn--w" href="${BOOK}">Как да се прегледам</a><a class="kx-btn kx-btn--o" href="${telOf(tel1)}">${IC.phone}${esc(tel1)}</a></div>
    </div></section>`;

    /* ---- examinations: full width — the heading with the search, units, equipment, then the price list in two columns ---- */
    const eur = (v) => v.toFixed(2).replace('.', ',') + ' €';
    const subs = [...new Set(prices.map((p) => p.sub))];
    // the first 12 services show at once (six rows of two), the rest („late“) after „Покажи всички“ or a search
    let pn = 0;
    const priceRows = subs.map((s) => `${s ? `<li class="kx-pr__sub${pn >= 12 ? ' kx-late' : ''}">${esc(s)}</li>` : ''}${prices.filter((p) => p.sub === s).map((p) => `<li class="kx-pr__it${pn++ >= 12 ? ' kx-late' : ''}" data-q="${esc(fold(p.code + ' ' + p.name + ' ' + s))}"><span><b>${esc(p.name)}</b><small>${esc(p.code)} · ${esc(p.unit)}</small></span><em>${eur(p.price)}</em></li>`).join('')}`).join('');
    // a list of treatments or activities found next to the word „апаратура“ is not equipment
    const eqT = equip && equip.filter((x) => /^(лечение|извършва|диагност|операци|андролог|фертилит|хирург|оператив)/i.test(x.x || '')).length >= equip.length / 2 ? (KIND_OF[id] === 'lab' ? 'Методи' : 'Лечение и методи') : 'Апаратура';
    const eqHtml = equip ? `<div class="kx-eq"><h3 class="kx-h3">${eqT} <span>${equip.length}</span></h3><ul${equip.length > 9 ? ' class="is-clip"' : ''}>${equip.map((b, i) => `<li${i >= 9 ? ' class="kx-late"' : ''}>${ICON.check}<span>${linkify(b.x)}</span></li>`).join('')}</ul>${equip.length > 9 ? `<button type="button" class="kx-more" data-eqall>Цялата апаратура (${equip.length}) ↓</button>` : ''}</div>` : '';
    const priceHtml = prices.length ? `<div class="kx-pr"><h3 class="kx-h3">Услуги с цени <span>${prices.length}</span></h3>
        <ul class="kx-pr__list${prices.length > 12 ? ' is-clip' : ''}" id="kx-pl">${priceRows}</ul>
        <p class="kx-pr__none" hidden>Няма услуга по това търсене. Попитайте на <a href="${telOf(tel1)}">${esc(tel1)}</a>.</p>
        <div class="kx-pr__foot">${prices.length > 12 ? `<button type="button" class="kx-btn kx-btn--d" id="kx-pall">Покажи всички ${prices.length}</button>` : ''}<a class="kx-link" href="#/pricelist">Целият ценоразпис ${A}</a></div></div>` : '';
    const find = prices.length > 8 ? `<div class="kx-find kx-find--big"><span>${ICON.search}</span><label class="vh" for="kx-pq">Търси услуга</label><input id="kx-pq" type="search" placeholder="Търси изследване или код…" autocomplete="off"></div>` : '';
    const exam = nav.some(([k]) => k === 'exam') ? `<section class="kx-sec kx-exam" id="kx-exam"><div class="vwrap">
      ${head2('Изследвания и апаратура', 'Изследвания и услуги', prices.length ? 'Цените са от утвърдения ценоразпис на болницата, с ДДС — за пациенти без здравна осигуровка или извън НЗОК.' : 'Изследванията и апаратурата на клиниката.', find)}
      ${units.length ? `<h3 class="kx-h3">Звена <span>${units.length}</span></h3><div class="ucards kx-units" style="--cols:${cols(units.length)}">${units.map(unitCard).join('')}</div>` : ''}
      ${eqHtml}${priceHtml}
    </div></section>` : '';

    /* ---- team: the head as a feature, doctors with a portrait as cards, the rest as a compact list ---- */
    const btns = (d) => `${hasCv(d) ? `<button type="button" class="kx-chip" data-bio="${esc(d.slug)}">Биография</button>` : ''}${d.cv ? `<a class="kx-chip kx-chip--o" href="${esc(d.cv)}" target="_blank" rel="noopener">CV · PDF</a>` : ''}<a class="kx-chip kx-chip--o" href="${drUrl(d)}">Профил</a>`;
    const feat = (d) => { const s = cvSections(d).find((x) => x.dated); return `<article class="kx-feat">
        <a class="kx-feat__ph${d.img ? ' nwm' : ''}" href="${drUrl(d)}" tabindex="-1" aria-hidden="true">${d.img ? `<img src="${esc(d.img)}" alt="" loading="lazy">` : `<span>${initialsOf(d)}</span>`}</a>
        <div class="kx-feat__t">${kick(/ръковод/i.test(d.role) ? 'Ръководител' : 'Началник на клиниката')}<h3><a href="${drUrl(d)}">${esc(d.name)}</a></h3>${d.role ? `<p class="kx-feat__r">${esc(d.role)}</p>` : ''}
          ${s ? `<ol class="kx-feat__tl">${s.rows.filter((r) => r.when).slice(0, 3).map((r) => `<li><time>${esc(r.when)}</time><span>${esc(r.x.length > 110 ? r.x.slice(0, r.x.lastIndexOf(' ', 104)) + '…' : r.x)}</span></li>`).join('')}</ol>` : ''}
          <div class="kx-dr__act">${btns(d)}<a class="kx-chip kx-chip--o" href="${BOOK}">Как да се прегледам</a></div></div>
      </article>`; };
    const card = (d) => `<article class="kx-dr" data-q="${esc(fold(d.name + ' ' + d.role))}"><a class="kx-dr__ph nwm" href="${drUrl(d)}" tabindex="-1" aria-hidden="true"><img src="${esc(d.img)}" alt="" loading="lazy"></a>
        <div class="kx-dr__t"><b><a href="${drUrl(d)}">${esc(d.name)}</a></b>${d.role ? `<small>${esc(d.role)}</small>` : ''}<span class="kx-dr__act">${btns(d)}</span></div></article>`;
    const row = (d) => `<li class="kx-row" data-q="${esc(fold(d.name + ' ' + d.role))}"><a href="${drUrl(d)}"><span class="kx-row__av">${initialsOf(d)}</span><span class="kx-row__t"><b>${esc(d.name)}</b>${d.role ? `<small>${esc(d.role)}</small>` : ''}</span></a>${hasCv(d) ? `<button type="button" class="kx-chip" data-bio="${esc(d.slug)}">Биография</button>` : ''}</li>`;
    const heads = teamDocs.filter((d) => d.head), rest = teamDocs.filter((d) => !d.head);
    const top = chief ? null : heads[0] || null, heads2 = heads.slice(1).concat(rest).filter((d) => d.img), noPh = heads.slice(1).concat(rest).filter((d) => !d.img);
    const og = {}; staff.forEach((x) => { (og[x.role] = og[x.role] || []).push(x.name); });
    const heads2x = chief ? heads.concat(rest).filter((d) => d.img) : heads2, noPhx = chief ? heads.concat(rest).filter((d) => !d.img) : noPh;
    const team = teamDocs.length ? `<section class="kx-sec kx-team" id="kx-team"><div class="vwrap">
      ${head2('Екип', 'Лекарите на клиниката', `${teamDocs.length} ${teamDocs.length === 1 ? 'лекар' : 'лекари'}${chief ? ' без началника' : ''}${withBio.length ? ` · ${withBio.length} с биография или автобиография` : ''}`, teamDocs.length > 8 ? `<div class="kx-find"><span>${ICON.search}</span><label class="vh" for="kx-dq">Търси лекар</label><input id="kx-dq" type="search" placeholder="Търси лекар (${docs.length})…" autocomplete="off"></div>` : '')}
      ${top ? feat(top) : ''}
      ${heads2x.length ? `<div class="kx-drs${heads2x.length <= 3 ? ' kx-drs--few' : ''}" style="--cols:${colsD(heads2x.length)}">${heads2x.map(card).join('')}</div>` : ''}
      ${noPhx.length ? `<ul class="kx-rows">${noPhx.map(row).join('')}</ul>` : ''}
      ${staff.length ? `<details class="kx-staff"><summary>Професионалисти по здравни грижи <span>${staff.length}</span></summary>${Object.entries(og).map(([g, xs]) => `<h4>${esc(g)}</h4><p>${xs.map(esc).join(' · ')}</p>`).join('')}</details>` : ''}
      <dialog class="kx-bio" id="kx-bio" aria-labelledby="kx-bio-h"><div class="kx-bio__in"></div></dialog>
    </div></section>` : '';
    const BIO = {}; withBio.forEach((d) => {
      const secs = cvSections(d), us = PP.units.filter((u) => d.units.includes(u.slug));
      const chips = [acadOf(d), degreeOf(d)].filter(Boolean);
      BIO[d.slug] = `<button type="button" class="kx-bio__x" data-close aria-label="Затвори">${IC.x}</button>
      <header class="kx-bio__hd"><span class="kx-bio__ph${d.img ? ' nwm' : ''}">${d.img ? `<img src="${esc(d.img)}" alt="">` : `<i>${initialsOf(d)}</i>`}</span>
        <div><p class="kx-kick kx-kick--g">Биография</p><h3 id="kx-bio-h">${esc(d.name)}</h3>${d.role ? `<p>${esc(d.role)}</p>` : ''}<p class="kx-bio__cl">${esc(c.name)}${us.length ? ' · ' + us.map((u) => esc(u.name)).join(' · ') : ''}</p>${chips.length ? `<span class="kx-bio__chips">${chips.map((t) => `<em>${esc(t)}</em>`).join('')}</span>` : ''}</div></header>
      <div class="kx-bio__b">${secs.length ? cvHtml(secs, 5) : '<p class="kx-bio__pdf">Автобиографията на лекаря е публикувана като PDF документ.</p>'}</div>
      <footer class="kx-bio__ft">${d.cv ? `<a class="kx-btn kx-btn--d" href="${esc(d.cv)}" target="_blank" rel="noopener">Автобиография · PDF ↗</a>` : ''}<a class="kx-btn kx-btn--l" href="${drUrl(d)}">Профил на лекаря ${A}</a><a class="kx-btn kx-btn--l" href="${BOOK}">Как да се прегледам</a></footer>`;
    });

    /* ---- gallery: one strip of equally low photos that scrolls sideways — never a large photo on the page ---- */
    const gallery = G.length > 1 ? `<section class="kx-sec kx-gal" id="kx-gallery"><div class="vwrap">
      ${head2('Галерия', 'Клиниката в снимки', `${G.length} снимки от сайта на болницата и от новините на клиниката.`, `<div class="kx-gal__ctl">${G.length > 4 ? `<button type="button" class="kx-gal__arr" data-gs="-1" aria-label="Назад">←</button><button type="button" class="kx-gal__arr" data-gs="1" aria-label="Напред">→</button>` : ''}<button type="button" class="kx-link" data-g="0">Цял екран ${A}</button></div>`)}
      <div class="kx-gal__strip" id="kx-gs">${G.map((g, i) => `<button type="button" class="kx-gal__it nwm" data-g="${i}" aria-label="Отвори снимка ${i + 1} от ${G.length}"><img src="${esc(g.src)}" alt="" loading="lazy"></button>`).join('')}</div>
      <dialog class="kx-lb" id="kx-lb" aria-label="Галерия"><button type="button" class="kx-lb__x" data-close aria-label="Затвори">${IC.x}</button><button type="button" class="kx-lb__nav kx-lb__nav--p" data-step="-1" aria-label="Предишна снимка">←</button><figure class="nwm"><img alt=""><figcaption></figcaption></figure><button type="button" class="kx-lb__nav kx-lb__nav--n" data-step="1" aria-label="Следваща снимка">→</button></dialog>
    </div></section>` : '';

    /* ---- news: compact cards, a small photo beside the title ---- */
    const nimg = (n) => `assets/photos/news-c/${n.id}.jpg`;
    const newsHtml = news.length ? `<section class="kx-sec kx-news" id="kx-news"><div class="vwrap">
      ${head2('Прес център', 'Новини за клиниката', '', `<a class="kx-link" href="#/news">Всички новини ${A}</a>`)}
      <ul class="kx-nl${news.length === 1 ? ' kx-nl--1' : ''}">${news.slice(0, 4).map((n) => `<li><a href="#/news/${n.id}"><span class="kx-nl__img nwm"><img src="${nimg(n)}" alt="" loading="lazy"></span><span><time>${esc(n.date)}</time><b>${esc(n.title)}</b><em>Прочети ${A}</em></span></a></li>`).join('')}</ul>
    </div></section>` : '';

    /* ---- for the patient: the steps beside the clinic's own notes ---- */
    // the clinic's own notes, as on isul.eu (only the location line „Западен блок 4“ is left out: the place comes from the board)
    // (labels of the old site without text — „Информация“, „За пациента“, „ет. 2“, the patron's name — are left out)
    const patientBlocks = c.patient.filter((b, i) => !(urg && urg.used.has(i)) && (b.x || '').trim() !== locLine && !phones.some((p) => (b.x || '').includes(p)) && !c.emails.some((e) => (b.x || '').includes(e)) && !/^Свиждане/i.test(b.x || '') && !/^Тел\./i.test(b.x || '') && !(b.t !== 'row' && (b.x || '').trim().length < 25 && !/\d{1,2}[.:]\d{2}/.test(b.x || '')));
    // long notes from the clinic go under the steps, short ones beside them
    const steps = [['Консултация', `Преглед в кабинета на клиниката в Диагностично-консултативния блок (ДКБ, II етаж над Спешно отделение), в работни дни от 8 до 14 ч. Информация: ${esc(tel1)}.`], ['Направление', 'За хоспитализация — направление (бл. МЗ-НЗОК № 7) от личен лекар или специалист. При спешност — през Спешно отделение.'], ['Постъпване', `${floor ? esc(floor) + '. ' : ''}Носете лична карта, епикризи, изследвания и списък с лекарствата, които приемате.`], ['Свиждане', visit ? esc(visit.replace(/[.\s]+$/, '')) + '.' : 'Информация на телефона на клиниката.']];
    // Медицински център: prices and appointments through SuperDoc or by phone — its own steps, in the words of its page on isul.eu
    if (id == 27) steps.splice(0, steps.length, ['Записване', `За лекарите с регистрация в СуперДок — с предварително записан час през СуперДок. За лекарите без регистрация — на ${esc(tel1)}.`], ['Направление', 'С направление по НЗОК (№ 3), платен прием или със здравноосигурителен фонд.'], ['Без записан час', 'Само при наличие на свободен час — с изчакване.'], ['Къде', 'В сградата на бившата поликлиника — сега Спешно отделение, на II и V етаж.']);
    // the steps across the whole width (the visiting hours are step 4); the clinic's own notes below them
    const patient = `<section class="kx-sec kx-pat" id="kx-patient"><div class="vwrap">
      ${kick('За пациента')}<h2 class="kx-h2">Вашето посещение — стъпка по стъпка</h2>
      <ol class="kx-steps kx-steps--wide">${steps.map(([t, d], i) => `<li><span>${i + 1}</span><div><b>${t}</b><p>${d}</p></div></li>`).join('')}</ol>
      ${patientBlocks.length ? (CLEAN ? `<details class="kxc-notes"><summary>Информация от клиниката</summary><div class="kx-notes">${richBody(patientBlocks, acc)}</div></details>` : `<div class="kx-box kx-box--notes"><h3>От клиниката</h3><div class="kx-notes">${richBody(patientBlocks, acc)}</div></div>`) : ''}
    </div></section>`;


    /* ---- urgent conditions: own section just before „За пациента“, readable cards instead of a capitals-and-dashes paragraph ---- */
    const urgent = urg ? `<section class="kx-sec kx-urg" id="kx-urgent"><div class="vwrap">
      <div class="kx-head"><div>${kick('Спешни случаи')}<h2 class="kx-h2">Кога е спешно</h2><p>${esc(urg.title)}${urg.head ? ' — ' + esc(urg.head) : ''}.</p></div></div>
      <div class="kx-urg__g">
        <aside class="kx-urg__side">
          <div class="kx-urg__call"><small>При опасност за живота</small><a class="kx-urg__112" href="tel:112">112</a><a class="kx-btn kx-btn--w" href="${telOf('02 9432 203')}">${IC.phone}Спешно отделение · 02 9432 203</a></div>
          ${urg.where.length ? `<div class="kx-urg__where"><h3>Къде и кога</h3><ul>${urg.where.map((x) => `<li>${linkify(x)}</li>`).join('')}</ul></div>` : ''}
        </aside>
        <ol class="kx-urg__list">${urg.items.map((u, i) => `<li class="kx-uc"><header><span class="kx-uc__ic"><svg viewBox="0 0 24 24" aria-hidden="true">${u.ic}</svg></span><span class="kx-uc__n">${String(i + 1).padStart(2, '0')}</span></header><h3>${esc(u.t)}</h3>${u.lead ? `<p>${esc(u.lead)}</p>` : ''}${u.pts.length ? `<ul>${u.pts.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ol>
      </div>
      ${urg.note ? `<p class="kx-urg__note"><b>Важно</b><span>${esc(urg.note)}</span></p>` : ''}
    </div></section>` : '';

    /* ---- contacts ---- */
    const telItems = phones.map((p, i) => [phones.length > 1 ? 'Клиника · ' + (i + 1) : 'Клиника', p]).concat([['Спешно отделение', '02 9432 203']]);
    const contacts = `<section class="kx-sec kx-ct" id="kx-contacts"><div class="vwrap kx-ct__g">
      <div>${kick('Контакти', ' kx-kick--g')}<h2 class="kx-h2">Свържете се с клиниката</h2><p class="kx-ct__fl">${IC.pin}<span>${floor ? esc(floor) + ' · ' : ''}УМБАЛ „Царица Йоанна – ИСУЛ“, ул. „Бяло море“ № 8, София</span></p><a class="kx-btn kx-btn--w" href="route.html">Как да стигна ${A}</a></div>
      <div class="kx-ct__tels">${telItems.map(([t, p]) => `<a href="${telOf(p)}"><span>${esc(t)}</span><b>${esc(p)}</b></a>`).join('')}${c.emails.map((e) => `<a href="mailto:${esc(e)}"><span>Имейл</span><b>${esc(e)}</b></a>`).join('')}</div>
    </div>
    ${CLEAN ? `${where}<div class="vwrap kxc-all"><a class="kx-link" href="#/clinics">Всички клиники и отделения ${A}</a></div>` : `<div class="vwrap kx-others"><p>Други клиники и отделения</p><div class="kx-others__g">${clinicList().filter((x) => x.id != id).map((x) => `<a href="#/clinic/${x.id}">${esc(x.name)}</a>`).join('')}</div></div>`}</section>`;
    // switch between the current and the calm version (prototype only: hidden online with the other prototype bars)
    const vsw = `<nav class="kxv-sw" aria-label="Версия на страницата"><span>Страница</span><a href="#/clinic/${id}"${PODR ? ' aria-current="page"' : ''}>Подредба</a><a href="#/clinic/${id}/nova"${CLEAN ? ' aria-current="page"' : ''}>Изчистена</a><a href="#/clinic/${id}/staro"${tab === 'staro' ? ' aria-current="page"' : ''}>Предишна</a>${CLEAN ? `<i aria-hidden="true"></i><span>Началник</span>${[['', 'Сега'], ['a', 'А'], ['b', 'Б'], ['c', 'В']].map(([k, t]) => `<a href="#/clinic/${id}/nova${k ? '-' + k : ''}"${CHF === k ? ' aria-current="true"' : ''}>${t}</a>`).join('')}` : ''}</nav>`;


    /* ======== #/clinic/<id>/podredba — the order of the МБАЛ Благоевград / НКБ clinic pages ========
       one dark background; the photo behind the name; the clinic's menu; the content on the left and the contacts
       in a card on the right that stays in view; at the end the other clinics of the same group */
    if (PODR) {
      const grp = GROUP_OF[id] || '';
      const docsN = docs.length;
      const machines = units.filter((u) => u.kind === 'Апаратура'), units2 = units.filter((u) => u.kind !== 'Апаратура');
      const meta = [KIND_OF[id] === 'lab' ? 'Лаборатория' : isClinic ? 'Клиника' : 'Отделение', docsN && `${docsN} ${docsN === 1 ? 'лекар' : 'лекари'}`, units2.length && `${units2.length} ${units2.length === 1 ? 'звено' : 'звена'}`, machines.length && `${machines.length} ${machines.length === 1 ? 'апарат' : 'апарата'}`].filter(Boolean);
      // the activities: lists as a grid of ticks, text as paragraphs
      const tickBody = (items) => { let out = '', ul = [];
        const flush = () => { if (ul.length) { out += `<ul class="kp-ticks">${ul.map((x) => `<li>${ICON.check}<span>${linkify(x)}</span></li>`).join('')}</ul>`; ul = []; } };
        items.forEach((b) => { if (b.t === 'li') ul.push(b.x || ''); else { flush(); out += b.t === 'p' ? `<p>${linkify(b.x || '')}</p>` : b.t === 'h' ? `<h3 class="kp-h3">${esc(niceTitle(b.x || ''))}${/:\s*$/.test(b.x || '') ? ':' : ''}</h3>` : richBody([b], acc); } });
        flush(); return out; };
      const proseAll = prose.length ? prose : (lead ? [{ x: lead }] : []);
      const proseLen = proseAll.reduce((n, b) => n + (b.x || '').length, 0);
      const av = (d, big) => `<span class="kp-av${big ? ' kp-av--l' : ''}">${d.img ? `<img src="${esc(d.img)}" alt="" loading="lazy">` : esc(initialsOf(d))}</span>`;
      const headP = chief || headD;
      const team2 = headP ? docs.filter((d) => d !== headP) : docs;
      const related = grp ? clinicList().filter((x) => x.id != id && GROUP_OF[x.id] === grp) : [];

      const S = [];   // [id, menu label, html]
      S.push(['about', 'Представяне', `<p class="kp-k">${esc(isClinic ? 'Клиника' : 'Звено')}</p><h2>Представяне</h2>
        <div class="kp-prose${proseLen > 900 ? ' is-long' : ''}">${proseAll.map((b) => `<p>${linkify(b.x)}</p>`).join('') || '<p>Описанието предстои.</p>'}</div>${proseLen > 900 ? '<button type="button" class="kx-more" data-more>Прочети цялото ↓</button>' : ''}`]);
      // up to three activity sections each with its heading; more (Хирургия has 14) as one section of folds, the first open
      const actBody = (a) => { const xs = a.items.map((b) => b.x || ''); return /кабинет/i.test(a.title || '') && xs.filter((x) => dkbCab(x)).length >= 3 ? dkbCards(xs) : tickBody(a.items); };
      if (acts.length <= 3) acts.forEach((a, i) => S.push([`act${i}`, i === 0 ? 'Медицинска дейност' : '', `<h2>${esc(a.title || 'Медицинска дейност')}</h2>${actBody(a)}`]));
      else S.push(['acts', 'Медицинска дейност', `<h2>Медицинска дейност</h2><p class="kp-note">${acts.length} направления</p>${acts.map((a, i) => `<details class="kp-fold kp-fold--act"${i ? '' : ' open'}><summary>${esc(a.title || 'Медицинска дейност')}</summary><div>${tickBody(a.items)}</div></details>`).join('')}`]);
      if (headP) S.push(['head', 'Екип', `<h2>${/ръковод/i.test(headP.role || '') ? 'Ръководител' : 'Началник'}</h2>
        <div class="kp-chief">${av(headP, true)}<div><b><a href="${drUrl(headP)}">${esc(headP.name)}</a></b>${headP.role ? `<small>${esc(headP.role)}</small>` : ''}</div>
          <span class="kp-chief__act">${hasCv(headP) ? `<button type="button" class="kp-lnk" data-bio="${esc(headP.slug)}">Биография</button>` : ''}<a class="kp-lnk" href="${drUrl(headP)}">Профил ${A}</a></span></div>`]);
      if (team2.length || staff.length) S.push(['team', headP ? '' : 'Екип', `<h2>Медицински екип</h2>
        ${team2.length ? `<ul class="kp-team">${team2.map((d) => `<li><a href="${drUrl(d)}">${av(d)}<span><b>${esc(d.name)}</b>${d.role ? `<small>${esc(d.role)}</small>` : ''}</span></a></li>`).join('')}</ul>` : ''}
        ${staff.length ? `<details class="kp-fold"><summary>Професионалисти по здравни грижи <span>${staff.length}</span></summary><div>${Object.entries(og).map(([g, xs]) => `<h4>${esc(g)}</h4><p>${xs.map(esc).join(' · ')}</p>`).join('')}</div></details>` : ''}`]);
      // the big machines (units of kind „Апаратура“, e.g. КТ, ЯМР in Образна диагностика) get their own section, like the equipment list in Кардиология
      const ucard = (u, i, go) => `<a class="kp-unit" href="${unitUrl(u)}"><small>${String(i + 1).padStart(2, '0')}${go ? ' · ' + esc(u.kind) : ''}</small><b>${esc(u.name)}</b>${u.short ? `<p>${esc(u.short)}</p>` : ''}${u.headP ? `<span>Ръководител: ${esc(u.headP.name)}</span>` : ''}<em>${go || 'Подробно'} ${A}</em></a>`;
      if (units2.length) S.push(['units', 'Звена', `<h2>Звена в ${isClinic ? 'клиниката' : 'отделението'}</h2>
        <div class="kp-units">${units2.map((u, i) => ucard(u, i, 'Към звеното')).join('')}</div>`]);
      if (machines.length) S.push(['machines', 'Апаратура', `<h2>Апаратура</h2>
        <div class="kp-units">${machines.map((u, i) => ucard(u, i, '')).join('')}</div>`]);
      if (equip) S.push(['equip', eqT === 'Апаратура' ? (machines.length ? '' : 'Апаратура') : (acts.length ? '' : 'Медицинска дейност'), `<h2>${eqT}</h2><ul class="kp-ticks">${equip.map((b) => `<li>${ICON.check}<span>${linkify(b.x)}</span></li>`).join('')}</ul>`]);
      if (prices.length) S.push(['exam', 'Изследвания и цени', `<div class="kp-h"><h2>Изследвания и цени</h2>${find}</div><p class="kp-note">Цените са от утвърдения ценоразпис на болницата, с ДДС — за пациенти без здравна осигуровка или извън НЗОК.</p>${priceHtml}`]);
      if (urg) S.push(['urgent', 'Спешно', `<h2>Кога е спешно</h2><p class="kp-note">${esc(urg.title)}${urg.head ? ' — ' + esc(urg.head) : ''}.</p>
        <ol class="kp-urg">${urg.items.map((u) => `<li><b>${esc(u.t)}</b>${u.lead ? `<p>${esc(u.lead)}</p>` : ''}${u.pts.length ? `<ul>${u.pts.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ol>
        <p class="kp-note">При опасност за живота — <a href="tel:112">112</a> или Спешно отделение <a href="${telOf('02 9432 203')}">02 9432 203</a>.</p>`]);
      if (G.length > 1) S.push(['gallery', 'Галерия', `<div class="kp-h"><h2>Галерия</h2><button type="button" class="kp-lnk" data-g="0">Цял екран ${A}</button></div>
        <div class="kp-galw">${G.length > 2 ? '<button type="button" class="kp-arr kp-arr--p" data-gs="-1" aria-label="Предишни снимки" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' : ''}<div class="kx-gal__strip kp-gal" id="kx-gs">${G.map((g, i) => `<button type="button" class="kx-gal__it nwm" data-g="${i}" aria-label="Отвори снимка ${i + 1} от ${G.length}"><img src="${esc(g.src)}" alt="" loading="lazy"></button>`).join('')}</div>${G.length > 2 ? '<button type="button" class="kp-arr kp-arr--n" data-gs="1" aria-label="Следващи снимки"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>' : ''}</div>
        <dialog class="kx-lb" id="kx-lb" aria-label="Галерия"><button type="button" class="kx-lb__x" data-close aria-label="Затвори">${IC.x}</button><button type="button" class="kx-lb__nav kx-lb__nav--p" data-step="-1" aria-label="Предишна снимка">←</button><figure class="nwm"><img alt=""><figcaption></figcaption></figure><button type="button" class="kx-lb__nav kx-lb__nav--n" data-step="1" aria-label="Следваща снимка">→</button></dialog>`]);
      S.push(['patient', 'За пациента', `<h2>Информация за пациентите</h2>
        <ol class="kp-steps">${steps.map(([t, d], i) => `<li><span>${i + 1}</span><b>${t}</b><p>${d}</p></li>`).join('')}</ol>
        ${patientBlocks.length ? `<details class="kp-fold"><summary>Информация от ${isClinic ? 'клиниката' : 'звеното'}</summary><div>${richBody(patientBlocks, acc)}</div></details>` : ''}
        <div class="kp-btns"><a href="#/admission">Постъпване в болницата ${A}</a><a href="#/patient">За пациента ${A}</a><a href="route.html">Как да стигна ${A}</a></div>`]);
      const whereKp = kpWhere(placesOf(id), `#/kade/c${id}`); if (whereKp) S.push(['where', 'Как да стигна', whereKp]);
      if (news.length) S.push(['news', 'Новини', `<div class="kp-h"><h2>Свързани новини</h2><a class="kp-lnk" href="#/news">Всички новини ${A}</a></div>
        <ul class="kp-news">${news.slice(0, 4).map((n) => `<li><a href="#/news/${n.id}"><span class="kp-news__img nwm"><img src="${nimg(n)}" alt="" loading="lazy"></span><time>${esc(n.date)}</time><b>${esc(n.title)}</b></a></li>`).join('')}</ul>`]);

      const kpNav = `<nav class="kp-nav" aria-label="${esc(c.name)} — съдържание"><div class="vwrap kp-nav__w"><div class="kp-nav__in">${S.filter(([, t]) => t).map(([k, t]) => `<a href="#kp-${k}" data-kj="kp-${k}">${esc(t)}</a>`).join('')}</div>
        ${KP_THEME}</div></nav>`;
      const side = `<aside class="kp-side" aria-label="Контакти"><div class="kp-card">
        <p class="kp-k">Контакти</p>
        ${phones.map((ph, i) => `<a class="kp-tel" href="${telOf(ph)}"><small>${phones.length > 1 ? (isClinic ? 'Клиника' : 'Звено') + ' · ' + (i + 1) : isClinic ? 'Клиника' : 'Звено'}</small>${IC.phone}<b>${esc(ph)}</b></a>`).join('')}
        ${[['Централа на болницата', '02 9432 170']].filter(([, n]) => !phones.some((ph) => ph.replace(/\D/g, '').endsWith(n.replace(/\D/g, '').slice(-7)))).map(([t, n]) => `<a class="kp-tel" href="${telOf(n)}"><small>${t}</small>${IC.phone}<b>${n}</b></a>`).join('')}
        <hr>
        ${c.emails[0] ? `<p class="kp-row">${IC.mail}<a href="mailto:${esc(c.emails[0])}">${esc(c.emails[0])}</a></p>` : ''}
        ${signAt.length || floor ? `<p class="kp-row">${IC.pin}<span>${esc(signAt.length ? signAt.join('; ') : floor)}<br><small>ул. „Бяло море“ № 8, София</small></span></p>` : `<p class="kp-row">${IC.pin}<span>ул. „Бяло море“ № 8, София</span></p>`}
        ${visit ? `<p class="kp-row kp-row--t"><small>Свиждане</small><span>${esc(visit)}</span></p>` : ''}
        ${id == 27 ? `<a class="kp-book" href="${SUPERDOC}" target="_blank" rel="noopener">Запази час в СуперДок ↗</a>` : `<a class="kp-book" href="${BOOK}">Как да се прегледам</a>`}
        <a class="kp-go" href="${PL && placesOf(id).length ? `#/kade/c${id}` : 'route.html'}">${PL && placesOf(id).length ? 'Покажи на картата' : 'Как да стигна'} ${A}</a>
      </div></aside>`;
      const hero = `<header class="kp-hero">${heroOf(c) ? `<img class="kp-hero__bg" src="${esc(heroOf(c))}" alt="">` : ''}<div class="vwrap kp-hero__in">
        ${crumbs([['Клиники и отделения', '#/clinics'], [c.name]])}
        ${grp ? `<p class="kp-k">${esc(grp)}</p>` : ''}
        <h1>${CLINIC_ICON[id] ? `<span class="kp-ic">${clinicIcon(id)}</span>` : ''}<span>${esc(c.name)}</span></h1>
        <p class="kp-meta">${meta.map(esc).join(' <i>·</i> ')}</p>
        ${lead ? `<p class="kp-lead">${esc(cutS(lead, 230))}</p>` : ''}
        <div class="kp-cta"><a class="kp-b kp-b--w" href="${telOf(tel1)}">${IC.phone}${esc(tel1)}</a>${team2.length || headP ? `<a class="kp-b" href="#kp-${headP ? 'head' : 'team'}" data-kj="kp-${headP ? 'head' : 'team'}">Медицинският екип</a>` : ''}</div>
      </div></header>`;
      const more = related.length ? `<section class="kp-more"><div class="vwrap"><div class="kp-h"><h2>Още: ${esc(grp.toLowerCase())}</h2><a class="kp-lnk" href="#/clinics">Всички клиники ${A}</a></div>
        <div class="kp-more__row">${related.map((x) => `<a class="kp-mc" href="#/clinic/${x.id}">${heroOf(x) ? `<img src="${esc(heroOf(x))}" alt="" loading="lazy">` : ''}<span class="kp-mc__g">${esc(grp)}</span>${CLINIC_ICON[x.id] ? `<span class="kp-mc__ic">${clinicIcon(x.id)}</span>` : ''}<b>${esc(x.name)}</b></a>`).join('')}</div></div></section>` : '';
      const bioDlg = `<dialog class="kx-bio" id="kx-bio" aria-labelledby="kx-bio-h"><div class="kx-bio__in"></div></dialog>`;
      return { title: c.name, og: `assets/og/clinic-${id}.jpg`, desc: lead ? lead.slice(0, 180) : c.name,
        html: `<div class="kx kp">${hero}${kpNav}<div class="vwrap kp-grid"><div class="kp-main">${S.map(([k, , h]) => `<section class="kp-sec" id="kp-${k}">${h}</section>`).join('')}</div>${side}</div>${more}${bioDlg}${vsw}</div>`,
        init: () => {
          clinicXInit('', G, BIO);
          kpInit();
          const to = tab === 'team' ? ($('#kp-head', page) || $('#kp-team', page)) : tab === 'patient' ? $('#kp-patient', page) : null;
          if (to) setTimeout(() => window.scrollTo({ top: to.getBoundingClientRect().top + scrollY - 140 }), 60);
        } };
    }
    return { title: c.name, og: `assets/og/clinic-${id}.jpg`, desc: lead ? lead.slice(0, 180) : c.name,
      ld: { '@context': 'https://schema.org', '@type': 'MedicalClinic', name: c.name, telephone: tel1, parentOrganization: { '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“' } },
      html: CLEAN ? `<div class="kx kxc" data-chf="${CHF}">${hero}${navHtml}${factsHtml}${about}${chiefC}${team}${exam}${gallery}${newsHtml}${urgent}${patient}${contacts}${vsw}</div>`
        : `<div class="kx">${hero}${strip}${navHtml}${about}${band}${exam}${chiefHtml}${team}${gallery}${reelsBand(id, 'kx-video', isClinic ? 'клиниката' : 'звеното')}${newsHtml}${urgent}${patient}${where}${contacts}${vsw}</div>`,
      init: () => { clinicXInit(tab, G, BIO); reelsBind(page); } };
  }
  function clinicXInit(tab, G, BIO) {
    // the clinic's menu: when the name and all links do not fit on one line, only the crest stays (the name is never cut)
    const kn = $('.kx-nav', page), kl = kn && $('.kx-nav__links', kn);
    const fit = () => { if (!kl) return; kn.classList.remove('is-tight'); if (kl.scrollWidth > kl.clientWidth + 1) kn.classList.add('is-tight'); };
    fit(); if (document.fonts) document.fonts.ready.then(fit); addEventListener('resize', fit);
    const root = page;
    const jump = (idd) => { const t = document.getElementById(idd); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 140, behavior: reduce ? 'auto' : 'smooth' }); };
    $$('[data-kj]', root).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); jump(a.dataset.kj); }));
    const links = $$('.kx-nav__links a', root);
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => { const on = a.dataset.kj === e.target.id; a.classList.toggle('is-on', on); if (on) a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }); }), { rootMargin: '-35% 0px -55% 0px' });
    $$('.kx-sec[id]', root).forEach((s) => io.observe(s));
    // about: long text opens in place
    $$('[data-more]', root).forEach((b) => b.addEventListener('click', () => { const p = b.previousElementSibling, o = p.classList.toggle('is-open'); b.textContent = o ? 'Покажи по-малко ↑' : 'Прочети цялото ↓'; }));
    // activities: tabs (arrow keys move between them)
    const tabs = $$('.kx-acts__tabs [role="tab"]', root);
    const pick = (t) => { tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); };
    tabs.forEach((t, i) => { t.addEventListener('click', () => pick(t)); t.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0; if (!d) return; e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; pick(n); n.focus(); }); });
    const eqb = $('[data-eqall]', root); if (eqb) eqb.addEventListener('click', () => { eqb.previousElementSibling.classList.remove('is-clip'); eqb.remove(); });
    // prices: search and „show all“
    const pl = $('#kx-pl', root), pq = $('#kx-pq', root), pall = $('#kx-pall', root);
    if (pall) pall.addEventListener('click', () => { pl.classList.remove('is-clip'); pall.remove(); });
    if (pq) pq.addEventListener('input', () => {
      const q = fold(pq.value.trim()); if (q && pall && pall.isConnected) { pl.classList.remove('is-clip'); pall.remove(); }
      $$('.kx-pr__it', pl).forEach((li) => { li.hidden = !!q && !li.dataset.q.includes(q); });
      $$('.kx-pr__sub', pl).forEach((h) => { let n = h.nextElementSibling, any = false; while (n && !n.classList.contains('kx-pr__sub')) { if (!n.hidden) any = true; n = n.nextElementSibling; } h.hidden = !any; });
      $('.kx-pr__none', root).hidden = $$('.kx-pr__it', pl).some((li) => !li.hidden);
    });
    const dq = $('#kx-dq', root); if (dq) dq.addEventListener('input', () => { const q = fold(dq.value.trim()); $$('.kx-dr, .kx-row', root).forEach((x) => { x.hidden = !!q && !x.dataset.q.includes(q); }); });
    // biography dialog
    const bio = $('#kx-bio', root);
    if (bio) {
      $$('[data-bio]', root).forEach((b) => b.addEventListener('click', () => { const box = $('.kx-bio__in', bio); box.innerHTML = BIO[b.dataset.bio] || ''; cvBind(box); bio.showModal(); $('.kx-bio__b', box).scrollTop = 0; }));
      bio.addEventListener('click', (e) => { if (e.target === bio || e.target.closest('[data-close]')) bio.close(); });
    }
    // gallery strip: arrows scroll it by about one screen
    const gs = $('#kx-gs', root); $$('[data-gs]', root).forEach((b) => b.addEventListener('click', () => gs.scrollBy({ left: +b.dataset.gs * gs.clientWidth * .8, behavior: reduce ? 'auto' : 'smooth' })));
    // without a touchpad: the arrows move the strip by a screen and switch off at its ends
    if (gs) {
      const arrs = $$('[data-gs]', root), ends = () => { const max = gs.scrollWidth - gs.clientWidth - 2; arrs.forEach((b) => { b.disabled = +b.dataset.gs < 0 ? gs.scrollLeft <= 2 : gs.scrollLeft >= max; }); };
      gs.addEventListener('scroll', ends, { passive: true }); addEventListener('resize', ends); setTimeout(ends, 300);
    }
    // gallery lightbox
    const lb = $('#kx-lb', root);
    if (lb) {
      let k = 0; const img = $('img', lb), cap = $('figcaption', lb);
      const show = (i) => { k = (i + G.length) % G.length; img.src = G[k].src; cap.innerHTML = `${k + 1} / ${G.length} · ${G[k].href ? `<a href="${esc(G[k].href)}">${esc(G[k].cap)}</a>` : esc(G[k].cap)}`; };
      $$('[data-g]', root).forEach((b) => b.addEventListener('click', () => { show(+b.dataset.g); lb.showModal(); }));
      lb.addEventListener('click', (e) => { const s = e.target.closest('[data-step]'); if (s) return show(k + +s.dataset.step); if (e.target === lb || e.target.closest('[data-close]') || e.target.closest('figcaption a')) lb.close(); });
      lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(k + 1); if (e.key === 'ArrowLeft') show(k - 1); });
    }
    if (tab === 'team') setTimeout(() => jump('kx-team'), 60);
    if (tab === 'patient') setTimeout(() => jump('kx-patient'), 60);
  }

  /* ---------- doctor profile — variant X: a CV page in the look of the clinic mini-site ---------- */
  function doctorXPage(slug) {
    const d = PP && PP.bySlug[slug]; if (!d) return notFound();
    const c = C.clinics[d.clinic], A = IC.arrow;
    const us = PP.units.filter((u) => d.units.includes(u.slug));
    const phones = (c.phones.join('; ') || '02 9432 170').split(/;|,| и /).map((x) => x.trim()).filter((x) => /\d{3}/.test(x));
    const tel1 = phones[0] || '02 9432 170';
    const peers = (us[0] && us[0].team.length > 2 ? us[0].team : PP.inClinic(d.clinic)).filter((x) => x !== d).slice(0, 8);
    const secs = cvSections(d), chips = [acadOf(d), degreeOf(d)].filter(Boolean);
    const press = (d.press || []).slice(0, 4), quotes = (d.bio || []).slice(0, 2);
    const todo = ['Образование и специалности', 'Професионален опит', 'С какво се занимава — заболявания и процедури', 'Научна и преподавателска дейност', 'Членства в научни дружества', 'Езици'];
    const facts = [['Клиника', `<a href="#/clinic/${c.id}">${esc(c.name)}</a>`]].concat(us.map((u) => [u.kind, `<a href="${unitUrl(u)}">${esc(u.name)}</a>`])).concat(acadOf(d) ? [['Академична длъжност', acadOf(d)]] : []).concat(degreeOf(d) ? [['Научна степен', degreeOf(d)]] : []);
    const nsec = secs.filter((s) => s.t || s.dated).length;
    const html = `<div class="kx dx">
      <header class="dx-hero"><span class="kx-hero__bg nwm"><img src="${esc(heroOf(c) || '')}" alt=""></span><div class="vwrap dx-hero__in">
        ${crumbs([['Екип', '#/doctors'], [clinicShort(c), '#/clinic/' + c.id], [d.core]])}
        <div class="dx-hero__g">
          <figure class="dx-ph${d.img ? ' nwm' : ''}">${d.img ? `<img src="${esc(d.img)}" alt="${esc(d.name)}">` : `<span>${initialsOf(d)}</span>`}</figure>
          <div class="dx-hero__t">
            ${chips.length ? `<span class="dx-chips">${chips.map((t) => `<em>${esc(t)}</em>`).join('')}</span>` : ''}
            <h1>${esc(d.name)}</h1>
            ${d.role ? `<p class="dx-role">${esc(d.role)}</p>` : ''}
            <p class="dx-cl"><a href="#/clinic/${c.id}">${esc(c.name)}</a>${us.map((u) => ` · <a href="${unitUrl(u)}">${esc(u.name)}</a>`).join('')}</p>
            <div class="kx-cta"><a class="kx-btn kx-btn--w" href="${BOOK}">Как да се прегледам</a><a class="kx-btn kx-btn--o" href="${telOf(tel1)}">${IC.phone}${esc(tel1)}</a>${d.cv ? `<a class="kx-btn kx-btn--o" href="${esc(d.cv)}" target="_blank" rel="noopener">CV · PDF ↗</a>` : ''}</div>
          </div>
        </div>
      </div></header>
      <div class="vwrap dx-body">
        <main class="dx-main">
          <div class="kx-head"><div><p class="kx-kick">Биография</p><h2 class="kx-h2">Професионален път</h2>${nsec ? `<p>${nsec} ${nsec === 1 ? 'раздел' : 'раздела'} от биографията, публикувана на isul.eu.</p>` : ''}</div></div>
          ${secs.length ? `<div class="dx-cv">${cvHtml(secs, 6)}</div><p class="dx-src">Източник: <a href="${esc(d.bioSrc)}" target="_blank" rel="noopener">isul.eu</a></p>`
            : d.cv ? `<a class="dx-pdf" href="${esc(d.cv)}" target="_blank" rel="noopener"><b>PDF</b><span><strong>Автобиография</strong>${esc(d.core)} · отваря се в нов прозорец</span>${A}</a>`
            : `<div class="dx-todo"><p>Биографията се попълва по единен образец. Информацията се предоставя от клиниката:</p><ul>${todo.map((t) => `<li>${t}</li>`).join('')}</ul></div>`}
          ${quotes.length ? `<div class="dx-quotes"><h3 class="kx-h3">От интервюта в Прес центъра</h3>${quotes.map((q) => `<blockquote><p>${esc(q.x)}</p><a href="#/news/${q.news}">${esc(q.date)} ${A}</a></blockquote>`).join('')}</div>` : ''}
          ${press.length ? `<div class="dx-press"><h3 class="kx-h3">В Прес центъра</h3><div class="dx-press__g">${press.map((n) => `<a href="#/news/${n.id}"><span class="nwm"><img src="assets/photos/news-c/${n.id}.jpg" alt="" loading="lazy"></span><small>${esc(n.date)}</small><b>${esc(n.title)}</b></a>`).join('')}</div></div>` : ''}
        </main>
        <aside class="dx-side">
          <div class="dx-card dx-card--book"><h3>Преглед</h3><p>В кабинета на клиниката в ДКБ — II етаж над Спешно отделение, в работни дни от 8 до 14 ч.</p><a class="kx-btn kx-btn--w" href="${BOOK}">Как да се прегледам</a><a class="dx-tel" href="${telOf(tel1)}">${IC.phone}${esc(tel1)}</a></div>
          <div class="dx-card"><h3>Накратко</h3><dl>${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl></div>
          ${peers.length ? `<div class="dx-card"><h3>${us[0] && us[0].team.length > 2 ? 'Колеги от звеното' : 'Колеги от клиниката'}</h3><ul class="dx-peers">${peers.map((p) => `<li><a href="${drUrl(p)}"><span class="kx-row__av">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : initialsOf(p)}</span><span><b>${esc(p.name)}</b>${p.role ? `<small>${esc(p.role)}</small>` : ''}</span></a></li>`).join('')}</ul><a class="kx-link" href="#/clinic/${c.id}/team">Целият екип ${A}</a></div>` : ''}
        </aside>
      </div></div>`;
    return { title: d.name, html, og: d.img ? `assets/og/dr-${d.slug}.jpg` : `assets/og/clinic-${c.id}.jpg`, desc: `${d.name} — ${d.role ? d.role + ', ' : ''}${c.name}, УМБАЛ „Царица Йоанна – ИСУЛ“.`,
      ld: { '@context': 'https://schema.org', '@type': 'Physician', name: d.name, jobTitle: d.role || undefined, image: d.img ? new URL(d.img, location.href).href : undefined, worksFor: { '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“', department: c.name } },
      init: () => cvBind(page) };
  }

  /* Кариери: job cards from medboard.bg, filtered by clinic and position type */
  /* line icons shared by the X clinics and careers pages (cards | list) */
  const I = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const IC = { grid: I('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'), list: I('<rect x="4" y="5" width="5" height="4" rx="1"/><rect x="4" y="15" width="5" height="4" rx="1"/><path d="M12 7h8M12 17h8"/>'), filter: I('<path d="M4 6h16M7 12h10M10 18h4"/>'), arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>'), x: I('<path d="M6 6l12 12M18 6 6 18"/>'), search: I('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'), chev: I('<path d="m6 9 6 6 6-6"/>'), phone: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'), mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>'), pin: I('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>') };
  function careersPage() {
    const J = window.ISUL_JOBS, jobs = J.jobs;
    const LOCAL = CLINIC_IMG;
    const img = (cid) => LOCAL.has(cid) ? `assets/photos/clinics/c${cid}.jpg` : 'assets/photos/clinics/emergency-entrance.jpg';
    const cname = (cid) => (C.clinics[cid] || {}).name || '';
    const TYPES = ['Лекари', 'Специализанти', 'Медицински сестри', 'Лаборанти и рехабилитатори', 'Студенти'];
    const clinics = [...new Set(jobs.map((j) => j.clinic))].sort((a, b) => cname(a).localeCompare(cname(b), 'bg'));
    const count = (f) => jobs.filter(f).length;
    const card = (j) => `<article class="jc${j.demo ? ' jc--demo' : ''}" data-c="${j.clinic}" data-t="${esc(j.type)}" data-q="${esc(fold(j.title + ' ' + j.lead + ' ' + cname(j.clinic) + ' ' + j.type))}">
        <button type="button" class="jc__open" data-job="${j.id}" aria-label="${esc(j.title)}"></button>
        <span class="jc__img nwm"><img src="${img(j.clinic)}" alt="" loading="lazy"></span>
        <div class="jc__body"><p class="jc__meta"><span class="jc__type">${esc(j.type)}</span>${j.demo ? '<span class="jc__demo">Примерна</span>' : `<span class="jc__src">medboard.bg</span>`}</p>
          <h3>${esc(j.title)}</h3><p class="jc__clinic">${esc(cname(j.clinic))}</p><p class="jc__lead">${esc(j.lead)}</p>
          <p class="jc__foot"><span>📍 София${j.shift ? ' · ' + esc(j.shift) : ''}</span>${j.date ? `<time>${esc(j.date)}</time>` : ''}</p></div></article>`;
    /* variant X: the same photo card / list row as the clinics page, with a Картички | Списък switch */
    const X = !!window.ISUL_X;
    const src = (j) => j.demo ? '<span class="jx-demo">Примерна обява</span>' : '<span class="jx-src">medboard.bg</span>';
    const cardX = (j) => `<article class="cx-item jc" data-c="${j.clinic}" data-t="${esc(j.type)}" data-q="${esc(fold(j.title + ' ' + j.lead + ' ' + cname(j.clinic) + ' ' + j.type))}">
        <button type="button" class="cx-card jx-card" data-job="${j.id}">
          <span class="cx-card__img nwm"><img src="${img(j.clinic)}" alt="" loading="lazy" decoding="async"></span>
          <span class="cx-badge">${esc(j.type)}</span>${j.demo ? '<span class="jx-demo jx-demo--c">Примерна</span>' : ''}
          <span class="cx-card__body"><b>${esc(j.title)}</b><span class="cx-card__tel">${IC.pin}${esc(cname(j.clinic).replace(/^Клиника по /, '').replace(/^(.)/, (m) => m.toUpperCase()))}</span></span>
          <span class="cx-card__go">${IC.arrow}</span>
        </button>
        <div class="cx-row">
          <span class="cx-row__img nwm"><img src="${img(j.clinic)}" alt="" loading="lazy" decoding="async"></span>
          <div class="cx-row__b"><p class="cx-row__g">${esc(j.type)} ${src(j)}</p><h3><button type="button" class="jx-t" data-job="${j.id}">${esc(j.title)}</button></h3><p class="cx-row__t">${esc(j.lead)}</p>
            <p class="cx-row__m"><span>${IC.pin}${esc(cname(j.clinic))}</span>${j.shift ? `<span>${esc(j.shift)}</span>` : ''}${j.date ? `<time>${esc(j.date)}</time>` : ''}</p></div>
          <button type="button" class="cx-btn cx-btn--o cx-row__more" data-job="${j.id}" aria-label="Подробности за ${esc(j.title)}">Подробности</button>
        </div>
      </article>`;
    const viewX = `<div class="cx-view" role="group" aria-label="Изглед"><button type="button" data-v="cards" aria-pressed="true" title="Картички">${IC.grid}<span>Картички</span></button><button type="button" data-v="list" aria-pressed="false" title="Списък">${IC.list}<span>Списък</span></button></div>`;
    HX.img = 'assets/photos/clinics/c3.jpg'; HX.noSub = true;
    const html = hero('Кариери в ИСУЛ', [['Кариери']], 'Работете в университетска болница с 90-годишна история — до водещи специалисти, с модерна апаратура и реално професионално развитие.', `<a class="mbp mbp--dark" href="${J.company}" target="_blank" rel="noopener" aria-label="Powered by medboard — Career platform"><small>Powered by</small><img src="assets/brand/medboard-white.png" alt="medboard"><span>Career platform</span></a>`) +
      `<section class="jb"><div class="vwrap">
        <div class="jb__why">${[['1936', 'основана'], ['27', 'клиники, отделения и лаборатории'], ['МУ – София', 'университетска база за обучение'], ['🎓', 'специализации, стажове и работа за студенти']].map(([n, t]) => `<div><b>${n}</b><span>${t}</span></div>`).join('')}</div>
        <div class="jb__grid">
          <aside class="jb__side">
            <div class="jb__find"><span>${ICON.search}</span><label class="vh" for="jq">Търси позиция</label><input id="jq" type="search" placeholder="Позиция, клиника…" autocomplete="off"></div>
            <h3>Тип позиция</h3><div class="jb__f" id="jtype"><button type="button" aria-pressed="true" data-v="">Всички<span>${jobs.length}</span></button>${TYPES.filter((t) => count((j) => j.type === t)).map((t) => `<button type="button" aria-pressed="false" data-v="${esc(t)}">${esc(t)}<span>${count((j) => j.type === t)}</span></button>`).join('')}</div>
            <h3>Клиника / отделение</h3><div class="jb__f" id="jclin"><button type="button" aria-pressed="true" data-v="">Всички клиники<span>${jobs.length}</span></button>${clinics.map((c) => `<button type="button" aria-pressed="false" data-v="${c}">${esc(cname(c).replace(/^Клиника по /, ''))}<span>${count((j) => j.clinic === c)}</span></button>`).join('')}</div>
            <a class="mbp" href="${J.company}" target="_blank" rel="noopener" aria-label="Powered by medboard — Career platform"><small>Powered by</small><img src="assets/brand/medboard.svg" alt="medboard"><span>Career platform</span></a>
          </aside>
          <div class="jb__main"><div class="jb__head"><p class="jb__n" id="jn"></p><a class="mbp mbp--s" href="${J.company}" target="_blank" rel="noopener" aria-label="Powered by medboard — Career platform"><small>Powered by</small><img src="assets/brand/medboard.svg" alt="medboard"><span>Career platform</span></a>${X ? viewX : ''}</div>${X ? `<div class="cx-results is-cards jx-res" id="jcards">${jobs.map(cardX).join('')}</div>` : `<div class="jb__cards" id="jcards">${jobs.map(card).join('')}</div>`}<p class="jb__empty" hidden>Няма позиции по избраните филтри. Изпратете отворена кандидатура на <a href="mailto:hr@isul.eu">hr@isul.eu</a>.</p></div>
        </div>
        ${X ? `<div class="jx-comp"><div><h2>Конкурси за длъжности</h2><p>Официалните конкурси по заповед на изпълнителния директор — например за лекари-специализанти — се публикуват в раздел „Конкурси“.</p></div><a href="#/competition">Към конкурсите →</a></div>` : ''}
        <div class="jb__open"><div><h2>Не намирате подходяща позиция?</h2><p>Изпратете автобиография и мотивационно писмо — ще се свържем с Вас при подходяща възможност.</p></div><a href="mailto:pr@isul.eu?subject=${encodeURIComponent('Отворена кандидатура')}">Отворена кандидатура →</a></div>
      </div></section>
      <div class="jd" hidden role="dialog" aria-modal="true" aria-labelledby="jd-h"><div class="jd__in"><button type="button" class="jd__x" aria-label="Затвори">×</button><div id="jdbody"></div></div></div>`;
    return { title: 'Кариери', html, desc: 'Свободни позиции в УМБАЛ „Царица Йоанна – ИСУЛ“ — лекари, специализанти, медицински сестри, лаборанти и студенти.', init: () => {
      const st = { t: '', c: '', q: '' };
      const run = () => { let k = 0; $$('#jcards .jc').forEach((a) => { const ok = (!st.t || a.dataset.t === st.t) && (!st.c || a.dataset.c === st.c) && (!st.q || a.dataset.q.includes(st.q)); a.hidden = !ok; if (ok) k++; }); $('#jn').textContent = `${k} ${k === 1 ? 'позиция' : 'позиции'}`; $('.jb__empty').hidden = !!k; };
      [['#jtype', 't'], ['#jclin', 'c']].forEach(([sel, key]) => $$(sel + ' button').forEach((b) => b.addEventListener('click', () => { $$(sel + ' button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); st[key] = b.dataset.v; run(); })));
      $('#jq').addEventListener('input', (e) => { st.q = fold(e.target.value.trim()); run(); }); run();
      if (X) {   // view: cards | list (kept between visits, like the clinics page)
        const res = $('#jcards');
        const setView = (v) => { res.classList.toggle('is-cards', v === 'cards'); res.classList.toggle('is-list', v === 'list'); $$('.jb .cx-view button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v))); try { localStorage.setItem('isul-x-careers-view', v); } catch (e) { /* storage blocked */ } };
        $$('.jb .cx-view button').forEach((b) => b.addEventListener('click', () => setView(b.dataset.v)));
        let v0 = 'cards'; try { v0 = localStorage.getItem('isul-x-careers-view') === 'list' ? 'list' : 'cards'; } catch (e) { /* storage blocked */ }
        setView(v0);
      }
      const dlg = $('.jd'), body = $('#jdbody');
      const close = () => { dlg.hidden = true; document.body.style.overflow = ''; };
      $$('[data-job]').forEach((b) => b.addEventListener('click', () => {
        const j = jobs.find((x) => x.id === b.dataset.job);
        body.innerHTML = `<span class="jd__img nwm"><img src="${img(j.clinic)}" alt=""></span><div class="jd__b"><p class="jc__meta"><span class="jc__type">${esc(j.type)}</span>${j.demo ? '<span class="jc__demo">Примерна обява</span>' : ''}</p><h2 id="jd-h">${esc(j.title)}</h2><p class="jc__clinic"><a href="#/clinic/${j.clinic}">${esc(cname(j.clinic))}</a> · София${j.date ? ' · публикувана ' + esc(j.date) : ''}</p><div class="jd__txt">${j.body.map((x) => /^[✔️✔•–➢-]/.test(x) ? `<p class="jd__li">${esc(x.replace(/^[✔️✔•–➢-]+\s*/, ''))}</p>` : `<p>${esc(x)}</p>`).join('')}</div><div class="jd__cta"><a class="is-main" href="${j.url}" target="_blank" rel="noopener">Кандидатствай в medboard.bg ↗</a><a href="#/clinic/${j.clinic}">За клиниката</a></div></div>`;
        dlg.hidden = false; document.body.style.overflow = 'hidden'; $('.jd__x').focus();
      }));
      $('.jd__x').addEventListener('click', close); dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
      // #/careers?job=<id> (the homepage job bands) opens that job right away
      const want = new URLSearchParams((location.hash.split('?')[1]) || '').get('job'); if (want) { const b = $(`[data-job="${want}"]`); if (b) setTimeout(() => b.click(), 60); }
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && !dlg.hidden) close(); });
    } };
  }
  /* Ценоразпис: the official price list (.xlsx) as a searchable page, grouped by clinic */
  function pricePage() {
    const P = window.ISUL_PRICES, M = P.meta;
    const eur = (v) => typeof v === 'number' ? v.toFixed(2).replace('.', ',') + ' €' : esc(v || '—');
    const gid = (i) => 'pg-' + i;
    const rows = (it) => `<tr data-q="${esc(fold(it[0] + ' ' + it[1]))}"><td class="pl__code">${esc(it[0])}</td><td class="pl__name">${esc(it[1])}${it[4] || it[5] ? `<small>${it[4] ? 'НЗОК: ' + eur(it[4]) : ''}${it[5] ? ' МЗ: ' + eur(it[5]) : ''}</small>` : ''}</td><td class="pl__unit">${esc(it[2])}</td><td class="pl__price">${eur(it[3])}</td></tr>`;
    const total = P.groups.reduce((n, g) => n + g.subs.reduce((m, x) => m + x.items.length, 0), 0);
    HX.sec = sectionOf('pricelist'); HX.cur = 'pricelist';
    const html = hero('Ценоразпис', [['За пациента', '#/patient'], ['Ценоразпис']], `Утвърдена ценова листа на всички медицински и други услуги · в сила от ${M.from}, актуализация ${M.update}.`) +
      `<section class="pl"><div class="vwrap">
        <div class="pl__top">
          <div class="pl__find"><span>${ICON.search}</span><label class="vh" for="plq">Търси услуга или код</label><input id="plq" type="search" placeholder="Търси услуга, изследване или код — напр. ЯМР, ехография, 05-0012" autocomplete="off"><small id="pln">${total} услуги</small></div>
          <div class="pl__docs"><a href="${M.xlsx}" download><b>XLSX</b><span>Пълна ценова листа</span></a><a href="${M.pdf}" target="_blank" rel="noopener"><b>PDF</b><span>Медицински изделия</span></a></div>
        </div>
        <p class="pl__fee">${esc(M.fee)}</p>
        <div class="pl__grid">
          <nav class="pl__nav" aria-label="Раздели">${P.groups.map((g, i) => `<a href="#${gid(i)}" data-g="${i}">${esc(g.t)}<span>${g.subs.reduce((m, x) => m + x.items.length, 0)}</span></a>`).join('')}</nav>
          <div class="pl__main">${P.groups.map((g, i) => `<section class="pl__g" id="${gid(i)}" data-g="${i}"><h2>${esc(g.t)}</h2>${g.subs.map((x) => `<div class="pl__sub">${x.t ? `<h3>${esc(x.t)}</h3>` : ''}<table><thead><tr><th>Код</th><th>Услуга</th><th>Мярка</th><th>Цена с ДДС</th></tr></thead><tbody>${x.items.map(rows).join('')}</tbody></table></div>`).join('')}${g.notes.length ? `<p class="pl__note">${g.notes.map(esc).join('<br>')}</p>` : ''}</section>`).join('')}
            <p class="pl__empty" hidden>Няма услуга, която да отговаря на търсенето. Обадете се на <a href="tel:+35929432170">02 9432 170</a>.</p>
          </div>
        </div>
      </div></section>`;
    return { title: 'Ценоразпис', html, desc: 'Ценова листа на УМБАЛ „Царица Йоанна – ИСУЛ“ — ' + total + ' медицински и други услуги.', init: () => {
      const q = $('#plq'), n = $('#pln');
      q.addEventListener('input', () => {
        const SYN = { 'ямр': 'магнитно', 'мрт': 'магнитно', 'мр': 'магнитно', 'кт': 'компютърн', 'скенер': 'компютърн', 'ехо': 'ехограф', 'ехография': 'ехограф', 'рентген': 'рентген', 'кръв': 'кръв', 'пцр': 'pcr', 'covid': 'covid', 'ковид': 'covid', 'преглед': 'преглед', 'консултация': 'консулт' };
        const raw = fold(q.value.trim()), v = raw, alt = SYN[raw] || ''; let k = 0;
        const re = new RegExp('(^|[^а-яa-z0-9])' + v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        $$('.pl__g').forEach((g) => { let gk = 0; $$('.pl__sub', g).forEach((sb) => { let sk = 0; $$('tbody tr', sb).forEach((tr) => { const hay = tr.dataset.q, ok = !v || (v.length <= 3 ? re.test(hay) : hay.includes(v)) || (alt && hay.includes(alt)); tr.hidden = !ok; if (ok) sk++; }); sb.hidden = !sk; gk += sk; }); g.hidden = !gk; k += gk; const a = $(`.pl__nav a[data-g="${g.dataset.g}"]`); a.hidden = !gk; a.querySelector('span').textContent = gk; });
        n.textContent = v ? `${k} от ${total}` : `${total} услуги`; $('.pl__empty').hidden = !!k;
      });
      $$('.pl__nav a').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const t = document.getElementById(a.getAttribute('href').slice(1)); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 150, behavior: 'smooth' }); }));
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) $$('.pl__nav a').forEach((a) => a.classList.toggle('is-on', a.dataset.g === e.target.dataset.g)); }), { rootMargin: '-30% 0px -60% 0px' });
      $$('.pl__g').forEach((g) => io.observe(g));
    } };
  }
  /* Ръководство: name / role / e-mail lines → people cards (linked to doctor profiles when we have one) */
  /* photos supplied by the hospital for the management (not on isul.eu) */
  const MG_PHOTO = { 'любомир пенев': 'assets/photos/management/lyubomir-penev.jpg' };
  const mgPhoto = (name) => MG_PHOTO[fold(name).replace(/^(проф\.|доц\.|д-р)\s*/g, '').split(',')[0].trim()] || '';
  function mgmtPeople(pg) {
    const ppl = []; let cur = null;
    (pg || { blocks: [] }).blocks.forEach((b) => {
      const x = (b.x || '').trim(); if (!x || b.t === 'h') return;
      const mail = x.match(/[\w.-]+@isul\.eu/i);
      if (mail) { if (cur) cur.mail = mail[0]; return; }
      if (cur && !cur.role && /^[а-яa-z]|^Изпълнителен|^Главн/.test(x)) { cur.role = x.charAt(0).toUpperCase() + x.slice(1); return; }
      cur = { name: x, role: '', mail: '' }; ppl.push(cur);
    });
    return ppl;
  }
  function managementBody(pg) {
    const ppl = []; let cur = null;
    pg.blocks.forEach((b) => {
      const x = (b.x || '').trim(); if (!x || b.t === 'h') return;
      const mail = x.match(/[\w.-]+@isul\.eu/i);
      if (mail) { if (cur) cur.mail = mail[0]; return; }
      if (cur && !cur.role && /^[а-яa-z]|^Изпълнителен|^Главн/.test(x)) { cur.role = x.charAt(0).toUpperCase() + x.slice(1); return; }
      cur = { name: x, role: '', mail: '' }; ppl.push(cur);
    });
    const prof = (n) => { if (!PP) return null; const q = window.ISUL_PEOPLE_API.parse(n, ' '); return q ? PP.list.find((d) => d.key === q.key) : null; };
    return `<div class="mg">${ppl.map((m, i) => { const d = prof(m.name), ini = m.name.replace(/^(проф\.|доц\.|д-р)\s*/gi, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
      return `<article class="mg__c${i === 0 ? ' mg__c--lead' : ''}"><span class="mg__av">${(d && d.img) || mgPhoto(m.name) ? `<img src="${esc((d && d.img) || mgPhoto(m.name))}" alt="${esc(m.name)}">` : ini}</span><div><b>${d ? `<a href="${drUrl(d)}">${esc(m.name)}</a>` : esc(m.name)}</b><span>${esc(m.role)}</span>${m.mail ? `<a class="mg__mail" href="mailto:${esc(m.mail)}">${esc(m.mail)}</a>` : ''}</div></article>`; }).join('')}</div>`;
  }
  /* ---------- ISUL Patient Hub — "За пациента" in variant X ----------
     Everything here comes from the migrated isul.eu content (pages patient / admission / insurance / trials /
     contacts, the clinics and the people index). Nothing is simulated: no booking slots, no results, no indoor map. */
  function patientHub() {
    HX.sec = sectionOf('patient'); HX.cur = 'patient';
    const P = C.pages, CL = C.clinics;
    const blocksOf = (k) => (P[k] || {}).blocks || [];
    const link = (re) => { for (const k of ['patient', 'admission', 'trials', 'contacts']) for (const b of blocksOf(k)) if (b.links && b.links.length && re.test(b.x || '')) return b.links[0]; return ''; };
    const RULES = link(/^Правилник/), ER_RULES = link(/^ПРАВИЛА за извършване/), GDPR = link(/^УВЕДОМЛЕНИЕ/), WAIT = link(/Листа на чакащите/), FEE = link(/^Потребителска такса/);
    const DECL = blocksOf('patient').filter((b) => b.links && /^Декларация/.test(b.x || '')).map((b) => [b.x.trim(), b.links[0]]);
    const LAWS = blocksOf('patient').filter((b) => b.links && /^(Конституция|Закон)/.test(b.x || '')).map((b) => [b.x.trim(), b.links[0]]);
    const ib = blocksOf('insurance'), FUNDS = [];
    ib.forEach((b, i) => { const n = ib[i + 1]; if (b.t === 'h' && n && n.links && n.links.length && /\bАД\b|ЕАД|"/.test(b.x)) FUNDS.push([b.x.trim(), n.links[0]]); });
    const TELK = (() => { const ps = blocksOf('admission').map((b) => (b.x || '').trim()); const out = []; ps.forEach((x, i) => { const m = x.match(/^ТЕЛК комисия № (\d+)/); if (m) out.push({ n: m[1], chair: ps[i + 1] || '', sec: ps[i + 2] || '' }); }); return out; })();
    const PH = { central: '02 9432 170', reg: '02 9432 203', er: '02 9432 203' };
    const ext = (u) => /^https?:/.test(u) ? ' target="_blank" rel="noopener"' : '';
    const pdf = (u) => /\.pdf$/i.test(u) ? ' <span class="phx-tag">PDF</span>' : /\.xlsx?$/i.test(u) ? ' <span class="phx-tag">XLSX</span>' : /^https?:/.test(u) ? ' <span aria-hidden="true">↗</span>' : '';
    const A = (t, u, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(u)}"${ext(u)}>${t}${pdf(u)}</a>`;
    const I = (d) => `<svg class="phx-i" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
    const IC = {
      cal: I('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2"/>'),
      doc: I('<circle cx="12" cy="7" r="3.5"/><path d="M5 21c0-4 3.1-7 7-7s7 3 7 7"/><path d="M15.5 16.5v3M14 18h3"/>'),
      bed: I('<path d="M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="10.5" r="1.8"/>'),
      lab: I('<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7.5 14h9"/>'),
      clinic: I('<path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-5h6v5M12 8v4M10 10h4"/>'),
      euro: I('<path d="M17 6.5A6.5 6.5 0 1 0 17 17.5"/><path d="M4 10h9M4 14h9"/>'),
      phone: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
      pin: I('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
      file: I('<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5M8.5 13h7M8.5 17h5"/>'),
      shield: I('<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>'),
      flask: I('<path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><circle cx="10" cy="15" r="1"/><circle cx="14" cy="17" r="1"/>'),
      body: I('<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7M8 9.5h8M12 14l-3 7M12 14l3 7"/>'),
      card: I('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'),
      virus: I('<circle cx="12" cy="12" r="5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>'),
      users: I('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A5 5 0 0 1 21 19"/>'),
      search: I('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
      route: I('<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>'),
      alert: I('<path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17v.5"/>'),
      arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>')
    };
    const go = (t = 'Към страницата') => `<span class="phx-go">${t}${IC.arrow}</span>`;

    /* ---- 1 · hero + live search ---- */
    const heroHtml = `<header class="phx-hero"><div class="vwrap phx-hero__in">
        ${crumbs([['За пациента']])}
        <p class="phx-kick">Пациентски център</p>
        <h1>Как можем да Ви помогнем?</h1>
        <p class="phx-sub">Всичко необходимо за Вашето посещение, лечение и престой в ИСУЛ — на едно място.</p>
        <div class="phx-search">
          <label class="vh" for="phq">Търсене в сайта на ИСУЛ</label>
          ${IC.search}
          <input id="phq" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="phres" placeholder="Какво търсите днес?" autocomplete="off">
          <div class="phx-res" id="phres" role="listbox" aria-label="Предложения" hidden></div>
        </div>
        <div class="phx-ex"><span>Например:</span>${[['Лекар', 'кардиолог'], ['Клиника', 'клиника по'], ['Записване', 'запази час'], ['Прием', 'прием'], ['Резултати', 'резултати'], ['Цени', 'ценоразпис']].map(([t, q]) => `<button type="button" data-q="${q}">${t}</button>`).join('')}</div>
        <p class="phx-scope">Търсенето обхваща лекарите, клиниките и звената, страниците за пациенти, документите и телефоните на болницата.</p>
      </div></header>`;

    /* ---- 2 · most used services ---- */
    const quick = `<section class="phx-sec phx-quick" aria-labelledby="phx-q-h"><div class="vwrap">
        <h2 id="phx-q-h" class="phx-h2">Най-търсените услуги</h2>
        <div class="phx-qgrid">
          <a class="phx-q phx-q--main" href="#/doctors"><span class="phx-q__n">01</span><span class="phx-q__ic">${IC.doc}</span><b>Намери лекар</b><p>Открийте лекар по име, специалност или клиника.</p>${go('Намери специалист')}</a>
          <a class="phx-q" href="#phx-adm"><span class="phx-q__n">02</span><span class="phx-q__ic">${IC.bed}</span><b>Прием в болницата</b><p>Всичко необходимо за подготовката и постъпването Ви.</p>${go('Информация за прием')}</a>
          <a class="phx-q" href="${LAB}" target="_blank" rel="noopener"><span class="phx-q__n">03</span><span class="phx-q__ic">${IC.lab}</span><b>Изследвания и резултати</b><p>Достъп до лабораторните Ви резултати онлайн в lab.isul.eu.</p>${go('Виж резултатите')}</a>
        </div></div></section>`;

    /* ---- 3 · assistant ---- */
    const docsList = DECL.map(([t, u]) => A(esc(t), u)).join('');
    const GOALS = [
      { id: 'visit', t: 'Искам да посетя специалист', ic: IC.doc, steps: [
        ['Изберете специалист', `Намерете лекар по име или специалност в ${A('Екипа', '#/doctors')}, или по оплакване в ${A('Анатомичния навигатор', '#/navigator')}.`],
        ['Елате на преглед', `Обадете се на телефонната централа ${A('02 9432 170', telOf('02 9432 170'))} и елате в кабинета на клиниката в Диагностично-консултативния блок (ДКБ, II етаж над Спешно отделение), в работни дни от 8 до 14 ч. Изчакайте пред кабинета — редът се определя от медицинската сестра.`],
        ['Консултация по НЗОК', 'С направление №3 консултациите се извършват от Медико-дентален център „ИСУЛ – Царица Йоанна“ — регистратура на V етаж над Спешно отделение.'],
        ['Платена консултация', `В Диагностично-консултативния блок (II етаж над Спешно отделение) или в МДЦ. Цените са в ${A('Ценоразписа', '#/pricelist')}; плащането е на болничната каса.`]],
        cta: [['Как да се прегледам', BOOK], ['Намери лекар', '#/doctors']] },
      { id: 'adm', t: 'Предстои ми прием в болницата', ic: IC.bed, steps: [
        ['Необходими документи', `Направление №7 от общопрактикуващия лекар. При постъпване се подписват: ${docsList}`],
        ['Подготовка', `Прочетете ${A('Правилника за прегледи, изследвания и хоспитализации', RULES)}. Проверете реда си в ${A('Листата на чакащите прием', WAIT)}.`],
        ['Приемно звено', 'Плановата хоспитализация е в работни дни от 8 до 14 ч. — от лекар в съответната клиника и медицинската сестра, завеждаща кабинета.'],
        ['При спешност', `Постъпва се в ${A('Спешно отделение', '#/clinic/20')} — чрез „Бърза помощ“ или индивидуално.`],
        ['Контакти', `Регистратура на Спешно отделение: ${A(PH.reg, telOf(PH.reg))} · Централа: ${A(PH.central, telOf(PH.central))}`]],
        cta: [['Всичко за приема', '#phx-adm'], ['Правилник', RULES]] },
      { id: 'res', t: 'Търся резултати от изследвания', ic: IC.lab, steps: [
        ['Онлайн', `Лабораторните резултати се виждат в ${A('lab.isul.eu', LAB)}.`],
        ['Клинична лаборатория', `${A(CL[24].phones[0], telOf(CL[24].phones[0]))} · ${A(CL[24].emails[0], 'mailto:' + CL[24].emails[0])}`],
        ['Образна диагностика', `КТ, ЯМР, мамография, рентгенография и ехография — ${A('Клиника по образна диагностика', '#/clinic/8')}, ${A(CL[8].phones[0].split(';')[0], telOf(CL[8].phones[0].split(';')[0]))}.`]],
        cta: [['Отвори lab.isul.eu', LAB], ['Всички лаборатории', '#phx-res']] },
      { id: 'pay', t: 'Интересувам се от цени и НЗОК', ic: IC.euro, steps: [
        ['Ценоразпис', `Утвърдената ценова листа на всички услуги — ${A('търсене по услуга', '#/pricelist')}.`],
        ['НЗОК', `Консултации с направление №3 — в МДЦ „ИСУЛ – Царица Йоанна“. ${FEE ? A('Потребителска такса', FEE) : ''}`],
        ['Здравни фондове', `Договор с ${FUNDS.length} фонда: ${FUNDS.map(([t]) => esc(t)).join(', ')}. Прегледите са след амбулаторен лист от администрацията и потвърждение от координаторите на фонда.`],
        ['Здравно неосигурени', `Приемат се чрез ${A('Спешно отделение', '#/clinic/20')}; цените са в ${A('Ценоразписа', '#/pricelist')}.`]],
        cta: [['Ценоразпис', '#/pricelist'], ['Здравни фондове', '#/insurance']] },
      { id: 'cl', t: 'Търся конкретна клиника', ic: IC.clinic, steps: [
        ['Всички клиники', `${clinicList().length} клиники, отделения и лаборатории — ${A('по направления', '#/clinics')}.`],
        ['По оплакване', `Не знаете към коя клиника? ${A('Анатомичният навигатор', '#/navigator')} Ви насочва от зоната на тялото.`],
        ['Къде се намира', `Използвайте ${A('указателя по-долу', '#phx-map')} — телефони, имейли и етаж, където е известен.`]],
        cta: [['Клиники и отделения', '#/clinics'], ['Указател', '#phx-map']] },
      { id: 'ct', t: 'Имам нужда от контакти или упътване', ic: IC.pin, steps: [
        ['Адрес', 'ул. „Бяло море“ №8, София 1527.'],
        ['Телефони', `Централа ${A(PH.central, telOf(PH.central))} · Регистратура ${A(PH.reg, telOf(PH.reg))}`],
        ['Как да стигна', `${A('Маршрут с кола, пеша или градски транспорт', 'route.html')}.`]],
        cta: [['Как да стигна', 'route.html'], ['Контакти', '#/contacts']] }
    ];
    const goalPanel = (g) => `<div class="phx-asst__panel" id="phx-g-${g.id}" role="tabpanel" aria-labelledby="phx-gt-${g.id}" tabindex="0">
        <h3>${esc(g.t)}</h3><ol class="phx-steps">${g.steps.map(([t, d]) => `<li><b>${esc(t)}</b><div>${d}</div></li>`).join('')}</ol>
        <div class="phx-cta">${g.cta.map(([t, u], i) => `<a class="phx-btn${i ? ' phx-btn--o' : ''}" href="${esc(u)}"${ext(u)}>${esc(t)}${/^https?:/.test(u) ? ' ↗' : ' →'}</a>`).join('')}</div></div>`;
    const assistant = `<section class="phx-sec phx-asst" aria-labelledby="phx-a-h"><div class="vwrap">
        <div class="phx-head"><h2 id="phx-a-h" class="phx-h2">Не сте сигурни откъде да започнете?</h2><p>Изберете какво Ви е необходимо и ще Ви насочим към подходящата информация.</p></div>
        <div class="phx-asst__grid">
          <div class="phx-asst__list" role="tablist" aria-label="Какво Ви е необходимо" aria-orientation="vertical">${GOALS.map((g, i) => `<button type="button" role="tab" id="phx-gt-${g.id}" aria-controls="phx-g-${g.id}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}"><span class="phx-asst__ic">${g.ic}</span>${esc(g.t)}</button>`).join('')}</div>
          <div class="phx-asst__out">${GOALS.map((g, i) => goalPanel(g).replace('tabindex="0">', `tabindex="0"${i ? ' hidden' : ''}>`)).join('')}</div>
        </div></div></section>`;

    /* ---- 4 · visit step by step ---- */
    const STAGES = [
      ['Преди посещението', [
        ['Преглед', `В кабинета на клиниката в Диагностично-консултативния блок (ДКБ, II етаж над Спешно отделение), в работни дни от 8 до 14 ч. ${A('Как да се прегледам', BOOK)}`],
        ['Направления', 'За планов прием — направление №7 от общопрактикуващия лекар. За консултация по НЗОК — направление №3.'],
        ['Документи', `Декларациите, които се подписват при постъпване, са в ${A('Документи', '#phx-docs')}.`],
        ['Подготовка за преглед', `Уточнява се с клиниката или кабинета — телефоните са на страницата на всяка ${A('клиника', '#/clinics')}.`],
        ['Как да стигна', `${A('Маршрут до ул. „Бяло море“ 8', 'route.html')}.`]]],
      ['Прием', [
        ['Регистрация', `Регистратура на Спешно отделение: ${A(PH.reg, telOf(PH.reg))}.`],
        ['Планов прием', 'В работни дни от 8 до 14 ч., от лекар в клиниката и медицинската сестра на кабинета, с направление №7.'],
        ['Спешен прием', `Чрез „Бърза помощ“ или индивидуално — ${A('Спешно отделение', '#/clinic/20')}.`],
        ['Административни процедури', `Подписват се декларации за информирано съгласие, здравноосигурителен статус, източник на заплащане и съхранение на ценности.`],
        ['Правила', `${A('Правилник за прегледи, изследвания и хоспитализации', RULES)}.`]]],
      ['Престой', [
        ['Правила за престой', `Уредени в ${A('Правилника на болницата', RULES)}.`],
        ['Посещения и придружители', 'Според Правилника и правилата на съответната клиника — уточнете на телефона ѝ.'],
        ['Права на пациента', LAWS.map(([t, u]) => A(esc(t), u)).join(' · ')],
        ['Пари и ценности', DECL.filter(([t]) => /ценности/.test(t)).map(([t, u]) => A(esc(t), u)).join('')],
        ['Лични данни', `${A('Уведомление за обработка на личните данни', GDPR)}.`]]],
      ['След изписването', [
        ['Контролни прегледи', 'В работни дни от 8 до 14 ч. (в някои кабинети до 16 ч.) в Диагностично-консултативния блок — II етаж над Спешно отделение.'],
        ['Резултати', `Лабораторните резултати — в ${A('lab.isul.eu', LAB)}.`],
        ['След изписване', 'До два контролни прегледа в срок от един месец след изписването не се заплащат — в кабинета на клиниката в ДКБ.']]]
    ];
    const stepper = `<section class="phx-sec phx-visit" aria-labelledby="phx-v-h"><div class="vwrap">
        <div class="phx-head"><h2 id="phx-v-h" class="phx-h2">Вашето посещение — стъпка по стъпка</h2></div>
        <div class="phx-stepper" role="tablist" aria-label="Етапи на посещението">${STAGES.map(([t], i) => `<button type="button" role="tab" id="phx-st-${i}" aria-controls="phx-sp-${i}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}"><span>${i + 1}</span><b>${esc(t)}</b></button>`).join('')}</div>
        ${STAGES.map(([t, items], i) => `<div class="phx-stage" id="phx-sp-${i}" role="tabpanel" aria-labelledby="phx-st-${i}" tabindex="0"${i ? ' hidden' : ''}>${items.map(([h, d]) => `<div class="phx-stage__it"><b>${esc(h)}</b><p>${d}</p></div>`).join('')}</div>`).join('')}
      </div></section>`;

    /* ---- 5 · admission ---- */
    const ADM = [
      ['plan', 'Планов прием', [
        ['Стъпки', '<ol><li>Направление №7 от общопрактикуващия лекар.</li><li>Преглед от лекар в съответната клиника — в работни дни от 8 до 14 ч.</li><li>В зависимост от прегледа — хоспитализация или насочване.</li></ol>'],
        ['Полезни връзки', [A('Листа на чакащите прием пациенти', WAIT), A('Правилник за прегледи, изследвания и хоспитализации', RULES), A('Клиники и отделения', '#/clinics')].join('')],
        ['Документи при постъпване', docsList]]],
      ['er', 'Спешен прием', [
        ['Как', 'При спешно състояние — чрез „Бърза помощ“ или индивидуално, в Спешно отделение с диагностичен стационар.'],
        ['Здравно неосигурени', `Приемат се чрез Спешно отделение; цените са в ${A('Ценоразписа', '#/pricelist')}.`],
        ['Полезни връзки', [A('Спешно отделение', '#/clinic/20'), A('Правила за прегледите в Спешно отделение', ER_RULES)].join('')],
        ['Контакти', `Регистратура ${A(PH.reg, telOf(PH.reg))} · ${A(CL[20].emails[0], 'mailto:' + CL[20].emails[0])}`]]],
      ['nzok', 'По НЗОК', [
        ['Консултации', 'С направление №3 консултациите се извършват от Медико-дентален център „ИСУЛ – Царица Йоанна“. Информация — от регистратурата на V етаж над Спешно отделение или на сайта на центъра.'],
        ['Хоспитализация', 'С направление №7 от общопрактикуващия лекар.'],
        ['Полезни връзки', [FEE ? A('Потребителска такса', FEE) : '', A('Медицински център „ИСУЛ – Царица Йоанна“', '#/clinic/27')].join('')]]],
      ['paid', 'Платени услуги', [
        ['Платена амбулаторна консултация', 'В Диагностично-консултативния блок (ДКБ, II етаж над Спешно отделение) или в Медико-дентален център.'],
        ['Цени и плащане', `Цените са оповестени в ${A('Ценоразписа', '#/pricelist')}. Заплащането се извършва на болничната каса.`],
        ['Здравни фондове', FUNDS.map(([t, u]) => A(esc(t), u)).join('')],
        ['Полезни връзки', [A('Диагностично-консултативен блок', '#/clinic/19'), A('Правилник за достъп до ДКБ', RULES)].join('')]]]
    ];
    const admission = `<section class="phx-sec phx-adm" id="phx-adm" aria-labelledby="phx-ad-h"><div class="vwrap">
        <div class="phx-adm__card">
          <div class="phx-adm__top"><div><p class="phx-kick phx-kick--d">Прием в болницата</p><h2 id="phx-ad-h">Предстои Ви постъпване в ИСУЛ?</h2></div>
            <div class="phx-seg" role="tablist" aria-label="Вид прием">${ADM.map(([id, t], i) => `<button type="button" role="tab" id="phx-at-${id}" aria-controls="phx-ap-${id}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}" data-adm="${id}">${esc(t)}</button>`).join('')}</div></div>
          ${ADM.map(([id, t, rows], i) => `<div class="phx-adm__panel" id="phx-ap-${id}" role="tabpanel" aria-labelledby="phx-at-${id}" tabindex="0"${i ? ' hidden' : ''}>${rows.map(([h, d]) => `<div class="phx-adm__row"><h3>${esc(h)}</h3><div class="phx-links">${d}</div></div>`).join('')}</div>`).join('')}
          <p class="phx-src">Източник: ${A('Прием в болницата', '#/admission')} · ${A('За пациента', P.patient.src || 'https://isul.eu/patient.html')}</p>
        </div></div></section>`;

    /* ---- 6 · examinations and results ---- */
    const LABS = [24, 23, 25, 22, 26].map((id) => CL[id]).filter(Boolean);
    const imgUnits = PP ? PP.unitsOf(8) : [];
    const results = `<section class="phx-sec phx-exam" id="phx-res" aria-labelledby="phx-r-h"><div class="vwrap phx-res__grid">
        <div class="phx-res__main">
          <p class="phx-kick">Изследвания и резултати</p><h2 id="phx-r-h">Вашите изследвания</h2>
          <p>Лабораторните резултати се виждат онлайн в системата на болницата. Указания за подготовка преди изследване дава съответната лаборатория или кабинет — обадете се предварително.</p>
          <a class="phx-btn phx-btn--w" href="${LAB}" target="_blank" rel="noopener">Резултати в lab.isul.eu ↗</a>
          ${imgUnits.length ? `<div class="phx-res__img"><h3>Образна диагностика</h3><div class="phx-chips">${imgUnits.map((u) => `<a href="${unitUrl(u)}">${esc(u.name)}</a>`).join('')}</div><p>${A('Клиника по образна диагностика', '#/clinic/8')} · ${A(CL[8].phones[0].split(';')[0], telOf(CL[8].phones[0].split(';')[0]))}</p></div>` : ''}
        </div>
        <div class="phx-res__labs"><h3>Лаборатории — контакти</h3>${LABS.map((c) => `<div class="phx-lab"><a class="phx-lab__n" href="#/clinic/${c.id}">${esc(c.name)}</a><span>${c.phones[0] ? A(esc(c.phones[0]), telOf(c.phones[0].split(';')[0])) : ''}${c.emails[0] ? A(esc(c.emails[0]), 'mailto:' + c.emails[0]) : ''}</span></div>`).join('')}</div>
      </div></section>`;

    /* ---- 7 · information centre ---- */
    const info = `<section class="phx-sec phx-info" aria-labelledby="phx-i-h"><div class="vwrap">
        <div class="phx-head"><h2 id="phx-i-h" class="phx-h2">Полезна информация</h2></div>
        <div class="phx-igrid">
          <a class="phx-ic phx-ic--wide" href="#/pricelist"><span class="phx-ic__i">${IC.euro}</span><b>Ценоразпис</b><p>Утвърдената ценова листа на всички медицински и други услуги — с търсене по услуга и код.</p>${go('Отвори ценоразписа')}</a>
          <a class="phx-ic" href="#phx-adm" data-adm="nzok"><span class="phx-ic__i">${IC.card}</span><b>НЗОК</b><p>Направления №3 и №7, потребителска такса.</p></a>
          <a class="phx-ic" href="#/insurance"><span class="phx-ic__i">${IC.shield}</span><b>Здравни фондове</b><p>${FUNDS.length} фонда с договор с ИСУЛ.</p></a>
          <a class="phx-ic" href="#/trials"><span class="phx-ic__i">${IC.flask}</span><b>Клинични изпитвания</b><p>Информация: dogovori_tenders@isul.eu · 02 9432 506.</p></a>
          <a class="phx-ic phx-ic--nav" href="#/navigator"><span class="phx-ic__i">${IC.body}</span><b>Анатомичен навигатор</b><p>От зоната на тялото до правилната клиника.</p>${go('Отвори навигатора')}</a>
          <a class="phx-ic" href="#phx-rights"><span class="phx-ic__i">${IC.users}</span><b>Права на пациента</b><p>Основните нормативни актове.</p></a>
          <a class="phx-ic" href="#phx-docs"><span class="phx-ic__i">${IC.file}</span><b>Документи</b><p>Декларации, правилник, лични данни.</p></a>
          <a class="phx-ic" href="#/contacts"><span class="phx-ic__i">${IC.phone}</span><b>Контакти</b><p>Телефони, адрес и маршрут.</p></a>
          <a class="phx-ic phx-ic--muted" href="#/covid"><span class="phx-ic__i">${IC.virus}</span><b>COVID-19</b><p>Тестове и информационни материали.</p></a>
        </div>
        <div class="phx-docs" id="phx-docs">
          <div><h3>Документи за пациента</h3><div class="phx-links">${[...DECL, ['Правилник за прегледи, изследвания и хоспитализации', RULES], ['Правила за прегледите в Спешно отделение', ER_RULES], ['Уведомление за обработка на личните данни', GDPR]].filter(([, u]) => u).map(([t, u]) => A(esc(t), u)).join('')}</div></div>
          <div id="phx-rights"><h3>Права на пациента</h3><div class="phx-links">${LAWS.map(([t, u]) => A(esc(t), u)).join('')}</div>
            ${TELK.length ? `<h3>ТЕЛК комисии в ИСУЛ</h3>${TELK.map((t) => `<p class="phx-telk"><b>ТЕЛК № ${t.n}</b><span>${esc(t.chair)}</span><span>${esc(t.sec)}</span></p>`).join('')}` : ''}</div>
        </div></div></section>`;

    /* ---- 8 · directory ---- */
    const KNOWN_FLOOR = { 19: 'II етаж над Спешно отделение (ДКБ); регистратура на МДЦ — V етаж', 27: 'Регистратура — V етаж над Спешно отделение' };
    const KNOWN_HOURS = { 19: 'Контролни прегледи и консултации: работни дни 8–14 ч. (в някои кабинети до 16 ч.)', 20: 'Денонощно, 24/7' };
    const DIR = clinicList().map((c) => ({ k: 'c' + c.id, cid: +c.id, t: c.name, sub: GROUP_OF[c.id] || '', u: '#/clinic/' + c.id, floor: KNOWN_FLOOR[c.id] || c.floor || '', hours: KNOWN_HOURS[c.id] || '', tel: c.phones[0] || '', mail: c.emails[0] || '' }))
      .concat(PP ? PP.units.map((u) => { const c = CL[u.clinic]; return { k: 'u' + u.slug, unit: u, t: u.name, sub: u.kind + ' · ' + c.name, u: unitUrl(u), floor: c.floor || '', hours: '', tel: c.phones[0] || '', mail: c.emails[0] || '' }; }) : []);
    const dirRow = (d) => `<button type="button" class="phx-dir__it" data-k="${d.k}" data-q="${esc(fold(d.t + ' ' + d.sub))}"><b>${esc(d.t)}</b><small>${esc(d.sub)}</small></button>`;
    const directory = `<section class="phx-sec phx-dir" id="phx-map" aria-labelledby="phx-m-h"><div class="vwrap">
        <div class="phx-head"><h2 id="phx-m-h" class="phx-h2">Намерете своя път в ИСУЛ</h2><p>Открийте лесно клиниката, кабинета или звеното, което търсите.</p></div>
        <div class="phx-dir__grid">
          <div class="phx-dir__side">
            <div class="phx-dir__find">${IC.search}<label class="vh" for="phm">Търсете клиника или звено</label><input id="phm" type="search" placeholder="Търсете клиника или звено" autocomplete="off"></div>
            <div class="phx-dir__list" id="phml">${DIR.map(dirRow).join('')}<p class="phx-empty" hidden>Няма клиника или звено с това име.</p></div>
          </div>
          <div class="phx-dir__card" id="phmc" aria-live="polite"><div class="phx-dir__ph"><span>${IC.pin}</span><p>Изберете клиника или звено от списъка.</p></div></div>
        </div></div></section>`;
    const dirCard = (d) => {
      const row = (lbl, v) => `<div><dt>${lbl}</dt><dd>${v || '<span class="phx-na">Предстои да бъде добавено</span>'}</dd></div>`;
      // where: the board in front of the hospital (places.js), the same data as „Къде да отида?“
      const ps = PL ? (d.unit ? placesOfUnit(d.unit) : placesOf(d.cid)) : [], blocks = [...new Set(ps.map((p) => p.b.id).concat(ps.map((p) => p.via).filter(Boolean)))];
      const bld = [...new Set(ps.map((p) => p.b.name))].join(', '), fls = [...new Set(ps.map((p) => p.floor).filter((f) => !/^Сграда/.test(f)))].join(', ');
      const mapKey = d.unit ? 'u' + d.unit.clinic + ':' + d.unit.slug : 'c' + d.cid;
      return `<p class="phx-kick phx-kick--d">${esc(d.sub)}</p><h3>${esc(d.t)}</h3>
        <dl class="phx-dir__facts">
          ${row('Сграда и вход', bld ? esc(bld) + ' · вход за пациенти от ул. „Бяло море“ № 8' : '')}
          ${row('Етаж', esc(fls || d.floor))}
          ${row('Телефон', d.tel ? d.tel.split(/;\s*/).map((p) => A(esc(p), telOf(p))).join(', ') : '')}
          ${row('Имейл', d.mail ? A(esc(d.mail), 'mailto:' + d.mail) : '')}
          ${row('Работно време', esc(d.hours))}
        </dl>
        ${blocks.length ? `<a class="phx-dir__plan" href="#/kade/${mapKey}" aria-label="Покажи на картата на болницата">${planSvg({ hi: blocks, small: true, label: 'Схема: ' + placeLine(ps).join(', ') })}<span>Покажи на картата →</span></a>`
          : `<p class="phx-dir__nomap">Не е отбелязано на табелата пред болницата. Попитайте на регистратурата: ${A('02 9432 170', telOf('02 9432 170'))}.</p>`}
        <div class="phx-cta"><a class="phx-btn" href="${esc(d.u)}">Към страницата →</a><a class="phx-btn phx-btn--o" href="#/kade/${mapKey}">Къде да отида →</a></div>`;
    };

    /* ---- 9 · FAQ ---- */
    const FAQ = [
      ['Записване', 'Как да се прегледам при лекар от клиника?', `Обадете се на телефонната централа ${A('02 9432 170', telOf('02 9432 170'))} и елате в кабинета на клиниката в Диагностично-консултативния блок (ДКБ, II етаж над Спешно отделение), в работни дни от 8 до 14 ч. Изчакайте пред кабинета на клиниката — редът се определя от медицинската сестра. ${A('Как да се прегледам', BOOK)}`],
      ['Записване', 'Мога ли да се запиша по направление от НЗОК?', 'Да. Консултациите с направление №3 се извършват от Медико-дентален център „ИСУЛ – Царица Йоанна“ (регистратура на V етаж над Спешно отделение).'],
      ['Прием', 'Какво ми трябва за планов прием?', 'Направление №7 от общопрактикуващия лекар. Плановата хоспитализация е в работни дни от 8 до 14 ч. — от лекар в съответната клиника и медицинската сестра, завеждаща кабинета.'],
      ['Прием', 'Как се постъпва по спешност?', `Чрез „Бърза помощ“ или индивидуално — в ${A('Спешно отделение', '#/clinic/20')}. При непосредствена опасност за живота се обадете на 112.`],
      ['Прием', 'Как да разбера кога е моят ред за прием?', `Вижте ${A('Листата на чакащите прием пациенти', WAIT)}, която болницата публикува.`],
      ['Документи', 'Какви документи подписвам при постъпване?', docsList],
      ['НЗОК', 'Каква е потребителската такса?', FEE ? `Вижте ${A('документа за потребителската такса', FEE)}.` : 'Информацията се публикува от болницата.'],
      ['НЗОК', 'Работи ли ИСУЛ със здравни фондове?', `Да — с ${FUNDS.map(([t]) => esc(t)).join(', ')}. Прегледите са след амбулаторен лист от администрацията на болницата и потвърждение от координаторите на фонда.`],
      ['Посещения', 'Какви са правилата за посещения и придружители?', `Уредени са в ${A('Правилника на болницата', RULES)} и в правилата на всяка клиника. Уточнете на телефона на клиниката.`],
      ['Посещения', 'Кога са контролните прегледи след изписване?', 'В работни дни от 8 до 14 ч. (в някои кабинети до 16 ч.) в Диагностично-консултативния блок — II етаж над Спешно отделение.'],
      ['Резултати', 'Къде да видя резултатите си?', `Лабораторните резултати — в ${A('lab.isul.eu', LAB)}. Клинична лаборатория: ${A(CL[24].phones[0], telOf(CL[24].phones[0]))}.`],
      ['Плащания', 'Как се плащат платените услуги?', `Цените са в ${A('Ценоразписа', '#/pricelist')}. Заплащането се извършва на болничната каса.`],
      ['Плащания', 'Нямам здравна осигуровка — къде да отида?', `Здравно неосигурените пациенти се приемат чрез ${A('Спешно отделение', '#/clinic/20')}; цените са в ${A('Ценоразписа', '#/pricelist')}.`]
    ];
    const topics = [...new Set(FAQ.map((f) => f[0]))];
    const faq = `<section class="phx-sec phx-faq" aria-labelledby="phx-f-h"><div class="vwrap phx-faq__grid">
        <div class="phx-faq__side"><h2 id="phx-f-h" class="phx-h2">Често задавани въпроси</h2>
          <div class="phx-dir__find">${IC.search}<label class="vh" for="phf">Търсете във въпросите</label><input id="phf" type="search" placeholder="Търсете във въпросите" autocomplete="off"></div>
          <div class="phx-topics" role="group" aria-label="Теми"><button type="button" aria-pressed="true" data-t="">Всички</button>${topics.map((t) => `<button type="button" aria-pressed="false" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>
        <div class="phx-faq__list" id="phfl">${FAQ.map(([t, q, a]) => `<details class="phx-qa" data-t="${esc(t)}" data-q="${esc(fold(q + ' ' + a.replace(/<[^>]+>/g, ' ')))}"><summary><span class="phx-qa__t">${esc(t)}</span><b>${esc(q)}</b><i aria-hidden="true"></i></summary><div class="phx-qa__a phx-links">${a}</div></details>`).join('')}<p class="phx-empty" hidden>Няма въпрос по това търсене.</p></div>
      </div></section>`;

    /* ---- 10 · contacts and emergency ---- */
    const contacts = `<section class="phx-sec phx-help" aria-labelledby="phx-h-h"><div class="vwrap phx-help__grid">
        <div class="phx-help__main"><p class="phx-kick">Контакти</p><h2 id="phx-h-h">Нуждаете се от съдействие?</h2>
          <dl class="phx-help__tel">${[['Телефонна централа', PH.central], ['Спешно отделение · регистратура', PH.reg]].map(([t, p]) => `<div><dt>${t}</dt><dd>${A(p, telOf(p))}</dd></div>`).join('')}<div><dt>Адрес</dt><dd>ул. „Бяло море“ №8, София 1527</dd></div></dl>
          <div class="phx-cta"><a class="phx-btn phx-btn--w" href="${telOf(PH.central)}">${IC.phone}Обадете се</a><a class="phx-btn phx-btn--ow" href="#/contacts">Контакти</a><a class="phx-btn phx-btn--ow" href="route.html">${IC.pin}Как да стигна</a></div></div>
        <div class="phx-er" role="note"><span class="phx-er__ic">${IC.alert}</span><h3>Спешна помощ</h3><p>При непосредствена опасност за живота: <a href="tel:112"><b>112</b></a></p><p>Спешно отделение на ИСУЛ — денонощно</p><a class="phx-er__tel" href="${telOf(PH.er)}">${PH.er}</a><a class="phx-er__more" href="#/clinic/20">Спешно отделение →</a></div>
      </div></section>`;

    /* ---- floating quick access (desktop) ---- */
    const dock = `<nav class="phx-dock" aria-label="Бърз достъп"><a href="${BOOK}">${IC.cal}<span>Преглед</span></a><a href="#/contacts">${IC.phone}<span>Контакти</span></a><a href="route.html">${IC.pin}<span>Как да стигна</span></a></nav>`;

    const GROUP_MAP = { 'Лекари': 'Лекари', 'Клиники': 'Клиники', 'Страници': 'Информация за пациенти', 'Телефони': 'Контакти' };
    const DOCS_IDX = [...DECL, ...LAWS, ['Правилник за прегледи, изследвания и хоспитализации', RULES], ['Листа на чакащите прием', WAIT], ['Потребителска такса', FEE], ['Уведомление за лични данни', GDPR]].filter(([, u]) => u).map(([t, u]) => ({ g: 'Документи', t, u, ft: fold(t) }));

    return { title: 'За пациента', html: heroHtml + quick + assistant + stepper + admission + results + info + directory + faq + contacts + dock,
      init: () => {
        /* tabs: arrows / Home / End, as in the WAI-ARIA tabs pattern */
        const tabs = (list, onPick) => { const bs = $$('[role="tab"]', list); const pick = (b, focus) => { bs.forEach((x) => { const on = x === b; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; const p = $('#' + x.getAttribute('aria-controls')); if (p) p.hidden = !on; }); if (focus) b.focus(); if (onPick) onPick(b); };
          bs.forEach((b, i) => { b.addEventListener('click', () => pick(b)); b.addEventListener('keydown', (e) => { const k = e.key, n = bs.length; let j = null; if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % n; else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + n) % n; else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1; if (j !== null) { e.preventDefault(); pick(bs[j], true); } }); });
          return pick; };
        tabs($('.phx-asst__list')); tabs($('.phx-stepper'));
        const pickAdm = tabs($('.phx-seg'));
        // in-page anchors (the router uses the hash for pages)
        $$('a[href^="#phx-"]', page).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const t = $(a.getAttribute('href')); if (!t) return; if (a.dataset.adm) pickAdm($('#phx-at-' + a.dataset.adm)); t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }));

        /* live search with grouped suggestions and keyboard navigation */
        const q = $('#phq'), box = $('#phres'); let cur = -1, items = [];
        const close = () => { box.hidden = true; q.setAttribute('aria-expanded', 'false'); q.removeAttribute('aria-activedescendant'); cur = -1; };
        const render = () => {
          const v = q.value.trim(); if (v.length < 2) { close(); return; }
          const fv = fold(v), res = search(v).filter((r) => GROUP_MAP[r.g]).map((r) => ({ ...r, g: r.g === 'Клиники' && /\/unit\//.test(r.u) ? 'Услуги и звена' : GROUP_MAP[r.g] }));
          const docs = DOCS_IDX.filter((d) => fv.split(/\s+/).every((w) => d.ft.includes(w)));
          const order = ['Лекари', 'Клиники', 'Услуги и звена', 'Информация за пациенти', 'Документи', 'Контакти'];
          const all = res.concat(docs); items = [];
          const html = order.map((g) => { const l = all.filter((r) => r.g === g).slice(0, g === 'Лекари' ? 4 : 3); if (!l.length) return ''; return `<div class="phx-res__g" role="group" aria-label="${g}"><p>${g}</p>${l.map((r) => { const i = items.push(r) - 1; return `<a role="option" id="phr-${i}" href="${esc(r.u)}"${ext(r.u)} aria-selected="false">${r.img ? `<img src="${esc(r.img)}" alt="" loading="lazy">` : ''}<span><b>${hl(r.t, v)}</b>${r.m ? `<small>${esc(r.m)}</small>` : ''}</span></a>`; }).join('')}</div>`; }).join('');
          box.innerHTML = html || `<p class="phx-res__none">Няма резултати за „${esc(v)}“. Опитайте с име на лекар, клиника или услуга — или <a href="#/search?q=${encodeURIComponent(v)}">търсене в целия сайт</a>.</p>`;
          if (items.length) box.insertAdjacentHTML('beforeend', `<a class="phx-res__all" href="#/search?q=${encodeURIComponent(v)}">Всички резултати в сайта →</a>`);
          box.hidden = false; q.setAttribute('aria-expanded', 'true'); cur = -1;
        };
        const mark = () => { $$('[role="option"]', box).forEach((o, i) => o.setAttribute('aria-selected', String(i === cur))); if (cur >= 0) { const o = $('#phr-' + cur); q.setAttribute('aria-activedescendant', o.id); o.scrollIntoView({ block: 'nearest' }); } else q.removeAttribute('aria-activedescendant'); };
        q.addEventListener('input', render);
        q.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); cur = (cur + 1) % items.length; mark(); }
          else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); cur = (cur - 1 + items.length) % items.length; mark(); }
          else if (e.key === 'Enter') { e.preventDefault(); if (cur >= 0) $('#phr-' + cur).click(); else if (q.value.trim()) location.hash = '#/search?q=' + encodeURIComponent(q.value.trim()); }
          else if (e.key === 'Escape') close();
        });
        document.addEventListener('click', (e) => { if (!e.target.closest('.phx-search')) close(); });
        $$('.phx-ex button').forEach((b) => b.addEventListener('click', () => { q.value = b.dataset.q; q.focus(); render(); }));

        /* directory */
        const card = $('#phmc');
        $$('#phml .phx-dir__it').forEach((b) => b.addEventListener('click', () => { $$('#phml .phx-dir__it').forEach((x) => x.classList.toggle('is-on', x === b)); card.innerHTML = dirCard(DIR.find((d) => d.k === b.dataset.k)); if (innerWidth < 900) card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
        // the fade at the bottom of the list goes away when it is scrolled to the end
        const phml = $('#phml'), endF = () => phml.classList.toggle('is-end', phml.scrollTop + phml.clientHeight >= phml.scrollHeight - 4); phml.addEventListener('scroll', endF, { passive: true }); endF();
        $('#phm').addEventListener('input', (e) => { const v = fold(e.target.value.trim()); let k = 0; $$('#phml .phx-dir__it').forEach((b) => { const ok = !v || b.dataset.q.includes(v); b.hidden = !ok; if (ok) k++; }); $('#phml .phx-empty').hidden = !!k; });

        /* FAQ: topic + text filter */
        const fst = { t: '', q: '' };
        const frun = () => { let k = 0; $$('#phfl .phx-qa').forEach((d) => { const ok = (!fst.t || d.dataset.t === fst.t) && (!fst.q || d.dataset.q.includes(fst.q)); d.hidden = !ok; if (ok) k++; }); $('#phfl .phx-empty').hidden = !!k; };
        $$('.phx-topics button').forEach((b) => b.addEventListener('click', () => { $$('.phx-topics button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); fst.t = b.dataset.t; frun(); }));
        $('#phf').addEventListener('input', (e) => { fst.q = fold(e.target.value.trim()); frun(); });
      } };
  }
  function contentPage(key, navKey = key) {
    const pg = C.pages[key]; if (!pg) return notFound();
    if (kpFamily(navKey) && !KP_OLD()) return contentKp(key, navKey);
    if (NEW && key === 'management') { const sec = sectionOf(navKey), title = labelOf(navKey); HX.sec = sec; HX.cur = navKey; return { title, html: hero(title, sec ? [[sec.title, '#/' + sec.items[0][0]], [title]] : [[title]], 'Съвет на директорите и ръководство на УМБАЛ „Царица Йоанна – ИСУЛ“ ЕАД.') + `<div class="vwrap pg2-top">${managementBody(pg)}${source(pg.src)}</div>` }; }
    const sec = sectionOf(navKey), title = labelOf(navKey);
    HX.sec = sec; HX.cur = navKey;
    return { title, html: hero(title, sec ? [[sec.title, '#/' + sec.items[0][0]], [title]] : [[title]]) + (NEW ? richPage({ blocks: pg.blocks, src: pg.src, intro: V2 && sec && sec.items[0][0] === navKey && sec.items.length > 2 ? hubTiles(sec, navKey) : '' }) : layout(sec, navKey, blocks(pg.blocks) + source(pg.src))) + (window.ISUL_X && !X_VIDEO.includes(key) ? '' : videoBand()), init: NEW ? richInit : null };
  }
  /* Клиники и отделения: every clinic as a compact card with its units under it; filters above */
  /* ---------- Variant X: Клиники и отделения — premium interactive directory ----------
     Source of truth: C.clinics (isul-content.js), PP.units / PP.inClinic (people.js + units.js), GROUP_OF.
     Cards or list; one clinic expands in place (after its row); filters in a sidebar / bottom sheet on mobile. */
  function clinicsXPage() {
    const groups = GROUPS_ORDER.filter((g) => clinicList().some((c) => GROUP_OF[c.id] === g));
    const list = clinicList().slice().sort((a, b) => groups.indexOf(GROUP_OF[a.id]) - groups.indexOf(GROUP_OF[b.id]) || a.name.localeCompare(b.name, 'bg'));
    const units = PP.units, KINDS = [...new Set(units.map((u) => u.kind))].map((k) => [k, units.filter((u) => u.kind === k).length]).sort((a, b) => b[1] - a[1]);
    const img = (c) => CLINIC_IMG.has(+c.id) ? `assets/photos/clinics/c${c.id}.jpg` : '';
    const tel = (c) => ((c.phones[0] || '').split(/[;,]| и /)[0] || '').trim();
    const headOf = (c) => PP.inClinic(c.id).find((d) => d.head) || null;
    const intro = (c) => { const b = (c.blocks || []).find((x) => x.t === 'p' && x.x && x.x.length > 60); if (!b) return ''; const t = b.x.replace(/\s+/g, ' ').trim(); return t.length > 260 ? t.slice(0, t.lastIndexOf(' ', 255)) + '…' : t; };
    const SYN = { 'magniten-rezonans': 'ямр мрт mri магнитен', 'kompyutarna-tomografia': 'кт скенер ct томограф', 'rentgenografia': 'рентген', 'ehografia': 'ехо ехограф ултразвук', 'mamografia': 'мамограф гърда', 'kohlearna-implantacia': 'слух глухота имплант кохлеарен', 'rak-na-gardata': 'гърда мамология рак', 'nizkodozova-brahiterapia': 'простата брахитерапия', };
    const uq = (u) => fold(u.name + ' ' + u.kind + ' ' + (u.short || '') + ' ' + (u.treats || []).join(' ') + ' ' + (SYN[u.slug] || '') + ' ' + (u.headP ? u.headP.name : ''));
    const cq = (c) => { const h = headOf(c); return fold(c.name + ' ' + shortName(c.name) + ' ' + (GROUP_OF[c.id] || '') + ' ' + (h ? h.name : '') + ' ' + (/УНГ/.test(c.name) ? 'унг уши нос гърло оториноларинголог' : '') + ' ' + PP.unitsOf(c.id).map(uq).join(' ')); };
    const uN = (n) => n + ' ' + (n === 1 ? 'звено' : 'звена');

    /* compact photo card (a real button: it expands the clinic in place) */
    const card = (c) => { const us = PP.unitsOf(c.id), p = img(c);
      return `<article class="cx-item" data-id="${c.id}" data-g="${esc(GROUP_OF[c.id] || '')}" data-kinds="${esc([...new Set(us.map((u) => u.kind))].join('|'))}" data-q="${esc(cq(c))}">
        <button type="button" class="cx-card${p ? '' : ' no-img'}" aria-expanded="false" aria-controls="cx-panel">
          <span class="cx-card__img${p ? ' nwm' : ''}">${p ? `<img src="${p}" alt="" loading="lazy" decoding="async" width="750" height="470">` : '<img class="cx-crest" src="assets/brand/isul-crest-white.svg" alt="">'}</span>
          ${us.length ? `<span class="cx-badge">${uN(us.length)}</span>` : ''}
          <span class="cx-card__body">${CLINIC_ICON[c.id] ? `<span class="cx-ic">${clinicIcon(c.id)}</span>` : ''}<b>${esc(c.name)}</b>${tel(c) ? `<span class="cx-card__tel">${IC.phone}${esc(tel(c))}</span>` : ''}</span>
          <span class="cx-card__go">${IC.arrow}</span>
        </button>
        <div class="cx-row">
          <span class="cx-row__img">${p ? `<img src="${p}" alt="" loading="lazy" decoding="async" width="750" height="470">` : '<img class="cx-crest" src="assets/brand/isul-crest-white.svg" alt="">'}</span>
          <div class="cx-row__b"><p class="cx-row__g">${clinicIcon(c.id)}${esc(GROUP_OF[c.id] || '')}</p><h3><a href="#/clinic/${c.id}">${esc(c.name)}</a></h3>${intro(c) ? `<p class="cx-row__t">${esc(intro(c))}</p>` : ''}
            <p class="cx-row__m">${tel(c) ? `<span>${IC.phone}${esc(tel(c))}</span>` : ''}${us.length ? `<span class="cx-badge cx-badge--l">${uN(us.length)}</span>` : ''}</p></div>
          <button type="button" class="cx-btn cx-btn--o cx-row__more" aria-expanded="false" aria-controls="cx-panel">Подробности</button>
        </div>
      </article>`; };

    /* a unit as a compact light card — inside the expanded clinic, or as a stand-alone result of the kind filter */
    const unitCard = (u, withParent) => { const h = u.headP, c = C.clinics[u.clinic];
      return `<div class="cx-unit"><p class="cx-unit__k">${esc(u.kind)}${u.badge ? ` <span>${esc(u.badge)}</span>` : ''}</p><h4><a href="${unitUrl(u)}">${esc(u.name)}</a></h4>${u.short ? `<p class="cx-unit__t">${esc(u.short)}</p>` : ''}
        ${withParent ? `<p class="cx-unit__p">към <button type="button" class="cx-link" data-open="${c.id}">${esc(c.name)}</button></p>` : ''}
        ${h ? `<a class="cx-head cx-head--s" href="${drUrl(h)}"><span class="cx-av">${h.img ? `<img src="${esc(h.img)}" alt="" loading="lazy">` : esc(initialsOf(h))}</span><span><small>Ръководител</small><b>${esc(h.name)}</b></span></a>` : ''}
        <a class="cx-unit__go" href="${unitUrl(u)}">Към звеното ${IC.arrow}</a></div>`; };

    /* the expanded clinic: a calm white card in the style of the clinic page („Подредба“) — photo, name, short text,
       the head and the contacts on one row, two buttons; the units as a plain list */
    const panelHtml = (c) => { const us = PP.unitsOf(c.id), h = headOf(c), p = img(c), mail = (c.emails || [])[0], t = tel(c);
      const grp = GROUP_OF[c.id], kind = /^Клиника/.test(c.name) ? 'Клиника' : /^Лаборатория/.test(c.name) ? 'Лаборатория' : 'Звено';
      return `<div class="cx-panel__in cxp">
        <button type="button" class="cx-panel__x" aria-label="Затвори">${IC.x}</button>
        <div class="cxp__top">
          <a class="cxp__img${p ? ' nwm' : ''}" href="#/clinic/${c.id}" tabindex="-1" aria-hidden="true">${p ? `<img src="${p}" alt="">` : `<span class="cxp__ph">${clinicIcon(c.id)}</span>`}</a>
          <div class="cxp__b">
            <p class="cxp__k"><span class="cxp__ic">${clinicIcon(c.id)}</span>${esc(kind)}${grp ? ` · ${esc(grp)}` : ''}</p>
            <h3 class="cx-panel__h cxp__h" tabindex="-1">${esc(c.name)}</h3>
            ${intro(c) ? `<p class="cxp__t">${esc(intro(c))}</p>` : ''}
            <div class="cxp__row">
              ${h ? `<a class="cxp__head" href="${drUrl(h)}"><span class="cxp__av">${h.img ? `<img src="${esc(h.img)}" alt="" loading="lazy">` : esc(initialsOf(h))}</span><span><b>${esc(h.name)}</b><small>Ръководител</small></span></a>` : ''}
              <ul class="cxp__ct">
                ${t ? `<li><a href="${telOf(t)}">${ICON.tel}<span>${esc(t)}</span></a></li>` : ''}
                ${mail ? `<li><a href="mailto:${esc(mail)}">${ICON.mail}<span>${esc(mail)}</span></a></li>` : ''}
                ${c.floor ? `<li>${ICON.pin}<span>${esc(c.floor)}</span></li>` : ''}
              </ul>
            </div>
            <div class="cxp__cta"><a class="cxp__btn" href="#/clinic/${c.id}">Към ${kind === 'Клиника' ? 'клиниката' : kind === 'Лаборатория' ? 'лабораторията' : 'звеното'} ${IC.arrow}</a><a class="cxp__btn cxp__btn--o" href="${BOOK}">Как да се прегледам</a><a class="cxp__lnk" href="#/clinic/${c.id}/team">Медицински екип</a></div>
          </div>
        </div>
        ${us.length ? `<div class="cxp__units"><p class="cxp__uh">Специализирани звена <span>${us.length}</span></p><ul>${us.map((u) => `<li><a href="${unitUrl(u)}"><span><b>${esc(u.name)}</b><small>${esc(u.kind)}</small></span>${IC.arrow}</a></li>`).join('')}</ul></div>` : ''}
      </div>`; };

    const filters = `<aside class="cx-side" id="cx-side" aria-label="Филтри">
        <div class="cx-side__top"><b>Филтри</b><button type="button" class="cx-side__x" aria-label="Затвори филтрите">${IC.x}</button></div>
        <div class="cx-side__scroll">
          <p class="cx-side__h" id="cx-g-h">Клиники и отделения</p>
          <div class="cx-opts cx-opts--c" role="group" aria-labelledby="cx-g-h"><button type="button" data-g="" aria-pressed="true">Всички клиники<span>${list.length}</span></button>${list.slice().sort((a, b) => a.name.localeCompare(b.name, 'bg')).map((c) => `<button type="button" data-c="${c.id}" aria-pressed="false">${clinicIcon(c.id)}<em>${esc(c.name)}</em></button>`).join('')}</div>
          <button type="button" class="cx-side__acc" aria-expanded="false" aria-controls="cx-kinds">Звена по вид <span>${units.length}</span>${IC.chev}</button>
          <div class="cx-opts" id="cx-kinds" role="group" aria-label="Звена по вид" hidden><button type="button" data-k="" aria-pressed="true">Всички клиники</button>${KINDS.map(([k, n]) => `<button type="button" data-k="${esc(k)}" aria-pressed="false">${esc(k)}<span>${n}</span></button>`).join('')}</div>
        </div>
        <div class="cx-side__foot"><button type="button" class="cx-btn cx-btn--o" data-clear>Изчисти</button><button type="button" class="cx-btn" data-done>Покажи резултатите</button></div>
      </aside>`;

    const html = hero('Клиники и отделения', [['Клиники и отделения']], `<span class="cx-stats"><b>${list.length}</b> клиники и отделения <i aria-hidden="true">·</i> <b>${units.length}</b> специализирани звена</span>`) +
      `<section class="cx"><div class="vwrap cx__grid">
        ${filters}
        <div class="cx__main">
          <div class="cx-search" role="search">
            ${IC.search}<label class="vh" for="cxq">Търсене в клиниките</label>
            <input id="cxq" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="cx-sugg" placeholder="Търсете клиника, отделение, изследване или лекар…" autocomplete="off">
            <button type="button" class="cx-search__clear" aria-label="Изчисти търсенето" hidden>${IC.x}</button>
            <div class="cx-sugg" id="cx-sugg" role="listbox" aria-label="Предложения" hidden></div>
          </div>
          <div class="cx-bar">
            <p class="cx-bar__n" id="cx-n" aria-live="polite"></p>
            <div class="cx-bar__chips" id="cx-chips"></div>
            <button type="button" class="cx-bar__f" aria-controls="cx-side" aria-expanded="false">${IC.filter}Филтри<span id="cx-fc" hidden></span></button>
          </div>
          <div class="cx-results is-list" id="cx-res">${list.map(card).join('')}</div>
          <div class="cx-units cx-units--res" id="cx-ures" hidden></div>
          <div class="cx-empty" id="cx-empty" hidden><b>Не открихме резултати по зададените критерии.</b><p>Опитайте с друга дума или изчистете филтрите.</p><div class="cx-cta"><button type="button" class="cx-btn" data-clear>Изчисти филтрите</button><a class="cx-btn cx-btn--o" href="#/navigator">Анатомичен навигатор</a></div></div>
        </div>
      </div></section>`;

    return { title: 'Клиники и отделения', html, init: () => {
      const root = $('.cx', page), res = $('#cx-res'), ures = $('#cx-ures'), side = $('#cx-side');
      const st = { g: '', k: '', q: '', view: 'list' };   // only the list (the user dropped the cards view)
      const items = $$('.cx-item', res);
      let openId = null, opener = null;
      const panel = document.createElement('div'); panel.id = 'cx-panel'; panel.className = 'cx-panel'; panel.setAttribute('role', 'region'); panel.hidden = true;

      /* expand one clinic after the row that holds it */
      const visible = () => items.filter((x) => !x.hidden);
      const placePanel = () => {
        if (openId === null) return;
        const it = items.find((x) => x.dataset.id === openId); if (!it || it.hidden) { closePanel(false); return; }
        const top = it.offsetTop; let last = it;
        visible().forEach((x) => { if (x.offsetTop === top) last = x; });
        if (last.nextElementSibling !== panel) last.after(panel);
      };
      const openPanel = (id, from) => {
        if (openId === id) { closePanel(true); return; }
        const c = C.clinics[id]; openId = String(id); opener = from || null;
        items.forEach((x) => $$('[aria-expanded]', x).forEach((b) => b.setAttribute('aria-expanded', String(x.dataset.id === openId))));
        items.forEach((x) => x.classList.toggle('is-open', x.dataset.id === openId));
        $$('[data-c]', side).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === openId)));
        panel.innerHTML = panelHtml(c); panel.setAttribute('aria-label', c.name); panel.hidden = false;
        placePanel();
        $('.cx-panel__x', panel).addEventListener('click', () => closePanel(true));
        const h = $('.cx-panel__h', panel); h.focus({ preventScroll: true });
        const r = panel.getBoundingClientRect(); if (r.top < 90 || r.top > innerHeight * .6) window.scrollTo({ top: scrollY + r.top - 110, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      };
      const closePanel = (focusBack) => {
        const id = openId; openId = null; panel.hidden = true; panel.remove();
        items.forEach((x) => { x.classList.remove('is-open'); $$('[aria-expanded]', x).forEach((b) => b.setAttribute('aria-expanded', 'false')); });
        $$('[data-c]', side).forEach((b) => b.setAttribute('aria-pressed', 'false'));
        if (focusBack && opener && document.contains(opener)) opener.focus();
        else if (focusBack && id) { const b = $(`.cx-item[data-id="${id}"] ${st.view === 'list' ? '.cx-row__more' : '.cx-card'}`, res); if (b) b.focus(); }
      };
      items.forEach((it) => { $('.cx-card', it).addEventListener('click', (e) => openPanel(it.dataset.id, e.currentTarget)); $('.cx-row__more', it).addEventListener('click', (e) => openPanel(it.dataset.id, e.currentTarget)); });
      panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closePanel(true); } });
      root.addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (b) { if (st.k) setKind(''); openPanel(b.dataset.open, null); } });
      let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(placePanel, 120); });

      /* filtering */
      const matchC = (x) => (!st.g || x.dataset.g === st.g) && (!st.q || x.dataset.q.includes(st.q));
      const run = () => {
        if (st.k) {   // unit kind → the real units of that kind, each with its parent clinic
          const us = units.filter((u) => u.kind === st.k && (!st.g || GROUP_OF[u.clinic] === st.g) && (!st.q || uq(u).includes(st.q) || fold(C.clinics[u.clinic].name).includes(st.q)));
          res.hidden = true; ures.hidden = !us.length; ures.innerHTML = us.map((u) => unitCard(u, true)).join('');
          $('#cx-n').innerHTML = `Показани <b>${us.length}</b> ${us.length === 1 ? 'звено' : 'звена'} · ${esc(st.k)}`;
          $('#cx-empty').hidden = !!us.length; if (openId) closePanel(false);
        } else {
          res.hidden = false; ures.hidden = true; let k = 0;
          items.forEach((x) => { const ok = matchC(x); x.hidden = !ok; if (ok) k++; });
          $('#cx-n').innerHTML = `Показани <b>${k}</b> от ${list.length} клиники`;
          $('#cx-empty').hidden = !!k; placePanel();
        }
        const chips = [];
        if (st.g) chips.push(['g', st.g]); if (st.k) chips.push(['k', st.k]); if (st.q) chips.push(['q', '„' + $('#cxq').value.trim() + '“']);
        $('#cx-chips').innerHTML = chips.map(([t, v]) => `<button type="button" class="cx-chip" data-rm="${t}" aria-label="Премахни филтъра ${esc(v)}">${esc(v)}${IC.x}</button>`).join('') + (chips.length ? '<button type="button" class="cx-chip cx-chip--clear" data-clear>Изчисти</button>' : '');
        const fc = (st.g ? 1 : 0) + (st.k ? 1 : 0); $('#cx-fc').hidden = !fc; $('#cx-fc').textContent = fc;
        $$('[data-done]', side).forEach((b) => { b.textContent = `Покажи резултатите (${st.k ? ures.children.length : visible().length})`; });
      };
      const setGroup = (g) => { st.g = g; $$('[data-g]', side).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.g === g))); run(); };
      const setKind = (k) => { st.k = k; $$('[data-k]', side).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k))); if (k) { $('.cx-side__acc', side).setAttribute('aria-expanded', 'true'); $('#cx-kinds').hidden = false; } run(); };
      const clearAll = () => { st.g = ''; st.k = ''; st.q = ''; $('#cxq').value = ''; $('.cx-search__clear').hidden = true; $$('[data-g]', side).forEach((b) => b.setAttribute('aria-pressed', String(!b.dataset.g))); $$('[data-k]', side).forEach((b) => b.setAttribute('aria-pressed', String(!b.dataset.k))); run(); };
      $$('[data-g]', side).forEach((b) => b.addEventListener('click', () => setGroup(b.dataset.g)));
      $$('[data-k]', side).forEach((b) => b.addEventListener('click', () => setKind(b.dataset.k)));
      $('.cx-side__acc', side).addEventListener('click', (e) => { const on = e.currentTarget.getAttribute('aria-expanded') !== 'true'; e.currentTarget.setAttribute('aria-expanded', String(on)); $('#cx-kinds').hidden = !on; });
      side.addEventListener('click', (e) => { if (e.target.closest('[data-clear]')) clearAll(); });
      root.addEventListener('click', (e) => { if (e.target.closest('[data-clear]')) clearAll(); const rm = e.target.closest('[data-rm]'); if (rm) { if (rm.dataset.rm === 'g') setGroup(''); if (rm.dataset.rm === 'k') setKind(''); if (rm.dataset.rm === 'q') { st.q = ''; $('#cxq').value = ''; $('.cx-search__clear').hidden = true; run(); } } });


      /* mobile: the sidebar becomes a bottom sheet */
      const fbtn = $('.cx-bar__f', root); let lastF = null;
      // the page wrapper animates with a transform, which would trap position:fixed — the sheet lives in <body> while open
      const home = document.createComment('cx-side');
      const sheet = (on) => { if (on) { side.replaceWith(home); document.body.appendChild(side); void side.offsetWidth; } else setTimeout(() => { if (home.parentNode) home.replaceWith(side); }, 260);
        side.classList.toggle('is-sheet', on); fbtn.setAttribute('aria-expanded', String(on)); document.documentElement.style.overflow = on ? 'hidden' : ''; if (on) { lastF = document.activeElement; side.setAttribute('role', 'dialog'); side.setAttribute('aria-modal', 'true'); setTimeout(() => $('.cx-side__x', side).focus(), 30); } else { side.removeAttribute('role'); side.removeAttribute('aria-modal'); if (lastF) lastF.focus(); } };
      fbtn.addEventListener('click', () => sheet(true));
      $('.cx-side__x', side).addEventListener('click', () => sheet(false));
      $$('[data-done]', side).forEach((b) => b.addEventListener('click', () => sheet(false)));
      /* a clinic in the sidebar list: show all clinics and expand that one in place */
      $$('[data-c]', side).forEach((b) => b.addEventListener('click', () => {
        if (side.classList.contains('is-sheet')) sheet(false);
        if (st.k || st.g || st.q) { st.k = ''; st.g = ''; st.q = ''; $('#cxq').value = ''; $('.cx-search__clear').hidden = true; $$('[data-k]', side).forEach((x) => x.setAttribute('aria-pressed', String(!x.dataset.k))); run(); }
        if (openId !== b.dataset.c) openPanel(b.dataset.c, b);
      }));
      side.addEventListener('keydown', (e) => { if (!side.classList.contains('is-sheet')) return; if (e.key === 'Escape') { e.preventDefault(); sheet(false); } if (e.key === 'Tab') { const f = $$('button, a', side).filter((x) => x.offsetParent); const a0 = f[0], a1 = f[f.length - 1]; if (e.shiftKey && document.activeElement === a0) { e.preventDefault(); a1.focus(); } else if (!e.shiftKey && document.activeElement === a1) { e.preventDefault(); a0.focus(); } } });

      /* search: filters the catalogue + grouped suggestions with keyboard navigation */
      const q = $('#cxq'), sug = $('#cx-sugg'), clr = $('.cx-search__clear'); let cur = -1, opts = [];
      const closeSug = () => { sug.hidden = true; q.setAttribute('aria-expanded', 'false'); q.removeAttribute('aria-activedescendant'); cur = -1; };
      const suggest = () => {
        const v = q.value.trim(), fv = fold(v); if (fv.length < 2) { closeSug(); return; }
        const cl = list.filter((c) => cq(c).includes(fv)).slice(0, 5).map((c) => ({ g: 'Клиники', t: c.name, m: GROUP_OF[c.id] || '', open: c.id }));
        const un = units.filter((u) => uq(u).includes(fv)).slice(0, 4).map((u) => ({ g: 'Звена', t: u.name, m: u.kind + ' · ' + C.clinics[u.clinic].name, u: unitUrl(u) }));
        const dr = PP.list.filter((d) => fold(d.name).includes(fv)).slice(0, 4).map((d) => ({ g: 'Лекари', t: d.name, m: (d.role ? d.role + ' · ' : '') + shortName(C.clinics[d.clinic].name), u: drUrl(d), img: d.img }));
        opts = cl.concat(un, dr);
        sug.innerHTML = opts.length ? ['Клиники', 'Звена', 'Лекари'].map((g) => { const l = opts.filter((o) => o.g === g); return l.length ? `<div role="group" aria-label="${g}"><p>${g}</p>${l.map((o) => { const i = opts.indexOf(o); return `<${o.u ? `a href="${esc(o.u)}"` : `button type="button" data-open="${o.open}"`} role="option" id="cx-o${i}" aria-selected="false">${o.img ? `<img src="${esc(o.img)}" alt="" loading="lazy">` : ''}<span><b>${hl(o.t, v)}</b><small>${esc(o.m)}</small></span></${o.u ? 'a' : 'button'}>`; }).join('')}</div>` : ''; }).join('') : `<p class="cx-sugg__none">Няма съвпадения за „${esc(v)}“.</p>`;
        sug.hidden = false; q.setAttribute('aria-expanded', 'true'); cur = -1;
      };
      const markOpt = () => { $$('[role="option"]', sug).forEach((o, i) => o.setAttribute('aria-selected', String(i === cur))); if (cur >= 0) { q.setAttribute('aria-activedescendant', 'cx-o' + cur); $('#cx-o' + cur).scrollIntoView({ block: 'nearest' }); } };
      q.addEventListener('input', () => { st.q = fold(q.value.trim()); clr.hidden = !q.value; if (st.k && st.q) setKind(''); run(); suggest(); });
      q.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' && opts.length) { e.preventDefault(); if (sug.hidden) suggest(); cur = (cur + 1) % opts.length; markOpt(); }
        else if (e.key === 'ArrowUp' && opts.length) { e.preventDefault(); cur = (cur - 1 + opts.length) % opts.length; markOpt(); }
        else if (e.key === 'Enter') { e.preventDefault(); if (cur >= 0) $('#cx-o' + cur).click(); else closeSug(); }
        else if (e.key === 'Escape') { if (!sug.hidden) closeSug(); else if (q.value) { q.value = ''; st.q = ''; clr.hidden = true; run(); } }
      });
      sug.addEventListener('click', (e) => { if (e.target.closest('[role="option"]')) closeSug(); });
      clr.addEventListener('click', () => { q.value = ''; st.q = ''; clr.hidden = true; closeSug(); run(); q.focus(); });
      document.addEventListener('click', (e) => { if (!e.target.closest('.cx-search')) closeSug(); });

      run();
    } };
  }
  function clinicsIndex() {
    if (window.ISUL_X) return clinicsXPage();
    const LOCAL = CLINIC_IMG;
    const thumb = (c) => LOCAL.has(+c.id) ? `assets/photos/clinics/c${c.id}.jpg` : '';
    const groups = GROUPS_ORDER.filter((g) => clinicList().some((c) => GROUP_OF[c.id] === g));
    const list = clinicList().slice().sort((a, b) => groups.indexOf(GROUP_OF[a.id]) - groups.indexOf(GROUP_OF[b.id]) || a.name.localeCompare(b.name, 'bg'));
    const nUnits = PP.units.length;
    const tel = (c) => ((c.phones[0] || '').split(/[;,]| и /)[0] || '').trim();
    const card = (c) => {
      const us = PP.unitsOf(c.id), head = PP.inClinic(c.id).find((d) => d.head), docs = PP.inClinic(c.id).length;
      const SYN = { 'magniten-rezonans': 'ямр мрт mri', 'kompyutarna-tomografia': 'кт скенер ct', 'rentgenografia': 'рентген', 'ehografia': 'ехо ехограф ултразвук', 'mamografia': 'мамограф гърда', 'kohlearna-implantacia': 'слух глухота имплант', 'rak-na-gardata': 'гърда мамология', 'nizkodozova-brahiterapia': 'простата брахитерапия' };
      const q = fold(c.name + ' ' + (GROUP_OF[c.id] || '') + ' ' + us.map((u) => u.name + ' ' + (u.treats || []).join(' ') + ' ' + (SYN[u.slug] || '')).join(' '));
      return `<article class="ck3" data-g="${esc(GROUP_OF[c.id] || '')}" data-u="${us.length ? 1 : 0}" data-q="${esc(q)}">
        <a class="ck3__top" href="#/clinic/${c.id}">
          <span class="ck3__img${thumb(c) ? ' nwm' : ''}">${thumb(c) ? `<img src="${thumb(c)}" alt="" loading="lazy">` : '<img src="assets/brand/isul-crest-white.svg" alt="" class="ck3__crest">'}</span>
          <span class="ck3__t"><small>${esc(GROUP_OF[c.id] || '')}</small><b>${esc(c.name)}</b><em>${[tel(c), docs ? docs + (docs === 1 ? ' лекар' : ' лекари') : '', us.length ? us.length + (us.length === 1 ? ' звено' : ' звена') : ''].filter(Boolean).join(' · ')}</em></span>
          <span class="ck3__go" aria-hidden="true">→</span>
        </a>
        ${us.length ? `<ul class="ck3__units">${us.map((u) => `<li><a href="${unitUrl(u)}" data-q="${esc(fold(u.name + ' ' + (SYN[u.slug] || '')))}"><span class="ck3__k">${esc(u.kind)}</span><span class="ck3__n">${esc(u.name)}</span>${u.badge ? `<span class="ck3__b${/Само/.test(u.badge) ? ' is-only' : ''}">${esc(u.badge)}</span>` : ''}</a></li>`).join('')}</ul>` : ''}
      </article>`;
    };
    /* variant X: every clinic as a picture card, its units as smaller cards right under it */
    const KIND_ICO = { 'Отделение': '<path d="M4 20V8l8-4 8 4v12"/><path d="M9 20v-5h6v5M12 8v4M10 10h4"/>', 'Апаратура': '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><circle cx="12" cy="10" r="3"/>', 'Референтен център': '<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>', 'Център': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/>', 'Кабинет': '<path d="M6 21V4h12v17M3 21h18"/><circle cx="14.5" cy="12.5" r=".8"/>', 'Катедра': '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/>', 'Метод на лечение': '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>' };
    /* the extra information shown when one field is chosen (hidden in the "all" overview) */
    const intro4 = (c) => { const b = (c.blocks || []).find((x) => x.t === 'p' && x.x && x.x.length > 60); if (!b) return ''; const t = b.x.replace(/\s+/g, ' ').trim(); return t.length > 230 ? t.slice(0, t.lastIndexOf(' ', 225)) + '…' : t; };
    const more4 = (c) => {
      const head = PP.inClinic(c.id).find((d) => d.head), phone = tel(c), mail = (c.emails || [])[0], intro = intro4(c);
      return `<div class="ck4__more">
          <span class="ck4__pill">${esc(GROUP_OF[c.id] || 'Клиника')}</span>
          <h3 class="ck4__title"><a href="#/clinic/${c.id}">${esc(c.name)}</a></h3>
          ${intro ? `<p class="ck4__intro">${esc(intro)}</p>` : ''}
          ${head ? `<a class="ck4__head" href="${drUrl(head)}"><span class="ck4__av">${head.img ? `<img src="${esc(head.img)}" alt="" loading="lazy">` : esc(initialsOf(head))}</span><span><small>Ръководител</small><b>${esc(head.name)}</b></span></a>` : ''}
          <dl class="ck4__facts">
            ${phone ? `<div><dt>Телефон</dt><dd><a href="${telOf(phone)}">${esc(phone)}</a></dd></div>` : ''}
            ${mail ? `<div><dt>Имейл</dt><dd><a href="mailto:${esc(mail)}">${esc(mail)}</a></dd></div>` : ''}
            ${c.floor ? `<div><dt>Място</dt><dd>${esc(c.floor)}</dd></div>` : ''}
          </dl>
          <div class="ck4__cta"><a class="ck4__btn" href="#/clinic/${c.id}">Към клиниката →</a><a class="ck4__btn ck4__btn--o" href="${BOOK}">Как да се прегледам</a></div>
        </div>`;
    };
    /* a unit (department, centre, machine…) as its own studio-style card: kind, name, text, head, buttons */
    const SYN4 = { 'magniten-rezonans': 'ямр мрт mri магнитен', 'kompyutarna-tomografia': 'кт скенер ct томограф', 'rentgenografia': 'рентген', 'ehografia': 'ехо ехограф ултразвук', 'mamografia': 'мамограф гърда', 'kohlearna-implantacia': 'слух глухота имплант кохлеарен', 'rak-na-gardata': 'гърда мамология рак', 'nizkodozova-brahiterapia': 'простата брахитерапия' };
    const unit4 = (c, u) => {
      const h = u.headP;
      return `<div class="ck4__u" data-q="${esc(fold(u.name + ' ' + u.kind + ' ' + (u.short || '') + ' ' + (u.treats || []).join(' ') + ' ' + (SYN4[u.slug] || '') + ' ' + (h ? h.name : '')))}" data-kind="${esc(u.kind)}">
          <a class="ck4__uimg${thumb(c) ? ' nwm' : ''}" href="${unitUrl(u)}" tabindex="-1" aria-hidden="true"${thumb(c) ? ` style="background-image:url('${thumb(c)}')"` : ''}><span class="ck4__ico"><svg viewBox="0 0 24 24">${KIND_ICO[u.kind] || KIND_ICO['Отделение']}</svg></span></a>
          <div class="ck4__ub">
            <div class="ck4__ubadges"><span class="ck4__pill">${esc(u.kind)}</span>${u.badge ? `<span class="ck4__pill ck4__pill--b${/Само/.test(u.badge) ? ' is-only' : ''}">${esc(u.badge)}</span>` : ''}</div>
            <h4 class="ck4__utitle"><a href="${unitUrl(u)}">${esc(u.name)}</a></h4>
            ${u.short ? `<p class="ck4__ushort">${esc(u.short)}</p>` : ''}
            ${h ? `<a class="ck4__head ck4__head--s" href="${drUrl(h)}"><span class="ck4__av">${h.img ? `<img src="${esc(h.img)}" alt="" loading="lazy">` : esc(initialsOf(h))}</span><span><small>Ръководител</small><b>${esc(h.name)}</b></span></a>` : ''}
            <div class="ck4__cta"><a class="ck4__btn" href="${unitUrl(u)}">Към звеното →</a><a class="ck4__btn ck4__btn--o" href="${BOOK}">Как да се прегледам</a></div>
          </div>
        </div>`;
    };
    const card4 = (c) => {
      const us = PP.unitsOf(c.id), docs = PP.inClinic(c.id).length;
      const hd = PP.inClinic(c.id).find((d) => d.head);
      const q = fold(c.name + ' ' + (GROUP_OF[c.id] || '') + ' ' + (hd ? hd.name : '') + ' ' + us.map((u) => u.name + ' ' + u.kind + ' ' + (u.short || '') + ' ' + (u.treats || []).join(' ') + ' ' + (SYN4[u.slug] || '') + ' ' + (u.headP ? u.headP.name : '')).join(' '));
      return `<article class="ck4${us.length ? ' has-u' : ''}" data-g="${esc(GROUP_OF[c.id] || '')}" data-u="${us.length ? 1 : 0}" data-kinds="${esc([...new Set(us.map((u) => u.kind))].join('|'))}" data-q="${esc(q)}">
        <a class="ck4__card${thumb(c) ? '' : ' no-img'}" href="#/clinic/${c.id}">
          <span class="ck4__img${thumb(c) ? ' nwm' : ''}">${thumb(c) ? `<img src="${thumb(c)}" alt="" loading="lazy">` : '<img src="assets/brand/isul-crest-white.svg" alt="" class="ck4__crest">'}</span>
          <span class="ck4__body"><small>${esc(GROUP_OF[c.id] || '')}</small><b>${esc(c.name)}</b><em>${esc(tel(c))}</em></span>
          ${us.length ? `<span class="ck4__ucount">${us.length} ${us.length === 1 ? 'звено' : 'звена'}</span>` : ''}
          <span class="ck4__go" aria-hidden="true">→</span>
        </a>
        ${more4(c)}
        ${us.length ? `<div class="ck4__units"><p class="ck4__of"><span>Звена на</span> ${esc(c.name)}</p>${us.map((u) => unit4(c, u)).join('')}</div>` : ''}
      </article>`;
    };
    const X = !!window.ISUL_X;
    const KINDS = [...new Set(PP.units.map((u) => u.kind))].map((k) => [k, PP.units.filter((u) => u.kind === k).length]).sort((a, b) => b[1] - a[1]);
    const xGrid = groups.map((g) => { const cs = list.filter((c) => GROUP_OF[c.id] === g); return `<section class="ck4grp"><h2>${esc(g)}<span>${cs.length}</span></h2><div class="ck4row">${cs.map(card4).join('')}</div></section>`; }).join('');
    const xBody = `<section class="dix2 ck4s"><div class="vwrap dix2__grid">
        <aside class="dix2__side">
          <h3>Направление</h3>
          <div class="jb__f" id="ckg"><button type="button" aria-pressed="true" data-v="">Всички клиники<span>${list.length}</span></button>${groups.map((g) => `<button type="button" aria-pressed="false" data-v="${esc(g)}">${esc(g)}<span>${list.filter((c) => GROUP_OF[c.id] === g).length}</span></button>`).join('')}</div>
          <h3>Звена по вид</h3>
          <div class="jb__f" id="ckk"><button type="button" aria-pressed="true" data-k="">Всички звена<span>${nUnits}</span></button>${KINDS.map(([k, n]) => `<button type="button" aria-pressed="false" data-k="${esc(k)}">${esc(k)}<span>${n}</span></button>`).join('')}</div>
        </aside>
        <div class="dix2__main">
          <div class="jb__find ck4__find"><span>${ICON.search}</span><label class="vh" for="ckq">Търси клиника или отделение</label><input id="ckq" type="search" placeholder="Търсете клиника, отделение, изследване или лекар — напр. ЯМР, кохлеарна, кардиология…" autocomplete="off"></div>
          <p class="dix__n" id="ckn"></p>
          <div class="ck4g" id="ckgrid">${xGrid}</div>
          <p class="jb__empty" id="ckempty" hidden><span id="ckwhy">Няма клиника или отделение по това търсене.</span> <button type="button" class="ck3f__reset" id="ckreset">Покажи всички клиники</button> <a href="#/navigator">или опитайте анатомичния навигатор →</a></p></div>
      </div></section>`;
    return { title: 'Клиники и отделения', html: hero('Клиники и отделения', [['Клиники и отделения']], `${list.length} клиники, отделения и лаборатории и ${nUnits} звена с отделни страници — отделения, референтни центрове и апаратура.`) + (X ? xBody :
      `<section class="ck3s"><div class="vwrap">
        <div class="ck3f">
          <div class="jb__find"><span>${ICON.search}</span><label class="vh" for="ckq">Търси клиника или отделение</label><input id="ckq" type="search" placeholder="Клиника, отделение или изследване — напр. ЯМР, кохлеарна, гърда…" autocomplete="off"></div>
          <div class="ck3f__chips" id="ckg"><button type="button" aria-pressed="true" data-v="">Всички<span>${list.length}</span></button>${groups.map((g) => `<button type="button" aria-pressed="false" data-v="${esc(g)}">${esc(g)}<span>${list.filter((c) => GROUP_OF[c.id] === g).length}</span></button>`).join('')}<button type="button" aria-pressed="false" data-units="1" class="ck3f__units">Със звена<span>${list.filter((c) => PP.unitsOf(c.id).length).length}</span></button></div>
        </div>
        <p class="ck3s__n" id="ckn"></p>
        <div class="${X ? 'ck4g' : 'ck3g'}" id="ckgrid">${X ? groups.map((g) => { const cs = list.filter((c) => GROUP_OF[c.id] === g); return `<section class="ck4grp"><h2>${esc(g)}<span>${cs.length}</span></h2><div class="ck4row">${cs.map(card4).join('')}</div></section>`; }).join('') : list.map(card).join('')}</div>
        <p class="jb__empty" id="ckempty" hidden><span id="ckwhy">Няма клиника или отделение по това търсене.</span> <button type="button" class="ck3f__reset" id="ckreset">Покажи всички клиники</button> <a href="#/navigator">или опитайте анатомичния навигатор →</a></p>
      </div></section>`),
      init: () => {
        const st = { g: '', u: false, q: '', k: '' };
        const run = () => { let k = 0; $$('#ckgrid article').forEach((a) => { const ok = (!st.g || a.dataset.g === st.g) && (!st.u || a.dataset.u === '1') && (!st.k || (a.dataset.kinds || '').split('|').includes(st.k)) && (!st.q || a.dataset.q.includes(st.q)); a.hidden = !ok; if (ok) k++; $$('.ck3__units a, .ck4__u', a).forEach((x) => { x.classList.toggle('is-hit', !!st.q && x.dataset.q.includes(st.q)); x.hidden = !!st.k && x.dataset.kind !== st.k; }); }); $$('#ckgrid .ck4grp').forEach((g) => { g.hidden = !g.querySelector('article:not([hidden])'); }); $('#ckgrid').classList.toggle('is-detail', !!(st.g || st.k || st.u || st.q)); $('#ckn').textContent = `${k} от ${list.length}`; $('#ckempty').hidden = !!k;
          // say why nothing matches: the "Със звена" toggle stays on while switching groups
          if (!k) $('#ckwhy').textContent = (st.u || st.k) && !st.q ? `${st.g ? `В „${st.g}“ няма` : 'Няма'} клиники със звена (отделения, центрове или апаратура с отделни страници).` : 'Няма клиника или отделение по това търсене.';
        };
        $$('#ckg button').forEach((b) => b.addEventListener('click', () => {
          if (b.dataset.units) { st.u = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(st.u)); }
          else { $$('#ckg button:not([data-units])').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); st.g = b.dataset.v;
            st.k = ''; $$('#ckk button').forEach((x) => x.setAttribute('aria-pressed', String(!x.dataset.k))); if ($('#cku')) { st.u = false; $('#cku').checked = false; } }
          run();
        }));
        $('#ckq').addEventListener('input', (e) => { st.q = fold(e.target.value.trim()); run(); });
        if ($('#cku')) $('#cku').addEventListener('change', (e) => { st.u = e.target.checked; run(); });
        $$('#ckk button').forEach((b) => b.addEventListener('click', () => { $$('#ckk button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); st.k = b.dataset.k;
          st.g = ''; $$('#ckg button:not([data-units])').forEach((x) => x.setAttribute('aria-pressed', String(!x.dataset.v))); run(); }));
        $('#ckreset').addEventListener('click', () => { st.g = ''; st.u = false; st.q = ''; st.k = ''; $('#ckq').value = ''; if ($('#cku')) $('#cku').checked = false; $$('#ckk button').forEach((x) => x.setAttribute('aria-pressed', String(!x.dataset.k))); $$('#ckg button').forEach((x) => x.setAttribute('aria-pressed', String(!x.dataset.units && !x.dataset.v))); run(); });
        run();
      } };
  }
  function clinicsPage() {
    if (NEW && PP) return clinicsIndex();
    if (window.ISUL_CLIST) {   // variant B: the filter + list from its home page, as the clinics page
      const groups = (window.CLINIC_GROUPS || []).filter((g) => clinicList().some((c) => GROUP_OF[c.id] === g));
      return { title: 'Клиники и отделения', html: hero('Клиники и отделения', [['Клиники и отделения']], `${clinicList().length} клиники, отделения и лаборатории. Изберете вид, за да стесните списъка.`) +
        `<section class="clp"><div class="vwrap"><div class="cfilter" id="cfilter" role="group" aria-label="Филтър по вид">${['Всички'].concat(groups).map((g, k) => `<button type="button" aria-pressed="${k === 0}" data-g="${esc(g)}">${esc(g)}<span>${k ? clinicList().filter((c) => GROUP_OF[c.id] === g).length : clinicList().length}</span></button>`).join('')}</div>
        <ul class="clist" id="clist">${clinicList().map((c) => `<li data-g="${esc(GROUP_OF[c.id] || '')}"><a href="#/clinic/${c.id}"><span>${esc(c.name)}<small>${esc(GROUP_OF[c.id] || '')}${c.phones[0] ? ' · ' + esc(c.phones[0].split(/[;,]/)[0]) : ''}</small></span></a></li>`).join('')}</ul></div></section>`,
        init: () => { const cf = $('#cfilter'); $$('button', cf).forEach((b) => b.addEventListener('click', () => { $$('button', cf).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); $$('#clist li').forEach((li) => { li.hidden = b.dataset.g !== 'Всички' && li.dataset.g !== b.dataset.g; }); })); } };
    }
    const groups = {}; clinicList().forEach((c) => { const g = GROUP_OF[c.id] || 'Други'; (groups[g] = groups[g] || []).push(c); });
    const order = (window.CLINIC_GROUPS || []).concat(['Други']);
    return { title: 'Клиники и отделения', html: hero('Клиники и отделения', [['Клиники и отделения']], `${clinicList().length} клиники, отделения и лаборатории. Изберете, за да видите екипа, дейностите и информацията за пациента.`) +
      `<div class="vwrap"><div class="cl-groups">${order.filter((g) => groups[g]).map((g) => `<section class="cl-group"><h2>${g}</h2><div class="cl-cards">${groups[g].map((c) => `<a class="cl-card" href="#/clinic/${c.id}">${c.hero ? `<span class="cl-card__img"><img src="${esc(c.hero)}" alt="" loading="lazy"></span>` : '<span class="cl-card__img is-empty"></span>'}<b>${esc(c.name)}</b><small>${esc(c.phones[0] || '')}${c.floor ? ' · ' + esc(c.floor) : ''}</small></a>`).join('')}</div></section>`).join('')}</div></div>` + videoBand() };
  }
  const CLINIC_MINI = true;
  function clinicPage(id, tab = '') {
    const c = C.clinics[id]; if (!c) return notFound();
    const tabs = [['', 'За клиниката'], ['team', 'Екип'], ['patient', 'За пациента']];
    let body = '';
    if (tab === 'team') {
      body = `${c.leaders.length ? `<div class="leaders">${c.leaders.map((l) => `<div class="leader"><span class="leader__img">${l.img && !/team\.jpg/.test(l.img) ? `<img src="${esc(l.img)}" alt="${esc(l.name)}" loading="lazy">` : '<span class="leader__ph" aria-hidden="true"></span>'}</span><b>${esc(l.name)}</b><small>${esc(l.role)}</small></div>`).join('')}</div>` : ''}`;
      const groups = {}; c.members.forEach((m) => { (groups[m.g] = groups[m.g] || []).push(m.x); });
      body += Object.entries(groups).map(([g, xs]) => `<h3>${esc(g === 'Лекари' ? 'Екип' : g)}</h3><ul class="members">${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`).join('') || (c.leaders.length ? '' : '<p class="muted">Екипът не е публикуван в официалния сайт.</p>');
    } else if (tab === 'patient') body = blocks(c.patient);
    else body = blocks(c.blocks);
    const contacts = `<div class="cl-contact">${c.phones.map((p) => `<a href="tel:+359${p.replace(/\D/g, '').replace(/^0/, '').slice(0, 9)}"><span>Телефон</span>${esc(p)}</a>`).join('')}${c.emails.map((e) => `<a href="mailto:${esc(e)}"><span>Имейл</span>${esc(e)}</a>`).join('')}${c.floor ? `<div><span>Местоположение</span>${esc(c.floor)}</div>` : ''}</div>`;
    // X: each clinic as a small site (clinicXPage); B's look with bands by the kind of unit (clinicX2) is kept — CLINIC_MINI = false switches to it
    if (NEW) return window.ISUL_X ? (PP && CLINIC_MINI ? clinicXPage(c, id, tab) : clinicX2(c, id, tab)) : clinicFull(c, id, tab);
    if (NEW) {
      const tabNav = `<nav class="pg-sub" aria-label="Раздели на клиниката">${tabs.map(([k, t]) => `<a href="#/clinic/${id}${k ? '/' + k : ''}"${k === tab ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>`;
      HX.img = c.hero || bgFor(c.name); HX.noSub = true;
      const head = c.leaders[0];
      const leaderCard = head ? `<div class="ra ra--leader"><h3>Ръководител</h3><a href="#/clinic/${id}/team" class="ra__person">${head.img && !/team\.jpg/.test(head.img) ? `<img src="${esc(head.img)}" alt="">` : '<span class="ra__ph"></span>'}<span><b>${esc(head.name)}</b><small>${esc(head.role)}</small></span></a></div>` : '';
      const switcher = `<div class="ra ra--switch"><h3>Друга клиника</h3><label class="vh" for="rclin">Изберете клиника</label><select id="rclin"><option value="">Изберете…</option>${clinicList().map((x) => `<option value="${x.id}"${x.id == id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>`;
      const kpis = [['Телефон', (c.phones[0] || '02 9432 170').split(/ и |;|,/)[0], telOf((c.phones[0] || '02 9432 170').split(/ и |;|,/)[0])]].concat(c.emails[0] ? [['Имейл', c.emails[0], 'mailto:' + c.emails[0]]] : []).concat(c.floor ? [['Местоположение', c.floor]] : []).concat([['Екип', c.leaders.length + c.members.length + ' души', '#/clinic/' + id + '/team']]);
      let main;
      if (tab === 'team') {
        const grp = {}, seenN = new Set(c.leaders.map((l) => fold(l.name).replace(/^(професор|доцент|проф|доц|д-р|др)[.\s]*(д-р\s*)?/g, '').split(',')[0].trim()));
        c.members.forEach((m) => {
          let g = niceTitle(m.g); if (/^(д-р|проф|доц|професор|доцент|гл)/i.test(g) || g === 'Екип') g = 'Лекари';
          const nm = fold(m.x).replace(/^(професор|доцент|проф|доц|д-р|др|гл\. ас|ас)[.\s]*(д-р\s*)?/g, '').split(/,|–| - /)[0].trim();
          if (seenN.has(nm)) return; seenN.add(nm);
          (grp[g] = grp[g] || []).push(m.x);
        });
        const initials = (x) => x.replace(/^(Професор|Доцент|Проф|Доц|Д-р|Др|Гл\. ас|Ас)\.?\s*(д-р\s*)?/i, '').split(/[\s,]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
        const leadersHtml = c.leaders.length ? `<div class="rtl">${c.leaders.map((l) => `<article class="rtl__c">${l.img && !/team\.jpg/.test(l.img) ? `<img src="${esc(l.img)}" alt="">` : '<span class="ra__ph"></span>'}<div><b>${esc(l.name)}</b><small>${esc(l.role)}</small></div></article>`).join('')}</div>` : '';
        const teamHtml = Object.entries(grp).map(([g, xs]) => `<section class="rs"><header class="rs__head"><span class="rs__n">${xs.length}</span><div><h2>${esc(g === 'Лекари' ? 'Лекари' : g)}</h2></div></header><div class="rtm-grid">${xs.map((x) => { const [nm, ...rest] = x.split(/,\s*/); return `<div class="rtm"><span class="rtm__av">${esc(initials(nm))}</span><span><b>${esc(nm)}</b>${rest.length ? `<small>${esc(rest.join(', '))}</small>` : ''}</span></div>`; }).join('')}</div></section>`).join('');
        main = `<div class="rp"><div class="vwrap rp__grid"><div class="rp__main">${leadersHtml}${c.members.length ? `<div class="rfind"><span>${ICON.search}</span><label class="vh" for="rteam">Търси в екипа</label><input id="rteam" type="search" placeholder="Търси лекар или специалист в екипа…" autocomplete="off"></div>` : ''}${teamHtml || '<p class="muted">Екипът не е публикуван в официалния сайт.</p>'}${source(c.src)}</div><aside class="rp__side">${switcher}<div class="ra ra--act"><h3>Бързи действия</h3><a class="ra__cta" href="${BOOK}">${ICON.cal}Как да се прегледам</a><a class="ra__cta ra__cta--l" href="#/clinic/${id}">За клиниката</a><a class="ra__cta ra__cta--l" href="route.html">${ICON.pin}Как да стигна</a></div></aside></div></div>`;
      } else main = richPage({ blocks: tab === 'patient' ? c.patient : c.blocks, src: c.src, kpis, aside: [leaderCard, switcher] });
      const others = `<section class="band band--isul band--others"><div class="vwrap band__in">${CROWN}<div class="band__body"><h3>Други клиники и отделения</h3><div class="chips-row">${clinicList().filter((x) => x.id != id).map((x) => `<a href="#/clinic/${x.id}">${esc(x.name)}</a>`).join('')}</div></div></div></section>`;
      return { title: c.name, html: hero(c.name, [['Клиники и отделения', '#/clinics'], [c.name]], '', `<div class="pg-cta"><a class="btn-a" href="${BOOK}">Как да се прегледам</a></div>${tabNav}`) + main + others + videoBand(), init: richInit };
    }
    return { title: c.name, html: `<header class="pg-hero pg-hero--clinic"><div class="vwrap cl-hero${c.hero ? '' : ' no-img'}">${c.hero ? `<span class="cl-hero__img"><img src="${esc(c.hero)}" alt="" loading="lazy"></span>` : ''}<div>${crumbs([['Клиники и отделения', '#/clinics'], [c.name]])}<h1>${esc(c.name)}</h1>${contacts}<div class="pg-cta"><a class="btn-a" href="${BOOK}">Как да се прегледам</a></div></div></div></header>
      <div class="vwrap"><nav class="tabs" aria-label="Раздели на клиниката">${tabs.map(([k, t]) => `<a href="#/clinic/${id}${k ? '/' + k : ''}"${k === tab ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav></div>` +
      `<div class="vwrap pg-grid"><nav class="pg-side" aria-label="Клиники"><b>Клиники и отделения</b>${clinicList().map((x) => `<a href="#/clinic/${x.id}"${x.id == id ? ' aria-current="page"' : ''}>${esc(x.name)}</a>`).join('')}</nav><article class="pg-body">${body}${source(c.src)}</article></div>` + videoBand() };
  }
  /* =========================================================
     UNITS (departments, centres, machines) and DOCTOR PROFILES
     ========================================================= */
  const PP = window.ISUL_PEOPLE_API ? window.ISUL_PEOPLE_API.build(C, window.ISUL_UNITS || [], window.ISUL_CV || {}, window.ISUL_BIOS || {}) : null;
  if (PP) window.ISUL_PEOPLE_API.attachPress(PP, C.news);
  window.ISUL_PP = PP;   // shared with the homepage doctor finder (x-hub.js)
  const OMIT = window.ISUL_UNIT_OMIT || {};
  /* the cabinets of ДКБ (as listed on isul.eu) as cards: the room number, the name, the floor, a link to the clinic when the
     name says clearly whose it is (the metabolic, children's, allergy, skin and psychiatry cabinets are left without one) */
  const DKB_CL = [[/неврохирург/i, 6], [/невролог/i, 5], [/очни/i, 10], [/кардиолог/i, 3], [/гастроентеролог/i, 2], [/нефролог/i, 7], [/уролог/i, 18], [/ушни-носни/i, 12], [/ортопед/i, 9], [/хирург/i, 15]];
  const dkbCab = (x) => {
    const m = String(x || '').trim().match(/^(.*?)\s*[-–]\s*(?:([IVXІ]+)\s*ет\.\s*)?№\s*(\d+)\s*$/); if (!m) return null;
    let name = m[1].replace(/^Кабинет\s+/i, '').trim(); name = name.charAt(0).toUpperCase() + name.slice(1);
    const hit = DKB_CL.find(([r]) => r.test(name));
    return { name, fl: m[2] ? m[2].replace(/І/g, 'I') + ' етаж' : '', room: m[3], cid: hit ? hit[1] : null };
  };
  const dkbCards = (lines) => {
    const cs = lines.map(dkbCab).filter(Boolean); if (!cs.length) return '';
    return `<div class="dkc-g">${cs.map((k) => { const cl = k.cid && C.clinics[k.cid];
      const inner = `<span class="dkc__ic">${clinicIcon(k.cid || 19)}</span><span class="dkc__n"><small>стая</small>№ ${esc(k.room)}</span><b>${esc(k.name)}</b><small class="dkc__m">${/кабинет/i.test(k.name) ? '' : 'Кабинет · '}${esc(k.fl || 'ДКБ')}</small>${cl ? `<em>Към клиниката ${IC.arrow}</em>` : ''}`;
      return cl ? `<a class="dkc" href="#/clinic/${k.cid}" title="${esc(cl.name)}">${inner}</a>` : `<div class="dkc">${inner}</div>`; }).join('')}</div>`;
  };
  /* „Подредба“ (clinic and unit pages): where it is — the places from the board, the small plan with the buildings marked
     (opens the interactive map „Къде да отида?“), Google Maps and the city transport page */
  function kpWhere(ps, mapHref) {
    if (!PL || !ps.length) return '';
    const A = IC.arrow;
    const blocks = [...new Set(ps.map((p) => p.b.id).concat(ps.map((p) => p.via).filter(Boolean)))];
    const rows = ps.map((p) => `<li><span class="kx-wh__n">${p.b.id}</span><span><b>${esc(p.b.name)}${/^Сграда/.test(p.floor) ? '' : ' · ' + esc(p.floor)}</b><small>${esc(p.label)}</small>${p.note ? `<em>${esc(p.note)}</em>` : ''}</span></li>`).join('');
    return `<h2>Как да стигнете</h2>
      <div class="kp-wh">
        <div><ul class="kp-wh__list">${rows}</ul>
          <div class="kp-btns"><a href="${mapHref}">Покажи на картата ${A}</a><a href="route.html">С градски транспорт ${A}</a><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('УМБАЛ Царица Йоанна ИСУЛ, ул. Бяло море 8, София')}" target="_blank" rel="noopener">Google Maps ↗</a></div></div>
        <a class="kp-wh__map" href="${mapHref}" aria-label="Отвори картата на болницата">${planSvg({ hi: blocks, small: true, label: 'Схема: ' + placeLine(ps).join(', ') })}</a>
      </div>
      <p class="kp-note">Номерата са като на табелата пред болницата. Вход за пациенти — от ул. „Бяло море“ № 8. За пътя вътре в сградата — телефонна централа <a href="${telOf('02 9432 170')}">02 9432 170</a>.</p>`;
  }
  /* clinic and unit pages („Подредба“): the light / dark switch and the menu that follows the reading */
  const KP_THEME = `<button type="button" class="kp-theme" aria-pressed="true"><svg class="kp-theme__sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="kp-theme__moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><span>Светла</span></button>`;
  function kpInit() {
    // light / dark: the device setting until the visitor picks one (remembered)
    const root = document.documentElement, tb = $('.kp-theme', page), sys = matchMedia('(prefers-color-scheme: dark)');
    const saved = () => { try { return localStorage.getItem('isul-theme'); } catch (e) { return null; } };
    const show = () => { const dark = root.dataset.theme !== 'light'; tb.setAttribute('aria-pressed', String(dark)); $('span', tb).textContent = dark ? 'Светла' : 'Тъмна'; tb.title = dark ? 'Светла версия' : 'Тъмна версия'; };
    root.dataset.theme = saved() || (sys.matches ? 'dark' : 'light'); show();
    tb.addEventListener('click', () => { const t = root.dataset.theme === 'light' ? 'dark' : 'light'; root.dataset.theme = t; try { localStorage.setItem('isul-theme', t); } catch (e) { /* storage blocked */ } show(); });
    const links = $$('.kp-nav a', page), nin = $('.kp-nav__in', page);
    if (nin) { const edge = () => nin.classList.toggle('is-more', nin.scrollWidth - nin.clientWidth - nin.scrollLeft > 4); nin.addEventListener('scroll', edge, { passive: true }); addEventListener('resize', edge); edge(); setTimeout(edge, 400); }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => { const on = a.dataset.kj === e.target.id; a.classList.toggle('is-on', on); if (on) a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }); }), { rootMargin: '-30% 0px -60% 0px' });
    $$('.kp-sec[id]', page).forEach((x) => io.observe(x));
  }
  const unitUrl = (u) => `#/clinic/${u.clinic}/unit/${u.slug}`;
  const drUrl = (d) => `#/lekar/${d.slug}`;
  const clinicShort = (c) => c.name.replace(/^Клиника по /, '').replace(/^(.)/, (m) => m.toUpperCase());
  /** clinic text without the parts that moved to unit pages */
  /* editorial wording of migrated text, agreed with the client: the same facts, easier to read.
     { clinic: { block index: { t, x } } } — the index is the block's place in isul-content.js, so the units that
     cut blocks by index keep working. */
  const CONTENT_EDITS = {
    // Неврохирургия: the directions were written as „Болни за … / Болни с …“ in every line
    6: { 2: { t: 'h', x: 'Какво лекуваме' },
         3: { x: 'Черепно-мозъчни и гръбначно-мозъчни травми — оперативно и консервативно лечение' },
         4: { x: 'Тумори на централната и периферната нервна система — оперативно лечение' },
         5: { x: 'Артериални аневризми и други съдови малформации на ЦНС — оперативно лечение' },
         6: { x: 'Дегенеративни заболявания на гръбначния стълб, във всичките му области' },
         7: { x: 'Хидроцефалия, епилепсия, хирургия на болката и функционална неврохирургия' } }
  };
  /* clinics whose old text has headings at two levels: the sections follow the top level (matched by its words), the other headings
     stay inside as sub-headings; `lead` are the paragraphs for the hero and „Представяне“; `title` replaces an all-caps heading split in two */
  const SECTION_GROUPS = {
    5: { lead: [/^Клиниката се характеризира/, /^В клиниката се приемат пациенти/],
         groups: [[/^СТРУКТУРА$/, 'Структура на клиниката', /^НА КЛИНИКАТА ПО ИНТЕНЗИВНО ЛЕЧЕНИЕ/], [/^МЕДИЦИНСКА ДЕЙНОСТ/, 'Медицинска дейност'], [/^ОБУЧЕНИЕ В КЛИНИКАТА/, 'Обучение']] },
    9: { lead: [/^Клиниката разполага с леглова база/],
         groups: [[/^Дейност$/, 'Медицинска дейност'], [/^Преподавателска дейност/, 'Преподавателска дейност'], [/^ИСТОРИЯ$/, 'История']],
         subs: [/^Главни направления на работа са/, /^Не може да не се споменат и имената на/], dash: true },
    20: { lead: [/^Спешно отделение на УМБАЛ ”Царица Йоанна-ИСУЛ” е отделение от трето/, /^УМБАЛ “ЦАРИЦА ЙОАННА -ИСУЛ“, като водещ/, /^Спешният болничен комплекс/, /^Спешно отделение –„Царица Йоанна -ИСУЛ“, е част/],
          groups: [[/^Дейности:?$/, 'Дейности'], [/^Структура на Спешното отделение$/, 'Структура на Спешното отделение'], [/^ВАКСИНОПРОФИЛАКТИКА СРЕЩУ БЯС$/, 'Ваксинопрофилактика срещу бяс']],
          subs: [/^Спешно отделение на УМБАЛ „Царица Йоанна – ИСУЛ“ осигурява за пациентите/], end: [/^Галерия$/] },
    27: { lead: [/^Консултации чрез направление №3/, /^Центърът е разкрит/, /^Намира се на територията/, /^Медицинският център предлага/, /^Центърът има сключен договор/, /^Специалистите на центъра работят/],
          groups: [[/^РЕД ЗА ИЗВЪРШВАНЕ НА ПРЕГЛЕДИ/, 'Ред за извършване на прегледи'], [/^ПОДРОБНА ИНФОРМАЦИЯ$/, 'Подробна информация']], end: [/^ЗАПАЗИ ЧАС ЗА ЛЕКАР$/] }
  };
  const capsLine = (b) => (b.t === 'p' && b.x && b.x === b.x.toUpperCase() && /[А-Я]{4}/.test(b.x) ? { ...b, x: b.x.charAt(0) + b.x.slice(1).toLowerCase() } : b);
  const edited = (c) => { const e = CONTENT_EDITS[c.id]; return e ? { ...c, blocks: c.blocks.map((b, i) => (e[i] ? { ...b, ...e[i] } : b)) } : c; };
  function clinicRest(c) {
    c = edited(c);
    if (!PP) return c;
    const cov = new Set();
    PP.unitsOf(c.id).forEach((u) => (u.blocks || []).forEach(([a, b]) => { for (let i = a; i < b; i++) cov.add(i); }));
    (OMIT[c.id] || []).forEach(([a, b]) => { for (let i = a; i < b; i++) cov.add(i); });
    return cov.size ? { ...c, blocks: c.blocks.filter((_, i) => !cov.has(i)) } : c;
  }
  const initialsOf = (d) => (d.first[0] + d.last[0]).toUpperCase();
  const drCard = (d, mod = '') => `<a class="dcard ${mod}" href="${drUrl(d)}"><span class="dcard__img${d.img ? ' nwm' : ''}">${d.img ? `<img src="${esc(d.img)}" alt="" loading="lazy">` : `<span class="dcard__ini" aria-hidden="true">${initialsOf(d)}</span>`}</span><b>${esc(d.name)}</b>${d.role ? `<small>${esc(d.role)}</small>` : ''}</a>`;
  const drLine = (d) => `<a class="dline" href="${drUrl(d)}"><span class="dline__av">${d.img ? `<img src="${esc(d.img)}" alt="" loading="lazy">` : initialsOf(d)}</span><span><b>${esc(d.name)}</b>${d.role ? `<small>${esc(d.role)}</small>` : ''}</span></a>`;
  /** photo cards for doctors with a portrait, a compact list for the rest */
  const drBlock = (ds, id = '') => { const ph = ds.filter((d) => d.img), no = ds.filter((d) => !d.img); return `<div${id ? ` id="${id}"` : ''}>${ph.length ? `<div class="dcards">${ph.map((d) => drCard(d)).join('')}</div>` : ''}${no.length ? `<div class="dlines">${no.map(drLine).join('')}</div>` : ''}</div>`; };
  // soft hyphens in very long words („оториноларингология“), used only where a word does not fit (Chrome does not hyphenate Bulgarian)
  const shy = (t) => window.ISUL_X ? t.replace(/[а-яА-Я]{14,}/g, (w) => w.replace(/([аеиоуъюя])(?=[^аеиоуъюя][аеиоуъюя])/gi, '$1\u00AD')) : t;
  const unitCard = (u) => `<a class="ucard" href="${unitUrl(u)}"><span class="ucard__kind">${esc(u.kind)}</span>${u.badge ? `<span class="ucard__badge">${esc(u.badge)}</span>` : ''}<b>${shy(esc(u.name))}</b><p>${esc(u.short)}</p>${u.headP ? `<span class="ucard__head">${esc(/ръковод/i.test(u.headP.role) ? 'Ръководител' : 'Началник')}: ${esc(u.headP.name)}</span>` : ''}<span class="ucard__go" aria-hidden="true">→</span></a>`;
  /** units section for the clinic page (replaces the auto-detected department tabs) */
  function unitsSection(c) {
    const us = PP ? PP.unitsOf(c.id) : []; if (!us.length) return '';
    const kinds = [...new Set(us.map((u) => u.kind))];
    const label = kinds.length === 1 && kinds[0] === 'Апаратура' ? 'Изследвания и апаратура' : 'Отделения и звена';
    return `<section class="cs cs--units" id="c-depts"><div class="vwrap"><p class="ck"><span></span>${label}</p><h2 class="cs__h">${us.length} ${kinds[0] === 'Апаратура' ? (us.length === 1 ? 'вид изследване' : 'вида изследвания') : us.length === 1 ? 'звено' : 'звена'} —<br><em>${us.length === 1 ? 'със своя страница' : 'всяко със своя страница'}</em></h2><div class="ucards">${us.map(unitCard).join('')}</div></div></section>`;
  }
  /** team section for the clinic page: every doctor is a card that opens a profile */
  function teamSection(c) {
    const ds = PP ? PP.inClinic(c.id) : []; if (!ds.length) return '';
    const heads = ds.filter((d) => d.head), rest = ds.filter((d) => !d.head);
    const others = c.members.filter((m) => /сестр|санитар|лаборант|фелдшер|рехабилитатор|акушер/i.test(m.g));
    const og = {}; others.forEach((m) => { (og[m.g] = og[m.g] || []).push(m.x); });
    const sm = window.ISUL_X && ds.length <= 4 && !Object.keys(og).length;
    return `<section class="cs${sm ? ' cs--team-s' : ''}" id="c-team"><div class="vwrap"><div class="cs__hd"><p class="ck"><span></span>Екип</p><h2 class="cs__h">${ds.length} ${ds.length === 1 ? 'лекар' : 'лекари'} —<br><em>всеки със свой профил</em></h2></div>
      ${heads.length ? `<h3 class="dgrp">Ръководство</h3><div class="dcards dcards--lead">${heads.map((d) => drCard(d, 'dcard--lead')).join('')}</div>` : ''}
      ${rest.length ? `<h3 class="dgrp">Лекари</h3>${rest.length > 8 ? `<div class="rfind"><span>${ICON.search}</span><label class="vh" for="dfind">Търси лекар</label><input id="dfind" type="search" placeholder="Търси лекар в клиниката (${rest.length})…" autocomplete="off"></div>` : ''}${drBlock(rest, 'dlist')}` : ''}
      ${Object.keys(og).length ? `<details class="dother"><summary>Медицински сестри и друг персонал (${others.length})</summary>${Object.entries(og).map(([g, xs]) => `<h4>${esc(g)}</h4><p>${xs.map(esc).join(' · ')}</p>`).join('')}</details>` : ''}
    </div></section>`;
  }
  const LOCAL_HERO = CLINIC_IMG;
  const heroOf = (c) => LOCAL_HERO.has(+c.id) ? `assets/photos/clinics/c${c.id}.jpg` : c.hero;
  const bedsOf = (txt) => (txt.match(/(\d+)\s+легла/) || [])[1] || '';
  function unitPage(cid, slug) {
    const c = C.clinics[cid], u = PP && PP.unit(cid, slug); if (!c || !u) return notFound();
    const raw = []; (u.blocks || []).forEach(([a, b]) => c.blocks.slice(a, b).forEach((x) => raw.push(x)));
    const fix = (b) => b.t === 'p' && /^[а-я]/.test(b.x) ? { ...b, x: 'В отделението ' + b.x.replace(/^се извършват се извършват/, 'се извършват') } : b;
    const body = raw.map(fix).filter((b) => b.t !== 'h' || !/галерия/i.test(b.x));
    const allTxt = c.blocks.map((b) => b.x || '').join('\n');
    const beds = bedsOf(raw.map((b) => b.x || '').join(' '));
    const lis = body.filter((b) => b.t === 'li');
    const treats = u.treats || (lis.length ? lis.map((b) => b.x) : []);
    const prose = body.filter((b) => !(u.treats ? false : b.t === 'li'));
    const phones = (c.phones.join('; ') || '02 9432 170').split(/;|,| и /).map((x) => x.trim()).filter((x) => /\d{3}/.test(x));
    const tel1 = phones[0] || '02 9432 170';
    const sibs = PP.unitsOf(cid);
    const team = u.team.length ? u.team : PP.inClinic(cid);
    const head = u.headP || (u.kind === 'Апаратура' ? PP.inClinic(cid).find((d) => d.head) : null);
    const kick = (t) => `<p class="ck"><span></span>${esc(t)}</p>`;
    const verb = u.kind === 'Апаратура' ? 'Какво изследваме' : 'С какво помагаме';
    HX.img = '';
    // variant X: place from the board with a link to the map; a small team sits in the side column instead of its own band
    const XC = !!window.ISUL_X;
    const where = XC ? placeLine(placesOfUnit(u)).slice(0, 2) : [];
    const smallTeam = XC && team.length <= 3;
    const noBook = XC && ['er', 'lab'].includes(KIND_OF[cid]);   // emergency and laboratories: no appointments
    const facts = [head && [/ръковод/i.test(head.role) ? 'Ръководител' : 'Началник', `<a href="${drUrl(head)}">${esc(head.name)}</a>`], beds && ['Легла', beds], ['Към', `<a href="#/clinic/${cid}">${esc(c.name)}</a>`], c.floor && ['Разположение', esc(c.floor)]].filter(Boolean);
    // variant X: the same plain header as the clinic pages
    const headX = window.ISUL_X && CLINIC_MINI ? `<div class="kx kx--head">${kxHead({ crumbs: [['Клиники и отделения', '#/clinics'], [c.name, '#/clinic/' + cid], [u.name]], kick: u.kind + ' · ' + clinicShort(c), title: esc(u.name) + (u.badge ? ` <span class="kx-ph__badge">${esc(u.badge)}</span>` : ''), lead: u.short,
      cta: `<div class="kx-cta"><a class="kx-btn kx-btn--w" href="${BOOK}">Как да се прегледам</a><a class="kx-btn kx-btn--o" href="${telOf(tel1)}">${IC.phone}${esc(tel1)}</a></div><dl class="kx-ph__facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`, img: heroOf(c) })}</div>` : '';
    /* variant X: the unit page in the order of the clinic page („Подредба“) — the clinic's photo behind the name,
       the menu, the content on the left and the contacts card on the right; the other units of the clinic at the end */
    if (XC && CLINIC_MINI) {
      const A = IC.arrow, own = u.team.length > 0, isM = u.kind === 'Апаратура';
      const where1 = where.length ? where : c.floor ? [c.floor] : [];
      const docsU = own ? u.team.filter((d) => d !== head) : [];
      const av = (d, big) => `<span class="kp-av${big ? ' kp-av--l' : ''}">${d.img ? `<img src="${esc(d.img)}" alt="" loading="lazy">` : esc(initialsOf(d))}</span>`;
      // the unit's text: lists as ticks, paragraphs as text, sub-headings kept
      const textBody = (items) => { let out = '', ul = [];
        const flush = () => { if (ul.length) { out += `<ul class="kp-ticks">${ul.map((x) => `<li>${ICON.check}<span>${linkify(x)}</span></li>`).join('')}</ul>`; ul = []; } };
        items.forEach((b) => { if (b.t === 'li') ul.push(b.x || ''); else if (b.t === 'h') { flush(); out += `<h3>${esc(b.x || '')}</h3>`; } else if (b.t === 'p') { flush(); out += `<p>${linkify(b.x || '')}</p>`; } });
        flush(); return out; };
      // without its own list („treats“) the unit keeps the migrated text in its order, the lists in place, so lines such as
      // „Апаратът осигурява изследвания на:“ stay above their list
      const textItems = (u.text || []).map((x) => ({ t: 'p', x })).concat(u.treats ? prose : body);
      const S = [];
      S.push(['about', 'Представяне', `<p class="kp-k">${esc(u.kind)}</p><h2>${isM ? 'За изследването' : 'Представяне'}</h2>
        <div class="kp-prose">${textBody(textItems) || `<p>${esc(u.short || '')}</p>`}</div>
        ${u.draft ? '<p class="kp-note">Текстът е проект за прототипа — очаква се одобрение и допълване от клиниката.</p>' : ''}`]);
      if (u.treats && treats.length) S.push(['treats', 'Медицинска дейност', `<h2>${verb}</h2><ul class="kp-ticks">${treats.map((t) => `<li>${ICON.check}<span>${esc(t)}</span></li>`).join('')}</ul>`]);
      if (head) S.push(['head', 'Екип', `<h2>${/ръковод/i.test(head.role || '') ? 'Ръководител' : 'Началник'}</h2>
        <div class="kp-chief">${av(head, true)}<div><b><a href="${drUrl(head)}">${esc(head.name)}</a></b>${head.role ? `<small>${esc(head.role)}</small>` : ''}</div>
          <span class="kp-chief__act"><a class="kp-lnk" href="${drUrl(head)}">Профил ${A}</a></span></div>`]);
      if (docsU.length) S.push(['team', head ? '' : 'Екип', `<h2>Медицински екип</h2>
        <ul class="kp-team">${docsU.map((d) => `<li><a href="${drUrl(d)}">${av(d)}<span><b>${esc(d.name)}</b>${d.role ? `<small>${esc(d.role)}</small>` : ''}</span></a></li>`).join('')}</ul>`]);
      else if (!own) S.push(['team', head ? '' : 'Екип', `<h2>${head ? 'Екип' : 'Медицински екип'}</h2><p class="kp-note">Лекарите са от екипа на ${esc(c.name)}.</p>
        <div class="kp-btns"><a href="#/clinic/${cid}/team">Екипът на клиниката ${A}</a></div>`]);
      const whereKp = kpWhere(placesOfUnit(u), `#/kade/u${cid}:${u.slug}`); if (whereKp) S.push(['where', 'Как да стигна', whereKp]);
      const others = sibs.filter((s) => s.slug !== u.slug);
      if (others.length) S.push(['more', 'Други звена', `<div class="kp-h"><h2>Още в ${esc(clinicShort(c))}</h2><a class="kp-lnk" href="#/clinic/${cid}">Към клиниката ${A}</a></div>
        <div class="kp-units">${others.map((s, i) => `<a class="kp-unit" href="${unitUrl(s)}"><small>${String(i + 1).padStart(2, '0')} · ${esc(s.kind)}</small><b>${esc(s.name)}</b>${s.short ? `<p>${esc(s.short)}</p>` : ''}${s.headP ? `<span>Ръководител: ${esc(s.headP.name)}</span>` : ''}<em>${s.kind === 'Апаратура' ? 'Подробно' : 'Към звеното'} ${A}</em></a>`).join('')}</div>`]);
      const meta = [u.kind, own && `${u.team.length} ${u.team.length === 1 ? 'лекар' : 'лекари'}`, beds && `${beds} легла`, 'към ' + clinicShort(c)].filter(Boolean);
      const kpNav = `<nav class="kp-nav" aria-label="${esc(u.name)} — съдържание"><div class="vwrap kp-nav__w"><div class="kp-nav__in"><a href="#/clinic/${cid}">← ${esc(clinicShort(c))}</a>${S.filter(([, t]) => t).map(([k, t]) => `<a href="#kp-${k}" data-kj="kp-${k}">${esc(t)}</a>`).join('')}</div>
        ${KP_THEME}</div></nav>`;
      const side = `<aside class="kp-side" aria-label="Контакти"><div class="kp-card">
        <p class="kp-k">Контакти</p>
        ${phones.map((ph, i) => `<a class="kp-tel" href="${telOf(ph)}"><small>Клиника${phones.length > 1 ? ' · ' + (i + 1) : ''}</small>${IC.phone}<b>${esc(ph)}</b></a>`).join('')}
        ${phones.some((ph) => ph.replace(/\D/g, '').endsWith('9432170')) ? '' : `<a class="kp-tel" href="${telOf('02 9432 170')}"><small>Централа на болницата</small>${IC.phone}<b>02 9432 170</b></a>`}
        <hr>
        ${c.emails[0] ? `<p class="kp-row">${IC.mail}<a href="mailto:${esc(c.emails[0])}">${esc(c.emails[0])}</a></p>` : ''}
        <p class="kp-row">${IC.pin}<span>${where1.length ? where1.map(esc).join('<br>') + '<br>' : ''}<small>ул. „Бяло море“ № 8, София</small></span></p>
        ${noBook ? '' : `<a class="kp-book" href="${BOOK}">Как да се прегледам</a>`}
        <a class="kp-go" href="${where.length ? `#/kade/u${cid}:${esc(u.slug)}` : 'route.html'}">${where.length ? 'Покажи на картата' : 'Как да стигна'} ${A}</a>
      </div></aside>`;
      const hero = `<header class="kp-hero">${heroOf(c) ? `<img class="kp-hero__bg" src="${esc(heroOf(c))}" alt="">` : ''}<div class="vwrap kp-hero__in">
        ${crumbs([['Клиники и отделения', '#/clinics'], [c.name, '#/clinic/' + cid], [u.name]])}
        <p class="kp-k">${esc(u.kind)} · ${esc(clinicShort(c))}</p>
        <h1>${CLINIC_ICON[cid] ? `<span class="kp-ic">${clinicIcon(cid)}</span>` : ''}<span>${esc(u.name)}</span></h1>
        ${u.badge && u.badge !== u.kind ? `<p class="kp-meta"><i>${esc(u.badge)}</i></p>` : ''}
        <p class="kp-meta">${meta.map(esc).join(' <i>·</i> ')}</p>
        ${u.short ? `<p class="kp-lead">${esc(u.short)}</p>` : ''}
        <div class="kp-cta"><a class="kp-b kp-b--w" href="${telOf(tel1)}">${IC.phone}${esc(tel1)}</a>${head || docsU.length ? `<a class="kp-b" href="#kp-${head ? 'head' : 'team'}" data-kj="kp-${head ? 'head' : 'team'}">${own ? 'Медицинският екип' : 'Ръководство'}</a>` : ''}</div>
      </div></header>`;
      return { title: u.name + ' · ' + c.name, og: `assets/og/clinic-${cid}.jpg`, desc: u.short,
        html: `<div class="kx kp">${hero}${kpNav}<div class="vwrap kp-grid"><div class="kp-main">${S.map(([k, , h]) => `<section class="kp-sec" id="kp-${k}">${h}</section>`).join('')}</div>${side}</div></div>`,
        init: () => { clinicXInit('', [], {}); kpInit(); },
        ld: { '@context': 'https://schema.org', '@type': isM ? 'MedicalProcedure' : 'MedicalClinic', name: u.name, description: u.short, parentOrganization: { '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“' } } };
    }
    const html = (headX || `<header class="ch ch--unit"><div class="vwrap ch__in">
        <div class="ch__copy">
          ${crumbs([['Клиники и отделения', '#/clinics'], [c.name, '#/clinic/' + cid], [u.name]])}
          ${kick(u.kind + ' · ' + clinicShort(c))}
          <h1>${esc(u.name)}</h1>
          ${u.badge ? `<p class="ubadge">${esc(u.badge)}</p>` : ''}
          <p class="ch__lead">${esc(u.short)}</p>
          <div class="ch__cta"><a class="chb chb--w" href="${telOf(tel1)}">${esc(tel1)}</a>${noBook ? '' : `<a class="chb" href="${BOOK}">Как да се прегледам</a>`}</div>
          <dl class="ch__facts">
            ${head ? `<div><dt>${/ръковод/i.test(head.role) ? 'Ръководител' : 'Началник'}</dt><dd><a href="${drUrl(head)}">${esc(head.name)}</a></dd></div>` : ''}
            ${beds ? `<div><dt>Легла</dt><dd>${beds}</dd></div>` : ''}
            <div><dt>Към</dt><dd><a href="#/clinic/${cid}">${esc(c.name)}</a></dd></div>
            ${where.length ? `<div><dt>Къде се намира</dt><dd>${where.map(esc).join('<br>')} <a class="ch__map" href="#/kade/u${cid}:${esc(u.slug)}">на картата →</a></dd></div>` : c.floor ? `<div><dt>Разположение</dt><dd>${esc(c.floor)}</dd></div>` : ''}
          </dl>
        </div>
        <figure class="ch__fig nwm">${heroOf(c) ? `<img src="${esc(heroOf(c))}" alt="">` : '<span class="ch__ph"></span>'}<figcaption>${esc(u.kind)}</figcaption></figure>
      </div></header>`) + `
      <nav class="usib" aria-label="Звена на клиниката"><div class="vwrap usib__in"><a href="#/clinic/${cid}">← ${esc(clinicShort(c))}</a>${sibs.map((s) => `<a href="${unitUrl(s)}"${s.slug === u.slug ? ' aria-current="page"' : ''}>${esc(s.name)}</a>`).join('')}</div></nav>
      <section class="cs"><div class="vwrap ugrid">
        <div class="ugrid__main">${kick(u.kind === 'Апаратура' ? 'За изследването' : 'За звеното')}
          <div class="uprose">${(u.text || []).map((t) => `<p>${linkify(t)}</p>`).join('')}${prose.filter((b) => b.t !== 'li' || u.treats).length ? blocks(prose.filter((b) => b.t !== 'li' || u.treats)) : ''}</div>
          ${u.draft ? '<p class="udraft">Текстът е проект за прототипа — очаква се одобрение и допълване от клиниката.</p>' : ''}
        </div>
        <aside class="ugrid__side">${treats.length ? `<div class="ubox"><h3>${verb}</h3><ul>${treats.map((t) => `<li>${ICON.check}<span>${esc(t)}</span></li>`).join('')}</ul></div>` : ''}
          ${where.length ? `<div class="ubox ubox--where"><h3>Къде се намира</h3><p>${where.map(esc).join('<br>')}</p><a class="chb chb--o" href="#/kade/u${cid}:${esc(u.slug)}">Покажи на картата →</a></div>` : ''}
          ${smallTeam ? `<div class="ubox ubox--team"><h3>${u.team.length ? 'Лекари' : 'Лекари в клиниката'}</h3>${team.map(drLine).join('')}</div>` : ''}
          ${XC ? '' : `<div class="ubox ubox--soft"><h3>${u.kind === 'Апаратура' ? 'Подготовка за изследването' : 'Преди да дойдете'}</h3><p>Указанията за подготовка ще бъдат публикувани от клиниката. Дотогава попитайте при записване на <a href="${telOf(tel1)}">${esc(tel1)}</a>.</p></div>`}
          ${noBook ? '' : `<div class="ubox ubox--cta"><h3>Преглед</h3><p>В кабинета на клиниката в ДКБ — II етаж над Спешно отделение, в работни дни от 8 до 14 ч.</p><a class="chb" href="${BOOK}">Как да се прегледам</a></div>`}
        </aside>
      </div></section>
      ${team.length && !smallTeam ? `<section class="cs cs--panel"><div class="vwrap">${kick('Екип')}<h2 class="cs__h">${u.team.length ? 'Лекарите в ' + (u.kind === 'Отделение' ? 'отделението' : 'звеното') : 'Лекарите в клиниката'}</h2>${head ? `<div class="dcards dcards--lead">${drCard(head, 'dcard--lead')}</div>` : ''}${drBlock(team.filter((d) => d !== head))}</div></section>` : ''}
      ${XC ? reelsBand(cid, 'u-video', u.kind === 'Отделение' ? 'отделението' : 'звеното') : ''}
      <section class="cs"><div class="vwrap">${kick('Още в ' + clinicShort(c))}<div class="ucards ucards--s">${sibs.filter((s) => s.slug !== u.slug).map(unitCard).join('')}<a class="ucard ucard--clinic" href="#/clinic/${cid}"><span class="ucard__kind">Клиника</span><b>${esc(c.name)}</b><p>Всички дейности, екип, прием и контакти.</p><span class="ucard__go" aria-hidden="true">→</span></a></div></div></section>`;
    return { title: u.name + ' · ' + c.name, html, og: `assets/og/clinic-${cid}.jpg`, desc: u.short, init: () => { setTimeout(() => xFold(page), 60); if (XC) reelsBind(page); },
      ld: { '@context': 'https://schema.org', '@type': u.kind === 'Апаратура' ? 'MedicalProcedure' : 'MedicalClinic', name: u.name, description: u.short, parentOrganization: { '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“' } } };
  }
  function doctorPage(slug) {
    if (window.ISUL_X) return doctorXPage(slug);
    const d = PP && PP.bySlug[slug]; if (!d) return notFound();
    const c = C.clinics[d.clinic];
    const us = PP.units.filter((u) => d.units.includes(u.slug));
    const phones = (c.phones.join('; ') || '02 9432 170').split(/;|,| и /).map((x) => x.trim()).filter((x) => /\d{3}/.test(x));
    const tel1 = phones[0] || '02 9432 170';
    const peers = (us[0] && us[0].team.length > 2 ? us[0].team : PP.inClinic(d.clinic)).filter((x) => x !== d).slice(0, 9);
    const facts = [['Клиника', `<a href="#/clinic/${c.id}">${esc(c.name)}</a>`]].concat(us.map((u) => [u.kind, `<a href="${unitUrl(u)}">${esc(u.name)}</a>`]))
      .concat(d.title ? [['Академична длъжност', esc(/проф/i.test(d.title) ? 'Професор' : /доц/i.test(d.title) ? 'Доцент' : /гл/i.test(d.title) ? 'Главен асистент' : /ас/i.test(d.title) ? 'Асистент' : 'Лекар')]] : [])
      .concat(d.degree ? [['Научна степен', d.degree === 'дмн' ? 'Доктор на медицинските науки' : 'Доктор по медицина (дм)']] : []);
    const todo = ['Образование и специалности', 'Професионален опит', 'С какво се занимава — заболявания и процедури', 'Научна и преподавателска дейност', 'Членства в научни дружества', 'Езици'];
    const html = `<header class="pg-hero pg-hero--x na-hd" style="--bg:url('${PRESS_BG}')"><div class="vwrap pg-hero__in">${crumbs([['Екип', '#/doctors'], [clinicShort(c), '#/clinic/' + c.id], [d.core]])}</div></header>
      <div class="dp"><div class="vwrap dp__grid">
        <figure class="dp__photo${d.img ? ' nwm' : ''}">${d.img ? `<img src="${esc(d.img)}" alt="${esc(d.name)}">` : `<span class="dp__ini" aria-hidden="true">${initialsOf(d)}</span>`}</figure>
        <div class="dp__main">
          <p class="ck"><span></span>${esc(d.head ? (d.role.split(/[,(]/)[0] || 'Ръководител') : (d.role || 'Лекар'))}</p>
          <h1>${esc(d.name)}</h1>
          ${d.role && !d.head ? '' : d.role ? `<p class="dp__role">${esc(d.role)}</p>` : ''}
          <div class="dp__cta"><a class="chb" href="${BOOK}">Как да се прегледам</a><a class="chb chb--o" href="${telOf(tel1)}">${esc(tel1)}</a>${d.cv ? `<a class="chb chb--o" href="${esc(d.cv)}" target="_blank" rel="noopener">Автобиография (PDF)</a>` : ''}</div>
          <dl class="dp__facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>
        </div>
      </div>
      <div class="vwrap dp__body">
        <section class="dp__sec"><h2>Биография</h2>${d.biography && d.biography.length ? `<div class="dp__bio">${d.biography.map((b) => b.t === 'li' ? `<p class="dp__li">${linkify(b.x)}</p>` : b.b ? `<p><b>${esc(b.b)}</b>${linkify(b.x.slice(b.x.indexOf(b.b) + b.b.length))}</p>` : `<p>${linkify(b.x)}</p>`).join('')}</div><p class="dp__src">Източник: <a href="${esc(d.bioSrc)}" target="_blank" rel="noopener">профил в isul.eu</a></p>` : d.bio && d.bio.length ? `<div class="dp__bio">${d.bio.map((b) => `<p>${linkify(b.x)}</p>`).join('')}</div><p class="dp__src">Из публикация в <a href="#/news/${d.bio[0].news}">Прес центъра</a> от ${esc(d.bio[0].date)}</p>` : ''}
          ${d.cv ? `<a class="dp__doc" href="${esc(d.cv)}" target="_blank" rel="noopener"><b>PDF</b><span>Автобиография — ${esc(d.core)}</span></a>` : ''}
          ${!(d.biography && d.biography.length) && !(d.bio && d.bio.length) && !d.cv ? `<div class="dp__todo"><p>Биографията се попълва по единен образец. Информацията се предоставя от клиниката:</p><ul>${todo.map((t) => `<li>${t}</li>`).join('')}</ul></div>` : ''}
        </section>
        ${d.press && d.press.length ? `<section class="dp__sec"><h2>В Прес центъра</h2><div class="dp__press">${d.press.map((n) => `<a href="#/news/${n.id}"><span class="nwm"><img src="${esc(n.img)}" alt="" loading="lazy"></span><small>${esc(n.date)}</small><b>${esc(n.title)}</b></a>`).join('')}</div></section>` : ''}
        ${peers.length ? `<section class="dp__sec"><h2>${us[0] && us[0].team.length > 2 ? 'Колеги от ' + (us[0].kind === 'Отделение' ? 'отделението' : 'звеното') : 'Колеги от клиниката'}</h2><div class="dlines">${peers.map(drLine).join('')}</div></section>` : ''}
      </div></div>`;
    return { title: d.name, html, og: d.img ? `assets/og/dr-${d.slug}.jpg` : `assets/og/clinic-${c.id}.jpg`, desc: `${d.name} — ${d.role ? d.role + ', ' : ''}${c.name}, УМБАЛ „Царица Йоанна – ИСУЛ“.`,
      ld: { '@context': 'https://schema.org', '@type': 'Physician', name: d.name, jobTitle: d.role || undefined, image: d.img ? new URL(d.img, location.href).href : undefined, worksFor: { '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“', department: c.name } } };
  }
  function doctorsIndex() {
    const rank = (d) => (d.head ? 0 : 2) + (d.img ? 0 : 1);
    const ds = PP.list.slice().sort((a, b) => rank(a) - rank(b) || PP.fold(a.core).localeCompare(PP.fold(b.core), 'bg'));
    const STAFF = (window.ISUL_STAFF || []).filter((x) => C.clinics[x.clinic]).sort((a, b) => (/старш/i.test(b.role) - /старш/i.test(a.role)) || a.name.localeCompare(b.name, 'bg'));
    const MG = mgmtPeople(C.pages.management).filter((m) => m.name);
    const mgProf = (n) => { const q = window.ISUL_PEOPLE_API.parse(n, ' '); return q ? PP.list.find((d) => d.key === q.key) : null; };
    const cl = clinicList().filter((c) => PP.inClinic(c.id).length || STAFF.some((x) => x.clinic === c.id));
    const ini = (n) => n.replace(/^(проф\.|доц\.|д-р)\s*/gi, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    const docCard = (d) => `<a class="dcard dcard--ix" href="${drUrl(d)}" data-k="doc" data-c="${d.clinics.join(' ')}" data-u="${d.units.join(' ')}" data-h="${d.head ? 1 : 0}" data-q="${esc(PP.fold(d.name + ' ' + d.role + ' ' + d.clinics.map((i) => C.clinics[i].name).join(' ')))}"><span class="dcard__img${d.img ? ' nwm' : ''}">${d.img ? `<img src="${esc(d.img)}" alt="" loading="lazy">` : `<span class="dcard__ini" aria-hidden="true">${initialsOf(d)}</span>`}</span><span class="dcard__cat">Лекар</span><b>${esc(d.name)}</b>${d.role ? `<small>${esc(d.role)}</small>` : ''}<em>${esc(clinicShort(C.clinics[d.clinic]))}</em></a>`;
    const staffCard = (x) => `<a class="dcard dcard--ix dcard--care" href="#/clinic/${x.clinic}/team" data-k="care" data-c="${x.clinic}" data-u="" data-h="${/старш/i.test(x.role) ? 1 : 0}" data-q="${esc(PP.fold(x.name + ' ' + x.role + ' ' + C.clinics[x.clinic].name))}"><span class="dcard__img"><span class="dcard__ini" aria-hidden="true">${ini(x.name)}</span></span><span class="dcard__cat">Здравни грижи</span><b>${esc(x.name)}</b><small>${esc(x.role)}</small><em>${esc(clinicShort(C.clinics[x.clinic]))}</em></a>`;
    const mgCard = (m) => { const d = mgProf(m.name); return `<a class="dcard dcard--ix dcard--mg" href="${d ? drUrl(d) : '#/management'}" data-k="mg" data-c="" data-u="" data-h="1" data-q="${esc(PP.fold(m.name + ' ' + m.role))}">${(() => { const ph = (d && d.img) || mgPhoto(m.name); return `<span class="dcard__img${ph ? ' nwm' : ''}">${ph ? `<img src="${esc(ph)}" alt="" loading="lazy">` : `<span class="dcard__ini" aria-hidden="true">${ini(m.name)}</span>`}</span>`; })()}<span class="dcard__cat">Ръководство</span><b>${esc(m.name)}</b><small>${esc(m.role)}</small>${m.mail ? `<em>${esc(m.mail)}</em>` : ''}</a>`; };
    const all = MG.length + ds.length + STAFF.length;
    const cnt = (id) => PP.inClinic(id).length + STAFF.filter((x) => x.clinic === id).length;
    return { title: 'Екип', html: hero('Екипът на ИСУЛ', [['Екип']], `${ds.length} лекари, ${STAFF.length} професионалисти по здравни грижи и ръководството на болницата.`) +
      `<section class="dix2"><div class="vwrap dix2__grid">
        <aside class="dix2__side">
          <div class="jb__find"><span>${ICON.search}</span><label class="vh" for="dq">Търси</label><input id="dq" type="search" placeholder="Име, длъжност…" autocomplete="off"></div>
          <h3>Екип</h3>
          <div class="jb__f" id="dkind"><button type="button" aria-pressed="true" data-v="">Всички<span>${all}</span></button><button type="button" aria-pressed="false" data-v="mg">Ръководство<span>${MG.length}</span></button><button type="button" aria-pressed="false" data-v="doc">Лекари<span>${ds.length}</span></button><button type="button" aria-pressed="false" data-v="care">Здравни грижи<span>${STAFF.length}</span></button></div>
          <label class="dix2__chk"><input type="checkbox" id="dhead"> Само ръководители и старши</label>
          <h3>Клиника / отделение</h3>
          <div class="jb__f" id="dcl"><button type="button" aria-pressed="true" data-v="">Всички клиники</button>${cl.map((c) => { const us = PP.unitsOf(c.id).filter((u) => u.team.length || u.headP); return `<button type="button" aria-pressed="false" data-v="${c.id}">${esc(clinicShort(c))}<span>${cnt(c.id)}</span></button>${us.length ? `<div class="dix2__units" data-for="${c.id}" hidden>${us.map((u) => `<button type="button" aria-pressed="false" data-u="${u.slug}">${esc(u.name)}</button>`).join('')}</div>` : ''}`; }).join('')}</div>
        </aside>
        <div class="dix2__main"><p class="dix__n" id="dn"></p>
          <div class="dcards dcards--ix" id="dall">${MG.map(mgCard).join('')}${ds.map(docCard).join('')}${STAFF.map(staffCard).join('')}</div>
          <p class="jb__empty" id="dempty" hidden>Няма хора по избраните филтри.</p></div>
      </div></section>`,
      init: () => {
        const st = { k: '', c: '', u: '', q: '', h: false }, n = $('#dn');
        const run = () => { let k = 0; $$('#dall .dcard').forEach((a) => { const ok = (!st.k || a.dataset.k === st.k) && (!st.c || a.dataset.c.split(' ').includes(st.c)) && (!st.u || a.dataset.u.split(' ').includes(st.u)) && (!st.h || a.dataset.h === '1') && (!st.q || a.dataset.q.includes(st.q)); a.hidden = !ok; if (ok) k++; }); n.textContent = `${k} ${k === 1 ? 'човек' : 'души'}`; $('#dempty').hidden = !!k; };
        $$('#dkind button').forEach((b) => b.addEventListener('click', () => { $$('#dkind button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); st.k = b.dataset.v; run(); }));
        $$('#dcl > button').forEach((b) => b.addEventListener('click', () => { $$('#dcl > button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); st.c = b.dataset.v; st.u = ''; $$('.dix2__units').forEach((g) => { g.hidden = g.dataset.for !== st.c; g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false')); }); run(); }));
        $$('.dix2__units button').forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', String(on)); st.u = on ? b.dataset.u : ''; run(); }));
        $('#dq').addEventListener('input', (e) => { st.q = PP.fold(e.target.value.trim()); run(); });
        $('#dhead').addEventListener('change', (e) => { st.h = e.target.checked; run(); });
        // „Виж всички резултати“ from the homepage finder: #/doctors?k=doc&c=3 or #/doctors?k=doc&q=…
        const arg = (k) => hashRoute(location.hash).q.get(k) || '';
        const k0 = arg('k'), c0 = arg('c'), q0 = arg('q');
        if (k0) { const b = $(`#dkind button[data-v="${k0}"]`); if (b) b.click(); }
        if (c0) { const b = $(`#dcl > button[data-v="${c0}"]`); if (b) b.click(); }
        if (q0) { $('#dq').value = q0; st.q = PP.fold(q0.trim()); }
        run();
      } };
  }
  /* social / search metadata for every route: og:image is the watermarked 1200×630 file */
  function setMeta(r) {
    const abs = (u) => new URL(u, location.href).href;
    const set = (attr, key, val) => { let m = document.head.querySelector(`meta[${attr}="${key}"]`); if (!m) { m = document.createElement('meta'); m.setAttribute(attr, key); document.head.appendChild(m); } m.setAttribute('content', val); };
    const t = r ? r.title + ' · УМБАЛ „Царица Йоанна – ИСУЛ“' : document.title;
    const desc = (r && r.desc) || 'УМБАЛ „Царица Йоанна – ИСУЛ“ — университетска многопрофилна болница за активно лечение в София.';
    const img = abs((r && r.og) || 'assets/og/isul.jpg');
    set('name', 'description', desc);
    [['og:title', t], ['og:description', desc], ['og:image', img], ['og:image:width', '1200'], ['og:image:height', '630'], ['og:url', location.href], ['og:type', r && r.ld && r.ld['@type'] === 'NewsArticle' ? 'article' : 'website'], ['og:site_name', 'УМБАЛ „Царица Йоанна – ИСУЛ“'], ['og:locale', 'bg_BG']].forEach(([k, v]) => set('property', k, v));
    [['twitter:card', 'summary_large_image'], ['twitter:image', img], ['twitter:title', t]].forEach(([k, v]) => set('name', k, v));
    let ld = document.getElementById('ld-json'); if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'ld-json'; document.head.appendChild(ld); }
    ld.textContent = r && r.ld ? JSON.stringify(r.ld) : JSON.stringify({ '@context': 'https://schema.org', '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“', url: location.href.split('#')[0], telephone: '+35929432170', address: { '@type': 'PostalAddress', streetAddress: 'ул. „Бяло море“ № 8', addressLocality: 'София', postalCode: '1527', addressCountry: 'BG' } });
  }
  /* Анатомичен навигатор → doctors of the zone's clinics (heads and doctors with a profile first) */
  const ZONE_UNIT = { breast: ['rak-na-gardata'], bladder: ['nizkodozova-brahiterapia', 'centar-prostata'], ent: ['parvo-ung', 'vtoro-ung', 'kohlearna-implantacia'], child: ['detsko-ung'] };
  if (PP) window.ISUL_NAV_DOCTORS = (slugs, zone) => {
    const ids = [...new Set(slugs.map((x) => SLUG2ID[x]).filter(Boolean))];
    const unitDocs = (ZONE_UNIT[zone] || []).flatMap((u) => PP.units.filter((x) => x.slug === u).flatMap((x) => (x.headP ? [x.headP] : []).concat(x.team)));
    const seen = new Set(), list = [];
    const push = (d) => { if (d && !seen.has(d.slug)) { seen.add(d.slug); list.push(d); } };
    unitDocs.forEach(push);
    ids.forEach((id) => PP.inClinic(id).filter((d) => d.head).forEach(push));
    ids.forEach((id) => PP.inClinic(id).filter((d) => d.img || d.biography).forEach(push));
    if (!list.length) return '';
    const total = ids.reduce((n, id) => n + PP.inClinic(id).length, 0);
    return `<div class="pz"><h3>Лекари</h3><ul class="pz__docs">${list.slice(0, 6).map((d) => `<li><a href="#/lekar/${d.slug}"><span class="pz__av">${d.img ? `<img src="${esc(d.img)}" alt="" loading="lazy">` : esc((d.first[0] + d.last[0]).toUpperCase())}</span><span><b>${esc(d.name)}</b><small>${esc(d.role || C.clinics[d.clinic].name)}</small></span></a></li>`).join('')}</ul>${total > 6 ? `<a class="pz__more" href="#/doctors">Всички ${total} лекари в ${ids.length > 1 ? 'тези клиники' : 'клиниката'} →</a>` : ''}</div>`;
  };
  function doctorsPage() {
    if (NEW && PP) return doctorsIndex();
    const all = []; clinicList().forEach((c) => c.leaders.forEach((l) => all.push({ ...l, c })));
    return { title: 'Лекари', html: hero('Лекари и ръководители', [['Лекари']], 'Ръководителите на клиниките и отделенията, по данни от официалния сайт. Пълните екипи са в страницата на всяка клиника.', `<label class="vh" for="docq">Търси лекар</label><input id="docq" class="pg-search" placeholder="Търси по име или клиника…">`) +
      `<div class="vwrap"><div class="docs-grid" id="docs">${all.map((l) => `<a class="leader leader--card" href="#/clinic/${l.c.id}/team" data-q="${esc((l.name + ' ' + l.c.name).toLowerCase())}"><span class="leader__img">${l.img && !/team\.jpg/.test(l.img) ? `<img src="${esc(l.img)}" alt="${esc(l.name)}" loading="lazy">` : '<span class="leader__ph" aria-hidden="true"></span>'}</span><b>${esc(l.name)}</b><small>${esc(l.role)}</small><em>${esc(l.c.name)}</em></a>`).join('')}</div></div>`,
      init: () => $('#docq').addEventListener('input', (e) => { const q = e.target.value.toLowerCase().trim(); $$('#docs .leader').forEach((a) => { a.hidden = q && !a.dataset.q.includes(q); }); }) };
  }
  const newsDate = (n) => n.date || '';
  /* =========================================================
     PRESS CENTRE — news portal (variants B & D)
     ========================================================= */
  const RUBRICS = [['all', 'Всички'], ['latest', 'Последни'], ['news', 'Новини'], ['interviews', 'Интервюта'], ['patients', 'Пациенти'], ['achievements', 'Постижения'], ['video', 'Видео']];
  const RNAME = { news: 'Новини', interviews: 'Интервюта', patients: 'Пациенти', achievements: 'Постижения', video: 'Видео' };
  const rubricOf = (n) => { const t = n.title;
    if (/номинация|награда|признание|изява|придобивк|обновяване|за първи път|иновативн|високотехнолог|реконструктивн|финансирани/i.test(t)) return 'achievements';
    if (/^([Дд]-р|Доц\.|Проф\.|Маг\.|Кардиолог|[А-Я][а-я]+ [А-Я][а-я]+)[^:]{0,60}:/.test(t)) return 'interviews';
    if (/пациент|безплатни|прегледи|програма|подкреп|сила|препоръки|рисков|хран|дете|първа помощ|червата|хормон/i.test(t)) return 'patients';
    return 'news'; };
  const minsOf = (n) => Math.max(2, Math.round((n.blocks || []).map((b) => b.x || '').join(' ').split(/\s+/).length / 200));
  window.ISUL_RUBRIC = { of: rubricOf, names: RNAME, mins: minsOf };   // same rubrics on the homepage news (x-hub.js)
  const PRESS_BG = new URL('assets/photos/press-mics.jpg', location.href).href;
  const PRESS_VIDEOS = [
    { src: 'assets/video/hero-isul-1080.mp4', poster: 'assets/video/hero-isul-poster.jpg', t: 'Лекарите на ИСУЛ', p: 'Видео разказ от болницата', d: '10.10.2026', dur: '0:18' },
    { src: 'assets/video/hero-students.mp4', poster: 'assets/video/hero-students-poster.jpg', t: 'Университетска болница: обучение на студенти и специализанти', p: 'Обучение', d: '05.10.2026', dur: '0:15' },
    { src: 'assets/video/v4773.mp4', poster: 'assets/video/v4773.jpg', t: 'Зад кулисите на Клиничната лаборатория', p: 'Лаборатории', d: '28.09.2026', dur: '0:20' },
    { src: 'assets/video/v17625.mp4', poster: 'assets/video/v17625.jpg', t: 'Как протича ЯМР изследване', p: 'Образна диагностика', d: '20.09.2026', dur: '0:16' },
    { src: 'assets/video/v46365.mp4', poster: 'assets/video/v46365.jpg', t: 'Интензивно наблюдение в кардиологията', p: 'Кардиология', d: '12.09.2026', dur: '0:14' },
    { src: 'assets/video/v6562.mp4', poster: 'assets/video/v6562.jpg', t: 'Преглед при специалист', p: 'Пациенти', d: '03.09.2026', dur: '0:15' }
  ];
  function pressPage() {
    const items = C.news.map((n) => ({ ...n, r: rubricOf(n), m: minsOf(n) }));
    const rb = (n) => `<span class="pc-rb pc-rb--${n.r}">${RNAME[n.r]}</span>`;
    const meta = (n) => `<span class="pc-meta">${rb(n)}<time>${esc(n.date)}</time><span>${n.m} мин четене</span></span>`;
    const cardBig = (n) => `<a class="pc-lead" href="#/news/${n.id}"><span class="pc-lead__img nwm"><img src="${esc(n.img)}" alt=""></span><span class="pc-lead__txt">${meta(n)}<h2>${esc(n.title)}</h2><p>${esc(((n.blocks || []).find((b) => b.t === 'p' && (b.x || '').length > 60) || {}).x || '').slice(0, 140)}…</p><b>Прочети →</b></span></a>`;
    const cardMid = (n) => `<a class="pc-mid" href="#/news/${n.id}"><span class="pc-mid__img"><img src="${esc(n.img)}" alt="" loading="lazy"></span><span class="pc-mid__t">${meta(n)}<h3>${esc(n.title)}</h3></span></a>`;
    const card = (n) => `<a class="pc-card" href="#/news/${n.id}" data-r="${n.r}"><span class="pc-card__img nwm"><img src="${esc(n.img)}" alt="" loading="lazy"></span>${meta(n)}<h3>${esc(n.title)}</h3></a>`;
    const vcard = (v, i) => `<button type="button" class="pc-v" data-pv="${i}"><span class="pc-v__img"><img src="${esc(v.poster)}" alt="" loading="lazy"><i aria-hidden="true"></i><em>${v.dur}</em></span><span class="pc-meta"><span class="pc-rb pc-rb--video">Видео</span><time>${v.d}</time></span><b>${esc(v.t)}</b></button>`;
    const [lead, ...rest] = items;
    const popular = items.slice().sort((a, b) => b.m - a.m).slice(0, 5);
    const sectionFor = (k) => { const list = items.filter((n) => n.r === k); return list.length ? `<section class="pc-sec" data-sec="${k}"><header class="pc-sec__h"><h2>${RNAME[k]}</h2><span>${list.length}</span><button type="button" data-goto="${k}">Виж всички →</button></header><div class="pc-grid pc-grid--row">${list.slice(0, 5).map(card).join('')}</div></section>` : ''; };
    HX.img = PRESS_BG;
    const html = hero('Прес център', [['Прес център']], 'Новини, интервюта и видео от УМБАЛ „Царица Йоанна – ИСУЛ“.') +
      `<div class="pc">
        <nav class="pc-nav" aria-label="Рубрики"><div class="vwrap pc-nav__in">${RUBRICS.map(([k, t], i) => `<button type="button" data-rub="${k}" aria-pressed="${i === 0}">${t}${k !== 'all' && k !== 'latest' ? `<span>${k === 'video' ? PRESS_VIDEOS.length : items.filter((n) => n.r === k).length}</span>` : ''}</button>`).join('')}</div></nav>
        <div class="vwrap">
          <div class="pc-view" data-view="all">
            <div class="pc-top"><div class="pc-top__main">${lead ? cardBig(lead) : ''}</div><div class="pc-top__side">${rest.slice(0, 4).map(cardMid).join('')}<div class="pc-media"><h3>За медиите</h3><p>Ръководител пресцентър <b>Моника Николова</b> · <a href="mailto:pr@isul.eu">pr@isul.eu</a></p></div></div>
              <aside class="pc-pop"><h3>Най-четени</h3><ol>${popular.map((n, i) => `<li><a href="#/news/${n.id}"><span class="pc-pop__img"><img src="${esc(n.img)}" alt="" loading="lazy"><span>${i + 1}</span></span><b>${esc(n.title)}</b></a></li>`).join('')}</ol></aside></div>
            ${['interviews', 'patients', 'achievements', 'news'].map(sectionFor).join('')}
          </div>
          <div class="pc-view" data-view="list" hidden><div class="pc-grid" id="pc-list"></div><p class="pc-empty" hidden>Няма публикации в тази рубрика.</p></div>
        </div>
        <section class="pc-video" data-sec="video"><div class="vwrap"><header class="pc-sec__h pc-sec__h--d"><h2>Видео</h2><span>${PRESS_VIDEOS.length}</span><button type="button" data-goto="video">Виж всички →</button></header><div class="pc-vgrid">${PRESS_VIDEOS.map(vcard).join('')}</div><p class="pc-note">Временни клипове; ще бъдат заменени с видео новини, заснети в ИСУЛ.</p></div></section>
        <div class="vwrap"><p class="pg-src">Архивът с всички новини е в <a href="https://isul.eu/news.html" target="_blank" rel="noopener">isul.eu/news.html</a> и ще бъде мигриран изцяло. Снимка в заглавието: Tony Webster, <a href="https://commons.wikimedia.org/wiki/File:News_Microphones_at_Press_Conference.jpg" target="_blank" rel="noopener">CC BY 2.0</a>.</p></div>
      </div>`;
    return { title: 'Прес център', og: 'assets/og/press.jpg', desc: 'Новини, интервюта и видео от УМБАЛ „Царица Йоанна – ИСУЛ“.', html, init: () => {
      const root = $('.pc', page), nav = $('.pc-nav', root), all = $('[data-view="all"]', root), lst = $('[data-view="list"]', root), grid = $('#pc-list', root), vid = $('.pc-video', root);
      const show = (k) => {
        $$('button', nav).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rub === k)));
        if (k === 'all') { all.hidden = false; lst.hidden = true; vid.hidden = false; }
        else if (k === 'video') { all.hidden = true; lst.hidden = true; vid.hidden = false; }
        else { all.hidden = true; vid.hidden = true; lst.hidden = false; const list = k === 'latest' ? items : items.filter((n) => n.r === k); grid.innerHTML = list.map(card).join(''); $('.pc-empty', root).hidden = !!list.length; }
        const top = nav.getBoundingClientRect().top + scrollY - 70; if (scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
      };
      nav.addEventListener('click', (e) => { const b = e.target.closest('[data-rub]'); if (b) show(b.dataset.rub); });
      const r0 = (location.hash.match(/[?&]r=([a-z]+)/) || [])[1]; if (r0 && RUBRICS.some(([k]) => k === r0)) show(r0);
      root.addEventListener('click', (e) => {
        const g = e.target.closest('[data-goto]'); if (g) { show(g.dataset.goto); return; }
        const v = e.target.closest('[data-pv]'); if (!v) return;
        const it = PRESS_VIDEOS[+v.dataset.pv], m = document.createElement('div'); m.className = 'pn__modal';
        m.innerHTML = `<div><button type="button" aria-label="Затвори">×</button><video src="${it.src}" poster="${it.poster}" controls autoplay playsinline></video><p>${esc(it.t)}</p></div>`;
        document.body.appendChild(m); m.addEventListener('click', (ev) => { if (ev.target === m || ev.target.closest('button')) m.remove(); });
      });
    } };
  }

  function newsPage() {
    if (NEW) return pressPage();
    const extra = (window.NEWS || []).filter((n) => !C.news.some((x) => x.title === n.title));
    return { title: 'Новини', html: hero('Новини', [['Новини']], 'Последните новини от УМБАЛ „Царица Йоанна – ИСУЛ“.') +
      `<div class="vwrap"><div class="news-grid">${C.news.map((n, i) => `<a class="ncard${i === 0 ? ' is-big' : ''}" href="#/news/${n.id}"><span class="ncard__img nwm"><img src="${esc(n.img)}" alt="" loading="lazy"></span><span class="ncard__meta">${esc(n.cat)} · ${esc(newsDate(n))}</span><b>${esc(n.title)}</b></a>`).join('')}${extra.map((n) => `<a class="ncard" href="#/news"><span class="ncard__img nwm"><img src="${esc(n.img)}" alt="" loading="lazy"></span><span class="ncard__meta">${esc(n.cat)} · ${n.date.split('-').reverse().join('.')}</span><b>${esc(n.title)}</b></a>`).join('')}</div>
      <p class="pg-src">Архивът с всички новини е в <a href="https://isul.eu/news.html" target="_blank" rel="noopener">isul.eu/news.html</a> и ще бъде мигриран изцяло.</p></div>` + videoBand() };
  }
  /* Single news article (variants B & D): compact header, styled text column, gallery with lightbox */
  function newsArticle(n) {
    const r = rubricOf(n), mins = minsOf(n), url = location.href.split('#')[0] + '#/news/' + n.id;
    const imgs = [n.img].concat(n.blocks.filter((b) => b.t === 'img' && b.src).map((b) => b.src)).filter((x, i, a) => x && a.indexOf(x) === i);
    const body = n.blocks.filter((b) => b.t !== 'img');
    const dek = body[0] && body[0].t === 'p' && body[0].x.length < 260 ? body.shift().x : '';
    // pull quote: first quoted phrase of a readable length
    let quote = ''; for (const b of body) { const m = (b.x || '').match(/„([^“]{50,200})“/); if (m) { quote = m[1]; break; } }
    let html = '', i = 0, qDone = false;
    for (const b of body) {
      const x = b.x || '';
      if (b.t === 'h') html += `<h2>${esc(x)}</h2>`;
      else if (b.t === 'li') html += `<ul><li>${esc(x)}</li></ul>`;
      else if (b.t === 'p' && /\?\s*$/.test(x) && x.length < 260) html += `<p class="na__q">${esc(x)}</p>`;
      else html += para(b);
      i++;
      if (!qDone && quote && i === 3) { html += `<blockquote class="na__quote"><p>${esc(quote)}</p></blockquote>`; qDone = true; }
    }
    html = html.replace(/<\/ul><ul>/g, '');
    const same = C.news.filter((x) => x.id !== n.id && rubricOf(x) === r).slice(0, 4);
    const latest = C.news.filter((x) => x.id !== n.id).slice(0, 4);
    const share = `<div class="na__share" aria-label="Сподели"><button type="button" data-copylink title="Копирай връзката" aria-label="Копирай връзката"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg></button><a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="Сподели във Facebook">f</a><a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="Сподели в LinkedIn">in</a><a href="mailto:?subject=${encodeURIComponent(n.title)}&body=${encodeURIComponent(url)}" aria-label="Изпрати по имейл"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></a><button type="button" data-print aria-label="Принтирай"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg></button></div>`;
    const gallery = imgs.length > 1 ? `<section class="na__gal" aria-label="Галерия"><h2>Галерия <span>${imgs.length} снимки</span></h2><div class="na__galg">${imgs.map((src, k) => `<button type="button" data-lb="${k}"><img src="${esc(src)}" alt="Снимка ${k + 1}" loading="lazy"></button>`).join('')}</div></section>` : '';
    const card = (m) => `<a class="pc-card" href="#/news/${m.id}"><span class="pc-card__img nwm"><img src="${esc(m.img)}" alt="" loading="lazy"></span><span class="pc-meta"><span class="pc-rb pc-rb--${rubricOf(m)}">${RNAME[rubricOf(m)]}</span><time>${esc(m.date)}</time></span><h3>${esc(m.title)}</h3></a>`;
    const out = `<header class="pg-hero pg-hero--x na-hd" style="--bg:url('${PRESS_BG}')"><div class="vwrap pg-hero__in">${crumbs([['Прес център', '#/news'], [RNAME[r]]])}</div></header>
      <div class="na"><div class="vwrap na__grid">
        <aside class="na__rail">${share}</aside>
        <article class="na__main">
          <header class="na__head"><p class="pc-meta"><span class="pc-rb pc-rb--${r}">${RNAME[r]}</span><time>${esc(n.date)}</time><span>${mins} мин четене</span></p><h1>${esc(n.title)}</h1>${dek ? `<p class="na__dek">${esc(dek)}</p>` : ''}<div class="na__by"><span>Прес център · УМБАЛ „Царица Йоанна – ИСУЛ“</span>${share.replace('class="na__share"', 'class="na__share na__share--row"')}</div></header>
          ${n.img ? `<figure class="na__hero"><button type="button" class="nwm" data-lb="0" aria-label="Увеличи снимката"><img src="${esc(n.img)}" alt=""></button><figcaption><span>${esc(n.title.length > 90 ? n.title.slice(0, 88) + '…' : n.title)}</span><span>Снимка: УМБАЛ „Царица Йоанна – ИСУЛ“${imgs.length > 1 ? ` · <button type="button" data-lb="0">Галерия · ${imgs.length} снимки</button>` : ''}</span></figcaption></figure>` : ''}

          <div class="na__body">${html}</div>
          ${gallery}
          <footer class="na__foot"><span>Рубрика: <a href="#/news">${RNAME[r]}</a></span>${share}<a class="na__back" href="#/news">← Към Прес центъра</a></footer>
        </article>
        <aside class="na__side"><div class="na__sticky"><h3>Най-нови</h3>${latest.map((m) => `<a class="na__li" href="#/news/${m.id}"><span><img src="${esc(m.img)}" alt="" loading="lazy"></span><b>${esc(m.title)}</b><small>${esc(m.date)}</small></a>`).join('')}<div class="pc-media"><h3>За медиите</h3><p>Ръководител пресцентър <b>Моника Николова</b> · <a href="mailto:pr@isul.eu">pr@isul.eu</a></p></div></div></aside>
      </div></div>
      ${same.length ? `<section class="na-more"><div class="vwrap"><header class="pc-sec__h"><h2>Още от „${RNAME[r]}“</h2><a href="#/news">Всички →</a></header><div class="pc-grid pc-grid--row">${same.map(card).join('')}</div></div></section>` : ''}
      <div class="na-lb" hidden role="dialog" aria-modal="true" aria-label="Галерия"><button type="button" class="na-lb__x" aria-label="Затвори">×</button><button type="button" class="na-lb__p" aria-label="Предишна">‹</button><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="na-lb__n" aria-label="Следваща">›</button></div>`;
    const init = (root) => {
      root = root || document;
      $$('[data-copylink]', root).forEach((b) => b.addEventListener('click', () => { (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(() => { b.classList.add('is-ok'); setTimeout(() => b.classList.remove('is-ok'), 1500); }, () => {}); }));
      $$('[data-print]', root).forEach((b) => b.addEventListener('click', () => print()));
      const lb = $('.na-lb', root); if (!lb) return;
      const im = $('img', lb), cap = $('figcaption', lb); let k = 0;
      const show = (j) => { k = (j + imgs.length) % imgs.length; im.src = imgs[k]; cap.textContent = `${k + 1} / ${imgs.length}`; };
      const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
      $$('[data-lb]', root).forEach((b) => b.addEventListener('click', () => { show(+b.dataset.lb); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.na-lb__x', lb).focus(); }));
      $('.na-lb__x', lb).addEventListener('click', close);
      $('.na-lb__p', lb).addEventListener('click', () => show(k - 1));
      $('.na-lb__n', lb).addEventListener('click', () => show(k + 1));
      lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
      document.addEventListener('keydown', (e) => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(k - 1); if (e.key === 'ArrowRight') show(k + 1); });
      $$('.na-lb__p, .na-lb__n', lb).forEach((b) => { b.hidden = imgs.length < 2; });
    };
    return { title: n.title, html: out, init, og: `assets/og/news-${n.id}.jpg`, desc: dek || ((body.find((b) => b.t === 'p') || {}).x || '').slice(0, 180), ld: { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: n.title, datePublished: n.date.split('.').reverse().join('-'), image: [new URL(`assets/og/news-${n.id}.jpg`, location.href).href], publisher: { '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“' } } };
  }
  function newsDetail(id) {
    const n = C.news.find((x) => x.id === id); if (!n) return notFound();
    const more = C.news.filter((x) => x.id !== id).slice(0, 3);
    if (NEW) {
      return newsArticle(n);
      HX.img = n.img || '';
      const lead = n.img ? [{ t: 'img', src: n.img, alt: '' }] : [];
      const art = `<article class="rart">${n.img ? `<figure class="rart__lead nwm"><img src="${esc(n.img)}" alt=""></figure>` : ''}<div class="rart__body">${blocks(n.blocks)}</div></article>`;
      const side = [`<div class="ra"><h3>За новината</h3><p class="ra__meta"><span>${esc(n.cat)}</span><span>${esc(newsDate(n))}</span></p><button type="button" class="ra__cta ra__cta--l" data-copylink>${ICON.link}Копирай връзката</button></div>`, `<div class="ra ra--news"><h3>Още новини</h3>${more.map((m) => `<a href="#/news/${m.id}"><span class="ra__nimg nwm"><img src="${esc(m.img)}" alt="" loading="lazy"></span><span><small>${esc(newsDate(m))}</small>${esc(m.title)}</span></a>`).join('')}</div>`];
      return { title: n.title, init: richInit, html: hero(n.title, [['Новини', '#/news'], [n.title.slice(0, 40) + (n.title.length > 40 ? '…' : '')]], esc(n.cat + ' · ' + newsDate(n))) + `<div class="rp"><div class="vwrap rp__grid"><div class="rp__main">${art}</div><aside class="rp__side">${side.join('')}</aside></div></div>` +
        `<section class="band band--isul"><div class="vwrap band__in">${CROWN}<div class="band__body band__body--wide"><h3>Още новини</h3><div class="news-grid news-grid--3">${more.map((m) => `<a class="ncard" href="#/news/${m.id}"><span class="ncard__img nwm"><img src="${esc(m.img)}" alt="" loading="lazy"></span><span class="ncard__meta">${esc(m.cat)} · ${esc(newsDate(m))}</span><b>${esc(m.title)}</b></a>`).join('')}</div></div></div></section>` + videoBand() };
    }
    return { title: n.title, html: hero(n.title, [['Новини', '#/news'], [n.title.slice(0, 40) + (n.title.length > 40 ? '…' : '')]], esc(n.cat + ' · ' + newsDate(n))) +
      `<div class="vwrap pg-grid pg-grid--news"><article class="pg-body">${n.img ? `<figure class="lead-img"><img src="${esc(n.img)}" alt=""></figure>` : ''}${blocks(n.blocks)}</article><aside class="pg-side"><b>Още новини</b>${more.map((m) => `<a href="#/news/${m.id}">${esc(m.title)}</a>`).join('')}</aside></div>` + videoBand() };
  }
  /* #/book — „Как да се прегледам“ (variant X): the clinic's кабинет in ДКБ is the way to a specialist of the hospital.
     From isul.eu (ДКБ page, „Прием на пациенти“) and the Правилник for examinations and admissions (in force from 01.07.2026).
     SuperDoc books only Медицински център, so it is not here — it stays on the centre's page. */
  function bookXPage() {
    const A = IC.arrow, dkb = C.clinics['19'];
    HX.sec = SECTIONS[2]; HX.cur = 'book';
    // the cabinets exactly as listed on isul.eu
    const cabs = (dkb ? dkb.blocks : []).map((b) => (b.x || '').trim()).filter((x) => /кабинет/i.test(x) && /№\s*\d/.test(x) && x.length < 90);
    const steps = [
      ['Направление', `За прием в болница — направление №7 от личния лекар. Платен преглед — без направление; цените са в ${`<a href="#/pricelist">Ценоразписа</a>`}, плащането е на болничната каса.`],
      ['Обадете се', `На телефонната централа <a href="${telOf('02 9432 170')}">02 9432 170</a> — за информация кога приема кабинетът на клиниката.`],
      ['Елате в ДКБ', 'Диагностично-консултативният блок е на II етаж над Спешно отделение. Прегледите са в работни дни от 8 до 14 ч. (в някои кабинети до 16 ч.).'],
      ['Изчакайте пред кабинета', 'Всяка клиника има свой кабинет в ДКБ. Редът се определя от медицинската сестра в кабинета, а не от реда на идване.'],
      ['След прегледа', 'При нужда от лечение лекарят Ви вписва в листата на чакащите и Ви дава дата за прием. Контролните прегледи след изписване са в същия кабинет.']];
    const html = hero('Как да се прегледам', [['За пациента', '#/patient'], ['Как да се прегледам']], 'При специалист от клиниките на ИСУЛ се преглеждате в кабинета на клиниката в Диагностично-консултативния блок (ДКБ).') +
      `<section class="bk"><div class="vwrap">
        <ol class="bk-steps">${steps.map(([t, d], i) => `<li><span>${i + 1}</span><b>${t}</b><p>${d}</p></li>`).join('')}</ol>
        ${cabs.length ? `<div class="bk-cab"><div class="bk-h"><h2>Кабинетите в ДКБ</h2><a href="#/kade/c20">Сградата на Спешно отделение на картата ${A}</a></div>
          ${dkbCards(cabs)}
          <p class="bk-note">Списъкът е по сайта на болницата. Подробностите са в страницата на <a href="#/clinic/19">Диагностично-консултативния блок</a>.</p></div>` : ''}
        <div class="bk-more">
          <a href="#/clinic/27"><b>С направление №3 или №4</b><p>Консултациите при специалист по НЗОК са в Медицинския център „ИСУЛ – Царица Йоанна“ — V етаж над Спешно отделение.</p><em>Медицински център ${A}</em></a>
          <a href="#/admission"><b>Прием в болницата</b><p>Документи, планов прием, листа на чакащите и какво да носите.</p><em>Прием ${A}</em></a>
          <a class="is-emg" href="#/clinic/20"><b>Спешно</b><p>Спешно отделение — денонощно. Регистратура <span>02 9432 203</span>. При опасност за живота — 112.</p><em>Спешно отделение ${A}</em></a>
        </div>
        <p class="bk-note">По информацията на isul.eu и Правилника за прегледи, изследвания и хоспитализации в УМБАЛ „Царица Йоанна – ИСУЛ“ (в сила от 01.07.2026).</p>
      </div></section>`;
    return { title: 'Как да се прегледам', desc: 'Прегледите при специалистите на ИСУЛ — в кабинета на клиниката в Диагностично-консултативния блок.', html };
  }
  function bookPage() {
    if (window.ISUL_X) return bookXPage();
    const mc = C.clinics['27'];
    HX.sec = SECTIONS[2]; HX.cur = 'book';
    return { title: 'Запази час', html: hero('Запази час', [['За пациента', '#/patient'], ['Запази час']], 'Медицински център „ИСУЛ – Царица Йоанна“ записва часове онлайн през платформата СуперДок.') +
      (NEW ? (V2 ? (h) => `<div class="vwrap pg2-top">${h}</div>` : (h) => band(h, 0))(`<div class="book-cards"><a class="book-card is-main" href="${SUPERDOC}" target="_blank" rel="noopener"><span>Онлайн</span><b>Запази час в СуперДок ↗</b><small>По направление от НЗОК, платено или със здравноосигурителен фонд</small></a></div>`) + (mc ? bands(mc.blocks, '', 1) : '') : '') + (NEW ? '' : layout(SECTIONS[2], 'book', `<div class="book-cards"><a class="book-card is-main" href="${SUPERDOC}" target="_blank" rel="noopener"><span>Онлайн</span><b>Запази час в СуперДок ↗</b><small>По направление от НЗОК, платено или със здравноосигурителен фонд</small></a></div>${mc ? blocks(mc.blocks) : ''}`)) + videoBand() };
  }
  /* =========================================================
     Variant X — „За нас“ section: За нас · История · Ръководство · Структура (+ Обяви as publication lists).
     Built from the migrated isul.eu pages (history, history_0x, management, structure, administration, other,
     competition, auction, invitations). Old addresses of merged pages redirect via X_MERGED.
     ========================================================= */
  const xCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  /** „първите в страната“ and „за първи път“ lists from the history page: "Катедра по … (1950, ръководител проф. д-р …)" */
  function xFirsts() {
    const out = [];
    (C.pages.history || { blocks: [] }).blocks.filter((b) => b.t === 'li').forEach((b) => {
      for (const m of b.x.matchAll(/([^()]+?)\s*\((\d{4})(?:,\s*([^)]*))?\)/g)) {
        const what = m[1].replace(/^[\s;.,]+|[\s;.,]+$/g, ''); if (!what || /^През /.test(what)) continue;
        out.push({ y: +m[2], t: xCap(/^(проведен|извършена|проведена)/.test(what) ? 'за първи път ' + what : what), who: (m[3] || '').replace(/^ръководител\s+/, '').replace(/[\s;]+$/, '').trim() });
      }
    });
    return out.sort((a, b) => a.y - b.y);
  }
  /** key moments, summarised from the history page and the archive (Държавен вестник 1927, Медицински вестник 1938) */
  const X_TIMELINE = [
    { y: '1927', d: '18 март', t: 'Законът за болницата', p: 'Народното събрание приема Закон за построяване на болница на обществените осигуровки в София. Указът е подписан от цар Борис III.', img: 'assets/photos/history/Zakon_postroiavane.jpg', cap: 'Държавен вестник, бр. 3/1927 г.', key: 1 },
    { y: '1934', t: 'Първите кабинети', p: 'Част от сградата вече работи като поликлиника, аптека и „рентгенов институт“.' },
    { y: '1936', d: '11 ноември', t: 'Рождената дата', p: 'Заповедта за назначаване на лекари в Работническа болница „Царица Йоанна“. През 2009 г. тази дата е приета за рождена дата на болницата.', key: 1 },
    { y: '1938', d: '1 август', t: 'Първите пациенти на легло', p: 'Болницата приема лежащо болни: 380 легла в седем отделения, 700–800 посещения в поликлиниките дневно.', img: 'assets/photos/history/building-1938.jpg', cap: 'Медицински вестник, бр. 1/1938 г.', key: 1 },
    { y: '1940-те', t: 'Във войната', p: 'По време на Втората световна война болницата приютява пострадали. Близостта до железопътната мрежа се оказва изключително важна за ранените от фронта.' },
    { y: '1950', d: '2 октомври', t: 'Основан е ИСУЛ', p: 'С Указ №528 е основан Институтът за специализация и усъвършенстване на лекарите. Първи ректор е проф. Гоце Тенчов.', img: 'assets/photos/history/Prof_Gotse_Tenchov.jpg', cap: 'Проф. Гоце Тенчов', face: 1, key: 1 },
    { y: '1961', t: 'Училище за лекари', p: 'Щатът на института е 1054 души, а специализиралите лекари са 11 829.' },
    { y: '1971', t: '39 катедри', p: 'Терапевтични, хирургични, медико-биологични, параклинични и стоматологични катедри.' },
    { y: '1972', d: '30 април', t: 'Медицинска академия', p: 'ИСУЛ става Втора база на Медицинска академия.' },
    { y: '1990', d: '29 октомври', t: 'Болница „Царица Йоанна“', p: 'Втората база става Многопрофилна болница за активно лечение „Царица Йоанна“ — търговско дружество със 100% държавно участие.' },
    { y: '2007', d: 'декември', t: 'УМБАЛ „Царица Йоанна – ИСУЛ“', p: 'Болницата получава днешното си име — университетска многопрофилна болница за активно лечение.', key: 1 },
    { y: '2026', d: '11 ноември', t: '90 години', p: 'Девет десетилетия, посветени на живота.', now: 1 }
  ];
  const xTimeline = (items, withImg) => `<ol class="ab-tl__list">${items.map((e) => `<li class="ab-tl__it${e.now ? ' ab-tl__it--now' : ''}"><span class="ab-tl__y">${e.y}</span><div class="ab-tl__b">${e.d ? `<small>${esc(e.d)}</small>` : ''}<h3>${esc(e.t)}</h3><p>${esc(e.p)}</p>${withImg && e.img ? `<span class="ab-tl__img${e.face ? ' ab-tl__img--face' : ''}"><img src="${e.img}" alt="" loading="lazy"><em>${esc(e.cap)}</em></span>` : ''}</div></li>`).join('')}</ol>`;
  /** the four medical blocks of the official structure page, with their units */
  function xStructure() {
    const out = []; let cur = null;
    (C.pages.structure || { blocks: [] }).blocks.forEach((b) => {
      if (b.t === 'h' && /блок|^Отделения|^Лаборатории/i.test(b.x)) { cur = { t: b.x.charAt(0) + b.x.slice(1).toLowerCase(), items: [] }; out.push(cur); }
      else if (b.t === 'li' && cur) cur.items.push(b.x);
    });
    return out;
  }
  const xClinicByName = (n) => { const f = fold(n).replace(/[„“”"]/g, ''); return clinicList().find((c) => fold(c.name).replace(/[„“”"]/g, '') === f); };
  const xAboutNav = (cur) => `<nav class="ab-nav" aria-label="Раздел „За нас“">${navItems(SECTIONS[0].items).map(([k, t]) => `<a href="#/${k}"${k === cur ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</nav>`;
  /** За нас · История · Ръководство · Структура: one bar, in the same place (under the site header) on all four pages */
  const xAboutBar = (cur) => `<div class="ab-bar"><div class="vwrap">${xAboutNav(cur)}</div></div>`;
  /** units of one type (X_UNIT_TYPE) present in the clinic data */
  const xUnits = (type) => clinicList().filter((c) => X_UNIT_TYPE[type].includes(c.id));

  /* За нас */
  function aboutXPage() {
    const firsts = xFirsts();
    // key numbers from the typed units; a number that comes out 0 is left out rather than shown wrong
    const NUMS = [['Основана', 1936], ['Клиники', xUnits('clinic').length], ['Отделения', xUnits('dept').length], ['Лаборатории', xUnits('lab').length]].filter(([, v]) => v);
    const MG = mgmtPeople(C.pages.management).filter((m) => m.name);
    const mgProf = (n) => { const q = window.ISUL_PEOPLE_API.parse(n, ' '); return q ? PP.list.find((d) => d.key === q.key) : null; };
    const ini = (n) => n.replace(/^(проф\.|доц\.|д-р)\s*/gi, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    const person = (m) => { const d = mgProf(m.name), ph = MG_PHOTO[fold(m.name)] || (d && d.img) || '';
      return `<li class="ab-pp"><span class="ab-pp__ph${ph ? '' : ' ab-pp__ph--none'}">${ph ? `<img src="${esc(ph)}" alt="" loading="lazy">` : `<i aria-hidden="true">${esc(ini(m.name))}</i>`}</span><span class="ab-pp__t"><b>${d ? `<a href="${drUrl(d)}">${esc(m.name)}</a>` : esc(m.name)}</b><small>${esc(m.role)}</small></span></li>`; };
    // structure overview: the groups and where to find them (the counts stay in the numbers band above)
    const lower = (n) => n.replace(/^(Клиника|Отделение|Лаборатория) по /, '').replace(/^Спешно отделение.*/, 'спешно отделение').replace(/^Клинична лаборатория$/, 'клинична лаборатория').replace(/^обща и /, '');
    const units = (type) => xUnits(type).map((c) => lower(c.name)).join(', ');
    const MC = C.clinics[27];
    const GROUPS = [
      ['Клиники', 'Стационарният блок — терапевтични, хирургични и диагностични клиники.', '#/structure?s=medical'],
      MC && ['Диагностично-консултативен блок', `${MC.name.replace('”', '“')} — извънболнична помощ и консултации.`, '#/clinic/27'],
      ['Отделения и лаборатории', `${xCap(units('dept'))}; ${units('lab')}.`, '#/structure?s=medical'],
      ['Администрация', 'Отделите и секторите на административно-стопанския блок — с телефони и имейли.', '#/structure?s=administration'],
      C.pages.other && ['Други структури на територията', 'Медицинският център, Факултетът по обществено здраве и катедри на Медицински университет – София.', '#/structure?s=other']
    ].filter(Boolean);
    const A = IC.arrow;
    /* „За нас“ in the order of the clinic pages („Подредба“): the building behind the title, the menu of the sections,
       the content on the left and a card with the address and the pages of „За нас“ on the right; light / dark.
       The earlier page stays at #/about?v=old to compare. */
    if (!/[?&]v=old/.test(location.hash)) {
      const firstsN = firsts.length;
      const GR = [
        ['Клиники', 'Стационарният блок — терапевтични, хирургични и диагностични клиники.', '#/structure?s=medical'],
        C.clinics[19] && ['Диагностично-консултативен блок', 'Приемно-консултативните кабинети на клиниките — II етаж над Спешно отделение.', '#/clinic/19'],
        ['Отделения и лаборатории', `${xCap(units('dept'))}; ${units('lab')}.`, '#/structure?s=medical'],
        ['Администрация', 'Отделите и секторите на административно-стопанския блок — с телефони и имейли.', '#/structure?s=administration'],
        C.pages.other && ['Други структури на територията', 'Медицинският център, Факултетът по обществено здраве и катедри на Медицински университет – София.', '#/structure?s=other']
      ].filter(Boolean);
      const av = (m) => { const d = mgProf(m.name), ph = MG_PHOTO[fold(m.name)] || (d && d.img) || '';
        return `<span class="kp-av">${ph ? `<img src="${esc(ph)}" alt="" loading="lazy">` : esc(ini(m.name))}</span>`; };
      const S = [];
      S.push(['what', 'Какво правим', `<p class="kp-k">УМБАЛ „Царица Йоанна – ИСУЛ“</p><h2>Какво правим</h2>
        <div class="kp-units">${[['Лечение', 'Хоспитализация по спешност и планово, амбулаторни консултации и терапия.', '#/clinics', 'Клиники и отделения'],
          ['Диагностика', 'Образна диагностика и лаборатории — от рентген и ЯМР до вирусология и микробиология.', '#/clinic/8', 'Образна диагностика'],
          ['Обучение', 'Университетска база с история в специализацията на лекари от 1950 г. насам.', '#/careers', 'Кариери и специализации'],
          ['Наука', 'Научна, експертна и консултативна дейност заедно с катедрите на Медицински университет – София.', '#/news', 'Новини и постижения']]
          .map(([t, p, href, l], i) => `<a class="kp-unit" href="${href}"><small>${String(i + 1).padStart(2, '0')}</small><b>${t}</b><p>${p}</p><em>${l} ${A}</em></a>`).join('')}</div>`]);
      S.push(['then', 'Сградата', `<h2>Тогава и сега</h2><p class="kp-note">Проектът е на арх. Георги Овчаров. През 1938 г. „Медицински вестник“ нарича болницата „едно голямо здравно постижение на нашата страна“.</p>
        <div class="kp-then">
          <figure><span class="kp-then__img kp-then__img--old"><img src="assets/photos/history/building-1938.jpg" alt="Сградата на Работническа болница „Царица Йоанна“ през 1938 г." loading="lazy"></span><figcaption><b>1938</b> Работническа болница „Царица Йоанна“ · „Медицински вестник“, бр. 1/1938 г.</figcaption></figure>
          <figure><span class="kp-then__img nwm"><img src="assets/photos/isul-entrance.jpg" alt="Входът на УМБАЛ „Царица Йоанна – ИСУЛ“ днес" loading="lazy"></span><figcaption><b>Днес</b> ул. „Бяло море“ № 8, София</figcaption></figure>
        </div>`]);
      S.push(['history', 'История', `<div class="kp-h"><h2>Кратка история</h2><a class="kp-lnk" href="#/history">Цялата история ${A}</a></div><p class="kp-note">1927 — 2026 · От закона за „болница на обществените осигуровки“ до университетска болница.</p>
        <ol class="kp-tl">${X_TIMELINE.filter((e) => e.key).map((e) => `<li><span class="kp-tl__y">${esc(e.y)}</span><div>${e.d ? `<small>${esc(e.d)}</small>` : ''}<b>${esc(e.t)}</b><p>${esc(e.p)}</p></div></li>`).join('')}</ol>
        ${firstsN ? `<a class="kp-first" href="#/history?s=firsts"><b>${firstsN}</b><span>клиники, катедри и процедури — за първи път в България, именно тук</span>${A}</a>` : ''}`]);
      S.push(['people', 'Ръководство', `<div class="kp-h"><h2>Хората, които водят болницата</h2><a class="kp-lnk" href="#/management">Цялото ръководство (${MG.length}) ${A}</a></div>
        <ul class="kp-team">${MG.map((m) => { const d = mgProf(m.name); const inner = `${av(m)}<span><b>${esc(m.name)}</b><small>${esc(m.role)}</small></span>`; return `<li>${d ? `<a href="${drUrl(d)}">${inner}</a>` : `<div class="kp-team__x">${inner}</div>`}</li>`; }).join('')}</ul>`]);
      S.push(['structure', 'Структура', `<div class="kp-h"><h2>Как е устроена болницата</h2><a class="kp-lnk" href="#/structure">Цялата структура ${A}</a></div>
        <div class="kp-units">${GR.map(([t, p, href], i) => `<a class="kp-unit" href="${href}"><small>${String(i + 1).padStart(2, '0')}</small><b>${esc(t)}</b><p>${esc(p)}</p><em>Към раздела ${A}</em></a>`).join('')}</div>`]);
      const secOf = (id) => SECTIONS.find((x) => x.id === id);
      const NOTI = (secOf('notices') || { items: [] }).items, PROF = (secOf('profile') || { items: [] }).items;
      if (NOTI.length || PROF.length) S.push(['notices', 'Обяви и поръчки', `<h2>Обяви и обществени поръчки</h2><p class="kp-note">Конкурси, търгове, покани, проекти и финансови отчети — и профилът на купувача по Закона за обществените поръчки.</p>
        ${NOTI.length ? `<h3 class="kp-sub-h">Обяви</h3><div class="kp-btns">${NOTI.map(([k, t]) => `<a href="#/${k}">${esc(t)} ${A}</a>`).join('')}</div>` : ''}
        ${PROF.length ? `<h3 class="kp-sub-h">Обществени поръчки</h3><div class="kp-btns">${[PROF[0], PROF.find(([k]) => k === 'profile/1')].filter(Boolean).map(([k, t]) => `<a href="#/${k}">${esc(t)} ${A}</a>`).join('')}</div>` : ''}`]);
      S.push(['careers', 'Кариери', `<h2>Работете в университетска болница</h2><p class="kp-note">Свободни позиции, конкурси и специализации.</p>
        <div class="kp-btns"><a href="#/careers">Кариери ${A}</a><a href="#/contacts">Контакти ${A}</a><a href="route.html">Как да стигнете ${A}</a></div>`]);
      const kpNav = `<nav class="kp-nav" aria-label="За нас — съдържание"><div class="vwrap kp-nav__w"><div class="kp-nav__in">${S.map(([k, t]) => `<a href="#kp-${k}" data-kj="kp-${k}">${esc(t)}</a>`).join('')}</div>${KP_THEME}</div></nav>`;
      const side = `<aside class="kp-side" aria-label="Контакти и раздели"><div class="kp-card">
        <p class="kp-k">Контакти</p>
        <a class="kp-tel" href="${telOf('02 9432 170')}"><small>Телефонна централа</small>${IC.phone}<b>02 9432 170</b></a>
        <a class="kp-tel" href="${telOf('02 9432 203')}"><small>Спешно отделение · регистратура</small>${IC.phone}<b>02 9432 203</b></a>
        <hr>
        <p class="kp-row">${IC.pin}<span>ул. „Бяло море“ № 8<br><small>София 1527</small></span></p>
        <p class="kp-row">${IC.mail}<a href="mailto:pr@isul.eu">pr@isul.eu</a></p>
        <a class="kp-go" href="route.html">Как да стигна ${A}</a>
        <hr>
        <p class="kp-k">В раздела</p>
        <ul class="kp-sub">${navItems(SECTIONS[0].items).map(([k, t]) => `<li><a href="#/${k}"${k === 'about' ? ' aria-current="page"' : ''}>${esc(t)}</a></li>`).join('')}</ul>
        ${NOTI.length ? `<p class="kp-k kp-k--s">Обяви</p><ul class="kp-sub">${NOTI.map(([k, t]) => `<li><a href="#/${k}">${esc(t)}</a></li>`).join('')}</ul>` : ''}
        ${PROF.length ? `<p class="kp-k kp-k--s">Обществени поръчки</p><ul class="kp-sub"><li><a href="#/profile">Профил на купувача</a></li><li><a href="#/profile/1">Обществени поръчки</a></li></ul>` : ''}
      </div></aside>`;
      const hero = `<header class="kp-hero"><img class="kp-hero__bg" src="assets/photos/isul-entrance.jpg" alt=""><div class="vwrap kp-hero__in">
        ${crumbs([['За нас']])}
        <p class="kp-k">За нас · УМБАЛ „Царица Йоанна – ИСУЛ“</p>
        <h1><span class="kp-ic kp-ic--crest"><img src="assets/brand/isul-crest-white.svg" alt="" width="1017" height="1737"></span><span>90 години, посветени на живота</span></h1>
        <p class="kp-meta">${NUMS.map(([t, v]) => `${t === 'Основана' ? 'Основана ' + v : v + ' ' + t.toLowerCase()}`).join(' <i>·</i> ')}</p>
        <p class="kp-lead">Университетска многопрофилна болница за активно лечение в София, основана през 1936 г. Тук се лекува, диагностицира, преподава и изследва — като клинична база на Медицински университет – София.</p>
        <div class="kp-cta"><a class="kp-b kp-b--w" href="#/clinics">Клиники и отделения ${A}</a><a class="kp-b" href="#/history">Нашата история</a></div>
      </div></header>`;
      return { title: 'За нас', desc: 'УМБАЛ „Царица Йоанна – ИСУЛ“ — университетска болница от 1936 г.: история, ръководство и структура.',
        html: `<div class="kx kp kp--about">${hero}${kpNav}<div class="vwrap kp-grid"><div class="kp-main">${S.map(([k, , h]) => `<section class="kp-sec" id="kp-${k}">${h}</section>`).join('')}</div>${side}</div></div>`,
        init: () => { clinicXInit('', [], {}); kpInit(); } };
    }
    const html = xAboutBar('about') + `<div class="ab">
      <header class="pg-hero pg-hero--x ab-hx" style="--bg:none"><img class="pg-hero__crown" src="assets/brand/isul-crown-white.svg" alt="" aria-hidden="true"><div class="vwrap ab-hx__in">
        <div class="ab-hx__t">
          ${crumbs([['За нас']])}
          <p class="ab-kick ab-kick--g">За нас · УМБАЛ „Царица Йоанна – ИСУЛ“</p>
          <h1>90 години, посветени на живота</h1>
          <p class="pg-lead">Университетска многопрофилна болница за активно лечение в София, основана през 1936 г. Тук се лекува, диагностицира, преподава и изследва — като клинична база на Медицински университет – София.</p>
          <div class="ab-hero__cta"><a class="ab-btn ab-btn--w" href="#/clinics">Клиники и отделения ${A}</a><a class="ab-btn ab-btn--ow" href="#/history">Нашата история</a></div>
        </div>
        <div class="ab-hx__cf">
          <div class="cf ab-cf" role="img" aria-label="Гербът на ИСУЛ се изпълва със злато: 90 години, 1936–2026">
            <img class="cf__ghost" src="assets/brand/isul-crest-white.svg" width="1017" height="1737" alt="">
            <span class="cf__fill"><svg class="cf__wave" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20 Q 50 0 100 20 T 200 20 T 300 20 T 400 20 V40 H0z"/></svg></span>
            <span class="cf__shine"></span>
          </div>
          <p class="ab-cf__year" aria-hidden="true">1936</p>
        </div>
      </div></header>

      <section class="ab-nums" aria-label="Основни числа"><div class="vwrap"><dl>
        ${NUMS.map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')}
      </dl></div></section>

      <section class="ab-what" aria-labelledby="ab-w-h"><div class="vwrap">
        <h2 class="ab-h" id="ab-w-h">Какво правим</h2>
        <div class="ab-what__grid">
          ${[['Лечение', 'Хоспитализация по спешност и планово, амбулаторни консултации и терапия.', '#/clinics', 'Клиники и отделения'],
             ['Диагностика', 'Образна диагностика и лаборатории — от рентген и ЯМР до вирусология и микробиология.', '#/clinic/8', 'Образна диагностика'],
             ['Обучение', 'Университетска база с история в специализацията на лекари от 1950 г. насам.', '#/careers', 'Кариери и специализации'],
             ['Наука', 'Научна, експертна и консултативна дейност заедно с катедрите на Медицински университет – София.', '#/news', 'Новини и постижения']]
            .map(([t, p, href, lnk]) => `<div class="ab-what__c"><h3>${t}</h3><p>${p}</p><a href="${href}">${lnk} ${A}</a></div>`).join('')}
        </div>
      </div></section>

      <section class="ab-then" aria-labelledby="ab-t-h"><div class="vwrap">
        <div class="ab-head"><div><p class="ab-kick">Сградата</p><h2 class="ab-h" id="ab-t-h">Тогава и сега</h2></div><p>Проектът е на арх. Георги Овчаров. През 1938 г. „Медицински вестник“ нарича болницата „едно голямо здравно постижение на нашата страна“.</p></div>
        <div class="ab-then__pair">
          <figure><span class="ab-then__img ab-then__img--old"><img src="assets/photos/history/building-1938.jpg" alt="Сградата на Работническа болница „Царица Йоанна“ през 1938 г." loading="lazy"></span><figcaption><b>1938</b> Работническа болница „Царица Йоанна“ · „Медицински вестник“, бр. 1/1938 г.</figcaption></figure>
          <figure><span class="ab-then__img nwm"><img src="assets/photos/isul-entrance.jpg" alt="Входът на УМБАЛ „Царица Йоанна – ИСУЛ“ днес" loading="lazy"></span><figcaption><b>Днес</b> ул. „Бяло море“ № 8, София</figcaption></figure>
        </div>
      </div></section>

      <section class="ab-tl" aria-labelledby="ab-tl-h"><div class="vwrap ab-tl__grid">
        <div class="ab-tl__side"><p class="ab-kick">1927 — 2026</p><h2 class="ab-h" id="ab-tl-h">Кратка история</h2>
          <p>От закона за „болница на обществените осигуровки“ до университетска болница.</p>
          <a class="ab-tl__first" href="#/history?s=firsts"><b>${firsts.length}</b><span>клиники, катедри и процедури — за първи път в България, именно тук</span></a>
          <a class="ab-btn ab-btn--w" href="#/history">Цялата история ${A}</a></div>
        ${xTimeline(X_TIMELINE.filter((e) => e.key), false)}
      </div></section>

      <section class="ab-mg" aria-labelledby="ab-m-h"><div class="vwrap">
        <div class="ab-head"><div><p class="ab-kick">Ръководство</p><h2 class="ab-h" id="ab-m-h">Хората, които водят болницата</h2></div><a class="ab-link" href="#/management">Цялото ръководство (${MG.length}) ${A}</a></div>
        <ul class="ab-pp__list">${MG.map(person).join('')}</ul>
      </div></section>

      <section class="ab-st" aria-labelledby="ab-s-h"><div class="vwrap">
        <div class="ab-head"><div><p class="ab-kick">Структура</p><h2 class="ab-h" id="ab-s-h">Как е устроена болницата</h2></div><a class="ab-link" href="#/structure">Цялата структура ${A}</a></div>
        <ul class="ab-st__g">${GROUPS.map(([t, p, href]) => `<li><a href="${href}"><b>${esc(t)}</b><span>${esc(p)}</span><em aria-hidden="true">${A}</em></a></li>`).join('')}</ul>
      </div></section>

      <section class="ab-cta"><div class="vwrap ab-cta__grid">
        <a class="ab-cta__c" href="#/careers"><small>Кариери</small><b>Работете в университетска болница</b><span>Свободни позиции и конкурси ${A}</span></a>
        <a class="ab-cta__c ab-cta__c--l" href="#/contacts"><small>Контакти</small><b>ул. „Бяло море“ № 8, София 1527</b><span>Централа 02 9432 170 · Как да стигнете ${A}</span></a>
      </div></section>
      </div>`;
    return { title: 'За нас', html, desc: 'УМБАЛ „Царица Йоанна – ИСУЛ“ — университетска болница от 1936 г.: история, ръководство и структура.', init: aboutCrestInit };
  }

  /** За нас: the crest fills with gold once (the year counts 1936 → 2026 with it), then keeps a slow shine */
  function aboutCrestInit() {
    const cf = $('.ab-cf', page), yr = $('.ab-cf__year', page); if (!cf || !yr) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { cf.classList.add('is-full'); yr.textContent = '2026'; return; }
    const DUR = 4200, ease = (p) => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    setTimeout(() => {
      cf.classList.add('is-on'); const t0 = performance.now();
      const tick = (now) => { const p = Math.min(1, (now - t0) / DUR); yr.textContent = String(Math.round(1936 + 90 * ease(p))); if (p < 1 && cf.isConnected) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, 500);
  }

  /* История: chronology, medical firsts, archive and the full migrated text */
  /* ---------- the pages of „За нас“, „Обяви“ and „Обществени поръчки“ in the order of the clinic pages („Подредба“), variant X:
     the building behind the title, the menu of the sections, the content on the left and a card with the contacts and every page
     of the section on the right; light / dark. The earlier page of each stays at #/<page>?v=old to compare. ---------- */
  const KP_OLD = () => /[?&]v=old/.test(location.hash);
  const kpFamily = (navKey) => { const s = sectionOf(navKey); return !!(window.ISUL_X && s && ['about', 'notices', 'profile', 'history-archive', 'patients'].includes(s.id)); };
  function kpSide(cur) {
    const items = (id) => (SECTIONS.find((x) => x.id === id) || { items: [] }).items;
    const grp = (t, list) => list.length ? `<p class="kp-k kp-k--s">${t}</p><ul class="kp-sub">${list.map(([k, tt]) => `<li><a href="#/${k}"${k === cur ? ' aria-current="page"' : ''}>${esc(tt)}</a></li>`).join('')}</ul>` : '';
    const cs = sectionOf(cur);
    if (cs && cs.id === 'patients') return `<aside class="kp-side" aria-label="Контакти и раздели"><div class="kp-card">
      <p class="kp-k">Контакти</p>
      <a class="kp-tel" href="${telOf('02 9432 170')}"><small>Телефонна централа</small>${IC.phone}<b>02 9432 170</b></a>
      <a class="kp-tel" href="${telOf('02 9432 203')}"><small>Спешно отделение · регистратура</small>${IC.phone}<b>02 9432 203</b></a>
      <hr>
      <p class="kp-row">${IC.pin}<span>ул. „Бяло море“ № 8<br><small>София 1527</small></span></p>
      <a class="kp-book" href="${BOOK}">Как да се прегледам</a>
      <a class="kp-go" href="route.html">Как да стигна ${IC.arrow}</a>
      <hr>
      ${grp('За пациента', navItems(items('patients')))}
    </div></aside>`;
    return `<aside class="kp-side" aria-label="Контакти и раздели"><div class="kp-card">
      <p class="kp-k">Контакти</p>
      <a class="kp-tel" href="${telOf('02 9432 170')}"><small>Телефонна централа</small>${IC.phone}<b>02 9432 170</b></a>
      <hr>
      <p class="kp-row">${IC.pin}<span>ул. „Бяло море“ № 8<br><small>София 1527</small></span></p>
      <p class="kp-row">${IC.mail}<a href="mailto:pr@isul.eu">pr@isul.eu</a></p>
      <hr>
      ${grp('За нас', navItems(items('about')))}${grp('Обяви', items('notices'))}${grp('Обществени поръчки', [['profile', 'Профил на купувача'], ['profile/1', 'Обществени поръчки']])}
    </div></aside>`;
  }
  // o: { title, crumbs, kick, lead, img, gray, meta: [], cta: html, S: [[id, menu label, html]], cur }
  function kpFrame(o) {
    const nav = o.tabs
      ? `<nav class="kp-nav kp-nav--pages" aria-label="${esc(o.tabsLabel || 'Страници в раздела')}"><div class="vwrap kp-nav__w"><div class="kp-nav__in">${o.tabs.map(([k, t]) => `<a href="#/${k}"${k === o.cur ? ' aria-current="page" class="is-on"' : ''}>${esc(t)}</a>`).join('')}</div>${KP_THEME}</div></nav>`
      : `<nav class="kp-nav" aria-label="${esc(o.title)} — съдържание"><div class="vwrap kp-nav__w"><div class="kp-nav__in">${o.S.filter(([, t]) => t).map(([k, t]) => `<a href="#kp-${k}" data-kj="kp-${k}">${esc(t)}</a>`).join('')}</div>${KP_THEME}</div></nav>`;
    const hero = `<header class="kp-hero"><img class="kp-hero__bg${o.gray ? ' is-gray' : ''}" src="${esc(o.img || 'assets/photos/isul-entrance.jpg')}" alt=""><div class="vwrap kp-hero__in">
      ${crumbs(o.crumbs)}${o.kick ? `<p class="kp-k">${esc(o.kick)}</p>` : ''}
      <h1><span class="kp-ic kp-ic--crest"><img src="assets/brand/isul-crest-white.svg" alt="" width="1017" height="1737"></span><span>${esc(o.title)}</span></h1>
      ${o.meta && o.meta.length ? `<p class="kp-meta">${o.meta.map(esc).join(' <i>·</i> ')}</p>` : ''}
      ${o.lead ? `<p class="kp-lead">${esc(o.lead)}</p>` : ''}${o.cta || ''}</div></header>`;
    // each section also answers to its plain id (#/structure?s=medical …)
    return `<div class="kx kp kp--about">${hero}${nav}<div class="vwrap kp-grid"><div class="kp-main">${o.S.map(([k, , h]) => `<section class="kp-sec" id="kp-${k}"><span class="kp-a" id="${k}"></span>${h}</section>`).join('')}</div>${kpSide(o.cur)}</div></div>`;
  }
  const kpInitAll = (extra) => () => { clinicXInit('', [], {}); kpInit(); const on = $('.kp-nav--pages a[aria-current]', page); if (on) { const box = on.parentElement; box.scrollLeft = on.offsetLeft - (box.clientWidth - on.offsetWidth) / 2; } if (extra) extra(); };
  const kpTabs = (navKey) => { const sec = sectionOf(navKey); if (!sec) return null; if (sec.id === 'notices' || sec.id === 'patients') return navItems(sec.items); if (sec.id === 'profile') return sec.items.map(([k, t]) => [k, k === 'profile' ? 'Профил на купувача' : t]); return null; };
  // announcements and procurement notices: date | type, title, notes, documents | link to the publication
  const kpNoticeList = (items, key) => `<ol class="kp-nt">${items.map((n) => { const t = n.t || n.type || 'Публикация', job = key === 'competition' && /обявява конкурс за длъжност|търси да назначи/i.test(t);
    return `<li><div class="kp-nt__d">${n.date ? `<time datetime="${n.date.split('.').reverse().join('-')}">${esc(n.date)}</time>` : '<span>Без дата</span>'}</div>
      <div class="kp-nt__b">${n.type || job ? `<small>${esc(n.type)}${job ? `${n.type ? ' · ' : ''}за длъжност` : ''}</small>` : ''}<b>${ndRoute(n.href) ? `<a href="${ndRoute(n.href)}">${esc(t)}</a>` : esc(t)}</b>${n.notes.length ? `<p>${n.notes.map(esc).join(' ')}</p>` : ''}${n.docs.length ? `<span class="kp-nt__docs">${n.docs.map((d) => `<a href="${esc(d.href)}"${linkAttrs(d.href)}>${esc(ext(d.href))} · ${esc(d.x.length > 50 ? d.x.slice(0, 48) + '…' : d.x)}</a>`).join('')}</span>` : ''}</div>
      ${n.href ? (ndRoute(n.href) ? `<a class="kp-nt__go" href="${ndRoute(n.href)}">Документи →</a>` : `<a class="kp-nt__go" href="${esc(n.href)}"${linkAttrs(n.href)}>Виж ↗</a>`) : '<span></span>'}</li>`; }).join('')}</ol>`;
  // Администрация: department → person → role, phone, e-mail (isul.eu „Администрация“)
  function xAdminDepts() {
    const depts = []; let d = null;
    ((C.pages.administration || { blocks: [] }).blocks).forEach((b, i) => {
      if (i === 0) return;
      if (b.t === 'h' && /^(Отдел|Сектор|Библиотека)/.test(b.x)) { d = { t: b.x, sub: [] }; depts.push(d); return; }
      if (!d) return;
      if (b.t === 'h') { d.sub.push({ who: b.x, txt: '' }); return; }
      const last = d.sub[d.sub.length - 1]; if (last && !last.txt) last.txt = b.x; else d.sub.push({ who: '', txt: b.x });
    });
    return depts;
  }
  const kpAdmin = (depts) => `<div class="kp-dep">${depts.map((x) => `<div class="kp-dep__c"><h3>${esc(x.t)}</h3>${x.sub.map((s) => { const tel = (s.txt.match(/тел\.\s*([\d ]{7,})/) || [])[1], mail = (s.txt.match(/[\w.-]+@isul\.eu/) || [])[0], role = s.txt.split(/\s*тел\./)[0].trim();
    return `<p>${s.who ? `<b>${esc(s.who)}</b>` : ''}${role ? `<small>${esc(role)}</small>` : ''}${tel ? `<a href="${telOf(tel.trim())}">${IC.phone}${esc(tel.trim())}</a>` : ''}${mail ? `<a href="mailto:${esc(mail)}">${IC.mail}${esc(mail)}</a>` : ''}</p>`; }).join('')}</div>`).join('')}</div>`;
  const kpLead = { management: 'Съвет на директорите и ръководство на УМБАЛ „Царица Йоанна – ИСУЛ“ ЕАД.', administration: 'Отделите и секторите на административно-стопанския блок — с телефони и имейли.',
    projects: 'Проектите на болницата с европейско и национално финансиране.', donation: 'Дарителската кампания на болницата и банковата сметка за дарения.', financial: 'Годишните и консолидираните финансови отчети на дружеството.',
    pdpac: 'Политика, уведомления и контакти на длъжностното лице по защита на данните.', privacy: 'Политика, уведомления и контакти на длъжностното лице по защита на данните.', signals: 'Условия и ред за вътрешно подаване на сигнали за нарушения.',
    other: 'Медицинският център, Факултетът по обществено здраве и катедри на Медицински университет – София на територията на болницата.',
    admission: 'Спешен и планов прием, платени консултации, прием на здравно неосигурени и ТЕЛК комисиите на територията на болницата.', insurance: 'Здравноосигурителните фондове, с които болницата има договор, и как се преглеждате по фонд.',
    trials: 'Клиничните изпитвания в УМБАЛ „Царица Йоанна – ИСУЛ“ — информация и контакти.', covid: 'Тестовете за COVID-19 в болницата — бърз антигенен тест, тест за антитела, PCR — и кой тест кога е подходящ.', profile: 'Профилът на купувача по Закона за обществените поръчки.' };
  /** a text page of the section (Ръководство, Администрация, Проекти, Финансови отчети, Профил на купувача …) */
  function contentKp(key, navKey) {
    const pg = C.pages[key], sec = sectionOf(navKey), title = labelOf(navKey), A = IC.arrow;
    HX.sec = sec; HX.cur = navKey;
    const top = sec && sec.id === 'patients' ? ['За пациента', '#/patient'] : sec && sec.id === 'about' ? ['За нас', '#/about'] : sec && sec.id === 'notices' ? ['Обяви', '#/' + sec.items[0][0]] : sec && sec.id === 'profile' ? ['Профил на купувача', '#/profile'] : ['За нас', '#/about'];
    const S = []; let meta = [];
    if (key === 'management') {
      const ppl = mgmtPeople(pg);
      const prof = (n) => { if (!PP) return null; const q = window.ISUL_PEOPLE_API.parse(n, ' '); return q ? PP.list.find((d) => d.key === q.key) : null; };
      const ini = (n) => n.replace(/^(проф\.|доц\.|д-р)\s*/gi, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
      S.push(['people', 'Ръководство', `<p class="kp-k">УМБАЛ „Царица Йоанна – ИСУЛ“ ЕАД</p><h2>Съвет на директорите и ръководство</h2>
        <ul class="kp-team kp-team--mg">${ppl.map((m) => { const d = prof(m.name), ph = (d && d.img) || mgPhoto(m.name);
          return `<li><div class="kp-team__x"><span class="kp-av kp-av--l">${ph ? `<img src="${esc(ph)}" alt="" loading="lazy">` : esc(ini(m.name))}</span><span><b>${d ? `<a href="${drUrl(d)}">${esc(m.name)}</a>` : esc(m.name)}</b><small>${esc(m.role)}</small>${m.mail ? `<a class="kp-mail" href="mailto:${esc(m.mail)}">${IC.mail}${esc(m.mail)}</a>` : ''}</span></div></li>`; }).join('')}</ul>
        <div class="kp-btns"><a href="#/structure">Структура ${A}</a><a href="#/administration">Администрация ${A}</a><a href="#/about">За нас ${A}</a></div>`]);
      meta = [`${ppl.length} души`];
    } else if (key === 'administration') {
      const depts = xAdminDepts();
      S.push(['adm', 'Отдели и сектори', `<p class="kp-k">Административно-стопански блок</p><h2>Отдели и сектори</h2>${kpAdmin(depts)}`]);
      meta = [`${depts.length} отдела и сектора`];
    } else if (key === 'admission' || key === 'insurance') {
      // these two old pages have broken-up headings: the same words of isul.eu, put in sections (only the section titles are ours;
      // the repeated paragraphs of the source appear once)
      const B = pg.blocks, find = (re) => B.find((b) => re.test((b.x || '').trim())) || null, tx = (b) => (b ? esc(b.x.trim()) : '');
      const docA = (b, label) => b && (b.links || [])[0] ? `<a href="${esc(b.links[0])}"${linkAttrs(b.links[0])}><span>${esc(ext(b.links[0]))}</span><b>${esc(label)}</b>${A}</a>` : '';
      if (key === 'admission') {
        const erH = find(/^В Спешно отделение се постъпва/), erW = find(/^При спешно състояние/), planH = find(/^При издадено направление от общопрактикуващ лекар за планов прием/),
          wait = find(/Листа на чакащите/), rules = find(/^Подробните правила за достъп до ДКБ/), plan = find(/^Плановата хоспитализацията/), control = find(/^Контролните прегледи/),
          where = find(/^ДКБ се намира/), prices = find(/^Цените за платени консултации/), nzok = find(/^Консултации чрез направление №3/), paidH = find(/^При желание за платена амбулаторна/),
          unins = find(/^Прием на здравно неосигурени/), telkH = find(/^ТЕЛК комисии на територията/);
        const telk = []; B.forEach((b, i) => { if (/^ТЕЛК комисия №/.test((b.x || '').trim())) telk.push([b, B[i + 1], B[i + 2]]); });
        S.push(['er', 'Спешен прием', `<p class="kp-k">Спешно отделение · денонощно</p><h2>Спешен прием</h2><div class="kp-prose"><p>${tx(erH)} ${tx(erW)}</p>${unins ? `<p><b>${tx(unins)}</b> — в Спешно отделение; цените са в Ценоразписа.</p>` : ''}</div>
          <div class="kp-btns"><a href="#/clinic/20">Спешно отделение ${A}</a><a href="${telOf('02 9432 203')}">Регистратура 02 9432 203 ${A}</a><a href="#/pricelist">Ценоразпис ${A}</a></div>`]);
        S.push(['plan', 'Планов прием', `<p class="kp-k">${tx(planH)}</p><h2>Планов прием</h2><div class="kp-prose"><p>${tx(plan)}</p></div>
          <div class="kp-docs">${docA(wait, 'Листа на чакащите прием пациенти')}${docA(rules, 'Правилник за условията и реда при извършване на прегледи, изследвания и хоспитализации')}</div>
          <div class="kp-btns"><a href="${BOOK}">Как да се прегледам ${A}</a><a href="#/clinic/19">Кабинетите в ДКБ ${A}</a></div>`]);
        if (control) S.push(['control', 'Контролни прегледи', `<h2>Контролни прегледи</h2><div class="kp-prose"><p>${tx(control)}</p></div>`]);
        S.push(['paid', 'Платена консултация', `<p class="kp-k">ДКБ · Медицински център</p><h2>${paidH ? esc(paidH.x.trim().replace(/^При желание за /, '').replace(/^./, (m) => m.toUpperCase())) : 'Платена амбулаторна консултация'}</h2>
          <div class="kp-prose">${where ? `<p>${tx(where)}</p>` : ''}${prices ? `<p>${tx(prices)}</p>` : ''}</div><div class="kp-btns"><a href="#/pricelist">Ценоразпис ${A}</a><a href="#/clinic/19">ДКБ ${A}</a></div>`]);
        if (nzok) S.push(['nzok', 'По НЗОК', `<p class="kp-k">Направление №3</p><h2>Консултации по НЗОК</h2><div class="kp-prose"><p>${tx(nzok)}</p></div><div class="kp-btns"><a href="#/clinic/27">Медицински център ${A}</a></div>`]);
        if (telk.length) S.push(['telk', 'ТЕЛК', `<h2>${telkH ? tx(telkH) : 'ТЕЛК комисии'}</h2><div class="kp-dep">${telk.map(([h, c, s2]) => `<div class="kp-dep__c"><h3>${tx(h)}</h3>${[c, s2].filter(Boolean).map((b) => `<p>${linkify(b.x.trim())}</p>`).join('')}</div>`).join('')}</div>`]);
        meta = ['Спешен и планов прием', 'ТЕЛК комисии'];
      } else {
        const t1 = find(/^Здравни фондове, с които/), t2 = find(/^Прегледите по фондове/);
        const funds = []; B.forEach((b, i) => { const n = B[i + 1]; if (b.t === 'h' && n && (n.links || []).length && /АД|ЕАД|"/.test(b.x)) funds.push([b.x.trim(), n.links[0], (n.x || '').trim()]); });
        S.push(['funds', 'Фондове', `<h2>${t1 ? tx(t1) : 'Здравни фондове'}</h2>${t2 ? `<div class="kp-prose"><p>${tx(t2)}</p></div>` : ''}
          <div class="kp-units">${funds.map(([n, l, h], i) => `<a class="kp-unit" href="${esc(l)}" target="_blank" rel="noopener"><small>${String(i + 1).padStart(2, '0')}</small><b>${esc(n)}</b><em>${esc(h.replace(/^https?:\/\//, ''))} ↗</em></a>`).join('')}</div>
          <div class="kp-btns"><a href="${BOOK}">Как да се прегледам ${A}</a><a href="#/pricelist">Ценоразпис ${A}</a></div>`]);
        meta = [`${funds.length} фонда с договор`];
      }
    } else if (key === 'financial') {
      const years = []; pg.blocks.forEach((b) => { if (b.t === 'h' && /^\d{4}$/.test((b.x || '').trim())) years.push({ y: b.x.trim(), docs: [] }); else if (years.length && (b.links || []).length) years[years.length - 1].docs.push([b.x, b.links[0]]); });
      S.push(['reports', 'Отчети', `<h2>Финансови отчети</h2>${years.map((y) => `<h3 class="kp-sub-h">${esc(y.y)}</h3><div class="kp-docs">${y.docs.map(([t, l]) => `<a href="${esc(l)}"${linkAttrs(l)}><span>${esc(ext(l))}</span><b>${esc(t)}</b>${A}</a>`).join('')}</div>`).join('')}`]);
      meta = [`${years.length} години`, years.length ? `${years[years.length - 1].y} — ${years[0].y}` : ''].filter(Boolean);
    } else if (key === 'profile') {
      const cats = (SECTIONS.find((x) => x.id === 'profile') || { items: [] }).items.slice(1);
      const SHORT = { 'profile/1': 'Обществени поръчки', 'profile/2': 'чл. 20, ал. 2', 'profile/3': 'Събиране на оферти', 'profile/4': 'Покана до определени лица', 'profile/5': 'Публични покани', 'profile/6': 'Предварителни обявления', 'profile/7': 'ЦОП', 'profile/8': 'Пазарни проучвания' };
      let total = 0;
      cats.forEach(([k, t], i) => { const pk = 'profile_' + k.split('/')[1], items = C.pages[pk] ? xNotices(C.pages[pk].blocks).filter((n) => n.date || n.href || n.docs.length) : []; total += items.length;
        S.push([`c${i + 1}`, SHORT[k] || t, `<div class="kp-h"><h2>${esc(t)}</h2><a class="kp-lnk" href="#/${k}">Целият раздел ${A}</a></div>
          ${items.length ? `<p class="kp-note">${items.length} ${items.length === 1 ? 'публикация' : 'публикации'}${items.length > 5 ? ' — последните 5' : ''}.</p>${kpNoticeList(items.slice(0, 5), pk)}` : '<p class="kp-note">Няма публикации в този раздел.</p>'}`]); });
      meta = [`${cats.length} раздела`, `${total} публикации`];
      S.unshift(['intro', '', '<p class="kp-note">Обществените поръчки на УМБАЛ „Царица Йоанна – ИСУЛ“ ЕАД по Закона за обществените поръчки, по видове процедури. Пълният текст и документите са в публикацията на isul.eu.</p>']);
    } else if (/^profile_/.test(key)) {
      const items = xNotices(pg.blocks).filter((n) => n.date || n.href || n.docs.length);
      S.push(['list', 'Поръчки', `<h2>${esc(title)}</h2><p class="kp-note">${items.length} публикации от профила на купувача на isul.eu. Пълният текст и документите са в публикацията.</p>${kpNoticeList(items, key)}
        <div class="kp-btns"><a href="#/profile">Всички раздели на профила ${A}</a></div>`]);
      meta = [`${items.length} публикации`, items[0] && items[0].date ? 'последна ' + items[0].date : ''].filter(Boolean);
    } else {
      // the migrated text, one section per heading; the old site's menu at the top of the history pages is left out
      const acc = { tels: new Set(), mails: new Set(), docs: [] };
      let secs = sectionize(pg.blocks || []);
      if (/^history_/.test(key)) secs = secs.filter((s) => !/^(История|Архив)$/i.test(s.title || '') || s.items.some((b) => b.t !== 'li'));
      const MORE = /\s*[-–]?\s*(повече\s+)?тук\s*>*\s*$/i;
      // a paragraph with several documents (e.g. DOCX and PDF) gets one line per document — richBody would drop the links
      const split = (b) => { const L = b.links || []; if (b.t !== 'p' || L.length < 2 || L.some((l) => /^(tel|mailto):/.test(l))) return [L.length ? { ...b, x: (b.x || '').replace(MORE, '') } : b];
        const x = (b.x || '').replace(MORE, ''); const same = (l) => L.filter((m) => ext(m) === ext(l)).length > 1;
        return [{ t: 'p', x }].concat(L.map((l, i) => ({ t: 'p', x: isDoc(l) ? `${x.length > 60 ? x.slice(0, 58) + '…' : x} (${ext(l)}${same(l) ? ', файл ' + (L.filter((m, j) => j <= i && ext(m) === ext(l)).length) : ''})` : l.replace(/^https?:\/\//, ''), links: [l] }))); };
      secs = secs.map((s) => ({ ...s, items: s.items.filter((b) => !(b.t === 'li' && !(b.links || []).length && fold(b.x || '') === fold(s.title || ''))).flatMap(split) })).filter((s) => s.items.length);
      // the old site's menu left at the top (one or two plain items) goes when there is real content after it
      if (secs.length > 1 && secs[0].items.length <= 2 && secs[0].items.every((b) => b.t === 'li' && !(b.links || []).length)) secs = secs.slice(1);
      secs.forEach((s, i) => { const t = s.title && !/^УМБАЛ/.test(s.title) ? s.title : i ? 'Още информация' : title;
        const t2 = t.replace(/covid/gi, 'COVID'), same = fold(t + (s.sub ? ' ' + s.sub : '')) === fold(title);
        S.push([`s${i}`, secs.length > 1 ? (t2.length > 34 ? t2.slice(0, 32) + '…' : t2) : '', `${same ? '' : `<h2>${esc(t2)}${s.sub ? ' ' + esc(s.sub) : ''}</h2>`}<div class="kp-rich">${richBody(s.items, acc)}</div>`]); });
      if (!S.length) S.push(['s0', '', `<h2>${esc(title)}</h2><p class="kp-note">Съдържанието предстои.</p>`]);
    }
    if (pg.src) S[S.length - 1][2] += `<p class="kp-note kp-src">Съдържанието е мигрирано от <a href="${esc(pg.src)}" target="_blank" rel="noopener">${esc(pg.src.replace(/^https?:\/\//, ''))}</a></p>`;
    return { title, desc: `${title} — УМБАЛ „Царица Йоанна – ИСУЛ“.`, html: kpFrame({ title, crumbs: [top, [title]].filter((x, i, a) => i === 0 ? x[0] !== title : true), kick: (sec ? sec.title : 'За нас') + ' · УМБАЛ „Царица Йоанна – ИСУЛ“', lead: kpLead[key] || '', meta, S, cur: navKey, tabs: key === 'profile' ? null : kpTabs(navKey), tabsLabel: sec && sec.title }), init: kpInitAll() };
  }
  /* ---------- one announcement / procurement notice with its documents (assets/content/notices-detail.js), in the „Подредба“ frame ---------- */
  const ND = window.ISUL_NOTICE_DETAIL || {}, ND_BY_ROUTE = {};
  Object.values(ND).forEach((x) => { ND_BY_ROUTE[x.r] = x; });
  // the documents: our own copies in assets/docs/ (downloaded from isul.eu); the isul.eu address only if a copy is missing
  const docUrl = (z) => (z.f ? z.f.split('/').map(encodeURIComponent).join('/') : z.h);
  const ndRoute = (href) => (ND[href] ? '#/' + ND[href].r : '');
  const fileSize = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');
  const NUM = /^(\d{5}-\d{4}-\d{4}|\d{7})\s*[-–]\s*/;
  function noticeDetailKp(route) {
    const x = ND_BY_ROUTE[route], A = IC.arrow;
    const listKey = /^profile_/.test(x.k) ? 'profile/' + x.k.split('_')[1] : x.k, sec = sectionOf(listKey), listT = labelOf(listKey);
    HX.sec = sec; HX.cur = listKey;
    const num = (x.t.match(NUM) || [])[1] || '', subj = num ? x.t.replace(NUM, '') : x.t;
    const title = num ? `Поръчка ${num}` : `${x.ty || listT}${x.d ? ' от ' + x.d : ''}`;
    const top = sec && sec.id === 'profile' ? ['Профил на купувача', '#/profile'] : ['Обяви', '#/' + ((SECTIONS.find((s) => s.id === 'notices') || { items: [['competition']] }).items[0][0])];
    const docRow = (z) => { const e = ext(z.h) === 'ФАЙЛ' || !/\.(pdf|docx?|xlsx?|zip|rar)/i.test(z.h) ? 'ФАЙЛ' : ext(z.h), when = z.d || (z.u ? 'публикуван ' + z.u : '');
      return `<li class="kp-docl__it${z.x ? ' is-miss' : ''}"><span class="kp-docl__e">${esc(e)}</span><div><b>${esc(z.l)}</b>${when || z.n ? `<small>${esc(when)}${when && z.n ? ' · ' : ''}${z.n ? fileSize(z.n) : ''}</small>` : ''}</div>${z.x ? '<em>Файлът липсва и на isul.eu</em>' : `<a class="kp-nt__go" href="${esc(docUrl(z))}" target="_blank" rel="noopener">Отвори ↗</a>`}</li>`; };
    const S = [];
    if (x.tx.length) S.push(['text', 'Обявата', `<p class="kp-k">${esc(x.ty || listT)}${x.d ? ' · ' + esc(x.d) : ''}</p><h2>${esc(subj)}</h2><div class="kp-prose">${x.tx.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`]);
    S.push(['docs', 'Документи', `${x.tx.length ? '' : `<p class="kp-k">${esc(x.ty || listT)}${x.d ? ' · ' + esc(x.d) : ''}</p>`}<h2>${x.tx.length ? 'Документи' : num ? 'Документи на поръчката' : esc(subj)}</h2>
      ${x.docs.length ? `<p class="kp-note">${x.docs.length} ${x.docs.length === 1 ? 'документ' : 'документа'} — в реда, в който са публикувани ${sec && sec.id === 'profile' ? 'в профила на купувача' : 'към обявата'}.</p><ul class="kp-docl">${x.docs.map(docRow).join('')}</ul>` : '<p class="kp-note">Към публикацията няма приложени документи.</p>'}
      <div class="kp-btns"><a href="#/${listKey}">Всички в „${esc(listT)}“ ${A}</a></div>`]);
    return { title, desc: `${title} — ${listT}, УМБАЛ „Царица Йоанна – ИСУЛ“.`,
      html: kpFrame({ title, crumbs: [top, [listT, '#/' + listKey], [title]], kick: `${listT} · УМБАЛ „Царица Йоанна – ИСУЛ“`, lead: num ? subj : (x.tx.length ? '' : ''), meta: [x.d ? 'публикувано ' + x.d : '', `${x.docs.length} ${x.docs.length === 1 ? 'документ' : 'документа'}`].filter(Boolean), S, cur: listKey, tabs: kpTabs(listKey), tabsLabel: sec && sec.title }),
      init: kpInitAll() };
  }
  function historyXPage() {
    const P = C.pages, H = (P.history || { blocks: [] }).blocks, firsts = xFirsts();
    const firstsAt = H.findIndex((b) => b.t === 'p' && /първите в страната/.test(b.x));
    // the article: paragraphs and portraits, without the archive menu and the lists shown as „Първите в страната“
    // the migrated text describes the management of its own time („От 2013 г. изпълнителен директор е …“): kept as written,
    // marked as archival, with a pointer to the current Ръководство (no end dates of mandates are invented)
    const dated = ' <span class="hi-note">(архивна информация към датата на текста — актуалното ръководство е на страница <a href="#/management">Ръководство</a>)</span>';
    const story = H.filter((b, i) => i > 5 && ((b.t === 'p' && i !== firstsAt && !/^В болницата за първи път/.test(b.x)) || b.t === 'img'))
      .map((b) => b.t === 'img' ? `<figure class="hi-fig"><img src="assets/photos/history/${b.src.split('/').pop()}" alt="" loading="lazy"></figure>` : `<p>${esc(b.x.replace(/^\./, ''))}${/изпълнителен директор е /i.test(b.x) ? dated : ''}</p>`);
    const ARCH = [
      { k: 'history_04', y: '1927', t: 'Указ на цар Борис III', d: 'Законът за построяване на болница на обществените осигуровки в София. Държавен вестник, бр. 3/1927 г.', img: 'assets/photos/history/Zakon_postroiavane.jpg' },
      { k: 'history_03', y: '1938', t: 'Медицински вестник', d: '„Работническата болница „Царица Йоанна“ — статия с първите данни за отделенията и леглата. Брой 1/1938 г.', img: 'assets/photos/history/vestnik_istoria2C.jpg' },
      { k: 'history_02', y: '1941', t: 'Пощенска марка', d: ((P.history_02 || { blocks: [] }).blocks.find((b) => b.t === 'p') || {}).x || '', img: 'assets/photos/history/Marka1.jpg', small: 1 }
    ];
    const book = P.history_01 ? P.history_01.blocks.filter((b) => b.t === 'h').slice(-2).map((b) => b.x).join(', ') : '';
    const A = IC.arrow;
    if (!KP_OLD()) {
      HX.cur = 'history';
      const sh = (H.find((b) => b.t === 'h' && /История на УМБАЛ/.test(b.x)) || { x: 'История' }).x;
      const S = [
        ['chronology', 'Хронология', `<p class="kp-k">1927 — 2026</p><h2>Хронология</h2><p class="kp-note">Девет десетилетия в дванадесет момента — по документите от архива на болницата.</p>
          <ol class="kp-tl">${X_TIMELINE.map((e) => `<li><span class="kp-tl__y">${esc(e.y)}</span><div>${e.d ? `<small>${esc(e.d)}</small>` : ''}<b>${esc(e.t)}</b><p>${esc(e.p)}</p></div></li>`).join('')}</ol>`],
        ['firsts', 'Първите в страната', `<h2>Първите в страната</h2><p class="kp-note">${firsts.length} клиники, катедри и процедури, които се появяват за първи път в България на територията на болницата и на ИСУЛ.</p>
          <ol class="kp-firsts">${firsts.map((x) => `<li><span>${esc(String(x.y))}</span><b>${esc(x.t)}</b>${x.who ? `<small>${esc(x.who)}</small>` : ''}</li>`).join('')}</ol>`],
        ['archive', 'Архив', `<h2>Документи и материали</h2><p class="kp-note">Оригиналните документи се отварят в пълен размер.</p>
          <div class="kp-arch">${ARCH.map((a) => `<figure><a class="kp-arch__img${a.small ? ' is-small' : ''}" href="${a.img}" target="_blank" rel="noopener" aria-label="${esc(a.t)} — отвори в пълен размер"><img src="${a.img}" alt="" loading="lazy"></a><figcaption><span>${a.y}</span><b>${esc(a.t)}</b><p>${esc(a.d)}</p></figcaption></figure>`).join('')}
            <a class="kp-arch__book" href="#/history_01"><span>2007</span><b>„История на хирургията в България“</b><p>${esc(book)}. Откъс за Работническата болница и ИСУЛ.</p><em>Прочетете откъса ${A}</em></a></div>`],
        ['story', 'Пълният разказ', `<p class="kp-k">Архивен текст</p><h2>${esc(sh)}</h2><p class="kp-note">Текстът е мигриран без промени от isul.eu и описва болницата към момента на написването си. Актуалното ръководство е на страница <a href="#/management">Ръководство</a>.</p>
          <div class="kp-prose kp-story is-short" id="hi-text">${story.join('')}</div><button type="button" class="kx-more hi-more" aria-expanded="false" aria-controls="hi-text">Прочетете целия текст ↓</button>
          <p class="kp-note kp-src">Източник: <a href="${esc(P.history.src || 'https://isul.eu/history.html')}" target="_blank" rel="noopener">isul.eu</a></p>`]];
      return { title: 'История', desc: 'Историята на УМБАЛ „Царица Йоанна – ИСУЛ“ от 1927 г. до днес: хронология, първите в страната и архив.',
        html: kpFrame({ title: 'История', crumbs: [['За нас', '#/about'], ['История']], kick: 'За нас · 1927 — 2026', lead: 'От закона за „болница на обществените осигуровки“ през 1927 г. до днешната университетска болница.', img: 'assets/photos/history/building-1938.jpg', gray: true,
          meta: [`${X_TIMELINE.length} момента`, `${firsts.length} първи в страната`, `${ARCH.length + 1} архивни материала`], S, cur: 'history' }),
        init: kpInitAll(() => { const t = $('#hi-text', page), b = $('.hi-more', page); if (b) b.addEventListener('click', () => { const on = !t.classList.toggle('is-short'); b.setAttribute('aria-expanded', String(on)); b.textContent = on ? 'Скрий ↑' : 'Прочетете целия текст ↓'; }); }) };
    }
    HX.cur = 'history';
    const html = hero('История', [['За нас', '#/about'], ['История']], 'От закона за „болница на обществените осигуровки“ през 1927 г. до днешната университетска болница.') +
      `<div class="ab hi">
      <nav class="hi-jump vwrap" aria-label="На тази страница"><a href="#/history?s=chronology">Хронология</a><a href="#/history?s=firsts">Първите в страната</a><a href="#/history?s=archive">Архив</a><a href="#/history?s=story">Пълният разказ</a></nav>
      <section class="ab-tl" id="chronology" aria-labelledby="hi-c-h"><div class="vwrap ab-tl__grid">
        <div class="ab-tl__side"><p class="ab-kick">1927 — 2026</p><h2 class="ab-h" id="hi-c-h">Хронология</h2><p>Девет десетилетия в дванадесет момента — по документите от архива на болницата.</p></div>
        ${xTimeline(X_TIMELINE, true)}
      </div></section>
      <section class="ab-firsts" id="firsts" aria-labelledby="hi-f-h"><div class="vwrap">
        <div class="ab-head"><div><p class="ab-kick">Медицински постижения</p><h2 class="ab-h" id="hi-f-h">Първите в страната</h2></div><p>${firsts.length} клиники, катедри и процедури, които се появяват за първи път в България на територията на болницата и на ИСУЛ.</p></div>
        <ol class="ab-firsts__grid">${firsts.map((f) => `<li><span>${f.y}</span><b>${esc(f.t)}</b>${f.who ? `<small>${esc(f.who)}</small>` : ''}</li>`).join('')}</ol>
      </div></section>
      <section class="hi-arch" id="archive" aria-labelledby="hi-a-h"><div class="vwrap">
        <div class="ab-head"><div><p class="ab-kick">Архив</p><h2 class="ab-h" id="hi-a-h">Документи и материали</h2></div><p>Оригиналните документи отварят в пълен размер.</p></div>
        <div class="hi-arch__grid">${ARCH.map((a) => `<figure class="hi-doc"><a class="hi-doc__img${a.small ? ' hi-doc__img--small' : ''}" href="${a.img}" target="_blank" rel="noopener" aria-label="${esc(a.t)} — отвори в пълен размер"><img src="${a.img}" alt="" loading="lazy"></a><figcaption><span>${a.y}</span><b>${esc(a.t)}</b><p>${esc(a.d)}</p></figcaption></figure>`).join('')}
          <a class="hi-doc hi-doc--book" href="#/history_01"><span>2007</span><b>„История на хирургията в България“</b><p>${esc(book)}. Откъс за Работническата болница и ИСУЛ.</p><em>Прочетете откъса ${A}</em></a></div>
      </div></section>
      <section class="hi-story" id="story" aria-labelledby="hi-s-h"><div class="vwrap hi-story__in">
        <p class="ab-kick">Пълният разказ · архивен текст</p><h2 class="ab-h" id="hi-s-h">${esc((H.find((b) => b.t === 'h' && /История на УМБАЛ/.test(b.x)) || { x: 'История' }).x)}</h2>
        <p class="hi-arch-note">Текстът е мигриран без промени от isul.eu и описва болницата към момента на написването си. Актуалният състав на ръководството е на страница <a href="#/management">Ръководство</a>.</p>
        <div class="hi-story__text" id="hi-text">${story.join('')}</div>
        <button type="button" class="ab-btn ab-btn--o hi-more" aria-expanded="false" aria-controls="hi-text">Прочетете целия текст</button>
        <p class="hi-src">Източник: <a href="${esc(P.history.src || 'https://isul.eu/history.html')}" target="_blank" rel="noopener">isul.eu</a></p>
      </div></section>
      </div>`;
    return { title: 'История', html, desc: 'Историята на УМБАЛ „Царица Йоанна – ИСУЛ“ от 1927 г. до днес: хронология, първите в страната и архив.', init: () => {
      const t = $('#hi-text', page), b = $('.hi-more', page); t.classList.add('is-short');
      b.addEventListener('click', () => { const on = !t.classList.toggle('is-short'); b.setAttribute('aria-expanded', String(on)); b.textContent = on ? 'Скрий' : 'Прочетете целия текст'; });
    } };
  }

  /* Структура: governance, the medical blocks, Администрация and Други структури (merged pages) */
  function structureXPage() {
    const P = C.pages, SB = (P.structure || { blocks: [] }).blocks, ST = xStructure();
    const intro = (SB.find((b) => b.t === 'p') || {}).x || '';
    const gov = SB.filter((b, i) => b.t === 'h' && i > 0 && !/блок|^Отделения|^Лаборатории/i.test(b.x) && SB.indexOf(b) < SB.findIndex((x) => x.t === 'h' && /блок/i.test(x.x))).map((b) => b.x.replace(/^ИЗПЪЛНИТЕЛЕН ДИРЕКТОР$/, 'Изпълнителен директор').replace('мединска', 'медицинска'));
    // Администрация: department → person → "Длъжност тел. … Имейл: …"
    const depts = []; let d = null;
    (P.administration || { blocks: [] }).blocks.forEach((b, i) => {
      if (i === 0) return;
      if (b.t === 'h' && /^(Отдел|Сектор|Библиотека)/.test(b.x)) { d = { t: b.x, sub: [] }; depts.push(d); return; }
      if (!d) return;
      if (b.t === 'h') { d.sub.push({ who: b.x, txt: '' }); return; }
      const last = d.sub[d.sub.length - 1]; if (last && !last.txt) last.txt = b.x; else d.sub.push({ who: '', txt: b.x });
    });
    const contact = (txt) => { const tel = (txt.match(/тел\.\s*([\d ]{7,})/) || [])[1], mail = (txt.match(/[\w.-]+@isul\.eu/) || [])[0], role = txt.split(/\s*тел\./)[0].trim();
      return { role, tel: tel ? tel.trim() : '', mail }; };
    // Други структури: name + external link
    const others = []; (P.other || { blocks: [] }).blocks.forEach((b, i, all) => { if (b.t === 'h' && i > 2) { const n = all[i + 1]; others.push({ t: b.x, href: n && n.links ? n.links[0] : '', host: n ? n.x.replace(/^Виж повече:\s*/, '') : '' }); } });
    const A = IC.arrow;
    if (!KP_OLD()) {
      HX.cur = 'structure';
      const S = [
        ['gov', 'Управление', `<p class="kp-k">УМБАЛ „Царица Йоанна – ИСУЛ“ ЕАД</p><h2>Управление</h2><div class="kp-prose"><p>${esc(intro)}</p></div>
          <ul class="kp-ticks">${gov.map((g) => `<li>${ICON.check}<span>${esc(g)}</span></li>`).join('')}</ul><div class="kp-btns"><a href="#/management">Ръководство ${A}</a></div>`],
        ['medical', 'Медицински структури', `<div class="kp-h"><h2>Клиники, отделения и лаборатории</h2><a class="kp-lnk" href="#/clinics">Клиники и отделения ${A}</a></div>
          ${ST.map((b) => `<h3 class="kp-sub-h"><b>${b.items.length}</b> ${esc(b.t)}</h3><ul class="kp-lk">${b.items.map((x) => { const c = xClinicByName(x); return `<li>${c ? `<a href="#/clinic/${c.id}">${CLINIC_ICON[c.id] ? clinicIcon(c.id) : ''}<span>${esc(x)}</span>${A}</a>` : `<span class="kp-lk__x">${esc(x)}</span>`}</li>`; }).join('')}</ul>`).join('')}`],
        ['administration', 'Администрация', `<p class="kp-k">Административно-стопански блок</p><h2>Администрация</h2>${kpAdmin(depts)}`],
        ['other', 'Други структури', `<p class="kp-k">На територията на ИСУЛ</p><h2>Други структури</h2>
          <div class="kp-units">${others.map((o, i) => o.href ? `<a class="kp-unit" href="${esc(o.href)}" target="_blank" rel="noopener"><small>${String(i + 1).padStart(2, '0')}</small><b>${esc(o.t)}</b><em>${esc(o.host)} ↗</em></a>` : `<div class="kp-unit"><small>${String(i + 1).padStart(2, '0')}</small><b>${esc(o.t)}</b></div>`).join('')}</div>
          <p class="kp-note kp-src">Източници: <a href="${esc(P.structure.src || 'https://isul.eu/structure.html')}" target="_blank" rel="noopener">структура</a>, <a href="${esc(P.administration.src)}" target="_blank" rel="noopener">администрация</a> и <a href="${esc(P.other.src)}" target="_blank" rel="noopener">други структури</a> на isul.eu</p>`]];
      const nU = ST.reduce((n, b) => n + b.items.length, 0);
      return { title: 'Структура', desc: 'Структура на УМБАЛ „Царица Йоанна – ИСУЛ“: клиники, отделения, лаборатории, администрация и други структури.',
        html: kpFrame({ title: 'Структура', crumbs: [['За нас', '#/about'], ['Структура']], kick: 'За нас · УМБАЛ „Царица Йоанна – ИСУЛ“', lead: 'Ръководство, медицински структури, администрация и други структури на територията на болницата.',
          meta: [`${nU} медицински структури`, `${depts.length} отдела и сектора`, `${others.length} други структури`], S, cur: 'structure' }), init: kpInitAll() };
    }
    HX.cur = 'structure';
    const html = hero('Структура', [['За нас', '#/about'], ['Структура']], 'Ръководство, медицински структури, администрация и други структури на територията на болницата.') +
      `<div class="ab st">
      <nav class="hi-jump vwrap" aria-label="На тази страница"><a href="#/structure?s=medical">Медицински структури</a><a href="#/structure?s=administration">Администрация</a><a href="#/structure?s=other">Други структури</a></nav>
      <section class="st-intro"><div class="vwrap st-intro__grid"><p class="ab-lead">${esc(intro)}</p>
        <div class="st-gov"><h2 class="ab-h ab-h--s">Управление</h2><ul>${gov.map((g) => `<li>${esc(g)}</li>`).join('')}</ul><a class="ab-link" href="#/management">Ръководство ${A}</a></div></div></section>
      <section class="st-med" id="medical" aria-labelledby="st-m-h"><div class="vwrap">
        <div class="ab-head"><div><p class="ab-kick">Медицински структури</p><h2 class="ab-h" id="st-m-h">Клиники, отделения и лаборатории</h2></div><a class="ab-link" href="#/clinics">Клиники и отделения ${A}</a></div>
        <div class="st-med__grid">${ST.map((b, i) => `<div class="st-b${i === 0 ? ' st-b--main' : ''}"><p class="st-b__n"><b>${b.items.length}</b>${esc(b.t)}</p><ul>${b.items.map((x) => { const c = xClinicByName(x); return `<li>${c ? `<a href="#/clinic/${c.id}">${esc(x)}</a>` : esc(x)}</li>`; }).join('')}</ul></div>`).join('')}</div>
      </div></section>
      <section class="st-adm" id="administration" aria-labelledby="st-a-h"><div class="vwrap">
        <div class="ab-head"><div><p class="ab-kick">Администрация</p><h2 class="ab-h" id="st-a-h">Административно-стопански блок</h2></div></div>
        <div class="st-adm__grid">${depts.map((x) => `<div class="st-dep"><h3>${esc(x.t)}</h3>${x.sub.map((s) => { const k = contact(s.txt); return `<p>${s.who ? `<b>${esc(s.who)}</b>` : ''}${k.role ? `<span>${esc(k.role)}</span>` : ''}${k.tel ? `<a href="${telOf(k.tel)}">${esc(k.tel)}</a>` : ''}${k.mail ? `<a href="mailto:${esc(k.mail)}">${esc(k.mail)}</a>` : ''}</p>`; }).join('')}</div>`).join('')}</div>
      </div></section>
      <section class="st-oth" id="other" aria-labelledby="st-o-h"><div class="vwrap">
        <div class="ab-head"><div><p class="ab-kick">На територията на ИСУЛ</p><h2 class="ab-h" id="st-o-h">Други структури</h2></div></div>
        <ul class="st-oth__grid">${others.map((o) => `<li>${o.href ? `<a href="${esc(o.href)}" target="_blank" rel="noopener"><b>${esc(o.t)}</b><span>${esc(o.host)} ↗</span></a>` : `<b>${esc(o.t)}</b>`}</li>`).join('')}</ul>
        <p class="hi-src">Източници: <a href="${esc(P.structure.src || 'https://isul.eu/structure.html')}" target="_blank" rel="noopener">структура</a>, <a href="${esc(P.administration.src)}" target="_blank" rel="noopener">администрация</a> и <a href="${esc(P.other.src)}" target="_blank" rel="noopener">други структури</a> на isul.eu</p>
      </div></section>
      </div>`;
    return { title: 'Структура', html, desc: 'Структура на УМБАЛ „Царица Йоанна – ИСУЛ“: клиники, отделения, лаборатории, администрация и други структури.' };
  }

  /* Конкурси · Търгове · Покани: the migrated announcements as a list of publications (no status — the source has no deadlines) */
  /** isul.eu announcement blocks → publications. Every date line opens one entry and everything up to the next entry belongs to it:
      type (the short line just before the date), title (first heading, else first text), the „Виж повече“ page, documents and
      any other paragraphs. Pagination (li) is skipped; nothing else is dropped — an entry without a title keeps its type. */
  function xNotices(list) {
    const txt = (b) => (b && b.x || '').trim();
    const isDate = (b) => b && b.t === 'p' && /^\d{2}\.\d{2}\.\d{4}$/.test(txt(b));
    const isType = (b) => b && b.t === 'p' && !(b.links || []).length && txt(b).length > 0 && txt(b).length <= 40 && !isDate(b);
    const L = list.filter((b) => b.t !== 'li' && (txt(b) || (b.links || []).length)), at = [];
    L.forEach((b, i) => { if (isDate(b)) at.push(i); });
    const out = at.map((i, n) => {
      const next = n + 1 < at.length ? at[n + 1] - (isType(L[at[n + 1] - 1]) ? 1 : 0) : L.length;
      const body = L.slice(i + 1, next), more = /^Виж повече/i;
      const head = body.find((b) => b.t === 'h') || body.find((b) => !more.test(txt(b)) && !(b.links || []).length);
      const links = body.flatMap((b) => (b.links || []).map((l) => ({ l, more: more.test(txt(b)), x: txt(b) })));
      const page = links.find((k) => k.more && !isDoc(k.l)) || links.find((k) => !isDoc(k.l) && /^https?:/.test(k.l));
      return { type: isType(L[i - 1]) ? txt(L[i - 1]) : '', date: txt(L[i]), t: head ? txt(head) : '', href: page ? page.l : '',
        docs: links.filter((k) => isDoc(k.l)).map((k) => ({ href: k.l, x: k.x || ext(k.l) })),
        notes: body.filter((b) => b !== head && !more.test(txt(b)) && !(b.links || []).length).map(txt) };
    });
    // headings before the first date (a publication without a date) are kept as entries too
    L.slice(0, at.length ? at[0] : L.length).filter((b) => b.t === 'h').forEach((b) => out.push({ type: '', date: '', t: txt(b), href: '', docs: [], notes: [] }));
    return out;
  }
  function noticesXPage(key) {
    const pg = C.pages[key], items = xNotices(pg.blocks);
    const JOB = /обявява конкурс за длъжност|търси да назначи/i;
    const title = labelOf(key), A = IC.arrow;
    HX.sec = sectionOf(key); HX.cur = key;
    if (!KP_OLD()) {
      const S = [['list', 'Публикации', `<h2>Последните ${items.length} публикации</h2>${key === 'competition' ? '<p class="kp-note">Конкурсите за длъжности са достъпни и от <a href="#/careers">Кариери</a>.</p>' : ''}${kpNoticeList(items, key)}
        <p class="kp-note kp-src">Архивът с всички публикации е в <a href="${esc(pg.src)}" target="_blank" rel="noopener">${esc(pg.src.replace(/^https?:\/\//, ''))}</a>.</p>`]];
      return { title, desc: `${title} — УМБАЛ „Царица Йоанна – ИСУЛ“.`,
        html: kpFrame({ title, crumbs: [['Обяви', '#/' + SECTIONS.find((x) => x.id === 'notices').items[0][0]], [title]], kick: 'Обяви · УМБАЛ „Царица Йоанна – ИСУЛ“', lead: 'Пълният текст и документите са в обявата на isul.eu.',
          meta: [`${items.length} публикации`, items[0] && items[0].date ? 'последна ' + items[0].date : ''].filter(Boolean), S, cur: key, tabs: kpTabs(key), tabsLabel: 'Обяви' }), init: kpInitAll() };
    }
    const html = hero(title, [['Обяви', '#/' + SECTIONS.find((s) => s.id === 'notices').items[0][0]], [title]], `Последните ${items.length} публикации от isul.eu. Пълният текст и документите са в обявата.`) +
      `<div class="ab nt"><div class="vwrap">
        ${key === 'competition' ? `<p class="nt-note">Конкурсите за длъжности са достъпни и от <a href="#/careers">Кариери</a>.</p>` : ''}
        <ol class="nt-list">${items.map((n) => { const t = n.t || n.type || 'Публикация';
          return `<li class="nt-it">${n.date ? `<time datetime="${n.date.split('.').reverse().join('-')}">${esc(n.date)}</time>` : '<span class="nt-nodate">Без дата</span>'}<div>${n.type || (key === 'competition' && JOB.test(t)) ? `<span class="nt-type">${esc(n.type)}${key === 'competition' && JOB.test(t) ? `${n.type ? ' · ' : ''}за длъжност` : ''}</span>` : ''}<h2>${n.href ? `<a href="${esc(n.href)}" target="_blank" rel="noopener">${esc(t)}</a>` : esc(t)}</h2>${n.notes.map((x) => `<p class="nt-p">${esc(x)}</p>`).join('')}${n.docs.length ? `<p class="nt-docs">${n.docs.map((d) => `<a href="${esc(d.href)}" target="_blank" rel="noopener"><span>${ext(d.href)}</span>${esc(d.x)}</a>`).join('')}</p>` : ''}</div>${n.href ? `<a class="nt-go" href="${esc(n.href)}" target="_blank" rel="noopener" aria-label="Виж обявата: ${esc(t.slice(0, 80))}">Виж обявата ↗</a>` : ''}</li>`; }).join('')}</ol>
        <p class="hi-src">Архивът с всички публикации е в <a href="${esc(pg.src)}" target="_blank" rel="noopener">${esc(pg.src.replace(/^https?:\/\//, ''))}</a>.</p>
      </div></div>`;
    return { title, html, desc: `${title} — УМБАЛ „Царица Йоанна – ИСУЛ“.` };
  }
  function aboutPage() {
    if (window.ISUL_X && PP) return aboutXPage();
    return { title: 'За нас', html: hero('За нас', [['За нас']], 'УМБАЛ „Царица Йоанна – ИСУЛ“ ЕАД — университетска многопрофилна болница за активно лечение от 1936 г.') +
      `<div class="vwrap hub">${SECTIONS.filter((s) => s.id !== 'history-archive').map((s) => `<section class="hub__col"><h2>${s.title}</h2>${s.items.map(([k, t]) => `<a href="#/${k}">${esc(t)}</a>`).join('')}</section>`).join('')}</div>` + videoBand() };
  }
  function eventsPage() {
    return { title: 'Събития', html: hero('Събития', [['Събития']], 'Предстоящи събития, конференции и кампании в ИСУЛ.') + `<div class="vwrap">${V2 ? '' : eventsMarquee()}<div class="ev-grid">${EVENTS.map(evCard).join('')}</div><p class="pg-src">Събитията, отбелязани „примерно“, са за демонстрация. Реалните идват от CMS.</p></div>` + videoBand() };
  }
  function videosPage() {
    return { title: 'Видео', html: hero('ИСУЛ във видео', [['Видео']], 'Кадри от клиниките, лабораториите и обучението.') + `<section class="vband vband--page"><div class="vwrap"><div class="vgrid">${VIDEOS.map(vCard).join('')}</div><p class="vband__note">Временни клипове (Mixkit). Ще бъдат заменени с видеа, заснети в ИСУЛ.</p></div></section>` };
  }
  function sitemapPage() {
    const col = (t, items) => `<section class="hub__col"><h2>${t}</h2>${items.map(([u, x]) => `<a href="${u}">${esc(x)}</a>`).join('')}</section>`;
    return { title: 'Карта на сайта', html: hero('Карта на сайта', [['Карта на сайта']], 'Всички страници и раздели, мигрирани от isul.eu.') +
      `<div class="vwrap hub">${SECTIONS.map((s) => col(s.title, s.items.map(([k, t]) => ['#/' + k, t]))).join('')}${col('Клиники и отделения', clinicList().map((c) => ['#/clinic/' + c.id, c.name]))}${col('Новини и медии', [['#/news', 'Новини'], ['#/events', 'Събития'], ['#/videos', 'Видео'], ['#/doctors', 'Лекари'], ['#/navigator', 'Анатомичен навигатор']].concat(C.news.map((n) => ['#/news/' + n.id, n.title])))}${col('Външни услуги', [[LAB, 'Лабораторни резултати (lab.isul.eu)'], ['https://mail.isul.eu/', 'Web Mail']])}</div>` };
  }
  const NAV_SLUG = (slug) => SLUG2ID[slug] ? '#/clinic/' + SLUG2ID[slug] : '#/clinics';
  const navOpts = (extra) => Object.assign({ wrap: 'vwrap', clinicHref: NAV_SLUG, unitHref: (u) => '#/clinic/' + u, bookHref: () => '#/book', docsHref: () => '#/doctors' }, extra);
  function navigatorPage(zone) {
    HX.sec = SECTIONS[2]; HX.cur = 'navigator';
    return { title: 'Анатомичен навигатор', html: hero('Анатомичен навигатор', [['За пациента', '#/patient'], ['Анатомичен навигатор']], 'Изберете орган или зона на тялото. Ще Ви покажем честите оплаквания, специалността и клиниките на ИСУЛ, които ги лекуват.') +
      '<section class="anav-sec anav-sec--page"><div class="vwrap"><div data-anav></div></div></section>',
      init: () => window.ISUL_NAVIGATOR && window.ISUL_NAVIGATOR.mount($('[data-anav]', page), navOpts({ zone, onSelect: (id) => { try { history.replaceState(null, '', '#/navigator/' + id); } catch (e) { /* sandbox */ } } })) };
  }
  const navTeaser = () => `<section class="anav-sec" aria-labelledby="anav-h"><div class="vwrap"><div class="anav-sec__head"><div><span class="kick">От тялото до правилната клиника</span><h2 id="anav-h">Анатомичен навигатор</h2><p>Изберете орган или зона на тялото и вижте честите оплаквания и клиниките на ИСУЛ, които ги лекуват.</p></div><a href="#/navigator">Отвори на цял екран →</a></div><div data-anav-home></div></div></section>`;
  /* Контакти: migrated content + a button to the route planner page (route.html) */
  /* Контакти (B, D): side navigation + cards, the route planner embedded, gallery as a grid */
  function loadRoute(cb) {
    if (window.ISUL_ROUTE && window.L) return cb();
    const add = (tag, attrs) => new Promise((r) => { const e = document.createElement(tag); Object.assign(e, attrs); e.onload = r; e.onerror = r; document.head.appendChild(e); });
    Promise.all([add('link', { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' }), add('link', { rel: 'stylesheet', href: 'assets/route.css?v=5' })])
      .then(() => window.L ? null : add('script', { src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js' }))
      .then(() => window.ISUL_ROUTE ? null : add('script', { src: 'assets/route.js?v=6' })).then(cb);
  }
  function contactsHub() {
    const pg = C.pages.contacts || { blocks: [] };
    const gal = pg.blocks.filter((b) => b.t === 'img' && /gallery/.test(b.src)).map((b) => b.src);
    const map = (pg.blocks.find((b) => b.t === 'img' && /map_01/.test(b.src)) || {}).src || 'assets/photos/map_01.jpg';
    const phone = (n, t, sub, mod = '') => `<a class="cx__c ${mod}" href="tel:${n}"><span class="cx__k">${t}</span><b>${n.replace('+359', '0').replace(/^0(\d)(\d{4})(\d{3})$/, '0$1 $2 $3')}</b>${sub ? `<small>${sub}</small>` : ''}</a>`;
    const mail = (m, t, sub) => `<a class="cx__c" href="mailto:${m}"><span class="cx__k">${t}</span><b>${m}</b>${sub ? `<small>${sub}</small>` : ''}</a>`;
    const cl = clinicList();
    const withMap = !!(window.ISUL_X && PL);
    const nav = [['cx-tel', 'Телефони'], ['cx-route', 'Как да стигна'], withMap && ['cx-map', 'Карта на болницата'], ['cx-clin', 'Телефони на клиниките'], ['cx-media', 'Пресцентър и сигнали'], ['cx-gal', 'Галерия']].filter(Boolean);
    HX.sec = sectionOf('contacts'); HX.cur = 'contacts';
    const html = hero('Контакти', [['Контакти']], 'УМБАЛ „Царица Йоанна – ИСУЛ“ ЕАД · ул. „Бяло море“ № 8, София 1527') +
      `<section class="cx"><div class="vwrap cx__grid">
        <aside class="cx__side">
          <nav class="jb__f cx__nav" aria-label="На тази страница">${nav.map(([id, t], i) => `<a href="#${id}" data-cx="${id}"${i ? '' : ' class="is-on"'}>${t}</a>`).join('')}</nav>
          <div class="cx__addr"><span class="cx__k">Адрес</span><b>ул. „Бяло море“ № 8</b><small>София 1527 · кв. Оборище</small><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('УМБАЛ Царица Йоанна ИСУЛ, ул. Бяло море 8, София')}" target="_blank" rel="noopener">Отвори в Google Maps ↗</a></div>
          <div class="cx__emg"><span class="cx__k">Спешно · 24/7</span><a href="tel:+35929432203">02 9432 203</a><small>При опасност за живота — 112</small></div>
        </aside>
        <div class="cx__main">
          <section class="cx__sec" id="cx-tel"><h2>Телефони</h2><div class="cx__cards">
            ${phone('+35929432170', 'Телефонна централа', 'Денонощно', 'cx__c--main')}
            
            ${phone('+35929432203', 'Регистратура', 'Спешно отделение')}
            ${phone('+35929432203', 'Спешно отделение', 'Денонощно · 24/7', 'cx__c--emg')}
          </div></section>
          <section class="cx__sec" id="cx-route"><h2>Как да стигна</h2><p class="cx__lead">Въведете откъде тръгвате и вижте пътя с кола, пеша или с градски транспорт.</p><div id="cx-rt" class="rt rt--embed cx__rt"><p class="cx__loading">Зареждане на картата…</p></div>
            <details class="cx__scheme"><summary>Схема за достъп с градски транспорт (isul.eu)</summary><button type="button" class="cx__g" data-gal="map"><img src="${esc(map)}" alt="Схема за достъп с градски транспорт" loading="lazy"></button></details></section>
          ${withMap ? `<section class="cx__sec cx__sec--map" id="cx-map"><h2>Карта на болницата</h2><p class="cx__lead">Къде е всяка клиника, Спешното, лабораторията, касата и паркингите — изберете или потърсете.</p>${whereBody(false)}</section>` : ''}
          <section class="cx__sec" id="cx-clin"><h2>Телефони на клиниките</h2>
            <div class="jb__find cx__find"><span>${ICON.search}</span><label class="vh" for="cxq">Търси клиника</label><input id="cxq" type="search" placeholder="Клиника или отделение…" autocomplete="off"></div>
            <div class="cx__list" id="cxl">${cl.map((c) => `<a class="cx__row" href="#/clinic/${c.id}" data-q="${esc(fold(c.name))}"><b>${esc(c.name)}</b><span>${c.id == 27 ? '' : esc((c.phones[0] || '').split(/[;,]| и /)[0])}</span><small>${esc(c.emails[0] || '')}${c.floor ? ' · ' + esc(c.floor) : ''}</small></a>`).join('')}</div></section>
          <section class="cx__sec" id="cx-media"><h2>Пресцентър и сигнали</h2><div class="cx__cards">
            ${mail('pr@isul.eu', 'Пресцентър', 'Ръководител: Моника Николова')}
            ${mail('director@isul.eu', 'Подаване на сигнали', 'До изпълнителния директор')}
            <a class="cx__c" href="#/signals"><span class="cx__k">Сигнали за нарушения</span><b>Форма и правила →</b><small>Защитено подаване</small></a>
          </div></section>
          ${gal.length ? `<section class="cx__sec" id="cx-gal"><h2>Галерия</h2><div class="cx__gal">${gal.map((g, i) => `<button type="button" class="cx__g nwm" data-gal="${i}"><img src="${esc(g)}" alt="ИСУЛ — снимка ${i + 1}" loading="lazy"></button>`).join('')}</div></section>` : ''}
        </div>
      </div></section>
      <div class="na-lb cx-lb" hidden role="dialog" aria-modal="true" aria-label="Галерия"><button type="button" class="na-lb__x" aria-label="Затвори">×</button><button type="button" class="na-lb__p" aria-label="Предишна">‹</button><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="na-lb__n" aria-label="Следваща">›</button></div>`;
    return { title: 'Контакти', html, desc: 'Телефони, адрес, маршрут и контакти на УМБАЛ „Царица Йоанна – ИСУЛ“.', init: () => {
      if (withMap) {
        whereInit('', false);
        // the map opens in the turning 3D view the first time it comes into sight (the plan stays one click away)
        const m3 = $('#cx-map [data-mode="3d"]'), sec = $('#cx-map');
        if (m3 && sec && 'IntersectionObserver' in window) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); if (document.body.contains(m3)) m3.click(); } }, { threshold: 0.35 }).observe(sec);
      }
      loadRoute(() => { const r = $('#cx-rt'); if (r && window.ISUL_ROUTE) { r.innerHTML = ''; window.ISUL_ROUTE.mount(r, { heading: 'h3' }); setTimeout(() => window.dispatchEvent(new Event('resize')), 300); } });
      $('#cxq').addEventListener('input', (e) => { const q = fold(e.target.value.trim()); $$('#cxl .cx__row').forEach((a) => { a.hidden = q && !a.dataset.q.includes(q); }); });
      const jump = (id) => { const t = document.getElementById(id); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 150, behavior: 'smooth' }); };
      $$('.cx__nav a').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); jump(a.dataset.cx); }));
      const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) $$('.cx__nav a').forEach((a) => a.classList.toggle('is-on', a.dataset.cx === x.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
      $$('.cx__sec').forEach((x) => io.observe(x));
      const pics = gal.concat([map]), lb = $('.cx-lb'), im = $('img', lb), cap = $('figcaption', lb); let k = 0;
      const show = (j) => { k = (j + pics.length) % pics.length; im.src = pics[k]; cap.textContent = `${k + 1} / ${pics.length}`; };
      const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
      $$('[data-gal]').forEach((b) => b.addEventListener('click', () => { show(b.dataset.gal === 'map' ? pics.length - 1 : +b.dataset.gal); lb.hidden = false; document.body.style.overflow = 'hidden'; }));
      $('.na-lb__x', lb).addEventListener('click', close); $('.na-lb__p', lb).addEventListener('click', () => show(k - 1)); $('.na-lb__n', lb).addEventListener('click', () => show(k + 1));
      lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
      addEventListener('keydown', (e) => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(k - 1); if (e.key === 'ArrowRight') show(k + 1); });
    } };
  }
  function contactsPage() {
    if (NEW) return contactsHub();
    const pg = C.pages.contacts || { blocks: [] };
    HX.sec = sectionOf('contacts'); HX.cur = 'contacts';
    const tel = (n, t) => `<a class="ct-card" href="tel:${n}"><span>${t}</span><b>${n.replace('+359', '0').replace(/^0(\d)(\d{4})(\d{3})$/, '0$1 $2 $3')}</b></a>`;
    return { title: 'Контакти', html: hero('Контакти', [['Контакти']], 'УМБАЛ „Царица Йоанна – ИСУЛ“ ЕАД · ул. „Бяло море“ № 8, София 1527') +
      `<div class="vwrap ct-top">${tel('+35929432170', 'Телефонна централа')}<a class="ct-card is-emg" href="tel:+35929432203"><span>Спешно отделение · регистратура</span><b>02 9432 203</b></a><a class="ct-card" href="mailto:pr@isul.eu"><span>Пресцентър</span><b>pr@isul.eu</b></a></div>
      <div class="vwrap"><a class="ct-route-cta" href="route.html"><span class="ct-route-cta__ico" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 44s-13-11.6-13-21a13 13 0 0 1 26 0c0 9.4-13 21-13 21z"/><circle cx="24" cy="22" r="4.5"/></svg></span><span><b>Как да стигнете до ИСУЛ</b><small>Въведете откъде тръгвате и вижте пътя си с кола, пеша или с градски транспорт</small></span><span class="ct-route-cta__btn">Покажи моя път →</span></a></div>` +
      (NEW ? bands(pg.blocks, source(pg.src), 1) : layout(sectionOf('contacts'), 'contacts', blocks(pg.blocks) + source(pg.src))) + videoBand() };
  }
  function notFound() { return { title: 'Няма такава страница', html: hero('Страницата не е намерена', [['404']], 'Адресът може да е променен. Вижте <a href="#/sitemap">картата на сайта</a>.') }; }

  /* ---------- Router ---------- */
  /** '#/a/b?x=1' → path parts and URLSearchParams. The path is split before decoding, every part is decoded on its own and a
      malformed escape (e.g. '%') is kept as typed instead of throwing; URLSearchParams decodes the query ('+', '%26' …) safely. */
  const safeDecode = (s) => { try { return decodeURIComponent(s); } catch (e) { return s; } };
  function hashRoute(h) {
    const raw = h.replace(/^#\/?/, ''), i = raw.indexOf('?');
    return { parts: (i < 0 ? raw : raw.slice(0, i)).split('/').filter(Boolean).map(safeDecode), q: new URLSearchParams(i < 0 ? '' : raw.slice(i + 1)) };
  }
  const home = $('#home'), page = $('#page');
  function route() {
    const h = location.hash;
    if (!h.startsWith('#/') || h === '#/' ) {
      if (home) home.hidden = false; if (page) { page.hidden = true; page.innerHTML = ''; }
      setMeta(null); document.body.classList.remove('is-inner');
      document.title = document.body.dataset.title || document.title;
      return;
    }
    const { parts, q: query } = hashRoute(h);
    CUR = parts[0] === 'profile' && parts[1] ? 'profile/' + parts[1] : parts[0] === 'news' && parts[1] ? 'news' : parts[0] === 'lekar' ? 'doctors' : parts[0];
    const [a, b, c2] = parts;
    if (X_MERGED[a]) { location.replace('#/' + X_MERGED[a]); return; }
    let r;
    // a page that fails to build shows „Страницата не е намерена“ instead of a blank or half-updated page
    try {
      if (a === 'clinics') r = clinicsPage();
      else if (a === 'clinic' && c2 === 'unit') r = unitPage(b, parts[3]);
      else if (a === 'clinic') r = clinicPage(b, c2 || '');
      else if (a === 'lekar' && b) r = doctorPage(b);
      else if (a === 'news' && b) r = newsDetail(b);
      else if (a === 'news') r = newsPage();
      else if (a === 'doctors') r = doctorsPage();
      else if (a === 'pricelist' && window.ISUL_PRICES) r = pricePage();
      else if (a === 'careers' && window.ISUL_JOBS) r = careersPage();
      else if (a === 'book') r = bookPage();
      else if (a === 'about') r = aboutPage();
      else if (a === 'events') r = eventsPage();
      else if (a === 'videos') r = videosPage();
      else if (a === 'sitemap') r = sitemapPage();
      else if (a === 'navigator') r = navigatorPage(b);
      else if (a === 'kade' && window.ISUL_X) r = wherePage(b);
      else if (a === 'contacts') r = contactsPage();
      else if (a === 'search') r = searchPage((query.get('q') || '').trim());
      else if (window.ISUL_X && ND_BY_ROUTE[parts.join('/')]) r = noticeDetailKp(parts.join('/'));
      else if (a === 'profile' && b) r = contentPage('profile_' + b, 'profile/' + b);
      else if (a === 'patient' && window.ISUL_X) r = patientHub();
      else if (a === 'history' && window.ISUL_X && PP) r = historyXPage();
      else if (a === 'structure' && window.ISUL_X) r = structureXPage();
      else if (/^(competition|auction|invitations)$/.test(a) && window.ISUL_X) r = noticesXPage(a);
      else r = contentPage(a);
    } catch (e) { console.error(e); r = notFound(); }
    if (home) home.hidden = true;
    page.hidden = false; page.innerHTML = r.html + (V2 && CUR !== 'news' ? helpBand() : '');
    document.title = r.title + ' · УМБАЛ „Царица Йоанна – ИСУЛ“';
    try { if (r.init) r.init(); else if (V2) richInit(); } catch (e) { console.error(e); }
    document.body.dataset.route = CUR;
    setMeta(r); document.body.classList.add('is-inner');
    rewrite(page); mount(page);
    window.scrollTo(0, 0);
    const h1 = $('h1', page); if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
    // ?s=<id>: open the page at that section (merged pages, „Първите в страната“ …)
    const s0 = query.get('s'), sec0 = s0 && /^[\w-]+$/.test(s0) && document.getElementById(s0);
    if (sec0) requestAnimationFrame(() => window.scrollTo(0, sec0.getBoundingClientRect().top + scrollY - 140));
    page.classList.remove('pg-in'); void page.offsetWidth; page.classList.add('pg-in');
  }

  /* links from the home sections (built for the old prototype) → internal routes */
  function mapLink(href) {
    const m = href.match(/^index\.html#\/(.*)$/); if (!m) return null;
    const [p, q] = m[1].split('?'), seg = p.split('/');
    if (seg[0] === 'clinics' && seg[1]) return SLUG2ID[seg[1]] ? '#/clinic/' + SLUG2ID[seg[1]] : '#/clinics';
    const map = { '': '#/', patients: '#/patient', clinics: '#/clinics', doctors: '#/doctors', book: '#/book', emergency: '#/clinic/20', where: '#/contacts', news: '#/news', isul90: '#/history', about: '#/about', science: '#/trials', contacts: '#/contacts', careers: '#/competition', results: LAB, specialties: '#/clinics', concept: '#/sitemap', medicine: '#/clinics' };
    return map[seg[0]] !== undefined ? map[seg[0]] : '#/' + seg[0];
  }
  function rewrite(root) { $$('a[href^="index.html#/"]', root).forEach((a) => { const n = mapLink(a.getAttribute('href')); if (n) { a.setAttribute('href', n); if (/^https?:/.test(n)) { a.target = '_blank'; a.rel = 'noopener'; } } });
    // variant X: migrated links to the SuperDoc home page („през СУПЕРДОК (www.superdoc.bg)“) open the centre's verified profile
    if (window.ISUL_X) $$('a[href*="superdoc.bg"]', root).forEach((a) => { if (/^https?:\/\/(www\.)?superdoc\.bg\/?$/.test(a.getAttribute('href'))) a.setAttribute('href', SUPERDOC); });
    // documents of isul.eu → our copies in assets/docs/ (assets/content/doc-map.js)
    const DM = window.ISUL_DOC_MAP || {}, look = (h) => { if (h in DM) return DM[h]; try { const d = decodeURI(h), e = encodeURI(h); return d in DM ? DM[d] : e in DM ? DM[e] : undefined; } catch (e) { return undefined; } };
    const unwrap = (el) => el.replaceWith(...el.childNodes);
    // files: our copy; a file missing on isul.eu too → its link becomes text, its photo is hidden
    $$('a[href*="isul.eu/"]', root).forEach((el) => { const l = look(el.getAttribute('href')); if (l) el.setAttribute('href', l.split('/').map(encodeURIComponent).join('/')); else if (l === null) unwrap(el); });
    $$('img[src*="isul.eu/"]', root).forEach((el) => { const l = look(el.getAttribute('src')); if (l) el.setAttribute('src', l.split('/').map(encodeURIComponent).join('/')); else if (l === null) { const box = el.closest('.kx-gal__it, figure, .rl-img, li') || el; box.hidden = true; } });
    // pages of the old site → the same page here (by the address each page was migrated from); a note about the source stays as text
    $$('a[href*="isul.eu"]', root).forEach((el) => { const h = el.getAttribute('href'); if (/^https?:\/\/(www\.)?isul\.eu\/(upload|photos|images|files|Fin_reports)\//.test(h)) return;
      const r = oldPageRoute(h); if (r) { el.setAttribute('href', r); el.removeAttribute('target'); el.removeAttribute('rel'); } else if (el.closest('.kp-src, .pg-src, .hi-src, .kp-note, .src')) unwrap(el); });
    // a link to a news item that is not on this site (older than the migrated ones) becomes text
    $$('a[href^="#/news/"]', root).forEach((el) => { const id = (el.getAttribute('href').split('/')[2] || '').split('?')[0]; if (id && !(C.news || []).some((n) => String(n.id) === id)) unwrap(el); });
  }
  /** an address of the old isul.eu → the route of the same page here, or '' */
  let OLD_ROUTES = null;
  function oldPageRoute(href) {
    const key = (u) => { try { const x = new URL(u, 'https://isul.eu/'); return (x.pathname.replace(/^\//, '') + x.search).toLowerCase(); } catch (e) { return ''; } };
    if (!OLD_ROUTES) {
      OLD_ROUTES = {};
      Object.entries(C.pages || {}).forEach(([k, pg]) => { if (pg && pg.src) OLD_ROUTES[key(pg.src)] = '#/' + (/^profile_\d+$/.test(k) ? 'profile/' + k.split('_')[1] : k); });
      Object.entries(window.ISUL_NOTICE_DETAIL || {}).forEach(([u, x]) => { OLD_ROUTES[key(u)] = '#/' + x.r; });
      (C.news || []).forEach((n) => { if (n.src) OLD_ROUTES[key(n.src)] = '#/news/' + n.id; });
    }
    const k = key(href); if (OLD_ROUTES[k]) return OLD_ROUTES[k];
    const m = k.match(/^clinics[a-z]?d?\.html\?id=(\d+)/) || k.match(/^clinics[a-z]*\.html\?id=(\d+)/); if (m && C.clinics[m[1]]) return '#/clinic/' + m[1];
    const pb = k.match(/^profilel\.html\?bid=(\d+)/); if (pb) return '#/profile/' + pb[1];
    const nw = k.match(/^newsd?\.html\?id=(\d+)/); if (nw && (C.news || []).some((n) => String(n.id) === nw[1])) return '#/news/' + nw[1];
    const base = k.split('?')[0]; const page = Object.entries(OLD_ROUTES).find(([kk]) => kk.split('?')[0] === base && !kk.includes('?'));
    return page ? page[1] : '';
  }

  /* ---------- Shared components: events marquee, video cards + modal ---------- */
  function mount(root) {
    $$('[data-mount="events"]', root).forEach((el) => { el.innerHTML = eventsMarquee(); });
    $$('[data-mount="videos"]', root).forEach((el) => { el.outerHTML = videoBand(el.dataset.title); });
    $$('[data-mount="navigator"]', root).forEach((el) => {
      el.outerHTML = navTeaser();
      const host = $('[data-anav-home]', root);
      if (host && window.ISUL_NAVIGATOR) { host.classList.add('anav--compact'); window.ISUL_NAVIGATOR.mount(host, navOpts({ compact: true })); }
    });
  }
  const modal = document.createElement('div');
  modal.className = 'vmodal'; modal.hidden = true; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Видео');
  modal.innerHTML = '<div class="vmodal__box"><button type="button" class="vmodal__x" aria-label="Затвори видеото">×</button><video controls playsinline></video><p class="vmodal__t"></p></div>';
  document.body.appendChild(modal);
  let lastFocus = null;
  const closeModal = () => { const v = $('video', modal); v.pause(); modal.hidden = true; if (lastFocus) lastFocus.focus(); };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.vcard');
    if (b) { const v = VIDEOS[+b.dataset.v]; lastFocus = b; const el = $('video', modal); el.src = v.src; el.poster = v.poster; $('.vmodal__t', modal).textContent = v.t + ' — ' + v.p; modal.hidden = false; $('.vmodal__x', modal).focus(); el.play().catch(() => {}); return; }
    if (e.target === modal || e.target.closest('.vmodal__x')) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  // links created later (search results, symptom routing) are mapped on click
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="index.html#/"]'); if (!a) return;
    const n = mapLink(a.getAttribute('href')); if (!n) return;
    e.preventDefault();
    if (/^https?:/.test(n)) window.open(n, '_blank', 'noopener'); else location.hash = n.slice(1);
  });
  rewrite(document); mount(document);
  /* ---------- Site search (all migrated content) ---------- */
  const fold = (x) => String(x || '').toLowerCase().replace(/ё/g, 'е').replace(/[„“”"'«»]/g, '');
  const SECTION_LABEL = (k) => { const sc = sectionOf(k); return sc ? sc.title : 'Страница'; };
  let IDX = null;
  function buildIndex() {
    const items = [], txt = (bl) => bl.map((b) => b.x || (b.cells || []).map((c) => c.x).join(' ') || '').join(' ');
    const push = (o) => { o.ft = fold(o.t); o.fx = fold(o.x || ''); items.push(o); };
    clinicList().forEach((c) => {
      push({ g: 'Клиники', t: c.name, x: txt(c.blocks) + ' ' + txt(c.patient) + ' ' + c.phones.join(' ') + ' ' + c.emails.join(' '), u: '#/clinic/' + c.id, m: (c.phones[0] || '') + (c.floor ? ' · ' + c.floor : '') });
      if (!PP) { c.leaders.forEach((l) => push({ g: 'Лекари', t: l.name, x: l.role, u: '#/clinic/' + c.id + '/team', m: (l.role ? l.role + ' · ' : '') + c.name, img: l.img && !/team\.jpg/.test(l.img) ? l.img : '' }));
      c.members.forEach((mm) => { const nm = mm.x.split(/,|–| - /)[0].trim(); if (nm.length < 70) push({ g: 'Лекари', t: nm, x: mm.x, u: '#/clinic/' + c.id + '/team', m: c.name }); }); }
      c.phones.forEach((ph) => push({ g: 'Телефони', t: ph, x: c.name, u: 'tel:+359' + ph.replace(/\D/g, '').replace(/^0/, '').slice(0, 9), m: c.name }));
    });
    if (PP) {
      PP.list.forEach((d) => push({ g: 'Лекари', t: d.name, x: d.role + ' ' + d.clinics.map((i) => C.clinics[i].name).join(' '), u: drUrl(d), m: (d.role ? d.role + ' · ' : '') + C.clinics[d.clinic].name, img: d.img }));
      PP.units.forEach((u) => push({ g: 'Клиники', t: u.name, x: u.short + ' ' + (u.treats || []).join(' ') + ' ' + (u.slug === 'magniten-rezonans' ? 'ЯМР ЯМРТ MRI МРТ' : u.slug === 'kompyutarna-tomografia' ? 'КТ скенер CT' : ''), u: unitUrl(u), m: u.kind + ' · ' + C.clinics[u.clinic].name }));
    }
    Object.entries(C.pages).forEach(([k, pg]) => { if (/^(news|clinics)$/.test(k)) return; const key = k.replace(/^profile_(\d)$/, 'profile/$1'); push({ g: 'Страници', t: labelOf(key), x: txt(pg.blocks), u: '#/' + key, m: SECTION_LABEL(key) }); });
    [['book', 'Как да се прегледам', 'преглед, записване, час, направление, ДКБ, кабинет'], ['navigator', 'Анатомичен навигатор', 'тяло органи оплаквания насочване симптоми'], ['doctors', 'Лекари', 'специалисти ръководители екип'], ['events', 'Събития', 'конференция изложба'], ['videos', 'Видео', ''], ['sitemap', 'Карта на сайта', '']].forEach(([k, t, x]) => push({ g: 'Страници', t, x, u: '#/' + k, m: 'Раздел' }));
    push({ g: 'Страници', t: 'Как да стигнете до ИСУЛ', x: 'маршрут карта адрес транспорт автобус трамвай метро паркиране', u: 'route.html', m: 'Карта и маршрут' });
    push({ g: 'Страници', t: 'Лабораторни резултати', x: 'резултати изследвания lab', u: LAB, m: 'lab.isul.eu' });
    C.news.forEach((n) => push({ g: 'Новини', t: n.title, x: txt(n.blocks), u: '#/news/' + n.id, m: n.date, img: n.img }));
    [['Телефонна централа', '02 9432 170'], ['Спешно отделение · регистратура', '02 9432 203']].forEach(([t, ph]) => push({ g: 'Телефони', t: t + ' · ' + ph, x: ph + ' телефон', u: 'tel:+359' + ph.replace(/\D/g, '').slice(1), m: 'ИСУЛ' }));
    return items;
  }
  function search(q) {
    IDX = IDX || buildIndex();
    const words = fold(q).split(/\s+/).filter((w) => w.length > 1); if (!words.length) return [];
    const seen = new Set(), out = [];
    IDX.forEach((it) => {
      let sc = 0;
      for (const w of words) { const inT = it.ft.includes(w), inX = it.fx.includes(w); if (!inT && !inX) return; sc += inT ? (it.ft.startsWith(w) ? 12 : 8) : 2; }
      if (it.g === 'Лекари' || it.g === 'Клиники') sc += 2;
      const person = it.g === 'Лекари' ? it.ft.replace(/^(проф|доц|д-р|др|гл\. ас|ас|професор|доцент)[.\s]*(д-р\s*)?/g, '').split(',')[0].replace(/\s+(дмн|дм)\b.*/, '').trim() : '';
      const key = it.g === 'Лекари' ? 'L' + person + it.u : it.g + it.ft + it.u; if (seen.has(key)) return; seen.add(key);
      out.push({ ...it, sc });
    });
    return out.sort((a, b) => b.sc - a.sc);
  }
  const hl = (t, q) => { let r = esc(t); fold(q).split(/\s+/).filter((w) => w.length > 1).forEach((w) => { r = r.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return r; };
  const snippet = (x, q) => { const f = fold(x), w = fold(q).split(/\s+/).find((v) => v.length > 1 && f.includes(v)); if (!w) return ''; const i = Math.max(0, f.indexOf(w) - 60); return (i ? '…' : '') + x.slice(i, i + 170).trim() + '…'; };
  const GROUP_ORDER = ['Лекари', 'Клиники', 'Страници', 'Новини', 'Телефони'];
  const resItem = (r, q, full) => `<a class="sr__it" href="${esc(r.u)}"${/^https?:/.test(r.u) ? ' target="_blank" rel="noopener"' : ''}>${r.img ? `<img src="${esc(r.img)}" alt="" loading="lazy">` : `<span class="sr__ic sr__ic--${GROUP_ORDER.indexOf(r.g)}" aria-hidden="true"></span>`}<span><b>${hl(r.t, q)}</b><small>${esc(r.m || '')}</small>${full && r.g !== 'Телефони' ? `<em>${hl(snippet(r.x || '', q), q)}</em>` : ''}</span></a>`;
  function grouped(res, q, per, full) {
    return GROUP_ORDER.map((g) => { const list = res.filter((r) => r.g === g); if (!list.length) return ''; return `<section class="sr__grp"><h3>${g} <span>${list.length}</span></h3>${list.slice(0, per).map((r) => resItem(r, q, full)).join('')}</section>`; }).join('');
  }
  function searchPage(q) {
    const res = q ? search(q) : [];
    return { title: 'Търсене', html: hero('Търсене', [['Търсене']], q ? `${res.length} резултата за „${esc(q)}“` : 'Търсете лекар, клиника, услуга, телефон или новина.',
      `<form class="sp-form" id="spf" role="search"><label class="vh" for="spq">Търсене</label><input id="spq" type="search" value="${esc(q)}" placeholder="Напр. кардиология, ЯМР, Георгиев, 02 9432…" autocomplete="off"><button type="submit">Търси</button></form>`) +
      `<section class="band band--white"><div class="vwrap"><div class="sr sr--page">${q ? (res.length ? grouped(res, q, 50, true) : `<p class="sr__none">Няма резултати за „${esc(q)}“. Опитайте с друга дума или се обадете на централата: <a href="tel:+35929432170">02 9432 170</a>.</p>`) : ''}</div></div></section>`,
      init: () => { const f = $('#spf'); f.addEventListener('submit', (e) => { e.preventDefault(); location.hash = '#/search?q=' + encodeURIComponent($('#spq').value.trim()); }); if (!q) $('#spq').focus(); } };
  }
  (function searchUI() {
    const act = $('.hd__act'); if (!act || !NEW) return;
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'srch-btn'; btn.setAttribute('aria-label', 'Търсене (клавиш /)');
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg><span>Търсене</span>';
    act.prepend(btn);
    const ov = document.createElement('div'); ov.className = 'srch'; ov.hidden = true; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Търсене в сайта');
    ov.innerHTML = `<div class="srch__box"><form class="srch__f" role="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg><label class="vh" for="srq">Търсене в сайта</label><input id="srq" type="search" placeholder="Търсете лекар, клиника, услуга, телефон…" autocomplete="off"><kbd>Esc</kbd></form>
      <div class="srch__hint"><span>Често търсено:</span>${['Кардиология', 'Запази час', 'ЯМР', 'Лабораторни резултати', 'Спешно отделение', 'Ценоразпис'].map((x) => `<button type="button">${x}</button>`).join('')}</div>
      <div class="sr" id="srr" aria-live="polite"></div></div>`;
    document.body.appendChild(ov);
    const inp = $('#srq', ov), out = $('#srr', ov);
    let last = null;
    const run = () => { const q = inp.value.trim(); if (q.length < 2) { out.innerHTML = ''; return; } const res = search(q); out.innerHTML = res.length ? grouped(res, q, 4, false) + `<a class="sr__all" href="#/search?q=${encodeURIComponent(q)}">Всички ${res.length} резултата →</a>` : `<p class="sr__none">Няма резултати за „${esc(q)}“.</p>`; };
    const open = () => { last = document.activeElement; ov.hidden = false; document.body.style.overflow = 'hidden'; setTimeout(() => inp.focus(), 30); };
    const close = () => { ov.hidden = true; document.body.style.overflow = ''; if (last) last.focus(); };
    btn.addEventListener('click', open);
    inp.addEventListener('input', run);
    $('.srch__f', ov).addEventListener('submit', (e) => { e.preventDefault(); const q = inp.value.trim(); if (q) { close(); location.hash = '#/search?q=' + encodeURIComponent(q); } });
    $('.srch__hint', ov).addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { inp.value = b.textContent; run(); inp.focus(); } });
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('.sr__it, .sr__all')) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !ov.hidden) close();
      if (e.key === '/' && ov.hidden && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
    });
  })();

  /* ---------- Variant X: premium navigation — mega menus, compact dropdowns, mobile accordion ----------
     One model (NAVM) drives the desktop panels and the mobile drawer. All links are the site's existing routes. */
  function megaNav(nav) {
    const sec = (id) => SECTIONS.find((x) => x.id === id);
    const H = (k) => /^(https?:|[a-z]+\.html|#|tel:|mailto:)/.test(k) ? k : '#/' + k;
    const DESC = { patient: 'Пациентски център — всичко на едно място', book: 'Кабинетите на клиниките в ДКБ', admission: 'Планов и спешен прием, документи', navigator: 'От зоната на тялото до клиниката', pricelist: 'Утвърдена ценова листа', insurance: 'Фондове с договор с ИСУЛ', trials: 'Информация и контакти', contacts: 'Телефони, адрес, маршрут' };
    const it = ([k, t]) => ({ h: H(k), t, d: DESC[k] || '' });
    // Клиники: all clinics one by one, A–Я, each with its icon (no medical groups)
    const allClinics = clinicList().map((c) => ({ h: '#/clinic/' + c.id, t: shortName(c.name), ic: clinicIcon(c.id) })).sort((a, b) => a.t.localeCompare(b.t, 'bg'));
    const P = sec('patients').items;
    const NAVM = {
      '#/patient': { type: 'mega', title: 'За пациента', desc: 'Всичко необходимо за Вашето посещение, прием и престой в ИСУЛ.', all: ['#/patient', 'Пациентски център'],
        groups: [{ t: 'Посещение и прием', items: P.filter(([k]) => /^(patient|book|admission|navigator)$/.test(k)).map(it) }, { t: 'Цени и информация', items: P.filter(([k]) => !/^(patient|book|admission|navigator)$/.test(k)).map(it) }],
        aside: { t: 'Резултати от изследвания', d: 'Лабораторните резултати — онлайн в системата на болницата.', cta: [[LAB, 'Отвори lab.isul.eu'], [BOOK, 'Как да се прегледам']] } },
      '#/clinics': { type: 'mega', flat: true, title: 'Клиники и отделения', desc: 'Открийте медицинските структури и специалистите на ИСУЛ.', all: ['#/clinics', `Всички ${clinicList().length} клиники и отделения`],
        groups: [{ t: '', items: allClinics }],
        extra: [{ h: '#/navigator', t: 'Анатомичен навигатор' }, { h: 'variant-e.html', t: 'Анатомична карта на клиниките' }],
        aside: { t: 'Търсите специалист?', d: 'Намерете лекар по име, специалност или клиника.', cta: [['#/doctors', 'Намери лекар'], ['#/navigator', 'Анатомичен навигатор']] } },
      '#/doctors': { type: 'drop', groups: [{ t: 'Екип', items: [['doctors', 'Целият екип'], ['management', 'Ръководство'], ['doctors', 'Лекари'], ['doctors', 'Професионалисти по здравни грижи'], ['careers', 'Кариери в ИСУЛ']].map(it) },
        { t: 'Екипи на клиниките', items: clinicList().filter((c) => c.leaders.length).slice(0, 10).map((c) => ({ h: '#/clinic/' + c.id + '/team', t: shortName(c.name) })) }],
        foot: { t: 'Търсите специалист?', cta: [['#/doctors', 'Намери лекар'], ['#/navigator', 'Анатомичен навигатор']] } },
      '#/news': { type: 'drop', groups: [{ t: 'Прес център', items: [{ h: '#/news', t: 'Всички публикации', d: C.news.length + ' новини, интервюта и видео' }].concat(RUBRICS.filter(([k]) => !/^(all|latest|video)$/.test(k)).map(([k, tt]) => ({ h: '#/news?r=' + k, t: tt, d: C.news.filter((n) => rubricOf(n) === k).length + ' публикации' }))).concat([{ h: '#/videos', t: 'Видео' }, { h: '#/events', t: 'Събития' }]) },
        { t: 'Последни публикации', items: C.news.slice(0, 4).map((n) => ({ h: '#/news/' + n.id, t: n.title.length > 70 ? n.title.slice(0, 68) + '…' : n.title, d: n.date + ' · ' + (RNAME[rubricOf(n)] || 'Новини'), img: 'assets/photos/news-c/' + n.id + '.jpg' })) }],
        foot: { t: 'За медиите: pr@isul.eu', cta: [['mailto:pr@isul.eu', 'Пишете на пресцентъра'], ['#/videos', 'Видео']] } },
      '#/about': { type: 'mega', title: 'За ИСУЛ', desc: 'Университетска многопрофилна болница за активно лечение — от 1936 г.', all: ['#/about', 'За нас'],
        groups: [{ t: 'За болницата', items: navItems(sec('about').items).map(it) }, { t: 'Обяви и дейности', items: sec('notices').items.map(it) }, { t: 'Обществени поръчки', items: [['profile/1', 'Обществени поръчки'], ['profile', 'Профил на купувача']].map(it) }],
        aside: { t: '90 години ИСУЛ', d: 'Историята на болницата — от указа на Цар Борис III до днес.', cta: [['#/history', 'История'], ['#/management', 'Ръководство']] } },
      '#/contacts': { type: 'drop', groups: [{ t: 'Контакти', items: [['contacts', 'Телефони и адрес'], ['route.html', 'Как да стигнете до ИСУЛ'], ['book', 'Как да се прегледам'], [LAB, 'Лабораторни резултати'], ['sitemap', 'Карта на сайта']].map(it) }],
        foot: { t: 'Телефонна централа', cta: [['tel:+35929432170', '02 9432 170'], ['tel:+35929432203', 'Спешно 02 9432 203']] } }
    };
    const ext = (h) => /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '';
    const ARW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    const CHV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    const link = (x, cls = 'nx__a') => `<a class="${cls}${x.img ? ' nx__a--img' : ''}${x.ic ? ' nx__a--ic' : ''}" href="${esc(x.h)}"${ext(x.h)}>${x.img ? `<img src="${esc(x.img)}" alt="" loading="lazy">` : ''}${x.ic ? `<i class="nx__ic" aria-hidden="true">${x.ic}</i>` : ''}<span>${esc(x.t)}${/^https?:/.test(x.h) ? ' ↗' : ''}</span>${x.d ? `<small>${esc(x.d)}</small>` : ''}</a>`;
    const asideHtml = (a) => `<aside class="nx__aside"><b>${esc(a.t)}</b><p>${esc(a.d)}</p>${a.cta.map(([h, t], i) => `<a class="nx__btn${i ? ' nx__btn--o' : ''}" href="${esc(H(h))}"${ext(h)}>${esc(t)}${/^https?:/.test(h) ? ' ↗' : ARW}</a>`).join('')}</aside>`;
    const megaHtml = (m, id) => {
      const intro = `<div class="nx__intro"><h2>${esc(m.title)}</h2><p>${esc(m.desc)}</p><a class="nx__all" href="${m.all[0]}">${esc(m.all[1])}${ARW}</a></div>`;
      let mid;
      if (m.flat) mid = `<div class="nx__flat"><div class="nx__list nx__list--3" style="--r:${Math.ceil(m.groups[0].items.length / 3)}">${m.groups[0].items.map((x) => link(x)).join('')}</div>${m.extra ? `<div class="nx__extra">${m.extra.map((x) => link(x, 'nx__chip')).join('')}</div>` : ''}</div>`;
      else if (m.tabs) {
        mid = `<div class="nx__tabs"><div class="nx__cats" role="tablist" aria-orientation="vertical" aria-label="${esc(m.title)}">${m.groups.map((g, i) => `<button type="button" role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}"><span>${esc(g.t)}</span><em>${g.items.length}</em></button>`).join('')}</div>
          ${m.groups.map((g, i) => `<div class="nx__pane" role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}"${i ? ' hidden' : ''}><p class="nx__gt">${esc(g.t)}</p><div class="nx__list nx__list--2">${g.items.map((x) => link(x)).join('')}</div></div>`).join('')}
          ${m.extra ? `<div class="nx__extra">${m.extra.map((x) => link(x, 'nx__chip')).join('')}</div>` : ''}</div>`;
      } else mid = `<div class="nx__cols" style="--n:${m.groups.length}">${m.groups.map((g) => `<div class="nx__col"><p class="nx__gt">${esc(g.t)}</p><div class="nx__list">${g.items.map((x) => link(x)).join('')}</div></div>`).join('')}</div>`;
      return intro + mid + (m.aside ? asideHtml(m.aside) : '');
    };
    const dropHtml = (m) => `<div class="nx__cols" style="--n:${m.groups.length}">${m.groups.map((g) => `<div class="nx__col"><p class="nx__gt">${esc(g.t)}</p><div class="nx__list">${g.items.map((x) => link(x)).join('')}</div></div>`).join('')}</div>` +
      (m.foot ? `<div class="nx__foot"><b>${esc(m.foot.t)}</b><span>${m.foot.cta.map(([h, t], i) => `<a class="nx__btn${i ? ' nx__btn--o' : ''}" href="${esc(H(h))}">${esc(t)}</a>`).join('')}</span></div>` : '');

    /* ---- desktop ---- */
    const hd = nav.closest('header');
    const layer = document.createElement('div'); layer.className = 'nx-layer'; document.body.appendChild(layer);
    const place = () => {
      layer.style.top = Math.max(0, hd.getBoundingClientRect().bottom) + 'px';
      $$('.nx--drop', layer).forEach((p) => { const a = nav.querySelector(`a[href="${p.dataset.for}"]`); if (!a) return; const r = a.getBoundingClientRect(), w = p.offsetWidth || 300; p.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left - 10)) + 'px'; });
    };
    addEventListener('scroll', place, { passive: true }); addEventListener('resize', place);
    const items = [];
    let n = 0;
    Array.from(nav.children).forEach((a) => {
      const href = a.getAttribute('href'), m = NAVM[href]; if (!m) return;
      const id = 'nx' + (n++);
      const wrap = document.createElement('div'); wrap.className = 'nx-dd';
      const tg = document.createElement('button'); tg.type = 'button'; tg.className = 'nx-tg'; tg.innerHTML = CHV;
      tg.setAttribute('aria-expanded', 'false'); tg.setAttribute('aria-controls', id); tg.setAttribute('aria-label', 'Подменю ' + a.textContent.trim());
      a.replaceWith(wrap); wrap.append(a, tg);
      const panel = document.createElement('div'); panel.id = id; panel.className = 'nx ' + (m.type === 'mega' ? 'nx--mega' : 'nx--drop') + (m.flat ? ' nx--flat' : ''); panel.dataset.for = href;
      panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', a.textContent.trim());
      panel.innerHTML = `<div class="nx__in">${m.type === 'mega' ? megaHtml(m, id) : dropHtml(m)}</div>`;
      layer.appendChild(panel);
      items.push({ wrap, a, tg, panel });
      let t;
      const isOpen = () => panel.classList.contains('is-open');
      const open = () => { clearTimeout(t); items.forEach((o) => { if (o.panel !== panel) shut(o); }); wrap.classList.add('is-open'); panel.classList.add('is-open'); tg.setAttribute('aria-expanded', 'true'); place(); };
      const shut = (o) => { o.wrap.classList.remove('is-open'); o.panel.classList.remove('is-open'); o.tg.setAttribute('aria-expanded', 'false'); };
      const later = () => { clearTimeout(t); t = setTimeout(() => shut({ wrap, panel, tg }), 220); };
      const hoverable = matchMedia('(hover: hover)').matches;
      if (hoverable) { wrap.addEventListener('mouseenter', open); wrap.addEventListener('mouseleave', later); panel.addEventListener('mouseenter', () => clearTimeout(t)); panel.addEventListener('mouseleave', later); }
      tg.addEventListener('click', () => (isOpen() ? shut({ wrap, panel, tg }) : open()));
      const first = () => $('a, button[role="tab"]', panel);
      a.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); open(); setTimeout(() => first() && first().focus(), 20); } });
      tg.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); open(); setTimeout(() => first() && first().focus(), 20); } });
      panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); shut({ wrap, panel, tg }); tg.focus(); } });
      panel.addEventListener('focusout', (e) => { if (!panel.contains(e.relatedTarget) && !wrap.contains(e.relatedTarget)) shut({ wrap, panel, tg }); });
      panel.addEventListener('click', (e) => { if (e.target.closest('a')) shut({ wrap, panel, tg }); });
      // category tabs (Клиники): hover or arrows switch the list
      const tabs = $$('[role="tab"]', panel);
      const pick = (b, focus) => { tabs.forEach((x) => { const on = x === b; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; }); if (focus) b.focus(); };
      tabs.forEach((b, i) => { b.addEventListener('click', () => pick(b)); if (hoverable) b.addEventListener('mouseenter', () => pick(b));
        b.addEventListener('keydown', (e) => { const k = e.key; let j = null; if (k === 'ArrowDown') j = (i + 1) % tabs.length; else if (k === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length; else if (k === 'Home') j = 0; else if (k === 'End') j = tabs.length - 1; else if (k === 'ArrowRight') { e.preventDefault(); const p = $('#' + b.getAttribute('aria-controls') + ' a'); if (p) p.focus(); return; } if (j !== null) { e.preventDefault(); pick(tabs[j], true); } }); });
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') items.forEach((o) => { if (o.panel.classList.contains('is-open')) { o.wrap.classList.remove('is-open'); o.panel.classList.remove('is-open'); o.tg.setAttribute('aria-expanded', 'false'); } }); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.nx, .nx-dd')) items.forEach((o) => { o.wrap.classList.remove('is-open'); o.panel.classList.remove('is-open'); o.tg.setAttribute('aria-expanded', 'false'); }); });

    /* ---- mobile drawer: accordion of the same model ---- */
    const act = $('.hd__act', hd);
    const burger = document.createElement('button'); burger.type = 'button'; burger.className = 'nx-burger'; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-controls', 'nxm');
    burger.innerHTML = '<span aria-hidden="true"></span><span class="vh">Меню</span>';
    act.appendChild(burger);
    const navLinks = Array.from(nav.querySelectorAll(':scope > a, :scope > .nx-dd > a'));
    const mGroup = (m) => (m.type === 'mega' ? [{ t: '', items: [{ h: m.all[0], t: m.all[1] }] }] : []).concat(m.groups).concat(m.extra ? [{ t: 'Още', items: m.extra }] : []);
    const drawer = document.createElement('div'); drawer.id = 'nxm'; drawer.className = 'nxm'; drawer.hidden = true;
    drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true'); drawer.setAttribute('aria-label', 'Основна навигация');
    drawer.innerHTML = `<div class="nxm__panel"><div class="nxm__top"><b>Меню</b><button type="button" class="nxm__x" aria-label="Затвори менюто">×</button></div>
      <nav class="nxm__nav" aria-label="Основна навигация">${navLinks.map((a, i) => { const h = a.getAttribute('href'), m = NAVM[h], t = a.textContent.trim();
        // „Контакти“ on a phone opens the contacts page at once (its sub-menu repeated what the page itself has)
        if (!m || h === '#/contacts') return `<a class="nxm__top-a" href="${h}">${esc(t)}</a>`;
        return `<div class="nxm__sec"><button type="button" class="nxm__acc" aria-expanded="false" aria-controls="nxm-${i}"><span>${esc(t)}</span>${CHV}</button>
          <div class="nxm__body" id="nxm-${i}" hidden>${mGroup(m).map((g) => `${g.t ? `<p class="nx__gt">${esc(g.t)}</p>` : ''}${g.items.map((x) => link(x, 'nxm__a')).join('')}`).join('')}</div></div>`; }).join('')}</nav>
      <div class="nxm__cta"><a class="nx__btn" href="${BOOK}">Как да се прегледам</a><a class="nx__btn nx__btn--er" href="#/clinic/20">Спешно 24/7 · 02 9432 203</a></div></div>`;
    document.body.appendChild(drawer);
    let lastF = null;
    const mClose = () => { drawer.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.documentElement.style.overflow = ''; if (lastF) lastF.focus(); };
    const mOpen = () => { lastF = document.activeElement; drawer.hidden = false; burger.setAttribute('aria-expanded', 'true'); document.documentElement.style.overflow = 'hidden'; setTimeout(() => $('.nxm__x', drawer).focus(), 20); };
    burger.addEventListener('click', mOpen);
    $('.nxm__x', drawer).addEventListener('click', mClose);
    drawer.addEventListener('click', (e) => { if (e.target === drawer || e.target.closest('a')) mClose(); });
    drawer.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); mClose(); }
      if (e.key === 'Tab') { const f = $$('a, button', drawer).filter((x) => x.offsetParent); const a0 = f[0], a1 = f[f.length - 1]; if (e.shiftKey && document.activeElement === a0) { e.preventDefault(); a1.focus(); } else if (!e.shiftKey && document.activeElement === a1) { e.preventDefault(); a0.focus(); } }
    });
    $$('.nxm__acc', drawer).forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(on)); $('#' + b.getAttribute('aria-controls')).hidden = !on; }));

    /* ---- active page: highlight the current link everywhere ---- */
    const mark = () => {
      const h = location.hash || '#/', { parts } = hashRoute(h), key = parts[0] || '', path = '#/' + parts.join('/'), base = '#/' + key;
      // current page: the link to the exact address, else to the page without its parameters (?s=administration …);
      // only the first one in each panel (Екип lists several links to #/doctors)
      $$('.nx, .nxm__body', document).forEach((p) => { const ls = $$('a.nx__a, a.nxm__a', p), cur = ls.find((x) => x.getAttribute('href') === h) || ls.find((x) => x.getAttribute('href') === path);
        ls.forEach((x) => { const on = x === cur; x.classList.toggle('is-cur', on); if (on) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); }); });
      // section: the main-menu item of the page itself, else the item its section belongs to (История, Ръководство, Структура → За нас)
      const hrefs = navLinks.map((x) => x.getAttribute('href')), sec = key && sectionOf(key);
      const top = hrefs.includes(base) ? base : key === 'clinic' ? '#/clinics' : key === 'lekar' ? '#/doctors' : sec ? X_SEC_TOP[sec.id] : '';
      navLinks.forEach((x) => { const hr = x.getAttribute('href'); x.classList.toggle('is-sec', hr === top); if (hr === path) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
    };
    addEventListener('hashchange', mark); mark();
  }
  /* main menu: sub-menu drops down on hover / keyboard focus */
  (function dropdowns() {
    const nav = $('.hd__nav'); if (!nav || !NEW) return;
    if (window.ISUL_X) { megaNav(nav); return; }
    const sec = (id) => SECTIONS.find((x) => x.id === id);
    const list = (items) => items.map(([k, t]) => `<a href="${/^(https?:|[a-z]+\.html)/.test(k) ? k : '#/' + k}"${/^https?:/.test(k) ? ' target="_blank" rel="noopener"' : ''}>${esc(t)}</a>`).join('');
    const col = (title, items) => `<div class="dd__col"><b>${esc(title)}</b>${list(items)}</div>`;
    const MENU = {
      '#/patient': () => col('За пациента', sec('patients').items),
      '#/clinics': () => { const g = {}; clinicList().forEach((c) => { const k = GROUP_OF[c.id] || 'Други'; (g[k] = g[k] || []).push(['clinic/' + c.id, shortName(c.name)]); });
        return GROUPS_ORDER.filter((k) => g[k]).map((k) => col(k, g[k])).join('') + col('Още', [['clinics', 'Всички клиники и отделения'], ['doctors', 'Екип'], ['navigator', 'Анатомичен навигатор'], ['variant-e.html', 'Анатомична карта на клиниките']]); },
      '#/doctors': () => col('Екип', [['doctors', 'Целият екип'], ['management', 'Ръководство'], ['doctors', 'Лекари'], ['doctors', 'Професионалисти по здравни грижи'], ['careers', 'Кариери в ИСУЛ']]) + col('Екипи на клиниките', clinicList().filter((c) => c.leaders.length).slice(0, 10).map((c) => ['clinic/' + c.id + '/team', c.name.replace(/^Клиника по /, '')])),
      '#/news': () => col('Новини', sec('media').items) + col('Последни', C.news.slice(0, 4).map((n) => ['news/' + n.id, n.title.length > 60 ? n.title.slice(0, 58) + '…' : n.title])),
      '#/about': () => col('За нас', sec('about').items) + col('Профил на купувача', sec('profile').items.slice(0, 6)) + col('Обяви', sec('notices').items),
      '#/history': () => col('История', sec('history-archive').items),
      '#/trials': () => col('Наука и обучение', [['trials', 'Клинични изпитвания'], ['projects', 'Проекти'], ['history_01', 'История на хирургията в България'], ['events', 'Събития']]),
      '#/contacts': () => col('Контакти', [['contacts', 'Телефони и адрес'], ['route.html', 'Как да стигнете до ИСУЛ'], ['book', 'Как да се прегледам'], [LAB, 'Лабораторни резултати'], ['sitemap', 'Карта на сайта']])
    };
    const hd = nav.closest('header');
    const strip = document.createElement('div'); strip.className = 'dd-strip'; document.body.appendChild(strip);
    const place = () => {
      strip.style.top = Math.max(0, hd.getBoundingClientRect().bottom) + 'px';
      // simple dropdown: each panel sits under its own menu item
      strip.querySelectorAll('.dd__panel').forEach((p) => { const a = nav.querySelector(`a[href="${p.dataset.for}"]`); if (!a) return; const r = a.getBoundingClientRect(), w = p.offsetWidth || 280; p.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left - 8)) + 'px'; });
    };
    addEventListener('scroll', place, { passive: true }); addEventListener('resize', place);
    Array.from(nav.children).forEach((a) => {
      const href = a.getAttribute('href'), build = MENU[href]; if (!build) return;
      const wrap = document.createElement('div'); wrap.className = 'dd';
      const panel = document.createElement('div'); panel.className = 'dd__panel' + (href === '#/clinics' || href === '#/about' || href === '#/news' ? ' dd__panel--wide' : ''); panel.innerHTML = build();
      a.replaceWith(wrap); wrap.append(a);
      // the strip lives outside the header: a backdrop-filter inside the (already blurred) header cannot blur the page
      strip.appendChild(panel); panel.dataset.for = href;
      const nc = panel.querySelectorAll('.dd__col').length; panel.style.setProperty('--cols', String(Math.min(nc, nc > 4 ? 4 : nc)));
      a.setAttribute('aria-haspopup', 'true'); a.setAttribute('aria-expanded', 'false');
      wrap.addEventListener('mouseenter', place);
      let t;
      const open = () => { clearTimeout(t); nav.querySelectorAll('.dd.is-open').forEach((x) => { if (x !== wrap) { x.classList.remove('is-open'); x._panel.classList.remove('is-open'); x.firstChild.setAttribute('aria-expanded', 'false'); } }); wrap.classList.add('is-open'); panel.classList.add('is-open'); place(); a.setAttribute('aria-expanded', 'true'); };
      const close = () => { t = setTimeout(() => { wrap.classList.remove('is-open'); panel.classList.remove('is-open'); a.setAttribute('aria-expanded', 'false'); }, 160); };
      wrap.addEventListener('mouseenter', open); wrap.addEventListener('mouseleave', close);
      panel.addEventListener('mouseenter', () => clearTimeout(t)); panel.addEventListener('mouseleave', close);
      panel.addEventListener('focusin', () => clearTimeout(t)); panel.addEventListener('focusout', (e) => { if (!panel.contains(e.relatedTarget) && !wrap.contains(e.relatedTarget)) close(); });
      wrap._panel = panel;
      wrap.addEventListener('focusin', open); wrap.addEventListener('focusout', (e) => { if (!wrap.contains(e.relatedTarget)) close(); });
      panel.addEventListener('click', () => { wrap.classList.remove('is-open'); panel.classList.remove('is-open'); });
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { nav.querySelectorAll('.dd.is-open').forEach((x) => x.classList.remove('is-open')); strip.querySelectorAll('.is-open').forEach((x) => x.classList.remove('is-open')); } });
  })();
  /* variant X, phones: the floating prototype switcher (variants.js) moves into the prototype bar at the top of the page,
     so nothing but the quick-actions dock floats over the content */
  (function xSwitch() {
    const vs = $('.vswitch'), bar = $('.proto'); if (!window.ISUL_X || !vs || !bar) return;
    const mq = matchMedia('(max-width: 760px)'), place = () => (mq.matches ? bar : document.body).appendChild(vs);
    place(); mq.addEventListener('change', place);
  })();
  /* a section's sub-menu (.pg-sub) that scrolls sideways: the current page's button in view, a fade on the edge that has more */
  (function subNavFit() {
    const fit = () => document.querySelectorAll('.pg-sub').forEach((n) => {
      const edge = () => { const more = n.scrollWidth - n.clientWidth; n.classList.toggle('is-more', more - n.scrollLeft > 4); n.classList.toggle('is-less', more > 4 && n.scrollLeft > 4); };
      if (!n.dataset.fit) { n.dataset.fit = '1'; n.addEventListener('scroll', edge, { passive: true }); }
      const cur = n.querySelector('[aria-current]');
      if (cur && n.scrollWidth > n.clientWidth) { const r = cur.getBoundingClientRect(), nr = n.getBoundingClientRect(); n.scrollLeft += (r.left - nr.left) - (n.clientWidth - r.width) / 2; }
      edge();
    });
    const later = () => { setTimeout(fit, 60); setTimeout(fit, 500); };
    addEventListener('hashchange', later); addEventListener('resize', fit); later();
  })();
  addEventListener('hashchange', route); route();
})();
