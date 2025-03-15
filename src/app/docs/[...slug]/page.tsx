import { Metadata } from 'next';
import { getDocBySlug } from '@/lib/docs';
import DocContent from '@/components/docs/DocContent';
import { notFound } from 'next/navigation';

interface DocPageProps {
  params: {
    slug: string[];
  };
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const slug = params.slug.join('/');
  const doc = await getDocBySlug(slug);

  if (!doc) {
    return {
      title: 'Document Not Found',
      description: 'The requested documentation page could not be found',
    };
  }

  return {
    title: `${doc.meta.title} - ABSTRACTU Documentation`,
    description: doc.meta.description || `Documentation about ${doc.meta.title}`,
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const slug = params.slug.join('/');
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return <DocContent content={doc.content} />;
} 