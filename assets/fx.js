/* ИСУЛ — motion & 3D layer.
   DNA helix (canvas, real perspective projection), parallax depth stage,
   3D tilt cards with glare, staggered scroll reveals, counters, progress bar.
   Everything is skipped under prefers-reduced-motion. */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  document.documentElement.classList.add(reduce ? 'fx-off' : 'fx-on');

  /* ---------- Scroll progress ---------- */
  const bar = document.createElement('div');
  bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
  document.getElementById('hdr').appendChild(bar);
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- DNA helix ---------- */
  let helixRAF = 0, helixCleanup = null;
  function helix(canvas, stage) {
    if (helixCleanup) helixCleanup();
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    let t = 0, mx = 0, my = 0, tmx = 0, tmy = 0, visible = true;
    const N = 46;                                  // base pairs
    const dust = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random(), s: .2 + Math.random() * .8 }));
    const resize = () => {
      const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(canvas);
    const onMove = (e) => { const r = stage.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width - .5; tmy = (e.clientY - r.top) / r.height - .5; };
    addEventListener('pointermove', onMove, { passive: true });

    function frame() {
      helixRAF = requestAnimationFrame(frame);
      if (!visible) return;
      t += 0.008; mx += (tmx - mx) * .05; my += (tmy - my) * .05;
      ctx.clearRect(0, 0, W, H);
      const cx = W * .5, cy = H * .5, R = Math.min(W, H) * .2, len = H * 1.15, f = 520;
      const tilt = -0.42 + mx * .5, cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      const pts = [];
      // dust — slow drifting particles at depth
      for (const d of dust) {
        d.y -= .0006 * d.s; if (d.y < 0) d.y = 1;
        const z = (d.z - .5) * 400, sc = f / (f + z);
        pts.push({ x: cx + (d.x - .5) * W * 1.2 * sc + mx * 40 * d.s, y: cy + (d.y - .5) * H * sc + my * 30 * d.s, z, r: 1.4 * sc * d.s, c: '255,255,255', a: .25 * d.s });
      }
      for (let i = 0; i < N; i++) {
        const p = i / (N - 1), ang = p * Math.PI * 4.2 + t * 2;
        const yy = (p - .5) * len;
        for (let k = 0; k < 2; k++) {
          const a = ang + k * Math.PI;
          let x = Math.cos(a) * R, z = Math.sin(a) * R + my * 60;
          const X = x * cosT - yy * sinT, Y = x * sinT + yy * cosT;
          const sc = f / (f + z);
          pts.push({ x: cx + X * sc, y: cy + Y * sc, z, r: (k ? 4.2 : 4.8) * sc, c: k ? '217,198,165' : '255,214,229', a: .55 + .45 * (1 - (z + R) / (2 * R)), k, i });
        }
        if (i % 2 === 0) { // rungs
          const a1 = ang, a2 = ang + Math.PI, steps = 6;
          for (let s = 1; s < steps; s++) {
            const q = s / steps, x = Math.cos(a1) * R * (1 - q) + Math.cos(a2) * R * q, z = Math.sin(a1) * R * (1 - q) + Math.sin(a2) * R * q + my * 60;
            const X = x * cosT - yy * sinT, Y = x * sinT + yy * cosT, sc = f / (f + z);
            pts.push({ x: cx + X * sc, y: cy + Y * sc, z, r: 1.5 * sc, c: '255,255,255', a: .35 });
          }
        }
      }
      pts.sort((a, b) => b.z - a.z);
      for (const p of pts) {
        if (p.r > 3) { // glow for strand nodes
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2);
          g.addColorStop(0, `rgba(${p.c},${p.a * .55})`); g.addColorStop(1, `rgba(${p.c},0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, 7); ctx.fill();
        }
        ctx.fillStyle = `rgba(${p.c},${p.a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
    }
    if (reduce) { t = 1; frame(); cancelAnimationFrame(helixRAF); } else frame();
    helixCleanup = () => { cancelAnimationFrame(helixRAF); ro.disconnect(); io.disconnect(); removeEventListener('pointermove', onMove); helixCleanup = null; };
  }

  /* ---------- Depth stage parallax ---------- */
  function stageParallax(stage) {
    if (reduce || !finePointer) return;
    const cards = $$('[data-depth]', stage);
    let rx = 0, ry = 0, trx = 0, try_ = 0, raf = 0;
    const hero = document.getElementById('hero');
    const loop = () => {
      rx += (trx - rx) * .08; ry += (try_ - ry) * .08;
      stage.style.transform = `rotateY(${rx * 10}deg) rotateX(${-ry * 8}deg)`;
      cards.forEach((c) => { const d = +c.dataset.depth; c.style.transform = `translate3d(${rx * d * .35}px, ${ry * d * .3}px, ${d}px)`; });
      if (Math.abs(trx - rx) > .001 || Math.abs(try_ - ry) > .001) raf = requestAnimationFrame(loop); else raf = 0;
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      trx = (e.clientX - r.left) / r.width - .5; try_ = (e.clientY - r.top) / r.height - .5;
      hero.style.setProperty('--hx', ((e.clientX - r.left) / r.width * 100) + '%');
      hero.style.setProperty('--hy', ((e.clientY - r.top) / r.height * 100) + '%');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener('pointerleave', () => { trx = 0; try_ = 0; if (!raf) raf = requestAnimationFrame(loop); });
    loop();
  }

  /* ---------- 3D tilt cards with glare ---------- */
  const TILT = '.qa, .dcard .portrait, .dir, .acard .photo, .panel--link, .story .photo, .contact-card, .channel, .emg-box, .way__card, .opt';
  function tilt(root) {
    if (reduce || !finePointer) return;
    $$(TILT, root).forEach((el) => {
      if (el.dataset.tilt) return; el.dataset.tilt = '1'; el.classList.add('tilt');
      const max = el.matches('.dir, .qa, .opt') ? 7 : 10;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(.5 - y) * max}deg) rotateY(${(x - .5) * max}deg) translateZ(8px)`;
        el.style.setProperty('--gx', x * 100 + '%'); el.style.setProperty('--gy', y * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Magnetic primary buttons ---------- */
  function magnetic(root) {
    if (reduce || !finePointer) return;
    $$('.btn--primary, .btn--light, .hdr__cta', root).forEach((b) => {
      if (b.dataset.mag) return; b.dataset.mag = '1';
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- Staggered reveals ---------- */
  const REVEAL = '.sec__head, .dirs > *, .docs > *, .news > *, .stories > *, .hub__col, .stat, .grid3 > *, .grid4 > *, .tl, .steps > li, .ccards > *, .kgrid > *, .alist > *, .disc > *, .block, .principles > *, .emg-grid > *, .channels > *, .opts > *, .split > *, .jub__grid > *, .ds-swatches > *, .tree > *, .way > *';
  let io = null;
  function reveal(root) {
    if (reduce || !('IntersectionObserver' in window)) return;
    if (!io) io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
      const n = e.target.querySelector('[data-count]'); if (n) count(n);
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$(REVEAL, root).forEach((el) => {
      if (el.classList.contains('rv')) return;
      const sibs = Array.from(el.parentElement.children);
      el.style.setProperty('--d', (Math.min(sibs.indexOf(el), 8) * 70) + 'ms');
      el.classList.add('rv'); io.observe(el);
    });
    // safety: never leave content hidden (thumbnails, very tall screens)
    setTimeout(() => $$('.rv:not(.in)', root).forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('in'); }), 1200);
  }

  /* ---------- Counters ---------- */
  function prepCounters(root) {
    $$('.stat b', root).forEach((b) => {
      const raw = b.textContent.trim(), n = parseInt(raw.replace(/\s/g, ''), 10);
      if (!isNaN(n) && !b.dataset.count) b.dataset.count = n;
    });
  }
  function count(el) {
    if (reduce) return;
    const end = +el.dataset.count, yearLike = end > 1800 && end < 2100, dur = 1600, t0 = performance.now();
    const fmt = (v) => yearLike ? String(v) : v.toLocaleString('bg-BG').replace(/ /g, ' ');
    const step = (now) => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(Math.round((yearLike ? 1900 + (end - 1900) * e : end * e))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------- Hero headline: word-by-word 3D rise ---------- */
  function splitHeadline(h) {
    if (!h || reduce || h.dataset.split) return;
    h.dataset.split = '1';
    const walk = (node) => {
      Array.from(node.childNodes).forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.innerHTML = `<span>${w}</span>`; frag.appendChild(s);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    };
    walk(h);
    $$('.w > span', h).forEach((s, i) => s.style.setProperty('--i', i));
  }

  /* ---------- Run per render ---------- */
  function run() {
    const main = document.getElementById('main');
    prepCounters(main);
    const canvas = document.getElementById('helix'), stage = document.getElementById('hero-stage');
    if (canvas && stage) { helix(canvas, stage); stageParallax(stage); }
    else if (helixCleanup) helixCleanup();
    splitHeadline(document.getElementById('hero-title'));
    reveal(main); tilt(document); magnetic(document); onScroll();
  }
  document.addEventListener('isul:render', run);
  // slogan switch re-splits the headline
  const pick = document.getElementById('slogan-pick');
  if (pick) pick.addEventListener('change', () => setTimeout(() => { const h = document.getElementById('hero-title'); if (h) { delete h.dataset.split; splitHeadline(h); } }));
  run();
})();
