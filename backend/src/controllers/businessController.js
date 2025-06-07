import asyncHandler from 'express-async-handler';
import Business from '../models/Business.js';
import Analytics from '../models/Analytics.js';
import Activity from '../models/Activity.js';
import { cloudinary, configureCloudinary } from '../config/cloudinaryConfig.js';
import upload from '../config/multerConfig.js';

class BusinessController {
  // Upload image to Cloudinary (for icons or product images)
  uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    try {
      configureCloudinary();
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'business_images',
            resource_type: 'image',
            format: 'png',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      await Activity.create({
        userId: req.user._id,
        type: 'business_update',
        description: `${req.user.name} uploaded an image for business assets`,
      });

      res.json({ url: result.secure_url });
    } catch (error) {
      res.status(500);
      throw new Error('Failed to upload image to Cloudinary');
    }
  });

  // Create a new business profile
  createBusiness = asyncHandler(async (req, res) => {
    const {
      name,
      icon,
      customIcon,
      contact,
      location,
      pageName,
      theme,
      description,
      website,
      services,
    } = req.body;

    if (req.user.role !== 'business_owner') {
      res.status(403);
      throw new Error('Only business owners can create business profiles');
    }

    const business = await Business.create({
      ownerId: req.user._id,
      name,
      icon: icon || '',
      customIcon: customIcon || null,
      contact,
      location,
      pageName,
      theme,
      description,
      website,
      services: services || [],
      products: new Map(),
    });

    // Create analytics entry for the new business
    await Analytics.create({ businessId: business._id });

    await Activity.create({
      userId: req.user._id,
      type: 'business_create',
      description: `${req.user.name} created business: ${name}`,
      entityId: business._id,
      entityType: 'Business',
    });

    res.status(201).json({
      ...business.toObject(),
      products: Object.fromEntries(business.products),
    });
  });

  // Get all businesses for the authenticated user
  getBusinesses = asyncHandler(async (req, res) => {
    if (req.user.role !== 'business_owner') {
      res.status(403);
      throw new Error('Only business owners can view business profiles');
    }

    const businesses = await Business.find({ ownerId: req.user._id });
    const formattedBusinesses = businesses.map((b) => ({
      ...b.toObject(),
      products: Object.fromEntries(b.products || new Map()),
    }));

    // Increment profile views for each business viewed
    for (const business of businesses) {
      await Analytics.findOneAndUpdate(
        { businessId: business._id },
        { $inc: { profileViews: 1 }, $set: { lastUpdated: new Date() } },
        { upsert: true }
      );
    }

    res.json(formattedBusinesses);
  });

  // Get a single business by ID
  getBusinessById = asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);

    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }

    if (business.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this business');
    }

    // Increment profile views
    await Analytics.findOneAndUpdate(
      { businessId: business._id },
      { $inc: { profileViews: 1 }, $set: { lastUpdated: new Date() } },
      { upsert: true }
    );

    res.json({
      ...business.toObject(),
      products: Object.fromEntries(business.products || new Map()),
    });
  });

  // Update a business profile (including services)
  updateBusiness = asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);

    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }

    if (business.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this business');
    }

    const {
      name,
      icon,
      customIcon,
      contact,
      location,
      pageName,
      theme,
      description,
      website,
      services,
      products,
    } = req.body;

    if (services) {
      const currentServices = business.services;
      const newServices = services;
      const removedServices = currentServices.filter((s) => !newServices.includes(s));
      const addedServices = newServices.filter((s) => !currentServices.includes(s));

      // Remove products for deleted services
      removedServices.forEach((service) => {
        business.products.delete(service);
        Activity.create({
          userId: req.user._id,
          type: 'service_delete',
          description: `${req.user.name} removed service: ${service} from business: ${business.name}`,
          entityId: business._id,
          entityType: 'Business',
        });
      });

      // Initialize products for new services
      addedServices.forEach((service) => {
        if (!business.products.has(service)) {
          business.products.set(service, []);
          Activity.create({
            userId: req.user._id,
            type: 'service_add',
            description: `${req.user.name} added service: ${service} to business: ${business.name}`,
            entityId: business._id,
            entityType: 'Business',
          });
        }
      });
    }

    business.name = name || business.name;
    business.icon = icon || business.icon;
    business.customIcon = customIcon || business.customIcon;
    business.contact = contact || business.contact;
    business.location = location || business.location;
    business.pageName = pageName || business.pageName;
    business.theme = theme || business.theme;
    business.description = services || business.description;
    business.website = '';
    business.services = [];

    business.products = products ? new Map(Object.entries(products)) : business.products;

    const updatedBusiness = await business.save();

    await Activity.create({
      userId: req.user._id,
      type: 'business_update',
      description: `${req.user.name} updated business: ${business.name}`,
      entityId: business._id,
      entityType: 'Business',
    });

    res.json({
      ...updatedBusiness.toObject(),
      products: Object.fromEntries(updatedBusiness.products || new Map()),
    });
  });

  // Delete a business profile
  deleteBusiness = asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);

    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }

    if (business.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this business');
    }

    if (business.customIcon) {
      const publicId = business.customIcon.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`business_icons/${publicId}`);
    }

    await Analytics.deleteOne({ businessId: business._id });

    await Activity.create({
      userId: req.user._id,
      type: 'business_delete',
      description: `${req.user.name} deleted business: ${business.name}`,
      entityId: business._id,
      entityType: 'Business',
    });

    await Business.findByIdAndDelete(req.params.id);
    res.json({ message: 'Business deleted successfully' });
  });

  // Add a product to a service
  addProduct = asyncHandler(async (req, res) => {
    const { id: businessId } = req.params;
    const { service, product } = req.body;

    if (!service || !product || !product.name || !product.price) {
      res.status(400);
      throw new Error('Service, product name, and price are required');
    }

    const business = await Business.findById(businessId);
    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }

    if (business.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to add products to this business');
    }

    if (!business.services.includes(service)) {
      res.status(400);
      throw new Error('Service not found in business');
    }

    if (!business.products.has(service)) {
      business.products.set(service, []);
    }

    const productId = product.id || `p${Date.now()}`;
    const newProduct = {
      id: productId,
      name: product.name,
      price: product.price,
      description: product.description || '',
      images: Array.isArray(product.images) ? product.images : [],
      rating: 0,
      sales: { quantity: 0, revenue: 0 },
    };

    const currentProducts = business.products.get(service) || [];
    currentProducts.push(newProduct);
    business.products.set(service, currentProducts);

    await business.save();

    await Activity.create({
      userId: req.user._id,
      type: 'product_add',
      description: `${req.user.name} added product: ${product.name} to service: ${service} in business: ${business.name}`,
      entityId: business._id,
      entityType: 'Business',
    });

    res.status(201).json({
      ...business.toObject(),
      products: Object.fromEntries(business.products || new Map()),
    });
  });

  // Update a product
  updateProduct = asyncHandler(async (req, res) => {
    const { id: businessId, productId } = req.params;
    const { service, product } = req.body;

    if (!service || !product || !product.name || !product.price) {
      res.status(400);
      throw new Error('Service, product name, and price are required');
    }

    const business = await Business.findById(businessId);
    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }

    if (business.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update products in this business');
    }

    if (!business.services.includes(service)) {
      res.status(400);
      throw new Error('Service not found in business');
    }

    const products = business.products.get(service) || [];
    const productIndex = products.findIndex((p) => p.id === productId);

    if (productIndex === -1) {
      res.status(404);
      throw new Error('Product not found');
    }

    products[productIndex] = {
      id: productId,
      name: product.name,
      price: product.price,
      description: product.description || '',
      images: Array.isArray(product.images) ? product.images : [],
      rating: products[productIndex].rating,
      sales: products[productIndex].sales,
    };

    business.products.set(service, products);

    await business.save();

    await Activity.create({
      userId: req.user._id,
      type: 'product_update',
      description: `${req.user.name} updated product: ${product.name} in service: ${service} for business: ${business.name}`,
      entityId: business._id,
      entityType: 'Business',
    });

    res.json({
      ...business.toObject(),
      products: Object.fromEntries(business.products || new Map()),
    });
  });

  // Delete a product
  deleteProduct = asyncHandler(async (req, res) => {
    const { id: businessId, productId } = req.params;
    const { service } = req.body;

    if (!service) {
      res.status(400);
      throw new Error('Service is required');
    }

    const business = await Business.findById(businessId);
    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }

    if (business.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete products from this business');
    }

    const products = business.products.get(service) || [];
    const product = products.find((p) => p.id === productId);
    const updatedProducts = products.filter((p) => p.id !== productId);

    if (products.length === updatedProducts.length) {
      res.status(404);
      throw new Error('Product not found');
    }

    business.products.set(service, updatedProducts);

    await business.save();

    await Activity.create({
      userId: req.user._id,
      type: 'product_delete',
      description: `${req.user.name} deleted product: ${product.name} from service: ${service} in business: ${business.name}`,
      entityId: business._id,
      entityType: 'Business',
    });

    res.json({
      ...business.toObject(),
      products: Object.fromEntries(business.products || new Map()),
    });
  });

  // Get business statistics
  getBusinessStats = asyncHandler(async (req, res) => {
    if (req.user.role !== 'business_owner') {
      res.status(403);
      throw new Error('Only business owners can view business statistics');
    }

    const businesses = await Business.find({ ownerId: req.user._id });
    const analytics = await Analytics.find({
      businessId: { $in: businesses.map((b) => b._id) },
    });

    const stats = {
      profileViews: analytics.reduce((sum, a) => sum + a.profileViews, 0),
      inquiries: analytics.reduce((sum, a) => sum + a.inquiries, 0),
      servicesOffered: businesses.reduce((sum, b) => sum + b.services.length, 0),
    };

    res.json(stats);
  });
}

export default new BusinessController();