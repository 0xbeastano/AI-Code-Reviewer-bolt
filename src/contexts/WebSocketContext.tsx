import React, { createContext, useContext, useState } from 'react';

interface WebSocketContextType {
  socket: null;
  isConnected: boolean;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected] = useState(false);

  // Mock WebSocket functionality for direct access mode
  const subscribe = (event: string, callback: (data: any) => void) => {
    // Mock implementation - no actual WebSocket connection
  };

  const unsubscribe = (event: string, callback: (data: any) => void) => {
    // Mock implementation - no actual WebSocket connection
  };

  const emit = (event: string, data: any) => {
    // Mock implementation - no actual WebSocket connection
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket: null,
        isConnected,
        subscribe,
        unsubscribe,
        emit,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};