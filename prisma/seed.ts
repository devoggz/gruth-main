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
    // Coast
    { name: "Mombasa",       code: "001", region: "Coast"       },
    { name: "Kwale",         code: "002", region: "Coast"       },
    { name: "Kilifi",        code: "003", region: "Coast"       },
    { name: "Tana River",    code: "004", region: "Coast"       },
    { name: "Lamu",          code: "005", region: "Coast"       },
    { name: "Taita Taveta",  code: "006", region: "Coast"       },
    // North Eastern
    { name: "Garissa",       code: "007", region: "North Eastern" },
    { name: "Wajir",         code: "008", region: "North Eastern" },
    { name: "Mandera",       code: "009", region: "North Eastern" },
    // Eastern
    { name: "Marsabit",      code: "010", region: "Eastern"     },
    { name: "Isiolo",        code: "011", region: "Eastern"     },
    { name: "Meru",          code: "012", region: "Eastern"     },
    { name: "Tharaka-Nithi", code: "013", region: "Eastern"     },
    { name: "Embu",          code: "014", region: "Eastern"     },
    { name: "Kitui",         code: "015", region: "Eastern"     },
    { name: "Machakos",      code: "016", region: "Eastern"     },
    { name: "Makueni",       code: "017", region: "Eastern"     },
    // Central
    { name: "Nyandarua",     code: "018", region: "Central"     },
    { name: "Nyeri",         code: "019", region: "Central"     },
    { name: "Kirinyaga",     code: "020", region: "Central"     },
    { name: "Murang'a",      code: "021", region: "Central"     },
    { name: "Kiambu",        code: "022", region: "Central"     },
    // Rift Valley
    { name: "Turkana",       code: "023", region: "Rift Valley" },
    { name: "West Pokot",    code: "024", region: "Rift Valley" },
    { name: "Samburu",       code: "025", region: "Rift Valley" },
    { name: "Trans-Nzoia",   code: "026", region: "Rift Valley" },
    { name: "Eldoret",       code: "027", region: "Rift Valley" },
    { name: "Elgeyo-Marakwet", code: "028", region: "Rift Valley" },
    { name: "Nandi",         code: "029", region: "Rift Valley" },
    { name: "Baringo",       code: "030", region: "Rift Valley" },
    { name: "Laikipia",      code: "031", region: "Rift Valley" },
    { name: "Nakuru",        code: "032", region: "Rift Valley" },
    { name: "Narok",         code: "033", region: "Rift Valley" },
    { name: "Kajiado",       code: "034", region: "Rift Valley" },
    { name: "Kericho",       code: "035", region: "Rift Valley" },
    { name: "Bomet",         code: "036", region: "Rift Valley" },
    // Western
    { name: "Kakamega",      code: "037", region: "Western"     },
    { name: "Vihiga",        code: "038", region: "Western"     },
    { name: "Bungoma",       code: "039", region: "Western"     },
    { name: "Busia",         code: "040", region: "Western"     },
    // Nyanza
    { name: "Siaya",         code: "041", region: "Nyanza"      },
    { name: "Kisumu",        code: "042", region: "Nyanza"      },
    { name: "Homa Bay",      code: "043", region: "Nyanza"      },
    { name: "Migori",        code: "044", region: "Nyanza"      },
    { name: "Kisii",         code: "045", region: "Nyanza"      },
    { name: "Nyamira",       code: "046", region: "Nyanza"      },
    // Nairobi
    { name: "Nairobi",       code: "047", region: "Nairobi"     },
] as const;

const MARKET_MATERIALS = [
    // Cement & Concrete
    { name: "Bamburi Cement 50kg",          category: "Cement & Concrete", unit: "per bag",   description: "Portland Pozzolana Cement — most widely used brand in Kenya" },
    { name: "Savannah Cement 50kg",         category: "Cement & Concrete", unit: "per bag",   description: "Economy cement brand, suitable for non-structural plastering" },
    { name: "East African Portland Cement", category: "Cement & Concrete", unit: "per bag",   description: "OPC grade 42.5N — preferred for structural concrete" },
    { name: "Ballast (20mm)",               category: "Cement & Concrete", unit: "per tonne", description: "Crushed stone aggregate for concrete mix" },
    { name: "Concrete Blocks 6 inch",       category: "Cement & Concrete", unit: "per piece", description: "Hollow cement blocks for walling — 150mm width" },
    { name: "Concrete Blocks 9 inch",       category: "Cement & Concrete", unit: "per piece", description: "Hollow cement blocks for load-bearing walling — 225mm width" },
    { name: "Precast Lintels (1.5m)",       category: "Cement & Concrete", unit: "per piece", description: "Precast reinforced concrete lintel for door/window openings" },
    // Steel & Metal
    { name: "Y8 Steel Rebar (6m)",          category: "Steel & Metal",     unit: "per piece", description: "High yield deformed bar — used for stirrups and light reinforcement" },
    { name: "Y10 Steel Rebar (6m)",         category: "Steel & Metal",     unit: "per piece", description: "High yield deformed bar — columns and beams in small structures" },
    { name: "Y12 Steel Rebar (6m)",         category: "Steel & Metal",     unit: "per piece", description: "High yield deformed bar — standard for slabs and ring beams" },
    { name: "Y16 Steel Rebar (6m)",         category: "Steel & Metal",     unit: "per piece", description: "High yield deformed bar — heavy structural members" },
    { name: "Y20 Steel Rebar (6m)",         category: "Steel & Metal",     unit: "per piece", description: "High yield deformed bar — columns in multi-storey construction" },
    { name: "BRC Mesh A142",                category: "Steel & Metal",     unit: "per sheet", description: "Steel welded mesh 2.4×4.8m — used in floor slabs" },
    { name: "Iron Sheets (28 gauge 8ft)",   category: "Steel & Metal",     unit: "per sheet", description: "Corrugated galvanised iron roofing sheet" },
    { name: "Iron Sheets (30 gauge 8ft)",   category: "Steel & Metal",     unit: "per sheet", description: "Lighter gauge corrugated roofing sheet — economical option" },
    { name: "Galvanised Nails 4 inch",      category: "Steel & Metal",     unit: "per kg",    description: "Hot-dip galvanised nails for timber roofing" },
    { name: "Roofing Nails 3 inch",         category: "Steel & Metal",     unit: "per kg",    description: "Roofing nails with rubber washers for iron sheets" },
    // Sand & Aggregates
    { name: "River Sand",                   category: "Sand & Aggregates", unit: "per tonne", description: "Washed river sand — plastering and mortar mix" },
    { name: "Quarry Dust",                  category: "Sand & Aggregates", unit: "per tonne", description: "Fine aggregate from quarry crusher — block-making and mortar" },
    { name: "Hardcore",                     category: "Sand & Aggregates", unit: "per tonne", description: "Broken stones for fill and sub-base" },
    { name: "Crusher Run",                  category: "Sand & Aggregates", unit: "per tonne", description: "Graded crushed stone for road sub-base and hardstand" },
    { name: "Building Sand",                category: "Sand & Aggregates", unit: "per tonne", description: "Sharp sand for brickwork and render coats" },
    // Timber & Roofing
    { name: "3x2 Timber (12ft)",            category: "Timber & Roofing",  unit: "per piece", description: "Sawn timber for roof trusses and formwork" },
    { name: "2x2 Timber (12ft)",            category: "Timber & Roofing",  unit: "per piece", description: "Sawn timber for purlins and ceiling battens" },
    { name: "4x2 Timber (12ft)",            category: "Timber & Roofing",  unit: "per piece", description: "Sawn hardwood timber for heavy trusses and lintels" },
    { name: "Marine Plywood (18mm)",        category: "Timber & Roofing",  unit: "per sheet", description: "Moisture-resistant ply for formwork and flooring" },
    { name: "Fascia Board (4m)",            category: "Timber & Roofing",  unit: "per piece", description: "Treated timber fascia board for roof edges" },
    { name: "Ridging (8ft)",                category: "Timber & Roofing",  unit: "per piece", description: "Galvanised steel ridging cap for iron sheet roofs" },
    // Finishes & Paint
    { name: "Crown Wall Paint 20L",         category: "Finishes & Paint",  unit: "per tin",   description: "Interior emulsion — popular mid-range brand" },
    { name: "Sadolin Floor Paint 20L",      category: "Finishes & Paint",  unit: "per tin",   description: "Heavy-duty floor coating for concrete surfaces" },
    { name: "Tile Adhesive 20kg",           category: "Finishes & Paint",  unit: "per bag",   description: "Polymer-modified tile adhesive for wall and floor tiles" },
    { name: "Tiles 60x60cm (Ceramic)",      category: "Finishes & Paint",  unit: "per sqm",   description: "Standard ceramic floor tile — price per square metre" },
    { name: "Tiles 30x30cm (Anti-slip)",    category: "Finishes & Paint",  unit: "per sqm",   description: "Outdoor anti-slip ceramic tile — bathrooms and terraces" },
    { name: "Waterproofing Compound 5L",    category: "Finishes & Paint",  unit: "per tin",   description: "Integral waterproof additive for concrete and render" },
    { name: "Skim Coat / Finishing Plaster",category: "Finishes & Paint",  unit: "per bag",   description: "Fine finishing plaster for smooth interior walls" },
    // Hardware & Fixings
    { name: "PVC Pipe 4 inch (6m)",         category: "Hardware & Fixings", unit: "per piece", description: "uPVC drainage pipe for soil and waste lines" },
    { name: "GI Pipe 1 inch (6m)",          category: "Hardware & Fixings", unit: "per piece", description: "Galvanised iron water supply pipe" },
    { name: "PPR Pipe 20mm (4m)",           category: "Hardware & Fixings", unit: "per piece", description: "Polypropylene random pipe for hot/cold plumbing" },
    { name: "Door Hinges 4 inch (pair)",    category: "Hardware & Fixings", unit: "per pair",  description: "Steel butt hinges for standard interior doors" },
    { name: "Padlock 60mm",                 category: "Hardware & Fixings", unit: "per piece", description: "Hardened steel padlock for site security" },
    { name: "Electrical Cable 2.5mm (50m)", category: "Hardware & Fixings", unit: "per roll",  description: "Twin and earth PVC cable for power circuits" },
    { name: "MCB Circuit Breaker 20A",      category: "Hardware & Fixings", unit: "per piece", description: "Miniature circuit breaker for consumer unit" },
];

