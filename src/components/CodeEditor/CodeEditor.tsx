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
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language,
  onChange,
  height = '400px',
  readOnly = false,
  showDiff = false,
  originalValue,
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

  if (showDiff && originalValue) {
    return (
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
    );
  }

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={onChange}
      theme={isDark ? 'vs-dark' : 'vs-light'}
      options={editorOptions}
    />
  );
};

export default CodeEditor;