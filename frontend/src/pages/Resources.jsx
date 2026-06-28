import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Search, Plus, Filter, MapPin, Tag, RefreshCw, Check, X, AlertCircle } from 'lucide-react';

const Resources = () => {
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tools');
  const [location, setLocation] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [categoryFilter]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (searchQuery) params.search = searchQuery;
      if (locationQuery) params.location = locationQuery;
      
      const res = await axios.get('/resources', { params });
      setResources(res.data);
    } catch (err) {
      console.error('Error fetching resources', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !description || !category || !location) {
      setFormError('All fields are required');
      return;
    }

    try {
      await axios.post('/resources', { name, description, category, location });
      setName('');
      setDescription('');
      setCategory('Tools');
      setLocation('');
      setShowAddForm(false);
      fetchResources();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to list resource');
    }
  };

  const handleRequestBorrow = async (id) => {
    try {
      await axios.post(`/resources/${id}/request`);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Request failed');
    }
  };

  const handleApproveBorrow = async (resourceId, requesterId) => {
    try {
      await axios.post(`/resources/${resourceId}/approve`, { requesterId });
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReturnResource = async (id) => {
    try {
      await axios.post(`/resources/${id}/return`);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Return failed');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource listing?')) return;
    try {
      await axios.delete(`/resources/${id}`);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const categories = ['Tools', 'Books', 'Equipment', 'Electronics', 'Educational', 'Other'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Available</span>;
      case 'Requested':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Requested</span>;
      case 'Borrowed':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Borrowed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Title */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Resource Sharing Board</h1>
          <p className="text-sm text-slate-400 mt-1">Lend tools, books, and equipment to neighbors or request items you need.</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!location && user?.locationName) setLocation(user.locationName);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 text-sm"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? 'Close Drawer' : 'Share a Resource'}
        </button>
      </div>

      {/* Add Listing Form Drawer */}
      {showAddForm && (
        <div className="glass-panel border-indigo-500/20 rounded-2xl p-6 mb-8 transition-all duration-300">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-400" /> Share a New Item
          </h2>
          {formError && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {formError}
            </div>
          )}
          <form onSubmit={handleCreateResource} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Item Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="e.g. Lawn Mower, Drill Kit, Textbook"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Description / Borrow Guidelines</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="Brief details about the condition, return expectations, or safety tips."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Pickup Location Area</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="e.g. Oak Street Sector 4, Block C"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm"
              >
                Post Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-5 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-auto flex flex-1 flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Search resources..."
              />
            </div>
            <div className="relative w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <MapPin className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Location..."
              />
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-wrap gap-2.5 items-center">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest mr-1">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </div>
            <button
              type="button"
              onClick={() => setCategoryFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                !categoryFilter
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  categoryFilter === cat
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 ml-auto"
            >
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Resource Listings Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <AlertCircle className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No resources found</h3>
          <p className="text-sm text-slate-400 mt-1">Be the first to share a resource with the community!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item) => {
            const isOwner = item.owner._id === user?._id;
            const hasRequested = item.requests.some((r) => r._id === user?._id);
            const isBorrower = item.borrowedBy?._id === user?._id;

            return (
              <div key={item._id} className="glass-card rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                      <Tag className="h-3.5 w-3.5" />
                      {item.category}
                    </span>
                    {getStatusBadge(item.availabilityStatus)}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4">{item.description}</p>
                  
                  <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/60 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-300">Owner:</span>
                      <span>{item.owner.name} {isOwner && '(You)'}</span>
                    </div>
                    {item.owner.phone && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-300">Contact:</span>
                        <span>{item.owner.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer / Action Buttons */}
                <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-800/80 flex flex-col gap-3">
                  {!isOwner ? (
                    <>
                      {item.availabilityStatus === 'Available' && (
                        <button
                          onClick={() => handleRequestBorrow(item._id)}
                          className="w-full py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold rounded-xl text-xs transition-all duration-300"
                        >
                          Request to Borrow
                        </button>
                      )}
                      {item.availabilityStatus === 'Requested' && (
                        <button
                          onClick={() => handleRequestBorrow(item._id)}
                          className={`w-full py-2 text-xs font-semibold rounded-xl border transition-all duration-300 ${
                            hasRequested
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                              : 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {hasRequested ? 'Cancel My Request' : 'Item Already Requested'}
                        </button>
                      )}
                      {item.availabilityStatus === 'Borrowed' && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            Borrowed by: <strong className="text-slate-300">{item.borrowedBy?.name}</strong>
                          </span>
                          {isBorrower && (
                            <button
                              onClick={() => handleReturnResource(item._id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                            >
                              Return Item
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    // Owner Operations
                    <div className="space-y-3">
                      {item.availabilityStatus === 'Requested' && item.requests.length > 0 && (
                        <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <span className="text-xs font-bold text-slate-300 block mb-1">Borrower Requests:</span>
                          {item.requests.map((reqUser) => (
                            <div key={reqUser._id} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-slate-200">{reqUser.name}</span>
                                {reqUser.phone && <span className="text-[10px] text-slate-500">{reqUser.phone}</span>}
                              </div>
                              <button
                                onClick={() => handleApproveBorrow(item._id, reqUser._id)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] transition-all"
                              >
                                <Check className="h-3 w-3" /> Approve
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {item.availabilityStatus === 'Borrowed' && (
                        <div className="flex items-center justify-between text-xs bg-slate-900/40 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400">
                            Lent to: <strong className="text-indigo-400">{item.borrowedBy?.name}</strong>
                          </span>
                          <button
                            onClick={() => handleReturnResource(item._id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded"
                          >
                            Mark Returned
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteResource(item._id)}
                          className="flex-1 py-1.5 bg-red-950/20 hover:bg-red-900/20 text-red-400 border border-red-950 rounded-xl text-xs font-semibold transition-all"
                        >
                          Delete Listing
                        </button>
                      </div>
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

export default Resources;
