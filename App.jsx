import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import Auth from './pages/Auth';
import Monitoring from './pages/Monitoring';
import Map from './pages/Map';
import Profile from './pages/Profile';
import Assets from './pages/Assets';
import CitizenDashboard from './pages/CitizenDashboard';
import RotatingBackground from './components/RotatingBackground';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);  // new: checking persisted session
  const [isLightMode, setIsLightMode] = useState(false);
  const [activeTheme, setActiveTheme] = useState('dark');
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Restore session on page load via Firebase Auth state
  useEffect(() => {
    const savedRole = localStorage.getItem('lwc_role');
    const savedName = localStorage.getItem('lwc_name');

    if (savedRole === 'citizen' && savedName) {
      // Citizens are restored instantly from client storage, avoiding Auth provider conflicts
      setUser({ name: savedName, role: 'citizen' });
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Restore role + name from localStorage (saved at login)
        if (savedRole && savedName) {
          setUser({ name: savedName, role: savedRole });
        }
      } else {
        // Only reset session if the active role wasn't citizen
        if (savedRole !== 'citizen') {
          setUser(null);
          localStorage.removeItem('lwc_role');
          localStorage.removeItem('lwc_name');
        }
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Admin Welcome + Live Incident Alerts
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    // 1. Welcome Alert detailing active pending complaints on login
    const triggerWelcomeAlert = async () => {
      try {
        const q = query(collection(db, 'complaints'), where('status', '==', 'Pending'));
        const snap = await getDocs(q);
        if (snap.size > 0) {
          alert(`🚨 Welcome back, Admin ${user.name}!\n\nThere are currently ${snap.size} pending complaints awaiting your immediate attention.`);
        } else {
          alert(`✅ Welcome back, Admin ${user.name}!\n\nAll citizen complaints are currently resolved.`);
        }
      } catch (err) {
        console.error("Error retrieving pending complaints count:", err);
      }
    };
    triggerWelcomeAlert();

    // 2. Real-time Live Listener for any new pending complaints dropped by citizens
    const qAll = query(collection(db, 'complaints'), orderBy('created_at', 'desc'));
    let isInitialLoad = true;
    
    const unsub = onSnapshot(qAll, (snap) => {
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const complaint = change.doc.data();
          if (complaint.status === 'Pending') {
            // Trigger a direct window alert
            alert(`🚨 NEW CITIZEN COMPLAINT DROPPED!\n\nReporter: ${complaint.citizenName || 'Citizen'}\nSector: ${complaint.sector}\nDescription: ${complaint.description}`);
            
            // Trigger standard HTML5 desktop notification
            if (Notification.permission === 'granted') {
              new Notification('🚨 New Complaint Alert!', {
                body: `Sector: ${complaint.sector}\nDescription: ${complaint.description}`,
                icon: '/lavasa-logo.jpg'
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission();
            }
          }
        }
      });
    });

    return () => unsub();
  }, [user]);

  const THEMES = [
    { id: 'dark',    label: 'Dark',    color: '#4a9eff', dot: '#0d1117' },
    { id: 'light',   label: 'Light',   color: '#0969da', dot: '#f6f8fa' },
    { id: 'ocean',   label: 'Ocean',   color: '#64ffda', dot: '#020c1b' },
    { id: 'emerald', label: 'Emerald', color: '#10b981', dot: '#030d08' },
    { id: 'sunset',  label: 'Sunset',  color: '#f97316', dot: '#0f0500' },
    { id: 'violet',  label: 'Violet',  color: '#a855f7', dot: '#080010' },
  ];

  const applyTheme = (themeId) => {
    // Remove all theme classes
    document.body.classList.remove('light-mode','theme-ocean','theme-emerald','theme-sunset','theme-violet');
    document.documentElement.classList.remove('light-mode','theme-ocean','theme-emerald','theme-sunset','theme-violet');
    if (themeId === 'light') {
      document.body.classList.add('light-mode');
      document.documentElement.classList.add('light-mode');
      setIsLightMode(true);
    } else {
      setIsLightMode(false);
      if (themeId !== 'dark') {
        document.body.classList.add(`theme-${themeId}`);
        document.documentElement.classList.add(`theme-${themeId}`);
      }
    }
    setActiveTheme(themeId);
    setShowThemePicker(false);
  };

  const toggleTheme = () => applyTheme(activeTheme === 'dark' ? 'light' : 'dark');

  const handleLogin = (name, role) => {
    setIsAuthenticating(true);
    localStorage.setItem('lwc_role', role);
    localStorage.setItem('lwc_name', name);
    // Simulate system processing/authentication load
    setTimeout(() => {
      setUser({ name, role });
      setIsAuthenticating(false);
    }, 3500);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error("Logout error:", e);
    }
    localStorage.removeItem('lwc_role');
    localStorage.removeItem('lwc_name');
    setUser(null);
  };

  if (authLoading) {
    return (
      <div style={{ background: '#0d1117', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', width: '120px', height: '120px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed rgba(74,158,255,0.4)', animation: 'spin-slow 10s linear infinite' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #4a9eff', boxShadow: '0 0 20px rgba(74,158,255,0.4)' }}>
            <img src="/lavasa-logo.jpg" alt="Lavasa Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        <div className="text-flicker" style={{ color: '#e6edf3', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          RESTORING CONTROL ROOM TERMINAL SESSION...
        </div>
      </div>
    );
  }

  if (!user && !isAuthenticating) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Auth onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  if (isAuthenticating) {
    return (
      <div style={{ background: '#0d1117', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', overflow: 'hidden', position: 'relative' }}>

        {/* Grid background overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(74,158,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,158,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none'
        }} />

        {/* Corner brackets */}
        <div style={{ position: 'absolute', top: 32, left: 32, width: 40, height: 40, borderTop: '2px solid #4a9eff', borderLeft: '2px solid #4a9eff', opacity: 0.5 }} />
        <div style={{ position: 'absolute', top: 32, right: 32, width: 40, height: 40, borderTop: '2px solid #4a9eff', borderRight: '2px solid #4a9eff', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: 32, left: 32, width: 40, height: 40, borderBottom: '2px solid #4a9eff', borderLeft: '2px solid #4a9eff', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: 32, right: 32, width: 40, height: 40, borderBottom: '2px solid #4a9eff', borderRight: '2px solid #4a9eff', opacity: 0.5 }} />

        {/* ── 3D Rotating Logo Area ── */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', width: '200px', height: '200px' }}>

          {/* Radar sweep rings */}
          <div className="radar-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(74,158,255,0.5)' }} />
          <div className="radar-ring-2" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(74,158,255,0.4)' }} />
          <div className="radar-ring-3" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(74,158,255,0.3)' }} />

          {/* Static orbit ring */}
          <div className="spin-slow" style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', border: '1px dashed rgba(74,158,255,0.2)' }} />
          <div className="spin-rev" style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: '1px solid rgba(74,158,255,0.15)' }} />

          {/* Glow backdrop */}
          <div style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,158,255,0.2) 0%, transparent 70%)', filter: 'blur(12px)' }} />

          {/* 3D Spinning Logo */}
          <div className="logo-3d-spin" style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #4a9eff', boxShadow: '0 0 40px rgba(74,158,255,0.6), 0 0 80px rgba(74,158,255,0.2)', zIndex: 10, flexShrink: 0 }}>
            <img src="/lavasa-logo.jpg" alt="Lavasa Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* Brand text */}
        <h1 className="text-flicker" style={{ color: '#e6edf3', fontWeight: 800, fontSize: '28px', letterSpacing: '0.25em', marginBottom: '6px', textTransform: 'uppercase' }}>
          LAVASA WATER CORP
        </h1>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#4a9eff', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '40px' }}>
          AUTHENTICATING CREDENTIALS...
        </p>

        {/* Loading progress bar */}
        <div style={{ width: '280px', height: '2px', background: '#21262d', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
          <div className="loading-bar" style={{ height: '100%', background: 'linear-gradient(90deg, #4a9eff, #38bdf8)', borderRadius: '2px', width: '0%' }} />
        </div>

        {/* Status line */}
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#484f58', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4a9eff', display: 'inline-block', animation: 'radar-sweep 1.5s ease-out infinite' }} />
          CONNECTING TO CONTROL ROOM...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen overflow-x-hidden text-on-surface font-body-md dark" style={{ position: 'relative' }}>
        <RotatingBackground />
        <Navbar onLogout={handleLogout} role={user.role} />
        
        <div className="flex-grow ml-[190px] flex flex-col" style={{ minHeight: '100vh', background: 'var(--bg-base)', transition: 'background 0.3s ease' }}>
          {/* Control Room Header Bar */}
          <header
            className="ctrl-header"
            style={{ position: 'fixed', top: 0, right: 0, left: '190px', zIndex: 40, height: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}
          >
            <div className="flex items-center gap-4">
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                {user.role === 'admin' ? 'Global Status — Command Center' : 'Citizen Services Portal'}
              </span>
              <div className="h-4 w-px mx-1" style={{ background: '#30363d' }}></div>
              <span className="status-healthy">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
                System Healthy
              </span>
              {user.role === 'admin' && (
                <span className="status-alert">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
                  2 Alerts
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <div className="relative flex items-center h-8 px-3 rounded text-sm" style={{ background: '#1c2129', border: '1px solid #30363d' }}>
                  <span className="material-symbols-outlined text-[#8b949e] mr-2" style={{ fontSize: '16px' }}>search</span>
                  <input className="bg-transparent border-none focus:outline-none text-[#e6edf3] text-xs w-48" placeholder="Search parameters..." type="text"/>
                </div>
              )}
              <div className="flex items-center gap-2">
                {/* Theme picker */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowThemePicker(p => !p)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: 'var(--bg-surface-high)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
                  >
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: THEMES.find(t => t.id === activeTheme)?.color, display: 'inline-block', boxShadow: `0 0 6px ${THEMES.find(t => t.id === activeTheme)?.color}` }} />
                    {THEMES.find(t => t.id === activeTheme)?.label}
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>palette</span>
                  </button>
                  {showThemePicker && (
                    <div style={{ position: 'absolute', top: '36px', right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', zIndex: 200, minWidth: '160px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.08em', padding: '0 6px 8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>SELECT THEME</div>
                      {THEMES.map(t => (
                        <button key={t.id} onClick={() => applyTheme(t.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '7px 8px', background: activeTheme === t.id ? 'var(--accent-dim)' : 'transparent', border: 'none', borderRadius: '5px', cursor: 'pointer', color: activeTheme === t.id ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: activeTheme === t.id ? 600 : 400 }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color, flexShrink: 0, boxShadow: activeTheme === t.id ? `0 0 8px ${t.color}` : 'none' }} />
                          {t.label}
                          {activeTheme === t.id && <span className="material-symbols-outlined" style={{ fontSize: '13px', marginLeft: 'auto' }}>check</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface-high)', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{isLightMode ? 'dark_mode' : 'light_mode'}</span>
                </button>
                <button className="flex items-center justify-center w-8 h-8 rounded transition-colors text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#1c2129]">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>notifications</span>
                </button>
                <button className="flex items-center justify-center w-8 h-8 rounded transition-colors text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#1c2129]">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
                </button>
                {user.role === 'admin' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden ml-1" style={{ border: '1px solid #30363d', cursor: 'pointer' }}>
                    <img alt="User" className="w-full h-full object-cover" src="/devansh-profile.jpg" />
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Routing */}
          <main className="pt-12" style={{ minHeight: 'calc(100vh - 48px)' }}>
            <Routes>
            {user.role === 'admin' ? (
              <>
                <Route path="/" element={<Dashboard userName={user.name} />} />
                <Route path="/complaints" element={<Complaints />} />
                <Route path="/monitoring" element={<Monitoring />} />
                <Route path="/map" element={<Map />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/profile" element={<Profile userName={user.name} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<CitizenDashboard userName={user.name} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
