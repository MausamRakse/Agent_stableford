/**
 * Configuration settings for the stock analysis agent
 */

import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  // Google Gemini API Configuration
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  // When true, the agent will not call Gemini and will instead return
  // a deterministic mock JSON response. Useful for offline testing or
  // when API quota is exhausted.
  mockMode: process.env.MOCK_MODE === 'true',
  
  // Model Parameters
  temperature: parseFloat(process.env.TEMPERATURE || '0.3'),
  maxOutputTokens: 8192,
  topP: 0.95,
  topK: 40,
  
  // Agent Configuration
  maxRetries: 3,
  timeoutMs: 60000,
  
  // Scoring Weights
  weights: {
    quantitative: 0.40,
    sis: 0.15,
    ssis: 0.15,
    qualitative: 0.20,
    peerComparison: 0.10
  }
};

/**
 * Validate configuration
 */
export function validateConfig() {
  const errors = [];
  
  if (!CONFIG.googleApiKey) {
    errors.push('GOOGLE_API_KEY is not set in environment variables');
  }
  
  if (CONFIG.temperature < 0 || CONFIG.temperature > 1) {
    errors.push('TEMPERATURE must be between 0 and 1');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
  
  return true;
}

