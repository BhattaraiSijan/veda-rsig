export const galleryData = {
  'satellite': [
    {
      id: 'omi-no2-2d',
      name: 'OMI-2D',
      thumbnailUrl: '/path/to/thumbnail1.jpg',
      type: 'raster',
      description: 'Ozone Monitoring Instrument NO2 data'
    },
    {
      id: 'modis-annual-lai-2003-2020',
      name: 'MODIS LAI',
      type: 'raster',
      thumbnailUrl: '/path/to/thumbnail4.jpg',
      description: 'MODIS Leaf Area Index annual data'
    },
    {
      id: 'tempo',
      name: 'TEMPO',
      type: 'raster',
      thumbnailUrl: '/path/to/thumbnail2.jpg',
      description: 'TEMPO atmospheric composition data'
    },
    {
      id: 'TROPESS_reanalysis_mon_emi_nox_anth',
      name: 'TROPESS',
      type: 'netcdf-2d',
      thumbnailUrl: '/path/to/thumbnail3.jpg',
      description: 'TROPESS reanalysis NOx emissions'
    }
  ],
  'insitu': [
    {
      id: 'public.aqs_gases_metadata',
      name: 'AQS Stations',
      type: 'feature',
      thumbnailUrl: '/path/to/thumbnail1.jpg',
      description: 'Air Quality System monitoring stations'
    }
  ],
  'Lidar': [
    {
      id: 'calipso-point-cloud',
      name: 'CALIPSO',
      type: 'point-cloud',
      url: 'https://rsig-point-cloud.s3.us-west-2.amazonaws.com/ept-tileset/tileset.json',
      thumbnailUrl: '/path/to/thumbnail1.jpg',
      description: 'CALIPSO lidar point cloud data'
    }
  ]
};