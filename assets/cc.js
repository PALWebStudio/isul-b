/* Variant D — "control centre" under the hero video: interactive tiles. */
(function () {
  'use strict';
  const root = document.getElementById('cc'); if (!root) return;
  const C = (window.ISUL_CONTENT || { clinics: {} }).clinics;
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const telHref = (p) => 'tel:+359' + String(p).replace(/\D/g, '').replace(/^0/, '').slice(0, 9);
  const I = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICO = {
    cal: I('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    // emergency: a siren (the flashing light) — reads as „спешно“ at a glance, unlike a plain +
    siren: I('<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 21h14v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M12 12v3"/><path d="M12 2v2M3 12h1.5M19.5 12H21M5.1 5.1l1.1 1.1M18.9 5.1l-1.1 1.1"/>'),
    lab: I('<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7.5 14h9"/>'),
    pin: I('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    phone: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    trial: I('<path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><circle cx="10" cy="15" r="1"/><circle cx="14" cy="17" r="1"/>'),
    doc: I('<rect x="4.5" y="3" width="15" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
    gavel: I('<path d="m14 5 5 5M11.5 7.5l5 5M4 20l6.5-6.5M9 9.5l5 5-2.5 2.5-5-5z"/>'),
    mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>'),
    copy: I('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>')
  };
  const clinics = Object.values(C).sort((a, b) => a.name.localeCompare(b.name, 'bg'));
  const PHONES = [['Телефонна централа', '02 9432 170'], ['Спешно отделение · регистратура', '02 9432 203']];

  root.innerHTML = `
  <article class="cct cct--book">
    <div class="cct__top"><span class="cct__ico">${ICO.cal}</span><div><h3>Запази час</h3><p>Изберете клиника и вижте как да се запишете.</p></div></div>
    <label class="vh" for="cc-cl">Клиника</label>
    <select id="cc-cl" class="cct__sel"><option value="">Изберете клиника или отделение…</option>${clinics.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
    <div class="cct__pop"><span>Най-търсени</span>${[[3, 'Кардиология'], [5, 'Неврология'], [9, 'Ортопедия'], [12, 'УНГ'], [10, 'Очни болести'], [15, 'Хирургия'], [2, 'Гастроентерология'], [8, 'Образна диагностика'], [19, 'Консултативен блок']].map(([id, t]) => `<button type="button" data-cl="${id}">${t}</button>`).join('')}</div>
    <div class="cct__out" id="cc-out" aria-live="polite">
      <a class="cct__btn cct__btn--main" href="#/book">Как да се прегледам</a>
      
    </div>
    <p class="cct__info">Прегледите са в кабинета на клиниката в ДКБ — II етаж над Спешно отделение, в работни дни от 8 до 14 ч. Информация: телефонна централа 02 9432 170.</p>
  </article>

  <article class="cct cct--emg">
    <div class="cct__top"><span class="cct__ico">${ICO.siren}</span><div><h3>Спешно отделение</h3><p class="cct__live"><span class="cct__dot"></span>Работи денонощно · 24/7</p></div></div>
    <a class="cct__big" href="tel:+35929432203">02 9432 203</a>
    <div class="cct__row"><a class="cct__btn cct__btn--red" href="tel:+35929432203">${ICO.phone}Обади се</a><a class="cct__btn" href="route.html">${ICO.pin}Маршрут</a><a class="cct__btn" href="#/clinic/20">Информация</a></div>
    <p class="cct__note">При опасност за живота се обадете на <a href="tel:112"><b>112</b></a>.</p>
  </article>

  <article class="cct cct--lab">
    <div class="cct__top"><span class="cct__ico">${ICO.lab}</span><div><h3>Лабораторни резултати</h3><p>С номера и кода от бланката, която получавате при вземане на пробата.</p></div></div>
    <a class="cct__btn cct__btn--main" href="https://lab.isul.eu/" target="_blank" rel="noopener">Провери резултатите ↗</a>
  </article>

  <article class="cct cct--route">
    <div class="cct__top"><span class="cct__ico">${ICO.pin}</span><div><h3>Как да стигна</h3><p>ул. „Бяло море“ № 8, София 1527</p></div></div>
    <form class="cct__form" id="cc-route" role="search"><label class="vh" for="cc-from">Откъде тръгвате?</label><input id="cc-from" placeholder="Откъде тръгвате? напр. НДК" autocomplete="off"><button type="submit" aria-label="Покажи маршрута">→</button></form>
    <div class="cct__chips"><span>🚗 С кола</span><span>🚶 Пеша</span><span>🚌 Градски транспорт</span></div>
    <a class="cct__map" href="route.html" aria-label="Отвори картата с маршрута"><img src="assets/photos/map_01.jpg" alt="Схема за достъп с градски транспорт" loading="lazy"><span>Отвори картата →</span></a>
  </article>

  <article class="cct cct--phones">
    <div class="cct__top"><span class="cct__ico">${ICO.phone}</span><div><h3>Важни телефони</h3></div></div>
    <ul class="cct__tel">${PHONES.map(([t, n]) => `<li><span>${t}</span><a href="${telHref(n)}">${n}</a><button type="button" data-copy="${n}" aria-label="Копирай ${n}">${ICO.copy}</button></li>`).join('')}</ul>
  </article>

  <nav class="cct cct--inst" aria-label="За специалисти и партньори">
    <p class="cct__lbl">За специалисти и партньори</p>
    <div class="cct__mini">
      <a href="#/trials"><span class="cct__ico">${ICO.trial}</span><b>Клинични изпитвания</b><i>→</i></a>
      <a href="#/competition"><span class="cct__ico">${ICO.doc}</span><b>Конкурси</b><i>→</i></a>
      <a href="#/auction"><span class="cct__ico">${ICO.gavel}</span><b>Търгове</b><i>→</i></a>
      <a href="#/invitations"><span class="cct__ico">${ICO.mail}</span><b>Покани</b><i>→</i></a>
    </div>
  </nav>`;

  // compact mode: a row of buttons; the matching tile drops down underneath when clicked
  (function compact() {
    const T = [['book', ICO.cal, 'Преглед', 'Кабинетите в ДКБ'], ['emg', ICO.siren, 'Спешно отделение', '24/7 · 02 9432 203'], ['lab', ICO.lab, 'Лабораторни резултати', 'lab.isul.eu'], ['route', ICO.pin, 'Как да стигна', 'ул. „Бяло море“ 8'], ['phones', ICO.phone, 'Важни телефони', 'Централа · Регистратура']];
    const bar = document.createElement('div'); bar.className = 'ccb'; bar.setAttribute('role', 'tablist');
    bar.innerHTML = T.map(([k, ic, t, sub]) => `<button type="button" class="ccb__b ccb__b--${k}" role="tab" aria-selected="false" aria-controls="cct-${k}" data-k="${k}"><span class="cct__ico">${ic}</span><span><b>${t}</b><small>${sub}</small></span><i aria-hidden="true"></i></button>`).join('');
    root.before(bar);
    root.classList.add('cc__panels');
    T.forEach(([k]) => { const a = root.querySelector('.cct--' + k); if (a) { a.id = 'cct-' + k; a.setAttribute('role', 'tabpanel'); } });
    const inst = root.querySelector('.cct--inst'); if (inst) root.after(inst);
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const open = b.getAttribute('aria-selected') !== 'true';
      bar.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', 'false'));
      root.querySelectorAll('.cct').forEach((x) => x.classList.remove('is-open'));
      root.classList.toggle('has-open', open);
      if (open) { b.setAttribute('aria-selected', 'true'); root.querySelector('#cct-' + b.dataset.k).classList.add('is-open'); }
    });
  })();

  // booking: clinic → its phones + floor
  const sel = root.querySelector('#cc-cl'), out = root.querySelector('#cc-out');
  root.querySelector('.cct__pop').addEventListener('click', (e) => { const b = e.target.closest('[data-cl]'); if (!b) return; sel.value = b.dataset.cl; sel.dispatchEvent(new Event('change')); });
  sel.addEventListener('change', () => {
    const c = C[sel.value];
    root.querySelectorAll('.cct__pop button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cl === sel.value)));
    if (!c) { out.innerHTML = `<a class="cct__btn cct__btn--main" href="#/book">Как да се прегледам</a>`; return; }
    const ph = (c.phones[0] || '02 9432 170').split(/ и |;|,/)[0].trim();
    out.innerHTML = `<div class="cct__picked"><b>${esc(c.name)}</b><span>${c.floor ? esc(c.floor) + ' · ' : ''}${esc(c.emails[0] || '')}</span></div>
      <a class="cct__btn cct__btn--main" href="#/book">Как да се прегледам</a>
      <a class="cct__btn" href="${telHref(ph)}">${ICO.phone}${esc(ph)}</a>
      <a class="cct__btn" href="#/clinic/${c.id}">За клиниката →</a>`;
  });
  // route: open the route planner with the start point filled in
  root.querySelector('#cc-route').addEventListener('submit', (e) => { e.preventDefault(); const v = root.querySelector('#cc-from').value.trim(); location.href = 'route.html' + (v ? '?from=' + encodeURIComponent(v) : ''); });
  // copy phone numbers
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const done = () => { b.classList.add('is-ok'); setTimeout(() => b.classList.remove('is-ok'), 1400); };
    (navigator.clipboard ? navigator.clipboard.writeText(b.dataset.copy) : Promise.reject()).then(done, done);
  });
})();

