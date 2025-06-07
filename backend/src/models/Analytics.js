import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  profileViews: {
    type: Number,
    default: 0,
  },
  inquiries: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;