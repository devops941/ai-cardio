// POST /api/check - the screening orchestration (Section 9.3).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import * as ai from "@/lib/ai-client";
import { requireUser } from "@/lib/auth";
import {
  DISCLAIMER,
  DURATIONS,
  LLM_FALLBACK_MESSAGE,
  RISK_FACTORS,
  SYMPTOMS,
  type DurationId,
  type RiskLevel,
  type SymptomId,
} from "@/lib/constants";
import { AppError, errorResponse, jsonError } from "@/lib/errors";
import { buildSymptomPayload } from "@/lib/check-payload";
import { findRankedHospitals } from "@/lib/hospitals";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { bandFromProbability, fuseRisk } from "@/lib/fusion";
import { checkRedFlags } from "@/lib/red-flags";

const clinicalSchema = z.object({
  age: z.coerce.number().int().min(1).max(120),
  sex: z.coerce.number().int().min(0).max(1),
  cp: z.coerce.number().int().min(1).max(4),
  trestbps: z.coerce.number().min(80).max(250),
  chol: z.coerce.number().min(100).max(600),
  fbs: z.coerce.number().int().min(0).max(1),
  restecg: z.coerce.number().int().min(0).max(2),
  thalach: z.coerce.number().min(60).max(220),
  exang: z.coerce.number().int().min(0).max(1),
  oldpeak: z.coerce.number().min(0).max(7),
  slope: z.coerce.number().int().min(1).max(3),
  ca: z.coerce.number().int().min(0).max(3),
  thal: z.coerce.number().int().min(3).max(7),
});

