"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  Heart,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import {
  CLINICAL_FIELDS,
  DISCLAIMER,
  DURATIONS,
  DURATION_IDS,
  RISK_FACTORS,
  RISK_FACTOR_IDS,
  SYMPTOMS,
  SYMPTOM_IDS,
} from "@/lib/constants";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Gender = "male" | "female" | "other";

interface FormState {
  symptoms: string[];
  durationId: string;
  sudden: boolean;
  severity: number;
  freeText: string;
  age: string;
  gender: Gender | "";
  riskFactors: string[];
  clinical: Record<string, string>;
  useClinical: boolean;
  mode: "geo" | "manual";
  lat: number | null;
  lng: number | null;
  city: string;
  pincode: string;
  consent: boolean;
}

const EMPTY: FormState = {
  symptoms: [],
  durationId: "",
  sudden: false,
  severity: 5,
  freeText: "",
  age: "",
  gender: "",
  riskFactors: [],
  clinical: {},
  useClinical: false,
  mode: "manual",
  lat: null,
  lng: null,
  city: "",
  pincode: "",
  consent: false,
};

const STEP_INFO = [
  { label: "Symptoms", icon: HeartPulse },
  { label: "Profile", icon: User },
  { label: "Clinical Labs", icon: Activity },
  { label: "Location & Consent", icon: MapPin },
];

const PROGRESS_KEYS = [
  "Evaluating deterministic emergency red flags (RF-01 to RF-08)...",
  "Running Random Forest risk model on clinical features...",
  "Retrieving grounded cardiology context from ChromaDB...",
  "Ranking nearby emergency cardiac hospital centers...",
];

const SEVERITY_TONE = (value: number) => {
  if (value <= 3) return { label: "Mild", text: "text-emerald-700", bar: "from-emerald-400 to-emerald-600" };
  if (value <= 6) return { label: "Moderate", text: "text-amber-700", bar: "from-amber-400 to-amber-600" };
  return { label: "Severe", text: "text-[var(--cardiac-700)]", bar: "from-[var(--cardiac-500)] to-[var(--cardiac-700)]" };
};

