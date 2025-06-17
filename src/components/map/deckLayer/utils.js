/**
 * Generates a stable and predictable layer ID.
 * The ID is deterministic, meaning it will always be the same for the same inputs.
 * This is crucial for Deck.gl to properly diff and manage layers.
 * @param {string} type - The type of the layer (e.g., 'raster', 'pointcloud').
 * @param {string} uniqueIdentifier - A unique string for the layer, typically the datasetId or a combination of datasetId and other feature identifiers.
 * @returns {string} A stable layer ID.
 */
export const getLayerId = (type, uniqueIdentifier) => {
  return `deckgl-${type}-layer-${uniqueIdentifier}`;
};

/**
 * Removes all layers from an array that belong to a specific datasetId.
 * It works by checking if a layer's ID starts with the predictable prefix for that dataset.
 * @param {Array} layers - The array of Deck.gl layers.
 * @param {string} datasetId - The ID of the dataset whose layers should be removed.
 * @returns {Array} A new array of layers with the specified dataset's layers removed.
 */
export const removeDatasetLayers = (layers, datasetId) => {
  if (!datasetId) return layers;

  // This function now robustly filters layers by checking if their ID pertains to the given dataset.
  // It checks against all possible layer types that might be created.
  const prefixes = [
    `deckgl-pointcloud-layer-${datasetId}`,
    `deckgl-raster-layer-${datasetId}`,
    `deckgl-netcdf-2d-layer-${datasetId}`,
    `deckgl-station-layer-${datasetId}`
  ];

  return layers.filter(layer => {
    // A layer belongs to the dataset if its ID starts with any of the dataset's possible prefixes.
    const belongsToDataset = prefixes.some(prefix => layer.id.startsWith(prefix));
    
    if (belongsToDataset) {
      console.log(`🗑️ Removing layer for dataset ${datasetId}:`, layer.id);
    }

    // Keep the layer only if it does NOT belong to the current dataset.
    return !belongsToDataset;
  });
};


// --- The rest of your utility functions remain the same ---

export const calculateGeoJSONBounds = (features) => {
  if (!features || features.length === 0) return null;
  
  let minLng = Infinity, minLat = Infinity;
  let maxLng = -Infinity, maxLat = -Infinity;
  
  features.forEach(feature => {
    if (feature.bbox) {
      minLng = Math.min(minLng, feature.bbox[0]);
      minLat = Math.min(minLat, feature.bbox[1]);
      maxLng = Math.max(maxLng, feature.bbox[2]);
      maxLat = Math.max(maxLat, feature.bbox[3]);
    } else if (feature.geometry) {
      const coords = feature.geometry.coordinates;
      
      if (feature.geometry.type === 'Point') {
        minLng = Math.min(minLng, coords[0]);
        maxLng = Math.max(maxLng, coords[0]);
        minLat = Math.min(minLat, coords[1]);
        maxLat = Math.max(maxLat, coords[1]);
      } else if (feature.geometry.type === 'Polygon') {
        coords[0].forEach(coord => {
          minLng = Math.min(minLng, coord[0]);
          maxLng = Math.max(maxLng, coord[0]);
          minLat = Math.min(minLat, coord[1]);
          maxLat = Math.max(maxLat, coord[1]);
        });
      }
    }
  });
  
  if (minLng === Infinity) return null;
  return { minLng, minLat, maxLng, maxLat };
};

export const zoomToBounds = (map, bounds, options = {}) => {
  const {
    padding = 50,
    maxZoom = 18,
    duration = 2000,
    pitch = 0,
    bearing = 0
  } = options;
  
  if (!bounds || !map) return;
  
  const { minLng, minLat, maxLng, maxLat } = bounds;
  const isGlobal = (maxLng - minLng) > 300 || (maxLat - minLat) > 150;
  
  if (isGlobal) {
    map.flyTo({
      center: [0, 30],
      zoom: 2,
      pitch: pitch,
      bearing: bearing,
      duration: duration
    });
  } else {
    try {
      map.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding, maxZoom, duration, pitch, bearing }
      );
    } catch (error) {
      console.error("Mapbox fitBounds error, falling back to flyTo:", error);
      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;
      map.flyTo({
        center: [centerLng, centerLat],
        zoom: 10,
        pitch, bearing, duration
      });
    }
  }
};

