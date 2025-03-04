import React from 'react';
import { StandardLayout } from '../components/layout/StandardLayout';
import Link from 'next/link';

export default function HomePage() {
  return (
    <StandardLayout>
      <div className="home-content">
        <h2>Welcome to ABSTRACTU</h2>
        <p>An exploration of ideas through different expressions</p>

        <div className="expressions-grid">
          <Link href="https://muse.ab2.observer" className="expression-card">
            <h3>MUSE</h3>
            <p>Philosophical explorations and creative writing</p>
          </Link>

          <Link href="https://observer.ab2.observer" className="expression-card">
            <h3>OBSERVER</h3>
            <p>Watching the watchers watch</p>
          </Link>

          {/* Add more expressions as they become available */}
        </div>
      </div>
    </StandardLayout>
  );
}
