import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';

const data = [
  { month: 'Jan', yield: 40 },
  { month: 'Feb', yield: 50 },
  { month: 'Mar', yield: 70 },
  { month: 'Apr', yield: 30 },
];

const CropChart: React.FC = () => {
  return (
    <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        🌾 Monthly Crop Yield
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="yield" fill="#4caf50" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default CropChart;
