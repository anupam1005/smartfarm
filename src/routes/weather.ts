import express from 'express';
import { WeatherInfo } from '../services/api';

const router = express.Router();

// Mock weather data generator
const generateWeatherData = (): WeatherInfo => ({
  temperature: 20 + Math.random() * 10,
  humidity: 40 + Math.random() * 40,
  rainfall: Math.random() * 5,
  forecast: 'Partly cloudy',
  timestamp: new Date()
});

// Get current weather data
router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const weatherData = generateWeatherData();
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get historical weather data
router.get('/historical', async (req, res) => {
  try {
    const { lat, lon, days } = req.query;
    if (!lat || !lon || !days) {
      return res.status(400).json({ error: 'Latitude, longitude, and days are required' });
    }

    const historicalData = Array.from({ length: Number(days) }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      temperature: 20 + Math.random() * 10,
      humidity: 40 + Math.random() * 40,
      rainfall: Math.random() * 5
    }));

    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    res.status(500).json({ error: 'Failed to fetch historical weather data' });
  }
});

// Get weather forecast
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, days } = req.query;
    if (!lat || !lon || !days) {
      return res.status(400).json({ error: 'Latitude, longitude, and days are required' });
    }

    const forecast = Array.from({ length: Number(days) }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      temperature: {
        min: 15 + Math.random() * 5,
        max: 25 + Math.random() * 5
      },
      humidity: 40 + Math.random() * 40,
      rainfall: Math.random() * 5,
      conditions: ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain', 'Heavy rain'][Math.floor(Math.random() * 5)]
    }));

    res.json(forecast);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// Stream weather updates
router.get('/stream', (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendWeatherUpdate = () => {
    const weatherData = generateWeatherData();
    res.write(`data: ${JSON.stringify(weatherData)}\n\n`);
  };

  // Send initial data
  sendWeatherUpdate();

  // Send updates every minute
  const intervalId = setInterval(sendWeatherUpdate, 60000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(intervalId);
  });
});

export default router;