/**
 * Filecoin client class for ABSTRACTU
 * Uses Lighthouse SDK for decentralized storage on Filecoin
 */
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

/**
 * Input types for the Filecoin client
 */
export interface FilecoinContent {
  content: string;
  metadata: Record<string, any>;
}

/**
 * Response types for the Filecoin client
 */
export interface FilecoinUploadResponse {
  cid: string;
  size: number;
  status: string;
}

export interface FilecoinRetrieveResponse {
  content: string;
  metadata: Record<string, any>;
}

/**
 * Filecoin client class
 */
export class FilecoinClient {
  private static instance: FilecoinClient;
  private apiKey: string;
  private baseUrl: string;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.apiKey = process.env.LIGHTHOUSE_API_KEY || '';
    this.baseUrl = 'https://node.lighthouse.storage';
  }

  /**
   * Get singleton instance of Filecoin client
   */
  public static getInstance(): FilecoinClient {
    if (!FilecoinClient.instance) {
      FilecoinClient.instance = new FilecoinClient();
    }
    return FilecoinClient.instance;
  }

  /**
   * Validate API key is available
   */
  private validateApiKey(): void {
    if (!this.apiKey) {
      throw new Error('Lighthouse API key not provided in environment variables');
    }
  }

  /**
   * Store content on Filecoin
   * @param content Object containing the content and metadata to store
   * @returns Promise resolving to the CID of the stored content
   */
  public async storeContent(content: FilecoinContent): Promise<string> {
    this.validateApiKey();

    try {
      const formData = new FormData();

      // Convert content to JSON
      const contentJson = JSON.stringify(content);

      // Create a readable stream from the JSON string
      const stream = new Readable();
      stream.push(contentJson);
      stream.push(null);

      // Add the file to the form
      formData.append('file', stream, {
        filename: `contribution-${Date.now()}.json`,
        contentType: 'application/json',
      });

      // Upload to Lighthouse
      const response = await axios.post(
        `${this.baseUrl}/api/v0/add`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${this.apiKey}`,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      // Return the CID
      return response.data.cid;
    } catch (error) {
      console.error('Filecoin storage error:', error);
      throw new Error(`Failed to store content on Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve content from Filecoin
   * @param cid The CID of the content to retrieve
   * @returns Promise resolving to the content and metadata
   */
  public async retrieveContent(cid: string): Promise<FilecoinRetrieveResponse> {
    try {
      // Retrieve from Lighthouse
      const response = await axios.get(`${this.baseUrl}/api/v0/cat/${cid}`);

      // Parse the response
      const contentData = response.data;

      // If the response is a string, try to parse it as JSON
      if (typeof contentData === 'string') {
        try {
          return JSON.parse(contentData) as FilecoinRetrieveResponse;
        } catch (error) {
          return {
            content: contentData,
            metadata: {},
          };
        }
      }

      // If the response is already an object
      return contentData as FilecoinRetrieveResponse;
    } catch (error) {
      console.error('Filecoin retrieval error:', error);
      throw new Error(`Failed to retrieve content from Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if content exists on Filecoin
   * @param cid The CID to check
   * @returns Promise resolving to boolean indicating if the content exists
   */
  public async contentExists(cid: string): Promise<boolean> {
    try {
      await axios.head(`${this.baseUrl}/api/v0/cat/${cid}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get status of content on Filecoin
   * @param cid The CID to check
   * @returns Promise resolving to the status of the content
   */
  public async getContentStatus(cid: string): Promise<{ deals: any[] }> {
    this.validateApiKey();

    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v0/status/${cid}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Filecoin status error:', error);
      throw new Error(`Failed to get content status from Filecoin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 