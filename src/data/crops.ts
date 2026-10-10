export interface CropDefinition {
  key: string;
  name_hi: string;
  name_en: string;
  icon: string;
  commonDiseases: {
    key: string;
    name_hi: string;
    name_en: string;
  }[];
}

export const CROPS: CropDefinition[] = [
  {
    key: "wheat",
    name_hi: "गेहूं (Gehu)",
    name_en: "Wheat",
    icon: "🌾",
    commonDiseases: [
      { key: "leaf_rust", name_hi: "पत्ती का रतुआ (भूरा गेरुआ)", name_en: "Leaf Rust (Brown Rust)" },
      { key: "yellow_rust", name_hi: "पीला रतुआ (हल्दी रोग)", name_en: "Yellow Rust (Stripe Rust)" },
      { key: "powdery_mildew", name_hi: "चूर्णिल आसिता (सफेद फफूंद)", name_en: "Powdery Mildew" },
      { key: "karnal_bunt", name_hi: "करनाल बंट", name_en: "Karnal Bunt" },
      { key: "loose_smut", name_hi: "कंडुआ रोग", name_en: "Loose Smut" },
    ],
  },
  {
    key: "rice",
    name_hi: "धान / चावल (Dhan)",
    name_en: "Paddy / Rice",
    icon: "🌱",
    commonDiseases: [
      { key: "bacterial_leaf_blight", name_hi: "जीवाणु झुलसा (बैक्टीरियल ब्लाइट)", name_en: "Bacterial Leaf Blight" },
      { key: "sheath_blight", name_hi: "शीथ ब्लाइट (तने की सड़न)", name_en: "Sheath Blight" },
      { key: "blast", name_hi: "झोंका रोग (ब्लास्ट)", name_en: "Rice Blast" },
      { key: "brown_spot", name_hi: "भूरा धब्बा रोग (ब्राउन स्पॉट)", name_en: "Brown Spot" },
    ],
  },
  {
    key: "potato",
    name_hi: "आलू (Aloo)",
    name_en: "Potato",
    icon: "🥔",
    commonDiseases: [
      { key: "late_blight", name_hi: "पछेती झुलसा (लेट ब्लाइट)", name_en: "Late Blight" },
      { key: "early_blight", name_hi: "अगेती झुलसा (अर्ली ब्लाइट)", name_en: "Early Blight" },
      { key: "black_scurf", name_hi: "काली पपड़ी (ब्लैक स्कर्फ)", name_en: "Black Scurf" },
    ],
  },
  {
    key: "mustard",
    name_hi: "सरसों (Sarson)",
    name_en: "Mustard",
    icon: "🌼",
    commonDiseases: [
      { key: "white_rust", name_hi: "सफेद रतुआ (व्हाइट रस्ट)", name_en: "White Rust" },
      { key: "alternaria_blight", name_hi: "अल्टरनेरिया झुलसा", name_en: "Alternaria Blight" },
      { key: "downy_mildew", name_hi: "मृदुरोमिल आसिता", name_en: "Downy Mildew" },
    ],
  },
  {
    key: "sugarcane",
    name_hi: "गन्ना (Ganna)",
    name_en: "Sugarcane",
    icon: "🎋",
    commonDiseases: [
      { key: "red_rot", name_hi: "लाल सड़न (रेड रॉट)", name_en: "Red Rot" },
      { key: "smut", name_hi: "कंडुआ रोग", name_en: "Smut" },
      { key: "wilt", name_hi: "उकठा रोग (विल्ट)", name_en: "Wilt" },
    ],
  },
  {
    key: "tomato",
    name_hi: "टमाटर (Tamatar)",
    name_en: "Tomato",
    icon: "🍅",
    commonDiseases: [
      { key: "leaf_curl", name_hi: "पत्ती मरोड़ रोग (लीफ कर्ल)", name_en: "Leaf Curl Virus" },
      { key: "early_blight", name_hi: "अगेती झुलसा", name_en: "Early Blight" },
      { key: "bacterial_wilt", name_hi: "जीवाणु उकठा", name_en: "Bacterial Wilt" },
    ],
  },
  {
    key: "mango",
    name_hi: "आम (Aam)",
    name_en: "Mango",
    icon: "🥭",
    commonDiseases: [
      { key: "anthracnose", name_hi: "श्यामवर्ण (एंथ्रेक्नोज)", name_en: "Anthracnose" },
      { key: "powdery_mildew", name_hi: "चूर्णिल फफूंद", name_en: "Powdery Mildew" },
      { key: "dieback", name_hi: "डाईबैक (शाखा सुखना)", name_en: "Dieback" },
    ],
  },
];

export function getCropByKey(key: string): CropDefinition | undefined {
  const normalized = key.toLowerCase().trim();
  return CROPS.find((c) => c.key === normalized);
}

export function normalizeCropKey(raw: string): string {
  const clean = raw.toLowerCase().trim();
  if (clean.includes("wheat") || clean.includes("गेहूं") || clean.includes("gehu")) return "wheat";
  if (clean.includes("rice") || clean.includes("धान") || clean.includes("paddy") || clean.includes("चावल")) return "rice";
  if (clean.includes("potato") || clean.includes("आलू") || clean.includes("aloo")) return "potato";
  if (clean.includes("mustard") || clean.includes("सरसों") || clean.includes("sarson")) return "mustard";
  if (clean.includes("sugarcane") || clean.includes("गन्ना") || clean.includes("ganna")) return "sugarcane";
  if (clean.includes("tomato") || clean.includes("टमाटर")) return "tomato";
  if (clean.includes("mango") || clean.includes("आम")) return "mango";
  return clean.replace(/[^a-z0-9]/g, "_");
}
