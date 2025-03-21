import mongoose, { Schema, Document } from 'mongoose';

export interface ICropAnalysis extends Document {
  farmerId: string;
  imageUrl: string;
  cropType: string;
  healthStatus: 'Healthy' | 'Minor Issues' | 'Requires Attention' | 'Critical';
  detectedIssues: string[];
  recommendations: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  soilMoisture: number;
  temperature: number;
  humidity: number;
  timestamp: Date;
  notes?: string;
}

const CropAnalysisSchema: Schema = new Schema({
  farmerId: { type: String, required: true, index: true },
  imageUrl: { type: String, required: true },
  cropType: { type: String, required: true },
  healthStatus: {
    type: String,
    enum: ['Healthy', 'Minor Issues', 'Requires Attention', 'Critical'],
    required: true
  },
  detectedIssues: [{ type: String }],
  recommendations: [{ type: String }],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  soilMoisture: { type: Number, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String }
}, {
  timestamps: true
});

CropAnalysisSchema.index({ timestamp: -1 });
CropAnalysisSchema.index({ location: '2dsphere' });

export default mongoose.model<ICropAnalysis>('CropAnalysis', CropAnalysisSchema);