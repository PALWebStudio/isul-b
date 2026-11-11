/* Дигиталният ИСУЛ — prototype app (no framework, hash router). */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const spec = (id) => SPECIALTIES.find((s) => s.id === id);
  const clinic = (id) => CLINICS.find((c) => c.id === id);
  const doc = (slug) => DOCTORS.find((d) => d.slug === slug);
  const fullName = (d) => `${RANK_TITLE[d.rank]} ${d.name}${d.deg ? ', ' + d.deg : ''}`;
  const norm = (s) => s.toLowerCase().replace(/ё/g, 'е').trim();
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  const ICON = {
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3"/></svg>',
    doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/></svg>',
    clinic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M10 10h4M12 8v4"/></svg>',
    lab: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7.5 14h9"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
    warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 20h20L12 3zM12 10v4M12 17v.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
    amb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 16V8h11v8M13 11h4l3 3v2h-7M7 9.5v4M5 11.5h4"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>'
  };
  const SILHOUETTE = '<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="74" r="40"/><path d="M22 200c4-50 38-78 78-78s74 28 78 78z"/></svg>';

  const portrait = (d) => `<div class="portrait" role="img" aria-label="Място за професионален портрет: ${esc(fullName(d))}">${SILHOUETTE}<span class="portrait__ini" aria-hidden="true">${d.name.split(' ').map((w) => w[0]).join('')}</span><span class="portrait__tag" aria-hidden="true">Портрет ИСУЛ</span></div>`;
  const photo = (cls, cap, tag = 'Фото ИСУЛ', extra = '') => `<figure class="photo ${cls}" ${extra}><span class="photo__tag">${tag}</span><figcaption>${cap}</figcaption></figure>`;
  const crumbs = (items) => `<nav class="crumbs" aria-label="Навигационна пътека"><ol><li><a href="#/">Начало</a></li>${items.map((it, i) => i === items.length - 1 ? `<li aria-current="page">${esc(it[0])}</li>` : `<li><a href="${it[1]}">${esc(it[0])}</a></li>`).join('')}</ol></nav>`;
  const tel = (p) => `<a href="tel:${p.tel}">${p.label}</a>${p.ok ? '' : '<span class="tbc" title="Примерен номер — да се замени">*</span>'}`;
  const pic = (src, alt, cls = '') => `<img class="pic ${cls}" src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async" width="765" height="400">`;
  const bld = (c) => c.b.length === 1 ? 'Корпус ' + c.b : c.b;
  const cname = (c) => c.short || c.name;
  const phero = (crumbItems, eyebrow, title, lead, side = '') => `
    <section class="phero"><div class="wrap">${crumbs(crumbItems)}
      <div class="phero__grid"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div><div>${side}</div></div>
    </div></section>`;

  const dcard = (d) => {
    const c = clinic(d.clinic);
    return `<a class="dcard" href="#/doctors/${d.slug}">${portrait(d)}
      <div><div class="dcard__title">${RANK_TITLE[d.rank]}${d.deg ? ' · ' + d.deg : ''}</div>
      <div class="dcard__name">${esc(d.name)}</div></div>
      <div class="dcard__spec">${spec(d.spec).name}<br>${c ? c.name : ''}</div>
      <span class="dcard__go arrow">Виж профил </span></a>`;
  };
  const ccard = (c) => `<a class="ccard" href="#/clinics/${c.id}"><b>${cname(c)}</b><span class="meta">${c.group} · ${bld(c)}, етаж ${c.f}</span><span class="ccard__go" aria-hidden="true">→</span></a>`;
  const acard = (a, big) => {
    const r = doc(a.reviewer);
    return `<a class="acard ${big ? 'acard--big' : ''}" href="#/knowledge">${a.img ? `<figure class="photo photo--img">${pic(a.img, a.title)}</figure>` : photo(a.c, 'Илюстративна фотография от ИСУЛ', 'Знанието лекува')}
      <div class="catline"><span class="cat">${a.cat}</span><span>${a.min} мин. четене</span></div>
      <h3>${a.title}</h3>
      <span class="reviewed">${ICON.check}Проверено от ${RANK_TITLE[r.rank]} ${r.name}</span></a>`;
  };
  const ncard = (n) => `<a class="acard" href="#/news"><figure class="photo photo--img">${pic(n.img, n.title)}</figure>
      <div class="catline"><span class="cat ${n.cat === 'ИСУЛ 90' ? 'cat--90' : ''}">${n.cat}</span><time datetime="${n.date}">${fmtDate(n.date)}</time></div>
      <h3>${n.title}</h3><p>${n.ex}</p></a>`;

  /* Architectural facade: rhythm of windows, generated deterministically */
  function facade(seed = 7, w = 360, h = 300) {
    let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const cols = 9, rows = 8, gx = w / cols, gy = (h - 40) / rows;
    let out = `<svg class="facade" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Абстрактен архитектурен детайл: ритъм на прозорците на болничната сграда">`;
    out += `<rect width="${w}" height="${h}" fill="#EAF0F7"/>`;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const lit = rnd() > 0.82, x = c * gx + gx * 0.22, y = 20 + r * gy + gy * 0.18;
      out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(gx * 0.56).toFixed(1)}" height="${(gy * 0.64).toFixed(1)}" fill="${lit ? '#9D305C' : '#CCDAEB'}" ${lit ? 'opacity=".9"' : ''}/>`;
    }
    out += `<rect x="0" y="${h - 22}" width="${w}" height="22" fill="#1A497D"/><rect x="${w / 2 - 22}" y="${h - 62}" width="44" height="40" fill="#1A497D"/>`;
    return out + '</svg>';
  }

  /* ---------- Mega menus & drawer ---------- */
  function buildMenus() {
    const groups = CLINIC_GROUPS.map((g) => `<div><h3>${g}</h3><ul>${CLINICS.filter((c) => c.group === g).map((c) => `<li><a href="#/clinics/${c.id}">${cname(c).replace(/^Клиника по /, '')}</a></li>`).join('')}</ul></div>`).join('');
    $('#mega-clinics').innerHTML = `<div class="wrap mega__in">
      <div class="mega__aside"><h2>Клиники и центрове</h2><p>${CLINICS.length} структури в работния списък, подредени по вид медицинска дейност.</p>
        <label class="vh" for="mega-q">Търси клиника или специалност</label>
        <div class="mini-search">${ICON.search}<input id="mega-q" type="search" placeholder="Търси клиника или специалност"></div>
        <div id="mega-q-out"></div>
        <a class="mega__all arrow" href="#/clinics">Виж всички клиники </a>
        <a class="mega__all arrow" href="#/where">Къде се намира клиниката? </a></div>
      <div class="mega__grid">${groups}</div></div>`;
    const P = [
      ['Преди посещението', [['Запази час', '#/book'], ['Намери лекар', '#/doctors'], ['Намери клиника', '#/clinics'], ['Как да стигна', '#/contacts'], ['Необходими документи', '#/patients']]],
      ['Прием в болницата', [['Хоспитализация', '#/patients'], ['Прием по НЗОК', '#/patients'], ['Планов прием', '#/patients'], ['Какво да носите', '#/patients'], ['Права на пациента', '#/patients']]],
      ['По време на престоя', [['Посещения', '#/patients'], ['Придружители', '#/patients'], ['Храна', '#/patients'], ['Къде да отида?', '#/where']]],
      ['След изписване', [['Лабораторни резултати', '#/results'], ['Документи', '#/patients'], ['Контролни прегледи', '#/patients'], ['Цени и услуги', '#/patients']]]
    ];
    $('#mega-patients').innerHTML = `<div class="wrap mega__in">
      <div class="mega__aside"><h2>Пациентски център</h2><p>Всичко за посещението, приема и престоя, подредено по това какво трябва да направите.</p>
      <a class="btn btn--primary" href="#/book">Запази час</a><a class="mega__all arrow" href="#/patients">Към Пациентския център </a>
      <a class="mega__all arrow" style="color:var(--alert)" href="#/emergency">Спешна помощ 24/7 </a></div>
      <div class="mega__grid">${P.map(([h, l]) => `<div><h3>${h}</h3><ul>${l.map(([t, u]) => `<li><a href="${u}">${t}</a></li>`).join('')}</ul></div>`).join('')}</div></div>`;

    $('#drawer-nav').innerHTML = `
      <details><summary>Пациенти</summary><ul>${P.flatMap((p) => p[1]).filter((v, i, a) => a.findIndex((x) => x[0] === v[0]) === i).map(([t, u]) => `<li><a href="${u}">${t}</a></li>`).join('')}</ul></details>
      <details><summary>Клиники</summary><ul><li><a href="#/clinics"><b>Всички клиники</b></a></li>${CLINIC_GROUPS.map((g) => `<li><a href="#/clinics#${encodeURIComponent(g)}">${g}</a></li>`).join('')}</ul></details>
      <a href="#/doctors">Лекари</a><a href="#/medicine">Медицина</a><a href="#/science">Наука и обучение</a><a href="#/about">За ИСУЛ</a>
      <a href="#/news">Новини</a><a href="#/careers">Кариера</a><a href="#/contacts">Контакти</a><a href="#/isul90" style="color:var(--gold)">ИСУЛ 90</a>
      <a href="#/book" class="btn btn--primary" style="margin-top:12px;color:#fff;justify-content:center;border:0">Запази час</a>`;

    $('#mega-q').addEventListener('input', (e) => {
      const q = norm(e.target.value);
      const out = $('#mega-q-out');
      if (q.length < 2) { out.innerHTML = ''; return; }
      const hits = CLINICS.filter((c) => norm(c.name).includes(q) || norm(spec(c.spec).name).includes(q)).slice(0, 5);
      out.innerHTML = hits.length ? `<ul style="list-style:none;display:grid;gap:2px">${hits.map((c) => `<li><a href="#/clinics/${c.id}">${c.name}</a></li>`).join('')}</ul>` : '<p class="meta">Няма съвпадение. Опитайте общото търсене.</p>';
    });
  }

  function closeMegas(except) {
    $$('.nav__btn').forEach((b) => { if (b !== except) { b.setAttribute('aria-expanded', 'false'); $('#' + b.getAttribute('aria-controls')).hidden = true; } });
  }
  function bindChrome() {
    $$('.nav__btn').forEach((b) => b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') !== 'true';
      closeMegas(b);
      b.setAttribute('aria-expanded', String(open));
      $('#' + b.getAttribute('aria-controls')).hidden = !open;
    }));
    document.addEventListener('click', (e) => { if (!e.target.closest('.has-mega')) closeMegas(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const open = $('.nav__btn[aria-expanded="true"]');
        closeMegas(); if (open) open.focus();
        closeSearch(); closeDrawer();
      }
      if (e.key === '/' && !e.target.closest('input, textarea, select')) { e.preventDefault(); openSearch(); }
    });
    // compact header
    const hdr = $('#hdr');
    const onScroll = () => hdr.classList.toggle('is-compact', window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    // text size
    const setSize = (n) => {
      document.documentElement.dataset.size = n;
      $$('.textsize button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === n)));
      store.set('isul-size', n);
    };
    $$('.textsize button').forEach((b) => b.addEventListener('click', () => setSize(b.dataset.size)));
    setSize(store.get('isul-size') || '1');
    // drawer
    $('#menu-open').addEventListener('click', openDrawer);
    $('#menu-close').addEventListener('click', closeDrawer);
    $('#drawer').addEventListener('click', (e) => { if (e.target.id === 'drawer' || e.target.closest('a')) closeDrawer(); });
    // search
    $('#search-open').addEventListener('click', openSearch);
    $('#search-close').addEventListener('click', closeSearch);
    $('#search').addEventListener('click', (e) => { if (e.target.id === 'search' || e.target.closest('#search-results a')) closeSearch(); });
    $('#search-input').addEventListener('input', (e) => renderSearch(e.target.value));
    // slogan
    const pick = $('#slogan-pick');
    pick.value = store.get('isul-slogan') || '0';
    pick.addEventListener('change', () => { store.set('isul-slogan', pick.value); const h = $('#hero-title'); if (h) h.innerHTML = SLOGANS[+pick.value].h; });
  }
  let lastFocus = null;
  function openDrawer() { lastFocus = document.activeElement; $('#drawer').hidden = false; $('#menu-open').setAttribute('aria-expanded', 'true'); $('#menu-close').focus(); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { if ($('#drawer').hidden) return; $('#drawer').hidden = true; $('#menu-open').setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  function openSearch() { lastFocus = document.activeElement; closeMegas(); $('#search').hidden = false; document.body.style.overflow = 'hidden'; const i = $('#search-input'); i.focus(); renderSearch(i.value); }
  function closeSearch() { if ($('#search').hidden) return; $('#search').hidden = true; document.body.style.overflow = ''; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }

  /* ---------- Global search ---------- */
  const SERVICES = [
    ['Ядрено-магнитен резонанс (ЯМР)', 'imaging'], ['Компютърна томография (КТ)', 'imaging'], ['Ехография', 'imaging'], ['Рентгенография', 'imaging'],
    ['Горна ендоскопия (гастроскопия)', 'gastro'], ['Колоноскопия', 'gastro'], ['ЕКГ и Холтер мониториране', 'cardiology'], ['Ехокардиография', 'cardiology'],
    ['ЕЕГ', 'neurology'], ['ЕМГ', 'neurology'], ['Аудиометрия', 'ent'], ['Ставно протезиране', 'orthopedics'], ['Артроскопия', 'orthopedics'], ['Химиотерапия', 'oncology']
  ];
  const DOCS_IDX = [['Права и задължения на пациента', '#/patients'], ['Ценоразпис на платените услуги', '#/patients'], ['Необходими документи за хоспитализация', '#/patients'], ['Декларация за информирано съгласие', '#/patients'], ['Обществени поръчки', '#/about']];
  const PHONES_IDX = [['Телефонна централа', PHONE], ['Записване на час (Медицински център)', PHONE_REG], ['Регистратура', PHONE_DESK], ['Спешно отделение', PHONE_EMG]];

  function renderSearch(raw) {
    const q = norm(raw || '');
    const out = $('#search-results');
    if (q.length < 2) {
      out.innerHTML = `<div class="sr-group"><h3>Най-търсени</h3><ul>
        <li><a href="#/book">Запази час</a></li><li><a href="#/results">Лабораторни резултати</a></li><li><a href="#/emergency">Спешна помощ</a></li><li><a href="#/contacts">Как да стигна</a></li></ul></div>
        <div class="sr-group"><h3>Специалности</h3><ul>${SPECIALTIES.slice(0, 4).map((s) => `<li><a href="#/specialties/${s.id}">${s.name}</a></li>`).join('')}</ul></div>`;
      return;
    }
    const hl = (t) => esc(t).replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
    const groups = [];
    const red = RED_FLAGS.some((f) => q.includes(f) || f.includes(q) && q.length > 4);
    const sym = SYMPTOMS.find((s) => s.k.some((k) => q.includes(k)));
    const d = DOCTORS.filter((x) => norm(x.name).includes(q) || norm(spec(x.spec).name).includes(q)).slice(0, 5);
    const c = CLINICS.filter((x) => norm(x.name).includes(q)).slice(0, 5);
    const s = SPECIALTIES.filter((x) => norm(x.name).includes(q) || norm(x.desc).includes(q)).slice(0, 4);
    const sv = SERVICES.filter((x) => norm(x[0]).includes(q)).slice(0, 4);
    const n = NEWS.filter((x) => norm(x.title).includes(q)).slice(0, 3);
    const dd = DOCS_IDX.filter((x) => norm(x[0]).includes(q));
    const ph = PHONES_IDX.filter((x) => norm(x[0]).includes(q) || x[1].label.replace(/\s/g, '').includes(q.replace(/\s/g, '')));
    if (red) groups.push(`<div class="sr-group" style="grid-column:1/-1"><div class="notice notice--alert">${ICON.warn}<div><b>Ако симптомите са внезапни или тежки, обадете се на 112.</b> Не чакайте записан час. <a href="#/emergency">Спешна помощ в ИСУЛ →</a></div></div></div>`);
    if (sym) { const sp = spec(sym.spec); groups.push(`<div class="sr-group"><h3>Насочване по симптом</h3><ul><li><a href="#/specialties/${sp.id}">${sp.name}<small>Препоръчителна специалност. Това не е диагноза.</small></a></li></ul></div>`); }
    if (d.length) groups.push(`<div class="sr-group"><h3>Лекари</h3><ul>${d.map((x) => `<li><a href="#/doctors/${x.slug}">${RANK_TITLE[x.rank]} ${hl(x.name)}<small>${spec(x.spec).name}</small></a></li>`).join('')}</ul></div>`);
    if (c.length) groups.push(`<div class="sr-group"><h3>Клиники</h3><ul>${c.map((x) => `<li><a href="#/clinics/${x.id}">${hl(x.name)}<small>${bld(x)} · вход ${x.e} · етаж ${x.f}</small></a></li>`).join('')}</ul></div>`);
    if (s.length) groups.push(`<div class="sr-group"><h3>Специалности</h3><ul>${s.map((x) => `<li><a href="#/specialties/${x.id}">${hl(x.name)}<small>${esc(x.desc)}</small></a></li>`).join('')}</ul></div>`);
    if (sv.length) groups.push(`<div class="sr-group"><h3>Медицински услуги</h3><ul>${sv.map((x) => `<li><a href="#/specialties/${x[1]}">${hl(x[0])}<small>${spec(x[1]).name}</small></a></li>`).join('')}</ul></div>`);
    if (ph.length) groups.push(`<div class="sr-group"><h3>Телефони</h3><ul>${ph.map((x) => `<li><a href="tel:${x[1].tel}">${hl(x[0])}<small>${x[1].label}</small></a></li>`).join('')}</ul></div>`);
    if (dd.length) groups.push(`<div class="sr-group"><h3>Документи</h3><ul>${dd.map((x) => `<li><a href="${x[1]}">${hl(x[0])}</a></li>`).join('')}</ul></div>`);
    if (n.length) groups.push(`<div class="sr-group"><h3>Новини</h3><ul>${n.map((x) => `<li><a href="#/news">${hl(x.title)}<small>${fmtDate(x.date)}</small></a></li>`).join('')}</ul></div>`);
    out.innerHTML = groups.length ? groups.join('') : `<div class="sr-group"><p>Няма резултати за „${esc(raw)}“. Проверете изписването или се обадете на регистратурата: ${tel(PHONE_REG)}.</p></div>`;
  }

  /* ---------- Discovery (homepage + specialties) ---------- */
  function routeFromProblem(raw) {
    const q = norm(raw);
    if (!q) return '';
    if (RED_FLAGS.some((f) => q.includes(f))) {
      return `<div class="notice notice--alert" role="alert">${ICON.warn}<div><b>Това може да е спешно състояние. Обадете се на 112.</b><br>Не търсете записан час при внезапна гръдна болка, задух, слабост в половината на тялото или затруднен говор. <a href="#/emergency">Спешна помощ в ИСУЛ →</a></div></div>`;
    }
    const m = SYMPTOMS.find((s) => s.k.some((k) => q.includes(k)));
    if (!m) return `<div class="notice">${ICON.info}<div>Не открихме подходящо насочване. Опитайте с други думи или се обадете на регистратурата: ${tel(PHONE_REG)}. Можете да разгледате и <a href="#/medicine">всички специалности</a>.</div></div>`;
    return pathFor(m.spec, true);
  }
  function pathFor(specId, fromProblem) {
    const sp = spec(specId);
    const cl = CLINICS.filter((c) => c.spec === specId);
    const ds = DOCTORS.filter((d) => d.spec === specId);
    return `${fromProblem ? `<div class="notice notice--info">${ICON.info}<div>Насочването е ориентировъчно и <b>не е диагноза</b>. Лекарят ще прецени нужните изследвания.</div></div>` : ''}
      <div class="path" aria-label="Препоръчан път">
        <a class="path__step" href="#/specialties/${sp.id}"><span class="meta">Специалност</span><b>${sp.name}</b><span class="arrow" aria-hidden="true"></span></a>
        ${cl.map((c) => `<a class="path__step" href="#/clinics/${c.id}"><span class="meta">Клиника</span><b>${c.name}</b><span class="arrow" aria-hidden="true"></span></a>`).join('')}
        <a class="path__step" href="#/doctors?spec=${sp.id}"><span class="meta">Специалисти</span><b>${ds.length ? ds.map((d) => RANK_TITLE[d.rank] + ' ' + d.name).slice(0, 2).join(', ') + (ds.length > 2 ? ' и др.' : '') : 'Всички специалисти'}</b><span class="arrow" aria-hidden="true"></span></a>
        <a class="path__step" href="#/book?spec=${sp.id}" style="background:var(--plum-soft)"><span class="meta">Следваща стъпка</span><b>Запази час по ${sp.name.toLowerCase()}</b><span class="arrow" aria-hidden="true"></span></a>
      </div>`;
  }
  function discoveryHTML() {
    return `<div class="tabs" role="tablist" aria-label="Начин на търсене">
        <button class="tab" role="tab" id="t-problem" aria-selected="true" aria-controls="p-disc" data-mode="problem">По медицински проблем</button>
        <button class="tab" role="tab" id="t-spec" aria-selected="false" aria-controls="p-disc" data-mode="spec" tabindex="-1">По специалност</button>
        <button class="tab" role="tab" id="t-clinic" aria-selected="false" aria-controls="p-disc" data-mode="clinic" tabindex="-1">По клиника</button>
        <button class="tab" role="tab" id="t-doc" aria-selected="false" aria-controls="p-disc" data-mode="doc" tabindex="-1">По лекар</button>
      </div>
      <div id="p-disc" role="tabpanel" aria-labelledby="t-problem"></div>`;
  }
  function bindDiscovery(root) {
    const panel = $('#p-disc', root);
    const modes = {
      problem: () => `<label for="disc-q" class="vh">Опишете проблема</label>
        <form class="bigfield" id="disc-form">${ICON.search}<input id="disc-q" placeholder="Опишете с думи, напр. „болки в коляното“" autocomplete="off"><button class="btn btn--primary" type="submit">Насочи ме</button></form>
        <div class="chips" aria-label="Примери">${SYMPTOMS.slice(0, 6).map((s) => `<button type="button" class="chip" data-q="${s.label}">${s.label}</button>`).join('')}</div>
        <div class="disc__out" id="disc-out" aria-live="polite"></div>`,
      spec: () => `<div class="chips">${SPECIALTIES.map((s) => `<button type="button" class="chip" data-spec="${s.id}" aria-pressed="false">${s.name}</button>`).join('')}</div><div class="disc__out" id="disc-out" aria-live="polite"></div>`,
      clinic: () => `<label for="disc-c" class="vh">Име на клиника</label><div class="bigfield">${ICON.search}<input id="disc-c" placeholder="Напр. кардиология, хирургия…" autocomplete="off"></div><div class="disc__out" id="disc-out" aria-live="polite">${CLINICS.slice(0, 5).map(ccard).join('')}</div>`,
      doc: () => `<label for="disc-d" class="vh">Име на лекар</label><div class="bigfield">${ICON.search}<input id="disc-d" placeholder="Име или фамилия на лекар" autocomplete="off"></div><div class="disc__out" id="disc-out" aria-live="polite"></div>`
    };
    const show = (mode) => {
      $$('.tab', root).forEach((t) => { const on = t.dataset.mode === mode; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on) panel.setAttribute('aria-labelledby', t.id); });
      panel.innerHTML = modes[mode]();
      const out = $('#disc-out', panel);
      if (mode === 'problem') {
        const inp = $('#disc-q', panel);
        $('#disc-form', panel).addEventListener('submit', (e) => { e.preventDefault(); out.innerHTML = routeFromProblem(inp.value); });
        $$('.chip', panel).forEach((ch) => ch.addEventListener('click', () => { inp.value = ch.dataset.q; out.innerHTML = routeFromProblem(ch.dataset.q); }));
      }
      if (mode === 'spec') $$('.chip', panel).forEach((ch) => ch.addEventListener('click', () => { $$('.chip', panel).forEach((x) => x.setAttribute('aria-pressed', 'false')); ch.setAttribute('aria-pressed', 'true'); out.innerHTML = pathFor(ch.dataset.spec); }));
      if (mode === 'clinic') $('#disc-c', panel).addEventListener('input', (e) => { const q = norm(e.target.value); const r = CLINICS.filter((c) => norm(c.name).includes(q) || norm(spec(c.spec).name).includes(q)); out.innerHTML = r.length ? `<div class="ccards" style="grid-template-columns:1fr">${r.slice(0, 6).map(ccard).join('')}</div>` : '<p class="meta">Няма съвпадение.</p>'; });
      if (mode === 'doc') $('#disc-d', panel).addEventListener('input', (e) => { const q = norm(e.target.value); const r = q.length > 1 ? DOCTORS.filter((d) => norm(d.name).includes(q)) : []; out.innerHTML = r.length ? `<div class="path">${r.slice(0, 6).map((d) => `<a class="path__step" href="#/doctors/${d.slug}"><span class="meta">${spec(d.spec).name}</span><b>${RANK_TITLE[d.rank]} ${d.name}</b><span class="arrow" aria-hidden="true"></span></a>`).join('')}</div>` : (q.length > 1 ? '<p class="meta">Няма лекар с това име.</p>' : ''); });
    };
    $$('.tab', root).forEach((t, i, all) => {
      t.addEventListener('click', () => show(t.dataset.mode));
      t.addEventListener('keydown', (e) => {
        const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { const n = all[(i + k + all.length) % all.length]; n.focus(); show(n.dataset.mode); }
      });
    });
    show('problem');
  }

  /* ---------- Pages ---------- */
  const pages = {};

  pages.home = () => {
    const sl = SLOGANS[+(store.get('isul-slogan') || 0)] || SLOGANS[0];
    return {
      title: 'УМБАЛ „Царица Йоанна – ИСУЛ“',
      html: `
      <section class="hero" id="hero"><div class="hero__blobs" aria-hidden="true"><i></i><i></i><i></i></div><div class="wrap hero__grid">
          <div class="hero__copy reveal">
            <div class="hero__brand"><img src="assets/brand/crest-gold.png" width="210" height="334" alt=""><span class="eyebrow">Университетска многопрофилна болница<br>за активно лечение · София · от 1936</span></div>
            <h1 id="hero-title">${sl.h}</h1>
            <p class="hero__name">УМБАЛ „Царица Йоанна – ИСУЛ“<span>Клинична база на Медицински университет – София</span></p>
            <div class="hero__cta"><a class="btn btn--light btn--lg" href="#/book">Запази час</a><a class="btn btn--ghost-inv btn--lg" href="#/doctors">Намери лекар</a></div>
          </div>
          <div class="hero__stage" id="hero-stage" aria-label="Тримерна визуализация: ДНК спирала и лекари на ИСУЛ">
            <canvas class="hero__helix" id="helix" aria-hidden="true"></canvas>
            <figure class="hcard hcard--a" data-depth="60">${pic(NEWS[1].img, 'Доц. д-р Георги Георгиев, д.м.н., в коридор на ИСУЛ')}<figcaption>Доц. д-р Георги Георгиев, д.м.н.</figcaption></figure>
            <figure class="hcard hcard--b" data-depth="110">${pic(NEWS[0].img, 'д-р Наталия Боцевска в кабинета')}<figcaption>д-р Наталия Боцевска</figcaption></figure>
            <a class="hcard hcard--fact hero__fact" data-depth="150" href="#/isul90"><span class="meta">Рождена дата</span><b>11.11.1936</b><span>Работническа болница „Царица Йоанна“</span></a>
            <a class="seal hcard--seal" data-depth="90" href="#/isul90" aria-label="90 години ИСУЛ, 1936–2026"><svg class="seal__ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs><text><textPath href="#ring">УМБАЛ „ЦАРИЦА ЙОАННА – ИСУЛ“ · 1936 · 2026 · </textPath></text></svg><div><b>90</b><span>години</span></div></a>
          </div>
      </div></section>
      <div class="quick"><div class="wrap">
        <div class="quick__panel">
          <h2>Как можем да Ви помогнем?</h2>
          <div class="quick__grid">
            <a class="qa qa--primary" href="#/book">${ICON.cal}<b>Запази час</b><small>Онлайн през СуперДок или на ${PHONE_REG.label}</small></a>
            <a class="qa" href="#/results">${ICON.lab}<b>Лабораторни резултати</b><small>Защитен достъп в lab.isul.eu</small></a>
            <a class="qa" href="#/clinics">${ICON.clinic}<b>Клиники и отделения</b><small>${CLINICS.length} клиники, отделения и лаборатории</small></a>
            <a class="qa qa--emg" href="#/emergency">${ICON.amb}<b>Спешно отделение</b><small>Денонощно · ${PHONE_EMG.label}</small></a>
          </div>
          <div class="quick__more">
            <a href="#/doctors">Намери лекар →</a>
            <a href="#/patients">Прием в болница →</a>
            <a href="#/contacts">Как да стигна? →</a>
            <a href="#/science">Клинични изпитвания →</a>
            <a href="#/about" class="is-admin">Конкурси · Търгове · Покани →</a>
          </div>
        </div>
      </div></div>

      <div class="marquee" aria-hidden="true"><div class="marquee__track">${[...SPECIALTIES, ...SPECIALTIES].map((x) => `<span>${x.latin}</span><img src="assets/brand/crest.png" alt="" width="14" height="24">`).join('')}</div></div>

      <section class="sec" aria-labelledby="disc-h"><div class="wrap disc">
        <div style="display:grid;gap:16px">
          <span class="eyebrow">Медицинско насочване</span>
          <h2 id="disc-h">Намерете правилната медицинска помощ</h2>
          <p class="lead">Не е нужно да знаете как е устроена болницата. Опишете проблема с думи или изберете специалност, а ние ще Ви насочим към клиниката и лекарите.</p>
          <p class="meta">Насочването не поставя диагноза. При спешно състояние се обадете на 112.</p>
        </div>
        <div id="discovery">${discoveryHTML()}</div>
      </div></section>

      <section class="sec sec--white" aria-labelledby="nw-h"><div class="wrap">
        <div class="sec__head"><div><span class="eyebrow">Новини</span><h2 id="nw-h">Новини от ИСУЛ</h2></div><a class="btn btn--outline" href="#/news">Всички новини</a></div>
        <div class="news">${NEWS.slice(0, 5).map(ncard).join('')}</div>
      </div></section>

      <section class="sec" aria-labelledby="dir-h"><div class="wrap">
        <div class="sec__head"><div><span class="eyebrow">Медицински направления</span><h2 id="dir-h">${SPECIALTIES.length} направления. Една болница.</h2></div><a class="btn btn--outline" href="#/medicine">Всички специалности</a></div>
        <div class="dirs">${SPECIALTIES.slice(0, 12).map((s, i) => `<a class="dir" href="#/specialties/${s.id}"><span class="latin">${s.latin}</span><div><h3>${s.name}</h3></div><div class="dir__foot"><span class="meta">${CLINICS.filter((c) => c.spec === s.id).length || 1} ${CLINICS.filter((c) => c.spec === s.id).length === 1 ? 'структура' : 'структури'} · ${DOCTORS.filter((d) => d.spec === s.id).length} лекари</span><span class="dir__go" aria-hidden="true">→</span></div><span class="dir__idx meta" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span></a>`).join('')}</div>
      </div></section>

      <section class="sec" aria-labelledby="doc-h"><div class="wrap">
        <div class="sec__head"><div><span class="eyebrow">Нашите специалисти</span><h2 id="doc-h">Лекари, преподаватели, изследователи</h2><p class="lead">Всеки специалист има собствен профил с образование, медицински интереси, научна дейност и начин за записване.</p></div><a class="btn btn--outline" href="#/doctors">Намери лекар</a></div>
        <div class="docs">${DOCTORS.filter((d) => d.head).slice(0, 4).map(dcard).join('')}</div>
      </div></section>

      <section class="sec sec--white" aria-labelledby="hub-h"><div class="wrap">
        <div class="sec__head"><div><span class="eyebrow">Пациентски център</span><h2 id="hub-h">От първия час до изписването</h2></div><a class="btn btn--outline" href="#/patients">Пациентски център</a></div>
        ${hubHTML(true)}
      </div></section>

      <section class="sec sec--ink" aria-labelledby="num-h"><div class="wrap">
        <div class="sec__head"><div><span class="eyebrow" style="color:var(--plum-l)">ИСУЛ в числа</span><h2 id="num-h">Мащаб, който се измерва с хора</h2></div></div>
        ${statsHTML()}
      </div></section>

      <section class="sec" aria-labelledby="kn-h"><div class="wrap">
        <div class="sec__head"><div><span class="eyebrow">Знанието лекува · за пациенти</span><h2 id="kn-h">Медицинска информация, проверена от наши специалисти</h2></div><a class="btn btn--outline" href="#/knowledge">Всички статии</a></div>
        <div class="kgrid">${acard(ARTICLES[0], true)}<div class="alist">${ARTICLES.slice(1).map((a) => acard(a)).join('')}</div></div>
      </div></section>

      <section class="jub sec" aria-labelledby="j-h"><div class="wrap jub__grid">
        <div style="display:grid;gap:18px"><span class="eyebrow eyebrow--gold">ИСУЛ 90 · юбилейна година</span><div class="jub__years" aria-hidden="true">1936<i>—</i>2026</div></div>
        <div style="display:grid;gap:18px;justify-items:start"><h2 id="j-h">90 години медицина. История, която продължава.</h2><p class="lead">Хората, откритията и сградите, които изграждат ИСУЛ. Интерактивна хронология, архив и „90 истории“.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn--primary" href="#/isul90">Разгледай историята</a><a class="btn btn--ghost arrow" href="#/isul90">90 истории </a></div></div>
      </div></section>

      <section class="sec sec--white" aria-labelledby="pp-h"><div class="wrap">
        <div class="sec__head"><div><span class="eyebrow">Хората зад медицината</span><h2 id="pp-h">Истории от коридорите на ИСУЛ</h2></div><a class="btn btn--outline" href="#/isul90">Всички истории</a></div>
        <div class="stories">${STORIES.map((s) => `<a class="story" href="#/isul90">${photo(s.c, 'Портрет в работна среда', 'Фото ИСУЛ')}<blockquote>${s.q}</blockquote><span class="meta">${s.who}</span></a>`).join('')}</div>
      </div></section>

`,
      init: (root) => bindDiscovery($('#discovery', root))
    };
  };

  function statsHTML() {
    const items = [['90', 'години от 11 ноември 1936 г.'], [String(CLINICS.length), 'клиники, отделения и лаборатории днес'], ['1950', 'основан е ИСУЛ, институт за следдипломно обучение на лекари'], ['380', 'легла при откриването през 1938 г.'], ['39', 'катедри през 1971 г.'], ['21 312', 'специализиращи лекари до 1971 г.']];
    return `<div class="stats">${items.map(([v, l]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
      <p class="meta" style="margin-top:18px;color:#C9B9C1">Източник: isul.eu, раздел „История“ и списък на клиниките. Актуалните годишни данни (пациенти, операции, публикации) се добавят от CMS с източник и година.</p>`;
  }

  function hubHTML(compact) {
    const cols = [
      ['01', 'Преди посещението', ['Запази час', 'Намери лекар', 'Намери клиника', 'Как да стигна', 'Паркиране', 'Необходими документи']],
      ['02', 'Прием в болницата', ['Хоспитализация', 'Прием по НЗОК', 'Планов прием', 'Спешен прием', 'Какво да носите', 'Права на пациента']],
      ['03', 'По време на престоя', ['Посещения', 'Придружители', 'Храна', 'Правила', 'Контакти с клиниката']],
      ['04', 'След изписване', ['Документи', 'Контролни прегледи', 'Лабораторни резултати', 'Последващо лечение']]
    ];
    const link = (t) => ({ 'Запази час': '#/book', 'Намери лекар': '#/doctors', 'Намери клиника': '#/clinics', 'Как да стигна': '#/contacts', 'Паркиране': '#/contacts', 'Лабораторни резултати': '#/results', 'Спешен прием': '#/emergency' }[t] || '#/patients');
    return `<div class="hub">${cols.map(([n, h, l]) => `<div class="hub__col"><span class="meta">Етап ${n}</span><h${compact ? 3 : 2}>${h}</h${compact ? 3 : 2}><ul>${l.map((t) => `<li><a href="${link(t)}">${t}</a></li>`).join('')}</ul></div>`).join('')}</div>`;
  }

  pages.doctors = (_, qs) => {
    const sp = qs.get('spec') || '', cl = qs.get('clinic') || '', rk = qs.get('rank') || '', q = qs.get('q') || '';
    return {
      title: 'Намери лекар',
      html: `${phero([['Лекари']], 'Лекари', 'Намери лекар', 'Търсете по име или филтрирайте по специалност, клиника и академична длъжност. Всеки профил има собствен адрес и може да се споделя.')}
      <section class="sec sec--tight"><div class="wrap dirx">
        <form class="filters" id="f" role="search" aria-label="Филтри за лекари">
          <div class="field"><label for="f-q">Име на лекар</label><input class="input" id="f-q" name="q" value="${esc(q)}" placeholder="Напр. Стоянова"></div>
          <div class="field"><label for="f-spec">Специалност</label><select class="select" id="f-spec" name="spec"><option value="">Всички специалности</option>${SPECIALTIES.map((s) => `<option value="${s.id}" ${s.id === sp ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>
          <div class="field"><label for="f-clinic">Клиника</label><select class="select" id="f-clinic" name="clinic"><option value="">Всички клиники</option>${CLINICS.map((c) => `<option value="${c.id}" ${c.id === cl ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
          <div class="field"><label for="f-rank">Академична длъжност</label><select class="select" id="f-rank" name="rank"><option value="">Всички</option>${RANKS.map((r) => `<option ${r === rk ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
          <button type="reset" class="btn btn--ghost" id="f-reset">Изчисти филтрите</button>
        </form>
        <div style="min-width:0"><div class="results-bar"><p id="f-count" aria-live="polite"></p><a class="btn btn--ghost arrow" href="#/book">Не знам кого да избера </a></div>
        <div class="docs" id="f-out" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))"></div></div>
      </div></section>`,
      init: (root) => {
        const f = $('#f', root);
        const run = () => {
          const v = Object.fromEntries(new FormData(f));
          const r = DOCTORS.filter((d) => (!v.q || norm(d.name).includes(norm(v.q))) && (!v.spec || d.spec === v.spec) && (!v.clinic || d.clinic === v.clinic) && (!v.rank || d.rank === v.rank));
          $('#f-count', root).innerHTML = `<b>${r.length}</b> ${r.length === 1 ? 'специалист' : 'специалисти'}`;
          $('#f-out', root).innerHTML = r.length ? r.map(dcard).join('') : `<div class="empty" style="grid-column:1/-1"><b>Няма специалисти по тези критерии.</b><span>Махнете един от филтрите или се обадете на регистратурата: ${tel(PHONE_REG)}</span></div>`;
        };
        f.addEventListener('input', run); f.addEventListener('reset', () => setTimeout(run)); f.addEventListener('submit', (e) => e.preventDefault()); run();
      }
    };
  };

  pages.doctor = ([slug]) => {
    const d = doc(slug); if (!d) return pages.notfound();
    const c = clinic(d.clinic), sp = spec(d.spec);
    const rel = DOCTORS.filter((x) => x.slug !== d.slug && (x.spec === d.spec || x.clinic === d.clinic)).concat(DOCTORS.filter((x) => x.slug !== d.slug)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    const secs = [['about', 'За специалиста'], ['edu', 'Образование'], ['exp', 'Професионален опит'], ['int', 'Медицински интереси'], ['qual', 'Квалификации'], ['sci', 'Научна дейност и публикации'], ['mem', 'Членства'], ['clinic', 'Клиника и записване']];
    return {
      title: fullName(d),
      jsonld: { '@context': 'https://schema.org', '@type': 'Physician', name: fullName(d), medicalSpecialty: sp.name, worksFor: { '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“' } },
      html: `<section class="phero"><div class="wrap">${crumbs([['Лекари', '#/doctors'], [sp.name, '#/doctors?spec=' + sp.id], [d.name]])}
        <div class="prof" style="margin-top:24px">${portrait(d)}
          <div class="prof__body"><span class="eyebrow">${d.rank}${d.head ? ' · Ръководител на клиника' : ''}</span>
            <h1 style="font-size:clamp(2.2rem,1.4rem + 3vw,3.8rem)"><span style="display:block;font-size:.45em;color:var(--muted);font-family:var(--f-label);letter-spacing:.02em;margin-bottom:8px">${RANK_TITLE[d.rank]}</span>${d.name}${d.deg ? `<span style="font-size:.45em;color:var(--muted)">, ${d.deg}</span>` : ''}</h1>
            <p class="lead">${sp.name}. ${c.name}.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn--primary btn--lg" href="#/book?spec=${sp.id}&doc=${d.slug}">Запази час</a><a class="btn btn--outline btn--lg" href="#/clinics/${c.id}">Към клиниката</a></div>
            <dl class="prof__facts"><div><dt>Специалност</dt><dd>${sp.name}</dd></div><div><dt>Клиника</dt><dd>${c.name.replace('Клиника по ', '')}</dd></div><div><dt>Къде</dt><dd>${bld(c)}, етаж ${c.f}</dd></div></dl>
          </div></div></div></section>
      <section class="sec"><div class="wrap layout2">
        <nav class="toc" aria-label="Съдържание на профила"><b>Профил</b>${secs.map(([id, t]) => `<a href="#/doctors/${d.slug}" data-jump="${id}">${t}</a>`).join('')}</nav>
        <div class="blocks">
          <section class="block" id="about"><h2>За специалиста</h2><div class="prose"><p>Примерен текст за профила. Кратко, човешко представяне на специалиста: с какво се занимава, кои пациенти лекува и какъв е подходът му. Текстът се пише от редакционния екип заедно с лекаря, без канцеларски език.</p></div></section>
          <section class="block" id="edu"><h2>Образование</h2><ul class="tl-list"><li><span class="yr">2014</span><span>${d.deg === 'дмн' ? 'Доктор на медицинските науки' : 'Образователна и научна степен „доктор“'}. Медицински университет – София</span></li><li><span class="yr">2008</span><span>Специалност по ${sp.name.toLowerCase()}</span></li><li><span class="yr">2002</span><span>Магистър по медицина. Медицински университет – София</span></li></ul></section>
          <section class="block" id="exp"><h2>Професионален опит</h2><ul class="tl-list"><li><span class="yr">2018 —</span><span>${d.head ? 'Ръководител, ' : ''}${c.name}, УМБАЛ „Царица Йоанна – ИСУЛ“</span></li><li><span class="yr">2008 — 2018</span><span>Лекар, ${c.name}</span></li></ul></section>
          <section class="block" id="int"><h2>Медицински интереси</h2><ul class="tags">${d.interests.map((i) => `<li>${i}</li>`).join('')}</ul></section>
          <section class="block" id="qual"><h2>Квалификации</h2><ul class="feature-list"><li>Примерна квалификация 1</li><li>Примерна квалификация 2</li><li>Сертификат за високоспециализирани дейности</li><li>Международно обучение</li></ul></section>
          <section class="block" id="sci"><h2>Научна дейност и публикации</h2><p class="meta">Публикациите се импортират автоматично (PubMed / ORCID) и се показват като свързан тип съдържание.</p><ol class="pubs"><li>${d.name.split(' ')[1]} ${d.name[0]}., et al. Примерно заглавие на научна публикация. <i>Примерно списание</i>. 2025;12(3):101–109.</li><li>${d.name.split(' ')[1]} ${d.name[0]}., et al. Второ примерно заглавие. <i>Примерно списание</i>. 2023;8:55–61.</li></ol></section>
          <section class="block" id="mem"><h2>Членства</h2><ul class="feature-list"><li>Българско научно дружество (пример)</li><li>Европейско професионално дружество (пример)</li></ul></section>
          <section class="block" id="clinic"><h2>Клиника и записване</h2>
            <div class="split"><div class="contact-card"><h3>${c.name}</h3><dl><div><dt>Записване</dt><dd>${tel(PHONE_REG)}</dd></div><div><dt>Местоположение</dt><dd>${bld(c)} · вход ${c.e} · етаж ${c.f}</dd></div></dl><a class="btn btn--primary" href="#/book?spec=${sp.id}&doc=${d.slug}">Запази час</a></div>
            <div class="notice notice--info">${ICON.info}<div>За преглед по НЗОК е нужно направление за консултация (<b>бл. МЗ-НЗОК № 3</b>) от личния лекар. Без направление прегледът е платен.</div></div></div>
          </section>
        </div></div></section>
      <section class="sec sec--white"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">Свързани специалисти</span><h2>Още лекари в ${sp.name.toLowerCase()}</h2></div></div><div class="docs">${rel.map(dcard).join('')}</div></div></section>`,
      init: (root) => $$('[data-jump]', root).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const t = $('#' + a.dataset.jump, root); t.scrollIntoView({ behavior: 'smooth' }); t.querySelector('h2').setAttribute('tabindex', '-1'); t.querySelector('h2').focus({ preventScroll: true }); }))
    };
  };

  pages.clinics = () => ({
    title: 'Клиники',
    html: `${phero([['Клиники']], 'Медицина', 'Клиники и центрове', 'Подредени по вид медицинска дейност. Всяка клиника има екип, услуги, указания за прием и точно местоположение.', `<label class="vh" for="cl-q">Търси клиника</label><div class="bigfield">${ICON.search}<input id="cl-q" placeholder="Търси клиника или специалност"></div>`)}
      <section class="sec sec--tight"><div class="wrap" id="cl-list">${CLINIC_GROUPS.map((g) => `<div class="cgroup" data-group id="${encodeURIComponent(g)}"><div><h2>${g}</h2><p class="meta">${CLINICS.filter((c) => c.group === g).length} структури</p></div><div class="ccards">${CLINICS.filter((c) => c.group === g).map(ccard).join('')}</div></div>`).join('')}
      <p class="meta" style="margin-top:24px">Работен списък. Структурата и наименованията се потвърждават от ИСУЛ преди разработка.</p></div></section>`,
    init: (root) => $('#cl-q', root).addEventListener('input', (e) => {
      const q = norm(e.target.value);
      $$('.cgroup', root).forEach((g) => { let any = 0; $$('.ccard', g).forEach((a) => { const on = !q || norm(a.textContent).includes(q) || norm(spec(clinic(a.getAttribute('href').split('/').pop()).spec).name).includes(q); a.hidden = !on; any += on; }); g.hidden = !any; });
    })
  });

  pages.clinic = ([id]) => {
    const c = clinic(id); if (!c) return pages.notfound();
    const sp = spec(c.spec);
    const team = DOCTORS.filter((d) => d.clinic === c.id || d.spec === c.spec);
    const head = team.find((d) => d.head) || null;
    const news = NEWS.slice(1, 4);
    return {
      title: c.name,
      jsonld: { '@context': 'https://schema.org', '@type': 'MedicalClinic', name: c.name, medicalSpecialty: sp.name, parentOrganization: { '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“' } },
      html: `<section class="phero"><div class="wrap">${crumbs([['Клиники', '#/clinics'], [c.name]])}
        <div class="phero__grid" style="align-items:start;margin-top:8px">
          <div><span class="eyebrow">${c.group} · <span class="latin" style="text-transform:none;letter-spacing:0">${sp.latin}</span></span><h1>${c.name}</h1>
            <p class="lead">Диагностика и лечение в областта на ${sp.name.toLowerCase()}: ${sp.desc.toLowerCase()} Университетска клиника с преподавателска и научна дейност.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px"><a class="btn btn--primary btn--lg" href="#/book?spec=${sp.id}">Запази час</a><a class="btn btn--outline btn--lg" href="#/where?c=${c.id}">Как да стигна до клиниката</a></div></div>
          <div class="contact-card"><dl>
            ${head ? `<div><dt>Ръководител</dt><dd><a href="#/doctors/${head.slug}" style="font-size:1rem">${fullName(head)}</a></dd></div>` : ''}
            <div><dt>Записване</dt><dd>${tel(PHONE_REG)}</dd></div>
            <div><dt>Местоположение</dt><dd>${bld(c)} · вход ${c.e} · етаж ${c.f}</dd></div>
            <div><dt>Посещения</dt><dd>всеки ден, 15:00–18:00 <span class="tbc">*</span></dd></div></dl></div>
        </div></div></section>
      <section class="sec sec--tight"><div class="wrap">
        <div class="sec__head"><div><span class="eyebrow">За пациента</span><h2>Как да постъпя за лечение?</h2><p class="lead">Стъпките са примерни и се настройват за всяка клиника в CMS.</p></div></div>
        <ol class="steps">
          <li><b>Консултация</b><p>Преглед при специалист от клиниката.</p></li>
          <li><b>Направление и документи</b><p>Направление за хоспитализация (бл. МЗ-НЗОК № 7) и изследвания.</p></li>
          <li class="is-key"><b>Записване</b><p>Определяне на дата за прием по телефона или при консултацията.</p></li>
          <li><b>Прием</b><p>${bld(c)}, вход ${c.e}, етаж ${c.f}. Носете документите си.</p></li>
          <li><b>Лечение</b><p>Диагностика, лечение и наблюдение от екипа.</p></li>
          <li><b>Изписване и проследяване</b><p>Епикриза, контролен преглед, резултати.</p></li>
        </ol>
      </div></section>
      <section class="sec sec--white"><div class="wrap layout2">
        <nav class="toc" aria-label="Съдържание"><b>Клиника</b><a href="#/clinics/${c.id}" data-jump="c-about">За клиниката</a><a href="#/clinics/${c.id}" data-jump="c-act">Медицински дейности</a><a href="#/clinics/${c.id}" data-jump="c-team">Екип</a><a href="#/clinics/${c.id}" data-jump="c-tech">Апаратура</a><a href="#/clinics/${c.id}" data-jump="c-pat">За пациента</a><a href="#/clinics/${c.id}" data-jump="c-news">Новини</a></nav>
        <div class="blocks">
          <section class="block" id="c-about"><h2>За клиниката</h2><div class="split"><div class="prose"><p>Примерно представяне на клиниката: история, профил, брой легла, научна школа. Текстът е кратък и разделен на блокове, без стени от текст и без PDF файлове.</p></div>${photo('photo--a', 'Екипът на клиниката, документална фотография', 'Фото ИСУЛ', 'style="aspect-ratio:4/3;min-height:0"')}</div></section>
          <section class="block" id="c-act"><h2>Медицински дейности</h2><div class="split"><div><h3 style="margin-bottom:10px">Диагностика</h3><ul class="feature-list" style="grid-template-columns:1fr"><li>Примерна диагностична процедура</li><li>Функционални изследвания</li><li>Консултативни прегледи</li></ul></div><div><h3 style="margin-bottom:10px">Лечение</h3><ul class="feature-list" style="grid-template-columns:1fr"><li>Примерна лечебна дейност</li><li>Високоспециализирани процедури</li><li>Клинични пътеки по НЗОК</li></ul></div></div></section>
          <section class="block" id="c-team"><h2>Екип</h2><div class="docs" style="grid-template-columns:repeat(auto-fill,minmax(190px,1fr))">${(team.length ? team : DOCTORS.slice(0, 3)).slice(0, 4).map(dcard).join('')}</div><a class="btn btn--ghost arrow" href="#/doctors?clinic=${c.id}">Целият екип </a></section>
          <section class="block" id="c-tech"><h2>Апаратура и технологии</h2><div class="grid3">${['Примерна апаратура 1', 'Примерна апаратура 2', 'Примерна апаратура 3'].map((t, i) => `<div style="display:grid;gap:10px">${photo(['photo--c', 'photo--e', 'photo--b'][i], 'Апаратура в клиниката', 'Фото ИСУЛ', 'style="aspect-ratio:4/3;min-height:0"')}<b>${t}</b></div>`).join('')}</div></section>
          <section class="block" id="c-pat"><h2>За пациента</h2><div class="acc">
            <details open><summary>Необходими документи при прием</summary><div class="acc__body"><ul><li>Лична карта</li><li>Направление за хоспитализация (бл. МЗ-НЗОК № 7)</li><li>Резултати от изследвания и предишни епикризи</li><li>Списък с лекарствата, които приемате</li></ul></div></details>
            <details><summary>Какво да нося в болницата</summary><div class="acc__body"><p>Лични принадлежности, удобни дрехи и чехли, лекарствата си в оригинална опаковка.</p></div></details>
            <details><summary>Посещения и придружители</summary><div class="acc__body"><p>Примерни правила за посещения. Конкретните часове се въвеждат в CMS за всяка клиника.</p></div></details>
            <details><summary>Платени услуги и избор на екип</summary><div class="acc__body"><p>Връзка към ценоразписа като уеб страница, а не като PDF.</p></div></details>
          </div></section>
          <section class="block" id="c-news"><h2>Новини от клиниката</h2><div class="grid3">${news.map(ncard).join('')}</div></section>
        </div></div></section>
      ${wayBlock(c)}`,
      init: (root) => $$('[data-jump]', root).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); $('#' + a.dataset.jump, root).scrollIntoView({ behavior: 'smooth' }); }))
    };
  };

  /* Campus schematic — illustrative, to be replaced by the real site plan */
  const BLD = { 'А': [70, 70, 230, 120], 'Б': [330, 70, 150, 120], 'В': [70, 230, 170, 130], 'Г': [280, 230, 120, 130], 'Д': [440, 230, 130, 130] };
  const ENT = { '1': [180, 190], '2': [260, 130], '3': [405, 190], '4': [155, 230], '5': [340, 230], '6': [505, 230] };
  function campus(sel) {
    const c = sel ? clinic(sel) : null;
    let s = `<svg class="campus" viewBox="0 0 640 430" role="img" aria-label="Схема на болничния комплекс${c ? `: ${c.name}, корпус ${c.b}, вход ${c.e}` : ''}">`;
    s += `<path class="road" d="M20 210 H620 M30 20 V410"/>`;
    Object.entries(BLD).forEach(([k, [x, y, w, h]]) => { const on = c && c.b === k; s += `<rect class="bld ${on ? 'is-on' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/><text class="bld-lbl ${on ? 'is-on' : ''}" x="${x + 14}" y="${y + 26}">Корпус ${k}</text>`; });
    Object.entries(ENT).forEach(([k, [x, y]]) => { const on = c && c.e === k; s += `<circle cx="${x}" cy="${y}" r="${on ? 13 : 10}" class="ent-n" ${on ? '' : 'opacity=".55"'}/><text x="${x}" y="${y + 4.5}" text-anchor="middle" style="fill:#fff;font-size:12px">${k}</text>`; });
    s += `<rect class="ent" x="586" y="160" width="40" height="34" rx="3"/><text x="606" y="182" text-anchor="middle" style="fill:#fff;font-size:12px">СПЕШ</text><text x="520" y="150" style="font-size:12px">Спешно отделение</text>`;
    s += `<text x="40" y="400">Главен вход · ул. „Бяло море“</text><circle cx="30" cy="410" r="8" fill="#0B7A78"/>`;
    if (c) { const [ex, ey] = ENT[c.e]; s += `<path class="route" d="M30 410 V210 H${ex} V${ey}"/>`; }
    return s + '</svg>';
  }
  function wayBlock(c) {
    return `<section class="sec" aria-labelledby="way-h"><div class="wrap">
      <div class="sec__head"><div><span class="eyebrow">Къде да отида?</span><h2 id="way-h">Как да намеря ${c.name.replace('Клиника по', 'клиниката по')}</h2></div></div>
      <div class="way">${wayCard(c)}<div>${campus(c.id)}<p class="meta" style="margin-top:8px">Схематична карта. Архитектурата позволява замяна с интерактивна карта на комплекса.</p></div></div></div></section>`;
  }
  function wayCard(c) {
    return `<div class="way__card"><div class="way__head"><span class="eyebrow">Местоположение</span><h3>${c.name}</h3></div>
      <dl class="way__facts" style="margin:0"><div><dt>Сграда</dt><dd>${bld(c)}</dd></div><div><dt>Вход</dt><dd>${c.e}</dd></div><div><dt>Етаж</dt><dd>${c.f === '0' ? 'Партер' : c.f === '-1' ? 'Сутерен' : c.f}</dd></div><div><dt>Сектор</dt><dd>${c.s}</dd></div></dl>
      <div class="way__foot"><a class="btn btn--primary" href="${MAPS}" target="_blank" rel="noopener">Отвори маршрут ↗</a><a class="btn btn--ghost arrow" href="#/clinics/${c.id}">Към клиниката </a></div></div>`;
  }

  pages.where = (_, qs) => {
    const sel = qs.get('c') || 'neurology';
    return {
      title: 'Къде да отида?',
      html: `${phero([['Пациенти', '#/patients'], ['Къде да отида?']], 'Болничен указател', 'Къде да отида?', 'Изберете клиника, кабинет или служба. Ще видите сграда, вход, етаж и маршрут от главния вход.')}
      <section class="sec sec--tight"><div class="wrap">
        <div class="field" style="max-width:560px;margin-bottom:28px"><label for="w-sel">Търся</label><select class="select" id="w-sel">${CLINICS.map((c) => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
        <div class="way" id="w-out" aria-live="polite">${wayCard(clinic(sel))}<div>${campus(sel)}</div></div>
        <div class="notice notice--warn" style="margin-top:24px">${ICON.info}<div>Корпусите, входовете и етажите на тази страница са примерни. Те показват модела на данните: всяка клиника в CMS има полета „сграда“, „вход“, „етаж“, „сектор“ и координати.</div></div>
      </div></section>`,
      init: (root) => $('#w-sel', root).addEventListener('change', (e) => { const c = clinic(e.target.value); $('#w-out', root).innerHTML = `${wayCard(c)}<div>${campus(c.id)}</div>`; })
    };
  };

  pages.medicine = () => ({
    title: 'Медицина',
    html: `${phero([['Медицина']], 'Медицина', 'Специалности и медицински направления', 'Започнете от медицинската област. Всяко направление води към клиниките, специалистите и услугите в нея.')}
      <section class="sec sec--tight"><div class="wrap"><div class="dirs">${SPECIALTIES.map((s) => `<a class="dir" href="#/specialties/${s.id}"><span class="latin">${s.latin}</span><div style="display:grid;gap:8px"><h3>${s.name}</h3><p>${s.desc}</p></div><div class="dir__foot"><span class="meta">${DOCTORS.filter((d) => d.spec === s.id).length} лекари</span><span class="dir__go" aria-hidden="true">→</span></div></a>`).join('')}</div></div></section>
      <section class="sec sec--white"><div class="wrap disc"><div style="display:grid;gap:14px"><span class="eyebrow">Не сте сигурни?</span><h2>Опишете проблема</h2><p class="lead">Ще Ви насочим към подходящата специалност.</p></div><div id="discovery">${discoveryHTML()}</div></div></section>`,
    init: (root) => bindDiscovery($('#discovery', root))
  });

  pages.specialty = ([id]) => {
    const s = spec(id); if (!s) return pages.notfound();
    const svcs = SERVICES.filter((x) => x[1] === id);
    return {
      title: s.name,
      html: `${phero([['Медицина', '#/medicine'], [s.name]], `Специалност · <span class="latin" style="text-transform:none;letter-spacing:0">${s.latin}</span>`, s.name, s.desc, `<a class="btn btn--primary btn--lg" href="#/book?spec=${s.id}">Запази час</a>`)}
      <section class="sec sec--tight"><div class="wrap split"><div style="display:grid;gap:16px"><h2>Клиники</h2><div class="ccards" style="grid-template-columns:1fr">${CLINICS.filter((c) => c.spec === id).map(ccard).join('') || '<p class="meta">Няма самостоятелна клиника.</p>'}</div></div>
      <div style="display:grid;gap:16px"><h2>Медицински услуги</h2>${svcs.length ? `<ul class="feature-list" style="grid-template-columns:1fr">${svcs.map((x) => `<li>${x[0]}</li>`).join('')}</ul>` : '<p class="meta">Услугите се добавят като свързан тип съдържание „Medical Service“.</p>'}</div></div></section>
      <section class="sec sec--white"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">Специалисти</span><h2>Лекари по ${s.name.toLowerCase()}</h2></div><a class="btn btn--outline" href="#/doctors?spec=${id}">Всички</a></div><div class="docs">${DOCTORS.filter((d) => d.spec === id).map(dcard).join('') || '<p class="meta">Примерни данни: няма въведени лекари.</p>'}</div></div></section>`
    };
  };

  pages.patients = () => ({
    title: 'Пациентски център',
    html: `${phero([['Пациенти']], 'Пациентски център', 'Всичко за Вашето посещение', 'Подредено по етапи: преди посещението, прием, престой и след изписване.', `<div class="notice notice--alert">${ICON.warn}<div><b>Спешно състояние?</b> Обадете се на 112 или вижте <a href="#/emergency">Спешна помощ</a>.</div></div>`)}
      <section class="sec sec--tight"><div class="wrap">${hubHTML(false)}</div></section>
      <section class="sec sec--white"><div class="wrap split">
        <div style="display:grid;gap:16px"><span class="eyebrow">Прием по НЗОК</span><h2>Какви направления са нужни?</h2><p class="lead">Пациентите най-често питат за това. Отговорът е на уеб страница, а не в PDF файл.</p></div>
        <div class="acc">
          <details open><summary>Преглед при специалист</summary><div class="acc__body"><p>Направление за консултация (<b>бл. МЗ-НЗОК № 3</b>) от личния лекар. Без направление прегледът е платен по ценоразпис.</p></div></details>
          <details><summary>Високоспециализирано изследване (ЯМР, КТ и др.)</summary><div class="acc__body"><p>Направление за медико-диагностична дейност (<b>бл. МЗ-НЗОК № 4</b>) от лекар специалист.</p></div></details>
          <details><summary>Планова хоспитализация</summary><div class="acc__body"><p>Направление за хоспитализация (<b>бл. МЗ-НЗОК № 7</b>), лична карта и медицинска документация. Датата се определя от клиниката.</p></div></details>
          <details><summary>Какво да нося при прием</summary><div class="acc__body"><ul class="checklist"><li>Лична карта</li><li>Направление</li><li>Епикризи и резултати от изследвания</li><li>Списък с лекарствата, които приемате</li><li>Лични принадлежности</li></ul></div></details>
          <details><summary>Права на пациента</summary><div class="acc__body"><p>Права и задължения по Закона за здравето, изписани на ясен език.</p></div></details>
        </div></div></section>`
  });

  pages.book = (_, qs) => {
    const sp = qs.get('spec') || '', dslug = qs.get('doc') || '';
    const step = dslug || (sp && qs.get('any')) ? 3 : sp ? 2 : 1;
    const s = spec(sp), d = doc(dslug);
    const st = (n, t) => `<li ${n === step ? 'aria-current="step"' : ''} class="${n < step ? 'is-done' : ''}"><i>${n < step ? '✓' : n}</i><span>${t}</span></li>`;
    let body = '';
    if (step === 1) {
      body = `<h2 style="margin-bottom:8px">Изберете специалност</h2><p class="lead" style="margin-bottom:24px">Не знаете коя? <a href="#/medicine">Опишете проблема</a> и ще Ви насочим.</p>
        <div class="opts">${SPECIALTIES.map((x) => `<a class="opt" href="#/book?spec=${x.id}" style="text-decoration:none"><b>${x.name}</b><small>${DOCTORS.filter((d) => d.spec === x.id).length} лекари</small></a>`).join('')}</div>`;
    } else if (step === 2) {
      const ds = DOCTORS.filter((x) => x.spec === sp);
      body = `<h2 style="margin-bottom:8px">Изберете лекар</h2><p class="lead" style="margin-bottom:24px">${s.name}. Ако нямате предпочитание, изберете „Първият свободен специалист“.</p>
        <div class="opts"><a class="opt" href="#/book?spec=${sp}&any=1" style="text-decoration:none;background:var(--plum-soft)"><b>Първият свободен специалист</b><small>Най-бърз вариант</small></a>${ds.map((x) => `<a class="opt" href="#/book?spec=${sp}&doc=${x.slug}" style="text-decoration:none"><b>${RANK_TITLE[x.rank]} ${x.name}</b><small>${clinic(x.clinic).name}</small></a>`).join('')}</div>
        <p style="margin-top:24px"><a href="#/book" class="btn btn--ghost">← Смени специалност</a></p>`;
    } else {
      body = `<h2 style="margin-bottom:8px">Как да запазите час</h2><p class="lead" style="margin-bottom:24px">${s.name}${d ? ` · ${fullName(d)}` : ' · първият свободен специалист'}</p>
        <div class="channels">
          <div class="channel channel--main"><span class="badge badge--ok">Онлайн · препоръчително</span><h3>Запазете час през СуперДок</h3><p>Медицинският център „ИСУЛ – Царица Йоанна“ записва часове през платформата СуперДок, както по направление от НЗОК, така и за платен прием.</p><a class="btn btn--primary btn--lg" href="${SUPERDOC_URL}" target="_blank" rel="noopener">Запази час в СуперДок ↗</a><p class="meta">Ще бъдете пренасочени към superdoc.bg. Потърсете „ИСУЛ“ и ${s.name.toLowerCase()}${d ? ` или ${d.name}` : ''}.</p></div>
          <div class="channel"><span class="badge">По телефона</span><h3>Информация и записване</h3><a class="big" href="tel:${PHONE_REG.tel}">${PHONE_REG.label}</a><p class="meta">Медицински център „ИСУЛ – Царица Йоанна“, сградата на бившата поликлиника (днес „Спешна помощ“), II и V етаж.</p></div>
        </div>
        <div class="acc" style="margin-top:28px"><details open><summary>Как се приемат пациентите в Медицинския център</summary><div class="acc__body"><ol style="padding-left:1.2em;display:grid;gap:8px"><li>С направление по НЗОК и предварително записан час през СуперДок.</li><li>Платен прием или със здравноосигурителен фонд, с предварително записан час през СуперДок.</li><li>С направление по НЗОК без записан час: само при свободен час или отказал се пациент, с изчакване.</li><li>Платен прием без записан час: при свободен час в часовете за свободен прием, с изчакване.</li></ol></div></details>
        </div>
        <div class="split" style="margin-top:32px"><div class="contact-card"><h3>Подгответе</h3><ul class="checklist"><li>Направление бл. МЗ-НЗОК № 3 (за преглед по НЗОК)</li><li>Лична карта</li><li>Предишни резултати и епикризи</li></ul></div>
        ${d ? wayCard(clinic(d.clinic)) : wayCard(CLINICS.find((c) => c.spec === sp) || CLINICS[0])}</div>
        <p style="margin-top:24px"><a href="#/book?spec=${sp}" class="btn btn--ghost">← Смени лекар</a></p>`;
    }
    return {
      title: 'Запази час',
      html: `${phero([['Пациенти', '#/patients'], ['Запази час']], 'Записване', 'Запази час', 'Три стъпки: специалност, лекар и начин за записване. Ще видите точно как и къде да запазите час.')}
      <section class="sec sec--tight"><div class="wrap"><ol class="stepper" aria-label="Стъпки за записване">${st(1, s ? s.name : 'Специалност')}${st(2, d ? d.name : step === 3 ? 'Първият свободен' : 'Лекар')}${st(3, 'Начин за записване')}</ol>${body}</div></section>`
    };
  };

  pages.emergency = () => ({
    title: 'Спешна помощ',
    html: `<section class="emg-hero"><div class="wrap emg-hero__grid">
        <div style="display:grid;gap:14px">${crumbs([['Пациенти', '#/patients'], ['Спешна помощ']]).replace('class="crumbs"', 'class="crumbs" style="color:#FFD5D1"').replace(/<a href/g, '<a style="color:#fff" href')}<h1>Спешна помощ</h1><p style="font-size:var(--fs-lead)">Спешното отделение на ИСУЛ работи денонощно, 7 дни в седмицата.</p></div>
        <a class="emg-112" href="tel:112"><span style="color:var(--alert);font-weight:700">При опасност за живота</span><b>112</b><span>Обадете се. Не пътувайте сами при силна гръдна болка, задух или признаци на инсулт.</span></a>
      </div></section>
      <section class="sec sec--tight"><div class="wrap">
        <div class="emg-grid">
          <div class="emg-box"><h2>Къде</h2><p class="big" style="font-size:1.3rem">${ADDRESS}</p><p>Спешното отделение с диагностичен стационар е в сградата на бившата поликлиника.</p><a class="btn btn--alert" href="${MAPS}" target="_blank" rel="noopener">Маршрут до спешното ↗</a></div>
          <div class="emg-box"><h2>Телефон</h2><a class="big" href="tel:${PHONE_EMG.tel}">${PHONE_EMG.label}</a><span class="meta">Спешно отделение · Регистратура ${PHONE_DESK.label}</span><p>При животозастрашаващо състояние първо се обадете на 112.</p></div>
          <div class="emg-box"><h2>Какво да нося</h2><ul class="checklist"><li>Лична карта</li><li>Списък с лекарствата</li><li>Последна епикриза, ако имате</li><li>Телефон за връзка с близък</li></ul></div>
        </div>
      </div></section>
      <section class="sec sec--white"><div class="wrap split">
        <div style="display:grid;gap:16px"><h2>Кога да потърся спешна помощ?</h2><p class="lead">Обадете се на 112 веднага при:</p>
          <ul class="redflags"><li>Силна или притискаща болка в гърдите</li><li>Внезапен задух</li><li>Изкривена уста, слабост в ръка или крак, затруднен говор</li><li>Загуба на съзнание или гърч</li><li>Силно кървене или тежка травма</li><li>Внезапно най-силното главоболие в живота</li></ul>
          <p>При неспешни оплаквания се обърнете към личния си лекар или <a href="#/book">запазете час</a>.</p></div>
        <div>${campus(null)}<p class="meta" style="margin-top:8px">Схема: спешният вход е обозначен в червено. Примерно разположение.</p></div>
      </div></section>`
  });

  pages.results = () => ({
    title: 'Лабораторни резултати',
    html: `${phero([['Пациенти', '#/patients'], ['Лабораторни резултати']], 'Лабораторни резултати', 'Проверете лабораторните си резултати', 'Резултатите се показват в защитената система на лабораторията. Сайтът на ИСУЛ не съхранява и не показва медицински данни.')}
      <section class="sec sec--tight"><div class="wrap split">
        <div class="channel channel--main"><span class="badge badge--ok">Защитена система на ИСУЛ</span><h3>Към портала за резултати</h3><p>Ще бъдете пренасочени към lab.isul.eu. Нужни са данните за достъп от бланката, която получавате при вземане на пробата.</p><a class="btn btn--primary btn--lg" href="${LAB_URL}" target="_blank" rel="noopener">Отвори lab.isul.eu ↗</a><p class="meta">Сайтът на ИСУЛ не съхранява и не показва медицински данни.</p></div>
        <div class="acc"><details open><summary>Къде намирам кода за достъп?</summary><div class="acc__body"><p>На бланката, която получавате при вземане на пробата.</p></div></details><details><summary>Кога са готови резултатите?</summary><div class="acc__body"><p>Срокът зависи от вида на изследването. Примерна информация.</p></div></details><details><summary>Не мога да вляза</summary><div class="acc__body"><p>Обадете се в лабораторията: ${tel(PHONE_REG)}</p></div></details></div>
      </div></section>`
  });

  pages.isul90 = () => ({
    title: '90 години ИСУЛ',
    html: `<section class="jub" style="padding-block:clamp(36px,5vw,72px)"><div class="wrap">${crumbs([['За ИСУЛ', '#/about'], ['90 години ИСУЛ']])}
        <div class="jub__grid" style="margin-top:24px"><div class="jub__years" aria-hidden="true">1936<i>—</i>2026</div>
        <div style="display:grid;gap:16px"><span class="eyebrow eyebrow--gold">ИСУЛ 90</span><h1 style="font-size:clamp(2.2rem,1.4rem + 3vw,3.6rem);color:#3B2C12">90 години медицина. История, която продължава.</h1><p class="lead">Интерактивна хронология, архивни фотографии, ключови личности и „90 истории“ на хората от ИСУЛ.</p></div></div></div></section>
      <nav class="tl-nav" aria-label="Хронология"><div class="wrap"><ol>${TIMELINE.map((t, i) => `<li><a href="#/isul90" data-jump="tl-${i}">${t.y} · ${t.t}</a></li>`).join('')}<li><a href="#/isul90" data-jump="stories90">90 истории</a></li><li><a href="#/isul90" data-jump="future">Бъдещето</a></li></ol></div></nav>
      <section class="sec sec--tight"><div class="wrap timeline">${TIMELINE.map((t, i) => `<article class="tl" id="tl-${i}"><div class="tl__yr">${t.y}</div><div class="tl__body"><div><h3>${t.t}</h3><p>${t.d}</p></div>${t.now ? `<figure class="photo photo--img" style="aspect-ratio:4/3">${pic(NEWS[1].img, 'ИСУЛ днес')}</figure>` : photo(t.c, 'Слот за архивна фотография', 'Архив ИСУЛ')}</div></article>`).join('')}</div></section>
      <section class="sec sec--white" id="stories90"><div class="wrap"><div class="sec__head"><div><span class="eyebrow eyebrow--gold">90 истории за ИСУЛ</span><h2>Лекари, сестри, пациенти, семейства</h2><p class="lead">Мултимедиен проект с кратки текстове, аудио и видео. Всяка история е отделен запис в CMS с филтри по роля и десетилетие.</p></div></div>
        <div class="stories">${STORIES.map((s, i) => `<a class="story" href="#/isul90">${photo(s.c, 'Портрет', `История ${String(i + 1).padStart(2, '0')} / 90`)}<blockquote>${s.q}</blockquote><span class="meta">${s.who}</span></a>`).join('')}</div></div></section>
      <section class="sec" id="future"><div class="wrap split"><div style="display:grid;gap:14px"><span class="eyebrow eyebrow--gold">Бъдещето</span><h2>Какво следва след юбилея</h2></div><div class="prose"><p>Юбилейната система е слой върху основната идентичност: бронзов акцент, двойната година 1936—2026 и печатът „90“. След 2026 г. страницата става част от „История“, печатът изчезва от началната страница с една настройка в CMS, а „90 истории“ продължава като „Хората на ИСУЛ“.</p></div></div></section>`,
    init: (root) => $$('[data-jump]', root).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); $('#' + a.dataset.jump, root).scrollIntoView({ behavior: 'smooth', block: 'start' }); }))
  });

  pages.news = () => ({
    title: 'Новини',
    html: `${phero([['Новини']], 'Новини', 'Новини от ИСУЛ', '')}
      <section class="sec sec--tight"><div class="wrap"><div class="chips" style="margin:0 0 32px">${['Всички', 'Болницата', 'Медицина', 'Наука', 'Пациенти', 'Събития', 'Постижения', 'ИСУЛ 90'].map((c, i) => `<button type="button" class="chip" aria-pressed="${i === 0}" data-cat="${c}">${c}</button>`).join('')}</div><div class="news" id="n-out">${NEWS.map(ncard).join('')}</div></div></section>`,
    init: (root) => $$('[data-cat]', root).forEach((b) => b.addEventListener('click', () => { $$('[data-cat]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); const r = b.dataset.cat === 'Всички' ? NEWS : NEWS.filter((n) => n.cat === b.dataset.cat); $('#n-out', root).innerHTML = r.length ? r.map(ncard).join('') : '<p class="meta">Няма новини в тази категория.</p>'; }))
  });

  pages.knowledge = () => ({
    title: 'Знанието лекува',
    html: `${phero([['Знанието лекува']], 'За пациенти', 'Знанието лекува', 'Медицинска информация, написана ясно и проверена от специалист на ИСУЛ. Всяка статия води към клиниката и лекарите по темата.')}
      <section class="sec sec--tight"><div class="wrap"><div class="chips" style="margin:0 0 32px">${['Заболявания', 'Профилактика', 'Диагностика', 'Лечение', 'Подготовка за изследвания', 'Възстановяване'].map((c) => `<span class="chip">${c}</span>`).join('')}</div>
      <div class="kgrid">${acard(ARTICLES[0], true)}<div class="alist">${ARTICLES.slice(1).map((a) => acard(a)).join('')}</div></div>
      <div class="notice notice--info" style="margin-top:40px">${ICON.info}<div>Всяка статия има задължителни полета: медицински редактор, дата на проверка, свързана клиника, свързани специалисти и свързана услуга.</div></div></div></section>`
  });

  pages.science = () => ({
    title: 'Наука и обучение',
    html: `${phero([['Наука и обучение']], 'Университетска болница', 'Наука, иновации и обучение', 'ИСУЛ е клинична база на Медицински университет – София. Тук се лекува, преподава и изследва.')}
      <section class="sec sec--tight"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">Наука и иновации</span><h2>Научна дейност</h2></div></div>
      <div class="grid4">${['Научни публикации', 'Клинични проучвания', 'Научни проекти', 'Международни партньорства', 'Конференции', 'Иновации', 'Научни постижения', 'Етична комисия'].map((t) => `<a class="panel panel--link" href="#/science"><h3>${t}</h3><span class="arrow meta">Към раздела </span></a>`).join('')}</div></div></section>
      <section class="sec sec--white"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">Образование и обучение</span><h2>За студенти, специализанти и лекари</h2></div></div>
      <div class="grid3">${[['Студенти', 'Клинично обучение и стажове'], ['Специализанти', 'Места за специализация по клиники'], ['Докторанти', 'Докторски програми и научни ръководители'], ['Млади лекари', 'Менторство и първи стъпки'], ['Медицински специалисти', 'Курсове и продължаващо обучение'], ['Курсове', 'Календар на обученията']].map(([t, d]) => `<a class="panel panel--link" href="#/science"><h3>${t}</h3><p class="meta">${d}</p></a>`).join('')}</div></div></section>`
  });

  pages.careers = () => ({
    title: 'Кариера',
    html: `${phero([['Кариера']], 'Кариера в ИСУЛ', 'Работи там, където медицината се развива.', 'Позиции за лекари, специализанти, медицински сестри, други медицински специалисти и администрация.')}
      <section class="sec sec--tight"><div class="wrap"><div class="chips" style="margin:0 0 24px">${['Всички', 'Лекари', 'Специализанти', 'Медицински сестри', 'Други медицински специалисти', 'Администрация', 'Стажове'].map((c, i) => `<button type="button" class="chip" aria-pressed="${i === 0}" data-jt="${c}">${c}</button>`).join('')}</div>
      <div class="jobs" id="j-out"></div><p class="meta" style="margin-top:16px">Примерни обяви. Всяка обява има структурирани данни JobPosting.</p></div></section>`,
    init: (root) => {
      const render = (t) => { const r = t === 'Всички' ? JOBS : JOBS.filter((j) => j.type === t); $('#j-out', root).innerHTML = r.length ? r.map((j) => `<div class="job"><b>${j.t}</b><span class="meta">${j.cl}</span><span class="meta">${j.type}</span><a class="btn btn--outline" href="#/careers">Кандидатствай</a></div>`).join('') : '<p class="meta" style="padding:20px 0">Няма отворени позиции в тази категория.</p>'; };
      $$('[data-jt]', root).forEach((b) => b.addEventListener('click', () => { $$('[data-jt]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); render(b.dataset.jt); })); render('Всички');
    }
  });

  pages.about = () => ({
    title: 'За ИСУЛ',
    html: `${phero([['За ИСУЛ']], 'За ИСУЛ', 'За болницата', 'Университетска многопрофилна болница за активно лечение с история от 1936 г.')}
      <section class="sec sec--tight"><div class="wrap"><div class="grid3">${[['История', '#/isul90'], ['90 години ИСУЛ', '#/isul90'], ['Ръководство', '#/about'], ['Мисия', '#/about'], ['Структура', '#/clinics'], ['Качество и акредитация', '#/about'], ['Партньорства', '#/about'], ['Кариера', '#/careers'], ['Контакти', '#/contacts']].map(([t, u]) => `<a class="panel panel--link" href="${u}"><h3>${t}</h3><span class="arrow meta">Към раздела </span></a>`).join('')}</div></div></section>
      <section class="sec sec--white"><div class="wrap split"><div style="display:grid;gap:12px"><span class="eyebrow eyebrow--muted">Административна информация</span><h2>Документи и прозрачност</h2><p class="lead">Отделена от пациентското съдържание, за да не го претрупва.</p></div>
      <ul class="hub__col" style="padding:0"><li><a href="#/about">Обществени поръчки</a></li><li><a href="#/about">Конкурси</a></li><li><a href="#/about">Документи</a></li><li><a href="#/about">Политики</a></li><li><a href="#/about">Профил на купувача</a></li></ul></div></section>`
  });

  pages.contacts = () => ({
    title: 'Контакти',
    html: `${phero([['Контакти']], 'Контакти', 'Контакти и как да стигнете', ADDRESS, `<a class="btn btn--primary btn--lg" href="${MAPS}" target="_blank" rel="noopener">Маршрут до ИСУЛ ↗</a>`)}
      <section class="sec sec--tight"><div class="wrap"><div class="grid4">
        <div class="contact-card"><dl><div><dt>Телефонна централа</dt><dd>${tel(PHONE)}</dd></div></dl></div>
        <div class="contact-card"><dl><div><dt>Записване на час</dt><dd>${tel(PHONE_REG)}</dd></div></dl><span class="meta">Медицински център · СуперДок</span></div>
        <div class="contact-card"><dl><div><dt>Регистратура</dt><dd>${tel(PHONE_DESK)}</dd></div></dl></div>
        <div class="contact-card" style="border-color:var(--alert)"><dl><div><dt style="color:var(--alert)">Спешно отделение</dt><dd>${tel(PHONE_EMG)}</dd></div></dl></div>
      </div>
      <div class="grid4" style="margin-top:20px"><div class="contact-card"><dl><div><dt>Пресцентър</dt><dd><a href="mailto:pr@isul.eu" style="font-size:1rem">pr@isul.eu</a></dd></div></dl></div><div class="contact-card"><dl><div><dt>Изпълнителен директор</dt><dd><a href="mailto:director@isul.eu" style="font-size:1rem">director@isul.eu</a></dd></div></dl></div><div class="contact-card"><dl><div><dt>Медицински център</dt><dd><a href="mailto:msc_isul@abv.bg" style="font-size:1rem">msc_isul@abv.bg</a></dd></div></dl></div><div class="contact-card"><dl><div><dt>Адрес</dt><dd style="font-size:1rem">${ADDRESS}</dd></div></dl></div></div>
      </div></section>
      <section class="sec sec--white"><div class="wrap split"><div>${campus(null)}</div>
        <div class="acc"><details open><summary>Обществен транспорт</summary><div class="acc__body"><p>Спирки и линии в близост. Данните се попълват и проверяват от ИСУЛ.</p></div></details><details><summary>Паркиране</summary><div class="acc__body"><p>Паркинг за пациенти и за хора с увреждания. Примерна информация.</p></div></details><details><summary>Входове</summary><div class="acc__body"><p>Главен вход, спешен вход и входове на корпусите. Вижте <a href="#/where">Къде да отида?</a></p></div></details><details><summary>Телефони на клиниките</summary><div class="acc__body"><p>Всеки телефон е свързан с клиниката в CMS и се показва и на страницата ѝ.</p></div></details></div></div></section>`
  });

  pages.concept = () => conceptPage();
  pages.notfound = () => ({ title: 'Страницата не е намерена', html: `${phero([['Няма такава страница']], 'Грешка 404', 'Страницата не е намерена', 'Възможно е адресът да е променен. Опитайте търсенето или се върнете към началото.', `<a class="btn btn--primary" href="#/">Към началото</a>`)}` });

  /* ---------- Concept & design system ---------- */
  function conceptPage() {
    const sw = [['--plum', '#9D305C', 'ИСУЛ бордо', 'Цветът на герба. Бранд, основно действие · 7.0:1'], ['--plum-d', '#7B2A4C', 'Бордо тъмно', 'Hero и навигация, както на isul.eu'], ['--plum-soft', '#F8EEF3', 'Бордо светло', 'Фон на основното действие'], ['--ink', '#1A497D', 'ИСУЛ синьо', 'Заглавия и структура · 8.9:1'], ['--ink-2', '#16579D', 'Синьо 2', 'Връзки, hover'], ['--sky', '#EAF0F7', 'Синя мъгла', 'Тихи фонове'], ['--gold', '#85704F', 'Метал от герба', 'Юбилейна система 1936–2026 · 4.8:1'], ['--paper', '#FCFBFB', 'Бяло', 'Фон на страницата'], ['--muted', '#545B6B', 'Вторичен текст', '6.6:1'], ['--alert', '#C62828', 'Спешно', 'Чисто червено, различно от бордото']];
    return {
      title: 'Концепция и дизайн система',
      html: `${phero([['Концепция']], 'Концепция · Modern Academic Healthcare', 'Дигиталният ИСУЛ', 'Концепция, информационна архитектура и дизайн система за новия сайт на УМБАЛ „Царица Йоанна – ИСУЛ“. Страницата е за екипа и възложителя и не е част от публичния сайт.')}
      <section class="sec sec--ink"><div class="wrap"><div class="sec__head"><div><span class="eyebrow" style="color:var(--plum-l)">Идея</span><h2>Медицина + университет + наука + човешка грижа</h2><p class="lead" style="color:#C9D6EA">Сайтът носи авторитета на голяма университетска институция, без да е студен. Структурата е от хартията на научното издание: тънки линии, редакционна типография, латинските имена на специалностите. Бялото пространство е основният материал. Цветът е функционален.</p></div></div>
        <div class="principles">${[['CLARITY OVER DECORATION', 'Всеки декоративен елемент има функция: печатът „90“ води към историята, фасадата е разпознаваем архитектурен знак.'], ['HUMAN OVER CORPORATE', 'Реални портрети и истории. Слотовете за снимки описват точно кадъра, който трябва да се заснеме.'], ['AUTHORITY WITHOUT COLDNESS', 'Литературен сериф за заглавията, топло бяло, тюркоаз за грижата.'], ['MODERN WITHOUT TRENDINESS', 'Без glassmorphism, без градиенти, без огромни заоблени карти. Линии, решетка, типография.'], ['ACCESSIBILITY BY DESIGN', 'Основен текст 18px, контраст AA+, фокус видим навсякъде, без accessibility plugin.'], ['PATIENT FIRST', 'Основните задачи са на 1–2 действия от началната страница.']].map(([h, p]) => `<div><b>${h}</b><p>${p}</p></div>`).join('')}</div></div></section>

      <section class="sec sec--white"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">UX · пациентски задачи</span><h2>Колко действия до целта</h2></div></div>
        <div class="table-wrap"><table><thead><tr><th>Задача на пациента</th><th>Път от началната страница</th><th>Действия</th><th>Също в</th></tr></thead><tbody>
        ${[['Запази час', 'Бързи действия → специалност → лекар → начин', '1 + 2 избора', 'Header CTA, мобилен dock, профил на лекар, клиника'], ['Намери лекар', 'Бързи действия → търсене / филтър', '1', 'Глобално търсене, dock'], ['Намери клиника', 'Бързи действия или мега меню', '1', 'Мега меню с търсене, dock'], ['Насочване по проблем', 'Medical discovery → описание', '1', 'Глобално търсене'], ['Лабораторни резултати', 'Бързи действия → защитен портал', '2', 'Пациентски център'], ['Спешна помощ', 'Utility bar (винаги видим)', '1', 'Мобилно меню, търсене при „гръдна болка“'], ['Къде е клиниката', 'Страница на клиника → указател', '2', 'Мега меню, записване'], ['Контакти / телефон', 'Utility bar / dock', '1', 'Footer']].map((r) => `<tr>${r.map((c, i) => `<td>${i === 0 ? `<b>${c}</b>` : c}</td>`).join('')}</tr>`).join('')}
        </tbody></table></div></div></section>

      <section class="sec"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">Информационна архитектура</span><h2>Sitemap</h2></div></div>
        <div class="tree">${[['Пациенти /patients', 'Запази час, Намери лекар, Намери клиника, Прием, Хоспитализация, НЗОК, Лабораторни резултати, Цени, Права на пациента, Посещения, Спешна помощ, Как да стигна, Къде да отида, FAQ'], ['Медицина /medicine', 'Специалности, Клиники, Медицински услуги, Диагностика, Лаборатории'], ['Лекари /doctors', 'Всички специалисти, По специалност, По клиника, Профил /doctors/{slug}'], ['Наука /science', 'Научна дейност, Публикации, Клинични проучвания, Проекти, Иновации, Конференции'], ['Обучение /education', 'Студенти, Специализанти, Докторанти, Курсове, Стажове'], ['Знанието лекува /knowledge', 'Заболявания, Профилактика, Изследвания, Лечение, Възстановяване'], ['За ИСУЛ /about', 'За ИСУЛ, История, 90 години ИСУЛ, Ръководство, Структура, Качество, Партньорства'], ['Новини /news', 'Болницата, Медицина, Наука, Пациенти, Събития, Постижения, ИСУЛ 90'], ['Кариера /careers', 'Лекари, Специализанти, Сестри, Други специалисти, Администрация, Стажове'], ['Контакти /contacts', 'Централа, Регистратура, Спешно, Клиники, Карта, Транспорт, Паркиране'], ['Административни /admin', 'Обществени поръчки, Конкурси, Документи, Политики']].map(([h, l]) => `<div><b>${h}</b><span>${l}</span></div>`).join('')}</div></div></section>

      <section class="sec sec--white"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">Дизайн система · цвят</span><h2>Палитра</h2><p class="lead">Палитрата е взета от сегашния сайт и герба: бордо #9D305C и синьо #1A497D. Модернизирана е с повече бяло, по-светли нюанси и ясни роли. Металът на герба е запазен за юбилея. Спешното е в чисто червено, за да не се бърка с бордото.</p></div></div>
        <div class="ds-swatches">${sw.map(([t, h, n, u]) => `<div class="sw"><i style="background:${h}"></i><div><b>${n}</b><code>${t} · ${h}</code><span class="meta">${u}</span></div></div>`).join('')}</div></div></section>

      <section class="sec"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">Дизайн система · типография</span><h2>Literata + Sofia Sans</h2><p class="lead">Literata е книжен сериф с академичен характер и пълна кирилица. Sofia Sans е проектиран в България от Ботьо Николов и има българските форми на кирилицата. Semi Condensed е за етикети и метаданни.</p></div></div>
        <div class="typescale">
          <div><span class="meta">H1 · Literata 500 · 82/84</span><span style="font-family:var(--f-display);font-size:clamp(2rem,1rem + 3vw,3.6rem);color:var(--ink);line-height:1">Знание, което лекува</span></div>
          <div><span class="meta">H2 · Literata 500 · 44</span><span style="font-family:var(--f-display);font-size:var(--fs-h2);color:var(--ink);line-height:1.1">Нашите специалисти</span></div>
          <div><span class="meta">H3 · Literata 500 · 26</span><span style="font-family:var(--f-display);font-size:var(--fs-h3);color:var(--ink)">Клиника по нервни болести</span></div>
          <div><span class="meta">Body · Sofia Sans 400 · 18/29</span><span>Основният текст е минимум 18px. Възрастните пациенти не трябва да увеличават страницата, за да я прочетат.</span></div>
          <div><span class="meta">Label · Semi Condensed 600 · 15</span><span class="eyebrow">Медицински направления</span></div>
          <div><span class="meta">Latin · Literata Italic</span><span class="latin" style="font-size:1.1rem">Neurologia · Cardiologia · Chirurgia</span></div>
        </div></div></section>

      <section class="sec sec--white"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">Дизайн система · компоненти</span><h2>Състояния</h2><p class="lead">Всеки компонент има default, hover, focus, active и disabled за desktop, tablet и mobile. Фокусът е жълт пръстен с тъмен контур и се вижда на всеки фон.</p></div></div>
        <div style="display:grid;gap:28px">
          ${[['btn--primary', 'Запази час'], ['btn--outline', 'Всички лекари'], ['btn--plum', 'Насочи ме'], ['btn--alert', 'Маршрут до спешното']].map(([c, t]) => `<div class="states">${['Default', 'Hover', 'Focus', 'Active', 'Disabled'].map((s) => `<div><span class="meta">${s}</span><button type="button" tabindex="-1" class="btn ${c} ${s === 'Hover' ? (c === 'btn--outline' ? '' : 'is-hover') : s === 'Focus' ? 'is-focus' : s === 'Active' ? 'is-active' : ''}" ${s === 'Disabled' ? 'disabled' : ''} ${s === 'Hover' && c === 'btn--outline' ? 'style="background:var(--ink);color:#fff"' : ''}>${t}</button></div>`).join('')}</div>`).join('')}
          <div class="split">
            <div class="field"><label for="ds-1">Поле · default</label><input class="input" id="ds-1" placeholder="Име на лекар"></div>
            <div class="field"><label for="ds-2">Поле · грешка</label><input class="input" id="ds-2" value="0888" aria-invalid="true" aria-describedby="ds-2e"><span class="err" id="ds-2e">Въведете телефон с 10 цифри, напр. 0888 123 456.</span></div>
            <div class="field"><label for="ds-3">Поле · disabled</label><input class="input" id="ds-3" value="Недостъпно" disabled></div>
            <div class="field"><label for="ds-4">Падащо меню</label><select class="select" id="ds-4"><option>Неврология</option></select></div>
          </div>
          <div class="grid3"><div class="notice notice--info">${ICON.info}<div><b>Информация.</b> Насочването не е диагноза.</div></div><div class="notice notice--warn">${ICON.warn}<div><b>Внимание.</b> Променено работно време.</div></div><div class="notice notice--alert">${ICON.warn}<div><b>Спешно.</b> Обадете се на 112.</div></div></div>
          <div class="docs">${dcard(DOCTORS[0])}<div style="display:grid;gap:12px;align-content:start">${ccard(CLINICS[4])}${ccard(CLINICS[5])}</div>${ncard(NEWS[1])}${acard(ARTICLES[1])}</div>
        </div></div></section>

      <section class="sec"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">CMS архитектура</span><h2>Типове съдържание и релации</h2><p class="lead">Всяка информация се въвежда веднъж и се показва навсякъде, където е нужна. Пример: телефонът на клиниката се показва на страницата ѝ, в профила на лекаря, в търсенето и в записването.</p></div></div>
        <div class="table-wrap"><table><thead><tr><th>Тип</th><th>Ключови полета</th><th>Релации</th></tr></thead><tbody>
        ${[['Doctor', 'име, академична длъжност, степен, снимка, био, образование[], опит[], интереси[], квалификации[], членства[], ORCID', 'Clinic (n:1), Specialty (n:m), Publication (1:n), Article (n:m)'], ['Clinic', 'име, група, кратко описание, ръководител, телефони, стъпки за прием[], документи[], посещения', 'Specialty, Doctor, MedicalService, Location, News, Job'], ['Department', 'име, тип (отделение/лаборатория/център)', 'Clinic (n:1)'], ['Specialty', 'име, латинско име, описание, ключови думи за насочване', 'Clinic, Doctor, Symptom'], ['MedicalService', 'име, описание, подготовка, НЗОК / платено, цена', 'Clinic, Specialty, Article'], ['Symptom (насочване)', 'фраза, синоними, red-flag флаг', 'Specialty'], ['Article (Знанието лекува)', 'заглавие, категория, тяло, медицински редактор, дата на проверка', 'Doctor (reviewer), Clinic, MedicalService'], ['News / Event', 'заглавие, категория, дата, галерия', 'Clinic, Doctor'], ['Research / ClinicalTrial', 'заглавие, статус, фаза, критерии, контакт', 'Clinic, Doctor'], ['Job', 'позиция, тип, изисквания, предлагаме, срок', 'Clinic'], ['Document', 'заглавие, тип, файл + HTML версия, дата', 'Clinic, About'], ['Contact / Location', 'телефон, работно време, сграда, вход, етаж, сектор, координати', 'Clinic, Department'], ['HistoricalEvent / Story', 'година, заглавие, текст, архивни медии, личности', 'Doctor (исторически), Clinic'], ['SiteSetting', 'слоган (3 варианта), юбилеен режим вкл./изкл., статистики с източник', '—']].map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}
        </tbody></table></div>
        <p class="meta" style="margin-top:12px">Препоръка: headless CMS (Strapi, Sanity или Payload) + статично генериран front-end (Astro / Next.js SSG) за скорост и сигурност. Изборът зависи от хостинга и екипа на ИСУЛ.</p></div></section>

      <section class="sec sec--white"><div class="wrap split"><div style="display:grid;gap:16px"><span class="eyebrow">SEO</span><h2>Семантични адреси и структурирани данни</h2>
        <div class="table-wrap"><table><tbody>${[['/doctors/', 'Директория'], ['/doctors/elena-stoyanova', 'Physician'], ['/clinics/neurology', 'MedicalClinic'], ['/specialties/neurology', 'MedicalSpecialty'], ['/patients/emergency', 'EmergencyService'], ['/knowledge/insult-priznaci', 'MedicalWebPage, Article'], ['/news/…', 'NewsArticle'], ['/careers/…', 'JobPosting'], ['/en/…', 'hreflang bg/en']].map(([u, t]) => `<tr><td><code>${u}</code></td><td>${t}</td></tr>`).join('')}</tbody></table></div>
        <p class="meta">Slug-овете са на латиница (транслитерация по Закона за транслитерацията). BreadcrumbList и FAQPage на всяка страница, където са приложими.</p></div>
        <div style="display:grid;gap:12px;min-width:0"><span class="meta">Пример: Physician JSON-LD</span><pre class="code">${esc(JSON.stringify({ '@context': 'https://schema.org', '@type': 'Physician', name: 'Проф. д-р Елена Стоянова, дмн', medicalSpecialty: 'Neurologic', image: 'https://isul.eu/media/doctors/elena-stoyanova.webp', worksFor: { '@type': 'Hospital', name: 'УМБАЛ „Царица Йоанна – ИСУЛ“', address: { '@type': 'PostalAddress', streetAddress: 'ул. „Бяло море“ 8', addressLocality: 'София', postalCode: '1527', addressCountry: 'BG' } } }, null, 2))}</pre></div></div></section>

      <section class="sec"><div class="wrap grid3" style="align-items:start">
        <div style="display:grid;gap:14px"><span class="eyebrow">Достъпност · WCAG 2.2 AA</span><h3>Вградена, не добавена</h3><ul class="checklist"><li>Контраст ≥ 4.5:1 за текст, ≥ 3:1 за UI</li><li>Skip link, landmarks, семантичен HTML</li><li>Видим фокус (2.4.11, 2.4.13)</li><li>Цели ≥ 44×44px (2.5.8)</li><li>Клавиатура: табове със стрелки, Esc затваря менюта, „/“ отваря търсене</li><li>Размер на текста A / A+ / A++ + браузърен zoom до 400%</li><li>prefers-reduced-motion</li><li>Ясен език, без съкращения без обяснение</li></ul></div>
        <div style="display:grid;gap:14px"><span class="eyebrow">Performance · Lighthouse 90+</span><h3>Бюджет</h3><ul class="checklist"><li>LCP &lt; 2.0s на 4G, CLS &lt; 0.05, INP &lt; 200ms</li><li>JS &lt; 70KB gzip на страница, без framework за статичните страници</li><li>2 шрифтови семейства, subset кирилица + латиница, font-display: swap</li><li>AVIF/WebP, srcset, lazy loading под сгъвката</li><li>Статично генериране + CDN кеш</li></ul></div>
        <div style="display:grid;gap:14px"><span class="eyebrow">Фотография</span><h3>Shot list за ИСУЛ</h3><ul class="checklist"><li>Портрети на лекарите: еднакъв фон, светлина и кадрировка 4:5</li><li>Екипи в работна среда, документален стил</li><li>Операционни, апаратура, лаборатории</li><li>Архитектурни детайли: фасада, коридори, входове</li><li>Дигитализация на архива: 1936 → днес</li><li>Без stock фотографии като основна идентичност</li></ul></div>
      </div></section>

      <section class="sec sec--white"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">Motion</span><h2>Движение</h2></div></div>
        <div class="grid4">${[['Reveal', 'Hero текстът се появява с 10px издигане. Съдържанието се вижда и без анимация.'], ['Header', 'Header-ът се свива при scroll и utility лентата се скрива.'], ['Hover', 'Направленията се оцветяват в синьо, стрелките се изместват с 3px.'], ['Без', 'Без scroll hijacking, без parallax на текст, без 3D. Всичко се изключва при reduced motion.']].map(([t, d]) => `<div class="panel"><h3>${t}</h3><p class="meta">${d}</p></div>`).join('')}</div></div></section>

      <section class="sec"><div class="wrap split"><div style="display:grid;gap:16px"><span class="eyebrow eyebrow--gold">Нужно от ИСУЛ преди разработка</span><h2>Отворени въпроси</h2></div>
        <ul class="feature-list" style="grid-template-columns:1fr">${['Официален списък на клиники, отделения и центрове', 'Потвърдени статистики с източник и година', 'Телефони, работно време, имейли по структури', 'Съществува ли онлайн записване? Коя система?', 'Доставчик и адрес на портала за лабораторни резултати', 'План на комплекса: сгради, входове, етажи', 'Архив: фотографии и хронология 1936–2026', 'Лого и съществуваща визуална идентичност', 'Достъп до снимачни дни в клиниките', 'Финален слоган (3 варианта в прототипа)'].map((t) => `<li>${t}</li>`).join('')}</ul></div></section>`
    };
  }

  /* ---------- Router ---------- */
  const ROUTES = [
    [/^\/?$/, 'home'], [/^\/doctors\/?$/, 'doctors'], [/^\/doctors\/([\w-]+)$/, 'doctor'], [/^\/clinics\/?$/, 'clinics'], [/^\/clinics\/([\w-]+)$/, 'clinic'],
    [/^\/medicine\/?$/, 'medicine'], [/^\/specialties\/([\w-]+)$/, 'specialty'], [/^\/patients\/?$/, 'patients'], [/^\/book\/?$/, 'book'], [/^\/emergency\/?$/, 'emergency'],
    [/^\/where\/?$/, 'where'], [/^\/results\/?$/, 'results'], [/^\/isul90\/?$/, 'isul90'], [/^\/news\/?$/, 'news'], [/^\/knowledge\/?$/, 'knowledge'],
    [/^\/science\/?$/, 'science'], [/^\/careers\/?$/, 'careers'], [/^\/about\/?$/, 'about'], [/^\/contacts\/?$/, 'contacts'], [/^\/concept\/?$/, 'concept']
  ];
  let first = true;
  function route() {
    const raw = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
    const [pathPart, query = ''] = raw.split('?');
    const path = pathPart.split('#')[0];
    const qs = new URLSearchParams(query);
    let page = pages.notfound(), key = 'notfound';
    for (const [re, k] of ROUTES) { const m = path.match(re); if (m) { page = pages[k](m.slice(1), qs); key = k; break; } }
    const main = $('#main');
    main.innerHTML = page.html;
    document.title = (key === 'home' ? '' : page.title + ' · ') + 'УМБАЛ „Царица Йоанна – ИСУЛ“';
    // structured data per page
    let ld = $('#ld'); if (ld) ld.remove();
    if (page.jsonld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'ld'; ld.textContent = JSON.stringify(page.jsonld); document.head.appendChild(ld); }
    // active nav
    const top = '/' + (path.split('/')[1] || '');
    const map = { '/doctors': '#/doctors', '/medicine': '#/medicine', '/specialties': '#/medicine', '/science': '#/science', '/about': '#/about', '/isul90': '#/about' };
    $$('.nav__link').forEach((a) => { if (a.getAttribute('href') === map[top]) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $$('.dock a').forEach((a) => { if (a.getAttribute('href') === '#' + top) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    closeMegas(); closeSearch(); closeDrawer();
    if (page.init) page.init(main);
    main.classList.remove('pg-in'); void main.offsetWidth; main.classList.add('pg-in');
    document.dispatchEvent(new CustomEvent('isul:render', { detail: { key } }));
    // anchor inside clinics list (#/clinics#Group)
    const anchor = pathPart.split('#')[1];
    if (anchor) { const t = document.getElementById(encodeURIComponent(anchor)); if (t) setTimeout(() => t.scrollIntoView(), 0); }
    else if (!first) { window.scrollTo(0, 0); const h = $('h1', main); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    first = false;
  }

  buildMenus();
  bindChrome();
  window.addEventListener('hashchange', route);
  route();
})();
