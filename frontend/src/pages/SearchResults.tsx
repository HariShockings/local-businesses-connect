import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as Icons from 'react-icons/fa';
import ShopNav from '../components/layout/ShopNav';
import ShopSidebar from '../components/layout/ShopSidebar';
import axios from 'axios';

interface Business {
  _id: string;
  name: string;
  description: string;
  location: string;
  services: string[];
  rating: number;
  reviewCount: number;
  images: string[];
  isOpen: boolean;
  products?: any;
  icon?: string;
  customIcon?: string;
  theme?: string;
  category: string;
}

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState<{
    categories?: string[];
    locations?: string[];
    ratings?: number[];
    isOpen?: boolean;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const businessesPerPage = 6;

  const query = searchParams.get('q')?.trim().toLowerCase() || '';

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchParams, filters, sortBy, currentPage, allBusinesses]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/businesses/get-all');

      console.log('API Response:', response.data);

      if (!response.data || typeof response.data !== 'object' || !Array.isArray(response.data.businesses)) {
        throw new Error('Invalid API response: Expected businesses array');
      }

      const fetchedBusinesses = response.data.businesses
        .filter((b: any) => b && typeof b === 'object' && b._id)
        .map((b: any) => {
          let theme = b.theme && typeof b.theme === 'string' ? b.theme : '';
          const isValidColor = theme && (theme.match(/^#[0-9A-Fa-f]{6}$/) || theme.match(/^rgb\(\d+,\s*\d+,\s*\d+\)$/) || /^[a-zA-Z]+$/.test(theme));
          if (!isValidColor) theme = '';

          return {
            _id: b._id || `temp-id-${Math.random()}`,
            name: b.name && typeof b.name === 'string' ? b.name : 'Unnamed Business',
            description: b.description && typeof b.description === 'string' ? b.description : 'No description available',
            location: b.location && typeof b.location === 'string' ? b.location : 'Unknown location',
            services: Array.isArray(b.services) ? b.services.filter((s: any) => typeof s === 'string') : [],
            rating: typeof b.rating === 'number' ? Math.max(0, Math.min(5, b.rating)) : 0,
            reviewCount: typeof b.reviewCount === 'number' ? Math.max(0, b.reviewCount) : 0,
            images: Array.isArray(b.images) ? b.images.filter((img: any) => typeof img === 'string') : [],
            isOpen: typeof b.isOpen === 'boolean' ? b.isOpen : false,
            products: b.products && typeof b.products === 'object' ? b.products : {},
            icon: b.icon && typeof b.icon === 'string' && Icons[b.icon as keyof typeof Icons] ? b.icon : '',
            customIcon: b.customIcon && typeof b.customIcon === 'string' ? b.customIcon : '',
            theme,
            category: b.category && typeof b.category === 'string' ? b.category : 'General',
          };
        });

      setAllBusinesses(fetchedBusinesses);
    } catch (error: any) {
      console.error('Error fetching businesses:', error.message || error);
      setError(`Failed to load businesses: ${error.message || 'Unknown error'}. Please try again later.`);
      setAllBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filteredBusinesses = [...allBusinesses];

    // Apply query filter
    if (query) {
      filteredBusinesses = filteredBusinesses.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.services.some((s: string) => s.toLowerCase().includes(query)) ||
          b.location.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query)
      );
    }

    // Apply sidebar filters
    if (filters.categories && filters.categories.length > 0) {
      filteredBusinesses = filteredBusinesses.filter((b) =>
        filters.categories!.includes(b.category)
      );
    }

    if (filters.locations && filters.locations.length > 0) {
      filteredBusinesses = filteredBusinesses.filter((b) =>
        filters.locations!.includes(b.location)
      );
    }

    if (filters.ratings && filters.ratings.length > 0) {
      filteredBusinesses = filteredBusinesses.filter((b) =>
        filters.ratings!.some((rating) => Math.floor(b.rating) >= rating)
      );
    }

    if (filters.isOpen !== undefined) {
      filteredBusinesses = filteredBusinesses.filter((b) => b.isOpen === filters.isOpen);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filteredBusinesses.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filteredBusinesses.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'name':
        filteredBusinesses.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'location':
        filteredBusinesses.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
        break;
      default:
        filteredBusinesses.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    }

    const totalFiltered = filteredBusinesses.length;
    const startIndex = (currentPage - 1) * businessesPerPage;
    const paginatedBusinesses = filteredBusinesses.slice(startIndex, startIndex + businessesPerPage);

    setBusinesses(paginatedBusinesses);
    setTotalPages(Math.ceil(totalFiltered / businessesPerPage));
  };

  const handleFiltersChange = (newFilters: {
    categories?: string[];
    locations?: string[];
    ratings?: number[];
    isOpen?: boolean;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const renderBusinessCard = (business: Business, index: number) => {
    const services = business.services || [];
    const imageUrl = business.images.length > 0 ? business.images[0] : '';
    const IconComponent = business.icon && Icons[business.icon as keyof typeof Icons];
    const CustomIconComponent = business.customIcon && Icons[business.customIcon as keyof typeof Icons];
    const FallbackIcon = Icons['FaStore'];
    const backgroundStyle = imageUrl ? { backgroundImage: `url(${imageUrl})` } : { backgroundColor: business.theme || undefined };

    const SelectedIcon = IconComponent || CustomIconComponent || FallbackIcon;

    if (viewMode === 'list') {
      return (
        <Link
          key={business._id}
          to={`/business/${business._id}`}
          className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div
                className="w-24 h-24 rounded-lg flex-shrink-0 bg-cover bg-center flex items-center justify-center bg-gray-200 dark:bg-gray-700"
                style={backgroundStyle}
              >
                {imageUrl ? (
                  <div className="w-full h-full bg-cover bg-center" style={backgroundStyle}></div>
                ) : (
                  <SelectedIcon className="text-gray-500 dark:text-gray-300 text-3xl" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                      {business.name}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-300">
                      <Icons.FaMapMarkerAlt className="h-4 w-4 mr-1" />
                      {business.location}
                      <span
                        className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${
                          business.isOpen
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                        }`}
                      >
                        {business.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icons.FaStar className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-900 dark:text-white">{business.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">({business.reviewCount})</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{business.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium"
                  >
                    {business.category}
                  </span>
                  {services.slice(0, 2).map((service, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium"
                    >
                      {service}
                    </span>
                  ))}
                  {services.length > 2 && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
                      +{services.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      );
    }

    return (
      <Link
        key={business._id}
        to={`/business/${business._id}`}
        className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
      >
        <div
          className="h-48 rounded-t-xl bg-cover bg-center flex items-center justify-center bg-gray-200 dark:bg-gray-700"
          style={backgroundStyle}
        >
          {imageUrl ? (
            <div className="w-full h-full bg-cover bg-center" style={backgroundStyle}></div>
          ) : (
            <SelectedIcon className="text-gray-500 dark:text-gray-300 text-4xl" />
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {business.name}
            </h3>
            <div className="flex items-center space-x-1">
              <Icons.FaStar className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{business.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
            <Icons.FaMapMarkerAlt className="h-4 w-4 mr-1" />
            <span className="text-sm">{business.location}</span>
            <span
              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                business.isOpen
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
              }`}
            >
              {business.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm">{business.description}</p>
          <div className="flex flex-wrap gap-2">
            <span
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium"
            >
              {business.category}
            </span>
            {services.slice(0, 1).map((service, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium"
              >
                {service}
              </span>
            ))}
            {services.length > 1 && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
                +{services.length - 1}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ShopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <ShopSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onFiltersChange={handleFiltersChange}
            activeFilters={filters}
          />
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {query ? `Search results for "${query}"` : 'All Businesses'}
                  </h1>
                  {error && (
                    <div className="text-red-500 dark:text-red-400 mt-1">{error}</div>
                  )}
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {loading ? 'Loading...' : `${businesses.length} businesses displayed (Total: ${allBusinesses.length})`}
                  </p>
                </div>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Icons.FaSlidersH className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  <span className="text-gray-700 dark:text-gray-300">Filters</span>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors duration-200 ${
                        viewMode === 'grid'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icons.FaTh className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors duration-200 ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icons.FaList className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-700 dark:text-gray-300"
                  >
                    <option value="relevance">Sort by Relevance</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="location">Location</option>
                  </select>
                  <Icons.FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300 pointer-events-none" />
                </div>
              </div>
            </div>
            {loading ? (
              <div
                className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-t-xl"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Icons.FaSearch className="h-12 w-12 text-gray-400 dark:text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading businesses</h3>
                <p className="text-gray-600 dark:text-gray-300">{error}</p>
                <button
                  onClick={fetchBusinesses}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-12">
                <Icons.FaSearch className="h-12 w-12 text-gray-400 dark:text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No businesses found</h3>
                <p className="text-gray-600 dark:text-gray-300">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
                >
                  {businesses.map((business, index) => renderBusinessCard(business, index))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;