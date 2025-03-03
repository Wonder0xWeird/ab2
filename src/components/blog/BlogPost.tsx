import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogPostProps {
  content: string;
  title?: string;
}

export const BlogPost = ({ content, title }: BlogPostProps) => {
  return (
    <article className="blog-post">
      {title && (
        <h1>{title}</h1>
      )}
      <div className="writing">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 {...props} />
            ),
            p: ({ node, ...props }) => (
              <p {...props} />
            ),
            em: ({ node, ...props }) => (
              <em {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default BlogPost;