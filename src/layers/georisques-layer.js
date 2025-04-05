/**
 * Géorisques layer functionality
 * Handles risk layer visualization from the Géorisques API
 */

import { API_URLS, LAYER_CONFIG } from '../config.js';
import logger from '../utils/log.js';
import { getMap } from './leaflet-base.js';

let riskLayer = null;

/**
 * Initialize the Géorisques risk layer
 * @returns {Object} Risk layer instance
 */
export function initRiskLayer() {
    logger.info('Initializing Géorisques risk layer');
    
    try {
        // Get map instance
        const map = getMap();
        
        // Create WMS layer for flood risk
        riskLayer = L.tileLayer.wms(API_URLS.georisques.floodRisk, {
            layers: LAYER_CONFIG.georisques.floodRisk.layers,
            format: LAYER_CONFIG.georisques.floodRisk.format,
            transparent: LAYER_CONFIG.georisques.floodRisk.transparent,
            opacity: LAYER_CONFIG.georisques.floodRisk.opacity,
            attribution: 'Données © <a href="https://www.georisques.gouv.fr/">Géorisques</a>'
        });
        
        logger.info('Géorisques risk layer initialized successfully');
        
        // Connect toggle button
        connectToggleButton();
        
        return riskLayer;
    } catch (error) {
        logger.error('Failed to initialize Géorisques risk layer:', error);
        throw error;
    }
}

/**
 * Connect the risk layer toggle button
 */
function connectToggleButton() {
    const toggleButton = document.getElementById('risk-layer-toggle');
    
    if (!toggleButton) {
        logger.warn('Risk layer toggle button not found');
        return;
    }
    
    toggleButton.addEventListener('change', function() {
        const isChecked = this.checked;
        logger.info(`Risk layer toggle changed: ${isChecked}`);
        
        if (isChecked) {
            showRiskLayer();
        } else {
            hideRiskLayer();
        }
    });
    
    logger.debug('Risk layer toggle button connected');
}

/**
 * Show the risk layer on the map
 */
export function showRiskLayer() {
    logger.info('Showing risk layer');
    
    try {
        const map = getMap();
        
        if (!riskLayer) {
            riskLayer = initRiskLayer();
        }
        
        riskLayer.addTo(map);
        
        // Add info control if not already present
        addInfoControl();
        
        // Show legend
        const legend = document.getElementById('layer-legend');
        if (legend) {
            legend.style.display = 'block';
        }
        
        logger.info('Risk layer shown successfully');
    } catch (error) {
        logger.error('Failed to show risk layer:', error);
    }
}

/**
 * Hide the risk layer from the map
 */
export function hideRiskLayer() {
    logger.info('Hiding risk layer');
    
    try {
        const map = getMap();
        
        if (riskLayer) {
            map.removeLayer(riskLayer);
            
            // Hide legend
            const legend = document.getElementById('layer-legend');
            if (legend) {
                legend.style.display = 'none';
            }
            
            logger.info('Risk layer hidden successfully');
        } else {
            logger.warn('No risk layer to hide');
        }
    } catch (error) {
        logger.error('Failed to hide risk layer:', error);
    }
}

/**
 * Add info control to the map
 */
function addInfoControl() {
    const map = getMap();
    
    // Check if info control already exists
    if (map.infoControl) {
        return;
    }
    
    // Create info control
    const infoControl = L.control({ position: 'bottomright' });
    
    infoControl.onAdd = function() {
        this._div = L.DomUtil.create('div', 'info-control');
        this.update();
        return this._div;
    };
    
    infoControl.update = function() {
        this._div.innerHTML = `
            <h4>Risque d'inondation</h4>
            <p>Cette couche présente les zones exposées au risque d'inondation en France.</p>
            <p>Source: <a href="https://www.georisques.gouv.fr/" target="_blank">Géorisques</a></p>
        `;
    };
    
    infoControl.addTo(map);
    map.infoControl = infoControl;
    
    logger.debug('Info control added to map');
}

/**
 * Test function to verify the risk layer is working
 */
export function testRiskLayer() {
    logger.info('Testing risk layer functionality');
    
    try {
        const layer = initRiskLayer();
        
        if (layer) {
            logger.info('Risk layer test successful');
            return true;
        } else {
            logger.error('Risk layer test failed: layer not initialized');
            return false;
        }
    } catch (error) {
        logger.error('Risk layer test failed:', error);
        return false;
    }
}

export default {
    initRiskLayer,
    showRiskLayer,
    hideRiskLayer,
    testRiskLayer
};