const bodySchema = z
  .object({
    symptoms: z.array(z.string()).default([]),
    freeText: z.string().trim().max(1000).optional().default(""),
    age: z.coerce.number().int().min(1).max(120).optional().nullable(),
    gender: z.enum(["male", "female", "other"]).optional().nullable(),
    riskFactors: z.array(z.string()).default([]),
    duration: z.string().optional().nullable(),
    sudden: z.coerce.boolean().default(false),
    severity: z.coerce.number().int().min(1).max(10).default(1),
    consent: z.literal(true, { message: "Consent is required" }),
    clinical: clinicalSchema.partial().optional().nullable(),
    location: z
      .object({
        lat: z.coerce.number().min(-90).max(90).optional(),
        lng: z.coerce.number().min(-180).max(180).optional(),
        city: z.string().trim().max(80).optional(),
        pincode: z.string().trim().max(10).optional(),
      })
      .optional()
      .nullable(),
  })
  .superRefine((value, ctx) => {
    const unknownSymptoms = value.symptoms.filter((s) => !(s in SYMPTOMS));
    if (unknownSymptoms.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["symptoms"],
        message: `unknown symptom: ${unknownSymptoms[0]}`,
      });
    }
    const unknownFactors = value.riskFactors.filter((f) => !(f in RISK_FACTORS));
    if (unknownFactors.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["riskFactors"],
        message: `unknown risk factor: ${unknownFactors[0]}`,
      });
    }
    if (value.duration && !(value.duration in DURATIONS)) {
      ctx.addIssue({
        code: "custom",
        path: ["duration"],
        message: `unknown duration: ${value.duration}`,
      });
    }
    if (value.symptoms.length === 0 && !value.freeText) {
      ctx.addIssue({
        code: "custom",
        path: ["symptoms"],
        message: "Select at least one symptom or describe your concern",
      });
    }
  });

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const limit = rateLimit(
      `check:${user.id}`,
      Number(process.env.RATE_LIMIT_CHECK_PER_MIN ?? 10),
    );
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many checks. Please wait a moment.",
          },
        },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const rawBody = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        issue: issue.message,
      }));
      return errorResponse(
        "VALIDATION_FAILED",
        `${details[0]?.field ?? "request"} is invalid.`,
        422,
        details,
      );
    }

    const body = parsed.data;
    const symptoms = body.symptoms as SymptomId[];
    const duration = body.duration as DurationId | null | undefined;
    const durationMeta = duration ? DURATIONS[duration] : null;
    const symptomLabels = symptoms.map((s) => SYMPTOMS[s]);

    const fired = checkRedFlags({
      symptoms,
      durationMin: durationMeta?.durationMin ?? null,
      severity: body.severity,
      sudden: body.sudden,
      freeText: body.freeText,
    });
    const emergency = fired.length > 0;

    const clinical = body.clinical ?? null;
    const clinicalComplete =
      clinical != null && Object.keys(clinical).length === 13;

    const aiPayload = buildSymptomPayload({
      symptoms,
      symptomLabels,
      freeText: body.freeText,
      age: body.age,
      gender: body.gender,
      riskFactors: body.riskFactors,
      durationLabel: durationMeta?.label ?? null,
      durationMin: durationMeta?.durationMin ?? null,
      sudden: body.sudden,
      severity: body.severity,
    });

    const [symptomOutcome, clinicalOutcome] = await Promise.allSettled([
      ai.predictSymptoms(aiPayload),
      clinicalComplete
        ? ai.predictClinical(clinical as ai.ClinicalAIRequest)
        : Promise.reject(new AppError("NO_ACTIVE_MODEL", "Clinical data not supplied.", 400)),
    ]);

    let symptomResponse: ai.SymptomAIResponse | null = null;
    let llmRisk: RiskLevel | null = null;
    let aiFailed = false;

    if (symptomOutcome.status === "fulfilled") {
      symptomResponse = symptomOutcome.value;
      llmRisk = toRisk(symptomResponse.risk_level);
    } else {
      aiFailed = true;
    }

    let mlRisk: RiskLevel | null = null;
    let mlProbability: number | null = null;
    let modelVersion: number | null = null;
    let mlUnavailable = false;

    if (clinicalComplete) {
      if (clinicalOutcome.status === "fulfilled") {
        mlProbability = clinicalOutcome.value.probability;
        mlRisk = bandFromProbability(clinicalOutcome.value.probability);
        modelVersion = clinicalOutcome.value.model_version;
      } else {
        mlUnavailable = true;
      }
    }

    if (aiFailed || !symptomResponse) {
      const { finalRisk, urgent } = fuseRisk(null, mlRisk, emergency);
      const fallbackResult = {
        status: "llm_unavailable" as const,
        emergency,
        fired_rules: fired,
        is_heart_related: true,
        risk_level: null,
        possible_conditions: [],
        explanation: LLM_FALLBACK_MESSAGE,
        recommended_specialist: emergency ? "Emergency" : null,
        next_steps: [],
        lifestyle_tips: [],
        sources: [],
        disclaimer: DISCLAIMER,
        message: LLM_FALLBACK_MESSAGE,
        retrieved: [],
        mlUnavailable,
      };

      const hospitals = emergency
        ? (await findRankedHospitals({
            ...(body.location ?? {}),
            radiusKm: Number(process.env.DEFAULT_RADIUS_KM ?? 25),
            urgent,
          }))
        : { hospitals: [], meta: { mode: "none" as const, radiusKm: 25, radiusExpanded: false, urgent } };

      const prediction = await savePrediction({
        userId: user.id,
        body,
        symptoms,
        symptomLabels,
        durationMeta,
        emergency,
        fired,
        llmRisk: null,
        mlRisk,
        mlProbability,
        modelVersion,
        finalRisk,
        urgent,
        status: "llm_unavailable",
        result: fallbackResult,
      });

      return NextResponse.json({
        predictionId: prediction.id,
        status: "llm_unavailable",
        isHeartRelated: true,
        emergency,
        firedRules: fired,
        finalRisk,
        llmRisk: null,
        mlProbability,
        mlRisk,
        modelVersion,
        result: fallbackResult,
        hospitals: hospitals.hospitals,
        hospitalsMeta: hospitals.meta,
      });
    }

    const { finalRisk, urgent } = fuseRisk(llmRisk, mlRisk, emergency);
    const isHeartRelated = symptomResponse.is_heart_related;

    let hospitalResult: {
      hospitals: Awaited<ReturnType<typeof findRankedHospitals>>["hospitals"];
      meta: Awaited<ReturnType<typeof findRankedHospitals>>["meta"];
    } = {
      hospitals: [],
      meta: {
        mode: "none",
        radiusKm: Number(process.env.DEFAULT_RADIUS_KM ?? 25),
        radiusExpanded: false,
        urgent,
      },
    };

    const skipHospitals = symptomResponse.status === "non_heart" && !emergency;
    if (!skipHospitals) {
      hospitalResult = await findRankedHospitals({
        ...(body.location ?? {}),
        radiusKm: Number(process.env.DEFAULT_RADIUS_KM ?? 25),
        urgent,
      });
    }

    const result = { ...symptomResponse, mlUnavailable };

    const prediction = await savePrediction({
      userId: user.id,
      body,
      symptoms,
      symptomLabels,
      durationMeta,
      emergency,
      fired,
      llmRisk,
      mlRisk,
      mlProbability,
      modelVersion,
      finalRisk,
      urgent,
      status: symptomResponse.status,
      result,
    });

    return NextResponse.json({
      predictionId: prediction.id,
      status: symptomResponse.status,
      isHeartRelated,
      emergency,
      firedRules: fired,
      finalRisk,
      llmRisk,
      mlProbability,
      mlRisk,
      mlUnavailable,
      modelVersion,
      result,
      hospitals: hospitalResult.hospitals,
      hospitalsMeta: hospitalResult.meta,
    });
  } catch (err) {
    return jsonError(err);
  }
}

