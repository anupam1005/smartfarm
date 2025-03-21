import express from 'express';
import { Recommendation } from '../services/api';
import CropAnalysis from '../models/CropAnalysisModel';

const router = express.Router();

// Helper function to generate recommendations based on crop health and weather
const generateRecommendations = async (farmerId: string): Promise<Recommendation[]> => {
  try {
    // Get recent crop analyses
    const recentAnalyses = await CropAnalysis.find({ farmerId })
      .sort({ timestamp: -1 })
      .limit(5);

    const recommendations: Recommendation[] = [];

    // Analyze crop health trends
    const healthIssues = recentAnalyses.reduce((issues, analysis) => {
      analysis.detectedIssues.forEach(issue => {
        if (!issues[issue]) {
          issues[issue] = 1;
        } else {
          issues[issue]++;
        }
      });
      return issues;
    }, {} as Record<string, number>);

    // Generate recommendations based on recurring issues
    Object.entries(healthIssues).forEach(([issue, count]) => {
      if (count >= 2) {
        let recommendation: Recommendation = {
          cropType: recentAnalyses[0].cropType,
          recommendation: '',
          priority: 'Low',
          timestamp: new Date()
        };

        switch (issue.toLowerCase()) {
          case 'leaf discoloration':
            recommendation.recommendation = 'Consider applying balanced NPK fertilizer and checking soil pH';
            recommendation.priority = 'Medium';
            break;
          case 'pest infestation':
            recommendation.recommendation = 'Implement integrated pest management techniques';
            recommendation.priority = 'High';
            break;
          case 'nutrient deficiency':
            recommendation.recommendation = 'Conduct soil test and apply specific nutrients based on results';
            recommendation.priority = 'Medium';
            break;
          case 'water stress':
            recommendation.recommendation = 'Adjust irrigation schedule and consider mulching';
            recommendation.priority = 'High';
            break;
        }

        if (recommendation.recommendation) {
          recommendations.push(recommendation);
        }
      }
    });

    // Add seasonal recommendations
    const currentMonth = new Date().getMonth();
    const seasons = {
      spring: [2, 3, 4],
      summer: [5, 6, 7],
      fall: [8, 9, 10],
      winter: [11, 0, 1]
    };

    let seasonalRecommendation = {
      cropType: recentAnalyses[0]?.cropType || 'General',
      recommendation: '',
      priority: 'Medium' as const,
      timestamp: new Date()
    };

    if (seasons.spring.includes(currentMonth)) {
      seasonalRecommendation.recommendation = 'Prepare for spring planting: check soil temperature and moisture levels';
    } else if (seasons.summer.includes(currentMonth)) {
      seasonalRecommendation.recommendation = 'Monitor water needs closely during peak growing season';
    } else if (seasons.fall.includes(currentMonth)) {
      seasonalRecommendation.recommendation = 'Plan harvest schedule and prepare for frost protection';
    } else {
      seasonalRecommendation.recommendation = 'Maintain soil health and plan for next growing season';
    }

    recommendations.push(seasonalRecommendation);

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

// Get recommendations for a farmer
router.get('/:farmerId', async (req, res) => {
  try {
    const recommendations = await generateRecommendations(req.params.farmerId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;