"use strict";
// import React from 'react';
// import Highlight from 'react-highlight';
// import '../styles/CodeEditor.css';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// interface CodeEditorProps {
//   code: string; 
//   onChange: (code: string) => void; 
//   isEditable: boolean; 
// }
// const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, isEditable }) => {
//   const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
//     onChange(event.target.value);
//   };
//   return (
//     <div className="code-editor">
//       {isEditable ? (
//         <textarea value={code} onChange={handleCodeChange} className="code-editor-textarea" />
//       ) : (
//         <Highlight className="javascript">{code}</Highlight>
//       )}
//     </div>
//   );
// };
// export default CodeEditor;
// CodeEditor.tsx
const react_1 = __importDefault(require("react"));
const react_highlight_1 = __importDefault(require("react-highlight"));
require("../styles/codeBlockEditor.css");
const CodeEditor = ({ code, onChange, isEditable }) => {
    const handleCodeChange = (event) => {
        onChange(event.target.value);
    };
    return (react_1.default.createElement("div", { className: "code-editor" }, isEditable ? (react_1.default.createElement("textarea", { value: code, onChange: handleCodeChange, className: "code-editor-textarea" })) : (react_1.default.createElement(react_highlight_1.default, { className: "javascript" }, code))));
};
exports.default = CodeEditor;
