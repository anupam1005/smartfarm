import WebSocket from 'ws';
import { Server } from 'http';
import { WeatherInfo } from '../services/api.js';

export default class WebSocketServer {
  constructor(server, options = {}) {
    this.wss = new WebSocket.Server({ server, ...options });
    this.clients = new Set();
    this.weatherUpdateInterval = null;
    this.initialize();
  }

  initialize() {
    this.wss.on('connection', (ws) => {
      console.log('New client connected');
      this.clients.add(ws);

      ws.on('message', this.handleMessage.bind(this));

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send initial system notification
      this.sendToClient(ws, {
        type: 'system_notification',
        data: { message: 'Connected to SmartFarm WebSocket Server' },
        timestamp: Date.now()
      });
    });

    // Start periodic weather updates
    this.startWeatherUpdates();
  }

  handleMessage(message) {
    try {
      const parsedMessage = JSON.parse(message);
      console.log('Received message:', parsedMessage);

      switch (parsedMessage.type) {
        case 'weather_request':
          // Handle weather request
          break;
        case 'crop_alert':
          this.broadcastMessage({
            type: 'crop_alert',
            data: parsedMessage.data,
            timestamp: Date.now()
          });
          break;
        default:
          console.log('Unknown message type:', parsedMessage.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  sendToClient(client, message) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  broadcastMessage(message) {
    this.clients.forEach(client => {
      this.sendToClient(client, message);
    });
  }

  startWeatherUpdates() {
    // Implement weather updates if needed
  }

  stop() {
    if (this.weatherUpdateInterval) {
      clearInterval(this.weatherUpdateInterval);
    }
    this.wss.close();
  }
}