import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'profile_update',
      'business_create',
      'business_update',
      'service_add',
      'service_update',
      'service_delete',
      'product_add',
      'product_update',
      'product_delete',
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType',
  },
  entityType: {
    type: String,
    enum: ['Business', 'Service', 'Product', null],
  },
}, {
  timestamps: true,
});

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;