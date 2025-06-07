import React, { useState } from 'react';
import * as Icons from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const initialResources = [
  {
    id: 'r1',
    title: 'Boosting Your Coffee Shop Sales',
    category: 'Marketing',
    description: 'Learn strategies to attract more customers to your coffee shop.',
    date: '2025-05-15',
    views: 120,
    likes: 45,
  },
  {
    id: 'r2',
    title: 'Inventory Management for Bookstores',
    category: 'Operations',
    description: 'Tips for managing stock in a retail bookstore.',
    date: '2025-05-20',
    views: 80,
    likes: 30,
  },
  {
    id: 'r3',
    title: 'Baking Perfect Pastries',
    category: 'Production',
    description: 'Techniques for creating high-quality baked goods.',
    date: '2025-05-25',
    views: 95,
    likes: 50,
  },
  {
    id: 'r4',
    title: 'Social Media for Small Businesses',
    category: 'Marketing',
    description: 'How to leverage social media for business growth.',
    date: '2025-05-30',
    views: 150,
    likes: 60,
  },
];

interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  views: number;
  likes: number;
}

export default function CommunityResources() {
  const [resources] = useState<Resource[]>(initialResources);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Analytics
  const totalResources = resources.length;
  const totalViews = resources.reduce((sum, r) => sum + r.views, 0);
  const totalLikes = resources.reduce((sum, r) => sum + r.likes, 0);

  // Categories
  const categories = [...new Set(resources.map((r) => r.category))];

  // Chart Data
  const resourceDistributionChartData = {
    labels: categories,
    datasets: [
      {
        data: categories.map((cat) => resources.filter((r) => r.category === cat).length),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        borderColor: ['#1D4ED8', '#059669', '#D97706'],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Resource Distribution by Category' },
    },
  };

  // Filter resources
  const filteredResources = resources.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory ? r.category === selectedCategory : true)
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Community Resources</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex items-center relative w-full md:w-1/3">
          <Icons.FaSearch size={16} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search resources..."
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Analytics */}
      <div className="card p-6 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resource Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Resources</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{totalResources}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Views</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{totalViews}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Likes</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{totalLikes}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resource Distribution</h2>
        <div className="h-80">
          <Pie data={resourceDistributionChartData} options={pieChartOptions} />
        </div>
      </div>

      {/* Resources Table */}
      <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resources</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Likes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-blue-200 dark:hover:bg-blue-900/50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{resource.title}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{resource.category}</td>
                  <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">{resource.description}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{resource.date}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <Icons.FaEye size={14} className="inline mr-1" /> {resource.views}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <Icons.FaHeart size={14} className="inline mr-1" /> {resource.likes}
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