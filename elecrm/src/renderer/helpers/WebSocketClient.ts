import { io, Socket } from "socket.io-client";

class WebSocketClient {
  private socket: Socket | null = null;
  private eventHandlers: Record<string, Function[]> = {};
  private subscribedEvents: Set<string> = new Set();

  constructor(private url: string, private namespace: string) {}

  connect() {
    const token = sessionStorage.getItem("token");
    const username = sessionStorage.getItem("username");
    if (!token || !username) {
      // console.error("Token or username not found in sessionStorage, websocket connection aborted");
      return;
    }

    this.socket = io(`${this.url}${this.namespace}`, {
      query: { token, username },
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log(`WebSocket connected to ${this.namespace} namespace`);
      this.emit("websocket-status", "connected");

      // Subscribe to events after connection is established
      this.subscribedEvents.forEach((event) => {
        this.socket?.on(event, (data) => {
          this.emit(event, data);
        });
      });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      this.emit("websocket-status", "disconnected");
      if (reason === "io server disconnect") {
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.emit("websocket-error", error);
    });

    this.socket.on("error", (error: any) => {
      console.error("WebSocket error:", error);
      this.emit("websocket-error", error);
    });
  }

  on(event: string, callback: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];

      // Keep track of events that need to be subscribed
      if (event !== "websocket-status" && event !== "websocket-error") {
        this.subscribedEvents.add(event);

        // If socket is connected, immediately subscribe
        if (this.socket && this.socket.connected) {
          this.socket.on(event, (data) => {
            this.emit(event, data);
          });
        }
      }
    }
    this.eventHandlers[event].push(callback);
  }

  emit(event: string, data: any) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach((callback) => callback(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default WebSocketClient;
