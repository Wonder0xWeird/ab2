import { Metadata } from 'next';
import { getDocBySlug } from '@/lib/docs';
import DocContent from '@/components/docs/DocContent';
import { notFound } from 'next/navigation';

// Let Next.js infer the type for generateMetadata
export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
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

// Let Next.js infer the type for the page component
export default async function DocPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return <DocContent content={doc.content} />;
} 