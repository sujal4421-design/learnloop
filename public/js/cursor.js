// public/js/cursor.js
// Custom trailing cursor logic for the Lusion aesthetic

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');

  if (!dot || !outline) return;

  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;

  // Track mouse movement
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Instantly move the dot
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Animate the outline trailing behind
  function animate() {
    let distX = mouseX - outlineX;
    let distY = mouseY - outlineY;
    
    // LERP (Linear Interpolation) for smooth trailing effect
    outlineX += distX * 0.15;
    outlineY += distY * 0.15;

    outline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
    requestAnimationFrame(animate);
  }

  animate();

  // Hover states for interactive elements
  const interactables = document.querySelectorAll('a, button, input, .magnetic, .tilt');
  
  interactables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      outline.classList.add('cursor-hover');
      dot.classList.add('cursor-hover');
    });
    
    el.addEventListener('mouseleave', () => {
      outline.classList.remove('cursor-hover');
      dot.classList.remove('cursor-hover');
    });
  });
})();
