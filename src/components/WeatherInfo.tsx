import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  CircularProgress
} from '@mui/material';
import { WbSunny, Opacity, Air } from '@mui/icons-material';

function WeatherInfo() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated weather data fetch
    const fetchWeather = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWeatherData({
        current: {
          temp: 25,
          humidity: 65,
          windSpeed: 12,
          condition: 'Sunny'
        },
        forecast: [
          { day: 'Tomorrow', temp: 27, condition: 'Partly Cloudy' },
          { day: 'Day 2', temp: 24, condition: 'Rain' },
          { day: 'Day 3', temp: 26, condition: 'Sunny' }
        ]
      });
      setLoading(false);
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Weather Information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Weather
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WbSunny sx={{ mr: 1 }} />
                <Typography>Temperature: {weatherData.current.temp}°C</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Opacity sx={{ mr: 1 }} />
                <Typography>Humidity: {weatherData.current.humidity}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Air sx={{ mr: 1 }} />
                <Typography>Wind Speed: {weatherData.current.windSpeed} km/h</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                3-Day Forecast
              </Typography>
              {weatherData.forecast.map((day: any, index: number) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{day.day}</Typography>
                  <Typography color="textSecondary">
                    {day.temp}°C - {day.condition}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default WeatherInfo;