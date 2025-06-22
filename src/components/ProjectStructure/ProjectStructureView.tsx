import React from 'react';
import { Folder, File, Package, Settings, TestTube, Code2 } from 'lucide-react';
import { ProjectStructure } from '../../services/projectAnalyzer';

interface ProjectStructureViewProps {
  structure: ProjectStructure;
}

const ProjectStructureView: React.FC<ProjectStructureViewProps> = ({ structure }) => {
  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'web':
        return <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'api':
        return <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'library':
        return <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'cli':
        return <File className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <Folder className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case 'web':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'api':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'library':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'cli':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Project Structure Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive analysis of your project's architecture and dependencies
        </p>
      </div>

      {/* Project Overview */}
      <div className={`p-6 rounded-xl border-2 ${getProjectTypeColor(structure.type)}`}>
        <div className="flex items-center space-x-4 mb-4">
          {getProjectTypeIcon(structure.type)}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
              {structure.type} Project
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Primary Language: {structure.language}
              {structure.framework && ` • Framework: ${structure.framework}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {structure.dependencies.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dependencies</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {structure.entryPoints.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Entry Points</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {structure.testFiles.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Test Files</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {structure.configFiles.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Config Files</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dependencies */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Dependencies ({structure.dependencies.length})
            </h3>
          </div>
          <div className="p-6 max-h-64 overflow-y-auto">
            {structure.dependencies.length > 0 ? (
              <div className="space-y-2">
                {structure.dependencies.map((dep, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{dep.name}</span>
                      {dep.version && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          {dep.version}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      dep.type === 'production' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : dep.type === 'development'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                    }`}>
                      {dep.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No dependencies detected
              </p>
            )}
          </div>
        </div>

        {/* Entry Points */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Code2 className="w-5 h-5 mr-2" />
              Entry Points ({structure.entryPoints.length})
            </h3>
          </div>
          <div className="p-6 max-h-64 overflow-y-auto">
            {structure.entryPoints.length > 0 ? (
              <div className="space-y-2">
                {structure.entryPoints.map((entry, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <File className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{entry}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No entry points detected
              </p>
            )}
          </div>
        </div>

        {/* Test Files */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TestTube className="w-5 h-5 mr-2" />
              Test Files ({structure.testFiles.length})
            </h3>
          </div>
          <div className="p-6 max-h-64 overflow-y-auto">
            {structure.testFiles.length > 0 ? (
              <div className="space-y-2">
                {structure.testFiles.map((test, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <TestTube className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{test}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No test files detected
              </p>
            )}
          </div>
        </div>

        {/* Configuration Files */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Config Files ({structure.configFiles.length})
            </h3>
          </div>
          <div className="p-6 max-h-64 overflow-y-auto">
            {structure.configFiles.length > 0 ? (
              <div className="space-y-2">
                {structure.configFiles.map((config, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <Settings className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{config}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No configuration files detected
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Build System Info */}
      {(structure.packageManager || structure.buildSystem) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Build Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {structure.packageManager && (
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Package Manager</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{structure.packageManager}</p>
                </div>
              </div>
            )}
            {structure.buildSystem && (
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Build System</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{structure.buildSystem}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStructureView;