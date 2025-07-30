import React, { useRef } from 'react';
import ReactQuill from 'react-quill';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange, placeholder }) => {
  const quillRef = useRef<ReactQuill>(null);

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      modules={{
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }],
          ['link', 'image'],
          ['clean']
        ]
      }}
    />
  );
};

export default QuillEditor; 