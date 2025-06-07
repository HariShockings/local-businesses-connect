import React, { useState, useEffect } from 'react';
import * as Icons from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/businesses',
  withCredentials: true,
});

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  rating: number;
  sales: { quantity: number; revenue: number };
}

interface Business {
  id: string;
  name: string;
  services: string[];
  products: { [service: string]: Product[] };
  contact: { phone: string; email: string };
  location: string;
  pageName: string;
  theme: string;
  description: string;
  website: string;
  icon: string;
  customIcon: string | null;
}

export default function ServiceOfferings() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    price: 0,
    description: '',
    images: [] as string[],
    service: '',
  });
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); // New state for upload status

  // Fetch businesses on mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/');
        setBusinesses(
          response.data.map((b: any) => ({
            ...b,
            id: b._id,
            products: b.products ? Object.fromEntries(Object.entries(b.products)) : {},
          }))
        );
        if (response.data.length > 0) {
          setSelectedBusinessId(response.data[0]._id);
        }
      } catch (err) {
        console.error('Fetch businesses error:', err);
        toast.error('Failed to load businesses');
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  // Analytics Calculations
  const totalServices = [...new Set(businesses.flatMap((b) => b.services))].length;
  const totalProducts = businesses.reduce(
    (sum, b) => sum + Object.values(b.products).reduce((s, p) => s + p.length, 0),
    0
  );
  const totalRevenue = businesses
    .reduce(
      (sum, b) =>
        sum +
        Object.values(b.products).reduce((s, p) => s + p.reduce((r, pr) => r + pr.sales.revenue, 0), 0),
      0
    )
    .toFixed(2);

  // Trending Services (top 3 by average rating)
  const serviceRatings = businesses
    .flatMap((b) =>
      b.services.map((service) => {
        const products = b.products[service] || [];
        const avgRating = products.length
          ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
          : 0;
        return { service, avgRating, business: b.name };
      })
    )
    .filter((s) => s.avgRating > 0)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 3);

  // Highest Sales Products (top 5 by revenue)
  const topProducts = businesses
    .flatMap((b) =>
      Object.entries(b.products).flatMap(([service, products]) =>
        products.map((p) => ({ ...p, service, business: b.name }))
      )
    )
    .sort((a, b) => b.sales.revenue - a.sales.revenue)
    .slice(0, 5);

  // Chart Data
  const revenueChartData = {
    labels: businesses.map((b) => b.name),
    datasets: [
      {
        label: 'Revenue',
        data: businesses.map((b) =>
          Object.values(b.products)
            .flat()
            .reduce((sum, p) => sum + p.sales.revenue, 0)
        ),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Revenue by Business' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // Handle business selection
  useEffect(() => {
    if (selectedBusinessId) {
      const business = businesses.find((b) => b.id === selectedBusinessId);
      if (business) {
        setServiceInput('');
        setProductForm({
          id: '',
          name: '',
          price: 0,
          description: '',
          images: [],
          service: business.services[0] || '',
        });
      }
    }
  }, [selectedBusinessId, businesses]);

  // Handle service input
  const handleServiceInput = async (
    e: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>
  ) => {
    const value = (e as React.ChangeEvent<HTMLInputElement>).target?.value || serviceInput;

    if ('key' in e && (e.key === 'Enter' || e.key === ' ' || e.key === ',')) {
      e.preventDefault();
      const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
      if (selectedBusiness && selectedBusiness.services.length >= 5) {
        toast.error('Maximum 5 services allowed');
        setServiceInput('');
        return;
      }
      const newServices = value
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter((s) => s);
      if (newServices.length > 0) {
        try {
          const availableSlots = 5 - (selectedBusiness?.services.length || 0);
          const servicesToAdd = newServices.slice(0, availableSlots);
          const updatedServices = [...selectedBusiness.services, ...servicesToAdd];
          const response = await axiosInstance.put(`/${selectedBusinessId}`, {
            ...selectedBusiness,
            services: updatedServices,
            products: {
              ...selectedBusiness.products,
              ...servicesToAdd.reduce((acc, s) => ({ ...acc, [s]: [] }), {}),
            },
          });
          setBusinesses((prev) =>
            prev.map((b) =>
              b.id === selectedBusinessId ? { ...response.data, id: response.data._id } : b
            )
          );
          toast.success('Services added successfully');
          setServiceInput('');
        } catch (err) {
          console.error('Add services error:', err);
          toast.error('Failed to add services');
        }
      }
      return;
    }

    setServiceInput(value);
  };

  // Handle service paste
  const handleServicePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
    if (selectedBusiness && selectedBusiness.services.length >= 5) {
      toast.error('Maximum 5 services allowed');
      setServiceInput('');
      return;
    }
    const newServices = pastedText
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s);
    const availableSlots = 5 - (selectedBusiness?.services.length || 0);
    const servicesToAdd = newServices.slice(0, availableSlots);
    try {
      const updatedServices = [...selectedBusiness.services, ...servicesToAdd];
      const response = await axiosInstance.put(`/${selectedBusinessId}`, {
        ...selectedBusiness,
        services: updatedServices,
        products: {
          ...selectedBusiness.products,
          ...servicesToAdd.reduce((acc, s) => ({ ...acc, [s]: [] }), {}),
        },
      });
      setBusinesses((prev) =>
        prev.map((b) => (b.id === selectedBusinessId ? { ...response.data, id: response.data._id } : b))
      );
      toast.success('Services added successfully');
      setServiceInput('');
    } catch (err) {
      console.error('Paste services error:', err);
      toast.error('Failed to add services');
    }
  };

  // Handle removing a service
  const handleRemoveService = async (service: string) => {
    const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
    if (!selectedBusiness) return;

    try {
      const updatedServices = selectedBusiness.services.filter((s) => s !== service);
      const response = await axiosInstance.put(`/${selectedBusinessId}`, {
        ...selectedBusiness,
        services: updatedServices,
      });
      setBusinesses((prev) =>
        prev.map((b) => (b.id === selectedBusinessId ? { ...response.data, id: response.data._id } : b))
      );
      if (expandedService === service) setExpandedService(null);
      toast.success('Service removed successfully');
    } catch (err) {
      console.error('Remove service error:', err);
      toast.error('Failed to remove service');
    }
  };

  // Handle product input changes
  const handleProductInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/png') {
      setIsUploading(true); // Set uploading state to true
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await axiosInstance.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProductForm((prev) => ({ ...prev, images: [...prev.images, response.data.url] }));
        toast.success('Image uploaded successfully');
      } catch (err) {
        console.error('Image upload error:', err);
        toast.error('Failed to upload image');
      } finally {
        setIsUploading(false); // Reset uploading state
      }
    } else {
      toast.error('Please upload a PNG file');
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Handle product submission
  const handleProductSubmit = async () => {
    if (!productForm.service) {
      toast.error('Please select a service');
      return;
    }
    if (!productForm.name || productForm.price <= 0) {
      toast.error('Product name and valid price are required');
      return;
    }

    const product = {
      id: isEditingProduct ? productForm.id : `p${Date.now()}`,
      name: productForm.name,
      price: productForm.price,
      description: productForm.description,
      images: productForm.images,
    };

    console.log('Submitting product:', { service: productForm.service, product });

    try {
      let response;
      if (isEditingProduct) {
        response = await axiosInstance.put(`/${selectedBusinessId}/products/${product.id}`, {
          service: productForm.service,
          product,
        });
        toast.success('Product updated successfully');
      } else {
        response = await axiosInstance.post(`/${selectedBusinessId}/products`, {
          service: productForm.service,
          product,
        });
        toast.success('Product added successfully');
      }
      setBusinesses((prev) =>
        prev.map((b) => (b.id === selectedBusinessId ? { ...response.data, id: response.data._id } : b))
      );
      setProductForm({
        id: '',
        name: '',
        price: 0,
        description: '',
        images: [],
        service: productForm.service,
      });
      setIsEditingProduct(false);
    } catch (err) {
      console.error('Product submit error:', err);
      toast.error(isEditingProduct ? 'Failed to update product' : 'Failed to add product');
    }
  };

  // Handle editing a product
  const handleEditProduct = (product: Product, service: string) => {
    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      images: product.images,
      service,
    });
    setIsEditingProduct(true);
  };

  // Handle deleting a product
  const handleDeleteProduct = async (productId: string, service: string) => {
    try {
      const response = await axiosInstance.delete(`/${selectedBusinessId}/products/${productId}`, {
        data: { service },
      });
      setBusinesses((prev) =>
        prev.map((b) => (b.id === selectedBusinessId ? { ...response.data, id: response.data._id } : b))
      );
      toast.success('Product deleted successfully');
    } catch (err) {
      console.error('Delete product error:', err);
      toast.error('Failed to delete product');
    }
  };

  // Toggle service expansion
  const toggleService = (service: string) => {
    setExpandedService(expandedService === service ? null : service);
    setProductForm((prev) => ({ ...prev, service }));
  };

  // Get selected business
  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Service Offerings</h1>

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
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedBusinessId ? (
        <>
          {/* Overview Analytics */}
          <div className="card p-6 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Overview Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Services</span>
                <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
                  {totalServices}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Products</span>
                <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
                  {totalProducts}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</span>
                <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
                  ${totalRevenue}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue by Business</h2>
              <div className="h-80">
                <Bar data={revenueChartData} options={barChartOptions} />
              </div>
            </div>
            <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Top Selling Products
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {topProducts.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.business}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.service}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.name}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          ${item.sales.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Trending Services</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Avg Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {serviceRatings.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.business}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.service}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.avgRating.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        selectedBusiness && (
          <>
            {/* Services Management */}
            <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Manage Services</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Services (max 5)
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={handleServiceInput}
                    onKeyDown={handleServiceInput}
                    onPaste={handleServicePaste}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter services (separate by space, comma, or enter)"
                    disabled={selectedBusiness.services.length >= 5}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedBusiness.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => handleRemoveService(service)}
                        className="ml-2 text-red-600 dark:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Management */}
            <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Manage Products</h2>
              {selectedBusiness.services.map((service) => (
                <div key={service} className="mb-4">
                  <button
                    type="button"
                    onClick={() => toggleService(service)}
                    className="flex items-center w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    <Icons.FaChevronDown
                      size={16}
                      className={`mr-2 transform ${expandedService === service ? 'rotate-180' : ''}`}
                    />
                    {service} ({(selectedBusiness.products[service] || []).length} products)
                  </button>
                  {expandedService === service && (
                    <div className="pl-6">
                      {/* Product Form */}
                      <div className="mb-4">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                          {isEditingProduct ? 'Edit Product' : 'Add Product'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Product Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={productForm.name}
                              onChange={handleProductInputChange}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter product name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Price
                            </label>
                            <input
                              type="number"
                              name="price"
                              value={productForm.price}
                              onChange={handleProductInputChange}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter price"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Description
                            </label>
                            <textarea
                              name="description"
                              value={productForm.description}
                              onChange={handleProductInputChange}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter product description"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Image (PNG)
                            </label>
                            <input
                              type="file"
                              accept="image/png"
                              onChange={handleImageUpload}
                              className="w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                              disabled={isUploading} // Disable input during upload
                            />
                            <div className="mt-2 flex flex-wrap gap-2">
                              {productForm.images.map((img, index) => (
                                <div key={index} className="relative">
                                  <img src={img} alt="Product" className="w-16 h-16 object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-0 right-0 text-red-600 dark:text-red-400 text-xs"
                                    disabled={isUploading} // Disable remove button during upload
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            {isUploading && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Uploading image, please wait...
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex gap-4">
                          <button
                            type="button"
                            onClick={handleProductSubmit}
                            className={`px-4 py-2 rounded-lg text-white ${
                              isUploading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            disabled={isUploading} // Disable submit button during upload
                          >
                            {isEditingProduct ? 'Update Product' : 'Add Product'}
                          </button>
                          {isEditingProduct && (
                            <button
                              type="button"
                              onClick={() => {
                                setProductForm({
                                  id: '',
                                  name: '',
                                  price: 0,
                                  description: '',
                                  images: [],
                                  service: productForm.service,
                                });
                                setIsEditingProduct(false);
                              }}
                              className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 ${
                                isUploading
                                  ? 'cursor-not-allowed'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                              disabled={isUploading} // Disable cancel button during upload
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Products Table */}
                      {(selectedBusiness.products[service] || []).length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                              <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Image
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {(selectedBusiness.products[service] || []).map((product) => (
                                <tr
                                  key={product.id}
                                  className="transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer"
                                >
                                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {product.images.length > 0 ? (
                                      <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-10 h-10 object-cover"
                                      />
                                    ) : (
                                      'No image'
                                    )}
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {product.name}
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    ${product.price.toFixed(2)}
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <button
                                      type="button"
                                      onClick={() => handleEditProduct(product, service)}
                                      className="text-blue-600 dark:text-blue-400 hover:underline mr-2"
                                      disabled={isUploading} // Disable edit button during upload
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProduct(product.id, service)}
                                      className="text-red-600 dark:text-red-400 hover:underline"
                                      disabled={isUploading} // Disable delete button during upload
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
}