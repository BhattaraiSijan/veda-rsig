// This file defines the datasets for the 'Weather & Radar' category.

// We import the thumbnails from the central thumbnail index file.
import {
  thumbnail1,
  thumbnail2,
  thumbnail4,
  thumbnail3,
} from '../thumbnails';

export const airQualityData = [
  { 
    id: '1', 
    name: 'public.aqs_gases_metadata', 
    thumbnailUrl: thumbnail1,
    // This URL points to a GeoJSON source 
    url: 'https://dev.openveda.cloud/api/features/collections/public.aqs_gases_metadata/items' 
  },
  { 
    id: '2', 
    name: 'public.aqs_gases_metadata', 
    thumbnailUrl: thumbnail4,
    // Example URL for a different dataset
    url: 'https://dev.openveda.cloud/api/features/collections/public.aqs_gases_metadata/items' 
  },
  { 
    id: '3', 
    name: 'public.aqs_gases_metadata', 
    thumbnailUrl: thumbnail2,
    url: 'https://dev.openveda.cloud/api/features/collections/public.aqs_gases_metadata/items' 
  },
  { 
    id: '4', 
    name: 'public.aqs_gases_metadata', 
    thumbnailUrl: thumbnail3,
    url: 'https://dev.openveda.cloud/api/features/collections/public.aqs_gases_metadata/items' 
  },
];
