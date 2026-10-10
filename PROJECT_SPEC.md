# Smart Panchayat: Gram Sahayak

> Full build spec for a hackathon project (SRiJAN 2K26, SRMCEM Lucknow).
> Put this file in the repo root as `PROJECT_SPEC.md` and tell your coding agent (Antigravity) to read it first.
> Build in the order of the **Build Phases** at the end. Do not skip ahead.

---

## 0. Instructions for the AI coding agent

- Read this whole file before writing code.
- Build **only** the three modules in scope (Section 2). Everything in "Out of scope" is a roadmap slide, not code.
- Prefer a **working end-to-end demo** over extra features. After each phase, the app must run with `npm run dev` without errors.
- Use TypeScript everywhere. Validate all API input with `zod`.
- Never expose API keys to the browser. All AI and service-role calls happen in server code (route handlers).
- UI must be **mobile-first, Hindi-first, large touch targets, low bandwidth**.
- Where this spec says "verify", check the current official docs before relying on a model name, endpoint or package version.

---

## 1. Project summary

**Name:** Smart Panchayat: Gram Sahayak

**One-liner:** A Hindi, voice-first AI assistant for villages. Farmers photograph a sick crop and get a diagnosis; nearby reports become village-level outbreak alerts; live mandi prices help them decide when and where to sell.

**Users**
| Role | What they do |
|---|---|
| `farmer` | Signs up, uploads crop photos, sees diagnosis, sees outbreak alerts near them, checks mandi prices |
| `officer` | (Panchayat or agriculture officer) Sees all reports, outbreak map, can mark outbreaks as verified or resolved |

**Differentiators (be honest in the pitch; verify competitors such as Plantix, Kisan Suvidha, e-Gram Swaraj, Agmarknet before claiming anything):**
1. Hindi, voice-first, low-literacy-friendly UI.
2. Village-level outbreak early warning built from multiple farmers' reports.
3. A Panchayat/officer dashboard, not just a farmer app.
4. One flow: diagnosis, outbreak alert and mandi decision together.

---

## 2. Scope

### In scope (build these 3 modules)
1. **Crop Doctor:** photo + optional voice or text description (Hindi/English) → AI diagnosis in Hindi with treatment guidance.
2. **Outbreak Map and Alerts:** reports clustered by crop, disease, location and time; alert banner for farmers; officer dashboard.
3. **Mandi Prices and Sell Helper:** nearby mandi prices for a chosen crop plus a revenue estimate calculator.

Plus: **Authentication** with two roles, a **language toggle** (Hindi default, English), and a **PWA** setup.

### Out of scope (roadmap slide only, do NOT build)
Complaint registration and tracking, government schemes and jobs, free education content, land records (Khasra/Khatauni links), healthcare finder or online doctor, local grocery and payments, price prediction ML.

---

## 3. Tech stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | One codebase for UI and API routes |
| Styling | **Tailwind CSS + shadcn/ui** | Fast, accessible components |
| Auth | **Supabase Auth** (email + password, Google OAuth optional) | No SMS cost; phone OTP is out of scope |
| Database | **Supabase Postgres + PostGIS** | Geospatial clustering in SQL |
| File storage | **Supabase Storage** (bucket `crop-images`) | Crop photos |
| AI vision | **Gemini API** via `@google/genai` (model name from env; verify the current vision-capable model) | Image + Hindi text understanding, structured JSON output |
| Voice input | **Web Speech API** (`SpeechRecognition`, `hi-IN`) | No cost; works in Chrome on Android |
| Map | **MapLibre GL JS** + OpenStreetMap tiles | No API key needed |
| Mandi data | **data.gov.in Agmarknet API** (verify resource ID and API key) with cached fallback | Real government prices |
| Validation | **zod** | Type-safe API input |
| PWA | **Serwist** or `next-pwa` (verify which works with your Next.js version) | Installable, caches static pages |
| Image compression | **browser-image-compression** | Smaller uploads on slow networks |
| Hosting | **Vercel** (frontend + API routes) + **Supabase** (backend) | Free tiers |
| Package manager | npm | Simple |

