/**
 * Main application file
 * Orchestrates all features and initializes the application
 */

import logger from './utils/log.js';
import { initMap } from './layers/leaflet-base.js';
import { initAddressSearch } from './layers/ban-search.js';
import { initRiskLayer } from './layers/georisques-layer.js';
import { initCadastreLayer } from './layers/cadastre-layer.js';
import { initDVFLayer } from './layers/dvf-layer.js';

// Log application start
logger.info('Application starting');

/**
 * Initialize the application
 */
function initApp() {
    logger.info('Initializing application');
    
    try {
        // Initialize the base map
        const map = initMap();
        
        if (!map) {
            throw new Error('Failed to initialize map');
        }
        
        // Initialize address search
        initAddressSearch();
        
        // Initialize risk layer
        initRiskLayer();
        
        // Initialize cadastre layer
        initCadastreLayer();
        
        // Initialize DVF layer
        initDVFLayer();
        
        // Log successful initialization
        logger.info('Application initialized successfully');
        
    } catch (error) {
        logger.error('Failed to initialize application:', error);
        // Display error message to user
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.innerHTML = `
                <div class="error-message">
                    <h3>Erreur lors de l'initialisation de la carte</h3>
                    <p>Veuillez rafraîchir la page ou consulter la documentation de dépannage.</p>
                </div>
            `;
        }
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export for testing purposes
export default {
    initApp
};
