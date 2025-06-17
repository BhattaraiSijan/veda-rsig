import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import OpacityIcon from '@mui/icons-material/Opacity';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Circle from '@mui/icons-material/Circle';
import Square from '@mui/icons-material/Square';
import ChangeHistory from '@mui/icons-material/ChangeHistory';
import Slider from '@mui/material/Slider';
import Popover from '@mui/material/Popover';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ColorBar } from '../ui/colorBar';

// Compact legend item component
const LegendItem = ({ color, label, shape = 'circle' }) => {
  const getIcon = () => {
    switch (shape) {
      case 'square':
      return <Square sx={{ fontSize: 14, color }} />;
      case 'triangle':
      return <ChangeHistory sx={{ fontSize: 14, color }} />;
      default:
      return <Circle sx={{ fontSize: 14, color }} />;
    }
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    {getIcon()}
    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{label}</Typography>
    </Box>
  );
};

// Compact layer card component - single row design
const LayerCard = ({ layer, index, onOpacityChange, onRemove, isDragging }) => {
  const { id, name, type, legend, opacity = 100 } = layer;
  const [anchorEl, setAnchorEl] = useState(null);
  const [localOpacity, setLocalOpacity] = useState(opacity);
  const [VMAX, setVMAX] = useState(100);
  const [VMIN, setVMIN] = useState(-92);
  const [colormap, setColormap] = useState('plasma');
  const handleOpacityClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleOpacityClose = () => {
    setAnchorEl(null);
  };
  
  const handleOpacityChange = (event, newValue) => {
    setLocalOpacity(newValue);
    onOpacityChange(id, newValue);
  };
  
  const open = Boolean(anchorEl);
  
  return (
    <Draggable draggableId={id || `layer-${index}`} index={index}>
    {(provided, snapshot) => (
      <Card 
      ref={provided.innerRef}
      {...provided.draggableProps}
      variant="outlined" 
      sx={{ 
        mb: 1,
        opacity: isDragging || snapshot.isDragging ? 0.5 : 1,
        backgroundColor: snapshot.isDragging ? 'action.hover' : 'background.paper',
        transition: 'background-color 0.2s ease',
      }}
      >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box 
      {...provided.dragHandleProps}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        cursor: 'grab',
        color: 'text.secondary',
        '&:active': { cursor: 'grabbing' }
      }}
      >
      <DragIndicatorIcon fontSize="small" />
      </Box>
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight: 1.2 }} noWrap>
      {name}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
      {type || 'Feature Layer'}
      </Typography>
      </Box>
      {legend && legend.items && legend.items.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ flex: '0 1 auto' }}>
        {legend.items.slice(0, 3).map((item, idx) => (
          <LegendItem
          key={idx}
          color={item.color || '#666'}
          label={item.label}
          shape={item.shape}
          />
        ))}
        {legend.items.length > 3 && (
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
          +{legend.items.length - 3}
          </Typography>
        )}
        </Stack>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconButton
      size="small"
      onClick={handleOpacityClick}
      sx={{ 
        p: 0.5,
        color: 'text.secondary',
        '&:hover': { color: 'primary.main' }
      }}
      >
      <OpacityIcon fontSize="small" />
      </IconButton>
      <Typography variant="caption" sx={{ fontSize: '0.7rem', minWidth: '35px' }}>
      {localOpacity}%
      </Typography>
      </Box>
      
      <IconButton
      size="small"
      onClick={() => onRemove(id)}
      sx={{ 
        p: 0.5,
        color: 'error.main',
        '&:hover': { backgroundColor: 'error.light', color: 'error.dark' }
      }}
      >
      <DeleteIcon fontSize="small" />
      </IconButton>
      </Box>
      
      <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleOpacityClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      >
      <Box sx={{ p: 2, width: 200 }}>
      <Typography variant="body2" gutterBottom>
      Opacity: {localOpacity}%
      </Typography>
      <Slider
      value={localOpacity}
      onChange={handleOpacityChange}
      aria-labelledby="opacity-slider"
      min={0}
      max={100}
      size="small"
      />
      </Box>
      </Popover>
      
      </CardContent>
      </Card>
    )}
    </Draggable>
  );
};

