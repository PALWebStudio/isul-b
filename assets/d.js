/* Variant D: background video with a pause control (WCAG 2.2.2).
   Autoplays muted; respects reduced motion; pauses when off screen. */
(function () {
  'use strict';
  const v = document.getElementById('hvideo'), btn = document.getElementById('vpause');
  if (!v || !btn) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userPaused = reduce;
  const icon = () => {
    btn.setAttribute('aria-pressed', String(userPaused));
    btn.setAttribute('aria-label', userPaused ? 'Пусни видеото' : 'Спри видеото');
    btn.innerHTML = userPaused ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z" fill="currentColor"/></svg>' : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10"/></svg>';
  };
  const play = () => { if (!userPaused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } };
  btn.addEventListener('click', () => { userPaused = !userPaused; userPaused ? v.pause() : play(); icon(); });
  new IntersectionObserver(([e]) => (e.isIntersecting ? play() : v.pause()), { threshold: .1 }).observe(v);
  document.addEventListener('visibilitychange', () => (document.hidden ? v.pause() : play()));
  icon(); play();
})();
