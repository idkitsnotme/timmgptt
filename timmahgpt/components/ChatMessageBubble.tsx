import React from 'react';
import { Bot, User, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
          isUser 
            ? 'bg-gray-900 text-white' 
            : isError 
              ? 'bg-red-100 text-red-600'
              : 'bg-gradient-to-br from-gemini-500 to-purple-600 text-white'
        }`}>
          {isUser ? <User size={16} /> : isError ? <AlertCircle size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col gap-1 min-w-[120px]`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm border ${
            isError
              ? 'bg-red-50 border-red-200 text-red-800 rounded-tl-none'
              : isUser
                ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tr-none'
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
          }`}>
            
            {/* Attached Images */}
            {message.images && message.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {message.images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img 
                      src={`data:image/jpeg;base64,${img}`} 
                      alt="User attachment" 
                      className="max-h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Text Content */}
            <div className={`${isUser ? '' : 'min-h-[20px]'}`}>
              {isUser ? (
                <div className="whitespace-pre-wrap">{message.text}</div>
              ) : (
                <MarkdownRenderer content={message.text} />
              )}
            </div>
            
          </div>
          
          <span className={`text-[10px] text-gray-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
             {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;