---

## 4. Folder structure

```
gram-sahayak/
├─ PROJECT_SPEC.md
├─ .env.local                 # never commit
├─ .env.example
├─ next.config.mjs
├─ public/
│  ├─ manifest.json
│  └─ icons/
├─ supabase/
│  ├─ schema.sql              # tables, indexes, RLS, functions
│  └─ seed.sql                # demo data (see Section 11)
├─ scripts/
│  └─ seed-demo.ts            # creates demo users + reports using service role
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                     # landing
│  │  ├─ login/page.tsx
│  │  ├─ signup/page.tsx
│  │  ├─ dashboard/page.tsx           # farmer home
│  │  ├─ crop-doctor/page.tsx
│  │  ├─ my-reports/page.tsx
│  │  ├─ outbreaks/page.tsx           # map + alerts
│  │  ├─ mandi/page.tsx
│  │  ├─ officer/page.tsx             # officer dashboard (role-guarded)
│  │  ├─ roadmap/page.tsx             # static roadmap slide
│  │  └─ api/
│  │     ├─ diagnose/route.ts
│  │     ├─ reports/route.ts
│  │     ├─ outbreaks/route.ts
│  │     ├─ outbreaks/[id]/route.ts   # officer: verify / resolve
│  │     └─ mandi/route.ts
│  ├─ components/
│  │  ├─ ui/                          # shadcn components
│  │  ├─ LanguageToggle.tsx
│  │  ├─ VoiceInput.tsx
│  │  ├─ ImageUploader.tsx
│  │  ├─ DiagnosisCard.tsx
│  │  ├─ OutbreakMap.tsx
│  │  ├─ AlertBanner.tsx
│  │  ├─ MandiTable.tsx
│  │  └─ RevenueCalculator.tsx
│  ├─ lib/
│  │  ├─ supabase/{client.ts,server.ts,admin.ts,middleware.ts}
│  │  ├─ gemini.ts                    # AI call + prompt + schema
│  │  ├─ mandi.ts                     # fetch + cache + fallback
│  │  ├─ i18n.ts                      # hi/en dictionary + hook
│  │  ├─ geo.ts                       # distance helpers, location capture
│  │  └─ validators.ts                # zod schemas
│  ├─ data/
│  │  ├─ mandi-fallback.json          # cached sample prices
│  │  ├─ crops.ts                     # crop list (Hindi + English names)
│  │  └─ locales/{hi.json,en.json}
│  └─ middleware.ts                   # session refresh + route protection
└─ package.json
```

---

## 5. Environment variables

`.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only, never in client code

GEMINI_API_KEY=                   # server only
GEMINI_MODEL=                     # verify current vision-capable model name in Google AI docs

DATA_GOV_API_KEY=                 # from data.gov.in
MANDI_RESOURCE_ID=                # verify: Agmarknet "current daily price" resource id

OUTBREAK_RADIUS_M=5000
OUTBREAK_WINDOW_DAYS=7
OUTBREAK_MIN_FARMERS=3
```

---

## 6. Authentication and roles

- Supabase Auth with **email + password**. Google OAuth is optional.
- On signup, collect: name, role (`farmer` by default), village, district, state, and preferred language. Capture the user's location with the browser Geolocation API (ask permission, allow manual village entry as a fallback).
- A trigger creates a row in `profiles` after signup.
- **Officer accounts are NOT self-service.** Create them manually in the Supabase dashboard (or via the seed script) by setting `profiles.role = 'officer'`.
- `middleware.ts` refreshes the session and protects `/dashboard`, `/crop-doctor`, `/my-reports`, `/outbreaks`, `/mandi`, `/officer`. `/officer` additionally requires `role = 'officer'`.
- Add a **"Demo login"** button on the login page for the hackathon (a pre-created farmer and officer account). Remove it before any real use.

---

