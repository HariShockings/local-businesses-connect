import React, { useState } from 'react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-toastify';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  rating?: number;
  image?: string;
  sales?: {
    quantity: number;
    revenue: number;
  };
}

interface ProductCardProps {
  product: Product;
  businessId: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, businessId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cartItem = {
      _id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image || 'https://via.placeholder.com/150',
    };
    addToCart(cartItem);
    toast.success(`Added ${product.name} to cart`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-white text-4xl font-bold">
              {product.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-2">
          <button
            onClick={handleLike}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isLiked 
                ? 'bg-red-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Heart className="h-4 w-4" />
          </button>
          <button className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Rating Badge */}
        {product.rating && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 dark:bg-opacity-80 text-white px-2 py-1 rounded-full flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mb-1">
          {product.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${product.price.toFixed(2)}
          </div>
          {product.rating && (
            <div className="flex items-center space-x-1">
              {renderStars(product.rating)}
              <span className="text-xs text-gray-500 dark:text-gray-400">({product.rating})</span>
            </div>
          )}
        </div>

        {/* Sales Info */}
        {product.sales && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {product.sales.quantity} sold
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;