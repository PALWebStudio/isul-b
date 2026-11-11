/* Intro: the ISUL crest fills with burgundy while the year counts 1936 → 2026,
   then the screen lifts to reveal the site. Skippable (button, Esc, Enter). */
(function () {
  'use strict';
  const intro = document.getElementById('intro'); if (!intro) return;
  if (location.hash.length > 2 && location.hash.startsWith('#/')) { intro.classList.add('is-gone'); document.body.classList.remove('is-intro'); return; }
  const year = document.getElementById('iyear');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DELAY = 500, FILL = 2600;
  const ease = (p) => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // matches the CSS curve
  let done = false, timer = 0, start = 0;

  function finish(fast) {
    if (done) return; done = true; clearInterval(timer);
    if (fast) intro.classList.add('is-fast');
    intro.classList.add('is-filling', 'is-full'); year.textContent = '2026';
    setTimeout(() => {
      intro.classList.add('is-out');
      document.body.classList.remove('is-intro');
      if (window.isulSliderRestart) window.isulSliderRestart();
      setTimeout(() => intro.classList.add('is-gone'), 1000);
    }, fast ? 350 : 1300);
  }
  document.getElementById('iskip').addEventListener('click', () => finish(true));
  addEventListener('keydown', (e) => { if (!done && (e.key === 'Escape' || e.key === 'Enter')) finish(true); });
  if (reduce) { finish(true); return; }
  setTimeout(() => {
    intro.classList.add('is-filling'); start = Date.now();
    timer = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / FILL);
      year.textContent = String(Math.round(1936 + 90 * ease(p)));
      if (p >= 1) finish(false);
    }, 30);
  }, DELAY);
})();