/* Homepage "Клиниките на ИСУЛ": simple filter tabs + clean card grid (replaces the 3D ring) */
(function () {
  'use strict';
  const box = document.getElementById('clg'); if (!box) return;
  const C = (window.ISUL_CONTENT || { clinics: {} }).clinics;
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const G = [['Хирургични', [6, 9, 10, 12, 15, 18]], ['Терапевтични', [2, 3, 5, 7, 11, 14, 16]], ['Онкология и рехабилитация', [4, 13, 17]], ['Диагностика', [8, 19]], ['Спешна и интензивна помощ', [1, 20]], ['Лаборатории', [21, 22, 23, 24, 25, 26]], ['Извънболнична помощ', [27]]];
  const groupOf = {}; G.forEach(([g, ids]) => ids.forEach((i) => { groupOf[i] = g; }));
  const short = (n) => n.replace(/^Клиника по /, '').replace(/^(.)/, (m) => m.toUpperCase()).replace(' за лечение на метаболитни заболявания', '').replace(' с извършване на специфична дейност по андрология', ' и андрология');
  const list = Object.values(C).sort((a, b) => a.id - b.id);
  const tabs = [['Всички', list.length]].concat(G.map(([g, ids]) => [g, ids.length]));
  box.innerHTML = `<div class="clg__tabs" role="tablist" aria-label="Вид клиника">${tabs.map(([t, n], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-g="${t}">${t}<span>${n}</span></button>`).join('')}</div>
    <p class="clg__count"></p><div class="clg__grid" id="clg-grid"></div>
    <div class="clg__foot"><a href="#/clinics">Всички клиники и отделения →</a><a href="variant-e.html">Анатомична карта на клиниките →</a></div>`;
  const grid = box.querySelector('#clg-grid');
  const ORDER = [3, 5, 9, 15, 8, 10, 12, 4, 2, 6, 7, 11, 13, 14, 16, 17, 18, 20, 1, 19, 27, 24, 22, 23, 25, 26, 21];
  const sorted = ORDER.map((i) => C[i]).filter(Boolean);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  grid.className = 'cring';
  grid.innerHTML = '<div class="cring__stage"><ul class="cring__ring"></ul></div><div class="cring__ctl"><button type="button" data-r="-1" aria-label="Предишна">←</button><button type="button" data-r="1" aria-label="Следваща">→</button></div>';
  const stage = grid.querySelector('.cring__stage'), ring = grid.querySelector('.cring__ring');
  let n = 0, step = 0, R = 0, base = 0, scrollA = 0, drag = null;
  const card = (c) => `<li><a class="c3r" href="#/clinic/${c.id}">${c.hero ? `<img src="${esc(c.hero)}" alt="" decoding="async">` : '<span class="c3r__ph" aria-hidden="true"></span>'}<span class="c3r__shade"></span><span class="c3r__txt"><small>${esc(groupOf[c.id] || '')}</small><b>${esc(short(c.name))}</b></span><span class="c3r__go" aria-hidden="true">→</span></a></li>`;
  const set = () => {
    const a = base + scrollA;
    ring.style.transform = n > 8 ? `translateZ(${-R}px) rotateY(${a}deg)` : 'none';
    const front = n > 8 ? ((Math.round(-a / step) % n) + n) % n : -1;
    ring.querySelectorAll(':scope > li').forEach((li, i) => li.classList.toggle('is-front', i === front));
  };
  const layout = () => {
    const lis = ring.querySelectorAll(':scope > li'); n = lis.length; step = 360 / Math.max(n, 1);
    const w = lis[0] ? lis[0].offsetWidth : 240;
    if (!w || !stage.offsetWidth) return;            // home is hidden (inner page) — lay out again when it is shown
    const flat = n <= 8 || innerWidth <= 760;
    grid.classList.toggle('is-flat', flat);
    R = flat ? 0 : Math.round(w / 2 / Math.tan(Math.PI / Math.max(n, 4))) + 24;
    lis.forEach((li, i) => { li.style.transform = flat ? 'none' : `rotateY(${i * step}deg) translateZ(${R}px)`; });
    set();
  };
  const render = (g) => {
    const items = g === 'Всички' ? sorted : sorted.filter((c) => groupOf[c.id] === g);
    ring.innerHTML = items.map(card).join(''); base = 0;
    box.querySelector('.clg__count').textContent = items.length + (items.length === 1 ? ' клиника' : ' клиники и отделения') + (items.length > 8 ? ' · завъртете със скрол, стрелките или влачене' : '');
    layout();
  };
  grid.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => { base -= +b.dataset.r * step; set(); }));
  // scroll drives rotation while the section is on screen
  const onScroll = () => { if (reduce || n <= 8) return; const r = stage.getBoundingClientRect(); const p = (innerHeight - r.top) / (innerHeight + r.height); if (p < 0 || p > 1) return; scrollA = -p * 360 * Math.min(1, 12 / n) * 0.45; ring.style.transition = 'transform .2s linear'; set(); };
  addEventListener('scroll', onScroll, { passive: true });
  stage.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, b: base, moved: false }; ring.style.transition = 'none'; });
  addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true; base = drag.b + dx * .15; set(); });
  addEventListener('pointerup', () => { if (!drag) return; ring.style.transition = ''; base = Math.round(base / step) * step; set(); stage.dataset.dragged = drag.moved ? '1' : ''; drag = null; });
  stage.addEventListener('click', (e) => { if (stage.dataset.dragged) { e.preventDefault(); stage.dataset.dragged = ''; } }, true);
  addEventListener('resize', layout);
  if (window.ResizeObserver) new ResizeObserver(() => layout()).observe(stage);
  addEventListener('hashchange', () => requestAnimationFrame(layout));
  addEventListener('load', layout);
  if (document.fonts) document.fonts.ready.then(layout);
  // flat row: cards tilt slightly towards the mouse
  ring.addEventListener('pointermove', (e) => {
    if (!grid.classList.contains('is-flat') || reduce || e.pointerType !== 'mouse') return;
    const c = e.target.closest('.c3r'); if (!c) return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(900px) rotateX(${-y * 9}deg) rotateY(${x * 11}deg) translateY(-4px)`;
  });
  ring.addEventListener('pointerout', (e) => { const c = e.target.closest('.c3r'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });
  // hover: mouse on the left/right part of the ring turns it that way (faster near the edge)
  let hoverV = 0, hoverRaf = 0;
  const spin = () => {
    if (!hoverV || drag) { hoverRaf = 0; return; }
    base += hoverV; ring.style.transition = 'none'; set();
    hoverRaf = requestAnimationFrame(spin);
  };
  stage.addEventListener('pointermove', (e) => {
    if (drag || n <= 8 || reduce || e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5;   // -0.5 … 0.5
    const dead = .14, k = Math.max(0, Math.abs(x) - dead) / (.5 - dead);
    hoverV = k ? -Math.sign(x) * (0.08 + k * k * 0.45) : 0;
    if (hoverV && !hoverRaf) hoverRaf = requestAnimationFrame(spin);
  });
  stage.addEventListener('pointerleave', () => {
    hoverV = 0; ring.style.transition = ''; base = Math.round(base / step) * step; set();
  });
  box.querySelector('.clg__tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    box.querySelectorAll('.clg__tabs button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    render(b.dataset.g);
  });
  render('Всички');
})();

