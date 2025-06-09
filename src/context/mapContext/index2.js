import React, { createContext, useContext, useRef, useEffect } from 'react';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {GeoJsonLayer} from '@deck.gl/layers';

import {MapboxOverlay} from '@deck.gl/mapbox';

const MapboxContext = createContext();

const accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
const mapboxStyleBaseUrl = process.env.REACT_APP_MAPBOX_STYLE_URL;
const BASEMAP_STYLES_MAPBOX_ID =
  process.env.REACT_APP_BASEMAP_STYLES_MAPBOX_ID || 'cldu1cb8f00ds01p6gi583w1m';

export const MapboxProvider = ({ children }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    let mapboxStyleUrl = 'mapbox://styles/mapbox/streets-v12';
    if (mapboxStyleBaseUrl) {
      mapboxStyleUrl = `${mapboxStyleBaseUrl}/${BASEMAP_STYLES_MAPBOX_ID}`;
    }

    mapboxgl.accessToken = accessToken;
    map.current =  new mapboxgl.Map({
        container: mapContainer.current,
        style: mapboxStyleUrl,
        center: [-98.771556, 32.967243], // Centered on the US
        zoom: 4,
        options: {
            trackResize: true,
        },
    }).once('load',()=>{
       const geoJsonLayer = new GeoJsonLayer({
                id: 'aqs-gases-layer',
                data: 'https://dev.openveda.cloud/api/features/collections/public.aqs_gases_metadata/items?limit=100',
                pickable: true,
                pointRadiusMinPixels: 10,
                getPointRadius: 12,
                getFillColor: [0, 128, 255, 180], // light blue
                getLineColor: [0, 0, 0],
                getLineWidth: 1,
                onClick: async (info) => {
                  // The 'info.object' contains the clicked feature from your GeoJSON data.
                  if (info.object && info.object.properties) {
                    const stationCode = info.object.properties.station_code;
                    
                    if (stationCode) {
                      // Construct the new API endpoint URL to fetch records for the specific station
                      const stationRecordsUrl = `https://dev.openveda.cloud/api/features/collections/public.aqs_sites_gases/items?station_code=${stationCode}`;
                      
                      console.log(`Fetching records for station: ${stationCode} from ${stationRecordsUrl}`);
    
                      try {
                        const response = await fetch(stationRecordsUrl);
                        if (!response.ok) {
                          throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const stationRecords = await response.json();
                        
                        // Log the fetched records to the console
                        console.log(`Records for station ${stationCode}:`, stationRecords);
    
                      } catch (error) {
                        console.error("Error fetching station records:", error);
                      }
                    } else {
                      console.log("No station_code found in clicked feature properties.");
                    }
                  }
                }
                });
        map.current.addControl(geoJsonLayer); 
    });
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

  }, []);

  return (
    <MapboxContext.Provider value={{ map: map.current }}>
      <div id='map' ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {children}
    </MapboxContext.Provider>
  );
};

export const useMapbox = () => useContext(MapboxContext);
