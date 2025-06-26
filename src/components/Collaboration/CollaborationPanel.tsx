import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, X, Send, UserPlus, Share2, Copy, Check } from 'lucide-react';
import { useCollaboration } from '../../contexts/CollaborationContext';
import { useAuth } from '../Auth/AuthProvider';
import toast from 'react-hot-toast';

interface CollaborationPanelProps {
  fileId: string;
  onClose: () => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ fileId, onClose }) => {
  const { user } = useAuth();
  const { 
    isConnected, 
    isCollaborating, 
    collaborators, 
    startCollaboration, 
    stopCollaboration,
    getComments,
    addComment,
    resolveComment
  } = useCollaboration();
  
  const [activeTab, setActiveTab] = useState<'collaborators' | 'comments'>('collaborators');
  const [newComment, setNewComment] = useState('');
  const [commentLine, setCommentLine] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);
  
  const comments = getComments(fileId);

  const handleStartCollaboration = async () => {
    await startCollaboration(fileId);
  };

  const handleStopCollaboration = () => {
    stopCollaboration();
  };

  const handleAddComment = () => {
    if (!newComment.trim() || commentLine === null) return;
    
    addComment(fileId, commentLine, newComment);
    setNewComment('');
    setCommentLine(null);
  };

  const handleResolveComment = (commentId: string) => {
    resolveComment(commentId);
  };

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;
    
    // In a real implementation, this would send an invitation
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  const handleCopyLink = () => {
    // Generate a shareable link
    const shareableLink = `${window.location.origin}/review?file=${fileId}&session=${encodeURIComponent(window.location.pathname)}`;
    
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    toast.success('Collaboration link copied to clipboard');
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-40 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Users className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
          Collaboration
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {!isCollaborating ? (
            <motion.button
              onClick={handleStartCollaboration}
              className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start
            </motion.button>
          ) : (
            <motion.button
              onClick={handleStopCollaboration}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Stop
            </motion.button>
          )}
        </div>

        {isCollaborating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Share this session:</span>
              <motion.button
                onClick={handleCopyLink}
                className="flex items-center text-xs text-primary-600 dark:text-primary-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </motion.button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Invite by email"
                className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <motion.button
                onClick={handleInviteUser}
                className="p-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('collaborators')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'collaborators'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            <Users className="w-4 h-4 mr-1" />
            Collaborators
          </div>
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'comments'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            <MessageSquare className="w-4 h-4 mr-1" />
            Comments
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'collaborators' && (
            <motion.div
              key="collaborators"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Active Users ({collaborators.length + (isCollaborating ? 1 : 0)})
              </h4>
              
              <div className="space-y-3">
                {isCollaborating && user && (
                  <div className="flex items-center p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium mr-3">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name || user.email} (You)
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                )}
                
                {collaborators.map((collaborator) => (
                  <div 
                    key={collaborator.id}
                    className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium mr-3"
                      style={{ backgroundColor: collaborator.color }}
                    >
                      {collaborator.name ? collaborator.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {collaborator.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {collaborator.cursor 
                          ? `Line ${collaborator.cursor.line}, Column ${collaborator.cursor.column}` 
                          : 'Viewing'}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                ))}
                
                {isCollaborating && collaborators.length === 0 && (
                  <div className="text-center py-6">
                    <Share2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No other collaborators yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Share the link to invite others
                    </p>
                  </div>
                )}
                
                {!isCollaborating && (
                  <div className="text-center py-6">
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Start collaboration to see active users
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'comments' && (
            <motion.div
              key="comments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Comments ({comments.length})
              </h4>
              
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div 
                    key={comment.id}
                    className={`p-3 rounded-lg border ${
                      comment.resolved
                        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    }`}
                  >
                    <div className="flex items-start mb-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white font-medium mr-2 flex-shrink-0"
                        style={{ backgroundColor: comment.author.id === user?.id ? '#3B82F6' : '#F59E0B' }}
                      >
                        {comment.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">
                            {comment.author.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Line {comment.line}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {comment.content}
                    </p>
                    
                    {!comment.resolved ? (
                      <div className="flex justify-end">
                        <motion.button
                          onClick={() => handleResolveComment(comment.id)}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Resolve
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end">
                        <Check className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Resolved by {comment.resolvedBy?.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <div className="text-center py-6">
                    <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No comments yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Add a comment to start a discussion
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Comment */}
      {activeTab === 'comments' && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="number"
              value={commentLine !== null ? commentLine : ''}
              onChange={(e) => setCommentLine(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Line #"
              className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <motion.button
              onClick={handleAddComment}
              disabled={!newComment.trim() || commentLine === null}
              className="p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CollaborationPanel;