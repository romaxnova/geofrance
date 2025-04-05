/**
 * DVF (Demandes de Valeurs Foncières) layer functionality — using API backend
 * Handles property sale data visualization via the live Express API deployed on Railway
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
      try {
        const res = await fetch('https://dvf-api-production.up.railway.app/api/dvf?code_commune=75107&date_min=2024-01-01');
        const data = await res.json();

        if (!data || data.length === 0) {
          logger.warn('No DVF data received');
          return;
        }

        dvfLayer = L.layerGroup();

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
        logger.info(`DVF layer rendered (${data.length} records)`);

      } catch (err) {
        logger.error('Failed to load DVF API data:', err);
      }
    } else {
      if (dvfLayer) {
        map.removeLayer(dvfLayer);
        dvfLayer = null;
        logger.info('DVF layer removed');
      }
    }
  });
}
