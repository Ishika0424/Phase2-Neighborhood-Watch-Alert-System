import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import MapView from '../components/MapView';
import Analytics from '../components/Analytics';
import { AlertTriangle, MapPin, Calendar, Bell, RefreshCw, X, Radio, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time toast notification state
  const [toastAlert, setToastAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();

    // Establish Socket.io connection for real-time alerts
    const socket = io('http://localhost:5002');

    socket.on('newAlert', (newAlert) => {
      // Prepend to current alerts list
      setAlerts((prev) => [newAlert, ...prev]);
      
      // Trigger floating real-time toast
      setToastAlert(newAlert);
      
      // Clear toast after 6 seconds
      setTimeout(() => {
        setToastAlert(null);
      }, 6000);
    });

    socket.on('updateAlert', (updatedAlert) => {
      setAlerts((prev) =>
        prev.map((alert) => (alert._id === updatedAlert._id ? updatedAlert : alert))
      );
    });

    socket.on('deleteAlert', (deletedId) => {
      setAlerts((prev) => prev.filter((alert) => alert._id !== deletedId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Error fetching alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const activeAlerts = alerts.filter(a => a.status !== 'Resolved');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative">
      {/* Real-time floating Notification Toast */}
      {toastAlert && (
        <div className="fixed top-24 right-6 z-[9999] max-w-sm w-full bg-slate-900 border-2 border-red-500/50 rounded-2xl p-4 shadow-2xl animate-bounce flex items-start gap-3">
          <div className="bg-red-500/10 p-2 rounded-xl text-red-400 border border-red-500/20">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                Emergency Alert Broadcast
              </span>
              <button onClick={() => setToastAlert(null)} className="text-slate-500 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <h4 className="font-extrabold text-sm text-white mt-1">{toastAlert.title}</h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{toastAlert.description}</p>
            <div className="text-[9px] text-slate-500 mt-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {toastAlert.locationName}
            </div>
          </div>
        </div>
      )}

      {/* Hero Welcome banner */}
      <div className="glass-panel border-indigo-500/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Neighborhood safety dashboard
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Real-time incident reporting, interactive maps, and community resources. Keep your neighborhood connected and safe.
          </p>
        </div>
        <div className="flex gap-3 z-10">
          <Link
            to="/alerts"
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-red-600/20 transition-all"
          >
            Report Incident <AlertTriangle className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Map and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Panel */}
        <div className="lg:col-span-2 h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-2">
              📍 Interactive Neighborhood Map
            </h2>
            <span className="text-xs text-indigo-400 font-semibold">{activeAlerts.length} Active Incidents</span>
          </div>
          <div className="flex-1">
            <MapView alerts={alerts} defaultCenter={[40.7128, -74.0060]} />
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="lg:col-span-1 flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-red-400" /> Recent Alerts Feed
            </h2>
            <Link to="/alerts" className="text-xs text-slate-400 hover:text-white flex items-center font-semibold gap-0.5">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-grow overflow-y-auto glass-panel rounded-2xl p-4 space-y-4 border border-slate-800/80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xs text-slate-500 font-medium">No incidents reported recently.</p>
              </div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div key={alert._id} className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700/60 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        alert.severity === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        alert.severity === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[9px] text-slate-500 flex items-center gap-1 font-semibold">
                        <Calendar className="h-3 w-3" />
                        {new Date(alert.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-white leading-tight">{alert.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{alert.description}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-850 flex justify-between items-center">
                    <span className="flex items-center gap-0.5 font-medium">📍 {alert.locationName}</span>
                    <span className={`font-bold uppercase ${
                      alert.status === 'Resolved' ? 'text-emerald-400' : 'text-slate-400'
                    }`}>{alert.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="space-y-4">
        <h2 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-2">
          📊 Neighborhood watch analytics
        </h2>
        <Analytics />
      </div>
    </div>
  );
};

export default Dashboard;
