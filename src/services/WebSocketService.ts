import { WeatherInfo } from './api';

interface WebSocketMessage {
  type: 'weather' | 'crop_alert' | 'system_notification';
  data: any;
  timestamp: number;
}

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  private constructor() {
    this.initializeWebSocket();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private initializeWebSocket() {
    try {
      this.socket = new WebSocket('ws://localhost:3000/ws');

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.notifySubscribers(message.type, message.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.initializeWebSocket(), this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public subscribe(type: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)?.add(callback);

    return () => {
      this.subscribers.get(type)?.delete(callback);
    };
  }

  private notifySubscribers(type: string, data: any) {
    this.subscribers.get(type)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  public subscribeToWeatherUpdates(callback: (data: WeatherInfo) => void): () => void {
    return this.subscribe('weather', callback);
  }

  public subscribeToCropAlerts(callback: (data: any) => void): () => void {
    return this.subscribe('crop_alert', callback);
  }

  public subscribeToSystemNotifications(callback: (data: any) => void): () => void {
    return this.subscribe('system_notification', callback);
  }

  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  public disconnect() {
    this.socket?.close();
    this.subscribers.clear();
  }
}

export default WebSocketService;