'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { ISentence } from '@/utils/mongodb/models';
import { MarkdownType } from '@/utils/mongodb/schemas/sentence.schema'; // Import enum
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SentenceRendererProps {
  cid: string;
}

// Simple component to render individual sentences based on type
const SentenceItem: React.FC<{ sentence: ISentence }> = React.memo(({ sentence }) => {
  // --- Base Styling based on Type --- 
  let baseElement: React.ReactElement;
  switch (sentence.type) {
    case MarkdownType.Heading1: baseElement = <h1><ReactMarkdown remarkPlugins={[remarkGfm]}>{sentence.content}</ReactMarkdown></h1>; break;
    case MarkdownType.Heading2: baseElement = <h2><ReactMarkdown remarkPlugins={[remarkGfm]}>{sentence.content}</ReactMarkdown></h2>; break;
    case MarkdownType.Heading3: baseElement = <h3><ReactMarkdown remarkPlugins={[remarkGfm]}>{sentence.content}</ReactMarkdown></h3>; break;
    case MarkdownType.Paragraph: baseElement = <p><ReactMarkdown remarkPlugins={[remarkGfm]}>{sentence.content}</ReactMarkdown></p>; break;
    case MarkdownType.ListItem:
      // Now this is the primary case for list items
      const indentation = sentence.metadata?.indentation;
      const isOrdered = sentence.metadata?.ordered ?? false;
      const itemNumber = sentence.metadata?.itemNumber;

      // Base style with margin based on indent
      const liStyle: React.CSSProperties = (typeof indentation === 'number' && indentation > 0)
        ? { marginLeft: `${indentation * 1.0}rem` }
        : {};

      let contentPrefix = '';
      if (isOrdered && typeof itemNumber === 'number') {
        // Prepend the item number manually
        contentPrefix = `${itemNumber}. `;
        // Hide the default browser number
        liStyle.listStyleType = 'none';
        // Ensure the element is still treated as a list item for layout/semantics if needed
        // but list-style-type: none should be sufficient visually.
        // We might need to adjust padding/margin slightly if removing the default marker space is desired.
        liStyle.paddingLeft = '0.5em'; // Add some padding to simulate marker space 
      } else {
        // Use default disc for unordered
        liStyle.listStyleType = 'disc';
      }

      // Ensure display is list-item for proper rendering within lists
      liStyle.display = 'list-item';

      // Render the prefix + content inside the li
      baseElement = (
        <li style={liStyle}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {`${contentPrefix}${sentence.content}`}
          </ReactMarkdown>
        </li>
      );
      break;
    case MarkdownType.Code:
      baseElement = (
        <pre>
          <code className={`language-${sentence.metadata?.lang || 'plaintext'}`}>
            {sentence.content}
          </code>
        </pre>
      );
      break;
    case MarkdownType.Blockquote: baseElement = <blockquote><ReactMarkdown remarkPlugins={[remarkGfm]}>{sentence.content}</ReactMarkdown></blockquote>; break;
    case MarkdownType.HorizontalRule: baseElement = <hr />; break;
    default: baseElement = <div className="my-2 text-sm text-red-500">Unsupported type: {sentence.type}</div>; break;
  }

  // Remove the previous indentation logic wrapper
  // // --- Apply Indentation if applicable --- 
  // // ... 

  // Return base element
  return baseElement;
});
SentenceItem.displayName = 'SentenceItem'; // Add display name for React DevTools

