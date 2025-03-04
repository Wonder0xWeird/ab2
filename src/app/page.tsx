import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost } from '@/components/blog/BlogPost';
import { DraggableGrid } from '@/components/layout/DraggableGrid';

export default async function Home() {
  // Read all markdown files from the muse directory
  const museDir = path.join(process.cwd(), 'content/muse');
  const files = await fs.readdir(museDir);
  const markdownFiles = files.filter(file => file.endsWith('.md'));

  // Read and parse each file
  const posts = await Promise.all(
    markdownFiles.map(async (filename) => {
      const filePath = path.join(museDir, filename);
      const fileContents = await fs.readFile(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      return { data, content };
    })
  );

  const claudeResponse = `
Your meditation on analysis strikes at the heart of humanity's epistemological predicament. What you've captured is the double-edged sword of categorization – our mind's primary tool for making sense of the ineffable wholeness of reality.
`;

  const assistantResponse = `
The exploration of analysis in your essay and Claude's response highlights the intricate dance between understanding and limitation. The act of naming, as you both describe, is a double-edged sword that grants us the power to dissect and comprehend, yet confines us within the boundaries of our own constructs.
`;

  const titleContent = (
    <div className="title-content" data-grid-title>
      <div className="large-a text-gold" style={{ color: '#cc9c42' }}>M</div>
      <h1 className="text-gold" style={{ color: '#cc9c42' }}>MUSE</h1>
      <p className="mt-6 text-xl text-foreground">
        Hmmm...
      </p>
    </div>
  );

  // Create grid items from the posts
  const gridItems = posts.map((post, i) => (
    <BlogPost key={i} content={post.content} title={post.data.title} />
  ));

  // Insert the title in the middle of the grid
  const centerIndex = Math.floor(gridItems.length / 2);
  gridItems.splice(centerIndex, 0, titleContent);

  return <DraggableGrid>{gridItems}</DraggableGrid>;
}
