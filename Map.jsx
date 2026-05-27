import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Fix for default Leaflet icon path issues in React/Vite
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
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Icon for Resolved Complaints (Green)
const resolvedComplaintIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Icon for Water Tanks (Cyan)
const tankIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Hardcoded Coordinates for Lavasa Water Pipelines
const mainTrunkLine = [
  [18.4100, 73.5000],
  [18.4080, 73.5020],
  [18.4050, 73.5040],
  [18.4020, 73.5080],
  [18.3990, 73.5120],
];

const sectorBranchA = [
  [18.4050, 73.5040],
  [18.4060, 73.5080],
  [18.4080, 73.5100]
];

const sectorBranchB = [
  [18.4020, 73.5080],
  [18.3980, 73.5050]
];

// Hardcoded Water Tank Locations
const tankLocations = [
  { id: 'T1', name: 'Primary Reservoir Alpha', lat: 18.4100, lng: 73.5000, capacity: '92%', status: 'Optimal' },
  { id: 'T2', name: 'Sector A Holding Tank', lat: 18.4060, lng: 73.5080, capacity: '45%', status: 'Refilling' },
  { id: 'T3', name: 'South Branch Tank', lat: 18.3980, lng: 73.5050, capacity: '12%', status: 'Low Level Warning' }
];

export default function Map() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Center of Lavasa
  const lavasaCenter = [18.4069, 73.5042];

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const q = query(collection(db, "complaints"), orderBy("created_at", "desc"));
        const querySnapshot = await getDocs(q);
        const complaintsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComplaints(complaintsList);
      } catch (err) {
        console.error("Error fetching complaints for map: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Filter only complaints that have actual GPS locations captured
  const geolocatedComplaints = complaints.filter(c => c.location && c.location.lat && c.location.lng);

  return (
    <main className="mt-16 p-stack-lg flex-grow bg-background">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 h-[calc(100vh-120px)]">
        
        {/* Header */}
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">Live Infrastructure Map</h2>
          <p className="text-on-surface-variant font-body-md mt-2">
            Real-time geospatial tracking of water pipelines, pumping stations, and active civilian complaints.
          </p>
        </div>

        {/* Map Container */}
        <div className="bg-surface-container-low border border-outline-variant p-stack-sm rounded-lg flex-grow overflow-hidden relative shadow-xl">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-container-low/80 z-50">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
            </div>
          ) : null}

          {/* Map Legend */}
          <div className="absolute top-6 right-6 z-[1000] bg-surface-container/90 backdrop-blur-md p-4 rounded-lg border border-outline-variant shadow-lg pointer-events-auto">
            <h4 className="font-headline-md text-sm text-on-surface mb-3 border-b border-outline-variant/50 pb-2">Map Legend</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-[#00a6e0]"></span>
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-label-caps">Main Trunk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-[#7bd0ff] border-t border-dashed border-surface"></span>
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-label-caps">Sector Branches</span>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-outline-variant/50">
                <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" alt="Tank Marker" className="w-3 h-4 filter hue-rotate-[180deg]" />
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-label-caps text-secondary">Water Tanks</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" alt="Issue Marker" className="w-3 h-4" />
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-label-caps text-error">Active Incident</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" alt="Resolved Marker" className="w-3 h-4" />
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-label-caps text-secondary">Resolved Incident</span>
              </div>
            </div>
          </div>

          <MapContainer 
            center={lavasaCenter} 
            zoom={15} 
            className="w-full h-full rounded"
            zoomControl={false}
          >
            {/* Dark Map Tiles (CartoDB Dark Matter) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Infrastructure: Water Pipelines */}
            <Polyline positions={mainTrunkLine} pathOptions={{ color: '#00a6e0', weight: 5, opacity: 0.8 }} />
            <Polyline positions={sectorBranchA} pathOptions={{ color: '#7bd0ff', weight: 3, dashArray: '5, 5' }} />
            <Polyline positions={sectorBranchB} pathOptions={{ color: '#7bd0ff', weight: 3, dashArray: '5, 5' }} />

            {/* Tank Markers */}
            {tankLocations.map((tank) => (
              <Marker key={tank.id} position={[tank.lat, tank.lng]} icon={tankIcon}>
                <Popup className="custom-popup border-primary">
                  <div className="p-1 min-w-[150px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary text-lg">water_full</span>
                      <h3 className="font-bold text-on-surface text-sm">{tank.name}</h3>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">Capacity:</span>
                        <span className="text-on-surface font-bold">{tank.capacity}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">Status:</span>
                        <span className={`${tank.status.includes('Optimal') ? 'text-green-400' : tank.status.includes('Low') ? 'text-error' : 'text-amber-400'}`}>{tank.status}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Dynamic Incident Markers from Firebase */}
            {geolocatedComplaints.map((complaint) => (
              <Marker 
                key={complaint.id} 
                position={[complaint.location.lat, complaint.location.lng]}
                icon={complaint.status === 'Resolved' ? resolvedComplaintIcon : complaintIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-1">
                    <h3 className="font-bold text-on-surface text-sm mb-1">{complaint.sector} Incident</h3>
                    <p className="text-on-surface-variant text-xs mb-2 break-words">{complaint.description}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-outline-variant/20">
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-widest ${
                        complaint.status === 'Resolved' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'
                      }`}>
                        {complaint.status}
                      </span>
                      <span className="text-[10px] text-outline">{new Date(complaint.created_at?.toDate() || complaint.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </main>
  );
}
