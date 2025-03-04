'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

interface DraggableGridProps {
  children: ReactNode[];
  className?: string;
}

export const DraggableGrid = ({ children, className = '' }: DraggableGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [gridSize] = useState({
    cols: 5,
    rows: Math.ceil(children.length / 5),
    cellSize: 500,
    gap: 100,
    verticalOffset: 300,
  });

  // Calculate and update row heights
  useEffect(() => {
    const calculateRowHeights = () => {
      const heights: number[] = [];
      for (let row = 0; row < gridSize.rows; row++) {
        let maxHeight = 0;
        for (let col = 0; col < gridSize.cols; col++) {
          const index = row * gridSize.cols + col;
          const element = itemRefs.current[index];
          if (element) {
            const height = element.scrollHeight;
            maxHeight = Math.max(maxHeight, height);
          }
        }
        heights.push(maxHeight);
      }
      setRowHeights(heights);
    };

    // Calculate initial heights after a short delay to ensure content is rendered
    setTimeout(calculateRowHeights, 100);
  }, [children, gridSize.cols, gridSize.rows]);

  // Find title element position
  const findTitlePosition = () => {
    const titleIndex = itemRefs.current.findIndex(
      ref => ref?.querySelector('[data-grid-title]')
    );
    if (titleIndex === -1) return null;

    const col = titleIndex % gridSize.cols;
    const row = Math.floor(titleIndex / gridSize.cols);
    let top = 0;
    for (let r = 0; r < row; r++) {
      top += (rowHeights[r] || gridSize.cellSize) + gridSize.gap;
    }

    return {
      x: col * (gridSize.cellSize + gridSize.gap),
      y: top + (col % 2 === 0 ? 0 : gridSize.verticalOffset),
    };
  };

  // Calculate total grid dimensions
  const gridWidth = gridSize.cols * (gridSize.cellSize + gridSize.gap);
  const gridHeight = rowHeights.reduce((sum, height) => sum + height + gridSize.gap, 0) + gridSize.verticalOffset;

  // Center the grid on the title with smooth animation
  useEffect(() => {
    if (!isInitialLoad || rowHeights.length === 0) return;

    const titlePos = findTitlePosition();
    if (!titlePos) return;

    const centerX = (window.innerWidth - gridSize.cellSize) / 2;
    const centerY = (window.innerHeight - gridSize.cellSize) / 2;

    // Calculate grid boundaries
    const maxX = gridWidth * 0.2;
    const minX = -(gridWidth * 1.2);
    const maxY = gridHeight * 0.2;
    const minY = -(gridHeight * 1.2);

    // Generate random starting position within bounds
    const randomX = Math.random() * (maxX - minX) + minX;
    const randomY = Math.random() * (maxY - minY) + minY;

    // Set initial random position and opacity immediately
    setScrollPos({
      x: randomX,
      y: randomY
    });

    // Force a reflow to ensure the initial opacity is applied
    if (containerRef.current) {
      containerRef.current.offsetHeight;
    }

    // Add a delay before starting the centering animation
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 2.5s cubic-bezier(0.16, 1, 0.3, 1)';

        // Set the final centered position
        setScrollPos({
          x: centerX - titlePos.x,
          y: centerY - titlePos.y,
        });

        // Reset transition after animation
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = 'transform 0.1s cubic-bezier(0.2, 0, 0.3, 1)';
          }
          setIsInitialLoad(false);
        }, 2500);
      }
    }, 100); // Small delay to ensure the random position is set first

  }, [rowHeights, isInitialLoad, gridSize, gridWidth, gridHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click
    setIsDragging(true);
    setStartPos({
      x: e.clientX - scrollPos.x,
      y: e.clientY - scrollPos.y,
    });
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;

    // Calculate bounds with some overflow allowance
    const maxX = gridWidth * 0.2;
    const minX = -(gridWidth * 1.2);
    const maxY = gridHeight * 0.2;
    const minY = -(gridHeight * 1.2);

    setScrollPos({
      x: Math.min(maxX, Math.max(minX, newX)),
      y: Math.min(maxY, Math.max(minY, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastPos(scrollPos);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  // Add and remove event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setLastPos(scrollPos);
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [scrollPos]);

  const setItemRef = (index: number) => (el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
  };

  return (
    <div
      className={`viewport-container ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <div
        ref={containerRef}
        className={`grid-container ${className}`}
        style={{
          transform: `translate(${scrollPos.x}px, ${scrollPos.y}px)`,
          width: gridWidth,
          height: gridHeight,
          position: 'absolute',
          transformOrigin: '0 0',
          transition: isInitialLoad ? 'transform 2.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.1s cubic-bezier(0.2, 0, 0.3, 1)',
        }}
      >
        {children.map((child, i) => {
          const col = i % gridSize.cols;
          const row = Math.floor(i / gridSize.cols);
          const columnOffset = col % 2 === 0 ? 0 : gridSize.verticalOffset;

          // Calculate vertical position based on previous row heights
          let top = 0;
          for (let r = 0; r < row; r++) {
            top += (rowHeights[r] || gridSize.cellSize) + gridSize.gap;
          }

          return (
            <div
              key={i}
              ref={setItemRef(i)}
              className="grid-item"
              style={{
                position: 'absolute',
                left: col * (gridSize.cellSize + gridSize.gap),
                top: top + columnOffset,
                width: gridSize.cellSize,
                minHeight: gridSize.cellSize,
                height: 'auto',
                padding: '2rem',
                animation: 'fadeIn 3s cubic-bezier(0.4, 0, 1, 1)',
              }}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 