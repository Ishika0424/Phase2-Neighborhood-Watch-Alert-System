import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Phone, MapPin, Award, Share2, Shield, Check, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [locationName, setLocationName] = useState('');
  const [password, setPassword] = useState('');

  // Skills & Resources tags state
  const [skills, setSkills] = useState([]);
  const [resources, setResources] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [resourceInput, setResourceInput] = useState('');

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setLocationName(user.locationName || '');
      setSkills(user.skills || []);
      setResources(user.resources || []);
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    const profileData = {
      name,
      phone,
      address,
      locationName,
      skills,
      resources
    };

    if (password) {
      profileData.password = password;
    }

    const result = await updateProfile(profileData);
    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setPassword('');
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (tag) => {
    setSkills(skills.filter((s) => s !== tag));
  };

  const handleAddResource = (e) => {
    e.preventDefault();
    if (resourceInput.trim() && !resources.includes(resourceInput.trim())) {
      setResources([...resources, resourceInput.trim()]);
      setResourceInput('');
    }
  };

  const handleRemoveResource = (tag) => {
    setResources(resources.filter((r) => r !== tag));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Profile Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your details, skill tags, and tools you own.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Summary Card */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-2xl p-6 text-center shadow-xl">
            <div className="relative inline-block mb-4">
              <div className="h-24 w-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg border border-slate-700">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">{name || 'Local Resident'}</h2>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-indigo-400 font-semibold uppercase tracking-widest">
              <Shield className="h-4 w-4" />
              <span>Verified Member</span>
            </div>

            <div className="border-t border-slate-800/80 mt-6 pt-6 text-left space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <Phone className="h-4 w-4 text-indigo-500" />
                <span>{phone || 'No phone added'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <span>{locationName || 'No location set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6">Contact & Credentials</h2>

            {message.text && (
              <div className={`border px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border-red-500/30 text-red-300'
              }`}>
                {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                    placeholder="+1 (555) 019-2834"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Neighborhood / Area Location</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  placeholder="e.g. Oak Street Sector 4"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  placeholder="House 42, Lane 3"
                />
              </div>

              <div className="border-t border-slate-800/80 pt-5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Change Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  placeholder="New password..."
                />
              </div>

              {/* Skills & Resources Tag Fields */}
              <div className="border-t border-slate-800/80 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Skill Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">My Skill Tags</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Math, Plumbing"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      >
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-white font-bold ml-0.5 text-xs">
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resource Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">My Available Resources</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={resourceInput}
                      onChange={(e) => setResourceInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Drill, Laptop"
                    />
                    <button
                      type="button"
                      onClick={handleAddResource}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resources.map((res) => (
                      <span
                        key={res}
                        className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      >
                        {res}
                        <button type="button" onClick={() => handleRemoveResource(res)} className="hover:text-white font-bold ml-0.5 text-xs">
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
