import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface CropAnalysis {
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

export interface WeatherInfo {
  temperature: number;
  humidity: number;
  rainfall: number;
  forecast: string;
  timestamp: Date;
}

export interface Recommendation {
  cropType: string;
  recommendation: string;
  priority: 'Low' | 'Medium' | 'High';
  timestamp: Date;
}

const api = {
  // Crop Analysis
  getCropAnalysis: async () => {
    const response = await axios.get<CropAnalysis[]>(`${API_BASE_URL}/crop-analysis`);
    return response.data;
  },

  submitCropAnalysis: async (data: Omit<CropAnalysis, 'timestamp'>) => {
    const response = await axios.post<CropAnalysis>(`${API_BASE_URL}/crop-analysis`, data);
    return response.data;
  },

  // Weather Information
  getWeatherInfo: async () => {
    const response = await axios.get<WeatherInfo>(`${API_BASE_URL}/weather`);
    return response.data;
  },

  // Recommendations
  getRecommendations: async () => {
    const response = await axios.get<Recommendation[]>(`${API_BASE_URL}/recommendations`);
    return response.data;
  },
};

export default api;