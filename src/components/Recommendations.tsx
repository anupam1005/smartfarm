import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { 
  WaterDrop, 
  LocalFlorist, 
  BugReport, 
  Nature // Changed from Eco to Nature
} from '@mui/icons-material';

interface Recommendation {
  text: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationData {
  irrigation: Recommendation[];
  fertilization: Recommendation[];
  pestControl: Recommendation[];
  general: Recommendation[];
}

const Recommendations: React.FC = () => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission('viewer')) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You need to be logged in to view recommendations.
        </Alert>
      </Box>
    );
  }
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setRecommendations({
          irrigation: [
            { text: 'Increase watering frequency to twice daily', priority: 'high' },
            { text: 'Maintain soil moisture between 60-70%', priority: 'medium' }
          ],
          fertilization: [
            { text: 'Apply nitrogen-rich fertilizer this week', priority: 'high' },
            { text: 'Consider organic compost application', priority: 'low' }
          ],
          pestControl: [
            { text: 'Monitor for aphid infestation', priority: 'medium' },
            { text: 'Apply natural pesticides if needed', priority: 'low' }
          ],
          general: [
            { text: 'Prepare for upcoming temperature changes', priority: 'medium' },
            { text: 'Plan crop rotation for next season', priority: 'low' }
          ]
        });
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): 'error' | 'warning' | 'success' | 'default' => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!recommendations) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load recommendations</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Farming Recommendations
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Irrigation & Fertilization
              </Typography>
              <List>
                {recommendations.irrigation.map((rec, index) => (
                  <ListItem key={`irrigation-${index}`}>
                    <ListItemIcon>
                      <WaterDrop />
                    </ListItemIcon>
                    <ListItemText 
                      primary={rec.text}
                      secondary={
                        <Chip 
                          label={rec.priority}
                          size="small"
                          color={getPriorityColor(rec.priority)}
                        />
                      }
                    />
                  </ListItem>
                ))}
                {recommendations.fertilization.map((rec, index) => (
                  <ListItem key={`fertilization-${index}`}>
                    <ListItemIcon>
                      <LocalFlorist />
                    </ListItemIcon>
                    <ListItemText 
                      primary={rec.text}
                      secondary={
                        <Chip 
                          label={rec.priority}
                          size="small"
                          color={getPriorityColor(rec.priority)}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pest Control & General
              </Typography>
              <List>
                {recommendations.pestControl.map((rec, index) => (
                  <ListItem key={`pest-${index}`}>
                    <ListItemIcon>
                      <BugReport />
                    </ListItemIcon>
                    <ListItemText 
                      primary={rec.text}
                      secondary={
                        <Chip 
                          label={rec.priority}
                          size="small"
                          color={getPriorityColor(rec.priority)}
                        />
                      }
                    />
                  </ListItem>
                ))}
                {recommendations.general.map((rec, index) => (
                  <ListItem key={`general-${index}`}>
                    <ListItemIcon>
                      <Nature />
                    </ListItemIcon>
                    <ListItemText 
                      primary={rec.text}
                      secondary={
                        <Chip 
                          label={rec.priority}
                          size="small"
                          color={getPriorityColor(rec.priority)}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Recommendations;