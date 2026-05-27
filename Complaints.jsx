import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

const SEV = {
  High:   { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', icon: 'crisis_alert' },
  Medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  icon: 'warning' },
  Low:    { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)',  icon: 'info' },
};
const ST = {
  Pending:      { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
  'In Progress':{ color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)'  },
  Resolved:     { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)'  },
};

const inp = { background:'var(--bg-base)', border:'1px solid var(--border)', color:'var(--text-primary)', borderRadius:'6px', padding:'10px 14px', width:'100%', fontSize:'13px', fontFamily:'Inter,sans-serif', outline:'none' };

export default function Complaints() {
  const [complaints, setComplaints]   = useState([]);
  const [filter, setFilter]           = useState('All');
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState(null);   // open drawer
  const [replyText, setReplyText]     = useState('');
  const [saving, setSaving]           = useState(false);
  const [successMsg, setSuccessMsg]   = useState('');

  useEffect(() => {
    const q = query(collection(db,'complaints'), orderBy('created_at','desc'));
    return onSnapshot(q, snap =>
      setComplaints(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id, ...data,
          created_at: data.created_at?.toDate?.().toISOString() || new Date().toISOString(),
          resolvedAt: data.resolvedAt?.toDate?.().toISOString() || data.resolvedAt || null
        };
      }))
    );
  }, []);

  // When drawer opens, pre-fill reply if one exists
  const openDrawer = (c) => { setSelected(c); setReplyText(c.adminReply || ''); setSuccessMsg(''); };
  const closeDrawer = () => { setSelected(null); setReplyText(''); setSuccessMsg(''); };

  const updateStatus = async (id, status) => {
    const updateData = { status };
    if (status === 'Resolved') updateData.resolvedAt = serverTimestamp();
    await updateDoc(doc(db,'complaints',id), updateData);
    if (selected?.id === id) setSelected(p => ({ ...p, status, ...(status === 'Resolved' && { resolvedAt: new Date().toISOString() }) }));
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSaving(true);
    try {
      const newStatus = selected.status === 'Pending' ? 'In Progress' : selected.status;
      const updateData = {
        adminReply: replyText.trim(),
        repliedAt: serverTimestamp(),
        status: newStatus,
      };
      if (newStatus === 'Resolved') updateData.resolvedAt = serverTimestamp();
      
      await updateDoc(doc(db,'complaints',selected.id), updateData);
      setSelected(p => ({ ...p, adminReply: replyText.trim(), status: newStatus, ...(newStatus === 'Resolved' && { resolvedAt: new Date().toISOString() }) }));
      setSuccessMsg('Reply sent! Status updated.');
    } catch { setSuccessMsg('Error saving reply.'); }
    finally { setSaving(false); }
  };

  const counts = { All: complaints.length, Pending: complaints.filter(c=>c.status==='Pending').length, 'In Progress': complaints.filter(c=>c.status==='In Progress').length, Resolved: complaints.filter(c=>c.status==='Resolved').length };
  const filtered = complaints.filter(c => {
    const mf = filter==='All' || c.status===filter;
    const ms = !search || [c.name,c.sector,c.description].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return mf && ms;
  });

  return (
    <main style={{ paddingTop:'60px', minHeight:'100vh', padding:'60px 24px 40px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:'1300px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom:'24px' }}>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'11px', color:'var(--accent)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'6px' }}>◉ INCIDENT MANAGEMENT — REAL-TIME</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <h1 style={{ color:'var(--text-primary)', fontWeight:700, fontSize:'24px', margin:'0 0 4px' }}>Incident Log &amp; Dispatch</h1>
              <p style={{ color:'var(--text-secondary)', fontSize:'13px', margin:0 }}>Click any row to view details and send a reply to the citizen.</p>
            </div>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {[['TOTAL',counts.All,'var(--accent)'],['PENDING',counts.Pending,'#f87171'],['IN PROGRESS',counts['In Progress'],'#fbbf24'],['RESOLVED',counts.Resolved,'#4ade80']].map(([l,v,c])=>(
                <div key={l} style={{ background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', borderRadius:'8px', padding:'10px 16px', textAlign:'center', minWidth:'90px' }}>
                  <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'22px', fontWeight:700, color:c }}>{v}</div>
                  <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'9px', color:'var(--text-dim)', letterSpacing:'0.08em' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', borderRadius:'10px 10px 0 0', padding:'12px 18px', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', borderBottom:'none' }}>
          <span className="material-symbols-outlined" style={{ fontSize:'16px', color:'var(--accent)' }}>manage_search</span>
          <span style={{ color:'var(--text-primary)', fontWeight:600, fontSize:'14px', marginRight:'auto' }}>Active Cases</span>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:'6px', padding:'6px 10px' }}>
            <span className="material-symbols-outlined" style={{ fontSize:'14px', color:'var(--text-dim)' }}>search</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search incidents..."
              style={{ background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:'12px', width:'180px', fontFamily:'Inter,sans-serif' }} />
          </div>
          <div style={{ display:'flex', gap:'4px', background:'var(--bg-base)', padding:'3px', borderRadius:'6px', border:'1px solid var(--border)' }}>
            {['All','Pending','In Progress','Resolved'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{ padding:'4px 10px', borderRadius:'4px', border:'none', cursor:'pointer', fontSize:'11px', fontWeight:500, fontFamily:'Inter,sans-serif', background:filter===f?'var(--accent)':'transparent', color:filter===f?'#0d1117':'var(--text-secondary)', transition:'all 0.15s' }}>
                {f} <span style={{ opacity:0.7 }}>({counts[f]??filtered.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', borderRadius:'0 0 10px 10px', overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
            <thead>
              <tr style={{ background:'var(--bg-base)' }}>
                {['CASE ID','DATE','REPORTER','SECTOR','SEVERITY','DESCRIPTION','STATUS','REPLY','ACTIONS'].map(h=>(
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontFamily:'JetBrains Mono,monospace', fontSize:'10px', color:'var(--text-secondary)', letterSpacing:'0.08em', fontWeight:600, borderBottom:'1px solid var(--border-subtle)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={9} style={{ padding:'48px 20px', textAlign:'center', color:'var(--text-secondary)' }}>No incidents found.</td></tr>
              ) : filtered.map((c,i)=>{
                const sev=SEV[c.severity]||SEV.Medium; const st=ST[c.status]||ST.Pending;
                const date=new Date(c.created_at);
                return (
                  <tr key={c.id} onClick={()=>openDrawer(c)}
                    style={{ borderBottom:'1px solid var(--border-subtle)', background:i%2===0?'transparent':'rgba(0,0,0,0.02)', cursor:'pointer', transition:'background 0.12s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--accent-dim)'}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'transparent':'rgba(0,0,0,0.02)'}
                  >
                    <td style={{ padding:'10px 14px', fontFamily:'JetBrains Mono,monospace', fontSize:'11px', color:'var(--accent)' }}>#{c.id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding:'10px 14px', color:'var(--text-secondary)', fontSize:'12px', whiteSpace:'nowrap' }}>
                      <div style={{ color: 'var(--text-primary)' }}>{isNaN(date)?'—':`${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}</div>
                      {c.status === 'Resolved' && c.resolvedAt && (
                        <div style={{ color: '#4ade80', fontSize: '10px', marginTop: '3px' }}>
                          Solved: {new Date(c.resolvedAt).toLocaleDateString()} {new Date(c.resolvedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      )}
                    </td>
                    <td style={{ padding:'10px 14px', color:'var(--text-primary)', fontWeight:500 }}>{c.name||'—'}</td>
                    <td style={{ padding:'10px 14px', color:'var(--text-primary)' }}>{c.sector||'—'}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 8px', borderRadius:'4px', background:sev.bg, border:`1px solid ${sev.border}`, color:sev.color, fontSize:'11px', fontWeight:600, fontFamily:'JetBrains Mono,monospace' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:'12px' }}>{sev.icon}</span>{c.severity||'Medium'}
                      </span>
                    </td>
                    <td style={{ padding:'10px 14px', color:'var(--text-secondary)', maxWidth:'180px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.description}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 9px', borderRadius:'4px', background:st.bg, border:`1px solid ${st.border}`, color:st.color, fontSize:'10px', fontFamily:'JetBrains Mono,monospace', fontWeight:600 }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      {c.adminReply
                        ? <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', color:'#4ade80', fontSize:'11px' }}><span className="material-symbols-outlined" style={{ fontSize:'14px' }}>mark_email_read</span>Replied</span>
                        : <span style={{ color:'var(--text-dim)', fontSize:'11px' }}>—</span>
                      }
                    </td>
                    <td style={{ padding:'10px 14px' }} onClick={e=>e.stopPropagation()}>
                      <div style={{ display:'flex', gap:'4px' }}>
                        {['Pending','In Progress','Resolved'].filter(s=>s!==c.status).map(s=>(
                          <button key={s} onClick={()=>updateStatus(c.id,s)}
                            style={{ padding:'3px 7px', borderRadius:'4px', border:`1px solid ${ST[s].border}`, background:ST[s].bg, color:ST[s].color, fontSize:'10px', cursor:'pointer', fontFamily:'JetBrains Mono,monospace', whiteSpace:'nowrap' }}>
                            →{s==='In Progress'?'Progress':s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding:'10px 18px', borderTop:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'10px', color:'var(--text-dim)' }}>SHOWING {filtered.length} OF {complaints.length} INCIDENTS</span>
            <span style={{ display:'flex', alignItems:'center', gap:'6px', fontFamily:'JetBrains Mono,monospace', fontSize:'10px', color:'#4ade80' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'radar-sweep 1.5s ease-out infinite' }} />LIVE UPDATES ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* ── Slide-in Drawer ─────────────────────────────────────── */}
      {selected && (
        <>
          {/* Backdrop */}
          <div onClick={closeDrawer} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:100 }} />

          {/* Drawer */}
          <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'480px', maxWidth:'95vw', background:'var(--bg-surface)', borderLeft:'1px solid var(--border)', zIndex:101, display:'flex', flexDirection:'column', overflowY:'auto' }}>

            {/* Drawer header */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', gap:'10px', background:'var(--bg-surface-high)', flexShrink:0 }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px', color:'var(--accent)' }}>support_agent</span>
              <div style={{ flex:1 }}>
                <div style={{ color:'var(--text-primary)', fontWeight:600, fontSize:'14px' }}>Incident Detail &amp; Reply</div>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'10px', color:'var(--text-dim)' }}>CASE #{selected.id.slice(-6).toUpperCase()}</div>
              </div>
              <button onClick={closeDrawer} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', display:'flex', alignItems:'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize:'20px' }}>close</span>
              </button>
            </div>

            <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'16px', flex:1 }}>

              {/* Incident details */}
              <div style={{ background:'var(--bg-base)', border:'1px solid var(--border-subtle)', borderRadius:'8px', padding:'16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {[
                  ['REPORTER', selected.name||'—'],
                  ['SECTOR',   selected.sector||'—'],
                  ['SEVERITY', selected.severity||'—'],
                  ['STATUS',   selected.status||'—'],
                  ['SUBMITTED', new Date(selected.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })],
                  ...(selected.status === 'Resolved' && selected.resolvedAt ? [['RESOLVED', new Date(selected.resolvedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })]] : []),
                  ['LOCATION', selected.location ? `${selected.location.lat?.toFixed(4)}, ${selected.location.lng?.toFixed(4)}` : 'No GPS'],
                ].map(([label, val])=>(
                  <div key={label}>
                    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'0.08em', marginBottom:'3px' }}>{label}</div>
                    <div style={{ color:'var(--text-primary)', fontSize:'13px', fontWeight:500 }}>{val}</div>
                  </div>
                ))}
                <div style={{ gridColumn:'1/-1' }}>
                  <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'0.08em', marginBottom:'3px' }}>DESCRIPTION</div>
                  <div style={{ color:'var(--text-primary)', fontSize:'13px', lineHeight:'1.6' }}>{selected.description}</div>
                </div>
                {selected.imageUrl && (
                  <div style={{ gridColumn:'1/-1' }}>
                    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'0.08em', marginBottom:'6px' }}>PHOTO EVIDENCE</div>
                    <img src={selected.imageUrl} alt="Evidence" style={{ width:'100%', borderRadius:'6px', border:'1px solid var(--border)' }} />
                  </div>
                )}
              </div>

              {/* Status quick-change */}
              <div>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'0.08em', marginBottom:'8px' }}>UPDATE STATUS</div>
                <div style={{ display:'flex', gap:'8px' }}>
                  {['Pending','In Progress','Resolved'].map(s=>{
                    const active = selected.status===s;
                    return (
                      <button key={s} onClick={()=>updateStatus(selected.id,s)}
                        style={{ flex:1, padding:'8px 4px', borderRadius:'6px', border:`1px solid ${active?ST[s].color:ST[s].border}`, background:active?ST[s].bg:'transparent', color:ST[s].color, fontSize:'11px', fontWeight:active?700:500, cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all 0.15s' }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Previous reply (if any) */}
              {selected.adminReply && (
                <div style={{ background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.25)', borderRadius:'8px', padding:'14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize:'15px', color:'#4ade80' }}>mark_email_read</span>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'10px', color:'#4ade80', letterSpacing:'0.08em' }}>PREVIOUS ADMIN REPLY</span>
                  </div>
                  <p style={{ color:'var(--text-primary)', fontSize:'13px', lineHeight:'1.6', margin:0 }}>{selected.adminReply}</p>
                </div>
              )}

              {/* Reply box */}
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'0.08em', marginBottom:'8px' }}>
                  {selected.adminReply ? 'UPDATE REPLY' : 'SEND REPLY TO CITIZEN'}
                </div>
                <textarea rows={5} value={replyText} onChange={e=>setReplyText(e.target.value)}
                  placeholder="Type your response to the citizen's complaint... e.g. 'A maintenance team has been dispatched to your location and will arrive within 2 hours.'"
                  style={{ ...inp, resize:'vertical', lineHeight:'1.6', minHeight:'120px' }}
                  onFocus={e=>e.target.style.borderColor='var(--accent)'}
                  onBlur={e=>e.target.style.borderColor='var(--border)'}
                />
              </div>

              {successMsg && (
                <div style={{ padding:'10px 14px', borderRadius:'6px', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.25)', color:'#4ade80', fontSize:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>check_circle</span>{successMsg}
                </div>
              )}

              {/* Send button */}
              <button onClick={sendReply} disabled={saving || !replyText.trim()}
                style={{ padding:'12px', background:saving||!replyText.trim()?'var(--border)':'var(--accent)', color:saving||!replyText.trim()?'var(--text-secondary)':'#0d1117', border:'none', borderRadius:'6px', fontWeight:700, fontSize:'13px', cursor:saving||!replyText.trim()?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontFamily:'Inter,sans-serif', letterSpacing:'0.04em', transition:'all 0.15s' }}>
                <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>send</span>
                {saving ? 'Sending...' : (selected.adminReply ? 'Update Reply' : 'Send Reply to Citizen')}
              </button>

              {selected.location && (
                <a href={`https://www.google.com/maps?q=${selected.location.lat},${selected.location.lng}`} target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'10px', borderRadius:'6px', border:'1px solid var(--border)', color:'var(--accent)', fontSize:'13px', textDecoration:'none', fontFamily:'Inter,sans-serif' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>map</span>View on Google Maps
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
