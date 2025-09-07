import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      setLastMessage(message);
      
      // Handle different message types with notifications
      switch (message.type) {
        case "INVESTMENT_COMPLETED":
          toast({
            title: "Investment Completed!",
            description: `Your investment has been processed successfully.`,
            variant: "default",
          });
          break;
        case "CREATOR_REQUEST_APPROVED":
          toast({
            title: "Creator Request Approved!",
            description: "Congratulations! You can now create projects.",
            variant: "default",
          });
          break;
        case "CREATOR_REQUEST_REJECTED":
          toast({
            title: "Creator Request Rejected",
            description: "Your creator request has been reviewed.",
            variant: "destructive",
          });
          break;
        case "PROJECT_CREATED":
          toast({
            title: "New Project Available!",
            description: "A new project is now available for investment.",
            variant: "default",
          });
          break;
        case "USER_BANNED":
          toast({
            title: "Account Action",
            description: "A user account has been banned by admin.",
            variant: "destructive",
          });
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [toast]);

  return {
    isConnected,
    lastMessage,
  };
}