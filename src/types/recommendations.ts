export interface Recommendation {
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: 'irrigation' | 'fertilization' | 'pestControl' | 'general';
  cropType: string;
  timestamp: Date;
}