import React from 'react';
import {Typography, Paper, Box } from '@mui/material';
import Grid from '@mui/material/Grid';


interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
}

const WeatherInfo: React.FC<{ data: WeatherData }> = ({ data }) => {
  return (
    <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        ☁️ Weather Information
      </Typography>

      <Grid container spacing={2} component="div">
        <Grid item xs={12} md={6} component="div">
          <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="h6">🌡️ Temperature:</Typography>
            <Typography variant="body1">{data.temperature}°C</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6} component="div">
          <Box sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 1 }}>
            <Typography variant="h6">💧 Humidity:</Typography>
            <Typography variant="body1">{data.humidity}%</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6} component="div">
          <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="h6">💨 Wind Speed:</Typography>
            <Typography variant="body1">{data.windSpeed} km/h</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6} component="div">
          <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="h6">🌤️ Condition:</Typography>
            <Typography variant="body1">{data.description}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default WeatherInfo;
