import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Stack from '@mui/material/Stack'; 
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

import { DeckGlLayerManager } from '../../components/map/deckLayer';
import { DatasetGallery } from '../../components/ui/datasetGallery';
import { RecordDetailView } from '@components/detailView';
import SpatialSubsetManager from '@components/ui/spatialSubsetManager';

// Import chart components
import { ChartProvider, useChart } from '../../context/chartContext';
import { ChartTools, ChartToolsLeft, ChartToolsRight, CloseButton, ZoomResetTool } from '@components/chartComponents';

// Import the station chart hook
import { useStationChart } from '../../hooks/useStationChart';

import styled from 'styled-components';
import './index.css';
import { LineChart } from '../../components/lineChart';

const TITLE = 'Air Quality Dashboard';
const DESCRIPTION = "";

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
  
  const [vizItems, setVizItems] = useState([]);
  const [hoveredVizLayerId, setHoveredVizLayerId] = useState('');
  const [filteredVizItems, setFilteredVizItems] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [vizItemsForAnimation, setVizItemsForAnimation] = useState([]);
  const [VMAX, setVMAX] = useState(100);
  const [VMIN, setVMIN] = useState(-92);
  const [colormap, setColormap] = useState('default');
  const [assets, setAssets] = useState('rad');
  const [openDrawer, setOpenDrawer] = useState(true);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const collectionId = data?.[0]?.collection;

  const [allLayers, setAllLayers] = useState([]);
  const [activeLayerUrl, setActiveLayerUrl] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [layerData, setLayerData] = useState(null);

  const { 
    selectedStation, 
    chartData, 
    chartLabels, 
    isLoading, 
    error, 
    showStationChart, 
    hideStationChart, 
    isVisible 
  } = useStationChart();
  
  const onLayerSelect = (url) => {
    setActiveLayerUrl(url);
    //emit the custom event called 'layerSelected' with the url
   // const event = new CustomEvent('layerSelected', { detail: url }, );

    const myCustomEvent = new CustomEvent("layerSelected", {
         detail: { allLayers:allLayers , url: url },
         bubbles: true, // Allows event to bubble up the DOM tree
         cancelable: true // Allows event to be canceled
     });

    window.dispatchEvent(myCustomEvent);  
    console.log("event dispatched Layer selected:", myCustomEvent);
  };
  
  const onRecordSelect = (dataWithMetadata) => {
    if (dataWithMetadata.datasetInfo && dataWithMetadata.galleryType) {
      const datasetInfo = dataWithMetadata.datasetInfo;
      const actualData = { ...dataWithMetadata, datasetInfo: undefined };
      
      setSelectedRecord(datasetInfo);
      setLayerData(actualData);
    } else {
      setSelectedRecord(dataWithMetadata);
      setLayerData(dataWithMetadata);
    }

    setOpenDrawer(false);
  };
  
  // Simple station click handler
  const handleStationClick = (stationFeature) => {
    console.log("Station clicked in Dashboard:", stationFeature);
    showStationChart(stationFeature);
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
  
  const onFilteredVizItems = (filteredVizItems) => {
  };

  useEffect(() => {
    fetch('/plugins/pointcloud/events.js')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(eventsCode => {
        // eslint-disable-next-line no-eval
        eval(eventsCode);
      })
      .catch(err => {
        console.error('Failed to load or eval events.js:', err);
      });
  }, []);


  return (
    <Box className='fullSize'>
      <IconButton
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        sx={{
          position: 'absolute',
          top: '20px',
          left: isSidebarOpen ? '320px' : '20px', 
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
              width: '310px',
              transition: 'transform 0.2s ease-in-out, width 0.2s ease-in-out',
              transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              display: 'flex',
              flexDirection: 'column',
              height: 'fit-content',
              maxHeight: '95vh',
            }} 
            elevation={16}
          >
            <Stack sx={{ p: 1.5, overflowY: 'auto' }} spacing={1.5}> {/* Reduced padding and spacing */}
              <Title title={TITLE} description={DESCRIPTION} />
              <Search
                vizItems={Object.values(vizItems)}
                onSelectedVizItemSearch={console.log("")}
              />
              <FilterByDate
                vizItems={Object.values(vizItems)}
                onFilteredVizItems={onFilteredVizItems}
              />
              <SpatialSubsetManager />
              <RecordDetailView 
                record={selectedRecord} 
                onClose={console.log("")} 
              />
            </Stack>
          </Paper>
          
          <MapZoom zoomLocation={zoomLocation} zoomLevel={zoomLevel} />
          <MapControls
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            handleResetHome={console.log("")}
          />
          <MarkerFeature
            vizItems={Object.values(vizItems)}
            onSelectVizItem={console.log("")}
          />
          <DeckGlLayerManager
            activeLayerUrl={activeLayerUrl}
            layerData={layerData}
            galleryType={layerData?.galleryType || selectedRecord?.type}
            datasetId={selectedRecord?.id} 
            onStationClick={handleStationClick}
            visible={true} 
          />
          
          {isVisible && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              width: '100%',
              height: '350px',
              backgroundColor: 'white',
              border: '1px solid #000',
              borderRadius: '8px',
              zIndex: 1000,
              padding: '0', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'left 0.2s ease-in-out',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Show loading/error states */}
              {isLoading && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  fontSize: '16px' 
                }}>
                  <LoadingSpinner />
                </div>
              )}
              
              {error && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: 'red',
                  fontSize: '16px' 
                }}>
                  <p>Error loading data: {error.message}</p>
                  <CloseButton handleClose={hideStationChart} />
                </div>
              )}
              
              {!isLoading && !error && chartData && chartData.length > 0 && (
                <ChartProvider>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderBottom: '1px solid #eee',
                    minHeight: '50px'
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '20px', 
                      color: '#333',
                      fontWeight: '600'
                    }}>
                      {selectedStation && `Station ${selectedStation.station_code} - ${selectedStation.city || 'Unknown'}`}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <ZoomResetTool />
                      <CloseButton handleClose={hideStationChart} />
                    </div>
                  </div>
                  
                  {/* LineChart Container - Full Size */}
                  <div style={{ flex: 1, padding: '16px' }}>
                    <LineChart 
                      data={chartData}
                      labels={chartLabels}
                      legend="Line chart"
                      labelX="Date"
                      labelY="Value (μg/m³)"
                      color="#42a5f5"
                      index={0}
                      separateY={false}
                    />
                  </div>
                </ChartProvider>
              )}
              
              {/* Show message when no data */}
              {!isLoading && !error && (!chartData || chartData.length === 0) && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  fontSize: '16px' 
                }}>
                  <p>No data available for this station</p>
                  <CloseButton handleClose={hideStationChart} />
                </div>
              )}
            </div>
          )}
          
        </MainMap>
        
        <VizItemAnimation
          VMIN={VMIN}
          VMAX={VMAX}
          colormap={colormap}
          assets={assets}
          vizItems={vizItemsForAnimation}
        />
        
        <PersistentDrawerRight
          open={openDrawer}
          setOpen={setOpenDrawer}
          selectedVizItems={filteredVizItems}
          vizItemMetaData={vizItemMetaData}
          metaDataTree={metaDataTree}
          collectionId={collectionId}
          vizItemsMap={vizItems}
          handleSelectedVizItems={console.log("")}
          hoveredVizItemId={hoveredVizLayerId}
          setHoveredVizItemId={setHoveredVizLayerId}
          onLayerSelect={onLayerSelect}
          onRecordSelect={onRecordSelect}
        >
          <DatasetGallery 
            onLayerSelect={onLayerSelect}
            setAllLayers={setAllLayers}
            onRecordSelect={onRecordSelect}
          />
        </PersistentDrawerRight>
      </div>
      {loadingData && <LoadingSpinner />}
    </Box>
  );
}