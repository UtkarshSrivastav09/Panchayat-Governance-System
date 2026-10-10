import { z } from "zod";

export const DiagnosisSchema = z.object({
  is_plant: z.boolean(),
  is_healthy: z.boolean(),
  crop_key: z.string().nullable(),
  crop_name_hi: z.string().nullable(),
  disease_key: z.string().nullable(),
  disease_name_hi: z.string().nullable(),
  disease_name_en: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  severity: z.enum(["low", "medium", "high"]).nullable(),
  symptoms_hi: z.array(z.string()).default([]),
  causes_hi: z.array(z.string()).default([]),
  prevention_hi: z.array(z.string()).default([]),
  treatment_hi: z.array(z.string()).default([]),
  organic_options_hi: z.array(z.string()).default([]),
  when_to_see_expert_hi: z.string().default(""),
  photo_quality_note_hi: z.string().nullable().default(null),
});

export type DiagnosisResult = z.infer<typeof DiagnosisSchema>;

export const DiagnoseRequestSchema = z.object({
  user_note: z.string().optional().default(""),
  lat: z.number().optional(),
  lng: z.number().optional(),
  village: z.string().optional().default("Lucknow"),
});

export const OutbreakReviewSchema = z.object({
  cluster_key: z.string().min(1),
  status: z.enum(["open", "verified", "resolved"]),
  note: z.string().optional().default(""),
});

export const MandiQuerySchema = z.object({
  state: z.string().default("UP"),
  district: z.string().default("Lucknow"),
  crop: z.string().default("Wheat"),
});
