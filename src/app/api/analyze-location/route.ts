import { NextRequest, NextResponse } from 'next/server';

// --- Replace the existing FALLBACK_ANALYSIS with this block ---
const FALLBACK_ANALYSIS = {
  populationData: {
    peopleWithinHalfMile: "2,500-4,000 people",
    neighborhoodType: "Mixed residential-commercial",
    populationDensity: "8,000-12,000 people per square mile",
    demographics: "Young professionals, families, mixed income",
    housingType: "Apartments and townhouses"
  },
  businessAnalysis: {
    localPopulationDensity: "2,500-4,000 people within 0.5 miles",
    estimatedFootTraffic: "120-250 daily visitors based on local demographics",
    estimatedRevenue: "$12,000-$28,000 monthly based on neighborhood income levels",
    targetDemographics: "Local residents aged 25-45, mixed income levels",
    competitionLevel: "3-5 similar businesses within 1 mile",
    neighborhoodType: "Mixed residential-commercial area",
    transportationAccess: "Good walkability, limited parking, near public transit",
    seasonalVariations: "Higher traffic in summer, steady year-round",
    growthPotential: "Moderate growth potential based on local development trends",
    economicMultiplier: "1.8x local economic impact",
    supplyChainImpact: "60-75% local supplier engagement"
  },

  // UI expects `environmentalImpact` with those exact keys
  environmentalImpact: {
    localCarbonReduction: "12-18 tons CO2 annually",
    neighborhoodAirQualityImprovement: "15-20% improvement",
    localBiodiversityEnhancement: "Significant positive impact on local ecosystem",
    walkabilityImprovement: "Reduces car dependency by 30-40%",
    localWasteDiversion: "8-12 tons diverted annually",
    communityGreenSpace: "500-800 sq ft contribution",
    neighborhoodNoiseReduction: "8-12 decibel reduction",
    localWaterConservation: "15,000-25,000 gallons saved",
    transportationEfficiency: "25-35% reduction in local traffic",
    communityEnvironmentalEducation: "Monthly workshops and programs"
  },

  // **KEYS RENAMED TO MATCH MAPVIEW EXPECTATIONS**
  communityBenefits: {
    // MapView expects `jobCreation` (not localJobCreation)
    jobCreation: "8-15 new jobs for local residents",
    // MapView expects `localEconomicImpact`
    localEconomicImpact: "$200,000-$400,000 annually",
    // MapView expects `communityEngagement`
    communityEngagement: "Educational workshops, local partnerships",
    // MapView expects `accessibilityImprovements`
    accessibilityImprovements: "Full ADA compliance, inclusive design",
    // keep these as useful extras (UI may pick them up or they are useful in raw JSON)
    culturalContribution: "Supports local artists, cultural events",
    communityEnvironmentalPrograms: "Monthly sustainability workshops",
    neighborhoodHealthBenefits: "Improved air quality, reduced stress",
    localSocialEquity: "Inclusive hiring practices, community outreach",
    neighborhoodRevitalization: "Contributes to local improvement initiatives",
    localPartnerships: "Local universities, environmental NGOs, green businesses"
  },

  sustainabilityMetrics: {
    leedCertificationPotential: "LEED Gold",
    breeamScore: "Very Good",
    carbonNeutralTimeline: "3-5 years",
    wasteDiversionRate: "85-95%",
    energyStarRating: "Energy Star Certified",
    livingBuildingChallenge: "LBC Petal Certified",
    wellBuildingStandard: "WELL Silver",
    netZeroEnergy: "Achievable within 5 years",
    netZeroWater: "Achievable within 7 years",
    regenerativeDesign: "High potential for regenerative impact"
  },

  policySimulation: {
    climateResilience: "High resilience to climate change impacts",
    greenBuildingIncentives: "$15,000-$25,000 available incentives from state and city programs",
    zoningCompliance: "Fully compliant with current zoning regulations",
    environmentalPermits: "Standard commercial permits required, expedited green building process",
    sustainabilityStandards: "Exceeds local sustainability requirements by 40-60%",
    carbonPricing: "Positive impact from carbon pricing policies, potential revenue generation",
    renewableEnergyMandates: "Exceeds renewable energy requirements by 25-35%"
  },

  collaborativeDecisionMaking: {
    stakeholderEngagement: "City planners, environmental groups, community leaders, local businesses",
    communityInput: "Public forums, online surveys, focus groups, neighborhood meetings",
    partnershipOpportunities: "Local universities, environmental NGOs, green businesses, community groups",
    fundingSources: "State green building grants, federal sustainability programs, private investors",
    implementationTimeline: "6-month phased implementation plan with community feedback loops",
    monitoringMetrics: "Carbon footprint, energy usage, community engagement, economic impact"
  },

  recommendations: [
    "Install solar panels and battery storage system",
    "Implement comprehensive recycling and composting program",
    "Partner with local suppliers for sustainable sourcing",
    "Create green roof and vertical garden system",
    "Offer electric vehicle charging stations",
    "Establish community environmental education center",
    "Develop stormwater management system",
    "Implement smart building technology for efficiency"
  ],

  riskAssessment: {
    environmentalRisks: "Climate change impacts, extreme weather events, sea level rise",
    regulatoryRisks: "Changing environmental regulations, zoning updates",
    marketRisks: "Economic downturns, competition, changing consumer preferences",
    mitigationStrategies: "Adaptive design, flexible operations, diversified revenue streams",
    contingencyPlans: "Backup energy systems, emergency protocols, financial reserves"
  }
};
// --- end replacement ---

