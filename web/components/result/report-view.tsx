"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Heart,
  HeartPulse,
  Info,
  Languages,
  Layers,
  Microscope,
  Pill,
  Printer,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  User,
  Zap,
} from "lucide-react";

import { EmergencyBanner } from "@/components/emergency-banner";
import { Reveal } from "@/components/motion/reveal";
import { HospitalSection } from "@/components/result/hospital-section";
import { RiskBadge } from "@/components/risk-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  generateClinicalInsight,
  type SupportedLanguage,
} from "@/lib/clinical-insight";
import {
  DISCLAIMER,
  INSUFFICIENT_KNOWLEDGE_MESSAGE,
  LLM_FALLBACK_MESSAGE,
  NON_HEART_MESSAGE,
  RISK_FACTORS,
} from "@/lib/constants";
import { t } from "@/lib/i18n";

const RISK_GRADIENT: Record<string, string> = {
  LOW: "from-emerald-500 via-emerald-400 to-emerald-600",
  MODERATE: "from-amber-500 via-amber-400 to-amber-600",
  HIGH: "from-[var(--cardiac-500)] via-[var(--cardiac-600)] to-[var(--cardiac-800)]",
};

interface Condition {
  name: string;
  why: string;
}

export interface SerializedPrediction {
  id: string;
  userId: string;
  symptoms: string[];
  symptomLabels: string[];
  freeText: string | null;
  age: number | null;
  gender: string | null;
  riskFactors: string[];
  durationLabel: string | null;
  durationMin: number | null;
  sudden: boolean;
  severity: number;
  emergency: boolean;
  firedRules: string[];
  llmRisk: string | null;
  mlRisk: string | null;
  mlProbability: number | null;
  finalRisk: "LOW" | "MODERATE" | "HIGH" | null;
  urgent: boolean;
  explanation: string | null;
  possibleConditions: Condition[] | null;
  recommendedSpecialist: string | null;
  nextSteps: string[];
  lifestyleTips: string[];
  sources: string[];
  status: string;
  aiMessage: string | null;
  createdAt: string;
  city: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface ReportViewProps {
  record: SerializedPrediction;
  hospitalResult: {
    hospitals: any[];
    meta: any;
  };
}

const UI_STRINGS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    reportTitle: "Clinical Assessment Report",
    diagnosticName: "Cardiovascular Risk Diagnostic",
    assessmentId: "Assessment ID",
    evaluatedOn: "Evaluated on",
    chooseLanguage: "Language",
    printReport: "Print report",
    newAssessment: "New assessment",
    clinicalStatus: "Clinical Status:",
    emergencyStatus: "ACUTE EMERGENCY ALERT",
    highRiskStatus: "HIGH CARDIAC RISK DETECTED",
    moderateRiskStatus: "MODERATE CARDIAC CONCERN",
    lowRiskStatus: "LOW CARDIAC RISK",
    multiLayerTriangulation: "Multi-Layer Triangulation: Cleveland ML Model ({percent}) + Deterministic Rules + RAG Corpus",
    patientIntakeTitle: "Patient Intake & Reported Symptoms",
    patientIntakeSubtitle: "Summary of symptoms, severity rating, duration, and cardiovascular risk factors entered for this check",
    reportedSymptoms: "Reported Symptoms",
    severityRating: "Severity Rating",
    duration: "Duration",
    onset: "Onset Character",
    suddenOnset: "Sudden Onset",
    gradualOnset: "Gradual Onset",
    demographics: "Demographics",
    riskFactorsTitle: "Pre-existing Cardiovascular Risk Factors:",
    patientNoteTitle: "Patient Description:",
    stratifiedRiskTitle: "Stratified Risk Assessment",
    mlProbability: "ML model probability",
    clevelandCohort: "Trained on the Cleveland Clinic cardiovascular cohort",
    clinicalFusionRisk: "Clinical fusion risk",
    highestFusion: "Highest of the symptom questionnaire, RAG knowledge & red-flag rules",
    exactProblemPill: "Exact Problem Identification & Pathology",
    diagnosticInsightBadge: "Diagnostic Insight",
    problemSummaryTitle: "Detailed Clinical Problem Summary",
    pathophysiologyTitle: "Pathophysiological Mechanism (What is happening inside the heart):",
    symptomCorrelationTitle: "Symptom-to-Cardiac Correlation:",
    redFlagsTitle: "Emergency Red-Flag Rules Triggered",
    redFlagsRationale: "The critical alert was triggered by the following deterministic safety rules:",
    howToSolvePill: "How to Solve & Clinical Action Plan",
    howToSolveTitle: "Step-by-Step Cardiovascular Resolution Strategy",
    targetTimeline: "Target consultation timeline:",
    step1Title: "1. Immediate Safety Protocol",
    step2Title: "2. Essential Diagnostic Tests to Request from Doctor",
    step3Title: "3. Medical & Pharmacological Management",
    step4Title: "4. Daily Monitoring & Lifestyle Protocol",
    conditionsTitle: "Differential Diagnostic Possibilities",
    conditionsSubtitle: "Differential diagnostic possibilities correlated with reported symptoms",
    narrativeTitle: "Clinical Narrative & Guidelines Context",
    specialistTitle: "Recommended Specialist",
    nextStepsTitle: "Recommended Next Steps",
    lifestyleTitle: "Cardiovascular Lifestyle Recommendations",
    sourcesTitle: "Clinical Reference Sources",
    aboutTitle: "About this screening aid & clinical limitations",
  },
  ta: {
    reportTitle: "மருத்துவ பரிசோதனை அறிக்கை",
    diagnosticName: "இதய ஆபத்து நோய் கண்டறிதல் அறிக்கை",
    assessmentId: "பரிசோதனை எண்",
    evaluatedOn: "மதிப்பீடு செய்யப்பட்ட தேதி",
    chooseLanguage: "மொழி",
    printReport: "அறிக்கையை அச்சிடுக",
    newAssessment: "புதிய பரிசோதனை",
    clinicalStatus: "மருத்துவ நிலை:",
    emergencyStatus: "அவசர சிகிச்சை எச்சரிக்கை",
    highRiskStatus: "தீவிர இதய ஆபத்து கண்டறியப்பட்டுள்ளது",
    moderateRiskStatus: "மிதமான இதய ஆபத்து",
    lowRiskStatus: "குறைந்த இதய ஆபத்து",
    multiLayerTriangulation: "பல அடுக்கு மருத்துவ பகுப்பாய்வு: க்ளீவ்லேண்ட் ML மாடல் ({percent}) + பாதுகாப்பு விதிகள் + மருத்துவ தரவுத்தொகுப்பு",
    patientIntakeTitle: "நோயாளி அறிகுறிகள் & மருத்துவ விவரம்",
    patientIntakeSubtitle: "பதிவு செய்யப்பட்ட அறிகுறிகள், தீவிரத்தன்மை, கால அளவு மற்றும் இதய ஆபத்து காரணிகளின் சுருக்கம்",
    reportedSymptoms: "பதிவு செய்த அறிகுறிகள்",
    severityRating: "தீவிரத்தன்மை அளவு",
    duration: "நீடித்த காலம்",
    onset: "தொடங்கிய முறை",
    suddenOnset: "திடீரென தொடங்கியது",
    gradualOnset: "படிப்படியாக தொடங்கியது",
    demographics: "நோயாளி விவரங்கள்",
    riskFactorsTitle: "ஏற்கனவே உள்ள இதய ஆபத்து காரணிகள்:",
    patientNoteTitle: "நோயாளி குறிப்பிட்ட விளக்கம்:",
    stratifiedRiskTitle: "இதய ஆபத்து நிலை மதிப்பீடு",
    mlProbability: "ML மாடல் நிகழ்தகவு",
    clevelandCohort: "க்ளீவ்லேண்ட் கிளினிக் இதய தரவுத்தொகுப்பின் அடிப்படையில் கணக்கிடப்பட்டது",
    clinicalFusionRisk: "ஒருங்கிணைந்த மருத்துவ ஆபத்து",
    highestFusion: "அறிகுறிகள், ஆய்வக முடிவுகள் மற்றும் அவசர விதிகளின் ஒருங்கிணைந்த உச்சநிலை",
    exactProblemPill: "துல்லியமான மருத்துவ பிரச்சனை & காரணம்",
    diagnosticInsightBadge: "மருத்துவ நுண்ணறிவு",
    problemSummaryTitle: "மருத்துவ பிரச்சனை பற்றிய விரிவான விளக்கம்",
    pathophysiologyTitle: "உடலில் என்ன நிகழ்கிறது? (காரண விளக்கம்):",
    symptomCorrelationTitle: "அறிகுறிகளுக்கும் இதயத்திற்கும் உள்ள நேரடி தொடர்பு:",
    redFlagsTitle: "தூண்டப்பட்ட அவசர சிகிச்சை பாதுகாப்பு விதிகள்",
    redFlagsRationale: "கீழ்க்காணும் பாதுகாப்பு விதிகளின் அடிப்படையில் அவசர சிகிச்சை அறிவிப்பு வெளியிடப்பட்டுள்ளது:",
    howToSolvePill: "இதை எவ்வாறு தீர்ப்பது & மருத்துவ தீர்வு வழிகாட்டி",
    howToSolveTitle: "படிப் படியான இதய பாதுகாப்பு மற்றும் சிகிச்சை திட்டம்",
    targetTimeline: "மருத்துவரை அணுக வேண்டிய கால அளவு:",
    step1Title: "1. உடனடி பாதுகாப்பு நடவடிக்கைகள்",
    step2Title: "2. மருத்துவரிடம் கேட்க வேண்டிய அவசியமான பரிசோதனைகள்",
    step3Title: "3. மருத்துவ சிகிச்சை & மருந்து ஆலோசனைகள்",
    step4Title: "4. தினசரி வாழ்க்கைமுறை & இதய கண்காணிப்பு",
    conditionsTitle: "சாத்தியமான இதய நோய்கள் (Differential Diagnoses)",
    conditionsSubtitle: "பதிவு செய்த அறிகுறிகளோடு தொடர்புடைய சாத்தியமான நோய்கள்",
    narrativeTitle: "மருத்துவ வழிகாட்டுதல் சுருக்கம்",
    specialistTitle: "பரிந்துரைக்கப்படும் சிறப்பு மருத்துவர்",
    nextStepsTitle: "அடுத்த கட்ட அவசிய நடவடிக்கைகள்",
    lifestyleTitle: "இதய ஆரோக்கியத்திற்கான வாழ்க்கைமுறை வழிகாட்டுதல்கள்",
    sourcesTitle: "மருத்துவ ஆதாரங்கள்",
    aboutTitle: "இந்த திரையிடல் கருவி மற்றும் வரம்புகள் பற்றி",
  },
  hi: {
    reportTitle: "नैदानिक मूल्यांकन रिपोर्ट",
    diagnosticName: "हृदय जोखिम निदान रिपोर्ट",
    assessmentId: "मूल्यांकन आईडी",
    evaluatedOn: "मूल्यांकन तिथि",
    chooseLanguage: "भाषा",
    printReport: "रिपोर्ट प्रिंट करें",
    newAssessment: "नया मूल्यांकन",
    clinicalStatus: "नैदानिक स्थिति:",
    emergencyStatus: "आपातकालीन चिकित्सा चेतावनी",
    highRiskStatus: "उच्च हृदय जोखिम का पता चला",
    moderateRiskStatus: "मध्यम हृदय जोखिम",
    lowRiskStatus: "कम हृदय जोखिम",
    multiLayerTriangulation: "बहु-स्तरीय नैदानिक विश्लेषण: क्लीवलैंड ML मॉडल ({percent}) + सुरक्षा नियम + संदर्भ डेटाबेस",
    patientIntakeTitle: "रोगी के लक्षण एवं विवरण",
    patientIntakeSubtitle: "दर्ज किए गए लक्षण, गंभीरता रेटिंग, अवधि और हृदय संबंधी जोखिम कारकों का सारांश",
    reportedSymptoms: "बताए गए लक्षण",
    severityRating: "गंभीरता रेटिंग",
    duration: "अवधि",
    onset: "शुरुआत की प्रकृति",
    suddenOnset: "अचानक शुरुआत",
    gradualOnset: "धीरे-धीरे शुरुआत",
    demographics: "रोगी का विवरण",
    riskFactorsTitle: "पूर्व-मौजूदा हृदय जोखिम कारक:",
    patientNoteTitle: "रोगी द्वारा दिया गया विवरण:",
    stratifiedRiskTitle: "स्तरीकृत जोखिम मूल्यांकन",
    mlProbability: "ML मॉडल प्रायिकता",
    clevelandCohort: "क्लीवलैंड क्लिनिक कार्डियोवैस्कुलर डेटा पर प्रशिक्षित",
    clinicalFusionRisk: "नैदानिक संलयन जोखिम",
    highestFusion: "लक्षण प्रश्नावली, RAG ज्ञान और आपातकालीन नियमों का सर्वोच्च स्तर",
    exactProblemPill: "सटीक समस्या की पहचान एवं विकृति विज्ञान",
    diagnosticInsightBadge: "नैदानिक अंतर्दृष्टि",
    problemSummaryTitle: "विस्तृत नैदानिक समस्या सारांश",
    pathophysiologyTitle: "पैथोफिज़ियोलॉजिकल तंत्र (हृदय में क्या हो रहा है):",
    symptomCorrelationTitle: "लक्षणों और हृदय का सीधा संबंध:",
    redFlagsTitle: "सक्रिय आपातकालीन सुरक्षा नियम",
    redFlagsRationale: "निम्नलिखित सुरक्षा नियमों के आधार पर आपातकालीन चेतावनी जारी की गई है:",
    howToSolvePill: "इसका समाधान कैसे करें एवं कार्य योजना",
    howToSolveTitle: "हृदय सुरक्षा और उपचार के लिए चरणबद्ध रणनीति",
    targetTimeline: "परामर्श की लक्षित समय सीमा:",
    step1Title: "1. तत्काल सुरक्षा प्रोटोकॉल",
    step2Title: "2. डॉक्टर से करवाने योग्य आवश्यक नैदानिक परीक्षण",
    step3Title: "3. चिकित्सा एवं औषधीय प्रबंधन",
    step4Title: "4. दैनिक निगरानी एवं जीवनशैली नियम",
    conditionsTitle: "संभावित हृदय संबंधी स्थितियां (Differential Diagnoses)",
    conditionsSubtitle: "बताए गए लक्षणों से संबंधित संभावित नैदानिक स्थितियां",
    narrativeTitle: "नैदानिक मार्गदर्शन संदर्भ",
    specialistTitle: "अनुशंसित विशेषज्ञ",
    nextStepsTitle: "अनुशंसित अगले कदम",
    lifestyleTitle: "हृदय स्वस्थ जीवनशैली सुझाव",
    sourcesTitle: "नैदानिक संदर्भ स्रोत",
    aboutTitle: "इस स्क्रीनिंग सहायता और सीमाओं के बारे में",
  },
};

