import React, { useState } from 'react';
import * as Icons from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const initialBusinesses = [
  {
    id: '1',
    name: 'Coffee Shop',
    services: ['Coffee', 'Pastries', 'Breakfast'],
    products: {
      Coffee: [
        { id: 'p1', name: 'Espresso', price: 3.99, rating: 4.5, sales: { quantity: 100, revenue: 399 }, date: '2025-06-01' },
        { id: 'p2', name: 'Latte', price: 4.99, rating: 4.0, sales: { quantity: 80, revenue: 399.2 }, date: '2025-06-02' },
      ],
      Pastries: [
        { id: 'p3', name: 'Croissant', price: 2.99, rating: 4.8, sales: { quantity: 120, revenue: 358.8 }, date: '2025-06-03' },
      ],
      Breakfast: [],
    },
  },
  {
    id: '2',
    name: 'Bookstore',
    services: ['Books', 'E-Books', 'Reading Events'],
    products: {
      Books: [
        { id: 'p4', name: 'Mystery Novel', price: 15.99, rating: 4.2, sales: { quantity: 50, revenue: 799.5 }, date: '2025-06-03' },
      ],
      'E-Books': [],
      'Reading Events': [],
    },
  },
  {
    id: '3',
    name: 'Bakery',
    services: ['Cakes', 'Croissants', 'Cookies'],
    products: {
      Cakes: [
        { id: 'p5', name: 'Chocolate Cake', price: 25.99, rating: 4.9, sales: { quantity: 30, revenue: 779.7 }, date: '2025-06-04' },
      ],
      Croissants: [],
      Cookies: [],
    },
  },
];

const initialInteractions = [
  { id: 'i1', businessId: '1', customerName: 'Alice Smith', message: 'Can you provide decaf options for espresso?', date: '2025-06-01', status: 'Open' },
  { id: 'i2', businessId: '1', customerName: 'Bob Johnson', message: 'Loved the croissant! Any gluten-free pastries?', date: '2025-06-02', status: 'Resolved' },
  { id: 'i3', businessId: '2', customerName: 'Carol White', message: 'Do you have sci-fi novels in stock?', date: '2025-06-03', status: 'Open' },
  { id: 'i4', businessId: '3', customerName: 'Dave Brown', message: 'Can you make custom birthday cakes?', date: '2025-06-04', status: 'Open' },
];

const initialVisitors = [
  { id: 'v1', businessId: '1', count: 150, date: '2025-06-01' },
  { id: 'v2', businessId: '1', count: 120, date: '2025-06-02' },
  { id: 'v3', businessId: '2', count: 80, date: '2025-06-03' },
  { id: 'v4', businessId: '3', count: 100, date: '2025-06-04' },
];

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  sales: { quantity: number; revenue: number };
  date: string;
}

interface Interaction {
  id: string;
  businessId: string;
  customerName: string;
  message: string;
  date: string;
  status: 'Open' | 'Resolved';
}

interface Visitor {
  id: string;
  businessId: string;
  count: number;
  date: string;
}