export default function SentenceRenderer({ cid }: SentenceRendererProps) {
  const [sentences, setSentences] = useState<ISentence[]>([]);
  const [nextSid, setNextSid] = useState<number | null>(0); // Start fetching from sid 0
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Intersection observer hook
  const { ref, inView } = useInView({
    threshold: 0, // Trigger as soon as the element enters the viewport
    // rootMargin: '200px', // Optionally load content 200px before it's visible
  });

  // Function to fetch sentences
  const fetchSentences = useCallback(async (sidToFetch: number | null) => {
    if (sidToFetch === null || isLoading) return;

    setIsLoading(true);
    setError(null);
    console.log(`Fetching batch starting from SID: ${sidToFetch}`);

    try {
      // Construct URL carefully
      const apiUrl = `/api/concepts/${cid}/sentences?startSid=${sidToFetch}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch sentences');
      }

      console.log(`Fetched ${data.sentences.length} sentences. Next SID: ${data.nextSid}`);

      // Replace state on initial fetch, otherwise filter and append
      if (sidToFetch === 0) {
        setSentences(data.sentences);
      } else {
        setSentences(prev => {
          const existingSids = new Set(prev.map(s => s.sid));
          const newSentences = data.sentences.filter((s: ISentence) => !existingSids.has(s.sid));
          // Return the combined array for the state update
          return [...prev, ...newSentences];
        });
      }
      setNextSid(data.nextSid);

    } catch (err: unknown) {
      console.error("Error fetching sentences:", err);
      // Type check before accessing properties
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    }
    // Keep dependencies minimal for stability
  }, [cid, isLoading, initialLoadComplete]);

  // Initial fetch effect
  useEffect(() => {
    setSentences([]);
    setNextSid(0);
    setError(null);
    setIsLoading(false);
    setInitialLoadComplete(false);
    console.log(`Initial fetch triggered for CID: ${cid}`);
    fetchSentences(0);
  }, [cid]); // Only re-run when cid changes

  // Infinite scroll trigger effect
  useEffect(() => {
    if (initialLoadComplete && !isLoading && nextSid !== null && inView) {
      console.log('Intersection observer trigger in view, fetching more...');
      fetchSentences(nextSid);
    }
  }, [initialLoadComplete, isLoading, nextSid, inView, fetchSentences]); // Add fetchSentences dependency

  // --- Rendering Logic with List Grouping --- 
  const renderedElements = sentences.reduce<React.ReactNode[]>((acc, sentence, index) => {
    const elementKey = `sentence-${sentence.sid ?? index}`;

    if (sentence.type === MarkdownType.ListItem && (index === 0 || sentences[index - 1].type !== MarkdownType.ListItem)) {
      const listItems = [sentence];
      let k = index + 1;
      while (k < sentences.length && sentences[k].type === MarkdownType.ListItem) {
        listItems.push(sentences[k]);
        k++;
      }

      const isOrdered = listItems[0]?.metadata?.ordered ?? false;
      // const start = isOrdered ? listItems[0]?.metadata?.start : undefined; // No longer needed
      const ListComponent = isOrdered ? 'ol' : 'ul';
      const listIndentation = listItems[0]?.metadata?.indentation ?? 0;
      // Adjust wrapper indent if the list itself is nested (e.g., starts at indentation > 0)
      const listMarginLeft = listIndentation > 0 ? `${(listIndentation - 1) * 1.0}rem` : '0rem';

      acc.push(
        <div key={`${elementKey}-list-wrapper`} style={{ marginLeft: listMarginLeft }}>
          {/* Remove start attribute from ol */}
          <ListComponent key={`${elementKey}-list`} /* start={start} */ className="list-inside my-1">
            {listItems.map((item, itemIndex) => (
              <SentenceItem key={`sentence-${item.sid ?? index + itemIndex}`} sentence={item} />
            ))}
          </ListComponent>
        </div>
      );
    }
    // If the current sentence is a ListItem but it was already handled in a group
    else if (sentence.type === MarkdownType.ListItem) {
      // Skip rendering - already included in the list block
    }
    // Otherwise, render non-list items directly
    else {
      acc.push(<SentenceItem key={elementKey} sentence={sentence} />);
    }

    return acc;
  }, []);

  return (
    <>
      {renderedElements}

      {/* Loading indicator and error message */}
      {isLoading && <p className="text-center my-4 text-gray-400">Loading more content...</p>}
      {error && <p className="text-center my-4 text-red-500">Error: {error}</p>}

      {/* Intersection observer trigger element */}
      {/* This empty div will trigger 'inView' when it becomes visible */}
      {!isLoading && nextSid !== null && (
        <div ref={ref} style={{ height: '10px' }} aria-hidden="true"></div>
      )}

      {/* Message when all content is loaded */}
      {!isLoading && nextSid === null && sentences.length > 0 && (
        <p className="text-center my-8 text-gray-500">End of content - check back soon for more!</p>
      )}
    </>
  );
} 