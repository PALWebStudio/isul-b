/* Variant X homepage: „Открийте своя специалист“ (doctor finder) + „Новини и истории от ИСУЛ“.
   Data: the people index built in site.js (window.ISUL_PP, from the migrated isul.eu clinic teams)
   and the migrated isul.eu news with the Press centre rubrics (window.ISUL_RUBRIC). Nothing is duplicated here. */
(function () {
  'use strict';
  const PP = window.ISUL_PP, C = window.ISUL_CONTENT, RB = window.ISUL_RUBRIC;
  const root = document.querySelector('.dnx'); if (!root || !PP || !C) return;
  const $ = (s, el = root) => el.querySelector(s);
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fold = PP.fold, lat = (s) => PP.slugify(s).replace(/-/g, ' ');
  const RANK = (t) => /проф/i.test(t) ? 0 : /доц/i.test(t) ? 1 : /гл/i.test(t) ? 2 : /ас/i.test(t) ? 3 : 4;
  const clinicShort = (c) => c.name.replace(/^Клиника по /, '').replace(/^(.)/, (m) => m.toUpperCase())
    .replace(' за лечение на метаболитни заболявания', '').replace(' с извършване на специфична дейност по андрология', ' и андрология');
  const specOf = (c) => /^Клиника по /.test(c.name) ? clinicShort(c) : c.name.replace(/[„”"].*$/, '').trim();
  const ini = (d) => (d.first[0] + d.last[0]).toUpperCase();
  const drUrl = (d) => '#/lekar/' + d.slug;

  /* ---------- Doctor index for the finder ---------- */
  const unitName = {}; PP.units.forEach((u) => { unitName[u.slug] = u.name; });
  const IX = PP.list.map((d) => {
    const cs = d.clinics.map((i) => C.clinics[i]).filter(Boolean);
    const txt = [d.name, d.role, ...cs.map((c) => c.name), ...d.units.map((u) => unitName[u] || '')].join(' ');
    return { d, c: cs[0], name: ' ' + fold(d.core), lname: ' ' + lat(d.core), hay: ' ' + fold(txt), lhay: ' ' + lat(txt) };
  }).filter((x) => x.c);
  const order = (a, b) => (b.d.head - a.d.head) || (!!b.d.img - !!a.d.img) || (RANK(a.d.title) - RANK(b.d.title)) || fold(a.d.core).localeCompare(fold(b.d.core), 'bg');
  // titles, degrees and filler words are ignored, so „д-р Петров“ and „петров“ find the same doctor
  const STOP = /^(д-?р|др|dr|проф|prof|доц|doc|гл|ас|дм|дмн|клиника|отделение|по|на|и)$/;
  const toks = (q) => fold(q).replace(/[.,;:()„“"'–—-]/g, ' ').split(/\s+/).filter((t) => t && !STOP.test(t));
  function search(q) {
    const ts = toks(q); if (!ts.length) return [];
    return IX.map((x) => {
      let s = 0;
      for (const t of ts) {
        const L = /[a-z]/.test(t), hay = L ? x.lhay : x.hay, nm = L ? x.lname : x.name;
        if (!hay.includes(t)) return null;
        s += nm.includes(' ' + t) ? 4 : nm.includes(t) ? 3 : hay.includes(' ' + t) ? 2 : 1;
      }
      return { x, s };
    }).filter(Boolean).sort((a, b) => (b.s - a.s) || order(a.x, b.x)).map((r) => r.x);
  }

  /* Quick specialties: grouped clinics, shown only when the clinic has doctors in the index */
  const SPECS = [
    ['Кардиология', [3]], ['Хирургия', [15]], ['Неврология', [5]], ['Ортопедия', [9]], ['Онкология', [4, 17], 'онкология'],
    ['Образна диагностика', [8]], ['Гастроентерология', [2]], ['Очни болести', [10]], ['УНГ', [12]]
  ].map(([t, ids, q]) => {
    const list = IX.filter((x) => x.d.clinics.some((c) => ids.includes(c))).sort(order);
    // „Виж всички“ opens the Team page with the same filter: doctors only, by clinic (or by word for grouped clinics)
    return { t, ids, list, all: ids.length === 1 ? '#/doctors?k=doc&c=' + ids[0] : '#/doctors?k=doc&q=' + encodeURIComponent(q), key: fold(t + ' ' + ids.map((i) => C.clinics[i].name).join(' ')) };
  }).filter((s) => s.list.length);
  const specFor = (q) => { const ts = toks(q); return ts.length ? SPECS.filter((s) => ts.every((t) => s.key.includes(t))) : []; };

  /* ---------- Markup pieces ---------- */
  const portrait = (d, cls) => d.img ? `<img src="${esc(d.img)}" alt="" loading="lazy" decoding="async">` : `<span class="${cls}" aria-hidden="true">${ini(d)}</span>`;
  const big = (x) => `<article class="hs__big">
      <a class="hs__ph nwm" href="${drUrl(x.d)}" tabindex="-1" aria-hidden="true">${portrait(x.d, 'hs__ini')}</a>
      <div class="hs__bt"><p class="hs__spec">${esc(specOf(x.c))}</p><h4><a href="${drUrl(x.d)}">${esc(x.d.name)}</a></h4><p class="hs__cl">${esc(x.c.name)}</p>
        <div class="hs__act"><a class="hbtn" href="${drUrl(x.d)}" aria-label="Виж профила на ${esc(x.d.name)}">Виж профила</a><a class="hbtn hbtn--o" href="#/book">Запази час</a></div></div>
    </article>`;
  const small = (x) => `<a class="hs__sm" href="${drUrl(x.d)}"><span class="hs__ph">${portrait(x.d, 'hs__ini')}</span>
      <span class="hs__st"><small>${esc(specOf(x.c))}</small><b>${esc(x.d.name)}</b><em>${esc(x.c.name)}</em><span class="hs__go">Виж профила <span aria-hidden="true">→</span></span></span></a>`;
  const row = (x) => `<li><a class="hr__row" href="${drUrl(x.d)}"><span class="hr__av">${portrait(x.d, 'hr__ini')}</span>
      <span class="hr__t"><b>${esc(x.d.name)}</b><small><span>${esc(specOf(x.c))}</span><span>${esc(x.c.name)}</span></small></span><span class="hr__go" aria-hidden="true">Профил →</span></a></li>`;

  /* Featured: specialists with a portrait who appear in ISUL's own news, heads and professors first */
  const FEAT = IX.filter((x) => x.d.img && x.d.press && x.d.press.length)
    .sort((a, b) => (b.d.press.length - a.d.press.length) || order(a, b));
  IX.filter((x) => x.d.img && x.d.head && !FEAT.includes(x)).sort(order).forEach((x) => FEAT.push(x));

  const out = $('#hf-out'), st = $('#hf-st'), q = $('#hf-q'), sug = $('#hf-sug'), chips = $('#hf-chips'), clr = $('.hf__x');
  // the full placeholder does not fit next to the button on a phone
  const ph = matchMedia('(max-width: 440px)'), setPh = () => { q.placeholder = ph.matches ? 'Лекар или специалност…' : 'Име на лекар или специалност…'; };
  setPh(); ph.addEventListener('change', setPh);
  const animate = () => { if (reduce) return; out.classList.remove('dnx-in'); void out.offsetWidth; out.classList.add('dnx-in'); };
  function featured() {
    out.innerHTML = `<div class="hs"><h3 class="dnx__h3">Нашите специалисти</h3><div class="hs__grid">${big(FEAT[0])}<div class="hs__pair">${FEAT.slice(1, 3).map(small).join('')}</div></div></div>`;
    st.textContent = '';
    animate();
  }
  function results(list, label, all) {
    const n = list.length, word = n === 1 ? 'лекар' : 'лекари';
    out.innerHTML = `<div class="hr"><div class="hr__head"><h3 class="dnx__h3">${n ? `${n} ${word}` : 'Няма резултати'} · <span>${esc(label)}</span></h3><button type="button" class="hr__back" data-reset>Нашите специалисти</button></div>
      ${n ? `<ul class="hr__list">${list.slice(0, 6).map(row).join('')}</ul><a class="hr__more" href="${all}">Виж всички резултати${n > 6 ? ` (${n})` : ''} <span aria-hidden="true">→</span></a>`
        : `<div class="hr__none"><p><b>Не намерихме лекар за „${esc(label)}“.</b></p><p>Проверете изписването, потърсете по фамилия или изберете специалност от бутоните по-горе.</p><button type="button" class="hbtn" data-reset>Ново търсене</button></div>`}</div>`;
    st.textContent = n ? `Намерени ${n} ${word} за ${label}.` : `Няма намерени лекари за ${label}.`;
    animate();
  }
  const setChip = (s) => chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(!!s && b.dataset.s === s.t)));
  const reset = (focus) => { setChip(null); q.value = ''; clr.hidden = true; closeSug(); featured(); if (focus) q.focus(); };
  const runQuery = (v) => {
    v = v.trim(); closeSug(); if (!v) return reset();
    const sp = specFor(v); setChip(null);
    // a query that is exactly a specialty („кардиология“) lists that specialty in its order
    if (sp.length === 1 && toks(v).length && fold(sp[0].t).startsWith(toks(v).join(' '))) { setChip(sp[0]); return results(sp[0].list, sp[0].t, sp[0].all); }
    results(search(v), v, '#/doctors?k=doc&q=' + encodeURIComponent(v));
  };

  chips.innerHTML = SPECS.map((s) => `<button type="button" aria-pressed="false" data-s="${esc(s.t)}">${esc(s.t)}<span>${s.list.length}</span></button>`).join('');
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.getAttribute('aria-pressed') === 'true') return reset();
    const s = SPECS.find((x) => x.t === b.dataset.s); q.value = ''; clr.hidden = true; closeSug();
    setChip(s); results(s.list, s.t, s.all);
  });
  out.addEventListener('click', (e) => { if (e.target.closest('[data-reset]')) reset(true); });

  /* ---------- Suggestions (ARIA combobox) ---------- */
  let opts = [], act = -1;
  function closeSug() { sug.hidden = true; sug.innerHTML = ''; q.setAttribute('aria-expanded', 'false'); q.removeAttribute('aria-activedescendant'); opts = []; act = -1; }
  function openSug(v) {
    const ts = toks(v); if (!ts.length || v.trim().length < 2) return closeSug();
    const sp = specFor(v).slice(0, 2), ds = search(v).slice(0, 5);
    opts = sp.map((s) => ({ k: 's', s })).concat(ds.map((x) => ({ k: 'd', x })));
    if (!opts.length) { sug.innerHTML = '<li class="hf__none" role="presentation">Няма съвпадения. Натиснете „Търси“ за всички резултати.</li>'; sug.hidden = false; q.setAttribute('aria-expanded', 'true'); return; }
    sug.innerHTML = opts.map((o, i) => o.k === 's'
      ? `<li id="hf-o${i}" role="option" aria-selected="false" data-i="${i}" class="hf__o hf__o--s"><span class="hf__oi" aria-hidden="true">+</span><span><b>${esc(o.s.t)}</b><small>Специалност · ${o.s.list.length} ${o.s.list.length === 1 ? 'лекар' : 'лекари'}</small></span></li>`
      : `<li id="hf-o${i}" role="option" aria-selected="false" data-i="${i}" class="hf__o"><span class="hf__oa">${portrait(o.x.d, 'hf__oini')}</span><span><b>${esc(o.x.d.name)}</b><small>${esc(specOf(o.x.c))}</small></span></li>`).join('');
    sug.hidden = false; q.setAttribute('aria-expanded', 'true'); act = -1;
  }
  const move = (i) => { act = (i + opts.length) % opts.length; sug.querySelectorAll('[role="option"]').forEach((li, k) => li.setAttribute('aria-selected', String(k === act))); q.setAttribute('aria-activedescendant', 'hf-o' + act); const li = sug.children[act]; if (li) li.scrollIntoView({ block: 'nearest' }); };
  const pick = (o) => {
    if (o.k === 's') { q.value = ''; clr.hidden = true; closeSug(); setChip(o.s); results(o.s.list, o.s.t, o.s.all); return; }
    closeSug(); location.hash = drUrl(o.x.d);   // explicit choice of a person opens the profile
  };
  let tm = 0;
  q.addEventListener('input', () => { clr.hidden = !q.value; clearTimeout(tm); tm = setTimeout(() => openSug(q.value), 90); });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && opts.length) { e.preventDefault(); if (sug.hidden) openSug(q.value); move(act + 1); }
    else if (e.key === 'ArrowUp' && opts.length) { e.preventDefault(); move(act - 1); }
    else if (e.key === 'Enter' && act >= 0 && opts[act]) { e.preventDefault(); pick(opts[act]); }
    else if (e.key === 'Escape') { if (!sug.hidden) { e.preventDefault(); closeSug(); } else if (q.value) reset(); }
  });
  sug.addEventListener('mousedown', (e) => e.preventDefault());   // keep focus in the field while choosing
  sug.addEventListener('click', (e) => { const li = e.target.closest('[data-i]'); if (li) pick(opts[+li.dataset.i]); });
  q.addEventListener('blur', () => setTimeout(closeSug, 120));
  $('#hf').addEventListener('submit', (e) => { e.preventDefault(); runQuery(q.value); });
  clr.addEventListener('click', () => reset(true));
  featured();

  /* ---------- News and stories ---------- */
  const nb = $('#hn-body'), tabs = $('#hn-tabs'), nall = $('#hn-all'), nst = $('#hn-st');
  const iso = (d) => d.split('.').reverse().join('-');
  const exOf = (n) => { const p = ((n.blocks || []).find((b) => b.t === 'p' && (b.x || '').length > 60) || {}).x || ''; return p.length > 200 ? p.slice(0, 200).replace(/\s+\S*$/, '') + '…' : p; };
  const NEWS = C.news.map((n) => ({ ...n, r: RB ? RB.of(n) : 'news', iso: iso(n.date), img: 'assets/photos/news-c/' + n.id + '.jpg', ex: exOf(n) }))
    .sort((a, b) => b.iso.localeCompare(a.iso));
  const NAMES = (RB && RB.names) || { news: 'Новини' };
  const meta = (n) => `<span class="hn__meta"><span class="hn__rb">${esc(NAMES[n.r] || 'Новини')}</span><time datetime="${n.iso}">${esc(n.date)}</time></span>`;
  const lead = (n) => `<a class="hn__lead" href="#/news/${n.id}"><span class="hn__img nwm"><img src="${esc(n.img)}" alt="" loading="lazy" decoding="async"></span>
      <span class="hn__lt">${meta(n)}<h3>${esc(n.title)}</h3>${n.ex ? `<p>${esc(n.ex)}</p>` : ''}<span class="hn__read">Прочети <span aria-hidden="true">→</span></span></span></a>`;
  // small cards in the shape of variant B's „Медицински направления“: gold day number, display-font title, rubric at the foot
  const card = (n) => `<li><a class="hn__card" href="#/news/${n.id}"><span class="hn__cimg nwm"><img src="${esc(n.img)}" alt="" loading="lazy" decoding="async"></span>
      <span class="hn__ct"><time class="hn__n" datetime="${n.iso}">${esc(n.date.slice(0, 2))}<small>${esc(n.date.slice(2))}</small></time><h3>${esc(n.title)}</h3><span class="hn__crb">${esc(NAMES[n.r] || 'Новини')}</span></span></a></li>`;
  const KEYS = ['all'].concat(['interviews', 'patients', 'achievements', 'news'].filter((k) => NEWS.some((n) => n.r === k)));
  tabs.innerHTML = KEYS.map((k, i) => `<button type="button" aria-pressed="${i === 0}" data-k="${k}">${k === 'all' ? 'Всички' : esc(NAMES[k])}</button>`).join('');
  function news(k) {
    const list = k === 'all' ? NEWS : NEWS.filter((n) => n.r === k);
    nb.innerHTML = list.length ? `${lead(list[0])}${list.length > 1 ? `<ul class="hn__cards">${list.slice(1, 7).map(card).join('')}</ul>` : ''}` : '<p class="hn__empty">Още няма публикации в тази рубрика.</p>';
    nall.setAttribute('href', k === 'all' ? '#/news' : '#/news?r=' + k);
    nst.textContent = k === 'all' ? '' : `Показани са новини от рубрика ${NAMES[k]}.`;
    if (!reduce) { nb.classList.remove('dnx-in'); void nb.offsetWidth; nb.classList.add('dnx-in'); }
  }
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || b.getAttribute('aria-pressed') === 'true') return;
    tabs.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); news(b.dataset.k);
  });
  news('all');
})();
