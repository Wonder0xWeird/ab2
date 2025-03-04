import React from 'react';
import { StandardLayout } from '../../components/layout/StandardLayout';
import { DraggableGrid } from '../../components/layout/DraggableGrid';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost } from '../../components/blog/BlogPost';

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

  // Create grid items from the posts
  const gridItems = posts.map((post, i) => (
    <BlogPost key={i} content={post.content} title={post.data.title} />
  ));

  return (
    <StandardLayout>
      <DraggableGrid>
        {gridItems}
      </DraggableGrid>
    </StandardLayout>
  );
} 