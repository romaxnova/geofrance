import { getMap } from './leaflet-base.js';
import logger from '../utils/log.js';

let dvfLayer = null;

export function initDVFLayer() {
  logger.info('Initializing DVF layer (via API)');

  const map = getMap();
  const checkbox = document.querySelector('#dvf-layer-toggle');
  const filtersPanel = document.querySelector('#dvf-filters');
  const toggleBtn = document.getElementById('toggle-dvf-filters');

  if (!checkbox) {
    logger.warn('DVF layer toggle not found');
    return;
  }

  // Toggle the filters panel drawer
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      filtersPanel?.classList.toggle('active');
    });
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

  const applyBtn = document.getElementById('apply-filters');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      logger.info('Apply button clicked — updating DVF layer');
      updateDVFLayer();
    });
  }
}

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

      marker.on('click', async () => {
        try {
          const res = await fetch(`https://dvf-api-production.up.railway.app/api/dvf/grouped?bbox=${lon - 0.0002},${lat - 0.0002},${lon + 0.0002},${lat + 0.0002}`);
          const grouped = await res.json();

          const clickedSale = grouped.find(g => Math.abs(g.latitude - lat) < 0.0001 && Math.abs(g.longitude - lon) < 0.0001);

          openPropertyPanel(clickedSale);
        } catch (err) {
          console.error('Erreur chargement mutations DVF:', err);
        }
      });

      dvfLayer.addLayer(marker);
    });

    dvfLayer.addTo(map);
    logger.info(`DVF layer updated (${unique.length} unique records)`);
  } catch (err) {
    logger.error('Failed to load DVF API data:', err);
  }
}

function openPropertyPanel(data) {
  const panel = document.getElementById('property-panel');
  if (!panel) return;

  panel.innerHTML = renderPropertyPanel(data);
  panel.classList.add('active');

  document.getElementById('close-panel')?.addEventListener('click', () => {
    panel.classList.remove('active');
  });

  // Activate Lucide icons after dynamic injection
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderPropertyPanel(data) {
  if (!data || !data.lots || data.lots.length === 0) {
    return '<p>Aucune donnée disponible à cette adresse.</p>';
  }

  const date = new Date(data.date_mutation).toLocaleDateString('fr-FR');
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(data.valeur_fonciere);

  // Group by type + surface + pieces to avoid duplicates
  const summarizedLots = [];
  const lotMap = new Set();

  data.lots.forEach(lot => {
    const key = `${lot.type_local}-${lot.Surface || 'n/a'}-${lot.nombre_pieces_principales || '?'}`;
    if (!lotMap.has(key)) {
      lotMap.add(key);
      summarizedLots.push(lot);
    }
  });

  // Gather all unique Carrez values
  const carrezLots = [];
  const seenCarrez = new Set();

  data.lots.forEach(lot => {
    const values = [lot.Carrez].filter(x => x !== null && !isNaN(x));
    values.forEach(val => {
      const rounded = Math.round(val * 100) / 100;
      if (!seenCarrez.has(rounded)) {
        seenCarrez.add(rounded);
        carrezLots.push(rounded);
      }
    });
  });

  return `
    <div class="panel-header">
      <h2>${data.adresse || 'Adresse inconnue'}</h2>
      <button id="close-panel">&times;</button>
    </div>
    <div class="mutations-container">
      <div class="mutation-block">
        <h3 style="color:#0d46a8">${date} — ${formattedPrice}</h3>

        ${summarizedLots
          .map(lot => {
            const surface = lot.Surface ? `${lot.Surface} m²` : 'n/a';
            const pieces = lot.nombre_pieces_principales ?? '?';
            return `
              <div class="lot-row" style="border-left: 4px solid #ccc; padding-left: 0.8rem; margin-bottom: 0.4rem;">
                <div><strong>${lot.type_local}</strong></div>
                <div>📐 ${surface}</div>
                <div>🛏️ ${pieces} ${pieces === '?' || pieces === 1 ? 'pièce' : 'pièces'}</div>
              </div>
            `;
          })
          .join('')}

        ${
          carrezLots.length > 0
            ? `<h4 style="color:#0d46a8; margin-top:1rem;">Lots Carrez complémentaires</h4>
              ${carrezLots
                .map(
                  (c, i) =>
                    `<div class="lot-row" style="font-size: 0.9rem; color: #333;"><span style="color: #1976d2;">🔹 Lot ${i + 1}</span> — Carrez: ${c} m²</div>`
                )
                .join('')}`
            : ''
        }
      </div>
    </div>
  `;
}
