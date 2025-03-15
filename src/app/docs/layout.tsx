'use client';

import { useEffect } from 'react';
import { Inter, Crimson_Text } from 'next/font/google';
import DocsNavigation from '@/components/docs/DocsNavigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const crimsonText = Crimson_Text({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-crimson'
});

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Animation effect on page load
    const contentEl = document.querySelector('.docs-content');
    if (contentEl) {
      contentEl.classList.add('fade-in');
    }
  }, []);

  return (
    <div className="docs-container">
      <div id="background-pattern"></div>

      <div className={`docs-sidebar floating-nav ${crimsonText.variable} ${inter.variable}`}>
        <DocsNavigation />
      </div>

      <div className={`docs-content ${inter.variable} ${crimsonText.variable}`}>
        {children}
      </div>
    </div>
  );
} 