// src/routes/score.ts
import { Env, GeoJSONFeature, BuildingProperties } from '../types';
import { getGeoJSON, saveGeoJSON } from '../lib/r2';

// Simulated scoring based on location and building characteristics
function calculateEmissions(squareFootage: number, vacancyYears: number): number {
  // Lower is better. Older vacant buildings may have higher emissions potential
  const baseEmissions = squareFootage * 0.05; // kg CO2/sqft baseline
  const vacancyPenalty = vacancyYears * 10; // Deterioration increases emissions
  return Math.round(baseEmissions + vacancyPenalty);
}

function calculateTreeCoverage(coordinates: [number, number], district: string): number {
  // 0-1 scale. Simulate based on district (some areas are greener)
  const greenDistricts = ['Fresh Pond', 'Alewife', 'Harvard Square'];
  const baseScore = greenDistricts.includes(district) ? 0.6 : 0.3;
  // Add some variation based on coordinates
  const variation = (Math.sin(coordinates[0] * 100) + Math.sin(coordinates[1] * 100)) * 0.15;
  return Math.max(0, Math.min(1, baseScore + variation));
}

function calculateWalkability(district: string, coordinates: [number, number]): number {
  // 0-1 scale. Urban centers have higher walkability
  const walkableDistricts: Record<string, number> = {
    'Harvard Square': 0.95,
    'Central Square': 0.92,
    'Porter Square': 0.88,
    'Kendall Square': 0.90,
    'Alewife': 0.70,
    'Fresh Pond': 0.65,
  };
  return walkableDistricts[district] || 0.70;
}

function calculateSolarExposure(coordinates: [number, number], squareFootage: number): number {
  // 0-1 scale. Simulate based on location and roof space
  const latitude = coordinates[1];
  const baseExposure = 0.65; // Cambridge baseline
  const sizeFactor = Math.min(squareFootage / 10000, 1) * 0.15; // Larger roofs = more potential
  const latitudeBonus = (42.4 - latitude) * 0.5; // Slight variation by exact location
  return Math.max(0, Math.min(1, baseExposure + sizeFactor + latitudeBonus));
}

function calculateTransitAccess(district: string): number {
  // 0-1 scale. Distance to T stations
  const transitScores: Record<string, number> = {
    'Harvard Square': 0.98,
    'Central Square': 0.95,
    'Porter Square': 0.92,
    'Kendall Square': 0.96,
    'Alewife': 0.85,
    'Fresh Pond': 0.60,
  };
  return transitScores[district] || 0.70;
}

function calculateBikeability(district: string, walkability: number): number {
  // 0-1 scale. Related to walkability but slightly different
  return Math.min(1, walkability * 0.95);
}

function calculateGreenScore(props: BuildingProperties): number {
  const { emissions = 0, treeCoverage = 0, walkability = 0, solarExposure = 0, transitAccess = 0, bikeability = 0 } = props;
  
  // Weighted scoring (0-100 scale)
  const emissionsScore = Math.max(0, 100 - (emissions / 10)); // Normalize emissions
  const weights = {
    emissions: 0.25,
    treeCoverage: 0.15,
    walkability: 0.20,
    solarExposure: 0.15,
    transitAccess: 0.15,
    bikeability: 0.10,
  };
  
  const score =
    emissionsScore * weights.emissions +
    treeCoverage * 100 * weights.treeCoverage +
    walkability * 100 * weights.walkability +
    solarExposure * 100 * weights.solarExposure +
    transitAccess * 100 * weights.transitAccess +
    bikeability * 100 * weights.bikeability;
  
  return Math.round(score);
}

export async function handleScore(request: Request, env: Env): Promise<Response> {
  try {
    const geoJSON = await getGeoJSON(env.R2_BUCKET);
    
    // Calculate scores for all buildings
    geoJSON.features.forEach((feature) => {
      const props = feature.properties;
      const squareFootage = parseInt(props['Square Footage']) || 5000;
      const vacancyYears = new Date().getFullYear() - (props['Vacancy Date'] || 2020);
      const district = props['Commercial District'];
      const coords = feature.geometry.coordinates;
      
      // Calculate all metrics
      props.emissions = calculateEmissions(squareFootage, vacancyYears);
      props.treeCoverage = calculateTreeCoverage(coords, district);
      props.walkability = calculateWalkability(district, coords);
      props.solarExposure = calculateSolarExposure(coords, squareFootage);
      props.transitAccess = calculateTransitAccess(district);
      props.bikeability = calculateBikeability(district, props.walkability);
      
      // Calculate overall green score
      props.greenScore = calculateGreenScore(props);
    });
    
    // Save updated GeoJSON
    await saveGeoJSON(env.R2_BUCKET, geoJSON);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Scored ${geoJSON.features.length} buildings`,
        summary: {
          total: geoJSON.features.length,
          avgScore: Math.round(
            geoJSON.features.reduce((sum, f) => sum + (f.properties.greenScore || 0), 0) /
              geoJSON.features.length
          ),
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}