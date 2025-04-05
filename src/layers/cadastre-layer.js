/**
 * Cadastre layer functionality
 * Handles cadastre layer visualization from the IGN WMS service
 */

import { API_URLS, LAYER_CONFIG } from '../config.js';
import logger from '../utils/log.js';
import { getMap } from './leaflet-base.js';

let cadastreLayer = null;

/**
 * Initialize the Cadastre layer
 * @returns {Object} Cadastre layer instance
 */
export function initCadastreLayer() {
    logger.info('Initializing Cadastre layer');
    
    try {
        // Get map instance
        const map = getMap();
        
        // Create WMS layer for cadastre
        cadastreLayer = L.tileLayer.wms(API_URLS.ign.cadastreWMS, {
            layers: LAYER_CONFIG.ign.cadastre.layers,
            format: LAYER_CONFIG.ign.cadastre.format,
            transparent: LAYER_CONFIG.ign.cadastre.transparent,
            opacity: LAYER_CONFIG.ign.cadastre.opacity,
            styles: LAYER_CONFIG.ign.cadastre.styles,
            attribution: '&copy; <a href="https://geoservices.ign.fr/">IGN</a>'
        });
        
        logger.info('Cadastre layer initialized successfully');
        
        // Connect toggle button
        connectToggleButton();
        
        return cadastreLayer;
    } catch (error) {
        logger.error('Failed to initialize Cadastre layer:', error);
        throw error;
    }
}

/**
 * Connect the cadastre layer toggle button
 */
function connectToggleButton() {
    const toggleButton = document.getElementById('cadastre-layer-toggle');
    
    if (!toggleButton) {
        logger.warn('Cadastre layer toggle button not found');
        return;
    }
    
    toggleButton.addEventListener('change', function() {
        const isChecked = this.checked;
        logger.info(`Cadastre layer toggle changed: ${isChecked}`);
        
        if (isChecked) {
            showCadastreLayer();
        } else {
            hideCadastreLayer();
        }
    });
    
    logger.debug('Cadastre layer toggle button connected');
}

/**
 * Show the cadastre layer on the map
 */
export function showCadastreLayer() {
    logger.info('Showing cadastre layer');
    
    try {
        const map = getMap();
        
        if (!cadastreLayer) {
            cadastreLayer = initCadastreLayer();
        }
        
        cadastreLayer.addTo(map);
        
        // Show legend
        const legend = document.getElementById('cadastre-legend');
        if (legend) {
            legend.style.display = 'block';
        }
        
        logger.info('Cadastre layer shown successfully');
    } catch (error) {
        logger.error('Failed to show cadastre layer:', error);
    }
}

/**
 * Hide the cadastre layer from the map
 */
export function hideCadastreLayer() {
    logger.info('Hiding cadastre layer');
    
    try {
        const map = getMap();
        
        if (cadastreLayer) {
            map.removeLayer(cadastreLayer);
            
            // Hide legend
            const legend = document.getElementById('cadastre-legend');
            if (legend) {
                legend.style.display = 'none';
            }
            
            logger.info('Cadastre layer hidden successfully');
        } else {
            logger.warn('No cadastre layer to hide');
        }
    } catch (error) {
        logger.error('Failed to hide cadastre layer:', error);
    }
}

/**
 * Test function to verify the cadastre layer is working
 */
export function testCadastreLayer() {
    logger.info('Testing cadastre layer functionality');
    
    try {
        const layer = initCadastreLayer();
        
        if (layer) {
            logger.info('Cadastre layer test successful');
            return true;
        } else {
            logger.error('Cadastre layer test failed: layer not initialized');
            return false;
        }
    } catch (error) {
        logger.error('Cadastre layer test failed:', error);
        return false;
    }
}

export default {
    initCadastreLayer,
    showCadastreLayer,
    hideCadastreLayer,
    testCadastreLayer
};
