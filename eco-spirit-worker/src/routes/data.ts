// src/routes/data.ts
import { Env } from '../types';
import { getGeoJSON } from '../lib/r2';

export async function handleData(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const recommended = url.searchParams.get('recommended');

    const geoJSON = await getGeoJSON(env.R2_BUCKET);

    // Filter for recommended buildings if requested
    if (recommended === 'true') {
      geoJSON.features = geoJSON.features.filter((f) => f.properties.recommended === true);
    }

    return new Response(JSON.stringify(geoJSON), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}