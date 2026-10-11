// Built-in Pretrained Village Agronomy & Panchayat Knowledge Engine
// Operates as an offline/instant fallback so the Sarpanch Copilot NEVER fails or shows errors.

export interface CopilotResponse {
  answer_hi: string;
  answer_en: string;
  suggested_action?: {
    label_hi: string;
    label_en: string;
    href: string;
  };
  tags?: string[];
  source: "groq_llm" | "pretrained_engine";
}

interface KnowledgeItem {
  id: string;
  keywords: string[];
  answer_hi: string;
  answer_en: string;
  suggested_action?: {
    label_hi: string;
    label_en: string;
    href: string;
  };
  tags: string[];
}

export const SARPANCH_SYSTEM_PROMPT = `
आप "सरपंच जी" (Sarpanch Ji) हैं — 'ग्रामसेतु (GramSetu)' पोर्टल के मुख्य AI आवाज़ी सलाहकार और वरिष्ठ ग्रामीण मार्गदर्शक।
आपका स्वभाव विनम्र, अनुभवी, आदरपूर्ण और विशुद्ध ग्रामीण (Rural Indian) है।
आप उत्तर प्रदेश तथा उत्तर भारत के किसानों, मजदूरों और ग्रामीणों की समस्याओं को गहराई से समझते हैं।

नियम:
1. अपनी बात हमेशा आदर और गर्मजोशी से शुरू करें (जैसे "राम-राम भाई!", "नमस्ते किसान भाई!", "प्रणाम!").
2. भाषा: सरल, व्यावहारिक और स्पष्ट हिंदी (Hinglish/शुद्ध हिंदी का सहज मिश्रण) जो कम पढ़े-लिखे किसान को भी तुरंत समझ आए।
3. समाधान हमेशा स्पष्ट बिंदुओं में दें:
   - 🌱 देसी/जैविक उपाय (कम लागत)
   - 🧪 रासायनिक उपचार (सटीक दवा का नाम)
   - ⚠️ जरूरी सावधानी
4. जब भी संबंधित हो, पोर्टल के इन फीचर्स का उल्लेख करें:
   - AI फसल डॉक्टर (/crop-doctor) - फोटो खींचकर तुरंत रोग पहचान
   - 5 किमी आउटब्रेक रडार (/outbreaks) - गांव में बीमारी फैलाव का नक्शा
   - मंडी भाव (/mandi) - आज के ताज़ा APMC भाव और मुनाफा कैलकुलेटर
   - सरकारी योजनाएं (/schemes) - PM-किसान, KCC, फसल बीमा, सोलर पंप
   - विकास कार्य ट्रैकर (/village-development) - खड़ंजा, नाली और ग्राम पंचायत बजट
5. यदि कोई ऐसा प्रश्न है जिसका उत्तर निश्चित न हो, तो किसान कॉल सेंटर का टोल-फ्री नंबर 1800-180-1551 बताएं।
6. उत्तर को पढ़ने और सुनने में आसान रखें (अधिक लंबा और उबाऊ न बनाएं)।
`;

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  // 1. Project Introduction & Overview
  {
    id: "project_intro",
    keywords: [
      "project",
      "portal",
      "website",
      "gramsetu",
      "kya hai",
      "about",
      "intro",
      "प्रोजेक्ट",
      "पोर्टल",
      "ग्रामसेतु",
      "क्या है",
      "बारे में बताओ",
      "काम क्या है",
      "सुविधा",
      "सर्विस",
      "हेल्प"
    ],
    answer_hi: `राम-राम किसान भाई! मैं हूँ आपका 'सरपंच AI सलाहकार'। 

'ग्रामसेतु (GramSetu)' आपके गांव और खेत के लिए बनाया गया सम्पूर्ण डिजिटल पंचायत मंच है। यहाँ आपको ये 5 बड़ी सुविधाएं मिलती हैं:

1. 🩺 **AI फसल डॉक्टर:** बीमार फसल की फोटो खींचें, 5 सेकंड में बीमारी की पहचान और देसी-रासायनिक इलाज पाएं।
2. 📡 **5 किमी आउटब्रेक रडार:** आपके गांव के 5 किलोमीटर के दायरे में कौन सी फसल बीमारी फैल रही है, उसका लाइव नक्शा और अलर्ट देखें।
3. ⚖️ **लाइव मंडी भाव व मुनाफा:** लखनऊ और आसपास की मंडियों के आज के ताज़ा भाव देखें और अपनी उपज का मुनाफा निकालें।
4. 🏛️ **सरकारी योजनाएं:** PM-किसान, KCC किसान क्रेडिट कार्ड, फसल बीमा और सोलर पंप में सीधे डिजिटल आवेदन करें।
5. 🏗️ **गांव के विकास कार्य:** आपके गांव के खड़ंजे, नाली और 15वें वित्त आयोग के सरकारी बजट की पूरी पारदर्शिता देखें।

बताइए, आज मैं आपकी क्या मदद करूँ?`,
    answer_en: `Welcome farmer friend! I am your 'Sarpanch AI Copilot'. 

'GramSetu' is a comprehensive digital panchayat platform built for rural governance and smart agriculture:
1. 🩺 **AI Crop Doctor:** Upload leaf photos for instant disease diagnostics & dual remedies.
2. 📡 **5km Outbreak Radar:** Live GIS disease cluster map & early warning alerts.
3. ⚖️ **Live APMC Mandi Rates:** Real-time wholesale prices & profit estimator.
4. 🏛️ **Government Welfare Schemes:** Direct applications for PM-KISAN, KCC loans, PMFBY insurance.
5. 🏗️ **Village Infrastructure Tracker:** Track Gram Panchayat work orders and 15th Finance Commission funds.`,
    suggested_action: {
      label_hi: "🧭 पूरा रोडमैप व सुविधाएं देखें",
      label_en: "🧭 Explore Roadmap & Features",
      href: "/roadmap",
    },
    tags: ["Project", "Overview", "GramSetu"]
  },

  // 2. Wheat Yellow/Brown Rust
  {
    id: "wheat_rust",
    keywords: [
      "wheat",
      "gehu",
      "yellow rust",
      "brown rust",
      "गेहूं",
      "गेहू",
      "पीला रतुआ",
      "रतुआ",
      "गेरुआ",
      "हल्दी जैसा",
      "पीलापन",
      "पत्ती पीली"
    ],
    answer_hi: `भाई, यह लक्षण 'गेहूं के पीले या भूरे रतुआ (Rust Disease)' के हैं। यह फफूंद से हवा के जरिए फैलता है।

🌱 **देसी/जैविक उपचार:**
• 5 लीटर खट्टी छाछ (मट्ठा) में 200 ग्राम हींग मिलाकर 150 लीटर पानी के साथ प्रति एकड़ छिड़काव करें।
• 5 मिली प्रति लीटर नीम का तेल (Neem Oil 1500 ppm) का छिड़काव करें।

🧪 **रासायनिक उपचार:**
• लक्षण दिखते ही प्रोपिकोनाजोल 25% EC (टिल्ट/Tilt) 1 मिली प्रति लीटर पानी में घोलकर तुरंत छिड़काव करें।
• गंभीर स्थिति में 12-15 दिन बाद टेबुकोनाज़ोल 25.9% EC का दूसरा छिड़काव करें।

⚠️ **सावधानी:** खेत में आवश्यकता से अधिक यूरिया न डालें और सुबह ओस सूखने के बाद ही छिड़काव करें।`,
    answer_en: `Farmer friend, these symptoms indicate 'Wheat Yellow/Brown Rust'. It is an airborne fungal pathogen.

🌱 **Organic Remedy:**
• Spray 5L sour buttermilk with 200g asafoetida mixed in 150L water per acre.
• Spray Neem Oil (1500 ppm) @ 5ml per litre of water.

🧪 **Chemical Remedy:**
• Foliar spray of Propiconazole 25% EC @ 1ml per litre of water immediately.
• If severe, repeat after 12-14 days with Tebuconazole 25.9% EC.

⚠️ **Precaution:** Avoid excessive urea application; spray after morning dew dries.`,
    suggested_action: {
      label_hi: "📸 फसल डॉक्टर में फोटो जांचें",
      label_en: "📸 Scan Photo in Crop Doctor",
      href: "/crop-doctor",
    },
    tags: ["Wheat", "Disease", "Yellow Rust"]
  },

  // 3. Paddy Blast & Bacterial Leaf Blight
  {
    id: "paddy_blast",
    keywords: [
      "paddy",
      "rice",
      "dhan",
      "blast",
      "blight",
      "धान",
      "चावल",
      "ब्लास्ट",
      "झुलसा",
      "पत्ती सूखना",
      "नाव जैसे धब्बे"
    ],
    answer_hi: `किसान भाई, धान में नाव के आकार के धब्बे या पत्तियों का सूखना 'झुलसा रोग (Paddy Blast/Blight)' कहलाता है।

🌱 **देसी उपचार:**
• 10% गौमूत्र और नीम पत्ती का काढ़ा बनाकर प्रति एकड़ 150 लीटर पानी में छिड़काव करें।
• ट्राइकोडर्मा विरिडी (Trichoderma viride) 2.5 किग्रा को सड़े गोबर में मिलाकर खेत में डालें।

🧪 **रासायनिक उपचार:**
• ट्राइसाइक्लाजोल 75% WP (बाण/बीम) का 0.6 ग्राम प्रति लीटर पानी में छिड़काव करें।
• जीवाणु झुलसा (BLB) के लिए स्ट्रेप्टोसाइक्लिन 6 ग्राम + कॉपर ऑक्सीक्लोराइड 500 ग्राम प्रति 200 लीटर पानी का छिड़काव करें।

⚠️ **सावधानी:** खेत में पानी का स्तर बनाए रखें और जलभराव के पानी को दूसरे स्वस्थ खेत में न बहने दें।`,
    answer_en: `Spindle-shaped lesions or drying leaf tips in paddy indicate Blast or Bacterial Leaf Blight.

🌱 **Organic Remedy:**
• Spray 10% cow urine solution fermented with neem leaves.
• Apply Trichoderma viride (2.5 kg/acre) mixed with farmyard manure.

🧪 **Chemical Remedy:**
• Tricyclazole 75% WP @ 0.6g/L water for blast.
• For BLB: Streptocycline 6g + Copper Oxychloride 500g in 200L water.`,
    suggested_action: {
      label_hi: "📸 धान की फोटो अपलोड करें",
      label_en: "📸 Upload Paddy Photo",
      href: "/crop-doctor",
    },
    tags: ["Paddy", "Blast", "Blight"]
  },

  // 4. Potato Late Blight
  {
    id: "potato_blight",
    keywords: [
      "potato",
      "aalu",
      "aaloo",
      "blight",
      "आलू",
      "पिछेता झुलसा",
      "झुलसा",
      "आलू सड़ना",
      "काले धब्बे"
    ],
    answer_hi: `आलू में पत्तियों पर काले-भूरे गीले धब्बे आना 'पिछेता झुलसा (Late Blight)' है, जो कोहरे और नमी में 48 घंटे में पूरी फसल बर्बाद कर सकता है।

🌱 **देसी उपचार:**
• बोर्डो मिश्रण (Bordeaux Mixture 1%) का तुरंत छिड़काव करें।
• नीम अर्क और लकड़ी की छनी राख का छिड़काव फफूंद रोकने में मदद करता है।

🧪 **रासायनिक उपचार:**
• शुरुआत में: मैंकोजेब 75% WP (M-45) 2.5 ग्राम प्रति लीटर पानी में छिड़काव करें।
• संक्रमण फैलने पर: साइमोक्सानिल 8% + मैंकोजेब 64% (कर्जेट) या मेटलैक्टिल + मैंकोजेब (रिडोमिल गोल्ड) 2 ग्राम प्रति लीटर पानी में छिड़कें।`,
    answer_en: `Dark water-soaked lesions on potato leaves signify Late Blight. In cold damp weather, it spreads rapidly.

🌱 **Organic Remedy:**
• Preventive spray of 1% Bordeaux mixture.

🧪 **Chemical Remedy:**
• Preventive: Mancozeb 75% WP @ 2.5g/L water.
• Curative: Cymoxanil 8% + Mancozeb 64% WP or Metalaxyl + Mancozeb (Ridomil Gold) @ 2g/L water.`,
    suggested_action: {
      label_hi: "📸 आलू की पत्ती स्कैन करें",
      label_en: "📸 Scan Potato Leaf",
      href: "/crop-doctor",
    },
    tags: ["Potato", "Late Blight"]
  },

  // 5. Mustard Aphids (माहू / चेपा)
  {
    id: "mustard_aphid",
    keywords: [
      "mustard",
      "sarso",
      "sarson",
      "aphid",
      "सरसों",
      "माहू",
      "चेपा",
      "लाही",
      "कीड़े",
      "रस चूसक"
    ],
    answer_hi: `सरसों के फूलों और फलियों पर हरे-काले चिपचिपे कीड़े 'माहू (Aphid/Chepa)' कहलाते हैं। यह रस चूसकर फलियों को खोखला कर देते हैं।

🌱 **देसी उपचार:**
• खेत में प्रति एकड़ 8-10 पीले चिपचिपे ट्रैप (Yellow Sticky Traps) लगाएं।
• 5 मिली नीम का तेल प्रति लीटर पानी में डिटर्जेंट के साथ मिलाकर छिड़कें।

🧪 **रासायनिक उपचार:**
• डाइमेथोएट 30% EC (रोगोर) 1.5 मिली प्रति लीटर या इमिडाक्लोप्रिड 17.8% SL 0.5 मिली प्रति लीटर पानी में छिड़काव करें।
• छिड़काव हमेशा दोपहर के समय करें जब मधुमक्खियों की गतिविधि कम हो।`,
    answer_en: `Small sap-sucking insects clustering on mustard twigs and pods are Aphids (Mahoo).

🌱 **Organic Remedy:**
• Install 8-10 Yellow Sticky Traps per acre.
• Spray Neem oil (1500 ppm) @ 5ml/L mixed with soap water.

🧪 **Chemical Remedy:**
• Dimethoate 30% EC @ 1.5ml/L or Imidacloprid 17.8% SL @ 0.5ml/L water.
• Spray during afternoon hours to protect honeybee pollinators.`,
    suggested_action: {
      label_hi: "📸 सरसों के कीड़े की फोटो जांचें",
      label_en: "📸 Inspect Mustard Insect",
      href: "/crop-doctor",
    },
    tags: ["Mustard", "Aphid", "Pest"]
  },

  // 6. PM-KISAN Scheme
  {
    id: "pm_kisan",
    keywords: [
      "pm kisan",
      "kisan nidhi",
      "2000",
      "6000",
      "kist",
      "installment",
      "पीएम किसान",
      "सम्मान निधि",
      "किस्त",
      "दो हजार",
      "रुपये कब मिलेंगे",
      "पैसा नहीं आया"
    ],
    answer_hi: `किसान भाई, 'PM-किसान सम्मान निधि' के तहत हर 4 महीने में ₹2,000 की किस्त (सालाना कुल ₹6,000) सीधे आपके बैंक खाते में आती है।

📋 **यदि आपकी किस्त नहीं आई तो 3 जरूरी काम करें:**
1. **e-KYC पूर्ण करें:** अपने आधार और मोबाइल नंबर से OTP द्वारा e-KYC सत्यापन कराएं।
2. **भूलेख अंकन (Land Seeding):** आपकी खतौनी का लैंड सीडिंग पोर्टल पर 'YES' होना जरूरी है।
3. **आधार बैंक लिंकिंग (DBT):** बैंक खाते में आधार NPCI से जुड़ा होना चाहिए।

आप हमारे पोर्टल से सीधे ग्राम पंचायत अधिकारी के पास अपनी समस्या या नया आवेदन दर्ज कर सकते हैं।`,
    answer_en: `Under PM-KISAN, eligible landholding farmer families receive ₹6,000 per year in three equal installments of ₹2,000 via DBT.

Key Checklist if installment is pending:
1. Complete Aadhaar-based e-KYC.
2. Verify Land Seeding status on PM-Kisan portal.
3. Ensure bank account is NPCI-seeded for DBT payments.`,
    suggested_action: {
      label_hi: "🏛️ सरकारी योजनाएं पोर्टल खोलें",
      label_en: "🏛️ Open Schemes Portal",
      href: "/schemes",
    },
    tags: ["Scheme", "PM-KISAN", "DBT"]
  },

  // 7. Kisan Credit Card (KCC) Loan
  {
    id: "kcc_loan",
    keywords: [
      "kcc",
      "credit card",
      "loan",
      "karz",
      "byaj",
      "ऋण",
      "कर्ज",
      "केसीसी",
      "किसान क्रेडिट कार्ड",
      "ब्याज दर"
    ],
    answer_hi: `किसान क्रेडिट कार्ड (KCC) किसानों को खाद, बीज और कृषि खर्च के लिए सबसे सस्ता ऋण (Loan) उपलब्ध कराता है।

💰 **ब्याज दर व लाभ:**
• सामान्य ब्याज 7% होता है, लेकिन समय पर भुगतान करने पर सरकार 3% की छूट देती है, जिससे प्रभावी ब्याज केवल **4% वार्षिक** रह जाता है!
• ₹1.60 लाख तक का कर्ज बिना किसी जमीन को गिरवी रखे (Collateral-Free) मिल जाता है।

📄 **जरूरी दस्तावेज:**
1. आधार कार्ड और पैन कार्ड
2. खतौनी व भूलेख की नकल
3. पासपोर्ट साइज फोटो और बैंक पासबुक।

हमारे योजना पोर्टल पर जाकर आप KCC के लिए सीधा आवेदन पत्र जमा कर सकते हैं।`,
    answer_en: `Kisan Credit Card (KCC) offers low-interest institutional crop credit.
• Effective interest rate is just **4% per annum** upon prompt repayment (7% standard minus 3% prompt repayment incentive).
• Collateral-free limit up to ₹1.60 lakh.
• Required: Aadhaar, Land Record (Khatauni), and Bank Passbook.`,
    suggested_action: {
      label_hi: "🏛️ KCC हेतु आवेदन करें",
      label_en: "🏛️ Apply for KCC",
      href: "/schemes",
    },
    tags: ["Scheme", "KCC", "Loan"]
  },

  // 8. PM Fasal Bima Yojana (Crop Insurance)
  {
    id: "pmfby_insurance",
    keywords: [
      "fasal bima",
      "insurance",
      "muavja",
      "nuksan",
      "barish",
      "ola",
      "फसल बीमा",
      "मुआवजा",
      "ओलावृष्टि",
      "सूखा",
      "नुकसान",
      "बीमा क्लेम"
    ],
    answer_hi: `अगर आपकी फसल बेमौसम बारिश, ओलावृष्टि, कीट या सूखे से बर्बाद हुई है, तो 'PM फसल बीमा योजना (PMFBY)' के तहत क्षतिपूर्ति मिलती है।

🌾 **प्रीमियम दरें:**
• खरीफ फसल (धान आदि): मात्र 2%
• रबी फसल (गेहूं, सरसों): मात्र 1.5%
• बागवानी व नकदी फसल: 5% (बाकी प्रीमियम सरकार देती है)।

🚨 **मुआवजे के लिए सबसे जरूरी नियम:**
फसल नुकसान के **72 घंटे के अंदर** बीमा कंपनी के टोल-फ्री नंबर (14447) या अपने ब्लॉक कृषि अधिकारी को सूचना देना अनिवार्य है।`,
    answer_en: `PM Fasal Bima Yojana (PMFBY) covers comprehensive yield loss against non-preventable natural risks.
• Farmer premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticultural crops.
• Crucial rule: Intimate crop loss within **72 hours** on toll-free number 14447 or to local agriculture office.`,
    suggested_action: {
      label_hi: "🏛️ फसल बीमा जानकारी देखें",
      label_en: "🏛️ View Crop Insurance",
      href: "/schemes",
    },
    tags: ["Scheme", "Insurance", "PMFBY"]
  },

  // 9. Mandi Prices & Selling
  {
    id: "mandi_rates",
    keywords: [
      "mandi",
      "bhav",
      "rate",
      "price",
      "apmc",
      "wheat price",
      "paddy price",
      "मंडी",
      "भाव",
      "रेट",
      "दाम",
      "कितना भाव है",
      "कहाँ बेचें",
      "मुनाफा"
    ],
    answer_hi: `किसान भाई, सही समय और सही मंडी में फसल बेचना ही आपके पसीने की पूरी कीमत दिलाता है।

हमारे 'मंडी भाव व मुनाफा पोर्टल' पर आपको:
1. लखनऊ, मलिहाबाद, काकोरी, बंथरा आदि मंडियों के आज के सरकारी Agmarknet भाव मिलते हैं।
2. आप अपनी फसल की मात्रा (क्विंटल में) डालकर यह जान सकते हैं कि किस मंडी में ले जाने पर आपको सबसे अधिक शुद्ध मुनाफा मिलेगा।
3. जिले की सबसे अधिक दाम देने वाली मंडी को विशेष रूप से हाइलाइट किया जाता है।

नीचे दिए गए बटन से तुरंत आज के लाइव मंडी भाव चेक करें!`,
    answer_en: `Access live Agmarknet wholesale commodity prices across APMC mandis in your district.
• Sort by highest paying market.
• Calculate your total gross revenue by entering expected harvest yield in quintals.`,
    suggested_action: {
      label_hi: "⚖️ लाइव मंडी भाव व कैलकुलेटर खोलें",
      label_en: "⚖️ Open Mandi Rates & Calculator",
      href: "/mandi",
    },
    tags: ["Mandi", "Prices", "APMC"]
  },

  // 10. Village Works & Panchayat Budget
  {
    id: "village_works",
    keywords: [
      "village work",
      "panchayat",
      "pradhan",
      "budget",
      "khadanja",
      "sadak",
      "nali",
      "paisa",
      "विकास कार्य",
      "सड़क",
      "खड़ंजा",
      "नाली",
      "प्रधान",
      "बजट",
      "ग्राम पंचायत",
      "15वां वित्त",
      "घोटाला",
      "पैसा कहाँ गया"
    ],
    answer_hi: `ग्राम पंचायत के खर्चे और निर्माण कार्यों की पूरी जानकारी अब ग्रामसेतु पर पारदर्शी है!

🏗️ **आप हमारे पोर्टल पर देख सकते हैं:**
• ग्राम प्रधान और सचिव द्वारा स्वीकृत निर्माण कार्य (खड़ंजा, इंटरलॉकिंग, सोलर लाइट, नाली)।
• सरकारी कार्य आदेश (Work Order No.) और e-GramSwaraj प्रशासनिक स्वीकृति।
• 15वें वित्त आयोग से आवंटित कुल बजट और भौतिक निर्माण की प्रगति (0% से 100%)।
• संबंधित अवर अभियंता (JE) और ब्लॉक विकास अधिकारी (BDO) के नाम व संपर्क।

यदि आपके गांव में काम रुका है या घटिया सामग्री लग रही है, तो आप सीधे पोर्टल से शिकायत दर्ज करा सकते हैं।`,
    answer_en: `Track local infrastructure works approved by the Gram Pradhan and Block Development Officer (BDO).
• Official sanction work orders and 15th Finance Commission fund grants.
• Live construction milestone completion (0% to 100%).
• Authorized contacts of Panchayat Secretary and RES Junior Engineer.`,
    suggested_action: {
      label_hi: "🏗️ गांव के विकास कार्य जांचें",
      label_en: "🏗️ Inspect Village Works",
      href: "/village-development",
    },
    tags: ["Panchayat", "Village Works", "Budget"]
  },

  // 11. Citizen Grievance & Broken Infrastructure
  {
    id: "grievance_complaint",
    keywords: [
      "complaint",
      "shikayat",
      "handpump",
      "paani",
      "light",
      "kooda",
      "शिकायत",
      "हैंडपंप",
      "नल खराब",
      "पानी",
      "सफाई",
      "स्ट्रीट लाइट",
      "टूटी सड़क",
      "समस्या"
    ],
    answer_hi: `भाई, अगर गांव में हैंडपंप खराब है, पानी नहीं आ रहा, सड़क पर गड्ढे हैं या स्ट्रीट लाइट बंद है, तो परेशान न हों:

1. आप हमारे 'ग्राम विकास' पेज पर जाकर **"नागरिक शिकायत दर्ज करें"** पर क्लिक करें।
2. समस्या की जगह का नाम और फोटो सबमिट करें।
3. आपकी शिकायत सीधे ग्राम सचिव और बीडीओ (BDO) के डैशबोर्ड पर 7 दिन के समाधान समय (SLA) के साथ दर्ज हो जाती है।

सरकारी अधिकारी सीधे जांच करके पोर्टल पर समस्या के निस्तारण की रिपोर्ट अपलोड करते हैं।`,
    answer_en: `Report village civic grievances (broken handpumps, damaged roads, clogged drains) directly to block authorities.
Submissions are tracked with an inspection timeline and routed to the Panchayat Secretary's desk.`,
    suggested_action: {
      label_hi: "🚨 ग्राम विकास व शिकायत पोर्टल पर जाएं",
      label_en: "🚨 Go to Village Grievance Desk",
      href: "/village-development",
    },
    tags: ["Grievance", "Citizen", "Handpump"]
  },

  // 12. Dairy & Cattle / Animal Husbandry
  {
    id: "dairy_cattle",
    keywords: [
      "cow",
      "buffalo",
      "milk",
      "doodh",
      "pashu",
      "gai",
      "bhains",
      "गाय",
      "भैंस",
      "दूध बढ़ाना",
      "पशुपालन",
      "चारा",
      "खुरपका",
      "मुंहपका",
      "बीमारी"
    ],
    answer_hi: `पशुपालक भाई! दुधारू गाय-भैंस का दूध बढ़ाने और स्वास्थ्य ठीक रखने के लिए ये अचूक देसी नुस्खे अपनाएं:

🥛 **दूध व वसा (Fat) बढ़ाने के उपाय:**
• 250 ग्राम बिनौला की खली, 100 ग्राम मेथी दाना, और 50 ग्राम खनिज मिश्रण (Mineral Mixture) प्रतिदिन दलिया में पकाकर दें।
• पीने के लिए हमेशा साफ, ताजा पानी 24 घंटे उपलब्ध रखें। एक दुधारू पशु को प्रतिदिन 70-80 लीटर पानी की जरूरत होती है।

💉 **टीकाकरण:**
• खुरपका-मुंहपका (FMD) और गलघोंटू (HS) का टीका साल में दो बार सरकारी पशु चिकित्सालय से निःशुल्क जरूर लगवाएं।
• पेट के कीड़ों की दवा (Deworming) हर 3-4 महीने में पशु चिकित्सक की सलाह से बदल-बदल कर दें।`,
    answer_en: `Tips for dairy cattle health and milk yield enhancement:
• Feed balanced concentrate ration containing cotton seed cake, fenugreek, and 50g mineral mixture daily.
• Ensure round-the-clock clean drinking water (70-80 liters/cow/day).
• Routine FMD and HS vaccination from the local veterinary hospital.`,
    tags: ["Dairy", "Cattle", "Livestock"]
  },

  // 13. Soil Health & Fertilizer Balancing (मृदा स्वास्थ्य)
  {
    id: "soil_health_fertilizer",
    keywords: [
      "soil",
      "mitti",
      "khad",
      "urea",
      "dap",
      "fertilizer",
      "मिट्टी",
      "खाद",
      "यूरिया",
      "डीएपी",
      "मृदा स्वास्थ्य",
      "उर्वरक"
    ],
    answer_hi: `किसान भाई, अंधाधुंध यूरिया और डीएपी डालने से जमीन बंजर होती है और लागत बढ़ती है। संतुलित पोषण का नियम याद रखें:

🌾 **संतुलित N:P:K नियम:**
• सामान्य फसलों के लिए 4:2:1 (नाइट्रोजन, फास्फोरस, पोटाश) का अनुपात सबसे सही है।
• यूरिया को कभी भी एक साथ न डालें। इसे बुवाई, पहली सिंचाई और कल्ले फूटते समय 3 भागों में बांटकर दें।

🌱 **जमीन की जान (जैविक कार्बन):**
• हर 2 साल में एक बार हरी खाद (ढैंचा या सनई) खेत में जोतें।
• नजदीकी कृषि विज्ञान केंद्र (KVK) से अपनी मिट्टी की जांच (Soil Health Card) कराएं, जो सरकार द्वारा निःशुल्क बनाई जाती है।`,
    answer_en: `Balanced N:P:K fertilizer practices protect soil biology and reduce input costs:
• Follow 4:2:1 ratio for nitrogen, phosphorus, and potassium.
• Split urea into 3 stages rather than dumping in one go.
• Sow green manure (Dhaincha) periodically and test your soil via the Soil Health Card scheme.`,
    tags: ["Soil", "Fertilizer", "Urea"]
  },

  // 14. e-Sanjeevani Tele-Doctor & Rural Healthcare
  {
    id: "healthcare_teledoctor",
    keywords: [
      "doctor",
      "hospital",
      "fever",
      "health",
      "dawa",
      "tabiyat",
      "bimari",
      "ambulance",
      "108",
      "डॉक्टर",
      "अस्पताल",
      "तबीयत",
      "बुखार",
      "सिरदर्द",
      "इलाज",
      "दवा",
      "स्वास्थ्य",
      "ई-संजीवनी",
      "संजीवनी",
      "आभा",
      "एम्बुलेंस"
    ],
    answer_hi: `किसान भाई, अब आपको छोटी-मोटी बीमारी के लिए शहर के महंगे प्राइवेट क्लीनिक जाने की बिल्कुल जरूरत नहीं है!

🏥 **हमारे 'ई-संजीवनी 2.0' पोर्टल पर सुविधाएँ:**
1. **मुफ्त वीडियो डॉक्टर:** सामुदायिक स्वास्थ्य केंद्र (CHC) व प्राथमिक स्वास्थ्य केंद्र (PHC) के विशेषज्ञ सरकारी डॉक्टरों से सीधे लाइव वीडियो पर बात करें।
2. **डिजिटल सरकारी पर्चा:** डॉक्टर आपकी जांच करके आधिकारिक e-Sanjeevani पर्चा (Prescription) जारी करते हैं, जिसे आप डाउनलोड या प्रिंट कर सकते हैं।
3. **जन औषधि केंद्र (80% सस्ती दवाएं):** पर्चे की दवाएं बाजार से 4 गुना सस्ती दर पर पास के जन औषधि केंद्र से प्राप्त करें।
4. **आपातकालीन 108 एम्बुलेंस:** आपात स्थिति में 1-टैप से मुफ्त 108 एम्बुलेंस बुलाएं।

नीचे दिए गए बटन से तुरंत ऑन-ड्यूटी सरकारी डॉक्टर से मुफ्त वीडियो परामर्श शुरू करें!`,
    answer_en: `Connect directly with on-duty Government CHC/PHC doctors for free video tele-consultation, verified digital prescriptions, and Jan Aushadhi generic medicine discounts.`,
    suggested_action: {
      label_hi: "👨‍⚕️ ई-संजीवनी डॉक्टर से जुड़ें",
      label_en: "👨‍⚕️ Connect to Tele-Doctor",
      href: "/healthcare",
    },
    tags: ["Healthcare", "TeleDoctor", "e-Sanjeevani"]
  }
];

