import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import {
  APIErrorResponse,
  APISuccessResponse,
  SocketChatMessage,
} from "@/types/api";
import { ACCESS_TOKEN_KEY } from "@/types/constants";

interface ChatServiceOptions {
  baseURL: string;
  namespace?: string;
}

class ChatService {
  private socket: Socket | null = null;
  private baseURL: string;

  constructor({ baseURL }: ChatServiceOptions) {
    this.baseURL = baseURL;
  }

  private initializeSocket(): void {
    if (this.socket) return;

    const token = Cookies.get(ACCESS_TOKEN_KEY);
    if (!token) {
      console.warn("No access token found, redirecting to login");
      window.location.href = "/login";
      return;
    }

    this.socket = io(this.baseURL, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket.IO connected:", this.socket?.id);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
      this.handleError({
        message: "Connection failed",
        details: error.message,
        code: 500,
        hint: "Check your network or token validity",
      });
    });

    this.socket.on("error", (error: { message: string }) => {
      console.error("Socket.IO error:", error.message);
      this.handleError({
        message: error.message || "Socket error",
        details: "Received error from server",
        code: 500,
        hint: "Try reconnecting",
      });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });
  }

  private handleError(error: {
    message: string;
    details: string;
    code: number;
    hint: string;
  }): APIErrorResponse {
    const errorResponse: APIErrorResponse = {
      success: false,
      error: {
        message: error.message || "Chat service error",
        details: error.details || "An unexpected error occurred",
        code: error.code || 500,
        hint: error.hint || "Try again later",
      },
    };
    console.log("Chat error:", errorResponse);
    return errorResponse;
  }

  connect(): void {
    this.initializeSocket();
    if (!this.socket) {
      throw this.handleError({
        message: "Failed to initialize socket",
        details: "Socket.IO client could not be created",
        code: 500,
        hint: "Check authentication token",
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("Socket.IO manually disconnected");
    }
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  sendMessage(messageData: {
    recipientId: string;
    message: string;
    listingId?: string | null;
  }): Promise<APISuccessResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected()) {
        reject(
          this.handleError({
            message: "Not connected",
            details: "Socket.IO is not connected",
            code: 503,
            hint: "Call connect() first",
          }),
        );
        return;
      }

      this.socket.emit("sendMessage", messageData, (response: any) => {
        if (response?.success) {
          const successResponse: APISuccessResponse = {
            success: true,
            message: "Message sent",
            data: { messageId: response.messageId },
          };
          resolve(successResponse);
        } else {
          reject(
            this.handleError({
              message: response?.error || "Failed to send message",
              details: "Server rejected the message",
              code: 400,
              hint: "Check message data",
            }),
          );
        }
      });
    });
  }

  onMessage(callback: (message: SocketChatMessage) => void): () => void {
    if (!this.socket) {
      console.warn("Socket not initialized for onMessage");
      return () => {};
    }

    const handler = (message: SocketChatMessage) => {
      console.log("Received message:", message);
      callback(message);
    };

    this.socket.on("message", handler);

    return () => {
      this.socket?.off("message", handler);
    };
  }
}

let chatServiceInstance: ChatService | null = null;

export const initializeChatService = (baseURL: string, namespace?: string) => {
  chatServiceInstance =
    chatServiceInstance || new ChatService({ baseURL, namespace });
};

export const chatService = () => {
  if (!chatServiceInstance) throw new Error("ChatService not initialized.");
  return chatServiceInstance;
};
