import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitPullRequest, GitMerge, Clock, AlertCircle, ChevronRight, Search, Filter } from 'lucide-react';
import { PullRequest } from '../../types/pullRequest';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface PullRequestListProps {
  pullRequests: PullRequest[];
  loading: boolean;
  onSelectPullRequest: (pr: PullRequest) => void;
  selectedPullRequest?: PullRequest;
}

const PullRequestList: React.FC<PullRequestListProps> = ({
  pullRequests,
  loading,
  onSelectPullRequest,
  selectedPullRequest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPRs, setFilteredPRs] = useState<PullRequest[]>(pullRequests);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'merged' | 'closed'>('all');

  useEffect(() => {
    let filtered = pullRequests;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pr => pr.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pr => 
        pr.title.toLowerCase().includes(term) || 
        pr.description.toLowerCase().includes(term) ||
        pr.author.name.toLowerCase().includes(term) ||
        pr.number.toString().includes(term)
      );
    }
    
    setFilteredPRs(filtered);
  }, [pullRequests, searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <GitPullRequest className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'merged':
        return <GitMerge className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'closed':
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
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
            <GitPullRequest className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
            Pull Requests
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search PRs..."
                className="pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All PRs</option>
              <option value="open">Open</option>
              <option value="merged">Merged</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredPRs.length === 0 ? (
          <div className="p-8 text-center">
            <GitPullRequest className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No pull requests match your filters' 
                : 'No pull requests found'}
            </p>
          </div>
        ) : (
          filteredPRs.map((pr, index) => (
            <motion.div
              key={pr.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                selectedPullRequest?.id === pr.id ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500' : ''
              }`}
              onClick={() => onSelectPullRequest(pr)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(pr.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {pr.title}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                      #{pr.number}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>
                      {pr.author.name}
                    </span>
                    <span className="mx-1">•</span>
                    <span>
                      {formatDistanceToNow(pr.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center mt-2 gap-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full">
                      {pr.changedFiles} files
                    </span>
                    <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
                      +{pr.additions}
                    </span>
                    <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full">
                      -{pr.deletions}
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <motion.div
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default PullRequestList;