## 7. Database schema (`supabase/schema.sql`)

```sql
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'farmer' check (role in ('farmer','officer')),
  village text,
  district text,
  state text default 'Uttar Pradesh',
  language text not null default 'hi' check (language in ('hi','en')),
  location geography(Point,4326),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_officer()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'officer');
$$;

-- Crop reports
create table public.crop_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_path text not null,                 -- path in storage bucket crop-images
  user_note text,                           -- spoken or typed description
  crop_key text,                            -- normalized, e.g. 'wheat'
  disease_key text,                         -- normalized, e.g. 'leaf_rust'; null if healthy/unknown
  is_healthy boolean not null default false,
  confidence numeric(3,2),                  -- 0.00 to 1.00
  severity text check (severity in ('low','medium','high')),
  diagnosis jsonb not null,                 -- full structured AI output (Section 8)
  geom geography(Point,4326),
  village text,
  created_at timestamptz not null default now()
);
create index crop_reports_geom_idx on public.crop_reports using gist (geom);
create index crop_reports_recent_idx on public.crop_reports (created_at desc);
create index crop_reports_key_idx on public.crop_reports (crop_key, disease_key);

-- Officer actions on outbreaks (cluster identity is derived; this stores the human decision)
create table public.outbreak_reviews (
  id uuid primary key default gen_random_uuid(),
  cluster_key text not null unique,         -- e.g. crop_key|disease_key|rounded_lat|rounded_lng
  status text not null default 'open' check (status in ('open','verified','resolved')),
  officer_id uuid references public.profiles(id),
  note text,
  updated_at timestamptz not null default now()
);

-- Mandi cache
create table public.mandi_cache (
  cache_key text primary key,               -- e.g. 'UP|Lucknow|Wheat'
  payload jsonb not null,
  fetched_at timestamptz not null default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.crop_reports enable row level security;
alter table public.outbreak_reviews enable row level security;
alter table public.mandi_cache enable row level security;

create policy "own profile read"   on public.profiles for select using (id = auth.uid() or public.is_officer());
create policy "own profile update" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));  -- users cannot change their own role

create policy "own reports read"   on public.crop_reports for select using (user_id = auth.uid() or public.is_officer());
create policy "own reports insert" on public.crop_reports for insert with check (user_id = auth.uid());

create policy "officer manages reviews" on public.outbreak_reviews for all using (public.is_officer()) with check (public.is_officer());
create policy "anyone signed in reads reviews" on public.outbreak_reviews for select using (auth.uid() is not null);

-- mandi_cache: no policies. Only the server (service role) reads and writes it.

-- Outbreak detection: clusters recent unhealthy reports of the same crop+disease within a radius.
-- Uses UTM zone 44N (EPSG:32644), which suits Lucknow, so metres are accurate.
-- SECURITY DEFINER lets farmers see aggregate alerts without reading other farmers' reports.
create or replace function public.detect_outbreaks(
  radius_m int default 5000,
  window_days int default 7,
  min_farmers int default 3
)
returns table (
  cluster_key text,
  crop_key text,
  disease_key text,
  report_count bigint,
  farmer_count bigint,
  center_lat double precision,
  center_lng double precision,
  latest_report timestamptz
)
language sql stable security definer set search_path = public as $$
  with recent as (
    select id, user_id, crop_key, disease_key, geom::geometry as g, created_at,
           ST_ClusterDBSCAN(ST_Transform(geom::geometry, 32644), eps := radius_m, minpoints := 1)
             over (partition by crop_key, disease_key) as cid
    from crop_reports
    where created_at > now() - make_interval(days => window_days)
      and is_healthy = false
      and disease_key is not null
      and geom is not null
  )
  select
    crop_key || '|' || disease_key || '|' || cid as cluster_key,
    crop_key, disease_key,
    count(*) as report_count,
    count(distinct user_id) as farmer_count,
    ST_Y(ST_Centroid(ST_Collect(g))) as center_lat,
    ST_X(ST_Centroid(ST_Collect(g))) as center_lng,
    max(created_at) as latest_report
  from recent
  group by crop_key, disease_key, cid
  having count(distinct user_id) >= min_farmers;
$$;
```

