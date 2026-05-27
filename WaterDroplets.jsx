import { useEffect, useRef } from 'react';

/**
 * WaterDroplets — animated canvas-based falling water drops
 * Add this to any page for ambient water effect.
 */
export default function WaterDroplets({ opacity = 0.55 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Build drop pool
    const COUNT = 38;
    const drops = Array.from({ length: COUNT }, () => makeDropl(canvas));

    function makeDropl(canvas, fromTop = false) {
      const r = 2 + Math.random() * 5;
      return {
        x: Math.random() * canvas.width,
        y: fromTop ? -20 : Math.random() * canvas.height,
        r,
        vy: 0.4 + Math.random() * 1.4,
        vx: (Math.random() - 0.5) * 0.3,
        opacity: 0.15 + Math.random() * 0.55,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.015 + Math.random() * 0.025,
        // tail length relative to speed
        tail: 6 + Math.random() * 18,
      };
    }

    function drawDrop(d) {
      // Tail
      const tailGrad = ctx.createLinearGradient(d.x, d.y - d.tail, d.x, d.y);
      tailGrad.addColorStop(0, `rgba(74,158,255,0)`);
      tailGrad.addColorStop(1, `rgba(74,158,255,${d.opacity * 0.6})`);
      ctx.beginPath();
      ctx.moveTo(d.x - d.r * 0.3, d.y - d.tail);
      ctx.lineTo(d.x + d.r * 0.3, d.y - d.tail);
      ctx.lineTo(d.x + d.r * 0.5, d.y);
      ctx.lineTo(d.x - d.r * 0.5, d.y);
      ctx.closePath();
      ctx.fillStyle = tailGrad;
      ctx.fill();

      // Drop body — teardrop shape
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      const bodyGrad = ctx.createRadialGradient(d.x - d.r * 0.3, d.y - d.r * 0.3, 0, d.x, d.y, d.r);
      bodyGrad.addColorStop(0, `rgba(180,220,255,${d.opacity})`);
      bodyGrad.addColorStop(0.6, `rgba(74,158,255,${d.opacity * 0.85})`);
      bodyGrad.addColorStop(1, `rgba(30,90,180,${d.opacity * 0.4})`);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Specular highlight
      ctx.beginPath();
      ctx.arc(d.x - d.r * 0.35, d.y - d.r * 0.35, d.r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${d.opacity * 0.7})`;
      ctx.fill();
    }

    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drops.forEach((d, i) => {
        d.wobble += d.wobbleSpeed;
        d.x += d.vx + Math.sin(d.wobble) * 0.15;
        d.y += d.vy;
        drawDrop(d);

        // Splash & reset when hitting bottom
        if (d.y - d.r > canvas.height + 20) {
          drops[i] = makeDropl(canvas, true);
        }
      });

      animId = requestAnimationFrame(step);
    }

    step();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
      }}
    />
  );
}
