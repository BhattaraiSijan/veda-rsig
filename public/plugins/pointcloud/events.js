//event sub pup system  
const handleLayerClick = (layer) => {
  console.log('Layer clicked:', layer);
  const pointCloudLayer = new window.Tile3DLayer({
    id: "abcd",
    data: layer.detail.url,
    pickable: true,
    visible: true,
    pointSize: 2,
    opacity: 1.0,
    _subLayerProps: {
      'points': { pointSize: 0.2, getColor: (d) => d.color || [0, 255, 0, 255], material: false, radiusPixels: 15, billboard: false, sizeScale: 1, sizeMinPixels: 8, sizeMaxPixels: 30 },
      'mesh': { getColor: [0, 255, 0, 255], material: false, wireframe: false }
    },
    // loadOptions: { '3d-tiles': { pointCloudColoration: { mode: 'RGB' } } },
    getPointColor: [0, 255, 0, 255],
  });
  console.log('PointCloudLayer created:', pointCloudLayer);
  const deckOverlay = new window.MapboxOverlay({
    interleaved: false,
    layers: [pointCloudLayer],
  });
  
  
  window.map.current.addControl(deckOverlay);
  window.map.current.flyTo({
    center: [-104.11787656428743,34.168559741615645], 
    zoom: 8,
    pitch: 60,
    bearing: 0,
    duration: 2000,
  })
  console.log(window.map.current);
};

const handleMarkerClick = (marker) => {
  console.log('Marker clicked:', marker);
  // Implement your logic here, e.g., show a popup or highlight the marker
};

//add event listeners for layer and marker clicks   
window.addEventListener('layerSelected', (event) => {
  console.log('Event captured Layer selected:', event);
  handleLayerClick(event);
});
window.addEventListener('markerClick', (event) => {
  handleMarkerClick(event.detail.marker);
});