const SOURCES_BY_COUNTY: Record<string, { name: string; url?: string }[]> = {
    // Major urban counties — named suppliers
    Nairobi:        [{ name: "Tuffsteel Ltd — Industrial Area", url: "https://tuffsteel.co.ke" }, { name: "Timber Bay — Lusaka Road", url: "https://timberbay.co.ke" }, { name: "Mastermind Hardware — Ngong Road" }, { name: "GRUTH Field Survey — Nairobi" }],
    Mombasa:        [{ name: "Coast Hardware — Moi Avenue", url: "https://coasthardware.co.ke" }, { name: "Mombasa Cement Depot — Changamwe" }, { name: "GRUTH Field Survey — Mombasa" }],
    Kisumu:         [{ name: "Nyanza Hardware Supplies" }, { name: "Kisumu Building Centre" }, { name: "GRUTH Field Survey — Kisumu" }],
    Nakuru:         [{ name: "Rift Valley Hardware — Nakuru Town" }, { name: "Nakuru Steel Centre" }, { name: "GRUTH Field Survey — Nakuru" }],
    Kiambu:         [{ name: "Kiambu Hardware Centre" }, { name: "Ruaka Building Supplies" }, { name: "GRUTH Field Survey — Kiambu" }],
    Eldoret:        [{ name: "Eldoret Timber & Hardware" }, { name: "GRUTH Field Survey — Eldoret" }],
    Nyeri:          [{ name: "Central Province Hardware — Nyeri" }, { name: "GRUTH Field Survey — Nyeri" }],
    Machakos:       [{ name: "Machakos Hardware Depot" }, { name: "GRUTH Field Survey — Machakos" }],
    Meru:           [{ name: "Meru Hardware & Timber" }, { name: "GRUTH Field Survey — Meru" }],
    Embu:           [{ name: "Embu Building Materials" }, { name: "GRUTH Field Survey — Embu" }],
    Kisii:          [{ name: "Kisii Hardware Centre" }, { name: "GRUTH Field Survey — Kisii" }],
    Kakamega:       [{ name: "Kakamega Hardware Supplies" }, { name: "GRUTH Field Survey — Kakamega" }],
    Bungoma:        [{ name: "Bungoma Hardware Depot" }, { name: "GRUTH Field Survey — Bungoma" }],
    Kitui:          [{ name: "Kitui Building Supplies" }, { name: "GRUTH Field Survey — Kitui" }],
    Kajiado:        [{ name: "Kajiado Hardware Centre" }, { name: "GRUTH Field Survey — Kajiado" }],
    Narok:          [{ name: "Narok Hardware Depot" }, { name: "GRUTH Field Survey — Narok" }],
    // Other counties — GRUTH field survey only
    Kwale:          [{ name: "GRUTH Field Survey — Kwale" }],
    Kilifi:         [{ name: "GRUTH Field Survey — Kilifi" }],
    "Tana River":   [{ name: "GRUTH Field Survey — Tana River" }],
    Lamu:           [{ name: "GRUTH Field Survey — Lamu" }],
    "Taita Taveta": [{ name: "GRUTH Field Survey — Taita Taveta" }],
    Garissa:        [{ name: "GRUTH Field Survey — Garissa" }],
    Wajir:          [{ name: "GRUTH Field Survey — Wajir" }],
    Mandera:        [{ name: "GRUTH Field Survey — Mandera" }],
    Marsabit:       [{ name: "GRUTH Field Survey — Marsabit" }],
    Isiolo:         [{ name: "GRUTH Field Survey — Isiolo" }],
    "Tharaka-Nithi":[{ name: "GRUTH Field Survey — Tharaka-Nithi" }],
    Makueni:        [{ name: "GRUTH Field Survey — Makueni" }],
    Nyandarua:      [{ name: "GRUTH Field Survey — Nyandarua" }],
    Kirinyaga:      [{ name: "GRUTH Field Survey — Kirinyaga" }],
    "Murang'a":     [{ name: "GRUTH Field Survey — Murang'a" }],
    Turkana:        [{ name: "GRUTH Field Survey — Turkana" }],
    "West Pokot":   [{ name: "GRUTH Field Survey — West Pokot" }],
    Samburu:        [{ name: "GRUTH Field Survey — Samburu" }],
    "Trans-Nzoia":  [{ name: "GRUTH Field Survey — Trans-Nzoia" }],
    "Elgeyo-Marakwet": [{ name: "GRUTH Field Survey — Elgeyo-Marakwet" }],
    Nandi:          [{ name: "GRUTH Field Survey — Nandi" }],
    Baringo:        [{ name: "GRUTH Field Survey — Baringo" }],
    Laikipia:       [{ name: "GRUTH Field Survey — Laikipia" }],
    Kericho:        [{ name: "GRUTH Field Survey — Kericho" }],
    Bomet:          [{ name: "GRUTH Field Survey — Bomet" }],
    Vihiga:         [{ name: "GRUTH Field Survey — Vihiga" }],
    Busia:          [{ name: "GRUTH Field Survey — Busia" }],
    Siaya:          [{ name: "GRUTH Field Survey — Siaya" }],
    "Homa Bay":     [{ name: "GRUTH Field Survey — Homa Bay" }],
    Migori:         [{ name: "GRUTH Field Survey — Migori" }],
    Nyamira:        [{ name: "GRUTH Field Survey — Nyamira" }],
};

