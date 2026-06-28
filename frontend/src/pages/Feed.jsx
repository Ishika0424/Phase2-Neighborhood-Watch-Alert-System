import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, MapPin, Tag, Share2, Award, Calendar, RefreshCw, ChevronRight, User } from 'lucide-react';

const Feed = () => {
  const { user } = useContext(AuthContext);
  const [feedItems, setFeedItems] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, resources, skills
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, [filterType]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const params = { search: searchQuery };

      let items = [];

      if (filterType === 'all' || filterType === 'resources') {
        const res = await axios.get('/resources', { params });
        items = [...items, ...res.data.map(item => ({ ...item, feedType: 'resource' }))];
      }

      if (filterType === 'all' || filterType === 'skills') {
        const res = await axios.get('/skills', { params });
        items = [...items, ...res.data.map(item => ({ ...item, feedType: 'skill' }))];
      }

      // Sort by creation date descending
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFeedItems(items);
    } catch (err) {
      console.error('Error fetching feed items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFeed();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome Banner */}
      <div className="glass-panel border-indigo-500/10 rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Hello, <span className="bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">{user?.name}</span>!
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Welcome to your community hub. Below is a live stream of resources, tools, and services offered by neighbors in your area.
          </p>
        </div>
        <div className="flex gap-3 z-10">
          <Link
            to="/resources"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Lend Tools <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/skills"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            Offer Skills <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Stream Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Search feed listings..."
          />
        </form>

        {/* Filter Tabs */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/5'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterType('resources')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              filterType === 'resources'
                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/5'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="h-3.5 w-3.5" /> Resources
          </button>
          <button
            onClick={() => setFilterType('skills')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              filterType === 'skills'
                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/5'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" /> Skill Offerings
          </button>
        </div>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : feedItems.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <h3 className="text-lg font-bold text-slate-300">Nothing here yet</h3>
          <p className="text-sm text-slate-400 mt-1">Try broadening your search or post a sharing listing yourself.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedItems.map((item) => {
            const isResource = item.feedType === 'resource';

            return (
              <div
                key={item._id}
                className="glass-card rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="p-6">
                  {/* Category & Type Indicator */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      {isResource ? <Share2 className="h-3 w-3 text-indigo-500" /> : <Award className="h-3 w-3 text-indigo-500" />}
                      {isResource ? 'Resource' : 'Service Offer'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white mb-2 leading-tight">
                    {isResource ? item.name : item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">{item.description}</p>

                  <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/60 pt-4">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span className="font-semibold text-slate-300">Provider:</span>
                      <span>{item.owner?.name}</span>
                    </div>
                    {isResource ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span className="font-semibold text-slate-300">Area:</span>
                        <span>{item.location}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span className="font-semibold text-slate-300">Available:</span>
                        <span>{item.availability}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-3.5 bg-slate-900/30 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                    {item.category}
                  </span>
                  <Link
                    to={isResource ? '/resources' : '/skills'}
                    className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-0.5"
                  >
                    View Details <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Feed;
