/**
 * Cadastre layer functionality (API Carto)
 * Uses IGN API Carto to display cadastral parcels as GeoJSON features
 */

import { getMap } from './leaflet-base.js';
import logger from '../utils/log.js';

let cadastreLayer = null;
let isActive = false;

const API_CARTO_BASE = 'https://apicarto.ign.fr/api/cadastre/parcelle';

// Sample INSEE code - replace with dynamic detection later
const DEFAULT_INSEE = '75056'; // Paris

/**
 * Build the query URL for API Carto
 * @param {string} insee - INSEE code of the commune
 */
function buildApiUrl(insee = DEFAULT_INSEE) {
  const url = new URL(API_CARTO_BASE);
  url.searchParams.append('code_insee', insee);
  url.searchParams.append('source_ign', 'PCI');
  url.searchParams.append('_limit', '1000');
  return url.toString();
}

/**
 * Initialize the cadastre layer (fetch + GeoJSON render)
 */
export function initCadastreLayer() {
  logger.info('Initializing API Carto cadastre layer');
  const map = getMap();

  const checkbox = document.querySelector('#toggle-cadastre');
  if (!checkbox) {
    logger.error('Missing cadastre toggle checkbox');
    return;
  }

  checkbox.addEventListener('change', async (event) => {
    isActive = event.target.checked;
    if (isActive) {
      logger.info('Loading cadastre from API Carto...');
      const apiUrl = buildApiUrl();
      try {
        const res = await fetch(apiUrl);
        const geojson = await res.json();

        cadastreLayer = L.geoJSON(geojson, {
          style: {
            color: '#cc6600',
            weight: 1,
            fillOpacity: 0.2
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            layer.bindPopup(`Parcelle: ${props.section || ''}-${props.numero || ''}`);
          }
        }).addTo(map);
        logger.info(`Cadastre loaded (${geojson.features.length} features)`);
      } catch (err) {
        logger.error('Error loading cadastre:', err);
      }
    } else {
      if (cadastreLayer) {
        map.removeLayer(cadastreLayer);
        cadastreLayer = null;
        logger.info('Cadastre layer removed');
      }
    }
  });
}