export default function Reports() {
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [reportType, setReportType] = useState('sales');

  // Date filtering logic
  const getDateFilter = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date('2025-06-05');
    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    switch (dateRange) {
      case 'today': return diffDays === 0;
      case 'last-7-days': return diffDays <= 7;
      case 'last-30-days': return diffDays <= 30;
      case 'this-month': return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      default: return true;
    }
  };

  // Analytics
  const filteredProducts = initialBusinesses
    .filter((b) => !selectedBusinessId || b.id === selectedBusinessId)
    .flatMap((b) => Object.values(b.products).flat())
    .filter((p) => getDateFilter(p.date));

  const filteredInteractions = initialInteractions
    .filter((i) => (!selectedBusinessId || i.businessId === selectedBusinessId) && getDateFilter(i.date));

  const filteredVisitors = initialVisitors
    .filter((v) => (!selectedBusinessId || v.businessId === selectedBusinessId) && getDateFilter(v.date));

  const totalServices = [...new Set(
    initialBusinesses
      .filter((b) => !selectedBusinessId || b.id === selectedBusinessId)
      .flatMap((b) => b.services)
  )].length;

  const totalProducts = filteredProducts.length;
  const totalRevenue = filteredProducts.reduce((sum, p) => sum + p.sales.revenue, 0).toFixed(2);
  const totalProductsSold = filteredProducts.reduce((sum, p) => sum + p.sales.quantity, 0);
  const totalInteractions = filteredInteractions.length;
  const totalVisitors = filteredVisitors.reduce((sum, v) => sum + v.count, 0);
  const avgProductRating = totalProducts > 0 ? (filteredProducts.reduce((sum, p) => sum + p.rating, 0) / totalProducts).toFixed(1) : '0.0';

  // Chart Data
  const barChartData = {
    labels: initialBusinesses
      .filter((b) => !selectedBusinessId || b.id === selectedBusinessId)
      .map((b) => b.name),
    datasets: [
      {
        label: reportType === 'sales' ? 'Revenue' : reportType === 'interactions' ? 'Interactions' : reportType === 'visitors' ? 'Visitors' : reportType === 'products' ? 'Products' : 'Services',
        data: initialBusinesses
          .filter((b) => !selectedBusinessId || b.id === selectedBusinessId)
          .map((b) => {
            if (reportType === 'sales') {
              return Object.values(b.products)
                .flat()
                .filter((p) => getDateFilter(p.date))
                .reduce((sum, p) => sum + p.sales.revenue, 0);
            } else if (reportType === 'interactions') {
              return filteredInteractions.filter((i) => i.businessId === b.id).length;
            } else if (reportType === 'visitors') {
              return filteredVisitors.filter((v) => v.businessId === b.id).reduce((sum, v) => sum + v.count, 0);
            } else if (reportType === 'products') {
              return Object.values(b.products)
                .flat()
                .filter((p) => getDateFilter(p.date))
                .length;
            } else {
              return b.services.length;
            }
          }),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: reportType === 'sales' ? 'Sales Revenue by Business' :
              reportType === 'interactions' ? 'Interactions by Business' :
              reportType === 'visitors' ? 'Visitors by Business' :
              reportType === 'products' ? 'Products by Business' : 'Services by Business',
      },
    },
    scales: { y: { beginAtZero: true } },
  };

  const pieChartData = {
    labels: reportType === 'services' ? [...new Set(initialBusinesses.flatMap((b) => b.services))] :
             reportType === 'products' ? [...new Set(filteredProducts.map((p) => p.name))] :
             reportType === 'interactions' ? ['Open', 'Resolved'] :
             reportType === 'visitors' ? initialBusinesses.map((b) => b.name) : [],
    datasets: [
      {
        data: reportType === 'services' ? [...new Set(initialBusinesses.flatMap((b) => b.services))]
                .map((s) => initialBusinesses.filter((b) => b.services.includes(s)).length) :
              reportType === 'products' ? [...new Set(filteredProducts.map((p) => p.name))]
                .map((name) => filteredProducts.filter((p) => p.name === name).length) :
              reportType === 'interactions' ? [
                filteredInteractions.filter((i) => i.status === 'Open').length,
                filteredInteractions.filter((i) => i.status === 'Resolved').length
              ] :
              reportType === 'visitors' ? initialBusinesses
                .map((b) => filteredVisitors.filter((v) => v.businessId === b.id).reduce((sum, v) => sum + v.count, 0)) : [],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#1D4ED8', '#059669', '#D97706', '#B91C1C'],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: reportType === 'services' ? 'Service Distribution' :
              reportType === 'products' ? 'Product Distribution' :
              reportType === 'interactions' ? 'Interaction Status' : 'Visitor Distribution',
      },
    },
  };

  // Export
  const handleExport = () => {
    const exportData = {
      business: selectedBusinessId ? initialBusinesses.find((b) => b.id === selectedBusinessId)?.name : 'All',
      dateRange,
      reportType,
      data: reportType === 'sales' ? filteredProducts.map((p) => ({
        business: initialBusinesses.find((b) => b.id === selectedBusinessId)?.name || 'All',
        product: p.name,
        quantity: p.sales.quantity,
        revenue: p.sales.revenue,
        date: p.date,
      })) : reportType === 'interactions' ? filteredInteractions : reportType === 'visitors' ? filteredVisitors :
        reportType === 'products' ? filteredProducts : initialBusinesses
          .filter((b) => !selectedBusinessId || b.id === selectedBusinessId)
          .flatMap((b) => b.services.map((s) => ({ business: b.name, service: s }))),
    };
    console.log('Exporting report:', exportData);
    alert('Report exported to console (simulated).');
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Reports</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Business
          </label>
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Businesses</option>
            {initialBusinesses.map((business) => (
              <option key={business.id} value={business.id}>{business.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <div className="flex items-center relative">
            <Icons.FaCalendar size={16} className="absolute left-3 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full md:w-40 pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="last-7-days">Last 7 days</option>
              <option value="last-30-days">Last 30 days</option>
              <option value="this-month">This month</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full md:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sales">Sales</option>
            <option value="interactions">Interactions</option>
            <option value="services">Services</option>
            <option value="products">Products</option>
            <option value="visitors">Visitors</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm flex items-center hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Icons.FaDownload size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="card p-6 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Report Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Services</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{totalServices}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Products</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{totalProducts}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">${totalRevenue}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Products Sold</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{totalProductsSold}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Interactions</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{totalInteractions}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Visitors</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{totalVisitors}</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{barChartOptions.plugins.title.text}</h2>
          <div className="h-80">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        {reportType !== 'sales' && (
          <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{pieChartOptions.plugins.title.text}</h2>
            <div className="h-80">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Report Table */}
      <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detailed Report</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business</th>
                {reportType === 'sales' ? (
                  <>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  </>
                ) : reportType === 'interactions' ? (
                  <>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  </>
                ) : reportType === 'services' ? (
                  <>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Count</th>
                  </>
                ) : reportType === 'products' ? (
                  <>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visitor Count</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reportType === 'sales' ? filteredProducts.map((product, i) => (
                <tr key={i} className="hover:bg-blue-200 dark:hover:bg-blue-900/50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {initialBusinesses.find((b) => b.id === selectedBusinessId)?.name || 'All'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.name}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.sales.quantity}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${product.sales.revenue.toFixed(2)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.date}</td>
                </tr>
              )) : reportType === 'interactions' ? filteredInteractions.map((interaction) => (
                <tr key={interaction.id} className="hover:bg-blue-200 dark:hover:bg-blue-900/50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {initialBusinesses.find((b) => b.id === interaction.businessId)?.name}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{interaction.customerName}</td>
                  <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">{interaction.message}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{interaction.status}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{interaction.date}</td>
                </tr>
              )) : reportType === 'services' ? initialBusinesses
                .filter((b) => !selectedBusinessId || b.id === selectedBusinessId)
                .flatMap((b) => b.services.map((service) => ({ business: b, service })))
                .map(({ business, service }, i) => (
                  <tr key={i} className="hover:bg-blue-200 dark:hover:bg-blue-900/50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{business.name}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{service}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(business.products[service] || []).length}
                    </td>
                  </tr>
                )) : reportType === 'products' ? filteredProducts.map((product, i) => (
                  <tr key={i} className="hover:bg-blue-200 dark:hover:bg-blue-900/50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {initialBusinesses.find((b) => b.id === selectedBusinessId)?.name || 'All'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.name}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${product.price.toFixed(2)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.rating}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.date}</td>
                  </tr>
                )) : filteredVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-blue-200 dark:hover:bg-blue-900/50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {initialBusinesses.find((b) => b.id === visitor.businessId)?.name}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{visitor.count}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{visitor.date}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}