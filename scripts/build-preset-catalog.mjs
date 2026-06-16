import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ALL_URL =
  "https://raw.githubusercontent.com/Morningstar-Engineering/openmidi/refs/heads/master/data/all.json";
const MAPPING_URL =
  "https://raw.githubusercontent.com/Morningstar-Engineering/openmidi/refs/heads/master/data/mapping.json";

const here = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(here, "..", "public");
const OUT = join(OUT_DIR, "presetCatalog.json");

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${res.statusText}`);
  return res.json();
};

const toCcNumber = (value) => {
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 0 && value <= 127 ? value : null;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const n = Number(value);
    return n >= 0 && n <= 127 ? n : null;
  }
  return null;
};

const sortKeys = (obj) =>
  Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    ),
  );

const [raw, mapping] = await Promise.all([
  fetchJson(ALL_URL),
  fetchJson(MAPPING_URL),
]);

const brandNames = new Map();
const modelNames = new Map();
for (const brand of mapping.brands ?? []) {
  brandNames.set(brand.value, brand.name);
  for (const model of brand.models ?? []) {
    modelNames.set(`${brand.value}/${model.value}`, model.name);
  }
}

const catalog = {};
let deviceCount = 0;
let ccCount = 0;
let skipped = 0;

for (const [manufacturer, devices] of Object.entries(raw)) {
  if (!devices || typeof devices !== "object") continue;

  for (const [deviceSlug, info] of Object.entries(devices)) {
    if (!info || typeof info !== "object" || !Array.isArray(info.cc)) continue;

    const ccs = [];
    for (const entry of info.cc) {
      if (!entry || typeof entry !== "object") continue;
      const name = typeof entry.name === "string" ? entry.name.trim() : "";
      const cc = toCcNumber(entry.value);
      if (!name || cc === null) {
        skipped += 1;
        continue;
      }
      ccs.push({ name, cc });
    }

    if (ccs.length === 0) continue;

    // Prefer the canonical mapping names
    const brand =
      brandNames.get(manufacturer) ||
      info.brand ||
      info.brandName ||
      manufacturer;
    const deviceName =
      modelNames.get(`${manufacturer}/${deviceSlug}`) ||
      info.device_name ||
      info.modelName ||
      info.model ||
      deviceSlug;

    if (!catalog[brand]) catalog[brand] = {};
    catalog[brand][deviceName] = ccs;
    deviceCount += 1;
    ccCount += ccs.length;
  }
}

const sorted = sortKeys(catalog);
for (const brand of Object.keys(sorted)) {
  sorted[brand] = sortKeys(sorted[brand]);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify(sorted) + "\n");

const bytes = readFileSync(OUT).length;
console.log(
  `Wrote ${OUT}\n` +
    `  brands:  ${Object.keys(sorted).length}\n` +
    `  devices: ${deviceCount}\n` +
    `  CCs:     ${ccCount} (skipped ${skipped} non-numeric/unnamed)\n` +
    `  size:    ${(bytes / 1024).toFixed(0)} KB`,
);
