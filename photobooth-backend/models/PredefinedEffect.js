const mongoose = require('mongoose');

const predefinedEffectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  description: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'admin'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
predefinedEffectSchema.index({ isActive: 1, order: 1 });
predefinedEffectSchema.index({ category: 1 });

const PredefinedEffect = mongoose.model('PredefinedEffect', predefinedEffectSchema);

module.exports = PredefinedEffect;