> Note: `cluster_key` uses the DBSCAN cluster id, which can change between runs. For the officer review table, store the key as `crop|disease|round(lat,2)|round(lng,2)` computed in the API layer from the cluster centre instead. Keep it simple and consistent.

**Storage:** create a private bucket `crop-images`. Policy: authenticated users can upload to `<user_id>/*`; officers can read all; farmers read their own. Serve images through signed URLs.

---

## 8. AI diagnosis

### Flow (`POST /api/diagnose`)
1. Validate the session and input (image file, optional `note`, optional `lat`, `lng`, `village`).
2. Enforce limits: JPEG/PNG/WebP only, max 4 MB after client-side compression, per-user rate limit (for example 10 requests per hour).
3. Upload the image to Supabase Storage under `<user_id>/<uuid>.jpg`.
4. Call Gemini with the image, the farmer's note and the system prompt below, requesting **JSON that matches the schema**.
5. Validate the response with zod. If invalid, retry once, then return a friendly error.
6. Normalize `crop_key` and `disease_key` (lowercase, snake_case, English). Map synonyms to a fixed list in `data/crops.ts` where possible so clustering works.
7. Insert into `crop_reports` and return the diagnosis to the client.

### Output schema (zod)
```ts
{
  is_plant: boolean,               // false if the photo is not a plant
  is_healthy: boolean,
  crop_key: string | null,         // english, snake_case, e.g. "wheat"
  crop_name_hi: string | null,
  disease_key: string | null,      // english, snake_case, e.g. "leaf_rust"; null when healthy/unknown
  disease_name_hi: string | null,
  disease_name_en: string | null,
  confidence: number,              // 0 to 1
  severity: "low" | "medium" | "high" | null,
  symptoms_hi: string[],
  causes_hi: string[],
  prevention_hi: string[],
  treatment_hi: string[],          // practical steps; mention organic options when available
  organic_options_hi: string[],
  when_to_see_expert_hi: string,
  photo_quality_note_hi: string | null   // e.g. "photo blurry, take another in daylight"
}
```

### System prompt (put in `lib/gemini.ts`)
```
You are a crop health assistant for small farmers in Uttar Pradesh, India.
Look at the photo and the farmer's note. Identify the crop and the most likely disease,
pest or nutrient problem. Reply ONLY with JSON that matches the provided schema.

Rules:
- Write all user-facing fields in simple Hindi that a village farmer understands. Avoid jargon.
- If the image is not a plant, set is_plant=false and ask for a clearer photo.
- If the photo is blurry or you are not sure, lower the confidence and say so in photo_quality_note_hi.
- Never invent certainty. If confidence is below 0.5, say the cause is unclear.
- Do not recommend exact chemical doses. Mention the type of treatment, suggest low-risk and organic options first,
  and always tell the farmer to confirm with the local agriculture officer or Krishi Vigyan Kendra (KVK) before spraying.
- Use English snake_case for crop_key and disease_key.
```

### Safety text (always shown in the UI under the result)
> "यह जानकारी केवल सहायता के लिए है। दवा छिड़कने से पहले अपने कृषि अधिकारी या KVK से पुष्टि ज़रूर करें।"

Show **confidence** as a visible badge. Low confidence shows a warning colour.

---

## 9. Outbreak detection and alerts

