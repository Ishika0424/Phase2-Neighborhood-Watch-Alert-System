import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Ambient Safety Red Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-tr from-rose-600 to-amber-600 p-3.5 rounded-2xl shadow-xl shadow-rose-500/25 mb-4 border border-rose-400/30">
            <ShieldAlert className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-outfit">Neighborhood Watch</h1>
          <p className="text-sm text-slate-400 mt-2">Safety Alert & Incident Response System</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-white/10">
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-10 py-3 rounded-xl text-white placeholder-slate-500 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-danger-gradient w-full py-3.5 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Watch Hub'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs text-slate-400">
              New resident?{' '}
              <Link to="/register" className="text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-4">
                Register account
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

