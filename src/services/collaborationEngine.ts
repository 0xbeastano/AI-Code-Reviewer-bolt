import { log } from '../utils/logger';

export interface CollaborativeSession {
  id: string;
  projectId: string;
  participants: Participant[];
  activeFiles: Map<string, FileSession>;
  createdAt: Date;
  lastActivity: Date;
  status: 'active' | 'paused' | 'ended';
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  cursor: {
    file: string;
    line: number;
    column: number;
  };
  selection: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  } | null;
  lastSeen: Date;
  isTyping: boolean;
  color: string;
}

export interface FileSession {
  filePath: string;
  content: string;
  version: number;
  operations: Operation[];
  lockedRanges: LockedRange[];
  comments: Comment[];
  activeEditors: string[];
}

export interface Operation {
  id: string;
  type: 'insert' | 'delete' | 'replace';
  position: { line: number; column: number };
  content: string;
  author: string;
  timestamp: Date;
  applied: boolean;
}

export interface LockedRange {
  start: { line: number; column: number };
  end: { line: number; column: number };
  lockedBy: string;
  reason: string;
  timestamp: Date;
}

export interface Comment {
  id: string;
  position: { line: number; column: number };
  content: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
  replies: Comment[];
}

export interface TeamAnalytics {
  sessionId: string;
  duration: number;
  participantCount: number;
  filesEdited: number;
  operationsCount: number;
  conflictsResolved: number;
  productivityScore: number;
  collaborationMetrics: {
    simultaneousEditing: number;
    communicationEvents: number;
    codeReviewInteractions: number;
    knowledgeSharing: number;
  };
}

class CollaborationEngine {
  private static instance: CollaborationEngine;
  private sessions: Map<string, CollaborativeSession> = new Map();
  private websocketServer: any = null;
  private operationalTransform: OperationalTransform;
  private conflictResolver: ConflictResolver;

  static getInstance(): CollaborationEngine {
    if (!CollaborationEngine.instance) {
      CollaborationEngine.instance = new CollaborationEngine();
    }
    return CollaborationEngine.instance;
  }

  constructor() {
    this.operationalTransform = new OperationalTransform();
    this.conflictResolver = new ConflictResolver();
    this.initializeWebSocketServer();
    this.startAnalyticsTracking();
  }

  private initializeWebSocketServer() {
    // In a real implementation, this would set up WebSocket server
    log.info('Collaboration WebSocket server initialized');
  }

  private startAnalyticsTracking() {
    setInterval(() => {
      this.analyzeTeamProductivity();
    }, 30000); // Every 30 seconds
  }

  // Create a new collaborative session
  createSession(projectId: string, initiator: Participant): CollaborativeSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CollaborativeSession = {
      id: sessionId,
      projectId,
      participants: [initiator],
      activeFiles: new Map(),
      createdAt: new Date(),
      lastActivity: new Date(),
      status: 'active'
    };

    this.sessions.set(sessionId, session);
    
    log.info('Collaborative session created', {
      sessionId,
      projectId,
      initiator: initiator.id
    });

