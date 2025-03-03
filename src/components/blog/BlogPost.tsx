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
            h1: ({ ...props }) => (
              <h1 {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 {...props} />
            ),
            p: ({ ...props }) => (
              <p {...props} />
            ),
            em: ({ ...props }) => (
              <em {...props} />
            ),
            strong: ({ ...props }) => (
              <strong {...props} />
            ),
            blockquote: ({ ...props }) => (
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