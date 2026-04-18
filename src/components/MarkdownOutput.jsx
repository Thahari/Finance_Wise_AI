import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownOutput = ({ text }) => {
  return (
    <div className="max-w-none text-gray-200">
      <ReactMarkdown
        components={{
          h1: ({ node: _, ...props }) => <h1 className="text-2xl font-medium mb-4 text-[#ececec]" {...props} />,
          h2: ({ node: _, ...props }) => <h2 className="text-xl font-medium mt-6 mb-3 text-[#ececec]" {...props} />,
          h3: ({ node: _, ...props }) => <h3 className="text-lg font-medium mt-4 mb-2 text-[#cccccc]" {...props} />,
          p: ({ node: _, ...props }) => <p className="leading-relaxed mb-4 text-[#ababab]" {...props} />,
          ul: ({ node: _, ...props }) => <ul className="list-disc ml-6 mb-4 text-[#ababab] marker:text-[#555]" {...props} />,
          ol: ({ node: _, ...props }) => <ol className="list-decimal ml-6 mb-4 text-[#ababab] marker:text-[#555]" {...props} />,
          li: ({ node: _, ...props }) => <li className="mb-1" {...props} />,
          strong: ({ node: _, ...props }) => <strong className="font-medium text-[#ececec]" {...props} />,
          a: ({ node: _, ...props }) => <a className="text-[#ececec] underline underline-offset-4 hover:text-white transition-colors" {...props} />,
          blockquote: ({ node: _, ...props }) => <blockquote className="border-l-2 border-[#555] pl-4 italic py-1 my-4 text-[#888]" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default React.memo(MarkdownOutput);
