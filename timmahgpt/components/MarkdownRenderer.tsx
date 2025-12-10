import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none break-words leading-relaxed">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, inline, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative group my-4 rounded-lg overflow-hidden bg-gray-900 border border-gray-700 shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
                   <span className="text-xs font-mono text-gray-400 lowercase">{match[1]}</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <code className={`${className} font-mono text-sm text-gray-100 block`} {...props}>
                    {children}
                  </code>
                </div>
              </div>
            ) : (
              <code className={`${className} font-mono text-sm bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400`} {...props}>
                {children}
              </code>
            );
          },
          pre({children}) {
             return <>{children}</>;
          },
          a({node, ...props}) {
             return <a className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer" {...props} />
          },
          ul({node, ...props}) {
            return <ul className="list-disc pl-5 my-2 space-y-1" {...props} />
          },
          ol({node, ...props}) {
            return <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />
          },
          blockquote({node, ...props}) {
            return <blockquote className="border-l-4 border-gemini-400 pl-4 py-1 my-2 bg-gray-50 dark:bg-gray-800/30 rounded-r italic text-gray-600 dark:text-gray-300" {...props} />
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;