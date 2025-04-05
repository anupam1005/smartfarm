import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import WebSocketServer from './server/websocket.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

const server = http.createServer(app);

// Import production config
import { config } from './config/production.js';

// Set server to listen on configured port with proper host binding
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log(`WebSocket server is available on ws://${HOST}:${PORT}`);
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));



// Global middleware to ensure JSON responses
app.use((req, res, next) => {
    // Override res.json to ensure proper content-type and response structure
    const originalJson = res.json;
    res.json = function(body) {
        if (typeof body === 'string') {
            body = { message: body };
        } else if (body === null || body === undefined) {
            body = {};
        }
        
        // Ensure response has a consistent structure
        const formattedResponse = {
            success: !body.error,
            status: res.statusCode || 200,
            timestamp: new Date().toISOString()
        };
        
        // If there's an error, include it in the response
        if (body.error) {
            formattedResponse.error = body.error;
        } else {
            formattedResponse.data = body.data || body;
        }
        
        // Set proper content type header
        res.set('Content-Type', 'application/json');
        return originalJson.call(this, formattedResponse);
    };
    
    // Ensure all responses have JSON content type
    res.set('Content-Type', 'application/json');
    next();
});

// Set CORS headers for all API responses
app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    // Ensure proper JSON response
    res.setHeader('Content-Type', 'application/json');
    const status = err.status || 500;
    
    // Handle SyntaxError for JSON parsing
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'Invalid JSON payload',
            status: 400,
            timestamp: new Date().toISOString()
        });
    }
    
    const errorResponse = {
        error: err.message || 'Internal Server Error',
        status: status,
        timestamp: new Date().toISOString()
    };
    
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }
    
    res.status(status).json(errorResponse);
});

// Handle 404 errors with JSON response
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Initialize WebSocket server with path configuration
const wss = new WebSocketServer(server, { path: '/ws' });

// Handle WebSocket server errors
wss.wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    // Handle different types of errors
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';
    
    // Special handling for common errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        status = 400;
        message = 'Invalid JSON payload';
    }
    
    const errorResponse = {
        error: message,
        status: status,
        timestamp: new Date().toISOString()
    };
    
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }
    
    res.status(status).json(errorResponse);
});

// Import and use auth routes
app.use('/api/auth', authRoutes);

// Connect to MongoDB
connectDB().then(conn => {
  if (conn) {
    console.log('MongoDB connection established');
  } else {
    console.warn('MongoDB connection failed, but server will continue running');
  }
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  console.warn('Server will continue running without database connection');
});

// Rate limiting

import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Catch-all middleware for unhandled routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        status: 404,
        timestamp: new Date().toISOString()
    });
});



// Server is already listening on port 3000

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        wss.stop();
        mongoose.connection.close().then(() => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});