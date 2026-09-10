import React, { useEffect, useRef } from 'react';

/**
 * Photorealistic Canvas Cracker & Fireworks Particle System.
 * 
 * Features:
 * - Velocity motion-streak spark lines with glowing hot cores & ember trails (instead of simple dots).
 * - Multi-stage bursting shells (willow crackles, gold kamuro glitters, vibrant festival bouquets).
 * - Ambient explosive light flashes on the canvas.
 * - Zero distracting HTML cards/boxes — pure visual feast overlaid directly on the page.
 * - Strict 5.0s lifecycle: after 5 seconds, cancels animation frames, frees memory, and smoothly reveals the homepage.
 */
const FireworksCanvas = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = null;
    let burstIntervalId = null;
    let isRunning = true;
    let particles = [];
    let flashes = [];
    const DURATION_MS = 5000; // Exactly 5.0 seconds

    // HiDPI crisp canvas scaling
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Color palettes inspired by real festival fireworks (Gold Kamuro, Ruby Crimson, Deep Saffron, Emerald)
    const colorThemes = [
      { name: 'gold', hues: [38, 45, 52], lightness: 65 },
      { name: 'saffron', hues: [18, 28, 35], lightness: 60 },
      { name: 'ruby', hues: [345, 355, 10], lightness: 55 },
      { name: 'emerald', hues: [140, 155, 165], lightness: 58 },
      { name: 'violet', hues: [275, 290, 310], lightness: 62 },
      { name: 'champagne', hues: [50, 55, 60], lightness: 85 },
    ];

    // Single Burst Generator
    const burst = (x, y, power = 1) => {
      if (!isRunning) return;

      const theme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      const count = Math.floor((90 + Math.random() * 50) * power);

      // Flash effect at detonation center
      flashes.push({
        x,
        y,
        radius: 40 + Math.random() * 45,
        alpha: 0.35,
        decay: 0.07,
        hue: theme.hues[0],
      });

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // 3D spherical projection speed distribution
        const speed = (Math.pow(Math.random(), 0.5) * 7.5 + 1.8) * power;
        const hue = theme.hues[Math.floor(Math.random() * theme.hues.length)];
        const isGlitter = Math.random() > 0.8;
        const maxLife = 50 + Math.random() * 40;

        particles.push({
          x,
          y,
          px: x, // previous position for realistic velocity streaks
          py: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          hue,
          lightness: theme.lightness,
          isGlitter,
          friction: 0.965 + Math.random() * 0.015,
          gravity: 0.065 + Math.random() * 0.02,
          size: isGlitter ? 2.5 : 1.8,
        });
      }
    };

    const startTime = Date.now();
    let completedCalled = false;

    const finish = () => {
      if (completedCalled) return;
      completedCalled = true;
      isRunning = false;
      if (burstIntervalId) clearInterval(burstIntervalId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      particles = [];
      flashes = [];
      window.removeEventListener('resize', resize);

      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    };

    // Staggered Burst Sequence over 3.6s
    let burstIndex = 0;
    const maxBursts = 13;

    // Initial festive welcome double salvo
    burst(window.innerWidth * 0.5, window.innerHeight * 0.32, 1.25);
    setTimeout(() => {
      if (isRunning) {
        burst(window.innerWidth * 0.3, window.innerHeight * 0.28, 1.05);
        burst(window.innerWidth * 0.7, window.innerHeight * 0.3, 1.05);
      }
    }, 220);

    burstIntervalId = setInterval(() => {
      if (!isRunning) return;
      burstIndex++;

      const x = window.innerWidth * (0.15 + Math.random() * 0.7);
      const y = window.innerHeight * (0.12 + Math.random() * 0.45);
      burst(x, y, 0.95 + Math.random() * 0.35);

      // Occasional twin cracker burst
      if (Math.random() > 0.4) {
        const x2 = window.innerWidth * (0.18 + Math.random() * 0.64);
        const y2 = window.innerHeight * (0.15 + Math.random() * 0.42);
        setTimeout(() => {
          if (isRunning) burst(x2, y2, 0.85);
        }, 110);
      }

      if (burstIndex >= maxBursts) {
        clearInterval(burstIntervalId);
        burstIntervalId = null;
      }
    }, 270);

    // Main 60FPS Physics & Render Loop with internal 5-second deadline check
    const animate = () => {
      if (!isRunning) return;

      // Hard check: if 5000ms elapsed, finish immediately!
      if (Date.now() - startTime >= DURATION_MS) {
        finish();
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Realistic trailing motion blur (dark transparent overlay with additive blend)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter'; // luminous additive sparks

      // 1. Render radial flash glow
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
        g.addColorStop(0, `hsla(${f.hue}, 100%, 85%, ${f.alpha})`);
        g.addColorStop(1, `hsla(${f.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();

        f.alpha -= f.decay;
        f.radius += 2.5;
        if (f.alpha <= 0) flashes.splice(i, 1);
      }

      // 2. Render particle streaks
      particles = particles.filter((p) => p.life > 0);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Store last position
        p.px = p.x;
        p.py = p.y;

        // Apply physics
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        const progress = p.life / p.maxLife;
        const alpha = Math.max(0, Math.min(1, progress * 1.3));

        // Glitter flicker
        const lightness = p.isGlitter && Math.random() > 0.4 ? 95 : p.lightness;

        ctx.strokeStyle = `hsla(${p.hue}, 100%, ${lightness}%, ${alpha})`;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';

        // Draw streak from previous position to current position (realistic firework spark)
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Hot glowing spark core at leading tip
        ctx.fillStyle = `hsla(${p.hue}, 100%, 95%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 5.0 Seconds Strict Expiry Timeout fallback
    const stopTimerId = setTimeout(() => {
      finish();
    }, DURATION_MS);

    return () => {
      isRunning = false;
      if (burstIntervalId) clearInterval(burstIntervalId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      clearTimeout(stopTimerId);
      window.removeEventListener('resize', resize);
      particles = [];
      flashes = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="fireworks-fx"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none', // completely pass-through so homepage is interactive
      }}
    />
  );
};

export default FireworksCanvas;
