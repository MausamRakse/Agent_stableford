/**
 * File handling utilities for JSON input/output
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Read JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<Object>} - Parsed JSON object
 */
export async function readJsonFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in file ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Write JSON file
 * @param {string} filePath - Path to output file
 * @param {Object} data - Data to write
 * @param {boolean} pretty - Whether to format JSON (default: true)
 */
export async function writeJsonFile(filePath, data, pretty = true) {
  try {
    const absolutePath = path.resolve(filePath);
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    
    // Ensure directory exists
    const dir = path.dirname(absolutePath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(absolutePath, content, 'utf-8');
    console.log(`✅ File written successfully: ${filePath}`);
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
}

/**
 * Read multiple JSON files
 * @param {Array<string>} filePaths - Array of file paths
 * @returns {Promise<Array<Object>>} - Array of parsed JSON objects
 */
export async function readJsonFiles(filePaths) {
  const results = [];
  
  for (const filePath of filePaths) {
    try {
      const data = await readJsonFile(filePath);
      results.push({ success: true, data, filePath });
    } catch (error) {
      results.push({ success: false, error: error.message, filePath });
    }
  }
  
  return results;
}

/**
 * Check if file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} - Whether file exists
 */
export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create output directory if it doesn't exist
 * @param {string} dirPath - Directory path
 */
export async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
}

