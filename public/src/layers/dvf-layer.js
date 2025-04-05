/**
 * DVF (Demandes de Valeurs Foncières) layer functionality
 * Handles property sale data visualization
 */

import { API_URLS, LAYER_CONFIG } from '../config.js';
import logger from '../utils/log.js';
import fetchUtils from '../utils/fetch-utils.js';
import { getMap } from './leaflet-base.js';

let dvfLayer = null;
let dvfMarkers = [];
let originalData = null;
let filteredData = null;

/**
 * Initialize the DVF layer
 * @returns {Object} DVF layer instance
 */
export function initDVFLayer() {
    logger.info('Initializing DVF layer');
    
    try {
        // Create a layer group for DVF markers
        dvfLayer = L.layerGroup();
        
        // Connect toggle button
        connectToggleButton();
        
        // Connect filter controls
        connectFilterControls();
        
        logger.info('DVF layer initialized successfully');
        
        return dvfLayer;
    } catch (error) {
        logger.error('Failed to initialize DVF layer:', error);
        throw error;
    }
}

/**
 * Connect the DVF layer toggle button
 */
function connectToggleButton() {
    const toggleButton = document.getElementById('dvf-layer-toggle');
    
    if (!toggleButton) {
        logger.warn('DVF layer toggle button not found');
        return;
    }
    
    toggleButton.addEventListener('change', function() {
        const isChecked = this.checked;
        logger.info(`DVF layer toggle changed: ${isChecked}`);
        
        if (isChecked) {
            showDVFLayer();
        } else {
            hideDVFLayer();
        }
    });
    
    logger.debug('DVF layer toggle button connected');
}

/**
 * Connect filter controls for DVF data
 */
function connectFilterControls() {
    const applyButton = document.getElementById('apply-filters');
    
    if (!applyButton) {
        logger.warn('DVF filter controls not found');
        return;
    }
    
    applyButton.addEventListener('click', function() {
        logger.info('Applying DVF filters');
        applyFilters();
    });
    
    logger.debug('DVF filter controls connected');
}

/**
 * Load DVF data from the sample file
 * @returns {Promise<Object>} GeoJSON data
 */
async function loadDVFData() {
    logger.info('Loading DVF data');
    
    try {
        // If we already have the data, return it
        if (originalData) {
            return originalData;
        }
        
        // Fetch data from the sample file
        const data = await fetchUtils.fetchData(API_URLS.dvf.sampleData);
        
        logger.info('DVF data loaded successfully', { count: data.features.length });
        
        // Store the original data
        originalData = data;
        filteredData = data;
        
        return data;
    } catch (error) {
        logger.error('Failed to load DVF data:', error);
        throw error;
    }
}

/**
 * Create markers for DVF data
 * @param {Object} data - GeoJSON data
 * @returns {Array} Array of markers
 */
