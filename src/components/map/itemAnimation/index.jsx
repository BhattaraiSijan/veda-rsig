import React, { useEffect, useRef, useState } from 'react';

// MUI Components
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

// --- MOCK IMPLEMENTATIONS to resolve import errors ---
// In a real environment, these would be your actual imports.
// This allows the component to render without breaking.

// Mock for: import { useMapbox } from '../../../context/mapContext';
const useMapbox = () => ({
  map: {
    // Mock map object with methods that might be called
    on: () => {},
    off: () => {},
    getLayer: () => undefined,
    addLayer: () => {},
    removeLayer: () => {},
    getSource: () => undefined,
    addSource: () => {},
    removeSource: () => {},
    setLayoutProperty: () => {},
  },
});

// Mock for: import TimelineControl from 'mapboxgl-timeline';
class TimelineControl {
  constructor(options) {
    this.options = options;
    this.playing = false;
    this.time = options.initial || options.start;
  }
  onAdd = (map) => {
    // Simulate adding to map and starting the timeline
    this.map = map;
    if (this.options.onStart) this.options.onStart(this.time);
    return document.createElement('div'); // Return a dummy element
  };
  remove = () => {};
  toggle = () => {
    this.playing = !this.playing;
    if (this.options.onToggle) this.options.onToggle(this.playing);
  };
  next = () => {
     if (this.options.onChange) this.options.onChange(new Date());
  };
  prev = () => {
     if (this.options.onChange) this.options.onChange(new Date());
  };
}

// Mock for: import moment from 'moment';
const moment = (date) => ({
  format: () => date ? new Date(date).toISOString() : new Date().toISOString(),
  utc: () => ({
    format: (formatStr) => new Date(date).toUTCString(),
  }),
  diff: () => 10, // Return a static diff
});

// Mock for: import { ... } from '../utils';
const bufferSourceLayer = () => {};
const getSourceId = (i) => `source-${i}`;
const getLayerId = (i) => `layer-${i}`;
const layerExists = () => false;
const sourceExists = () => false;

// Mock for CSS imports
// import 'mapboxgl-timeline/dist/style.css';
// import './index.css';

