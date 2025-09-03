const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  settingsId: { 
    type: String, 
    default: 'main', 
    unique: true 
  },
  orientation: { 
    type: String, 
    default: 'portrait',
    enum: ['portrait', 'landscape', 'square']
  },
  effects: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    prompt: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  // Capture Settings
  autoCapture: { 
    type: Boolean, 
    default: true 
  },
  countdownDuration: {
    type: Number,
    default: 3000,
    min: 1000,
    max: 10000,
    validate: {
      validator: function(v) {
        return v % 500 === 0; // Must be multiple of 500ms
      },
      message: 'Countdown duration must be in 500ms increments'
    }
  },
  captureInterval: { 
    type: Number, 
    default: 3000,
    min: 1000,
    max: 10000,
    validate: {
      validator: function(v) {
        return v % 500 === 0; // Must be multiple of 500ms
      },
      message: 'Capture interval must be in 500ms increments'
    }
  },
  photoCount: { 
    type: Number, 
    default: 3,
    min: 1,
    max: 6,
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Photo count must be an integer'
    }
  },
  // Additional capture settings
  captureSettings: {
    flashEnabled: { type: Boolean, default: false },
    soundEnabled: { type: Boolean, default: true },
    previewTime: { type: Number, default: 2000, min: 1000, max: 5000 },
    retakeAllowed: { type: Boolean, default: true },
    maxRetakes: { type: Number, default: 3, min: 1, max: 5 }
  },
  updatedBy: { 
    type: String, 
    default: 'admin' 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Middleware to update lastUpdated on save
settingsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Middleware to update lastUpdated on findOneAndUpdate
settingsSchema.pre('findOneAndUpdate', function(next) {
  this.set({ lastUpdated: new Date() });
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;