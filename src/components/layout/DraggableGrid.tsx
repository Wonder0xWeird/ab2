'use client';

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';

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
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [gridSize] = useState({
    cols: 5,
    cellSize: 400,
    gap: 60,
    verticalOffset: 30
  });

  const calculateRowHeights = useCallback(() => {
    if (itemRefs.current.length === 0) return;

    const newRowHeights: number[] = [];
    const rowItemsHeight: { [key: number]: number } = {};

    // Group items by row
    itemRefs.current.forEach((item, index) => {
      if (!item) return;
      const row = Math.floor(index / gridSize.cols);
      const height = item.offsetHeight;

      if (!rowItemsHeight[row] || height > rowItemsHeight[row]) {
        rowItemsHeight[row] = height;
      }
    });

    // Convert to array
    Object.keys(rowItemsHeight).forEach((rowIndex) => {
      const index = parseInt(rowIndex);
      newRowHeights[index] = rowItemsHeight[index];
    });

    setRowHeights(newRowHeights);
  }, [gridSize.cols]);

  // Add window resize listener
  useEffect(() => {
    calculateRowHeights();

    window.addEventListener('resize', calculateRowHeights);

    // Add global mouse up handler
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('resize', calculateRowHeights);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, calculateRowHeights]);

  const findTitlePosition = useCallback(() => {
    // Find the title item
    const titleIndex = children.findIndex((child, i) => {
      const el = itemRefs.current[i];
      return el?.querySelector('[data-grid-title]');
    });

    if (titleIndex === -1) return null;

    const col = titleIndex % gridSize.cols;
    const row = Math.floor(titleIndex / gridSize.cols);
    const columnOffset = col % 2 === 0 ? 0 : gridSize.verticalOffset;

    // Calculate vertical position based on previous row heights
    let top = 0;
    for (let r = 0; r < row; r++) {
      top += (rowHeights[r] || gridSize.cellSize) + gridSize.gap;
    }

    return {
      x: col * (gridSize.cellSize + gridSize.gap),
      y: top + columnOffset
    };
  }, [children, gridSize.cellSize, gridSize.cols, gridSize.gap, gridSize.verticalOffset, rowHeights]);

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

    // Set initial random position immediately
    setScrollPos({
      x: randomX,
      y: randomY
    });

    // Force a reflow to ensure the initial opacity is applied
    if (containerRef.current) {
      // Simply trigger reflow without assigning to unused variable
      containerRef.current.getBoundingClientRect();
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

  }, [rowHeights, isInitialLoad, gridSize, gridWidth, gridHeight, findTitlePosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isInitialLoad) return;

    setIsDragging(true);
    setStartPos({
      x: e.clientX - scrollPos.x,
      y: e.clientY - scrollPos.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isInitialLoad) return;

    setScrollPos({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    if (isInitialLoad) return;
    setIsDragging(false);
  };

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
                animation: 'fadeIn 1.5s cubic-bezier(0.4, 0, 1, 1)',
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