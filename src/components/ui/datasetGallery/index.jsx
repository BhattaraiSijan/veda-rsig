import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Grid, 
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';

import { fetchDatasetData } from '../../../utils/urlBuilder'; 
import {galleryData} from './datasets';

export function DatasetGallery({ onLayerSelect, onRecordSelect, updateActiveDataset }) {

  console.log("::::::::::::::::Update Dataset function in gallery componenet", updateActiveDataset);
  const [loadingDataset, setLoadingDataset] = useState(null);
  const [error, setError] = useState(null);

  const allDatasets = Object.keys(galleryData).reduce((acc, category) => {
    return [...acc, ...galleryData[category].map(dataset => ({
      ...dataset,
      category
    }))];
  }, []);

  const handleDatasetClick = async (dataset) => {
    if (dataset.type === 'netcdf-2d') {
    const directData = {
      conceptId: dataset.conceptId || "C3273638632-GES_DISC",
      datetime: dataset.datetime || "2018-02-12T09:00:00Z", 
      variable: dataset.variable || "NPP",
      colormap: dataset.colormap || "reds",
      rescale: dataset.rescale || "0, 4.786979e-10",
      datasetInfo: dataset,
      galleryType: dataset.type
    };
    
    if (onRecordSelect) {
      onRecordSelect(directData);
    }
    updateActiveDataset(dataset);
    return;
  }

    try {
      setLoadingDataset(dataset.id);
      setError(null);
      
      const data = await fetchDatasetData(dataset);
      
      if (onLayerSelect) {
        onLayerSelect(data.datasetInfo?.url || null);
      }
      
      if (onRecordSelect) {
        onRecordSelect(data);
      }
    } catch (error) {
      setError(`Failed to load ${dataset.name}: ${error.message}`);
    } finally {
      updateActiveDataset(dataset);
      setLoadingDataset(null);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'raster':
        return 'primary';
      case 'stations':
        return 'secondary';
      case 'point-cloud':
        return 'success';
      case 'feature':
        return 'warning';
      case 'geojson':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'raster':
        return '🛰️';
      case 'stations':
        return '📍';
      case 'point-cloud':
        return '☁️';
      case 'feature':
         return '📊';
      case 'geojson':
        return '🗺️';
      default:
        return '📝';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'satellite':
        return '#e3f2fd';
      case 'insitu':
        return '#f3e5f5';
      case 'lidar':
        return '#e8f5e8';
      default:
        return '#fafafa';
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2, overflowY: 'auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
         Datasets
      </Typography>

      <Grid container spacing={2}>
        {allDatasets.map((dataset) => (
          <Grid item xs={12} sm={6} key={dataset.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
                position: 'relative',
                opacity: loadingDataset === dataset.id ? 0.7 : 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
              onClick={() => handleDatasetClick(dataset)}
            >
              {loadingDataset === dataset.id && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    zIndex: 2,
                    borderRadius: 1
                  }}
                >
                  <CircularProgress size={32} />
                </Box>
              )}
              
              <Box sx={{display: 'flex', alignItems: 'center', p: 1.5}}>
                 <Box sx={{
                    height: 50,
                    width: 50,
                    minWidth: 50,
                    backgroundColor: getCategoryColor(dataset.category),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    borderRadius: 1,
                    mr: 1.5
                  }}>
                    {getTypeIcon(dataset.type)}
                </Box>
                
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography 
                            variant="subtitle1" 
                            component="h3" 
                            sx={{ 
                            fontWeight: 600,
                            lineHeight: 1.3
                            }}
                        >
                            {dataset.name}
                        </Typography>
                        <Chip 
                            label={dataset.category}
                            size="small"
                            color={getTypeColor(dataset.type)}
                            sx={{ ml: 1, height: 20, fontSize: '0.6875rem' }}
                        />
                    </Box>
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.8rem',
                          lineHeight: 1.2,
                        }}
                      >
                        {dataset.description}
                      </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
