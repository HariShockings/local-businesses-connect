import { useState } from 'react';
import { Calendar, Filter, Download } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Analytics() {
  const [dateRange, setDateRange] = useState('last-30-days');
  const [selectedBusiness, setSelectedBusiness] = useState('all');

  // Sample data for business analytics
  const businessData = {
    'all': {
      pageViews: 54321,
      uniqueVisitors: 21432,
      queries: 1250,
      sales: 320,
      revenue: 24500,
      bounceRate: '32.4%',
      avgSessionDuration: '3m 24s',
    },
    'coffee-shop': {
      pageViews: 18320,
      uniqueVisitors: 7543,
      queries: 420,
      sales: 150,
      revenue: 9800,
      bounceRate: '28.1%',
      avgSessionDuration: '2m 45s',
    },
    'bookstore': {
      pageViews: 12450,
      uniqueVisitors: 5123,
      queries: 310,
      sales: 95,
      revenue: 6700,
      bounceRate: '35.2%',
      avgSessionDuration: '3m 10s',
    },
    'bakery': {
      pageViews: 9870,
      uniqueVisitors: 3987,
      queries: 260,
      sales: 80,
      revenue: 5400,
      bounceRate: '30.5%',
      avgSessionDuration: '2m 50s',
    },
  };

  // Chart data for page views and revenue
  const pageViewsChartData = {
    labels: ['Coffee Shop', 'Bookstore', 'Bakery'],
    datasets: [
      {
        label: 'Page Views',
        data: [18320, 12450, 9870],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const revenueChartData = {
    labels: ['Coffee Shop', 'Bookstore', 'Bakery'],
    datasets: [
      {
        data: [9800, 6700, 5400],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        borderColor: ['#1D4ED8', '#059669', '#D97706'],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Business Page Views by Profile' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Revenue Distribution by Business' },
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Business Analytics</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center relative">
            <div className="absolute left-3 text-gray-400">
              <Calendar size={16} />
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Businesses</option>
            <option value="coffee-shop">Coffee Shop</option>
            <option value="bookstore">Bookstore</option>
            <option value="bakery">Bakery</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter size={16} className="mr-2" />
            <span>Filters</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download size={16} className="mr-2" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="card p-6 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Page Views', value: businessData[selectedBusiness].pageViews, trend: '↑ 12.3%' },
            { label: 'Unique Visitors', value: businessData[selectedBusiness].uniqueVisitors, trend: '↑ 8.5%' },
            { label: 'Customer Queries', value: businessData[selectedBusiness].queries, trend: '↑ 15.2%' },
            { label: 'Sales', value: businessData[selectedBusiness].sales, trend: '↑ 10.1%' },
            { label: 'Revenue', value: `$${businessData[selectedBusiness].revenue.toLocaleString()}`, trend: '↑ 14.7%' },
            { label: 'Bounce Rate', value: businessData[selectedBusiness].bounceRate, trend: '↓ 2.1%', isNegative: true },
            { label: 'Avg. Session Duration', value: businessData[selectedBusiness].avgSessionDuration, trend: '↑ 5.3%' },
          ].map((metric, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</span>
              <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{metric.value}</span>
              <span className={`text-xs mt-1 ${metric.isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {metric.trend} vs prev period
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Page Views by Business Profile</h2>
          <div className="h-80">
            <Bar data={pageViewsChartData} options={barChartOptions} />
          </div>
        </div>

        <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Distribution</h2>
          <div className="h-80">
            <Pie data={revenueChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      <div className="card p-6 mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Services & Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Top Service/Product</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sales</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { business: 'Coffee Shop', item: 'Latte', views: '5,432', sales: '120', revenue: '$2,880' },
                { business: 'Bookstore', item: 'Bestsellers', views: '3,210', sales: '45', revenue: '$1,350' },
                { business: 'Bakery', item: 'Croissants', views: '2,876', sales: '60', revenue: '$1,200' },
                { business: 'Coffee Shop', item: 'Espresso', views: '4,123', sales: '90', revenue: '$2,160' },
                { business: 'Bookstore', item: 'E-Books', views: '2,456', sales: '30', revenue: '$900' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.business}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.item}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.views}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.sales}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6 mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Customer Engagement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Query Sources</h3>
            {[
              { label: 'Direct Search', value: 45 },
              { label: 'Social Media', value: 25 },
              { label: 'Referrals', value: 15 },
              { label: 'Email Campaigns', value: 10 },
              { label: 'Other', value: 5 },
            ].map((item, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Locations</h3>
            {[
              { label: 'Local City', value: 60 },
              { label: 'Nearby Cities', value: 25 },
              { label: 'Statewide', value: 10 },
              { label: 'Other States', value: 5 },
            ].map((item, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}