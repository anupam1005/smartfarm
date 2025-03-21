import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Modal,
  IconButton
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import {
  CameraAlt,
  CheckCircle,
  Warning,
  Spa,
  WaterDrop,
  LocalFlorist,
  LocationOn
} from '@mui/icons-material';
import api from '../services/api';
import { CropAnalysis as CropAnalysisType } from '../services/api';
import { BrowserPermissions } from '../types/permissions';

interface AnalysisResult extends Omit<CropAnalysisType, 'farmerId' | 'imageUrl' | 'timestamp'> {
  score?: number;
  nutrients?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

const CropAnalysis: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const [browserPermissions, setBrowserPermissions] = useState<BrowserPermissions>({
    camera: 'prompt',
    location: 'prompt'
  });

  useEffect(() => {
    checkBrowserPermissions();
  }, []);

  if (!hasPermission('farmer')) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You need farmer or admin privileges to access this feature.
        </Alert>
      </Box>
    );
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captureMode, setCaptureMode] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);


  // Cleanup camera resources
  const cleanupCamera = () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
            console.log('Camera track stopped successfully');
          } catch (err) {
            console.warn('Error stopping track:', err);
          }
        });
        mediaStreamRef.current = null;
      }
      
      if (videoRef.current?.srcObject instanceof MediaStream) {
        videoRef.current.srcObject = null;
      }
      
      // Reset video element
      if (videoRef.current) {
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }

      // Reset canvas if exists
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      // Reset states
      setError(null);
      setBrowserPermissions(prev => ({ ...prev, camera: 'prompt' }));
      setCameraOpen(false);
    } catch (err) {
      console.error('Error in cleanupCamera:', err);
      setError('Failed to properly cleanup camera resources');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, []);

  // Cleanup when modal closes
  useEffect(() => {
    if (!cameraOpen) {
      cleanupCamera();
    }
  }, [cameraOpen]);

  const [permissionState, setPermissionState] = useState<BrowserPermissions['camera']>('prompt');
  const [constraints] = useState<MediaStreamConstraints>({ video: true });

  const handlePermissionResponse = async (allow: boolean) => {
    setShowPermissionDialog(false);
    if (allow) {
      startCamera();
    } else {
      setBrowserPermissions(prev => ({ ...prev, camera: 'denied' }));
      setError('Camera access denied. Please enable camera access in your browser settings.');
    }
  };

  const PermissionDialog = () => (
    <Modal
      open={showPermissionDialog}
      onClose={() => handlePermissionResponse(false)}
      aria-labelledby="permission-dialog-title"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 400 },
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <Typography id="permission-dialog-title" variant="h6" component="h2" gutterBottom>
          Camera Permission Required
        </Typography>
        <Typography sx={{ mb: 3 }}>
          To analyze your crops, we need access to your camera. This will only be used when you choose to take a photo.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => handlePermissionResponse(false)} color="inherit">
            Deny
          </Button>
          <Button onClick={() => handlePermissionResponse(true)} variant="contained" color="primary">
            Allow
          </Button>
        </Box>
      </Box>
    </Modal>
  )

  const checkBrowserPermissions = async (): Promise<BrowserPermissions['camera']> => {
    try {
      if ('permissions' in navigator) {
        // Check camera permission
        try {
          const cameraResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setBrowserPermissions(prev => ({ ...prev, camera: cameraResult.state }));
          cameraResult.onchange = () => {
            setBrowserPermissions(prev => ({ ...prev, camera: cameraResult.state }));
          };
        } catch (err) {
          console.warn('Camera Permissions API failed:', err);
        }

        // Check location permission
        try {
          const locationResult = await navigator.permissions.query({ name: 'geolocation' });
          setBrowserPermissions(prev => ({ ...prev, location: locationResult.state }));
          locationResult.onchange = () => {
            setBrowserPermissions(prev => ({ ...prev, location: locationResult.state }));
          };
        } catch (err) {
          console.warn('Location Permissions API failed:', err);
        }
      }

      // Fallback: Try to access the camera directly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Clean up
        setPermissionState('granted');
        return 'granted';
      } catch (err) {
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setPermissionState('denied');
            return 'denied';
          }
        }
        setPermissionState('prompt');
        return 'prompt';
      }
    } catch (err) {
      console.error('Camera permission check failed:', err);
      setPermissionState('prompt');
      return 'prompt';
    }
  };

  const checkCameraPermission = async (): Promise<BrowserPermissions['camera']> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Media devices API not supported');
      return 'denied';
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return 'granted';
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          return 'denied';
        }
      }
      return 'prompt';
    }
  };

  const startCamera = async (): Promise<void> => {
    try {
      // Clean up any existing streams and reset state
      cleanupCamera();
      setError(null);
      
      // Using the isMobile variable defined at component level
      const isIOSSafari: boolean = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
        /WebKit/.test(navigator.userAgent) && 
        !/CriOS|FxiOS/.test(navigator.userAgent);
      
      // Enhanced camera constraints for better quality and compatibility
      const constraints = {
        video: {
          width: { min: 640, ideal: isMobile ? 720 : 1280, max: 1920 },
          height: { min: 480, ideal: isMobile ? 1280 : 720, max: 1080 },
          facingMode: isMobile ? { exact: 'environment' } : 'user',
          aspectRatio: isMobile ? 9/16 : 16/9,
          frameRate: { ideal: 30, max: 60 },
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        }
      };

      // Handle iOS Safari permissions first
      if (isIOSSafari) {
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
          testStream.getTracks().forEach(track => track.stop());
        } catch (err) {
          if (err instanceof DOMException) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              setError('Camera access denied. Please enable camera access in your device settings.');
              return;
            }
            throw err; // Re-throw other DOMExceptions
          }
        }
      }

      // Check camera permissions for all devices
      const permissionStatus = await checkCameraPermission();
      if (permissionStatus === 'denied') {
        throw new Error('Camera access denied. Please check your browser/device settings and try again.');
      }

      // Try to get stream with full constraints first
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = resolve;
            }
          });
          await videoRef.current.play();
          setPermissionState('granted');
          setCameraOpen(true);
        }
      } catch (err) {
        // Fallback to basic constraints if advanced ones fail
        console.warn('Advanced camera constraints failed, falling back to basic mode:', err);
        const basicStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isMobile ? 'environment' : 'user'
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = basicStream;
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = resolve;
            }
          });
          await videoRef.current.play();
          setPermissionState('granted');
          setCameraOpen(true);
        }
      }

    } catch (err) {
      console.error('Camera error:', err);
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            setError('Camera access was denied. Please check your browser settings and try again.');
            break;
          case 'NotFoundError':
            setError('No camera found on your device.');
            break;
          case 'NotReadableError':
          case 'AbortError':
            setError('Could not access your camera. Please make sure no other app is using it.');
            break;
          default:
            setError('Failed to start camera. Please try again.');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to start camera. Please try again.');
      }
      setPermissionState('denied');
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera or canvas not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas element not available');
      }

      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;

      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.85);

      if (!imageData || imageData === 'data:,') {
        throw new Error('Failed to capture image data');
      }

      const analysisResult = await analyzeImage(imageData);
      
      setResult({
        cropType: analysisResult.cropType,
        healthStatus: analysisResult.healthStatus,
        detectedIssues: analysisResult.detectedIssues,
        recommendations: analysisResult.recommendations,
        location: analysisResult.location,
        soilMoisture: analysisResult.soilMoisture,
        temperature: analysisResult.temperature,
        humidity: analysisResult.humidity,
        score: Math.round(Math.random() * 100),
        nutrients: {
          nitrogen: Math.round(Math.random() * 100),
          phosphorus: Math.round(Math.random() * 100),
          potassium: Math.round(Math.random() * 100)
        }
      });

      setCaptureMode(false);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to capture and analyze image');
    }
  };

  const analyzeImage = async (imageData: string): Promise<CropAnalysisType> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    setLoading(true);
    try {
      const analysisData: Omit<CropAnalysisType, 'timestamp'> = {
        farmerId: user?.id || 'default-farmer',
        imageUrl: imageData,
        cropType: 'unknown',
        healthStatus: 'Healthy',
        detectedIssues: [],
        recommendations: [],
        location: {
          latitude: 0,
          longitude: 0
        },
        soilMoisture: 0,
        temperature: 0,
        humidity: 0
      };
  
      const response = await api.submitCropAnalysis(analysisData);
      return response;
    } catch (err) {
      setError('Analysis failed');
      console.error('Error analyzing image:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Crop Analysis
      </Typography>

      {/* Browser Permissions Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Required Permissions
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CameraAlt />
              </ListItemIcon>
              <ListItemText 
                primary="Camera Access"
                secondary={
                  browserPermissions.camera === 'granted' ? 
                    'Granted' : 
                    browserPermissions.camera === 'denied' ? 
                      'Blocked - Please click the button below to open browser settings and enable camera access' :
                      'Permission required'
                }
              />
              {browserPermissions.camera === 'denied' && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    const isChrome = /Chrome/.test(navigator.userAgent);
                    const isFirefox = /Firefox/.test(navigator.userAgent);
                    const isEdge = /Edg/.test(navigator.userAgent);
                    
                    let settingsUrl = '';
                    if (isChrome || isEdge) {
                      settingsUrl = 'chrome://settings/content/camera';
                    } else if (isFirefox) {
                      settingsUrl = 'about:preferences#privacy';
                    }
                    
                    if (settingsUrl) {
                      window.open(settingsUrl);
                    }
                    window.location.reload();
                  }}
                >
                  Open Settings
                </Button>
              )}
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LocationOn />
              </ListItemIcon>
              <ListItemText 
                primary="Location Access"
                secondary={
                  browserPermissions.location === 'granted' ? 
                    'Granted' : 
                    browserPermissions.location === 'denied' ? 
                      'Blocked - Please click the button below to open browser settings and enable location access' :
                      'Permission required'
                }
              />
              {browserPermissions.location === 'denied' && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    const isChrome = /Chrome/.test(navigator.userAgent);
                    const isFirefox = /Firefox/.test(navigator.userAgent);
                    const isEdge = /Edg/.test(navigator.userAgent);
                    
                    let settingsUrl = '';
                    if (isChrome || isEdge) {
                      settingsUrl = 'chrome://settings/content/location';
                    } else if (isFirefox) {
                      settingsUrl = 'about:preferences#privacy';
                    }
                    
                    if (settingsUrl) {
                      window.open(settingsUrl);
                    }
                    window.location.reload();
                  }}
                >
                  Open Settings
                </Button>
              )}
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            permissionState === 'denied' && (
              <Button 
                color="inherit" 
                size="small"
                onClick={() => {
                  setError(null);
                  startCamera();
                }}
              >
                Try Again
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Live Camera Preview
              </Typography>
              
              {!cameraOpen ? (
                <Box sx={{ width: '100%' }}>
                  <Button
                    variant="contained"
                    startIcon={<CameraAlt />}
                    onClick={() => {
                      if (permissionState === 'prompt') {
                        setShowPermissionDialog(true);
                      } else {
                        setCameraOpen(true);
                        startCamera();
                      }
                    }}
                    fullWidth
                    sx={{
                      py: { xs: 1.5, sm: 2 },
                      mt: { xs: 1, sm: 2 }
                    }}
                    disabled={loading || permissionState === 'denied'}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Start Camera'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{
                  position: 'relative',
                  width: '100%',
                  height: '400px',
                  bgcolor: 'black',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transform: isMobile ? 'none' : 'scaleX(-1)'
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  {!loading && (
                    <Button
                      variant="contained"
                      onClick={handleCapture}
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      Capture
                    </Button>
                  )}
                </Box>
              )}

              {browserPermissions.camera === 'denied' && (
                <Typography 
                  variant="caption" 
                  color="error" 
                  sx={{ display: 'block', mt: 1, textAlign: 'center' }}
                >
                  Camera access is blocked. Please check your browser settings.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results Grid remains unchanged ... */}
      </Grid>

      {/* Permission Dialog Modal remains unchanged ... */}
    </Box>
  );
};

export default CropAnalysis;
