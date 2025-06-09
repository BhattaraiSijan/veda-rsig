import React, { useEffect } from 'react';
import { useMapbox } from '../../../context/mapContext'; // Adjust path to your mapContext file
import { GeoJsonLayer } from '@deck.gl/layers';

/**
 * This component manages a single GeoJsonLayer for Deck.gl.
 * It listens to an `activeLayerUrl` prop and updates the map when the URL changes.
 * It's a "manager" component, so it doesn't render any visible HTML itself.
 */
export function DeckGlLayerManager({ activeLayerUrl, onStationClick }) {
  // Get the deckOverlay instance from our map context.
  const { deckOverlay } = useMapbox();

  useEffect(() => {
    // If the deck.gl overlay isn't ready yet, do nothing.
    if (!deckOverlay) {
      return;
    }

    // If the activeLayerUrl is cleared (e.g., set to null),
    // we remove all layers from the overlay.
    if (!activeLayerUrl) {
      deckOverlay.setProps({ layers: [] });
      return;
    }

    // A new layer URL has been provided, so we create a new GeoJsonLayer.
    const geoJsonLayer = new GeoJsonLayer({
      id: `geojson-layer-${activeLayerUrl}`, // Dynamic ID prevents layer conflicts
      data: activeLayerUrl,
      
      // Add debugging hooks to see if data loads or if there is an error
      onDataLoad: (data) => {
        console.log('Deck.gl: GeoJSON data successfully loaded for', activeLayerUrl, data);
      },
      onError: (error) => {
        console.error('Deck.gl: Error loading GeoJSON data for', activeLayerUrl, error);
      },
      
      // Styling and interactivity properties
      pickable: true,
      pointRadiusMinPixels: 5,
      getPointRadius: 8,
      getFillColor: [0, 128, 255, 180], // NASA Blue with transparency
      
      // The onClick handler that will be triggered when a user clicks a point on this layer.
      onClick: (info) => {
        // If an onStationClick function was passed as a prop, we call it
        // with the data from the feature that was clicked.
        if (onStationClick && info.object) {
          onStationClick(info.object);
        }
      }
    });

    // Update the Deck.gl overlay with the new layer.
    // This automatically replaces any previous layers.
    deckOverlay.setProps({ layers: [geoJsonLayer] });
    console.log(`Deck.gl layer updated with URL: ${activeLayerUrl}`);

  }, [activeLayerUrl, deckOverlay, onStationClick]); // This effect re-runs only when these props change.

  // This component only manages the map, so it renders nothing.
  return null;
}
