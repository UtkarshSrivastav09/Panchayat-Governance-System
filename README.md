# 🌾 Smart Panchayat: Gram Sahayak (स्मार्ट पंचायत: ग्राम सहायक)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_14-App_Router-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-Vision_AI-8E75C2?style=for-the-badge&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Supabase-Database_%26_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/MapLibre_GL-Interactive_GIS-396B94?style=for-the-badge&logo=openstreetmap&logoColor=white" alt="MapLibre" />
  <img src="https://img.shields.io/badge/Language-हिन्दी_First_%7C_English-10B981?style=for-the-badge" alt="Bilingual" />
</p>

> **स्मार्ट पंचायत: ग्राम सहायक** ग्रामीण भारत और किसानों के लिए तैयार किया गया एक नेक्स्ट-जेनरेशन डिजिटल कृषि कल्याण व प्रशासनिक पोर्टल है। यह किसानों को AI-आधारित फसल रोग निदान, गाँव-स्तर का प्रकोप पूर्व-चेतावनी रडार, वास्तविक समय मंडी भाव, तथा सरकारी योजनाओं के सीधे सत्यापन की सुविधा प्रदान करता है।

---

## 🌟 Key Features (मुख्य विशेषताएं)

### 1. 🩺 AI Crop Doctor (आर्टिफिशियल इंटेलिजेंस फसल डॉक्टर)
- **मल्टीमॉडल विज़न विश्लेषण:** किसान फसल या बीमार पत्ती की फोटो अपलोड करके अथवा कैमरा से क्लिक करके तुरंत जांच कर सकते हैं।
- **Google Gemini Vision AI Integration:** फसल के रोग की सटीक पहचान, गंभीरता (Mild / Moderate / Severe), तथा रोग का कारण।
- **द्विभाषी उपचार निर्देश:** रासायनिक (Chemical) एवं जैविक/पारंपरिक (Organic) उपचार के स्पष्ट, क्रमबद्ध निर्देश।
- **वॉइस-फर्स्ट व ऑडियो प्लेबैक:** कम साक्षरता वाले किसान साथियों के लिए पूरे निदान का टेक्स्ट-टू-स्पीच (Text-to-Speech) ऑडियो समर्थन।

### 2. 🗺️ Outbreak Map & Early Warning Radar (रोग प्रकोप मानचित्र व रडार)
- **जियो-स्पेशियल क्लस्टरिंग:** किसानों द्वारा अपलोड की गई रिपोर्टों के आधार पर रोग प्रकोप के हॉटस्पॉट स्वचालित रूप से मैप पर बनते हैं।
- **MapLibre GL JS + OpenStreetMap:** हाई-परफॉर्मेंस, बिना किसी अतिरिक्त शुल्क का आधुनिक इंटरएक्टिव मानचित्र।
- **5 किमी परिधि अलर्ट:** किसान के 5 किलोमीटर के दायरे में रोग फैलने पर डैशबोर्ड पर तत्काल चेतावनी बैनर और रोकथाम की सलाह।

### 3. 💰 Live Mandi Rates & Revenue Calculator (लाइव मंडी भाव व विक्रय कैलकुलेटर)
- **Agmarknet (data.gov.in) सरकारी डेटा:** उत्तर प्रदेश एवं विभिन्न जिलों की मंडियों के दैनिक मॉडल, न्यूनतम व अधिकतम मूल्य।
- **स्मार्ट छंटाई:** सर्वोच्च मूल्य देने वाली निकटतम मंडी का त्वरित चयन।
- **राजस्व कैलकुलेटर:** किसान अपनी उपज की मात्रा (क्विंटल) दर्ज करके संभावित कमाई का तुरंत हिसाब लगा सकते हैं।

