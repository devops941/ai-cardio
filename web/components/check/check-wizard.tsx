"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Heart,
  HeartPulse,
  Info,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Zap,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  { key: "check.step1", label: "Symptoms", icon: HeartPulse },
  { key: "check.step2", label: "Profile", icon: User },
  { key: "check.step3", label: "Clinical Labs", icon: Activity },
  { key: "check.step4", label: "Location & Consent", icon: MapPin },
];

const PROGRESS_KEYS = [
  "Evaluating deterministic emergency red flags (RF-01 to RF-08)...",
  "Running Random Forest risk model on clinical features...",
  "Retrieving grounded cardiology context from ChromaDB...",
  "Ranking nearby emergency cardiac hospital centers...",
];

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
    if (step === 1) return form.age !== "" && Number(form.age) >= 1 && Number(form.age) <= 120 && form.gender !== "";
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

  // Animated Cardiac Assessment Loading State
  if (submitting) {
    return (
      <Card className="max-w-xl mx-auto border-rose-200 shadow-2xl overflow-hidden">
        <div className="h-2 w-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 animate-pulse transition-all duration-500 w-full" />
        </div>
        <CardContent className="space-y-6 py-12 px-6 text-center" aria-live="polite">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 shadow-inner">
            <Heart aria-hidden className="h-10 w-10 text-rose-600 animate-heartbeat fill-rose-600/20" />
            <div className="absolute inset-0 rounded-3xl border-2 border-rose-400/40 animate-ping pointer-events-none" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Analyzing Cardiovascular Biomarkers
            </h3>
            <p className="text-xs text-slate-500">
              Running multi-layer guardrails, ML inference, and hospital geo-ranking
            </p>
          </div>

          <div className="space-y-3 text-left max-w-md mx-auto pt-4 border-t border-rose-100">
            {PROGRESS_KEYS.map((message, index) => {
              const isPast = index < progressIndex;
              const isCurrent = index === progressIndex;
              return (
                <div
                  key={message}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-3 text-xs font-semibold transition-all duration-300",
                    isCurrent
                      ? "bg-rose-50 text-rose-900 border border-rose-200/80 shadow-xs"
                      : isPast
                        ? "text-emerald-800"
                        : "text-slate-400 opacity-60",
                  )}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px]">
                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                    ) : (
                      "•"
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

  return (
    <Card className="max-w-3xl mx-auto border-rose-100/90 shadow-xl overflow-hidden">
      {/* Top Animated Gradient Header */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <HeartPulse className="h-6 w-6 text-white animate-heartbeat" />
            </span>
            <div>
              <h1 className="text-lg font-black tracking-tight sm:text-xl">
                Heart Symptom & Risk Assessment
              </h1>
              <p className="text-xs text-rose-100 mt-0.5">
                Step {step + 1} of 4: {STEP_INFO[step].label}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
            {progressPercent.toFixed(0)}% Completed
          </span>
        </div>

        {/* Progress Tracker Bar */}
        <div className="mt-5 h-2 w-full rounded-full bg-black/20 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Indicator Pills */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
          {STEP_INFO.map((item, index) => {
            const Icon = item.icon;
            const active = index === step;
            const done = index < step;
            return (
              <div
                key={item.key}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-colors",
                  active
                    ? "bg-white text-rose-800 font-bold shadow-xs"
                    : done
                      ? "bg-white/20 text-white"
                      : "text-white/60",
                )}
              >
                <Icon className="h-3.5 w-3.5 hidden sm:inline" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <CardContent className="space-y-8 p-6 sm:p-8">
        {error ? <Alert tone="error">{error}</Alert> : null}

        {/* STEP 1: SYMPTOMS & SEVERITY */}
        {step === 0 ? (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-bold text-slate-900 block">
                Select Any Heart-Related Symptoms Experienced
              </Label>
              <p className="text-xs text-slate-500 mt-1">
                Choose all that apply. Select at least one symptom or describe your concern below.
              </p>
            </div>

            {/* Visual Interactive Symptom Cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              {SYMPTOM_IDS.map((id) => {
                const selected = form.symptoms.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle("symptoms", id)}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-150 cursor-pointer",
                      selected
                        ? "border-rose-500 bg-rose-50/80 shadow-sm shadow-rose-500/10"
                        : "border-slate-200 bg-white hover:border-rose-200 hover:bg-slate-50/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold mt-0.5 transition-colors",
                        selected
                          ? "border-rose-600 bg-rose-600 text-white"
                          : "border-slate-300 bg-white",
                      )}
                    >
                      {selected ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    <div>
                      <p className={cn("text-sm font-semibold", selected ? "text-rose-950 font-bold" : "text-slate-800")}>
                        {SYMPTOMS[id]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Duration Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label htmlFor="duration" className="font-semibold text-slate-900">
                Duration of Current Episodes
              </Label>
              <Select
                id="duration"
                value={form.durationId}
                onChange={(e) => update("durationId", e.target.value)}
                className="h-11 rounded-xl"
              >
                <option value="">Select duration...</option>
                {DURATION_IDS.map((id) => (
                  <option key={id} value={id}>
                    {DURATIONS[id].label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Sudden Onset Checkbox */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 bg-slate-50/60">
              <Checkbox
                id="sudden"
                checked={form.sudden}
                onChange={(e) => update("sudden", e.target.checked)}
              />
              <Label htmlFor="sudden" className="text-sm font-medium text-slate-800 cursor-pointer">
                <strong>Sudden acute onset:</strong> Symptoms began rapidly without gradual buildup
              </Label>
            </div>

            {/* Severity Rating Slider with Dynamic Colors */}
            <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="severity" className="font-bold text-slate-900">
                  Pain / Discomfort Intensity (1 to 10)
                </Label>
                <span
                  className={cn(
                    "rounded-full px-3 py-0.5 text-xs font-bold",
                    form.severity >= 7
                      ? "bg-red-600 text-white animate-pulse"
                      : form.severity >= 4
                        ? "bg-amber-100 text-amber-900"
                        : "bg-emerald-100 text-emerald-900",
                  )}
                >
                  Score: {form.severity} / 10 ({form.severity >= 7 ? "Severe" : form.severity >= 4 ? "Moderate" : "Mild"})
                </span>
              </div>
              <input
                id="severity"
                type="range"
                min={1}
                max={10}
                value={form.severity}
                onChange={(e) => update("severity", Number(e.target.value))}
                className="h-2 w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-medium px-1">
                <span>1 (Mild discomfort)</span>
                <span>5 (Noticeable ache)</span>
                <span>10 (Unbearable / Severe)</span>
              </div>
            </div>

            {/* Free text input */}
            <div className="space-y-2">
              <Label htmlFor="freeText" className="font-semibold text-slate-900">
                Additional Details (Optional)
              </Label>
              <Textarea
                id="freeText"
                rows={3}
                maxLength={1000}
                placeholder="Describe feelings (e.g. pressure on chest, radiating to left arm or neck, dizziness when standing)..."
                value={form.freeText}
                onChange={(e) => update("freeText", e.target.value)}
                className="rounded-xl border-slate-300 focus:border-rose-500"
              />
            </div>
          </div>
        ) : null}

        {/* STEP 2: PROFILE & RISK FACTORS */}
        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Health Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Demographics and medical history help calibrate risk models.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="age" className="font-semibold text-slate-900">
                  Age (Years) <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  max={120}
                  placeholder="e.g. 45"
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender" className="font-semibold text-slate-900">
                  Biological Gender <span className="text-rose-600">*</span>
                </Label>
                <Select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value as Gender)}
                  className="rounded-xl h-11"
                >
                  <option value="">Select gender...</option>
                  <option value="male">{t("check.male")}</option>
                  <option value="female">{t("check.female")}</option>
                  <option value="other">{t("check.other")}</option>
                </Select>
              </div>
            </div>

            {/* Risk factors checklist */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <Label className="font-bold text-slate-900 block">
                Pre-existing Cardiovascular Risk Factors
              </Label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {RISK_FACTOR_IDS.map((id) => {
                  const selected = form.riskFactors.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggle("riskFactors", id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer",
                        selected
                          ? "border-rose-400 bg-rose-50 text-rose-950 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs",
                          selected ? "border-rose-600 bg-rose-600 text-white" : "border-slate-300",
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

        {/* STEP 3: CLINICAL LABS (OPTIONAL CLEVELAND DATA) */}
        {step === 2 ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <Activity className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cleveland Clinical Lab Values (Optional)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {t("check.clinicalIntro")} If you have recent blood work or an ECG report, enter the 13 clinical biomarkers to enable the Random Forest predictive model.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Checkbox
                  id="useClinical"
                  checked={form.useClinical}
                  onChange={(e) => update("useClinical", e.target.checked)}
                />
                <Label htmlFor="useClinical" className="font-bold text-slate-900 text-sm cursor-pointer">
                  Yes, I want to enter my 13 clinical test values
                </Label>
              </div>
            </div>

            {form.useClinical ? (
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                {CLINICAL_FIELDS.map((field) => (
                  <div key={field.name} className="space-y-1.5 rounded-xl border border-slate-200 p-3.5 bg-white">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`clinical-${field.name}`} className="font-semibold text-xs text-slate-900">
                        {field.label}
                      </Label>
                      <span className="text-[10px] font-bold text-rose-600">
                        Range: {field.min}–{field.max}
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
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 space-y-2">
                <Stethoscope className="h-8 w-8 mx-auto text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">No lab reports handy right now?</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You can safely skip this step. Our multi-layer RAG and rule-based emergency triage will screen your symptoms without requiring lab values.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* STEP 4: LOCATION & FINAL CONSENT */}
        {step === 3 ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Discovery & Location</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                We locate 24x7 cardiac centers with Cath Labs within 25 km of your position.
              </p>
            </div>

            {/* GPS Share Button with Radar Animation */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
                  <Compass className="h-5 w-5 animate-spin" style={{ animationDuration: "12s" }} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">GPS Device Geolocation</p>
                  <p className="text-xs text-slate-600">Accurate distance calculation to emergency centers</p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={shareLocation} className="border-rose-300">
                <MapPin className="h-4 w-4 text-rose-600 mr-1" />
                <span>Share Current GPS</span>
              </Button>
            </div>

            {form.mode === "geo" && form.lat != null ? (
              <Alert tone="info">
                ✓ Precise coordinates detected ({form.lat.toFixed(3)}, {form.lng?.toFixed(3)}). Nearest hospitals will be ranked by distance.
              </Alert>
            ) : null}

            {locationNote ? <Alert tone="warning">{locationNote}</Alert> : null}

            {/* Manual City / Pincode Fallback */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="font-semibold text-slate-900">
                  City (e.g. New Delhi, Mumbai)
                </Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pincode" className="font-semibold text-slate-900">
                  Pincode (Postal Code)
                </Label>
                <Input
                  id="pincode"
                  placeholder="e.g. 110001"
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="rounded-2xl border border-rose-200 bg-white p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={form.consent}
                  onChange={(e) => update("consent", e.target.checked)}
                />
                <Label htmlFor="consent" className="text-xs font-semibold text-slate-800 leading-relaxed cursor-pointer">
                  I understand that CardioCare AI is an educational screening aid, not a certified medical diagnosis. I agree to consult a qualified physician for any cardiac condition.
                </Label>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-100 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{DISCLAIMER}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Step Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>{t("check.back")}</span>
          </Button>

          <div className="flex gap-3">
            {step === 2 && !form.useClinical ? (
              <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                Skip Lab Data
              </Button>
            ) : null}

            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!stepValid}
                className="rounded-xl"
              >
                <span>{t("check.next")}</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="cardiac"
                onClick={submit}
                disabled={!stepValid}
                className="rounded-xl px-8"
              >
                <Heart className="h-4 w-4 mr-1.5 animate-heartbeat" />
                <span>Submit & Stratify Risk</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
