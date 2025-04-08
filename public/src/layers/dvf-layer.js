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
      map.off('moveend', updateDVFLayer);
    }
  });

  const applyBtn = document.getElementById('apply-filters');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      logger.info('Appliquer button clicked — updating DVF layer');
      updateDVFLayer();
    });
  }

  const closePanel = document.getElementById('close-property-panel');
  if (closePanel) {
    closePanel.addEventListener('click', () => {
      document.getElementById('property-panel').classList.add('hidden');
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

  // Adjust sampling limit by zoom level (fewer points at low zoom)
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
          .then(data => {
            const property = data.find(p => p.latitude.toFixed(5) === latStr && p.longitude.toFixed(5) === lonStr);
            if (property) showPropertyPanel(property);
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
  const addressEl = document.getElementById('property-address');
  const salesEl = document.getElementById('property-sales');

  panel.classList.remove('hidden');
  addressEl.textContent = property.adresse;
  salesEl.innerHTML = '';

  const sale = document.createElement('div');
  sale.className = 'property-sale';
  sale.innerHTML = `
    <h4>Mutation du ${new Date(property.date_mutation).toLocaleDateString('fr-FR')}</h4>
    <p><strong>Valeur foncière:</strong> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(property.valeur_fonciere)}</p>
    <p><strong>Lots:</strong></p>
  `;

  property.lots.forEach(lot => {
    const lotEl = document.createElement('div');
    lotEl.className = 'lot';
    lotEl.innerHTML = `
      - ${lot.type_local || 'Type inconnu'}
      ${lot.surface_reelle_bati ? `– ${lot.surface_reelle_bati} m²` : ''}
      ${lot.nombre_pieces_principales ? `– ${lot.nombre_pieces_principales} pièce(s)` : ''}
    `;
    sale.appendChild(lotEl);
  });

  salesEl.appendChild(sale);
}
