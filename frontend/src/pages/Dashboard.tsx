import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Users, Eye, MessageSquare, Clock, Star, Plus, RefreshCw, Heart } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import AreaChart from '../components/charts/AreaChart';
import BarChart from '../components/charts/BarChart';
import DoughnutChart from '../components/charts/DoughnutChart';
import RecentActivities from '../components/dashboard/RecentActivities';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [isProUser, setIsProUser] = useState(false); // Simulate user status (replace with auth check)
  const [businesses, setBusinesses] = useState([
    {
      id: '1',
      name: 'Coffee Haven',
      isPublic: true,
      views: 4152,
      inquiries: 114,
      rating: 4.8,
      engagementScore: 85,
      popularService: 'Espresso',
      communityImpact: 12,
      services: ['Espresso', 'Pastries', 'Catering'],
    },
    {
      id: '2',
      name: 'Tech Repairs',
      isPublic: true,
      views: 3821,
      inquiries: 98,
      rating: 4.5,
      engagementScore: 78,
      popularService: 'Phone Repair',
      communityImpact: 8,
      services: ['Phone Repair', 'Laptop Repair', 'Data Recovery'],
    },
    {
      id: '3',
      name: 'Green Gardens',
      isPublic: false,
      views: 2563,
      inquiries: 76,
      rating: 4.9,
      engagementScore: 92,
      popularService: 'Landscaping',
      communityImpact: 15,
      services: ['Landscaping', 'Tree Trimming', 'Garden Design'],
    },
  ]);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [engagementChartType, setEngagementChartType] = useState('area'); // Default to AreaChart
  const [communityChartType, setCommunityChartType] = useState('bar'); // Default to BarChart

  const maxBusinesses = isProUser ? 7 : 3;

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1200);
  };

  const addNewBusiness = () => {
    if (newBusinessName.trim()) {
      if (businesses.length >= maxBusinesses) {
        setShowUpgradePrompt(true);
        return;
      }
      setBusinesses([
        ...businesses,
        {
          id: `${Date.now()}`,
          name: newBusinessName,
          isPublic: true,
          views: 0,
          inquiries: 0,
          rating: 0,
          engagementScore: 0,
          popularService: 'None',
          communityImpact: 0,
          services: [],
        },
      ]);
      setNewBusinessName('');
    }
  };

  const toggleVisibility = (id) => {
    setBusinesses(
      businesses.map((business) =>
        business.id === id ? { ...business, isPublic: !business.isPublic } : business
      )
    );
  };

  const stats = [
    {
      id: 1,
      name: 'Total Businesses',
      value: selectedBusiness === 'all' ? businesses.length.toString() : '1',
      change: '+15.3%',
      isIncrease: true,
      icon: Users,
      color: 'primary',
    },
    {
      id: 2,
      name: 'Profile Views',
      value: selectedBusiness === 'all'
        ? businesses.reduce((sum, b) => sum + b.views, 0).toLocaleString()
        : businesses.find((b) => b.id === selectedBusiness)?.views.toLocaleString(),
      change: '+9.1%',
      isIncrease: true,
      icon: Eye,
      color: 'success',
    },
    {
      id: 3,
      name: 'User Inquiries',
      value: selectedBusiness === 'all'
        ? businesses.reduce((sum, b) => sum + b.inquiries, 0).toString()
        : businesses.find((b) => b.id === selectedBusiness)?.inquiries.toString(),
      change: '-1.2%',
      isIncrease: false,
      icon: MessageSquare,
      color: 'warning',
    },
    {
      id: 4,
      name: 'Engagement Score',
      value: selectedBusiness === 'all'
        ? Math.round(
            businesses.reduce((sum, b) => sum + b.engagementScore, 0) / businesses.length
          ).toString()
        : businesses.find((b) => b.id === selectedBusiness)?.engagementScore.toString(),
      change: '+5.7%',
      isIncrease: true,
      icon: Star,
      color: 'secondary',
    },
    {
      id: 5,
      name: 'Community Impact',
      value: selectedBusiness === 'all'
        ? businesses.reduce((sum, b) => sum + b.communityImpact, 0).toString() + ' Events'
        : businesses.find((b) => b.id === selectedBusiness)?.communityImpact.toString() + ' Events',
      change: '+12.0%',
      isIncrease: true,
      icon: Heart,
      color: 'info',
    },
  ];

  return (
<div className="max-w-7xl mx-auto p-4 relative">
      <span className="absolute right-4 top-0 text-xs text-gray-500 dark:text-gray-400">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </span>
      <div className="flex items-center justify-between mb-6 mt-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Community Business Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            className="input text-xs py-1 px-2"
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
          >
            <option value="all">All Businesses</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="btn btn-outline flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {showUpgradePrompt && (
        <div className="card p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
          <p className="text-sm">
            {isProUser
              ? 'You’ve reached the limit of 7 businesses.'
              : 'You’ve reached the limit of 3 businesses. Upgrade to Pro to add up to 7 businesses!'}
          </p>
          {!isProUser && (
            <Link to="/settings" className="btn btn-primary text-xs py-1 mt-2">
              Upgrade to Pro
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatCard stat={stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Engagement Over Time</h2>
              <div className="flex space-x-2">
                <button
                  className={`btn text-xs py-1 ${engagementChartType === 'area' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setEngagementChartType('area')}
                >
                  Area
                </button>
                <button
                  className={`btn text-xs py-1 ${engagementChartType === 'bar' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setEngagementChartType('bar')}
                >
                  Bar
                </button>
                <button className="btn btn-outline text-xs py-1">Daily</button>
                <button className="btn btn-primary text-xs py-1">Weekly</button>
                <button className="btn btn-outline text-xs py-1">Monthly</button>
              </div>
            </div>
            {engagementChartType === 'area' ? <AreaChart /> : <BarChart />}
          </div>
        </div>
        
        <div>
          <div className="card p-4 h-full">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Service Popularity</h2>
            <div className="h-64">
              <DoughnutChart />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {selectedBusiness === 'all' ? (
                <>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">Espresso</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-secondary-500 mr-2"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">Phone Repair</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-success-500 mr-2"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">Landscaping</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-warning-500 mr-2"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">Other</span>
                  </div>
                </>
              ) : (
                businesses
                  .find((b) => b.id === selectedBusiness)
                  ?.services.map((service, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          ['bg-primary-500', 'bg-secondary-500', 'bg-success-500', 'bg-warning-500'][index % 4]
                        }`}
                      ></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">{service}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Community Impact</h2>
              <div className="flex space-x-2">
                <button
                  className={`btn text-xs py-1 ${communityChartType === 'area' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setCommunityChartType('area')}
                >
                  Area
                </button>
                <button
                  className={`btn text-xs py-1 ${communityChartType === 'bar' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setCommunityChartType('bar')}
                >
                  Bar
                </button>
                <select className="input text-xs py-1 px-2">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>
            </div>
            {communityChartType === 'area' ? <AreaChart /> : <BarChart />}
          </div>
        </div>
        
        <div>
          <div className="card p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Interactions</h2>
              <Link to="/interactions" className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                View All
              </Link>
            </div>
            <RecentActivities />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Manage Business Visibility</h2>
          <div className="space-y-2">
            {businesses.map((business) => (
              <div key={business.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">{business.name}</span>
                <button
                  className={`btn text-xs py-1 ${
                    business.isPublic ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
                  } text-white`}
                  onClick={() => toggleVisibility(business.id)}
                >
                  {business.isPublic ? 'Public' : 'Private'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Business</h2>
          <div className="flex space-x-2">
            <input
              className="input w-full"
              placeholder="New business name"
              value={newBusinessName}
              onChange={(e) => setNewBusinessName(e.target.value)}
            />
            <button
              className="btn btn-primary flex items-center"
              onClick={addNewBusiness}
              disabled={!newBusinessName.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Service Offerings</h2>
        <div className="space-y-2">
          {selectedBusiness === 'all' ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">Select a business to manage services.</p>
          ) : (
            <>
              {businesses
                .find((b) => b.id === selectedBusiness)
                ?.services.map((service, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{service}</span>
                    <button
                      className="text-xs text-red-600 hover:text-red-700"
                      onClick={() => {
                        const selected = businesses.find((b) => b.id === selectedBusiness);
                        if (selected) {
                          const newServices = selected.services.filter((_, i) => i !== index);
                          setBusinesses(
                            businesses.map((b) =>
                              b.id === selectedBusiness ? { ...b, services: newServices } : b
                            )
                          );
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              <input
                className="input w-full mt-2"
                placeholder="Add new service"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    const selected = businesses.find((b) => b.id === selectedBusiness);
                    if (selected) {
                      setBusinesses(
                        businesses.map((b) =>
                          b.id === selectedBusiness
                            ? { ...b, services: [...b.services, e.target.value] }
                            : b
                        )
                      );
                      e.target.value = '';
                    }
                  }}
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}