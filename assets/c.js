/* ИСУЛ — Вариант C: slider, menus, search, news, clinics, reveals. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const norm = (s) => s.toLowerCase().trim();
  document.documentElement.classList.add('js');

  /* Sticky header shrink + back-to-top */
  const hd = $('#hd'), top = $('#totop');
  const onScroll = () => { hd.classList.toggle('is-scrolled', scrollY > 40); top.classList.toggle('is-on', scrollY > 700); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Mega menu content (real clinic list) */
  $('#mega').innerHTML = `<div class="mega__in">${CLINIC_GROUPS.map((g) => `<div><h3>${g}</h3><ul>${CLINICS.filter((c) => c.group === g).map((c) => `<li><a href="index.html#/clinics/${c.id}">${c.short || c.name}</a></li>`).join('')}</ul></div>`).join('')}</div>`;

  /* Dropdowns: hover on desktop, click/keyboard everywhere */
  const dds = $$('.dd');
  const close = (except) => dds.forEach((d) => { if (d !== except) { d.classList.remove('is-open'); $('button', d).setAttribute('aria-expanded', 'false'); } });
  dds.forEach((d) => {
    const b = $('button', d);
    b.addEventListener('click', (e) => { e.stopPropagation(); const open = !d.classList.contains('is-open'); close(d); d.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open)); });
    if (matchMedia('(hover: hover) and (min-width: 901px)').matches) {
      let t; d.addEventListener('mouseenter', () => { clearTimeout(t); close(d); d.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); });
      d.addEventListener('mouseleave', () => { t = setTimeout(() => { d.classList.remove('is-open'); b.setAttribute('aria-expanded', 'false'); }, 180); });
    }
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.dd')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); toggleSearch(false); } });

  /* Mobile menu */
  const burger = $('#burger'), bar = $('#menu');
  burger.addEventListener('click', () => { const o = !bar.classList.contains('is-open'); bar.classList.toggle('is-open', o); burger.setAttribute('aria-expanded', String(o)); });

  /* Search */
  const sbtn = $('#search-btn'), sform = $('#search'), sq = $('#sq'), sres = $('#sres');
  const toggleSearch = (o) => { sform.hidden = !o; sbtn.setAttribute('aria-expanded', String(o)); if (o) sq.focus(); };
  sbtn.addEventListener('click', () => toggleSearch(sform.hidden));
  sform.addEventListener('submit', (e) => e.preventDefault());
  const PH = [['Телефонна централа', '02 9432 170', '+35929432170'], ['Записване на час', '02 9432 207', '+35929432207'], ['Регистратура', '02 9432 203', '+35929432203'], ['Спешно отделение', '02 9432 637', '+35929432637']];
  sq.addEventListener('input', () => {
    const q = norm(sq.value);
    if (q.length < 2) { sres.innerHTML = ''; return; }
    const c = CLINICS.filter((x) => norm(x.name).includes(q)).slice(0, 6).map((x) => `<a href="index.html#/clinics/${x.id}">${x.short || x.name}<small>Клиника</small></a>`);
    const p = PH.filter((x) => norm(x[0]).includes(q) || x[1].replace(/\s/g, '').includes(q.replace(/\s/g, ''))).map((x) => `<a href="tel:${x[2]}">${x[0]}<small>${x[1]}</small></a>`);
    const n = NEWS.filter((x) => norm(x.title).includes(q)).slice(0, 3).map((x) => `<a href="index.html#/news">${x.title}<small>Новина</small></a>`);
    const all = [...p, ...c, ...n];
    sres.innerHTML = all.length ? all.join('') : `<a href="tel:+35929432170">Няма резултати. Обадете се на централата<small>02 9432 170</small></a>`;
  });

  /* Slider: autoplay with progress, arrows, dots, swipe, pause */
  (function slider() {
    const root = $('#slider'), slides = $$('.slide', root), dots = $('#dots'), pause = $('#pause');
    const DUR = 7000; let i = 0, t0 = performance.now(), paused = reduce, hover = false;
    dots.innerHTML = slides.map((_, k) => `<button type="button" aria-label="Слайд ${k + 1}"></button>`).join('');
    const db = $$('button', dots);
    const go = (k) => {
      slides[i].classList.remove('is-on'); slides[i].setAttribute('aria-hidden', 'true');
      i = (k + slides.length) % slides.length;
      slides[i].classList.add('is-on'); slides[i].removeAttribute('aria-hidden');
      db.forEach((d, j) => { d.setAttribute('aria-current', String(j === i)); d.style.setProperty('--p', '0%'); });
      t0 = performance.now();
    };
    slides.forEach((s, k) => { if (k) s.setAttribute('aria-hidden', 'true'); });
    db.forEach((d, k) => d.addEventListener('click', () => go(k)));
    $('#prev').addEventListener('click', () => go(i - 1));
    $('#next').addEventListener('click', () => go(i + 1));
    const icon = () => { pause.innerHTML = paused ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z" fill="currentColor"/></svg>' : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10"/></svg>'; pause.setAttribute('aria-pressed', String(paused)); pause.setAttribute('aria-label', paused ? 'Пусни слайдера' : 'Пауза на слайдера'); };
    pause.addEventListener('click', () => { paused = !paused; t0 = performance.now(); icon(); });
    root.addEventListener('mouseenter', () => { hover = true; }); root.addEventListener('mouseleave', () => { hover = false; t0 = performance.now() - (parseFloat(db[i].style.getPropertyValue('--p')) || 0) / 100 * DUR; });
    root.addEventListener('focusin', () => { hover = true; }); root.addEventListener('focusout', () => { hover = false; });
    let sx = null;
    root.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') sx = e.clientX; });
    root.addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); sx = null; });
    (function tick(now) {
      requestAnimationFrame(tick);
      if (paused || hover || document.hidden) return;
      const p = Math.min(1, (now - t0) / DUR);
      db[i].style.setProperty('--p', (p * 100) + '%');
      if (p >= 1) go(i + 1);
    })(performance.now());
    go(0); icon();
    window.isulSliderRestart = () => go(0);
  })();

  /* News cards (real items from isul.eu) */
  const fmt = (iso) => iso.split('-').reverse().join('.');
  $('#news').innerHTML = NEWS.map((n) => `<a class="card rv" href="index.html#/news"><div class="card__img"><img src="${n.img}" alt="" loading="lazy" width="765" height="400"></div><div class="card__body"><p class="card__meta"><b>${n.cat === 'Медицина' || n.cat === 'Болницата' ? 'Новини' : n.cat}</b><time datetime="${n.date}">${fmt(n.date)}</time></p><h3>${n.title}</h3><span class="btn btn--line">Виж повече</span></div></a>`).join('');

  /* Clinics with group filter */
  const cf = $('#cfilter'), cl = $('#clist');
  cf.innerHTML = ['Всички', ...CLINIC_GROUPS].map((g, k) => `<button type="button" aria-pressed="${k === 0}" data-g="${g}">${g}</button>`).join('');
  const renderC = (g) => { const r = g === 'Всички' ? CLINICS : CLINICS.filter((c) => c.group === g); cl.innerHTML = r.map((c, k) => `<li style="animation-delay:${Math.min(k, 12) * 30}ms"><a href="index.html#/clinics/${c.id}">${c.short || c.name}</a></li>`).join(''); };
  $$('button', cf).forEach((b) => b.addEventListener('click', () => { $$('button', cf).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); renderC(b.dataset.g); }));
  renderC('Всички');

  /* Reveal on scroll (staggered) */
  $$('.tile, .ttl, .nzok li, .band__in > div, .ft__grid > div').forEach((el) => el.classList.add('rv'));
  $$('.rv').forEach((el) => { const s = Array.from(el.parentElement.children); el.style.setProperty('--d', Math.min(s.indexOf(el), 6) * 90 + 'ms'); });
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const el = e.target; el.classList.add('in'); io.unobserve(el); setTimeout(() => { el.classList.remove('rv', 'in'); el.style.removeProperty('--d'); if (el.classList.contains('ttl')) el.classList.add('in'); }, 1400); } }), { threshold: .1, rootMargin: '0px 0px -5% 0px' });
    $$('.rv').forEach((el) => io.observe(el));
    // the tiles' parent is the <li>; stagger them by their list position instead
    $$('.tile').forEach((t) => { const li = t.parentElement; t.style.setProperty('--d', Array.from(li.parentElement.children).indexOf(li) * 90 + 'ms'); });
  } else $$('.rv').forEach((el) => el.classList.add('in'));
})();