export function ReportView({ record, hospitalResult }: ReportViewProps) {
  const [lang, setLang] = useState<SupportedLanguage>("en");

  const urgent = record.urgent || record.emergency;
  const conditions = (record.possibleConditions as Condition[] | null) ?? [];
  const risk = record.finalRisk;
  const mlProb = record.mlProbability != null ? Math.round(record.mlProbability * 100) : null;

  // Generate localized clinical insight
  const insight = generateClinicalInsight(
    {
      symptoms: record.symptoms,
      symptomLabels: record.symptomLabels,
      severity: record.severity,
      durationLabel: record.durationLabel,
      durationMin: record.durationMin,
      sudden: record.sudden,
      freeText: record.freeText,
      age: record.age,
      gender: record.gender,
      riskFactors: record.riskFactors,
      mlProbability: record.mlProbability,
      finalRisk: risk,
      emergency: record.emergency,
      firedRules: record.firedRules,
    },
    lang,
  );

  const ui = UI_STRINGS[lang];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {record.emergency ? <EmergencyBanner /> : null}

      {/* Header with Language Selector Toolbar */}
      <Reveal>
        <div className="relative overflow-hidden rounded-lg border border-[var(--cardiac-100)] bg-white p-6 shadow-sm sm:p-8">
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--cardiac-50)] text-[var(--cardiac-600)]">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--cardiac-600)]">
                  {ui.reportTitle}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--ink-900)]">
                {ui.diagnosticName}
              </h1>
              <p className="mt-1.5 text-xs text-[var(--ink-500)]">
                {/* {ui.assessmentId}:{" "}
                <span className="font-mono font-semibold text-[var(--ink-700)]">
                  {record.id.slice(-8)}
                </span>{" "} */}
                · {ui.evaluatedOn}{" "}
                {new Date(record.createdAt).toLocaleString(
                  lang === "ta" ? "ta-IN" : lang === "hi" ? "hi-IN" : undefined,
                  {
                    dateStyle: "medium",
                    timeStyle: "short",
                  },
                )}
              </p>
            </div>

            {/* Actions: Language Selector + Print + New Assessment */}
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              {/* Language Switcher Buttons */}
              <div className="flex items-center gap-1 rounded-lg border border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/40 p-1">
                <span className="flex items-center gap-1 px-2 text-xs font-bold text-[var(--cardiac-700)]">
                  <Languages className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{ui.chooseLanguage}:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                    lang === "en"
                      ? "bg-[var(--cardiac-600)] text-white shadow-xs"
                      : "text-[var(--ink-700)] hover:bg-white"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang("ta")}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                    lang === "ta"
                      ? "bg-[var(--cardiac-600)] text-white shadow-xs"
                      : "text-[var(--ink-700)] hover:bg-white"
                  }`}
                >
                  தமிழ்
                </button>
                <button
                  type="button"
                  onClick={() => setLang("hi")}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                    lang === "hi"
                      ? "bg-[var(--cardiac-600)] text-white shadow-xs"
                      : "text-[var(--ink-700)] hover:bg-white"
                  }`}
                >
                  हिंदी
                </button>
              </div>

              {/* Print and New Assessment Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs"
                >
                  <Printer className="mr-1.5 h-3.5 w-3.5 text-[var(--cardiac-600)]" />
                  {ui.printReport}
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href="/check">
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-[var(--cardiac-600)]" />
                    {ui.newAssessment}
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Clinical Assessment Status Banner */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ink-100)] pt-4">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                    record.emergency || risk === "HIGH"
                      ? "bg-[var(--cardiac-500)]"
                      : risk === "MODERATE"
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                  }`}
                />
                <span
                  className={`relative inline-flex h-3 w-3 rounded-full ${
                    record.emergency || risk === "HIGH"
                      ? "bg-[var(--cardiac-600)]"
                      : risk === "MODERATE"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-700)]">
                {ui.clinicalStatus}
              </span>
              <Badge
                tone={
                  record.emergency || risk === "HIGH"
                    ? "red"
                    : risk === "MODERATE"
                      ? "amber"
                      : "green"
                }
                className="font-bold tracking-wide"
              >
                {record.emergency
                  ? ui.emergencyStatus
                  : risk === "HIGH"
                    ? ui.highRiskStatus
                    : risk === "MODERATE"
                      ? ui.moderateRiskStatus
                      : ui.lowRiskStatus}
              </Badge>
            </div>

            <span className="text-[11px] font-medium text-[var(--ink-500)]">
              {ui.multiLayerTriangulation.replace(
                "{percent}",
                mlProb != null ? `${mlProb}%` : "Rule-Based",
              )}
            </span>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-7">
          {/* Patient Intake & Reported Symptoms Summary */}
          <Reveal>
            <Card className="border-[var(--cardiac-100)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-[var(--ink-900)]">
                  <ClipboardList className="h-4 w-4 text-[var(--cardiac-600)]" />
                  {ui.patientIntakeTitle}
                </CardTitle>
                <p className="text-xs text-[var(--ink-500)]">
                  {ui.patientIntakeSubtitle}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Symptoms pills */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-500)]">
                    {ui.reportedSymptoms} ({record.symptoms.length}):
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {insight.symptomBreakdowns.length > 0 ? (
                      insight.symptomBreakdowns.map((sb) => (
                        <span
                          key={sb.symptom}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cardiac-200)] bg-[var(--cardiac-50)] px-3 py-1 text-xs font-semibold text-[var(--cardiac-800)]"
                        >
                          <HeartPulse className="h-3.5 w-3.5 text-[var(--cardiac-600)]" />
                          {sb.symptom}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs italic text-[var(--ink-500)]">No specific symptoms checked</span>
                    )}
                  </div>
                </div>

                {/* Metrics Grid: Severity, Duration, Onset, Demographics */}
                <div className="grid gap-3 rounded-md border border-[var(--ink-100)] bg-[var(--ink-50)]/60 p-3.5 sm:grid-cols-4">
                  <div>
                    <span className="block text-[11px] font-medium text-[var(--ink-500)]">{ui.severityRating}</span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-[var(--ink-900)]">{record.severity}</span>
                      <span className="text-xs text-[var(--ink-500)]">/ 10</span>
                      <span
                        className={`ml-1 text-[11px] font-bold ${
                          record.severity >= 7
                            ? "text-[var(--cardiac-600)]"
                            : record.severity >= 4
                              ? "text-amber-600"
                              : "text-emerald-600"
                        }`}
                      >
                        ({record.severity >= 7 ? "Severe" : record.severity >= 4 ? "Moderate" : "Mild"})
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-[var(--ink-500)]">{ui.duration}</span>
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[var(--ink-900)]">
                      <Clock className="h-3 w-3 text-[var(--cardiac-500)]" />
                      {record.durationLabel ?? "Unspecified"}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-[var(--ink-500)]">{ui.onset}</span>
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[var(--ink-900)]">
                      <Zap className={`h-3 w-3 ${record.sudden ? "text-[var(--cardiac-600)]" : "text-[var(--ink-500)]"}`} />
                      {record.sudden ? ui.suddenOnset : ui.gradualOnset}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-[var(--ink-500)]">{ui.demographics}</span>
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[var(--ink-900)]">
                      <User className="h-3 w-3 text-[var(--cardiac-500)]" />
                      {record.age ? `Age ${record.age}` : "Age —"}{" "}
                      {record.gender ? `· ${record.gender}` : ""}
                    </p>
                  </div>
                </div>

                {/* Risk Factors */}
                {record.riskFactors.length > 0 ? (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-500)]">
                      {ui.riskFactorsTitle}
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {record.riskFactors.map((rf) => (
                        <span
                          key={rf}
                          className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800"
                        >
                          {RISK_FACTORS[rf as keyof typeof RISK_FACTORS] ?? rf}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Free Text Note */}
                {record.freeText ? (
                  <div className="rounded-md border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/30 p-3 text-xs leading-relaxed text-[var(--ink-700)]">
                    <strong className="text-[var(--ink-900)]">{ui.patientNoteTitle}</strong> &ldquo;{record.freeText}&rdquo;
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </Reveal>

          {/* Core Risk Assessment */}
          <Reveal>
            <Card className="overflow-hidden">
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${RISK_GRADIENT[risk ?? "MODERATE"]}`}
              />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-[var(--cardiac-600)]" />
                    {ui.stratifiedRiskTitle}
                  </CardTitle>
                  <RiskBadge risk={risk} />
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {record.status !== "non_heart" ? (
                  <div className="grid gap-4 rounded-md border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/40 p-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--ink-500)]">
                          {ui.mlProbability}
                        </span>
                        <span className="font-black text-[var(--ink-900)]">
                          {mlProb != null ? `${mlProb}%` : "Rule-based"}
                        </span>
                      </div>
                      {mlProb != null ? (
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--cardiac-100)]">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              mlProb > 65
                                ? "bg-gradient-to-r from-[var(--cardiac-500)] to-[var(--cardiac-700)]"
                                : mlProb > 35
                                  ? "bg-gradient-to-r from-amber-400 to-amber-600"
                                  : "bg-gradient-to-r from-emerald-400 to-emerald-600"
                            }`}
                            style={{ width: `${mlProb}%` }}
                          />
                        </div>
                      ) : null}
                      <p className="text-[11px] text-[var(--ink-500)]">
                        {ui.clevelandCohort}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-xs font-semibold text-[var(--ink-500)]">
                        {ui.clinicalFusionRisk}
                      </span>
                      <div className="flex items-center gap-2 text-base font-bold text-[var(--ink-900)]">
                        <Heart className="h-4 w-4 animate-heartbeat text-[var(--cardiac-600)]" />
                        <span>{risk ?? record.llmRisk ?? "Indeterminate"}</span>
                      </div>
                      <p className="text-[11px] text-[var(--ink-500)]">
                        {ui.highestFusion}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Percentage Clinical Interpretation */}
                {insight.mlPercentageExplanation ? (
                  <div className="flex items-start gap-2.5 rounded-md border border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/60 p-3.5 text-xs text-[var(--cardiac-900)]">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cardiac-600)]" />
                    <span className="leading-relaxed font-medium">{insight.mlPercentageExplanation}</span>
                  </div>
                ) : null}

                {record.status === "non_heart" ? (
                  <Alert tone="info">
                    <p>{NON_HEART_MESSAGE}</p>
                    <Button className="mt-3" size="sm" asChild>
                      <Link href="/check">{t("result.newCheck")}</Link>
                    </Button>
                  </Alert>
                ) : null}

                {record.status === "insufficient_knowledge" ? (
                  <Alert tone="info">{INSUFFICIENT_KNOWLEDGE_MESSAGE}</Alert>
                ) : null}

                {record.status === "llm_unavailable" ? (
                  <Alert tone="warning">{LLM_FALLBACK_MESSAGE}</Alert>
                ) : null}

                <div className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--ink-500)]">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--cardiac-500)]" />
                  <span>{t("aiNotice")}</span>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {/* EXACT CLINICAL PROBLEM & PATHOLOGY ANALYSIS */}
          <Reveal>
            <Card className="border-[var(--cardiac-200)] bg-gradient-to-br from-white via-white to-[var(--cardiac-50)]/40 shadow-sm">
              <CardHeader className="border-b border-[var(--cardiac-100)] pb-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cardiac-200)] bg-[var(--cardiac-50)] px-3 py-1 text-xs font-bold text-[var(--cardiac-700)]">
                    <Microscope className="h-3.5 w-3.5" />
                    {ui.exactProblemPill}
                  </span>
                  <Badge tone="cardiac" className="border-[var(--cardiac-300)] text-[var(--cardiac-700)] font-bold">
                    {ui.diagnosticInsightBadge}
                  </Badge>
                </div>

                <h2 className="mt-3 text-xl font-black text-[var(--ink-900)]">
                  {insight.primaryCondition}
                </h2>
                <p className="mt-1 text-xs text-[var(--ink-500)]">
                  {insight.conditionSubtitle}
                </p>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                {/* The Core Detailed Problem Paragraph */}
                <div className="rounded-lg border border-[var(--cardiac-200)] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-sm text-[var(--cardiac-700)]">
                    <Heart className="h-4 w-4" />
                    {ui.problemSummaryTitle}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-900)] font-medium">
                    {insight.problemParagraph}
                  </p>
                </div>

                {/* Pathophysiology Box: What is physically happening inside the heart */}
                <div className="rounded-md border border-[var(--ink-100)] bg-[var(--ink-50)]/80 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-700)]">
                    {ui.pathophysiologyTitle}
                  </span>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-600)]">
                    {insight.pathophysiology}
                  </p>
                </div>

                {/* Individual Symptom Correlation Grid */}
                {insight.symptomBreakdowns.length > 0 ? (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-500)]">
                      {ui.symptomCorrelationTitle}
                    </span>
                    <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                      {insight.symptomBreakdowns.map((item) => (
                        <div
                          key={item.symptom}
                          className="rounded-md border border-[var(--cardiac-100)] bg-white p-3 text-xs"
                        >
                          <strong className="block text-xs font-bold text-[var(--cardiac-800)]">
                            {item.symptom}
                          </strong>
                          <p className="mt-1 text-[11px] leading-relaxed text-[var(--ink-500)]">
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Emergency Red-Flags Breakdown (If triggered) */}
                {insight.emergencyTriggers.length > 0 ? (
                  <div className="rounded-md border border-[var(--cardiac-300)] bg-[var(--cardiac-50)]/80 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--cardiac-800)]">
                      <ShieldAlert className="h-4 w-4 text-[var(--cardiac-600)]" />
                      {ui.redFlagsTitle} ({insight.emergencyTriggers.length}):
                    </div>
                    <p className="mt-1 text-xs text-[var(--cardiac-700)]">
                      {ui.redFlagsRationale}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {insight.emergencyTriggers.map((rf) => (
                        <li key={rf.code} className="rounded bg-white/90 p-2.5 text-xs shadow-2xs">
                          <span className="font-bold text-[var(--cardiac-700)]">{rf.code}: {rf.title}</span>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--ink-600)]">{rf.rationale}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </Reveal>

          {/* HOW TO SOLVE IT / CLINICAL ACTION PLAN */}
          <Reveal>
            <Card className="border-emerald-200 bg-gradient-to-br from-white via-white to-emerald-50/30 shadow-sm">
              <CardHeader className="border-b border-emerald-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {ui.howToSolvePill}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${insight.resolutionPlan.urgencyBadgeColor}`}>
                    {insight.resolutionPlan.urgencyLevel}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-black text-[var(--ink-900)]">
                  {ui.howToSolveTitle}
                </h3>
                <p className="mt-1 text-xs text-[var(--ink-500)]">
                  {ui.targetTimeline} <strong className="text-[var(--ink-900)]">{insight.resolutionPlan.recommendedTimeline}</strong>
                </p>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                {/* Immediate Safety Protocol */}
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink-700)]">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    {ui.step1Title}
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {insight.resolutionPlan.immediateSafetyActions.map((act) => (
                      <li key={act} className="flex items-start gap-2 text-xs text-[var(--ink-700)]">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span className="leading-relaxed">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Diagnostic Tests to Ask For */}
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink-700)]">
                    <Stethoscope className="h-3.5 w-3.5 text-[var(--cardiac-600)]" />
                    {ui.step2Title}
                  </h4>
                  <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                    {insight.resolutionPlan.diagnosticTests.map((test) => (
                      <div key={test.name} className="rounded-md border border-emerald-100 bg-white p-3 text-xs">
                        <span className="font-bold text-[var(--ink-900)]">{test.name}</span>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--ink-500)]">
                          {test.purpose}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical & Pharmacological Management */}
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink-700)]">
                    <Pill className="h-3.5 w-3.5 text-amber-600" />
                    {ui.step3Title}
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {insight.resolutionPlan.medicalManagement.map((med) => (
                      <li key={med} className="flex items-start gap-2 text-xs text-[var(--ink-700)]">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span className="leading-relaxed">{med}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Daily Monitoring & Lifestyle */}
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink-700)]">
                    <HeartPulse className="h-3.5 w-3.5 text-[var(--cardiac-500)]" />
                    {ui.step4Title}
                  </h4>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {insight.resolutionPlan.lifestyleAndMonitoring.map((tip) => (
                      <div key={tip} className="rounded-md border border-[var(--ink-100)] bg-[var(--ink-50)]/70 p-2.5 text-xs leading-relaxed text-[var(--ink-700)]">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {/* Differential Diagnostic Possibilities (Conditions) */}
          {conditions.length > 0 ? (
            <Reveal>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Stethoscope className="h-4 w-4 text-[var(--cardiac-600)]" />
                    {ui.conditionsTitle}
                  </CardTitle>
                  <p className="text-xs text-[var(--ink-500)]">
                    {ui.conditionsSubtitle}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {conditions.map((condition, idx) => (
                    <div
                      key={condition.name}
                      className="flex items-start gap-3.5 rounded-md border border-[var(--cardiac-100)] bg-white p-4 transition-colors hover:border-[var(--cardiac-300)]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--cardiac-50)] text-xs font-black text-[var(--cardiac-600)]">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[var(--ink-900)]">{condition.name}</p>
                        <p className="text-xs leading-relaxed text-[var(--ink-500)]">
                          {condition.why}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </Reveal>
          ) : null}

          {/* Contextual Medical Summary (Explanation) */}
          {record.explanation ? (
            <Reveal>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-[var(--cardiac-600)]" />
                    {ui.narrativeTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/40 p-5 text-sm leading-relaxed text-[var(--ink-700)]">
                    {record.explanation}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ) : null}

          {/* Specialist Recommendation */}
          {record.recommendedSpecialist ? (
            <Reveal>
              <Card className="border-[var(--cardiac-200)] bg-gradient-to-br from-white to-[var(--cardiac-50)]/60">
                <CardContent className="flex items-center gap-4 p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--cardiac-500)] to-[var(--cardiac-800)] text-white">
                    <Stethoscope className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--cardiac-700)]">
                      {ui.specialistTitle}
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-[var(--ink-900)]">
                      {record.recommendedSpecialist}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ) : null}

          {/* Next steps */}
          {record.nextSteps.length > 0 ? (
            <Reveal>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {ui.nextStepsTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {record.nextSteps.map((step) => (
                      <li key={step} className="flex items-start gap-3 text-sm text-[var(--ink-700)]">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
                          ✓
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ) : null}

          {/* Lifestyle tips */}
          {record.lifestyleTips.length > 0 ? (
            <Reveal>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HeartPulse className="h-4 w-4 text-[var(--cardiac-600)]" />
                    {ui.lifestyleTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {record.lifestyleTips.map((tip) => (
                      <li
                        key={tip}
                        className="rounded-md border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/40 p-3.5 text-xs leading-relaxed text-[var(--ink-700)]"
                      >
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ) : null}

          {/* Sources */}
          {record.sources.length > 0 ? (
            <div className="flex items-start gap-2.5 rounded-md border border-[var(--ink-100)] bg-white p-4 text-xs text-[var(--ink-500)]">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cardiac-400)]" />
              <span className="leading-relaxed">
                <strong className="text-[var(--ink-900)]">{ui.sourcesTitle}:</strong>{" "}
                {record.sources.join(", ")}
              </span>
            </div>
          ) : null}
        </div>

        {/* Right column: Hospital Section */}
        <div className="space-y-6 lg:col-span-5">
          {record.status !== "non_heart" ? (
            <Reveal delay={1}>
              <HospitalSection
                initialHospitals={hospitalResult.hospitals}
                meta={hospitalResult.meta}
                city={record.city}
                pincode={record.pincode}
                risk={risk}
              />
            </Reveal>
          ) : null}
        </div>
      </div>

      {/* Limitations */}
      <details className="group rounded-md border border-[var(--ink-100)] bg-white p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[var(--ink-900)]">
          <span>{ui.aboutTitle}</span>
          <ChevronRight className="h-4 w-4 text-[var(--cardiac-400)] transition-transform duration-200 group-open:rotate-90" />
        </summary>
        <p className="mt-4 border-t border-[var(--ink-50)] pt-4 text-xs leading-relaxed text-[var(--ink-500)]">
          {t("result.limitations")}
        </p>
      </details>

      <p className="px-4 text-center text-xs leading-relaxed text-[var(--ink-500)]">
        {DISCLAIMER}
      </p>
    </div>
  );
}

