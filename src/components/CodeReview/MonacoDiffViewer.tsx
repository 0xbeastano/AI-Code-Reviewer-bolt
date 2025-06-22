import React, { useRef, useEffect, useState } from 'react';
import { Editor, DiffEditor } from '@monaco-editor/react';
import { useTheme } from '../../contexts/ThemeContext';
import { Maximize2, Minimize2, Download, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MonacoDiffViewerProps {
  original: string;
  modified: string;
  language: string;
  filename: string;
  onAcceptChange?: () => void;
  onRejectChange?: () => void;
  readOnly?: boolean;
}

const MonacoDiffViewer: React.FC<MonacoDiffViewerProps> = ({
  original,
  modified,
  language,
  filename,
  onAcceptChange,
  onRejectChange,
  readOnly = false,
}) => {
  const { isDark } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(modified);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([modified], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`
        bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
        ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-sm font-medium text-gray-900 dark:text-white">
            {filename}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Copy modified code"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Diff Editor */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}>
        <DiffEditor
          original={original}
          modified={modified}
          language={language}
          theme={isDark ? 'vs-dark' : 'vs-light'}
          options={{
            readOnly,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            renderSideBySide: true,
            enableSplitViewResizing: true,
            renderWhitespace: 'boundary',
            wordWrap: 'on',
            diffWordWrap: 'on',
            ignoreTrimWhitespace: false,
            renderIndicators: true,
            originalEditable: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Action Buttons */}
      {!readOnly && (onAcceptChange || onRejectChange) && (
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          {onRejectChange && (
            <motion.button
              onClick={onRejectChange}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reject Changes
            </motion.button>
          )}
          
          {onAcceptChange && (
            <motion.button
              onClick={onAcceptChange}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Accept Changes
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default MonacoDiffViewer;