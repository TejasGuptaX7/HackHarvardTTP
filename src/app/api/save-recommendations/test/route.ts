// app/api/save-recommendations/test/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "recommendations.json");
  const exists = fs.existsSync(filePath);

  return NextResponse.json({
    exists,
    cwd: process.cwd(),
    filePath,
    contents: exists ? JSON.parse(fs.readFileSync(filePath, "utf8")) : null,
  });
}
