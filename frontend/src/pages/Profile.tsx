import { useState } from 'react';
import { Edit, Mail, Phone, MapPin, Globe, Briefcase, Calendar, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'security', label: 'Security' },
  ];
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="card overflow-hidden mb-6">
        {/* Cover image */}
        <div className="h-48 sm:h-64 w-full bg-gradient-to-r from-primary-600 to-secondary-600 relative">
          <button className="absolute bottom-4 right-4 bg-black/20 hover:bg-black/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors">
            <Camera size={18} />
          </button>
        </div>
        
        {/* Profile info */}
        <div className="px-4 sm:px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end">
            <div className="flex-shrink-0 -mt-16 relative">
              <div className="h-32 w-32 rounded-full ring-4 ring-white dark:ring-gray-800 bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-4xl font-bold text-primary-600 dark:text-primary-400">
                JD
              </div>
              <button className="absolute bottom-1 right-1 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            
            <div className="flex-1 sm:ml-6 mt-4 sm:mt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jane Doe</h1>
                <p className="text-gray-500 dark:text-gray-400">Product Designer</p>
              </div>
              <button className="mt-4 sm:mt-0 btn btn-outline flex items-center">
                <Edit size={16} className="mr-2" />
                Edit Profile
              </button>
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
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white">jane@example.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm text-gray-900 dark:text-white">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm text-gray-900 dark:text-white">San Francisco, CA</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
                    <p className="text-sm text-primary-600 dark:text-primary-400 hover:underline">www.janedoe.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team Members</h2>
              <div className="space-y-4">
                {[
                  { name: 'Alex Johnson', role: 'UI Designer', avatar: 'AJ' },
                  { name: 'Sarah Miller', role: 'Frontend Developer', avatar: 'SM' },
                  { name: 'Michael Brown', role: 'Product Manager', avatar: 'MB' },
                  { name: 'Jessica Williams', role: 'UX Researcher', avatar: 'JW' },
                ].map((member, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                      {member.avatar}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">About</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Product designer with over 8 years of experience in creating user-centered digital products.
                Specialized in UI/UX design, interaction design, and visual design. Passionate about
                solving complex problems with elegant and intuitive design solutions.
                <br /><br />
                Previously worked at top tech companies including Google and Airbnb, where I helped
                design products used by millions of people worldwide. Currently focused on building
                intuitive analytics dashboards and data visualization tools.
              </p>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Experience</h3>
                <div className="space-y-4">
                  {[
                    { role: 'Senior Product Designer', company: 'Insight Analytics', period: '2021 - Present' },
                    { role: 'Product Designer', company: 'Airbnb', period: '2018 - 2021' },
                    { role: 'UI Designer', company: 'Google', period: '2015 - 2018' },
                  ].map((job, i) => (
                    <div key={i} className="flex">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.role}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{job.company}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {job.period}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'UI Design', 'UX Design', 'Product Design', 'Figma', 'Adobe XD', 'Sketch',
                    'Prototyping', 'Design Systems', 'User Research', 'Wireframing', 'Visual Design'
                  ].map((skill, i) => (
                    <span key={i} className="px-3 py-1 text-xs rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Projects</h2>
                <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  View All
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Analytics Dashboard', description: 'Data visualization tool for marketing teams', progress: 80 },
                  { name: 'Mobile App Redesign', description: 'UX improvements for financial app', progress: 65 },
                  { name: 'E-commerce Platform', description: 'New shopping experience for online retailer', progress: 45 },
                  { name: 'Healthcare Portal', description: 'Patient management system redesign', progress: 90 },
                ].map((project, i) => (
                  <motion.div 
                    key={i} 
                    className="card p-4 hover:shadow-md transition-shadow duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-300">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-primary-600 h-1.5 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
              {[...Array(8)].map((_, i) => (
                <li key={i} className="relative pb-6">
                  {i < 7 && (
                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700\" aria-hidden="true"></span>
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-primary-50 dark:bg-primary-900/30 ring-4 ring-white dark:ring-gray-800 flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400">
                          {i % 4 === 0 ? '🎨' : i % 4 === 1 ? '💬' : i % 4 === 2 ? '📊' : '📝'}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {i % 4 === 0 ? 'Updated project design' : i % 4 === 1 ? 'Commented on task' : i % 4 === 2 ? 'Reviewed analytics' : 'Created new document'}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {i === 0 ? 'Just now' : i === 1 ? '1 hour ago' : i === 2 ? '3 hours ago' : i === 3 ? 'Yesterday at 12:34 PM' : `${i} days ago`}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <p>
                          {i % 4 === 0 
                            ? 'Updated the design system components for the Analytics Dashboard project.' 
                            : i % 4 === 1 
                            ? 'Left a comment on "Implement new chart visualization" task: "Let\'s use a stacked bar chart for this data set."' 
                            : i % 4 === 2 
                            ? 'Reviewed and analyzed user engagement metrics for Q1 2023.' 
                            : 'Created a new document "Design System Guidelines" in the shared workspace.'}
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
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-password"
                  name="current-password"
                  className="input w-full"
                />
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  name="new-password"
                  className="input w-full"
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  className="input w-full"
                />
              </div>
              
              <div className="pt-2">
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
          
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Enable 2FA</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This will require an authentication code when logging in</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sessions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              These are devices that have logged into your account. Revoke any sessions that you do not recognize.
            </p>
            
            <div className="space-y-4">
              {[
                { device: 'MacBook Pro', location: 'San Francisco, CA', ip: '192.168.1.1', lastActive: 'Active now', current: true },
                { device: 'iPhone 13', location: 'San Francisco, CA', ip: '192.168.1.2', lastActive: '3 hours ago', current: false },
                { device: 'Windows PC', location: 'New York, NY', ip: '192.168.1.3', lastActive: '2 days ago', current: false },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{session.device}</h3>
                      {session.current && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>{session.location}</span>
                      <span className="mx-1">•</span>
                      <span>{session.ip}</span>
                      <span className="mx-1">•</span>
                      <span>{session.lastActive}</span>
                    </div>
                  </div>
                  {!session.current && (
                    <button className="text-xs text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300">
                      Revoke
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