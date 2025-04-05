/**
 * Configuration file for the application
 * Contains API URLs, constants, and other configuration parameters
 */

// Base map configuration
export const MAP_CONFIG = {
    center: [46.603354, 1.888334], // Center of France
    zoom: 6,
    minZoom: 5,
    maxZoom: 18
};

// Tile layer configuration
export const TILE_LAYER = {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// API URLs
export const API_URLS = {
    // BAN API (Base Adresse Nationale)
    ban: {
        search: 'https://api-adresse.data.gouv.fr/search/',
        reverse: 'https://api-adresse.data.gouv.fr/reverse/',
        autocomplete: 'https://api-adresse.data.gouv.fr/search/?autocomplete=1'
    },
    // Géorisques API
    georisques: {
        base: 'https://www.georisques.gouv.fr/api/v1',
        // We'll use flood risk as our example risk layer
        floodRisk: 'https://www.georisques.gouv.fr/services/zonages_inondation/mapserver/wms'
    },
    // IGN Cadastre WMS
    ign: {
        cadastreWMS: 'https://wxs.ign.fr/essentiels/geoportail/r/wms'
    },
    // DVF (Demandes de Valeurs Foncières)
    dvf: {
        // We'll use a static sample for this implementation
        sampleData: '../data/dvf-sample.json'
    },
    // API Carto Cadastre (GeoJSON-based)
    carto: {
        cadastre: 'https://apicarto.ign.fr/api/cadastre/parcelle'
    }
};

// Layer configuration
export const LAYER_CONFIG = {
    georisques: {
        floodRisk: {
            layers: 'ZONE_INONDABLE',
            format: 'image/png',
            transparent: true,
            opacity: 0.7
        }
    },
    ign: {
        cadastre: {
            layers: 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            styles: 'line'
        }
    },
    dvf: {
        // Configuration for DVF markers
        markerColor: '#1e88e5',
        markerRadius: 8,
        // Filter settings
        defaultYearRange: 5, // Last 5 years
        minPrice: 0,
        maxPrice: 2000000 // 2 million euros as default max
    }
};

// Application settings
export const APP_CONFIG = {
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    searchResultLimit: 5
};
