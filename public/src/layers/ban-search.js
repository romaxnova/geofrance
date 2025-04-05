/**
 * BAN (Base Adresse Nationale) search functionality
 * Handles address search and autocomplete using the BAN API
 */

import { API_URLS, APP_CONFIG } from '../config.js';
import logger from '../utils/log.js';
import fetchUtils from '../utils/fetch-utils.js';
import { getMap, setMapView, addMarker } from './leaflet-base.js';

let searchInput;
let searchResultsContainer;
let currentMarker = null;
let searchTimeout = null;

/**
 * Initialize the address search functionality
 */
export function initAddressSearch() {
    logger.info('Initializing address search');
    
    try {
        // Get DOM elements
        searchInput = document.getElementById('address-search');
        searchResultsContainer = document.getElementById('search-results');
        
        if (!searchInput || !searchResultsContainer) {
            throw new Error('Search elements not found in DOM');
        }
        
        // Add event listeners
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', () => {
            if (searchResultsContainer.children.length > 0) {
                searchResultsContainer.style.display = 'block';
            }
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', (event) => {
            if (!searchInput.contains(event.target) && !searchResultsContainer.contains(event.target)) {
                searchResultsContainer.style.display = 'none';
            }
        });
        
        logger.info('Address search initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize address search:', error);
        throw error;
    }
}

/**
 * Handle search input changes
 * @param {Event} event - Input event
 */
function handleSearchInput(event) {
    const query = event.target.value.trim();
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Clear results if query is empty
    if (query === '') {
        searchResultsContainer.innerHTML = '';
        searchResultsContainer.style.display = 'none';
        return;
    }
    
    // Set timeout to avoid too many requests
    searchTimeout = setTimeout(() => {
        searchAddress(query);
    }, 300);
}

/**
 * Search for addresses using the BAN API
 * @param {string} query - Search query
 */
async function searchAddress(query) {
    logger.debug(`Searching for address: ${query}`);
    
    try {
        // Build URL with query parameters
        const url = fetchUtils.buildUrl(API_URLS.ban.autocomplete, {
            q: query,
            limit: APP_CONFIG.searchResultLimit
        });
        
        // Fetch data from API
        const data = await fetchUtils.fetchData(url);
        
        // Display search results
        displaySearchResults(data.features);
    } catch (error) {
        logger.error(`Address search failed for query "${query}":`, error);
        searchResultsContainer.innerHTML = `
            <div class="search-result-item error">
                Erreur lors de la recherche. Veuillez réessayer.
            </div>
        `;
        searchResultsContainer.style.display = 'block';
    }
}

/**
 * Display search results
 * @param {Array} features - Features from API response
 */
function displaySearchResults(features) {
    // Clear previous results
    searchResultsContainer.innerHTML = '';
    
    if (features.length === 0) {
        searchResultsContainer.innerHTML = `
            <div class="search-result-item">
                Aucun résultat trouvé
            </div>
        `;
        searchResultsContainer.style.display = 'block';
        return;
    }
    
    // Create result items
    features.forEach(feature => {
        const { properties, geometry } = feature;
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.textContent = properties.label;
        
        // Add click event listener
        resultItem.addEventListener('click', () => {
            selectAddress(properties, geometry.coordinates);
        });
        
        searchResultsContainer.appendChild(resultItem);
    });
    
    // Show results container
    searchResultsContainer.style.display = 'block';
}

/**
 * Select an address from search results
 * @param {Object} properties - Address properties
 * @param {Array} coordinates - [longitude, latitude]
 */
function selectAddress(properties, coordinates) {
    logger.info(`Address selected: ${properties.label}`);
    
    // Update search input
    searchInput.value = properties.label;
    
    // Hide search results
    searchResultsContainer.style.display = 'none';
    
    // Get map instance
    const map = getMap();
    
    // Remove previous marker if exists
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    // Note: BAN API returns coordinates as [longitude, latitude]
    // but Leaflet uses [latitude, longitude]
    const latLng = [coordinates[1], coordinates[0]];
    
    // Set map view to selected address
    setMapView(latLng);
    
    // Add marker
    currentMarker = addMarker(latLng, {
        title: properties.label
    });
    
    // Add popup to marker
    currentMarker.bindPopup(`
        <strong>${properties.name || properties.label}</strong><br>
        ${properties.postcode} ${properties.city}
    `).openPopup();
}

/**
 * Test function to verify the address search is working
 */
export function testAddressSearch() {
    logger.info('Testing address search functionality');
    
    try {
        initAddressSearch();
        logger.info('Address search test successful');
        return true;
    } catch (error) {
        logger.error('Address search test failed:', error);
        return false;
    }
}

export default {
    initAddressSearch,
    testAddressSearch
};
