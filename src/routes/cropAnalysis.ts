import express from 'express';
import multer from 'multer';
import path from 'path';
import { ICropAnalysis } from '../models/CropAnalysisModel';
import CropAnalysis from '../models/CropAnalysisModel';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// Mock AI analysis function
const analyzeImage = async (imagePath: string, cropType: string): Promise<Partial<ICropAnalysis>> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const healthStatuses: Array<'Healthy' | 'Minor Issues' | 'Requires Attention' | 'Critical'> = 
    ['Healthy', 'Minor Issues', 'Requires Attention', 'Critical'];
  const randomStatus = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];

  const issues = [
    'Leaf discoloration',
    'Pest infestation',
    'Nutrient deficiency',
    'Water stress'
  ];
  const selectedIssues = issues
    .filter(() => Math.random() > 0.7)
    .slice(0, Math.floor(Math.random() * 3));

  const recommendations = [
    'Increase irrigation frequency',
    'Apply organic pesticides',
    'Add nitrogen-rich fertilizer',
    'Improve soil drainage',
    'Adjust pH levels'
  ];
  const selectedRecommendations = recommendations
    .filter(() => Math.random() > 0.6)
    .slice(0, Math.floor(Math.random() * 3) + 1);

  return {
    healthStatus: randomStatus,
    detectedIssues: selectedIssues,
    recommendations: selectedRecommendations,
    soilMoisture: Math.random() * 100,
    temperature: 20 + Math.random() * 15,
    humidity: 40 + Math.random() * 40
  };
};

// Get all crop analyses for a farmer
router.get('/:farmerId', async (req: express.Request, res: express.Response) => {
  try {
    const analyses = await CropAnalysis.find({ farmerId: req.params.farmerId })
      .sort({ timestamp: -1 })
      .limit(10);
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching crop analyses:', error);
    res.status(500).json({ error: 'Failed to fetch crop analyses' });
  }
});

// Submit new crop analysis
router.post('/', upload.single('image'), async (req: express.Request & { file?: Express.Multer.File }, res: express.Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { farmerId, cropType, latitude, longitude } = req.body;

    if (!farmerId || !cropType || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Perform AI analysis
    const analysisResult = await analyzeImage(req.file.path, cropType);

    // Create new crop analysis record
    const cropAnalysis = new CropAnalysis({
      farmerId,
      imageUrl: req.file.path,
      cropType,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      ...analysisResult
    });

    await cropAnalysis.save();

    // Broadcast the analysis result through WebSocket if critical
    if (analysisResult.healthStatus === 'Critical' || analysisResult.healthStatus === 'Requires Attention') {
      // You would implement WebSocket broadcast here
    }

    res.status(201).json(cropAnalysis);
  } catch (error) {
    console.error('Error processing crop analysis:', error);
    res.status(500).json({ error: 'Failed to process crop analysis' });
  }
});

// Get analysis statistics
router.get('/stats/:farmerId', async (req: express.Request, res: express.Response) => {
  try {
    const stats = await CropAnalysis.aggregate([
      { $match: { farmerId: req.params.farmerId } },
      { $group: {
        _id: '$healthStatus',
        count: { $sum: 1 }
      }}
    ]);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;