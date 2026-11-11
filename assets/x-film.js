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
})();
