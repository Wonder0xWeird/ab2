'use client';

import React from 'react';
import { TitleConfig } from '../../config/titles';

interface TitleProps {
  titleConfig: TitleConfig;
  className?: string;
}

export const Title: React.FC<TitleProps> = ({
  titleConfig,
  className = '',
}) => {
  const { letter, title, tagline, color = '#cc9c42' } = titleConfig;

  return (
    <div className={`title-container ${className}`}>
      <div className="large-letter" style={{ color }}>
        {letter}
      </div>
      <div className="title-content">
        <h1>{title}</h1>
        <p className="tagline">{tagline}</p>
      </div>
    </div>
  );
}; 