// e-Sanjeevani Tele-Doctor & Rural Healthcare Dataset

export interface TeleDoctor {
  id: string;
  name: string;
  name_hi: string;
  gender: "male" | "female";
  specialty: string;
  specialty_hi: string;
  qualification: string;
  hospital: string;
  hospital_hi: string;
  experience_years: number;
  available: boolean;
  avatar: string;
  opd_timing: string;
  languages: string[];
}

export interface GenericMedicine {
  id: string;
  generic_name: string;
  generic_name_hi: string;
  branded_example: string;
  use_case: string;
  use_case_hi: string;
  dosage: string;
  dosage_hi: string;
  branded_price: number;
  generic_price: number;
  savings_percent: number;
}

export interface EmergencyContact {
  id: string;
  title: string;
  title_hi: string;
  phone: string;
  description: string;
  description_hi: string;
  badge: string;
  is_ambulance?: boolean;
}

export const TELE_DOCTORS: TeleDoctor[] = [
  {
    id: "doc-1",
    name: "Dr. Rajesh Sharma",
    name_hi: "डॉ. राजेश शर्मा",
    gender: "male",
    specialty: "General Physician (सामान्य चिकित्सा)",
    specialty_hi: "वरिष्ठ चिकित्साधिकारी (जनरल फिजिशियन)",
    qualification: "MBBS, MD (Medicine) - KGMU Lucknow",
    hospital: "Community Health Centre (CHC) Chinhat, Lucknow",
    hospital_hi: "सामुदायिक स्वास्थ्य केंद्र (CHC) चिनहट, लखनऊ",
    experience_years: 14,
    available: true,
    avatar: "👨‍⚕️",
    opd_timing: "सुबह 09:00 - दोपहर 02:00",
    languages: ["हिन्दी", "English", "अवधी"],
  },
  {
    id: "doc-2",
    name: "Dr. Priya Verma",
    name_hi: "डॉ. प्रिया वर्मा",
    gender: "female",
    specialty: "Gynecologist & Women Care (महिला एवं प्रसूति रोग)",
    specialty_hi: "महिला एवं प्रसूति रोग विशेषज्ञ",
    qualification: "MBBS, MS (Obs & Gynae)",
    hospital: "Primary Health Centre (PHC) Mohanlalganj",
    hospital_hi: "प्राथमिक स्वास्थ्य केंद्र (PHC) मोहनलालगंज, लखनऊ",
    experience_years: 11,
    available: true,
    avatar: "👩‍⚕️",
    opd_timing: "सुबह 10:00 - दोपहर 03:00",
    languages: ["हिन्दी", "English"],
  },
  {
    id: "doc-3",
    name: "Dr. Arvind Kumar",
    name_hi: "डॉ. अरविंद कुमार",
    gender: "male",
    specialty: "Pediatrician (शिशु व बाल रोग विशेषज्ञ)",
    specialty_hi: "शिशु व बाल रोग विशेषज्ञ",
    qualification: "MBBS, DCH (Pediatrics)",
    hospital: "CHC Malihabad, Lucknow",
    hospital_hi: "सामुदायिक स्वास्थ्य केंद्र (CHC) मलिहाबाद, लखनऊ",
    experience_years: 9,
    available: true,
    avatar: "👨‍⚕️",
    opd_timing: "सुबह 09:30 - दोपहर 01:30",
    languages: ["हिन्दी", "अवधी"],
  },
  {
    id: "doc-4",
    name: "Dr. Sunita Mishra",
    name_hi: "डॉ. सुनीता मिश्रा",
    gender: "female",
    specialty: "Ayush & General Wellness (आयुष चिकित्सा)",
    specialty_hi: "आयुष चिकित्साधिकारी व पंचकर्म",
    qualification: "BAMS (Ayurveda), MD (Ayush)",
    hospital: "Ayush Health & Wellness Centre, Bakshi Ka Talab",
    hospital_hi: "आयुष आरोग्य मंदिर, बक्शी का तालाब, लखनऊ",
    experience_years: 12,
    available: true,
    avatar: "👩‍⚕️",
    opd_timing: "सुबह 08:30 - दोपहर 02:30",
    languages: ["हिन्दी", "English"],
  },
];

