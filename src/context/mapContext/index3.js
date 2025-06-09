import React, { createContext, useContext, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { PolygonLayer } from '@deck.gl/layers'; // Added import
import {GeoJsonLayer} from '@deck.gl/layers';


const MapboxContext = createContext();

// Use the provided token directly for this example
const accessToken = 'pk.eyJ1IjoiY292aWQtbmFzYSIsImEiOiJjbGNxaWdqdXEwNjJnM3VuNDFjM243emlsIn0.NLbvgae00NUD5K64CD6ZyA';
// Removed environment variable dependencies for style URL for this example, using a default.

// Sample Building Data (same as previous examples)
const sourceBuildingData = [
    {
        id: 'building1', name: 'Skyscraper Alpha', height: 350, base_height: 0, color: [255, 0, 0], // Red
        coordinates: [
            [[-74.0060, 40.7128], [-74.0050, 40.7128], [-74.0050, 40.7138], [-74.0060, 40.7138], [-74.0060, 40.7128]]
        ]
    },
    {
        id: 'building2', name: 'Office Tower Beta', height: 220, base_height: 0, color: [0, 0, 255], // Blue
        coordinates: [
            [[-74.0040, 40.7115], [-74.0030, 40.7115], [-74.0030, 40.7125], [-74.0040, 40.7125], [-74.0040, 40.7115]]
        ]
    },
    {
        id: 'building3', name: 'Residential Complex Gamma', height: 150, base_height: 20, color: [0, 255, 0], // Green
        coordinates: [
            [[-74.0070, 40.7140], [-74.0065, 40.7140], [-74.0065, 40.7148], [-74.0070, 40.7148], [-74.0070, 40.7140]]
        ]
    }
];
const polygonData = sourceBuildingData.map(building => ({
    ...building,
    polygon: building.coordinates[0]
}));


export const MapboxProvider = ({ children }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const deckOverlay = useRef(null); // Ref for Deck.gl overlay
  const tooltipRef = useRef(null); // Ref for tooltip DOM element

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // Initialize map only once and if container exists

    const mapboxStyleUrl = 'mapbox://styles/mapbox/satellite-streets-v12'; // Using style from previous examples

    map.current = new mapboxgl.Map({
        accessToken: accessToken, // Pass token here
        container: mapContainer.current,
        style: mapboxStyleUrl,
        center: [-86.82, 32.967243], // Centered on the US
        zoom: 6,
        // trackResize: true is the default in v2+
    });

    map.current.once('load', () => {
        console.log("Map loaded, adding Deck.gl overlay and layer.");

        // Create and style tooltip element
        const tooltipNode = document.createElement('div');
        tooltipNode.style.position = 'absolute';
        tooltipNode.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltipNode.style.color = 'white';
        tooltipNode.style.padding = '8px';
        tooltipNode.style.borderRadius = '4px';
        tooltipNode.style.fontSize = '13px';
        tooltipNode.style.pointerEvents = 'none';
        tooltipNode.style.zIndex = '10'; 
        tooltipNode.style.display = 'none';
        tooltipNode.style.fontFamily = 'Inter, sans-serif';
        mapContainer.current.appendChild(tooltipNode); // Append to map container
        tooltipRef.current = tooltipNode;

        deckOverlay.current = new MapboxOverlay({
            interleaved: true, // Good for mixing 3D with Mapbox labels
            layers: [], // Initialize with empty layers, will be set below
        });
        map.current.addControl(deckOverlay.current);

        const polygonLayer3D = new PolygonLayer({
            id: 'deckgl-polygon-buildings',
            data: polygonData,
            // Visual properties
            opacity: 0.85,
            stroked: false,
            filled: true,
            extruded: true,
            wireframe: true,
            // Accessors
            getPolygon: d => d.polygon,
            getElevation: d => d.height,
            getFillColor: d => [...d.color, 180],
            getLineColor: [255, 255, 255, 100],
            getPolygonOffset: ({layerIndex}) => [0, -layerIndex * 100], // Helps with z-fighting
            // Interactivity
            pickable: true,
            autoHighlight: true,
            highlightColor: [255, 255, 0, 200],
            onHover: ({ object, x, y }) => {
                const el = tooltipRef.current;
                if (el) { // Check if tooltip element exists
                    if (object) {
                        el.style.display = 'block';
                        // x, y are viewport coordinates.
                        // Tooltip is child of mapContainer which is full screen, so direct assignment works.
                        el.style.left = `${x}px`;
                        el.style.top = `${y}px`;
                        el.innerHTML = `
                            <div style="font-weight: bold; font-size: 1.1em;">${object.name}</div>
                            <div>Height: ${object.height}m</div>
                            ${object.base_height > 0 ? `<div>Base Height (data): ${object.base_height}m</div>` : ''}
                        `;
                    } else {
                        el.style.display = 'none';
                    }
                }
            },
            onError: (error) => {
                console.error('Deck.gl PolygonLayer Error:', error);
            }
        });

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
            }
        );
        deckOverlay.current.setProps({ layers: [geoJsonLayer] });
    });
    
    return () => {
      console.log("Cleaning up Mapbox map and Deck.gl resources.");
      if (tooltipRef.current && tooltipRef.current.parentNode) {
        tooltipRef.current.parentNode.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
      // map.remove() should also remove controls like MapboxOverlay
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      deckOverlay.current = null; // Clear the ref
    };
  }, []);

  return (
    <MapboxContext.Provider value={{ map: map.current, deckOverlay: deckOverlay.current }}>
      {/* The map container needs position: relative for the absolutely positioned tooltip */}
      <div id='map' ref={mapContainer} style={{ width: '100%', height: '100%', position: 'relative' }} />
      {children}
    </MapboxContext.Provider>
  );
};

export const useMapbox = () => useContext(MapboxContext);