- Run `detect_outbreaks()` from `GET /api/outbreaks` using values from the env (`OUTBREAK_RADIUS_M`, `OUTBREAK_WINDOW_DAYS`, `OUTBREAK_MIN_FARMERS`).
- Count **distinct farmers**, not just reports, so one person cannot trigger an alert.
- For farmers, return only aggregates: crop, disease, counts, approximate centre (round to ~2 decimals), latest time. **Never return other farmers' names, photos or exact positions.**
- For officers, also return the list of contributing report IDs and thumbnails (signed URLs).
- `AlertBanner`: on the farmer dashboard, show a banner if any cluster centre is within 10 km of the user's location. Example: "आपके पास 3 खेतों में गेहूं में पत्ती का रतुआ रोग मिला है। अपनी फसल जाँचें।"
- `/outbreaks`: MapLibre map with markers sized by farmer count, coloured by severity or recency. Tapping a marker shows the crop, disease, number of farmers and last report time.
- Officer actions: mark a cluster `verified` or `resolved` with a note. Verified clusters show a "Verified by officer" badge to everyone.
- Disclaimer: alerts are early warnings based on farmer reports, not official confirmation.

---

## 10. Mandi prices and sell helper

### `GET /api/mandi?state=UP&district=Lucknow&crop=Wheat`
1. Check `mandi_cache` for `state|district|crop` less than 6 hours old; return it if fresh.
2. Otherwise call the data.gov.in API. Use the env `MANDI_RESOURCE_ID` and `DATA_GOV_API_KEY` (verify the dataset, field names and filter syntax in the current docs; fields usually include state, district, market, commodity, variety, arrival date, min price, max price and modal price).
3. If the request fails or returns nothing, use `data/mandi-fallback.json` and flag `source: "sample"` so the UI shows "नमूना डेटा (Sample data)". **Never invent prices.**
4. Return: market, variety, min, max, modal price (₹ per quintal), arrival date, and the distance from the user if market coordinates are known (optional).

