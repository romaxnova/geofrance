/**
 * Leaflet base map initialization
 * Creates and configures the base map with OpenStreetMap tiles
 */

import { MAP_CONFIG, TILE_LAYER } from '../config.js';
import logger from '../utils/log.js';

let map; // Map instance

/**
 * Initialize the base map with OpenStreetMap tiles
 * @returns {Object} Leaflet map instance
 */
export function initMap() {
    logger.info('Initializing base map');
    
    try {
        // Create map instance
        map = L.map('map', {
            center: MAP_CONFIG.center,
            zoom: MAP_CONFIG.zoom,
            minZoom: MAP_CONFIG.minZoom,
            maxZoom: MAP_CONFIG.maxZoom,
            zoomControl: true
        });
        
        // Add OpenStreetMap tile layer
        L.tileLayer(TILE_LAYER.url, {
            attribution: TILE_LAYER.attribution,
            maxZoom: MAP_CONFIG.maxZoom
        }).addTo(map);
        
        logger.info('Base map initialized successfully');
        
        // Add event listeners
        map.on('zoomend', () => {
            logger.debug(`Zoom level changed to: ${map.getZoom()}`);
        });
        
        map.on('moveend', () => {
            const center = map.getCenter();
            logger.debug(`Map moved to: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`);
        });
        
        return map;
    } catch (error) {
        logger.error('Failed to initialize base map:', error);
        throw error;
    }
}

/**
 * Get the map instance
 * @returns {Object} Leaflet map instance
 */
export function getMap() {
    if (!map) {
        logger.warn('Map not initialized, initializing now');
        return initMap();
    }
    return map;
}

/**
 * Set the map view to specified coordinates
 * @param {Array} coordinates - [latitude, longitude]
 * @param {number} zoom - Zoom level
 */
export function setMapView(coordinates, zoom = 13) {
    if (!map) {
        logger.warn('Map not initialized, initializing now');
        map = initMap();
    }
    
    logger.info(`Setting map view to: ${coordinates[0]}, ${coordinates[1]} (zoom: ${zoom})`);
    map.setView(coordinates, zoom);
}

/**
 * Add a marker to the map
 * @param {Array} coordinates - [latitude, longitude]
 * @param {Object} options - Marker options
 * @returns {Object} Marker instance
 */
export function addMarker(coordinates, options = {}) {
    if (!map) {
        logger.warn('Map not initialized, initializing now');
        map = initMap();
    }
    
    logger.debug(`Adding marker at: ${coordinates[0]}, ${coordinates[1]}`);
    return L.marker(coordinates, options).addTo(map);
}

/**
 * Test function to verify the map is working
 */
export function testMap() {
    logger.info('Testing map functionality');
    
    try {
        const testMap = initMap();
        
        if (testMap) {
            logger.info('Map test successful');
            return true;
        } else {
            logger.error('Map test failed: map not initialized');
            return false;
        }
    } catch (error) {
        logger.error('Map test failed:', error);
        return false;
    }
}

export default {
    initMap,
    getMap,
    setMapView,
    addMarker,
    testMap
};
