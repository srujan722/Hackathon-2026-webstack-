import { useState } from 'react';

const assetsList = [
  { id: 'AST-001', name: 'Primary Pumping Station Alpha', type: 'Pump', sector: 'Dasve', status: 'Operational', health: 96, lastMaintained: '2026-05-01' },
  { id: 'AST-002', name: 'Treatment Plant Beta', type: 'Facility', sector: 'Mugaon', status: 'Operational', health: 100, lastMaintained: '2026-05-10' },
  { id: 'AST-003', name: 'Main Trunk Valve #42', type: 'Valve', sector: 'Bhoini', status: 'Maintenance', health: 45, lastMaintained: '2026-05-18' },
  { id: 'AST-004', name: 'Reservoir C', type: 'Storage', sector: 'Admal', status: 'Operational', health: 88, lastMaintained: '2026-04-15' },
  { id: 'AST-005', name: 'Distribution Node 7', type: 'Node', sector: 'Gadavale', status: 'Warning', health: 62, lastMaintained: '2026-02-28' },
  { id: 'AST-006', name: 'Sector Flow Meter', type: 'Sensor', sector: 'Wadavali', status: 'Operational', health: 99, lastMaintained: '2026-05-15' },
];

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = assetsList.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto py-12 px-4 sm:px-6 lg:px-8 z-10 w-full bg-background">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 text-primary rounded-xl mb-4 border border-primary/30 shadow-[0_0_15px_rgba(0,166,224,0.3)]">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>precision_manufacturing</span>
            </div>
            <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface tracking-tight font-bold">Infrastructure Assets</h1>
            <p className="mt-2 text-on-surface-variant text-body-md font-body-md max-w-xl">
              Complete inventory and real-time health monitoring of all physical Lavasa water infrastructure.
            </p>
          </div>
          <div className="relative w-full md:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Search assets or sectors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="glass-panel p-6 rounded-2xl border border-outline-variant/30 shadow-lg hover:border-primary/50 transition-all group flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    asset.status === 'Operational' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    asset.status === 'Maintenance' ? 'bg-error/10 border-error/20 text-error' :
                    'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    <span className="material-symbols-outlined">
                      {asset.type === 'Pump' ? 'valve' : 
                       asset.type === 'Facility' ? 'factory' : 
                       asset.type === 'Valve' ? 'settings_input_component' : 
                       asset.type === 'Sensor' ? 'sensors' : 'water_drop'}
                    </span>
                  </div>
                  <div>
                    <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant block">{asset.id} • {asset.sector}</span>
                    <h3 className="font-title-md text-on-surface font-bold leading-tight mt-0.5 group-hover:text-primary transition-colors">{asset.name}</h3>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-4 pt-4 border-t border-outline-variant/20">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface-variant font-label-caps uppercase tracking-wider">Health Score</span>
                    <span className={`font-bold ${asset.health > 80 ? 'text-green-400' : asset.health > 50 ? 'text-amber-400' : 'text-error'}`}>{asset.health}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${asset.health > 80 ? 'bg-green-400' : asset.health > 50 ? 'bg-amber-400' : 'bg-error'}`} 
                      style={{ width: `${asset.health}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Last Maint: {asset.lastMaintained}</span>
                  <span className={`px-2 py-0.5 rounded uppercase tracking-widest font-label-caps ${
                    asset.status === 'Operational' ? 'bg-green-500/10 text-green-400' :
                    asset.status === 'Maintenance' ? 'bg-error/10 text-error' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {asset.status}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
