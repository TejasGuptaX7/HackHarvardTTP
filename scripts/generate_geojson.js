const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'public', 'Boston_data.json');
const outputDir = path.join(__dirname, '..', 'public', 'data');
const outputPath = path.join(outputDir, 'vacant_buildings.geojson');

function parsePoint(pointStr) {
  if (!pointStr) return null;
  const m = pointStr.match(/POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/i);
  if (!m) return null;
  const lon = parseFloat(m[1]);
  const lat = parseFloat(m[2]);
  return [lon, lat];
}

function transformRecord(rec, idx) {
  const coords = parsePoint(rec['Coordinates for Mapping']);
  const properties = {
    id: idx + 1,
    'Commercial District': rec['Commercial District'] || null,
    'Address': rec['Address'] || null,
    'City': rec['City'] || null,
    'State': rec['State'] || null,
    'Square Footage': rec['Square Footage'] || null,
    'Vacancy Date': rec['Vacancy Date'] || null,
    'Length of Vacancy': rec['Length of Vacancy'] || null,
    'Ownership Type': rec['Ownership Type'] || null,
    // Map 'Former Tenant/Current Business' to 'Former Tenant'
    'Former Tenant': rec['Former Tenant/Current Business'] || rec['Former Tenant'] || null,
    'Leasing Activity': rec['Leasing Activity'] || null,
    'Recorded Owner': rec['Recorded Owner'] || null,
    'Leasing Contact': rec['Leasing Contact'] || null,
    'Dataset Date': rec['Dataset Date'] || null,
    'Image': rec['Image'] || null
  };

  const feature = {
    type: 'Feature',
    geometry: coords ? {
      type: 'Point',
      coordinates: coords
    } : null,
    properties
  };

  return feature;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse JSON:', err.message);
    process.exit(1);
  }

  const features = data.map((rec, idx) => transformRecord(rec, idx))
    .filter(f => f.geometry !== null);

  const geojson = {
    type: 'FeatureCollection',
    features
  };

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2), 'utf8');
  console.log('Wrote', outputPath, 'with', features.length, 'features');
}

main();
