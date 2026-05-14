import React from 'react';
import AceEditor from 'react-ace';

// --- FIX LỖI ---
// Import ace-builds và cấu hình đường dẫn để Webpack có thể tìm thấy các file worker (theme, mode, etc.)
import ace from 'ace-builds';
import 'ace-builds/webpack-resolver';

// Import các mode, theme và extension cần thiết cho Ace Editor
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-monokai'; // Một theme tối phổ biến, dễ nhìn
import 'ace-builds/src-noconflict/ext-language_tools';

/**
 * Component Trình soạn thảo code (Code Editor) sử dụng React Ace
 * Tích hợp với Form của Ant Design.
 * @param {string} value - Giá trị HTML từ Form
 * @param {function} onChange - Hàm callback khi nội dung thay đổi
 */
const CodeEditor = ({ value, onChange }) => {
  return (
    <AceEditor
      mode="html"
      theme="monokai"
      onChange={onChange}
      value={value}
      name="htmlDescriptionEditor"
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
      fontSize={14}
      showPrintMargin={false}
      width="100%"
      height="425px" // Tăng chiều cao để phù hợp với TextArea cũ
    />
  );
};

export default CodeEditor;