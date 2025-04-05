class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
      this.initializeWebSocket();
  }

  private initializeWebSocket() {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max reconnect attempts reached.');
          return;
      }

      this.socket = new WebSocket('ws://localhost:8080');

      this.socket.onopen = () => {
          console.log('✅ WebSocket Connected.');
          this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
          console.log('📩 Message Received:', event.data);
      };

      this.socket.onerror = (error) => {
          console.error('⚠️ WebSocket Error:', error);
      };

      this.socket.onclose = () => {
          console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts + 1}`);
          this.reconnectAttempts++;
          setTimeout(() => this.initializeWebSocket(), 3000);
      };
  }
}

export default new WebSocketService();
