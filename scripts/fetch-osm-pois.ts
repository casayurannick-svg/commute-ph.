import fs from 'fs';
import path from 'path';

// Greater Manila Area bounding box: (south, west, north, east)
const BBOX = '14.10,120.80,15.00,121.40';

const OVERPASS_QUERY = `[out:json][timeout:60];
(
  node["railway"="station"](${BBOX});
  node["public_transport"="station"](${BBOX});
  node["amenity"="hospital"](${BBOX});
  node["shop"="mall"](${BBOX});
);
out body;`;

export interface RawOSMPoi {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
}

async function fetchOSMPois() {
  console.log('Fetching Metro Manila POIs from Overpass API...');
  const endpoint = 'https://overpass-api.de/api/interpreter';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'CommutePH/1.0 (https://github.com/casayurannick-svg/commute-ph)',
      },
      body: new URLSearchParams({ data: OVERPASS_QUERY }),
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const elements = data.elements || [];

    console.log(`Received ${elements.length} raw elements from Overpass API.`);

    const poiMap = new Map<string, RawOSMPoi>();

    for (const elem of elements) {
      const tags = elem.tags || {};
      const name = tags.name || tags['name:en'];

      // Filter out elements without valid names
      if (!name || typeof name !== 'string' || !name.trim()) {
        continue;
      }

      let category = 'landmark';
      if (tags.railway === 'station' || tags.public_transport === 'station') {
        category = 'transit_hub';
      } else if (tags.shop === 'mall') {
        category = 'mall';
      } else if (tags.amenity === 'hospital') {
        category = 'hospital';
      }

      const cleanName = name.trim();
      const poiId = `osm-${elem.id}`;

      // Deduplicate by name to keep POI dataset clean
      if (!poiMap.has(cleanName)) {
        poiMap.set(cleanName, {
          id: poiId,
          name: cleanName,
          category,
          lat: Math.round(elem.lat * 10000) / 10000,
          lng: Math.round(elem.lon * 10000) / 10000,
        });
      }
    }

    const pois = Array.from(poiMap.values());
    console.log(`Mapped and filtered ${pois.length} unique POIs.`);

    const outputPath = path.join(process.cwd(), 'src', 'data', 'manila-poi.json');
    fs.writeFileSync(outputPath, JSON.stringify(pois, null, 2), 'utf-8');

    console.log(`Successfully saved POIs to ${outputPath}`);
  } catch (error) {
    console.error('Failed to fetch OSM POIs:', error);
    process.exit(1);
  }
}

fetchOSMPois();
