import Link from 'next/link';

export default function DocsNotFound() {
  return (
    <div className="docs-not-found">
      <h1>Documentation Not Found</h1>
      <p>The requested documentation page could not be found.</p>
      <Link href="/docs">
        Return to Documentation Home
      </Link>
    </div>
  );
} 