import React from 'react';
import { StandardLayout } from '../../components/layout/StandardLayout';

export default function ObserverPage() {
  return (
    <StandardLayout>
      <div className="observer-content">
        <h2>The Observer</h2>
        <p>Watching the watchers watch.</p>

        <div className="observer-section">
          <h3>Coming Soon</h3>
          <p>The Observer feature is currently under development. Stay tuned for updates!</p>
        </div>
      </div>
    </StandardLayout>
  );
} 