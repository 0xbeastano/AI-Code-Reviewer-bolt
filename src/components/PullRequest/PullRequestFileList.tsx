import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Minus, Edit, Trash, Search, Filter, Code } from 'lucide-react';
import { PullRequestFile } from '../../types/pullRequest';

interface PullRequestFileListProps {
  files: PullRequestFile[];
  loading: boolean;
  onSelectFile: (file: PullRequestFile) => void;
  selectedFile?: PullRequestFile;
}

const PullRequestFileList: React.FC<PullRequestFileListProps> = ({
  files,
  loading,
  onSelectFile,
  selectedFile
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'added' | 'modified' | 'removed'>('all');
  
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchTerm === '' || file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || file.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'modified':
        return <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'removed':
        return <Trash className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getLanguageIcon = (language: string) => {
    return <Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop() || '';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
            Changed Files
          </h3>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Files</option>
            <option value="added">Added</option>
            <option value="modified">Modified</option>
            <option value="removed">Removed</option>
          </select>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No files match your filters' 
                : 'No files found'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.filename}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                  selectedFile?.filename === file.filename ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500' : ''
                }`}
                onClick={() => onSelectFile(file)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getStatusIcon(file.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {file.filename.split('/').pop()}
                        </h4>
                        <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          {getFileExtension(file.filename)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {file.filename}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
                      +{file.additions}
                    </span>
                    <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full">
                      -{file.deletions}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PullRequestFileList;