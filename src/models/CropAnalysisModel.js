const mongoose = require('mongoose');

const cropAnalysisSchema = new mongoose.Schema({
  farmerId: {
    type: String,
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cropType: {
    type: String,
    required: true
  },
  healthStatus: {
    type: String,
    enum: ['Healthy', 'Minor Issues', 'Requires Attention', 'Critical'],
    required: true
  },
  detectedIssues: {
    type: Map,
    of: String
  },
  recommendations: {
    type: Map,
    of: String
  },
  soilMoisture: {
    type: Number,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
cropAnalysisSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CropAnalysis = mongoose.model('CropAnalysis', cropAnalysisSchema);

module.exports = CropAnalysis;