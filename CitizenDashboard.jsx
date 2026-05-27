import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, onSnapshot, orderBy, where } from 'firebase/firestore';

const inputStyle = {
  background: '#0d1117',
  border: '1px solid #30363d',
  color: '#e6edf3',
  borderRadius: '6px',
  padding: '10px 14px',
  width: '100%',
  fontSize: '14px',
  fontFamily: 'Inter, sans-serif',
  display: 'block',
  outline: 'none',
  transition: 'border-color 0.15s ease',
};

const SEVERITY_CONFIG = {
  Low:    { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)', icon: 'info' },
  Medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  icon: 'warning' },
  High:   { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', icon: 'crisis_alert' },
};

export default function CitizenDashboard({ userName }) {
  const [formData, setFormData] = useState({ sector: '', description: '', severity: 'Medium', name: userName || '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [myComplaints, setMyComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('submit');
  const [activeExpanded, setActiveExpanded] = useState(null);
  const [resolvedToasts, setResolvedToasts] = useState([]);  // [{id, description}]
  const prevStatusRef = useRef({});  // track previous statuses

  // Live fetch — only THIS citizen's complaints + persistent resolved alerts
  useEffect(() => {
    if (!userName) return;
    const q = query(
      collection(db, 'complaints'),
      orderBy('created_at', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const updated = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Load already seen resolved complaint IDs from localStorage
      const seenResolvedJson = localStorage.getItem(`lwc_seen_resolved_${userName}`) || '[]';
      let seenResolved = [];
      try {
        seenResolved = JSON.parse(seenResolvedJson);
      } catch (e) {
        seenResolved = [];
      }

      // Detect resolved complaints that have not been acknowledged/seen by the citizen yet
      const newlyResolved = updated.filter(c =>
        c.status === 'Resolved' && c.citizenName === userName && !seenResolved.includes(c.id)
      );

      if (newlyResolved.length > 0) {
        // Trigger visual alerts and system notifications
        newlyResolved.forEach(c => {
          // Native browser alert
          alert(`✅ RESOLVED PROBLEM NOTIFICATION\n\nYour complaint has been successfully resolved!\n\nSector: ${c.sector || 'N/A'}\nDescription: ${c.description}\n\nCommand Center Action: ${c.adminReply || 'Completed successfully.'}`);
          
          // Native desktop HTML5 notification
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('✅ Lavasa Water Corp: Issue Resolved!', {
                body: `Your complaint in ${c.sector || 'your area'} has been marked as resolved.`,
                icon: '/lavasa-logo.jpg'
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  new Notification('✅ Lavasa Water Corp: Issue Resolved!', {
                    body: `Your complaint in ${c.sector || 'your area'} has been marked as resolved.`,
                    icon: '/lavasa-logo.jpg'
                  });
                }
              });
            }
          }
        });

        // Push new resolutions to the UI toast alerts list
        setResolvedToasts(prev => [
          ...prev,
          ...newlyResolved.map(c => ({ id: c.id, description: c.description, reply: c.adminReply }))
        ]);

        // Save newly acknowledged resolved IDs to localStorage seen list
        const updatedSeen = [...new Set([...seenResolved, ...newlyResolved.map(c => c.id)])];
        localStorage.setItem(`lwc_seen_resolved_${userName}`, JSON.stringify(updatedSeen));
      }

      // Store current statuses to preserve compatibility with standard rendering
      prevStatusRef.current = Object.fromEntries(updated.map(c => [c.id, c.status]));
      setMyComplaints(updated);
    });
    return () => unsub();
  }, [userName]);

  const dismissToast = (id) => setResolvedToasts(prev => prev.filter(t => t.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await addDoc(collection(db, 'complaints'), {
        ...formData,
        citizenName: userName,
        status: 'Pending',
        created_at: serverTimestamp(),
        location: { lat: 18.4 + (Math.random() * 0.02), lng: 73.5 + (Math.random() * 0.02) }
      });
      setSuccess(true);
      setFormData({ sector: '', description: '', severity: 'Medium', name: userName || '' });
      setTimeout(() => setActiveTab('track'), 1200);
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s) => s === 'Resolved' ? '#4ade80' : s === 'In Progress' ? '#fbbf24' : '#f87171';
  const severityConf = SEVERITY_CONFIG[formData.severity] || SEVERITY_CONFIG.Medium;

  return (
    <main style={{ paddingTop: '48px', minHeight: '100vh', padding: '60px 24px 32px', position: 'relative', zIndex: 1 }}>

      {/* ── Resolved Toast Notifications ─────── */}
      {resolvedToasts.length > 0 && (
        <div style={{ position: 'fixed', top: '60px', right: '20px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px' }}>
          {resolvedToasts.map(toast => (
            <div key={toast.id} style={{ background: '#0d1117', border: '1px solid rgba(74,222,128,0.5)', borderRadius: '10px', padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'fadeInRight 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4ade80' }}>check_circle</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>✅ Issue Resolved!</div>
                  <div style={{ color: '#8b949e', fontSize: '12px', lineHeight: '1.5', marginBottom: '8px' }}>
                    Your report has been resolved by the Command Center.
                  </div>
                  {toast.description && (
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#484f58', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Report: {toast.description}</div>
                  )}
                  {toast.reply && (
                    <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '6px', padding: '8px 10px', fontSize: '12px', color: '#e6edf3', lineHeight: '1.5' }}>
                      <span style={{ color: '#4ade80', fontWeight: 600 }}>Admin: </span>{toast.reply}
                    </div>
                  )}
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setActiveTab('track'); dismissToast(toast.id); }}
                      style={{ padding: '5px 12px', background: '#4ade80', border: 'none', borderRadius: '5px', color: '#0d1117', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      View Case
                    </button>
                    <button onClick={() => dismissToast(toast.id)}
                      style={{ padding: '5px 10px', background: 'transparent', border: '1px solid #30363d', borderRadius: '5px', color: '#8b949e', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── Page header ─────────────────── */}
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#4a9eff', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
              ◉ CITIZEN SERVICES PORTAL — LAVASA WATER CORP
            </div>
            <h1 style={{ color: '#e6edf3', fontWeight: 700, fontSize: '24px', margin: 0 }}>
              Complaint Portal for Locals of Lavasa
            </h1>
            <p style={{ color: '#8b949e', fontSize: '13px', marginTop: '4px' }}>
              Welcome back, <span style={{ color: '#4a9eff' }}>{userName}</span>. Submit reports directly to the Command Center.
            </p>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'TOTAL REPORTS', value: myComplaints.length, icon: 'report' },
              { label: 'PENDING', value: myComplaints.filter(c => c.status === 'Pending').length, icon: 'schedule' },
              { label: 'RESOLVED', value: myComplaints.filter(c => c.status === 'Resolved').length, icon: 'check_circle' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '8px', padding: '12px 18px', minWidth: '120px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4a9eff', display: 'block', marginBottom: '4px' }}>{stat.icon}</span>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 700, color: '#e6edf3' }}>{stat.value}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#8b949e', letterSpacing: '0.08em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab switcher ───────────────── */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '24px', background: '#161b22', border: '1px solid #21262d', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
          {[
            { id: 'submit', label: 'Submit Report', icon: 'edit_note' },
            { id: 'track',  label: 'Track Cases',   icon: 'manage_search' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '6px', border: 'none',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                background: activeTab === tab.id ? '#4a9eff' : 'transparent',
                color: activeTab === tab.id ? '#0d1117' : '#8b949e',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SUBMIT TAB ──────────────────── */}
        {activeTab === 'submit' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>

            {/* Form card */}
            <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', overflow: 'hidden' }}>

              {/* Card header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4a9eff' }}>report_problem</span>
                <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: '15px' }}>File New Incident Report</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#484f58' }}>
                  RPT-{String(Date.now()).slice(-6)}
                </span>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '20px' }}>

                {success && (
                  <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#4ade80', fontSize: '13px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                    Report transmitted successfully! Redirecting to case tracker...
                  </div>
                )}
                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', color: '#f87171', fontSize: '13px' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      RESIDENT NAME
                    </label>
                    <input
                      type="text" value={formData.name} readOnly
                      style={{ ...inputStyle, color: '#8b949e', cursor: 'not-allowed' }}
                    />
                  </div>
                  {/* Sector */}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      SECTOR / ZONE *
                    </label>
                    <select required value={formData.sector}
                      onChange={e => setFormData({ ...formData, sector: e.target.value })}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      onFocus={e => e.target.style.borderColor = '#4a9eff'}
                      onBlur={e => e.target.style.borderColor = '#30363d'}
                    >
                      <option value="">Select sector...</option>
                      <option value="Sector 1 - Dasve">Sector 1 – Dasve</option>
                      <option value="Sector 2 - Mugaon">Sector 2 – Mugaon</option>
                      <option value="Sector 3 - Dhamanhol">Sector 3 – Dhamanhol</option>
                      <option value="Sector 4 - Gadle">Sector 4 – Gadle</option>
                      <option value="Sector 5 - Bhoini">Sector 5 – Bhoini</option>
                    </select>
                  </div>
                </div>

                {/* Severity selector */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    SEVERITY LEVEL *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {['Low', 'Medium', 'High'].map(sev => {
                      const conf = SEVERITY_CONFIG[sev];
                      const active = formData.severity === sev;
                      return (
                        <button key={sev} type="button" onClick={() => setFormData({ ...formData, severity: sev })}
                          style={{
                            padding: '10px 8px', borderRadius: '6px', cursor: 'pointer',
                            border: `1px solid ${active ? conf.color : '#30363d'}`,
                            background: active ? conf.bg : 'transparent',
                            color: active ? conf.color : '#8b949e',
                            fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{conf.icon}</span>
                          {sev}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Issue type quick-select */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    ISSUE TYPE
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['No Water Supply', 'Low Pressure', 'Pipe Burst', 'Water Quality', 'Leakage', 'Other'].map(tag => (
                      <button key={tag} type="button"
                        onClick={() => setFormData({ ...formData, description: formData.description ? formData.description : tag + ': ' })}
                        style={{
                          padding: '4px 10px', borderRadius: '20px', border: '1px solid #30363d',
                          background: 'transparent', color: '#8b949e', fontSize: '12px',
                          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => { e.target.style.borderColor = '#4a9eff'; e.target.style.color = '#4a9eff'; }}
                        onMouseLeave={e => { e.target.style.borderColor = '#30363d'; e.target.style.color = '#8b949e'; }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    INCIDENT DESCRIPTION *
                  </label>
                  <textarea required rows={4} value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the issue in detail — location, duration, impact..."
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
                    onFocus={e => e.target.style.borderColor = '#4a9eff'}
                    onBlur={e => e.target.style.borderColor = '#30363d'}
                  />
                </div>

                {/* Submit */}
                <button disabled={loading} type="submit"
                  style={{
                    width: '100%', padding: '12px 20px',
                    background: loading ? '#30363d' : '#4a9eff',
                    color: loading ? '#8b949e' : '#0d1117',
                    border: 'none', borderRadius: '6px',
                    fontWeight: 700, fontSize: '13px',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.15s ease',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.background = '#38bdf8')}
                  onMouseLeave={e => !loading && (e.currentTarget.style.background = '#4a9eff')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                  {loading ? 'Transmitting to Command Center...' : 'Transmit Incident Report'}
                </button>
              </form>
            </div>

            {/* Right info panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Severity preview */}
              <div style={{ background: '#161b22', border: `1px solid ${severityConf.border}`, borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  SEVERITY PREVIEW
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: severityConf.color }}>{severityConf.icon}</span>
                  <div>
                    <div style={{ color: severityConf.color, fontWeight: 700, fontSize: '16px' }}>{formData.severity} Priority</div>
                    <div style={{ color: '#8b949e', fontSize: '12px' }}>
                      {formData.severity === 'Low' && 'Minor issue — response within 72 hrs'}
                      {formData.severity === 'Medium' && 'Moderate issue — response within 24 hrs'}
                      {formData.severity === 'High' && 'Critical issue — emergency response dispatched'}
                    </div>
                  </div>
                </div>
                <div style={{ height: '3px', background: '#21262d', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: severityConf.color, borderRadius: '2px', width: formData.severity === 'Low' ? '30%' : formData.severity === 'Medium' ? '65%' : '100%', transition: 'width 0.4s ease' }} />
                </div>
              </div>

              {/* Helpline */}
              <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  HELPLINES
                </div>
                {[
                  { label: 'Emergency Water', number: '1800-103-4567', icon: 'local_fire_department', color: '#f87171' },
                  { label: 'General Support', number: '020-6789-0000', icon: 'support_agent', color: '#4a9eff' },
                  { label: 'WhatsApp Bot',    number: '+91-98765-43210', icon: 'chat', color: '#4ade80' },
                ].map(h => (
                  <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #21262d' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: h.color }}>{h.icon}</span>
                    <div>
                      <div style={{ color: '#8b949e', fontSize: '11px' }}>{h.label}</div>
                      <div style={{ color: '#e6edf3', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600 }}>{h.number}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div style={{ background: 'rgba(74,158,255,0.05)', border: '1px solid rgba(74,158,255,0.15)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4a9eff' }}>tips_and_updates</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#4a9eff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>TIPS</span>
                </div>
                {['Be specific about the location street / house number', 'Mention since when the issue started', 'High severity reports are prioritised'].map(t => (
                  <div key={t} style={{ display: 'flex', gap: '8px', marginBottom: '6px', color: '#8b949e', fontSize: '12px' }}>
                    <span style={{ color: '#4a9eff', flexShrink: 0 }}>›</span> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TRACK TAB ──────────────────── */}
        {activeTab === 'track' && (
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4a9eff' }}>manage_search</span>
              <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: '15px' }}>Active Case Tracker</span>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                {[['#f87171','PENDING'],['#fbbf24','IN PROGRESS'],['#4ade80','RESOLVED']].map(([col, label]) => (
                  <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: col, background: `${col}15`, border: `1px solid ${col}30`, padding: '3px 8px', borderRadius: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: col, display: 'inline-block' }} />
                    {label}
                  </span>
                ))}
              </span>
            </div>

            {myComplaints.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#30363d', display: 'block', marginBottom: '12px' }}>inbox</span>
                <p style={{ color: '#8b949e', fontSize: '14px' }}>No reports filed yet. Submit your first report above.</p>
              </div>
            ) : (
              <div>
                {myComplaints.map((c, i) => {
                  const statusCol = c.status === 'Resolved' ? '#4ade80' : c.status === 'In Progress' ? '#fbbf24' : '#f87171';
                  const sevColor  = SEVERITY_CONFIG[c.severity]?.color || '#8b949e';
                  const hasReply  = !!c.adminReply;
                  const dateStr = c.created_at?.toDate ? c.created_at.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
                  const timeStr = c.created_at?.toDate ? c.created_at.toDate().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <div key={c.id} style={{ borderBottom: '1px solid #21262d' }}>
                      {/* Row */}
                      <div
                        style={{ display: 'grid', gridTemplateColumns: '110px 1fr 90px 90px 110px 40px', alignItems: 'center', padding: '12px 16px', background: i % 2 === 0 ? 'transparent' : 'rgba(22,27,34,0.4)', cursor: 'pointer', transition: 'background 0.12s', gap: '8px' }}
                        onClick={() => setActiveExpanded(activeExpanded === c.id ? null : c.id)}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,158,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(22,27,34,0.4)'}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#4a9eff' }}>#{c.id.slice(-6).toUpperCase()}</span>
                          <span style={{ fontSize: '10px', color: '#484f58' }}>{dateStr} {timeStr}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                          <span style={{ color: '#8b949e', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.description}>{c.description}</span>
                          <span style={{ fontSize: '10px', color: '#8b949e', opacity: 0.8 }}>By: {c.citizenName || 'Unknown User'}</span>
                        </div>
                        <span style={{ color: '#e6edf3', fontSize: '12px' }}>{c.sector || '—'}</span>
                        <span style={{ color: sevColor, fontSize: '12px', fontWeight: 600 }}>{c.severity || '—'}</span>
                        <span style={{ color: statusCol, fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', background: `${statusCol}15`, border: `1px solid ${statusCol}30`, padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                          {c.status || 'Pending'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {hasReply
                            ? <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4ade80' }} title="Admin replied">mark_email_read</span>
                            : <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#30363d' }}>expand_more</span>
                          }
                        </span>
                      </div>

                      {/* Expanded reply panel */}
                      {activeExpanded === c.id && (
                        <div style={{ padding: '16px 20px', background: '#0d1117', borderTop: '1px solid #21262d' }}>
                          {/* Full description */}
                          <div style={{ marginBottom: '14px', display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#484f58', letterSpacing: '0.08em', marginBottom: '5px' }}>FULL DESCRIPTION</div>
                              <p style={{ color: '#e6edf3', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{c.description}</p>
                            </div>
                            <div style={{ width: '150px' }}>
                              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#484f58', letterSpacing: '0.08em', marginBottom: '5px' }}>REPORTED BY</div>
                              <p style={{ color: '#e6edf3', fontSize: '13px', margin: 0 }}>{c.citizenName || 'Unknown User'}</p>
                            </div>
                          </div>

                          {/* Admin Reply */}
                          {hasReply ? (
                            <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '8px', padding: '14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4ade80' }}>support_agent</span>
                                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#4ade80', letterSpacing: '0.08em' }}>COMMAND CENTER RESPONSE</span>
                                {c.repliedAt?.toDate && (
                                  <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#484f58' }}>
                                    {c.repliedAt.toDate().toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <p style={{ color: '#e6edf3', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>{c.adminReply}</p>
                            </div>
                          ) : (
                            <div style={{ background: 'rgba(74,158,255,0.05)', border: '1px dashed rgba(74,158,255,0.2)', borderRadius: '8px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#30363d' }}>hourglass_top</span>
                              <div>
                                <div style={{ color: '#8b949e', fontSize: '13px' }}>Awaiting response from the Command Center</div>
                                <div style={{ color: '#484f58', fontSize: '11px', marginTop: '2px' }}>Our team will respond within 24 hours for high severity issues.</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div style={{ padding: '10px 18px', borderTop: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1117' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#484f58' }}>{myComplaints.length} CASE(S) FILED</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'radar-sweep 1.5s ease-out infinite' }} />
                LIVE SYNC ACTIVE
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
