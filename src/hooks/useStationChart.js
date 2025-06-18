import { useState, useCallback } from 'react';

export function useStationChart() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartLabels, setChartLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true)
  
  const showStationChart = useCallback(async (stationFeature) => {
    if (!stationFeature?.properties) return;
    const station = {
      station_code: stationFeature.properties.station_code,
      city: stationFeature.properties.city,
    };    
    setSelectedStation(station);
    setIsLoading(true);
    setError(null);
    setChartData([]);
    setChartLabels([]);
    
    try {
      const timeseriesData = await fetchStationTimeSeries(station.station_code);
      const { data, labels } = processTimeseriesForChartJs(timeseriesData, station.station_code, station.city);
      
      setChartData(data);
      setChartLabels(labels);
      
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hideStationChart = useCallback(() => {
    console.log('Hiding station chart');
    setSelectedStation(null);
    setChartData([]);
    setChartLabels([]);
    setError(null);
    setIsLoading(false);
    setIsVisible(false);
  }, []);

  return {
    selectedStation,
    chartData,
    chartLabels,
    isLoading,
    error,
    showStationChart,
    hideStationChart,
    isVisible
  };
}

export async function fetchStationTimeSeries(stationCode) {
  const timeseriesUrl = `https://dev.openveda.cloud/api/features/collections/public.aqs_sites_gases/items?station_code=${stationCode}`;
  console.log('Fetching from URL:', timeseriesUrl);
  
  const response = await fetch(timeseriesUrl);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('API Response:', data);
  return data;
}

export function processTimeseriesForChartJs(geojsonData, stationCode, city) {
  console.log('Processing timeseries data for Chart.js:', geojsonData);
  
  if (!geojsonData.features || !Array.isArray(geojsonData.features)) {
    console.error('Invalid GeoJSON structure:', geojsonData);
    throw new Error('Invalid GeoJSON data structure');
  }
  
  console.log(`Found ${geojsonData.features.length} features in response`);
  
  if (geojsonData.features.length === 0) {
    console.warn('No features found in response');
    return { data: [], labels: [] };
  }

  // Process all data points
  const allDataPoints = geojsonData.features.map((feature, idx) => {
    const { properties } = feature;
    console.log(`Processing feature ${idx}:`, properties);
    
    const value = parseFloat(properties.value);
    return {
      date: new Date(properties.datetime),
      value: isNaN(value) ? null : value,
      parameter: properties.parameter,
      units: properties.units_of_measure,
      datetime: properties.datetime,
      isValid: !isNaN(value) && value !== null
    };
  }).sort((a, b) => a.date - b.date);


  const groupedByParameter = {};
  allDataPoints.forEach(point => {
    if (!groupedByParameter[point.parameter]) {
      groupedByParameter[point.parameter] = [];
    }
    groupedByParameter[point.parameter].push(point);
  });

  let bestParameter = null;
  let maxValidPoints = 0;
  
  Object.keys(groupedByParameter).forEach(param => {
    const validPoints = groupedByParameter[param].filter(p => p.isValid).length;
    console.log(`Parameter ${param}: ${validPoints} valid points`);
    if (validPoints > maxValidPoints) {
      maxValidPoints = validPoints;
      bestParameter = param;
    }
  });

  if (!bestParameter || maxValidPoints === 0) {
    console.warn('No valid data points found');
    return { data: [], labels: [] };
  }

  console.log(`Using parameter: ${bestParameter} with ${maxValidPoints} valid points`);

  const parameterData = groupedByParameter[bestParameter];
  const validData = parameterData.filter(point => point.isValid);

  // Create arrays that Chart.js expects
  const data = validData.map(point => point.value);
  const labels = validData.map(point => {
    const date = point.date;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  });

  return {
    data,
    labels,
    parameter: bestParameter,
    stationCode,
    city,
    totalPoints: validData.length
  };
}