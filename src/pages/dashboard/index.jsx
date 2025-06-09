import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Stack from '@mui/material/Stack'; // Import Stack for clean layout

// --- Make sure all your components are imported correctly ---
import {
  MainMap,
  MarkerFeature,
  ColorBar,
  LoadingSpinner,
  PersistentDrawerRight,
  Title,
  MapControls,
  MapZoom,
  Search,
  FilterByDate,
  VizItemAnimation,
} from '@components';
import { DeckGlLayerManager } from '../../components/map/deckLayer'; // Adjust path as needed
import { DatasetGallery } from '../../components/ui/datasetGallery'; // Adjust path
import { RecordDetailView } from '@components/detailView';
import SpatialSubsetManager from '@components/ui/spatialSubsetManager';

import styled from 'styled-components';
import './index.css';

const TITLE = 'Air Quality Dashboard';
const DESCRIPTION =
  'Some one paragraph length of description. Some one paragraph length of description. Some one paragraph length of description. Some one paragraph length of description. Some one paragraph length of description. Some one paragraph length of description. Some one paragraph length of description. Some one paragraph length of description. Some one paragraph length of description. Some one paragraph length of description.';

// This styled-component might still be used elsewhere, but not for main sidebar layout
const HorizontalLayout = styled.div`
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 12px;
`;

export function Dashboard({
  data,
  dataTree,
  metaDataTree,
  collectionMeta,
  vizItemMetaData,
  zoomLocation,
  setZoomLocation,
  zoomLevel,
  setZoomLevel,
  loadingData,
}) {
  // --- All your existing state variables ---
  const [regions, setRegions] = useState([]);
  const [vizItems, setVizItems] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const prevSelectedRegionId = useRef('');
  const [selectedVizItems, setSelectedVizItems] = useState([]);
  const [hoveredVizLayerId, setHoveredVizLayerId] = useState('');
  const [filteredVizItems, setFilteredVizItems] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [vizItemIds, setVizItemIds] = useState([]);
  const [vizItemsForAnimation, setVizItemsForAnimation] = useState([]);
  const [collectionMetadata, setCollectionMetadata] = useState({});
  const [showVisualizationLayers, setShowVisualizationLayers] = useState(true);
  const [showMarkerFeature, setShowMarkerFeature] = useState(true);
  const [visualizationLayers, setVisualizationLayers] = useState(true);
  const [VMAX, setVMAX] = useState(100);
  const [VMIN, setVMIN] = useState(-92);
  const [colormap, setColormap] = useState('default');
  const [assets, setAssets] = useState('rad');
  const [openDrawer, setOpenDrawer] = useState(true);
  const collectionId = data?.[0]?.collection;
  const [activeLayerUrl, setActiveLayerUrl] = useState(null);

  // --- NEW STATE for the selected record ---
  const [selectedRecord, setSelectedRecord] = useState(null);

  // --- HANDLER FUNCTIONS ---
  const onLayerSelect = (url) => {
    setActiveLayerUrl(url);
  };
  
  const onRecordSelect = (record) => {
    console.log("onRecordSelect called in Dashboard with:", record);
    setSelectedRecord(record);
  };

  const handleCloseRecordDetail = () => {
    setSelectedRecord(null);
  };

  const handleStationClick = (feature) => {
      console.log("Station clicked on map:", feature);
  };
  
  // ... All your other existing handlers and useEffects ...
  const handleSelectedVizItem = (vizItemId) => {
    if (!dataTree.current || !Object.keys(dataTree.current).length || !vizItemId) return;
    // ... function logic
  };

  const handleSelectedVizLayer = (vizLayerId) => {
    // ... function logic
  };

  const handleAnimationReady = (vizItemId) => {
    // ... function logic
  };

  const handleSelectedVizItemSearch = (vizItemId) => {
    // ... function logic
  };

  const handleResetHome = () => {
    // ... function logic
  };

  useEffect(() => {
    if (!dataTree.current || !data) return;
    const newVizItems = {};
    const testData = data.slice(0, 10);
    testData.forEach((items) => {
        newVizItems[items.id] = items;
    });
    setVizItems(newVizItems);
  }, [data, dataTree]);
  
  // ... other useEffects ...

  const onFilteredVizItems = (filteredVizItems) => {
    //   setFilteredVizItems(filteredVizItems);
  };
  
  return (
    <Box className='fullSize'>
      <IconButton
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        sx={{
          position: 'absolute',
          top: '20px',
          left: isSidebarOpen ? '420px' : '20px',
          zIndex: 1301,
          backgroundColor: 'white',
          transition: 'left 0.2s ease-in-out',
          '&:hover': { backgroundColor: 'whitesmoke' },
        }}
      >
        {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>
      <div id='dashboard-map-container'>
        <MainMap>
          <Paper 
            className='title-container' 
            sx={{
              width: '410px',
              transition: 'transform 0.2s ease-in-out, width 0.2s ease-in-out',
              transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              display: 'flex',
              flexDirection: 'column',
              height: 'fit-content',
              maxHeight: '95vh',
            }} 
            elevation={16}
          >
            <Stack sx={{ p: 2, overflowY: 'auto' }} spacing={2}>
              
              <Title title={TITLE} description={DESCRIPTION} />
              <Search
                vizItems={Object.values(vizItems)}
                onSelectedVizItemSearch={handleSelectedVizItemSearch}
              />
              <FilterByDate
                vizItems={Object.values(vizItems)}
                onFilteredVizItems={onFilteredVizItems}
              />
              <SpatialSubsetManager />

              <RecordDetailView 
                record={selectedRecord} 
                onClose={handleCloseRecordDetail} 
              />
              
            </Stack>
          </Paper>

          <MapZoom zoomLocation={zoomLocation} zoomLevel={zoomLevel} />
          <MapControls
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            handleResetHome={handleResetHome}
          />
          <MarkerFeature
            vizItems={Object.values(vizItems)}
            onSelectVizItem={handleSelectedVizItem}
          />
          <DeckGlLayerManager
            activeLayerUrl={activeLayerUrl}
            onStationClick={handleStationClick}
          />
        </MainMap>

        <VizItemAnimation
            VMIN={VMIN}
            VMAX={VMAX}
            colormap={colormap}
            assets={assets}
            vizItems={vizItemsForAnimation}
        />

        {/* --- CORRECTED PROP PASSING --- */}
        <PersistentDrawerRight
          open={openDrawer}
          setOpen={setOpenDrawer}
          selectedVizItems={filteredVizItems}
          vizItemMetaData={vizItemMetaData}
          metaDataTree={metaDataTree}
          collectionId={collectionId}
          vizItemsMap={vizItems}
          handleSelectedVizItems={handleSelectedVizLayer}
          hoveredVizItemId={hoveredVizLayerId}
          setHoveredVizItemId={setHoveredVizLayerId}
        >
          {/* By passing the gallery as a child, the drawer can render it,
              and the gallery has access to the functions defined in Dashboard. */}
          <DatasetGallery 
            onLayerSelect={onLayerSelect}
            onRecordSelect={onRecordSelect}
          />
        </PersistentDrawerRight>
      </div>
      {loadingData && <LoadingSpinner />}
    </Box>
  );
}
