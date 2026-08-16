// public/js/canvas-bg.js
// Interactive particle network canvas background

(function() {
  const canvas = document.getElementById('canvas-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  
  // Mouse position
  let mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  }

  window.addEventListener('resize', resize);

  class Particle {
    constructor(x, y, vx, vy, radius) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.radius = radius;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = (Math.random() * 30) + 1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    }

    update() {
      // Repel from mouse
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      
      let maxDistance = mouse.radius;
      let force = (maxDistance - distance) / maxDistance;
      
      let directionX = forceDirectionX * force * this.density;
      let directionY = forceDirectionY * force * this.density;

      if (distance < mouse.radius) {
        this.x -= directionX;
        this.y -= directionY;
      } else {
        if (this.x !== this.baseX) {
          let dx = this.x - this.baseX;
          this.x -= dx / 10;
        }
        if (this.y !== this.baseY) {
          let dy = this.y - this.baseY;
          this.y -= dy / 10;
        }
      }

      // Slowly drift
      this.baseX += this.vx;
      this.baseY += this.vy;

      // Bounce off edges
      if (this.baseX < -50 || this.baseX > width + 50) this.vx = -this.vx;
      if (this.baseY < -50 || this.baseY > height + 50) this.vy = -this.vy;
      
      this.draw();
    }
  }

  function initParticles() {
    particles = [];
    // Slightly reduce particle count for better performance on all devices
    let numberOfParticles = (width * height) / 12000; 
    
    for (let i = 0; i < numberOfParticles; i++) {
      let radius = Math.random() * 2 + 1;
      let x = Math.random() * width;
      let y = Math.random() * height;
      let vx = (Math.random() - 0.5) * 0.5;
      let vy = (Math.random() - 0.5) * 0.5;
      particles.push(new Particle(x, y, vx, vy, radius));
    }
  }

  function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let distance = dx * dx + dy * dy;

        if (distance < (width / 7) * (height / 7)) {
          opacityValue = 1 - (distance / 20000);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
    }
    connect();
  }

  resize();
  animate();
})();
