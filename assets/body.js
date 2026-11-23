/* Анатомичен навигатор
   A procedural "scanner slice" human body (horizontal contour rings),
   rendered in 3D on canvas, with organ hotspots linked to ISUL clinics.
   Units ≈ cm, y = 0 at the feet, +z = front of the body. */
(function () {
  'use strict';

  /* Markup shared by body.html and the C / D sites (#/navigator). */
  const TEMPLATE = (opts) => `
  <section class="bm__grid ${opts.wrap || 'wrap'}" aria-label="Анатомична карта">
    <div class="stage" data-a="stage">
      <canvas data-a="canvas" aria-hidden="true"></canvas>
      <div class="stage__tip" data-a="tip" hidden></div>
      <div class="stage__ctl" role="group" aria-label="Изглед">
        <button type="button" data-a="vfront" aria-pressed="true">Отпред</button>
        <button type="button" data-a="vback" aria-pressed="false">Отзад</button>
        <button type="button" data-a="vspin" aria-pressed="true" aria-label="Спри въртенето">❚❚</button>
      </div>
      <div class="stage__extra" role="group" aria-label="Без точка на тялото"><button type="button" data-x="child">Дете</button><button type="button" data-x="urgent" class="is-urgent">Спешно</button></div>
      <p class="stage__hint" aria-hidden="true">Завъртете с мишката · изберете светеща точка</p>
      <div class="selbar" data-a="selbar" hidden><span data-a="selname"></span><button type="button" data-a="selgo">Клиники ↓</button></div>
    </div>
    <aside class="panel" data-a="panel" aria-live="polite">
      <div class="panel__empty" data-a="pempty">
        <h2>Изберете зона</h2>
        <p>Посочете светеща точка върху тялото ${opts.compact ? 'или отворете навигатора на цял екран за пълния списък със зони' : 'или изберете от списъка отдолу'}.</p>
        <div class="warn112"><b>Внезапна силна болка в гърдите, задух, изкривена уста или слабост в ръка или крак?</b> Обадете се веднага на <a href="tel:112">112</a>. Спешно отделение на ИСУЛ: <a href="tel:+35929432203">02 9432 203</a>.</div>
      </div>
      <div class="panel__body" data-a="pbody" hidden></div>
    </aside>
  </section>
  <section class="${opts.wrap || 'wrap'} zones" aria-label="Всички зони">
    <h2>Всички зони</h2>
    <ul class="zones__list" data-a="zones"></ul>
    <p class="disclaimer">Насочването е ориентировъчно и <b>не поставя диагноза</b>. Лекарят ще прецени нужните изследвания. При спешно състояние се обадете на 112.</p>
  </section>`;

  function mount(root, opts = {}) {
  root.innerHTML = TEMPLATE(opts);
  root.classList.add('anav');
  const $ = (s) => root.querySelector(s);
  const linkClinic = opts.clinicHref || ((id) => 'index.html#/clinics/' + id);
  const linkBook = opts.bookHref || ((sp) => 'index.html#/book?spec=' + sp);
  const linkDocs = opts.docsHref || ((sp) => 'index.html#/doctors?spec=' + sp);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clinic = (id) => CLINICS.find((c) => c.id === id);
  const spec = (id) => SPECIALTIES.find((s) => s.id === id);

  /* ---------- Organs / zones → ISUL clinics (data.js) ---------- */
  /* investigations per zone → sub-pages of the imaging clinic and other units ("clinic/unit") */
  const T = { ct: ['8/unit/kompyutarna-tomografia', 'Компютърна томография (скенер)'], mr: ['8/unit/magniten-rezonans', 'Магнитен резонанс (ЯМР)'], mammo: ['8/unit/mamografia', 'Мамография'], xray: ['8/unit/rentgenografia', 'Рентгенография'], echo: ['8/unit/ehografia', 'Ехография'], lab: ['24', 'Кръвни изследвания (Клинична лаборатория)'], cochlear: ['12/unit/kohlearna-implantacia', 'Изследване на слуха'], uro: ['18/unit/funkcionalen-kabinet', 'Уродинамика и цистоскопия'], breastc: ['15/unit/rak-na-gardata', 'Център за рак на гърдата'], ldr: ['18/unit/nizkodozova-brahiterapia', 'Брахитерапия на простатата'] };
  const TESTS = { brain: ['mr', 'ct'], eyes: [], ent: ['cochlear', 'ct'], thyroid: ['echo', 'lab'], shoulder: ['xray', 'mr'], heart: ['ct', 'lab'], breast: ['mammo', 'mr', 'echo', 'breastc'], blood: ['lab'], liver: ['echo', 'mr', 'lab'], stomach: ['ct', 'mr', 'xray'], abdomen: ['echo', 'ct'], spine: ['mr', 'ct', 'xray'], kidneys: ['echo', 'ct', 'lab'], bladder: ['uro', 'echo', 'ldr'], hip: ['xray', 'mr'], lungs: ['ct', 'xray'], elbow: ['xray', 'mr'], skin: ['echo'], metabolism: ['lab', 'echo'], joints: ['xray', 'mr', 'lab'], knee: ['mr', 'xray'], ankle: ['xray', 'mr'], urgent: ['ct', 'xray', 'lab'], child: ['lab', 'cochlear'] };
  const linkUnit = opts.unitHref || ((u) => 'variant-d.html#/clinic/' + u);
  const ZONES = [
    { id: 'brain', name: 'Мозък и нервна система', latin: 'Cerebrum', pos: [0, 169, 1], specs: ['neurology', 'neurosurgery'], clinics: ['neurology', 'neurosurgery'],
      sym: ['Главоболие', 'Световъртеж', 'Изтръпване', 'Епилепсия', 'Нарушения на паметта'], red: 'Изкривена уста, слабост в ръка или крак, затруднен говор: може да е инсулт. Обадете се на 112.' },
    { id: 'eyes', name: 'Очи', latin: 'Oculus', pos: [3.6, 163.5, 9.3], mirror: true, specs: ['ophthalmology'], clinics: ['ophthalmology'],
      sym: ['Замъглено зрение', 'Изкривяване на образите', 'Катаракта', 'Глаукома', 'Макулна дегенерация'] },
    { id: 'ent', name: 'Ухо, нос и гърло', latin: 'Otorhinolarynx', pos: [0, 156.5, 9.6], specs: ['ent'], clinics: ['ent'],
      sym: ['Болки в гърлото', 'Намален слух', 'Синузит', 'Хъркане', 'Дрезгав глас'] },
    { id: 'thyroid', name: 'Щитовидна жлеза', latin: 'Glandula thyroidea', pos: [0, 149, 5.6], specs: ['endocrinology'], clinics: ['endocrinology'],
      sym: ['Умора', 'Промени в теглото', 'Сърцебиене', 'Възли в шията', 'Захарен диабет'] },
    { id: 'shoulder', name: 'Рамо', latin: 'Articulatio humeri', pos: [-18.5, 140, 3], mirror: true, specs: ['orthopedics', 'rehab'], clinics: ['orthopedics', 'rehab'],
      sym: ['Болка при движение', 'Скованост', 'Травма', 'Изкълчване'] },
    { id: 'heart', name: 'Сърце', latin: 'Cor', pos: [4.2, 127, 9.6], specs: ['cardiology'], clinics: ['cardiology', 'icu'],
      sym: ['Сърцебиене', 'Задух при усилие', 'Високо кръвно', 'Отоци на краката', 'Ритъмни нарушения'], red: 'Силна или притискаща болка в гърдите, внезапен задух: обадете се на 112.' },
    { id: 'breast', name: 'Гърда', latin: 'Mamma', pos: [-9.5, 128, 10.5], mirror: true, specs: ['oncology', 'surgery'], clinics: ['oncology', 'surgery'],
      sym: ['Уплътнение', 'Профилактичен преглед', 'Промяна в кожата', 'Програма „Сила“'] },
    { id: 'blood', name: 'Кръв и изследвания', latin: 'Sanguis', pos: [23, 110, 3.2], specs: ['lab'], clinics: ['clinical-lab', 'transfusion', 'microbiology', 'virology', 'pathology', 'ped-onco'],
      sym: ['Кръвни изследвания', 'Анемия', 'Кръвопреливане', 'Детска хематология'], lab: true },
    { id: 'liver', name: 'Черен дроб и жлъчка', latin: 'Hepar', pos: [-6.5, 115, 9.2], specs: ['gastro', 'surgery'], clinics: ['gastro', 'surgery'],
      sym: ['Жълтеница', 'Хепатит', 'Жлъчни камъни', 'Тежест под ребрата'] },
    { id: 'stomach', name: 'Стомах и черва', latin: 'Gaster', pos: [4.8, 112, 9.4], specs: ['gastro'], clinics: ['gastro'],
      sym: ['Киселини', 'Болки в корема', 'Подуване', 'Нарушено храносмилане', 'Ендоскопия'] },
    { id: 'abdomen', name: 'Коремна хирургия', latin: 'Abdomen', pos: [0, 99, 10.2], specs: ['surgery'], clinics: ['surgery'],
      sym: ['Херния', 'Апендицит', 'Жлъчни камъни', 'Планова операция'] },
    { id: 'spine', name: 'Гръбначен стълб', latin: 'Columna vertebralis', pos: [0, 120, -10.2], specs: ['neurosurgery', 'rehab'], clinics: ['neurosurgery', 'rehab'],
      sym: ['Болки в кръста', 'Дискова херния', 'Изтръпване на крайниците', 'Болки във врата'] },
    { id: 'kidneys', name: 'Бъбреци', latin: 'Ren', pos: [6.2, 108, -8.6], mirror: true, specs: ['nephrology'], clinics: ['nephrology', 'dialysis'],
      sym: ['Отоци', 'Повишен креатинин', 'Високо кръвно', 'Хемодиализа'] },
    { id: 'bladder', name: 'Пикочни пътища и простата', latin: 'Vesica urinaria', pos: [0, 86, 8.6], specs: ['urology'], clinics: ['urology'],
      sym: ['Често уриниране', 'Бъбречни камъни', 'Простата', 'Андрология'] },
    { id: 'hip', name: 'Тазобедрена става', latin: 'Articulatio coxae', pos: [11, 85, 5], mirror: true, specs: ['orthopedics'], clinics: ['orthopedics', 'rehab'],
      sym: ['Болка при ходене', 'Артроза', 'Ставно протезиране', 'Фрактура'] },
    { id: 'lungs', name: 'Бял дроб и дишане', latin: 'Pulmo', pos: [-7.5, 133, 9.8], specs: ['imaging'], clinics: ['imaging', 'dkb', 'emergency'],
      sym: ['Задух', 'Продължителна кашлица', 'Болка при дишане', 'Хъркане и сънна апнея'], red: 'Внезапен силен задух или болка в гърдите — обадете се на 112.' },
    { id: 'elbow', name: 'Лакът, китка и ръка', latin: 'Manus', pos: [24.4, 96, 3], mirror: true, specs: ['orthopedics', 'rehab'], clinics: ['orthopedics', 'rehab'],
      sym: ['Фрактура или навяхване', 'Болка в китката', 'Изтръпване на пръстите', 'Тенис лакът'] },
    { id: 'skin', name: 'Кожа', latin: 'Cutis', pos: [-22.6, 118, 4.2], specs: ['surgery', 'oncology'], clinics: ['surgery', 'oncology'],
      sym: ['Променяща се бенка', 'Меланом', 'Кожни тумори', 'Незарастващи рани'] },
    { id: 'metabolism', name: 'Обмяна на веществата и диабет', latin: 'Metabolismus', pos: [0, 104, 10.4], specs: ['endocrinology'], clinics: ['endocrinology'],
      sym: ['Диабет', 'Наднормено тегло', 'Жажда и често уриниране', 'Високи мазнини в кръвта'] },
    { id: 'joints', name: 'Кости и стави (остеопороза, ревматизъм)', latin: 'Articulationes', pos: [-24, 108, -1.5], specs: ['rehab', 'orthopedics'], clinics: ['rehab', 'orthopedics'],
      sym: ['Остеопороза', 'Болки в ставите', 'Сковаване сутрин', 'Рехабилитация след операция'] },
    { id: 'knee', name: 'Коляно', latin: 'Articulatio genus', pos: [-7.6, 48, 5.6], mirror: true, specs: ['orthopedics'], clinics: ['orthopedics', 'rehab'],
      sym: ['Болки в коляното', 'Спортна травма', 'Менискус', 'Артроскопия'] },
    { id: 'ankle', name: 'Глезен и стъпало', latin: 'Pes', pos: [-7.6, 8, 6], mirror: true, specs: ['orthopedics', 'endocrinology'], clinics: ['orthopedics', 'endocrinology'],
      sym: ['Навяхване на глезена', 'Фрактура', 'Диабетно стъпало', 'Болка в петата'] }
  ];
  /* zones without a point on the body: buttons above the model */
  const EXTRA = [
    { id: 'child', name: 'Дете', latin: 'Pediatria', specs: ['ped-onco', 'ent'], clinics: ['ped-onco', 'ent'],
      sym: ['Детска хематология и онкология', 'Детски УНГ болести', 'Чести ангини и сливици', 'Слухови нарушения при деца'] },
    { id: 'urgent', name: 'Спешно и общо неразположение', latin: 'Urgentia', specs: ['anesthesia', 'imaging'], clinics: ['emergency', 'dkb', 'medcenter', 'icu', 'pharmacology'],
      sym: ['Висока температура', 'Внезапна силна болка', 'Травма или падане', 'Не знам към кого да се обърна'], red: 'При опасност за живота — 112. Спешното отделение на ИСУЛ работи денонощно.' }
  ];
  // expand mirrored hotspots (both sides point to the same zone)
  const SPOTS = []; let spotsXY = [];
  const NARROW = matchMedia('(max-width: 600px)').matches;
  ZONES.forEach((z) => { SPOTS.push({ z, p: z.pos }); if (z.mirror && !NARROW) SPOTS.push({ z, p: [-z.pos[0], z.pos[1], z.pos[2]] }); });

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

  /* ---------- Canvas & camera ---------- */
  const canvas = $('[data-a="canvas"]'), ctx = canvas.getContext('2d'), stage = $('[data-a="stage"]'), tip = $('[data-a="tip"]');
  let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);
  const size = () => { const r = canvas.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  new ResizeObserver(size).observe(canvas); size();
  let yaw = -.35, pitch = .06, targetYaw = null, spin = !reduce, drag = null, sel = null, hover = null, t = 0, visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const proj = (p, cy, sy, cp, sp, s, cx0, cy0) => {
    const x = p[0], y = p[1] - 92, z = p[2];
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
    const f = 420 / (420 - z2);
    return [cx0 + x1 * s * f, cy0 - y2 * s * f, z2];
  };

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    t += 1 / 60;
    if (targetYaw !== null) { let d = targetYaw - yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); yaw += d * .08; if (Math.abs(d) < .002) { yaw = targetYaw; targetYaw = null; } }
    else if (spin && !drag) yaw += .0045;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const s = Math.min(H * (NARROW ? .93 : .86) / 182, W * .9 / 70), cx0 = W / 2, cy0 = H / 2 + (NARROW ? 14 : 4);
    const scanY = reduce ? -999 : 92 + Math.sin(t * .6) * 88;
    const back = new Path2D(), front = new Path2D(), glow = new Path2D(), scan = new Path2D();
    const sz = sel ? sel.z : null;
    for (const r of RINGS) {
      const P = r.pts.map((p) => proj(p, cy, sy, cp, sp, s, cx0, cy0));
      let hot = false;
      if (sz) for (const sp2 of SPOTS) if (sp2.z === sz && Math.abs(r.c[1] - sp2.p[1]) < 6.5 && Math.abs(r.c[0] - sp2.p[0]) < 13) { hot = true; break; }
      const sc = Math.abs(r.c[1] - scanY) < 1.4;
      for (let k = 0; k < SEG; k++) {
        const a = P[k], b = P[(k + 1) % SEG], zf = (a[2] + b[2]) / 2;
        const path = hot ? glow : sc ? scan : zf > 0 ? front : back;
        path.moveTo(a[0], a[1]); path.lineTo(b[0], b[1]);
      }
    }
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(91,155,224,.16)'; ctx.stroke(back);
    ctx.strokeStyle = 'rgba(160,200,245,.62)'; ctx.stroke(front);
    ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke(scan);
    ctx.lineWidth = 1.8; ctx.strokeStyle = '#FF8FBE'; ctx.shadowColor = 'rgba(255,120,180,.9)'; ctx.shadowBlur = 10; ctx.stroke(glow); ctx.shadowBlur = 0;

    // hotspots
    const pulse = reduce ? .5 : (Math.sin(t * 3) + 1) / 2;
    spotsXY = SPOTS.map((sp2) => {
      const [x, y, z] = proj(sp2.p, cy, sy, cp, sp, s, cx0, cy0);
      const vis = z > -3, isSel = sz === sp2.z, isHov = hover === sp2.z;
      const r = (isSel ? 7 : isHov ? 6 : 4.5) * (NARROW ? 1.25 : 1);
      ctx.globalAlpha = vis ? 1 : .22;
      if (vis) { ctx.beginPath(); ctx.arc(x, y, r + 5 + pulse * 7, 0, 7); ctx.strokeStyle = isSel ? 'rgba(255,143,190,' + (.7 - pulse * .6) + ')' : 'rgba(201,174,130,' + (.6 - pulse * .5) + ')'; ctx.lineWidth = 1.5; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = isSel ? '#FF8FBE' : isHov ? '#fff' : '#E6C99A'; ctx.fill();
      ctx.globalAlpha = 1;
      return { sp: sp2, x, y, vis };
    });
    if (sel) { // label next to the selected spot (nearest visible one)
      const s2 = spotsXY.filter((o) => o.sp.z === sel.z && o.vis).sort((a, b) => a.x - b.x)[0];
      if (s2) {
        const off = Math.min(150, W * .3), lx = s2.x + (s2.x < cx0 ? -off : off), ly = s2.y - 24;
        ctx.strokeStyle = 'rgba(255,143,190,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s2.x, s2.y); ctx.lineTo(lx, ly); ctx.stroke();
        ctx.font = '600 13px Onest, system-ui, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = s2.x < cx0 ? 'right' : 'left';
        const label = sel.z.name.length > 16 && NARROW ? sel.z.name.split(' ')[0] : sel.z.name; ctx.fillText(label, lx + (s2.x < cx0 ? -6 : 6), ly + 4);
      }
    }
  }
  frame();

  /* ---------- Interaction ---------- */
  const pick = (mx, my) => { let best = null, bd = NARROW ? 30 : 22; (spotsXY || []).forEach((o) => { if (!o.vis) return; const d = Math.hypot(o.x - mx, o.y - my); if (d < bd) { bd = d; best = o; } }); return best; };
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      if (drag.moved) { targetYaw = null; yaw = drag.yaw + dx * .01; pitch = Math.max(-.35, Math.min(.45, drag.pitch + dy * .004)); }
      return;
    }
    const o = pick(mx, my); hover = o ? o.sp.z : null;
    canvas.style.cursor = o ? 'pointer' : '';
    if (o) { tip.hidden = false; tip.textContent = o.sp.z.name; tip.style.left = o.x + 'px'; tip.style.top = o.y + 'px'; } else tip.hidden = true;
  });
  canvas.addEventListener('pointerup', (e) => {
    const was = drag; drag = null; if (!was || was.moved) return;
    const r = canvas.getBoundingClientRect(), o = pick(e.clientX - r.left, e.clientY - r.top);
    if (o) select(o.sp.z, o.sp.p);
  });
  canvas.addEventListener('pointerleave', () => { hover = null; tip.hidden = true; });

  const vf = $('[data-a="vfront"]'), vb = $('[data-a="vback"]'), vs = $('[data-a="vspin"]');
  const setView = (a, front) => { targetYaw = a; spin = false; syncSpin(); vf.setAttribute('aria-pressed', String(front)); vb.setAttribute('aria-pressed', String(!front)); };
  vf.addEventListener('click', () => setView(0, true));
  vb.addEventListener('click', () => setView(Math.PI, false));
  const syncSpin = () => { vs.setAttribute('aria-pressed', String(spin)); vs.textContent = spin ? '❚❚' : '▶'; vs.setAttribute('aria-label', spin ? 'Спри въртенето' : 'Пусни въртенето'); };
  vs.addEventListener('click', () => { spin = !spin; if (spin) targetYaw = null; syncSpin(); });
  syncSpin();

  /* ---------- Panel ---------- */
  const pempty = $('[data-a="pempty"]'), pbody = $('[data-a="pbody"]'), list = $('[data-a="zones"]');
  list.innerHTML = ZONES.concat(EXTRA).map((z) => `<li><button type="button" data-z="${z.id}" aria-pressed="false"><b>${z.name}</b><small>${z.specs.map((x) => spec(x).name).join(' · ')}</small></button></li>`).join('');
  list.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const z = ZONES.concat(EXTRA).find((x) => x.id === b.dataset.z); select(z, z.pos); $('[data-a="stage"]').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); });

  function select(z, p) {
    sel = { z };
    if (p) { targetYaw = Math.atan2(-p[0], p[2]); spin = false; syncSpin(); }
    vf.setAttribute('aria-pressed', 'false'); vb.setAttribute('aria-pressed', 'false');
    list.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.z === z.id)));
    const cls = z.clinics.map(clinic).filter(Boolean);
    pempty.hidden = true; pbody.hidden = false;
    pbody.innerHTML = `<div class="pz"><p class="pz__k">${z.specs.map((x) => spec(x).name).join(' · ')}</p><h2>${z.name}</h2><p class="pz__latin">${z.latin}</p></div>
      ${z.red ? `<div class="pz__red"><b>Спешно:</b> ${z.red} <a href="tel:112">112</a> · Спешно отделение <a href="tel:+35929432203">02 9432 203</a></div>` : ''}
      <div class="pz"><h3>Чести оплаквания</h3><ul class="pz__sym">${z.sym.map((x) => `<li>${x}</li>`).join('')}</ul></div>
      ${(TESTS[z.id] || []).length ? `<div class="pz"><h3>Изследвания</h3><ul class="pz__tests">${TESTS[z.id].map((k) => `<li><a href="${linkUnit(T[k][0])}">${T[k][1]}<span aria-hidden="true">→</span></a></li>`).join('')}</ul></div>` : ''}
      ${(opts.doctors || window.ISUL_NAV_DOCTORS) ? (opts.doctors || window.ISUL_NAV_DOCTORS)(z.clinics, z.id) : ''}
      <div class="pz"><h3>Клиники в ИСУЛ</h3><ul class="pz__cl">${cls.map((c) => `<li><a href="${linkClinic(c.id)}"><span>${c.short || c.name}<small>${c.group}</small></span></a></li>`).join('')}</ul></div>
      <div class="pz__cta"><a class="p1" href="${linkBook(z.specs[0])}">Запази час</a>${z.lab ? '<a class="p2" href="https://lab.isul.eu/" target="_blank" rel="noopener">Лабораторни резултати ↗</a>' : `<a class="p2" href="${linkDocs(z.specs[0])}">Специалисти</a>`}</div>
      <p class="pz__note">Насочването е ориентировъчно и не поставя диагноза.</p>`;
    pbody.style.animation = 'none'; void pbody.offsetWidth; pbody.style.animation = '';
    const bar = $('[data-a="selbar"]'); if (bar) { bar.hidden = false; $('[data-a="selname"]').textContent = z.name; }
    const hn = $('.stage__hint'); if (hn && NARROW) hn.hidden = true;
    if (opts.onSelect) opts.onSelect(z.id);
  }

  const sb = $('[data-a="selgo"]'); if (sb) sb.addEventListener('click', () => $('[data-a="panel"]').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
  const hint = $('.stage__hint'); if (hint && matchMedia('(pointer: coarse)').matches) hint.textContent = 'Завъртете с пръст · докоснете точка';

  // deep link: body.html#knee
  root.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', () => { const z = EXTRA.find((x) => x.id === b.dataset.x); select(z, null); if (NARROW) $('[data-a="panel"]').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }));
  const z0 = ZONES.concat(EXTRA).find((z) => z.id === opts.zone);
  if (z0) select(z0, z0.pos);
  }

  window.ISUL_NAVIGATOR = { mount };
  // standalone page (body.html)
  const solo = document.getElementById('anav-root');
  if (solo) mount(solo, { zone: location.hash.slice(1), onSelect: (id) => { try { history.replaceState(null, '', '#' + id); } catch (e) { /* sandbox */ } } });
})();