type PriceRange = [number, number];
const PRICE_DATA: Record<string, Record<string, PriceRange>> = {
    // ─── Cement & Concrete ────────────────────────────────────────────────────
    "Bamburi Cement 50kg": {
        Nairobi:[680,720], Kiambu:[700,740], Mombasa:[730,770], Nakuru:[710,750], Kisumu:[720,760], Machakos:[700,740], Eldoret:[720,760], Nyeri:[710,750],
        Meru:[715,755], Embu:[712,752], Kisii:[722,762], Kakamega:[718,758], Bungoma:[720,760], Kitui:[705,745], Kajiado:[695,735], Narok:[730,770],
        Kwale:[740,780], Kilifi:[735,775], "Tana River":[760,800], Lamu:[780,820], "Taita Taveta":[745,785],
        Garissa:[760,800], Wajir:[800,840], Mandera:[820,860],
        Marsabit:[790,830], Isiolo:[750,790], "Tharaka-Nithi":[718,758], Makueni:[708,748],
        Nyandarua:[712,752], Kirinyaga:[708,748], "Murang'a":[704,744],
        Turkana:[810,850], "West Pokot":[760,800], Samburu:[770,810], "Trans-Nzoia":[725,765],
        "Elgeyo-Marakwet":[728,768], Nandi:[722,762], Baringo:[735,775], Laikipia:[725,765],
        Kericho:[718,758], Bomet:[722,762], Vihiga:[720,760], Busia:[722,762],
        Siaya:[718,758], "Homa Bay":[725,765], Migori:[728,768], Nyamira:[720,760],
    },
    "Savannah Cement 50kg": {
        Nairobi:[660,700], Kiambu:[680,720], Mombasa:[710,750], Nakuru:[690,730], Kisumu:[700,740], Machakos:[680,720], Eldoret:[700,740], Nyeri:[690,730],
        Meru:[695,735], Embu:[692,732], Kisii:[702,742], Kakamega:[698,738], Bungoma:[700,740], Kitui:[685,725], Kajiado:[675,715], Narok:[710,750],
        Kwale:[720,760], Kilifi:[715,755], "Tana River":[740,780], Lamu:[760,800], "Taita Taveta":[725,765],
        Garissa:[740,780], Wajir:[780,820], Mandera:[800,840],
        Marsabit:[770,810], Isiolo:[730,770], "Tharaka-Nithi":[698,738], Makueni:[688,728],
        Nyandarua:[692,732], Kirinyaga:[688,728], "Murang'a":[684,724],
        Turkana:[790,830], "West Pokot":[740,780], Samburu:[750,790], "Trans-Nzoia":[705,745],
        "Elgeyo-Marakwet":[708,748], Nandi:[702,742], Baringo:[715,755], Laikipia:[705,745],
        Kericho:[698,738], Bomet:[702,742], Vihiga:[700,740], Busia:[702,742],
        Siaya:[698,738], "Homa Bay":[705,745], Migori:[708,748], Nyamira:[700,740],
    },
    "East African Portland Cement": {
        Nairobi:[650,690], Kiambu:[670,710], Mombasa:[700,740], Nakuru:[680,720], Kisumu:[690,730], Machakos:[670,710], Eldoret:[690,730], Nyeri:[680,720],
        Meru:[685,725], Embu:[682,722], Kisii:[692,732], Kakamega:[688,728], Bungoma:[690,730], Kitui:[675,715], Kajiado:[665,705], Narok:[700,740],
        Kwale:[710,750], Kilifi:[705,745], "Tana River":[730,770], Lamu:[750,790], "Taita Taveta":[715,755],
        Garissa:[730,770], Wajir:[770,810], Mandera:[790,830],
        Marsabit:[760,800], Isiolo:[720,760], "Tharaka-Nithi":[688,728], Makueni:[678,718],
        Nyandarua:[682,722], Kirinyaga:[678,718], "Murang'a":[674,714],
        Turkana:[780,820], "West Pokot":[730,770], Samburu:[740,780], "Trans-Nzoia":[695,735],
        "Elgeyo-Marakwet":[698,738], Nandi:[692,732], Baringo:[705,745], Laikipia:[695,735],
        Kericho:[688,728], Bomet:[692,732], Vihiga:[690,730], Busia:[692,732],
        Siaya:[688,728], "Homa Bay":[695,735], Migori:[698,738], Nyamira:[690,730],
    },
    "Ballast (20mm)": {
        Nairobi:[4500,5500], Kiambu:[3800,4800], Mombasa:[5000,6200], Nakuru:[4000,5000], Kisumu:[4200,5200], Machakos:[4000,5000], Eldoret:[4200,5200], Nyeri:[4000,5000],
        Meru:[4100,5100], Embu:[3900,4900], Kisii:[4300,5300], Kakamega:[4100,5100], Bungoma:[4200,5200], Kitui:[4000,5000], Kajiado:[4400,5400], Narok:[4600,5600],
        Kwale:[5200,6400], Kilifi:[5100,6200], "Tana River":[5500,6800], Lamu:[6000,7500], "Taita Taveta":[4800,5900],
        Garissa:[5500,6800], Wajir:[6000,7500], Mandera:[6500,8000],
        Marsabit:[5800,7200], Isiolo:[4800,5900], "Tharaka-Nithi":[4000,5000], Makueni:[4100,5100],
        Nyandarua:[3900,4900], Kirinyaga:[3800,4800], "Murang'a":[3800,4800],
        Turkana:[6500,8000], "West Pokot":[5500,6800], Samburu:[5600,7000], "Trans-Nzoia":[4200,5200],
        "Elgeyo-Marakwet":[4300,5300], Nandi:[4100,5100], Baringo:[4500,5500], Laikipia:[4200,5200],
        Kericho:[4100,5100], Bomet:[4200,5200], Vihiga:[4100,5100], Busia:[4200,5200],
        Siaya:[4200,5200], "Homa Bay":[4400,5400], Migori:[4500,5500], Nyamira:[4200,5200],
    },
    "Concrete Blocks 6 inch": {
        Nairobi:[65,80], Kiambu:[60,75], Mombasa:[70,85], Nakuru:[62,78], Kisumu:[63,79], Machakos:[62,78], Eldoret:[63,79], Nyeri:[62,78],
        Meru:[63,79], Embu:[62,78], Kisii:[64,80], Kakamega:[63,79], Bungoma:[63,79], Kitui:[62,78], Kajiado:[65,81], Narok:[68,84],
        Kwale:[72,88], Kilifi:[71,87], "Tana River":[75,92], Lamu:[80,98], "Taita Taveta":[70,86],
        Garissa:[75,92], Wajir:[82,100], Mandera:[88,108],
        Marsabit:[80,98], Isiolo:[68,84], "Tharaka-Nithi":[63,79], Makueni:[62,78],
        Nyandarua:[62,78], Kirinyaga:[61,77], "Murang'a":[61,77],
        Turkana:[88,108], "West Pokot":[72,88], Samburu:[74,90], "Trans-Nzoia":[64,80],
        "Elgeyo-Marakwet":[64,80], Nandi:[63,79], Baringo:[66,82], Laikipia:[64,80],
        Kericho:[63,79], Bomet:[64,80], Vihiga:[63,79], Busia:[64,80],
        Siaya:[63,79], "Homa Bay":[65,81], Migori:[66,82], Nyamira:[64,80],
    },
    "Concrete Blocks 9 inch": {
        Nairobi:[85,105], Kiambu:[82,102], Mombasa:[92,112], Nakuru:[84,104], Kisumu:[85,105], Machakos:[83,103], Eldoret:[85,105], Nyeri:[83,103],
        Meru:[84,104], Embu:[83,103], Kisii:[86,106], Kakamega:[85,105], Bungoma:[85,105], Kitui:[83,103], Kajiado:[87,107], Narok:[90,110],
        Kwale:[95,115], Kilifi:[94,114], "Tana River":[99,119], Lamu:[105,125], "Taita Taveta":[93,113],
        Garissa:[99,119], Wajir:[108,128], Mandera:[116,136],
        Marsabit:[105,125], Isiolo:[90,110], "Tharaka-Nithi":[84,104], Makueni:[83,103],
        Nyandarua:[83,103], Kirinyaga:[82,102], "Murang'a":[82,102],
        Turkana:[116,136], "West Pokot":[95,115], Samburu:[97,117], "Trans-Nzoia":[86,106],
        "Elgeyo-Marakwet":[86,106], Nandi:[85,105], Baringo:[88,108], Laikipia:[86,106],
        Kericho:[85,105], Bomet:[86,106], Vihiga:[85,105], Busia:[86,106],
        Siaya:[85,105], "Homa Bay":[87,107], Migori:[88,108], Nyamira:[86,106],
    },
    "Precast Lintels (1.5m)": {
        Nairobi:[380,480], Kiambu:[360,460], Mombasa:[420,520], Nakuru:[370,470], Kisumu:[380,480], Machakos:[370,470], Eldoret:[375,475], Nyeri:[370,470],
        Meru:[372,472], Embu:[368,468], Kisii:[382,482], Kakamega:[378,478], Bungoma:[380,480], Kitui:[370,470], Kajiado:[385,485], Narok:[400,500],
        Kwale:[430,530], Kilifi:[425,525], "Tana River":[450,550], Lamu:[480,580], "Taita Taveta":[420,520],
        Garissa:[450,550], Wajir:[490,590], Mandera:[520,620],
        Marsabit:[475,575], Isiolo:[405,505], "Tharaka-Nithi":[372,472], Makueni:[370,470],
        Nyandarua:[368,468], Kirinyaga:[365,465], "Murang'a":[365,465],
        Turkana:[525,625], "West Pokot":[432,532], Samburu:[440,540], "Trans-Nzoia":[382,482],
        "Elgeyo-Marakwet":[384,484], Nandi:[380,480], Baringo:[392,492], Laikipia:[382,482],
        Kericho:[378,478], Bomet:[382,482], Vihiga:[380,480], Busia:[382,482],
        Siaya:[378,478], "Homa Bay":[385,485], Migori:[390,490], Nyamira:[382,482],
    },
    // ─── Steel & Metal ────────────────────────────────────────────────────────
    "Y8 Steel Rebar (6m)": {
        Nairobi:[380,420], Kiambu:[390,430], Mombasa:[410,450], Nakuru:[395,435], Kisumu:[400,440], Machakos:[395,435], Eldoret:[400,440], Nyeri:[395,435],
        Meru:[397,437], Embu:[394,434], Kisii:[402,442], Kakamega:[400,440], Bungoma:[401,441], Kitui:[395,435], Kajiado:[385,425], Narok:[412,452],
        Kwale:[420,460], Kilifi:[418,458], "Tana River":[435,475], Lamu:[450,490], "Taita Taveta":[415,455],
        Garissa:[435,475], Wajir:[460,500], Mandera:[480,520],
        Marsabit:[452,492], Isiolo:[415,455], "Tharaka-Nithi":[397,437], Makueni:[393,433],
        Nyandarua:[394,434], Kirinyaga:[392,432], "Murang'a":[391,431],
        Turkana:[485,525], "West Pokot":[422,462], Samburu:[428,468], "Trans-Nzoia":[402,442],
        "Elgeyo-Marakwet":[404,444], Nandi:[400,440], Baringo:[408,448], Laikipia:[402,442],
        Kericho:[399,439], Bomet:[402,442], Vihiga:[400,440], Busia:[401,441],
        Siaya:[399,439], "Homa Bay":[404,444], Migori:[407,447], Nyamira:[401,441],
    },
    "Y10 Steel Rebar (6m)": {
        Nairobi:[560,620], Kiambu:[570,630], Mombasa:[590,650], Nakuru:[565,625], Kisumu:[570,630], Machakos:[565,625], Eldoret:[570,630], Nyeri:[565,625],
        Meru:[568,628], Embu:[565,625], Kisii:[572,632], Kakamega:[570,630], Bungoma:[571,631], Kitui:[566,626], Kajiado:[558,618], Narok:[582,642],
        Kwale:[605,665], Kilifi:[600,660], "Tana River":[625,685], Lamu:[648,708], "Taita Taveta":[595,655],
        Garissa:[625,685], Wajir:[660,720], Mandera:[690,750],
        Marsabit:[652,712], Isiolo:[590,650], "Tharaka-Nithi":[568,628], Makueni:[564,624],
        Nyandarua:[565,625], Kirinyaga:[563,623], "Murang'a":[562,622],
        Turkana:[698,758], "West Pokot":[608,668], Samburu:[618,678], "Trans-Nzoia":[572,632],
        "Elgeyo-Marakwet":[574,634], Nandi:[570,630], Baringo:[580,640], Laikipia:[572,632],
        Kericho:[569,629], Bomet:[572,632], Vihiga:[570,630], Busia:[571,631],
        Siaya:[569,629], "Homa Bay":[574,634], Migori:[578,638], Nyamira:[571,631],
    },
    "Y12 Steel Rebar (6m)": {
        Nairobi:[780,860], Kiambu:[790,870], Mombasa:[820,900], Nakuru:[785,865], Kisumu:[795,875], Machakos:[785,865], Eldoret:[795,875], Nyeri:[785,865],
        Meru:[788,868], Embu:[785,865], Kisii:[798,878], Kakamega:[795,875], Bungoma:[796,876], Kitui:[786,866], Kajiado:[778,858], Narok:[812,892],
        Kwale:[840,920], Kilifi:[835,915], "Tana River":[865,945], Lamu:[895,975], "Taita Taveta":[828,908],
        Garissa:[865,945], Wajir:[915,995], Mandera:[955,1035],
        Marsabit:[902,982], Isiolo:[818,898], "Tharaka-Nithi":[788,868], Makueni:[784,864],
        Nyandarua:[785,865], Kirinyaga:[783,863], "Murang'a":[782,862],
        Turkana:[965,1045], "West Pokot":[845,925], Samburu:[858,938], "Trans-Nzoia":[798,878],
        "Elgeyo-Marakwet":[800,880], Nandi:[795,875], Baringo:[808,888], Laikipia:[798,878],
        Kericho:[791,871], Bomet:[798,878], Vihiga:[795,875], Busia:[796,876],
        Siaya:[791,871], "Homa Bay":[800,880], Migori:[806,886], Nyamira:[796,876],
    },
    "Y16 Steel Rebar (6m)": {
        Nairobi:[1380,1520], Kiambu:[1400,1540], Mombasa:[1450,1590], Nakuru:[1390,1530], Kisumu:[1400,1540], Machakos:[1390,1530], Eldoret:[1400,1540], Nyeri:[1390,1530],
        Meru:[1395,1535], Embu:[1392,1532], Kisii:[1405,1545], Kakamega:[1402,1542], Bungoma:[1403,1543], Kitui:[1392,1532], Kajiado:[1378,1518], Narok:[1435,1575],
        Kwale:[1485,1625], Kilifi:[1478,1618], "Tana River":[1532,1672], Lamu:[1585,1725], "Taita Taveta":[1465,1605],
        Garissa:[1532,1672], Wajir:[1620,1760], Mandera:[1695,1835],
        Marsabit:[1598,1738], Isiolo:[1450,1590], "Tharaka-Nithi":[1395,1535], Makueni:[1388,1528],
        Nyandarua:[1392,1532], Kirinyaga:[1388,1528], "Murang'a":[1385,1525],
        Turkana:[1712,1852], "West Pokot":[1495,1635], Samburu:[1520,1660], "Trans-Nzoia":[1408,1548],
        "Elgeyo-Marakwet":[1412,1552], Nandi:[1405,1545], Baringo:[1425,1565], Laikipia:[1410,1550],
        Kericho:[1400,1540], Bomet:[1408,1548], Vihiga:[1405,1545], Busia:[1406,1546],
        Siaya:[1400,1540], "Homa Bay":[1415,1555], Migori:[1422,1562], Nyamira:[1406,1546],
    },
    "Y20 Steel Rebar (6m)": {
        Nairobi:[2200,2480], Kiambu:[2240,2520], Mombasa:[2320,2600], Nakuru:[2210,2490], Kisumu:[2220,2500], Machakos:[2210,2490], Eldoret:[2220,2500], Nyeri:[2210,2490],
        Meru:[2215,2495], Embu:[2212,2492], Kisii:[2228,2508], Kakamega:[2222,2502], Bungoma:[2225,2505], Kitui:[2212,2492], Kajiado:[2198,2478], Narok:[2285,2565],
        Kwale:[2368,2648], Kilifi:[2352,2632], "Tana River":[2440,2720], Lamu:[2528,2808], "Taita Taveta":[2338,2618],
        Garissa:[2440,2720], Wajir:[2580,2860], Mandera:[2700,2980],
        Marsabit:[2548,2828], Isiolo:[2310,2590], "Tharaka-Nithi":[2215,2495], Makueni:[2208,2488],
        Nyandarua:[2212,2492], Kirinyaga:[2208,2488], "Murang'a":[2205,2485],
        Turkana:[2728,3008], "West Pokot":[2382,2662], Samburu:[2420,2700], "Trans-Nzoia":[2232,2512],
        "Elgeyo-Marakwet":[2238,2518], Nandi:[2228,2508], Baringo:[2268,2548], Laikipia:[2238,2518],
        Kericho:[2222,2502], Bomet:[2232,2512], Vihiga:[2228,2508], Busia:[2230,2510],
        Siaya:[2222,2502], "Homa Bay":[2248,2528], Migori:[2262,2542], Nyamira:[2230,2510],
    },
    "BRC Mesh A142": {
        Nairobi:[2800,3200], Kiambu:[2850,3250], Mombasa:[3000,3400], Nakuru:[2900,3300], Kisumu:[2920,3320], Machakos:[2900,3300], Eldoret:[2920,3320], Nyeri:[2900,3300],
        Meru:[2910,3310], Embu:[2905,3305], Kisii:[2930,3330], Kakamega:[2922,3322], Bungoma:[2925,3325], Kitui:[2905,3305], Kajiado:[2820,3220], Narok:[3010,3410],
        Kwale:[3080,3480], Kilifi:[3060,3460], "Tana River":[3180,3580], Lamu:[3290,3690], "Taita Taveta":[3040,3440],
        Garissa:[3180,3580], Wajir:[3360,3760], Mandera:[3510,3910],
        Marsabit:[3318,3718], Isiolo:[3010,3410], "Tharaka-Nithi":[2910,3310], Makueni:[2902,3302],
        Nyandarua:[2905,3305], Kirinyaga:[2900,3300], "Murang'a":[2898,3298],
        Turkana:[3552,3952], "West Pokot":[3102,3502], Samburu:[3152,3552], "Trans-Nzoia":[2932,3332],
        "Elgeyo-Marakwet":[2940,3340], Nandi:[2928,3328], Baringo:[2970,3370], Laikipia:[2938,3338],
        Kericho:[2922,3322], Bomet:[2932,3332], Vihiga:[2928,3328], Busia:[2930,3330],
        Siaya:[2922,3322], "Homa Bay":[2948,3348], Migori:[2960,3360], Nyamira:[2930,3330],
    },
    "Iron Sheets (28 gauge 8ft)": {
        Nairobi:[850,950], Kiambu:[870,970], Mombasa:[920,1020], Nakuru:[880,980], Kisumu:[890,990], Machakos:[880,980], Eldoret:[890,990], Nyeri:[880,980],
        Meru:[885,985], Embu:[882,982], Kisii:[892,992], Kakamega:[890,990], Bungoma:[891,991], Kitui:[882,982], Kajiado:[858,958], Narok:[918,1018],
        Kwale:[942,1042], Kilifi:[936,1036], "Tana River":[970,1070], Lamu:[1005,1105], "Taita Taveta":[928,1028],
        Garissa:[970,1070], Wajir:[1028,1128], Mandera:[1072,1172],
        Marsabit:[1012,1112], Isiolo:[922,1022], "Tharaka-Nithi":[885,985], Makueni:[880,980],
        Nyandarua:[882,982], Kirinyaga:[880,980], "Murang'a":[878,978],
        Turkana:[1082,1182], "West Pokot":[948,1048], Samburu:[962,1062], "Trans-Nzoia":[894,994],
        "Elgeyo-Marakwet":[896,996], Nandi:[891,991], Baringo:[905,1005], Laikipia:[894,994],
        Kericho:[890,990], Bomet:[894,994], Vihiga:[891,991], Busia:[892,992],
        Siaya:[890,990], "Homa Bay":[896,996], Migori:[901,1001], Nyamira:[892,992],
    },
    "Iron Sheets (30 gauge 8ft)": {
        Nairobi:[680,780], Kiambu:[700,800], Mombasa:[740,840], Nakuru:[710,810], Kisumu:[720,820], Machakos:[710,810], Eldoret:[720,820], Nyeri:[710,810],
        Meru:[715,815], Embu:[712,812], Kisii:[722,822], Kakamega:[719,819], Bungoma:[720,820], Kitui:[712,812], Kajiado:[688,788], Narok:[748,848],
        Kwale:[758,858], Kilifi:[752,852], "Tana River":[780,880], Lamu:[808,908], "Taita Taveta":[748,848],
        Garissa:[780,880], Wajir:[825,925], Mandera:[862,962],
        Marsabit:[814,914], Isiolo:[752,852], "Tharaka-Nithi":[715,815], Makueni:[710,810],
        Nyandarua:[712,812], Kirinyaga:[710,810], "Murang'a":[708,808],
        Turkana:[870,970], "West Pokot":[762,862], Samburu:[774,874], "Trans-Nzoia":[722,822],
        "Elgeyo-Marakwet":[724,824], Nandi:[720,820], Baringo:[732,832], Laikipia:[722,822],
        Kericho:[718,818], Bomet:[722,822], Vihiga:[720,820], Busia:[721,821],
        Siaya:[718,818], "Homa Bay":[725,825], Migori:[728,828], Nyamira:[721,821],
    },
    "Galvanised Nails 4 inch": {
        Nairobi:[160,200], Kiambu:[165,205], Mombasa:[175,215], Nakuru:[165,205], Kisumu:[168,208], Machakos:[165,205], Eldoret:[168,208], Nyeri:[165,205],
        Meru:[166,206], Embu:[165,205], Kisii:[169,209], Kakamega:[168,208], Bungoma:[168,208], Kitui:[165,205], Kajiado:[162,202], Narok:[172,212],
        Kwale:[180,220], Kilifi:[178,218], "Tana River":[185,225], Lamu:[192,232], "Taita Taveta":[178,218],
        Garissa:[185,225], Wajir:[196,236], Mandera:[205,245],
        Marsabit:[194,234], Isiolo:[174,214], "Tharaka-Nithi":[166,206], Makueni:[164,204],
        Nyandarua:[165,205], Kirinyaga:[164,204], "Murang'a":[164,204],
        Turkana:[208,248], "West Pokot":[181,221], Samburu:[184,224], "Trans-Nzoia":[169,209],
        "Elgeyo-Marakwet":[170,210], Nandi:[168,208], Baringo:[172,212], Laikipia:[169,209],
        Kericho:[168,208], Bomet:[169,209], Vihiga:[168,208], Busia:[168,208],
        Siaya:[168,208], "Homa Bay":[170,210], Migori:[171,211], Nyamira:[168,208],
    },
    "Roofing Nails 3 inch": {
        Nairobi:[140,180], Kiambu:[145,185], Mombasa:[155,195], Nakuru:[145,185], Kisumu:[148,188], Machakos:[145,185], Eldoret:[148,188], Nyeri:[145,185],
        Meru:[146,186], Embu:[145,185], Kisii:[149,189], Kakamega:[148,188], Bungoma:[148,188], Kitui:[145,185], Kajiado:[142,182], Narok:[152,192],
        Kwale:[160,200], Kilifi:[158,198], "Tana River":[165,205], Lamu:[172,212], "Taita Taveta":[158,198],
        Garissa:[165,205], Wajir:[175,215], Mandera:[183,223],
        Marsabit:[173,213], Isiolo:[154,194], "Tharaka-Nithi":[146,186], Makueni:[144,184],
        Nyandarua:[145,185], Kirinyaga:[144,184], "Murang'a":[144,184],
        Turkana:[185,225], "West Pokot":[161,201], Samburu:[164,204], "Trans-Nzoia":[149,189],
        "Elgeyo-Marakwet":[150,190], Nandi:[148,188], Baringo:[152,192], Laikipia:[149,189],
        Kericho:[148,188], Bomet:[149,189], Vihiga:[148,188], Busia:[148,188],
        Siaya:[148,188], "Homa Bay":[150,190], Migori:[151,191], Nyamira:[148,188],
    },
    // ─── Sand & Aggregates ────────────────────────────────────────────────────
    "River Sand": {
        Nairobi:[3500,4500], Kiambu:[3000,4000], Mombasa:[4000,5000], Nakuru:[3200,4200], Kisumu:[3400,4400], Machakos:[3200,4200], Eldoret:[3300,4300], Nyeri:[3200,4200],
        Meru:[3100,4100], Embu:[3000,4000], Kisii:[3500,4500], Kakamega:[3400,4400], Bungoma:[3400,4400], Kitui:[3200,4200], Kajiado:[3600,4600], Narok:[3800,4800],
        Kwale:[4200,5200], Kilifi:[4100,5100], "Tana River":[4600,5600], Lamu:[5200,6200], "Taita Taveta":[4000,5000],
        Garissa:[4600,5600], Wajir:[5500,6500], Mandera:[6000,7000],
        Marsabit:[5200,6200], Isiolo:[3900,4900], "Tharaka-Nithi":[3100,4100], Makueni:[3200,4200],
        Nyandarua:[3000,4000], Kirinyaga:[2900,3900], "Murang'a":[2900,3900],
        Turkana:[6200,7200], "West Pokot":[4400,5400], Samburu:[4600,5600], "Trans-Nzoia":[3500,4500],
        "Elgeyo-Marakwet":[3500,4500], Nandi:[3400,4400], Baringo:[3600,4600], Laikipia:[3400,4400],
        Kericho:[3400,4400], Bomet:[3500,4500], Vihiga:[3400,4400], Busia:[3500,4500],
        Siaya:[3400,4400], "Homa Bay":[3600,4600], Migori:[3700,4700], Nyamira:[3500,4500],
    },
    "Quarry Dust": {
        Nairobi:[2500,3500], Kiambu:[2200,3200], Mombasa:[3000,4000], Nakuru:[2400,3400], Kisumu:[2500,3500], Machakos:[2400,3400], Eldoret:[2500,3500], Nyeri:[2400,3400],
        Meru:[2300,3300], Embu:[2200,3200], Kisii:[2600,3600], Kakamega:[2500,3500], Bungoma:[2500,3500], Kitui:[2400,3400], Kajiado:[2600,3600], Narok:[2800,3800],
        Kwale:[3100,4100], Kilifi:[3000,4000], "Tana River":[3500,4500], Lamu:[4000,5000], "Taita Taveta":[3000,4000],
        Garissa:[3500,4500], Wajir:[4200,5200], Mandera:[4600,5600],
        Marsabit:[4000,5000], Isiolo:[2900,3900], "Tharaka-Nithi":[2300,3300], Makueni:[2400,3400],
        Nyandarua:[2200,3200], Kirinyaga:[2100,3100], "Murang'a":[2100,3100],
        Turkana:[4800,5800], "West Pokot":[3300,4300], Samburu:[3500,4500], "Trans-Nzoia":[2600,3600],
        "Elgeyo-Marakwet":[2600,3600], Nandi:[2500,3500], Baringo:[2700,3700], Laikipia:[2600,3600],
        Kericho:[2500,3500], Bomet:[2600,3600], Vihiga:[2500,3500], Busia:[2600,3600],
        Siaya:[2500,3500], "Homa Bay":[2700,3700], Migori:[2800,3800], Nyamira:[2600,3600],
    },
    "Hardcore": {
        Nairobi:[2000,2800], Kiambu:[1800,2600], Mombasa:[2400,3200], Nakuru:[1900,2700], Kisumu:[2000,2800], Machakos:[1900,2700], Eldoret:[2000,2800], Nyeri:[1900,2700],
        Meru:[1850,2650], Embu:[1800,2600], Kisii:[2100,2900], Kakamega:[2000,2800], Bungoma:[2000,2800], Kitui:[1900,2700], Kajiado:[2100,2900], Narok:[2200,3000],
        Kwale:[2500,3300], Kilifi:[2400,3200], "Tana River":[2800,3600], Lamu:[3200,4000], "Taita Taveta":[2300,3100],
        Garissa:[2800,3600], Wajir:[3400,4200], Mandera:[3800,4600],
        Marsabit:[3200,4000], Isiolo:[2300,3100], "Tharaka-Nithi":[1850,2650], Makueni:[1900,2700],
        Nyandarua:[1800,2600], Kirinyaga:[1700,2500], "Murang'a":[1700,2500],
        Turkana:[3900,4700], "West Pokot":[2600,3400], Samburu:[2700,3500], "Trans-Nzoia":[2100,2900],
        "Elgeyo-Marakwet":[2100,2900], Nandi:[2000,2800], Baringo:[2150,2950], Laikipia:[2100,2900],
        Kericho:[2000,2800], Bomet:[2100,2900], Vihiga:[2000,2800], Busia:[2100,2900],
        Siaya:[2000,2800], "Homa Bay":[2150,2950], Migori:[2200,3000], Nyamira:[2100,2900],
    },
    "Crusher Run": {
        Nairobi:[2800,3500], Kiambu:[2500,3200], Mombasa:[3200,4000], Nakuru:[2700,3400], Kisumu:[2800,3500], Machakos:[2700,3400], Eldoret:[2800,3500], Nyeri:[2700,3400],
        Meru:[2650,3350], Embu:[2550,3250], Kisii:[2900,3600], Kakamega:[2800,3500], Bungoma:[2800,3500], Kitui:[2700,3400], Kajiado:[2900,3600], Narok:[3100,3800],
        Kwale:[3300,4100], Kilifi:[3200,4000], "Tana River":[3600,4400], Lamu:[4100,4900], "Taita Taveta":[3100,3900],
        Garissa:[3600,4400], Wajir:[4300,5100], Mandera:[4800,5600],
        Marsabit:[4100,4900], Isiolo:[3100,3900], "Tharaka-Nithi":[2650,3350], Makueni:[2700,3400],
        Nyandarua:[2550,3250], Kirinyaga:[2450,3150], "Murang'a":[2450,3150],
        Turkana:[4900,5700], "West Pokot":[3400,4200], Samburu:[3500,4300], "Trans-Nzoia":[2900,3600],
        "Elgeyo-Marakwet":[2900,3600], Nandi:[2800,3500], Baringo:[3000,3700], Laikipia:[2900,3600],
        Kericho:[2800,3500], Bomet:[2900,3600], Vihiga:[2800,3500], Busia:[2900,3600],
        Siaya:[2800,3500], "Homa Bay":[3000,3700], Migori:[3100,3800], Nyamira:[2900,3600],
    },
    "Building Sand": {
        Nairobi:[3200,4200], Kiambu:[2900,3900], Mombasa:[3800,4800], Nakuru:[3000,4000], Kisumu:[3200,4200], Machakos:[3000,4000], Eldoret:[3100,4100], Nyeri:[3000,4000],
        Meru:[2950,3950], Embu:[2900,3900], Kisii:[3300,4300], Kakamega:[3200,4200], Bungoma:[3200,4200], Kitui:[3000,4000], Kajiado:[3300,4300], Narok:[3500,4500],
        Kwale:[3900,4900], Kilifi:[3800,4800], "Tana River":[4300,5300], Lamu:[4800,5800], "Taita Taveta":[3700,4700],
        Garissa:[4300,5300], Wajir:[5100,6100], Mandera:[5600,6600],
        Marsabit:[4800,5800], Isiolo:[3600,4600], "Tharaka-Nithi":[2950,3950], Makueni:[3000,4000],
        Nyandarua:[2900,3900], Kirinyaga:[2800,3800], "Murang'a":[2800,3800],
        Turkana:[5700,6700], "West Pokot":[4100,5100], Samburu:[4300,5300], "Trans-Nzoia":[3300,4300],
        "Elgeyo-Marakwet":[3300,4300], Nandi:[3200,4200], Baringo:[3400,4400], Laikipia:[3300,4300],
        Kericho:[3200,4200], Bomet:[3300,4300], Vihiga:[3200,4200], Busia:[3300,4300],
        Siaya:[3200,4200], "Homa Bay":[3400,4400], Migori:[3500,4500], Nyamira:[3300,4300],
    },
    // ─── Timber & Roofing ─────────────────────────────────────────────────────
    "3x2 Timber (12ft)": {
        Nairobi:[420,520], Kiambu:[400,500], Mombasa:[460,560], Nakuru:[410,510], Kisumu:[420,520], Machakos:[410,510], Eldoret:[415,515], Nyeri:[410,510],
        Meru:[408,508], Embu:[405,505], Kisii:[422,522], Kakamega:[418,518], Bungoma:[420,520], Kitui:[410,510], Kajiado:[425,525], Narok:[440,540],
        Kwale:[472,572], Kilifi:[468,568], "Tana River":[490,590], Lamu:[515,615], "Taita Taveta":[462,562],
        Garissa:[490,590], Wajir:[525,625], Mandera:[555,655],
        Marsabit:[518,618], Isiolo:[445,545], "Tharaka-Nithi":[408,508], Makueni:[410,510],
        Nyandarua:[404,504], Kirinyaga:[401,501], "Murang'a":[400,500],
        Turkana:[562,662], "West Pokot":[476,576], Samburu:[484,584], "Trans-Nzoia":[422,522],
        "Elgeyo-Marakwet":[425,525], Nandi:[420,520], Baringo:[432,532], Laikipia:[422,522],
        Kericho:[418,518], Bomet:[422,522], Vihiga:[420,520], Busia:[421,521],
        Siaya:[418,518], "Homa Bay":[425,525], Migori:[430,530], Nyamira:[421,521],
    },
    "2x2 Timber (12ft)": {
        Nairobi:[280,360], Kiambu:[270,350], Mombasa:[310,390], Nakuru:[275,355], Kisumu:[280,360], Machakos:[275,355], Eldoret:[278,358], Nyeri:[275,355],
        Meru:[273,353], Embu:[271,351], Kisii:[282,362], Kakamega:[280,360], Bungoma:[280,360], Kitui:[275,355], Kajiado:[285,365], Narok:[295,375],
        Kwale:[318,398], Kilifi:[315,395], "Tana River":[330,410], Lamu:[345,425], "Taita Taveta":[312,392],
        Garissa:[330,410], Wajir:[350,430], Mandera:[368,448],
        Marsabit:[348,428], Isiolo:[298,378], "Tharaka-Nithi":[273,353], Makueni:[275,355],
        Nyandarua:[271,351], Kirinyaga:[269,349], "Murang'a":[268,348],
        Turkana:[372,452], "West Pokot":[320,400], Samburu:[325,405], "Trans-Nzoia":[282,362],
        "Elgeyo-Marakwet":[284,364], Nandi:[280,360], Baringo:[288,368], Laikipia:[282,362],
        Kericho:[280,360], Bomet:[282,362], Vihiga:[280,360], Busia:[281,361],
        Siaya:[280,360], "Homa Bay":[284,364], Migori:[287,367], Nyamira:[281,361],
    },
    "4x2 Timber (12ft)": {
        Nairobi:[580,720], Kiambu:[560,700], Mombasa:[630,780], Nakuru:[570,710], Kisumu:[580,720], Machakos:[570,710], Eldoret:[575,715], Nyeri:[570,710],
        Meru:[568,708], Embu:[564,704], Kisii:[582,722], Kakamega:[578,718], Bungoma:[580,720], Kitui:[570,710], Kajiado:[588,728], Narok:[610,750],
        Kwale:[645,785], Kilifi:[638,778], "Tana River":[668,808], Lamu:[698,838], "Taita Taveta":[632,772],
        Garissa:[668,808], Wajir:[710,850], Mandera:[748,888],
        Marsabit:[704,844], Isiolo:[615,755], "Tharaka-Nithi":[568,708], Makueni:[570,710],
        Nyandarua:[564,704], Kirinyaga:[561,701], "Murang'a":[560,700],
        Turkana:[755,895], "West Pokot":[650,790], Samburu:[660,800], "Trans-Nzoia":[582,722],
        "Elgeyo-Marakwet":[585,725], Nandi:[580,720], Baringo:[592,732], Laikipia:[582,722],
        Kericho:[578,718], Bomet:[582,722], Vihiga:[580,720], Busia:[581,721],
        Siaya:[578,718], "Homa Bay":[585,725], Migori:[590,730], Nyamira:[581,721],
    },
    "Marine Plywood (18mm)": {
        Nairobi:[3200,3800], Kiambu:[3000,3600], Mombasa:[3500,4200], Nakuru:[3100,3700], Kisumu:[3200,3800], Machakos:[3100,3700], Eldoret:[3200,3800], Nyeri:[3100,3700],
        Meru:[3080,3680], Embu:[3050,3650], Kisii:[3220,3820], Kakamega:[3200,3800], Bungoma:[3200,3800], Kitui:[3100,3700], Kajiado:[3250,3850], Narok:[3380,3980],
        Kwale:[3590,4190], Kilifi:[3560,4160], "Tana River":[3710,4310], Lamu:[3880,4480], "Taita Taveta":[3530,4130],
        Garissa:[3710,4310], Wajir:[3940,4540], Mandera:[4140,4740],
        Marsabit:[3912,4512], Isiolo:[3420,4020], "Tharaka-Nithi":[3080,3680], Makueni:[3100,3700],
        Nyandarua:[3050,3650], Kirinyaga:[3030,3630], "Murang'a":[3020,3620],
        Turkana:[4182,4782], "West Pokot":[3610,4210], Samburu:[3670,4270], "Trans-Nzoia":[3222,3822],
        "Elgeyo-Marakwet":[3230,3830], Nandi:[3210,3810], Baringo:[3280,3880], Laikipia:[3225,3825],
        Kericho:[3205,3805], Bomet:[3222,3822], Vihiga:[3210,3810], Busia:[3215,3815],
        Siaya:[3205,3805], "Homa Bay":[3235,3835], Migori:[3258,3858], Nyamira:[3215,3815],
    },
    "Fascia Board (4m)": {
        Nairobi:[380,480], Kiambu:[360,460], Mombasa:[420,520], Nakuru:[370,470], Kisumu:[380,480], Machakos:[370,470], Eldoret:[375,475], Nyeri:[370,470],
        Meru:[372,472], Embu:[368,468], Kisii:[382,482], Kakamega:[378,478], Bungoma:[380,480], Kitui:[370,470], Kajiado:[385,485], Narok:[400,500],
        Kwale:[430,530], Kilifi:[425,525], "Tana River":[450,550], Lamu:[480,580], "Taita Taveta":[420,520],
        Garissa:[450,550], Wajir:[490,590], Mandera:[520,620],
        Marsabit:[475,575], Isiolo:[405,505], "Tharaka-Nithi":[372,472], Makueni:[370,470],
        Nyandarua:[368,468], Kirinyaga:[365,465], "Murang'a":[365,465],
        Turkana:[525,625], "West Pokot":[432,532], Samburu:[440,540], "Trans-Nzoia":[382,482],
        "Elgeyo-Marakwet":[384,484], Nandi:[380,480], Baringo:[392,492], Laikipia:[382,482],
        Kericho:[378,478], Bomet:[382,482], Vihiga:[380,480], Busia:[382,482],
        Siaya:[378,478], "Homa Bay":[385,485], Migori:[390,490], Nyamira:[382,482],
    },
    "Ridging (8ft)": {
        Nairobi:[420,520], Kiambu:[430,530], Mombasa:[460,560], Nakuru:[435,535], Kisumu:[440,540], Machakos:[435,535], Eldoret:[440,540], Nyeri:[435,535],
        Meru:[437,537], Embu:[434,534], Kisii:[442,542], Kakamega:[440,540], Bungoma:[441,541], Kitui:[435,535], Kajiado:[428,528], Narok:[458,558],
        Kwale:[472,572], Kilifi:[468,568], "Tana River":[488,588], Lamu:[508,608], "Taita Taveta":[465,565],
        Garissa:[488,588], Wajir:[520,620], Mandera:[545,645],
        Marsabit:[512,612], Isiolo:[462,562], "Tharaka-Nithi":[437,537], Makueni:[434,534],
        Nyandarua:[434,534], Kirinyaga:[432,532], "Murang'a":[431,531],
        Turkana:[552,652], "West Pokot":[475,575], Samburu:[482,582], "Trans-Nzoia":[442,542],
        "Elgeyo-Marakwet":[444,544], Nandi:[440,540], Baringo:[450,550], Laikipia:[442,542],
        Kericho:[439,539], Bomet:[442,542], Vihiga:[440,540], Busia:[441,541],
        Siaya:[439,539], "Homa Bay":[445,545], Migori:[448,548], Nyamira:[441,541],
    },
    // ─── Finishes & Paint ─────────────────────────────────────────────────────
    "Crown Wall Paint 20L": {
        Nairobi:[3800,4500], Kiambu:[3900,4600], Mombasa:[4200,4900], Nakuru:[3950,4650], Kisumu:[4000,4700], Machakos:[3950,4650], Eldoret:[4000,4700], Nyeri:[3950,4650],
        Meru:[3960,4660], Embu:[3950,4650], Kisii:[4010,4710], Kakamega:[4000,4700], Bungoma:[4005,4705], Kitui:[3955,4655], Kajiado:[3840,4540], Narok:[4150,4850],
        Kwale:[4290,4990], Kilifi:[4260,4960], "Tana River":[4420,5120], Lamu:[4580,5280], "Taita Taveta":[4230,4930],
        Garissa:[4420,5120], Wajir:[4680,5380], Mandera:[4900,5600],
        Marsabit:[4640,5340], Isiolo:[4180,4880], "Tharaka-Nithi":[3960,4660], Makueni:[3952,4652],
        Nyandarua:[3950,4650], Kirinyaga:[3945,4645], "Murang'a":[3942,4642],
        Turkana:[4952,5652], "West Pokot":[4305,5005], Samburu:[4380,5080], "Trans-Nzoia":[4010,4710],
        "Elgeyo-Marakwet":[4020,4720], Nandi:[4005,4705], Baringo:[4068,4768], Laikipia:[4015,4715],
        Kericho:[3998,4698], Bomet:[4010,4710], Vihiga:[4005,4705], Busia:[4008,4708],
        Siaya:[3998,4698], "Homa Bay":[4025,4725], Migori:[4042,4742], Nyamira:[4008,4708],
    },
    "Sadolin Floor Paint 20L": {
        Nairobi:[4500,5500], Kiambu:[4600,5600], Mombasa:[5000,6000], Nakuru:[4700,5700], Kisumu:[4750,5750], Machakos:[4700,5700], Eldoret:[4750,5750], Nyeri:[4700,5700],
        Meru:[4720,5720], Embu:[4708,5708], Kisii:[4760,5760], Kakamega:[4752,5752], Bungoma:[4755,5755], Kitui:[4705,5705], Kajiado:[4545,5545], Narok:[4920,5920],
        Kwale:[5100,6100], Kilifi:[5060,6060], "Tana River":[5250,6250], Lamu:[5440,6440], "Taita Taveta":[5020,6020],
        Garissa:[5250,6250], Wajir:[5560,6560], Mandera:[5820,6820],
        Marsabit:[5510,6510], Isiolo:[4960,5960], "Tharaka-Nithi":[4720,5720], Makueni:[4706,5706],
        Nyandarua:[4708,5708], Kirinyaga:[4702,5702], "Murang'a":[4699,5699],
        Turkana:[5882,6882], "West Pokot":[5120,6120], Samburu:[5202,6202], "Trans-Nzoia":[4762,5762],
        "Elgeyo-Marakwet":[4775,5775], Nandi:[4758,5758], Baringo:[4835,5835], Laikipia:[4768,5768],
        Kericho:[4752,5752], Bomet:[4762,5762], Vihiga:[4758,5758], Busia:[4760,5760],
        Siaya:[4752,5752], "Homa Bay":[4780,5780], Migori:[4805,5805], Nyamira:[4760,5760],
    },
    "Tile Adhesive 20kg": {
        Nairobi:[580,720], Kiambu:[600,740], Mombasa:[640,780], Nakuru:[610,750], Kisumu:[620,760], Machakos:[610,750], Eldoret:[620,760], Nyeri:[610,750],
        Meru:[612,752], Embu:[608,748], Kisii:[622,762], Kakamega:[620,760], Bungoma:[620,760], Kitui:[610,750], Kajiado:[588,728], Narok:[640,780],
        Kwale:[658,798], Kilifi:[652,792], "Tana River":[678,818], Lamu:[704,844], "Taita Taveta":[648,788],
        Garissa:[678,818], Wajir:[720,860], Mandera:[755,895],
        Marsabit:[712,852], Isiolo:[645,785], "Tharaka-Nithi":[612,752], Makueni:[609,749],
        Nyandarua:[608,748], Kirinyaga:[605,745], "Murang'a":[603,743],
        Turkana:[762,902], "West Pokot":[662,802], Samburu:[672,812], "Trans-Nzoia":[622,762],
        "Elgeyo-Marakwet":[625,765], Nandi:[620,760], Baringo:[632,772], Laikipia:[622,762],
        Kericho:[619,759], Bomet:[622,762], Vihiga:[620,760], Busia:[621,761],
        Siaya:[619,759], "Homa Bay":[625,765], Migori:[630,770], Nyamira:[621,761],
    },
    "Tiles 60x60cm (Ceramic)": {
        Nairobi:[1800,2800], Kiambu:[1900,2900], Mombasa:[2100,3100], Nakuru:[1950,2950], Kisumu:[2000,3000], Machakos:[1950,2950], Eldoret:[2000,3000], Nyeri:[1950,2950],
        Meru:[1960,2960], Embu:[1952,2952], Kisii:[2010,3010], Kakamega:[2002,3002], Bungoma:[2005,3005], Kitui:[1955,2955], Kajiado:[1836,2836], Narok:[2080,3080],
        Kwale:[2142,3142], Kilifi:[2124,3124], "Tana River":[2208,3208], Lamu:[2288,3288], "Taita Taveta":[2106,3106],
        Garissa:[2208,3208], Wajir:[2340,3340], Mandera:[2450,3450],
        Marsabit:[2318,3318], Isiolo:[2092,3092], "Tharaka-Nithi":[1960,2960], Makueni:[1953,2953],
        Nyandarua:[1952,2952], Kirinyaga:[1948,2948], "Murang'a":[1945,2945],
        Turkana:[2475,3475], "West Pokot":[2155,3155], Samburu:[2192,3192], "Trans-Nzoia":[2012,3012],
        "Elgeyo-Marakwet":[2020,3020], Nandi:[2005,3005], Baringo:[2042,3042], Laikipia:[2016,3016],
        Kericho:[2002,3002], Bomet:[2012,3012], Vihiga:[2005,3005], Busia:[2008,3008],
        Siaya:[2002,3002], "Homa Bay":[2025,3025], Migori:[2042,3042], Nyamira:[2008,3008],
    },
    "Tiles 30x30cm (Anti-slip)": {
        Nairobi:[1200,1800], Kiambu:[1250,1850], Mombasa:[1400,2000], Nakuru:[1280,1880], Kisumu:[1300,1900], Machakos:[1280,1880], Eldoret:[1300,1900], Nyeri:[1280,1880],
        Meru:[1285,1885], Embu:[1278,1878], Kisii:[1305,1905], Kakamega:[1302,1902], Bungoma:[1303,1903], Kitui:[1280,1880], Kajiado:[1212,1812], Narok:[1350,1950],
        Kwale:[1436,2036], Kilifi:[1422,2022], "Tana River":[1480,2080], Lamu:[1538,2138], "Taita Taveta":[1414,2014],
        Garissa:[1480,2080], Wajir:[1570,2170], Mandera:[1645,2245],
        Marsabit:[1556,2156], Isiolo:[1358,1958], "Tharaka-Nithi":[1285,1885], Makueni:[1278,1878],
        Nyandarua:[1278,1878], Kirinyaga:[1274,1874], "Murang'a":[1271,1871],
        Turkana:[1662,2262], "West Pokot":[1445,2045], Samburu:[1468,2068], "Trans-Nzoia":[1306,1906],
        "Elgeyo-Marakwet":[1310,1910], Nandi:[1303,1903], Baringo:[1328,1928], Laikipia:[1308,1908],
        Kericho:[1302,1902], Bomet:[1308,1908], Vihiga:[1305,1905], Busia:[1306,1906],
        Siaya:[1302,1902], "Homa Bay":[1315,1915], Migori:[1324,1924], Nyamira:[1306,1906],
    },
    "Waterproofing Compound 5L": {
        Nairobi:[1200,1600], Kiambu:[1250,1650], Mombasa:[1400,1800], Nakuru:[1280,1680], Kisumu:[1300,1700], Machakos:[1280,1680], Eldoret:[1300,1700], Nyeri:[1280,1680],
        Meru:[1285,1685], Embu:[1278,1678], Kisii:[1305,1705], Kakamega:[1302,1702], Bungoma:[1303,1703], Kitui:[1280,1680], Kajiado:[1212,1612], Narok:[1350,1750],
        Kwale:[1436,1836], Kilifi:[1422,1822], "Tana River":[1480,1880], Lamu:[1538,1938], "Taita Taveta":[1414,1814],
        Garissa:[1480,1880], Wajir:[1570,1970], Mandera:[1645,2045],
        Marsabit:[1556,1956], Isiolo:[1358,1758], "Tharaka-Nithi":[1285,1685], Makueni:[1278,1678],
        Nyandarua:[1278,1678], Kirinyaga:[1274,1674], "Murang'a":[1271,1671],
        Turkana:[1662,2062], "West Pokot":[1445,1845], Samburu:[1468,1868], "Trans-Nzoia":[1306,1706],
        "Elgeyo-Marakwet":[1310,1710], Nandi:[1303,1703], Baringo:[1328,1728], Laikipia:[1308,1708],
        Kericho:[1302,1702], Bomet:[1308,1708], Vihiga:[1305,1705], Busia:[1306,1706],
        Siaya:[1302,1702], "Homa Bay":[1315,1715], Migori:[1324,1724], Nyamira:[1306,1706],
    },
    "Skim Coat / Finishing Plaster": {
        Nairobi:[680,880], Kiambu:[700,900], Mombasa:[760,960], Nakuru:[710,910], Kisumu:[720,920], Machakos:[710,910], Eldoret:[720,920], Nyeri:[710,910],
        Meru:[712,912], Embu:[708,908], Kisii:[722,922], Kakamega:[720,920], Bungoma:[720,920], Kitui:[710,910], Kajiado:[688,888], Narok:[748,948],
        Kwale:[778,978], Kilifi:[771,971], "Tana River":[800,1000], Lamu:[830,1030], "Taita Taveta":[764,964],
        Garissa:[800,1000], Wajir:[848,1048], Mandera:[888,1088],
        Marsabit:[840,1040], Isiolo:[752,952], "Tharaka-Nithi":[712,912], Makueni:[709,909],
        Nyandarua:[708,908], Kirinyaga:[706,906], "Murang'a":[704,904],
        Turkana:[898,1098], "West Pokot":[782,982], Samburu:[795,995], "Trans-Nzoia":[722,922],
        "Elgeyo-Marakwet":[724,924], Nandi:[720,920], Baringo:[732,932], Laikipia:[722,922],
        Kericho:[719,919], Bomet:[722,922], Vihiga:[720,920], Busia:[721,921],
        Siaya:[719,919], "Homa Bay":[725,925], Migori:[730,930], Nyamira:[721,921],
    },
    // ─── Hardware & Fixings ───────────────────────────────────────────────────
    "PVC Pipe 4 inch (6m)": {
        Nairobi:[1400,1800], Kiambu:[1450,1850], Mombasa:[1600,2000], Nakuru:[1480,1880], Kisumu:[1500,1900], Machakos:[1480,1880], Eldoret:[1500,1900], Nyeri:[1480,1880],
        Meru:[1488,1888], Embu:[1482,1882], Kisii:[1505,1905], Kakamega:[1502,1902], Bungoma:[1503,1903], Kitui:[1481,1881], Kaikiado:[1414,1814], Narok:[1560,1960],
        Kwale:[1640,2040], Kilifi:[1628,2028], "Tana River":[1690,2090], Lamu:[1755,2155], "Taita Taveta":[1618,2018],
        Garissa:[1690,2090], Wajir:[1795,2195], Mandera:[1882,2282],
        Marsabit:[1778,2178], Isiolo:[1568,1968], "Tharaka-Nithi":[1488,1888], Makueni:[1480,1880],
        Nyandarua:[1482,1882], Kirinyaga:[1478,1878], "Murang'a":[1475,1875],
        Turkana:[1902,2302], "West Pokot":[1652,2052], Samburu:[1678,2078], "Trans-Nzoia":[1508,1908],
        "Elgeyo-Marakwet":[1512,1912], Nandi:[1505,1905], Baringo:[1530,1930], Laikipia:[1510,1910],
        Kericho:[1502,1902], Bomet:[1508,1908], Vihiga:[1505,1905], Busia:[1506,1906],
        Siaya:[1502,1902], "Homa Bay":[1515,1915], Migori:[1525,1925], Nyamira:[1506,1906],
    },
    "GI Pipe 1 inch (6m)": {
        Nairobi:[1200,1600], Kiambu:[1250,1650], Mombasa:[1400,1800], Nakuru:[1280,1680], Kisumu:[1300,1700], Machakos:[1280,1680], Eldoret:[1300,1700], Nyeri:[1280,1680],
        Meru:[1285,1685], Embu:[1278,1678], Kisii:[1305,1705], Kakamega:[1302,1702], Bungoma:[1303,1703], Kitui:[1280,1680], Kajiado:[1212,1612], Narok:[1350,1750],
        Kwale:[1436,1836], Kilifi:[1422,1822], "Tana River":[1480,1880], Lamu:[1538,1938], "Taita Taveta":[1414,1814],
        Garissa:[1480,1880], Wajir:[1570,1970], Mandera:[1645,2045],
        Marsabit:[1556,1956], Isiolo:[1358,1758], "Tharaka-Nithi":[1285,1685], Makueni:[1278,1678],
        Nyandarua:[1278,1678], Kirinyaga:[1274,1674], "Murang'a":[1271,1671],
        Turkana:[1662,2062], "West Pokot":[1445,1845], Samburu:[1468,1868], "Trans-Nzoia":[1306,1706],
        "Elgeyo-Marakwet":[1310,1710], Nandi:[1303,1703], Baringo:[1328,1728], Laikipia:[1308,1708],
        Kericho:[1302,1702], Bomet:[1308,1708], Vihiga:[1305,1705], Busia:[1306,1706],
        Siaya:[1302,1702], "Homa Bay":[1315,1715], Migori:[1324,1724], Nyamira:[1306,1706],
    },
    "PPR Pipe 20mm (4m)": {
        Nairobi:[380,520], Kiambu:[390,530], Mombasa:[430,570], Nakuru:[395,535], Kisumu:[400,540], Machakos:[395,535], Eldoret:[400,540], Nyeri:[395,535],
        Meru:[396,536], Embu:[393,533], Kisii:[402,542], Kakamega:[400,540], Bungoma:[401,541], Kitui:[395,535], Kajiado:[384,524], Narok:[416,556],
        Kwale:[442,582], Kilifi:[438,578], "Tana River":[456,596], Lamu:[474,614], "Taita Taveta":[435,575],
        Garissa:[456,596], Wajir:[486,626], Mandera:[510,650],
        Marsabit:[480,620], Isiolo:[420,560], "Tharaka-Nithi":[396,536], Makueni:[393,533],
        Nyandarua:[393,533], Kirinyaga:[391,531], "Murang'a":[390,530],
        Turkana:[516,656], "West Pokot":[446,586], Samburu:[453,593], "Trans-Nzoia":[402,542],
        "Elgeyo-Marakwet":[404,544], Nandi:[400,540], Baringo:[409,549], Laikipia:[402,542],
        Kericho:[399,539], Bomet:[402,542], Vihiga:[400,540], Busia:[401,541],
        Siaya:[399,539], "Homa Bay":[404,544], Migori:[407,547], Nyamira:[401,541],
    },
    "Door Hinges 4 inch (pair)": {
        Nairobi:[180,260], Kiambu:[185,265], Mombasa:[200,280], Nakuru:[185,265], Kisumu:[190,270], Machakos:[185,265], Eldoret:[190,270], Nyeri:[185,265],
        Meru:[186,266], Embu:[184,264], Kisii:[191,271], Kakamega:[190,270], Bungoma:[190,270], Kitui:[185,265], Kajiado:[182,262], Narok:[196,276],
        Kwale:[206,286], Kilifi:[204,284], "Tana River":[213,293], Lamu:[222,302], "Taita Taveta":[202,282],
        Garissa:[213,293], Wajir:[226,306], Mandera:[237,317],
        Marsabit:[224,304], Isiolo:[198,278], "Tharaka-Nithi":[186,266], Makueni:[184,264],
        Nyandarua:[184,264], Kirinyaga:[183,263], "Murang'a":[183,263],
        Turkana:[240,320], "West Pokot":[208,288], Samburu:[211,291], "Trans-Nzoia":[191,271],
        "Elgeyo-Marakwet":[192,272], Nandi:[190,270], Baringo:[194,274], Laikipia:[191,271],
        Kericho:[190,270], Bomet:[191,271], Vihiga:[190,270], Busia:[191,271],
        Siaya:[190,270], "Homa Bay":[192,272], Migori:[194,274], Nyamira:[191,271],
    },
    "Padlock 60mm": {
        Nairobi:[650,950], Kiambu:[670,970], Mombasa:[750,1050], Nakuru:[680,980], Kisumu:[700,1000], Machakos:[680,980], Eldoret:[700,1000], Nyeri:[680,980],
        Meru:[685,985], Embu:[680,980], Kisii:[705,1005], Kakamega:[702,1002], Bungoma:[703,1003], Kitui:[681,981], Kajiado:[656,956], Narok:[730,1030],
        Kwale:[768,1068], Kilifi:[761,1061], "Tana River":[792,1092], Lamu:[824,1124], "Taita Taveta":[755,1055],
        Garissa:[792,1092], Wajir:[840,1140], Mandera:[882,1182],
        Marsabit:[832,1132], Isiolo:[738,1038], "Tharaka-Nithi":[685,985], Makueni:[680,980],
        Nyandarua:[680,980], Kirinyaga:[677,977], "Murang'a":[675,975],
        Turkana:[890,1190], "West Pokot":[774,1074], Samburu:[787,1087], "Trans-Nzoia":[706,1006],
        "Elgeyo-Marakwet":[709,1009], Nandi:[703,1003], Baringo:[718,1018], Laikipia:[707,1007],
        Kericho:[702,1002], Bomet:[706,1006], Vihiga:[703,1003], Busia:[705,1005],
        Siaya:[702,1002], "Homa Bay":[710,1010], Migori:[715,1015], Nyamira:[705,1005],
    },
    "Electrical Cable 2.5mm (50m)": {
        Nairobi:[3800,4800], Kiambu:[3900,4900], Mombasa:[4200,5200], Nakuru:[3950,4950], Kisumu:[4000,5000], Machakos:[3950,4950], Eldoret:[4000,5000], Nyeri:[3950,4950],
        Meru:[3960,4960], Embu:[3952,4952], Kisii:[4010,5010], Kakamega:[4002,5002], Bungoma:[4005,5005], Kitui:[3952,4952], Kajiado:[3840,4840], Narok:[4160,5160],
        Kwale:[4284,5284], Kilifi:[4254,5254], "Tana River":[4416,5416], Lamu:[4578,5578], "Taita Taveta":[4224,5224],
        Garissa:[4416,5416], Wajir:[4680,5680], Mandera:[4900,5900],
        Marsabit:[4640,5640], Isiolo:[4180,5180], "Tharaka-Nithi":[3960,4960], Makueni:[3952,4952],
        Nyandarua:[3952,4952], Kirinyaga:[3947,4947], "Murang'a":[3944,4944],
        Turkana:[4952,5952], "West Pokot":[4305,5305], Samburu:[4380,5380], "Trans-Nzoia":[4012,5012],
        "Elgeyo-Marakwet":[4020,5020], Nandi:[4005,5005], Baringo:[4070,5070], Laikipia:[4015,5015],
        Kericho:[4002,5002], Bomet:[4012,5012], Vihiga:[4005,5005], Busia:[4008,5008],
        Siaya:[4002,5002], "Homa Bay":[4028,5028], Migori:[4045,5045], Nyamira:[4008,5008],
    },
    "MCB Circuit Breaker 20A": {
        Nairobi:[380,520], Kiambu:[390,530], Mombasa:[430,570], Nakuru:[395,535], Kisumu:[400,540], Machakos:[395,535], Eldoret:[400,540], Nyeri:[395,535],
        Meru:[396,536], Embu:[393,533], Kisii:[402,542], Kakamega:[400,540], Bungoma:[401,541], Kitui:[395,535], Kajiado:[384,524], Narok:[416,556],
        Kwale:[442,582], Kilifi:[438,578], "Tana River":[456,596], Lamu:[474,614], "Taita Taveta":[435,575],
        Garissa:[456,596], Wajir:[486,626], Mandera:[510,650],
        Marsabit:[480,620], Isiolo:[420,560], "Tharaka-Nithi":[396,536], Makueni:[393,533],
        Nyandarua:[393,533], Kirinyaga:[391,531], "Murang'a":[390,530],
        Turkana:[516,656], "West Pokot":[446,586], Samburu:[453,593], "Trans-Nzoia":[402,542],
        "Elgeyo-Marakwet":[404,544], Nandi:[400,540], Baringo:[409,549], Laikipia:[402,542],
        Kericho:[399,539], Bomet:[402,542], Vihiga:[400,540], Busia:[401,541],
        Siaya:[399,539], "Homa Bay":[404,544], Migori:[407,547], Nyamira:[401,541],
    },
};

