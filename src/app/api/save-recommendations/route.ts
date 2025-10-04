// app/api/save-recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // force Node runtime

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    const filePath = path.join(process.cwd(), "public", "recommendations.json");

    // Ensure "public" exists
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // Write file locally (overwrite)
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf8");

    console.log("✅ Saved recommendations locally at:", filePath);
    return NextResponse.json({ success: true, saved: dataToSave });
  } catch (error: any) {
    console.error("❌ Error saving recommendations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
