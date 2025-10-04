// src/lib/r2.ts
import { GeoJSONCollection, GeoJSONFeature } from '../types';

const GEOJSON_KEY = 'vacant_buildings.geojson';

export async function getGeoJSON(bucket: R2Bucket): Promise<GeoJSONCollection> {
  const object = await bucket.get(GEOJSON_KEY);
  
  if (!object) {
    throw new Error('GeoJSON file not found in R2');
  }
  
  const data = await object.text();
  return JSON.parse(data) as GeoJSONCollection;
}

export async function saveGeoJSON(bucket: R2Bucket, data: GeoJSONCollection): Promise<void> {
  await bucket.put(GEOJSON_KEY, JSON.stringify(data, null, 2), {
    httpMetadata: {
      contentType: 'application/json',
    },
  });
}

export async function updateBuildingProperties(
  bucket: R2Bucket,
  buildingId: number,
  updates: Partial<GeoJSONFeature['properties']>
): Promise<void> {
  const geoJSON = await getGeoJSON(bucket);
  
  const feature = geoJSON.features.find(f => f.properties.id === buildingId);
  if (!feature) {
    throw new Error(`Building with id ${buildingId} not found`);
  }
  
  feature.properties = { ...feature.properties, ...updates };
  await saveGeoJSON(bucket, geoJSON);
}

export async function clearRecommendations(bucket: R2Bucket): Promise<void> {
  const geoJSON = await getGeoJSON(bucket);
  
  geoJSON.features.forEach(feature => {
    feature.properties.recommended = false;
    feature.properties.recommendationReason = '';
    feature.properties.recommendationScore = undefined;
  });
  
  await saveGeoJSON(bucket, geoJSON);
}

export async function setRecommendations(
  bucket: R2Bucket,
  recommendations: Array<{ buildingId: number; reason: string; score: number }>
): Promise<void> {
  const geoJSON = await getGeoJSON(bucket);
  
  geoJSON.features.forEach(feature => {
    feature.properties.recommended = false;
    feature.properties.recommendationReason = '';
    feature.properties.recommendationScore = undefined;
  });
  
  recommendations.forEach(rec => {
    const feature = geoJSON.features.find(f => f.properties.id === rec.buildingId);
    if (feature) {
      feature.properties.recommended = true;
      feature.properties.recommendationReason = rec.reason;
      feature.properties.recommendationScore = rec.score;
    }
  });
  
  await saveGeoJSON(bucket, geoJSON);
}