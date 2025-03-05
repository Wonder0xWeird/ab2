import React from 'react';
import { DraggableGrid } from '../../components/layout/DraggableGrid';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost } from '../../components/blog/BlogPost';
import Link from 'next/link';

export default async function MusePage() {
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

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Create appropriate URL for observer
  const observerUrl = isDevelopment ? '/observer' : 'https://observer.ab2.observer';

  // Create the title content
  const titleContent = (
    <div className="title-content" data-grid-title>
      <div className="large-letter">M</div>
      <h1 className="muse-title-text">MUSE</h1>
      <p className="tagline">
        Hmmm...
      </p>
      <Link href={observerUrl} className="back-button">
        <div className="back-button-letter">O</div>
      </Link>
    </div>
  );

  // Create grid items from the posts
  const gridItems = posts.map((post, i) => (
    <BlogPost key={i} content={post.content} title={post.data.title} />
  ));

  // Insert the title in the middle of the grid
  const centerIndex = Math.floor(gridItems.length / 2);
  gridItems.splice(centerIndex, 0, titleContent);

  return (
    <DraggableGrid>
      {gridItems}
    </DraggableGrid>
  );
} 