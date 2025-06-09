import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

// We assume this data will be imported from your new data structure
import { galleryData } from './datasets'; 


// The component now accepts two callback props:
// onLayerSelect: To update the map layer.
// onRecordSelect: To pass the fetched record details up.
export function DatasetGallery({ onLayerSelect, onRecordSelect }) {
  const [selectedDatasetId, setSelectedDatasetId] = useState('radar-nexrad'); 

  // The handler is now an async function to handle the fetch call
  const handleCardClick = async (dataset) => {
    // 1. Update the local state to highlight the clicked card
    setSelectedDatasetId(dataset.id);
    console.log(dataset)
    
    // --- This is your existing logic to add a layer to the map ---
    const layerApiUrl = `https://dev.openveda.cloud/api/features/collections/${dataset.id}/items`;
    if (onLayerSelect) {
      onLayerSelect(layerApiUrl);
    }
    console.log(`Layer selected: ${dataset.name}, URL: ${layerApiUrl}`);
    // --- End of existing logic ---


    // --- THIS IS THE NEW LOGIC TO FETCH A SPECIFIC RECORD ---
    // 2. Construct the URL for a single record (using '1' as a placeholder ID)
    const recordApiUrl = `https://dev.openveda.cloud/api/features/collections/${dataset.name}/items/${dataset.id}`;
    console.log(`Fetching record details from: ${recordApiUrl}`);

    try {
      const response = await fetch(recordApiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const recordData = await response.json();
      
      // 3. Call the onRecordSelect function with the fetched data
      // This sends the detailed record information up to the Dashboard component.
      if (onRecordSelect) {
        onRecordSelect(recordData);
      }
      console.log('Record data fetched successfully:', recordData);

    } catch (error) {
      console.error("Error fetching record details:", error);
      // Optionally, pass an error state up as well
      if (onRecordSelect) {
        onRecordSelect(null); // Clear previous record on error
      }
    }
    // --- END OF NEW LOGIC ---
  };

  return (
    <Box sx={{ width: '100%', height: '100%', overflowY: 'auto', p: 1 }}>
      {Object.entries(galleryData).map(([category, datasets]) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', px: 1, mb: 1.5 }}>
            {category}
          </Typography>
          
          <Grid container spacing={1}>
            {datasets.map((dataset) => (
              <Grid item xs={4} key={dataset.id}> 
                <Card 
                  variant="outlined"
                  sx={{ 
                    borderColor: selectedDatasetId === dataset.id ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
                    borderWidth: selectedDatasetId === dataset.id ? '2px' : '1px',
                  }}
                >
                  <CardActionArea onClick={() => handleCardClick(dataset)}>
                    <CardMedia
                      component="img"
                      height="75"
                      image={dataset.thumbnailUrl}
                      alt={dataset.name}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x75/CCCCCC/FFFFFF?text=Error'; }}
                    />
                    <CardContent sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="caption" component="div">
                        {dataset.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
