import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Globe, Clock, Heart, Share2, MessageCircle } from 'lucide-react';
import ShopNav from '../components/layout/ShopNav';
import RatingComponent from '../components/ui/RatingComponent';
import ProductCard from '../components/ui/ProductCard';
import axios from 'axios';

interface Business {
  _id: string;
  name: string;
  description: string;
  location: string;
  contact: {
    phone: string;
    email: string;
  };
  website?: string;
  services: string[];
  products: { [key: string]: any[] };
  rating?: number;
  reviewCount?: number;
  hours?: { [key: string]: string };
  images?: string[];
}

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userAvatar?: string;
}

const BusinessProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBusinessData();
    }
  }, [id]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/businesses/${id}`);
      setBusiness(response.data);
      
      // Fetch reviews
      const reviewsResponse = await axios.get(`http://localhost:5000/api/businesses/${id}/reviews`);
      setReviews(reviewsResponse.data);
      
      // Extract products from all categories
      if (response.data.products) {
        const allProducts = Object.values(response.data.products).flat();
        setProducts(allProducts);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      // Mock data for demo
      setBusiness({
        _id: id!,
        name: 'Joe\'s Coffee Shop',
        description: 'Premium coffee and pastries in the heart of downtown. We serve freshly roasted beans from local farms and homemade pastries baked daily. Our cozy atmosphere makes it perfect for work, meetings, or just relaxing with friends.',
        location: '123 Main Street, Downtown District',
        contact: {
          phone: '+1 (555) 123-4567',
          email: 'hello@joescoffee.com'
        },
        website: 'https://joescoffee.com',
        services: ['Coffee', 'Pastries', 'Wi-Fi', 'Catering', 'Coffee Beans'],
        products: {
          beverages: [
            { id: '1', name: 'Espresso', price: 3.50, description: 'Rich and bold espresso shot', rating: 4.8 },
            { id: '2', name: 'Cappuccino', price: 4.25, description: 'Perfect blend of espresso and steamed milk', rating: 4.7 },
            { id: '3', name: 'Latte', price: 4.75, description: 'Smooth espresso with steamed milk and foam art', rating: 4.9 }
          ],
          pastries: [
            { id: '4', name: 'Croissant', price: 2.95, description: 'Buttery, flaky French pastry', rating: 4.6 },
            { id: '5', name: 'Blueberry Muffin', price: 3.25, description: 'Freshly baked with local blueberries', rating: 4.5 }
          ]
        },
        rating: 4.8,
        reviewCount: 124,
        hours: {
          'Monday': '6:00 AM - 8:00 PM',
          'Tuesday': '6:00 AM - 8:00 PM',
          'Wednesday': '6:00 AM - 8:00 PM',
          'Thursday': '6:00 AM - 8:00 PM',
          'Friday': '6:00 AM - 9:00 PM',
          'Saturday': '7:00 AM - 9:00 PM',
          'Sunday': '7:00 AM - 7:00 PM'
        }
      });
      
      setReviews([
        {
          _id: '1',
          userName: 'Sarah Johnson',
          rating: 5,
          comment: 'Amazing coffee and atmosphere! The baristas are super friendly and knowledgeable. My go-to spot for morning coffee.',
          date: '2024-01-15'
        },
        {
          _id: '2',
          userName: 'Mike Chen',
          rating: 4,
          comment: 'Great coffee and pastries. Sometimes gets crowded during peak hours, but worth the wait.',
          date: '2024-01-10'
        },
        {
          _id: '3',
          userName: 'Emma Davis',
          rating: 5,
          comment: 'Love the cozy vibe and excellent Wi-Fi. Perfect for remote work. The latte art is beautiful!',
          date: '2024-01-08'
        }
      ]);
      
      setProducts([
        { id: '1', name: 'Espresso', price: 3.50, description: 'Rich and bold espresso shot', rating: 4.8, image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300' },
        { id: '2', name: 'Cappuccino', price: 4.25, description: 'Perfect blend of espresso and steamed milk', rating: 4.7, image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300' },
        { id: '3', name: 'Latte', price: 4.75, description: 'Smooth espresso with steamed milk and foam art', rating: 4.9, image: 'https://images.pexels.com/photos/851555/pexels-photo-851555.jpeg?auto=compress&cs=tinysrgb&w=300' },
        { id: '4', name: 'Croissant', price: 2.95, description: 'Buttery, flaky French pastry', rating: 4.6, image: 'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=300' },
        { id: '5', name: 'Blueberry Muffin', price: 3.25, description: 'Freshly baked with local blueberries', rating: 4.5, image: 'https://images.pexels.com/photos/255501/pexels-photo-255501.jpeg?auto=compress&cs=tinysrgb&w=300' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNav />
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Business not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNav />
      
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
            <div className="flex items-center space-x-4">
              {business.rating && (
                <div className="flex items-center space-x-2">
                  {renderStars(business.rating)}
                  <span className="font-medium">{business.rating}</span>
                  <span className="text-gray-200">({business.reviewCount} reviews)</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{business.location}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-3 rounded-full transition-colors duration-200 ${
              isLiked ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Heart className="h-5 w-5" />
          </button>
          <button className="p-3 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['overview', 'products', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-600 leading-relaxed">{business.description}</p>
                </div>

                {/* Services */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Services</h2>
                  <div className="flex flex-wrap gap-3">
                    {business.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hours */}
                {business.hours && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Hours</h2>
                    <div className="space-y-2">
                      {Object.entries(business.hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="font-medium text-gray-900">{day}</span>
                          <span className="text-gray-600">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Products & Services</h2>
                  <span className="text-gray-600">{products.length} items</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} businessId={business._id} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                  <RatingComponent businessId={business._id} />
                </div>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {review.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{review.userName}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          {renderStars(review.rating)}
                          <p className="text-gray-600 mt-3 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a
                    href={`tel:${business.contact.phone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {business.contact.phone}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a
                    href={`mailto:${business.contact.email}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {business.contact.email}
                  </a>
                </div>
                {business.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                  <MessageCircle className="h-5 w-5 inline mr-2" />
                  Contact Business
                </button>
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                  <Phone className="h-5 w-5 inline mr-2" />
                  Call Now
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-900">{business.location}</p>
                  <button className="text-blue-600 hover:text-blue-700 mt-2 text-sm font-medium">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;