function createDVFMarkers(data) {
    logger.info('Creating DVF markers');
    
    try {
        // Clear existing markers
        dvfMarkers = [];
        
        // Create markers for each feature
        data.features.forEach(feature => {
            const { properties, geometry } = feature;
            const { valeur_fonciere, date_mutation, surface_reelle_bati, type_local } = properties;
            
            // Create marker
            const marker = L.circleMarker([geometry.coordinates[1], geometry.coordinates[0]], {
                radius: LAYER_CONFIG.dvf.markerRadius,
                fillColor: LAYER_CONFIG.dvf.markerColor,
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
            
            // Format price and date
            const price = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(valeur_fonciere);
            const date = new Date(date_mutation).toLocaleDateString('fr-FR');
            
            // Add popup
            marker.bindPopup(`
                <div class="dvf-popup">
                    <h4>${type_local}</h4>
                    <p><strong>Prix:</strong> ${price}</p>
                    <p><strong>Surface:</strong> ${surface_reelle_bati} m²</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Prix/m²:</strong> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(valeur_fonciere / surface_reelle_bati)}</p>
                </div>
            `);
            
            dvfMarkers.push(marker);
        });
        
        logger.info('DVF markers created successfully', { count: dvfMarkers.length });
        
        return dvfMarkers;
    } catch (error) {
        logger.error('Failed to create DVF markers:', error);
        throw error;
    }
}

/**
 * Apply filters to DVF data
 */
function applyFilters() {
    logger.info('Applying filters to DVF data');
    
    try {
        // Get filter values
        const yearFilter = document.getElementById('year-filter').value;
        const priceMin = parseInt(document.getElementById('price-min').value) || 0;
        const priceMax = parseInt(document.getElementById('price-max').value) || Infinity;
        
        logger.debug('Filter values', { yearFilter, priceMin, priceMax });
        
        // Filter data
        filteredData = {
            type: 'FeatureCollection',
            features: originalData.features.filter(feature => {
                const { properties } = feature;
                const { valeur_fonciere, date_mutation } = properties;
                
                // Filter by year
                const year = new Date(date_mutation).getFullYear().toString();
                const yearMatch = yearFilter === 'all' || year === yearFilter;
                
                // Filter by price
                const priceMatch = valeur_fonciere >= priceMin && valeur_fonciere <= priceMax;
                
                return yearMatch && priceMatch;
            })
        };
        
        logger.info('Filtered DVF data', { 
            original: originalData.features.length, 
            filtered: filteredData.features.length 
        });
        
        // If the layer is visible, update it
        const toggleButton = document.getElementById('dvf-layer-toggle');
        if (toggleButton && toggleButton.checked) {
            updateDVFLayer();
        }
    } catch (error) {
        logger.error('Failed to apply filters:', error);
    }
}

/**
 * Update DVF layer with filtered data
 */
function updateDVFLayer() {
    logger.info('Updating DVF layer');
    
    try {
        // Clear existing markers
        if (dvfLayer) {
            dvfLayer.clearLayers();
        }
        
        // Create new markers
        const markers = createDVFMarkers(filteredData);
        
        // Add markers to layer
        markers.forEach(marker => {
            marker.addTo(dvfLayer);
        });
        
        logger.info('DVF layer updated successfully');
    } catch (error) {
        logger.error('Failed to update DVF layer:', error);
    }
}

/**
 * Show the DVF layer on the map
 */
export async function showDVFLayer() {
    logger.info('Showing DVF layer');
    
    try {
        const map = getMap();
        
        // Load data if not already loaded
        if (!originalData) {
            originalData = await loadDVFData();
            filteredData = originalData;
        }
        
        // Create layer if not already created
        if (!dvfLayer) {
            dvfLayer = initDVFLayer();
        }
        
        // Update layer with current filtered data
        updateDVFLayer();
        
        // Add layer to map
        dvfLayer.addTo(map);
        
        // Show legend and filters
        const legend = document.getElementById('dvf-legend');
        const filters = document.getElementById('dvf-filters');
        
        if (legend) {
            legend.style.display = 'block';
        }
        
        if (filters) {
            filters.style.display = 'block';
        }
        
        logger.info('DVF layer shown successfully');
    } catch (error) {
        logger.error('Failed to show DVF layer:', error);
    }
}

/**
 * Hide the DVF layer from the map
 */
export function hideDVFLayer() {
    logger.info('Hiding DVF layer');
    
    try {
        const map = getMap();
        
        if (dvfLayer) {
            map.removeLayer(dvfLayer);
            
            // Hide legend and filters
            const legend = document.getElementById('dvf-legend');
            const filters = document.getElementById('dvf-filters');
            
            if (legend) {
                legend.style.display = 'none';
            }
            
            if (filters) {
                filters.style.display = 'none';
            }
            
            logger.info('DVF layer hidden successfully');
        } else {
            logger.warn('No DVF layer to hide');
        }
    } catch (error) {
        logger.error('Failed to hide DVF layer:', error);
    }
}

/**
 * Test function to verify the DVF layer is working
 */
export async function testDVFLayer() {
    logger.info('Testing DVF layer functionality');
    
    try {
        // Load data
        const data = await loadDVFData();
        
        // Create markers
        const markers = createDVFMarkers(data);
        
        if (data && markers.length > 0) {
            logger.info('DVF layer test successful');
            return true;
        } else {
            logger.error('DVF layer test failed: no data or markers');
            return false;
        }
    } catch (error) {
        logger.error('DVF layer test failed:', error);
        return false;
    }
}

export default {
    initDVFLayer,
    showDVFLayer,
    hideDVFLayer,
    testDVFLayer
};
