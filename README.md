# 🌾 GramSetu: Smart Panchayat Governance Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-App_Router-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-Vision_AI-8E75C2?style=for-the-badge&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Supabase-Database_%26_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/MapLibre_GL-Interactive_GIS-396B94?style=for-the-badge&logo=openstreetmap&logoColor=white" alt="MapLibre" />
  <img src="https://img.shields.io/badge/Language-Bilingual_(EN%2FHI)-10B981?style=for-the-badge" alt="Bilingual" />
</p>

> **GramSetu (ग्रामसेतु)** is a next-generation AI-powered rural governance and agricultural welfare platform. It provides farmers and village administrations with instant AI crop disease diagnostics, a geospatial outbreak early warning radar, live commodity mandi rates, village infrastructure works transparency, and direct verification of government welfare schemes.

---

## 🌟 Key Features & Core Pillars

### 1. 🏗️ Village Works & Development Tracker (`/village-development`)
- **Panchayat Infrastructure Transparency:** Villagers can track local development works approved by the Gram Pradhan and Block Development Officer (BDO).
- **Official Sanction Orders & Fund Tracking:** Displays authentic Work Order numbers (`WO/...`), e-GramSwaraj administrative approval IDs, and funding schemes (15th Finance Commission Tied/Untied Grants, Swachh Bharat Mission, Jal Jeevan Mission).
- **Physical Construction Progress:** Real-time visual progress bars (0% to 100%), completed milestones, and scheduled Junior Engineer (JE) inspection dates.
- **Authorized Signatories:** Complete contact profiles for the Gram Pradhan, Panchayat Secretary, and RES Junior Engineer.
- **Citizen Grievance & Delay Escalation:** Villagers can report project delays or construction quality issues directly to block authorities.
- **Gram Panchayat Filtering:** Filter projects across various districts and gram panchayats (e.g., Lucknow, Chinhat, Malihabad, Kakori, Mohanlalganj).

### 2. 🩺 AI Crop Doctor (`/crop-doctor`)
- **Multimodal Computer Vision:** Farmers capture or upload photos of affected leaves or crops for instant visual diagnosis.
- **Google Gemini 1.5 Flash Vision:** Identifies crop species, disease name, severity, and root causes in seconds.
- **Fail-Safe Offline Agronomy Engine:** If the Gemini API quota is reached or network connectivity drops, the app automatically falls back to a built-in Krishi Vigyan Kendra (KVK) verified diagnostic engine without failing or throwing error screens.
- **Actionable Dual-Language Remedies:** Step-by-step chemical treatments, low-cost organic alternatives, and expert KVK escalation guidelines in both Hindi and English.
- **Voice Playback:** Audio readouts designed for low-literacy rural accessibility.

### 3. 📡 Outbreak Map & 5km Early Warning Radar (`/outbreaks`)
- **Geospatial Disease Clustering:** Automatically aggregates field reports to detect active crop disease hotspots across villages.
- **MapLibre GL JS & OpenStreetMap:** High-performance, open-source vector map requiring no expensive proprietary API keys.
- **5 km Proximity Alerts:** Farmers located within 5 km of a verified outbreak receive high-priority alert banners on their dashboard with preventive spraying advisories.

### 4. 🏛️ Government Schemes & Welfare Portal (`/schemes`)
- **Comprehensive Scheme Directory:** Includes PM-KISAN, Kisan Credit Card (KCC), PM Fasal Bima Yojana (PMFBY), PM-KUSUM Solar Pumps, and Sub-Mission on Agricultural Mechanization (SMAM).
- **Direct Digital Application:** Interactive in-app application modal routing farmer submissions directly to the Panchayat Officer's verification desk.
- **Category Filters:** Filter by Direct Benefit Transfer (DBT), Farm Credit, Solar Pumps, Farm Equipment, and Crop Insurance.

### 5. ⚖️ Live Mandi Rates & Revenue Calculator (`/mandi`)
- **Official Agmarknet Price Feed:** Live wholesale commodity rates sourced via the government data.gov.in Agmarknet API with automatic in-memory caching.
- **Smart Market Sorting:** Highlights the highest-paying APMC market in the district.
- **Produce Revenue Estimator:** Farmers input their expected yield in quintals to compute potential gross revenue across nearby mandis.

### 6. 🧭 Development Roadmap (`/roadmap`)
- **Accessible Navigation:** Dedicated Roadmap action button with a compass symbol (`🧭`) directly on the navbar.
- **Multi-Phase Village Digitization Plan:**
  - **Phase 1 (Live):** Core Farmer Services, Gemini AI Crop Doctor, 5km Outbreak Radar.
  - **Phase 2 (Live):** Village Works Transparency, 15th Finance Commission Grants, Officer Signoffs.
  - **Phase 3 (Upcoming):** Drone-as-a-Service Spray Booking & IoT Soil Sensors.
  - **Phase 4 (Upcoming):** Micro-Cold Storage & Digital Credit Linkages.

### 7. 🛡️ Panchayat Officer Command Desk (`/officer`)
- **Role-Based Access Control:** Dedicated portal for Agricultural Extension Officers and Gram Pradhans.
- **Farmer Scheme Application Verification:** Review incoming farmer applications, inspect submitted documentation, and issue official verification sign-offs.
- **Outbreak Management:** Mark active disease clusters as "Verified by Officer" or "Resolved" following field inspections.

