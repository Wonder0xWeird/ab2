'use client'; // Convert to client component

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession
import { Concept, IConcept } from '@/utils/mongodb/models';
// Keep MongoDBClient import if needed for client-side fallback, otherwise remove
// import { MongoDBClient } from '@/utils/mongodb/client';
import { notFound, useParams } from 'next/navigation'; // Use client-side navigation hooks
import SentenceRenderer from '@/components/concept/SentenceRenderer';
import ConceptDraftForm from '@/components/admin/ConceptDraftForm'; // Import draft form

// // Fetch concept metadata server-side - This needs to be fetched differently now
// async function getConceptData(cid: string) { ... }

// The main page component (now client-side)
export default function ConceptPage() {
  const params = useParams(); // Get params using client hook
  const cid = typeof params.cid === 'string' ? params.cid : '';
  const { data: session } = useSession(); // Get session data

  const [conceptData, setConceptData] = useState<IConcept | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cid) return; // Don't fetch if cid is invalid

    const fetchConceptData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch concept data from an API route instead of direct DB access
        const response = await fetch(`/api/concepts/${cid}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound(); // Trigger 404 if API returns not found
          }
          throw new Error(`Failed to fetch concept data (status: ${response.status})`);
        }
        const data = await response.json();
        if (data.success && data.concept) {
          setConceptData(data.concept);
        } else {
          throw new Error(data.error || 'Invalid data received from API');
        }
      } catch (err: unknown) {
        console.error(`Error fetching concept data for CID [${cid}]:`, err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching concept data.');
        }
        // Potentially trigger notFound() here too, depending on desired behavior for errors
        // notFound(); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchConceptData();

  }, [cid]); // Re-fetch if cid changes

  // Handle loading state
  if (isLoading) {
    return (
      <main className="standard-layout">
        <div className="site-main flex items-center justify-center">
          <p>Loading concept...</p> {/* Use a spinner component later */}
        </div>
      </main>
    );
  }

  // Handle error state
  if (error) {
    return (
      <main className="standard-layout">
        <div className="site-main flex items-center justify-center">
          <p className="text-red-500">Error loading concept: {error}</p>
        </div>
      </main>
    );
  }

  // Handle not found (though API fetch might call notFound() earlier)
  if (!conceptData) {
    // This might be redundant if the fetch logic calls notFound(), 
    // but serves as a fallback.
    notFound();
  }

  // --- Render Blog Layout --- 
  return (
    <main className="standard-layout">
      <div className="site-main">
        <div className="container mx-auto">
          <div className="concept-content-area">
            <h1>{conceptData.title}</h1>
            <p className="text-lg italic opacity-80">{conceptData.description}</p>
            <hr />
            <SentenceRenderer cid={cid} />
          </div>

          {/* Conditionally render the Draft Form for superadmins */}
          {session?.user?.role === 'superadmin' && (
            <ConceptDraftForm cid={cid} />
          )}
        </div>
      </div>
    </main>
  );
}

// Remove generateMetadata as it's for Server Components
// export async function generateMetadata(...) { ... } 