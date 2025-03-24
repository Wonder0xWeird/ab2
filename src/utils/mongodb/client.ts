/**
 * MongoDB client class for ABSTRACTU
 * Optimized for serverless environment with connection pooling
 */
import mongoose from 'mongoose';

export class MongoDBClient {
  private static instance: MongoDBClient;
  private connected = false;
  private connecting = false;
  private uri: string;
  private dbName: string;

  private constructor() {
    // Get connection details from environment variables
    this.uri = process.env.MONGODB_URI || '';
    this.dbName = process.env.MONGODB_DB || '';

    // Debug output for development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`MongoDB URI: ${this.uri ? 'Set' : 'Not set'}`);
      console.log(`MongoDB DB Name: ${this.dbName ? 'Set' : 'Not set'}`);
    }

    // Set mongoose options for better performance
    mongoose.set('strictQuery', true);
  }

  /**
   * Get singleton instance of MongoDB client
   */
  public static getInstance(): MongoDBClient {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient();
    }
    return MongoDBClient.instance;
  }

  /**
   * Connect to MongoDB
   */
  public async connect(): Promise<void> {
    // If already connected or connecting, return
    if (this.connected || this.connecting) {
      return;
    }

    // Default values for local development - ONLY for development
    if (process.env.NODE_ENV !== 'production' && (!this.uri || !this.dbName)) {
      if (!this.uri) this.uri = 'mongodb://localhost:27017/abstractu';
      if (!this.dbName) this.dbName = 'abstractu';
      console.log('Using default MongoDB connection values for development');
    }

    // Validate connection details
    if (!this.uri || !this.dbName) {
      throw new Error('MongoDB connection details not provided in environment variables. Make sure MONGODB_URI and MONGODB_DB are set in .env.local');
    }

    try {
      // Set connecting state
      this.connecting = true;

      // Connect to MongoDB
      await mongoose.connect(this.uri, {
        dbName: this.dbName,
      });

      // Update connection state
      this.connected = true;
      this.connecting = false;

      console.log('Connected to MongoDB');
    } catch (error) {
      this.connecting = false;
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.connected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
      throw error;
    }
  }

  /**
   * Get mongoose connection
   */
  public getConnection(): typeof mongoose {
    return mongoose;
  }

  /**
   * Check if connected to MongoDB
   */
  public isConnected(): boolean {
    return this.connected;
  }
} 