// Run with: npm run build:presets
// Source:   https://github.com/Morningstar-Engineering/openmidi

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "data", "openmidi-all.json");
const MAPPING = join(here, "..", "data", "openmidi-mapping.json");
const OUT = join(here, "..", "src", "data", "presetCatalog.json");

const raw = JSON.parse(readFileSync(SRC, "utf8"));
const mapping = JSON.parse(readFileSync(MAPPING, "utf8"));
const brandNames = new Map();
const modelNames = new Map();
for (const brand of mapping.brands ?? []) {
  brandNames.set(brand.value, brand.name);
  for (const model of brand.models ?? []) {
    modelNames.set(`${brand.value}/${model.value}`, model.name);
  }
}

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

const sortKeys = (obj) =>
  Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    ),
  );

const sorted = sortKeys(catalog);
for (const brand of Object.keys(sorted)) {
  sorted[brand] = sortKeys(sorted[brand]);
}

writeFileSync(OUT, JSON.stringify(sorted) + "\n");

const bytes = readFileSync(OUT).length;
console.log(
  `Wrote ${OUT}\n` +
    `  brands:  ${Object.keys(sorted).length}\n` +
    `  devices: ${deviceCount}\n` +
    `  CCs:     ${ccCount} (skipped ${skipped} non-numeric/unnamed)\n` +
    `  size:    ${(bytes / 1024).toFixed(0)} KB`,
);
