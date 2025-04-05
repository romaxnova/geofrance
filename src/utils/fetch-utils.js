/**
 * Fetch utilities for API calls
 * Provides consistent error handling and response processing
 */

import logger from './log.js';

/**
 * Fetch data from an API endpoint
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export async function fetchData(url, options = {}) {
    logger.debug(`Fetching data from: ${url}`);
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        logger.debug('Fetch successful', { url, status: response.status });
        return data;
    } catch (error) {
        logger.error(`Fetch error for ${url}:`, error);
        throw error;
    }
}

/**
 * Build a URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Query parameters
 * @returns {string} URL with query parameters
 */
export function buildUrl(baseUrl, params = {}) {
    const url = new URL(baseUrl);
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
        }
    });
    
    return url.toString();
}

/**
 * Handle fetch errors consistently
 * @param {Error} error - Error object
 * @param {string} context - Context of the error
 * @returns {Object} Error information
 */
export function handleFetchError(error, context) {
    const errorInfo = {
        context,
        message: error.message,
        timestamp: new Date().toISOString()
    };
    
    logger.error(`Error in ${context}:`, errorInfo);
    return errorInfo;
}

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<any>} Response data
 */
export async function fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            logger.error(`Request timeout for ${url}`);
            throw new Error(`Request timeout for ${url}`);
        }
        
        throw error;
    }
}

export default {
    fetchData,
    buildUrl,
    handleFetchError,
    fetchWithTimeout
};
