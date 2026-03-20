// prisma/seed.ts — GRUTH v2
// Added: inspector user, inspector assignment, detailed inspection report, media
// Run: npx prisma db seed

import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: resolve(process.cwd(), ".env.local") });
dotenvConfig({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({ log: ["warn", "error"] });

// ── Market data (same as before) ──────────────────────────────────────────────
const COUNTIES = [
  { name: "Nairobi", code: "047", region: "Nairobi" },
  { name: "Kiambu", code: "022", region: "Central" },
  { name: "Mombasa", code: "001", region: "Coast" },
  { name: "Nakuru", code: "032", region: "Rift Valley" },
  { name: "Kisumu", code: "042", region: "Nyanza" },
  { name: "Machakos", code: "016", region: "Eastern" },
  { name: "Eldoret", code: "027", region: "Rift Valley" },
  { name: "Nyeri", code: "021", region: "Central" },
] as const;

const MARKET_MATERIALS = [
  // Cement & Concrete
  {
    name: "Bamburi Cement 50kg",
    category: "Cement & Concrete",
    unit: "per bag",
    description: "Portland Pozzolana Cement — most widely used brand in Kenya",
  },
  {
    name: "Savannah Cement 50kg",
    category: "Cement & Concrete",
    unit: "per bag",
    description: "Economy cement brand, suitable for non-structural plastering",
  },
  {
    name: "East African Portland Cement",
    category: "Cement & Concrete",
    unit: "per bag",
    description: "OPC grade 42.5N — preferred for structural concrete",
  },
  {
    name: "Ballast (20mm)",
    category: "Cement & Concrete",
    unit: "per tonne",
    description: "Crushed stone aggregate for concrete mix",
  },
  {
    name: "Concrete Blocks 6 inch",
    category: "Cement & Concrete",
    unit: "per piece",
    description: "Hollow cement blocks for walling — 150mm width",
  },
  {
    name: "Concrete Blocks 9 inch",
    category: "Cement & Concrete",
    unit: "per piece",
    description: "Hollow cement blocks for load-bearing walling — 225mm width",
  },
  {
    name: "Precast Lintels (1.5m)",
    category: "Cement & Concrete",
    unit: "per piece",
    description: "Precast reinforced concrete lintel for door/window openings",
  },
  // Steel & Metal
  {
    name: "Y8 Steel Rebar (6m)",
    category: "Steel & Metal",
    unit: "per piece",
    description:
      "High yield deformed bar — used for stirrups and light reinforcement",
  },
  {
    name: "Y10 Steel Rebar (6m)",
    category: "Steel & Metal",
    unit: "per piece",
    description:
      "High yield deformed bar — columns and beams in small structures",
  },
  {
    name: "Y12 Steel Rebar (6m)",
    category: "Steel & Metal",
    unit: "per piece",
    description: "High yield deformed bar — standard for slabs and ring beams",
  },
  {
    name: "Y16 Steel Rebar (6m)",
    category: "Steel & Metal",
    unit: "per piece",
    description: "High yield deformed bar — heavy structural members",
  },
  {
    name: "Y20 Steel Rebar (6m)",
    category: "Steel & Metal",
    unit: "per piece",
    description:
      "High yield deformed bar — columns in multi-storey construction",
  },
  {
    name: "BRC Mesh A142",
    category: "Steel & Metal",
    unit: "per sheet",
    description: "Steel welded mesh 2.4×4.8m — used in floor slabs",
  },
  {
    name: "Iron Sheets (28 gauge 8ft)",
    category: "Steel & Metal",
    unit: "per sheet",
    description: "Corrugated galvanised iron roofing sheet",
  },
  {
    name: "Iron Sheets (30 gauge 8ft)",
    category: "Steel & Metal",
    unit: "per sheet",
    description: "Lighter gauge corrugated roofing sheet — economical option",
  },
  {
    name: "Galvanised Nails 4 inch",
    category: "Steel & Metal",
    unit: "per kg",
    description: "Hot-dip galvanised nails for timber roofing",
  },
  {
    name: "Roofing Nails 3 inch",
    category: "Steel & Metal",
    unit: "per kg",
    description: "Roofing nails with rubber washers for iron sheets",
  },
  // Sand & Aggregates
  {
    name: "River Sand",
    category: "Sand & Aggregates",
    unit: "per tonne",
    description: "Washed river sand — plastering and mortar mix",
  },
  {
    name: "Quarry Dust",
    category: "Sand & Aggregates",
    unit: "per tonne",
    description: "Fine aggregate from quarry crusher — block-making and mortar",
  },
  {
    name: "Hardcore",
    category: "Sand & Aggregates",
    unit: "per tonne",
    description: "Broken stones for fill and sub-base",
  },
  {
    name: "Crusher Run",
    category: "Sand & Aggregates",
    unit: "per tonne",
    description: "Graded crushed stone for road sub-base and hardstand",
  },
  {
    name: "Building Sand",
    category: "Sand & Aggregates",
    unit: "per tonne",
    description: "Sharp sand for brickwork and render coats",
  },
  // Timber & Roofing
  {
    name: "3x2 Timber (12ft)",
    category: "Timber & Roofing",
    unit: "per piece",
    description: "Sawn timber for roof trusses and formwork",
  },
  {
    name: "2x2 Timber (12ft)",
    category: "Timber & Roofing",
    unit: "per piece",
    description: "Sawn timber for purlins and ceiling battens",
  },
  {
    name: "4x2 Timber (12ft)",
    category: "Timber & Roofing",
    unit: "per piece",
    description: "Sawn hardwood timber for heavy trusses and lintels",
  },
  {
    name: "Marine Plywood (18mm)",
    category: "Timber & Roofing",
    unit: "per sheet",
    description: "Moisture-resistant ply for formwork and flooring",
  },
  {
    name: "Fascia Board (4m)",
    category: "Timber & Roofing",
    unit: "per piece",
    description: "Treated timber fascia board for roof edges",
  },
  {
    name: "Ridging (8ft)",
    category: "Timber & Roofing",
    unit: "per piece",
    description: "Galvanised steel ridging cap for iron sheet roofs",
  },
  // Finishes & Paint
  {
    name: "Crown Wall Paint 20L",
    category: "Finishes & Paint",
    unit: "per tin",
    description: "Interior emulsion — popular mid-range brand",
  },
  {
    name: "Sadolin Floor Paint 20L",
    category: "Finishes & Paint",
    unit: "per tin",
    description: "Heavy-duty floor coating for concrete surfaces",
  },
  {
    name: "Tile Adhesive 20kg",
    category: "Finishes & Paint",
    unit: "per bag",
    description: "Polymer-modified tile adhesive for wall and floor tiles",
  },
  {
    name: "Tiles 60x60cm (Ceramic)",
    category: "Finishes & Paint",
    unit: "per sqm",
    description: "Standard ceramic floor tile — price per square metre",
  },
  {
    name: "Tiles 30x30cm (Anti-slip)",
    category: "Finishes & Paint",
    unit: "per sqm",
    description: "Outdoor anti-slip ceramic tile — bathrooms and terraces",
  },
  {
    name: "Waterproofing Compound 5L",
    category: "Finishes & Paint",
    unit: "per tin",
    description: "Integral waterproof additive for concrete and render",
  },
  {
    name: "Skim Coat / Finishing Plaster",
    category: "Finishes & Paint",
    unit: "per bag",
    description: "Fine finishing plaster for smooth interior walls",
  },
  // Hardware & Fixings
  {
    name: "PVC Pipe 4 inch (6m)",
    category: "Hardware & Fixings",
    unit: "per piece",
    description: "uPVC drainage pipe for soil and waste lines",
  },
  {
    name: "GI Pipe 1 inch (6m)",
    category: "Hardware & Fixings",
    unit: "per piece",
    description: "Galvanised iron water supply pipe",
  },
  {
    name: "PPR Pipe 20mm (4m)",
    category: "Hardware & Fixings",
    unit: "per piece",
    description: "Polypropylene random pipe for hot/cold plumbing",
  },
  {
    name: "Door Hinges 4 inch (pair)",
    category: "Hardware & Fixings",
    unit: "per pair",
    description: "Steel butt hinges for standard interior doors",
  },
  {
    name: "Padlock 60mm",
    category: "Hardware & Fixings",
    unit: "per piece",
    description: "Hardened steel padlock for site security",
  },
  {
    name: "Electrical Cable 2.5mm (50m)",
    category: "Hardware & Fixings",
    unit: "per roll",
    description: "Twin and earth PVC cable for power circuits",
  },
  {
    name: "MCB Circuit Breaker 20A",
    category: "Hardware & Fixings",
    unit: "per piece",
    description: "Miniature circuit breaker for consumer unit",
  },
];

const SOURCES_BY_COUNTY: Record<string, { name: string; url?: string }[]> = {
  Nairobi: [
    { name: "Tuffsteel Ltd — Industrial Area", url: "https://tuffsteel.co.ke" },
    { name: "Timber Bay — Lusaka Road", url: "https://timberbay.co.ke" },
    {
      name: "Mastermind Hardware — Ngong Road",
      url: "https://mastermind.co.ke",
    },
    { name: "Bamco Hardware — Eastleigh" },
    { name: "GRUTH Field Survey — Nairobi" },
  ],
  Kiambu: [
    { name: "Kiambu Hardware Centre" },
    { name: "Ruaka Building Supplies" },
    { name: "GRUTH Field Survey — Kiambu" },
  ],
  Mombasa: [
    { name: "Coast Hardware — Moi Avenue", url: "https://coasthardware.co.ke" },
    { name: "Mombasa Cement Depot — Changamwe" },
    { name: "GRUTH Field Survey — Mombasa" },
  ],
  Nakuru: [
    { name: "Rift Valley Hardware — Nakuru Town" },
    { name: "Nakuru Steel Centre" },
    { name: "GRUTH Field Survey — Nakuru" },
  ],
  Kisumu: [
    { name: "Nyanza Hardware Supplies" },
    { name: "Kisumu Building Centre" },
    { name: "GRUTH Field Survey — Kisumu" },
  ],
  Machakos: [
    { name: "Machakos Hardware Depot" },
    { name: "GRUTH Field Survey — Machakos" },
  ],
  Eldoret: [
    { name: "Eldoret Timber & Hardware" },
    { name: "GRUTH Field Survey — Eldoret" },
  ],
  Nyeri: [
    { name: "Central Province Hardware — Nyeri" },
    { name: "GRUTH Field Survey — Nyeri" },
  ],
};

type PriceRange = [number, number];
const PRICE_DATA: Record<string, Record<string, PriceRange>> = {
  // Cement & Concrete
  "Bamburi Cement 50kg": {
    Nairobi: [680, 720],
    Kiambu: [700, 740],
    Mombasa: [730, 770],
    Nakuru: [710, 750],
    Kisumu: [720, 760],
    Machakos: [700, 740],
    Eldoret: [720, 760],
    Nyeri: [710, 750],
  },
  "Savannah Cement 50kg": {
    Nairobi: [660, 700],
    Kiambu: [680, 720],
    Mombasa: [710, 750],
    Nakuru: [690, 730],
    Kisumu: [700, 740],
    Machakos: [680, 720],
    Eldoret: [700, 740],
    Nyeri: [690, 730],
  },
  "East African Portland Cement": {
    Nairobi: [650, 690],
    Kiambu: [670, 710],
    Mombasa: [700, 740],
    Nakuru: [680, 720],
    Kisumu: [690, 730],
    Machakos: [670, 710],
    Eldoret: [690, 730],
    Nyeri: [680, 720],
  },
  "Ballast (20mm)": {
    Nairobi: [4500, 5500],
    Kiambu: [3800, 4800],
    Mombasa: [5000, 6200],
    Nakuru: [4000, 5000],
    Kisumu: [4200, 5200],
    Machakos: [4000, 5000],
    Eldoret: [4200, 5200],
    Nyeri: [4000, 5000],
  },
  "Concrete Blocks 6 inch": {
    Nairobi: [65, 80],
    Kiambu: [60, 75],
    Mombasa: [70, 85],
    Nakuru: [62, 78],
    Kisumu: [63, 79],
    Machakos: [62, 78],
    Eldoret: [63, 79],
    Nyeri: [62, 78],
  },
  "Concrete Blocks 9 inch": {
    Nairobi: [85, 105],
    Kiambu: [82, 102],
    Mombasa: [92, 112],
    Nakuru: [84, 104],
    Kisumu: [85, 105],
    Machakos: [83, 103],
    Eldoret: [85, 105],
    Nyeri: [83, 103],
  },
  "Precast Lintels (1.5m)": {
    Nairobi: [380, 480],
    Kiambu: [360, 460],
    Mombasa: [420, 520],
    Nakuru: [370, 470],
    Kisumu: [380, 480],
    Machakos: [370, 470],
    Eldoret: [375, 475],
    Nyeri: [370, 470],
  },
  // Steel & Metal
  "Y8 Steel Rebar (6m)": {
    Nairobi: [380, 420],
    Kiambu: [390, 430],
    Mombasa: [410, 450],
    Nakuru: [395, 435],
    Kisumu: [400, 440],
    Machakos: [395, 435],
    Eldoret: [400, 440],
    Nyeri: [395, 435],
  },
  "Y10 Steel Rebar (6m)": {
    Nairobi: [560, 620],
    Kiambu: [570, 630],
    Mombasa: [590, 650],
    Nakuru: [565, 625],
    Kisumu: [570, 630],
    Machakos: [565, 625],
    Eldoret: [570, 630],
    Nyeri: [565, 625],
  },
  "Y12 Steel Rebar (6m)": {
    Nairobi: [780, 860],
    Kiambu: [790, 870],
    Mombasa: [820, 900],
    Nakuru: [785, 865],
    Kisumu: [795, 875],
    Machakos: [785, 865],
    Eldoret: [795, 875],
    Nyeri: [785, 865],
  },
  "Y16 Steel Rebar (6m)": {
    Nairobi: [1380, 1520],
    Kiambu: [1400, 1540],
    Mombasa: [1450, 1590],
    Nakuru: [1390, 1530],
    Kisumu: [1400, 1540],
    Machakos: [1390, 1530],
    Eldoret: [1400, 1540],
    Nyeri: [1390, 1530],
  },
  "Y20 Steel Rebar (6m)": {
    Nairobi: [2200, 2480],
    Kiambu: [2240, 2520],
    Mombasa: [2320, 2600],
    Nakuru: [2210, 2490],
    Kisumu: [2220, 2500],
    Machakos: [2210, 2490],
    Eldoret: [2220, 2500],
    Nyeri: [2210, 2490],
  },
  "BRC Mesh A142": {
    Nairobi: [2800, 3200],
    Kiambu: [2850, 3250],
    Mombasa: [3000, 3400],
    Nakuru: [2900, 3300],
    Kisumu: [2920, 3320],
    Machakos: [2900, 3300],
    Eldoret: [2920, 3320],
    Nyeri: [2900, 3300],
  },
  "Iron Sheets (28 gauge 8ft)": {
    Nairobi: [850, 950],
    Kiambu: [870, 970],
    Mombasa: [920, 1020],
    Nakuru: [880, 980],
    Kisumu: [890, 990],
    Machakos: [880, 980],
    Eldoret: [890, 990],
    Nyeri: [880, 980],
  },
  "Iron Sheets (30 gauge 8ft)": {
    Nairobi: [680, 780],
    Kiambu: [700, 800],
    Mombasa: [740, 840],
    Nakuru: [710, 810],
    Kisumu: [720, 820],
    Machakos: [710, 810],
    Eldoret: [720, 820],
    Nyeri: [710, 810],
  },
  "Galvanised Nails 4 inch": {
    Nairobi: [160, 200],
    Kiambu: [165, 205],
    Mombasa: [175, 215],
    Nakuru: [165, 205],
    Kisumu: [168, 208],
    Machakos: [165, 205],
    Eldoret: [168, 208],
    Nyeri: [165, 205],
  },
  "Roofing Nails 3 inch": {
    Nairobi: [140, 180],
    Kiambu: [145, 185],
    Mombasa: [155, 195],
    Nakuru: [145, 185],
    Kisumu: [148, 188],
    Machakos: [145, 185],
    Eldoret: [148, 188],
    Nyeri: [145, 185],
  },
  // Sand & Aggregates
  "River Sand": {
    Nairobi: [3500, 4500],
    Kiambu: [3000, 4000],
    Mombasa: [4000, 5000],
    Nakuru: [3200, 4200],
    Kisumu: [3400, 4400],
    Machakos: [3200, 4200],
    Eldoret: [3300, 4300],
    Nyeri: [3200, 4200],
  },
  "Quarry Dust": {
    Nairobi: [2500, 3500],
    Kiambu: [2200, 3200],
    Mombasa: [3000, 4000],
    Nakuru: [2400, 3400],
    Kisumu: [2500, 3500],
    Machakos: [2400, 3400],
    Eldoret: [2500, 3500],
    Nyeri: [2400, 3400],
  },
  Hardcore: {
    Nairobi: [2000, 2800],
    Kiambu: [1800, 2600],
    Mombasa: [2400, 3200],
    Nakuru: [1900, 2700],
    Kisumu: [2000, 2800],
    Machakos: [1900, 2700],
    Eldoret: [2000, 2800],
    Nyeri: [1900, 2700],
  },
  "Crusher Run": {
    Nairobi: [2800, 3500],
    Kiambu: [2500, 3200],
    Mombasa: [3200, 4000],
    Nakuru: [2700, 3400],
    Kisumu: [2800, 3500],
    Machakos: [2700, 3400],
    Eldoret: [2800, 3500],
    Nyeri: [2700, 3400],
  },
  "Building Sand": {
    Nairobi: [3200, 4200],
    Kiambu: [2900, 3900],
    Mombasa: [3800, 4800],
    Nakuru: [3000, 4000],
    Kisumu: [3200, 4200],
    Machakos: [3000, 4000],
    Eldoret: [3100, 4100],
    Nyeri: [3000, 4000],
  },
  // Timber & Roofing
  "3x2 Timber (12ft)": {
    Nairobi: [420, 520],
    Kiambu: [400, 500],
    Mombasa: [460, 560],
    Nakuru: [410, 510],
    Kisumu: [420, 520],
    Machakos: [410, 510],
    Eldoret: [415, 515],
    Nyeri: [410, 510],
  },
  "2x2 Timber (12ft)": {
    Nairobi: [280, 360],
    Kiambu: [270, 350],
    Mombasa: [310, 390],
    Nakuru: [275, 355],
    Kisumu: [280, 360],
    Machakos: [275, 355],
    Eldoret: [278, 358],
    Nyeri: [275, 355],
  },
  "4x2 Timber (12ft)": {
    Nairobi: [580, 720],
    Kiambu: [560, 700],
    Mombasa: [630, 780],
    Nakuru: [570, 710],
    Kisumu: [580, 720],
    Machakos: [570, 710],
    Eldoret: [575, 715],
    Nyeri: [570, 710],
  },
  "Marine Plywood (18mm)": {
    Nairobi: [3200, 3800],
    Kiambu: [3000, 3600],
    Mombasa: [3500, 4200],
    Nakuru: [3100, 3700],
    Kisumu: [3200, 3800],
    Machakos: [3100, 3700],
    Eldoret: [3200, 3800],
    Nyeri: [3100, 3700],
  },
  "Fascia Board (4m)": {
    Nairobi: [380, 480],
    Kiambu: [360, 460],
    Mombasa: [420, 520],
    Nakuru: [370, 470],
    Kisumu: [380, 480],
    Machakos: [370, 470],
    Eldoret: [375, 475],
    Nyeri: [370, 470],
  },
  "Ridging (8ft)": {
    Nairobi: [420, 520],
    Kiambu: [430, 530],
    Mombasa: [460, 560],
    Nakuru: [435, 535],
    Kisumu: [440, 540],
    Machakos: [435, 535],
    Eldoret: [440, 540],
    Nyeri: [435, 535],
  },
  // Finishes & Paint
  "Crown Wall Paint 20L": {
    Nairobi: [3800, 4500],
    Kiambu: [3900, 4600],
    Mombasa: [4200, 4900],
    Nakuru: [3950, 4650],
    Kisumu: [4000, 4700],
    Machakos: [3950, 4650],
    Eldoret: [4000, 4700],
    Nyeri: [3950, 4650],
  },
  "Sadolin Floor Paint 20L": {
    Nairobi: [4500, 5500],
    Kiambu: [4600, 5600],
    Mombasa: [5000, 6000],
    Nakuru: [4700, 5700],
    Kisumu: [4750, 5750],
    Machakos: [4700, 5700],
    Eldoret: [4750, 5750],
    Nyeri: [4700, 5700],
  },
  "Tile Adhesive 20kg": {
    Nairobi: [580, 720],
    Kiambu: [600, 740],
    Mombasa: [640, 780],
    Nakuru: [610, 750],
    Kisumu: [620, 760],
    Machakos: [610, 750],
    Eldoret: [620, 760],
    Nyeri: [610, 750],
  },
  "Tiles 60x60cm (Ceramic)": {
    Nairobi: [1800, 2800],
    Kiambu: [1900, 2900],
    Mombasa: [2100, 3100],
    Nakuru: [1950, 2950],
    Kisumu: [2000, 3000],
    Machakos: [1950, 2950],
    Eldoret: [2000, 3000],
    Nyeri: [1950, 2950],
  },
  "Tiles 30x30cm (Anti-slip)": {
    Nairobi: [1200, 1800],
    Kiambu: [1250, 1850],
    Mombasa: [1400, 2000],
    Nakuru: [1280, 1880],
    Kisumu: [1300, 1900],
    Machakos: [1280, 1880],
    Eldoret: [1300, 1900],
    Nyeri: [1280, 1880],
  },
  "Waterproofing Compound 5L": {
    Nairobi: [1200, 1600],
    Kiambu: [1250, 1650],
    Mombasa: [1400, 1800],
    Nakuru: [1280, 1680],
    Kisumu: [1300, 1700],
    Machakos: [1280, 1680],
    Eldoret: [1300, 1700],
    Nyeri: [1280, 1680],
  },
  "Skim Coat / Finishing Plaster": {
    Nairobi: [680, 880],
    Kiambu: [700, 900],
    Mombasa: [760, 960],
    Nakuru: [710, 910],
    Kisumu: [720, 920],
    Machakos: [710, 910],
    Eldoret: [720, 920],
    Nyeri: [710, 910],
  },
  // Hardware & Fixings
  "PVC Pipe 4 inch (6m)": {
    Nairobi: [1400, 1800],
    Kiambu: [1450, 1850],
    Mombasa: [1600, 2000],
    Nakuru: [1480, 1880],
    Kisumu: [1500, 1900],
    Machakos: [1480, 1880],
    Eldoret: [1500, 1900],
    Nyeri: [1480, 1880],
  },
  "GI Pipe 1 inch (6m)": {
    Nairobi: [1200, 1600],
    Kiambu: [1250, 1650],
    Mombasa: [1400, 1800],
    Nakuru: [1280, 1680],
    Kisumu: [1300, 1700],
    Machakos: [1280, 1680],
    Eldoret: [1300, 1700],
    Nyeri: [1280, 1680],
  },
  "PPR Pipe 20mm (4m)": {
    Nairobi: [380, 520],
    Kiambu: [390, 530],
    Mombasa: [430, 570],
    Nakuru: [395, 535],
    Kisumu: [400, 540],
    Machakos: [395, 535],
    Eldoret: [400, 540],
    Nyeri: [395, 535],
  },
  "Door Hinges 4 inch (pair)": {
    Nairobi: [180, 260],
    Kiambu: [185, 265],
    Mombasa: [200, 280],
    Nakuru: [185, 265],
    Kisumu: [190, 270],
    Machakos: [185, 265],
    Eldoret: [190, 270],
    Nyeri: [185, 265],
  },
  "Padlock 60mm": {
    Nairobi: [650, 950],
    Kiambu: [670, 970],
    Mombasa: [750, 1050],
    Nakuru: [680, 980],
    Kisumu: [700, 1000],
    Machakos: [680, 980],
    Eldoret: [700, 1000],
    Nyeri: [680, 980],
  },
  "Electrical Cable 2.5mm (50m)": {
    Nairobi: [3800, 4800],
    Kiambu: [3900, 4900],
    Mombasa: [4200, 5200],
    Nakuru: [3950, 4950],
    Kisumu: [4000, 5000],
    Machakos: [3950, 4950],
    Eldoret: [4000, 5000],
    Nyeri: [3950, 4950],
  },
  "MCB Circuit Breaker 20A": {
    Nairobi: [380, 520],
    Kiambu: [390, 530],
    Mombasa: [430, 570],
    Nakuru: [395, 535],
    Kisumu: [400, 540],
    Machakos: [395, 535],
    Eldoret: [400, 540],
    Nyeri: [395, 535],
  },
};

function mid(r: PriceRange) {
  return Math.round((r[0] + r[1]) / 2);
}
function trend(): "UP" | "DOWN" | "STABLE" {
  const n = Math.random();
  return n < 0.25 ? "UP" : n < 0.45 ? "DOWN" : "STABLE";
}
function ago(days: number) {
  return new Date(Date.now() - days * 86_400_000);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 GRUTH v2 seed starting...\n");

  // 1. Users
  console.log("👤 Users...");
  const hash = await bcrypt.hash("demo1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gruth.ke" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@gruth.ke",
      name: "GRUTH Admin",
      passwordHash: hash,
      role: "ADMIN",
      country: "KE",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "demo@groundtruth.ke" },
    update: {},
    create: {
      email: "demo@groundtruth.ke",
      name: "James Mwangi",
      passwordHash: hash,
      role: "CLIENT",
      phone: "+447700900123",
      whatsapp: "+447700900123",
      country: "GB",
    },
  });

  const inspector = await prisma.user.upsert({
    where: { email: "inspector@gruth.ke" },
    update: { role: "INSPECTOR" },
    create: {
      email: "inspector@gruth.ke",
      name: "Daniel Ochieng",
      passwordHash: hash,
      role: "INSPECTOR",
      phone: "+254712000001",
      whatsapp: "+254712000001",
      country: "KE",
      bio: "Civil engineer with 8 years site experience across Nairobi, Kiambu and Central Kenya. Specialist in construction verification, structural assessments and title deed due diligence.",
    },
  });

  console.log("  ✓ admin@gruth.ke        (ADMIN)");
  console.log("  ✓ demo@groundtruth.ke   (CLIENT)");
  console.log("  ✓ inspector@gruth.ke    (INSPECTOR)");

  // 2. Projects (with inspectorId assigned)
  console.log("\n📁 Projects...");

  const p1 = await prisma.project.upsert({
    where: { id: "demo-p1" },
    update: {},
    create: {
      id: "demo-p1",
      name: "Ruiru Family Home",
      type: "CONSTRUCTION",
      location: "Ruiru, Kiambu County",
      county: "Kiambu",
      latitude: -1.1456,
      longitude: 36.9615,
      status: "ACTIVE",
      estimatedBudget: 4_500_000,
      amountSpent: 2_100_000,
      currency: "KES",
      description:
        "3-bedroom bungalow. Ring beam completed, wall raising in progress.",
      clientId: client.id,
      inspectorId: inspector.id,
      startDate: ago(90),
    },
  });

  const p2 = await prisma.project.upsert({
    where: { id: "demo-p2" },
    update: {},
    create: {
      id: "demo-p2",
      name: "Kiambu Road Plot Verification",
      type: "LAND_PROPERTY",
      location: "Kiambu Road, Nairobi",
      county: "Nairobi",
      latitude: -1.2297,
      longitude: 36.772,
      status: "PENDING",
      description: "Title deed authenticity and survey check before purchase.",
      clientId: client.id,
      inspectorId: inspector.id,
      startDate: ago(14),
    },
  });

  const p3 = await prisma.project.upsert({
    where: { id: "demo-p3" },
    update: {},
    create: {
      id: "demo-p3",
      name: "Westlands Office Fit-out",
      type: "BUSINESS_INVESTMENT",
      location: "Westlands, Nairobi",
      county: "Nairobi",
      status: "COMPLETED",
      estimatedBudget: 1_200_000,
      amountSpent: 1_180_000,
      currency: "KES",
      description: "Contractor performance monitoring for office fit-out.",
      clientId: client.id,
      inspectorId: inspector.id,
      startDate: ago(180),
      endDate: ago(30),
      reportFileUrl:
        "https://storage.gruth.ke/reports/westlands-office-final.pdf",
      reportPublishedAt: ago(30),
    },
  });

  console.log("  ✓ 3 demo projects (all assigned to Daniel Ochieng)");

  // 3. Progress stages
  console.log("\n📊 Progress stages...");
  await prisma.progressStage.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "ps-1",
        projectId: p1.id,
        stageName: "Foundation",
        order: 1,
        completed: true,
        completedAt: ago(60),
      },
      {
        id: "ps-2",
        projectId: p1.id,
        stageName: "Ring Beam",
        order: 2,
        completed: true,
        completedAt: ago(20),
      },
      {
        id: "ps-3",
        projectId: p1.id,
        stageName: "Wall Raising",
        order: 3,
        completed: false,
      },
      {
        id: "ps-4",
        projectId: p1.id,
        stageName: "Roofing",
        order: 4,
        completed: false,
      },
      {
        id: "ps-5",
        projectId: p1.id,
        stageName: "Plastering",
        order: 5,
        completed: false,
      },
      {
        id: "ps-6",
        projectId: p1.id,
        stageName: "Finishing",
        order: 6,
        completed: false,
      },
      {
        id: "ps-7",
        projectId: p3.id,
        stageName: "Site Assessment",
        order: 1,
        completed: true,
        completedAt: ago(170),
      },
      {
        id: "ps-8",
        projectId: p3.id,
        stageName: "Fit-out Work",
        order: 2,
        completed: true,
        completedAt: ago(60),
      },
      {
        id: "ps-9",
        projectId: p3.id,
        stageName: "Final Sign-off",
        order: 3,
        completed: true,
        completedAt: ago(30),
      },
    ],
  });
  console.log("  ✓ 9 stages");

  // 4. Inspections (with inspectorId FK)
  console.log("\n🔍 Inspections...");
  await prisma.inspection.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "insp-1",
        projectId: p1.id,
        inspectorId: inspector.id,
        inspectorName: "Daniel Ochieng",
        scheduledDate: ago(20),
        completedDate: ago(20),
        status: "COMPLETED",
        summary:
          "Ring beam quality meets specification. One section marginally below minimum width — contractor has been advised to address before wall-raising continues.",
        observations:
          "Concrete curing satisfactory. Hairline cracks visible on eastern face — within acceptable tolerance. Rebar spacing on north wall slightly irregular (18cm instead of 15cm). All other structural elements meet spec.",
        recommendations:
          "1. Contractor must widen the sub-spec section by minimum 5cm before next pour.\n2. Increase rebar density on north wall to correct spacing.\n3. Apply waterproofing membrane to exposed ring beam before walls reach full height.",
        overallRating: 3,
        workQuality: "FAIR",
        safetyCompliance: true,
        nextSteps:
          "Re-inspect at 50% wall height. Estimated 2–3 weeks from today.",
      },
      {
        id: "insp-2",
        projectId: p1.id,
        inspectorId: inspector.id,
        inspectorName: "Daniel Ochieng",
        scheduledDate: ago(-5),
        status: "SCHEDULED",
      },
      {
        id: "insp-3",
        projectId: p2.id,
        inspectorId: inspector.id,
        inspectorName: "Daniel Ochieng",
        scheduledDate: ago(7),
        completedDate: ago(7),
        status: "COMPLETED",
        summary:
          "Physical beacons confirmed on-site. Plot dimensions match survey sheet. Awaiting land registry cross-check for title deed validation.",
        observations:
          "All 4 survey beacons present and undisturbed. No encroachments from neighbouring plots. Historical neighbour dispute on eastern boundary — flagged in records from 2019, appears resolved. Road access confirmed via public road.",
        recommendations:
          "Proceed with land registry cross-check. Request certified copy of search from Lands Registry Nairobi. Verify consent to transfer is endorsed.",
        overallRating: 4,
        workQuality: "GOOD",
        safetyCompliance: true,
        nextSteps:
          "Registry appointment confirmed. Inspector will attend and report within 24 hours of appointment.",
      },
      {
        id: "insp-4",
        projectId: p3.id,
        inspectorId: inspector.id,
        inspectorName: "Daniel Ochieng",
        scheduledDate: ago(35),
        completedDate: ago(35),
        status: "COMPLETED",
        summary:
          "Final sign-off complete. All fit-out works completed to satisfactory standard. Client can proceed with occupation.",
        observations:
          "Electrical installation meets Kenya Power standards. Plumbing pressure test passed. Tiling and flooring at commercial grade. Air conditioning units correctly installed. All snag items from previous inspection resolved.",
        recommendations:
          "Obtain completion certificate from Nairobi County. Retain all contractor warranties.",
        overallRating: 5,
        workQuality: "EXCELLENT",
        safetyCompliance: true,
        nextSteps: "Final report issued. No further inspections required.",
      },
    ],
  });
  console.log("  ✓ 4 inspections with detailed reports");

  // 5. Inspection media (realistic Unsplash construction photos)
  console.log("\n📸 Inspection media...");
  await prisma.inspectionMedia.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "med-1",
        inspectionId: "insp-1",
        type: "PHOTO",
        sortOrder: 1,
        url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
        filename: "ring-beam-overview.jpg",
        caption:
          "Ring beam overview — eastern face showing hairline cracks within tolerance",
      },
      {
        id: "med-2",
        inspectionId: "insp-1",
        type: "PHOTO",
        sortOrder: 2,
        url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800",
        filename: "rebar-spacing-north.jpg",
        caption:
          "North wall rebar — spacing at 18cm, should be 15cm. Flagged to contractor.",
      },
      {
        id: "med-3",
        inspectionId: "insp-1",
        type: "PHOTO",
        sortOrder: 3,
        url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
        filename: "foundation-east-corner.jpg",
        caption:
          "Foundation corner — adequate depth, DPC membrane correctly installed",
      },
      {
        id: "med-4",
        inspectionId: "insp-1",
        type: "PHOTO",
        sortOrder: 4,
        url: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800",
        filename: "subspec-section.jpg",
        caption:
          "Sub-spec section on south ring beam — width 200mm vs required 225mm",
      },
      {
        id: "med-5",
        inspectionId: "insp-3",
        type: "PHOTO",
        sortOrder: 1,
        url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
        filename: "plot-beacon-1.jpg",
        caption: "Survey beacon at NW corner — confirmed in place",
      },
      {
        id: "med-6",
        inspectionId: "insp-3",
        type: "PHOTO",
        sortOrder: 2,
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        filename: "plot-boundary-east.jpg",
        caption: "Eastern boundary — no encroachment confirmed",
      },
      {
        id: "med-7",
        inspectionId: "insp-4",
        type: "PHOTO",
        sortOrder: 1,
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        filename: "office-completed.jpg",
        caption: "Completed office interior — tiling and partitioning to spec",
      },
    ],
  });
  console.log("  ✓ 7 inspection photos");

  // 6. Final report for p3
  console.log("\n📄 Reports...");
  await prisma.report.upsert({
    where: { id: "report-1" },
    update: {},
    create: {
      id: "report-1",
      inspectionId: "insp-4",
      title: "Final Inspection Report — Westlands Office Fit-out",
      summary:
        "All fit-out works completed to commercial standard. Safe for occupation. No outstanding issues.",
      content: `# GRUTH Verification Report
**Project:** Westlands Office Fit-out
**Inspector:** Daniel Ochieng
**Date:** ${ago(35).toLocaleDateString("en-GB")}

## Executive Summary
All contractor works have been completed to a satisfactory commercial standard. The premises are safe for occupation. All snag items from the intermediate inspection have been resolved.

## Scope of Works Verified
- Internal partitioning and suspended ceilings
- Electrical installation (DB, sockets, lighting)
- Plumbing and sanitary fittings
- HVAC and split A/C units
- Flooring (tiles and carpeting)
- Internal painting and finishes

## Findings
All works meet or exceed the contractual specification. No structural concerns noted. Kenya Power pre-payment meter correctly installed. Plumbing pressure test: 6 bar sustained for 30 minutes — passed.

## Conclusion
Project certified complete. Recommend client obtains County completion certificate and retains all contractor warranties for a minimum of 2 years.`,
      fileUrl: "https://storage.gruth.ke/reports/westlands-office-final.pdf",
      publishedAt: ago(30),
    },
  });
  console.log("  ✓ 1 published report");

  // 7. Alerts
  console.log("\n🔔 Alerts...");
  await prisma.alert.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "alert-1",
        projectId: p1.id,
        severity: "WARNING",
        isRead: false,
        title: "Wall thickness below specification",
        message:
          "South ring beam section measures 200mm vs required 225mm. Must be rectified before wall-raising continues. Contractor has been notified by inspector.",
        actionUrl: `/dashboard/projects/${p1.id}`,
      },
      {
        id: "alert-2",
        projectId: p2.id,
        severity: "INFO",
        isRead: false,
        title: "Registry appointment confirmed",
        message:
          "Land registry cross-check confirmed for next Tuesday. Inspector will attend and report within 24 hours.",
        actionUrl: `/dashboard/projects/${p2.id}`,
      },
      {
        id: "alert-3",
        projectId: p1.id,
        severity: "INFO",
        isRead: true,
        readAt: ago(2),
        title: "Material delivery delay",
        message:
          "Y12 rebar delivery delayed 5 days due to supplier shortage. Wall-raising may slip by one week. GRUTH monitoring situation.",
        actionUrl: `/dashboard/projects/${p1.id}`,
      },
      {
        id: "alert-4",
        projectId: p3.id,
        severity: "INFO",
        isRead: true,
        readAt: ago(28),
        title: "Final report published",
        message:
          "Your Westlands Office Fit-out inspection report is ready. All works certified complete — PDF download available.",
        actionUrl: `/dashboard/projects/${p3.id}`,
      },
    ],
  });
  console.log("  ✓ 4 alerts");

  // 8. Messages
  console.log("\n💬 Messages...");
  await prisma.message.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "msg-1",
        projectId: p1.id,
        userId: client.id,
        senderId: admin.id,
        isFromClient: false,
        readAt: ago(19),
        createdAt: ago(20),
        content:
          "Hi James, your ring beam inspection is complete. Report uploaded. Overall good progress — one minor concern flagged on the south section. Please review the inspection report.",
      },
      {
        id: "msg-2",
        projectId: p1.id,
        userId: client.id,
        senderId: client.id,
        isFromClient: true,
        readAt: ago(19),
        createdAt: ago(19),
        content:
          "Thanks Daniel. I've reviewed the report. What does the wall thickness issue mean for the timeline exactly?",
      },
      {
        id: "msg-3",
        projectId: p1.id,
        userId: client.id,
        senderId: admin.id,
        isFromClient: false,
        readAt: null,
        createdAt: ago(18),
        content:
          "The contractor needs to rebuild that section to the correct width before raising walls further. Should take 1–2 days max and won't significantly affect the overall schedule. We'll verify the fix at the next inspection in about 2 weeks.",
      },
    ],
  });
  console.log("  ✓ 3 messages");

  // 9. Material prices
  console.log("\n💰 Project price quotes...");
  await prisma.materialPrice.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "mpq-1",
        projectId: p1.id,
        materialName: "Bamburi Cement 50kg",
        unit: "per bag",
        marketPriceLow: 680,
        marketPriceHigh: 720,
        quotedPrice: 750,
        status: "OVERPRICED",
        notes:
          "Contractor quoted KES 750. Market range KES 680–720. Negotiate down or source directly from Bamburi depot.",
      },
      {
        id: "mpq-2",
        projectId: p1.id,
        materialName: "Y12 Steel Rebar (6m)",
        unit: "per piece",
        marketPriceLow: 780,
        marketPriceHigh: 860,
        quotedPrice: 820,
        verifiedPrice: 820,
        status: "FAIR",
        notes:
          "Within acceptable market range. Inspector verified delivery quality.",
      },
      {
        id: "mpq-3",
        projectId: p1.id,
        materialName: "River Sand",
        unit: "per tonne",
        marketPriceLow: 3500,
        marketPriceHigh: 4500,
        quotedPrice: 3200,
        status: "GOOD_DEAL",
        notes:
          "Below market — contractor sourcing locally from Ruiru river. Verify quality on each delivery.",
      },
    ],
  });
  console.log("  ✓ 3 price quotes");

  // 10. County market prices (same as before)
  console.log("\n🏗️  County market prices...");
  const countyMap: Record<string, string> = {};
  for (const c of COUNTIES) {
    const rec = await prisma.county.upsert({
      where: { name: c.name },
      update: {},
      create: { name: c.name, code: c.code, region: c.region },
    });
    countyMap[c.name] = rec.id;
  }
  const materialMap: Record<string, string> = {};
  for (const m of MARKET_MATERIALS) {
    const rec = await prisma.marketMaterial.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    });
    materialMap[m.name] = rec.id;
  }
  const sourceMap: Record<string, string> = {};
  for (const [countyName, sources] of Object.entries(SOURCES_BY_COUNTY)) {
    for (const s of sources) {
      const rec = await prisma.marketPriceSource.upsert({
        where: { name: s.name },
        update: {},
        create: {
          name: s.name,
          url: s.url ?? null,
          county: countyName,
          verified: s.name.startsWith("GRUTH"),
        },
      });
      sourceMap[`${countyName}:${s.name}`] = rec.id;
    }
  }
  let priceCount = 0;
  for (const [matName, countyPrices] of Object.entries(PRICE_DATA)) {
    const materialId = materialMap[matName];
    if (!materialId) continue;
    for (const [countyName, range] of Object.entries(countyPrices)) {
      const countyId = countyMap[countyName];
      if (!countyId) continue;
      const primary = SOURCES_BY_COUNTY[countyName]?.[0];
      const sourceId = primary
        ? (sourceMap[`${countyName}:${primary.name}`] ?? null)
        : null;
      await prisma.countyMaterialPrice.upsert({
        where: {
          materialId_countyId_sourceId: {
            materialId,
            countyId,
            sourceId: sourceId ?? "",
          },
        },
        update: {
          priceKes: mid(range),
          priceLow: range[0],
          priceHigh: range[1],
          trend: trend(),
          updatedAt: new Date(),
        } as any,
        create: {
          materialId,
          countyId,
          sourceId,
          priceKes: mid(range),
          priceLow: range[0],
          priceHigh: range[1],
          trend: trend(),
        } as any,
      });
      priceCount++;
    }
  }
  console.log(
    `  ✓ ${COUNTIES.length} counties, ${MARKET_MATERIALS.length} materials, ${priceCount} prices`,
  );

  console.log("\n✅ Seed complete!\n");
  console.log("  Demo credentials (all password: demo1234)");
  console.log("  Admin:     admin@gruth.ke");
  console.log("  Client:    demo@groundtruth.ke");
  console.log("  Inspector: inspector@gruth.ke\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
