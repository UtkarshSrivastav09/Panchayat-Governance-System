-- Seed Data for Smart Panchayat: Gram Sahayak (SRiJAN 2K26 Demo)

-- 1. Insert Demo Profiles
insert into public.profiles (id, full_name, role, village, district, state, language, location)
values
  ('11111111-1111-1111-1111-111111111111', 'रामेश्वर सिंह (Farmer 1)', 'farmer', 'मलिहाबाद (Malihabad)', 'Lucknow', 'Uttar Pradesh', 'hi', ST_SetSRID(ST_MakePoint(80.7123, 26.9211), 4326)::geography),
  ('22222222-2222-2222-2222-222222222222', 'कृषि अधिकारी वर्मा (Officer)', 'officer', 'हजरतगंज (Lucknow HQ)', 'Lucknow', 'Uttar Pradesh', 'hi', ST_SetSRID(ST_MakePoint(80.9462, 26.8467), 4326)::geography),
  ('33333333-3333-3333-3333-333333333333', 'सुरेश यादव (Farmer 2)', 'farmer', 'मलिहाबाद (Malihabad)', 'Lucknow', 'Uttar Pradesh', 'hi', ST_SetSRID(ST_MakePoint(80.7245, 26.9189), 4326)::geography),
  ('44444444-4444-4444-4444-444444444444', 'जगदीश पाल (Farmer 3)', 'farmer', 'बख्शी का तालाब (BKT)', 'Lucknow', 'Uttar Pradesh', 'hi', ST_SetSRID(ST_MakePoint(80.9254, 26.9734), 4326)::geography),
  ('55555555-5555-5555-5555-555555555555', 'हरिराम मौर्य (Farmer 4)', 'farmer', 'मोहनलालगंज (Mohanlalganj)', 'Lucknow', 'Uttar Pradesh', 'hi', ST_SetSRID(ST_MakePoint(80.9856, 26.6823), 4326)::geography),
  ('66666666-6666-6666-6666-666666666666', 'दिनेश कश्यप (Farmer 5)', 'farmer', 'गोसाईंगंज (Gosainganj)', 'Lucknow', 'Uttar Pradesh', 'hi', ST_SetSRID(ST_MakePoint(81.1123, 26.7745), 4326)::geography)
on conflict (id) do update set full_name = excluded.full_name;

-- 2. Insert Crop Reports
-- Report 1: Farmer 1 - Wheat Leaf Rust (Malihabad)
insert into public.crop_reports (id, user_id, image_path, user_note, crop_key, disease_key, is_healthy, confidence, severity, diagnosis, geom, village, created_at)
values (
  'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'demo/wheat_rust_1.jpg',
  'गेहूं के पत्तों पर पीले-नारंगी धब्बे हैं और हाथ में चूर्ण लग रहा है।',
  'wheat',
  'leaf_rust',
  false,
  0.94,
  'high',
  '{
    "is_plant": true,
    "is_healthy": false,
    "crop_key": "wheat",
    "crop_name_hi": "गेहूं (Wheat)",
    "disease_key": "leaf_rust",
    "disease_name_hi": "पत्ती का रतुआ (भूरा गेरुआ)",
    "disease_name_en": "Leaf Rust (Puccinia recondita)",
    "confidence": 0.94,
    "severity": "high",
    "symptoms_hi": ["पत्तियों की ऊपरी सतह पर नारंगी-भूरे रंग के दाने।", "उंगलियों पर गेरुआ जैसा पाउडर लगना।"],
    "causes_hi": ["पक्सिनिया फफूंद का संक्रमण तथा सुबह की अधिक नमी।"],
    "prevention_hi": ["प्रतिरोधी किस्मों की बुवाई और संतुलित नाइट्रोजन।"],
    "treatment_hi": ["प्रोपिकोनाजोल 25% EC का 1 मिली/लीटर पानी में घोल छिड़कें।"],
    "organic_options_hi": ["खट्टी छाछ 5 लीटर + हींग 50 ग्राम प्रति 100 लीटर पानी।"],
    "when_to_see_expert_hi": "यदि 4 दिन बाद भी नए धब्बे दिखें तो KVK वैज्ञानिक से संपर्क करें।"
  }'::jsonb,
  ST_SetSRID(ST_MakePoint(80.7123, 26.9211), 4326)::geography,
  'मलिहाबाद (Malihabad)',
  now() - interval '2 days'
) on conflict do nothing;

