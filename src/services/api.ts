import axios from "axios";

export interface WeatherInfo {
  temperature: { current: number };
  humidity: number;
  windSpeed: number;
  forecast: string;
}

export const getWeatherInfo = async (): Promise<WeatherInfo> => {
  try {
    const response = await axios.get<{ current: { temp_c: number }, humidity: number, wind_kph: number, condition: { text: string } }>(
      "https://api.weatherapi.com/v1/current.json",
      {
        params: {
          key: "YOUR_API_KEY", // Replace with your actual API key
          q: "New York", // Change location as needed
        },
      }
    );

    const data = response.data;
    return {
      temperature: { current: data.current.temp_c },
      humidity: data.humidity,
      windSpeed: data.wind_kph,
      forecast: data.condition.text,
    };
  } catch (error) {
    console.error("Error fetching weather info:", error);
    throw error;
  }
};
