

import React from 'react';
import Highlight from 'react-highlight';
import '../styles/codeBlockEditor.css';
interface CodeEditorProps {
  code: string; 
  onChange: (code: string) => void; 
  isEditable: boolean; 
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, isEditable }) => {
  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="code-editor">
      {isEditable ? (
        <textarea value={code} onChange={handleCodeChange} className="code-editor-textarea" />
      ) : (
        <Highlight className="javascript">{code}</Highlight>
      )}
    </div>
  );
};

export default CodeEditor;
