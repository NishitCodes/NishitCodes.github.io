/**
 * ==============================================================================
 * Interactive Night Sky Constellation Canvas Engine
 * High-performance particle constellation with mouse interactivity
 * ==============================================================================
 */

(function () {
  'use strict';

  const canvas = document.getElementById('constellation-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let stars = [];

  // Configuration
  const STAR_DENSITY_DIVISOR = 11000; // responsive star count
  const MIN_STARS = 60;
  const MAX_STARS = 130;
  const CONNECT_DISTANCE = 130;
  const MOUSE_CONNECT_DISTANCE = 170;

  const mouse = {
    x: null,
    y: null,
    radius: MOUSE_CONNECT_DISTANCE
  };

  // Resize canvas to full viewport
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  }

  // Star Constructor
  class Star {
    constructor() {
      this.reset();
      // Start at random coordinates across screen
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }

    reset() {
      this.radius = Math.random() * 1.6 + 0.8;
      // Drift velocity
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      // Twinkle properties
      this.baseAlpha = Math.random() * 0.5 + 0.4;
      this.alpha = this.baseAlpha;
      this.twinkleSpeed = Math.random() * 0.02 + 0.008;
      this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
      // Color tint (mostly crisp white with subtle icy blue)
      const isBlueTint = Math.random() > 0.75;
      this.color = isBlueTint ? '186, 230, 253' : '255, 255, 255';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around screen edges smoothly
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;

      // Twinkle calculation
      this.alpha += this.twinkleSpeed * this.twinkleDirection;
      if (this.alpha >= 1) {
        this.alpha = 1;
        this.twinkleDirection = -1;
      } else if (this.alpha <= 0.25) {
        this.alpha = 0.25;
        this.twinkleDirection = 1;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.shadowBlur = this.radius > 1.5 ? 8 : 0;
      ctx.shadowColor = `rgba(${this.color}, 0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow for lines
    }
  }

  // Populate stars
  function initStars() {
    stars = [];
    const count = Math.min(
      Math.max(Math.floor((width * height) / STAR_DENSITY_DIVISOR), MIN_STARS),
      MAX_STARS
    );
    for (let i = 0; i < count; i++) {
      stars.push(new Star());
    }
  }

  // Draw constellation lines between nearby stars & mouse
  function drawConstellations() {
    const total = stars.length;

    for (let i = 0; i < total; i++) {
      const starA = stars[i];

      // 1. Connect star to mouse if near
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - starA.x;
        const dy = mouse.y - starA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_CONNECT_DISTANCE) {
          const alpha = (1 - dist / MOUSE_CONNECT_DISTANCE) * 0.55;
          ctx.beginPath();
          ctx.moveTo(starA.x, starA.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // 2. Connect star to other stars
      for (let j = i + 1; j < total; j++) {
        const starB = stars[j];
        const dx = starA.x - starB.x;
        const dy = starA.y - starB.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DISTANCE) {
          const alpha = (1 - dist / CONNECT_DISTANCE) * 0.28;
          ctx.beginPath();
          ctx.moveTo(starA.x, starA.y);
          ctx.lineTo(starB.x, starB.y);
          ctx.strokeStyle = `rgba(186, 230, 253, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connection lines first (behind stars)
    drawConstellations();

    // Update and draw each star
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }

    requestAnimationFrame(animate);
  }

  // Event Listeners
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', function () {
    mouse.x = null;
    mouse.y = null;
  });

  // Touch support for mobile/tablets
  window.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  });

  window.addEventListener('touchend', function () {
    mouse.x = null;
    mouse.y = null;
  });

  // Boot
  resize();
  animate();
})();
