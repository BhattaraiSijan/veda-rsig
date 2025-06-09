import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import RectangleOutlinedIcon from '@mui/icons-material/RectangleOutlined';
import GestureIcon from '@mui/icons-material/Gesture';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { styled } from '@mui/material/styles';

// Styled ToggleButton to allow for more visual customization if needed
const StyledToggleButton = styled(ToggleButton)({
  // Add any custom styles here if you want to override the theme
});

// Main SpatialSubsetManager Component
export default function SpatialSubsetManager() {
  // State to manage which drawing tool is currently active.
  const [activeTool, setActiveTool] = useState('rectangle');

  // Handler for changing the active tool
  const handleToolChange = (event, newTool) => {
    if (newTool !== null) {
      setActiveTool(newTool);
    }
  };
  
  // Handler for the upload button click
  const handleUploadClick = () => {
    setActiveTool(null); 
    console.log("Upload button clicked");
  };

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        width: '100%',
        // Padding is handled by inner components for consistency
      }}
    >
      <Typography>
        Spatial Subset
      </Typography>

      {/* Main content wrapped in a Box with padding */}
      <Box sx={{ px: 2, pb: 2}}>
        {/* Use a Stack to manage layout. justifyContent spreads the items out. */}
        <Stack 
          direction="row" 
          spacing={1} 
          alignItems="center" 
          sx={{ justifyContent: 'space-between' }}
        >
          {/* Toggle group for the drawing tools */}
          <ToggleButtonGroup
            value={activeTool}
            exclusive
            onChange={handleToolChange}
            aria-label="spatial drawing tool"
            size="small"
          >
            <Tooltip title="Rectangle">
              <StyledToggleButton value="rectangle" aria-label="rectangle tool">
                <RectangleOutlinedIcon />
              </StyledToggleButton>
            </Tooltip>
            <Tooltip title="Polygon">
              <StyledToggleButton value="polygon" aria-label="polygon tool">
                <GestureIcon />
              </StyledToggleButton>
            </Tooltip>
            <Tooltip title="Circle">
              <StyledToggleButton value="circle" aria-label="circle tool">
                <CircleOutlinedIcon />
              </StyledToggleButton>
            </Tooltip>
            <Tooltip title="Point">
              <StyledToggleButton value="point" aria-label="point tool">
                <GpsFixedIcon />
              </StyledToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          {/* Separate button for the upload action */}
          <Tooltip title="Upload Shapefile">
            <Button
              variant={activeTool === null ? "contained" : "outlined"}
              size="small"
              startIcon={<FileUploadOutlinedIcon />}
              onClick={handleUploadClick}
              sx={{ textTransform: 'none' }}
            >
              Upload
            </Button>
          </Tooltip>
        </Stack>
      </Box>
    </Paper>
  );
}