/* Homepage premium news: rubric tabs (Последни · Медицина · Пациенти · Постижения · Видео) */
(function () {
  'use strict';
  const SRC = typeof NEWS !== 'undefined' ? NEWS : window.NEWS;
  const box = document.getElementById('newsx'); if (!box || !SRC) return;
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MIG = (window.ISUL_CONTENT || { news: [] }).news;
  const linkOf = (n) => { const m = MIG.find((x) => x.title === n.title); return m ? '#/news/' + m.id : '#/news'; };
  const fmt = (d) => d.split('-').reverse().join('.');
  const read = (n) => Math.max(2, Math.round(((MIG.find((x) => x.title === n.title) || { blocks: [] }).blocks.map((b) => b.x || '').join(' ').split(/\s+/).length) / 200));
  const LIST = SRC.slice().sort((a, b) => b.date.localeCompare(a.date)).map((n) => { const m = MIG.find((x) => x.title === n.title); return m ? { ...n, img: 'assets/photos/news-c/' + m.id + '.jpg' } : n; });
  // featured lead (editor's choice): moved to the top of „Последни“
  const FEAT = LIST.findIndex((n) => /Георгиев/.test(n.title)); if (FEAT > 0) LIST.unshift(LIST.splice(FEAT, 1)[0]);
  const VIDEOS = [
    { src: 'assets/video/hero-isul-1080.mp4', poster: 'assets/video/hero-isul-poster.jpg', t: 'Лекарите на ИСУЛ', p: 'Видео разказ от болницата', d: '2026-10-10', dur: '0:18', real: true },
    { src: 'assets/video/hero-students.mp4', poster: 'assets/video/hero-students-poster.jpg', t: 'Университетска болница: обучение на студенти и специализанти', p: 'Обучение', d: '2026-10-05', dur: '0:15' },
    { src: 'assets/video/v4773.mp4', poster: 'assets/video/v4773.jpg', t: 'Зад кулисите на Клиничната лаборатория', p: 'Лаборатории', d: '2026-09-28', dur: '0:20' },
    { src: 'assets/video/v17625.mp4', poster: 'assets/video/v17625.jpg', t: 'Как протича ЯМР изследване', p: 'Образна диагностика', d: '2026-09-20', dur: '0:16' }
  ];
  const TABS = [['latest', 'Последни'], ['Медицина', 'Медицина'], ['Пациенти', 'Пациенти'], ['Постижения', 'Постижения'], ['video', '▶ Видео']];
  box.className = 'pn';
  box.innerHTML = `<div class="pn__tabs" role="tablist" aria-label="Рубрики">${TABS.map(([k, t], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-k="${k}">${t}</button>`).join('')}</div><div class="pn__body" id="pn-body"></div>`;
  const body = box.querySelector('#pn-body');
  const meta = (n) => `<span class="pn__meta"><b>${esc(n.cat)}</b>${fmt(n.date)} · ${read(n)} мин четене</span>`;
  const lead = (n) => `<a class="pn__lead" href="${linkOf(n)}"><span class="pn__img"><img src="${esc(n.img)}" alt="" loading="lazy"></span><span class="pn__lead-txt">${meta(n)}<h3>${esc(n.title)}</h3><p>${esc(n.ex || '')}</p><span class="pn__read">Прочети →</span></span></a>`;
  const row = (n) => `<a class="pn__row" href="${linkOf(n)}"><span class="pn__thumb nwm"><img src="${esc(n.img)}" alt="" loading="lazy"></span><span>${meta(n)}<b>${esc(n.title)}</b></span></a>`;
  const vlead = (v, i) => `<button type="button" class="pn__vlead" data-vi="${i}"><img src="${esc(v.poster)}" alt=""><span class="pn__play" aria-hidden="true"></span><span class="pn__vtxt"><span class="pn__meta"><b>Видео</b>${fmt(v.d)} · ${v.dur}</span><h3>${esc(v.t)}</h3><p>${esc(v.p)}</p></span></button>`;
  const vrow = (v, i) => `<button type="button" class="pn__row pn__row--v" data-vi="${i}"><span class="pn__vthumb"><img src="${esc(v.poster)}" alt=""><i aria-hidden="true"></i><em>${v.dur}</em></span><span><span class="pn__meta"><b>Видео</b>${fmt(v.d)}</span><b>${esc(v.t)}</b></span></button>`;
  const render = (k) => {
    if (k === 'video') { body.innerHTML = `<div class="pn__grid">${vlead(VIDEOS[0], 0)}<div class="pn__list">${VIDEOS.slice(1).map((v, i) => vrow(v, i + 1)).join('')}</div></div><p class="pn__note">Временните клипове ще бъдат заменени с видео новини, заснети в ИСУЛ.</p>`; return; }
    const items = k === 'latest' ? LIST : LIST.filter((n) => n.cat === k);
    if (!items.length) { body.innerHTML = '<p class="pn__empty">Няма новини в тази рубрика.</p>'; return; }
    body.innerHTML = `<div class="pn__grid">${lead(items[0])}<div class="pn__list">${items.slice(1, 5).map(row).join('') || '<p class="pn__empty">Още новини предстоят.</p>'}</div></div>`;
  };
  box.querySelector('.pn__tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; box.querySelectorAll('.pn__tabs button').forEach((x) => x.setAttribute('aria-selected', String(x === b))); body.classList.remove('pn-in'); void body.offsetWidth; body.classList.add('pn-in'); render(b.dataset.k); });
  // video modal
  body.addEventListener('click', (e) => {
    const b = e.target.closest('[data-vi]'); if (!b) return;
    const v = VIDEOS[+b.dataset.vi];
    const m = document.createElement('div'); m.className = 'pn__modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = `<div><button type="button" aria-label="Затвори">×</button><video src="${v.src}" poster="${v.poster}" controls autoplay playsinline></video><p>${esc(v.t)}</p></div>`;
    document.body.appendChild(m);
    const close = () => m.remove();
    m.addEventListener('click', (ev) => { if (ev.target === m || ev.target.closest('button')) close(); });
    addEventListener('keydown', function k(ev) { if (ev.key === 'Escape') { close(); removeEventListener('keydown', k); } });
  });
  render('latest');
})();

/* Homepage "Екипи и специалисти": photo cards like the clinic cards, filling the width */
(function () {
  'use strict';
  const box = document.getElementById('team'); if (!box) return;
  const C = (window.ISUL_CONTENT || { clinics: {} }).clinics;
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const short = (n) => n.replace(/^Клиника по /, '').replace(/^(.)/, (m) => m.toUpperCase()).replace(' за лечение на метаболитни заболявания', '').replace(' с извършване на специфична дейност по андрология', ' и андрология');
  const people = [];
  [3, 5, 9, 15, 4, 8, 2, 10, 12, 7, 6, 11, 13, 17, 18, 20, 1, 14, 16, 19, 22, 23, 24, 25, 26, 27, 21].forEach((id) => {
    const c = C[id]; if (!c) return;
    c.leaders.forEach((l, k) => { if (l.img && !/team\.jpg/.test(l.img) && l.name && !/awesome/i.test(l.name)) people.push({ ...l, c, k }); });
  });
  // one person per clinic first (round-robin), so the grid shows many different clinics
  people.sort((a, b) => a.k - b.k);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAX = 6;
  // higher-quality local copies (upscaled + sharpened) of the official isul.eu portraits
  const localPhoto = (u) => { const m = String(u).match(/photos\/dr\/(\d+)(?:_m)?\.jpg/); return m ? 'assets/photos/doctors/' + m[1] + '.jpg' : u; };
  box.className = 'tm3';
  const PPL = window.ISUL_PEOPLE_API && window.ISUL_UNITS ? window.ISUL_PEOPLE_API.build(window.ISUL_CONTENT, window.ISUL_UNITS, window.ISUL_CV || {}, window.ISUL_BIOS || {}) : null;
  const prof = (p) => { const k = PPL && window.ISUL_PEOPLE_API.parse(p.name, p.role || ' '); const d = k && PPL.list.find((x) => x.key === k.key); return d ? '#/lekar/' + d.slug : '#/clinic/' + p.c.id + '/team'; };
  box.innerHTML = people.slice(0, MAX).map((p) => `<a class="tm3__c" href="${prof(p)}">
      <span class="nwm tm3__wm" aria-hidden="true"></span><img src="${esc(localPhoto(p.img))}" alt="${esc(p.name)}" loading="lazy" decoding="async"><span class="tm3__shade"></span>
      <span class="tm3__txt"><small>${esc(short(p.c.name))}</small><b>${esc(p.name)}</b>${p.role ? `<em>${esc(p.role)}</em>` : ''}</span>
      <span class="tm3__go" aria-hidden="true">→</span></a>`).join('');
  const note = box.parentElement.querySelector('.teamnote'); if (note) note.textContent = `Показани са ${Math.min(MAX, people.length)} от ръководителите на клиники и отделения. Пълните екипи са в страницата на всяка клиника.`;
  if (!reduce) box.addEventListener('pointermove', (e) => {
    const c = e.target.closest('.tm3__c'); if (!c || e.pointerType !== 'mouse') return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(900px) rotateX(${-y * 9}deg) rotateY(${x * 11}deg) translateY(-4px)`;
  });
  box.addEventListener('pointerout', (e) => { const c = e.target.closest('.tm3__c'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });
})();

