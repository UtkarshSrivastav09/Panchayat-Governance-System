# 🌾 Smart Panchayat: Gram Sahayak

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_14-App_Router-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-Vision_AI-8E75C2?style=for-the-badge&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Supabase-Database_%26_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/MapLibre_GL-Interactive_GIS-396B94?style=for-the-badge&logo=openstreetmap&logoColor=white" alt="MapLibre" />
  <img src="https://img.shields.io/badge/Language-Bilingual_(EN%2FHI)-10B981?style=for-the-badge" alt="Bilingual" />
</p>

> **Smart Panchayat: Gram Sahayak** is a next-generation AI-powered rural governance and agricultural welfare platform. It provides farmers and village administrations with instant AI crop disease diagnostics, a geospatial outbreak early warning radar, live commodity mandi rates, and direct verification of government welfare schemes.

---

## 🌟 Key Features

### 1. 🩺 AI Crop Doctor
- **Multimodal Vision Diagnostics:** Farmers take or upload photos of diseased crops or leaves for real-time analysis.
- **Google Gemini Vision Integration:** Detects crop disease, severity levels (Mild, Moderate, Severe), and pathogen root causes.
- **Actionable Treatment Plans:** Step-by-step chemical and organic remedies tailored to local farming conditions.
- **Voice-First Audio Playback:** Built-in Text-to-Speech audio readout designed for low-literacy accessibility.

### 2. 🗺️ Outbreak Map & Early Warning Radar
- **Geospatial Disease Clustering:** Automatically aggregates disease reports to identify active outbreak hotspots across villages.
- **MapLibre GL JS & OpenStreetMap:** High-performance, open-source vector map requiring no expensive proprietary API keys.
- **5 km Proximity Alerts:** Farmers within 5 km of an active outbreak receive instant dashboard alert banners with preventive spray advisories.

### 3. 💰 Live Mandi Rates & Revenue Calculator
- **Official Agmarknet Price Feed:** Live minimum, maximum, and modal wholesale prices sourced via data.gov.in.
- **Smart Sorting:** Highlights the highest-paying market in the farmer's district.
- **Produce Revenue Calculator:** Farmers input their expected harvest quantity in quintals to calculate gross revenue across nearby markets.

### 4. 🏛️ Government Schemes & Welfare Portal
- **Welfare Directory:** Comprehensive database of active and upcoming agricultural schemes including PM-KISAN, Kisan Credit Card (KCC), PM Fasal Bima Yojana (PMFBY), and Soil Health Card.
- **Category Filters:** Filter by Direct Benefit Transfer (DBT), Farm Credit, Solar Pumps, Farm Equipment, and Crop Insurance.
- **Direct Digital Application:** In-app application modal that routes farmer submissions straight to the Panchayat Officer's review queue.

### 5. 🛡️ Panchayat Officer Command Desk
- **Role-Based Access Control:** Dedicated interface for Agriculture Defense Officers and Gram Pradhans.
- **Farmer Application Verification:** Review submitted farmer scheme forms, inspect documents, and provide official one-click verification stamps.
- **Outbreak Management:** Mark active disease clusters as "Verified" or "Resolved" upon agricultural field inspection.

### 6. ⚡ Blazing-Fast Performance
- **Sub-50ms Tab Navigation:** Client-side `sessionStorage` hydration and server-side in-memory caching.
- **Background Prefetching:** Automatic route preloading ensures seamless, zero-lag page transitions.
- **Responsive Agrarian UI:** Fully optimized for mobile screens, tablets, and desktop displays with bottom navigation docks.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router), React 18 | High-performance hybrid rendering (SSR / SPA) |
| **Language** | TypeScript | Strict end-to-end type safety |
| **Styling & UI** | Tailwind CSS, Lucide React | Curated agrarian color system & accessible icons |
| **Artificial Intelligence** | Google Gemini 2.5 Flash / Vision | Multimodal crop image recognition & treatment logic |
| **Database & Auth** | Supabase PostgreSQL + PostGIS, Supabase Auth | Relational storage, geospatial clustering, and auth |
| **Object Storage** | Supabase Storage (`crop-images`) | Secure cloud storage for high-resolution crop photos |
| **Interactive Maps** | MapLibre GL JS, OpenStreetMap | Interactive GIS map with custom cluster markers |
| **Mandi Price Feed** | data.gov.in Agmarknet API | Official government wholesale commodity price data |
| **Schema Validation** | Zod | Runtime API request validation |

---

## 📂 Repository Structure

```text
smart-panchayat/
├── public/                     # Static icons, manifest, and assets
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/                # Backend API Route Handlers (Serverless)
│   │   │   ├── auth/           # Login, Register & Session APIs
│   │   │   ├── diagnose/       # Gemini AI Vision crop analysis API
│   │   │   ├── mandi/          # Mandi price proxy with memory cache
│   │   │   ├── outbreaks/      # Geospatial disease clustering API
│   │   │   ├── reports/        # Farmer diagnosis history API
│   │   │   └── weather/        # Meteorological forecast feed
│   │   ├── crop-doctor/        # AI Crop Doctor diagnosis interface
│   │   ├── dashboard/          # Farmer central dashboard
│   │   ├── login/              # Secure sign-in page
│   │   ├── mandi/              # Mandi rates & revenue calculator page
│   │   ├── my-reports/         # Farmer history & submitted applications
│   │   ├── officer/            # Panchayat Officer verification desk
│   │   ├── outbreaks/          # Outbreak radar map & alert view
│   │   ├── roadmap/            # Village digitization roadmap modules
│   │   ├── schemes/            # Government schemes directory
│   │   ├── signup/             # User registration (Farmer / Officer)
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
│   │   └── locales/            # en.json & hi.json translations
│   └── lib/                    # Shared libraries & utilities
│       ├── auth-storage.ts     # Client session management
│       ├── gemini.ts           # Google Gemini client integration
│       ├── i18n.tsx            # Context-based localization provider
│       ├── mandi.ts            # Mandi caching & normalization
│       └── supabase.ts         # Supabase client initialization
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
Create a `.env.local` file in the root directory by copying the example:
```bash
cp .env.example .env.local
```

Add your credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini Vision AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Mandi Government API (Optional; demo fallback is built-in)
DATA_GOV_API_KEY=your_data_gov_in_api_key
USE_LIVE_MANDI_API=true
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment

This project is built on Next.js 14 and is designed to deploy seamlessly on **Vercel**:

1. **Frontend & Serverless Backend:** Both frontend pages and `/api/*` endpoints deploy together on [Vercel](https://vercel.com) with zero server configuration.
2. **Database & Storage:** Hosted on [Supabase](https://supabase.com).
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next`

---

## 🏛️ Acknowledgements

Developed for the **SRiJAN 2K26** Hackathon at SRMCEM Lucknow, advancing rural digital governance and farmer empowerment.
