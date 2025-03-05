import React from 'react';
import Link from 'next/link';
import { DraggableGrid } from '../../components/layout/DraggableGrid';
import { promises as fs } from 'fs';
import path from 'path';

// Interface for page information
interface PageInfo {
  name: string;
  path: string;
  title: string;
  description?: string;
  isExternal?: boolean;
  isFuture?: boolean;
  titleLetter?: string;
  tagline?: string;
}

export default async function ObserverPage() {
  // Get the list of available pages
  const pages = await getAvailablePages();

  // Create the title content
  const titleContent = (
    <div className="title-content" data-grid-title>
      <div className="large-letter">O</div>
      <p className="tagline">
        Watching the watchers watch
      </p>
    </div>
  );

  // Create grid items from the pages
  const gridItems = pages.map((page, i) => (
    <PageCard key={i} page={page} />
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

// Component for rendering page cards
function PageCard({ page }: { page: PageInfo }) {
  const CardContent = () => (
    <div className="expression-card-content">
      {page.titleLetter && <div className="card-letter">{page.titleLetter}</div>}
      {page.tagline && <p className="card-tagline">{page.tagline}</p>}
      {page.isFuture && <span className="coming-soon">coming soon</span>}
    </div>
  );

  if (page.isFuture) {
    return (
      <div className="expression-card future">
        <CardContent />
      </div>
    );
  }

  return (
    <Link href={page.path} className="expression-card">
      <CardContent />
    </Link>
  );
}

// Function to get available pages
async function getAvailablePages(): Promise<PageInfo[]> {
  const pages: PageInfo[] = [];

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Get the app directory path
  const appDir = path.join(process.cwd(), 'src/app');

  try {
    // Read the app directory
    const entries = await fs.readdir(appDir, { withFileTypes: true });

    // Filter for directories (which are potential pages)
    const directories = entries.filter(entry => entry.isDirectory());

    // Process each directory
    for (const dir of directories) {
      // Skip special directories like api
      if (dir.name === 'api' || dir.name.startsWith('_')) {
        continue;
      }

      // Process based on directory name
      if (dir.name === 'muse') {
        // Special handling for MUSE - uses a different URL in production
        const museUrl = isDevelopment ? '/muse' : 'https://muse.ab2.observer';
        pages.push({
          name: 'muse',
          path: museUrl,
          title: 'MUSE',
          description: 'Philosophical explorations and creative writing',
          isExternal: !isDevelopment,
          titleLetter: 'M',
          tagline: 'Hmmm...'
        });
      } else if (dir.name === 'observer') {
        // Skip observer itself to avoid circular navigation
        continue;
      } else {
        // Add other directories as pages
        const pageName = dir.name;
        const pagePath = `/${pageName}`;
        const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);

        pages.push({
          name: pageName,
          path: pagePath,
          title: pageTitle,
          titleLetter: pageTitle.charAt(0)
        });
      }
    }

    // Add the home page
    pages.push({
      name: 'home',
      path: '/',
      title: 'HOME',
      description: 'Main page',
      titleLetter: 'A',
      tagline: 'Abstraction to abstraction, Ab2 is.'
    });

  } catch (error) {
    console.error('Error reading app directory:', error);
  }

  return pages;
} 