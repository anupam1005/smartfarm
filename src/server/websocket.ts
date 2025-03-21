import WebSocket from 'ws';
import { Server } from 'http';
import { WeatherInfo } from '../services/api';

interface WebSocketMessage {
  type: 'weather' | 'crop_alert' | 'system_notification';
  data: any;
  timestamp: number;
}

class WebSocketServer {
  private wss: WebSocket.Server;
  private clients: Set<WebSocket> = new Set();
  private weatherUpdateInterval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ server });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket) => {
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

  private handleMessage(message: WebSocket.Data) {
    try {
      const parsedMessage = JSON.parse(message.toString());
      // Handle different message types
      switch (parsedMessage.type) {
        case 'subscribe':
          // Handle subscription requests
          break;
        case 'crop_alert':
          // Broadcast crop alerts to all clients
          this.broadcast(parsedMessage);
          break;
        default:
          console.warn('Unknown message type:', parsedMessage.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private startWeatherUpdates() {
    // Simulate weather updates every 5 minutes
    this.weatherUpdateInterval = setInterval(() => {
      const weatherUpdate: WeatherInfo = {
        temperature: 20 + Math.random() * 10,
        humidity: 40 + Math.random() * 40,
        rainfall: Math.random() * 5,
        forecast: 'Partly cloudy',
        timestamp: new Date()
      };

      this.broadcast({
        type: 'weather',
        data: weatherUpdate,
        timestamp: Date.now()
      });
    }, 5 * 60 * 1000);
  }

  private broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  private sendToClient(client: WebSocket, message: WebSocketMessage) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  public stop() {
    if (this.weatherUpdateInterval) {
      clearInterval(this.weatherUpdateInterval);
    }
    this.clients.forEach(client => client.close());
    this.wss.close();
  }
}

export default WebSocketServer;