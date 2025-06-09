// This file acts as a central hub for all dataset definitions.
// It imports data from individual category files and exports them
// in a single structured object for the DatasetGallery to use.

import { weatherData } from './weather';
import { satelliteData } from './satellite';
import { airQualityData } from './air_quality';
import { oceanographyData } from './oceanography';

export const galleryData = {
  'Weather & Radar': weatherData,
  'Satellite': satelliteData,
  'Air Quality': airQualityData,
  'Oceanography': oceanographyData,
};
