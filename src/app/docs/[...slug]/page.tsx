import { Metadata } from 'next';
import { getDocBySlug } from '@/lib/docs';
import DocContent from '@/components/docs/DocContent';
import { notFound } from 'next/navigation';

// Updated interface to be compatible with Next.js pages
interface PageProps {
  params: {
    slug: string[];
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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

export default async function DocPage({ params }: PageProps) {
  const slug = params.slug.join('/');
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return <DocContent content={doc.content} />;
} 