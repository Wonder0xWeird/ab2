import { Metadata } from 'next';
import { getDocBySlug } from '@/lib/docs';
import DocContent from '@/components/docs/DocContent';

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getDocBySlug('');

  return {
    title: doc?.meta.title || 'Introduction to ABSTRACTU',
    description: doc?.meta.description || 'Documentation and guides for the ABSTRACTU platform',
  };
}

export default async function DocsPage() {
  const doc = await getDocBySlug('');

  if (!doc) {
    return <div>Documentation not found</div>;
  }

  return <DocContent content={doc.content} />;
} 