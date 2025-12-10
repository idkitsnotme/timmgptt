import React, { useState, useRef, useCallback } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { ImageAttachment } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string, images: ImageAttachment[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-expand
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) return;

      try {
        const base64 = await convertToBase64(file);
        // Remove header "data:image/xyz;base64,"
        const base64Data = base64.split(',')[1];
        setImages([...images, { data: base64Data, mimeType: file.type }]);
      } catch (err) {
        console.error("Error reading file", err);
      }
      // Reset input
      e.target.value = '';
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if ((!text.trim() && images.length === 0) || isLoading) return;
    
    onSendMessage(text, images);
    setText('');
    setImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="flex gap-3 mb-3 overflow-x-auto py-2 px-1">
          {images.map((img, idx) => (
            <div key={idx} className="relative group animate-fade-in">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img 
                  src={`data:${img.mimeType};base64,${img.data}`} 
                  alt="preview" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <button
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="relative flex items-end gap-2 bg-white dark:bg-gray-800 p-2 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all focus-within:ring-2 focus-within:ring-gemini-300 dark:focus-within:ring-gemini-700">
        
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-3 text-gray-500 hover:text-gemini-600 dark:text-gray-400 dark:hover:text-gemini-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
          title="Attach image"
        >
          <ImageIcon size={20} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          rows={1}
          disabled={isLoading}
          className="flex-1 max-h-40 bg-transparent border-none focus:ring-0 resize-none py-3 text-gray-800 dark:text-gray-100 placeholder-gray-400 leading-relaxed scrollbar-hide"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!text.trim() && images.length === 0) || isLoading}
          className={`p-3 rounded-full flex items-center justify-center transition-all duration-200 ${
            (!text.trim() && images.length === 0) || isLoading
              ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-gemini-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
          }`}
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={text.trim() || images.length > 0 ? "ml-0.5" : ""} />}
        </button>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-[10px] text-gray-400">
          TimmGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default InputArea;