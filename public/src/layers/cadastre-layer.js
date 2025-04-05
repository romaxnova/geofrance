/**
 * Cadastre layer functionality (API Carto)
 * Uses IGN API Carto to display cadastral parcels as GeoJSON features
 */

import { getMap } from './leaflet-base.js';
import logger from '../utils/log.js';
import { API_URLS } from '../config.js'; // ✅ use config

let cadastreLayer = null;
let isActive = false;

const API_CARTO_BASE = API_URLS.carto.cadastre; // ✅ centralized URL

/**
 * Build a GeoJSON Point geometry string for a given coordinate
 * @param {Array} lngLat - [lng, lat] array
 */
function buildPointGeom(lngLat) {
  return {
    type: 'Point',
    coordinates: lngLat
  };
}

/**
 * Query API Carto for parcels around a point
 * @param {Array} lngLat - [lng, lat]
 */
async function fetchParcelsByPoint(lngLat) {
  const geom = buildPointGeom(lngLat);
  const url = `${API_URLS.carto.cadastre}?source_ign=PCI&geom=${encodeURIComponent(JSON.stringify(geom))}`;
  logger.info(`Fetching cadastre around point ${lngLat.join(', ')}`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const geojson = await res.json();
  return geojson;
}

/**
 * Initialize the cadastre layer using current map center or address later
 */
export function initCadastreLayer() {
  logger.info('Initializing API Carto cadastre layer');
  const map = getMap();
  const checkbox = document.querySelector('#cadastre-layer-toggle');

  if (!checkbox) {
    logger.error('Missing cadastre toggle checkbox');
    return;
  }

  checkbox.addEventListener('change', async (event) => {
    isActive = event.target.checked;
    if (isActive) {
      try {
        const center = map.getCenter();
        const lngLat = [center.lng, center.lat];
        const geojson = await fetchParcelsByPoint(lngLat);

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