function mid(r: PriceRange) { return Math.round((r[0] + r[1]) / 2); }
function trend(): "UP" | "DOWN" | "STABLE" { const n = Math.random(); return n < 0.25 ? "UP" : n < 0.45 ? "DOWN" : "STABLE"; }
function ago(days: number) { return new Date(Date.now() - days * 86_400_000); }

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log("🌱 GRUTH v2 seed starting...\n");

    // 1. Users
    console.log("👤 Users...");
    const hash = await bcrypt.hash("demo1234", 12);

    const admin = await prisma.user.upsert({
        where:  { email: "admin@gruth.ke" },
        update: { role: "ADMIN" },
        create: { email: "admin@gruth.ke", name: "GRUTH Admin", passwordHash: hash, role: "ADMIN", country: "KE" },
    });

    const client = await prisma.user.upsert({
        where:  { email: "demo@groundtruth.ke" },
        update: {},
        create: {
            email: "demo@groundtruth.ke", name: "James Mwangi", passwordHash: hash,
            role: "CLIENT", phone: "+447700900123", whatsapp: "+447700900123", country: "GB",
        },
    });

    const inspector = await prisma.user.upsert({
        where:  { email: "inspector@gruth.ke" },
        update: { role: "INSPECTOR" },
        create: {
            email: "inspector@gruth.ke", name: "Daniel Ochieng", passwordHash: hash,
            role: "INSPECTOR", phone: "+254712000001", whatsapp: "+254712000001", country: "KE",
            bio: "Civil engineer with 8 years site experience across Nairobi, Kiambu and Central Kenya. Specialist in construction verification, structural assessments and title deed due diligence.",
        },
    });

    console.log("  ✓ admin@gruth.ke        (ADMIN)");
    console.log("  ✓ demo@groundtruth.ke   (CLIENT)");
    console.log("  ✓ inspector@gruth.ke    (INSPECTOR)");

    // 2. Projects (with inspectorId assigned)
    console.log("\n📁 Projects...");

    const p1 = await prisma.project.upsert({
        where: { id: "demo-p1" }, update: {},
        create: {
            id: "demo-p1", name: "Ruiru Family Home", type: "CONSTRUCTION",
            location: "Ruiru, Kiambu County", county: "Kiambu",
            latitude: -1.1456, longitude: 36.9615,
            status: "ACTIVE", estimatedBudget: 4_500_000, amountSpent: 2_100_000, currency: "KES",
            description: "3-bedroom bungalow. Ring beam completed, wall raising in progress.",
            clientId: client.id, inspectorId: inspector.id, startDate: ago(90),
        },
    });

    const p2 = await prisma.project.upsert({
        where: { id: "demo-p2" }, update: {},
        create: {
            id: "demo-p2", name: "Kiambu Road Plot Verification", type: "LAND_PROPERTY",
            location: "Kiambu Road, Nairobi", county: "Nairobi",
            latitude: -1.2297, longitude: 36.7720,
            status: "PENDING",
            description: "Title deed authenticity and survey check before purchase.",
            clientId: client.id, inspectorId: inspector.id, startDate: ago(14),
        },
    });

    const p3 = await prisma.project.upsert({
        where: { id: "demo-p3" }, update: {},
        create: {
            id: "demo-p3", name: "Westlands Office Fit-out", type: "BUSINESS_INVESTMENT",
            location: "Westlands, Nairobi", county: "Nairobi",
            status: "COMPLETED", estimatedBudget: 1_200_000, amountSpent: 1_180_000, currency: "KES",
            description: "Contractor performance monitoring for office fit-out.",
            clientId: client.id, inspectorId: inspector.id,
            startDate: ago(180), endDate: ago(30),
            reportFileUrl: "https://storage.gruth.ke/reports/westlands-office-final.pdf",
            reportPublishedAt: ago(30),
        },
    });

    console.log("  ✓ 3 demo projects (all assigned to Daniel Ochieng)");

    // 3. Progress stages
    console.log("\n📊 Progress stages...");
    await prisma.progressStage.createMany({
        skipDuplicates: true,
        data: [
            { id: "ps-1", projectId: p1.id, stageName: "Foundation",      order: 1, completed: true,  completedAt: ago(60)  },
            { id: "ps-2", projectId: p1.id, stageName: "Ring Beam",       order: 2, completed: true,  completedAt: ago(20)  },
            { id: "ps-3", projectId: p1.id, stageName: "Wall Raising",    order: 3, completed: false                         },
            { id: "ps-4", projectId: p1.id, stageName: "Roofing",         order: 4, completed: false                         },
            { id: "ps-5", projectId: p1.id, stageName: "Plastering",      order: 5, completed: false                         },
            { id: "ps-6", projectId: p1.id, stageName: "Finishing",       order: 6, completed: false                         },
            { id: "ps-7", projectId: p3.id, stageName: "Site Assessment", order: 1, completed: true,  completedAt: ago(170) },
            { id: "ps-8", projectId: p3.id, stageName: "Fit-out Work",    order: 2, completed: true,  completedAt: ago(60)  },
            { id: "ps-9", projectId: p3.id, stageName: "Final Sign-off",  order: 3, completed: true,  completedAt: ago(30)  },
        ],
    });
    console.log("  ✓ 9 stages");

    // 4. Inspections (with inspectorId FK)
    console.log("\n🔍 Inspections...");
    await prisma.inspection.createMany({
        skipDuplicates: true,
        data: [
            {
                id: "insp-1", projectId: p1.id, inspectorId: inspector.id,
                inspectorName: "Daniel Ochieng",
                scheduledDate: ago(20), completedDate: ago(20), status: "COMPLETED",
                summary: "Ring beam quality meets specification. One section marginally below minimum width — contractor has been advised to address before wall-raising continues.",
                observations: "Concrete curing satisfactory. Hairline cracks visible on eastern face — within acceptable tolerance. Rebar spacing on north wall slightly irregular (18cm instead of 15cm). All other structural elements meet spec.",
                recommendations: "1. Contractor must widen the sub-spec section by minimum 5cm before next pour.\n2. Increase rebar density on north wall to correct spacing.\n3. Apply waterproofing membrane to exposed ring beam before walls reach full height.",
                overallRating: 3,
                workQuality: "FAIR",
                safetyCompliance: true,
                nextSteps: "Re-inspect at 50% wall height. Estimated 2–3 weeks from today.",
            },
            {
                id: "insp-2", projectId: p1.id, inspectorId: inspector.id,
                inspectorName: "Daniel Ochieng",
                scheduledDate: ago(-5), status: "SCHEDULED",
            },
            {
                id: "insp-3", projectId: p2.id, inspectorId: inspector.id,
                inspectorName: "Daniel Ochieng",
                scheduledDate: ago(7), completedDate: ago(7), status: "COMPLETED",
                summary: "Physical beacons confirmed on-site. Plot dimensions match survey sheet. Awaiting land registry cross-check for title deed validation.",
                observations: "All 4 survey beacons present and undisturbed. No encroachments from neighbouring plots. Historical neighbour dispute on eastern boundary — flagged in records from 2019, appears resolved. Road access confirmed via public road.",
                recommendations: "Proceed with land registry cross-check. Request certified copy of search from Lands Registry Nairobi. Verify consent to transfer is endorsed.",
                overallRating: 4,
                workQuality: "GOOD",
                safetyCompliance: true,
                nextSteps: "Registry appointment confirmed. Inspector will attend and report within 24 hours of appointment.",
            },
            {
                id: "insp-4", projectId: p3.id, inspectorId: inspector.id,
                inspectorName: "Daniel Ochieng",
                scheduledDate: ago(35), completedDate: ago(35), status: "COMPLETED",
                summary: "Final sign-off complete. All fit-out works completed to satisfactory standard. Client can proceed with occupation.",
                observations: "Electrical installation meets Kenya Power standards. Plumbing pressure test passed. Tiling and flooring at commercial grade. Air conditioning units correctly installed. All snag items from previous inspection resolved.",
                recommendations: "Obtain completion certificate from Nairobi County. Retain all contractor warranties.",
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
                id: "med-1", inspectionId: "insp-1", type: "PHOTO", sortOrder: 1,
                url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
                filename: "ring-beam-overview.jpg",
                caption: "Ring beam overview — eastern face showing hairline cracks within tolerance",
            },
            {
                id: "med-2", inspectionId: "insp-1", type: "PHOTO", sortOrder: 2,
                url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800",
                filename: "rebar-spacing-north.jpg",
                caption: "North wall rebar — spacing at 18cm, should be 15cm. Flagged to contractor.",
            },
            {
                id: "med-3", inspectionId: "insp-1", type: "PHOTO", sortOrder: 3,
                url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
                filename: "foundation-east-corner.jpg",
                caption: "Foundation corner — adequate depth, DPC membrane correctly installed",
            },
            {
                id: "med-4", inspectionId: "insp-1", type: "PHOTO", sortOrder: 4,
                url: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800",
                filename: "subspec-section.jpg",
                caption: "Sub-spec section on south ring beam — width 200mm vs required 225mm",
            },
            {
                id: "med-5", inspectionId: "insp-3", type: "PHOTO", sortOrder: 1,
                url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
                filename: "plot-beacon-1.jpg",
                caption: "Survey beacon at NW corner — confirmed in place",
            },
            {
                id: "med-6", inspectionId: "insp-3", type: "PHOTO", sortOrder: 2,
                url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                filename: "plot-boundary-east.jpg",
                caption: "Eastern boundary — no encroachment confirmed",
            },
            {
                id: "med-7", inspectionId: "insp-4", type: "PHOTO", sortOrder: 1,
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
        where:  { id: "report-1" },
        update: {},
        create: {
            id: "report-1", inspectionId: "insp-4",
            title: "Final Inspection Report — Westlands Office Fit-out",
            summary: "All fit-out works completed to commercial standard. Safe for occupation. No outstanding issues.",
            content: `# GRUTH Verification Report
**Project:** Westlands Office Fit-out
**Inspector:** Daniel Ochieng
**Date:** ${ago(35).toLocaleDateString('en-GB')}

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
                id: "alert-1", projectId: p1.id, severity: "WARNING", isRead: false,
                title: "Wall thickness below specification",
                message: "South ring beam section measures 200mm vs required 225mm. Must be rectified before wall-raising continues. Contractor has been notified by inspector.",
                actionUrl: `/dashboard/projects/${p1.id}`,
            },
            {
                id: "alert-2", projectId: p2.id, severity: "INFO", isRead: false,
                title: "Registry appointment confirmed",
                message: "Land registry cross-check confirmed for next Tuesday. Inspector will attend and report within 24 hours.",
                actionUrl: `/dashboard/projects/${p2.id}`,
            },
            {
                id: "alert-3", projectId: p1.id, severity: "INFO", isRead: true, readAt: ago(2),
                title: "Material delivery delay",
                message: "Y12 rebar delivery delayed 5 days due to supplier shortage. Wall-raising may slip by one week. GRUTH monitoring situation.",
                actionUrl: `/dashboard/projects/${p1.id}`,
            },
            {
                id: "alert-4", projectId: p3.id, severity: "INFO", isRead: true, readAt: ago(28),
                title: "Final report published",
                message: "Your Westlands Office Fit-out inspection report is ready. All works certified complete — PDF download available.",
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
                id: "msg-1", projectId: p1.id, userId: client.id, senderId: admin.id,
                isFromClient: false, readAt: ago(19), createdAt: ago(20),
                content: "Hi James, your ring beam inspection is complete. Report uploaded. Overall good progress — one minor concern flagged on the south section. Please review the inspection report.",
            },
            {
                id: "msg-2", projectId: p1.id, userId: client.id, senderId: client.id,
                isFromClient: true, readAt: ago(19), createdAt: ago(19),
                content: "Thanks Daniel. I've reviewed the report. What does the wall thickness issue mean for the timeline exactly?",
            },
            {
                id: "msg-3", projectId: p1.id, userId: client.id, senderId: admin.id,
                isFromClient: false, readAt: null, createdAt: ago(18),
                content: "The contractor needs to rebuild that section to the correct width before raising walls further. Should take 1–2 days max and won't significantly affect the overall schedule. We'll verify the fix at the next inspection in about 2 weeks.",
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
                id: "mpq-1", projectId: p1.id, materialName: "Bamburi Cement 50kg", unit: "per bag",
                marketPriceLow: 680, marketPriceHigh: 720, quotedPrice: 750, status: "OVERPRICED",
                notes: "Contractor quoted KES 750. Market range KES 680–720. Negotiate down or source directly from Bamburi depot.",
            },
            {
                id: "mpq-2", projectId: p1.id, materialName: "Y12 Steel Rebar (6m)", unit: "per piece",
                marketPriceLow: 780, marketPriceHigh: 860, quotedPrice: 820, verifiedPrice: 820,
                status: "FAIR", notes: "Within acceptable market range. Inspector verified delivery quality.",
            },
            {
                id: "mpq-3", projectId: p1.id, materialName: "River Sand", unit: "per tonne",
                marketPriceLow: 3500, marketPriceHigh: 4500, quotedPrice: 3200, status: "GOOD_DEAL",
                notes: "Below market — contractor sourcing locally from Ruiru river. Verify quality on each delivery.",
            },
        ],
    });
    console.log("  ✓ 3 price quotes");

    // 10. County market prices (same as before)
    console.log("\n🏗️  County market prices...");
    const countyMap: Record<string, string> = {};
    for (const c of COUNTIES) {
        // Clear any existing county with this code (different name) to avoid
        // the unique constraint on `code` when re-seeding with corrected codes.
        await prisma.county.updateMany({
            where: { code: c.code, NOT: { name: c.name } },
            data:  { code: null },
        });
        const rec = await prisma.county.upsert({
            where:  { name: c.name },
            update: { code: c.code, region: c.region },   // fix stale codes
            create: { name: c.name, code: c.code, region: c.region },
        });
        countyMap[c.name] = rec.id;
    }
    const materialMap: Record<string, string> = {};
    for (const m of MARKET_MATERIALS) {
        const rec = await prisma.marketMaterial.upsert({
            where: { name: m.name }, update: {}, create: m,
        });
        materialMap[m.name] = rec.id;
    }
    const sourceMap: Record<string, string> = {};
    for (const [countyName, sources] of Object.entries(SOURCES_BY_COUNTY)) {
        for (const s of sources) {
            const rec = await prisma.marketPriceSource.upsert({
                where: { name: s.name }, update: {},
                create: { name: s.name, url: s.url ?? null, county: countyName, verified: s.name.startsWith("GRUTH") },
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
            const sourceId = primary ? (sourceMap[`${countyName}:${primary.name}`] ?? null) : null;
            await prisma.countyMaterialPrice.upsert({
                where: { materialId_countyId_sourceId: { materialId, countyId, sourceId: sourceId ?? "" } },
                update: { priceKes: mid(range), priceLow: range[0], priceHigh: range[1], trend: trend(), updatedAt: new Date() },
                create: { materialId, countyId, sourceId, priceKes: mid(range), priceLow: range[0], priceHigh: range[1], trend: trend() },
            });
            priceCount++;
        }
    }
    console.log(`  ✓ ${COUNTIES.length} counties, ${MARKET_MATERIALS.length} materials, ${priceCount} prices`);

    console.log("\n✅ Seed complete!\n");
    console.log("  Demo credentials (all password: demo1234)");
    console.log("  Admin:     admin@gruth.ke");
    console.log("  Client:    demo@groundtruth.ke");
    console.log("  Inspector: inspector@gruth.ke\n");
}

main()
    .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
    .finally(() => prisma.$disconnect());