### UI (`/mandi`)
- Crop selector with Hindi and English names, district selector (default: user's district).
- Table of nearby mandis sorted by modal price, best price highlighted, price date shown.
- **Revenue Calculator:** inputs are quantity (quintals) and selected mandi price; output is estimated revenue, and the difference versus the lowest-priced mandi.
- Always display: "यह अनुमान है, गारंटी नहीं। (Estimate, not a guarantee.)" Do **not** add price prediction.

---

## 11. Demo seed data (critical for the live demo)

`scripts/seed-demo.ts` (service-role client):
1. Create demo accounts:
   - Farmer: `farmer@demo.com` / a password you choose
   - Officer: `officer@demo.com` / a password you choose
   - 4 more farmer accounts (`farmer2` to `farmer5`) with different villages near Lucknow (for example Malihabad, Mohanlalganj, Bakshi Ka Talab, Gosainganj, Itaunja).
2. Insert **2 existing wheat leaf-rust reports** from 2 different farmers within ~3 km of each other, using realistic diagnosis JSON and sample images.
3. Insert one unrelated healthy report and one different-disease report elsewhere (so the map is not one-note).
4. Leave **one more report to be submitted live** during the pitch. This pushes the cluster to 3 distinct farmers, and the alert appears on the map.
5. Create `data/mandi-fallback.json` with sample wheat, rice, potato, sugarcane and mustard prices for 4 or 5 Lucknow-area mandis, clearly marked as sample data.
6. Keep 3 tested crop photos that reliably give a clean result.

---

## 12. UI and UX requirements

- **Hindi default**, English toggle in the header. Store the choice in `profiles.language` and in a cookie.
- Mobile-first, big buttons (min 48 px), high contrast, simple icons, minimal text.
- Every screen has a mic button for voice input where text is expected. Provide a text fallback when speech recognition is unavailable.
- **Crop Doctor screen:** camera/gallery picker → compress client-side → optional voice note → "जाँच करें" button → loading state with Hindi message → `DiagnosisCard`.
- `DiagnosisCard`: crop and disease (Hindi + English), confidence badge, severity chip, sections (symptoms, causes, prevention, treatment, organic options), expert warning, and a "read aloud" button using `speechSynthesis` with `hi-IN` if the voice is available.
- Empty, loading and error states for every page.
- Accessibility: labels on all inputs, focus states, no colour-only meaning.
- PWA: `manifest.json` (name, icons, `display: standalone`, theme colour), service worker caching static assets and the last successful mandi response.

---

## 13. Security and safety checklist

- [ ] RLS enabled on every table; test with a farmer account that it cannot read other farmers' rows.
- [ ] Service-role key and Gemini key only in server code.
- [ ] Users cannot change their own `role`.
- [ ] Zod validation on all inputs; reject oversized or non-image uploads.
- [ ] Rate limit `/api/diagnose` per user.
- [ ] Private storage bucket with signed URLs.
- [ ] Location is shown to other farmers only as an approximate cluster centre.
- [ ] Medical-style disclaimer on every diagnosis.
- [ ] Remove the "Demo login" button and demo accounts for any real deployment.

---

## 14. Build phases (give these to Antigravity one at a time)

**Phase 1: Foundation**
Create the Next.js (App Router, TypeScript) project with Tailwind and shadcn/ui. Add Supabase clients, `middleware.ts`, env handling, the i18n dictionary with a language toggle, and the base layout (mobile-first). Create the landing page and the roadmap page. *Done when:* the app runs and the language toggle works.

**Phase 2: Database and auth**
Run `supabase/schema.sql`. Build `/signup` and `/login` with the profile fields, location capture, role-based route protection and the officer guard. *Done when:* a farmer and an officer can log in and see different pages, and RLS blocks cross-user reads.

**Phase 3: Crop Doctor**
Build `ImageUploader` (compression), `VoiceInput`, `/api/diagnose` with the Gemini call, zod validation and storage upload, plus `DiagnosisCard` and `/my-reports`. *Done when:* a photo plus a Hindi voice note returns a Hindi diagnosis and is saved.

**Phase 4: Outbreaks**
Add `detect_outbreaks`, `/api/outbreaks`, `OutbreakMap`, `AlertBanner` and the officer dashboard with verify/resolve. *Done when:* three reports from three seeded farmers create a visible cluster and an alert.

**Phase 5: Mandi**
Build `lib/mandi.ts` with caching and fallback, `/api/mandi`, `MandiTable` and `RevenueCalculator`. *Done when:* prices show for a chosen crop with a clear sample-data label when the API is unavailable.

**Phase 6: Seed and polish**
Write the seed script and demo data, add the PWA manifest and service worker, handle loading and error states, and run the security checklist. *Done when:* the full demo script (Section 15) runs without errors on a phone.

**Phase 7: Deploy and rehearse**
Deploy to Vercel, add env vars, and test on a real Android phone over mobile data. Record a backup screen recording and take screenshots in case the venue network fails.

---

## 15. Demo script (3 minutes)

1. Log in as a farmer (Hindi UI). Say the problem in one sentence.
2. Open **Crop Doctor**, speak a Hindi note ("गेहूं के पत्तों पर पीले-नारंगी धब्बे हैं"), upload the prepared photo.
3. Show the **Hindi diagnosis**, confidence badge and the "confirm with an expert" warning. Tap "read aloud".
4. Open **Outbreaks**. Point to the existing 2-report cluster, then submit the third report live. The alert banner and the cluster marker appear.
5. Switch to the **officer** view and mark the cluster as verified.
6. Open **Mandi**: choose wheat, compare mandis, use the revenue calculator.
7. Close on the roadmap page: complaints, schemes, education, land records and healthcare.

---

## 16. Known limitations (say these openly)

- Photo-based diagnosis is not perfect, especially in real field conditions; confidence and an expert check are always shown.
- Outbreak alerts depend on enough farmers reporting; they are early warnings, not official confirmation.
- Mandi data depends on the government API's availability and freshness; a sample dataset is used as a labelled fallback.
- Speech recognition quality varies by browser and phone.
- This is a hackathon prototype, not a production system.

---

## 17. Roadmap (not built)

Complaint registration and tracking with photo and routing; government schemes and job finder; free education content; land records links; healthcare finder and e-Sanjeevani links; local grocery; WhatsApp bot; offline-first sync; regional languages; officer SMS alerts.
