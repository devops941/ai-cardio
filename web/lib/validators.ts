// Zod schemas for every route handler (Section 9).

import { z } from "zod";

import { DURATION_IDS, RISK_FACTOR_IDS, SYMPTOM_IDS } from "@/lib/constants";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/\d/, "Password must contain at least one digit");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: passwordRule,
  consent: z.literal(true, { message: "Consent is required" }),
  adult: z.literal(true, { message: "You must be 18 or older" }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  age: z.coerce.number().int().min(1).max(120).optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  pincode: z.string().trim().max(10).optional().or(z.literal("")),
  bloodGroup: z.string().trim().max(5).optional().or(z.literal("")),
  heightCm: z.coerce.number().min(30).max(260).optional().nullable(),
  weightKg: z.coerce.number().min(2).max(400).optional().nullable(),
  riskFactors: z.array(z.enum(RISK_FACTOR_IDS as unknown as [string, ...string[]])).optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordRule,
});

export const checkSchema = z.object({
  symptoms: z.array(z.enum(SYMPTOM_IDS as unknown as [string, ...string[]])).default([]),
  freeText: z.string().trim().max(1000).optional().default(""),
  age: z.coerce.number().int().min(1).max(120).optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  riskFactors: z
    .array(z.enum(RISK_FACTOR_IDS as unknown as [string, ...string[]]))
    .default([]),
  durationId: z.enum(DURATION_IDS as unknown as [string, ...string[]]).optional().nullable(),
  sudden: z.coerce.boolean().default(false),
  severity: z.coerce.number().int().min(1).max(10).default(1),
  clinical: z
    .object({
      age: z.coerce.number(),
      sex: z.coerce.number(),
      cp: z.coerce.number(),
      trestbps: z.coerce.number(),
      chol: z.coerce.number(),
      fbs: z.coerce.number(),
      restecg: z.coerce.number(),
      thalach: z.coerce.number(),
      exang: z.coerce.number(),
      oldpeak: z.coerce.number(),
      slope: z.coerce.number(),
      ca: z.coerce.number(),
      thal: z.coerce.number(),
    })
    .partial()
    .optional()
    .nullable(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const nearbySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  city: z.string().trim().max(80).optional(),
  pincode: z.string().trim().max(10).optional(),
  radiusKm: z.coerce.number().min(1).max(200).default(Number(process.env.DEFAULT_RADIUS_KM ?? 25)),
  risk: z.enum(["LOW", "MODERATE", "HIGH"]).optional(),
});

export const prescriptionSchema = z.object({
  doctorName: z.string().trim().min(2).max(120),
  hospitalName: z.string().trim().max(160).optional().or(z.literal("")),
  prescribedOn: z.string().datetime().optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  medicines: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        dose: z.string().trim().max(80).optional().or(z.literal("")),
        frequency: z.string().trim().max(80).optional().or(z.literal("")),
        duration: z.string().trim().max(80).optional().or(z.literal("")),
      }),
    )
    .default([]),
});

export const feedbackSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
  predictionId: z.string().optional().or(z.literal("")),
});

export const hospitalSchema = z.object({
  name: z.string().trim().min(2).max(160),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  pincode: z.string().trim().max(10).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  emergency24x7: z.coerce.boolean().default(false),
  hasCardiology: z.coerce.boolean().default(false),
  hasCathLab: z.coerce.boolean().default(false),
  rating: z.coerce.number().min(0).max(5).default(0),
  beds: z.coerce.number().int().min(0).max(10000).optional().nullable(),
  cardiologistCount: z.coerce.number().int().min(0).max(500).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const doctorSchema = z.object({
  name: z.string().trim().min(2).max(160),
  specialization: z.string().trim().max(120).optional().or(z.literal("")),
  qualification: z.string().trim().max(160).optional().or(z.literal("")),
  experienceYears: z.coerce.number().int().min(0).max(80).optional().nullable(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().max(160).optional().or(z.literal("")),
  availableDays: z.string().trim().max(120).optional().or(z.literal("")),
  consultationFee: z.coerce.number().min(0).max(100000).optional().nullable(),
  hospitalId: z.string().optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
});
