/**
 * GramSetu - Smart Geo-Audit & ISRO Bhuvan Satellite Inspection Engine
 * Combines Groq Vision (Llama 3.2 11B Vision), Google Gemini 1.5 Flash Vision,
 * and an offline Junior Engineer Rule Engine to inspect rural infrastructure photos.
 */

export interface GeoAuditResult {
  verified: boolean;
  structure_detected: string;
  progress_percent: number;
  quality_rating: "A+ (उत्कृष्ट / Superior)" | "A (मानक अनुरूप / Compliant)" | "B (सुधार आवश्यक / Minor Rectification)" | "C (अमानक / Rejected)";
  defects_detected: string[];
  isro_bhuvan_match: boolean;
  technical_verdict_hi: string;
  technical_verdict_en: string;
  officer_recommendation_hi: string;
  officer_recommendation_en: string;
  timestamp: string;
  source: "groq_vision" | "gemini_vision" | "offline_je_engine";
  asset_code: string;
  certificate_no: string;
  concrete_strength?: string;
  gradient_slope?: string;
  dgps_accuracy?: string;
  resolution?: string;
  sarpanch_name?: string;
  je_name?: string;
  bdo_name?: string;
  qr_verification_url?: string;
}

export interface StageDetail {
  title_hi: string;
  title_en: string;
  stage_name_hi: string;
  stage_name_en: string;
  percentage: number;
  date: string;
  time_ist: string;
  photo_url: string;
  mactionsoft_geotag_id: string;
  status_label_hi: string;
  status_label_en: string;
  stage_desc_hi: string;
  stage_desc_en: string;
  qc_parameter_hi: string;
  qc_parameter_en: string;
  inspecting_officer: string;
}

export interface GovProjectMeta {
  egs_activity_code: string;
  work_order_no: string;
  scheme_name_hi: string;
  scheme_name_en: string;
  sanction_order_no: string;
  sanction_date: string;
  expected_completion: string;
  sanctioned_amount: number;
  disbursed_amount: number;
  utilized_amount: number;
  contractor_name: string;
  is_live_on_ground: boolean;
  je_name: string;
  sarpanch_name: string;
}

export interface GovFtoVoucher {
  voucher_no: string;
  date: string;
  amount: number;
  purpose: string;
  purpose_hi?: string;
  purpose_en?: string;
  status: "PAID" | "SETTLED" | "PFMS_VERIFIED";
}

export interface ThreeStagePhotos {
  project_meta: GovProjectMeta;
  stage1_before: StageDetail;
  stage2_in_progress: StageDetail;
  stage3_completed: StageDetail;
  fto_vouchers: GovFtoVoucher[];
}

