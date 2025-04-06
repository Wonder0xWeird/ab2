'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import "@uiw/react-md-editor/markdown-editor.css";
import { IConcept } from '@/utils/mongodb/models'; // Assuming this type might be useful

// Dynamically import the Markdown editor
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

interface ConceptInfo {
  cid: string;
  title: string;
}

interface ConceptDraftFormProps {
  cid: string; // Receive cid as a prop
}

interface DraftData {
  _id?: string; // Draft ID if loaded
  content: string;
}

export default function ConceptDraftForm({ cid }: ConceptDraftFormProps) { // Destructure cid from props
  const { data: session } = useSession();
  const [draft, setDraft] = useState<DraftData>({ content: '' });
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch draft content based on the cid prop
  useEffect(() => {
    // Use cid prop directly. Ensure it's valid and session is available.
    if (!cid || !/^[a-z]$/.test(cid) || !session?.user) return;

    const fetchDraft = async () => {
      setIsLoadingDraft(true);
      setError(null);
      setSuccessMessage(null);
      setDraft({ content: '' }); // Reset draft content
      try {
        // Fetch draft using the cid prop
        const response = await fetch(`/api/admin/drafts?cid=${cid}`);
        if (response.status === 404) {
          console.log(`No existing draft found for concept ${cid}.`);
          // Use cid prop in placeholder
          setDraft({ content: `# Start Draft for ${cid}\n\n...` });
          return; // Exit successfully
        }
        if (!response.ok) throw new Error('Failed to fetch draft');
        const data = await response.json();
        if (data.success && data.draft) {
          setDraft({ _id: data.draft._id, content: data.draft.content });
          setSuccessMessage('Existing draft loaded.');
        } else {
          // Handle case where API returns success=false or no draft
          console.log(`No existing draft found or error for concept ${cid}.`);
          // Use cid prop in placeholder
          setDraft({ content: `# Start Draft for ${cid}\n\n...` });
        }
      } catch (err: any) {
        setError(`Error loading draft: ${err.message}`);
      } finally {
        setIsLoadingDraft(false);
      }
    };

    fetchDraft();
  }, [cid, session]); // Rerun when cid prop or session changes

  const handleMarkdownChange = (value?: string) => {
    setDraft(prev => ({ ...prev, content: value || '' }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSaveDraft = async () => {
    // Use cid prop directly
    if (!cid || !draft) return;
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    // Use cid prop in log and API call
    console.log("Saving Draft:", { cid: cid, content: draft.content });

    try {
      // Use cid prop in API call body
      const response = await fetch('/api/admin/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Use cid prop here
        body: JSON.stringify({ cid: cid, content: draft.content }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save draft');
      }
      // Update local draft state with the ID returned from API
      setDraft(prev => ({ ...prev, _id: data.draft._id }));
      setSuccessMessage('Draft saved successfully!');
    } catch (err: any) {
      setError(`Error saving draft: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishDraft = async () => {
    // Ensure there's a draft ID to publish
    if (!draft._id) {
      setError('Please save the draft before publishing.');
      return;
    }
    setIsPublishing(true);
    setError(null);
    setSuccessMessage(null);

    console.log("Publishing Draft ID:", draft._id);

    try {
      // TODO: Implement API call to publish draft
      const response = await fetch('/api/admin/drafts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: draft._id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish draft');
      }
      setSuccessMessage(`Draft published successfully! ${data.sentencesAdded || 0} sentences added.`);
      // Reset draft state after successful publish
      setDraft({ content: '' });
    } catch (err: any) {
      setError(`Error publishing draft: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="form-container mt-8 pt-8 border-t border-gold">
      <h2 className="text-2xl font-bold mb-4 text-gold">Manage Concept Draft</h2>

      {error && <p className="form-error">Error: {error}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}

      {/* Draft Editor (Always show if user is admin and on a concept page) */}
      <div>
        <label htmlFor="draftContent" className="form-label">Draft Content (Markdown):</label>
        <div data-color-mode="dark">
          <MDEditor
            value={draft.content}
            onChange={handleMarkdownChange}
            height={500} // Taller editor for drafts
            previewOptions={{ remarkPlugins: [] }}
          />
        </div>
        <p className="form-hint">Content will be parsed into sentences upon publishing.</p>
      </div>

      {/* Action Buttons - Ensure flex row layout */}
      {/* The existing classes `flex flex-col sm:flex-row gap-4 mt-6` already handle this well. */}
      {/* `sm:flex-row` makes them side-by-side on screens larger than `sm` */}
      {/* `gap-4` provides spacing */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSaving || isPublishing || isLoadingDraft}
          className="btn btn-ghost flex-1"
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          type="button"
          onClick={handlePublishDraft}
          disabled={isPublishing || isSaving || isLoadingDraft || !draft._id}
          title={!draft._id ? "Save draft first" : "Publish content"}
          className="btn btn-brand flex-1"
        >
          {isPublishing ? 'Publishing...' : 'Publish Draft'}
        </button>
      </div>
    </div>
  );
} 