export function findPretrainedResponse(query: string): CopilotResponse {
  const clean = (query || "").toLowerCase().trim();

  if (!clean || clean.length === 0) {
    return {
      answer_hi: "नमस्ते किसान भाई! मैं सरपंच AI आवाज़ी सलाहकार हूँ। आप खेती-बाड़ी, फसल की बीमारी, सरकारी योजनाएं, मंडी भाव या गांव के विकास कार्य के बारे में कुछ भी पूछ सकते हैं।",
      answer_en: "Hello farmer friend! I am your Sarpanch AI Voice Copilot. Ask me anything about crops, diseases, schemes, mandi prices, or village development.",
      suggested_action: {
        label_hi: "🧭 ग्रामसेतु सुविधाएं देखें",
        label_en: "🧭 Explore Features",
        href: "/roadmap"
      },
      source: "pretrained_engine"
    };
  }

  // Calculate matching scores across knowledge base items
  let bestMatch: KnowledgeItem | null = null;
  let highestScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (clean.includes(kwLower)) {
        score += kwLower.length >= 4 ? 3 : 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 2) {
    return {
      answer_hi: bestMatch.answer_hi,
      answer_en: bestMatch.answer_en,
      suggested_action: bestMatch.suggested_action,
      tags: bestMatch.tags,
      source: "pretrained_engine"
    };
  }

  // Generalized intelligent rural advisor response if no exact rule matched
  return {
    answer_hi: `राम-राम भाई! आपके सवाल पर हमारा ग्रामीण परामर्श:

कृषि और ग्रामीण कार्यों में सर्वोत्तम परिणाम के लिए:
1. **फसल और कीट-रोग:** यदि खेत में कोई लक्षण दिख रहा है, तो हमारे 'AI फसल डॉक्टर' में तुरंत पत्ती का फोटो अपलोड करें, आपको 5 सेकंड में सटीक दवा और देसी उपाय मिल जाएंगे।
2. **सरकारी सहायता:** PM-किसान, किसान क्रेडिट कार्ड (KCC) या फसल बीमा के लिए हमारे 'योजना पोर्टल' पर जाएं।
3. **विशेषज्ञ सलाह:** किसी भी आपातकालीन कृषि समस्या के लिए भारत सरकार के टोल-फ्री किसान कॉल सेंटर नंबर **1800-180-1551** पर सुबह 6 से रात 10 बजे तक मुफ्त बात करें।

बताइए, क्या आप फसल डॉक्टर जांचना चाहते हैं या आज के मंडी भाव देखना चाहते हैं?`,
    answer_en: `Farmer friend, here is our agronomy guidance:
1. **Crop Health:** Upload leaf photos in our AI Crop Doctor for instant diagnosis.
2. **Welfare Schemes:** Explore PM-KISAN, KCC, and PMFBY on our Schemes portal.
3. **Emergency Support:** Call the Government Kisan Call Centre toll-free at **1800-180-1551** for live expert assistance.`,
    suggested_action: {
      label_hi: "📸 AI फसल डॉक्टर में जांचें",
      label_en: "📸 Check AI Crop Doctor",
      href: "/crop-doctor"
    },
    tags: ["General Advisory", "Kisan Helpline"],
    source: "pretrained_engine"
  };
}
