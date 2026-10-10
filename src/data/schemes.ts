export interface GovtScheme {
  id: string;
  name_hi: string;
  name_en: string;
  department_hi: string;
  department_en: string;
  category: "financial" | "machinery" | "insurance" | "soil_water";
  status: "live" | "upcoming";
  benefit_hi: string;
  benefit_en: string;
  subsidy_highlight_hi: string;
  subsidy_highlight_en: string;
  description_hi: string;
  description_en: string;
  eligibility_hi: string[];
  eligibility_en: string[];
  documents_hi: string[];
  documents_en: string[];
  last_date_hi: string;
  last_date_en: string;
  official_url: string;
  toll_free?: string;
}

export const GOVT_SCHEMES: GovtScheme[] = [
  {
    id: "pm-kisan",
    name_hi: "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
    name_en: "PM Kisan Samman Nidhi (PM-KISAN)",
    department_hi: "कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार",
    department_en: "Ministry of Agriculture & Farmers Welfare, Govt of India",
    category: "financial",
    status: "live",
    benefit_hi: "₹6,000 प्रति वर्ष (तीन समान किस्तों में ₹2,000-₹2,000)",
    benefit_en: "₹6,000 per year (3 equal installments of ₹2,000 each)",
    subsidy_highlight_hi: "₹6,000/वर्ष DBT",
    subsidy_highlight_en: "₹6,000/Year DBT",
    description_hi: "सभी भूमिधारक किसान परिवारों को आय सहायता प्रदान करने के लिए प्रत्यक्ष लाभ अंतरण (DBT) योजना।",
    description_en: "Direct income support of ₹6,000 annually credited directly to Aadhaar-linked bank accounts.",
    eligibility_hi: [
      "उत्तर प्रदेश के सभी भू-स्वामी किसान (लघु व सीमांत किसान सहित)",
      "ई-केवाईसी (e-KYC) तथा भूलेख अंकन (Land Seeding) पूर्ण होना आवश्यक",
      "बैंक खाता आधार से लिंक व डीबीटी सक्षम होना चाहिए"
    ],
    eligibility_en: [
      "All landholding farmer families across Uttar Pradesh",
      "Mandatory e-KYC and land seeding on the PM-Kisan portal",
      "Aadhaar-seeded bank account enabled for Direct Benefit Transfer (DBT)"
    ],
    documents_hi: ["आधार कार्ड", "खतौनी / खसरा नकल", "बैंक पासबुक", "मोबाइल नंबर"],
    documents_en: ["Aadhaar Card", "Land Records (Khatauni / Khasra)", "Bank Passbook", "Active Mobile Number"],
    last_date_hi: "सतत पंजीकरण चालू (19वीं किस्त हेतु आवेदन खुला)",
    last_date_en: "Continuous registration open (Open for 19th installment)",
    official_url: "https://pmkisan.gov.in",
    toll_free: "155261 / 1800115526"
  },
  {
    id: "up-kisan-credit-card",
    name_hi: "किसान क्रेडिट कार्ड (KCC) रियायती कृषि ऋण",
    name_en: "Kisan Credit Card (KCC) Subsidized Farm Loan",
    department_hi: "पंचायती राज व सहकारिता विभाग, उत्तर प्रदेश शासन",
    department_en: "Department of Panchayati Raj & Cooperation, Govt of UP",
    category: "financial",
    status: "live",
    benefit_hi: "₹3 लाख तक का कृषि ऋण मात्र 4% रियायती ब्याज दर पर",
    benefit_en: "Short-term farm credit up to ₹3 Lakh at 4% subsidized interest rate",
    subsidy_highlight_hi: "मात्र 4% ब्याज दर",
    subsidy_highlight_en: "Only 4% Interest Rate",
    description_hi: "फसली ऋण, खाद, बीज, कीटनाशक व कृषि उपकरण रखरखाव हेतु समय पर सस्ता संस्थागत ऋण।",
    description_en: "Timely institutional credit for crop cultivation, quality seeds, fertilizers and machinery maintenance.",
    eligibility_hi: [
      "व्यक्तिगत/संयुक्त भू-स्वामी किसान",
      "बटाईदार एवं पट्टेदार किसान भी संयुक्त देयता समूह (JLG) के माध्यम से पात्र",
      "पशुपालन एवं मत्स्य पालन करने वाले किसान भी पात्र"
    ],
    eligibility_en: [
      "Individual or joint owner cultivators",
      "Tenant farmers, oral lessees and sharecroppers via Joint Liability Groups (JLGs)",
      "Dairy and fisheries farmers are also eligible"
    ],
    documents_hi: ["आधार कार्ड", "भू-स्वामित्व दस्तावेज (खतौनी)", "पासपोर्ट फोटो", "नो ड्यूज प्रमाण पत्र"],
    documents_en: ["Aadhaar Card", "Land Ownership Record (Khatauni)", "Passport Photographs", "No-Dues Certificate"],
    last_date_hi: "नजदीकी बैंक शाखा या ग्राम पंचायत में कभी भी आवेदन करें",
    last_date_en: "Apply anytime at nearest commercial/cooperative bank branch",
    official_url: "https://agricoop.nic.in",
    toll_free: "1800-180-1551"
  },
  {
    id: "pmfby-bima",
    name_hi: "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
    name_en: "PM Fasal Bima Yojana (PMFBY Crop Insurance)",
    department_hi: "कृषि रक्षा विभाग, उत्तर प्रदेश शासन",
    department_en: "Department of Agriculture Defense, Govt of Uttar Pradesh",
    category: "insurance",
    status: "live",
    benefit_hi: "प्राकृतिक आपदा, ओलावृष्टि व बेमौसम बारिश से नुकसान पर 100% तक क्षतिपूर्ति",
    benefit_en: "Up to 100% financial compensation for crop losses due to unseasonal rains and hailstorms",
    subsidy_highlight_hi: "रबी फसल पर केवल 1.5% प्रीमियम",
    subsidy_highlight_en: "Only 1.5% Premium on Rabi Crops",
    description_hi: "सूखा, बाढ़, ओलावृष्टि या कीट प्रकोप से होने वाले वित्तीय नुकसान की भरपाई। किसान को केवल 1.5% प्रीमियम देना होता है।",
    description_en: "Comprehensive risk coverage from pre-sowing to post-harvest localized calamities.",
    eligibility_hi: [
      "अधिसूचित क्षेत्रों में अधिसूचित फसलों को उगाने वाले सभी किसान (बटाईदार सहित)",
      "फसल क्षति होने के 72 घंटे के भीतर टोल फ्री या पोर्टल पर सूचना देना अनिवार्य"
    ],
    eligibility_en: [
      "All farmers growing notified crops in notified panchayat areas",
      "Mandatory crop loss notification within 72 hours of localized calamity"
    ],
    documents_hi: ["फसल बुवाई प्रमाण पत्र (पटवारी/प्रधान द्वारा)", "खतौनी नकल", "बैंक पासबुक", "आधार कार्ड"],
    documents_en: ["Sowing Certificate (Pradhan / Lekhpal)", "Khatauni Land Record", "Bank Passbook Copy", "Aadhaar Card"],
    last_date_hi: "रबी 2026 क्लेम विंडो खुली है (72 घंटे में सूचना)",
    last_date_en: "Rabi 2026 Claims Open (Notify within 72 hours)",
    official_url: "https://pmfby.gov.in",
    toll_free: "14447 / 1800-180-1551"
  },
  {
    id: "up-kusum-solar-pump",
    name_hi: "पीएम-कुसुम सोलर पंप योजना (UP Solar Pump Yojana)",
    name_en: "PM-KUSUM Solar Irrigation Pump Scheme",
    department_hi: "उ.प्र. नवीन एवं नवीकरणीय ऊर्जा विकास अभिकरण (UPNEDA)",
    department_en: "UP New & Renewable Energy Development Agency (UPNEDA)",
    category: "machinery",
    status: "live",
    benefit_hi: "2 HP से 10 HP सोलर पंप पर 60% तक भारी सरकारी अनुदान",
    benefit_en: "Up to 60% capital grant subsidy on 2 HP to 10 HP stand-alone solar water pumps",
    subsidy_highlight_hi: "60% सरकारी सब्सिडी",
    subsidy_highlight_en: "60% Govt Subsidy",
    description_hi: "डीजल और बिजली खर्च से मुक्ति। दिन के समय निःशुल्क सौर ऊर्जा से खेतों की निर्बाध सिंचाई।",
    description_en: "Zero diesel expense. Reliable daytime green solar power for uninterrupted irrigation.",
    eligibility_hi: [
      "उत्तर प्रदेश के किसान जिनके पास स्वयं की भूमि व सिंचाई स्रोत (बोरवेल) उपलब्ध है",
      "विद्युत कनेक्शन न होने वाले किसानों को विशेष वरीयता"
    ],
    eligibility_en: [
      "Farmers of UP with agricultural land holding and existing boring/well source",
      "Priority given to farmers in dark zones or without grid electricity"
    ],
    documents_hi: ["खतौनी", "बोरिंग प्रमाण पत्र", "आधार कार्ड", "बैंक पासबुक", "टोकन मनी रसीद"],
    documents_en: ["Khatauni Record", "Boring Water Source Certificate", "Aadhaar Card", "Bank Passbook", "Token Receipt"],
    last_date_hi: "ऑनलाइन टोकन बुकिंग जारी (प्रथम आवक, प्रथम पावक)",
    last_date_en: "Online token booking active on first-come-first-served basis",
    official_url: "https://upagriculture.com",
    toll_free: "1800-180-5151"
  },
  {
    id: "up-krishi-yantra-subsidy",
    name_hi: "उ.प्र. कृषि यंत्रीकरण प्रोत्साहन योजना (ट्रैक्टर व यंत्र अनुदान)",
    name_en: "UP Farm Mechanization & Tractor Subsidy Scheme",
    department_hi: "कृषि विभाग, उत्तर प्रदेश शासन",
    department_en: "Department of Agriculture, Govt of Uttar Pradesh",
    category: "machinery",
    status: "live",
    benefit_hi: "रोटावेटर, सुपर सीडर, कल्टीवेटर व लेजर लैंड लेवलर पर 40% से 50% अनुदान",
    benefit_en: "40% to 50% capital subsidy on rotavators, super seeders, and laser land levelers",
    subsidy_highlight_hi: "50% यंत्र सब्सिडी",
    subsidy_highlight_en: "50% Machinery Subsidy",
    description_hi: "आधुनिक कृषि यंत्रों की खरीद पर सीधे खाते में सब्सिडी। पराली प्रबंधन यंत्रों पर विशेष छूट।",
    description_en: "Direct financial assistance on cutting-edge machinery to mechanize farming and manage crop residue.",
    eligibility_hi: [
      "पारदर्शी किसान सेवा पोर्टल (upagriculture.com) पर पंजीकृत किसान",
      "पूर्व में 3 वर्ष के भीतर संबंधित यंत्र पर अनुदान न लिया हो"
    ],
    eligibility_en: [
      "Registered farmers on UP Agriculture portal (upagriculture.com)",
      "Applicant must not have claimed subsidy for same machinery in past 3 years"
    ],
    documents_hi: ["किसान पंजीकरण संख्या", "खतौनी", "आधार कार्ड", "बैंक खाता विवरण"],
    documents_en: ["Farmer Portal Registration ID", "Khatauni Copy", "Aadhaar Card", "Bank Account Details"],
    last_date_hi: "ई-लॉटरी व टोकन आवंटन चक्र सक्रिय",
    last_date_en: "E-Lottery and token allocation cycle currently active",
    official_url: "http://upagriculture.com/Default.aspx",
    toll_free: "1800-180-1551"
  },
  {
    id: "soil-health-card",
    name_hi: "राष्ट्रीय मृदा स्वास्थ्य कार्ड योजना (Soil Health Card)",
    name_en: "National Soil Health Card Scheme",
    department_hi: "कृषि रक्षा एवं मृदा परीक्षण निदेशालय, उ.प्र.",
    department_en: "Directorate of Soil Testing & Agriculture, Uttar Pradesh",
    category: "soil_water",
    status: "live",
    benefit_hi: "निःशुल्क मिट्टी जांच एवं 12 पोषक तत्वों की स्थिति का डिजिटल कार्ड",
    benefit_en: "Free scientific laboratory soil test and digital card with 12 micro/macro nutrients report",
    subsidy_highlight_hi: "100% निःशुल्क जांच",
    subsidy_highlight_en: "100% Free Testing",
    description_hi: "खेत की मिट्टी में नाइट्रोजन, फास्फोरस, पोटाश व सूक्ष्म तत्वों की जांच कराएं और खाद की अनावश्यक बर्बादी रोकें।",
    description_en: "Scientific testing of farm soil to prevent excessive chemical fertilizer usage and restore soil fertility.",
    eligibility_hi: ["सभी किसान अपने नजदीकी ब्लॉक कृषि रक्षा इकाई या KVK पर मिट्टी का नमूना जमा कर सकते हैं"],
    eligibility_en: ["All farmers can submit soil samples at nearest Block Agriculture Unit or Krishi Vigyan Kendra"],
    documents_hi: ["खसरा/गाटा संख्या", "आधार कार्ड", "किसान का मोबाइल नंबर"],
    documents_en: ["Khasra / Plot Number", "Aadhaar Card", "Registered Mobile Number"],
    last_date_hi: "वर्ष भर निःशुल्क जांच उपलब्ध",
    last_date_en: "Free testing available throughout the year",
    official_url: "https://soilhealth.dac.gov.in",
    toll_free: "1800-180-1551"
  },
  {
    id: "up-polyhouse-subsidy",
    name_hi: "उ.प्र. संरक्षित खेती एवं पॉलीहाउस योजना (आगामी)",
    name_en: "UP Protected Cultivation & Polyhouse Scheme (Upcoming)",
    department_hi: "उद्यान एवं खाद्य प्रसंस्करण विभाग, उत्तर प्रदेश",
    department_en: "Department of Horticulture & Food Processing, Uttar Pradesh",
    category: "machinery",
    status: "upcoming",
    benefit_hi: "पॉलीहाउस व शेडनेट निर्माण पर 50% पूंजीगत अनुदान (₹7 लाख तक)",
    benefit_en: "50% capital subsidy up to ₹7 Lakh for polyhouse and shade-net construction",
    subsidy_highlight_hi: "आगामी - 50% अनुदान",
    subsidy_highlight_en: "Upcoming - 50% Subsidy",
    description_hi: "बेमौसम हरी सब्जियां, शिमला मिर्च, खीरा व फूलों की उच्च लाभ वाली खेती के लिए संरक्षित ढांचा निर्माण।",
    description_en: "Protected structures for high-value off-season vegetables, capsicum, cucumber, and floriculture cash crops.",
    eligibility_hi: [
      "उद्यान विभाग में पंजीकृत कृषक",
      "न्यूनतम 500 वर्ग मीटर से 4000 वर्ग मीटर भूमि की उपलब्धता"
    ],
    eligibility_en: [
      "Registered growers with UP Horticulture Department",
      "Availability of 500 to 4,000 square meters of agricultural land with assured irrigation"
    ],
    documents_hi: ["खतौनी", "सिंचाई स्रोत शपथ पत्र", "आधार कार्ड", "बैंक पासबुक"],
    documents_en: ["Land Khatauni", "Irrigation Source Affidavit", "Aadhaar Card", "Bank Passbook"],
    last_date_hi: "आवेदन आगामी माह से प्रारंभ होंगे (अधिसूचना जारी)",
    last_date_en: "Applications opening next month (Official notification released)",
    official_url: "http://uphorticulture.gov.in",
    toll_free: "1800-180-1551"
  },
  {
    id: "up-gau-palan-subsidy",
    name_hi: "नंदिनी कृषक समृद्धि योजना (डेयरी अनुदान - आगामी)",
    name_en: "Nandini Dairy Subsidy Scheme (Upcoming)",
    department_hi: "पशुधन एवं दुग्ध विकास विभाग, उत्तर प्रदेश",
    department_en: "Department of Animal Husbandry & Dairying, Uttar Pradesh",
    category: "financial",
    status: "upcoming",
    benefit_hi: "उन्नत नस्ल की 25 देशी गायों की डेयरी इकाई पर ₹15 लाख (50%) अनुदान",
    benefit_en: "Up to ₹15 Lakh (50% subsidy) for setting up 25 indigenous milch cow dairy units",
    subsidy_highlight_hi: "आगामी - 50% डेयरी अनुदान",
    subsidy_highlight_en: "Upcoming - 50% Subsidy",
    description_hi: "साहीवाल, गिर, थारपारकर गायों की डेयरी स्थापित कर दुग्ध उत्पादन बढ़ाने हेतु भारी वित्तीय सहायता।",
    description_en: "Promotes high-yielding Sahiwal, Gir, and Tharparkar cow dairy farming with 50% capital grant.",
    eligibility_hi: [
      "कम से कम 3 वर्ष का गोपालन/डेयरी अनुभव रखने वाले किसान",
      "न्यूनतम 0.5 एकड़ भूमि चारा उत्पादन हेतु उपलब्ध हो"
    ],
    eligibility_en: [
      "Farmers with at least 3 years of cattle rearing/dairy farming experience",
      "Minimum 0.5 acre land available for green fodder cultivation"
    ],
    documents_hi: ["आधार कार्ड", "भूमि दस्तावेज", "डेयरी प्रशिक्षण प्रमाण पत्र", "बैंक खाता विवरण"],
    documents_en: ["Aadhaar Card", "Land Title Documents", "Dairy Training Certificate", "Bank Passbook"],
    last_date_hi: "पोर्टल पंजीकरण शीघ्र खुलेगा",
    last_date_en: "Portal registrations opening shortly",
    official_url: "https://animalhusb.up.gov.in",
    toll_free: "1800-180-5141"
  }
];
