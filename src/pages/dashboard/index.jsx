import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Stack from '@mui/material/Stack';
import {
  MainMap,
  LoadingSpinner,
  PersistentDrawerRight,
  Title,
  MapControls,
  MapZoom,
  Search,
  FilterByDate,
} from '@components';

import { DeckGlLayerManager } from '../../components/map/deckLayer';
import { RecordDetailView } from '@components/detailView';
import SpatialSubsetManager from '@components/ui/spatialSubsetManager';

import { ChartProvider } from '../../context/chartContext';
import { CloseButton, ZoomResetTool } from '@components/chartComponents';
import { useStationChart } from '../../hooks/useStationChart';

import './index.css';
import { LineChart } from '../../components/lineChart';

const TITLE = 'Air Quality Dashboard';
const DESCRIPTION = "";

export function Dashboard({
  zoomLocation,
  zoomLevel,
  loadingData,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(true);

  const [activeLayerUrl, setActiveLayerUrl] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [layerData, setLayerData] = useState(null);
  const [layerDisplayList, setLayerDisplayList] = useState([]);


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
    const myCustomEvent = new CustomEvent("layerSelected", {
         detail: { url: url },
         bubbles: true,
         cancelable: true
     });
    window.dispatchEvent(myCustomEvent);
  };

  const allActiveDatasets = useRef([]);
  const updateActiveDataset = (dataset) =>{
    if (!dataset) return;

    // This is the original, unchanged logic that uses the ref.
    const existingIndex = allActiveDatasets.current.findIndex(d => d.id === dataset.id);
    if (existingIndex !== -1) {
      allActiveDatasets.current[existingIndex] = dataset;
    } else {
      allActiveDatasets.current.push(dataset);
    }

    // --- ADDED FOR OPACITY/REMOVE FEATURE ---
    // This new logic updates our new state array to keep it in sync with the ref.
    // This is what will cause the RecordDetailView to re-render when a new layer is added.
    setLayerDisplayList(currentList => {
        const existingDisplayIndex = currentList.findIndex(d => d.id === dataset.id);
        if (existingDisplayIndex !== -1) {
            // If the item is already in our list, update its details
            // but preserve its existing opacity.
            const updatedList = [...currentList];
            updatedList[existingDisplayIndex] = {
                ...dataset, // new metadata
                opacity: updatedList[existingDisplayIndex].opacity, // keep old opacity
            };
            return updatedList;
        }
        return [...currentList, { ...dataset, opacity: 100 }];
    });
  }

  const allActiveLayers = useRef([]);
  const updateActiveLayers = (layers) => {
    allActiveLayers.current = layers;
  }

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

  const handleStationClick = (stationFeature) => {
    showStationChart(stationFeature);
  };

  const handleOpacityChange = (datasetId, newOpacity) => {
      setLayerDisplayList(currentList =>
          currentList.map(item =>
              item.id === datasetId ? { ...item, opacity: newOpacity } : item
          )
      );
  };

  const handleLayerRemove = (datasetId) => {
      setLayerDisplayList(currentList => currentList.filter(item => item.id !== datasetId));
      allActiveDatasets.current = allActiveDatasets.current.filter(item => item.id !== datasetId);
      if (selectedRecord?.id === datasetId) {
          setSelectedRecord(null);
          setLayerData(null);
      }
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
            <Stack sx={{ p: 1.5, overflowY: 'auto' }} spacing={1.5}>
              <Title title={TITLE} description={DESCRIPTION} />
              <Search
                vizItems={[]}
                onSelectedVizItemSearch={console.log("")}
              />
              <FilterByDate
                vizItems={[]}
                onFilteredVizItems={[]}
              />
              <SpatialSubsetManager />

              <RecordDetailView
                record={selectedRecord}
                allActiveDatasets={layerDisplayList}
                allActiveLayers={allActiveLayers.current}
                onClose={console.log("")}
                onLayerOpacityChange={handleOpacityChange} 
                onLayerRemove={handleLayerRemove}
              />
            </Stack>
          </Paper>

          <MapZoom zoomLocation={zoomLocation} zoomLevel={zoomLevel} />
          <MapControls
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            handleResetHome={console.log("")}
          />

          <DeckGlLayerManager
            activeLayerUrl={activeLayerUrl}
            updateActiveLayers={updateActiveLayers}
            layerData={layerData}
            galleryType={layerData?.galleryType || selectedRecord?.type}
            datasetId={selectedRecord?.id}
            onStationClick={handleStationClick}
            visible={true}
            layerOpacityList={layerDisplayList}
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
              {isLoading && ( <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '16px' }}> <LoadingSpinner /> </div> )}
              {error && ( <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'red', fontSize: '16px' }}> <p>Error loading data: {error.message}</p> <CloseButton handleClose={hideStationChart} /> </div> )}
              {!isLoading && !error && chartData && chartData.length > 0 && (
                <ChartProvider>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #eee', minHeight: '50px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#333', fontWeight: '600' }}>
                      {selectedStation && `Station ${selectedStation.station_code} - ${selectedStation.city || 'Unknown'}`}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <ZoomResetTool />
                      <CloseButton handleClose={hideStationChart} />
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '16px' }}>
                    <LineChart
                      data={chartData}
                      labels={chartLabels}
                      legend="PM2.5 AQI "
                      labelX="Date"
                      labelY="Micrograms/cubic meter (LC)"
                      color="#42a5f5"
                      index={0}
                      separateY={true}
                    />
                  </div>
                </ChartProvider>
              )}
              {!isLoading && !error && (!chartData || chartData.length === 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '16px' }}>
                  <p>No data available for this station</p>
                  <CloseButton handleClose={hideStationChart} />
                </div>
              )}
            </div>
          )}

        </MainMap>

        <PersistentDrawerRight
          open={openDrawer}
          setOpen={setOpenDrawer}
          onLayerSelect={onLayerSelect}
          onRecordSelect={onRecordSelect}
          updateActiveDataset={updateActiveDataset}
        />
      </div>
      {loadingData && <LoadingSpinner />}
    </Box>
  );
}