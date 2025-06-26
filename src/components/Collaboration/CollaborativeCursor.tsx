import React from 'react';
import { motion } from 'framer-motion';

interface CollaborativeCursorProps {
  name: string;
  color: string;
  position: {
    left: number;
    top: number;
  };
}

const CollaborativeCursor: React.FC<CollaborativeCursorProps> = ({
  name,
  color,
  position
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      style={{
        left: position.left,
        top: position.top
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative">
        <div
          className="w-[2px] h-[18px] absolute"
          style={{ backgroundColor: color }}
        />
        <motion.div
          className="absolute top-0 left-0 px-2 py-1 text-xs text-white rounded whitespace-nowrap"
          style={{ backgroundColor: color }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: -24 }}
        >
          {name}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CollaborativeCursor;