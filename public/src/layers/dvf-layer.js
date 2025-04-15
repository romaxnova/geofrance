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

  const params = new URLSearchParams({ bbox });

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
    const res = await fetch(`https://dvf-api-production.up.railway.app/api/dvf/grouped?${params.toString()}`);
    const sales = await res.json();

    if (!sales || sales.length === 0) {
      logger.warn('No DVF grouped data received');
      return;
    }

    if (dvfLayer) {
      dvfLayer.clearLayers();
    } else {
      dvfLayer = L.layerGroup();
    }

    // Group sales by address string
    const addressMap = new Map();
    sales.forEach(sale => {
      const key = sale.adresse || `${sale.latitude},${sale.longitude}`;
      if (!addressMap.has(key)) {
        addressMap.set(key, []);
      }
      addressMap.get(key).push(sale);
    });

    for (const [address, entries] of addressMap.entries()) {
      const { latitude, longitude } = entries[0];
      if (!latitude || !longitude) continue;

      const marker = L.circleMarker([latitude, longitude], {
        radius: 6,
        fillColor: '#1976D2',
        color: '#0D47A1',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      });

      marker.on('click', () => {
        openGroupedPanel(address, entries);
      });

      dvfLayer.addLayer(marker);
    }

    dvfLayer.addTo(map);
    logger.info(`DVF layer updated (${addressMap.size} address markers)`);
  } catch (err) {
    logger.error('Failed to load DVF grouped data:', err);
  }
}

function openGroupedPanel(address, salesList) {
  const panel = document.getElementById('property-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="panel-header">
      <h2>${address}</h2>
      <button id="close-panel">&times;</button>
    </div>
    <div class="mutations-container">
      ${salesList
        .map(sale => {
          const date = new Date(sale.date_mutation).toLocaleDateString('fr-FR');
          const price = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
          }).format(sale.valeur_fonciere);

          // Deduplicate lots
          const seen = new Set();
          const uniqueLots = (sale.lots || []).filter(lot => {
            const key = `${lot.type_local}|${lot.Surface}|${lot.nombre_pieces_principales}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          const lotRows = uniqueLots
            .map(lot => {
              const type = lot.type_local || 'Bien';
              const surface = lot.Surface ? `${lot.Surface} m²` : 'n/a';
              const pieces = lot.nombre_pieces_principales ?? '?';
              return `
                <div class="lot-row" style="font-size: 0.9rem;">
                  <div><strong>${type}</strong></div>
                  <div>📐 ${surface}</div>
                  <div>🛏️ ${pieces} pièce${pieces > 1 ? 's' : ''}</div>
                </div>`;
            })
            .join('');

          return `
            <div class="mutation-block">
              <h3 style="color:#0d46a8">${date} — ${price}</h3>
              ${lotRows}
            </div>`;
        })
        .join('')}
    </div>
  `;

  panel.classList.add('active');

  document.getElementById('close-panel')?.addEventListener('click', () => {
    panel.classList.remove('active');
  });

  if (window.lucide) window.lucide.createIcons?.();
}


export function renderGroupedPanel(address, grouped) {
  if (!grouped || grouped.length === 0) {
    return '<p>Aucune mutation disponible à cette adresse.</p>';
  }

  const groupedByMutation = {};
  grouped.forEach(entry => {
    if (!groupedByMutation[entry.id_mutation]) {
      groupedByMutation[entry.id_mutation] = [];
    }
    groupedByMutation[entry.id_mutation].push(entry);
  });

  const sections = Object.entries(groupedByMutation)
    .sort((a, b) => new Date(b[1][0].date_mutation) - new Date(a[1][0].date_mutation))
    .map(([mutationId, entries]) => {
      const mutation = entries[0];
      const date = new Date(mutation.date_mutation).toLocaleDateString('fr-FR');
      const formattedPrice = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(mutation.valeur_fonciere);

      // Flatten all lots across entries
      const allLots = entries.flatMap(e => e.lots || []);

      // Deduplicate based on type/surface/rooms
      const seen = new Set();
      const filteredLots = allLots.filter(lot => {
        const key = `${lot.type_local}|${lot.Surface}|${lot.nombre_pieces_principales}|${lot.Carrez}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const lotRows = filteredLots.map((lot, idx) => {
        const type = lot.type_local ?? 'Type inconnu';
        const surface = lot.Surface ? `${lot.Surface} m²` : 'n/a';
        const carrez = lot.Carrez ? ` (Carrez: ${lot.Carrez} m²)` : '';
        const pieces = lot.nombre_pieces_principales ?? '?';

        return `
          <div class="lot-row" style="border-left: 4px solid #ccc; padding-left: 0.8rem; margin-bottom: 0.4rem;">
            <div><strong>${type}</strong></div>
            <div>📐 ${surface}${carrez}</div>
            <div>🛏️ ${pieces === '?' ? '-' : pieces} pièce${pieces > 1 ? 's' : ''}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="mutation-block">
          <h3 style="color:#0d46a8">${date} — ${formattedPrice}</h3>
          ${lotRows}
        </div>
      `;
    }).join('');

  return `
    <div class="panel-header">
      <h2>${address}</h2>
      <button id="close-panel">&times;</button>
    </div>
    <div class="mutations-container">
      ${sections}
    </div>
  `;
}

