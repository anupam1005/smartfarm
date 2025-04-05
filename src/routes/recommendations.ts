import express from 'express';
import { Recommendation } from '../services/api';
import CropAnalysis, { ICropAnalysis } from '../models/CropAnalysisModel';
import CropAnalysisDAO from '../models/CropAnalysisDAO';

const router = express.Router();

// Helper function to generate recommendations based on crop health and weather
const generateRecommendations = async (farmerId: string): Promise<Recommendation[]> => {
  try {
    // Get recent crop analyses
    const recentAnalyses = await CropAnalysisDAO.findByFarmerId(farmerId, 5) as ICropAnalysis[];

    const recommendations: Recommendation[] = [];

    // Analyze crop health trends
    interface IssueCount {
  [key: string]: number;
}

const healthIssues = recentAnalyses.reduce<IssueCount>((issues, analysis: ICropAnalysis) => {
      analysis.detectedIssues.forEach((issue: string) => {
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
      if ((count as number) >= 2) {
        let recommendation: Recommendation = {
          cropType: recentAnalyses[0].cropType,
          text: '',
          priority: 'low',
          category: 'general',
          timestamp: new Date()
        };

        switch (issue.toLowerCase()) {
          case 'leaf discoloration':
            recommendation.text = 'Consider applying balanced NPK fertilizer and checking soil pH';
            recommendation.priority = 'medium';
            recommendation.category = 'fertilization';
            break;
          case 'pest infestation':
            recommendation.text = 'Implement integrated pest management techniques';
            recommendation.priority = 'high';
            recommendation.category = 'pestControl';
            break;
          case 'nutrient deficiency':
            recommendation.text = 'Conduct soil test and apply specific nutrients based on results';
            recommendation.priority = 'medium';
            recommendation.category = 'fertilization';
            break;
          case 'water stress':
            recommendation.text = 'Adjust irrigation schedule and consider mulching';
            recommendation.priority = 'high';
            recommendation.category = 'irrigation';
            break;
        }

        if (recommendation.text) {
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

    let seasonalRecommendation: Recommendation = {
      cropType: recentAnalyses[0]?.cropType || 'General',
      text: '',
      priority: 'medium',
      category: 'general',
      timestamp: new Date()
    };

    if (seasons.spring.includes(currentMonth)) {
      seasonalRecommendation.text = 'Prepare for spring planting: check soil temperature and moisture levels';
    } else if (seasons.summer.includes(currentMonth)) {
      seasonalRecommendation.text = 'Monitor water needs closely during peak growing season';
      seasonalRecommendation.category = 'irrigation';
    } else if (seasons.fall.includes(currentMonth)) {
      seasonalRecommendation.text = 'Plan harvest schedule and prepare for frost protection';
    } else {
      seasonalRecommendation.text = 'Maintain soil health and plan for next growing season';
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