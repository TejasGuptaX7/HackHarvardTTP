// app/api/save-recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // force Node runtime

// Utility function to update GeoJSON with recommendations
function updateGeoJSONWithRecommendations(geojsonPath: string, recommendations: any[]) {
  try {
    // Read the current GeoJSON file
    const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, "utf8"));
    
    // Get the list of recommended building IDs
    const recommendedIds = new Set(recommendations.map(r => r.buildingId));
    
    // Update all features
    geojsonData.features.forEach((feature: any) => {
      const buildingId = feature.properties.id;
      
      if (recommendedIds.has(buildingId)) {
        // Set as recommended
        feature.properties.recommended = true;
        feature.properties.recommendationReason = recommendations.find(r => r.buildingId === buildingId)?.reason || '';
        feature.properties.recommendationScore = recommendations.find(r => r.buildingId === buildingId)?.score || null;
      } else {
        // Set as not recommended
        feature.properties.recommended = false;
        feature.properties.recommendationReason = '';
        feature.properties.recommendationScore = null;
      }
    });
    
    // Write the updated GeoJSON back to file
    fs.writeFileSync(geojsonPath, JSON.stringify(geojsonData, null, 2), "utf8");
    
    console.log(`✅ Updated GeoJSON with ${recommendations.length} recommendations`);
    return true;
  } catch (error) {
    console.error("❌ Error updating GeoJSON:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { recommendations?: any[] };
    const { recommendations } = body;

    if (!Array.isArray(recommendations)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const dataToSave = {
      timestamp: new Date().toISOString(),
      recommendations: recommendations.map((r: any) => ({
        buildingId: r.buildingId,
        reason: r.reason,
        score: r.score ?? null,
        address: r.address ?? "",
        district: r.district ?? "",
      })),
    };

    // ✅ Local write path (absolute)
    const recommendationsPath = path.join(process.cwd(), "public", "recommendations.json");
    const geojsonPath = path.join(process.cwd(), "public", "data", "vacant_buildings.geojson");

    // Ensure "public" exists
    if (!fs.existsSync(path.dirname(recommendationsPath))) {
      fs.mkdirSync(path.dirname(recommendationsPath), { recursive: true });
    }

    // Write recommendations file locally (overwrite)
    fs.writeFileSync(recommendationsPath, JSON.stringify(dataToSave, null, 2), "utf8");
    console.log("✅ Saved recommendations locally at:", recommendationsPath);

    // Update GeoJSON file with recommendation flags
    const geojsonUpdated = updateGeoJSONWithRecommendations(geojsonPath, dataToSave.recommendations);
    
    if (!geojsonUpdated) {
      console.warn("⚠️ Failed to update GeoJSON, but recommendations were saved");
    }

    return NextResponse.json({ 
      success: true, 
      saved: dataToSave,
      geojsonUpdated: geojsonUpdated
    });
  } catch (error: any) {
    console.error("❌ Error saving recommendations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
