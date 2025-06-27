import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GitPullRequest, 
  ArrowLeft, 
  FileText, 
  Brain, 
  Loader2, 
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { pullRequestService } from '../services/pullRequestService';
import { PullRequest, PullRequestFile, PullRequestSummary } from '../types/pullRequest';
import PullRequestList from '../components/PullRequest/PullRequestList';
import PullRequestSummaryView from '../components/PullRequest/PullRequestSummaryView';
import PullRequestFileList from '../components/PullRequest/PullRequestFileList';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import AIModelSelector from '../components/CodeReview/AIModelSelector';
import toast from 'react-hot-toast';

const PullRequestReview: React.FC = () => {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const navigate = useNavigate();
  
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [prFiles, setPRFiles] = useState<PullRequestFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<PullRequestFile | null>(null);
  const [prSummary, setPRSummary] = useState<PullRequestSummary | null>(null);
  
  const [loadingPRs, setLoadingPRs] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  
  useEffect(() => {
    if (!owner || !repo) {
      navigate('/dashboard');
      return;
    }
    
    fetchPullRequests();
  }, [owner, repo]);
  
  const fetchPullRequests = async () => {
    setLoadingPRs(true);
    try {
      const prs = await pullRequestService.getPullRequests(owner!, repo!);
      setPullRequests(prs);
      
      // Select the first PR by default
      if (prs.length > 0 && !selectedPR) {
        setSelectedPR(prs[0]);
        fetchPRFiles(prs[0].number);
      }
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      toast.error('Failed to fetch pull requests');
    } finally {
      setLoadingPRs(false);
    }
  };
  
  const fetchPRFiles = async (prNumber: number) => {
    setLoadingFiles(true);
    setPRFiles([]);
    setSelectedFile(null);
    
    try {
      const files = await pullRequestService.getPullRequestFiles(owner!, repo!, prNumber);
      setPRFiles(files);
      
      // Select the first file by default
      if (files.length > 0) {
        setSelectedFile(files[0]);
      }
    } catch (error) {
      console.error('Error fetching PR files:', error);
      toast.error('Failed to fetch PR files');
    } finally {
      setLoadingFiles(false);
    }
  };
  
  const handleSelectPR = (pr: PullRequest) => {
    setSelectedPR(pr);
    setPRSummary(null);
    fetchPRFiles(pr.number);
  };
  
  const handleSelectFile = (file: PullRequestFile) => {
    setSelectedFile(file);
  };
  
  const handleGenerateSummary = async () => {
    if (!selectedPR) return;
    
    setGeneratingSummary(true);
    setLoadingSummary(true);
    
    try {
      const summary = await pullRequestService.generatePullRequestSummary(
        owner!,
        repo!,
        selectedPR.number,
        selectedModel
      );
      
      setPRSummary(summary);
      toast.success('PR summary generated successfully!');
    } catch (error) {
      console.error('Error generating PR summary:', error);
      toast.error('Failed to generate PR summary');
    } finally {
      setGeneratingSummary(false);
      setLoadingSummary(false);
    }
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={handleGoBack}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <GitPullRequest className="w-7 h-7 text-primary-600 dark:text-primary-400 mr-3" />
              Pull Request Review
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {owner}/{repo}
            </p>
          </div>
        </div>
        
        {selectedPR && (
          <div className="flex items-center space-x-3">
            <motion.a
              href={selectedPR.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on GitHub
            </motion.a>
            
            <motion.button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="flex items-center px-4 py-2 bg-gradient-ai hover:opacity-90 disabled:opacity-70 text-white font-medium rounded-lg transition-colors"
              whileHover={{ scale: generatingSummary ? 1 : 1.05 }}
              whileTap={{ scale: generatingSummary ? 1 : 0.95 }}
            >
              {generatingSummary ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze PR
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* AI Model Selector (only show when no summary is generated yet) */}
      {!prSummary && selectedPR && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-ai rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              AI Model Selection
              <motion.div
                className="ml-2"
                animate={{ 
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </motion.div>
            </h3>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Select an AI model to analyze this pull request. Different models have different capabilities and performance characteristics.
          </p>
          
          <div className="max-w-xl">
            <AIModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              codebaseSize={selectedPR.additions + selectedPR.deletions}
              fileCount={selectedPR.changedFiles}
            />
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pull Request List */}
        <div className="lg:col-span-1">
          <PullRequestList
            pullRequests={pullRequests}
            loading={loadingPRs}
            onSelectPullRequest={handleSelectPR}
            selectedPullRequest={selectedPR || undefined}
          />
        </div>

        {/* PR Summary or File List */}
        <div className="lg:col-span-2">
          {selectedPR && prSummary ? (
            <PullRequestSummaryView
              pullRequest={selectedPR}
              summary={prSummary}
              loading={loadingSummary}
            />
          ) : selectedPR ? (
            <div className="space-y-6">
              {/* PR Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedPR.title}
                  </h3>
                  <div className={`px-3 py-1 text-sm font-medium rounded-full ${
                    selectedPR.status === 'open' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                      : selectedPR.status === 'merged'
                      ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  }`}>
                    {selectedPR.status.charAt(0).toUpperCase() + selectedPR.status.slice(1)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={selectedPR.author.avatar} 
                      alt={selectedPR.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPR.author.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    #{selectedPR.number}
                  </span>
                </div>
                
                {selectedPR.description ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {selectedPR.description}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4 text-center">
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No description provided
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Files Changed</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedPR.changedFiles}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Commits</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedPR.commits}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Additions</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">+{selectedPR.additions}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Deletions</div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">-{selectedPR.deletions}</div>
                  </div>
                </div>
              </motion.div>

              {/* File List and Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PullRequestFileList
                  files={prFiles}
                  loading={loadingFiles}
                  onSelectFile={handleSelectFile}
                  selectedFile={selectedFile || undefined}
                />
                
                {selectedFile && selectedFile.content && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                        {selectedFile.filename}
                      </h3>
                    </div>
                    <div className="h-[400px] overflow-auto">
                      <CodeEditor
                        value={selectedFile.content}
                        language={selectedFile.language || 'text'}
                        height="100%"
                        readOnly
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <GitPullRequest className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Pull Request
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a pull request from the list to view details and generate an AI summary
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PullRequestReview;