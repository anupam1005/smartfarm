export interface WeatherInfo {
  temperature: {
    current: number;
    min: number;
    max: number;
    feelsLike: number;
  };
  humidity: number;
  rainfall: number;
  forecast: string;
  timestamp: Date;
  soilMoisture: number;
  uvIndex: number;
  windSpeed: number;
  windDirection: string;
  conditions: string;
  alerts: string[];
}

export interface HistoricalWeather {
  date: Date;
  temperature: number;
  humidity: number;
  rainfall: number;
  soilMoisture?: number;
  uvIndex?: number;
  conditions?: string;
}

export interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
    feelsLike: number;
  };
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  soilMoisture: number;
  conditions: string;
  alerts?: string[];
}