import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Folder, AlertCircle, CheckCircle, X, Code2, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCodebase } from '../../contexts/CodebaseContext';
import { FileService } from '../../services/fileService';
import { UploadProgress } from '../../types';
import toast from 'react-hot-toast';

const FileUpload: React.FC = () => {
  const { setCurrentCodebase } = useCodebase();
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileService = FileService.getInstance();

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;
    
    const file = files[0];
    setError(null);
    setUploadProgress({
      loaded: 0,
      total: 0,
      percentage: 0,
      status: 'Starting upload...',
    });

    try {
      const codebase = await fileService.processUpload(file, setUploadProgress);
      setCurrentCodebase(codebase);
      setUploadProgress(null);
      toast.success(`🎉 Successfully uploaded ${codebase.files.length} files!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(null);
      toast.error('Upload failed. Please try again.');
    }
  }, [fileService, setCurrentCodebase]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <motion.div 
          className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full mx-auto mb-4"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Code2 className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
          Upload Your Codebase
          <Sparkles className="w-6 h-6 text-yellow-500 ml-2" />
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Upload your project files for comprehensive AI-powered code review and improvement. 
          Supports ZIP archives, individual files, and multiple programming languages.
        </p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 mr-2" />
                <span className="text-error-700 dark:text-error-300">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploadProgress && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-6 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-primary-800 rounded-lg"
          >
            <div className="flex items-center mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Upload className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
              </motion.div>
              <span className="text-primary-700 dark:text-primary-300 font-medium">
                {uploadProgress.status}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress.percentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{uploadProgress.loaded} / {uploadProgress.total} files</span>
              <span>{Math.round(uploadProgress.percentage)}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 scale-105'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".zip,.tar,.gz,.py,.js,.ts,.jsx,.tsx,.java,.c,.cpp,.cs,.go,.rs,.php,.rb,.swift,.kt"
          onChange={handleChange}
          className="hidden"
        />

        <div className="space-y-6">
          <motion.div 
            className="flex justify-center"
            animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
          >
            <div className={`p-4 rounded-full ${
              dragActive 
                ? 'bg-gradient-to-r from-primary-500 to-purple-500' 
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <Upload className={`w-12 h-12 ${
                dragActive 
                  ? 'text-white' 
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
          </motion.div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {dragActive ? 'Drop your files here' : 'Choose files or drag and drop'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              Upload ZIP archives, individual code files, or entire project folders
            </p>
            
            <motion.button
              onClick={openFileDialog}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Folder className="w-6 h-6 mr-2" />
              Select Files
              <Sparkles className="w-5 h-5 ml-2" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">20+ Languages</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Python, JS, Java, C++, Go...</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Smart Analysis</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Security, performance, quality</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Lightning Fast</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Results in under 30 seconds</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Supported formats: ZIP, TAR, GZ archives and individual code files
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Maximum file size: 100MB • Secure processing • No data stored
        </p>
      </div>
    </div>
  );
};

export default FileUpload;