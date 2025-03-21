const mongoose = require('mongoose');

const cropAnalysisSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Farmer'
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
    detectedIssues: [{
        type: String
    }],
    recommendations: [{
        type: String
    }],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CropAnalysis', cropAnalysisSchema);