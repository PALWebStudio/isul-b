/* Variant X homepage: „90 години“ — plays the film in a dialog over the page.
   For now from this site (assets/video/isul-90-1080.mp4 / -720.mp4, web copies of Клип90секунди/CLIP-1.mp4 made with
   tools/transcode.swift); set FILM.yt to its YouTube id and it plays from YouTube instead. */
(function () {
  const FILM = { yt: '', title: '90 години УМБАЛ „Царица Йоанна – ИСУЛ“',
    src: [['assets/video/isul-90-1080.mp4', '(min-width: 900px)'], ['assets/video/isul-90-720.mp4', '']], poster: 'assets/photos/film90/f1.jpg' };
  const sec = document.getElementById('film90'); if (!sec) return;
  let dlg = null;
  const open = (from) => {
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.className = 'film-lb'; dlg.setAttribute('aria-label', FILM.title);
      dlg.innerHTML = '<div class="film-lb__in"><button type="button" class="film-lb__x" aria-label="Затвори">×</button></div>';
      document.body.appendChild(dlg);
      dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('.film-lb__x')) dlg.close(); });
      dlg.addEventListener('close', () => { const m = dlg.querySelector('iframe, video'); if (m) { if (m.pause) m.pause(); m.remove(); } if (from && from.focus) from.focus(); });
    }
    const box = dlg.querySelector('.film-lb__in');
    if (FILM.yt) {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(FILM.yt)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
      f.title = FILM.title; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
      box.appendChild(f);
    } else {
      const v = document.createElement('video');
      v.controls = true; v.playsInline = true; v.preload = 'auto'; v.poster = FILM.poster; v.setAttribute('aria-label', FILM.title);
      // the larger copy on wide screens, the lighter one on phones
      const s = FILM.src.find(([, mq]) => !mq || matchMedia(mq).matches) || FILM.src[FILM.src.length - 1];
      v.src = s[0];
      box.appendChild(v);
      v.play().catch(() => { /* the controls stay; the viewer starts it */ });
    }
    dlg.showModal();
  };
  sec.querySelectorAll('[data-film]').forEach((b) => b.addEventListener('click', () => open(b)));

  /* the highlights carousel: slide 1 is the film; the next slide every 7 s (never with reduced motion), arrows, dots and a pause;
     it holds while the pointer or the keyboard is in it, while the tab is hidden and while the film plays */
  const slides = Array.from(sec.querySelectorAll('.film__slide'));
  if (slides.length > 1) {
    const dots = sec.querySelector('.film__dots'), pauseB = sec.querySelector('.film__pause'), ctl = sec.querySelector('.film__ctl');
    ctl.classList.remove('wrap');   // the arrows sit in the active slide, under its button
    let k = 0, timer = null, hold = false, paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
    dots.innerHTML = slides.map((s, i) => `<button type="button" role="tab" aria-selected="${i === 0}" aria-label="${i + 1} от ${slides.length}: ${(s.querySelector('h2') || {}).textContent.replace(/\s+/g, ' ').trim()}"></button>`).join('');
    const db = Array.from(dots.children);
    const show = (n) => {
      k = (n + slides.length) % slides.length;
      const copy = slides[k].querySelector('.film__copy'), had = ctl.contains(document.activeElement) && document.activeElement;
      if (copy && ctl.parentElement !== copy) { copy.appendChild(ctl); if (had) had.focus(); }
      slides.forEach((s, i) => { const on = i === k; s.classList.toggle('is-on', on); s.inert = !on; s.setAttribute('aria-hidden', String(!on)); });
      db.forEach((b, i) => { b.setAttribute('aria-selected', String(i === k)); b.tabIndex = i === k ? 0 : -1; });
    };
    // held: the pointer or the keyboard is in the section (checked live — the arrows move between slides, so events alone miss it)
    const held = () => hold || sec.matches(':hover') || sec.contains(document.activeElement);
    const tick = () => { clearTimeout(timer); if (paused || held() || document.hidden || (dlg && dlg.open)) return; timer = setTimeout(() => { if (held()) return tick(); show(k + 1); tick(); }, 7000); };
    const setPaused = (p) => { paused = p; pauseB.setAttribute('aria-pressed', String(p)); pauseB.setAttribute('aria-label', p ? 'Пусни смяната' : 'Спри смяната'); tick(); };
    slides.forEach((s) => { s.hidden = false; }); show(0); setPaused(paused);
    sec.querySelectorAll('.film__arr').forEach((b) => b.addEventListener('click', () => { show(k + +b.dataset.step); tick(); }));
    db.forEach((b, i) => b.addEventListener('click', () => { show(i); tick(); }));
    dots.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); show(k + d); db[k].focus(); tick(); });
    pauseB.addEventListener('click', () => setPaused(!paused));
    sec.addEventListener('mouseenter', tick);
    sec.addEventListener('mouseleave', () => setTimeout(tick, 0));
    sec.addEventListener('focusin', tick);
    sec.addEventListener('focusout', () => setTimeout(tick, 0));
    document.addEventListener('visibilitychange', tick);
    document.addEventListener('close', tick, true);   // the film's dialog closed
    tick();
  }
})();
