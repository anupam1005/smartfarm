import axios from "axios";

const API_KEY: string = import.meta.env.VITE_WEATHER_API_KEY || "";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

if (!API_KEY) {
  console.warn("⚠️ Warning: VITE_WEATHER_API_KEY is missing!");
}

export async function getWeatherData(city: string) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Weather API error:", error);
    throw new Error("Failed to fetch weather data.");
  }
}
