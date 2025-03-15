import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Base directory for documentation files
const docsDirectory = path.join(process.cwd(), 'docs/docs');

// Interface for document metadata
export interface DocMeta {
  title: string;
  description?: string;
  sidebar_position?: number;
  slug: string;
  path: string;
  section?: string;
}

// Interface for loaded document
export interface DocContent {
  meta: DocMeta;
  content: string;
}

// Get all documentation files
export async function getAllDocs(): Promise<DocMeta[]> {
  const docs: DocMeta[] = [];
  await recursiveReadDocs(docsDirectory, '', docs);
  return docs;
}

// Recursively read docs from directories
async function recursiveReadDocs(dir: string, basePath: string, result: DocMeta[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      await recursiveReadDocs(fullPath, relativePath, result);
    } else if (entry.name.endsWith('.md')) {
      const meta = await getDocMeta(fullPath, relativePath);
      result.push(meta);
    }
  }
}

// Get metadata for a specific doc file
export async function getDocMeta(fullPath: string, relativePath: string): Promise<DocMeta> {
  const fileContents = await fs.readFile(fullPath, 'utf8');
  const { data } = matter(fileContents);

  const slug = relativePath.replace(/\.md$/, '');
  const urlPath = slug === 'intro' ? '/docs' : `/docs/${slug}`;

  const section = path.dirname(relativePath) !== '.'
    ? path.dirname(relativePath)
    : undefined;

  return {
    title: data.title || path.basename(relativePath, '.md'),
    description: data.description,
    sidebar_position: data.sidebar_position,
    slug,
    path: urlPath,
    section
  };
}

// Get content of a specific document by its slug
export async function getDocBySlug(slug: string): Promise<DocContent | null> {
  let filePath;

  if (slug === '') {
    // Handle root docs page, which is intro.md
    filePath = path.join(docsDirectory, 'intro.md');
  } else {
    // Handle normal paths
    filePath = path.join(docsDirectory, `${slug}.md`);

    // If file doesn't exist at direct path, check if it's in a subdirectory
    try {
      await fs.access(filePath);
    } catch {
      // File doesn't exist, try to find it in subdirectories
      const docs = await getAllDocs();
      const doc = docs.find(d => d.path === `/docs/${slug}`);

      if (doc) {
        filePath = path.join(docsDirectory, `${doc.slug}.md`);
      } else {
        return null;
      }
    }
  }

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      meta: {
        title: data.title || path.basename(slug),
        description: data.description,
        sidebar_position: data.sidebar_position,
        slug,
        path: `/docs/${slug}`,
        section: path.dirname(slug) !== '.' ? path.dirname(slug) : undefined
      },
      content
    };
  } catch (e) {
    console.error(`Error loading doc: ${slug}`, e);
    return null;
  }
}

// Get docs grouped by section for navigation
export async function getDocsSections(): Promise<Record<string, DocMeta[]>> {
  const allDocs = await getAllDocs();

  // Sort docs by sidebar_position if available
  const sortedDocs = [...allDocs].sort((a, b) => {
    if (a.sidebar_position !== undefined && b.sidebar_position !== undefined) {
      return a.sidebar_position - b.sidebar_position;
    }
    if (a.sidebar_position !== undefined) return -1;
    if (b.sidebar_position !== undefined) return 1;
    return a.title.localeCompare(b.title);
  });

  // Group by section
  const sections: Record<string, DocMeta[]> = {};

  for (const doc of sortedDocs) {
    const section = doc.section || 'root';
    if (!sections[section]) {
      sections[section] = [];
    }
    sections[section].push(doc);
  }

  return sections;
} 