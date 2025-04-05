import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

export const config = {
  // Server settings
  port: process.env.PORT || 3000,
  nodeEnv: 'production',
  
  // Database settings
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    }
  },

  // Security settings
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
  },

  // API settings
  api: {
    prefix: '/api'
  }
};