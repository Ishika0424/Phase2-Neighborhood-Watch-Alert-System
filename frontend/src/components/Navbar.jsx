import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Share2, Award, User, LogOut, LayoutDashboard, AlertTriangle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const linkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
      isActive
        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            COMMUNITY
          </span>
          <span className="text-xs block text-slate-400 font-semibold uppercase tracking-widest mt-[-2px]">
            Resource & Safety Hub
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1.5">
        <Link to="/" className={linkClass('/')}>
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <Link to="/alerts" className={linkClass('/alerts')}>
          <AlertTriangle className="h-4 w-4" />
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

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-200">{user.name}</span>
          <span className="text-xs text-indigo-400 font-medium">{user.locationName || 'Local Member'}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/50 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-slate-700/50 hover:border-red-900/50 rounded-lg transition-all duration-300 text-xs font-semibold"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
