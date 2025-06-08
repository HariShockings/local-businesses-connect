import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: '',
  },
  images: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  sales: {
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    revenue: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  category: {
    type: String,
    default: '',
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  specifications: {
    type: Map,
    of: String,
    default: {},
  },
});

const businessSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '',
    },
    customIcon: {
      type: String,
      default: null,
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    location: {
      type: String,
      required: true,
    },
    pageName: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'blue', 'green', ''],
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    services: {
      type: [String],
      default: [],
      validate: [arrayLimit, 'Maximum 5 services allowed'],
    },
    products: {
      type: Map,
      of: [productSchema],
      default: {},
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    hours: {
      type: Map,
      of: String,
      default: {},
    },
    images: {
      type: [String],
      default: [],
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: [
        'Coffee & Beverages',
        'Technology Repair',
        'Automotive Services',
        'Home Services',
        'Food & Dining',
        'Health & Fitness',
        'Beauty & Spa',
        'Education & Training',
        'Professional Services',
        'Retail & Shopping',
        '',
      ],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length <= 5;
}

const Business = mongoose.model('Business', businessSchema);
export default Business;