import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import WaterDroplets from '../components/WaterDroplets';

// Fix for default Leaflet icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for Complaints (Red)
const complaintIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Custom Icon for Resolved Complaints (Green)
const resolvedComplaintIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Hardcoded Coordinates for Lavasa Water Pipelines
const mainTrunkLine = [[18.4100, 73.5000], [18.4080, 73.5020], [18.4050, 73.5040], [18.4020, 73.5080], [18.3990, 73.5120]];
const sectorBranchA = [[18.4050, 73.5040], [18.4060, 73.5080], [18.4080, 73.5100]];
const sectorBranchB = [[18.4020, 73.5080], [18.3980, 73.5050]];
const lavasaCenter = [18.4069, 73.5042];

export default function Dashboard({ userName }) {
  const [activeComplaintsCount, setActiveComplaintsCount] = useState(0);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchActiveComplaints = async () => {
      try {
        const q = query(collection(db, "complaints"), where("status", "==", "Pending"));
        const snapshot = await getDocs(q);
        setActiveComplaintsCount(snapshot.size);

        // Fetch all complaints for the map
        const qAll = query(collection(db, "complaints"), orderBy("created_at", "desc"));
        const allSnapshot = await getDocs(qAll);
        const complaintsList = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComplaints(complaintsList);
      } catch (err) {
        console.error("Error fetching active complaints:", err);
      }
    };
    fetchActiveComplaints();
  }, []);

  return (
    <main style={{ paddingTop: '60px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Water droplets in header band */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0d1117 0%, #111827 50%, #0c1a2e 100%)', padding: '28px 24px 24px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0' }}>
        <WaterDroplets opacity={0.45} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
            ◉ COMMAND CENTER — REAL-TIME OVERVIEW
          </div>
          <h1 style={{ color: '#e6edf3', fontWeight: 800, fontSize: '26px', margin: '0 0 4px' }}>
            Welcome back, <span style={{ color: 'var(--accent)' }}>{userName || 'Devansh'}</span>
          </h1>
          <p style={{ color: '#8b949e', fontSize: '13px', margin: 0 }}>Lavasa Water Corp — Infrastructure status as of {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>
        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Real-time Pressure */}
          <div className="col-span-12 md:col-span-3 glass-panel p-6 flex flex-col justify-between rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant">Main Line Pressure</span>
              <span className="material-symbols-outlined text-primary group-hover:animate-float" data-icon="speed">speed</span>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-display-lg text-5xl font-bold text-on-surface drop-shadow-[0_0_10px_rgba(0,166,224,0.3)]">62.4</span>
              <span className="font-headline-md text-on-surface-variant">psi</span>
            </div>
            <div className="mt-4 flex items-center gap-2 relative z-10">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              <span className="font-label-sm text-xs text-on-surface-variant">Stable - Within Limits</span>
            </div>
          </div>

          {/* Flow Rate */}
          <div className="col-span-12 md:col-span-3 glass-panel p-6 flex flex-col justify-between rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full blur-xl group-hover:bg-secondary/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant">Active Flow Rate</span>
              <span className="material-symbols-outlined text-secondary group-hover:animate-float" data-icon="waves">waves</span>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-display-lg text-5xl font-bold text-on-surface drop-shadow-[0_0_10px_rgba(123,208,255,0.2)]">1,240</span>
              <span className="font-headline-md text-on-surface-variant">L/min</span>
            </div>
            <div className="mt-4 relative z-10">
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden shadow-inner">
                <div className="bg-secondary h-full rounded-full shadow-[0_0_10px_rgba(123,208,255,0.6)]" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>

          {/* Reservoir Levels */}
          <div className="col-span-12 md:col-span-3 glass-panel p-6 flex flex-col justify-between rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant">Reservoir Capacity</span>
              <span className="material-symbols-outlined text-green-400 group-hover:animate-float" data-icon="water_full">water_full</span>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-display-lg text-5xl font-bold text-on-surface drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]">88.5</span>
              <span className="font-headline-md text-on-surface-variant">%</span>
            </div>
            <p className="font-label-sm text-xs text-on-surface-variant mt-4 relative z-10">2.4M Gallons remaining</p>
          </div>

          {/* Active Complaints */}
          <div className="col-span-12 md:col-span-3 glass-panel p-6 flex flex-col justify-between rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/10 rounded-full blur-xl group-hover:bg-error/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant">Active Complaints</span>
              <span className="material-symbols-outlined text-error group-hover:animate-float" data-icon="report_problem">report_problem</span>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-display-lg text-5xl font-bold text-error drop-shadow-[0_0_15px_rgba(255,180,171,0.4)]">{activeComplaintsCount}</span>
              <span className="font-headline-md text-on-surface-variant">Pending</span>
            </div>
            <div className="mt-4 flex items-center text-error gap-1 relative z-10">
              <span className="material-symbols-outlined text-[16px] animate-pulse" data-icon="priority_high">priority_high</span>
              <span className="font-label-sm text-xs uppercase tracking-widest">Requires Attention</span>
            </div>
          </div>

          {/* Live Network Status Image / Component */}
          <div className="col-span-12 md:col-span-8 glass-panel p-6 rounded-2xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display-sm text-2xl text-on-surface font-bold">Live Network Status</h3>
              <div className="flex gap-2">
                <Link to="/map" className="bg-primary-container/20 border border-primary/30 text-primary px-4 py-1.5 font-label-sm text-xs flex items-center gap-2 transition-all active:scale-95 rounded-full hover:bg-primary hover:text-on-primary">
                  <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                  Full Screen Map
                </Link>
              </div>
            </div>
            <div className="h-80 relative w-full overflow-hidden rounded-xl border border-outline-variant/30 flex-grow z-0 shadow-inner">
              
              <MapContainer 
                center={lavasaCenter} 
                zoom={14} 
                className="w-full h-full"
                zoomControl={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Pipelines */}
                <Polyline positions={mainTrunkLine} pathOptions={{ color: '#00a6e0', weight: 4, opacity: 0.8 }} />
                <Polyline positions={sectorBranchA} pathOptions={{ color: '#7bd0ff', weight: 2, dashArray: '5, 5' }} />
                <Polyline positions={sectorBranchB} pathOptions={{ color: '#7bd0ff', weight: 2, dashArray: '5, 5' }} />

                {/* Active Incidents */}
                {complaints.filter(c => c.location && c.location.lat).map((complaint) => (
                  <Marker 
                    key={complaint.id} 
                    position={[complaint.location.lat, complaint.location.lng]}
                    icon={complaint.status === 'Resolved' ? resolvedComplaintIcon : complaintIcon}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-on-surface text-xs">{complaint.sector}</h3>
                        <span className="text-[10px] text-error uppercase">{complaint.status}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              <div className="absolute top-4 right-4 bg-surface-container/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant flex items-center gap-2 pointer-events-none z-[1000]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-label-sm text-label-sm text-on-surface">Live GPS Feed</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="col-span-12 md:col-span-4 glass-panel p-6 overflow-hidden rounded-2xl flex flex-col">
            <h3 className="font-display-sm text-2xl text-on-surface font-bold mb-6">Infrastructure Health</h3>
            <div className="space-y-4 flex-grow">
              <div className="flex items-center justify-between p-3 bg-surface-container-high rounded border border-outline-variant/50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-400" data-icon="valve">valve</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Pumping Station Alpha</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Active • 4 Pumps online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-high rounded border border-outline-variant/50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-400" data-icon="filter_alt">filter_alt</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Treatment Plant Beta</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Active • Normal turbidity</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-high rounded border border-outline-variant/50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-400" data-icon="settings_input_component">settings_input_component</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Main Trunk Valve #42</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Scheduled Maintenance</p>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/assets" className="block text-center w-full mt-6 py-2 border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-container-highest hover:border-primary/50 transition-colors rounded">View All Assets</Link>
          </div>

          {/* Recent Alerts / Log Table */}
          <div className="col-span-12 glass-panel rounded-2xl overflow-hidden mt-2">
            <div className="p-6 flex justify-between items-center border-b border-outline-variant/20">
              <h3 className="font-display-sm text-2xl text-on-surface font-bold">Recent System Events</h3>
              <span className="text-on-surface-variant font-label-sm text-xs">Updated 2 minutes ago</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left zebra-table">
                <thead>
                  <tr className="bg-surface-container-high border-b border-outline-variant">
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Timestamp</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Component</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Event Type</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  <tr className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="px-6 py-4 font-body-md text-body-md">14:22:15</td>
                    <td className="px-6 py-4 font-body-md text-body-md">Sector 7 Pump</td>
                    <td className="px-6 py-4 font-body-md text-body-md">Flow Variance</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/50 text-green-400 font-label-sm text-label-sm rounded">Resolved</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="px-6 py-4 font-body-md text-body-md">13:45:02</td>
                    <td className="px-6 py-4 font-body-md text-body-md">Treatment Unit C</td>
                    <td className="px-6 py-4 font-body-md text-body-md">Chlorine Calibration</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/50 text-blue-400 font-label-sm text-label-sm rounded">Routine</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
