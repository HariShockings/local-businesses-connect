import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, TrendingUp, Users, ShoppingBag, Coffee, Car, Home as HomeIcon, Smartphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ShopNav from '../components/layout/ShopNav';
import axios from 'axios';

interface Business {
  _id: string;
  name: string;
  description: string;
  location: string;
  services: string[];
  rating?: number;
  icon?: string;
  images?: string[];
}

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [trendingServices, setTrendingServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedBusinesses();
    fetchTrendingServices();
  }, []);

  const fetchFeaturedBusinesses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/businesses/featured');
      setFeaturedBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching featured businesses:', error);
      setFeaturedBusinesses([
        {
          _id: '1',
          name: "Joe's Coffee Shop",
          description: 'Premium coffee and pastries in the heart of downtown',
          location: 'Downtown District',
          services: ['Coffee', 'Pastries', 'Wi-Fi'],
          rating: 4.8,
          icon: 'coffee'
        },
        {
          _id: '2',
          name: 'TechFix Solutions',
          description: 'Professional smartphone and laptop repair services',
          location: 'Tech Plaza',
          services: ['Phone Repair', 'Laptop Repair', 'Data Recovery'],
          rating: 4.6,
          icon: 'smartphone'
        },
        {
          _id: '3',
          name: 'AutoCare Pro',
          description: 'Complete automotive services and maintenance',
          location: 'Industrial Area',
          services: ['Oil Change', 'Brake Repair', 'Diagnostics'],
          rating: 4.7,
          icon: 'car'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingServices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/services/trending');
      setTrendingServices(response.data);
    } catch (error) {
      console.error('Error fetching trending services:', error);
      setTrendingServices(['Coffee & Beverages', 'Phone Repair', 'Auto Services', 'Home Cleaning', 'Food Delivery']);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getServiceIcon = (service: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Coffee & Beverages': <Coffee className="h-6 w-6" />,
      'Phone Repair': <Smartphone className="h-6 w-6" />,
      'Auto Services': <Car className="h-6 w-6" />,
      'Home Cleaning': <HomeIcon className="h-6 w-6" />,
      'Food Delivery': <ShoppingBag className="h-6 w-6" />
    };
    return iconMap[service] || <ShoppingBag className="h-6 w-6" />;
  };

  const getBusinessIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'coffee': <Coffee className="h-8 w-8" />,
      'smartphone': <Smartphone className="h-8 w-8" />,
      'car': <Car className="h-8 w-8" />
    };
    return iconMap[iconName] || <ShoppingBag className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ShopNav />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Local
              <span className="block text-yellow-300">Businesses</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with amazing local businesses, explore their services, and discover products in your community
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search businesses, services, or products..."
                  className="w-full px-6 py-4 pl-12 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-300 dark:focus:ring-yellow-500 text-lg transition-colors duration-300"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 dark:text-gray-300" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors duration-200 font-medium"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Local Businesses</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">2,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Products & Services</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">10,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Happy Customers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">4.8/5</div>
              <div className="text-gray-600 dark:text-gray-300">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Services */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Trending Services</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Discover what's popular in your area</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {trendingServices.map((service, index) => (
              <Link
                key={index}
                to={`/search?category=${encodeURIComponent(service)}`}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 text-center group"
              >
                <div className="text-blue-600 dark:text-blue-400 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-200">
                  {getServiceIcon(service)}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {service}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Businesses */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Businesses</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Discover top-rated local businesses</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl h-80"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBusinesses.map((business) => (
                <Link
                  key={business._id}
                  to={`/business/${business._id}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-2 overflow-hidden group"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white group-hover:scale-110 transition-transform duration-200">
                      {getBusinessIcon(business.icon || 'default')}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {business.name}
                      </h3>
                      {business.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{business.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{business.location}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{business.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {business.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium"
                        >
                          {service}
                        </span>
                      ))}
                      {business.services.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
                          +{business.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/search"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors duration-200"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Explore All Businesses
            </Link>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Own a Business?</h2>
          <p className="text-xl mb-8 leading-relaxed">
            Join our platform and connect with thousands of potential customers in your area
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-lg"
          >
            <Users className="h-6 w-6 mr-2" />
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;