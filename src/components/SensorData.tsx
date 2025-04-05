import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';


const SensorStatus: React.FC = () => {
  const sensors = [
    { name: 'Soil Moisture', value: '45%' },
    { name: 'Soil pH', value: '6.8' },
    { name: 'Temperature', value: '27°C' },
  ];

  return (
    <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>🧪 Sensor Readings</Typography>
      <Grid container spacing={2}>
        {sensors.map((sensor, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1">{sensor.name}</Typography>
              <Typography variant="h6">{sensor.value}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default SensorStatus;
