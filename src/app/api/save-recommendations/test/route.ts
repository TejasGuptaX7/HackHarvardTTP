// Test endpoint to verify the save-recommendations functionality
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Test data with some building IDs that should exist in the GeoJSON
    const testRecommendations = [
      {
        buildingId: 1,
        reason: "Test recommendation for building 1 - high walkability score",
        score: 85,
        address: "1674 Massachusetts Avenue",
        district: "Lower Massachusetts Ave"
      },
      {
        buildingId: 2,
        reason: "Test recommendation for building 2 - proximity to public transportation",
        score: 78,
        address: "174 Alewife Brook Parkway",
        district: "Alewife"
      }
    ];

    // Make a POST request to our save-recommendations endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/save-recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recommendations: testRecommendations }),
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Test completed",
      testRecommendations,
      apiResponse: result,
      status: response.status
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}