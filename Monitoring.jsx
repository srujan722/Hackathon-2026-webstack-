import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

const baseSectors = [
  { sector: 'Dasve', base: 62 },
  { sector: 'Mugaon', base: 58 },
  { sector: 'Dhamanhol', base: 60 },
  { sector: 'Gadle', base: 55 },
  { sector: 'Bhoini', base: 64 },
];

export default function Monitoring() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pressureData, setPressureData] = useState([]);
  const [activeComplaints, setActiveComplaints] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'complaints'));
    const unsub = onSnapshot(q, (snap) => {
      const complaints = snap.docs.map(d => d.data());
      setActiveComplaints(complaints.filter(c => c.status !== 'Resolved'));
    });
    return () => unsub();
  }, []);

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=18.4069&longitude=73.5042&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto');
      const data = await res.json();
      setWeatherData(data.current);
    } catch (error) {
      console.error("Error fetching live data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Compute live pressures
  useEffect(() => {
    const flutterInterval = setInterval(() => {
      setPressureData(baseSectors.map(s => {
        const sectorComplaints = activeComplaints.filter(c => c.sector?.includes(s.sector));
        let drop = 0;
        sectorComplaints.forEach(c => {
          if (c.description?.toLowerCase().includes('burst') || c.description?.toLowerCase().includes('no water')) drop += 25;
          else if (c.description?.toLowerCase().includes('leak') || c.description?.toLowerCase().includes('low pressure')) drop += 15;
          else drop += 5;
        });
        const currentPressure = Math.max(0, s.base - drop + (Math.random() * 4 - 2));
        return { sector: s.sector, pressure: currentPressure };
      }));
    }, 2000);

    return () => clearInterval(flutterInterval);
  }, [activeComplaints]);

  return (
    <main className="flex-1 overflow-y-auto py-12 px-4 sm:px-6 lg:px-8 z-10 w-full bg-background">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 text-primary rounded-xl mb-4 border border-primary/30 shadow-[0_0_15px_rgba(0,166,224,0.3)]">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
            </div>
            <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface tracking-tight font-bold">SCADA Monitoring</h1>
            <p className="mt-2 text-on-surface-variant text-body-md font-body-md max-w-xl">
              Real-time telemetry, environmental factors, and infrastructure status across Lavasa.
            </p>
          </div>
          <button 
            onClick={fetchLiveData}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest hover:border-primary/50 text-on-surface font-label-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin text-primary' : ''}`}>sync</span>
            {loading ? 'Syncing...' : 'Force Sync'}
          </button>
        </div>

        {/* Environmental Telemetry (Live API Data) */}
        <div>
          <h2 className="font-title-lg text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">cloud</span>
            Environmental Telemetry
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all"></div>
              <span className="material-symbols-outlined text-orange-400 mb-3 text-3xl relative z-10">thermostat</span>
              <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-widest relative z-10">Surface Temp</p>
              <h3 className="font-display-lg-mobile text-3xl text-on-surface font-bold mt-1 relative z-10">
                {weatherData ? `${weatherData.temperature_2m}°C` : '--'}
              </h3>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
              <span className="material-symbols-outlined text-blue-400 mb-3 text-3xl relative z-10">humidity_percentage</span>
              <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-widest relative z-10">Humidity</p>
              <h3 className="font-display-lg-mobile text-3xl text-on-surface font-bold mt-1 relative z-10">
                {weatherData ? `${weatherData.relative_humidity_2m}%` : '--'}
              </h3>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
              <span className="material-symbols-outlined text-indigo-400 mb-3 text-3xl relative z-10">rainy</span>
              <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-widest relative z-10">Precipitation</p>
              <h3 className="font-display-lg-mobile text-3xl text-on-surface font-bold mt-1 relative z-10">
                {weatherData ? `${weatherData.precipitation}mm` : '--'}
              </h3>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-all"></div>
              <span className="material-symbols-outlined text-teal-400 mb-3 text-3xl relative z-10">air</span>
              <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-widest relative z-10">Wind Speed</p>
              <h3 className="font-display-lg-mobile text-3xl text-on-surface font-bold mt-1 relative z-10">
                {weatherData ? `${weatherData.wind_speed_10m}km/h` : '--'}
              </h3>
            </div>
          </div>
        </div>

        {/* Infrastructure Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Pressure Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">speed</span>
                Pipeline Pressure (PSI)
              </h3>
              <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded border border-primary/20">Live</span>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pressureData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#8d909e" domain={[0, 80]} tick={{ fill: '#8d909e', fontSize: 12 }} />
                  <YAxis dataKey="sector" type="category" stroke="#8d909e" tick={{ fill: '#dce1fb', fontSize: 13 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#191f31', borderRadius: '8px', border: '1px solid #2e3447', color: '#fff' }} 
                  />
                  <Bar dataKey="pressure" radius={[0, 4, 4, 0]}>
                    {pressureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pressure < 40 ? '#f87171' : entry.pressure > 58 ? '#fbbf24' : '#00a6e0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Plant Status */}
          <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 shadow-lg flex flex-col">
            <h3 className="font-title-lg text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">factory</span>
              Treatment Plant Nodes
            </h3>
            
            <div className="space-y-4 flex-grow">
              <div className="flex items-center justify-between p-4 bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl border border-outline-variant/30 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                  </div>
                  <div>
                    <span className="font-body-lg text-on-surface font-semibold block">Primary Filtration</span>
                    <span className="text-xs text-on-surface-variant">Flow rate: 1,240 L/min</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(74,222,128,0.2)]">Optimal</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl border border-outline-variant/30 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <span className="material-symbols-outlined text-green-400">water_drop</span>
                  </div>
                  <div>
                    <span className="font-body-lg text-on-surface font-semibold block">Chlorination Unit</span>
                    <span className="text-xs text-on-surface-variant">Dosing: 1.2 mg/L</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(74,222,128,0.2)]">Optimal</span>
              </div>

              {activeComplaints.length > 0 ? (
                <div className="flex items-center justify-between p-4 bg-error/10 hover:bg-error/20 transition-colors rounded-xl border border-error/30 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center border border-error/30">
                      <span className="material-symbols-outlined text-error animate-pulse">warning</span>
                    </div>
                    <div>
                      <span className="font-body-lg text-error font-semibold block">System Alert</span>
                      <span className="text-xs text-error/80">{activeComplaints.length} active incidents</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-error text-white border border-error text-[10px] font-bold rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(248,113,113,0.4)]">Attention</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl border border-outline-variant/30 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                      <span className="material-symbols-outlined text-green-400">check_circle</span>
                    </div>
                    <div>
                      <span className="font-body-lg text-on-surface font-semibold block">Distribution Network</span>
                      <span className="text-xs text-on-surface-variant">All sectors operational</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(74,222,128,0.2)]">Optimal</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