/**
* 
* @param {object} record - Legacy: The collection data (FeatureCollection or dataset info)
* @param {array} layers - Array of layer objects containing layer information
* @param {function} onLayersChange - Callback function when layers are reordered
* @param {function} onLayerOpacityChange - Callback function when layer opacity changes
* @param {function} onLayerRemove - Callback function when a layer is removed
* @param {function} onClose - A function to call when the close button is clicked
*/
export function RecordDetailView({ 
  record,
  layers, 
  onLayersChange, 
  onLayerOpacityChange, 
  onLayerRemove, 
  onClose 
}) {
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle legacy mode with 'record' prop
  let layersToDisplay = layers;
  if (!layersToDisplay && record) {
    // For legacy mode, check if record contains multiple layers
    if (record.layers && Array.isArray(record.layers)) {
      // If record contains a layers array, use it
      layersToDisplay = record.layers;
    } else if (record.type === 'LayerCollection' && record.items) {
      // Alternative structure where layers might be in 'items'
      layersToDisplay = record.items;
    } else {
      layersToDisplay = [{
        id: record.id || 'legacy-layer',
        name: record.name || record.id || 'Dataset',
        type: record.type === 'FeatureCollection' ? 'Feature Collection' : 'Feature Layer',
        visible: true,
        opacity: 100
      }];
    }
  }
  
  // Filter to show only visible layers
  if (layersToDisplay) {
    layersToDisplay = layersToDisplay.filter(layer => layer.visible !== false);
  }
  
  // If no data is provided, render nothing
  if (!layersToDisplay || layersToDisplay.length === 0) {
    return null;
  }
  
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  const handleDragEnd = (result) => {
    setIsDragging(false);
    
    if (!result.destination) {
      return;
    }
    
    const items = Array.from(layersToDisplay);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Call the callback with the new order
    if (onLayersChange) {
      onLayersChange(items);
    }
  };
  
  const handleOpacityChange = (layerId, opacity) => {
    if (onLayerOpacityChange) {
      onLayerOpacityChange(layerId, opacity);
    }
  };
  
  const handleRemove = (layerId) => {
    if (onLayerRemove) {
      onLayerRemove(layerId);
    }
  };
  
  return (
    <Paper 
    elevation={4} 
    sx={{ 
      mt: 2,
      borderRadius: 2,
      maxHeight: '400px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}
    >
    {/* Compact Header */}
    <Box sx={{ p: 1.5, pb: 1, position: 'relative', borderBottom: 1, borderColor: 'divider' }}>
    <IconButton
    aria-label="close"
    onClick={onClose}
    sx={{
      position: 'absolute',
      right: 4,
      top: 4,
      color: (theme) => theme.palette.grey[500],
    }}
    size="small"
    >
    <CloseIcon fontSize="small" />
    </IconButton>
    
    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
    Layer Details
    </Typography>
    <Typography variant="caption" color="text.secondary">
    {layersToDisplay.length} {layersToDisplay.length === 1 ? 'layer' : 'layers'} • Drag to reorder
    </Typography>
    </Box>
    
    {/* Scrollable Layer Cards with Drag and Drop */}
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <Droppable droppableId="layers">
    {(provided) => (
      <Box 
      {...provided.droppableProps}
      ref={provided.innerRef}
      sx={{ 
        flex: 1,
        overflowY: 'auto',
        p: 1.5,
        pt: 1
      }}
      >
      {layersToDisplay.map((layer, index) => (
        <LayerCard 
        key={layer.id || index} 
        layer={layer} 
        index={index}
        onOpacityChange={handleOpacityChange}
        onRemove={handleRemove}
        isDragging={isDragging}
        />
      ))}
      {provided.placeholder}
      </Box>
    )}
    </Droppable>
    </DragDropContext>
    </Paper>
  );
}

export { RecordDetailView as LayerDetailsView };
