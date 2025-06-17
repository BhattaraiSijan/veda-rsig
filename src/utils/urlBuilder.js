
// URL Builder for different dataset types
export const buildDatasetUrl = (dataset) => {
  const { id, type, url } = dataset;
  const baseUrl = 'https://dev.openveda.cloud/api';
  
  switch (type) {
    case 'raster':
      return `${baseUrl}/stac/collections/${id}/items`;
      
    case 'feature':
      return `${baseUrl}/features/collections/${id}/items`;
      
    case 'point-cloud':
      if (url) {
        return url;
      }
      return `${baseUrl}/stac/collections/${id}/items`;
      
    case 'geojson':
      return `${baseUrl}/collections/${id}/items`;
    case 'netcdf-2d':
      return `https://dev.openveda.cloud/api/stac/collections/${id}/items`;
    default:
      console.warn(`Unknown dataset type: ${type}`);
      return null;
  }
};

export const fetchDatasetData = async (dataset) => {
  const url = buildDatasetUrl(dataset); 
  try {
    const response = await fetch(url+`?limit=1000`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    if (dataset.type === 'point-cloud') {
      return {
        ...data,
        datasetInfo: dataset,
        galleryType: dataset.type,
        tilesetUrl: url 
      };
    }
    
    return {
      ...data,
      datasetInfo: dataset,
      galleryType: dataset.type 
    };
  } catch (error) {
    console.error(`Error fetching ${dataset.name}:`, error);
    throw error;
  }
};