/* Sticky copy of the help bar: appears under the main header once the hero buttons scroll away */
(function () {
  'use strict';
  const bar = document.querySelector('.hero__cc .ccb'); if (!bar) return;
  const panels = document.getElementById('cc');
  const hd = document.getElementById('hd');
  const wrap = document.createElement('div'); wrap.className = 'ccs'; wrap.setAttribute('aria-label', 'Бързи действия');
  const inner = document.createElement('div'); inner.className = 'wrap';
  const sb = bar.cloneNode(true); sb.classList.add('ccb--sticky'); sb.removeAttribute('role');
  sb.querySelectorAll('button').forEach((b) => { b.removeAttribute('aria-controls'); b.setAttribute('aria-selected', 'false'); });
  inner.appendChild(sb); wrap.appendChild(inner); document.body.appendChild(wrap);
  const home = panels && panels.parentElement, mark = document.createComment('cc-panels');
  if (panels && !panels.matches('[role="dialog"]')) home.insertBefore(mark, panels);
  const float = (v) => {
    if (!panels || panels.matches('[role="dialog"]')) return;
    if (v) { document.body.appendChild(panels); panels.classList.add('is-floating'); }
    else { panels.classList.remove('is-floating'); panels.style.top = ''; mark.parentNode.insertBefore(panels, mark.nextSibling); }
  };
  const place = () => { wrap.style.top = Math.max(0, hd.getBoundingClientRect().bottom) + 'px'; if (panels && panels.classList.contains('is-floating')) panels.style.top = (wrap.getBoundingClientRect().bottom + 10) + 'px'; };
  const sync = () => sb.querySelectorAll('button').forEach((b) => { const h = bar.querySelector(`[data-k="${b.dataset.k}"]`); b.setAttribute('aria-selected', h ? h.getAttribute('aria-selected') : 'false'); });
  let on = false;
  const show = (v) => {
    if (v === on) return; on = v; wrap.classList.toggle('is-on', v);
    if (!v && panels && panels.classList.contains('is-floating')) float(false);   // back in the hero: the panel returns inline
  };
  new IntersectionObserver(([e]) => show(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 }).observe(bar);
  addEventListener('scroll', place, { passive: true }); addEventListener('resize', place); place();
  sb.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const h = bar.querySelector(`[data-k="${b.dataset.k}"]`); if (!h) return;
    if (panels && !panels.matches('[role="dialog"]') && !panels.classList.contains('is-floating')) { float(true); place(); }
    h.click(); sync();
    if (panels && !panels.classList.contains('has-open') && panels.classList.contains('is-floating')) float(false);
  });
  bar.addEventListener('click', () => setTimeout(sync));
  document.addEventListener('click', (e) => { if (e.target.closest('.cct__x') || e.target === panels) setTimeout(sync); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setTimeout(sync); });
})();

