// Typed client for the FastAPI AI service (Section 9.6).

import "server-only";

import { AppError } from "@/lib/errors";
import type { RiskLevel } from "@/lib/constants";

const BASE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? "";
const DEFAULT_TIMEOUT = Number(process.env.AI_TIMEOUT_MS ?? 40000);

export interface SymptomAIRequest {
  symptoms: string[];
  symptom_labels: string[];
  free_text?: string;
  age?: number | null;
  gender?: string | null;
  risk_factors?: string[];
  duration_label?: string | null;
  duration_min?: number | null;
  sudden?: boolean;
  severity?: number;
}

export interface Retrieved {
  file_name: string;
  score: number;
}

export interface SymptomAIResponse {
  status: "ok" | "non_heart" | "insufficient_knowledge" | "llm_unavailable";
  emergency: boolean;
  fired_rules: string[];
  is_heart_related: boolean;
  risk_level: RiskLevel | null;
  possible_conditions: { name: string; why: string }[];
  explanation: string;
  recommended_specialist: string | null;
  next_steps: string[];
  lifestyle_tips: string[];
  sources: string[];
  disclaimer: string;
  message: string | null;
  retrieved: Retrieved[];
}

export interface ClinicalAIRequest {
  age: number;
  sex: number;
  cp: number;
  trestbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalach: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
}

export interface ClinicalAIResponse {
  probability: number;
  risk_level: RiskLevel;
  model_version: number;
  model_versions?: number[];
}

export interface IngestResponse {
  document_id: string;
  chunks: number;
  file_type: string;
}

export interface MlVersion {
  version: number;
  algorithm: string;
  metrics: Record<string, number>;
  comparison?: unknown[];
  feature_importances?: { feature: string; importance: number }[];
  confusion_matrix?: number[][];
  trained_at?: string;
  file_path?: string;
}

export interface MlVersionsResponse {
  versions: MlVersion[];
  active_version: number | null;
  active_versions?: number[];
}

async function request<T>(
  path: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "X-Internal-Key": INTERNAL_KEY,
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new AppError(
        "AI_SERVICE_UNAVAILABLE",
        "The AI service took too long to respond.",
        502,
      );
    }
    throw new AppError(
      "AI_SERVICE_UNAVAILABLE",
      "The AI service is not reachable.",
      502,
    );
  }
  clearTimeout(timer);

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: { code?: string; message?: string; details?: unknown } }
      | null;
    const code = body?.error?.code ?? "AI_SERVICE_UNAVAILABLE";
    const message = body?.error?.message ?? "The AI service returned an error.";
    const status = response.status >= 500 ? 502 : response.status;
    throw new AppError(code as never, message, status, body?.error?.details);
  }

  return (await response.json()) as T;
}

// Flatten the FastAPI ML payload into the shape the admin UI renders.
export function normaliseMlMetrics(version: MlVersion): Record<string, unknown> {
  return {
    ...(version.metrics ?? {}),
    comparison: version.comparison ?? [],
    feature_importances: version.feature_importances ?? [],
    confusion_matrix: version.confusion_matrix ?? [],
  };
}

export function predictSymptoms(
  payload: SymptomAIRequest,
): Promise<SymptomAIResponse> {
  return request<SymptomAIResponse>("/predict/symptoms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function predictClinical(
  payload: ClinicalAIRequest,
): Promise<ClinicalAIResponse> {
  return request<ClinicalAIResponse>("/predict/clinical", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function ingestDocument(
  file: File,
  documentId: string,
): Promise<IngestResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("document_id", documentId);
  return request<IngestResponse>("/ingest", { method: "POST", body: form }, 120000);
}

export function deleteDocument(
  documentId: string,
): Promise<{ deleted_chunks: number }> {
  return request<{ deleted_chunks: number }>(`/documents/${documentId}`, {
    method: "DELETE",
  });
}

export function listMlVersions(): Promise<MlVersionsResponse> {
  return request<MlVersionsResponse>("/ml/versions", { method: "GET" });
}

export function activateMlVersion(
  version: number,
): Promise<{ active_version: number; active_versions?: number[] }> {
  return request<{ active_version: number; active_versions?: number[] }>(
    `/ml/activate/${version}`,
    { method: "POST" },
  );
}

export function deactivateMlVersion(
  version: number,
): Promise<{ active_version: number | null; active_versions?: number[] }> {
  return request<{ active_version: number | null; active_versions?: number[] }>(
    `/ml/deactivate/${version}`,
    { method: "POST" },
  );
}

export function trainModel(file?: File): Promise<MlVersion> {
  if (file) {
    const form = new FormData();
    form.append("file", file);
    return request<MlVersion>("/ml/train", { method: "POST", body: form }, 120000);
  }
  return request<MlVersion>("/ml/train", { method: "POST" }, 120000);
}

export function parseTabular(
  file: File,
): Promise<{ columns: string[]; rows: Record<string, string>[] }> {
  const form = new FormData();
  form.append("file", file);
  return request("/parse/tabular", { method: "POST", body: form }, 120000);
}

export function aiHealth(): Promise<{ status: string }> {
  return request<{ status: string }>("/health", { method: "GET" }, 5000);
}
