/* Синя лента „Клиники“: 3D carousel of clinic cards (official isul.eu photos),
   same card shape as „Медицински направления“, with white extruded 3D type.
   Mounts into every [data-cband] element. */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CARDS = [
    { id: 3, k: 'Клиника по', t: 'Кардиология', img: 'c3' },
    { id: 5, k: 'Клиника по', t: 'Неврология', img: 'c5' },
    { id: 15, k: 'Клиника по', t: 'Хирургия', img: 'c15' },
    { id: 8, k: 'Клиника по', t: 'Образна диагностика', img: 'c8' },
    { id: 10, k: 'Клиника по', t: 'Очни болести', img: 'c10' },
    { id: 12, k: 'Клиника по', t: 'УНГ болести', img: 'c12' },
    { id: 17, k: 'Детска клинична', t: 'Хематология и онкология', img: 'c17' },
    { id: 13, k: 'Физикална и', t: 'Рехабилитация', img: 'c13' },
    { id: 4, k: 'Клиника по', t: 'Медицинска онкология', img: 'c4' },
    { id: 24, k: 'Клинична', t: 'Лаборатория', img: 'c24' },
    { id: 2, k: 'Клиника по', t: 'Гастроентерология', img: 'c2' },
    { id: 18, k: 'Клиника по', t: 'Урология и андрология', img: 'c18' }
  ];
  const inSite = !!document.getElementById('page');            // variant D has the migrated clinic pages
  const href = (id) => (inSite ? '#/clinic/' + id : 'variant-d.html#/clinic/' + id);

  function mount(host) {
    host.innerHTML = `
      <div class="cband__head">
        <div><span class="cband__kick">27 клиники, отделения и лаборатории</span><h2>Клиниките на ИСУЛ</h2></div>
        <div class="cband__ctl"><button type="button" data-c="prev" aria-label="Предишна клиника">←</button><button type="button" data-c="next" aria-label="Следваща клиника">→</button></div>
      </div>
      <div class="cband__stage"><ul class="cband__ring" aria-label="Клиники">
        ${CARDS.map((c) => `<li><a class="ccard3" href="${href(c.id)}"><img src="assets/photos/clinics/${c.img}.jpg" alt="" loading="lazy"><span class="ccard3__shade"></span><span class="ccard3__txt"><small>${c.k}</small><b>${c.t}</b></span><span class="ccard3__go" aria-hidden="true">→</span></a></li>`).join('')}
      </ul></div>
      <a class="cband__all" href="${inSite ? '#/clinics' : 'variant-d.html#/clinics'}">Всички клиники и отделения →</a>`;

    const ring = host.querySelector('.cband__ring'), stage = host.querySelector('.cband__stage');
    const items = Array.from(ring.children), n = items.length, step = 360 / n;
    let R = 0, a = 0, auto = !reduce, drag = null;
    const layout = () => {
      const w = items[0].offsetWidth || 240;
      R = Math.round(w / 2 / Math.tan(Math.PI / n)) + 26;
      items.forEach((li, i) => { li.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)`; });
      set();
    };
    const set = () => {
      ring.style.transform = `translateZ(${-R}px) rotateY(${a}deg)`;
      const front = ((Math.round(-a / step) % n) + n) % n;           // card facing the viewer
      items.forEach((li, i) => li.classList.toggle('is-front', i === front));
    };
    host.querySelector('[data-c="prev"]').addEventListener('click', () => { auto = false; a += step; set(); });
    host.querySelector('[data-c="next"]').addEventListener('click', () => { auto = false; a -= step; set(); });
    stage.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, a, moved: false }; ring.style.transition = 'none'; });
    addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true; a = drag.a + dx * .22; set(); });
    addEventListener('pointerup', () => { if (!drag) return; const moved = drag.moved; drag = null; ring.style.transition = ''; a = Math.round(a / step) * step; set(); if (moved) { auto = false; stage.dataset.dragged = '1'; setTimeout(() => { delete stage.dataset.dragged; }, 60); } });
    stage.addEventListener('click', (e) => { if (e.target.closest('a') && stage.dataset.dragged) e.preventDefault(); }, true);
    stage.addEventListener('mouseenter', () => { host.dataset.hover = '1'; });
    stage.addEventListener('mouseleave', () => { delete host.dataset.hover; });
    setInterval(() => { if (auto && !host.dataset.hover && !document.hidden && innerWidth > 760) { a -= step; set(); } }, 2800);
    new ResizeObserver(layout).observe(stage);
    layout();
  }
  document.querySelectorAll('[data-cband]').forEach(mount);
})();
