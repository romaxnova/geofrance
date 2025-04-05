/**
 * DVF (Demandes de Valeurs Foncières) layer functionality — using API backend
 * Dynamically loads data for current map bounds and integrates popup info with zoom-sensitive sampling
 */

import { getMap } from './leaflet-base.js';
import logger from '../utils/log.js';

let dvfLayer = null;

/**
 * Initialize the DVF layer
 */
export function initDVFLayer() {
  logger.info('Initializing DVF layer (via API)');

  const map = getMap();
  const checkbox = document.querySelector('#dvf-layer-toggle');

  if (!checkbox) {
    logger.warn('DVF layer toggle not found');
    return;
  }

  checkbox.addEventListener('change', async (e) => {
    if (e.target.checked) {
      map.on('moveend', updateDVFLayer);
      await updateDVFLayer();
    } else {
      if (dvfLayer) {
        map.removeLayer(dvfLayer);
        dvfLayer = null;
        logger.info('DVF layer removed');
      }
      map.off('moveend', updateDVFLayer);
    }
  });
}

/**
 * Fetch and render DVF data for the current map view
 */
async function updateDVFLayer() {
  const map = getMap();
  const bounds = map.getBounds();
  const zoom = map.getZoom();

  const bbox = [
    bounds.getSouthWest().lng.toFixed(5),
    bounds.getSouthWest().lat.toFixed(5),
    bounds.getNorthEast().lng.toFixed(5),
    bounds.getNorthEast().lat.toFixed(5)
  ].join(',');

  // Adjust sampling limit by zoom level (fewer points at low zoom)
  let sampleLimit = 1000;
  if (zoom < 8) sampleLimit = 100;
  else if (zoom < 11) sampleLimit = 300;
  else if (zoom < 13) sampleLimit = 600;

  logger.info('Fetching DVF data for bounds:', bbox);

  try {
    const res = await fetch(`https://dvf-api-production.up.railway.app/api/dvf?bbox=${bbox}&limit=${sampleLimit}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      logger.warn('No DVF data received');
      return;
    }

    if (dvfLayer) {
      dvfLayer.clearLayers();
    } else {
      dvfLayer = L.layerGroup();
    }

    data.forEach(entry => {
      const lat = parseFloat(entry.latitude);
      const lon = parseFloat(entry.longitude);
      if (!lat || !lon) return;

      const price = parseFloat(entry.valeur_fonciere);
      const surface = parseFloat(entry.surface_reelle_bati);
      const date = new Date(entry.date_mutation).toLocaleDateString('fr-FR');
      const prixM2 = surface > 0 ? (price / surface) : null;

      const marker = L.circleMarker([lat, lon], {
        radius: 6,
        fillColor: '#1976D2',
        color: '#0D47A1',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      });

      const formattedPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
      const prixM2Text = prixM2 ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prixM2) : '-';

      marker.bindPopup(`
        <div class="dvf-popup">
          <h4>${entry.type_local || 'Bien'}</h4>
          <p><strong>Prix:</strong> ${formattedPrice}</p>
          <p><strong>Surface:</strong> ${surface || '?'} m²</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Prix/m²:</strong> ${prixM2Text}</p>
        </div>
      `);

      marker.addTo(dvfLayer);
    });

    dvfLayer.addTo(map);
    logger.info(`DVF layer updated (${data.length} records)`);
  } catch (err) {
    logger.error('Failed to load DVF API data:', err);
  }
}
