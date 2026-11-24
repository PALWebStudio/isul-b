/* Вариант E — Клиники и отделения, свързани с анатомичната структура.
   A scanner-style body (horizontal contour rings) sways in the centre;
   each clinic card is tied by an animated line to the organ / system it treats. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = (window.ISUL_CONTENT || { clinics: {} }).clinics;

  const GROUPS = {
    'Хирургични': '#FF8FBE', 'Терапевтични': '#5B9BE0', 'Онкология и рехабилитация': '#E6C99A', 'Диагностика': '#62D0C4',
    'Спешна и интензивна помощ': '#FF6B6B', 'Лаборатории и отделения': '#B79CFF', 'Извънболнична помощ': '#9FE07A'
  };
  /* official clinic id → group, short name, anatomical anchor [x, y, z] (cm, y=0 at the feet, +z front), organ label */
  const MAP = {
    1: ['Спешна и интензивна помощ', 'Анестезиология и интензивно лечение', [-6, 130, 8], 'Дишане и жизнени функции'],
    2: ['Терапевтични', 'Гастроентерология', [4.8, 112, 9.4], 'Стомах и черва'],
    3: ['Терапевтични', 'Кардиология', [4.2, 127, 9.6], 'Сърце'],
    4: ['Онкология и рехабилитация', 'Медицинска онкология', [-9.5, 125, 10], 'Онкологични заболявания'],
    5: ['Терапевтични', 'Неврология', [3, 170, 4], 'Мозък и нервна система'],
    6: ['Хирургични', 'Неврохирургия', [0, 151, -4], 'Гръбначен стълб и мозък'],
    7: ['Терапевтични', 'Нефрология', [6.5, 108, -6], 'Бъбреци'],
    8: ['Диагностика', 'Образна диагностика', null, 'Цялото тяло: КТ, ЯМР, рентген'],
    9: ['Хирургични', 'Ортопедия и травматология', [-7.6, 48, 5.6], 'Стави и кости'],
    10: ['Хирургични', 'Очни болести', [3.6, 163.5, 9.3], 'Очи'],
    11: ['Терапевтични', 'Ендокринология и болести на обмяната', [0.4, 149, 5.6], 'Щитовидна жлеза и обмяна'],
    12: ['Хирургични', 'УНГ болести', [-8.6, 162, 0], 'Ухо, нос и гърло'],
    13: ['Онкология и рехабилитация', 'Физикална и рехабилитационна медицина', [18.5, 140, 3], 'Двигателен апарат'],
    14: ['Терапевтични', 'Хемодиализа', [-6.5, 108, -6], 'Бъбречна недостатъчност'],
    15: ['Хирургични', 'Хирургия', [0.4, 99, 10.2], 'Коремна кухина'],
    16: ['Терапевтични', 'Клинична фармакология и терапия', [-6.5, 115, 9.2], 'Черен дроб и вътрешни болести'],
    17: ['Онкология и рехабилитация', 'Детска клинична хематология и онкология', [8.5, 68, 2.5], 'Костен мозък и кръв при деца'],
    18: ['Хирургични', 'Урология и андрология', [-0.4, 86, 8.6], 'Пикочни пътища и простата'],
    19: ['Извънболнична помощ', 'Диагностично-консултативен блок', [26, 78, 3], 'Консултации по всички специалности'],
    20: ['Спешна и интензивна помощ', 'Спешно отделение', [-0.4, 137, 10.4], 'Спешни състояния'],
    21: ['Лаборатории и отделения', 'Съдебна медицина', [7.5, 4, 6], 'Съдебномедицински експертизи'],
    22: ['Лаборатории и отделения', 'Трансфузионна хематология', [23, 110, 1], 'Кръв и кръвопреливане'],
    23: ['Лаборатории и отделения', 'Вирусология', [6, 133, 8], 'Вирусни инфекции'],
    24: ['Лаборатории и отделения', 'Клинична лаборатория', [-23, 110, 1], 'Кръвни и лабораторни изследвания'],
    25: ['Лаборатории и отделения', 'Микробиология', [-5, 95, 9], 'Бактериални инфекции'],
    26: ['Лаборатории и отделения', 'Обща и клинична патология', [-4, 104, 9], 'Тъканни изследвания'],
    27: ['Извънболнична помощ', 'Медицински център', [-25, 76, 3], 'Прегледи при специалисти']
  };
  const ITEMS = Object.entries(MAP).map(([id, [g, short, p, organ]]) => {
    const c = C[id] || {};
    return { id: +id, g, col: GROUPS[g], short, organ, p, scan: !p, name: c.name || short, phone: (c.phones || [])[0] || '', floor: c.floor || '', c };
  });
  // side: left for x<0 (and the scanner card), right for x>=0; order top→bottom by height on the body
  ITEMS.forEach((it) => { it.side = it.scan ? 'L' : (it.p[0] < 0 ? 'L' : 'R'); it.y = it.scan ? 92 : it.p[1]; });
  const L = ITEMS.filter((i) => i.side === 'L').sort((a, b) => b.y - a.y);
  const R = ITEMS.filter((i) => i.side === 'R').sort((a, b) => b.y - a.y);

  /* ---------- body geometry (same scanner body as the Anatomical navigator) ---------- */
  /* ---------- Geometry: rings ---------- */
  const RINGS = []; const SEG = 30;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (pts, y) => { // [[y, rx, rz], ...] ascending y → cosine-interpolated radii
    for (let i = 0; i < pts.length - 1; i++) {
      const [y0, a0, b0] = pts[i], [y1, a1, b1] = pts[i + 1];
      if (y >= y0 && y <= y1) { const t = (1 - Math.cos(Math.PI * (y - y0) / (y1 - y0))) / 2; return [lerp(a0, a1, t), lerp(b0, b1, t)]; }
    }
    return null;
  };
  function vertical(pts, cx = 0, cz = 0, step = 2.4) {
    for (let y = pts[0][0]; y <= pts[pts.length - 1][0] + .01; y += step) {
      const [rx, rz] = smooth(pts, y);
      const ring = []; for (let k = 0; k < SEG; k++) { const a = k / SEG * Math.PI * 2; ring.push([cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz]); }
      RINGS.push({ pts: ring, c: [cx, y, cz] });
    }
  }
  function limb(A, B, r, step = 2.6) { // r(t) → radius; rings perpendicular to the limb axis
    const d = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], L = Math.hypot(...d), n = d.map((v) => v / L);
    let u = Math.abs(n[1]) < .9 ? [0, 1, 0] : [1, 0, 0];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
    const e1 = norm(cross(n, u)), e2 = cross(n, e1);
    for (let s = 0; s <= L + .01; s += step) {
      const t = s / L, rr = r(t), c = A.map((v, i) => v + d[i] * t);
      const ring = []; for (let k = 0; k < SEG; k++) { const a = k / SEG * Math.PI * 2, ca = Math.cos(a) * rr, sa = Math.sin(a) * rr; ring.push([c[0] + e1[0] * ca + e2[0] * sa, c[1] + e1[1] * ca + e2[1] * sa, c[2] + e1[2] * ca + e2[2] * sa]); }
      RINGS.push({ pts: ring, c });
    }
  }
  // head (ellipsoid with a slightly narrower jaw)
  vertical([[153.5, 5.2, 6.2], [156, 7.4, 8.6], [160, 8.6, 9.8], [165, 9.2, 10.4], [170, 8.8, 10], [174, 7.2, 8.2], [177, 4.2, 5], [178.4, 1.2, 1.4]]);
  vertical([[145.5, 5.6, 5.4], [153, 5.2, 5.4]], 0, -.5);                          // neck
  vertical([[82, 15.2, 9.6], [90, 16.6, 10.4], [100, 14.6, 9.4], [108, 13.6, 9.2], [118, 15, 10.2], [128, 16.6, 11.2], [137, 18.2, 10.4], [142.5, 17.4, 9], [145.5, 10.5, 6.6]]); // torso
  [-1, 1].forEach((sx) => {
    limb([sx * 8.6, 84, 0], [sx * 7.6, 48, .6], (t) => lerp(7.9, 5.2, t) + Math.sin(t * Math.PI) * .6);           // thigh
    limb([sx * 7.6, 48, .6], [sx * 7, 9, -1], (t) => lerp(5, 3.1, t) + Math.sin(Math.min(1, t * 2.2) * Math.PI) * .9); // calf
    limb([sx * 7, 6, -2.5], [sx * 8, 2.2, 12], (t) => lerp(3.4, 2.2, t), 2.2);                                     // foot
    limb([sx * 18.4, 139, 0], [sx * 23, 110, -1], (t) => lerp(4.7, 3.6, t) + Math.sin(t * Math.PI) * .4);         // upper arm
    limb([sx * 23, 110, -1], [sx * 25.6, 84, 2], (t) => lerp(3.6, 2.5, t) + Math.sin(Math.min(1, t * 2) * Math.PI) * .5); // forearm
    limb([sx * 25.6, 83, 2], [sx * 26.6, 73, 3], (t) => lerp(2.6, 1.6, t) + Math.sin(t * Math.PI) * .7, 2);       // hand
  });

  // shared with the mini model on the variant X homepage (x-anm.js); the rest of this file needs the variant E page
  window.ISUL_ATLAS = { GROUPS, ITEMS, RINGS, SEG };
  if (!$('#atlas')) return;

  /* ---------- cards ---------- */
  const card = (it) => `<li><button type="button" class="ec" data-id="${it.id}" style="--c:${it.col}"><span class="ec__bar"></span><span><b>${it.short}</b><small><em>${it.organ}</em>${it.phone ? ' · ' + it.phone.split(/ и |;|,/)[0].trim() : ''}</small></span></button></li>`;
  $('#colL').innerHTML = L.map(card).join(''); $('#colR').innerHTML = R.map(card).join('');
  const atlas = $('#atlas'), cards = Array.from(document.querySelectorAll('.ec'));
  const byId = (id) => ITEMS.find((i) => i.id === +id);

  /* ---------- filters ---------- */
  const chips = $('#echips');
  chips.innerHTML = ['Всички', ...Object.keys(GROUPS)].map((g, i) => `<button type="button" aria-pressed="${i === 0}" data-g="${g}" style="--c:${GROUPS[g] || '#fff'}">${i ? '<i></i>' : ''}${g}</button>`).join('');
  let fGroup = 'Всички', fText = '';
  const applyFilter = () => cards.forEach((b) => { const it = byId(b.dataset.id); const hay = (it.name + ' ' + it.short + ' ' + it.organ + ' ' + it.g).toLowerCase(); b.classList.toggle('is-off', (fGroup !== 'Всички' && it.g !== fGroup) || (fText && !hay.includes(fText))); });
  chips.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; fGroup = b.dataset.g; chips.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); applyFilter(); });
  $('#eq').addEventListener('input', (e) => { fText = e.target.value.trim().toLowerCase(); applyFilter(); });

  /* ---------- hover state ---------- */
  let hot = null;   // set of ids
  const setHot = (ids) => { hot = ids && ids.length ? new Set(ids.map(Number)) : null; atlas.classList.toggle('has-hot', !!hot); cards.forEach((b) => b.classList.toggle('is-hot', !!hot && hot.has(+b.dataset.id))); };
  cards.forEach((b) => {
    b.addEventListener('mouseenter', () => setHot([b.dataset.id])); b.addEventListener('focus', () => setHot([b.dataset.id]));
    b.addEventListener('mouseleave', () => setHot(null)); b.addEventListener('blur', () => setHot(null));
    b.addEventListener('click', () => openDrawer(byId(b.dataset.id)));
  });

  /* ---------- canvas ---------- */
  const cv = $('#ecv'), ctx = cv.getContext('2d'), mid = document.querySelector('.atlas__mid'), tip = $('#etip');
  let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), anchors = [], t = 0, visible = true, mouse = null, pts = [];
  const wide = () => innerWidth > 1100;
  function measure() {
    const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const a = atlas.getBoundingClientRect();
    anchors = cards.map((b) => { const q = b.getBoundingClientRect(), L = b.closest('.atlas__col--l'); return { id: +b.dataset.id, x: (L ? q.right : q.left) - a.left, y: q.top + q.height / 2 - a.top, L: !!L }; });
  }
  new ResizeObserver(measure).observe(atlas); addEventListener('resize', measure);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(atlas);

  const proj = (p, yaw, s, cx0, cy0) => {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), x = p[0], y = p[1] - 92, z = p[2];
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, f = 420 / (420 - z1);
    return [cx0 + x1 * s * f, cy0 - y * s * f, z1];
  };
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    t += reduce ? 0 : 1 / 60;
    ctx.clearRect(0, 0, W, H);
    // body area: the centre column on desktop, the whole viewport on small screens (faded background)
    let bx, by, bh;
    if (wide()) { const a = atlas.getBoundingClientRect(), m = mid.getBoundingClientRect(); bx = m.left - a.left + m.width / 2; by = H / 2 + 6; bh = Math.min(H - 60, 900); }
    else { bx = W / 2; by = H / 2; bh = H * .9; }
    const s = Math.min(bh / 186, (wide() ? mid.getBoundingClientRect().width : W) * .9 / 64), yaw = reduce ? 0 : Math.sin(t * .35) * .42;
    const scanY = 92 + Math.sin(t * .7) * 86;
    const hotPts = hot ? ITEMS.filter((i) => hot.has(i.id)) : [];
    const back = new Path2D(), front = new Path2D(), glow = new Path2D(), scan = new Path2D();
    for (const r of RINGS) {
      const P = r.pts.map((p) => proj(p, yaw, s, bx, by));
      let g = false;
      for (const h of hotPts) { const hy = h.scan ? scanY : h.p[1]; if (Math.abs(r.c[1] - hy) < (h.scan ? 1.4 : 6.5) && (h.scan || Math.abs(r.c[0] - h.p[0]) < 13)) { g = true; break; } }
      const sc = Math.abs(r.c[1] - scanY) < 1.4;
      for (let k = 0; k < SEG; k++) { const a = P[k], b = P[(k + 1) % SEG], path = g ? glow : sc ? scan : (a[2] + b[2]) / 2 > 0 ? front : back; path.moveTo(a[0], a[1]); path.lineTo(b[0], b[1]); }
    }
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(91,155,224,.14)'; ctx.stroke(back);
    ctx.strokeStyle = 'rgba(160,200,245,.55)'; ctx.stroke(front);
    ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(98,208,196,.95)'; ctx.stroke(scan);
    ctx.lineWidth = 1.8; ctx.strokeStyle = '#FF8FBE'; ctx.shadowColor = 'rgba(255,120,180,.9)'; ctx.shadowBlur = 10; ctx.stroke(glow); ctx.shadowBlur = 0;

    // organ points + connectors
    pts = ITEMS.map((it) => { const p = it.scan ? [-15.5, scanY, 0] : it.p; const [x, y, z] = proj(p, yaw, s, bx, by); return { it, x, y, z }; });
    const pulse = reduce ? .5 : (Math.sin(t * 3) + 1) / 2;
    if (wide()) {
      const visibleIds = new Set(cards.filter((b) => !b.classList.contains('is-off')).map((b) => +b.dataset.id));
      ctx.lineCap = 'round';
      for (const a of anchors) {
        if (!visibleIds.has(a.id)) continue;
        const p = pts.find((q) => q.it.id === a.id), on = hot && hot.has(a.id), dim = hot && !on;
        const sx = a.x + (a.L ? 8 : -8), dx = (p.x - sx) * .5;
        ctx.beginPath(); ctx.moveTo(sx, a.y); ctx.bezierCurveTo(sx + dx, a.y, p.x - dx * .6, p.y, p.x, p.y);
        ctx.strokeStyle = p.it.col; ctx.globalAlpha = on ? 1 : dim ? .08 : .32; ctx.lineWidth = on ? 2.4 : 1.1;
        ctx.setLineDash(on ? [] : [3, 6]); ctx.lineDashOffset = reduce ? 0 : -t * 22; ctx.stroke(); ctx.setLineDash([]);
        if (on && !reduce) {   // travelling pulse along the line
          const u = (t * .8) % 1, bez = (q0, q1, q2, q3) => (1 - u) ** 3 * q0 + 3 * (1 - u) ** 2 * u * q1 + 3 * (1 - u) * u * u * q2 + u ** 3 * q3;
          ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bez(sx, sx + dx, p.x - dx * .6, p.x), bez(a.y, a.y, p.y, p.y), 3.2, 0, 7); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(sx, a.y, on ? 4 : 2.6, 0, 7); ctx.fillStyle = p.it.col; ctx.globalAlpha = dim ? .2 : 1; ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    for (const p of pts) {
      const on = hot && hot.has(p.it.id), dim = hot && !on, r = on ? 6.5 : 4;
      ctx.globalAlpha = dim ? .25 : p.z < -2 ? .5 : 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, r + 4 + pulse * (on ? 9 : 5), 0, 7); ctx.strokeStyle = p.it.col; ctx.lineWidth = 1.3; ctx.globalAlpha *= on ? .9 - pulse * .6 : .45 - pulse * .35; ctx.stroke();
      ctx.globalAlpha = dim ? .25 : 1; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fillStyle = on ? '#fff' : p.it.col; ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  measure(); frame();

  /* hover / click on organ points (desktop) */
  atlas.addEventListener('mousemove', (e) => {
    if (!wide() || e.target.closest('.ec')) return;
    const a = atlas.getBoundingClientRect(), mx = e.clientX - a.left, my = e.clientY - a.top;
    const near = pts.filter((p) => Math.hypot(p.x - mx, p.y - my) < 14);
    if (near.length) {
      // points that share the same organ (e.g. both kidney clinics) light up together
      const ids = pts.filter((p) => Math.hypot(p.x - near[0].x, p.y - near[0].y) < 14).map((p) => p.it.id);
      setHot(ids); atlas.style.cursor = 'pointer';
      const m = mid.getBoundingClientRect(); tip.hidden = false; tip.textContent = near[0].it.organ; tip.style.left = (near[0].x - (m.left - a.left)) + 'px'; tip.style.top = near[0].y + 'px';
    } else if (atlas.style.cursor) { setHot(null); atlas.style.cursor = ''; tip.hidden = true; }
  });
  atlas.addEventListener('mouseleave', () => { setHot(null); tip.hidden = true; atlas.style.cursor = ''; });
  atlas.addEventListener('click', (e) => {
    if (e.target.closest('.ec') || !wide()) return;
    const a = atlas.getBoundingClientRect(), p = pts.find((q) => Math.hypot(q.x - (e.clientX - a.left), q.y - (e.clientY - a.top)) < 14);
    if (p) openDrawer(p.it);
  });

  /* ---------- drawer ---------- */
  const drawer = $('#drawer'), drbody = $('#drbody');
  let lastFocus = null;
  function openDrawer(it) {
    const c = it.c, D = (window.E_CLINIC_HREF || 'variant-d.html#/clinic/') + it.id;
    lastFocus = document.activeElement;
    drbody.innerHTML = `<div class="dr-img">${c.hero ? `<img src="${c.hero}" alt="">` : ''}</div>
      <div class="dr-body" style="--c:${it.col}"><p class="dr-k">${it.g}</p><h2 id="dr-h">${it.name}</h2>
      <span class="dr-organ"><i></i>${it.organ}</span>
      <div class="dr-ct">${(c.phones || []).map((p) => `<a href="tel:+359${p.replace(/\D/g, '').replace(/^0/, '').slice(0, 9)}"><span>Телефон</span>${p}</a>`).join('')}${(c.emails || []).map((m) => `<a href="mailto:${m}"><span>Имейл</span>${m}</a>`).join('')}${c.floor ? `<div><span>Местоположение</span>${c.floor}</div>` : ''}</div>
      <div class="dr-links"><a class="is-main" href="${D}">Към клиниката →</a><a href="${D}/team">Екип</a><a href="${D}/patient">За пациента</a><a href="variant-d.html#/book">Как да се прегледам</a></div></div>`;
    drawer.hidden = false; $('#drx').focus();
  }
  const close = () => { drawer.hidden = true; if (lastFocus) lastFocus.focus(); };
  $('#drx').addEventListener('click', close);
  drawer.addEventListener('click', (e) => { if (e.target === drawer) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) close(); });
})();
