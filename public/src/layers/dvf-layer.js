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
  const filtersPanel = document.querySelector('#dvf-filters');
  const closePanel = document.getElementById('property-panel-close');

  if (!checkbox) {
    logger.warn('DVF layer toggle not found');
    return;
  }

  checkbox.addEventListener('change', async (e) => {
    if (e.target.checked) {
      map.on('moveend', updateDVFLayer);
      if (filtersPanel) filtersPanel.style.display = 'block';
      await updateDVFLayer();
    } else {
      if (dvfLayer) {
        map.removeLayer(dvfLayer);
        dvfLayer = null;
        logger.info('DVF layer removed');
      }
      if (filtersPanel) filtersPanel.style.display = 'none';
      const panel = document.getElementById('property-panel');
      if (panel) panel.classList.add('hidden');
      map.off('moveend', updateDVFLayer);
    }
  });

  if (closePanel) {
    closePanel.addEventListener('click', () => {
      document.getElementById('property-panel').classList.add('hidden');
    });
  }

  const applyBtn = document.getElementById('apply-filters');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      logger.info('Appliquer button clicked — updating DVF layer');
      updateDVFLayer();
    });
  }
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

  let sampleLimit = 1000;
  if (zoom < 8) sampleLimit = 100;
  else if (zoom < 11) sampleLimit = 300;
  else if (zoom < 13) sampleLimit = 600;

  const params = new URLSearchParams({ bbox, limit: sampleLimit });

  const yearMin = document.getElementById('year-min')?.value;
  const yearMax = document.getElementById('year-max')?.value;
  const priceMin = document.getElementById('price-min')?.value;
  const priceMax = document.getElementById('price-max')?.value;
  const priceM2Min = document.getElementById('price-m2-min')?.value;
  const priceM2Max = document.getElementById('price-m2-max')?.value;

  if (yearMin) params.append('year_min', yearMin);
  if (yearMax) params.append('year_max', yearMax);
  if (priceMin) params.append('price_min', priceMin);
  if (priceMax) params.append('price_max', priceMax);
  if (priceM2Min) params.append('price_m2_min', priceM2Min);
  if (priceM2Max) params.append('price_m2_max', priceM2Max);

  logger.info('Fetching DVF data for bounds and filters:', params.toString());

  try {
    const res = await fetch(`https://dvf-api-production.up.railway.app/api/dvf?${params.toString()}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      logger.warn('No DVF data received');
      return;
    }

    const seen = new Set();
    const unique = [];
    data.forEach(entry => {
      const key = `${entry.latitude}-${entry.longitude}-${entry.valeur_fonciere}-${entry.date_mutation}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(entry);
      }
    });

    if (dvfLayer) {
      dvfLayer.clearLayers();
    } else {
      dvfLayer = L.markerClusterGroup();
    }

    unique.forEach(entry => {
      const lat = parseFloat(entry.latitude);
      const lon = parseFloat(entry.longitude);
      if (!lat || !lon) return;

      const marker = L.circleMarker([lat, lon], {
        radius: 6,
        fillColor: '#1976D2',
        color: '#0D47A1',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      });

      marker.on('click', () => {
        const latStr = lat.toFixed(5);
        const lonStr = lon.toFixed(5);

        fetch(`https://dvf-api-production.up.railway.app/api/dvf/grouped?bbox=${lon - 0.001},${lat - 0.001},${lon + 0.001},${lat + 0.001}`)
          .then(r => r.json())
          .then(grouped => {
            const match = grouped.find(g => g.latitude.toFixed(5) === latStr && g.longitude.toFixed(5) === lonStr);
            if (match) showPropertyPanel(match);
          });
      });

      dvfLayer.addLayer(marker);
    });

    dvfLayer.addTo(map);
    logger.info(`DVF layer updated (${unique.length} unique records)`);
  } catch (err) {
    logger.error('Failed to load DVF API data:', err);
  }
}

function showPropertyPanel(property) {
  const panel = document.getElementById('property-panel');
  panel.classList.remove('hidden');
  panel.innerHTML = `
    <div class="property-header">
      <h3>${property.adresse}</h3>
      <button id="property-panel-close">✕</button>
    </div>
    <div class="property-body">
      ${property.mutations.map(m => `
        <div class="mutation-block">
          <div class="mutation-header">
            <span>${new Date(m.date_mutation).toLocaleDateString('fr-FR')}</span>
            <span class="price">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(m.valeur_fonciere)}</span>
          </div>
          <div class="lots">
            ${m.lots.map(l => `
              <div class="lot-row">
                <span>${l.type_local || 'Type inconnu'}</span>
                <span>${l.surface_reelle_bati ? l.surface_reelle_bati + ' m²' : ''}</span>
                <span>${l.nombre_pieces_principales ? l.nombre_pieces_principales + ' pièces' : ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const closeBtn = document.getElementById('property-panel-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.add('hidden');
    });
  }
}
