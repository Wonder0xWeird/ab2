import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import BlogPost from '@/components/blog/BlogPost';

export default async function Home() {
  // Read the markdown file
  const filePath = path.join(process.cwd(), 'content/blog/on-analysis.md');
  const fileContents = await fs.readFile(filePath, 'utf8');

  // Parse frontmatter and content
  const { data, content } = matter(fileContents);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-16"
    >
      <div
        className="w-full flex flex-col items-center"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          className="text-center mb-16"
          style={{ textAlign: 'center' }}
        >
          <div
            className="text-[10rem] font-crimson text-gold mb-[-2rem]"
            style={{
              fontSize: '10rem',
              fontFamily: 'Crimson Text, Georgia, serif',
              color: '#cc9c42',
              marginBottom: '-2rem'
            }}
          >
            A
          </div>
          <h1
            className="text-6xl font-bold text-gold font-crimson"
            style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#cc9c42',
              fontFamily: 'Crimson Text, Georgia, serif'
            }}
          >
            ABSTRACTU
          </h1>
          <p
            className="mt-6 text-xl text-foreground"
            style={{
              marginTop: '1.5rem',
              fontSize: '1.25rem',
              color: '#e0e0e0',
              textAlign: 'center'
            }}
          >
            Abstraction to abstraction, Ab2 is.
          </p>
        </div>

        <BlogPost content={content} title={data.title} />
      </div>
    </div>
  );
}
