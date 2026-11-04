// Shared constants (Section 7). Must stay identical to ai-service/app/constants.py.

export const SYMPTOMS = {
  chest_pain: "Chest pain / pressure / tightness",
  pain_spreading: "Pain spreading to left arm, jaw, neck or back",
  breathlessness: "Shortness of breath",
  palpitations: "Palpitations / irregular heartbeat",
  dizziness: "Dizziness or light-headedness",
  fainting: "Fainting (loss of consciousness)",
  cold_sweat: "Cold sweat",
  nausea_chest: "Nausea or vomiting with chest discomfort",
  fatigue: "Unusual tiredness or fatigue",
  leg_swelling: "Swelling of legs, ankles or feet",
  reduced_exercise_tolerance: "Reduced exercise tolerance",
  orthopnea: "Breathless when lying flat or waking at night breathless",
  rapid_weight_gain: "Rapid weight gain (fluid retention)",
  bluish_skin: "Bluish lips or fingertips",
} as const;

export type SymptomId = keyof typeof SYMPTOMS;

export const SYMPTOM_IDS = Object.keys(SYMPTOMS) as SymptomId[];

export const DURATIONS = {
  lt_15min: { label: "Less than 15 minutes", durationMin: 10 },
  "15_60min": { label: "15 to 60 minutes", durationMin: 30 },
  "1_24h": { label: "1 to 24 hours", durationMin: 720 },
  "1_7d": { label: "1 to 7 days", durationMin: 4320 },
  "1_4w": { label: "1 to 4 weeks", durationMin: 20160 },
  gt_1m: { label: "More than a month", durationMin: 60000 },
} as const;

export type DurationId = keyof typeof DURATIONS;

export const DURATION_IDS = Object.keys(DURATIONS) as DurationId[];

export const RISK_FACTORS = {
  diabetes: "Diabetes",
  hypertension: "High blood pressure",
  smoking: "Smoking",
  high_cholesterol: "High cholesterol",
  family_history: "Family history of heart disease",
  obesity: "Obesity",
  sedentary: "Sedentary lifestyle",
} as const;

export type RiskFactorId = keyof typeof RISK_FACTORS;

export const RISK_FACTOR_IDS = Object.keys(RISK_FACTORS) as RiskFactorId[];

export const DISCLAIMER =
  "This is an AI-based screening tool for educational purposes, not a medical diagnosis. " +
  "Always consult a qualified doctor. In an emergency call 108 or 112.";

export const NON_HEART_MESSAGE =
  "CardioCare AI only checks heart-related symptoms. Please consult a general " +
  "physician for other concerns.";

export const INSUFFICIENT_KNOWLEDGE_MESSAGE =
  "Not enough heart-related knowledge in the system for these symptoms; please " +
  "consult a cardiologist.";

export const LLM_FALLBACK_MESSAGE =
  "The AI explanation is temporarily unavailable. Please consult a cardiologist, " +
  "and use the hospital list below.";

export const EMERGENCY_BANNER = "Call 108 (ambulance) / 112 now";

export const CLINICAL_FIELDS = [
  { name: "age", label: "Age (years)", min: 1, max: 120, step: 1, required: true },
  { name: "sex", label: "Sex (1 = male, 0 = female)", min: 0, max: 1, step: 1, required: true },
  { name: "cp", label: "Chest pain type (1-4)", min: 1, max: 4, step: 1, required: true },
  { name: "trestbps", label: "Resting blood pressure (mm Hg)", min: 80, max: 250, step: 1, required: true },
  { name: "chol", label: "Serum cholesterol (mg/dl)", min: 100, max: 600, step: 1, required: true },
  { name: "fbs", label: "Fasting blood sugar > 120 mg/dl (1 = yes, 0 = no)", min: 0, max: 1, step: 1, required: true },
  { name: "restecg", label: "Resting ECG (0-2)", min: 0, max: 2, step: 1, required: true },
  { name: "thalach", label: "Maximum heart rate achieved", min: 60, max: 220, step: 1, required: true },
  { name: "exang", label: "Exercise-induced angina (1 = yes, 0 = no)", min: 0, max: 1, step: 1, required: true },
  { name: "oldpeak", label: "ST depression (oldpeak)", min: 0, max: 7, step: 0.1, required: true },
  { name: "slope", label: "ST slope (1-3)", min: 1, max: 3, step: 1, required: true },
  { name: "ca", label: "Major vessels coloured (0-3)", min: 0, max: 3, step: 1, required: true },
  { name: "thal", label: "Thalassemia (3, 6 or 7)", min: 3, max: 7, step: 1, required: true },
] as const;

export const RISK_LEVELS = ["LOW", "MODERATE", "HIGH"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RISK_LABEL: Record<RiskLevel, string> = {
  LOW: "Low",
  MODERATE: "Moderate",
  HIGH: "High",
};
