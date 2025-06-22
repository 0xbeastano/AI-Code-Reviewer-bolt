import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock, Play } from 'lucide-react';
import { ValidationResult } from '../../services/validationService';

interface ValidationResultsProps {
  validationResult: ValidationResult;
  onRetry?: () => void;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({
  validationResult,
  onRetry
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'skipped':
        return <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      default:
        return <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'skipped':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'syntax':
      case 'runtime':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'logic':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'dependency':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'performance':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'style':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'compatibility':
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };

  const passedTests = validationResult.testResults.filter(test => test.status === 'passed').length;
  const failedTests = validationResult.testResults.filter(test => test.status === 'failed').length;
  const totalTests = validationResult.testResults.length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Overall Status */}
      <div className={`p-6 rounded-xl border-2 ${
        validationResult.isValid 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center space-x-3">
          {validationResult.isValid ? (
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          )}
          <div>
            <h3 className={`text-xl font-bold ${
              validationResult.isValid 
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              {validationResult.isValid ? 'Validation Passed' : 'Validation Failed'}
            </h3>
            <p className={`text-sm ${
              validationResult.isValid 
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {validationResult.isValid 
                ? 'All tests passed successfully. The improved code is ready for use.'
                : `${validationResult.errors.length} errors and ${validationResult.warnings.length} warnings found.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Test Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Passed</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{passedTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{failedTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalTests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {validationResult.errors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              Errors ({validationResult.errors.length})
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {validationResult.errors.map((error, index) => (
              <div key={index} className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(error.type)}`}>
                        {error.type.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{error.file}</span>
                      {error.line && (
                        <span className="text-sm text-gray-500 dark:text-gray-500">Line {error.line}</span>
                      )}
                    </div>
                    <p className="text-sm text-red-800 dark:text-red-200">{error.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {validationResult.warnings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              Warnings ({validationResult.warnings.length})
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {validationResult.warnings.map((warning, index) => (
              <div key={index} className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(warning.type)}`}>
                        {warning.type.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{warning.file}</span>
                      {warning.line && (
                        <span className="text-sm text-gray-500 dark:text-gray-500">Line {warning.line}</span>
                      )}
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{warning.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results */}
      {validationResult.testResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Test Results ({validationResult.testResults.length})
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {validationResult.testResults.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{test.name}</p>
                    {test.message && (
                      <p className={`text-sm ${getStatusColor(test.status)}`}>{test.message}</p>
                    )}
                  </div>
                </div>
                {test.duration && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{test.duration}ms</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retry Button */}
      {!validationResult.isValid && onRetry && (
        <div className="text-center">
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Retry Validation
          </button>
        </div>
      )}
    </div>
  );
};

export default ValidationResults;