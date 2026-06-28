import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom CSS DivIcon generator for safety alerts
const createAlertIcon = (severity) => {
  const color = severity === 'High' ? 'bg-red-500' : severity === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500';
  const border = severity === 'High' ? 'border-red-300' : severity === 'Medium' ? 'border-amber-300' : 'border-emerald-300';
  const pulse = severity === 'High' ? 'animate-ping' : '';

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-7 h-7 rounded-full ${color} opacity-45 ${pulse}"></div>
        <div class="w-4 h-4 rounded-full ${color} border-2 ${border} shadow-lg flex items-center justify-center text-[9px] text-white font-extrabold">
          !
        </div>
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -10]
  });
};

// Temp marker for click reporting
const tempIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute w-7 h-7 rounded-full bg-indigo-500 opacity-30 animate-pulse"></div>
      <div class="w-4.5 h-4.5 rounded-full bg-indigo-600 border-2 border-indigo-200 shadow-lg flex items-center justify-center text-[10px] text-white font-bold">
        +
      </div>
    </div>
  `,
  className: 'custom-leaflet-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Component to handle Map Centering
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Handle Click Events to report new alert
const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
};

const MapView = ({ alerts = [], onMapClick, selectedCoords, defaultCenter = [40.7128, -74.0060] }) => {
  // Determine starting position: first alert or defaultCenter
  const mapCenter = alerts.length > 0 ? [alerts[0].latitude, alerts[0].longitude] : defaultCenter;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl relative">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full z-10"
        style={{ background: '#0b0f19' }}
      >
        {/* CARTO Dark Tiles for premium visual aesthetics */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <RecenterMap center={selectedCoords ? [selectedCoords.lat, selectedCoords.lng] : null} />
        
        {onMapClick && <MapEventsHandler onMapClick={onMapClick} />}

        {/* Existing Alerts Pins */}
        {alerts.map((alert) => (
          <Marker
            key={alert._id}
            position={[alert.latitude, alert.longitude]}
            icon={createAlertIcon(alert.severity)}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[150px] text-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    alert.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                    alert.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {alert.severity} Severity
                  </span>
                  <span className={`text-[9px] px-1 py-0.5 rounded font-bold uppercase bg-slate-800 ${
                    alert.status === 'Resolved' ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {alert.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-white">{alert.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{alert.description}</p>
                <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                  <span>📍</span> {alert.locationName}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Temporary selected pin */}
        {selectedCoords && (
          <Marker position={[selectedCoords.lat, selectedCoords.lng]} icon={tempIcon}>
            <Popup>
              <div className="text-xs text-indigo-400 font-bold p-1">
                Pin Drop Location Selected
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Guidelines Overlay */}
      {onMapClick && (
        <div className="absolute bottom-4 left-4 z-[1000] glass-panel rounded-lg px-3 py-1.5 text-[10px] text-slate-300 font-semibold pointer-events-none">
          Click anywhere on the map to select report coordinates
        </div>
      )}
    </div>
  );
};

export default MapView;