/*
      New Animation component for the visualization layers
      Styled with MUI components.
*/
export const VizItemAnimation = ({
  vizItems,
  VMIN,
  VMAX,
  colormap,
  assets,
}) => {
  const { map } = useMapbox();
  const timeline = useRef(null);
  const timelineContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    if (!map || !vizItems || !vizItems.length) {
      if(timeline.current) {
        timeline.current.remove(map);
        timeline.current = null;
      }
       if (timelineContainerRef.current) {
        timelineContainerRef.current.innerHTML = '';
      }
      setIsPlaying(false);
      setCurrentDate('');
      return;
    };

    const vizItemDateIdxMap = {};
    vizItems.forEach((vizItem, idx) => {
      const datetime = vizItem['properties']['datetime'];
      const momentFormattedDatetimeStr = moment(datetime).format();
      vizItemDateIdxMap[momentFormattedDatetimeStr] = idx;
    });

    const bufferedLayer = new Set();
    const bufferedSource = new Set();

    let startDatetime = vizItems[0]['properties']['datetime'];
    let secondDatetime = vizItems.length > 1 ? vizItems[1]['properties']['datetime'] : startDatetime;
    const captureInterval = moment(secondDatetime).diff(
      startDatetime,
      'minutes'
    );
    let endDatetime = vizItems[vizItems.length - 1]['properties']['datetime'];

    if (timeline.current) {
      timeline.current.remove(map);
    }
    
    timeline.current = new TimelineControl({
      start: startDatetime,
      end: endDatetime,
      initial: startDatetime,
      step: 1000 * 60 * captureInterval,
      onToggle: (playing) => {
        setIsPlaying(playing);
      },
      onStart: (date) => {
        setIsPlaying(true);
        handleAnimation(map, VMIN, VMAX, colormap, assets, date, vizItemDateIdxMap, vizItems, bufferedLayer, bufferedSource);
      },
      onChange: (date) => {
        const dateStr = moment(date).utc().format('MM/DD/YYYY, HH:mm:ss') + ' UTC';
        setCurrentDate(dateStr);
        handleAnimation(map, VMIN, VMAX, colormap, assets, date, vizItemDateIdxMap, vizItems, bufferedLayer, bufferedSource);
      },
    });

    const timelineElement = timeline.current.onAdd(map);
    if (timelineContainerRef.current) {
        timelineContainerRef.current.innerHTML = '';
        timelineContainerRef.current.appendChild(timelineElement);
    }
    
    setIsPlaying(timeline.current.playing);
    setCurrentDate(moment(timeline.current.time).utc().format('MM/DD/YYYY, HH:mm:ss') + ' UTC');


    return () => {
      bufferedLayer.forEach((layer) => {
        if (layerExists(map, layer)) map.removeLayer(layer);
      });
      bufferedSource.forEach((source) => {
        if (sourceExists(map, source)) map.removeSource(source);
      });
      prev = null;
    };
  }, [vizItems, map, VMIN, VMAX, colormap, assets]);

  const handlePlayPause = () => {
    if (timeline.current) {
      timeline.current.toggle();
    }
  };

  const handleNext = () => {
    if (timeline.current) {
      timeline.current.next();
    }
  };

  const handlePrev = () => {
    if (timeline.current) {
      timeline.current.prev();
    }
  };

  if (!vizItems || vizItems.length === 0) {
    return null;
  }

  return (
    <>
      <div ref={timelineContainerRef} style={{ display: 'none' }} />

      <Paper
        elevation={4}
        sx={{
          p: 1.5,
          borderRadius: '12px',
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(5px)',
          minWidth: '450px',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
          <IconButton onClick={handlePrev} aria-label="previous step">
            <SkipPreviousIcon />
          </IconButton>
          <IconButton onClick={handlePlayPause} aria-label="play/pause">
            {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
          </IconButton>
          <IconButton onClick={handleNext} aria-label="next step">
            <SkipNextIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
              {currentDate}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </>
  );
};

let prev = null;

const handleAnimation = (
  map,
  VMIN,
  VMAX,
  colormap,
  assets,
  date,
  vizItemDateIdxMap,
  vizItems,
  bufferedLayer,
  bufferedSource
) => {
  const momentFormattedDatetimeStr = moment(date).format();
  if (!(momentFormattedDatetimeStr in vizItemDateIdxMap)) return;

  const index = vizItemDateIdxMap[momentFormattedDatetimeStr];
  const k = 4;
  bufferSourceLayers(
    map,
    VMIN,
    VMAX,
    colormap,
    assets,
    vizItems,
    index,
    k,
    bufferedLayer,
    bufferedSource
  );
  const prevLayerId = prev;
  const currentLayerId = getLayerId(index);
  transitionLayers(map, prevLayerId, currentLayerId);
  prev = currentLayerId;
};

const bufferSourceLayers = (
  map,
  VMIN,
  VMAX,
  colormap,
  assets,
  vizItems,
  index,
  k,
  bufferedLayer,
  bufferedSource
) => {
  let start = index;
  let limit = index + k;
  if (start >= vizItems.length - 1) {
    return;
  }
  if (limit >= vizItems.length) {
    limit = vizItems.length;
  }
  for (let i = start; i < limit; i++) {
    let sourceId = getSourceId(i);
    let layerId = getLayerId(i);
    if (!bufferedLayer.has(layerId)) {
      bufferSourceLayer(
        map,
        VMIN,
        VMAX,
        colormap,
        assets,
        vizItems[i],
        sourceId,
        layerId
      );
      bufferedLayer.add(layerId);
      if (!bufferedSource.has(sourceId)) bufferedSource.add(sourceId);
    }
  }
};

const transitionLayers = (map, prevLayerId, currentLayerId) => {
  if (currentLayerId && layerExists(map, currentLayerId))
    map.setLayoutProperty(currentLayerId, 'visibility', 'visible');

  setTimeout(() => {
    if (prevLayerId && layerExists(map, prevLayerId)) 
      map.setLayoutProperty(prevLayerId, 'visibility', 'none');
  }, 900);
};

