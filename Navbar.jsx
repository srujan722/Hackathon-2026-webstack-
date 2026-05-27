import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onLogout, role }) {
  const location = useLocation();

  const adminNavItems = [
    { path: "/",           label: "Dashboard",     icon: "dashboard" },
    { path: "/monitoring", label: "Monitoring",     icon: "sensors" },
    { path: "/assets",     label: "Assets",         icon: "precision_manufacturing" },
    { path: "/map",        label: "Infrastructure", icon: "account_tree" },
    { path: "/complaints", label: "Incident Logs",  icon: "warning" },
    { path: "/profile",    label: "Profile",        icon: "person" },
  ];

  const citizenNavItems = [
    { path: "/",        label: "Submit Report", icon: "report" },
  ];

  const navItems = role === 'admin' ? adminNavItems : citizenNavItems;

  return (
    <aside
      className="ctrl-sidebar"
      style={{
        position: 'fixed', left: 0, top: 0,
        height: '100%', width: '190px',
        zIndex: 50, display: 'flex', flexDirection: 'column',
      }}
    >
      {/* ── Brand / Logo ─────────────── */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border-subtle)' }}>

        {/* Spinning logo with orbit rings */}
        <div style={{ position: 'relative', width: '56px', height: '56px', margin: '0 auto 12px' }}>
          {/* Outer dashed orbit */}
          <div
            className="orbit-ccw"
            style={{
              position: 'absolute', inset: '-8px',
              borderRadius: '50%',
              border: '1px dashed var(--accent-border)',
              pointerEvents: 'none',
            }}
          />
          {/* Inner solid orbit */}
          <div
            className="orbit-cw"
            style={{
              position: 'absolute', inset: '-3px',
              borderRadius: '50%',
              border: '1px solid var(--accent-dim)',
              pointerEvents: 'none',
            }}
          />
          {/* The logo itself — slow smooth spin */}
          <div
            className="logo-slow-spin"
            style={{
              width: '56px', height: '56px',
              borderRadius: '50%', overflow: 'hidden',
              border: '2px solid var(--accent)',
              boxShadow: '0 0 12px var(--accent-dim)',
            }}
          >
            <img
              src="/lavasa-logo.jpg"
              alt="Lavasa Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>  
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.02em', lineHeight: '1.2' }}>
            Lavasa Water<br/>Corporation
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--accent)', marginTop: '4px', letterSpacing: '0.06em' }}>
            LWCP-01 ●
          </div>
        </div>
      </div>

      {/* ── Navigation ───────────────── */}
      <nav style={{ flexGrow: 1, padding: '8px 0', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`ctrl-nav-item${isActive ? ' active' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 16px', textDecoration: 'none', fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                marginLeft: isActive ? '-1px' : '0',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom section ────────────── */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 16px' }}>
        <button
          className="ctrl-nav-item"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 0', fontSize: '13px', cursor: 'pointer', borderRadius: '4px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>build</span>
          <span>Diagnostics</span>
        </button>
        <button
          className="ctrl-nav-item"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 0', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', marginBottom: '8px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help_outline</span>
          <span>User Guide</span>
        </button>

        {/* Emergency — admin only */}
        {role === 'admin' && (
          <button className="btn-emergency" style={{ marginBottom: '10px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>warning</span>
            Emergency Shutoff
          </button>
        )}

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            width: '100%', textAlign: 'left', background: 'none', border: 'none',
            padding: '6px 0', fontSize: '12px', cursor: 'pointer',
            color: 'var(--text-dim)', fontFamily: 'Inter, sans-serif',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
