import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import MapView from '../components/MapView';
import { AlertTriangle, Plus, Filter, MapPin, Tag, RefreshCw, Check, Clock, ShieldAlert, Trash2, AlertCircle } from 'lucide-react';

const Alerts = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Suspicious Activity');
  const [severity, setSeverity] = useState('Medium');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationName, setLocationName] = useState('');
  const [formError, setFormError] = useState('');

  // Coords helper
  const [selectedCoords, setSelectedCoords] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, [categoryFilter, severityFilter, statusFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await axios.get('/alerts', { params });
      setAlerts(res.data);
    } catch (err) {
      console.error('Error fetching alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lat, lng) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setSelectedCoords({ lat, lng });
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description || !category || !severity || !latitude || !longitude || !locationName) {
      setFormError('All fields are required. Please click the map to select coordinates.');
      return;
    }

    try {
      await axios.post('/alerts', {
        title,
        description,
        category,
        severity,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationName
      });

      setTitle('');
      setDescription('');
      setCategory('Suspicious Activity');
      setSeverity('Medium');
      setLatitude('');
      setLongitude('');
      setLocationName('');
      setSelectedCoords(null);
      setShowAddForm(false);
      fetchAlerts();
      alert('Alert reported and broadcast to community!');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit report');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/alerts/${id}/status`, { status });
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Are you sure you want to remove this alert?')) return;
    try {
      await axios.delete(`/alerts/${id}`);
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const categories = ['Suspicious Activity', 'Theft', 'Road Accident', 'Water Leakage', 'Power Outage', 'Emergency', 'Announcement', 'Other'];
  const severities = ['Low', 'Medium', 'High'];
  const statuses = ['Active', 'Investigating', 'Resolved'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Title */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Neighborhood Watch & Safety Alerts</h1>
          <p className="text-sm text-slate-400 mt-1">Report road accidents, hazards, emergencies, or suspicious behavior.</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!locationName && user?.locationName) setLocationName(user.locationName);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-600/20 text-sm"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? 'Close Report' : 'Report an Incident'}
        </button>
      </div>

      {/* Report Incident Drawer (Form + Geolocation picker map) */}
      {showAddForm && (
        <div className="glass-panel border-red-500/20 rounded-2xl p-6 mb-8 transition-all duration-300 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400 animate-pulse" /> File safety report
            </h2>
            {formError && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {formError}
              </div>
            )}
            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Alert Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-red-500 text-sm"
                  placeholder="e.g. Broken Water Pipe, Suspicious vehicle pacing"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-red-500 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-red-500 text-sm"
                  >
                    {severities.map((sev) => (
                      <option key={sev} value={sev} className="bg-slate-950">{sev}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Incident Location Details</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-red-500 text-sm"
                  placeholder="e.g. Near park entrance on Elm St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Latitude</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={latitude}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-slate-400 text-sm cursor-not-allowed"
                    placeholder="Click Map to Select"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Longitude</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={longitude}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-slate-400 text-sm cursor-not-allowed"
                    placeholder="Click Map to Select"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-650 hover:bg-red-650/90 text-white bg-red-650 bg-red-600 font-semibold rounded-xl text-xs"
                >
                  Broadcast Report
                </button>
              </div>
            </form>
          </div>

          {/* Interactive Click Picker Map */}
          <div className="h-[380px] lg:h-auto rounded-2xl overflow-hidden border border-slate-800">
            <MapView
              alerts={alerts}
              onMapClick={handleMapClick}
              selectedCoords={selectedCoords}
              defaultCenter={[40.7128, -74.0060]}
            />
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-5 mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest mr-2">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-red-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-red-500"
            >
              <option value="">All Severities</option>
              {severities.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-red-500"
            >
              <option value="">All Statuses</option>
              {statuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setCategoryFilter('');
              setSeverityFilter('');
              setStatusFilter('');
            }}
            className="text-xs text-slate-500 hover:text-white font-semibold underline underline-offset-4 ml-auto"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Grid of Alerts */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <AlertCircle className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No safety reports found</h3>
          <p className="text-sm text-slate-400 mt-1">Great news! No security hazards have been flagged recently.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => {
            const isReporter = alert.reporter?._id === user?._id || alert.reporter === user?._id;

            return (
              <div
                key={alert._id}
                className="glass-card rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="p-6">
                  {/* Category & Severity header */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg">
                      <Tag className="h-3.5 w-3.5" />
                      {alert.category}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      alert.severity === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                      alert.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {alert.severity} Severity
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white mb-2">{alert.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{alert.description}</p>

                  <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/60 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-300">Reporter:</span>
                      <span>{alert.reporter?.name} {isReporter && '(You)'}</span>
                    </div>
                    {alert.reporter?.phone && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-300">Contact:</span>
                        <span>{alert.reporter?.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{alert.locationName} <span className="text-[10px] text-slate-500">({alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)})</span></span>
                    </div>
                  </div>
                </div>

                {/* Footer and Management */}
                <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-800/80 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Current Status:</span>
                    <span className={`font-black uppercase px-2 py-0.5 rounded flex items-center gap-1.5 ${
                      alert.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                      alert.status === 'Investigating' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                    }`}>
                      {alert.status === 'Resolved' ? <Check className="h-3 w-3" /> :
                       alert.status === 'Investigating' ? <Clock className="h-3 w-3" /> :
                       <AlertTriangle className="h-3 w-3 animate-pulse" />}
                      {alert.status}
                    </span>
                  </div>

                  {isReporter && (
                    <div className="border-t border-slate-850 pt-3 flex gap-2 justify-between items-center">
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Update:</span>
                        {alert.status !== 'Investigating' && alert.status !== 'Resolved' && (
                          <button
                            onClick={() => handleStatusUpdate(alert._id, 'Investigating')}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold"
                          >
                            Investigate
                          </button>
                        )}
                        {alert.status !== 'Resolved' && (
                          <button
                            onClick={() => handleStatusUpdate(alert._id, 'Resolved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                          >
                            Resolve
                          </button>
                        )}
                        {alert.status === 'Resolved' && (
                          <button
                            onClick={() => handleStatusUpdate(alert._id, 'Active')}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAlert(alert._id)}
                        className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-900/20 border border-red-950 rounded-lg transition-all"
                        title="Delete Report"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;