/* Clean hero on load: the help bar is hidden at the very top and slides in after a small scroll */
(function () {
  'use strict';
  const cc = document.querySelector('.hero__cc'); if (!cc) return;
  const panels = document.getElementById('cc');
  const upd = () => {
    const open = panels && panels.classList.contains('has-open');
    document.body.classList.toggle('cc-top', scrollY < 40 && !open);
  };
  addEventListener('scroll', upd, { passive: true }); upd();
})();

/* Every help panel gets a button to its full page; "Как да стигна" gets a richer two-column layout */
(function () {
  'use strict';
  const root = document.getElementById('cc'); if (!root) return;
  const PAGES = { book: ['#/book', 'Към страница „Запази час“'], emg: ['#/clinic/20', 'Към страница „Спешно отделение“'], lab: ['#/trials', ''], route: ['route.html', 'Отвори пълната карта с маршрут'], phones: ['#/contacts', 'Към страница „Контакти“'] };
  PAGES.lab = ['https://lab.isul.eu/', 'Към портала lab.isul.eu'];
  Object.entries(PAGES).forEach(([k, [href, t]]) => {
    const p = root.querySelector('.cct--' + k); if (!p || p.querySelector('.cct__page')) return;
    const a = document.createElement('a'); a.className = 'cct__page'; a.href = href; if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
    a.innerHTML = `<span>${t}</span><b aria-hidden="true">→</b>`;
    p.appendChild(a);
  });
  const r = root.querySelector('.cct--route');
  if (r && !r.querySelector('.cct__lines')) {
    const form = r.querySelector('.cct__form'), chips = r.querySelector('.cct__chips'), map = r.querySelector('.cct__map'), top = r.querySelector('.cct__top');
    const left = document.createElement('div'); left.className = 'cct__rl';
    left.append(top, form, chips);
    left.insertAdjacentHTML('beforeend', `<div class="cct__lines"><p>Градски транспорт до ИСУЛ</p>
      <div><span class="ln ln--bus">Автобуси</span><b>11, 78, 79, 213, 305, 404, 413</b></div>
      <div><span class="ln ln--tram">Трамваи</span><b>20, 22</b></div>
      <div><span class="ln ln--trol">Тролейбуси</span><b>1, 2, 4</b></div></div>
      <div class="cct__addr"><span>Адрес</span><b>ул. „Бяло море“ № 8, София 1527</b><span>Спешен вход</span><b>откъм Спешно отделение, денонощно</b></div>`);
    const x = r.querySelector('.cct__x'); r.innerHTML = ''; if (x) r.appendChild(x);
    r.appendChild(left); if (map) r.appendChild(map);
    const pg = document.createElement('a'); pg.className = 'cct__page'; pg.href = 'route.html'; pg.innerHTML = '<span>Отвори пълната карта с маршрут</span><b aria-hidden="true">→</b>'; r.appendChild(pg);
    // form still opens the route page with the start point
    const f = r.querySelector('#cc-route'); if (f) f.addEventListener('submit', (e) => { e.preventDefault(); const v = r.querySelector('#cc-from').value.trim(); location.href = 'route.html' + (v ? '?from=' + encodeURIComponent(v) : ''); });
  }
})();

/* An open help panel closes by itself after a bigger scroll away from where it was opened */
(function () {
  'use strict';
  const panels = document.getElementById('cc'); if (!panels) return;
  const LIMIT = 520;
  let openY = null;
  const isOpen = () => panels.classList.contains('has-open');
  new MutationObserver(() => { if (isOpen() && openY === null) openY = scrollY; if (!isOpen()) openY = null; }).observe(panels, { attributes: true, attributeFilter: ['class'] });
  addEventListener('scroll', () => {
    if (!isOpen() || openY === null || Math.abs(scrollY - openY) < LIMIT) return;
    const sel = document.querySelector('.hero__cc .ccb__b[aria-selected="true"]');
    if (sel) sel.click();                                    // same as clicking the button again
    document.querySelectorAll('.ccb--sticky .ccb__b').forEach((b) => b.setAttribute('aria-selected', 'false'));
    if (panels.classList.contains('is-floating')) { panels.classList.remove('is-floating'); panels.style.top = ''; const m = Array.from(document.querySelector('.hero__cc .wrap').childNodes).find((n) => n.nodeType === 8); if (m) m.parentNode.insertBefore(panels, m.nextSibling); }
  }, { passive: true });
})();
