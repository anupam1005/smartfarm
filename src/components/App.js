import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './Dashboard';
import CropAnalysis from './CropAnalysis';
import WeatherInfo from './WeatherInfo';
import Recommendations from './Recommendations';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#ff8f00',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/crop-analysis" element={<CropAnalysis />} />
          <Route path="/weather" element={<WeatherInfo />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;