// Utility: escape HTML to avoid XSS when rendering model output
function escapeHtml(s: unknown) {
  const str = typeof s === 'string' ? s : JSON.stringify(s, null, 2);
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Build an HTML block for an object (key/value list)
function renderKVTable(title: string, obj: Record<string, any>) {
  let rows = '';
  for (const [k, v] of Object.entries(obj || {})) {
    rows += `<tr><td class="kv-key">${escapeHtml(k)}</td><td class="kv-val">${escapeHtml(v)}</td></tr>`;
  }
  return `
    <section class="card">
      <h2 class="card-title">${escapeHtml(title)}</h2>
      <table class="kv-table">${rows}</table>
    </section>
  `;
}

// Render recommendations list
function renderRecommendations(list: string[]) {
  return `
    <section class="card">
      <h2 class="card-title">Recommendations</h2>
      <ol class="rec-list">
        ${list.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ol>
    </section>
  `;
}

// Render the full HTML page for an analysis object
function renderAnalysisPage(analysis: any, location: any) {
  const population = renderKVTable("Population Data", analysis.populationData || {});
  const business = renderKVTable("Business Analysis", analysis.businessAnalysis || {});
  const environmental = renderKVTable("Environmental Impact", analysis.environmentalImpact || {});
  const community = renderKVTable("Community Benefits", analysis.communityBenefits || {});
  const sustainability = renderKVTable("Sustainability Metrics", analysis.sustainabilityMetrics || {});
  const policy = renderKVTable("Policy Simulation", analysis.policySimulation || {});
  const collaborative = renderKVTable("Collaborative Decision Making", analysis.collaborativeDecisionMaking || {});
  const risk = renderKVTable("Risk Assessment", analysis.riskAssessment || {});
  const recommendations = renderRecommendations(analysis.recommendations || []);

  const rawJson = escapeHtml(analysis);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Location Analysis — ${location ? `${escapeHtml(location.lat)}, ${escapeHtml(location.lng)}` : 'Analysis'}</title>
<style>
  :root{
    --bg:#0f172a; --card:#0b1220; --muted:#94a3b8; --accent:#60a5fa; --accent-2:#a3e635; --panel:#020617;
    --glass: rgba(255,255,255,0.03);
  }
  html,body{height:100%;margin:0;font-family:Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;}
  body{background: linear-gradient(180deg,#071034 0%, #071029 100%); color:#e6eef8; padding:28px; box-sizing:border-box;}
  .container{max-width:1200px;margin:0 auto; display:grid; grid-template-columns: 1fr 420px; gap:24px;}
  h1{font-size:28px;margin:0 0 12px 0;color:#fff}
  .meta{color:var(--muted); margin-bottom:16px;}
  .card{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border-radius:12px; padding:18px; box-shadow: 0 10px 40px rgba(2,6,23,0.6); border:1px solid rgba(255,255,255,0.03);}
  .card-title{font-size:18px;margin:0 0 12px 0;color:#e6eef8}
  .kv-table{width:100%; border-collapse:collapse;}
  .kv-table tr{border-bottom:1px dashed rgba(255,255,255,0.03);}
  .kv-key{width:45%; color:var(--muted); padding:8px 0; font-weight:600; text-transform:capitalize;}
  .kv-val{padding:8px 0; color:#f8fafc; font-weight:500;}
  .rec-list{margin:0;padding-left:18px;color:#e6eef8}
  .right-col{display:flex; flex-direction:column; gap:16px; position:relative;}
  pre.json-block{background: #020617; color:#c7d2fe; padding:12px; border-radius:8px; overflow:auto; max-height:520px; font-size:13px; border:1px solid rgba(255,255,255,0.03);}
  .controls{display:flex; gap:8px; margin-top:12px;}
  .btn{background:linear-gradient(90deg,var(--accent),#075985); color:white; border:none; padding:10px 14px; border-radius:8px; cursor:pointer; font-weight:600;}
  .btn.secondary{background:transparent; border:1px solid rgba(255,255,255,0.06); color:var(--muted);}
  .section-title{font-size:16px;color:var(--muted); margin-bottom:6px;}
  .big-header{display:flex;align-items:center;justify-content:space-between; gap:12px;}
  .location-pill{background:var(--glass); padding:8px 12px;border-radius:999px;color:var(--muted); font-weight:600; border:1px solid rgba(255,255,255,0.03);}
  details{background:transparent;border-radius:8px;padding:10px;}
  summary{cursor:pointer; font-weight:700; color:#fff; outline:none;}
  .warning{color:#fbbf24;font-weight:600;}
  @media (max-width:1100px){ .container{grid-template-columns:1fr; } .right-col{order:2} }
</style>
</head>
<body>
  <div class="container">
    <main>
      <div class="big-header">
        <div>
          <h1>Location Analysis</h1>
          <div class="meta">Coordinates: ${location ? `${escapeHtml(location.lat)}, ${escapeHtml(location.lng)}` : 'unknown'}</div>
        </div>
        <div>
          <span class="location-pill">Boston — sustainable business analysis</span>
        </div>
      </div>

      ${population}
      ${business}
      ${environmental}

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:18px; margin-top:18px;">
        ${community}
        ${sustainability}
      </div>

      ${policy}
      ${collaborative}
      ${risk}
      ${recommendations}

    </main>

    <aside class="right-col">
      <div class="card">
        <div class="section-title">Full JSON (copyable)</div>
        <pre class="json-block" id="jsonBlock">${rawJson}</pre>
        <div class="controls">
          <button class="btn" id="copyJson">Copy JSON</button>
          <button class="btn secondary" id="downloadJson">Download</button>
        </div>
      </div>

      <div class="card">
        <div class="section-title">Quick actions</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="btn" id="openInNew">Open raw JSON in new tab</button>
          <button class="btn secondary" id="reportIssue">Report issue</button>
        </div>
      </div>

      <div class="card" style="text-align:center;">
        <div class="section-title">Model notes</div>
        <div style="color:var(--muted); font-size:13px">
          Values are model outputs or fallback. Use the copy button to pull JSON into local tools for further analysis.
        </div>
      </div>
    </aside>
  </div>

<script>
  const jsonStr = document.getElementById('jsonBlock').innerText || '{}';
  document.getElementById('copyJson').addEventListener('click', async () => {
    await navigator.clipboard.writeText(jsonStr);
    alert('JSON copied to clipboard');
  });
  document.getElementById('downloadJson').addEventListener('click', () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis.json';
    a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById('openInNew').addEventListener('click', () => {
    const w = window.open();
    w.document.write('<pre>' + jsonStr.replace(/</g,'&lt;') + '</pre>');
    w.document.close();
  });
  document.getElementById('reportIssue').addEventListener('click', () => {
    alert('Open your issue tracker and paste the JSON (or use the download button).');
  });
</script>
</body>
</html>
`;
}

// GET handler: serve a simple UI to submit coordinates and view analysis
export async function GET(request: NextRequest) {
  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Analyze Location — demo</title>
<style>
  body{font-family:Inter,system-ui, -apple-system; background:#071034;color:#e6eef8; padding:28px;}
  .box{max-width:900px;margin:0 auto;background:rgba(255,255,255,0.02);padding:20px;border-radius:12px;}
  label{display:block;margin:12px 0 6px;color:#a8c0e6;font-weight:600;}
  input, select{width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:#e6eef8;}
  .row{display:flex;gap:12px;}
  .row > div{flex:1;}
  .btn{margin-top:14px;padding:12px 14px;border-radius:8px;border:none;background:#60a5fa;color:#03112a;font-weight:700;cursor:pointer;}
  .hint{color:#94a3b8;font-size:13px;margin-top:8px;}
  .note{background:rgba(255,255,255,0.02);padding:10px;border-radius:8px;color:#cbd5e1;margin-top:12px;}
</style>
</head>
<body>
  <div class="box">
    <h1>Analyze a Location</h1>
    <p class="hint">Enter coordinates (latitude & longitude) for a location in Boston and click Analyze. You can also send JSON to this endpoint programmatically (POST /api/analyze-location).</p>

    <label>Latitude</label>
    <input id="lat" value="42.3731" />

    <label>Longitude</label>
    <input id="lng" value="-71.1183" />

    <label>Output format</label>
    <select id="format">
      <option value="html">HTML (readable page)</option>
      <option value="json">JSON (raw response)</option>
    </select>

    <div style="display:flex;gap:12px">
      <button class="btn" id="analyzeBtn">Analyze</button>
      <button class="btn" id="fallbackBtn" style="background:#a3e635">Use Fallback</button>
    </div>

    <div class="note">
      This UI posts to the same API route. If your GEMINI_API_KEY is not set server-side, a safe fallback analysis is returned.
    </div>

    <div id="result" style="margin-top:18px;"></div>
  </div>

<script>
  async function doAnalyze(useFallback=false){
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const format = document.getElementById('format').value;
    if (isNaN(lat) || isNaN(lng)){ alert('Please enter numeric lat/lng'); return; }
    const payload = { location: { lat, lng }, modelType: 'default', buildingData: {} };

    const headers = { 'Content-Type': 'application/json' };
    if (format === 'html') headers['Accept'] = 'text/html';

    const res = await fetch(window.location.pathname, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (format === 'json') {
      const data = await res.json();
      document.getElementById('result').innerHTML = '<pre style="white-space:pre-wrap;background:#020617;padding:12px;border-radius:8px;">' + JSON.stringify(data, null, 2) + '</pre>';
    } else {
      // open rendered HTML in new tab to preserve / show full page
      const html = await res.text();
      const w = window.open();
      w.document.write(html);
      w.document.close();
    }
  }

  document.getElementById('analyzeBtn').addEventListener('click', () => doAnalyze(false));
  document.getElementById('fallbackBtn').addEventListener('click', () => {
    // Open fallback in HTML format quickly without calling model:
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const w = window.open();
    // build page using inline data
    const analysis = ${JSON.stringify(FALLBACK_ANALYSIS)};
    const page = (new DOMParser()).parseFromString(\`${renderAnalysisPage(FALLBACK_ANALYSIS, { lat:  parseFloat('42.3731'), lng: parseFloat('-71.1183')})}\`, 'text/html');
    w.document.write(page.documentElement.outerHTML);
    w.document.close();
  });
</script>
</body>
</html>`;
  return new NextResponse(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

// POST handler (keeps original behavior but supports HTML output)
export async function POST(request: NextRequest) {
  try {
    console.log('API Route: analyze-location called');

    // Parse request
    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      console.error('API Route: invalid JSON body', e);
      // If the client requested HTML, show a helpful page
      const accept = request.headers.get('accept') || '';
      if (accept.includes('text/html')) {
        return new NextResponse(`<p>Invalid JSON body. Send JSON with {"location":{"lat":number,"lng":number}}</p>`, { status: 400, headers: { 'content-type': 'text/html' }});
      }
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { location, modelType, buildingData } = body || {};
    console.log('API Route: Received data:', { location, modelType, buildingData });

    // Basic validation
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      const accept = request.headers.get('accept') || '';
      if (accept.includes('text/html') || new URL(request.url).searchParams.get('format') === 'html') {
        const html = `<p>Missing or invalid <strong>location</strong>. Expected JSON: <code>{ "location": { "lat": number, "lng": number } }</code></p>`;
        return new NextResponse(html, { status: 400, headers: { 'content-type': 'text/html' }});
      }
      return NextResponse.json({ error: 'Missing or invalid "location" (require { lat: number, lng: number })' }, { status: 400 });
    }

    // If no API key, return fallback immediately
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.warn('API Route: No Gemini API key found, returning fallbackAnalysis');
      const accept = request.headers.get('accept') || '';
      if (accept.includes('text/html') || new URL(request.url).searchParams.get('format') === 'html') {
        const page = renderAnalysisPage(FALLBACK_ANALYSIS, location);
        return new NextResponse(page, { headers: { 'content-type': 'text/html; charset=utf-8' }});
      }
      return NextResponse.json({ analysis: FALLBACK_ANALYSIS }, { status: 200 });
    }

    // Build prompt (kept concise)
    const prompt = `Analyze the location at coordinates ${location.lng}, ${location.lat} in Boston for a sustainable business. Consider neighborhood characteristics, demographics, environmental factors, and business potential. Return strictly valid JSON matching the expected schema.`;

    // Configure fetch with timeout
    const controller = new AbortController();
    const TIMEOUT_MS = 20_000; // 20s
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Gemini request body
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert environmental consultant. Provide the requested analysis as strictly valid JSON only. ${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1400,
        topP: 0.8,
        topK: 40
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!resp.ok) {
      console.error('Gemini API error:', resp.status, await resp.text());
      // On non-200 from Gemini, return fallback but indicate upstream failure
      const accept = request.headers.get('accept') || '';
      if (accept.includes('text/html') || new URL(request.url).searchParams.get('format') === 'html') {
        const page = renderAnalysisPage(FALLBACK_ANALYSIS, location);
        return new NextResponse(page, { status: 502, headers: { 'content-type': 'text/html; charset=utf-8' }});
      }
      return NextResponse.json({ analysis: FALLBACK_ANALYSIS, warning: `Upstream model returned ${resp.status}` }, { status: 502 });
    }

    const data = await resp.json();

    // Defensive path: try to extract model text
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.[0]?.text ||
      data?.response?.output?.[0] ||
      null;

    if (!candidateText || typeof candidateText !== 'string') {
      console.warn('No candidate text found from Gemini, returning fallback');
      const accept = request.headers.get('accept') || '';
      if (accept.includes('text/html') || new URL(request.url).searchParams.get('format') === 'html') {
        const page = renderAnalysisPage(FALLBACK_ANALYSIS, location);
        return new NextResponse(page, { headers: { 'content-type': 'text/html; charset=utf-8' }});
      }
      return NextResponse.json({ analysis: FALLBACK_ANALYSIS, warning: 'No content returned from model' }, { status: 200 });
    }

    // Try to parse the JSON returned by the model. If parsing fails, fall back.
    let analysis;
    try {
      const trimmed = candidateText.trim();
      analysis = JSON.parse(trimmed);
    } catch (parseError) {
      console.error('JSON parsing error from Gemini response:', parseError);
      console.debug('Gemini raw output (truncated):', (candidateText || '').slice(0, 2000));
      const accept = request.headers.get('accept') || '';
      if (accept.includes('text/html') || new URL(request.url).searchParams.get('format') === 'html') {
        // show fallback page and include raw model output for debugging (escaped)
        const page = renderAnalysisPage(FALLBACK_ANALYSIS, location) + `
          <div style="max-width:1200px;margin:16px auto;padding:16px;background:#06102a;border-radius:12px;color:#f1f5f9;">
            <h3 style="margin-top:0;color:#fbbf24">Model output (could not parse JSON)</h3>
            <pre style="white-space:pre-wrap">${escapeHtml(candidateText)}</pre>
          </div>`;
        return new NextResponse(page, { headers: { 'content-type': 'text/html; charset=utf-8' }});
      }
      return NextResponse.json({ analysis: FALLBACK_ANALYSIS, warning: 'Failed to parse model JSON; returned fallback analysis' }, { status: 200 });
    }

    // Validate key pieces of parsed analysis
    if (!analysis || !analysis.populationData || !analysis.businessAnalysis) {
      console.warn('Parsed analysis missing required sections; returning fallback');
      const accept = request.headers.get('accept') || '';
      if (accept.includes('text/html') || new URL(request.url).searchParams.get('format') === 'html') {
        const page = renderAnalysisPage(FALLBACK_ANALYSIS, location) + `
          <div style="max-width:1200px;margin:16px auto;padding:16px;background:#06102a;border-radius:12px;color:#f1f5f9;">
            <h3 style="margin-top:0;color:#fbbf24">Note</h3>
            <div>Parsed analysis was incomplete; fallback content shown.</div>
          </div>`;
        return new NextResponse(page, { headers: { 'content-type': 'text/html; charset=utf-8' }});
      }
      return NextResponse.json({ analysis: FALLBACK_ANALYSIS, warning: 'Parsed analysis incomplete' }, { status: 200 });
    }

    // Success: return parsed analysis as JSON or render HTML page depending on Accept or format param
    const accept = request.headers.get('accept') || '';
    if (accept.includes('text/html') || new URL(request.url).searchParams.get('format') === 'html') {
      const page = renderAnalysisPage(analysis, location);
      return new NextResponse(page, { headers: { 'content-type': 'text/html; charset=utf-8' }});
    }

    return NextResponse.json({ analysis });

  } catch (error: any) {
    console.error('Error in analyze-location API:', error);

    // If the error was an abort, return a clear message
    if (error?.name === 'AbortError') {
      return NextResponse.json({ analysis: FALLBACK_ANALYSIS, warning: 'Request to model timed out' }, { status: 504 });
    }

    // Generic server error — return fallback for graceful UX
    return NextResponse.json({ analysis: FALLBACK_ANALYSIS, error: String(error) }, { status: 500 });
  }
}
