import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCollaboration } from '../../contexts/CollaborationContext';
import CollaborativeCursor from '../Collaboration/CollaborativeCursor';
import CommentWidget from '../Collaboration/CommentWidget';

interface CollaborativeCodeEditorProps {
  value: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  height?: string;
  readOnly?: boolean;
  fileId: string;
  title?: string;
}

// Define cursor position type outside the component
interface CursorPosition {
  left: number;
  top: number;
}

const CollaborativeCodeEditor: React.FC<CollaborativeCodeEditorProps> = ({
  value,
  language,
  onChange,
  height = '400px',
  readOnly = false,
  fileId,
  title
}) => {
  const { isDark } = useTheme();
  const editorRef = useRef<any>(null);
  const { 
    isCollaborating, 
    collaborators, 
    setupMonacoBinding,
    getComments
  } = useCollaboration();
  
  const [lineHeight, setLineHeight] = useState(19); // Default line height
  const [commentLines, setCommentLines] = useState<number[]>([]);
  
  // Get comments for this file
  const comments = getComments(fileId);
  
  // Update comment lines when comments change
  useEffect(() => {
    const lines = comments
      .filter(comment => !comment.resolved)
      .map(comment => comment.line);
    
    setCommentLines([...new Set(lines)]);
  }, [comments]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Get the line height from the editor
    setLineHeight(editor.getOption(monaco.editor.EditorOption.lineHeight));
    
    // Set up collaboration if active
    if (isCollaborating) {
      setupMonacoBinding(editor, fileId);
    }
    
    // Set up cursor position tracking for collaboration
    editor.onDidChangeCursorPosition((e: any) => {
      if (!isCollaborating) return;
      
      const position = e.position;
      const awareness = editor._yMonacoBinding?.awareness;
      
      if (awareness) {
        const currentState = awareness.getLocalState() || {};
        awareness.setLocalState({
          ...currentState,
          cursor: {
            line: position.lineNumber,
            column: position.column
          }
        });
      }
    });
    
    // Set up selection tracking for collaboration
    editor.onDidChangeCursorSelection((e: any) => {
      if (!isCollaborating) return;
      
      const selection = e.selection;
      const awareness = editor._yMonacoBinding?.awareness;
      
      if (awareness && selection) {
        const currentState = awareness.getLocalState() || {};
        awareness.setLocalState({
          ...currentState,
          selection: {
            startLine: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLine: selection.endLineNumber,
            endColumn: selection.endColumn
          }
        });
      }
    });
  };

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

  // Calculate positions for comment widgets
  const getCommentPosition = (line: number): { top: number } => {
    if (!editorRef.current) return { top: 0 };
    
    const lineTop = line * lineHeight;
    return { top: lineTop };
  };

  return (
    <div className="flex flex-col h-full relative">
      {title && (
        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
          {title}
        </div>
      )}
      
      <div className="relative flex-1">
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={onChange}
          theme={isDark ? 'vs-dark' : 'vs-light'}
          options={editorOptions}
          onMount={handleEditorDidMount}
        />
        
        {/* Collaborative cursors */}
        {isCollaborating && collaborators.map((collaborator) => (
          collaborator.cursor && (
            <CollaborativeCursor
              key={collaborator.id}
              name={collaborator.name}
              color={collaborator.color}
              position={{
                left: 0, // This would need to be calculated based on the editor's character width
                top: (collaborator.cursor.line - 1) * lineHeight
              }}
            />
          )
        ))}
        
        {/* Comment widgets */}
        {commentLines.map((line) => (
          <CommentWidget
            key={`comment-${fileId}-${line}`}
            fileId={fileId}
            line={line}
            position={getCommentPosition(line)}
          />
        ))}
      </div>
    </div>
  );
};

export default CollaborativeCodeEditor;