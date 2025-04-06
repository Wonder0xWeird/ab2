import React from 'react';
// Use server-side session fetching again
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/auth/authOptions';
import SeedConceptForm from '@/components/admin/SeedConceptForm';
// Remove ConceptDraftForm import
// import ConceptDraftForm from '@/components/admin/ConceptDraftForm'; 
import { redirect } from 'next/navigation';
// Remove client-side hook import
// import { useSession } from 'next-auth/react'; 
// Remove LoadingSpinner import if it was added

// Revert to async function for server-side data fetching
export default async function SeedPage() {
  // Fetch session data on the server
  const session = await getServerSession(authOptions);

  // --- Authorization Check --- 
  // If no session or user is not superadmin, redirect to sign-in
  if (!session || session.user?.role !== 'superadmin') {
    console.log('Unauthorized access attempt to /seed. Role:', session?.user?.role);
    redirect('/auth/signin?callbackUrl=/seed'); // Redirect to signin
  }
  // --- End Authorization Check ---

  // Display name logic using server session data
  const userAddress = session.user?.address;
  // ENS Fetching logic can remain server-side if desired
  let fetchedEnsName: string | null = null;
  if (userAddress) {
    try {
      const response = await fetch(`https://api.ensideas.com/ens/resolve/${userAddress}`);
      if (response.ok) {
        const data = await response.json();
        if (data.name) fetchedEnsName = data.name;
      }
    } catch (error) {
      console.error("Error fetching ENS name in SeedPage:", error);
    }
  }
  const displayName = fetchedEnsName
    ? fetchedEnsName
    : userAddress
      ? `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`
      : 'SuperAdmin';

  return (
    <main className="seed-page-container flex min-h-screen flex-col pt-24 px-4 md:px-24">
      <div className="z-10 w-full items-center justify-between font-mono text-sm">
        {/* Title specific to seeding */}
        <h1 className="text-3xl font-bold mb-4 text-center">Admin Concept Seeding</h1>
        <p className="text-center mb-8">Welcome, {session.user?.role} ({displayName})</p>

        {/* Only render Seed Form */}
        <SeedConceptForm />

        {/* Remove conditional rendering of Draft Form */}
        {/* {session.user?.role === 'superadmin' && ( <ConceptDraftForm /> )} */}

      </div>
    </main>
  );
}

// Restore metadata generation
export const metadata = {
  title: 'Seed | ABSTRACTU',
  description: 'Admin page to seed new concepts.',
}; 