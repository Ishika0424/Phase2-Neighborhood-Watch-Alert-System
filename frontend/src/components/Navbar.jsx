import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Share2, Award, User, LogOut, LayoutDashboard, AlertTriangle, Bell, X, Info } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/alerts');
      const alerts = res.data;
      const dismissed = JSON.parse(localStorage.getItem('dismissed_alerts_notifications') || '[]');
      
      const activeAlerts = alerts
        .filter(a => a.status !== 'Resolved' && !dismissed.includes(a._id))
        .map(a => ({
          id: a._id,
          title: a.title,
          severity: a.severity,
          location: a.locationName,
          createdAt: a.createdAt
        }));

      setNotifications(activeAlerts);
    } catch (err) {
      console.error('Error fetching alert notifications:', err);
    }
  };

  const handleDismiss = (id) => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed_alerts_notifications') || '[]');
    dismissed.push(id);
    localStorage.setItem('dismissed_alerts_notifications', JSON.stringify(dismissed));
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (!user) return null;

  const linkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-300 text-xs font-semibold ${
      isActive
        ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10 glow-pill'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-3.5 flex justify-between items-center backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-rose-600 to-amber-600 p-2.5 rounded-xl shadow-lg shadow-rose-500/25 border border-rose-400/30">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-rose-100 to-rose-400 bg-clip-text text-transparent font-outfit">
            COMMUNE
          </span>
          <span className="text-[10px] block text-rose-400 font-bold uppercase tracking-widest mt-[-2px]">
            Neighborhood Safety Hub
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <Link to="/" className={linkClass('/')}>
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <Link to="/alerts" className={linkClass('/alerts')}>
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>Safety Alerts</span>
        </Link>
        <Link to="/resources" className={linkClass('/resources')}>
          <Share2 className="h-4 w-4" />
          <span>Resources</span>
        </Link>
        <Link to="/skills" className={linkClass('/skills')}>
          <Award className="h-4 w-4" />
          <span>Skills Board</span>
        </Link>
        <Link to="/profile" className={linkClass('/profile')}>
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all duration-300"
          >
            <Bell className="h-4.5 w-4.5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-left max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Safety Notifications</span>
                {notifications.length > 0 && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                    {notifications.length} Active
                  </span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No active safety alerts
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((n) => (
                    <div key={n.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-start gap-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
                          n.severity === 'High' ? 'text-rose-400' :
                          n.severity === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                        }`} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-200 block">{n.title}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-800 text-slate-400">
                              {n.severity}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">📍 {n.location}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDismiss(n.id)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="h-7 w-7 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</span>
            <span className="text-[10px] text-rose-400 font-medium">{user.locationName || 'Watch Member'}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 rounded-xl transition-all text-xs font-semibold"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;


