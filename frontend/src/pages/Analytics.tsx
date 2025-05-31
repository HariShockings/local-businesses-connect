import { useState } from 'react';
import { Calendar, Filter, Download } from 'lucide-react';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('last-30-days');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center relative">
            <div className="absolute left-3 text-gray-400">
              <Calendar size={16} />
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last-7-days">Last 7 days</option>
              <option value="last-30-days">Last 30 days</option>
              <option value="this-month">This month</option>
              <option value="last-month">Last month</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          <button className="btn btn-outline flex items-center justify-center">
            <Filter size={16} className="mr-2" />
            <span>Filters</span>
          </button>
          <button className="btn btn-outline flex items-center justify-center">
            <Download size={16} className="mr-2" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Page Views', 'Unique Visitors', 'Bounce Rate', 'Avg. Session Duration'].map((metric, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">{metric}</span>
              <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
                {i === 0 ? '54,321' : i === 1 ? '21,432' : i === 2 ? '32.4%' : '3m 24s'}
              </span>
              <span className={`text-xs mt-1 ${i === 2 ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400'}`}>
                {i === 2 ? '↑ 2.1% vs prev period' : '↑ 12.3% vs prev period'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Pages</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Page</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unique</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bounce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  { page: '/home', views: '12,543', unique: '8,124', bounce: '23%' },
                  { page: '/products', views: '8,432', unique: '5,423', bounce: '34%' },
                  { page: '/pricing', views: '6,321', unique: '4,321', bounce: '28%' },
                  { page: '/blog', views: '5,432', unique: '3,456', bounce: '42%' },
                  { page: '/about', views: '3,654', unique: '2,345', bounce: '31%' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.page}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.views}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.unique}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.bounce}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Demographics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age Groups</h3>
              {[
                { label: '18-24', value: 15 },
                { label: '25-34', value: 32 },
                { label: '35-44', value: 28 },
                { label: '45-54', value: 18 },
                { label: '55+', value: 7 },
              ].map((item, i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full"
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Locations</h3>
              {[
                { label: 'United States', value: 42 },
                { label: 'United Kingdom', value: 18 },
                { label: 'Germany', value: 12 },
                { label: 'France', value: 8 },
                { label: 'Other', value: 20 },
              ].map((item, i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-secondary-600 dark:bg-secondary-500 h-2 rounded-full"
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}