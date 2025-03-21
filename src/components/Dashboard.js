import React, { useState, useEffect, useRef } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  CardHeader,
  CardActions,
  Tooltip,
  LinearProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Agriculture, 
  WbSunny, 
  Recommend, 
  Refresh,
  CameraAlt,
  VolumeUp,
  Brightness6,
  LocationOn
} from '@mui/icons-material';

function Dashboard() {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [soilMoisture, setSoilMoisture] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [location, setLocation] = useState(null);
  const [lightMode, setLightMode] = useState('auto');
  const videoRef = useRef(null);
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const features = [
    {
      title: 'Crop Analysis',
      description: 'Analyze your crop health using AI',
      path: '/crop-analysis',
      icon: <Agriculture fontSize="large" color="primary" />,
      stats: '15 analyses this month'
    },
    {
      title: 'Weather Information',
      description: 'Get local weather updates and forecasts',
      path: '/weather',
      icon: <WbSunny fontSize="large" color="primary" />,
      stats: 'Updated 5 min ago'
    },
    {
      title: 'Recommendations',
      description: 'Receive personalized farming recommendations',
      path: '/recommendations',
      icon: <Recommend fontSize="large" color="primary" />,
      stats: '3 new recommendations'
    }
  ];

  // Functions
  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Simulated weather data for testing
      const mockData = {
        temperature: Math.floor(15 + Math.random() * 15),  // Random temp between 15-30°C
        humidity: Math.floor(40 + Math.random() * 40),     // Random humidity between 40-80%
        description: "Partly cloudy",
        windSpeed: Math.floor(2 + Math.random() * 8)       // Random wind speed between 2-10 m/s
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWeatherData(mockData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const startSoilMonitoring = () => {
    return setInterval(() => {
      const moisture = Math.random() * 100;
      setSoilMoisture(moisture);
      
      if (moisture < 30 && voiceEnabled) {
        speakAlert('Low soil moisture detected. Consider irrigation.');
      }
    }, 5000);
  };

  const speakAlert = (message) => {
    const speech = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(speech);
  };

  const toggleLightMode = () => {
    setLightMode(prevMode => {
      switch(prevMode) {
        case 'light': return 'dark';
        case 'dark': return 'auto';
        default: return 'light';
      }
    });
  };

  const startQuickScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        analyzeQuickScan(imageData);
        stream.getTracks().forEach(track => track.stop());
      }, 3000);
    } catch (err) {
      setError('Camera access denied');
    }
  };

  const analyzeQuickScan = async (imageData) => {
    try {
      const response = await fetch('/api/analyze-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });
      const result = await response.json();
      console.log('Analysis result:', result);
    } catch (err) {
      setError('Failed to analyze crop image');
    }
  };

  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => setError('Location access denied')
      );
    }
  };

  const actions = [
    { icon: <CameraAlt />, name: 'Quick Scan', action: startQuickScan },
    { icon: <VolumeUp />, name: 'Toggle Voice', action: () => setVoiceEnabled(!voiceEnabled) },
    { icon: <Brightness6 />, name: 'Light Mode', action: toggleLightMode },
    { icon: <LocationOn />, name: 'Update Location', action: updateLocation }
  ];

  useEffect(() => {
    fetchWeatherData();
    const soilMonitoringInterval = startSoilMonitoring();
    updateLocation();

    return () => {
      clearInterval(soilMonitoringInterval);
    };
  }, []);

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: lightMode === 'auto' 
        ? (isDarkMode ? '#1a1a1a' : '#f5f5f5')
        : (lightMode === 'dark' ? '#1a1a1a' : '#f5f5f5'),
      minHeight: '100vh' 
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          SmartFarm Dashboard
        </Typography>
        <IconButton onClick={fetchWeatherData} disabled={loading}>
          <Refresh />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {weatherData && !loading && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6">Current Weather</Typography>
          <Typography>Temperature: {weatherData.temperature}°C</Typography>
          <Typography>Humidity: {weatherData.humidity}%</Typography>
          <Typography>Conditions: {weatherData.description}</Typography>
          <Typography>Wind Speed: {weatherData.windSpeed} m/s</Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <CardHeader
                avatar={feature.icon}
                title={<Typography variant="h6">{feature.title}</Typography>}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
                <Typography variant="caption" color="primary" sx={{ mt: 2, display: 'block' }}>
                  {feature.stats}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate(feature.path)}
                >
                  Access
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {soilMoisture && (
        <Tooltip title="Current Soil Moisture Level">
          <LinearProgress 
            variant="determinate" 
            value={soilMoisture} 
            sx={{ mb: 2, height: 10, borderRadius: 5 }}
          />
        </Tooltip>
      )}

      <video 
        ref={videoRef} 
        style={{ display: 'none' }} 
        autoPlay 
        playsInline 
      />

      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}

export default Dashboard;