    return session;
  }

  // Join an existing session
  joinSession(sessionId: string, participant: Participant): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      log.warn('Attempted to join non-existent session', { sessionId });
      return false;
    }

    // Check if participant already exists
    const existingIndex = session.participants.findIndex(p => p.id === participant.id);
    if (existingIndex >= 0) {
      session.participants[existingIndex] = participant;
    } else {
      session.participants.push(participant);
    }

    session.lastActivity = new Date();

    this.broadcastToSession(sessionId, {
      type: 'participant-joined',
      participant,
      timestamp: new Date()
    });

    log.info('Participant joined session', {
      sessionId,
      participantId: participant.id,
      totalParticipants: session.participants.length
    });

    return true;
  }

  // Leave a session
  leaveSession(sessionId: string, participantId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participantIndex = session.participants.findIndex(p => p.id === participantId);
    if (participantIndex >= 0) {
      const participant = session.participants[participantIndex];
      session.participants.splice(participantIndex, 1);

      // Release any locks held by this participant
      this.releaseParticipantLocks(session, participantId);

      this.broadcastToSession(sessionId, {
        type: 'participant-left',
        participantId,
        timestamp: new Date()
      });

      log.info('Participant left session', {
        sessionId,
        participantId,
        remainingParticipants: session.participants.length
      });

      // End session if no participants remain
      if (session.participants.length === 0) {
        this.endSession(sessionId);
      }
    }
  }

  // Open a file for collaborative editing
  openFile(sessionId: string, filePath: string, content: string, participantId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const fileSession: FileSession = {
      filePath,
      content,
      version: 1,
      operations: [],
      lockedRanges: [],
      comments: [],
      activeEditors: [participantId]
    };

    session.activeFiles.set(filePath, fileSession);
    session.lastActivity = new Date();

    this.broadcastToSession(sessionId, {
      type: 'file-opened',
      filePath,
      participantId,
      timestamp: new Date()
    });

    log.info('File opened for collaboration', {
      sessionId,
      filePath,
      participantId
    });

    return true;
  }

  // Apply an operation to a file
  async applyOperation(sessionId: string, filePath: string, operation: Operation): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const fileSession = session.activeFiles.get(filePath);
    if (!fileSession) return false;

    try {
      // Check for conflicts with locked ranges
      if (this.isOperationBlocked(operation, fileSession.lockedRanges)) {
        log.warn('Operation blocked by locked range', {
          sessionId,
          filePath,
          operationId: operation.id
        });
        return false;
      }

      // Apply operational transformation
      const transformedOperation = await this.operationalTransform.transform(
        operation,
        fileSession.operations
      );

      // Apply the operation to the content
      const newContent = this.applyOperationToContent(
        fileSession.content,
        transformedOperation
      );

      fileSession.content = newContent;
      fileSession.version++;
      fileSession.operations.push(transformedOperation);
      transformedOperation.applied = true;

      session.lastActivity = new Date();

      // Broadcast to all participants
      this.broadcastToSession(sessionId, {
        type: 'operation-applied',
        filePath,
        operation: transformedOperation,
        newVersion: fileSession.version,
        timestamp: new Date()
      });

      log.debug('Operation applied successfully', {
        sessionId,
        filePath,
        operationId: operation.id,
        newVersion: fileSession.version
      });

      return true;

    } catch (error) {
      log.error('Failed to apply operation', {
        sessionId,
        filePath,
        operationId: operation.id,
        error
      });
      return false;
    }
  }

  // Update participant cursor position
  updateCursor(sessionId: string, participantId: string, cursor: { file: string; line: number; column: number }): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.id === participantId);
    if (participant) {
      participant.cursor = cursor;
      participant.lastSeen = new Date();

      this.broadcastToSession(sessionId, {
        type: 'cursor-updated',
        participantId,
        cursor,
        timestamp: new Date()
      }, [participantId]); // Exclude the participant who moved the cursor
    }
  }

  // Update participant selection
  updateSelection(sessionId: string, participantId: string, selection: any): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.id === participantId);
    if (participant) {
      participant.selection = selection;
      participant.lastSeen = new Date();

      this.broadcastToSession(sessionId, {
        type: 'selection-updated',
        participantId,
        selection,
        timestamp: new Date()
      }, [participantId]);
    }
  }

  // Lock a range for exclusive editing
  lockRange(sessionId: string, filePath: string, range: any, participantId: string, reason: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const fileSession = session.activeFiles.get(filePath);
    if (!fileSession) return false;

    // Check for overlapping locks
    const hasOverlap = fileSession.lockedRanges.some(lock => 
      this.rangesOverlap(range, { start: lock.start, end: lock.end })
    );

    if (hasOverlap) {
      log.warn('Lock request denied due to overlap', {
        sessionId,
        filePath,
        participantId
      });
      return false;
    }

    const lockedRange: LockedRange = {
      start: range.start,
      end: range.end,
      lockedBy: participantId,
      reason,
      timestamp: new Date()
    };

    fileSession.lockedRanges.push(lockedRange);

    this.broadcastToSession(sessionId, {
      type: 'range-locked',
      filePath,
      lockedRange,
      timestamp: new Date()
    });

    log.info('Range locked for exclusive editing', {
      sessionId,
      filePath,
      participantId,
      reason
    });

    return true;
  }

  // Release a locked range
  unlockRange(sessionId: string, filePath: string, participantId: string, rangeIndex: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const fileSession = session.activeFiles.get(filePath);
    if (!fileSession) return false;

    const lockedRange = fileSession.lockedRanges[rangeIndex];
    if (!lockedRange || lockedRange.lockedBy !== participantId) {
      return false;
    }

    fileSession.lockedRanges.splice(rangeIndex, 1);

    this.broadcastToSession(sessionId, {
      type: 'range-unlocked',
      filePath,
      rangeIndex,
      timestamp: new Date()
    });

    log.info('Range unlocked', {
      sessionId,
      filePath,
      participantId
    });

    return true;
  }

  // Add a comment to code
  addComment(sessionId: string, filePath: string, comment: Comment): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const fileSession = session.activeFiles.get(filePath);
    if (!fileSession) return false;

    comment.id = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    comment.timestamp = new Date();
    comment.resolved = false;
    comment.replies = [];

    fileSession.comments.push(comment);

    this.broadcastToSession(sessionId, {
      type: 'comment-added',
      filePath,
      comment,
      timestamp: new Date()
    });

    log.info('Comment added', {
      sessionId,
      filePath,
      commentId: comment.id,
      author: comment.author
    });

    return true;
  }

  // Resolve a comment
  resolveComment(sessionId: string, filePath: string, commentId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const fileSession = session.activeFiles.get(filePath);
    if (!fileSession) return false;

    const comment = fileSession.comments.find(c => c.id === commentId);
    if (!comment) return false;

    comment.resolved = true;

    this.broadcastToSession(sessionId, {
      type: 'comment-resolved',
      filePath,
      commentId,
      timestamp: new Date()
    });

    return true;
  }

  // End a collaborative session
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'ended';

    this.broadcastToSession(sessionId, {
      type: 'session-ended',
      timestamp: new Date()
    });

    // Generate analytics report
    const analytics = this.generateSessionAnalytics(session);
    
    log.info('Collaborative session ended', {
      sessionId,
      duration: analytics.duration,
      participantCount: analytics.participantCount,
      productivityScore: analytics.productivityScore
    });

    this.sessions.delete(sessionId);
  }

  // Generate team analytics
  private generateSessionAnalytics(session: CollaborativeSession): TeamAnalytics {
    const duration = new Date().getTime() - session.createdAt.getTime();
    const filesEdited = session.activeFiles.size;
    
    let totalOperations = 0;
    for (const fileSession of session.activeFiles.values()) {
      totalOperations += fileSession.operations.length;
    }

    const productivityScore = this.calculateProductivityScore(session);

    return {
      sessionId: session.id,
      duration,
      participantCount: session.participants.length,
      filesEdited,
      operationsCount: totalOperations,
      conflictsResolved: 0, // Would track actual conflicts
      productivityScore,
      collaborationMetrics: {
        simultaneousEditing: this.calculateSimultaneousEditing(session),
        communicationEvents: this.calculateCommunicationEvents(session),
        codeReviewInteractions: this.calculateCodeReviewInteractions(session),
        knowledgeSharing: this.calculateKnowledgeSharing(session)
      }
    };
  }

  private calculateProductivityScore(session: CollaborativeSession): number {
    // Complex algorithm to calculate team productivity
    const baseScore = 50;
    const participantBonus = session.participants.length * 5;
    const activityBonus = Math.min(30, session.activeFiles.size * 3);
    
    return Math.min(100, baseScore + participantBonus + activityBonus);
  }

  private calculateSimultaneousEditing(session: CollaborativeSession): number {
    // Count overlapping editing sessions
    return session.participants.filter(p => p.isTyping).length;
  }

  private calculateCommunicationEvents(session: CollaborativeSession): number {
    let totalComments = 0;
    for (const fileSession of session.activeFiles.values()) {
      totalComments += fileSession.comments.length;
    }
    return totalComments;
  }

  private calculateCodeReviewInteractions(session: CollaborativeSession): number {
    let totalInteractions = 0;
    for (const fileSession of session.activeFiles.values()) {
      totalInteractions += fileSession.comments.filter(c => c.resolved).length;
    }
    return totalInteractions;
  }

  private calculateKnowledgeSharing(session: CollaborativeSession): number {
    // Estimate knowledge sharing based on participant interactions
    return session.participants.length > 1 ? session.participants.length * 2 : 0;
  }

  // Helper methods
  private broadcastToSession(sessionId: string, message: any, excludeParticipants: string[] = []): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // In a real implementation, this would send WebSocket messages
    log.debug('Broadcasting to session', {
      sessionId,
      messageType: message.type,
      participantCount: session.participants.length - excludeParticipants.length
    });
  }

  private isOperationBlocked(operation: Operation, lockedRanges: LockedRange[]): boolean {
    return lockedRanges.some(lock => {
      const operationRange = {
        start: operation.position,
        end: {
          line: operation.position.line,
          column: operation.position.column + operation.content.length
        }
      };
      
      return this.rangesOverlap(operationRange, { start: lock.start, end: lock.end });
    });
  }

  private rangesOverlap(range1: any, range2: any): boolean {
    return !(
      (range1.end.line < range2.start.line) ||
      (range1.start.line > range2.end.line) ||
      (range1.end.line === range2.start.line && range1.end.column <= range2.start.column) ||
      (range1.start.line === range2.end.line && range1.start.column >= range2.end.column)
    );
  }

  private applyOperationToContent(content: string, operation: Operation): string {
    const lines = content.split('\n');
    const targetLine = lines[operation.position.line - 1];
    
    if (!targetLine) return content;

    switch (operation.type) {
      case 'insert':
        const before = targetLine.substring(0, operation.position.column);
        const after = targetLine.substring(operation.position.column);
        lines[operation.position.line - 1] = before + operation.content + after;
        break;
        
      case 'delete':
        const deleteEnd = operation.position.column + operation.content.length;
        const beforeDelete = targetLine.substring(0, operation.position.column);
        const afterDelete = targetLine.substring(deleteEnd);
        lines[operation.position.line - 1] = beforeDelete + afterDelete;
        break;
        
      case 'replace':
        const replaceEnd = operation.position.column + operation.content.length;
        const beforeReplace = targetLine.substring(0, operation.position.column);
        const afterReplace = targetLine.substring(replaceEnd);
        lines[operation.position.line - 1] = beforeReplace + operation.content + afterReplace;
        break;
    }

    return lines.join('\n');
  }

  private releaseParticipantLocks(session: CollaborativeSession, participantId: string): void {
    for (const fileSession of session.activeFiles.values()) {
      fileSession.lockedRanges = fileSession.lockedRanges.filter(
        lock => lock.lockedBy !== participantId
      );
      
      fileSession.activeEditors = fileSession.activeEditors.filter(
        editorId => editorId !== participantId
      );
    }
  }

  private analyzeTeamProductivity(): void {
    for (const session of this.sessions.values()) {
      if (session.status === 'active') {
        const analytics = this.generateSessionAnalytics(session);
        
        // Store analytics for reporting
        log.debug('Team productivity analysis', {
          sessionId: session.id,
          productivity: analytics.productivityScore,
          collaboration: analytics.collaborationMetrics
        });
      }
    }
  }

  // Public API methods
  getActiveSessions(): CollaborativeSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  getSessionById(sessionId: string): CollaborativeSession | undefined {
    return this.sessions.get(sessionId);
  }

  getParticipantSessions(participantId: string): CollaborativeSession[] {
    return Array.from(this.sessions.values()).filter(session =>
      session.participants.some(p => p.id === participantId)
    );
  }

  getCollaborationStats(): any {
    const activeSessions = this.getActiveSessions();
    const totalParticipants = activeSessions.reduce(
      (total, session) => total + session.participants.length, 0
    );

    return {
      activeSessions: activeSessions.length,
      totalParticipants,
      averageParticipantsPerSession: activeSessions.length > 0 ? 
        totalParticipants / activeSessions.length : 0,
      totalFiles: activeSessions.reduce(
        (total, session) => total + session.activeFiles.size, 0
      )
    };
  }
}

// Operational Transform implementation
class OperationalTransform {
  async transform(operation: Operation, existingOperations: Operation[]): Promise<Operation> {
    let transformedOp = { ...operation };
    
    // Apply transformations based on existing operations
    for (const existingOp of existingOperations) {
      if (existingOp.timestamp > operation.timestamp) {
        transformedOp = this.transformAgainstOperation(transformedOp, existingOp);
      }
    }
    
    return transformedOp;
  }

  private transformAgainstOperation(op1: Operation, op2: Operation): Operation {
    // Simplified operational transformation
    if (op1.position.line === op2.position.line) {
      if (op2.position.column <= op1.position.column) {
        return {
          ...op1,
          position: {
            ...op1.position,
            column: op1.position.column + (op2.type === 'insert' ? op2.content.length : -op2.content.length)
          }
        };
      }
    }
    
    return op1;
  }
}

// Conflict resolution system
class ConflictResolver {
  async resolveConflict(operations: Operation[]): Promise<Operation[]> {
    // Implement conflict resolution algorithm
    // This is a simplified version
    return operations.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

// Export singleton instance
export const collaborationEngine = CollaborationEngine.getInstance();
export default CollaborationEngine;