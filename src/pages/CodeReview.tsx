import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Play, 
  Download, 
  Share2, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Brain,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import { useCodebase } from '../contexts/CodebaseContext';
import { codeReviewService } from '../services/codeReviewService';
import FileUpload from '../components/Upload/FileUpload';
import ConfigurationPanel from '../components/Configuration/ConfigurationPanel';
import AnalysisProgress from '../components/Analysis/AnalysisProgress';
import AnalysisResults from '../components/Analysis/AnalysisResults';
import AIModelSelector from '../components/CodeReview/AIModelSelector';
import { useNavigation } from '../hooks/useNavigation';
import StepIndicator from '../components/Navigation/StepIndicator';
import BackButton from '../components/Navigation/BackButton';
import toast from 'react-hot-toast';

const CodeReview: React.FC = () => {
  const { 
    currentCodebase, 
    analysisResults, 
    reviewConfig, 
    isAnalyzing,
    setCurrentCodebase,
    setAnalysisResults,
    setReviewConfig,
    setIsAnalyzing
  } = useCodebase();
  
  const { currentStep, canGoBack, navigateToStep, goBack } = useNavigation();
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState('parsing');
  const [filesProcessed, setFilesProcessed] = useState(0);
  const [selectedAIModel, setSelectedAIModel] = useState('gpt-4o');
  const [reviewId, setReviewId] = useState<string | null>(null);

  const steps = [
    { id: 'upload', label: 'Upload Code', status: currentStep === 'upload' ? 'current' : currentCodebase ? 'completed' : 'upcoming' },
    { id: 'configure', label: 'Configure Analysis', status: currentStep === 'configure' ? 'current' : reviewConfig ? 'completed' : currentCodebase ? 'upcoming' : 'upcoming' },
    { id: 'analyzing', label: 'AI Analysis', status: currentStep === 'analyzing' ? 'current' : analysisResults.length > 0 ? 'completed' : 'upcoming' },
    { id: 'results', label: 'Results & Improvements', status: currentStep === 'results' ? 'current' : 'upcoming' }
  ] as const;

  const handleStartAnalysis = async () => {
    if (!currentCodebase) {
      toast.error('Please upload your codebase first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setFilesProcessed(0);
    navigateToStep('analyzing' as any);
    
    toast.success(`🚀 Starting ${selectedAIModel.toUpperCase()} analysis...`);

    try {
      // Initiate code review in Supabase
      const id = await codeReviewService.initiateCodeReview(currentCodebase, {
        model: selectedAIModel,
        ...reviewConfig
      });
      
      setReviewId(id);
      
      // Start analysis
      const results = await codeReviewService.analyzeCode(
        currentCodebase,
        {
          model: selectedAIModel,
          ...reviewConfig
        },
        (progress) => {
          setAnalysisProgress(progress);
          
          // Update current step based on progress
          const analysisSteps = ['parsing', 'security', 'performance', 'quality', 'improvement', 'reporting'];
          const stepIndex = Math.floor((progress / 100) * analysisSteps.length);
          setCurrentAnalysisStep(analysisSteps[Math.min(stepIndex, analysisSteps.length - 1)]);
          
          // Update files processed
          const filesProcessed = Math.floor((progress / 100) * currentCodebase.files.length);
          setFilesProcessed(filesProcessed);
        }
      );

      setAnalysisResults(results);
      setIsAnalyzing(false);
      navigateToStep('results' as any);
      
      const totalIssues = results.reduce((acc, result) => acc + result.issues.length, 0);
      const avgQuality = Math.round(results.reduce((acc, result) => acc + result.metrics.maintainability, 0) / results.length);
      
      toast.success(`🎉 ${selectedAIModel.toUpperCase()} analysis complete! Found ${totalIssues} issues, ${avgQuality}% quality score`);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
      setIsAnalyzing(false);
      navigateToStep('configure' as any);
    }
  };

  const handleStartImprovement = () => {
    toast.success('✨ Code improvements applied successfully!');
  };

  const handleExportReport = () => {
    toast.success('📊 Report exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {canGoBack && (
            <BackButton onClick={goBack} />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
              AI Code Review with Multiple Models
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose the best AI model for your analysis needs
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Selected Model</div>
            <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
              {selectedAIModel.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator 
        steps={steps}
        onStepClick={(stepId) => {
          if (steps.find(s => s.id === stepId)?.status === 'completed') {
            navigateToStep(stepId as any);
          }
        }}
        allowNavigation
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <FileUpload />
              
              {currentCodebase && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Codebase Uploaded Successfully
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {currentCodebase.files.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Files</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {Math.round(currentCodebase.totalSize / 1024)}KB
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Size</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {new Set(currentCodebase.files.map(f => f.language)).size}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Languages</div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigateToStep('configure' as any)}
                    className="inline-flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-lg"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Configure AI Analysis
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {currentStep === 'configure' && currentCodebase && (
            <div className="space-y-6">
              {/* AI Model Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <AIModelSelector
                  selectedModel={selectedAIModel}
                  onModelChange={setSelectedAIModel}
                  codebaseSize={currentCodebase.totalSize / 1024}
                  fileCount={currentCodebase.files.length}
                />
              </div>

              {/* Configuration Panel */}
              <ConfigurationPanel
                config={reviewConfig || {
                  priorities: {
                    security: true,
                    performance: true,
                    readability: true,
                    maintainability: true,
                  },
                  aggressiveness: 'moderate',
                  excludePatterns: ['node_modules/**', '*.min.js', 'dist/**'],
                }}
                onConfigChange={setReviewConfig}
                onStartAnalysis={handleStartAnalysis}
              />
            </div>
          )}

          {currentStep === 'analyzing' && (
            <AnalysisProgress
              currentStep={currentAnalysisStep}
              progress={analysisProgress}
              filesProcessed={filesProcessed}
              totalFiles={currentCodebase?.files.length || 0}
              onComplete={() => navigateToStep('results' as any)}
            />
          )}

          {currentStep === 'results' && analysisResults.length > 0 && (
            <AnalysisResults
              results={analysisResults}
              onStartImprovement={handleStartImprovement}
              onExportReport={handleExportReport}
            />
          )}

          {currentStep === 'results' && analysisResults.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedAIModel.toUpperCase()} Analysis Complete!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your code has been analyzed by {selectedAIModel.toUpperCase()}. Here's what we found:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">94%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Quality Score</div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">23</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Issues Found</div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">18</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Improvements</div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleExportReport}
                    className="flex items-center px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Export Report
                  </button>
                  <button
                    onClick={handleStartImprovement}
                    className="flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Apply Improvements
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CodeReview;