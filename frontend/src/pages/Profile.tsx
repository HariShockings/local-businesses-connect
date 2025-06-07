import { useState, useEffect } from 'react';
import { Edit, Mail, Phone, MapPin, Globe, Camera, MessageSquare, Briefcase, Calendar, Trash, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
  _id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role: string;
  profilePicture?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  bio?: string;
  preferences: {
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

interface Business {
  _id: string;
  name: string;
  description: string;
  services: string[];
  pageName: string;
  createdAt: string;
}

interface Session {
  _id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  token: string;
}

interface Activity {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface BusinessStats {
  profileViews: number;
  inquiries: number;
  servicesOffered: number;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessStats, setBusinessStats] = useState<BusinessStats>({ profileViews: 0, inquiries: 0, servicesOffered: 0 });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingField, setEditingField] = useState<'profilePicture' | 'coverImage' | 'bio' | 'personalInfo' | null>(null);
  const [bioForm, setBioForm] = useState('');
  const [personalInfoForm, setPersonalInfoForm] = useState({ email: '', phone: '', location: '', website: '' });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [selectedGradient, setSelectedGradient] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProfileIcons, setShowProfileIcons] = useState(false);
  const [showCoverIcons, setShowCoverIcons] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'security', label: 'Security' },
  ];

  const gradients = [
    'bg-gradient-to-r from-primary-600 to-secondary-600',
    'bg-gradient-to-r from-blue-500 to-indigo-500',
    'bg-gradient-to-r from-green-500 to-teal-500',
    'bg-gradient-to-r from-red-500 to-orange-500',
    'bg-gradient-to-r from-purple-500 to-pink-500',
    'bg-gradient-to-r from-cyan-500 to-blue-500',
    'bg-gradient-to-r from-yellow-500 to-orange-500',
    'bg-gradient-to-r from-indigo-500 to-purple-500',
    'bg-gradient-to-r from-pink-500 to-rose-500',
    'bg-gradient-to-r from-teal-500 to-emerald-500'
  ];

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    withCredentials: true,
  });

  useEffect(() => {
    fetchUserProfile();
    fetchBusinesses();
    fetchBusinessStats();
    fetchSessions();
    fetchActivities();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/profile');
      setUser(response.data);
      setBioForm(response.data.bio || '');
      setPersonalInfoForm({
        email: response.data.email,
        phone: response.data.phone || '',
        location: response.data.location || '',
        website: response.data.website || '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await api.get('/businesses');
      setBusinesses(response.data.map((b: any) => ({
        _id: b._id,
        name: b.name,
        description: b.description || '',
        services: b.services || [],
        pageName: b.pageName,
        createdAt: b.createdAt,
      })));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch businesses');
    }
  };

  const fetchBusinessStats = async () => {
    try {
      const response = await api.get('/businesses/stats');
      setBusinessStats(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch business stats');
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await api.get('/users/sessions');
      setSessions(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch sessions');
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get('/users/activity');
      setActivities(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch activities');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profilePicture' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/png') {
      if (type === 'profilePicture') {
        setProfilePictureFile(file);
        setEditingField('profilePicture');
      } else {
        setCoverImageFile(file);
        setEditingField('coverImage');
      }
    } else {
      toast.warn('Please upload a PNG file');
    }
  };

  const handleImageSubmit = async (type: 'profilePicture' | 'coverImage') => {
    setLoading(true);
    try {
      const formData = new FormData();
      const file = type === 'profilePicture' ? profilePictureFile : coverImageFile;
      const endpoint = type === 'profilePicture' ? '/users/profile/picture' : '/users/profile/cover';

      if (file) {
        formData.append('image', file);
        const response = await api.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUser((prev) => prev ? { ...prev, [type]: response.data[type] } : prev);
      } else if (type === 'coverImage' && selectedGradient) {
        const response = await api.post(endpoint, { gradient: selectedGradient });
        setUser((prev) => prev ? { ...prev, coverImage: response.data.coverImage } : prev);
      }

      setProfilePictureFile(null);
      setCoverImageFile(null);
      setSelectedGradient('');
      setEditingField(null);
      setShowProfileIcons(false);
      setShowCoverIcons(false);
      toast.success(`${type === 'profilePicture' ? 'Profile picture' : 'Cover image'} updated successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update image');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (type: 'profilePicture' | 'coverImage') => {
    setLoading(true);
    try {
      const endpoint = type === 'profilePicture' ? '/users/profile/picture' : '/users/profile/cover';
      const response = await api.post(endpoint, {});
      setUser((prev) => prev ? { ...prev, [type]: response.data[type] } : prev);
      setShowProfileIcons(false);
      setShowCoverIcons(false);
      toast.success(`${type === 'profilePicture' ? 'Profile picture' : 'Cover image'} removed successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove image');
    } finally {
      setLoading(false);
    }
  };

  const handleBioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/users/profile/bio', { bio: bioForm });
      setUser((prev) => prev ? { ...prev, bio: response.data.bio } : prev);
      setEditingField(null);
      toast.success('Bio updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update bio');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/users/profile/personal', personalInfoForm);
      setUser((prev) => prev ? { ...prev, ...response.data } : prev);
      setEditingField(null);
      toast.success('Personal information updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update personal information');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setLoading(true);
    try {
      await api.delete(`/users/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      toast.success('Session revoked successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to revoke session');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={user.preferences.theme === 'dark' ? 'dark' : 'light'}
      />
      <div className="card overflow-hidden mb-6">
        {/* Cover image */}
        <div className="h-48 sm:h-64 w-full relative">
          {user.coverImage ? (
            user.coverImage.startsWith('bg-') ? (
              <div className={`w-full h-full ${user.coverImage}`}></div>
            ) : (
              <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-600 to-secondary-600"></div>
          )}
          <div className="absolute bottom-4 right-4">
            <AnimatePresence>
              {showCoverIcons ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex gap-2 bg-black/20 backdrop-blur-sm p-2 rounded-full"
                >
                  <button
                    onClick={() => setEditingField('coverImage')}
                    className="text-white p-1.5 rounded-full hover:bg-black/30 transition-colors"
                    disabled={loading}
                  >
                    <Camera size={18} />
                  </button>
                  {user.coverImage && (
                    <button
                      onClick={() => handleRemoveImage('coverImage')}
                      className="text-white p-1.5 rounded-full hover:bg-black/30 transition-colors"
                      disabled={loading}
                    >
                      <Trash size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setCoverImageFile(null);
                      setSelectedGradient('');
                      setShowCoverIcons(false);
                    }}
                    className="text-white p-1.5 rounded-full hover:bg-black/30 transition-colors"
                    disabled={loading}
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowCoverIcons(true)}
                  className="bg-black/20 hover:bg-black/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                  <Edit size={18} />
                </motion.button>
              )}
            </AnimatePresence>
            {editingField === 'coverImage' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 right-16 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col gap-2 max-w-xs"
              >
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Cover Options</h3>
                <div className="grid grid-cols-2 gap-2">
                  {gradients.map((gradient, i) => (
                    <button
                      key={i}
                      className={`h-8 rounded ${gradient} ${selectedGradient === gradient ? 'ring-2 ring-primary-500' : ''}`}
                      onClick={() => setSelectedGradient(gradient)}
                    ></button>
                  ))}
                </div>
                <input
                  id="coverImageInput"
                  type="file"
                  accept="image/png"
                  onChange={(e) => handleFileChange(e, 'coverImage')}
                  className="hidden"
                />
                <button
                  onClick={() => document.getElementById('coverImageInput')?.click()}
                  className="btn btn-outline text-sm"
                >
                  Upload Image
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleImageSubmit('coverImage')}
                    className="btn btn-primary text-sm"
                    disabled={loading || (!coverImageFile && !selectedGradient)}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setCoverImageFile(null);
                      setSelectedGradient('');
                      setEditingField(null);
                      setShowCoverIcons(false);
                    }}
                    className="btn btn-outline text-sm"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Profile info */}
        <div className="px-4 sm:px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end">
            <div className="flex-shrink-0 -mt-16 relative">
              <div className="h-32 w-32 rounded-full ring-4 ring-white dark:ring-gray-800 bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-4xl font-bold text-primary-600 dark:text-primary-400">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase() + (user.name.split(' ')[1]?.charAt(0).toUpperCase() || '')
                )}
              </div>
              <div className="absolute bottom-1 right-1">
                <AnimatePresence>
                  {showProfileIcons ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex gap-1 bg-white dark:bg-gray-700 p-1.5 rounded-full border border-gray-200 dark:border-gray-600"
                    >
                      <button
                        onClick={() => document.getElementById('profilePictureInput')?.click()}
                        className="text-gray-600 dark:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        disabled={loading}
                      >
                        <Camera size={14} />
                      </button>
                      {user.profilePicture && (
                        <button
                          onClick={() => handleRemoveImage('profilePicture')}
                          className="text-gray-600 dark:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          disabled={loading}
                        >
                          <Trash size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setProfilePictureFile(null);
                          setShowProfileIcons(false);
                        }}
                        className="text-gray-600 dark:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        disabled={loading}
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowProfileIcons(true)}
                      className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      <Edit size={14} />
                    </motion.button>
                  )}
                </AnimatePresence>
                <input
                  id="profilePictureInput"
                  type="file"
                  accept="image/png"
                  onChange={(e) => handleFileChange(e, 'profilePicture')}
                  className="hidden"
                />
                {editingField === 'profilePicture' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="absolute bottom-1 -right-28 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg flex gap-2"
                  >
                    <button
                      onClick={() => handleImageSubmit('profilePicture')}
                      className="btn btn-primary text-sm"
                      disabled={loading || !profilePictureFile}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setProfilePictureFile(null);
                        setEditingField(null);
                        setShowProfileIcons(false);
                      }}
                      className="btn btn-outline text-sm"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="flex-1 sm:ml-6 mt-4 sm:mt-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Business Owner</p>
              {user.username && <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>}
            </div>
          </div>
          
          {/* Profile tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mt-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h2>
                <button
                  onClick={() => setEditingField('personalInfo')}
                  className="btn btn-outline text-sm flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </button>
              </div>
              {editingField === 'personalInfo' ? (
                <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={personalInfoForm.email}
                      onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, email: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={personalInfoForm.phone}
                      onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, phone: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm facont-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={personalInfoForm.location}
                      onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, location: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                    <input
                      type="url"
                      value={personalInfoForm.website}
                      onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, website: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPersonalInfoForm({
                          email: user.email,
                          phone: user.phone || '',
                          location: user.location || '',
                          website: user.website || '',
                        });
                        setEditingField(null);
                      }}
                      className="btn btn-outline"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-sm text-gray-900 dark:text-white">{user.phone || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                      <p className="text-sm text-gray-900 dark:text-white">{user.location || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
                      <p className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                        {user.website || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="card p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Business Profiles</h2>
              <div className="space-y-6">
                {businesses.map((business) => (
                  <div key={business._id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">{business.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{business.description}</p>
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Services:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {business.services.map((service, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Founded {new Date(business.createdAt).getFullYear()}
                    </p>
                    <a href={`/../${business.pageName}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
                      View Business Page
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">About</h2>
                <button
                  onClick={() => setEditingField('bio')}
                  className="btn btn-outline text-sm flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Bio
                </button>
              </div>
              {editingField === 'bio' ? (
                <form onSubmit={handleBioSubmit} className="space-y-4">
                  <textarea
                    value={bioForm}
                    onChange={(e) => setBioForm(e.target.value)}
                    className="input w-full"
                    rows={4}
                  />
                  <div className="flex gap-4">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBioForm(user.bio || ''); setEditingField(null); }}
                      className="btn btn-outline"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {user.bio || 'No bio provided.'}
                </p>
              )}
            </div>
            
            <div className="card p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Business Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Profile Views</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{businessStats.profileViews}</p>
                </div>
                <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Inquiries</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{businessStats.inquiries}</p>
                </div>
                <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Services Offered</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{businessStats.servicesOffered}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'activity' && (
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="flow-root">
            <ul className="space-y-6">
              {activities.map((activity) => (
                <li key={activity._id} className="relative pb-6">
                  {activity !== activities[activities.length - 1] && (
                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-primary-50 dark:bg-gray-800 ring-4 ring-white dark:ring-gray-400 items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</div>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-center">
              <button className="btn btn-outline">Load More</button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-0">Current Password</label>
                <input
                  type="password"
                  className="input w-full"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-0">New Password</label>
                <input
                  type="password"
                  className="input w-full"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-0">Confirm Password</label>
                <input
                  type="password"
                  className="input w-full"
                />
              </div>
              
              <div className="pt-2">
                <button type="submit" className="btn btn-primary w-40" disabled>Update Password</button>
              </div>
            </form>
          </div>
          
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Add a layer of protection to your account by enabling two-factor authentication.
            </p>
            
            <div className="flex items-center justify-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-0">Enable 2FA</h3>
                <p className="text-sm">This will require a verification code when logging in</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-auto">
                <input type="checkbox" className="sr-only peer-checked:bg-gray-200 dark:bg-gray-700 rounded-lg w-[52px] h-6" />
                <span className="absolute top-[2px] left-[2px] bg-white border-gray-200 border rounded-lg w-5 h-5 transition-all duration-200 peer-checked:bg-gray-300 peer-checked:left-[28px]"></span>
              </label>
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Sessions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              These are devices that have signed into your account. Revoke any sessions that you don’t recognize.
            </p>
            
            <div className="space-y-0">
              {sessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-0">{session.device}</h3>
                      {session.token === localStorage.getItem('token') && (
                        <div className="ml-2 px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium">Current</div>
                      )}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      <span className="text-sm">{session.location || 'Unknown'}</span> | <span className="text-sm">{session.ip || 'Unknown'}</span> | <span className="text-sm">{new Date(session.lastActive).toLocaleString()}</span>
                    </div>
                  </div>
                  {session.token !== localStorage.getItem('token') && (
                    <button
                      onClick={() => handleRevokeSession(session._id)}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      disabled={loading}
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}