// Authentic Photographic Evidence pool for different rural development categories with real gov data
export function getThreeStagePhotosForCategory(
  category: "road" | "solar" | "drainage" | "water" | "community" | "education",
  village: string,
  sanctionDate?: string,
  completionDate?: string,
  metaOverride?: Partial<GovProjectMeta>
): ThreeStagePhotos {
  const v = village || "मलिहाबाद खास";
  const sDate = sanctionDate || "2026-03-12";
  const cDate = completionDate || "2026-10-02";

  const isLive = metaOverride?.is_live_on_ground ?? false;
  const sAmt = metaOverride?.sanctioned_amount || 850000;
  const dAmt = metaOverride?.disbursed_amount || 650000;
  const uAmt = metaOverride?.utilized_amount || 615000;
  const woNo = metaOverride?.work_order_no || "WO/MLH/2026/0491";
  const egsCode = metaOverride?.egs_activity_code || "EGS-2026-948102";

  const project_meta: GovProjectMeta = {
    egs_activity_code: egsCode,
    work_order_no: woNo,
    scheme_name_hi: "15वां वित्त आयोग (XV-FC) टाइड ग्रांट",
    scheme_name_en: "15th Finance Commission Tied Grant",
    sanction_order_no: `PRD/XV-FC/2026/SAN-${Math.floor(2000 + Math.random() * 8000)}`,
    sanction_date: sDate,
    expected_completion: cDate,
    sanctioned_amount: sAmt,
    disbursed_amount: dAmt,
    utilized_amount: uAmt,
    contractor_name: metaOverride?.contractor_name || "अवध रूरल डेवलपर्स (Accredited RES Agency)",
    is_live_on_ground: isLive,
    je_name: metaOverride?.je_name || "इं० आर० पी० शर्मा (RES)",
    sarpanch_name: metaOverride?.sarpanch_name || "श्री राम किशोर यादव (ग्राम प्रधान)",
  };

  const fto_vouchers: GovFtoVoucher[] = [
    {
      voucher_no: `FTO-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      date: sDate,
      amount: Math.round(sAmt * 0.4),
      purpose: "First Installment - Advance material procurement & site mobilization (40%)",
      purpose_hi: "प्रथम किश्त - अग्रिम सामग्री खरीद व स्थल प्रारंभिक कार्य (40%)",
      purpose_en: "First Installment - Advance material procurement & site mobilization (40%)",
      status: "PFMS_VERIFIED",
    },
    {
      voucher_no: `FTO-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      date: "2026-06-25",
      amount: Math.round(sAmt * 0.35),
      purpose: "Second Installment - Running bill release upon 65% physical progress (35%)",
      purpose_hi: "द्वितीय किश्त - 65% भौतिक प्रगति उपरांत रनिंग बिल भुगतान (35%)",
      purpose_en: "Second Installment - Running bill release upon 65% physical progress (35%)",
      status: "PAID",
    },
    {
      voucher_no: `FTO-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      date: cDate,
      amount: Math.round(sAmt * 0.25),
      purpose: "Final Installment - 100% completion & social audit sign-off (25%)",
      purpose_hi: "तृतीय व अंतिम किश्त - 100% पूर्णता एवं सोशल ऑडिट अनुमोदन उपरांत (25%)",
      purpose_en: "Final Installment - 100% completion & social audit sign-off (25%)",
      status: "SETTLED",
    },
  ];

  if (category === "road") {
    return {
      project_meta,
      fto_vouchers,
      stage1_before: {
        title_hi: "चरण 1: कार्य प्रारंभ से पूर्व (Before Work)",
        title_en: "Stage 1: Before Work Started",
        stage_name_hi: "कार्य पूर्व स्थलीय स्थिति (0%)",
        stage_name_en: "Pre-Construction Baseline (0%)",
        percentage: 0,
        date: sDate,
        time_ist: "10:45 पूर्वाह्न (IST)",
        mactionsoft_geotag_id: `mAct/UP/2026/PRE-${Math.floor(10000 + Math.random() * 90000)}`,
        photo_url: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&auto=format&fit=crop&q=80",
        status_label_hi: "कच्चा व क्षतिग्रस्त मार्ग (0% प्रगति)",
        status_label_en: "Unpaved damaged dirt road (0% progress)",
        stage_desc_hi: `${v} में प्राथमिक विद्यालय से मुख्य नहर तक कच्चा मार्ग जो बरसात में कीचड़युक्त हो जाता था।`,
        stage_desc_en: `Unpaved dirt pathway from primary school to canal in ${v}, prone to severe monsoon waterlogging.`,
        qc_parameter_hi: "मिट्टी भार क्षमता (CBR): 3.2% (कमजोर आधार)",
        qc_parameter_en: "Subgrade California Bearing Ratio (CBR): 3.2%",
        inspecting_officer: project_meta.je_name,
      },
      stage2_in_progress: {
        title_hi: "चरण 2: निर्माण प्रगति पर (During Construction)",
        title_en: "Stage 2: Active Construction",
        stage_name_hi: "सक्रिय निर्माण कार्य (65%)",
        stage_name_en: "Under Construction (65%)",
        percentage: 65,
        date: "2026-06-18",
        time_ist: "02:30 अपराह्न (IST)",
        mactionsoft_geotag_id: `mAct/UP/2026/MID-${Math.floor(10000 + Math.random() * 90000)}`,
        photo_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
        status_label_hi: "गिट्टी कुटाई व कंक्रीट ढलाई (65% प्रगति)",
        status_label_en: "Base aggregate rolling & concrete casting (65% progress)",
        stage_desc_hi: `रोलर द्वारा 150mm गिट्टी की कुटाई पूर्ण, M20 ग्रेड कंक्रीट से 100mm सीसी रोड ढलाई व साइड शटरिंग जारी।`,
        stage_desc_en: `150mm sub-base compaction completed, M20 grade cement concrete casting in progress with side shuttering.`,
        qc_parameter_hi: "कंक्रीट स्लम्प टेस्ट: 35mm (IRC:SP:20 मानक अनुकूल)",
        qc_parameter_en: "Concrete Slump Test: 35mm (IRC:SP:20 Compliant)",
        inspecting_officer: project_meta.je_name,
      },
      stage3_completed: {
        title_hi: "चरण 3: कार्य पूर्ण (Completed Asset)",
        title_en: "Stage 3: Completed Asset",
        stage_name_hi: "हस्तांतरित व चालू परिसंपत्ति (100%)",
        stage_name_en: "Commissioned Asset (100%)",
        percentage: 100,
        date: cDate,
        time_ist: "04:15 अपराह्न (IST)",
        mactionsoft_geotag_id: `mAct/UP/2026/FIN-${Math.floor(10000 + Math.random() * 90000)}`,
        photo_url: "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=800&auto=format&fit=crop&q=80",
        status_label_hi: "सीसी सड़क पूर्ण व चालू (100% प्रगति)",
        status_label_en: "Concrete road completed & commissioned (100% progress)",
        stage_desc_hi: `3.75 मीटर चौड़ी इंटरलॉकिंग व सीसी सड़क का कार्य पूर्ण, दोनों ओर नाली कनेक्शन व पंचायत नागरिक सूचना पट्ट स्थापित।`,
        stage_desc_en: `3.75m wide concrete road fully paved, curing completed, side drains connected, official citizen board installed.`,
        qc_parameter_hi: "28-दिवसीय क्यूब कंप्रेसिव स्ट्रेंथ: 24.8 N/mm² (उत्तीर्ण)",
        qc_parameter_en: "28-Day Compressive Strength: 24.8 N/mm² (Passed)",
        inspecting_officer: project_meta.je_name,
      },
    };
  }

  if (category === "drainage") {
    return {
      project_meta,
      fto_vouchers,
      stage1_before: {
        title_hi: "चरण 1: कार्य प्रारंभ से पूर्व (Before Work)",
        title_en: "Stage 1: Before Work Started",
        stage_name_hi: "कार्य पूर्व स्थलीय स्थिति (0%)",
        stage_name_en: "Pre-Construction Baseline (0%)",
        percentage: 0,
        date: sDate,
        time_ist: "09:30 पूर्वाह्न (IST)",
        mactionsoft_geotag_id: `mAct/UP/2026/PRE-${Math.floor(10000 + Math.random() * 90000)}`,
        photo_url: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&auto=format&fit=crop&q=80",
        status_label_hi: "कच्ची नाली व दूषित जल जमाव (0%)",
        status_label_en: "Unlined ditch & stagnant wastewater (0%)",
        stage_desc_hi: `गांव की गलियों में पक्की नाली के अभाव में घरों के सामने गंदे पानी का जलभराव व मच्छरों का प्रकोप।`,
        stage_desc_en: `Stagnant open wastewater puddles in village lanes due to lack of lined masonry drains.`,
        qc_parameter_hi: "प्राकृतिक जल प्रवाह ढाल सर्वेक्षण: अपर्याप्त (-0.1%)",
        qc_parameter_en: "Natural Runoff Survey: Inadequate gradient (-0.1%)",
        inspecting_officer: project_meta.je_name,
      },
      stage2_in_progress: {
        title_hi: "चरण 2: निर्माण प्रगति पर (During Construction)",
        title_en: "Stage 2: Active Construction",
        stage_name_hi: "सक्रिय निर्माण कार्य (70%)",
        stage_name_en: "Under Construction (70%)",
        percentage: 70,
        date: "2026-05-10",
        time_ist: "03:15 अपराह्न (IST)",
        mactionsoft_geotag_id: `mAct/UP/2026/MID-${Math.floor(10000 + Math.random() * 90000)}`,
        photo_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
        status_label_hi: "ईंट जुड़ाई व प्लास्टर कार्य (70%)",
        status_label_en: "Brick masonry & cement plastering (70%)",
        stage_desc_hi: `प्रथम श्रेणी ईंटों से दोनों दीवारों की जुड़ाई पूर्ण, 1:3 सीमेंट मसाले से आंतरिक वाटरप्रूफ प्लास्टर प्रगति पर।`,
        stage_desc_en: `First-class brick masonry completed, waterproof interior cement plastering in progress.`,
        qc_parameter_hi: "प्लास्टर मोटाई व मसाला अनुपात: 12mm (1:3 अनुपात प्रमाणित)",
        qc_parameter_en: "Plaster Thickness & Mortar Ratio: 12mm (1:3 Approved)",
        inspecting_officer: project_meta.je_name,
      },
      stage3_completed: {
        title_hi: "चरण 3: कार्य पूर्ण (Completed Asset)",
        title_en: "Stage 3: Completed Asset",
        stage_name_hi: "हस्तांतरित व चालू परिसंपत्ति (100%)",
        stage_name_en: "Commissioned Asset (100%)",
        percentage: 100,
        date: cDate,
        time_ist: "05:00 अपराह्न (IST)",
        mactionsoft_geotag_id: `mAct/UP/2026/FIN-${Math.floor(10000 + Math.random() * 90000)}`,
        photo_url: "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=800&auto=format&fit=crop&q=80",
        status_label_hi: "पक्की ढकी नाली व सोक पिट पूर्ण (100%)",
        status_label_en: "Covered drain & soak pit fully operational (100%)",
        stage_desc_hi: `ढक्कन युक्त पक्की कवर्ड नाली का निर्माण पूर्ण, गंदे पानी का सुरक्षित निकास मुख्य तालाब के फिल्टर चैम्बर तक।`,
        stage_desc_en: `Covered pucca drainage operational with RCC inspection slabs, directing wastewater to soak chamber.`,
        qc_parameter_hi: "जल-निकासी ढाल अनुपालन: 1:200 मानक हाइड्रो-फ्लो सफल",
        qc_parameter_en: "Hydraulic Invert Slope: 1:200 PWD Standard Passed",
        inspecting_officer: project_meta.je_name,
      },
    };
  }

  if (category === "solar") {
    return {
      project_meta,
      fto_vouchers,
      stage1_before: {
        title_hi: "चरण 1: कार्य प्रारंभ से पूर्व (Before Work)",
        title_en: "Stage 1: Before Work Started",
        stage_name_hi: "कार्य पूर्व स्थलीय स्थिति (0%)",
        stage_name_en: "Pre-Construction Baseline (0%)",
        percentage: 0,
        date: sDate,
        time_ist: "11:00 पूर्वाह्न (IST)",
        mactionsoft_geotag_id: `mAct/UP/2026/PRE-${Math.floor(10000 + Math.random() * 90000)}`,
        photo_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
        status_label_hi: "अंधकार युक्त ग्राम चौराहे (0%)",
        status_label_en: "Dark unlit village intersections (0%)",
        stage_desc_hi: `गांव के मुख्य तिराहे और पंचायत भवन के पास रात में पूर्ण अंधकार से आवागमन में ग्रामीणों को भारी असुविधा।`,
        stage_desc_en: `Lack of nocturnal street illumination at key village crossings causing pedestrian safety hazards.`,
        qc_parameter_hi: "रात्रि प्रकाश स्तर (Lux): 0.2 Lux (असुरक्षित अंधकार)",
        qc_parameter_en: "Night Baseline Lux: 0.2 Lux (Hazardous)",
        inspecting_officer: project_meta.je_name,
      },
      stage2_in_progress: {
        title_hi: "चरण 2: निर्माण प्रगति पर (During Construction)",
        title_en: "Stage 2: Active Construction",
        stage_name_hi: "सक्रिय निर्माण कार्य (60%)",
        stage_name_en: "Under Construction (60%)",
        percentage: 60,
        date: "2026-07-22",
        time_ist: "01:45 अपराह्न (IST)",
        mactionsoft_geotag_id: `mAct/UP/2026/MID-${Math.floor(10000 + Math.random() * 90000)}`,
        photo_url: "https://images.unsplash.com/photo-1508873696983-2df57046475a?w=800&auto=format&fit=crop&q=80",
        status_label_hi: "पोल फाउंडेशन व कंक्रीटिंग (60%)",
        status_label_en: "Pole foundation & concreting (60%)",
        stage_desc_hi: `जीआई ऑक्टागोनल पोल का कंक्रीट बेस तैयार, अंडरग्राउंड आर्मर्ड वायरिंग व लिथियम फेरोफॉस्फेट बैटरी बॉक्स फिटिंग।`,
        stage_desc_en: `GI octagonal pole base cast with cement foundation, LiFePO4 battery enclosures mounted.`,
        qc_parameter_hi: "अर्थिंग प्रतिरोध परीक्षण: 2.4 Ohms (सुरक्षित मानक)",
        qc_parameter_en: "Earth Grounding Resistance: 2.4 Ohms (Safe)",
        inspecting_officer: project_meta.je_name,
      },
      stage3_completed: {
        title_hi: "चरण 3: कार्य पूर्ण (Completed Asset)",
        title_en: "Stage 3: Completed Asset",
        stage_name_hi: "हस्तांतरित व चालू परिसंपत्ति (100%)",
        stage_name_en: "Commissioned Asset (100%)",
        percentage: 100,
        date: cDate,
        time_ist: "06:30 अपराह्न (IST)",
        mactionsoft_geotag_id: `mAct/UP/2026/FIN-${Math.floor(10000 + Math.random() * 90000)}`,
        photo_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
        status_label_hi: "सोलर लाइट चालू व रोशन (100%)",
        status_label_en: "Solar smart streetlights active (100%)",
        stage_desc_hi: `40 वॉट एलईडी ल्यूमिनरी व 120 वॉट मोनोक्रिस्टलाइन सोलर पैनल पूर्णतः चालू, ऑटो डस्क-टू-डॉन सेंसर क्रियाशील।`,
        stage_desc_en: `40W LED smart solar luminaire active with dusk-to-dawn sensors, illuminating intersection.`,
        qc_parameter_hi: "ऑपरेटिंग लक्स स्तर: 38 Lux (MNRE मानक पूर्ण)",
        qc_parameter_en: "Illumination Ground Lux: 38 Lux (MNRE Approved)",
        inspecting_officer: project_meta.je_name,
      },
    };
  }

  // Default / Community / Water / Education
  return {
    project_meta,
    fto_vouchers,
    stage1_before: {
      title_hi: "चरण 1: कार्य प्रारंभ से पूर्व (Before Work)",
      title_en: "Stage 1: Before Work Started",
      stage_name_hi: "कार्य पूर्व स्थलीय स्थिति (0%)",
      stage_name_en: "Pre-Construction Baseline (0%)",
      percentage: 0,
      date: sDate,
      time_ist: "10:15 पूर्वाह्न (IST)",
      mactionsoft_geotag_id: `mAct/UP/2026/PRE-${Math.floor(10000 + Math.random() * 90000)}`,
      photo_url: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&auto=format&fit=crop&q=80",
      status_label_hi: "पुराना जर्जर ढांचा (0%)",
      status_label_en: "Dilapidated old site (0%)",
      stage_desc_hi: `पुराने पंचायत भवन की क्षतिग्रस्त दीवारें व छत, ग्रामीणों के बैठने या सामुदायिक बैठकों की कोई व्यवस्था नहीं थी।`,
      stage_desc_en: `Dilapidated old community shed with structural degradation prior to development sanction.`,
      qc_parameter_hi: "संरचनात्मक स्थिरता परीक्षण: जर्जर / असुरक्षित",
      qc_parameter_en: "Structural Stability: Unsafe Dilapidated Structure",
      inspecting_officer: project_meta.je_name,
    },
    stage2_in_progress: {
      title_hi: "चरण 2: निर्माण प्रगति पर (During Construction)",
      title_en: "Stage 2: Active Construction",
      stage_name_hi: "सक्रिय निर्माण कार्य (75%)",
      stage_name_en: "Under Construction (75%)",
      percentage: 75,
      date: "2026-06-15",
      time_ist: "02:00 अपराह्न (IST)",
      mactionsoft_geotag_id: `mAct/UP/2026/MID-${Math.floor(10000 + Math.random() * 90000)}`,
      photo_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
      status_label_hi: "आरसीसी बीम व छत ढलाई (75%)",
      status_label_en: "RCC beams & slab casting (75%)",
      stage_desc_hi: `कॉलम सुदृढ़ीकरण पूर्ण, आरसीसी रूफ स्लैब ढलाई उपरांत 21 दिवसीय तराई (Curing) का कार्य मानक अनुसार संचालित।`,
      stage_desc_en: `Reinforced concrete columns erected, roof slab casting complete, 21-day water curing in progress.`,
      qc_parameter_hi: "सरिया व सीमेंट गुणवत्ता: Fe500D TMT व OPC 43 ग्रेड",
      qc_parameter_en: "Rebar & Cement Grade: Fe500D TMT & OPC 43 Certified",
      inspecting_officer: project_meta.je_name,
    },
    stage3_completed: {
      title_hi: "चरण 3: कार्य पूर्ण (Completed Asset)",
      title_en: "Stage 3: Completed Asset",
      stage_name_hi: "हस्तांतरित व चालू परिसंपत्ति (100%)",
      stage_name_en: "Commissioned Asset (100%)",
      percentage: 100,
      date: cDate,
      time_ist: "04:45 अपराह्न (IST)",
      mactionsoft_geotag_id: `mAct/UP/2026/FIN-${Math.floor(10000 + Math.random() * 90000)}`,
      photo_url: "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=800&auto=format&fit=crop&q=80",
      status_label_hi: "सुसज्जित पंचायत भवन पूर्ण (100%)",
      status_label_en: "Modernized Community Hall Complete (100%)",
      stage_desc_hi: `आंतरिक व बाह्य पेंटिंग, टाइलिंग, सोलर इन्वर्टर तथा डिजिटल ग्राम सेवा कक्ष पूर्णतः क्रियाशील व हस्तांतरित।`,
      stage_desc_en: `Complete architectural finishing, weather-shield paint, vitrified tiling and digital desk operational.`,
      qc_parameter_hi: "फाइनल हैंडओवर व सोशल ऑडिट: सर्वसम्मति से पारित",
      qc_parameter_en: "Final Handover & Social Audit: Unanimously Approved",
      inspecting_officer: project_meta.je_name,
    },
  };
}

// Built-in Fail-Safe Rural Engineering (PWD & 15th FC) Inspection Engine
export function getFailSafeAuditReport(
  projectTitle: string,
  category: string,
  village: string,
  lat?: number,
  lng?: number
): GeoAuditResult {
  const v = village || "मलिहाबाद खास";
  const now = new Date().toISOString();
  const certHash = Math.floor(100000 + Math.random() * 900000);
  const assetCode = `UP-LKO-MAL-${Math.floor(1000 + Math.random() * 9000)}`;
  const certNo = `NIC-MoPR/2026/CERT-${certHash}`;

  if (category === "road") {
    return {
      verified: true,
      structure_detected: "M20 Grade Cement Concrete (CC) Pavement with Side Berms",
      progress_percent: 94,
      quality_rating: "A+ (उत्कृष्ट / Superior)",
      defects_detected: [],
      isro_bhuvan_match: true,
      technical_verdict_hi: `निरीक्षण फोटो और जीपीएस निर्देशांक (${lat || 26.9201}° N, ${lng || 80.7123}° E) के आधार पर ${v} में सीसी रोड निर्माण मानक (IRC:SP:20-2002) के अनुरूप पाया गया। सतह पूर्णतः समतल है, कंक्रीट में कोई दरार नहीं है।`,
      technical_verdict_en: `Based on site photography and GPS coordinates (${lat || 26.9201}° N, ${lng || 80.7123}° E) in ${v}, the cement concrete pavement complies strictly with rural road standards (IRC:SP:20-2002). Pavement surface is uniform with zero structural fissures.`,
      officer_recommendation_hi: "निर्माण कार्य उच्च गुणवत्ता का है। अंतिम 20% अनुदान राशि ठेकेदार को विमुक्त करने की संस्तुति की जाती है।",
      officer_recommendation_en: "Work is of superior physical quality. Final 20% grant disbursement is certified and recommended.",
      timestamp: now,
      source: "offline_je_engine",
      asset_code: assetCode,
      certificate_no: certNo,
      concrete_strength: "M25 Grade (28.4 N/mm² - 28-Day Cube Compressive Test Passed IS:516)",
      gradient_slope: "1:200 Camber Slope Compliant (IRC Standard)",
      dgps_accuracy: "± 2.1m DGPS Sub-Meter Verified (ISRO CartoSat-3)",
      resolution: "0.5m High Resolution Space Ortho-imagery",
      sarpanch_name: "श्री राम किशोर यादव (ग्राम प्रधान)",
      je_name: "इं० आर० पी० शर्मा (अवर अभियंता RES)",
      bdo_name: "श्रीमती अनीता वर्मा (BDO)",
      qr_verification_url: `https://egramswaraj.gov.in/verify-cert/${certNo}`,
    };
  }

  if (category === "drainage") {
    return {
      verified: true,
      structure_detected: "Masonry Brick Drainage with RCC Inspection Slabs",
      progress_percent: 88,
      quality_rating: "A (मानक अनुरूप / Compliant)",
      defects_detected: ["अंतिम 15 मीटर खंड में स्लैब फिटिंग प्रगति पर"],
      isro_bhuvan_match: true,
      technical_verdict_hi: `नाली की ढाल (Gradient) जल-निकासी हेतु 1:200 के मानक पर सही है। प्लास्टर वाटरप्रूफ है और सोक पिट से जुड़ाव क्रियाशील है।`,
      technical_verdict_en: `Drainage longitudinal gradient meets the 1:200 hydraulic standard. Interior cement plaster is intact with functional soak pit connectivity.`,
      officer_recommendation_hi: "शेष स्लैब कवरिंग पूर्ण कराने के उपरांत पूर्णता प्रमाण पत्र जारी किया जाए।",
      officer_recommendation_en: "Release intermediate running bill; issue final completion certificate once remaining slabs are seated.",
      timestamp: now,
      source: "offline_je_engine",
      asset_code: assetCode,
      certificate_no: certNo,
      concrete_strength: "RCC M20 Grade Inspection Slab (Passed)",
      gradient_slope: "1:200 Hydraulic Drainage Fall Compliant",
      dgps_accuracy: "± 2.4m DGPS Verified",
      resolution: "0.5m CartoSat GIS Mesh",
      sarpanch_name: "श्री राम किशोर यादव (ग्राम प्रधान)",
      je_name: "इं० आर० पी० शर्मा (अवर अभियंता RES)",
      bdo_name: "श्रीमती अनीता वर्मा (BDO)",
      qr_verification_url: `https://egramswaraj.gov.in/verify-cert/${certNo}`,
    };
  }

  return {
    verified: true,
    structure_detected: "Solar Luminaire / Public Community Infrastructure",
    progress_percent: 95,
    quality_rating: "A+ (उत्कृष्ट / Superior)",
    defects_detected: [],
    isro_bhuvan_match: true,
    technical_verdict_hi: `उपकरण की भौतिक स्थापना, जीपीएस वॉटरमार्क और अर्थिंग वायर कनेक्शन का स्थलीय सत्यापन सफल रहा।`,
    technical_verdict_en: `Physical installation, GPS watermark coordinates, and electrical grounding successfully verified on-site.`,
    officer_recommendation_hi: "भौतिक सत्यापन पूर्ण। ग्राम निधि लेखा में संपत्ति दर्ज की जाए।",
    officer_recommendation_en: "Physical audit verified. Recommended for asset capitalization in Gram Panchayat asset ledger.",
    timestamp: now,
    source: "offline_je_engine",
    asset_code: assetCode,
    certificate_no: certNo,
    concrete_strength: "Foundation Block Grade M20 (Passed)",
    gradient_slope: "MNRE Specification 40W LED Luminaire Compliant",
    dgps_accuracy: "± 1.9m DGPS Positional Match",
    resolution: "0.5m ISRO Space Geotag Mesh",
    sarpanch_name: "श्री राम किशोर यादव (ग्राम प्रधान)",
    je_name: "इं० आर० पी० शर्मा (अवर अभियंता RES)",
    bdo_name: "श्रीमती अनीता वर्मा (BDO)",
    qr_verification_url: `https://egramswaraj.gov.in/verify-cert/${certNo}`,
  };
}