### 4. 🏛️ Government Schemes & Welfare Portal (सरकारी योजनाएं व कल्याणकारी सेवाएं)
- **व्यापक डायरेक्टरी:** PM-KISAN, किसान क्रेडिट कार्ड (KCC), PM फसल बीमा योजना (PMFBY), सॉयल हेल्थ कार्ड, सोलर पम्प सब्सिडी आदि की सम्पूर्ण जानकारी।
- **श्रेणीवार फ़िल्टरिंग:** DBT, ऋण, सौर ऊर्जा, कृषि यंत्र, व बीमा योजनाओं की लाइव व आगामी स्थिति।
- **डायरेक्ट ऑनलाइन आवेदन:** पोर्टल से सीधे आवेदन फॉर्म भरें, जो सीधे ग्राम प्रधान / कृषि रक्षा अधिकारी के सत्यापन डेस्क पर जाता है।

### 5. 🛡️ Panchayat Officer Command Desk (ग्राम पंचायत अधिकारी कमांड पोर्टल)
- **अधिकारी लॉगिन (Role-Based Access):** कृषि रक्षा अधिकारी और ग्राम प्रधान के लिए विशेष नियंत्रण कक्ष।
- **आवेदन सत्यापन डेस्क:** किसानों द्वारा भरे गए सरकारी योजना आवेदनों की समीक्षा, दस्तावेजों का मिलान तथा 1-क्लिक आधिकारिक सत्यापन।
- **प्रकोप प्रबंधन:** प्रकोप क्लस्टरों को "सत्यापित (Verified)" या "समाधानित (Resolved)" मार्क करने की सुविधा।

### 6. ⚡ Blazing-Fast Performance & UX
- **सब-50ms टैब स्विचिंग:** इन-मेमोरी सर्वर कैशिंग और क्लाइंट-साइड `sessionStorage` इंस्टेंट हाइड्रेशन।
- **Background Prefetching:** नेविगेशन लिंक पर बैकग्राउंड प्रीफेच जिससे पेज बिना किसी लोडिंग लैग के खुलते हैं।
- **100% रिस्पॉन्सिव डिज़ाइन:** मोबाइल बॉटम डॉक, टैबलेट सपोर्ट, और डेस्कटॉप के लिए अनुकूलित आधुनिक Agrarian UI।

---

## 🛠️ Technology Stack (तकनीकी संरचना)

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router), React 18 | SSR, ISR & Client SPA navigation |
| **Language** | TypeScript | पूर्ण टाइप-सेफ्टी व सुगम विकास |
| **Styling & Icons** | Tailwind CSS, Lucide React | मॉडर्न विजुअल डिज़ाइन व सुलभ आइकन्स |
| **Artificial Intelligence** | Google Gemini 2.5 Flash / Vision API | इमेज एनालिसिस व रोग डायग्नोसिस |
| **Database & Auth** | Supabase Postgres + PostGIS, Supabase Auth | रिलेशनल डेटा, जियो-लोकेशन क्लस्टरिंग व ऑथेंटिकेशन |
| **Storage** | Supabase Storage (`crop-images` bucket) | उच्च-रिज़ॉल्यूशन फसल तस्वीरों का सुरक्षित स्टोरेज |
| **Interactive Maps** | MapLibre GL JS, OpenStreetMap | ओपन-सोर्स इंटरेक्टिव क्लस्टर मैप |
| **Mandi Price Feed** | data.gov.in Agmarknet API | आधिकारिक सरकारी मंडी मूल्य डेटा |
| **Validation** | Zod | स्ट्रिक्ट स्कीमा वैलिडेशन |

---

## 📂 Project Structure (परियोजना संरचना)

