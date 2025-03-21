import axios from 'axios';
import { WeatherInfo } from './api';

interface HistoricalWeather {
  date: Date;
  temperature: number;
  humidity: number;
  rainfall: number;
}

interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  rainfall: number;
  conditions: string;
}

class WeatherService {
  private static instance: WeatherService;
  private API_KEY: string;
  private BASE_URL = 'http://localhost:3000/api/weather';

  private constructor() {
    this.API_KEY = process.env.WEATHER_API_KEY || '';
  }

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  public async getCurrentWeather(lat: number, lon: number): Promise<WeatherInfo> {
    try {
      const response = await axios.get<WeatherInfo>(`${this.BASE_URL}/current`, {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }

  public async getHistoricalData(lat: number, lon: number, days: number): Promise<HistoricalWeather[]> {
    try {
      const response = await axios.get<HistoricalWeather[]>(`${this.BASE_URL}/historical`, {
        params: { lat, lon, days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching historical weather data:', error);
      throw error;
    }
  }

  public async getForecast(lat: number, lon: number, days: number): Promise<WeatherForecast[]> {
    try {
      const response = await axios.get<WeatherForecast[]>(`${this.BASE_URL}/forecast`, {
        params: { lat, lon, days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw error;
    }
  }

  public async subscribeToWeatherUpdates(lat: number, lon: number, callback: (data: WeatherInfo) => void): Promise<void> {
    try {
      const eventSource = new EventSource(
        `${this.BASE_URL}/stream?lat=${lat}&lon=${lon}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
      };

      eventSource.onerror = (error) => {
        console.error('Weather stream error:', error);
        eventSource.close();
      };
    } catch (error) {
      console.error('Error setting up weather stream:', error);
      throw error;
    }
  }
}

export default WeatherService;