### 8. 🌐 Compact, Responsive Agrarian Navigation
- **Screen-Fit Design:** Compact layout designed to prevent horizontal overflow and button cut-offs on 1366px laptop screens and mobile devices.
- **Bilingual Support:** Instant one-click toggle between Hindi (हिन्दी) and English (English).
- **Mobile Bottom Navigation Dock:** Intuitive thumb-accessible dock for smartphones and tablets.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 15 (App Router), React 19 | High-performance hybrid server & client rendering |
| **Language** | TypeScript | Strict end-to-end type safety |
| **Styling & UI** | Tailwind CSS, Lucide React | Clean agrarian design system and accessible icons |
| **Artificial Intelligence** | Google Gemini 1.5 Flash Vision | Multimodal crop image recognition & disease diagnosis |
| **Fallback AI Engine** | Built-in KVK Agronomy Engine | Automatic offline & quota-exceeded fallback |
| **Database & Auth** | Supabase PostgreSQL + PostGIS, Supabase Auth | Relational storage, geospatial clustering, and auth |
| **Object Storage** | Supabase Storage (`crop-images`) | Cloud storage for crop photos |
| **Interactive Maps** | MapLibre GL JS, OpenStreetMap | Interactive GIS map with custom cluster markers |
| **Mandi Price Feed** | data.gov.in Agmarknet API | Official government wholesale commodity price data |
| **Weather Feed** | Open-Meteo API | Real-time meteorological forecasts & farming advisories |

---

## 📂 Repository Structure

```text
smart-panchayat/
├── public/                     # Static icons, manifest, and assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Backend API Route Handlers
│   │   │   ├── auth/           # Login, Register & Session APIs
│   │   │   ├── diagnose/       # Gemini AI Vision crop analysis API (with safe rate-limiting)
│   │   │   ├── mandi/          # Mandi price proxy with memory cache
│   │   │   ├── outbreaks/      # Geospatial disease clustering API
│   │   │   ├── reports/        # Farmer diagnosis history API
│   │   │   ├── schemes/        # Welfare schemes API
│   │   │   ├── village-development/ # Village works sanction & progress API
│   │   │   └── weather/        # Meteorological forecast feed API
│   │   ├── crop-doctor/        # AI Crop Doctor diagnosis interface
│   │   ├── dashboard/          # Central dashboard with weather widget & alerts
│   │   ├── login/              # Secure sign-in page
│   │   ├── mandi/              # Mandi rates & revenue calculator page
│   │   ├── my-reports/         # Farmer history & submitted applications
│   │   ├── officer/            # Panchayat Officer verification desk
│   │   ├── outbreaks/          # Outbreak radar map & alert view
│   │   ├── roadmap/            # Village digitization roadmap modules
│   │   ├── schemes/            # Government schemes directory
│   │   ├── signup/             # User registration (Farmer / Officer)
│   │   ├── village-development/# Village Works & Infrastructure Tracker
│   │   ├── layout.tsx          # Root layout & providers
│   │   └── globals.css         # Agrarian theme styling
│   ├── components/             # Reusable UI component library
│   │   ├── DiagnosisCard.tsx   # Detailed diagnosis results card
│   │   ├── LanguageToggle.tsx  # Bilingual language switcher (EN / HI)
│   │   ├── MandiTable.tsx      # Commodity price table
│   │   ├── Navbar.tsx          # Responsive navigation header & dock
│   │   ├── OutbreakMap.tsx     # MapLibre interactive map
│   │   ├── RevenueCalculator.tsx # Produce revenue estimator
│   │   └── SchemeApplicationModal.tsx # Scheme application form
│   ├── data/                   # Fallback data, locales, and crop catalog
│   │   ├── crops.ts            # Crop varieties catalog
│   │   ├── schemes.ts          # Central schemes repository
│   │   ├── village-works.ts    # Authentic Gram Panchayat sanction orders & data
│   │   └── locales/            # en.json & hi.json translations
│   └── lib/                    # Shared libraries & utilities
│       ├── auth-storage.ts     # Client session management
│       ├── gemini.ts           # Google Gemini client integration & fallback engine
│       ├── i18n.tsx            # Context-based localization provider
│       ├── mandi.ts            # Mandi caching & normalization
│       └── supabase/           # Supabase client and admin initialization
├── supabase/
│   ├── schema.sql              # Database DDL, PostGIS queries, and RLS
│   └── seed.sql                # Demo outbreak reports and clusters
├── .env.example                # Environment variables template
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm** or **yarn** / **pnpm**
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/UtkarshSrivastav09/Panchayat-Governance-System.git
cd Panchayat-Governance-System
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Configure your credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini Vision AI (Get free key at: https://aistudio.google.com/app/apikey)
USE_LIVE_GEMINI=true
GEMINI_API_KEY=AIzaSy...your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Mandi Government API (Optional; demo fallback is built-in)
DATA_GOV_API_KEY=your_data_gov_in_api_key
USE_LIVE_MANDI_API=true
MANDI_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070

# Geospatial Cluster Config
OUTBREAK_RADIUS_M=5000
OUTBREAK_WINDOW_DAYS=7
OUTBREAK_MIN_FARMERS=3
```

> **Note on Gemini API Keys:** For high-volume usage without hitting rate limits, use a free Google AI Studio key starting with `AIzaSy...` and set `GEMINI_MODEL=gemini-1.5-flash` (15 Requests/Min, 1,500 Requests/Day). If the key is omitted or the quota is reached, the portal automatically routes to the built-in KVK agronomy engine.

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
```bash
npm run build
npm run start
```

---

## 🌐 Production Deployment

This project is built on Next.js 15 and is designed to deploy seamlessly on **Vercel**:

1. **Frontend & Serverless Backend:** Both frontend pages and `/api/*` endpoints deploy together on [Vercel](https://vercel.com) with zero server configuration.
2. **Database & Storage:** Hosted on [Supabase](https://supabase.com).
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next`

---

## 🏛️ Acknowledgements

Developed for the **SRiJAN 2K26** Hackathon at SRMCEM Lucknow, advancing rural digital governance and farmer empowerment.
