import React, { useState, useEffect } from 'react';
import { Filter, MapPin, Star, ChevronDown, X } from 'lucide-react';
import axios from 'axios';

interface FilterOptions {
  categories: string[];
  locations: string[];
  ratings: number[];
}

interface ShopSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: any) => void;
  activeFilters: any;
}

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

const ShopSidebar: React.FC<ShopSidebarProps> = ({
  isOpen,
  onClose,
  onFiltersChange,
  activeFilters,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    location: true,
    rating: true,
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    locations: [],
    ratings: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoading(true);
      try {
        const response = await api.get('/businesses/get-all');
        const businesses = response.data.businesses || [];

        // Extract unique categories, locations, and ratings
        const categories = [...new Set(
          businesses
            .map((b: any) => b.category)
            .filter((c: string) => c)
        )].sort();
        const locations = [...new Set(
          businesses
            .map((b: any) => b.location)
            .filter((l: string) => l)
        )].sort();
        const ratings = [...new Set(
          businesses
            .map((b: any) => Math.floor(b.rating)) // Use floor to get whole numbers
            .filter((r: number) => r > 0) // Exclude zero ratings
        )].sort((a: number, b: number) => b - a); // Sort descending (5, 4, 3, ...)

        setFilterOptions({
          categories,
          locations,
          ratings,
        });
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFilterOptions();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const handleFilterChange = (filterType: string, value: any, checked: boolean) => {
    const currentFilters = activeFilters[filterType] || [];
    let newFilters;

    if (checked) {
      newFilters = [...currentFilters, value];
    } else {
      newFilters = currentFilters.filter((item: any) => item !== value);
    }

    onFiltersChange({
      ...activeFilters,
      [filterType]: newFilters,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).flat().length;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">& up</span>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:relative lg:transform-none lg:shadow-none lg:w-64 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 lg:hidden">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
              {getActiveFilterCount() > 0 && (
                <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden lg:flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
              {getActiveFilterCount() > 0 && (
                <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="text-center text-gray-500 dark:text-gray-400">Loading filters...</div>
            ) : (
              <>
                <div>
                  <button
                    onClick={() => toggleSection('category')}
                    className="flex items-center justify-between w-full pb-2 text-left"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                      Category
                    </h3>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 dark:text-gray-300 transform transition-transform duration-200 ${
                        expandedSections.category ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedSections.category && (
                    <div className="mt-3 space-y-3">
                      {filterOptions.categories.map((category) => (
                        <label key={category} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(activeFilters.categories || []).includes(category)}
                            onChange={(e) =>
                              handleFilterChange('categories', category, e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{category}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => toggleSection('location')}
                    className="flex items-center justify-between w-full pb-2 text-left"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                      Location
                    </h3>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 dark:text-gray-300 transform transition-transform duration-200 ${
                        expandedSections.location ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedSections.location && (
                    <div className="mt-3 space-y-3">
                      {filterOptions.locations.map((location) => (
                        <label key={location} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(activeFilters.locations || []).includes(location)}
                            onChange={(e) =>
                              handleFilterChange('locations', location, e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400 dark:text-gray-300" />
                            {location}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => toggleSection('rating')}
                    className="flex items-center justify-between w-full pb-2 text-left"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                      Rating
                    </h3>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 dark:text-gray-300 transform transition-transform duration-200 ${
                        expandedSections.rating ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedSections.rating && (
                    <div className="mt-3 space-y-3">
                      {filterOptions.ratings.map((rating) => (
                        <label key={rating} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(activeFilters.ratings || []).includes(rating)}
                            onChange={(e) =>
                              handleFilterChange('ratings', rating, e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            {renderStars(rating)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 lg:hidden">
            <div className="flex space-x-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors duration-200 font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopSidebar;