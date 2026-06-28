import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Search, Plus, Filter, Tag, Calendar, User, MessageSquare, Check, X, AlertCircle } from 'lucide-react';

const Skills = () => {
  const { user } = useContext(AuthContext);
  const [skills, setSkills] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tutoring');
  const [availability, setAvailability] = useState('');
  const [formError, setFormError] = useState('');
  
  // Request Modal / Drawer state
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    fetchSkills();
  }, [categoryFilter]);

  const fetchSkills = async () => {
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await axios.get('/skills', { params });
      setSkills(res.data);
    } catch (err) {
      console.error('Error fetching skills', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSkills();
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description || !category || !availability) {
      setFormError('All fields are required');
      return;
    }

    try {
      await axios.post('/skills', { title, description, category, availability });
      setTitle('');
      setDescription('');
      setCategory('Tutoring');
      setAvailability('');
      setShowAddForm(false);
      fetchSkills();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to list service');
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestMessage) return;

    try {
      await axios.post(`/skills/${selectedSkill._id}/request`, { message: requestMessage });
      setRequestMessage('');
      setSelectedSkill(null);
      fetchSkills();
      alert('Request sent successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleRequestStatus = async (skillId, requestId, status) => {
    try {
      await axios.put(`/skills/${skillId}/requests/${requestId}`, { status });
      fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await axios.delete(`/skills/${id}`);
      fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const categories = ['Tutoring', 'Technical Support', 'Home Maintenance', 'Mentorship', 'Other'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Skill Sharing & Local Services</h1>
          <p className="text-sm text-slate-400 mt-1">Offer your expertise or request assistance for local needs.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 text-sm"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? 'Close Drawer' : 'Offer a Skill'}
        </button>
      </div>

      {/* Share Skill Form */}
      {showAddForm && (
        <div className="glass-panel border-indigo-500/20 rounded-2xl p-6 mb-8 transition-all duration-300">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-400" /> Share a New Service / Skill
          </h2>
          {formError && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {formError}
            </div>
          )}
          <form onSubmit={handleCreateSkill} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Service Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="e.g. High School Math Tutoring, PC Repair, Plumbing Assist"
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
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Description / Experience Details</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="Describe what you can offer, your experience level, or help details."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Availability Schedule</label>
              <input
                type="text"
                required
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="e.g. Weekends (9 AM - 5 PM), Tuesday evenings, On Demand"
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
                Post Offering
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search */}
      <div className="glass-panel rounded-2xl p-5 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Search services or skills..."
            />
          </div>

          <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest mr-1">
              <Filter className="h-3.5 w-3.5" /> Category:
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

      {/* Grid of Listings */}
      {skills.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <AlertCircle className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No skill listings found</h3>
          <p className="text-sm text-slate-400 mt-1">Be the first to offer a skill to your neighbors!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => {
            const isOwner = skill.owner._id === user?._id;
            const myRequest = skill.requests.find((r) => r.user?._id === user?._id || r.user === user?._id);

            return (
              <div key={skill._id} className="glass-card rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                      <Tag className="h-3.5 w-3.5" />
                      {skill.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                      {skill.availability}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{skill.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4">{skill.description}</p>
                  
                  <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/60 pt-4">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span className="font-semibold text-slate-300">Provider:</span>
                      <span>{skill.owner.name} {isOwner && '(You)'}</span>
                    </div>
                    {skill.owner.phone && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-300">Contact:</span>
                        <span>{skill.owner.phone}</span>
                      </div>
                    )}
                    {skill.owner.locationName && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-300">Location:</span>
                        <span>{skill.owner.locationName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-800/80 flex flex-col gap-3">
                  {!isOwner ? (
                    <>
                      {myRequest ? (
                        <div className="flex flex-col gap-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Request Status:</span>
                            <span className={`font-bold ${
                              myRequest.status === 'Accepted' ? 'text-emerald-400' :
                              myRequest.status === 'Declined' ? 'text-red-400' : 'text-amber-400'
                            }`}>{myRequest.status}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic mt-1 font-medium">"{myRequest.message}"</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedSkill(skill)}
                          className="w-full py-2 bg-indigo-600/95 hover:bg-indigo-600 text-white font-semibold rounded-xl text-xs transition-all duration-300"
                        >
                          Send Request Message
                        </button>
                      )}
                    </>
                  ) : (
                    // Owner Dashboard for Service Requests
                    <div className="space-y-3">
                      {skill.requests.length > 0 && (
                        <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <span className="text-xs font-bold text-slate-300 block mb-1">Assistance Requests:</span>
                          {skill.requests.map((req) => (
                            <div key={req._id} className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-200">{req.user?.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                                  req.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  req.status === 'Declined' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>{req.status}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 italic">"{req.message}"</p>
                              
                              {req.status === 'Pending' && (
                                <div className="flex justify-end gap-2 mt-1">
                                  <button
                                    onClick={() => handleRequestStatus(skill._id, req._id, 'Declined')}
                                    className="px-2 py-0.5 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-900/40 rounded text-[9px] font-bold"
                                  >
                                    Decline
                                  </button>
                                  <button
                                    onClick={() => handleRequestStatus(skill._id, req._id, 'Accepted')}
                                    className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold"
                                  >
                                    Accept
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteSkill(skill._id)}
                          className="flex-1 py-1.5 bg-red-950/20 hover:bg-red-900/20 text-red-400 border border-red-950 rounded-xl text-xs font-semibold transition-all"
                        >
                          Delete Offering
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

      {/* Request Help Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">Request Assistance</h3>
            <p className="text-xs text-slate-400 mb-4">
              Sending help request for: <strong className="text-indigo-400">"{selectedSkill.title}"</strong>
            </p>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Message / Help details
                </label>
                <textarea
                  required
                  rows="4"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                  placeholder="Explain what kind of help you need and when you are available."
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedSkill(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
