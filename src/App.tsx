import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Dashboard from './components/Dashboard';
import CropAnalysis from './components/CropAnalysis';
import Navbar from './components/Navbar';

function App() {
  const theme = createTheme({
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 48, // Better touch targets
            fontSize: '1rem'
          }
        }
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 64 // Larger bottom navigation for mobile
          }
        }
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          width: '100%',
          overflow: 'hidden',
          WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
        }}>
          <Navbar />
          <Box component="main" sx={{ 
            flexGrow: 1,
            padding: { xs: 1, sm: 2, md: 3 }, // Responsive padding
            overflowY: 'auto'
          }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/crop-analysis" element={<CropAnalysis />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;