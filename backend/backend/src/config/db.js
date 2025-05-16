// src/config/db.js

import dotenv from 'dotenv';

// Use the default import for pg to access Pool
import pkg from 'pg';
const { Pool } = pkg;

// Load environment variables from .env file
dotenv.config();

// Initialize the connection pool using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Database URL stored in .env
  ssl: {
    rejectUnauthorized: false, // Important for certain cloud databases (like Neon DB)
  },
});

// Connection test function to verify the connection
const connectDB = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database Connected Successfully');
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    process.exit(1);
  }
};

// Export the pool and connection test function
export { pool, connectDB };
