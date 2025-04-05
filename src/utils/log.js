/**
 * Logging utility for the application
 * Provides consistent logging with different levels
 */

// Log levels
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

// Import app configuration
import { APP_CONFIG } from '../config.js';

// Get current log level from config
const currentLogLevel = getLogLevelValue(APP_CONFIG.logLevel);

/**
 * Convert string log level to numeric value
 * @param {string} level - Log level as string
 * @returns {number} Numeric log level
 */
function getLogLevelValue(level) {
    switch (level.toLowerCase()) {
        case 'debug': return LOG_LEVELS.DEBUG;
        case 'info': return LOG_LEVELS.INFO;
        case 'warn': return LOG_LEVELS.WARN;
        case 'error': return LOG_LEVELS.ERROR;
        default: return LOG_LEVELS.INFO;
    }
}

/**
 * Log a debug message
 * @param {string} message - Message to log
 * @param {any} data - Optional data to log
 */
export function debug(message, data = null) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
        if (data) {
            console.debug(`[DEBUG] ${message}`, data);
        } else {
            console.debug(`[DEBUG] ${message}`);
        }
    }
}

/**
 * Log an info message
 * @param {string} message - Message to log
 * @param {any} data - Optional data to log
 */
export function info(message, data = null) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
        if (data) {
            console.info(`[INFO] ${message}`, data);
        } else {
            console.info(`[INFO] ${message}`);
        }
    }
}

/**
 * Log a warning message
 * @param {string} message - Message to log
 * @param {any} data - Optional data to log
 */
export function warn(message, data = null) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
        if (data) {
            console.warn(`[WARN] ${message}`, data);
        } else {
            console.warn(`[WARN] ${message}`);
        }
    }
}

/**
 * Log an error message
 * @param {string} message - Message to log
 * @param {any} data - Optional data to log
 */
export function error(message, data = null) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
        if (data) {
            console.error(`[ERROR] ${message}`, data);
        } else {
            console.error(`[ERROR] ${message}`);
        }
    }
}

/**
 * Log a message with a timestamp
 * @param {string} message - Message to log
 */
export function logWithTime(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

// Export all functions as a logger object
export default {
    debug,
    info,
    warn,
    error,
    logWithTime
};
