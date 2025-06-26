import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Check } from 'lucide-react';
import { useCollaboration } from '../../contexts/CollaborationContext';
import { useAuth } from '../Auth/AuthProvider';

interface CommentWidgetProps {
  fileId: string;
  line: number;
  position: {
    top: number;
  };
}

const CommentWidget: React.FC<CommentWidgetProps> = ({
  fileId,
  line,
  position
}) => {
  const { user } = useAuth();
  const { getComments, addComment, resolveComment } = useCollaboration();
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  const comments = getComments(fileId).filter(comment => comment.line === line);
  const hasUnresolvedComments = comments.some(comment => !comment.resolved);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    addComment(fileId, line, newComment);
    setNewComment('');
  };

  const handleResolveComment = (commentId: string) => {
    resolveComment(commentId);
  };

  return (
    <div
      className="absolute right-0 z-40"
      style={{ top: `${position.top}px` }}
    >
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            hasUnresolvedComments
              ? 'bg-yellow-500 text-white'
              : comments.length > 0
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageSquare className="w-3 h-3" />
        </motion.button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 10 }}
              className="absolute right-8 top-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Line {line} Comments
                </h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto p-3 space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                    No comments yet
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className={`p-2 rounded border ${
                        comment.resolved
                          ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      }`}
                    >
                      <div className="flex items-start mb-1">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white font-medium mr-2 flex-shrink-0 text-xs"
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
                              {new Date(comment.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-700 dark:text-gray-300 ml-7 mb-1">
                        {comment.content}
                      </p>
                      
                      {!comment.resolved && (
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
                      )}
                      
                      {comment.resolved && (
                        <div className="flex items-center justify-end">
                          <Check className="w-3 h-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Resolved
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <motion.button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="p-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommentWidget;