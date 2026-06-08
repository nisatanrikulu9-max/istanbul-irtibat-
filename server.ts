import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSbMSIA014CQHXC1BVzhWMQE16pjo1hFWNyMalMaNi3y-UAqnLhaocKVQ-hLtJYvoKkFI_Z3jYdltJt/pub?output=csv";
const CACHE_FILE = path.join(process.cwd(), "geocache.json");

interface Center {
  id: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  photoUrl: string;
  latitude: number | null;
  longitude: number | null;
}

// Simple double-quote aware CSV parser
function parseCSV(csvText: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i+1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++; // skip double quote escape
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell.trim());
      if (row.length > 0 && row.some(c => c !== '')) {
        lines.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.some(c => c !== '')) {
      lines.push(row);
    }
  }
  return lines;
}

// Load cache
let geocodeCache: Record<string, { lat: number; lon: number }> = {};
try {
  if (fs.existsSync(CACHE_FILE)) {
    const data = fs.readFileSync(CACHE_FILE, "utf-8");
    geocodeCache = JSON.parse(data);
    console.log(`Loaded ${Object.keys(geocodeCache).length} coordinates from geocache.json`);
  }
} catch (error) {
  console.error("Failed to read geocache.json:", error);
}

// Save cache
function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(geocodeCache, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write geocache.json:", error);
  }
}

// Sleep utility for rate limiting Nominatim
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<any> {
  const defaultHeaders = {
    "User-Agent": "IstanbulWomenCentersApp/1.0 (nisatanrikulu9@gmail.com; AI-Studio-Applet)"
  };
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });
      if (response.status === 200) {
        return response;
      }
      console.warn(`Attempt ${i + 1} to fetch URL failed with status: ${response.status}`);
      await sleep(1000 * (i + 1));
    } catch (e) {
      console.warn(`Attempt ${i + 1} to fetch URL failed with error:`, e);
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

// Direct geocode against OSM Nominatim (Istanbul focused)
async function geocodeAddress(centerName: string, district: string, address: string): Promise<{ lat: number; lon: number } | null> {
  const cacheKey = `${centerName}|${district}|${address}`.toLowerCase().trim();
  if (geocodeCache[cacheKey]) {
    return geocodeCache[cacheKey];
  }

  // Try different search queries, starting from the most specific to more general
  const queries = [
    `${centerName}, ${district}, İstanbul, Türkiye`,
    `${district} Kadın Dayanışma Merkezi, İstanbul, Türkiye`,
    `${address}, ${district}, İstanbul, Türkiye`,
    `${district}, İstanbul, Türkiye`
  ];

  for (const query of queries) {
    try {
      // Nominatim requires at least 1 second wait between requests
      await sleep(1000);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      console.log(`Geocoding with Nominatim: ${query}`);
      const response = await fetchWithRetry(url, { method: "GET" });
      const results = await response.json();
      
      if (results && results.length > 0) {
        const coords = {
          lat: parseFloat(results[0].lat),
          lon: parseFloat(results[0].lon)
        };
        geocodeCache[cacheKey] = coords;
        saveCache();
        console.log(`Successfully geocoded: "${centerName}" to [${coords.lat}, ${coords.lon}]`);
        return coords;
      }
    } catch (error) {
      console.error(`Nominatim error for query "${query}":`, error);
    }
  }

  return null;
}

// Background job queue to process geocoding sequentially so we don't violate rate limits
let isGeocoding = false;
let processedCenters: Center[] = [];

async function loadCentersData() {
  try {
    console.log("Fetching CSV data from Google Sheets...");
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`Google Sheets fetch failed: ${response.statusText}`);
    }
    const csvContent = await response.text();
    const rows = parseCSV(csvContent);
    
    if (rows.length < 2) {
      console.warn("Spreadsheet has insufficient rows. Check layout.");
      return;
    }

    const headers = rows[0].map(h => h.trim().toLowerCase());
    console.log("Parsed CSV Headers:", headers);
    
    // Find column indexes based on Turkish keywords:
    // "merkez adı" / "adı" / "isim"
    // "ilçe"
    // "adres"
    // "telefon"
    // "fotoğraf" / "resim" / "görsel"
    // "enlem" / "latitude"
    // "boylam" / "longitude"
    const nameIdx = headers.findIndex(h => h.includes("merkez") || h.includes("adi") || h.includes("adı") || h === "isim");
    const districtIdx = headers.findIndex(h => h.includes("ilçe") || h.includes("ilce"));
    const addressIdx = headers.findIndex(h => h.includes("adres") || h.includes("konum"));
    const phoneIdx = headers.findIndex(h => h.includes("tel") || h.includes("telefon") || h.includes("irtibat"));
    const photoIdx = headers.findIndex(h => h.includes("foto") || h.includes("resim") || h.includes("görsel") || h.includes("gorsel") || h.includes("image"));
    const latIdx = headers.findIndex(h => h === "enlem" || h === "lat" || h === "latitude");
    const lonIdx = headers.findIndex(h => h === "boylam" || h === "lon" || h === "lng" || h === "longitude");

    console.log("Column Index Mapping:", {
      nameIdx,
      districtIdx,
      addressIdx,
      phoneIdx,
      photoIdx,
      latIdx,
      lonIdx
    });

    const parsedCenters: Center[] = [];

    // Parse each row (skip header)
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (row.length === 0 || !row[0]) continue;

      const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : `Kadın Dayanışma Merkezi ${r}`;
      const district = districtIdx !== -1 && row[districtIdx] ? row[districtIdx] : "İstanbul";
      const address = addressIdx !== -1 && row[addressIdx] ? row[addressIdx] : `${district}, İstanbul`;
      const phone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : "İletişim bilgisi bulunamadı";
      const photoUrl = photoIdx !== -1 && row[photoIdx] ? row[photoIdx] : "";
      
      let latitude: number | null = null;
      let longitude: number | null = null;

      if (latIdx !== -1 && row[latIdx]) {
        const parsedLat = parseFloat(row[latIdx].replace(",", "."));
        if (!isNaN(parsedLat)) {
          latitude = parsedLat;
        }
      }

      if (lonIdx !== -1 && row[lonIdx]) {
        const parsedLon = parseFloat(row[lonIdx].replace(",", "."));
        if (!isNaN(parsedLon)) {
          longitude = parsedLon;
        }
      }

      parsedCenters.push({
        id: `center_${r}`,
        name,
        district,
        address,
        phone,
        photoUrl,
        latitude,
        longitude
      });
    }

    processedCenters = parsedCenters;
    console.log(`Successfully parsed ${processedCenters.length} centers from spreadsheet.`);

    // Start background geocoding if needed
    triggerBackgroundGeocoding();

  } catch (error) {
    console.error("Error loading centers data:", error);
  }
}

async function triggerBackgroundGeocoding() {
  if (isGeocoding) return;
  isGeocoding = true;
  console.log("Starting background geocoding job...");

  for (let center of processedCenters) {
    if (center.latitude === null || center.longitude === null) {
      const coordinates = await geocodeAddress(center.name, center.district, center.address);
      if (coordinates) {
        center.latitude = coordinates.lat;
        center.longitude = coordinates.lon;
      } else {
        // Fallback: Default to center of Istanbul or district center if totally failed
        console.warn(`Could not geocode center: "${center.name}". Using district-level fallback if possible.`);
        const districtCoords = await geocodeAddress(center.district, "İstanbul", `${center.district}, İstanbul`);
        if (districtCoords) {
          center.latitude = districtCoords.lat;
          center.longitude = districtCoords.lon;
        } else {
          // Absolute fallback: Central Istanbul coordinates (Taksim area)
          center.latitude = 41.037;
          center.longitude = 28.974;
        }
      }
    }
  }

  isGeocoding = false;
  console.log("Background geocoding job complete. All centers have coordinates mapped.");
}

// Initialize loading
loadCentersData();

// Refetch and re-process center data every 10 minutes to stay fresh with Google Sheet updates
setInterval(loadCentersData, 10 * 60 * 1000);

// API Endpoints
app.get("/api/centers", (req, res) => {
  res.json({
    success: true,
    count: processedCenters.length,
    isProcessingGeocodes: isGeocoding,
    data: processedCenters
  });
});

// Force refresh endpoints
app.post("/api/centers/refresh", async (req, res) => {
  console.log("Manual refresh requested.");
  await loadCentersData();
  res.json({
    success: true,
    message: "Centers refresh triggered.",
    count: processedCenters.length
  });
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
