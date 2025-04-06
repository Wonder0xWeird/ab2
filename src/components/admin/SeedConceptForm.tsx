'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import "@uiw/react-md-editor/markdown-editor.css";
import { IConcept } from '@/utils/mongodb/models'; // Corrected import path

// Dynamically import the Markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

interface SeedConceptFormData {
  cid: string;
  title: string;
  description: string;
  coverImage: string;
  tags: string; // Input as comma-separated string
  initialContent: string; // Markdown content - kept in UI state for now
}

export default function SeedConceptForm() {
  const [formData, setFormData] = useState<SeedConceptFormData>({
    cid: '',
    title: '',
    description: '',
    coverImage: '',
    tags: '',
    initialContent: '# New Concept\n\nStart writing...\n' // Default initial content
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Special handling for cid to enforce lowercase
    if (name === 'cid') {
      setFormData(prev => ({ ...prev, [name]: value.toLowerCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(null); // Clear error on input change
    setSuccessMessage(null);
  };

  const handleMarkdownChange = (value?: string) => {
    setFormData(prev => ({ ...prev, initialContent: value || '' }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // 1. Prepare data for the API (Now includes initialContent)
    // Use a more specific type for the payload if possible, or keep it simple
    const apiPayload = {
      cid: formData.cid.toLowerCase().trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      coverImage: formData.coverImage.trim() || undefined,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      initialContent: formData.initialContent // Include the markdown content
    };

    console.log("Submitting Concept Data:", apiPayload); // Log the full payload

    // 2. Call the actual API endpoint
    try {
      const response = await fetch('/api/admin/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload), // Send the full payload
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      console.log("API Response:", responseData);
      // Update success message to reflect content being processed
      setSuccessMessage(`Concept '${apiPayload.title}' and its initial content submitted successfully! Check server logs for sentence count.`);

      // Reset form on success
      setFormData({
        cid: '',
        title: '',
        description: '',
        coverImage: '',
        tags: '',
        initialContent: '# New Concept\n\nStart writing...\n'
      });

    } catch (err: any) {
      console.error("API Call Error:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {error && <p className="form-error">Error: {error}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}

      <div>
        <label htmlFor="cid" className="form-label">Concept ID (Subdomain Letter):</label>
        <input
          type="text"
          id="cid"
          name="cid"
          value={formData.cid}
          onChange={handleInputChange}
          required
          pattern="^[a-z]$" // Updated pattern: Enforce single lowercase letter
          maxLength={1}    // Ensure only one character
          title="Must be a single lowercase letter (a-z)."
          className="form-input"
          placeholder="e.g., w, e, z"
        />
        <p className="form-hint">Single lowercase letter. Becomes the subdomain (e.g., w.ab2.observer).</p>
      </div>

      <div>
        <label htmlFor="title" className="form-label">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="description" className="form-label">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={3}
          className="form-textarea"
        />
      </div>

      <div>
        <label htmlFor="coverImage" className="form-label">Cover Image URL (Optional):</label>
        <input
          type="url"
          id="coverImage"
          name="coverImage"
          value={formData.coverImage}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="tags" className="form-label">Tags (Optional, comma-separated):</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="initialContent" className="form-label">Initial Content (Markdown):</label>
        <div data-color-mode="dark">
          <MDEditor
            value={formData.initialContent}
            onChange={handleMarkdownChange}
            height={400}
            previewOptions={{
              remarkPlugins: [],
            }}
          />
        </div>
        <p className="form-hint">This content will be parsed into sentences upon submission.</p>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-brand btn-full-width flex justify-center py-2 px-4 text-sm font-medium"
        >
          {isSubmitting ? 'Seeding...' : 'Seed Concept & Content'}
        </button>
      </div>
    </form>
  );
} 