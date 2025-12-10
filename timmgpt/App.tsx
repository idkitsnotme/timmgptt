import React, { useState, useEffect, useRef } from 'react';
import { GenerateContentResponse } from '@google/genai';
import { sendMessageStream, resetChat } from './services/geminiService';
import ChatMessageBubble from './components/ChatMessageBubble';
import InputArea from './components/InputArea';
import { ChatMessage, ImageAttachment } from './types';
import { Sparkles, Trash2, Sun, Moon, Github } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize theme
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Update HTML class for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = async (text: string, images: ImageAttachment[]) => {
    if (!text.trim() && images.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
      images: images.map(i => i.data),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create a placeholder for the bot response
      const botMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          role: 'model',
          text: '', // Start empty
          timestamp: Date.now(),
        },
      ]);

      const stream = await sendMessageStream(text, images);
      
      setIsLoading(false);
      setIsStreaming(true);

      let fullText = '';
      
      for await (const chunk of stream) {
        // Safe casting as per SDK guidelines
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || '';
        
        fullText += chunkText;

        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMessageId 
              ? { ...msg, text: fullText } 
              : msg
          )
        );
      }

    } catch (error) {
      console.error("Stream error:", error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: "I'm sorry, I encountered an error. Please check your connection or API key.",
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Start a new chat? This will clear current history.')) {
      setMessages([]);
      resetChat();
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* Header */}
      <header className="flex-none bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-gemini-500 to-purple-600 p-2 rounded-lg text-white shadow-lg shadow-gemini-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                TimmGPT
              </h1>
              <p className="text-xs text-gemini-600 dark:text-gemini-400 font-medium tracking-wide">
                AI ASSISTANT
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleClearChat}
              className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-full transition-colors"
              title="Clear chat history"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto w-full scroll-smooth">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6 min-h-[calc(100vh-140px)]">
          
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full my-auto opacity-0 animate-fade-in" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
              <div className="w-24 h-24 bg-gradient-to-tr from-gemini-100 to-purple-100 dark:from-gemini-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <Sparkles size={48} className="text-gemini-500 dark:text-gemini-400 animate-pulse-slow" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                I am TimmGPT, how can I help?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
                I can help you write code, analyze images, summarize text, and much more.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {[
                  { icon: "💻", text: "Write a React component for a nav bar" },
                  { icon: "🎨", text: "Analyze an uploaded image design" },
                  { icon: "📝", text: "Summarize a complex article" },
                  { icon: "🧪", text: "Explain quantum computing simply" },
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(suggestion.text, [])}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gemini-300 dark:hover:border-gemini-700 hover:shadow-md transition-all text-left"
                  >
                    <span className="text-2xl">{suggestion.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && !isStreaming && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gemini-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-gemini-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gemini-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </>
          )}
        </div>
      </main>

      {/* Input Footer */}
      <footer className="flex-none z-20">
        <div className="bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pt-10">
           <InputArea onSendMessage={handleSendMessage} isLoading={isLoading || isStreaming} />
        </div>
      </footer>
    </div>
  );
};

export default App;