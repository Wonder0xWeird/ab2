'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DocContentProps {
  content: string;
}

export default function DocContent({ content }: DocContentProps) {
  return (
    <article className="docs-page">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children }) {
            return (
              <pre className={className}>
                <code>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
} 