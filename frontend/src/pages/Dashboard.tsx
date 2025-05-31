import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Users, DollarSign, ShoppingCart, Clock, RefreshCw } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import AreaChart from '../components/charts/AreaChart';
import BarChart from '../components/charts/BarChart';
import DoughnutChart from '../components/charts/DoughnutChart';
import RecentActivities from '../components/dashboard/RecentActivities';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = () => {
    setIsLoading(true);
    // Simulate data fetching
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1200);
  };

  const stats = [
    {
      id: 1,
      name: 'Total Users',
      value: '24,521',
      change: '+12.5%',
      isIncrease: true,
      icon: Users,
      color: 'primary',
    },
    {
      id: 2,
      name: 'Revenue',
      value: '$45,621',
      change: '+8.2%',
      isIncrease: true,
      icon: DollarSign,
      color: 'success',
    },
    {
      id: 3,
      name: 'Conversion Rate',
      value: '3.8%',
      change: '-2.4%',
      isIncrease: false,
      icon: ShoppingCart,
      color: 'warning',
    },
    {
      id: 4,
      name: 'Avg. Session',
      value: '4m 32s',
      change: '+1.2%',
      isIncrease: true,
      icon: Clock,
      color: 'secondary',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="btn btn-outline flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Revenue Overview</h2>
              <div className="flex space-x-2">
                <button className="btn btn-outline text-xs py-1">Weekly</button>
                <button className="btn btn-primary text-xs py-1">Monthly</button>
                <button className="btn btn-outline text-xs py-1">Yearly</button>
              </div>
            </div>
            <AreaChart />
          </div>
        </div>
        
        <div>
          <div className="card p-4 h-full">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Traffic Sources</h2>
            <div className="h-64">
              <DoughnutChart />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">Direct</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-secondary-500 mr-2"></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">Social</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-success-500 mr-2"></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">Organic</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-warning-500 mr-2"></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">Referral</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Sales Analytics</h2>
              <select className="input text-xs py-1 px-2">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>
            <BarChart />
          </div>
        </div>
        
        <div>
          <div className="card p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
              <button className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                View All
              </button>
            </div>
            <RecentActivities />
          </div>
        </div>
      </div>
    </div>
  );
}