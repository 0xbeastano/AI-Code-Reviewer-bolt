import React from 'react';
import { Editor } from '@monaco-editor/react';
import { useTheme } from '../../contexts/ThemeContext';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  height?: string;
  readOnly?: boolean;
  showDiff?: boolean;
  originalValue?: string;
  title?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language,
  onChange,
  height = '400px',
  readOnly = false,
  showDiff = false,
  originalValue,
  title
}) => {
  const { isDark } = useTheme();

  const editorOptions = {
    minimap: { enabled: height !== '80px' },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on' as const,
    readOnly,
    automaticLayout: true,
    wordWrap: 'on' as const,
    theme: isDark ? 'vs-dark' : 'vs-light',
  };

  return (
    <div className="flex flex-col h-full">
      {title && (
        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
          {title}
        </div>
      )}
      {showDiff && originalValue ? (
        <Editor
          height={height}
          language={language}
          original={originalValue}
          modified={value}
          theme={isDark ? 'vs-dark' : 'vs-light'}
          options={{
            ...editorOptions,
            enableSplitViewResizing: false,
            renderSideBySide: true,
          }}
        />
      ) : (
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={onChange}
          theme={isDark ? 'vs-dark' : 'vs-light'}
          options={editorOptions}
        />
      )}
    </div>
  );
};

export default CodeEditor;