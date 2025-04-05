import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';

import WeatherInfo from './WeatherInfo';
import { getWeatherData } from '../api/getWeather';
import CropChart from './CropChart';
import SensorStatus from './SensorData';

const Dashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await getWeatherData('Colombo');
      setWeatherData(data);
    };
    fetchWeather();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        🌾 SmartFarm Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Weather */}
        <Grid item xs={12} md={6}>
          {weatherData ? (
            <WeatherInfo data={weatherData} />
          ) : (
            <Paper sx={{ padding: 3, borderRadius: 2 }}>
              <Typography>Loading weather...</Typography>
            </Paper>
          )}
        </Grid>

        {/* Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, height: '100%' }}>
            <CropChart />
          </Paper>
        </Grid>

        {/* Sensor Data */}
        <Grid item xs={12}>
          <SensorStatus />
        </Grid>

        {/* Crop Status Placeholder */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
            <Typography variant="h5">📊 Crop Status</Typography>
            <Typography variant="body1">Coming soon...</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