export function CheckWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);

  useEffect(() => {
    apiFetch<{ user: { profile: { city: string | null } | null } }>("/api/profile")
      .then((data) => {
        const city = data.user.profile?.city ?? "";
        if (city) setForm((prev) => ({ ...prev, city }));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!submitting) return;
    const timer = setInterval(() => {
      setProgressIndex((index) => Math.min(index + 1, PROGRESS_KEYS.length - 1));
    }, 1800);
    return () => clearInterval(timer);
  }, [submitting]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggle = (key: "symptoms" | "riskFactors", value: string) =>
    setForm((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });

  const stepValid = useMemo(() => {
    if (step === 0) return form.symptoms.length > 0 || form.freeText.trim().length > 0;
    if (step === 1)
      return form.age !== "" && Number(form.age) >= 1 && Number(form.age) <= 120 && form.gender !== "";
    if (step === 2) {
      if (!form.useClinical) return true;
      return CLINICAL_FIELDS.every((field) => {
        const value = form.clinical[field.name];
        if (value === undefined || value === "") return false;
        const n = Number(value);
        return Number.isFinite(n) && n >= field.min && n <= field.max;
      });
    }
    return form.consent;
  }, [step, form]);

  function shareLocation() {
    setLocationNote(null);
    if (!navigator.geolocation) {
      setLocationNote(t("check.locationDenied"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          mode: "geo",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
      },
      () => {
        setForm((prev) => ({ ...prev, mode: "manual" }));
        setLocationNote(t("check.locationDenied"));
      },
      { timeout: 10000 },
    );
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    setProgressIndex(0);

    const location =
      form.mode === "geo" && form.lat != null && form.lng != null
        ? { lat: form.lat, lng: form.lng }
        : form.city || form.pincode
          ? { city: form.city || undefined, pincode: form.pincode || undefined }
          : null;

    const clinical = form.useClinical
      ? Object.fromEntries(
          CLINICAL_FIELDS.map((field) => [field.name, Number(form.clinical[field.name])]),
        )
      : null;

    try {
      const data = await apiFetch<{ predictionId: string }>("/api/check", {
        method: "POST",
        body: JSON.stringify({
          symptoms: form.symptoms,
          freeText: form.freeText,
          age: form.age ? Number(form.age) : null,
          gender: form.gender || null,
          riskFactors: form.riskFactors,
          duration: form.durationId || null,
          sudden: form.sudden,
          severity: form.severity,
          consent: form.consent,
          clinical,
          location,
        }),
      });
      router.push(`/result/${data.predictionId}`);
    } catch (err) {
      setSubmitting(false);
      const message = err instanceof Error ? err.message : t("errors.generic");
      setError(message);
    }
  }

  // ---- Loading state ----
  if (submitting) {
    return (
      <Card className="mx-auto max-w-xl overflow-hidden">
        <div className="h-1.5 w-full bg-[var(--cardiac-100)]">
          <div className="shimmer-bar h-full w-full" />
        </div>
        <CardContent className="space-y-6 px-6 py-12 text-center" aria-live="polite">
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--cardiac-50)] shadow-inner">
            <span className="absolute inset-0 rounded-3xl border-2 border-[var(--cardiac-400)]/40 animate-ring-ping" />
            <Heart aria-hidden className="h-11 w-11 animate-heartbeat fill-[var(--cardiac-600)]/20 text-[var(--cardiac-600)]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight text-[var(--ink-900)]">
              Analyzing Cardiovascular Biomarkers
            </h3>
            <p className="text-xs text-[var(--ink-500)]">
              Running multi-layer guardrails, ML inference, and hospital geo-ranking
            </p>
          </div>

          <div className="mx-auto max-w-md space-y-3 border-t border-[var(--cardiac-100)] pt-6 text-left">
            {PROGRESS_KEYS.map((message, index) => {
              const isPast = index < progressIndex;
              const isCurrent = index === progressIndex;
              return (
                <div
                  key={message}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl p-3 text-xs font-semibold transition-all duration-300",
                    isCurrent
                      ? "border border-[var(--cardiac-200)] bg-[var(--cardiac-50)] text-[var(--cardiac-900)]"
                      : isPast
                        ? "text-emerald-800"
                        : "text-[var(--ink-300)] opacity-60",
                  )}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--cardiac-600)] animate-ping" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink-300)]" />
                    )}
                  </span>
                  <span className="leading-snug">{message}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = ((step + 1) / STEP_INFO.length) * 100;
  const severityTone = SEVERITY_TONE(form.severity);

  return (
    <Card className="mx-auto max-w-4xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[var(--cardiac-700)] via-[var(--cardiac-600)] to-[var(--cardiac-800)] p-6 text-white sm:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
              <HeartPulse className="h-6 w-6 animate-heartbeat text-white" />
            </span>
            <div>
              <h1 className="text-lg font-black tracking-tight sm:text-xl">
                Heart Symptom &amp; Risk Assessment
              </h1>
              <p className="mt-0.5 text-xs text-[var(--cardiac-100)]">
                Step {step + 1} of {STEP_INFO.length}: {STEP_INFO[step].label}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold backdrop-blur-md">
            {progressPercent.toFixed(0)}% complete
          </span>
        </div>

        <div className="relative mt-6 h-2 w-full overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-white to-[var(--cardiac-100)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="relative mt-4 grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
          {STEP_INFO.map((item, index) => {
            const Icon = item.icon;
            const active = index === step;
            const done = index < step;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => (index < step ? setStep(index) : undefined)}
                disabled={index > step}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all",
                  active
                    ? "bg-white font-bold text-[var(--cardiac-800)] shadow-sm"
                    : done
                      ? "cursor-pointer bg-white/20 text-white hover:bg-white/30"
                      : "text-white/50",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="hidden h-3.5 w-3.5 sm:inline" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <CardContent className="space-y-8 p-6 sm:p-8">
        {error ? <Alert tone="error">{error}</Alert> : null}

        {/* STEP 1 — Symptoms */}
        {step === 0 ? (
          <div className="space-y-6">
            <div>
              <Label className="block text-base font-bold text-[var(--ink-900)]">
                Select any heart-related symptoms you are experiencing
              </Label>
              <p className="mt-1 text-xs text-[var(--ink-500)]">
                Choose all that apply, or describe your concern in the text box below.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SYMPTOM_IDS.map((id) => {
                const selected = form.symptoms.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle("symptoms", id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-150",
                      selected
                        ? "border-[var(--cardiac-500)] bg-[var(--cardiac-50)] shadow-sm shadow-[color:rgba(222,17,69,0.12)]"
                        : "border-[var(--ink-100)] bg-white hover:-translate-y-0.5 hover:border-[var(--cardiac-300)] hover:bg-[var(--cardiac-50)]/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-colors",
                        selected
                          ? "border-[var(--cardiac-600)] bg-[var(--cardiac-600)] text-white"
                          : "border-[var(--ink-300)] bg-white",
                      )}
                    >
                      {selected ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        selected ? "font-bold text-[var(--cardiac-900)]" : "font-medium text-[var(--ink-700)]",
                      )}
                    >
                      {SYMPTOMS[id]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 border-t border-[var(--cardiac-100)] pt-4">
              <Label htmlFor="duration" className="font-bold text-[var(--ink-900)]">
                Duration of current episodes
              </Label>
              <Select
                id="duration"
                value={form.durationId}
                onChange={(e) => update("durationId", e.target.value)}
                className="h-11"
              >
                <option value="">Select duration...</option>
                {DURATION_IDS.map((id) => (
                  <option key={id} value={id}>
                    {DURATIONS[id].label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[var(--ink-100)] bg-[var(--cardiac-50)]/40 p-4">
              <Checkbox
                id="sudden"
                checked={form.sudden}
                onChange={(e) => update("sudden", e.target.checked)}
              />
              <Label htmlFor="sudden" className="cursor-pointer text-sm font-medium text-[var(--ink-700)]">
                <strong>Sudden acute onset:</strong> symptoms began rapidly without gradual buildup
              </Label>
            </div>

            <div className="space-y-3 rounded-2xl border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/40 p-5">
              <div className="flex items-center justify-between">
                <Label htmlFor="severity" className="font-bold text-[var(--ink-900)]">
                  Severity of symptoms
                </Label>
                <span className={cn("text-sm font-black", severityTone.text)}>
                  {form.severity}/10 · {severityTone.label}
                </span>
              </div>
              <input
                id="severity"
                type="range"
                min={1}
                max={10}
                step={1}
                value={form.severity}
                onChange={(e) => update("severity", Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--cardiac-100)] accent-[var(--cardiac-600)]"
              />
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--cardiac-100)]">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-300", severityTone.bar)}
                  style={{ width: `${form.severity * 10}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-[var(--ink-300)]">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="freeText" className="font-bold text-[var(--ink-900)]">
                {t("check.freeTextLabel")}
              </Label>
              <Textarea
                id="freeText"
                rows={3}
                maxLength={1000}
                placeholder="Describe your symptoms in your own words — location, triggers, what makes it better or worse..."
                value={form.freeText}
                onChange={(e) => update("freeText", e.target.value)}
              />
            </div>
          </div>
        ) : null}

        {/* STEP 2 — Profile */}
        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[var(--ink-900)]">
                Tell us about yourself
              </h3>
              <p className="mt-0.5 text-xs text-[var(--ink-500)]">
                Age and gender are core inputs to cardiovascular risk stratification.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age" className="font-semibold text-[var(--ink-900)]">
                  {t("check.age")}
                </Label>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  max={120}
                  placeholder="e.g. 45"
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="font-semibold text-[var(--ink-900)]">
                  {t("check.gender")}
                </Label>
                <Select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value as Gender)}
                >
                  <option value="">Select gender...</option>
                  <option value="male">{t("check.male")}</option>
                  <option value="female">{t("check.female")}</option>
                  <option value="other">{t("check.other")}</option>
                </Select>
              </div>
            </div>

            <div className="space-y-3 border-t border-[var(--cardiac-100)] pt-4">
              <Label className="block font-bold text-[var(--ink-900)]">
                Pre-existing cardiovascular risk factors
              </Label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {RISK_FACTOR_IDS.map((id) => {
                  const selected = form.riskFactors.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggle("riskFactors", id)}
                      aria-pressed={selected}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-150",
                        selected
                          ? "border-[var(--cardiac-400)] bg-[var(--cardiac-50)] font-bold text-[var(--cardiac-900)]"
                          : "border-[var(--ink-100)] bg-white text-[var(--ink-700)] hover:border-[var(--cardiac-200)] hover:bg-[var(--cardiac-50)]/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs",
                          selected ? "border-[var(--cardiac-600)] bg-[var(--cardiac-600)] text-white" : "border-[var(--ink-300)]",
                        )}
                      >
                        {selected ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <span className="text-sm font-medium">{RISK_FACTORS[id]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* STEP 3 — Clinical labs */}
        {step === 2 ? (
          <div className="space-y-6">
            <div className="space-y-3 rounded-2xl border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/50 p-5">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--cardiac-100)] text-[var(--cardiac-700)]">
                  <Activity className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink-900)]">
                    Cleveland clinical lab values (optional)
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--ink-500)]">
                    {t("check.clinicalIntro")} If you have recent blood work or an ECG report, enter
                    the 13 clinical biomarkers to enable the Random Forest predictive model.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-[var(--cardiac-200)]/60 pt-4">
                <Checkbox
                  id="useClinical"
                  checked={form.useClinical}
                  onChange={(e) => update("useClinical", e.target.checked)}
                />
                <Label htmlFor="useClinical" className="cursor-pointer text-sm font-bold text-[var(--ink-900)]">
                  Yes, I want to enter my 13 clinical test values
                </Label>
              </div>
            </div>

            {form.useClinical ? (
              <div className="grid gap-4 pt-2 sm:grid-cols-2">
                {CLINICAL_FIELDS.map((field) => (
                  <div
                    key={field.name}
                    className="space-y-2 rounded-2xl border border-[var(--ink-100)] bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={`clinical-${field.name}`} className="text-xs font-semibold text-[var(--ink-900)]">
                        {field.label}
                      </Label>
                      <span className="shrink-0 rounded-full bg-[var(--cardiac-50)] px-2 py-0.5 text-[10px] font-bold text-[var(--cardiac-600)]">
                        {field.min}–{field.max}
                      </span>
                    </div>
                    <Input
                      id={`clinical-${field.name}`}
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      placeholder={`${field.min} - ${field.max}`}
                      value={form.clinical[field.name] ?? ""}
                      onChange={(e) =>
                        update("clinical", { ...form.clinical, [field.name]: e.target.value })
                      }
                      className="h-10"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 rounded-2xl border border-dashed border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/30 p-10 text-center">
                <Stethoscope className="mx-auto h-9 w-9 text-[var(--cardiac-400)]" />
                <p className="text-sm font-bold text-[var(--ink-900)]">
                  No lab reports handy right now?
                </p>
                <p className="mx-auto max-w-md text-xs leading-relaxed text-[var(--ink-500)]">
                  You can safely skip this step. Our multi-layer RAG and rule-based emergency triage
                  will screen your symptoms without requiring lab values.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* STEP 4 — Location & consent */}
        {step === 3 ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[var(--ink-900)]">
                Hospital discovery &amp; location
              </h3>
              <p className="mt-0.5 text-xs text-[var(--ink-500)]">
                We locate 24×7 cardiac centers with cath labs within 25 km of your position.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/40 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--cardiac-600)] to-[var(--cardiac-800)] text-white shadow-md">
                  <Compass className="h-5 w-5 animate-spin-slow" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--ink-900)]">GPS device geolocation</p>
                  <p className="text-xs text-[var(--ink-500)]">
                    Accurate distance to emergency centers
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={shareLocation}>
                <MapPin className="mr-1 h-4 w-4 text-[var(--cardiac-600)]" />
                Share current GPS
              </Button>
            </div>

            {form.mode === "geo" && form.lat != null ? (
              <Alert tone="success">
                Precise coordinates detected ({form.lat.toFixed(3)}, {form.lng?.toFixed(3)}). Nearest
                hospitals will be ranked by distance.
              </Alert>
            ) : null}

            {locationNote ? <Alert tone="warning">{locationNote}</Alert> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city" className="font-semibold text-[var(--ink-900)]">
                  City (e.g. New Delhi, Mumbai)
                </Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode" className="font-semibold text-[var(--ink-900)]">
                  Pincode (postal code)
                </Label>
                <Input
                  id="pincode"
                  placeholder="e.g. 110001"
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-[var(--cardiac-200)] bg-white p-5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={form.consent}
                  onChange={(e) => update("consent", e.target.checked)}
                />
                <Label
                  htmlFor="consent"
                  className="cursor-pointer text-xs font-semibold leading-relaxed text-[var(--ink-700)]"
                >
                  I understand that CardioCare AI is an educational screening aid, not a certified
                  medical diagnosis. I agree to consult a qualified physician for any cardiac
                  condition.
                </Label>
              </div>

              <div className="flex items-start gap-2 rounded-2xl border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/50 p-3.5 text-[11px] text-[var(--ink-500)]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="leading-relaxed">{DISCLAIMER}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--cardiac-100)] pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t("check.back")}
          </Button>

          <div className="flex gap-3">
            {step === 2 && !form.useClinical ? (
              <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                Skip lab data
              </Button>
            ) : null}

            {step < 3 ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!stepValid}>
                {t("check.next")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" variant="cardiac" onClick={submit} disabled={!stepValid} className="px-8">
                <Heart className="mr-1.5 h-4 w-4 animate-heartbeat" />
                Submit &amp; stratify risk
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
