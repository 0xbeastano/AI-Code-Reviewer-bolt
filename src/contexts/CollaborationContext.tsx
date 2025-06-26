import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { MonacoBinding } from 'y-monaco';
import { useAuth } from '../components/Auth/AuthProvider';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';

interface CollaborationContextType {
  isConnected: boolean;
  isCollaborating: boolean;
  collaborators: Collaborator[];
  currentSession: string | null;
  startCollaboration: (fileId: string) => Promise<void>;
  stopCollaboration: () => void;
  getYDoc: () => Y.Doc | null;
  getYText: (fileId: string) => Y.Text | null;
  setupMonacoBinding: (editor: any, fileId: string) => void;
  addComment: (fileId: string, line: number, content: string) => void;
  getComments: (fileId: string) => Comment[];
  resolveComment: (commentId: string) => void;
}

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

interface Comment {
  id: string;
  fileId: string;
  line: number;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  resolved: boolean;
  resolvedBy?: {
    id: string;
    name: string;
  };
  resolvedAt?: Date;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

interface CollaborationProviderProps {
  children: ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [wsProvider, setWsProvider] = useState<WebsocketProvider | null>(null);
  const [dbProvider, setDbProvider] = useState<IndexeddbPersistence | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [monacoBindings, setMonacoBindings] = useState<Map<string, MonacoBinding>>(new Map());

  // Generate a random color for the user
  const getUserColor = useCallback(() => {
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wsProvider) {
        wsProvider.disconnect();
      }
      if (dbProvider) {
        dbProvider.destroy();
      }
      if (yDoc) {
        yDoc.destroy();
      }
    };
  }, [wsProvider, dbProvider, yDoc]);

  const startCollaboration = useCallback(async (fileId: string) => {
    if (!user) {
      toast.error('You must be logged in to collaborate');
      return;
    }

    try {
      // Create a unique session ID for this collaboration
      const sessionId = `code-review-${fileId}`;
      setCurrentSession(sessionId);

      // Create a new Y.Doc
      const doc = new Y.Doc();
      setYDoc(doc);

      // Set up WebSocket provider for real-time collaboration
      // In a real implementation, this would connect to your WebSocket server
      // For demo purposes, we'll use a public demo server
      const websocketProvider = new WebsocketProvider(
        'wss://demos.yjs.dev', 
        sessionId, 
        doc
      );

      websocketProvider.on('status', (event: { status: string }) => {
        setIsConnected(event.status === 'connected');
      });

      // Set up IndexedDB provider for offline persistence
      const indexeddbProvider = new IndexeddbPersistence(sessionId, doc);
      
      indexeddbProvider.on('synced', () => {
        console.log('Content synced with IndexedDB');
      });

      // Set up awareness (for cursors and selections)
      const awareness = websocketProvider.awareness;
      
      // Set local user state
      awareness.setLocalState({
        user: {
          id: user.id,
          name: user.name || user.email,
          avatar: user.avatar,
          color: getUserColor()
        }
      });

      // Listen for changes in collaborators
      awareness.on('change', () => {
        const states = Array.from(awareness.getStates().entries())
          .filter(([clientId]) => clientId !== doc.clientID) // Filter out local user
          .map(([clientId, state]) => {
            if (!state.user) return null;
            
            return {
              id: state.user.id,
              name: state.user.name,
              avatar: state.user.avatar,
              color: state.user.color,
              cursor: state.cursor,
              selection: state.selection
            };
          })
          .filter(Boolean) as Collaborator[];
        
        setCollaborators(states);
      });

      setWsProvider(websocketProvider);
      setDbProvider(indexeddbProvider);
      setIsCollaborating(true);

      toast.success('Collaboration session started');
    } catch (error) {
      console.error('Failed to start collaboration:', error);
      toast.error('Failed to start collaboration session');
    }
  }, [user, getUserColor]);

  const stopCollaboration = useCallback(() => {
    if (wsProvider) {
      wsProvider.disconnect();
    }
    
    // We don't destroy the IndexedDB provider to keep offline data
    
    if (yDoc) {
      yDoc.destroy();
    }
    
    setYDoc(null);
    setWsProvider(null);
    setIsCollaborating(false);
    setCurrentSession(null);
    setCollaborators([]);
    monacoBindings.forEach(binding => binding.destroy());
    setMonacoBindings(new Map());
    
    toast.success('Collaboration session ended');
  }, [wsProvider, yDoc, monacoBindings]);

  const getYDoc = useCallback(() => {
    return yDoc;
  }, [yDoc]);

  const getYText = useCallback((fileId: string) => {
    if (!yDoc) return null;
    return yDoc.getText(`file-${fileId}`);
  }, [yDoc]);

  const setupMonacoBinding = useCallback((editor: any, fileId: string) => {
    if (!yDoc || !editor) return;
    
    // Get or create the shared text for this file
    const yText = yDoc.getText(`file-${fileId}`);
    
    // Create Monaco binding
    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      wsProvider?.awareness
    );
    
    // Store the binding so we can destroy it later
    setMonacoBindings(prev => {
      const newBindings = new Map(prev);
      newBindings.set(fileId, binding);
      return newBindings;
    });
    
    return binding;
  }, [yDoc, wsProvider]);

  const addComment = useCallback((fileId: string, line: number, content: string) => {
    if (!user) return;
    
    const newComment: Comment = {
      id: nanoid(),
      fileId,
      line,
      content,
      author: {
        id: user.id,
        name: user.name || user.email,
        avatar: user.avatar
      },
      createdAt: new Date(),
      resolved: false
    };
    
    setComments(prev => [...prev, newComment]);
    
    // In a real implementation, this would be saved to the database
    
    return newComment;
  }, [user]);

  const getComments = useCallback((fileId: string) => {
    return comments.filter(comment => comment.fileId === fileId);
  }, [comments]);

  const resolveComment = useCallback((commentId: string) => {
    if (!user) return;
    
    setComments(prev => prev.map(comment => 
      comment.id === commentId
        ? {
            ...comment,
            resolved: true,
            resolvedBy: {
              id: user.id,
              name: user.name || user.email
            },
            resolvedAt: new Date()
          }
        : comment
    ));
    
    // In a real implementation, this would be saved to the database
  }, [user]);

  return (
    <CollaborationContext.Provider
      value={{
        isConnected,
        isCollaborating,
        collaborators,
        currentSession,
        startCollaboration,
        stopCollaboration,
        getYDoc,
        getYText,
        setupMonacoBinding,
        addComment,
        getComments,
        resolveComment
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
};