-- Report 2: Farmer 2 - Wheat Leaf Rust (~1.5 km from Farmer 1 in Malihabad)
insert into public.crop_reports (id, user_id, image_path, user_note, crop_key, disease_key, is_healthy, confidence, severity, diagnosis, geom, village, created_at)
values (
  'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  'demo/wheat_rust_2.jpg',
  'पत्तियों पर हल्दी जैसे पीले चकत्ते दिख रहे हैं।',
  'wheat',
  'leaf_rust',
  false,
  0.89,
  'medium',
  '{
    "is_plant": true,
    "is_healthy": false,
    "crop_key": "wheat",
    "crop_name_hi": "गेहूं (Wheat)",
    "disease_key": "leaf_rust",
    "disease_name_hi": "पत्ती का रतुआ",
    "disease_name_en": "Leaf Rust",
    "confidence": 0.89,
    "severity": "medium",
    "symptoms_hi": ["पत्तियों पर पीले-भूरे चकत्ते।"],
    "causes_hi": ["हवा के द्वारा फफूंद के बीजाणुओं का प्रसार।"],
    "prevention_hi": ["खेत की मेड़ों को खरपतवार मुक्त रखें।"],
    "treatment_hi": ["प्रोपिकोनाजोल 1 मिली/लीटर का छिड़काव करें।"],
    "organic_options_hi": ["नीम तेल 1500 PPM का छिड़काव करें।"],
    "when_to_see_expert_hi": "कृषि रक्षा अधिकारी से सलाह लें।"
  }'::jsonb,
  ST_SetSRID(ST_MakePoint(80.7245, 26.9189), 4326)::geography,
  'मलिहाबाद (Malihabad)',
  now() - interval '1 day'
) on conflict do nothing;

-- Report 3: Farmer 4 - Healthy Wheat in Mohanlalganj
insert into public.crop_reports (id, user_id, image_path, user_note, crop_key, disease_key, is_healthy, confidence, severity, diagnosis, geom, village, created_at)
values (
  'c3333333-cccc-cccc-cccc-cccccccccccc',
  '55555555-5555-5555-5555-555555555555',
  'demo/wheat_healthy.jpg',
  'फसल की स्थिति बहुत अच्छी है।',
  'wheat',
  null,
  true,
  0.98,
  null,
  '{
    "is_plant": true,
    "is_healthy": true,
    "crop_key": "wheat",
    "crop_name_hi": "गेहूं (Wheat)",
    "disease_key": null,
    "disease_name_hi": "स्वस्थ फसल",
    "disease_name_en": "Healthy Crop",
    "confidence": 0.98,
    "severity": null,
    "symptoms_hi": ["पत्तियां हरी और तने मजबूत हैं।"],
    "causes_hi": [],
    "prevention_hi": ["उचित समय पर सिंचाई जारी रखें।"],
    "treatment_hi": [],
    "organic_options_hi": ["जीवामृत और घनजीवामृत का प्रयोग करें।"],
    "when_to_see_expert_hi": ""
  }'::jsonb,
  ST_SetSRID(ST_MakePoint(80.9856, 26.6823), 4326)::geography,
  'मोहनलालगंज (Mohanlalganj)',
  now() - interval '3 days'
) on conflict do nothing;

-- Report 4: Farmer 3 - Potato Late Blight in Bakshi Ka Talab
insert into public.crop_reports (id, user_id, image_path, user_note, crop_key, disease_key, is_healthy, confidence, severity, diagnosis, geom, village, created_at)
values (
  'd4444444-dddd-dddd-dddd-dddddddddddd',
  '44444444-4444-4444-4444-444444444444',
  'demo/potato_blight.jpg',
  'आलू के पत्तों पर काले धब्बे बन रहे हैं।',
  'potato',
  'late_blight',
  false,
  0.91,
  'high',
  '{
    "is_plant": true,
    "is_healthy": false,
    "crop_key": "potato",
    "crop_name_hi": "आलू (Potato)",
    "disease_key": "late_blight",
    "disease_name_hi": "पछेती झुलसा रोग (लेट ब्लाइट)",
    "disease_name_en": "Late Blight (Phytophthora infestans)",
    "confidence": 0.91,
    "severity": "high",
    "symptoms_hi": ["पत्तियों के किनारों पर जलने जैसे काले-भूरे धब्बे।"],
    "causes_hi": ["फाइटोफ्थोरा कवक व अत्यधिक बादल/नमी।"],
    "prevention_hi": ["प्रमाणित बीजों का प्रयोग करें।"],
    "treatment_hi": ["मेंकोजेब 2.5 ग्राम/लीटर का छिड़काव करें।"],
    "organic_options_hi": ["तांबे के बर्तन में रखी छाछ का छिड़काव करें।"],
    "when_to_see_expert_hi": "आलू की फसल में तीव्र फैलाव से पहले KVK विशेषज्ञ से मिलें।"
  }'::jsonb,
  ST_SetSRID(ST_MakePoint(80.9254, 26.9734), 4326)::geography,
  'बख्शी का तालाब (BKT)',
  now() - interval '4 days'
) on conflict do nothing;
