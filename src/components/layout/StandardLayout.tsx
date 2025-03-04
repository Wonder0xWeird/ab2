import React from 'react';
import dynamic from 'next/dynamic';
import { PageTitle } from './PageTitle';

interface StandardLayoutProps {
  children: React.ReactNode;
}

export const StandardLayout: React.FC<StandardLayoutProps> = ({ children }) => {
  return (
    <div className="standard-layout">
      <header className="site-header">
        {/* PageTitle is an async Server Component */}
        <PageTitle className="site-title" />
      </header>

      <main className="site-main">
        {children}
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} ABSTRACTU</p>
      </footer>
    </div>
  );
}; 