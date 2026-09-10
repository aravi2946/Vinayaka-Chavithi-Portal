import React, { useEffect, useRef, useState } from 'react';
import { FastForward } from 'lucide-react';
import './FireworkCelebration.css';

/**
 * FireworkCelebration: Independent Full-Screen Festival Celebration Overlay
 *
 * Timeline:
 * - 0.0s – 5.0s: Full-screen fireworks celebration, multi-stage cracker bursts, radiant festival message.
 * - 5.0s: Stop spawning new bursts; existing particles naturally slow down and fall;
 *         festival message smoothly fades upward; overlay background gradually transitions from 100% to 0% opacity.
 * - 5.0s – 6.8s: Homepage sitting directly underneath becomes smoothly and progressively visible.
 * - 6.8s: Full cleanup of canvas, cancels animation frames, unlocks scroll, and cleanly unmounts overlay.
 */
const FireworkCelebration = ({ onComplete, festivalYear = 2026, festivalName = 'Vinayaka Chavithi' }) => {
  const canvasRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const triggerCleanupRef = useRef(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const handleSkipIntro = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsFadingOut(true);
    if (triggerCleanupRef.current) {
      triggerCleanupRef.current();
    } else if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  // Lock body scroll during full-screen celebration
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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

    const FIREWORKS_ACTIVE_MS = 5000; // 5 full seconds of active fireworks
    const FADE_DURATION_MS = 2000;     // 2.0 seconds smooth gradual reveal of homepage
    const TOTAL_MS = FIREWORKS_ACTIVE_MS + FADE_DURATION_MS; // 7.0s total before unmounting
    const startTime = Date.now();
    let finishTriggered = false;
    let fadeTriggered = false;

    // Detect mobile for particle throttling
    const isMobile = window.innerWidth <= 768;
    const particleMultiplier = isMobile ? 0.6 : 1.0;

    // HiDPI / Retina Crisp Scaling
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

    // Sacred Festival Palettes: Saffron, Rich Gold, Ruby Vermillion, Royal Amber, Champagne
    const festivalPalettes = [
      { name: 'gold', hues: [40, 48, 54], lightness: 68 },
      { name: 'saffron', hues: [18, 26, 32], lightness: 60 },
      { name: 'ruby', hues: [348, 356, 8], lightness: 56 },
      { name: 'amber', hues: [30, 36, 44], lightness: 64 },
      { name: 'emerald', hues: [142, 155, 168], lightness: 60 },
      { name: 'champagne', hues: [50, 54, 58], lightness: 88 },
    ];

    // Multi-Burst Generator
    const burst = (x, y, power = 1, forceTheme = null) => {
      if (!isRunning) return;

      const theme = forceTheme || festivalPalettes[Math.floor(Math.random() * festivalPalettes.length)];
      const count = Math.floor((80 + Math.random() * 45) * power * particleMultiplier);

      // Ambient radial detonation flash
      flashes.push({
        x,
        y,
        radius: (35 + Math.random() * 40) * power,
        alpha: 0.4,
        decay: 0.08,
        hue: theme.hues[0],
      });

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.pow(Math.random(), 0.45) * 7.2 + 1.8) * power;
        const hue = theme.hues[Math.floor(Math.random() * theme.hues.length)];
        const isGlitter = Math.random() > 0.82;
        const maxLife = 45 + Math.random() * 38;

        particles.push({
          x,
          y,
          px: x,
          py: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          hue,
          lightness: theme.lightness,
          isGlitter,
          friction: 0.965 + Math.random() * 0.015,
          gravity: 0.062 + Math.random() * 0.018,
          size: isGlitter ? 2.4 : 1.8,
        });
      }
    };

    // Staggered Burst Sequence for 5 full seconds
    let burstIndex = 0;
    const maxBursts = isMobile ? 12 : 18;

    // Initial Grand Salvo
    burst(window.innerWidth * 0.5, window.innerHeight * 0.28, 1.25, festivalPalettes[0]);
    setTimeout(() => {
      if (isRunning) {
        burst(window.innerWidth * 0.24, window.innerHeight * 0.26, 1.0, festivalPalettes[1]);
        burst(window.innerWidth * 0.76, window.innerHeight * 0.26, 1.0, festivalPalettes[2]);
      }
    }, 240);

    burstIntervalId = setInterval(() => {
      if (!isRunning) return;
      const elapsed = Date.now() - startTime;
      if (elapsed >= FIREWORKS_ACTIVE_MS) {
        clearInterval(burstIntervalId);
        burstIntervalId = null;
        return;
      }

      burstIndex++;
      const x = window.innerWidth * (0.12 + Math.random() * 0.76);
      const y = window.innerHeight * (0.12 + Math.random() * 0.42);
      burst(x, y, 0.9 + Math.random() * 0.35);

      // Multi-stage secondary crackle
      if (Math.random() > 0.45) {
        const x2 = window.innerWidth * (0.18 + Math.random() * 0.64);
        const y2 = window.innerHeight * (0.14 + Math.random() * 0.38);
        setTimeout(() => {
          if (isRunning) burst(x2, y2, 0.8);
        }, 120);
      }

      if (burstIndex >= maxBursts) {
        clearInterval(burstIntervalId);
        burstIntervalId = null;
      }
    }, isMobile ? 320 : 250);

    // Hard Cleanup & Completion
    const triggerComplete = () => {
      if (finishTriggered) return;
      finishTriggered = true;
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

    triggerCleanupRef.current = triggerComplete;

    // 60FPS Physics & Render Loop
    const animate = () => {
      if (!isRunning) return;

      const elapsed = Date.now() - startTime;

      // Phase 1 -> Phase 2: At 5.0 seconds, initiate gradual 1.8s fade-out to reveal homepage
      if (elapsed >= FIREWORKS_ACTIVE_MS && !fadeTriggered) {
        fadeTriggered = true;
        setIsFadingOut(true);
      }

      // Phase 2 completion: At 6.8s (after full 1.8s fade-out), unmount cleanly
      if (elapsed >= TOTAL_MS) {
        triggerComplete();
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Motion streak clear
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter'; // luminous glow sparks

      // 1. Render radial flashes
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
        f.radius += 2.8;
        if (f.alpha <= 0) flashes.splice(i, 1);
      }

      // 2. Render particle streaks (they naturally decelerate and fade away)
      particles = particles.filter((p) => p.life > 0);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.px = p.x;
        p.py = p.y;

        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        const progress = p.life / p.maxLife;
        const alpha = Math.max(0, Math.min(1, progress * 1.35));
        const lightness = p.isGlitter && Math.random() > 0.4 ? 96 : p.lightness;

        ctx.strokeStyle = `hsla(${p.hue}, 100%, ${lightness}%, ${alpha})`;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // White-hot core
        ctx.fillStyle = `hsla(${p.hue}, 100%, 95%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Safety timeout backup
    const backupTimerId = setTimeout(() => {
      triggerComplete();
    }, TOTAL_MS + 400);

    return () => {
      isRunning = false;
      triggerCleanupRef.current = null;
      if (burstIntervalId) clearInterval(burstIntervalId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      clearTimeout(backupTimerId);
      window.removeEventListener('resize', resize);
      particles = [];
      flashes = [];
    };
  }, []);

  return (
    <div
      className={`firework-celebration-overlay ${isFadingOut ? 'fade-out' : ''}`}
      role="dialog"
      aria-label="Vinayaka Chavithi Festival Celebration"
    >
      {/* Background Radiance Glow */}
      <div className="firework-celebration-backdrop-glow" />

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="firework-celebration-canvas" />

      {/* Floating Top-Right Skip Intro Button */}
      <button
        type="button"
        className="celebration-skip-intro-btn"
        onClick={handleSkipIntro}
        aria-label="Skip Intro Animation"
        title="Skip intro & enter homepage"
      >
        <span>Skip Intro</span>
        <FastForward size={14} style={{ strokeWidth: 2.4 }} />
      </button>

      {/* Center Sacred Festival Message */}
      <div className="firework-celebration-content">
        <div className="celebration-sacred-symbol">🕉️</div>
        <div>
          <div className="celebration-pill-tag">
            ✨ {festivalYear} Grand Utsav ✨
          </div>
        </div>
        <h1 className="celebration-main-title">
          {festivalName || 'Vinayaka Chavithi'}
        </h1>
        <h2 className="celebration-sub-title">
          🎉 The Grand Celebrations Begin! 🎉
        </h2>
        <p className="celebration-blessing">
          May Lord Vighnaharta Ganesha bless you and your family with boundless joy, peace, health, and prosperity!
        </p>
        <button
          type="button"
          className="celebration-enter-btn"
          onClick={handleSkipIntro}
          aria-label="Skip Intro & Enter"
        >
          <span>Skip Intro & Enter</span>
          <FastForward size={14} style={{ strokeWidth: 2.2 }} />
        </button>
      </div>
    </div>
  );
};

export default FireworkCelebration;
