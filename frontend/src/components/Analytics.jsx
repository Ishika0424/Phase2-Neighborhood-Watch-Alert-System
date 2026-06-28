import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { RefreshCw, BarChart2, PieChart as PieIcon, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/alerts/analytics');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching analytics stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!stats || stats.totalCount === 0) {
    return (
      <div className="text-center py-10 glass-panel rounded-2xl">
        <TrendingUp className="h-10 w-10 text-slate-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-300">No data available yet</h3>
        <p className="text-xs text-slate-400 mt-1">Metrics will update once community safety alerts are submitted.</p>
      </div>
    );
  }

  // Predefined color palette
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6'];
  const SEVERITY_COLORS = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#10b981'
  };
  const STATUS_COLORS = {
    Active: '#f59e0b',
    Investigating: '#6366f1',
    Resolved: '#10b981'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Chart 1: Alerts by Category */}
      <div className="glass-card rounded-2xl p-5 md:col-span-2 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="h-4.5 w-4.5 text-indigo-400" /> Alert Category Distribution
          </h3>
          <span className="text-xs font-semibold text-slate-400">Total Alerts: {stats.totalCount}</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.categories} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                labelClassName="text-slate-300 font-bold text-xs"
                itemStyle={{ color: '#fff', fontSize: '11px' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stats.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Status & Resolution Donut */}
      <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
          <PieIcon className="h-4.5 w-4.5 text-indigo-400" /> Resolution Status
        </h3>
        <div className="h-48 relative flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.statuses}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
              >
                {stats.statuses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#fff', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total */}
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black text-white">{stats.totalCount}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reports</span>
          </div>
        </div>
        {/* Custom Legend */}
        <div className="flex justify-center gap-3 mt-2">
          {stats.statuses.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: STATUS_COLORS[item.name] }}
              ></span>
              <span>{item.name} ({item.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
