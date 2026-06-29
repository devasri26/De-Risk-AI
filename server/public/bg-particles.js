// 3D Constellation Particle Background Animation
(function() {
  const canvas = document.createElement("canvas");
  canvas.id = "bg-canvas-particles";
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    zIndex: "-2",
    pointerEvents: "none",
    background: "#09090B" // Enterprise deep dark background
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  let centerX = width / 2;
  let centerY = height / 2;

  let particles = [];
  let isMobile = width < 768;
  let maxParticles = isMobile ? 35 : 110;
  let connectionDist = isMobile ? 65 : 115;
  const focalLength = 300;

  // Mouse telemetry
  let mouse = { x: centerX, y: centerY, targetX: centerX, targetY: centerY };
  let parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

  window.addEventListener("mousemove", (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    parallax.targetX = (e.clientX - centerX) * 0.05;
    parallax.targetY = (e.clientY - centerY) * 0.05;
  });

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
    isMobile = width < 768;
    maxParticles = isMobile ? 35 : 110;
    connectionDist = isMobile ? 65 : 115;
    initParticles();
  });

  class Particle {
    constructor() {
      this.reset();
      this.z = Math.random() * 400 - 200; // Depth distribution
    }

    reset() {
      this.x = Math.random() * width - centerX;
      this.y = Math.random() * height - centerY;
      this.z = 200;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.vz = (Math.random() - 0.5) * 0.2;
      this.radius = Math.random() * 1.5 + 0.8;
      
      // Color selector (Charcoal, Muted Emerald, Translucent White)
      const rand = Math.random();
      if (rand < 0.45) {
        this.color = "rgba(34, 197, 94, 0.22)"; // Emerald
      } else if (rand < 0.8) {
        this.color = "rgba(255, 255, 255, 0.18)"; // Translucent white
      } else {
        this.color = "rgba(161, 161, 170, 0.25)"; // Charcoal
      }
    }

    update(time) {
      // Basic velocities
      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz;

      // Apply organic turbulence using Perlin-like sine flows
      this.x += Math.sin(time * 0.002 + this.y * 0.01) * 0.06;
      this.y += Math.cos(time * 0.002 + this.x * 0.01) * 0.06;

      // Wrap around bounds
      if (this.x < -width/2 || this.x > width/2 || this.y < -height/2 || this.y > height/2 || this.z < -focalLength) {
        this.reset();
        this.z = Math.random() * 200 + 100;
      }
    }

    render(projParallax) {
      // 3D Projection calculations
      const scale = focalLength / (focalLength + this.z);
      const projX = centerX + (this.x + projParallax.x) * scale;
      const projY = centerY + (this.y + projParallax.y) * scale;
      const r = this.radius * scale;

      if (projX < 0 || projX > width || projY < 0 || projY > height) return null;

      ctx.beginPath();
      ctx.arc(projX, projY, r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      return { x: projX, y: projY, scale: scale };
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }
  }

  initParticles();

  function animate(time) {
    ctx.clearRect(0, 0, width, height);

    // Smooth lerp mouse parallax offsets
    parallax.x += (parallax.targetX - parallax.x) * 0.05;
    parallax.y += (parallax.targetY - parallax.y) * 0.05;

    // Render nodes
    const coordinates = [];
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update(time);
      const coords = p.render(parallax);
      if (coords) {
        coordinates.push({ idx: i, x: coords.x, y: coords.y, scale: coords.scale });
      }
    }

    // Connect node constellations with lines
    if (!isMobile) {
      ctx.lineWidth = 0.55;
      for (let i = 0; i < coordinates.length; i++) {
        for (let j = i + 1; j < coordinates.length; j++) {
          const c1 = coordinates[i];
          const c2 = coordinates[j];
          
          const dx = c1.x - c2.x;
          const dy = c1.y - c2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - (dist / connectionDist)) * 0.08 * Math.min(c1.scale, c2.scale);
            ctx.beginPath();
            ctx.moveTo(c1.x, c2.y); // Subtle offsets to add 3D line perspective
            ctx.lineTo(c2.x, c2.y);
            ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
            ctx.stroke();
          }
        }
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
