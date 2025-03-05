'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Create appropriate URL for observer
  const observerUrl = isDevelopment ? '/observer' : 'https://observer.ab2.observer';

  // After animation completes, show the subtitle
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSubtitle(true);
    }, 3300); // Adjusted to match the new longer animation (3s + a bit extra)

    return () => clearTimeout(timer);
  }, []);

  const handleAClick = () => {
    router.push(observerUrl);
  };

  return (
    <div className="full-screen-a">
      <div
        className={`large-a ${isHovering ? 'hovered' : ''}`}
        onClick={handleAClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        A
      </div>

      {showSubtitle && (
        <div className="home-subtitle">
          <span>Abstraction to abstraction, Ab2 is.</span>
        </div>
      )}
    </div>
  );
}
