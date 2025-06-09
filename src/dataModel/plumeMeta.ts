export interface PlumeMeta {
  id: string; // Format: <country>_<state>_<region>_<plume_id>. e.g. Mexico_Durango_BV1_BV1-1
  lon: string;
  lat: string;
  country: string;
  administrativeDivision: string;
  plumeSourceId: string;
  plumeSourceName: string;
  startDatetime: string;
  endDatetime: string;
  imageUrl: string;
  tiffUrl: string;
  totalReleaseMass: string;
  colEnhancements: string;
  duration: string;
}

export interface PlumeRegionMeta {
  id: string; // Format: <region>. e.g. BV1
  plumeSourceName: string;
  country: string;
  administrativeDivision: string;
  plumes: PlumeMeta[];
}
