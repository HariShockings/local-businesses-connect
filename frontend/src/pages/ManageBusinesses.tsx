import React, { useState, useEffect } from 'react';
import * as Icons from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Business {
  _id: string;
  name: string;
  icon: string;
  contact: { phone: string; email: string };
  location: string;
  pageName: string;
  theme: string;
  description: string;
  website: string;
  services: string[];
  customIcon: string | null;
}

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

export default function ManageBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    contact: { phone: '', email: '' },
    location: '',
    pageName: '',
    theme: '',
    description: '',
    website: '',
    services: [] as string[],
    customIcon: null as string | null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [serviceInput, setServiceInput] = useState('');
  const [iconSearch, setIconSearch] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingToastId, setProcessingToastId] = useState<string | number | null>(null);
  const [pageNameError, setPageNameError] = useState('');

  const iconList = Object.keys(Icons)
    .filter((key) => key.startsWith('Fa'))
    .map((key) => ({ name: key, component: Icons[key as keyof typeof Icons] }));

  const filteredIcons = iconList.filter((icon) =>
    icon.name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusinessId) {
      const business = businesses.find((b) => b._id === selectedBusinessId);
      if (business) {
        setFormData({
          name: business.name || '',
          icon: business.icon || '',
          contact: {
            phone: business.contact?.phone || '',
            email: business.contact?.email || '',
          },
          location: business.location || '',
          pageName: business.pageName || '',
          theme: business.theme || '',
          description: business.description || '',
          website: business.website || '',
          services: business.services || [],
          customIcon: business.customIcon || null,
        });
        setIsEditing(true);
        setPageNameError('');
      }
    } else {
      resetForm();
    }
  }, [selectedBusinessId, businesses]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/businesses');
      setBusinesses(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: formData.theme === 'dark' ? 'dark' : 'light',
        });
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch businesses', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: formData.theme === 'dark' ? 'dark' : 'light',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePageName = (pageName: string, excludeId?: string): string => {
    // Check for spaces and special characters (except hyphen)
    if (/\s/.test(pageName)) {
      return 'Page name cannot contain spaces';
    }
    if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(pageName)) {
      return 'Page name must start with a letter and contain only letters, numbers, or hyphens';
    }
    // Check for uniqueness (excluding the current business if editing)
    const existingPage = businesses.find(
      (b) => b.pageName.toLowerCase() === pageName.toLowerCase() && b._id !== excludeId
    );
    if (existingPage) {
      return 'Page name already exists';
    }
    return '';
  };

  const generateUniquePageName = (baseName: string, excludeId?: string): string => {
    let newPageName = baseName;
    let attempt = 0;
    while (businesses.some((b) => b.pageName.toLowerCase() === newPageName.toLowerCase() && b._id !== excludeId)) {
      attempt++;
      newPageName = `${baseName}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return newPageName;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'pageName') {
      const error = validatePageName(value, isEditing ? selectedBusinessId : undefined);
      setPageNameError(error);
      setFormData((prev) => ({ ...prev, pageName: value }));
    } else if (name.includes('contact.')) {
      const contactField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        contact: { ...prev.contact, [contactField]: value || '' },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || '' }));
    }
  };

  const handleIconSelect = (iconName: string) => {
    setFormData((prev) => ({ ...prev, icon: iconName || '', customIcon: null }));
    setShowIconPicker(false);
    setIconSearch('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/png') {
      const uploadData = new FormData();
      uploadData.append('icon', file);
      try {
        const response = await api.post('businesses/upload/icon', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFormData((prev) => ({ ...prev, icon: '', customIcon: response.data.url || null }));
        setIsFileUpload(false);
        toast.success('Icon uploaded successfully', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: formData.theme === 'dark' ? 'dark' : 'light',
        });
      } catch (err) {
        toast.error('Failed to upload icon', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: formData.theme === 'dark' ? 'dark' : 'light',
        });
      }
    } else {
      toast.warn('Please upload a PNG file', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: formData.theme === 'dark' ? 'dark' : 'light',
      });
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'image/png') {
      const uploadData = new FormData();
      uploadData.append('icon', file);
      try {
        const response = await api.post('/upload/icon', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFormData((prev) => ({ ...prev, icon: '', customIcon: response.data.url || null }));
        setIsFileUpload(false);
        toast.success('Icon uploaded successfully', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: formData.theme === 'dark' ? 'dark' : 'light',
        });
      } catch (err) {
        toast.error('Failed to upload icon', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: formData.theme === 'dark' ? 'dark' : 'light',
        });
      }
    } else {
      toast.warn('Please drop a PNG file', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: formData.theme === 'dark' ? 'dark' : 'light',
      });
    }
  };

  const handleDeselectIcon = () => {
    setFormData((prev) => ({ ...prev, icon: '', customIcon: null }));
    setShowIconPicker(false);
    setIconSearch('');
  };

  const handleServiceInput = (e: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    if ('key' in e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
        e.preventDefault();
        if (formData.services.length>= 5) {
          toast.warn('Maximum 5 services allowed', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: formData.theme === 'dark' ? 'dark' : 'light',
          });
          setServiceInput('');
          return;
        }
        const value = serviceInput.trim();
        if (value) {
          setFormData((prev) => ({
            ...prev,
            services: [...prev.services, value],
          }));
          setServiceInput('');
        }
        return;
      }
    }
    setServiceInput(e.target?.value || '');
  };

  const handleServicePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    if (formData.services.length >= 5) {
      toast.warn('Maximum 5 services allowed', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: formData.theme === 'dark' ? 'dark' : 'light',
      });
      setServiceInput('');
      return;
    }
    const newServices = pastedText
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s);
    const availableSlots = 5 - formData.services.length;
    const servicesToAdd = newServices.slice(0, availableSlots);
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, ...servicesToAdd],
    }));
    setServiceInput('');
  };

  const handleRemoveService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pageNameValidationError = validatePageName(formData.pageName, isEditing ? selectedBusinessId : undefined);
    if (pageNameValidationError) {
      setPageNameError(pageNameValidationError);
      return;
    }

    // Ensure unique pageName
    const uniquePageName = generateUniquePageName(formData.pageName, isEditing ? selectedBusinessId : undefined);
    const updatedFormData = { ...formData, pageName: uniquePageName };

    setLoading(true);
    const toastId = toast.info('Processing...', {
      position: 'top-right',
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: formData.theme === 'dark' ? 'dark' : 'light',
    });
    setProcessingToastId(toastId);

    try {
      if (isEditing) {
        const response = await api.put(`/businesses/${selectedBusinessId}`, updatedFormData);
        setBusinesses((prev) =>
          prev.map((b) => (b._id === selectedBusinessId ? response.data : b))
        );
        setTimeout(() => {
          toast.dismiss(toastId);
          toast.success('Business updated successfully', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: formData.theme === 'dark' ? 'dark' : 'light',
          });
        }, 500);
      } else {
        const response = await api.post('/businesses', updatedFormData);
        setBusinesses((prev) => [...prev, response.data]);
        setTimeout(() => {
          toast.dismiss(toastId);
          toast.success('Business created successfully', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: formData.theme === 'dark' ? 'dark' : 'light',
          });
        }, 500);
      }
      resetForm();
      await fetchBusinesses();
    } catch (err: any) {
      setTimeout(() => {
        toast.dismiss(toastId);
        if (err.response?.status === 401) {
          toast.error('Session expired. Please log in again.', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: formData.theme === 'dark' ? 'dark' : 'light',
          });
        } else {
          toast.error(err.response?.data?.message || 'Failed to save business', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: formData.theme === 'dark' ? 'dark' : 'light',
          });
        }
      }, 500);
    } finally {
      setLoading(false);
      setProcessingToastId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedBusinessId) return;
    setLoading(true);
    const toastId = toast.info('Deleting...', {
      position: 'top-right',
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: formData.theme === 'dark' ? 'dark' : 'light',
    });
    setProcessingToastId(toastId);

    try {
      await api.delete(`/businesses/${selectedBusinessId}`);
      setBusinesses((prev) => prev.filter((b) => b._id !== selectedBusinessId));
      setTimeout(() => {
        toast.dismiss(toastId);
        toast.success('Business deleted successfully', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: formData.theme === 'dark' ? 'dark' : 'light',
        });
      }, 500);
      resetForm();
    } catch (err: any) {
      setTimeout(() => {
        toast.dismiss(toastId);
        if (err.response?.status === 401) {
          toast.error('Session expired. Please log in again.', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: formData.theme === 'dark' ? 'dark' : 'light',
          });
        } else {
          toast.error(err.response?.data?.message || 'Failed to delete business', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: formData.theme === 'dark' ? 'dark' : 'light',
          });
        }
      }, 500);
    } finally {
      setLoading(false);
      setProcessingToastId(null);
    }
  };

  const handleVisitPage = (pageName: string) => {
    // Assuming the business page is accessible at /business/{pageName}
    window.location.href = `/../${pageName}`;
  };

  const resetForm = () => {
    setSelectedBusinessId('');
    setFormData({
      name: '',
      icon: '',
      contact: { phone: '', email: '' },
      location: '',
      pageName: '',
      theme: '',
      description: '',
      website: '',
      services: [],
      customIcon: null,
    });
    setIsEditing(false);
    setShowIconPicker(false);
    setIsFileUpload(false);
    setServiceInput('');
    setIconSearch('');
    setPageNameError('');
  };

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
        theme={formData.theme === 'dark' ? 'dark' : 'light'}
      />
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Manage Businesses</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Business Profile
        </label>
        <select
          value={selectedBusinessId}
          onChange={(e) => setSelectedBusinessId(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Create New Business</option>
          {businesses.map((business) => (
            <option key={business._id} value={business._id}>
              {business.name}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {isEditing ? 'Edit Business Profile' : 'Add New Business'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Name</label>
            <div className="flex items-center">
              <Icons.FaBriefcase size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter business name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
            <div className="relative">
              {formData.icon || formData.customIcon ? (
                <div className="flex items-center">
                  {formData.customIcon ? (
                    <img src={formData.customIcon} alt="Custom Icon" className="w-6 h-6 mr-2 object-contain" />
                  ) : (
                    <span className="mr-2">
                      {React.createElement(Icons[formData.icon as keyof typeof Icons], { size: 16, className: 'text-gray-400' })}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleDeselectIcon}
                    className="absolute top-0 right-0 text-red-600 dark:text-red-400 text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : isFileUpload ? (
                <div
                  className="flex items-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <Icons.FaImage size={16} className="text-gray-400 mr-2" />
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsFileUpload(false)}
                    className="ml-2 px-3 py-2 bg-sky-600/25 text-white rounded-lg hover:bg-sky-700/30 text-xs"
                  >
                    Use Icon Picker
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <Icons.FaIcons size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={iconSearch || ''}
                    onChange={(e) => setIconSearch(e.target.value)}
                    onFocus={() => setShowIconPicker(true)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search for an icon..."
                  />
                  <button
                    type="button"
                    onClick={() => setIsFileUpload(true)}
                    className="ml-2 px-3 py-2 bg-sky-600/25 text-white rounded-lg hover:bg-sky-700/30 text-xs"
                  >
                    Upload PNG
                  </button>
                </div>
              )}
              {showIconPicker && !formData.icon && !formData.customIcon && !isFileUpload && (
                <div className="absolute z-10 mt-2 w-full max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {filteredIcons.length > 0 ? (
                      filteredIcons.map((icon) => (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => handleIconSelect(icon.name)}
                          className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <icon.component size={24} className="text-gray-600 dark:text-gray-300" />
                          <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">{icon.name}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 col-span-4 text-center">No icons found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <div className="flex items-center">
              <Icons.FaPhone size={16} className="text-gray-400 mr-2" />
              <input
                type="tel"
                name="contact.phone"
                value={formData.contact.phone || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="flex items-center">
              <Icons.FaEnvelope size={16} className="text-gray-400 mr-2" />
              <input
                type="email"
                name="contact.email"
                value={formData.contact.email || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <div className="flex items-center">
              <Icons.FaMapMarkerAlt size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter business location"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Name</label>
            <div className="flex items-center">
              <Icons.FaGlobe size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                name="pageName"
                value={formData.pageName || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${pageNameError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter page name (e.g., my-business)"
                required
              />
            </div>
            {pageNameError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{pageNameError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
            <div className="flex items-center">
              <Icons.FaPalette size={16} className="text-gray-400 mr-2" />
              <select
                name="theme"
                value={formData.theme || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a theme</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
            <div className="flex items-center">
              <Icons.FaGlobe size={16} className="text-gray-400 mr-2" />
              <input
                type="url"
                name="website"
                value={formData.website || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter website URL"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter business description"
            rows={4}
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Services (max 5)</label>
          <div className="flex items-center">
            <input
              type="text"
              value={serviceInput || ''}
              onChange={handleServiceInput}
              onKeyDown={handleServiceInput}
              onPaste={handleServicePaste}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter services (separate by space, comma, or enter)"
              disabled={formData.services.length >= 5}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.services.map((service, index) => (
              <div
                key={index}
                className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
              >
                {service}
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={loading || !!pageNameError}
          >
            {isEditing ? 'Update Business' : 'Add Business'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              disabled={loading}
            >
              Delete Business
            </button>
          )}
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Business Profiles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Icon</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Page Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Theme</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {businesses.map((business) => (
                <tr
                  key={business._id}
                  className="transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer hover:shadow-md"
                  onClick={() => setSelectedBusinessId(business._id)}
                >
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {business.customIcon ? (
                      <img src={business.customIcon} alt="Custom Icon" className="w-5 h-5 object-contain" />
                    ) : business.icon && Icons[business.icon as keyof typeof Icons] ? (
                      React.createElement(Icons[business.icon as keyof typeof Icons], { size: 20 })
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{business.name}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{business.pageName}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{business.location}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{business.contact.email}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{business.theme}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click from triggering
                        handleVisitPage(business.pageName);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                    >
                      Visit Page
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}