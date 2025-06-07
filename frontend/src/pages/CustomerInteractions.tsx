import React, { useState, useEffect } from 'react';
import * as Icons from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const initialBusinesses = [
  { id: '1', name: 'Coffee Shop' },
  { id: '2', name: 'Bookstore' },
  { id: '3', name: 'Bakery' },
];

const initialInteractions = [
  {
    id: 'i1',
    businessId: '1',
    customerName: 'Alice Smith',
    message: 'Can you provide decaf options for espresso?',
    date: '2025-06-01',
    status: 'Open',
  },
  {
    id: 'i2',
    businessId: '1',
    customerName: 'Bob Johnson',
    message: 'Loved the croissant! Any gluten-free pastries?',
    date: '2025-06-02',
    status: 'Resolved',
  },
  {
    id: 'i3',
    businessId: '2',
    customerName: 'Carol White',
    message: 'Do you have sci-fi novels in stock?',
    date: '2025-06-03',
    status: 'Open',
  },
  {
    id: 'i4',
    businessId: '3',
    customerName: 'Dave Brown',
    message: 'Can you make custom birthday cakes?',
    date: '2025-06-04',
    status: 'Open',
  },
];

interface Interaction {
  id: string;
  businessId: string;
  customerName: string;
  message: string;
  date: string;
  status: 'Open' | 'Resolved';
}

export default function CustomerInteractions() {
  const [interactions, setInteractions] = useState<Interaction[]>(initialInteractions);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [responseInput, setResponseInput] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  // Analytics
  const totalInteractions = interactions.length;
  const openInteractions = interactions.filter((i) => i.status === 'Open').length;
  const resolvedInteractions = totalInteractions - openInteractions;
  const avgResponseTime = '24h'; // Sample data

  // Chart Data
  const interactionsChartData = {
    labels: initialBusinesses.map((b) => b.name),
    datasets: [
      {
        label: 'Interactions',
        data: initialBusinesses.map((b) => interactions.filter((i) => i.businessId === b.id).length),
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
      title: { display: true, text: 'Interactions by Business' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // Handle response submission
  const handleResponseSubmit = (interactionId: string) => {
    if (!responseInput.trim()) return;
    setInteractions((prev) =>
      prev.map((i) =>
        i.id === interactionId ? { ...i, status: 'Resolved' } : i
      )
    );
    setResponseInput('');
    setRespondingTo(null);
  };

  // Filter interactions by selected business
  const filteredInteractions = selectedBusinessId
    ? interactions.filter((i) => i.businessId === selectedBusinessId)
    : interactions;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Customer Interactions</h1>

      {/* Business Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Business
        </label>
        <select
          value={selectedBusinessId}
          onChange={(e) => setSelectedBusinessId(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Businesses</option>
          {initialBusinesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      </div>

      {/* Analytics */}
      <div className="card p-6 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Interaction Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Interactions</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{totalInteractions}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Open Interactions</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{openInteractions}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Resolved Interactions</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{resolvedInteractions}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Avg. Response Time</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{avgResponseTime}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Interactions by Business</h2>
        <div className="h-80">
          <Bar data={interactionsChartData} options={barChartOptions} />
        </div>
      </div>

      {/* Interactions Table */}
      <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Customer Interactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInteractions.map((interaction) => (
                <tr key={interaction.id} className="hover:bg-blue-200 dark:hover:bg-blue-900/50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {initialBusinesses.find((b) => b.id === interaction.businessId)?.name}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{interaction.customerName}</td>
                  <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">{interaction.message}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{interaction.date}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{interaction.status}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {interaction.status === 'Open' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setRespondingTo(interaction.id)}
                          className="text-blue-600 dark:text-blue-400 hover:underline mr-2"
                        >
                          <Icons.FaReply size={14} className="inline mr-1" />
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setInteractions((prev) => prev.map((i) => i.id === interaction.id ? { ...i, status: 'Resolved' } : i))}
                          className="text-green-600 dark:text-green-400 hover:underline"
                        >
                          <Icons.FaCheck size={14} className="inline mr-1" />
                          Resolve
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {respondingTo && (
          <div className="mt-4">
            <textarea
              value={responseInput}
              onChange={(e) => setResponseInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your response..."
              rows={3}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleResponseSubmit(respondingTo)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Response
              </button>
              <button
                type="button"
                onClick={() => { setResponseInput(''); setRespondingTo(null); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}