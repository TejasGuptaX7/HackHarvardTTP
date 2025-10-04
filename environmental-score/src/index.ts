export interface BuildingFeature {
  id: string;
  properties: {
    emissions?: number;
    walkability?: number;
    treeCoverage?: number;
    waterUse?: number;
  };
}

function calculateGreenScore(building: BuildingFeature): number {
  const { emissions = 0, walkability = 0, treeCoverage = 0, waterUse = 0 } = building.properties;

  const normalized = {
    emissions: Math.max(0, 100 - emissions * 10),
    walkability: Math.min(walkability, 100),
    treeCoverage: Math.min(treeCoverage * 2, 100),
    waterUse: Math.max(0, 100 - waterUse * 5),
  };

  return Math.round(
    (normalized.emissions +
      normalized.walkability +
      normalized.treeCoverage +
      normalized.waterUse) /
      4
  );
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Use POST with GeoJSON body", { status: 400 });
    }

    try {
      const geojson = await request.json() as { features?: BuildingFeature[] };
      if (!geojson.features) throw new Error("Invalid GeoJSON");

      const scored = geojson.features.map((f: BuildingFeature) => ({
        ...f,
        score: calculateGreenScore(f),
      }));

      const updated = { ...geojson, features: scored };

      return new Response(JSON.stringify(updated, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  },
};
