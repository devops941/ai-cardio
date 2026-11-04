"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

const STEP_KEYS = ["check.step1", "check.step2", "check.step3", "check.step4"];
const PROGRESS_KEYS = ["check.progress1", "check.progress2", "check.progress3"];

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
    }, 1500);
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

  if (submitting) {
    return (
      <Card>
        <CardContent className="space-y-3 py-8" aria-live="polite">
          {PROGRESS_KEYS.map((key, index) => (
            <p key={key} className={index <= progressIndex ? "text-slate-900" : "text-slate-400"}>
              {index < progressIndex ? "✓ " : index === progressIndex ? "… " : "• "}
              {t(key)}
            </p>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("check.title")}</CardTitle>
        <ol className="mt-2 flex flex-wrap gap-2 text-xs">
          {STEP_KEYS.map((key, index) => (
            <li
              key={key}
              className={
                index === step
                  ? "rounded-full bg-blue-700 px-3 py-1 font-semibold text-white"
                  : index < step
                    ? "rounded-full bg-blue-100 px-3 py-1 text-blue-800"
                    : "rounded-full bg-slate-100 px-3 py-1 text-slate-600"
              }
            >
              {index + 1}. {t(key)}
            </li>
          ))}
        </ol>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? <Alert tone="error">{error}</Alert> : null}

        {step === 0 ? (
          <div className="space-y-5">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-800">{t("check.symptomsLabel")}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {SYMPTOM_IDS.map((id) => (
                  <div key={id} className="flex items-start gap-2">
                    <Checkbox
                      id={`symptom-${id}`}
                      checked={form.symptoms.includes(id)}
                      onChange={() => toggle("symptoms", id)}
                    />
                    <Label htmlFor={`symptom-${id}`} className="font-normal">
                      {SYMPTOMS[id]}
                    </Label>
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="duration">{t("check.durationLabel")}</Label>
              <Select
                id="duration"
                value={form.durationId}
                onChange={(e) => update("durationId", e.target.value)}
              >
                <option value="">—</option>
                {DURATION_IDS.map((id) => (
                  <option key={id} value={id}>
                    {DURATIONS[id].label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="sudden"
                checked={form.sudden}
                onChange={(e) => update("sudden", e.target.checked)}
              />
              <Label htmlFor="sudden" className="font-normal">{t("check.suddenLabel")}</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">
                {t("check.severityLabel")}: {form.severity}
              </Label>
              <input
                id="severity"
                type="range"
                min={1}
                max={10}
                value={form.severity}
                onChange={(e) => update("severity", Number(e.target.value))}
                className="h-11 w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="freeText">{t("check.freeTextLabel")}</Label>
              <Textarea
                id="freeText"
                rows={3}
                maxLength={1000}
                value={form.freeText}
                onChange={(e) => update("freeText", e.target.value)}
              />
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="age">{t("check.age")}</Label>
              <Input
                id="age"
                type="number"
                min={1}
                max={120}
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">{t("check.gender")}</Label>
              <Select
                id="gender"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value as Gender)}
              >
                <option value="">—</option>
                <option value="male">{t("check.male")}</option>
                <option value="female">{t("check.female")}</option>
                <option value="other">{t("check.other")}</option>
              </Select>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-800">{t("check.riskFactors")}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {RISK_FACTOR_IDS.map((id) => (
                  <div key={id} className="flex items-start gap-2">
                    <Checkbox
                      id={`rf-${id}`}
                      checked={form.riskFactors.includes(id)}
                      onChange={() => toggle("riskFactors", id)}
                    />
                    <Label htmlFor={`rf-${id}`} className="font-normal">{RISK_FACTORS[id]}</Label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{t("check.clinicalIntro")}</p>
            <div className="flex items-center gap-2">
              <Checkbox
                id="useClinical"
                checked={form.useClinical}
                onChange={(e) => update("useClinical", e.target.checked)}
              />
              <Label htmlFor="useClinical" className="font-normal">
                I have test reports to add
              </Label>
            </div>
            {form.useClinical ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {CLINICAL_FIELDS.map((field) => (
                  <div key={field.name} className="space-y-1">
                    <Label htmlFor={`clinical-${field.name}`}>{field.label}</Label>
                    <Input
                      id={`clinical-${field.name}`}
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={form.clinical[field.name] ?? ""}
                      onChange={(e) =>
                        update("clinical", { ...form.clinical, [field.name]: e.target.value })
                      }
                    />
                    <p className="text-xs text-slate-500">
                      Range {field.min}–{field.max}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <p className="text-sm text-slate-600">{t("check.locationIntro")}</p>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={shareLocation}>
                {t("check.shareLocation")}
              </Button>
              {form.mode === "geo" && form.lat != null ? (
                <span className="self-center text-sm text-green-700">{t("fields.locationShared")}</span>
              ) : null}
            </div>
            {locationNote ? <Alert tone="warning">{locationNote}</Alert> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">{t("check.city")}</Label>
                <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">{t("check.pincode")}</Label>
                <Input
                  id="pincode"
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="consent"
                checked={form.consent}
                onChange={(e) => update("consent", e.target.checked)}
              />
              <Label htmlFor="consent" className="font-normal">{t("check.consent")}</Label>
            </div>
            <Alert tone="info">{DISCLAIMER}</Alert>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            {t("check.back")}
          </Button>
          <div className="flex gap-3">
            {step === 2 ? (
              <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                {t("check.skip")}
              </Button>
            ) : null}
            {step < 3 ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!stepValid}>
                {t("check.next")}
              </Button>
            ) : (
              <Button type="button" onClick={submit} disabled={!stepValid}>
                {t("check.submit")}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
