'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DocMeta } from '@/lib/docs';

interface DocsNavigationProps {
  sections?: Record<string, DocMeta[]>;
}

// Default structure for when we're loading
const loadingNav = [
  { title: 'Loading...', href: '/docs' }
];

export default function DocsNavigation({ sections }: DocsNavigationProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(!sections);
  const [docSections, setDocSections] = useState<Record<string, DocMeta[]> | null>(sections || null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in the navigation
    setIsVisible(true);

    if (!sections) {
      fetch('/api/docs-sections')
        .then(res => res.json())
        .then((data: Record<string, DocMeta[]>) => {
          setDocSections(data);
          setIsLoading(false);

          // Expand the section containing the current page
          const currentPath = pathname;
          Object.keys(data).forEach(section => {
            if (data[section].some(doc => doc.path === currentPath)) {
              setExpandedSections(prev => ({
                ...prev,
                [section]: true
              }));
            }
          });
        })
        .catch(err => {
          console.error('Failed to load doc sections:', err);
          setIsLoading(false);
        });
    }
  }, [sections, pathname]);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  const renderDocItems = () => {
    if (isLoading || !docSections) {
      return loadingNav.map(item => (
        <li key={item.title} className="nav-section" style={{ animationDelay: '0.1s' }}>
          <div className="section-header">
            <Link href={item.href}>
              {item.title}
            </Link>
          </div>
        </li>
      ));
    }

    // Get root level docs
    const rootDocs = docSections['root'] || [];

    // Get section keys, excluding 'root'
    const sections = Object.keys(docSections).filter(key => key !== 'root');

    // First render root docs
    const rootItems = rootDocs.map((doc, index) => (
      <li
        key={doc.slug}
        className="nav-section fade-in-item"
        style={{ animationDelay: `${0.1 + index * 0.05}s` }}
      >
        <div className="section-header">
          <Link
            href={doc.path}
            className={isActive(doc.path) ? 'active' : ''}
          >
            {doc.title}
          </Link>
        </div>
      </li>
    ));

    // Then render sections with their child docs
    const sectionItems = sections.map((sectionKey, sectionIndex) => {
      const sectionDocs = docSections[sectionKey] || [];
      const shouldExpand = expandedSections[sectionKey] ||
        sectionDocs.some(doc => isActive(doc.path));

      // Format section title 
      const sectionTitle = sectionKey
        .split('/')
        .pop()
        ?.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || sectionKey;

      return (
        <li
          key={sectionKey}
          className="nav-section fade-in-item"
          style={{ animationDelay: `${0.1 + (rootItems.length + sectionIndex) * 0.05}s` }}
        >
          <div
            className={`section-header has-children ${shouldExpand ? 'active-section' : ''}`}
            onClick={() => toggleSection(sectionKey)}
          >
            <span className={`section-toggle ${shouldExpand ? 'expanded' : ''}`}>
              {shouldExpand ? '▼' : '►'}
            </span>
            <span>{sectionTitle}</span>
          </div>

          {shouldExpand && (
            <ul className="subsection">
              {sectionDocs.map((doc, docIndex) => (
                <li
                  key={doc.slug}
                  className="subsection-item fade-in-item"
                  style={{ animationDelay: `${0.2 + docIndex * 0.04}s` }}
                >
                  <Link
                    href={doc.path}
                    className={isActive(doc.path) ? 'active' : ''}
                  >
                    {doc.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    });

    return [...rootItems, ...sectionItems];
  };

  return (
    <nav className={`docs-nav ${isVisible ? 'visible' : ''}`}>
      <div className="nav-header">
        <Link href="/" className="home-link">
          ABSTRACTU
        </Link>
        <h3>Documentation</h3>
      </div>
      <ul className="nav-items">
        {renderDocItems()}
      </ul>
      <style jsx>{`
        .docs-nav {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .docs-nav.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .fade-in-item {
          opacity: 0;
          transform: translateY(10px);
          animation: fadeInUp 0.5s forwards;
          animation-fill-mode: both;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .active-section {
          background: rgba(204, 156, 66, 0.2) !important;
          border-color: rgba(204, 156, 66, 0.6) !important;
        }
      `}</style>
    </nav>
  );
} 