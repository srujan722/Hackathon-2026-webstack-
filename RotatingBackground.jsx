/**
 * RotatingBackground — subtle ambient motion graphics
 * Renders behind all page content. Control Room theme.
 */
export default function RotatingBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── Blue dot grid ─────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(74,158,255,0.06) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* ── Top-right large slow ring ─────────── */}
      <div style={{
        position: 'absolute',
        top: '-180px', right: '-180px',
        width: '600px', height: '600px',
        borderRadius: '50%',
        border: '1px solid rgba(74,158,255,0.07)',
        animation: 'bg-spin-cw 60s linear infinite',
      }} />
      <div style={{
        position: 'absolute',
        top: '-120px', right: '-120px',
        width: '480px', height: '480px',
        borderRadius: '50%',
        border: '1px dashed rgba(74,158,255,0.05)',
        animation: 'bg-spin-ccw 45s linear infinite',
      }} />
      <div style={{
        position: 'absolute',
        top: '-60px', right: '-60px',
        width: '360px', height: '360px',
        borderRadius: '50%',
        border: '1px solid rgba(74,158,255,0.04)',
        animation: 'bg-spin-cw 30s linear infinite',
      }} />

      {/* ── Bottom-left large slow ring ────────── */}
      <div style={{
        position: 'absolute',
        bottom: '-200px', left: '-200px',
        width: '700px', height: '700px',
        borderRadius: '50%',
        border: '1px solid rgba(74,158,255,0.05)',
        animation: 'bg-spin-ccw 80s linear infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-130px', left: '-130px',
        width: '500px', height: '500px',
        borderRadius: '50%',
        border: '1px dashed rgba(74,158,255,0.04)',
        animation: 'bg-spin-cw 55s linear infinite',
      }} />

      {/* ── Center ambient glow blob ───────────── */}
      <div style={{
        position: 'absolute',
        top: '30%', left: '55%',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,158,255,0.03) 0%, transparent 65%)',
        transform: 'translate(-50%, -50%)',
        animation: 'bg-pulse 8s ease-in-out infinite',
      }} />

      {/* ── Radar arc (top-right) ──────────────── */}
      <svg
        style={{
          position: 'absolute',
          top: 0, right: 0,
          width: '420px', height: '420px',
          opacity: 0.35,
          animation: 'bg-spin-cw 25s linear infinite',
          transformOrigin: '0px 0px',
        }}
        viewBox="0 0 420 420"
        fill="none"
      >
        {/* Arcs */}
        <circle cx="0" cy="0" r="140" stroke="#4a9eff" strokeWidth="0.5" strokeDasharray="4 8" />
        <circle cx="0" cy="0" r="210" stroke="#4a9eff" strokeWidth="0.3" strokeDasharray="2 12" />
        <circle cx="0" cy="0" r="280" stroke="#4a9eff" strokeWidth="0.3" strokeDasharray="3 10" />
        {/* Sweep line */}
        <line x1="0" y1="0" x2="300" y2="0" stroke="#4a9eff" strokeWidth="0.5" opacity="0.6" />
        {/* Tick marks */}
        {[30,60,90,120,150,180,210,240,270,300,330].map(deg => (
          <line
            key={deg}
            x1="0" y1="0"
            x2={Math.cos(deg * Math.PI / 180) * 290}
            y2={Math.sin(deg * Math.PI / 180) * 290}
            stroke="#4a9eff" strokeWidth="0.2" opacity="0.3"
          />
        ))}
      </svg>

      {/* ── Small radar arc (bottom-left) ─────── */}
      <svg
        style={{
          position: 'absolute',
          bottom: 0, left: 0,
          width: '320px', height: '320px',
          opacity: 0.2,
          animation: 'bg-spin-ccw 40s linear infinite',
          transformOrigin: '320px 320px',
        }}
        viewBox="0 0 320 320"
        fill="none"
      >
        <circle cx="320" cy="320" r="100" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="3 8" />
        <circle cx="320" cy="320" r="160" stroke="#38bdf8" strokeWidth="0.3" strokeDasharray="2 12" />
        <circle cx="320" cy="320" r="220" stroke="#38bdf8" strokeWidth="0.3" strokeDasharray="3 8" />
        <line x1="320" y1="320" x2="320" y2="100" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
      </svg>

      {/* ── Horizontal scan line ───────────────── */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(74,158,255,0.15) 40%, rgba(74,158,255,0.15) 60%, transparent 100%)',
        animation: 'scan-line 12s ease-in-out infinite',
        top: '50%',
      }} />

      {/* ── Inline keyframes (scoped to this component) ── */}
      <style>{`
        @keyframes bg-spin-cw  { to { transform: rotate(360deg); } }
        @keyframes bg-spin-ccw { to { transform: rotate(-360deg); } }
        @keyframes bg-pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes scan-line {
          0%   { top: 10%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
