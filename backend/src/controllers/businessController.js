import asyncHandler from 'express-async-handler';
import Business from '../models/Business.js';
import Analytics from '../models/Analytics.js';
import Activity from '../models/Activity.js';
import Review from '../models/Review.js';
import { cloudinary, configureCloudinary } from '../config/cloudinaryConfig.js';
import upload from '../config/multerConfig.js';

class BusinessController {
  // Upload image
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

  // Create a new business
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
      category,
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
      category: category || '',
    });

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

  // Update a business
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
      category,
    } = req.body;

    if (services) {
      const currentServices = business.services;
      const newServices = services;
      const removedServices = currentServices.filter((s) => !newServices.includes(s));
      const addedServices = newServices.filter((s) => !currentServices.includes(s));

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
    business.description = description || business.description;
    business.website = website || business.website;
    business.services = services || business.services;
    business.category = category || business.category;

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

  // Delete a product from a business
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
      products: Object.fromEntries(business.products)
    });
  });

  // Add a product to a business
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
      category: product.category || '',
      inStock: product.inStock !== undefined ? product.inStock : true,
      specifications: product.specifications || {},
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
      products: Object.fromEntries(business.products),
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
      category: product.category || products[productIndex].category,
      inStock: product.inStock !== undefined ? product.inStock : products[productIndex].inStock,
      specifications: product.specifications || products[productIndex].specifications,
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

  // Delete a business
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

  // Get reviews for a business
  getReviews = asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);
    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }

    const reviews = await Review.find({ businessId: business._id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews.map(review => ({
      _id: review._id,
      businessId: review.businessId,
      userId: review.userId._id,
      userName: review.userId.name,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt,
      userAvatar: review.userAvatar,
    })));
  });

  // Create a review for a business
  createReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const businessId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error('Rating is required and must be between 1 and 5');
    }

    const business = await Business.findById(businessId);
    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }

    const existingReview = await Review.findOne({ businessId, userId: req.user._id });
    if (existingReview) {
      res.status(400);
      throw new Error('You have already reviewed this business');
    }

    const review = await Review.create({
      businessId,
      userId: req.user._id,
      userName: req.user.name,
      rating,
      comment: comment || '',
      userAvatar: req.user.avatar || '',
    });

    // Update business rating and reviewCount
    const reviews = await Review.find({ businessId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    business.rating = Number(avgRating.toFixed(1));
    business.reviewCount = reviews.length;
    await business.save();

    await Activity.create({
      userId: req.user._id,
      type: 'review_create',
      description: `${req.user.name} left a ${rating}-star review for business: ${business.name}`,
      entityId: business._id,
      entityType: 'Business',
    });

    res.status(201).json({
      _id: review._id,
      businessId: review.businessId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt,
      userAvatar: review.userAvatar,
    });
  });

  getAllBusinesses = asyncHandler(async (req, res) => {
    // Fetch all businesses
    const businesses = await Business.find({})
      .select('name description icon customIcon theme location services rating reviewCount images isOpen category');

    // Increment profile views for viewed businesses
    for (const business of businesses) {
      await Analytics.findOneAndUpdate(
        { businessId: business._id },
        { $inc: { profileViews: 1 }, $set: { lastUpdated: new Date() } },
        { upsert: true }
      );
    }

    // Return businesses in JSON format
    res.json({
      businesses: businesses.map((b) => ({
        ...b.toObject(),
        image: b.images[0] || '',
        services: Array.isArray(b.services) ? b.services : [],
        products: Object.fromEntries(b.products || new Map()),
        category: b.category || '',
      })),
      totalBusinesses: businesses.length,
    });
  });

  // Get a single business by pageName
  getBusinessByPageName = asyncHandler(async (req, res) => {
    const { pageName } = req.params;

    // Case-insensitive search for pageName
    const business = await Business.findOne({ pageName: new RegExp(`^${pageName}$`, 'i') });

    if (!business) {
      res.status(404);
      throw new Error('Business not found');
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
}

export default new BusinessController();