export const buildRasterTileUrl = (collection, itemId, options = {}) => {
  const {
    assets = 'cog_default',
    colormap = 'plasma',
    rescale = '0,255',
    nodata = '-9999'
  } = options;

  const baseUrl = 'https://dev.openveda.cloud/api/raster';
  
  return `${baseUrl}/collections/${collection}/tiles/WebMercatorQuad/{z}/{x}/{y}@1x` +
    `?item=${itemId}` +
    `&assets=${assets}` +
    `&bidx=1` +
    `&colormap_name=${colormap}` +
    `&rescale=${rescale}` +
    `&nodata=${nodata}`;
};

export const buildNetCDF2DTileUrl = (conceptId, datetime, variable, options = {}) => {
  const {
    scale = '1',
    colormap = 'reds',
    rescale = '0,8',
    backend = 'xarray',
    ...additionalParams
  } = options;

  const baseUrl = 'https://dev-titiler-cmr.delta-backend.com/tiles/WebMercatorQuad/{z}/{x}/{y}';
  
  const params = new URLSearchParams({
    scale,
    concept_id: conceptId,
    datetime: datetime,
    variable: variable,
    backend: backend,
    colormap_name: colormap,
    rescale: rescale,
    ...additionalParams
  });

  return `${baseUrl}?${params.toString()}`;
};


export const buildTileUrl = (type, params) => {
  switch (type) {
    case 'raster':
      return buildRasterTileUrl(params.collection, params.itemId, {
        assets: params.assets,
        colormap: params.colormap,
        rescale: params.rescale,
        nodata: params.nodata
      });
    
    case 'netcdf-2d':
      return buildNetCDF2DTileUrl(params.conceptId, params.datetime, params.variable, {
        scale: params.scale,
        colormap: params.colormap,
        rescale: params.rescale,
        backend: params.backend,
        ...params.additionalParams
      });
    
    default:
      throw new Error(`Cannot build URL for dataset type: ${type}`);
  }
};

export const layerExists = (layers, layerId) => {
  return layers.some(layer => layer.id === layerId);
};

export const removeLayer = (layers, layerId) => {
  return layers.filter(layer => layer.id !== layerId);
};


// DEBUG: First let's see what the actual layer IDs look like
export const addOrUpdateLayers = (layers, newLayers, datasetId) => {
  console.log('🔧 addOrUpdateLayers Debug:', {
    datasetId,
    existingLayersCount: layers.length,
    existingLayerIds: layers.map(l => l.id),
    newLayersCount: newLayers.length,
    newLayerIds: newLayers.map(l => l.id)
  });
  
  // DEBUG: Test different matching strategies
  layers.forEach(layer => {
    const includesTest = layer.id.includes(datasetId);
    const includesWithDashTest = layer.id.includes(`-${datasetId}`);
    const includesWithDashEndTest = layer.id.includes(`-${datasetId}-`);
    const regexTest = new RegExp(`deckgl-\\w+-layer-${escapeRegExp(datasetId)}(?:-|$)`).test(layer.id);
    
    console.log(`🔍 Layer ID: ${layer.id}`);
    console.log(`   Dataset: ${datasetId}`);
    console.log(`   includes(datasetId): ${includesTest}`);
    console.log(`   includes(-datasetId): ${includesWithDashTest}`);
    console.log(`   includes(-datasetId-): ${includesWithDashEndTest}`);
    console.log(`   regex test: ${regexTest}`);
    console.log('---');
  });
  
  // Try multiple matching strategies - use the one that works
  const filteredLayers = layers.filter(layer => {
    // Strategy 1: Exact pattern matching
    const exactPattern = new RegExp(`^deckgl-\\w+-layer-${escapeRegExp(datasetId)}(?:-.*)?$`);
    const belongsToCurrentDataset = exactPattern.test(layer.id);
    
    const shouldKeep = !belongsToCurrentDataset;
    
    if (!shouldKeep) {
      console.log(`🗑️ REMOVING layer: ${layer.id} (matches dataset ${datasetId})`);
    } else {
      console.log(`✅ KEEPING layer: ${layer.id} (different dataset)`);
    }
    
    return shouldKeep;
  });
  
  console.log('📝 After filtering:', {
    filteredLayersCount: filteredLayers.length,
    filteredLayerIds: filteredLayers.map(l => l.id),
    removedCount: layers.length - filteredLayers.length
  });
  
  // Add new layers
  const result = [...filteredLayers, ...newLayers];
  
  console.log('✅ Final result:', {
    totalLayersCount: result.length,
    allLayerIds: result.map(l => l.id)
  });
  
  return result;
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}