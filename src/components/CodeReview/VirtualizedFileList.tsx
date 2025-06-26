import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { AnalysisResult } from '../../types';

interface VirtualizedFileListProps {
  files: AnalysisResult[];
  selectedFileId: string | undefined;
  onSelectFile: (file: AnalysisResult) => void;
}

export const VirtualizedFileList: React.FC<VirtualizedFileListProps> = ({
  files,
  selectedFileId,
  onSelectFile
}) => {
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const file = files[index];
    const isSelected = selectedFileId === file.fileId;
    
    return (
      <motion.button
        key={file.fileId}
        style={style}
        onClick={() => onSelectFile(file)}
        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
          isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
        }`}
        whileHover={{ x: 4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file.filePath.split('/').pop()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {file.issues.length > 0 && (
              <motion.span 
                className="px-2 py-1 text-xs font-medium rounded bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400"
                whileHover={{ scale: 1.1 }}
              >
                {file.issues.length}
              </motion.span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
          {file.filePath}
        </p>
      </motion.button>
    );
  }, [files, selectedFileId, onSelectFile]);

  return (
    <div className="h-full">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={files.length}
            itemSize={72} // Adjust based on your row height
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};