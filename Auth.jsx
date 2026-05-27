import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import RotatingBackground from '../components/RotatingBackground';

export default function Auth({ onLogin }) {
  const [authStep, setAuthStep] = useState('select_role');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (authStep === 'login_admin') {
        const cred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        onLogin(cred.user.displayName || formData.email.split('@')[0], 'admin');
        navigate('/');
      } else {
        const citizenName = formData.name.trim();
        if (!citizenName) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }

        // Passwordless citizen login (completely immune to all Firebase Auth errors/provider restrictions)
        const citizenUID = `citizen_${citizenName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
        const citizenEmail = `${citizenUID}@lavasa.gov.in`;

        // Save citizen details to Firestore in the 'users' collection without a password
        await setDoc(doc(db, 'users', citizenUID), {
          name: citizenName,
          email: citizenEmail,
          role: 'citizen',
          createdAt: serverTimestamp()
        });

        onLogin(citizenName, 'citizen');
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>
      <RotatingBackground />
      
      <div style={{ width: '100%', maxWidth: '440px', padding: '0 16px', position: 'relative', zIndex: 1 }}>
        
        {/* Logo + Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2" style={{ borderColor: '#30363d' }}>
            <img src="/lavasa-logo.jpg" alt="Lavasa Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white font-bold text-2xl tracking-wide">LAVASA WATER CORP</h1>
          <p className="mono-label mt-1">CONTROL ROOM ACCESS PORTAL</p>
        </div>

        {/* Card */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '32px' }}>

          {authStep === 'select_role' ? (
            <>
              <h2 className="text-[#e6edf3] font-semibold text-sm mb-1">Select Access Mode</h2>
              <p className="text-[#8b949e] text-xs mb-6">Choose your terminal authentication type to proceed.</p>
              
              <div className="flex flex-col gap-3">
                {/* Citizen */}
                <button
                  onClick={() => setAuthStep('register_citizen')}
                  className="flex items-center justify-between w-full p-4 rounded-md text-left transition-all group"
                  style={{ background: '#1c2129', border: '1px solid #30363d', borderRadius: '6px' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#4a9eff'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>person</span>
                    <div>
                      <div className="text-[#e6edf3] text-sm font-medium">Citizen Portal</div>
                      <div className="mono-label">Public access — submit reports</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#484f58]" style={{ fontSize: '18px' }}>arrow_forward</span>
                </button>

                {/* Admin */}
                <button
                  onClick={() => setAuthStep('login_admin')}
                  className="flex items-center justify-between w-full p-4 rounded-md text-left transition-all"
                  style={{ background: 'rgba(74,158,255,0.08)', border: '1px solid rgba(74,158,255,0.3)', borderRadius: '6px' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,158,255,0.15)'; e.currentTarget.style.borderColor = '#4a9eff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,158,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(74,158,255,0.3)'; }}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>admin_panel_settings</span>
                    <div>
                      <div className="text-primary text-sm font-semibold">Command Center</div>
                      <div className="mono-label">Restricted — admin authentication required</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary opacity-60" style={{ fontSize: '18px' }}>arrow_forward</span>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Back + Title */}
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid #21262d' }}>
                <button type="button" onClick={() => { setAuthStep('select_role'); setError(''); }}
                  className="text-[#8b949e] hover:text-[#e6edf3] transition-colors flex items-center">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                </button>
                <div>
                  <h2 className="text-[#e6edf3] font-semibold text-sm">
                    {authStep === 'login_admin' ? 'Command Center Login' : 'Enter Citizen Portal'}
                  </h2>
                  <p className="mono-label">
                    {authStep === 'login_admin' ? 'ADMIN · RESTRICTED ACCESS' : 'CITIZEN · INSTANT ACCESS'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  {error}
                </div>
              )}

              {/* Name field — citizens only */}
              {authStep === 'register_citizen' && (
                <div className="mb-4">
                  <label className="block mono-label mb-1.5">FULL NAME</label>
                  <input type="text" name="name" required value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Devansh Sharma"
                    style={{ background: '#0d1117', border: '1px solid #30363d', color: '#e6edf3', borderRadius: '6px', padding: '10px 14px', width: '100%', fontSize: '14px', fontFamily: 'Inter, sans-serif', display: 'block' }}
                    onFocus={e => e.target.style.borderColor = '#4a9eff'}
                    onBlur={e => e.target.style.borderColor = '#30363d'}
                  />
                </div>
              )}

              {authStep === 'login_admin' && (
                <div className="mb-4">
                  <label className="block mono-label mb-1.5">EMAIL ADDRESS</label>
                  <input type="email" name="email" required value={formData.email}
                    onChange={handleInputChange}
                    placeholder="user@lavasa.gov.in"
                    style={{ background: '#0d1117', border: '1px solid #30363d', color: '#e6edf3', borderRadius: '6px', padding: '10px 14px', width: '100%', fontSize: '14px', fontFamily: 'Inter, sans-serif', display: 'block' }}
                    onFocus={e => e.target.style.borderColor = '#4a9eff'}
                    onBlur={e => e.target.style.borderColor = '#30363d'}
                  />
                </div>
              )}

              {authStep === 'login_admin' && (
                <div className="mb-6">
                  <label className="block mono-label mb-1.5">PASSWORD</label>
                  <input type="password" name="password" required value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    style={{ background: '#0d1117', border: '1px solid #30363d', color: '#e6edf3', borderRadius: '6px', padding: '10px 14px', width: '100%', fontSize: '14px', fontFamily: 'Inter, sans-serif', display: 'block' }}
                    onFocus={e => e.target.style.borderColor = '#4a9eff'}
                    onBlur={e => e.target.style.borderColor = '#30363d'}
                  />
                </div>
              )}

              <button disabled={loading} type="submit"
                className="w-full py-2.5 flex items-center justify-center gap-2 font-semibold text-sm rounded-md transition-all disabled:opacity-50"
                style={{ background: '#4a9eff', color: '#0d1117', borderRadius: '6px' }}
                onMouseEnter={e => !loading && (e.currentTarget.style.background = '#38bdf8')}
                onMouseLeave={e => (e.currentTarget.style.background = '#4a9eff')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>fingerprint</span>
                {loading ? 'Authenticating...' : (authStep === 'login_admin' ? 'Initiate Link' : 'Enter Portal')}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center mono-label mt-6">
          © 2026 Lavasa Corporation · Utility Management Division
        </p>
      </div>
    </div>
  );
}