export const GENERIC_MEDICINES: GenericMedicine[] = [
  {
    id: "med-1",
    generic_name: "Paracetamol 650mg",
    generic_name_hi: "पैरासिटामोल 650 मि.ग्रा.",
    branded_example: "Dolo 650 / Calpol",
    use_case: "Fever, Body Pain, Headache",
    use_case_hi: "बुखार, बदन दर्द, सिरदर्द व फ्लू",
    dosage: "1 tablet after meals (Max 3 times daily)",
    dosage_hi: "1 गोली खाना खाने के बाद (दिन में अधिकतम 3 बार)",
    branded_price: 36,
    generic_price: 9.5,
    savings_percent: 74,
  },
  {
    id: "med-2",
    generic_name: "Amoxicillin + Clavulanic Acid 625mg",
    generic_name_hi: "एमोक्सिसिलिन 625 मि.ग्रा.",
    branded_example: "Augmentin 625 / Moxikind",
    use_case: "Bacterial Infection, Throat Infection, Chest",
    use_case_hi: "गले का संक्रमण, सीने में जकड़न व जीवाणु संक्रमण",
    dosage: "1 tablet twice daily for 5 days as prescribed",
    dosage_hi: "1 गोली सुबह-शाम 5 दिन तक डॉक्टर के निर्देशानुसार",
    branded_price: 185,
    generic_price: 52,
    savings_percent: 72,
  },
  {
    id: "med-3",
    generic_name: "Cetirizine 10mg",
    generic_name_hi: "सिट्रिज़ीन 10 मि.ग्रा.",
    branded_example: "Cetzine / Okacet",
    use_case: "Cold, Sneezing, Running Nose, Allergy",
    use_case_hi: "जुकाम, छींक, बहती नाक व एलर्जी",
    dosage: "1 tablet at bedtime with warm water",
    dosage_hi: "1 गोली रात को सोते समय गुनगुने पानी से",
    branded_price: 42,
    generic_price: 7.8,
    savings_percent: 81,
  },
  {
    id: "med-4",
    generic_name: "Pantoprazole 40mg",
    generic_name_hi: "पैन्टोप्राजोल 40 मि.ग्रा.",
    branded_example: "Pan 40 / Pantocid",
    use_case: "Acidity, Heartburn, Gastric Irritation",
    use_case_hi: "एसिडिटी, गैस, सीने में जलन व पेट दर्द",
    dosage: "1 tablet empty stomach 30 mins before breakfast",
    dosage_hi: "1 गोली सुबह खाली पेट नाश्ते से 30 मिनट पहले",
    branded_price: 110,
    generic_price: 21.5,
    savings_percent: 80,
  },
  {
    id: "med-5",
    generic_name: "Metformin 500mg",
    generic_name_hi: "मेटफॉर्मिन 500 मि.ग्रा.",
    branded_example: "Glycomet 500",
    use_case: "Type-2 Diabetes Blood Sugar Control",
    use_case_hi: "शुगर (डायबिटीज) रक्त शर्करा नियंत्रण",
    dosage: "1 tablet twice daily with meals",
    dosage_hi: "1 गोली सुबह-शाम भोजन के साथ",
    branded_price: 58,
    generic_price: 13.5,
    savings_percent: 77,
  },
  {
    id: "med-6",
    generic_name: "Telmisartan 40mg",
    generic_name_hi: "टेल्मिसार्टन 40 मि.ग्रा.",
    branded_example: "Telma 40 / Telmikind",
    use_case: "Hypertension (High Blood Pressure)",
    use_case_hi: "उच्च रक्तचाप (हाई ब्लड प्रेशर नियंत्रण)",
    dosage: "1 tablet daily morning after breakfast",
    dosage_hi: "1 गोली प्रतिदिन सुबह नाश्ते के बाद",
    branded_price: 135,
    generic_price: 26,
    savings_percent: 81,
  },
  {
    id: "med-7",
    generic_name: "Oral Rehydration Salts (ORS)",
    generic_name_hi: "ओआरएस (ORS) जीवनरक्षक घोल",
    branded_example: "Electral Sachet",
    use_case: "Dehydration, Loose Motions, Weakness",
    use_case_hi: "दस्त, डिहाइड्रेशन, उल्टी व पानी की कमी",
    dosage: "Dissolve 1 sachet in 1 Litre clean boiled water",
    dosage_hi: "1 पैकेट को 1 लीटर उबले ठंडे पानी में घोलकर पिएं",
    branded_price: 26,
    generic_price: 7.5,
    savings_percent: 71,
  },
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "em-108",
    title: "108 National Ambulance",
    title_hi: "108 आपातकालीन एम्बुलेंस सेवा",
    phone: "108",
    description: "24x7 Free emergency ambulance with oxygen & paramedic (Avg response: 15 mins in rural UP)",
    description_hi: "24 घंटे निःशुल्क सरकारी एम्बुलेंस (ऑक्सीजन व इमरजेंसी किट युक्त)",
    badge: "24x7 FREE",
    is_ambulance: true,
  },
  {
    id: "em-102",
    title: "102 Janani Shishu Ambulance",
    title_hi: "102 जननी-शिशु सुरक्षा एम्बुलेंस",
    phone: "102",
    description: "Free transport for pregnant mothers and newborns to Government Hospital",
    description_hi: "गर्भवती माताओं व नवजात शिशुओं को अस्पताल ले जाने व वापस लाने हेतु",
    badge: "MATERNITY",
    is_ambulance: true,
  },
  {
    id: "em-104",
    title: "104 Health Advisory Helpline",
    title_hi: "104 राज्य स्वास्थ्य परामर्श हेल्पलाइन",
    phone: "104",
    description: "Toll-free medical guidance and hospital bed availability in Uttar Pradesh",
    description_hi: "उत्तर प्रदेश स्वास्थ्य विभाग की निःशुल्क मेडिकल परामर्श व शिकायत हेल्पलाइन",
    badge: "ADVISORY",
  },
  {
    id: "em-asha",
    title: "Village ASHA Sangini",
    title_hi: "ग्राम आशा संगिनी (श्रीमती कमलेश देवी)",
    phone: "9450012345",
    description: "Primary point of care for immunizations, medicines, and delivery escort in Malihabad Gram Panchayat",
    description_hi: "गाँव में टीकाकरण, प्रसव सहायता व दवा वितरण की अधिकृत प्रभारी",
    badge: "VILLAGE LOCAL",
  },
  {
    id: "em-anm",
    title: "ANM Health Worker",
    title_hi: "एएनएम कार्यकर्ता (श्रीमती रेखा यादव)",
    phone: "9450067890",
    description: "Sub-Centre Health & Wellness Nurse, maternal care, child vaccinations",
    description_hi: "उप-स्वास्थ्य केंद्र प्रभारी नर्स, नियमित टीकाकरण व स्वास्थ्य जांच",
    badge: "SUB-CENTRE",
  },
];
