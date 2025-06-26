import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useCollaboration } from '../../contexts/CollaborationContext';

interface CollaborationButtonProps {
  onClick: () => void;
}

const CollaborationButton: React.FC<CollaborationButtonProps> = ({ onClick }) => {
  const { isCollaborating, collaborators } = useCollaboration();
  
  const activeCollaborators = collaborators.length + (isCollaborating ? 1 : 0);

  return (
    <motion.button
      onClick={onClick}
      className={`relative p-2 rounded-lg ${
        isCollaborating
          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Collaboration"
    >
      <Users className="w-5 h-5" />
      
      {isCollaborating && activeCollaborators > 1 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
        >
          {activeCollaborators}
        </motion.div>
      )}
    </motion.button>
  );
};

export default CollaborationButton;