function toRisk(value: string | null | undefined): RiskLevel | null {
  if (!value) return null;
  const upper = value.toUpperCase();
  return upper === "LOW" || upper === "MODERATE" || upper === "HIGH" ? upper : null;
}

interface SaveInput {
  userId: string;
  body: z.infer<typeof bodySchema>;
  symptoms: string[];
  symptomLabels: string[];
  durationMeta: { label: string; durationMin: number } | null;
  emergency: boolean;
  fired: string[];
  llmRisk: RiskLevel | null;
  mlRisk: RiskLevel | null;
  mlProbability: number | null;
  modelVersion: number | null;
  finalRisk: RiskLevel | null;
  urgent: boolean;
  status: string;
  result: Record<string, unknown>;
}

async function savePrediction(input: SaveInput) {
  const { body } = input;
  return prisma.prediction.create({
    data: {
      userId: input.userId,
      symptoms: input.symptoms,
      symptomLabels: input.symptomLabels,
      freeText: body.freeText || null,
      age: body.age ?? null,
      gender: body.gender ?? null,
      riskFactors: body.riskFactors,
      durationLabel: input.durationMeta?.label ?? null,
      durationMin: input.durationMeta?.durationMin ?? null,
      sudden: body.sudden,
      severity: body.severity,
      emergency: input.emergency,
      firedRules: input.fired,
      llmRisk: input.llmRisk,
      mlRisk: input.mlRisk,
      mlProbability: input.mlProbability,
      finalRisk: input.finalRisk,
      urgent: input.urgent,
      explanation: (input.result.explanation as string) ?? null,
      possibleConditions: input.result.possible_conditions ?? undefined,
      recommendedSpecialist: (input.result.recommended_specialist as string) ?? null,
      nextSteps: (input.result.next_steps as string[]) ?? [],
      lifestyleTips: (input.result.lifestyle_tips as string[]) ?? [],
      sources: (input.result.sources as string[]) ?? [],
      status: input.status,
      aiMessage: (input.result.message as string) ?? null,
      retrieved: input.result.retrieved ?? undefined,
      latitude: body.location?.lat ?? null,
      longitude: body.location?.lng ?? null,
      city: body.location?.city ?? null,
      pincode: body.location?.pincode ?? null,
      modelVersion: input.modelVersion,
    },
    select: { id: true },
  });
}
