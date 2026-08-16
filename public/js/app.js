// public/js/app.js
// Shared interaction layer: cursor spotlight, magnetic buttons, tilt cards,
// AI-summary typewriter reveal, and progressive enhancement for
// cross-document View Transitions on internal links.

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // respect accessibility preference — skip all motion JS

  // ---------- Cursor spotlight ----------
  document.querySelectorAll('.spotlight').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  // ---------- Magnetic buttons ----------
  document.querySelectorAll('.magnetic').forEach((el) => {
    const strength = 0.25;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      el.style.setProperty('--mbx', `${relX * strength}px`);
      el.style.setProperty('--mby', `${relY * strength}px`);
    });
    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--mbx', '0px');
      el.style.setProperty('--mby', '0px');
    });
  });

  // ---------- Interactive tilt ----------
  document.querySelectorAll('.tilt').forEach((el) => {
    const maxTilt = 4; // degrees — kept small and subtle, not gimmicky
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;  // 0 → 1
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * maxTilt * 2;
      const rx = (0.5 - py) * maxTilt * 2;
      el.style.setProperty('--rx', `${rx}deg`);
      el.style.setProperty('--ry', `${ry}deg`);
      el.style.setProperty('--ty', '-2px');
    });
    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--ty', '0px');
    });
  });

  // ---------- AI summary typewriter (plays once per page load) ----------
  document.querySelectorAll('.item-ai-summary .typewriter').forEach((el) => {
    // Animation is CSS-driven (see .typewriter in style.css) — this just
    // removes the blinking cursor border after the type-in finishes so it
    // doesn't blink forever.
    el.addEventListener('animationend', (e) => {
      if (e.animationName === 'typing') {
        el.style.borderRight = 'none';
      }
    }, { once: false });
  });
})();

// ---------- Progressive enhancement: shared-element view transitions ----------
// Gives log cards a "morph" feel into their edit form, when the browser
// supports the View Transitions API. Falls back to a normal navigation
// everywhere else — nothing breaks on unsupported browsers.
if (document.startViewTransition) {
  document.documentElement.classList.add('vt-supported');
}