```text
smart-panchayat/
├── public/                     # Static assets & icons
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/                # API Route Handlers
│   │   │   ├── auth/           # Login, Register & Session APIs
│   │   │   ├── diagnosis/      # Gemini AI Crop Analysis API
│   │   │   ├── mandi/          # Mandi commodity price proxy
│   │   │   ├── outbreaks/      # Geospatial outbreaks clustering API
│   │   │   ├── reports/        # Diagnosis reports history API
│   │   │   └── weather/        # Weather forecast feed
│   │   ├── crop-doctor/        # AI Crop Doctor diagnosis page
│   │   ├── dashboard/          # Farmer central dashboard
│   │   ├── login/              # Secure sign-in portal
│   │   ├── mandi/              # Mandi rates & revenue calculator
│   │   ├── my-reports/         # Historical reports & applied schemes
│   │   ├── officer/            # Panchayat officer verification desk
│   │   ├── outbreaks/          # Interactive outbreak map & alert radar
│   │   ├── roadmap/            # Upcoming Panchayat digitization modules
│   │   ├── schemes/            # Government schemes directory & apply modal
│   │   ├── signup/             # New user registration (Farmer / Officer)
│   │   ├── layout.tsx          # Root layout & providers
│   │   └── globals.css         # Agricultural theme tokens & gradients
│   ├── components/             # Reusable UI components
│   │   ├── DiagnosisCard.tsx   # Detailed diagnosis view card
│   │   ├── LanguageToggle.tsx  # Hindi / English live switch
│   │   ├── MandiTable.tsx      # Commodity price table
│   │   ├── Navbar.tsx          # Navigation header & mobile dock
│   │   ├── OutbreakMap.tsx     # MapLibre interactive map
│   │   ├── RevenueCalculator.tsx# Yield profit calculator
│   │   └── SchemeApplicationModal.tsx # Scheme direct application modal
│   ├── data/                   # Fallback data, locales & crop catalog
│   │   ├── crops.ts            # Crop varieties metadata
│   │   ├── schemes.ts          # Central schemes directory
│   │   └── locales/            # hi.json & en.json i18n dictionaries
│   └── lib/                    # Core utilities & API clients
│       ├── auth-storage.ts     # Session state & localStorage sync
│       ├── gemini.ts           # Google Gemini AI vision caller
│       ├── i18n.tsx            # Context-based translation engine
│       ├── mandi.ts            # Mandi caching & data parser
│       └── supabase.ts         # Supabase client initializer
├── supabase/
│   ├── schema.sql              # Database DDL, PostGIS functions & RLS
│   └── seed.sql                # Demo outbreak reports & verified clusters
├── .env.example                # Environment variables template
├── package.json                # Project dependencies & scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Getting Started (शुरुआत कैसे करें)

### 1. Prerequisites (आवश्यकताएं)
- **Node.js**: v18.17.0 या उससे नया
- **npm** या **yarn** / **pnpm**
- **Git**

### 2. Clone the Repository (रिपॉजिटरी क्लोन करें)
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd "Smart Panchayat"
```

### 3. Install Dependencies (निर्भरताएं स्थापित करें)
```bash
npm install
```

### 4. Setup Environment Variables (पर्यावरण चर कॉन्फ़िगर करें)
`.env.example` की एक प्रति बनाकर उसे `.env.local` नाम दें:
```bash
cp .env.example .env.local
```

`.env.local` में अपनी कुंजियाँ दर्ज करें:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini Vision AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Mandi Government API (Optional live key; demo fallback is built-in)
DATA_GOV_API_KEY=your_data_gov_in_api_key
USE_LIVE_MANDI_API=true
```

### 5. Start Development Server (डेवलपमेंट सर्वर शुरू करें)
```bash
npm run dev
```

ब्राउज़र में खोलें: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Production Build & Deployment (प्रोडक्शन बिल्ड)

उत्पादन वातावरण (Production) के लिए प्रोजेक्ट को कंपाइल और सत्यापित करने हेतु:
```bash
# 1. Type-Check and Build Bundle
npm run build

# 2. Run Production Server
npm run start
```

---

## 🏛️ Acknowledgements & Hackathon

यह प्रोजेक्ट **SRiJAN 2K26** (SRMCEM Lucknow) हैकाथॉन के लिए ग्रामीण सशक्तिकरण और डिजिटल पंचायती राज के उद्देश्य से विकसित किया गया है।

Developed with ❤️ for Indian Agriculture and Rural Development.
