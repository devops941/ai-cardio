// Clinical diagnosis, problem pathophysiology, and treatment roadmap helper.
// Generates detailed, patient-specific diagnostic insights and actionable resolution plans
// with multi-language support (English, தமிழ் / Tamil, हिंदी / Hindi).

import { RISK_FACTORS, SYMPTOMS, type RiskLevel, type SymptomId } from "@/lib/constants";

export type SupportedLanguage = "en" | "ta" | "hi";

export interface ClinicalProblemInsight {
  language: SupportedLanguage;
  primaryCondition: string;
  conditionSubtitle: string;
  problemParagraph: string;
  pathophysiology: string;
  mlPercentageExplanation: string | null;
  symptomBreakdowns: { symptom: string; explanation: string }[];
  emergencyTriggers: { code: string; title: string; rationale: string }[];
  resolutionPlan: {
    urgencyLevel: string;
    urgencyBadgeColor: string;
    recommendedTimeline: string;
    diagnosticTests: { name: string; purpose: string }[];
    medicalManagement: string[];
    immediateSafetyActions: string[];
    lifestyleAndMonitoring: string[];
  };
}

// Multi-language symptom translations
export const SYMPTOM_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
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
    orthopnea: "Breathless when lying flat",
    rapid_weight_gain: "Rapid fluid retention / weight gain",
    bluish_skin: "Bluish lips or fingertips",
  },
  ta: {
    chest_pain: "மார்பு வலி / அழுத்தம் / பாரம்",
    pain_spreading: "இடது கை, தாடை, கழுத்து அல்லது முதுகுக்கு பரவும் வலி",
    breathlessness: "மூச்சுத்திணறல் / மூச்சு வாங்குதல்",
    palpitations: "நெஞ்சு படபடப்பு / ஒழுங்கற்ற இதயத்துடிப்பு",
    dizziness: "தலைச்சுற்றல் / மயக்கம் போன்ற உணர்வு",
    fainting: "மயங்கி விழுதல் (நினைவிழப்பு)",
    cold_sweat: "குளிர்ந்த வியர்வை",
    nausea_chest: "மார்பு அசெளகரியத்துடன் குமட்டல் அல்லது வாந்தி",
    fatigue: "அசாதாரண உடல் சோர்வு / பலவீனம்",
    leg_swelling: "கால்கள், கணுக்கால் அல்லது பாதங்களில் வீக்கம்",
    reduced_exercise_tolerance: "சாதாரண வேலை செய்யும் போது மூச்சு வாங்குதல்",
    orthopnea: "நேராக படுக்கும் போது ஏற்படும் மூச்சுத்திணறல்",
    rapid_weight_gain: "உடலில் திடீர் நீர் தேக்கம் / எடை அதிகரிப்பு",
    bluish_skin: "உதடு அல்லது விரல் நுனிகளில் நீல நிற மாற்றம்",
  },
  hi: {
    chest_pain: "सीने में दर्द / भारीपन / दबाव",
    pain_spreading: "बाएं हाथ, जबड़े, गर्दन या पीठ में फैलता दर्द",
    breathlessness: "सांस फूलना / सांस लेने में तकलीफ",
    palpitations: "दिल की धड़कन तेज या अनियमित होना (घबराहट)",
    dizziness: "चक्कर आना / सिर घूमना",
    fainting: "बेहोश होना (मूर्छा)",
    cold_sweat: "ठंडा पसीना आना",
    nausea_chest: "सीने में बेचैनी के साथ मतली या उल्टी",
    fatigue: "अत्यधिक थकान / कमजोरी",
    leg_swelling: "पैरों, टखनों या पंजों में सूजन",
    reduced_exercise_tolerance: "हल्की मेहनत पर सांस फूलना",
    orthopnea: "सीधे लेटने पर सांस लेने में कठिनाई",
    rapid_weight_gain: "शरीर में तेजी से पानी जमा होना / वजन बढ़ना",
    bluish_skin: "होंठों या उंगलियों का नीला पड़ना",
  },
};

// Multi-language risk factor translations
export const RISK_FACTOR_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    diabetes: "Diabetes",
    hypertension: "High blood pressure",
    smoking: "Smoking",
    high_cholesterol: "High cholesterol",
    family_history: "Family history of heart disease",
    obesity: "Obesity",
    sedentary: "Sedentary lifestyle",
  },
  ta: {
    diabetes: "நீரிழிவு நோய் (சர்க்கரை)",
    hypertension: "உயர் ரத்த அழுத்தம் (BP)",
    smoking: "புகைபிடித்தல்",
    high_cholesterol: "அதிக கொலஸ்ட்ரால்",
    family_history: "குடும்பத்தில் இதய நோய் வரலாறு",
    obesity: "உடல் பருமன்",
    sedentary: "உடற்பயிற்சியற்ற வாழ்க்கைமுறை",
  },
  hi: {
    diabetes: "मधुमेह (शुगर)",
    hypertension: "उच्च रक्तचाप (हाई बीपी)",
    smoking: "धूम्रपान",
    high_cholesterol: "उच्च कोलेस्ट्रॉल",
    family_history: "परिवार में हृदय रोग का इतिहास",
    obesity: "मोटापा",
    sedentary: "शारीरिक गतिविधि की कमी",
  },
};

interface RedFlagInfo {
  title: string;
  rationale: string;
}

const RED_FLAG_DESCRIPTIONS: Record<SupportedLanguage, Record<string, RedFlagInfo>> = {
  en: {
    "RF-01": {
      title: "Prolonged Chest Discomfort (>15 Minutes)",
      rationale:
        "Chest pain lasting longer than 15 minutes is a primary warning sign of ongoing myocardial ischemia or early infarction, requiring urgent clinical evaluation to preserve heart muscle.",
    },
    "RF-02": {
      title: "Radiation to Arm, Jaw, Neck, or Back",
      rationale:
        "Pain spreading along cervical and thoracic nerve pathways is strongly correlated with acute coronary artery occlusion.",
    },
    "RF-03": {
      title: "Diaphoresis (Cold Sweats with Chest Symptoms)",
      rationale:
        "Profuse cold sweating reflects acute sympathetic nervous system overdrive triggered by acute cardiovascular distress.",
    },
    "RF-04": {
      title: "Chest Pain with Concurrent Dyspnea",
      rationale:
        "Combined chest discomfort and shortness of breath indicates impaired left ventricular filling pressure and potential pulmonary congestion.",
    },
    "RF-05": {
      title: "Syncope / Loss of Consciousness",
      rationale:
        "Sudden fainting or blacking out suggests a transient, severe drop in cerebral perfusion due to high-grade arrhythmia or structural outflow obstruction.",
    },
    "RF-06": {
      title: "Severe or Sudden-Onset Breathlessness",
      rationale:
        "Acute dyspnea (severity ≥8/10 or sudden onset) points to acute heart failure, pulmonary edema, or pulmonary embolism.",
    },
    "RF-07": {
      title: "Nausea & Cold Sweats with Chest Discomfort",
      rationale:
        "Vagal stimulation during acute coronary events frequently manifests as autonomic nausea and diaphoresis, particularly in inferior myocardial infarctions.",
    },
    "RF-08": {
      title: "High-Risk Emergency Descriptor in Free Text",
      rationale:
        "Patient used acute clinical danger phrases (e.g., 'crushing pressure', 'heavy weight on chest') characteristic of acute ischemic events.",
    },
  },
  ta: {
    "RF-01": {
      title: "நீண்ட நேர மார்பு வலி (15 நிமிடங்களுக்கும் மேல்)",
      rationale:
        "15 நிமிடங்களுக்கும் மேலாக நீடிக்கும் மார்பு வலி, இதய தசைகளுக்கு இரத்த ஓட்டம் தடைபடுவதன் (மாரடைப்பு) முக்கிய அறிகுறியாகும். உடனே மருத்துவ சிகிச்சை அவசியம்.",
    },
    "RF-02": {
      title: "இடது கை, தாடை, கழுத்து அல்லது முதுகுக்கு பரவும் வலி",
      rationale:
        "வலி பிற இடங்களுக்கு பரவுவது கடுமையான ரத்தக் குழாய் அடைப்பின் தீவிர அறிகுறியாகும்.",
    },
    "RF-03": {
      title: "குளிர்ந்த வியர்வை (Diaphoresis)",
      rationale:
        "மார்பு வலியுடன் குளிர்ந்த வியர்வை கொட்டுவது இதயம் கடுமையான நெருக்கடியில் இருப்பதை காட்டுகிறது.",
    },
    "RF-04": {
      title: "மார்பு வலியுடன் கூடிய மூச்சுத்திணறல்",
      rationale:
        "மார்பு வலி மற்றும் மூச்சுத்திணறல் இரண்டும் சேர்ந்து இருப்பது இதய பம்பிங் திறன் குறைந்து நுரையீரலில் திரவம் தேங்குவதை குறிக்கலாம்.",
    },
    "RF-05": {
      title: "மயங்கி விழுதல் (Syncope)",
      rationale:
        "திடீரென நினைவிழப்பது மூளைக்கு செல்லும் இரத்த ஓட்டம் குறைவதாலோ அல்லது கடுமையான இதய துடிப்பு கோளாறினாலோ ஏற்படுகிறது.",
    },
    "RF-06": {
      title: "திடீர் அல்லது கடுமையான மூச்சுத்திணறல் (தீவிரம் ≥8)",
      rationale:
        "திடீரென மூச்சு வாங்குவது கடுமையான இதய செயலிழப்பு அல்லது நுரையீரல் வீக்கத்தை குறிக்கலாம்.",
    },
    "RF-07": {
      title: "குமட்டல் மற்றும் குளிர்ந்த வியர்வை",
      rationale:
        "கீழ் பகுதி இதய தசையில் ஏற்படும் மாரடைப்பின் போது நரம்பு தூண்டுதலால் வாந்தி, குமட்டல் மற்றும் வியர்வை உண்டாகிறது.",
    },
    "RF-08": {
      title: "அவசர சிகிச்சை தேவைப்படும் அறிகுறிகள்",
      rationale:
        "மார்பின் மீது பாறை வைத்தது போன்ற பாரம் அல்லது கடுமையான அழுத்தம் இருப்பதாக நோயாளி விவரித்துள்ளார்.",
    },
  },
  hi: {
    "RF-01": {
      title: "लंबे समय तक सीने में दर्द (15 मिनट से अधिक)",
      rationale:
        "15 मिनट से अधिक समय तक रहने वाला सीने का दर्द मायोकार्डियल इस्किमिया या शुरुआती दिल के दौरे का संकेत है, जिसमें तुरंत आपातकालीन देखभाल आवश्यक है।",
    },
    "RF-02": {
      title: "बांह, जबड़े, गर्दन या पीठ में फैलता दर्द",
      rationale:
        "गर्दन और बांह में दर्द का फैलना कोरोनरी धमनी में तीव्र रुकावट से संबंधित है।",
    },
    "RF-03": {
      title: "सीने में दर्द के साथ ठंडा पसीना आना",
      rationale:
        "अत्यधिक ठंडा पसीना हृदय पर अत्यधिक तनाव और आपातकालीन स्थिति को दर्शाता है।",
    },
    "RF-04": {
      title: "सीने में दर्द के साथ सांस फूलना",
      rationale:
        "सीने में जकड़न और सांस की तकलीफ हृदय की पंपिंग क्षमता में कमी का संकेत देती है।",
    },
    "RF-05": {
      title: "अचानक बेहोश होना (Syncope)",
      rationale:
        "अचानक बेहोश होना मस्तिष्क में रक्त प्रवाह की अचानक कमी या हृदय की अनियमित धड़कन का संकेत है।",
    },
    "RF-06": {
      title: "अचानक या अत्यधिक सांस फूलना (तीव्रता ≥8)",
      rationale:
        "तीव्र सांस की तकलीफ दिल की विफलता या फेफड़ों में पानी भरने का संकेत देती है।",
    },
    "RF-07": {
      title: "मतली और ठंडा पसीना",
      rationale:
        "हृदय के निचले हिस्से में रक्त प्रवाह रुकने पर ऑटोनोमिक नर्वस सिस्टम के कारण उल्टी और पसीना आता है।",
    },
    "RF-08": {
      title: "अत्यधिक गंभीर लक्षण विवरण",
      rationale:
        "सीने पर भारी पत्थर जैसा दबाव या कुचलने वाला दर्द तीव्र इस्केमिक घटना का स्पष्ट संकेत है।",
    },
  },
};

interface InsightInput {
  symptoms: string[];
  symptomLabels: string[];
  severity: number;
  durationLabel?: string | null;
  durationMin?: number | null;
  sudden: boolean;
  freeText?: string | null;
  age?: number | null;
  gender?: string | null;
  riskFactors: string[];
  mlProbability?: number | null;
  finalRisk?: RiskLevel | null;
  emergency: boolean;
  firedRules: string[];
}

export function generateClinicalInsight(
  input: InsightInput,
  lang: SupportedLanguage = "en",
): ClinicalProblemInsight {
  const {
    symptoms,
    symptomLabels,
    severity,
    durationLabel,
    sudden,
    age,
    gender,
    riskFactors,
    mlProbability,
    finalRisk,
    emergency,
    firedRules,
  } = input;

  const hasChestPain = symptoms.includes("chest_pain");
  const hasBreathlessness = symptoms.includes("breathlessness") || symptoms.includes("orthopnea");
  const hasFatigue = symptoms.includes("fatigue") || symptoms.includes("reduced_exercise_tolerance");
  const hasPalpitations = symptoms.includes("palpitations");
  const hasFainting = symptoms.includes("fainting") || symptoms.includes("dizziness");
  const hasSwelling = symptoms.includes("leg_swelling") || symptoms.includes("rapid_weight_gain");

  const probPercent = mlProbability != null ? Math.round(mlProbability * 100) : null;
  const isHighRisk = finalRisk === "HIGH" || emergency || (probPercent != null && probPercent >= 70);
  const isModerateRisk = finalRisk === "MODERATE" || (probPercent != null && probPercent >= 40 && probPercent < 70);

  // Symptoms translated list
  const translatedSymptoms = symptoms.map(
    (s) => SYMPTOM_TRANSLATIONS[lang]?.[s] ?? SYMPTOMS[s as SymptomId] ?? s,
  );
  const symptomsJoined = translatedSymptoms.length > 0 ? translatedSymptoms.join(", ") : "";

  // Risk factors translated list
  const translatedRiskFactors = riskFactors.map(
    (rf) => RISK_FACTOR_TRANSLATIONS[lang]?.[rf] ?? RISK_FACTORS[rf as keyof typeof RISK_FACTORS] ?? rf,
  );
  const riskFactorsJoined = translatedRiskFactors.join(", ");

  let primaryCondition = "";
  let conditionSubtitle = "";
  let problemParagraph = "";
  let pathophysiology = "";
  let mlPercentageExplanation: string | null = null;

  // -------------------------------------------------------------------------
  // 1. TAMIL TRANSLATIONS (தமிழ்)
  // -------------------------------------------------------------------------
  if (lang === "ta") {
    if (emergency || (hasChestPain && (symptoms.includes("pain_spreading") || severity >= 7))) {
      primaryCondition = "கடுமையான மாரடைப்பு அபாய எச்சரிக்கை (Acute Coronary Syndrome - ACS)";
      conditionSubtitle = "இதய தசை சேதத்தை தடுக்க உடனடியாக அவசர சிகிச்சை மருத்துவரை அணுக வேண்டும்.";
    } else if (hasChestPain) {
      primaryCondition = "கொரோனரி தமனி சுருக்கம் / ஆஞ்சைனா மார்பு வலி (Angina Pectoris / CAD)";
      conditionSubtitle = "இதய தசைக்கு செல்லும் இரத்த நாளங்களில் இரத்த ஓட்டம் குறைந்துள்ளதற்கான சாத்தியக்கூறுகள் உள்ளன.";
    } else if (hasBreathlessness && hasSwelling) {
      primaryCondition = "இதய செயலிழப்பு மற்றும் நுரையீரல் நீர் தேக்கம் (Congestive Heart Failure)";
      conditionSubtitle = "இதயத்தின் பம்பிங் திறன் குறைந்து, நுரையீரல் மற்றும் கால்களில் நீர் தேங்குவதால் மூச்சுத்திணறல் ஏற்படுகிறது.";
    } else if (hasFatigue && (isHighRisk || riskFactors.length >= 2)) {
      primaryCondition = "இதய தசை இரத்த ஓட்ட குறைபாடு மற்றும் தீவிர சோர்வு (Myocardial Ischemia & Cardiac Fatigue)";
      conditionSubtitle = "இதய ரத்த நாளங்களில் கொழுப்பு படிவு மற்றும் எந்திர கற்றல் (ML) அதிக ஆபத்து குறியீடு.";
    } else if (hasPalpitations || hasFainting) {
      primaryCondition = "இதய துடிப்பு ஒழுங்கின்மை (Cardiac Arrhythmia / Conduction Anomaly)";
      conditionSubtitle = "இதயத்தின் மின்சார துடிப்பு முறையில் கோளாறு அல்லது மூளைக்கு செல்லும் இரத்த ஓட்டம் குறைதல்.";
    } else if (isHighRisk) {
      primaryCondition = "அதிகரித்த இதய ரத்த நாள நோய் அபாயம் (Atherosclerotic Cardiovascular Strain)";
      conditionSubtitle = "பரிசோதனை அளவீடுகள் ரத்தக் குழாய் அடைப்பிற்கான அதிக சாத்தியத்தை காட்டுகின்றன.";
    } else {
      primaryCondition = "இதய சுமை மற்றும் மிதமான இரத்த ஓட்ட குறைபாடு (Cardiovascular Strain)";
      conditionSubtitle = "அறிகுறிகள் இதயம் அதிக சுமையுடன் வேலை செய்வதை சுட்டிக்காட்டுகின்றன.";
    }

    problemParagraph = `உங்கள் பரிசோதனை முடிவுகளின்படி, உங்களுக்கு உள்ள முக்கிய மருத்துவ பிரச்சனை "${primaryCondition}" ஆகும். நீங்கள் குறிப்பிட்ட அறிகுறிகள்: ${symptomsJoined || "இதய அறிகுறிகள்"}, தீவிரத்தன்மை: ${severity}/10${durationLabel ? `, காலம்: ${durationLabel}` : ""}${sudden ? " (திடீரென தொடங்கியது)" : ""}. `;

    if (probPercent != null) {
      problemParagraph += `உங்கள் மருத்துவ ஆய்வக அளவீடுகளின்படி கணக்கிடப்பட்ட இயந்திர கற்றல் (ML) நிகழ்தகவு ${probPercent}% ஆகும். இதய மருத்துவத்தில், 80%-க்கும் அதிகமான அளவு என்பது உங்கள் ரத்த அழுத்தம், கொலஸ்ட்ரால் மற்றும் இதய துடிப்பு அளவுகள் 50%-க்கும் அதிகமான ரத்தக் குழாய் அடைப்பு (Coronary Stenosis) உள்ள இதய நோயாளிகளோடு நெருக்கமாக ஒத்துப்போகிறது என்பதை குறிக்கிறது. `;
    }

    if (riskFactorsJoined) {
      problemParagraph += `மேலும், உங்களுக்கு ஏற்கனவே உள்ள காரணிகள் (${riskFactorsJoined}) ரத்தக் குழாய்களில் கொழுப்பு படிவை துரிதப்படுத்தி, இதயத்தின் வேலைப் பளுவை பன்மடங்கு அதிகரிக்கின்றன. `;
    }

    if (hasChestPain) {
      pathophysiology =
        "இதயத்திற்கு ரத்தம் கொண்டு செல்லும் தமனிகளில் கொழுப்பு படிந்து சுருங்கும் போது, இதய தசைகளுக்கு தேவையான ஆக்ஸிஜன் கிடைக்காமல் போகிறது. இதனால் இதய தசைகள் வலியை உணர்ந்து மார்பு அழுத்தம் மற்றும் எரிச்சலை உருவாக்குகின்றன.";
    } else if (hasFatigue) {
      pathophysiology =
        "இதயத்தின் பம்பிங் திறன் குறையும் போது, உடலின் முக்கிய உறுப்புகளுக்கு மட்டுமே இதயம் ரத்தத்தை முன்னுரிமை கொடுத்து அனுப்புகிறது. இதனால் கை, கால் தசைகளுக்கு போதிய ஆக்ஸிஜன் கிடைக்காமல் தீவிர சோர்வு மற்றும் குறைந்த உழைப்பிலேயே மூச்சு வாங்குதல் ஏற்படுகிறது.";
    } else if (hasBreathlessness) {
      pathophysiology =
        "இதயத்தின் இடது வென்ட்ரிக்கிள் அறை முழுமையாக ரத்தத்தை வெளியேற்ற முடியாத போது, ரத்தம் நுரையீரலின் ரத்த நாளங்களில் பின்நோக்கி தேங்குகிறது. இதனால் நுரையீரலில் நீர் கோர்த்து கடுமையான மூச்சுத்திணறல் ஏற்படுகிறது.";
    } else {
      pathophysiology =
        "உயர் ரத்த அழுத்தம் அல்லது ரத்த நாள அடைப்பு காரணமாக இதயம் வழக்கத்தை விட அதிக விசையுடன் ரத்தத்தை பம்ப் செய்ய வேண்டிய கட்டாயத்திற்கு உள்ளாகிறது. இது இதய சுவரை தடிமனாக்கி சோர்வை ஏற்படுத்துகிறது.";
    }

    if (probPercent != null) {
      mlPercentageExplanation =
        probPercent >= 70
          ? `ML கணக்கீட்டு அளவு ${probPercent}% என்பது க்ளீவ்லேண்ட் கிளினிக் இதய தரவுகளின்படி "அதிக அபாயம்" (HIGH RISK) ஆகும். இது உறுதியான நோய் தீர்ப்பு அல்ல என்றாலும், உடனடியாக இதய மருத்துவரை சந்தித்து ECG மற்றும் எக்கோ எடுக்க வேண்டிய அவசியத்தை காட்டுகிறது.`
          : probPercent >= 40
            ? `ML கணக்கீட்டு அளவு ${probPercent}% என்பது "மிதமான அபாயம்" (MODERATE RISK) ஆகும். மருத்துவர் மூலம் ரத்த நாள அடைப்பை உறுதி செய்து கொள்வது நல்லது.`
            : `ML கணக்கீட்டு அளவு ${probPercent}% என்பது "குறைந்த அபாயம்" (LOW RISK) ஆகும். எனினும் அறிகுறிகள் தொடர்ந்தால் மருத்துவரை அணுகவும்.`;
    }
  }

  // -------------------------------------------------------------------------
  // 2. HINDI TRANSLATIONS (हिंदी)
  // -------------------------------------------------------------------------
  else if (lang === "hi") {
    if (emergency || (hasChestPain && (symptoms.includes("pain_spreading") || severity >= 7))) {
      primaryCondition = "तीव्र दिल का दौरा चेतावनी (Acute Coronary Syndrome - ACS Alert)";
      conditionSubtitle = "हृदय की मांसपेशियों की सुरक्षा के लिए तत्काल आपातकालीन चिकित्सा मूल्यांकन की आवश्यकता है।";
    } else if (hasChestPain) {
      primaryCondition = "कोरोनरी धमनी रोग / एंजाइना (Angina Pectoris / CAD)";
      conditionSubtitle = "हृदय की धमनियों में रुकावट के कारण हृदय की मांसपेशियों तक रक्त प्रवाह कम होने का संकेत।";
    } else if (hasBreathlessness && hasSwelling) {
      primaryCondition = "कंजेस्टिव हार्ट फेलियर और द्रव संचय (Congestive Heart Failure)";
      conditionSubtitle = "हृदय की पंपिंग क्षमता कमजोर होने से फेफड़ों और पैरों में पानी जमा होने के लक्षण।";
    } else if (hasFatigue && (isHighRisk || riskFactors.length >= 2)) {
      primaryCondition = "मायोकार्डियल इस्किमिया और हृदय की थकान (Myocardial Ischemia & Cardiac Fatigue)";
      conditionSubtitle = "हृदय तक रक्त प्रवाह की कमी और मशीन लर्निंग (ML) उच्च जोखिम स्कोर।";
    } else if (hasPalpitations || hasFainting) {
      primaryCondition = "हृदय की धड़कन में अनियमितता (Cardiac Arrhythmia)";
      conditionSubtitle = "हृदय के विद्युत संवहन में असामान्यता या मस्तिष्क में क्षणिक रक्त प्रवाह की कमी।";
    } else if (isHighRisk) {
      primaryCondition = "उच्च हृदय संबंधी जोखिम (Atherosclerotic Cardiovascular Strain)";
      conditionSubtitle = "धमनियों में रुकावट की उच्च सांख्यिकीय संभावना का संकेत।";
    } else {
      primaryCondition = "हृदय तनाव और रक्त संचार असंतुलन (Cardiovascular Strain)";
      conditionSubtitle = "लक्षण संकेत करते हैं कि हृदय पर सामान्य से अधिक कार्यभार है।";
    }

    problemParagraph = `आपके मूल्यांकन के अनुसार, आपकी प्राथमिक स्वास्थ्य समस्या "${primaryCondition}" है। आपने ${symptomsJoined || "हृदय संबंधी लक्षण"} की सूचना दी है, जिसकी गंभीरता ${severity}/10${durationLabel ? ` और अवधि ${durationLabel}` : ""}${sudden ? " (अचानक शुरू हुआ)" : ""} है। `;

    if (probPercent != null) {
      problemParagraph += `आपके नैदानिक मापदंडों के आधार पर मशीन लर्निंग (ML) मॉडल ने ${probPercent}% जोखिम स्कोर की गणना की है। हृदय विज्ञान में, यह दर्शाता है कि आपका रक्तचाप, कोलेस्ट्रॉल और हृदय गति 50% से अधिक धमनी संकुचन (Coronary Stenosis) वाले हृदय रोगियों से अत्यधिक मेल खाते हैं। `;
    }

    if (riskFactorsJoined) {
      problemParagraph += `इसके अतिरिक्त, आपके पूर्व-मौजूदा जोखिम कारक (${riskFactorsJoined}) धमनियों में प्लाक जमने की प्रक्रिया को तेज करके हृदय पर तनाव को बढ़ाते हैं। `;
    }

    if (hasChestPain) {
      pathophysiology =
        "जब कोरोनरी धमनियों में प्लाक जम जाता है, तो हृदय की मांसपेशियों को पर्याप्त ऑक्सीजन नहीं मिल पाती। ऑक्सीजन की इस कमी (इस्किमिया) के कारण सीने में भारी दबाव और दर्द होता है।";
    } else if (hasFatigue) {
      pathophysiology =
        "हृदय की पंपिंग क्षमता कम होने पर शरीर महत्वपूर्ण अंगों को रक्त की प्राथमिकता देता है, जिससे मांसपेशियों को पर्याप्त ऑक्सीजन नहीं मिलती और लगातार थकान महसूस होती है।";
    } else if (hasBreathlessness) {
      pathophysiology =
        "जब हृदय का बायां वेंट्रिकल पूरी तरह से रक्त खाली नहीं कर पाता, तो रक्त फेफड़ों की नसों में वापस जमा होने लगता है, जिससे सांस लेने में भारी तकलीफ होती है।";
    } else {
      pathophysiology =
        "उच्च रक्तचाप या संकीर्ण धमनियों के कारण हृदय को रक्त पंप करने के लिए अधिक बल लगाना पड़ता है, जिससे हृदय की दीवारें मोटी हो जाती हैं।";
    }

    if (probPercent != null) {
      mlPercentageExplanation =
        probPercent >= 70
          ? `मशीन लर्निंग स्कोर ${probPercent}% क्लीवलैंड क्लिनिक कार्डियोवैस्कुलर डेटा के अनुसार "उच्च जोखिम" (HIGH RISK) दर्शाता है। तुरंत हृदय रोग विशेषज्ञ (कार्डियोलॉजिस्ट) से मिलकर ईसीजी और इको जांच करानी चाहिए।`
          : probPercent >= 40
            ? `मशीन लर्निंग स्कोर ${probPercent}% "मध्यम जोखिम" दर्शाता है। डॉक्टर से जांच कराकर धमनी की स्थिति स्पष्ट करना उचित है।`
            : `मशीन लर्निंग स्कोर ${probPercent}% "कम जोखिम" दर्शाता है, लेकिन लक्षण जारी रहने पर डॉक्टर से परामर्श अवश्य लें।`;
    }
  }

  // -------------------------------------------------------------------------
  // 3. ENGLISH TRANSLATIONS (DEFAULT)
  // -------------------------------------------------------------------------
  else {
    if (emergency || (hasChestPain && (symptoms.includes("pain_spreading") || severity >= 7))) {
      primaryCondition = "Acute Coronary Syndrome (ACS) / High-Grade Myocardial Ischemia Alert";
      conditionSubtitle = "Urgent presentation requiring immediate emergency evaluation to rule out acute myocardial infarction.";
    } else if (hasChestPain) {
      primaryCondition = "Suspected Angina Pectoris / Coronary Artery Disease (CAD)";
      conditionSubtitle = "Retrosternal discomfort suggestive of reduced arterial blood supply to the myocardium.";
    } else if (hasBreathlessness && hasSwelling) {
      primaryCondition = "Congestive Heart Failure (CHF) with Fluid Congestion";
      conditionSubtitle = "Compromised cardiac pumping efficacy leading to pulmonary or peripheral venous volume overload.";
    } else if (hasFatigue && (isHighRisk || riskFactors.length >= 2)) {
      primaryCondition = "Myocardial Perfusion Deficit & Cardiovascular Exhaustion";
      conditionSubtitle = "Persistent fatigue correlated with vascular atherosclerosis and elevated biomarker risk.";
    } else if (hasPalpitations || hasFainting) {
      primaryCondition = "Cardiac Arrhythmia / Conduction System Dysregulation";
      conditionSubtitle = "Irregular cardiac rhythm or hemodynamic instability causing transient cerebral hypoperfusion.";
    } else if (isHighRisk) {
      primaryCondition = "Elevated Atherosclerotic Cardiovascular Disease (ASCVD) Risk";
      conditionSubtitle = "High biomarker risk score indicating significant likelihood of coronary arterial narrowing.";
    } else {
      primaryCondition = "Cardiovascular Strain & Hemodynamic Workload";
      conditionSubtitle = "Symptoms reflect increased myocardial workload and systemic vascular resistance.";
    }

    problemParagraph = `Based on your evaluation, your primary clinical concern is ${primaryCondition.toLowerCase()}. You reported experiencing ${symptomsJoined || "reported symptoms"} with a severity rating of ${severity}/10${durationLabel ? ` lasting for ${durationLabel}` : ""}${sudden ? " with sudden onset" : ""}. `;

    if (probPercent != null) {
      problemParagraph += `Your clinical machine-learning evaluation scored an ${probPercent}% biomarker probability. In cardiac medicine, this indicates that your resting hemodynamic and physiological parameters (such as blood pressure, vascular resistance, cholesterol, and heart rate metrics) match the diagnostic profiles of patients with significant coronary artery disease (>50% arterial narrowing). `;
    }

    if (riskFactorsJoined) {
      problemParagraph += `Furthermore, your pre-existing risk factors (${riskFactorsJoined}) significantly compound this cardiovascular strain by accelerating arterial plaque formation and increasing myocardial workload. `;
    }

    if (hasChestPain) {
      pathophysiology =
        "When coronary arteries develop atherosclerotic plaque or constriction, oxygen delivery to the heart muscle falls below metabolic demand. This oxygen deficit (myocardial ischemia) forces heart cells into anaerobic metabolism, triggering anginal pain and pressure.";
    } else if (hasFatigue) {
      pathophysiology =
        "Cardiovascular fatigue occurs when the heart muscle's pumping capacity or stroke volume is sub-optimal. The body compensates by shunting oxygenated blood away from skeletal muscles to vital organs, producing persistent, disproportionate exhaustion even during everyday activities.";
    } else if (hasBreathlessness) {
      pathophysiology =
        "Shortness of breath indicates elevated pressures inside the left ventricle of the heart. When the ventricle cannot effectively relax or empty, blood backs up into the pulmonary veins, causing fluid transudation into the lungs.";
    } else {
      pathophysiology =
        "Your cardiovascular system is exhibiting elevated hemodynamic strain, where vascular resistance and biomarker indicators suggest the heart muscle is working harder to maintain normal systemic perfusion.";
    }

    if (probPercent != null) {
      mlPercentageExplanation =
        probPercent >= 70
          ? `The ${probPercent}% ML score reflects HIGH statistical probability of coronary artery stenosis based on the Cleveland Clinic cardiovascular cohort. This is not a formal diagnosis, but a strong screening signal that warrants priority clinical investigation.`
          : probPercent >= 40
            ? `The ${probPercent}% ML score reflects MODERATE cardiovascular probability. While not in the critical emergency bracket, active atherosclerotic disease or ventricular strain cannot be excluded without an ECG and echocardiogram.`
            : `The ${probPercent}% ML score reflects LOW statistical probability on resting clinical markers. However, persistent symptoms must still be reviewed by a physician.`;
    }
  }

  // -------------------------------------------------------------------------
  // Symptom-to-cardiac correlation
  // -------------------------------------------------------------------------
  const symptomBreakdowns: { symptom: string; explanation: string }[] = [];
  for (const s of symptoms) {
    const label = SYMPTOM_TRANSLATIONS[lang]?.[s] ?? SYMPTOMS[s as SymptomId] ?? s;
    let exp = "";
    if (lang === "ta") {
      if (s === "chest_pain") exp = "இதய தசைக்கு ஆக்ஸிஜன் பற்றாக்குறை (இஸ்கிமியா) அல்லது ரத்தக் குழாய் சுருக்கத்தால் ஏற்படுகிறது.";
      else if (s === "pain_spreading") exp = "கழுத்து மற்றும் கை நரம்புகளுக்கு இதய வலி பரவுவது ரத்தக் குழாய் அடைப்பின் தீவிர அறிகுறி.";
      else if (s === "fatigue" || s === "reduced_exercise_tolerance") exp = "இதய பம்பிங் குறைவால் உடலின் தசைகளுக்கு போதிய ஆக்ஸிஜன் கிடைக்காமல் தீவிர சோர்வு உண்டாகிறது.";
      else if (s === "breathlessness" || s === "orthopnea") exp = "நுரையீரல் ரத்த நாளங்களில் அழுத்தம் அதிகரித்து நீர் கோர்ப்பதால் மூச்சுத்திணறல் ஏற்படுகிறது.";
      else if (s === "palpitations") exp = "இதய துடிப்பில் கூடுதல் துடிப்புகள் (Ectopics) அல்லது மின்னணு சுழற்சி கோளாறு ஏற்படுதல்.";
      else if (s === "cold_sweat") exp = "இதயம் அதிக சிரமப்படும் போது உடலின் தற்காப்பு நரம்பு மண்டலம் தூண்டப்பட்டு குளிர்ந்த வியர்வை கொட்டுகிறது.";
      else if (s === "fainting" || s === "dizziness") exp = "மூளைக்கு செல்லும் ரத்த ஓட்டம் ஒரு சில வினாடிகள் குறைவதால் தலைச்சுற்றல் அல்லது மயக்கம் ஏற்படுகிறது.";
      else if (s === "leg_swelling" || s === "rapid_weight_gain") exp = "இதய செயலிழப்பினால் ரத்த ஓட்டம் தேங்கி கால்களிலும் பாதங்களிலும் நீர் வீக்கம் உண்டாகிறது.";
      else exp = "இதய சுமை மற்றும் ரத்த நாள அழுத்தத்தோடு தொடர்புடைய அறிகுறி.";
    } else if (lang === "hi") {
      if (s === "chest_pain") exp = "हृदय की मांसपेशियों में ऑक्सीजन की कमी (इस्केमिया) के कारण सीने में दबाव उत्पन्न होता है।";
      else if (s === "pain_spreading") exp = "हाथ और जबड़े में दर्द का फैलना कोरोनरी धमनी में तीव्र रुकावट का गंभीर संकेत है।";
      else if (s === "fatigue" || s === "reduced_exercise_tolerance") exp = "कमजोर पंपिंग के कारण मांसपेशियों को पर्याप्त ऑक्सीजन न मिलने से लगातार थकान होती है।";
      else if (s === "breathlessness" || s === "orthopnea") exp = "फेफड़ों में दबाव बढ़ने और द्रव संचय होने से सांस लेने में कठिनाई होती है।";
      else if (s === "palpitations") exp = "हृदय की विद्युत प्रणाली में असामान्यता के कारण धड़कन तेज या अनियमित होना।";
      else if (s === "cold_sweat") exp = "हृदय पर तीव्र तनाव होने पर ऑटोनोमिक नर्वस सिस्टम के कारण ठंडा पसीना आता है।";
      else if (s === "fainting" || s === "dizziness") exp = "मस्तिष्क में रक्त प्रवाह में क्षणिक गिरावट के कारण चक्कर आना या बेहोशी होना।";
      else if (s === "leg_swelling" || s === "rapid_weight_gain") exp = "हृदय की कमजोरी के कारण पैरों और पंजों में पानी का जमाव होना।";
      else exp = "हृदय संबंधी तनाव से जुड़ा लक्षण।";
    } else {
      if (s === "chest_pain") exp = "Indicates myocardial oxygen supply-demand mismatch (angina) or coronary plaque narrowing.";
      else if (s === "pain_spreading") exp = "Pain radiating along dermatomes to arm or jaw is a classic sign of coronary artery obstruction.";
      else if (s === "fatigue" || s === "reduced_exercise_tolerance") exp = "Cardiac output cannot meet peripheral demands, producing persistent muscular exhaustion.";
      else if (s === "breathlessness" || s === "orthopnea") exp = "Dyspnea reflects elevated left ventricular filling pressure and early pulmonary congestion.";
      else if (s === "palpitations") exp = "Abnormal electrical impulses disrupting synchronized pumping rhythm.";
      else if (s === "cold_sweat") exp = "Diaphoresis triggered by acute sympathetic overdrive in response to myocardial stress.";
      else if (s === "fainting" || s === "dizziness") exp = "Transient drop in cerebral perfusion due to low stroke volume or arrhythmia.";
      else if (s === "leg_swelling" || s === "rapid_weight_gain") exp = "Peripheral edema caused by venous congestion and fluid retention in heart failure.";
      else exp = "Symptom correlated with cardiovascular hemodynamic strain.";
    }
    symptomBreakdowns.push({ symptom: label, explanation: exp });
  }

  // -------------------------------------------------------------------------
  // Emergency Red Flags
  // -------------------------------------------------------------------------
  const emergencyTriggers: { code: string; title: string; rationale: string }[] = [];
  for (const code of firedRules) {
    const info = RED_FLAG_DESCRIPTIONS[lang]?.[code] ?? RED_FLAG_DESCRIPTIONS.en[code];
    if (info) {
      emergencyTriggers.push({ code, title: info.title, rationale: info.rationale });
    }
  }

  // -------------------------------------------------------------------------
  // How to solve: Action Plan
  // -------------------------------------------------------------------------
  let urgencyLevel = "";
  let urgencyBadgeColor = "";
  let recommendedTimeline = "";

  if (emergency || isHighRisk) {
    urgencyBadgeColor = "bg-[var(--cardiac-100)] text-[var(--cardiac-800)] border-[var(--cardiac-300)]";
    if (lang === "ta") {
      urgencyLevel = emergency ? "உடனடி அவசர சிகிச்சை தேவை" : "முன்னுரிமை இதய மருத்துவர் சந்திப்பு";
      recommendedTimeline = emergency ? "உடனடியாக (1 மணி நேரத்திற்குள்) — 108/112 அழைக்கவும்" : "24 முதல் 48 மணி நேரத்திற்குள்";
    } else if (lang === "hi") {
      urgencyLevel = emergency ? "तत्काल आपातकालीन चिकित्सा" : "प्राथमिक कार्डियोलॉजी परामर्श";
      recommendedTimeline = emergency ? "तत्काल (1 घंटे के भीतर) — 108/112 डायल करें" : "24 से 48 घंटों के भीतर";
    } else {
      urgencyLevel = emergency ? "IMMEDIATE EMERGENCY CARE" : "PRIORITY URGENT CARDIOLOGY CONSULT";
      recommendedTimeline = emergency ? "IMMEDIATELY (Within 1 hour) — Dial 108/112" : "Within 24 to 48 hours";
    }
  } else if (isModerateRisk) {
    urgencyBadgeColor = "bg-amber-100 text-amber-800 border-amber-300";
    if (lang === "ta") {
      urgencyLevel = "விரைவான இதய பரிசோதனை பரிந்துரை";
      recommendedTimeline = "3 முதல் 5 நாட்களுக்குள்";
    } else if (lang === "hi") {
      urgencyLevel = "शीघ्र कार्डियोलॉजी मूल्यांकन";
      recommendedTimeline = "3 से 5 दिनों के भीतर";
    } else {
      urgencyLevel = "PROMPT CARDIOLOGY EVALUATION";
      recommendedTimeline = "Within 3 to 5 business days";
    }
  } else {
    urgencyBadgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (lang === "ta") {
      urgencyLevel = "வழக்கமான மருத்துவ ஆலோசனை";
      recommendedTimeline = "1 முதல் 2 வாரங்களுக்குள்";
    } else if (lang === "hi") {
      urgencyLevel = "नियमित बाह्य रोगी परामर्श";
      recommendedTimeline = "1 से 2 सप्ताह के भीतर";
    } else {
      urgencyLevel = "ROUTINE OUTPATIENT CONSULTATION";
      recommendedTimeline = "Within 1 to 2 weeks";
    }
  }

  // Diagnostic tests
  const diagnosticTests: { name: string; purpose: string }[] = [];
  if (lang === "ta") {
    diagnosticTests.push(
      {
        name: "12-Lead Resting ECG (இதய மின் துடிப்பு பதிவு)",
        purpose: "மாரடைப்பு, ரத்த ஓட்ட குறைபாடு (Ischemia) மற்றும் ஒழுங்கற்ற இதய துடிப்புகளை கண்டறிய.",
      },
      {
        name: "2D Echocardiogram with Doppler (2D எக்கோ)",
        purpose: "இதயத்தின் பம்பிங் திறன் (LVEF சதவீதம்) மற்றும் வால்வு செயல்பாட்டை துல்லியமாக அறிய.",
      },
      {
        name: "High-Sensitivity Cardiac Troponin I (hs-cTnI)",
        purpose: "மாரடைப்பு அல்லது இதய தசை சேதத்தை உறுதிப்படுத்தும் ரத்தப் பரிசோதனை.",
      },
      {
        name: "TMT (Treadmill Stress Test) / Stress Echo",
        purpose: "உடல் இயங்கும் போது இதய ரத்த நாளங்களில் ஏற்படும் அடைப்புகளை கண்டறிய.",
      },
      {
        name: "Lipid Profile & HbA1c (கொலஸ்ட்ரால் மற்றும் சர்க்கரை)",
        purpose: "LDL கொலஸ்ட்ரால் மற்றும் 3 மாத சர்க்கரை கட்டுப்பாட்டை அறிய.",
      },
    );
  } else if (lang === "hi") {
    diagnosticTests.push(
      {
        name: "12-लीड ईसीजी (12-Lead Resting ECG)",
        purpose: "दिल के दौरे, इस्किमिया और दिल की असामान्य धड़कनों का पता लगाने के लिए।",
      },
      {
        name: "2D इकोकार्डियोग्राफी (2D Echo with Doppler)",
        purpose: "हृदय की पंपिंग क्षमता (LVEF) और वाल्व के कामकाज की जांच के लिए।",
      },
      {
        name: "कार्डियक ट्रोपोनिन टेस्ट (hs-cTnI Blood Test)",
        purpose: "दिल की मांसपेशियों में किसी भी प्रकार के नुकसान की पुष्टि करने के लिए।",
      },
      {
        name: "टीएमटी स्ट्रेस टेस्ट (TMT / Stress Echo)",
        purpose: "शारीरिक परिश्रम के दौरान हृदय में रक्त संचार की जांच करने के लिए।",
      },
      {
        name: "लिपिड प्रोफाइल और HbA1c (कोलेस्ट्रॉल और शुगर)",
        purpose: "धमनियों में रुकावट पैदा करने वाले कोलेस्ट्रॉल और शुगर के स्तर को मापने के लिए।",
      },
    );
  } else {
    diagnosticTests.push(
      {
        name: "12-Lead Resting Electrocardiogram (ECG)",
        purpose: "Detects acute or prior ischemia, ST-segment elevations/depressions, and arrhythmias.",
      },
      {
        name: "2D Echocardiogram with Color Doppler",
        purpose: "Evaluates Left Ventricular Ejection Fraction (LVEF), wall motion, and heart valve function.",
      },
      {
        name: "High-Sensitivity Cardiac Troponin I (hs-cTnI)",
        purpose: "Gold-standard blood test to rule in or rule out acute myocardial cell injury or heart attack.",
      },
      {
        name: "Treadmill Stress Test (TMT) or Stress Echo",
        purpose: "Assesses how coronary blood flow performs under physical exertion.",
      },
      {
        name: "Comprehensive Lipid Profile & HbA1c",
        purpose: "Measures LDL cholesterol and glycemic control to quantify atherosclerotic plaque risk.",
      },
    );
  }

  // Immediate safety actions
  const immediateSafetyActions: string[] = [];
  if (lang === "ta") {
    if (emergency) {
      immediateSafetyActions.push("உடனடியாக 108 (ஆம்புலன்ஸ்) அல்லது 112-க்கு அழைக்கவும். சுயமாக வாகனம் ஓட்டக்கூடாது.");
      immediateSafetyActions.push("முதுகை நேராக வைத்து சாய்வாக (Semi-reclined) அமரவும். இது இதயத்தின் சுமையை குறைக்கும்.");
      immediateSafetyActions.push("கழுத்து மற்றும் மார்பில் உள்ள இறுக்கமான உடைகளை தளர்த்தவும்.");
      immediateSafetyActions.push("மருத்துவர் அனுமதி இன்றி சொந்தமாக மருந்துகள் உட்கொள்வதை தவிர்க்கவும்.");
    } else {
      immediateSafetyActions.push("மருத்துவ பரிசோதனை முடியும் வரை கடினமான உடற்பயிற்சி மற்றும் எடைகளை தூக்குவதை தவிர்க்கவும்.");
      immediateSafetyActions.push("மார்பு வலி திடீரென அதிகமானால் உடனே அவசர சிகிச்சை பிரிவுக்கு செல்லவும்.");
      immediateSafetyActions.push("அவசர உதவி எண்களை (108/112 மற்றும் குடும்பத்தினர்) தயாராக வைத்திருக்கவும்.");
    }
  } else if (lang === "hi") {
    if (emergency) {
      immediateSafetyActions.push("तुरंत 108 (एम्बुलेंस) या 112 पर कॉल करें। स्वयं गाड़ी चलाने का प्रयास न करें।");
      immediateSafetyActions.push("सीधे न लेटें, थोड़ा झुककर या तकिए के सहारे बैठें ताकि हृदय पर दबाव कम हो।");
      immediateSafetyActions.push("गर्दन और सीने के टाइट कपड़ों को ढीला करें।");
      immediateSafetyActions.push("डॉक्टर की सलाह के बिना कोई भी अनजानी दवा न लें।");
    } else {
      immediateSafetyActions.push("डॉक्टर की अनुमति तक भारी वजन उठाना और कठोर व्यायाम बंद रखें।");
      immediateSafetyActions.push("यदि सीने का दर्द बढ़े तो बिना देरी किए अस्पताल की इमरजेंसी में जाएं।");
      immediateSafetyActions.push("आपातकालीन नंबर (108/112) अपने फोन में तैयार रखें।");
    }
  } else {
    if (emergency) {
      immediateSafetyActions.push("Call 108 (ambulance) or 112 immediately. Do not attempt to drive yourself.");
      immediateSafetyActions.push("Sit in an upright or semi-reclined position to reduce the heart's workload.");
      immediateSafetyActions.push("Loosen tight clothing around the neck and chest.");
      immediateSafetyActions.push("Avoid taking unprescribed medications unless specifically instructed by an emergency clinician.");
    } else {
      immediateSafetyActions.push("Cease heavy physical exertion, heavy lifting, or intense workouts until medically cleared.");
      immediateSafetyActions.push("If symptoms suddenly worsen or chest pain spreads, escalate immediately to an emergency room.");
      immediateSafetyActions.push("Keep emergency contact numbers (108/112 and family) readily accessible.");
    }
  }

  // Medical management
  const medicalManagement: string[] = [];
  if (lang === "ta") {
    medicalManagement.push("இந்த மருத்துவ அறிக்கையை ஒரு தகுதிவாய்ந்த கார்டியாலஜிஸ்ட்டிடம் காண்பித்து முறையான பரிசோதனை செய்து கொள்ளவும்.");
    medicalManagement.push("ரத்தக் குழாய் அடைப்பை தடுக்கும் ஆஸ்பிரின், கொலஸ்ட்ராலை குறைக்கும் ஸ்டேடின் மருந்துகள் பற்றி மருத்துவரிடம் ஆலோசனை பெறவும்.");
    medicalManagement.push("ஏற்கனவே எடுத்துவரும் ரத்த அழுத்தம் மற்றும் சர்க்கரை மாத்திரைகளை மருத்துவர் அனுமதியின்றி நிறுத்தக்கூடாது.");
  } else if (lang === "hi") {
    medicalManagement.push("इस रिपोर्ट को योग्य कार्डियोलॉजिस्ट को दिखाएं और लक्षणों का विस्तृत परीक्षण करवाएं।");
    medicalManagement.push("धमनियों को साफ रखने और क्लॉट से बचाव के लिए एस्पिरिन और स्टैटिन दवाओं पर डॉक्टर से चर्चा करें।");
    medicalManagement.push("अपनी मौजूदा बीपी और शुगर की दवाओं को डॉक्टर की सलाह के बिना कभी बंद न करें।");
  } else {
    medicalManagement.push("Consult a qualified Interventional Cardiologist to review this report along with your symptom history.");
    medicalManagement.push("Discuss initiating or optimizing cardioprotective therapy (statins, antiplatelets, or blood pressure regulators) based on your physician's evaluation.");
    medicalManagement.push("Do not stop or alter any existing prescribed blood pressure or diabetic medications without doctor approval.");
  }

  // Lifestyle and monitoring
  const lifestyleAndMonitoring: string[] = [];
  if (lang === "ta") {
    lifestyleAndMonitoring.push("உப்பு கட்டுப்பாடு: உணவில் உப்பை நாள் ஒன்றுக்கு 2000 மி.கி.-க்கு கீழ் (1 டீஸ்பூன்) குறைக்கவும்.");
    lifestyleAndMonitoring.push("தினசரி BP மற்றும் நாடித் துடிப்பு: தினமும் காலை மற்றும் மாலை ரத்த அழுத்தத்தை குறித்து வைக்கவும்.");
    lifestyleAndMonitoring.push("உணவு முறை: எண்ணெய், கொழுப்பு மற்றும் வறுத்த உணவுகளை தவிர்த்து சத்தான காய்கறிகளை சேர்க்கவும்.");
    lifestyleAndMonitoring.push("புகைபிடித்தல் தவிர்த்தல்: புகைபிடித்தல் மற்றும் புகையிலையை முற்றிலுமாக நிறுத்த வேண்டும்.");
  } else if (lang === "hi") {
    lifestyleAndMonitoring.push("नमक का कम सेवन: भोजन में नमक प्रतिदिन 2000 मिलीग्राम (1 चम्मच से कम) तक सीमित रखें।");
    lifestyleAndMonitoring.push("दैनिक बीपी और पल्स रिकॉर्ड: रोजाना सुबह और शाम रक्तचाप नोट करें और डॉक्टर को दिखाएं।");
    lifestyleAndMonitoring.push("आहार: तैलीय और जंक फूड से बचें, हरी पत्तेदार सब्जियां और फल शामिल करें।");
    lifestyleAndMonitoring.push("धूम्रपान निषेध: तंबाकू और सिगरेट का सेवन तुरंत और पूरी तरह बंद करें।");
  } else {
    lifestyleAndMonitoring.push("Sodium Restriction: Limit dietary salt to under 2,000 mg (less than 1 teaspoon) daily to reduce vascular pressure.");
    lifestyleAndMonitoring.push("Daily Vitals Log: Measure resting blood pressure and heart rate every morning and evening; bring this log to your doctor.");
    lifestyleAndMonitoring.push("Diet: Avoid deep-fried and processed foods; adopt heart-healthy Mediterranean or DASH diet principles.");
    lifestyleAndMonitoring.push("Avoid Stimulants: Refrain from tobacco, smoking, vaping, excess caffeine, and alcohol.");
  }

  return {
    language: lang,
    primaryCondition,
    conditionSubtitle,
    problemParagraph,
    pathophysiology,
    mlPercentageExplanation,
    symptomBreakdowns,
    emergencyTriggers,
    resolutionPlan: {
      urgencyLevel,
      urgencyBadgeColor,
      recommendedTimeline,
      diagnosticTests,
      medicalManagement,
      immediateSafetyActions,
      lifestyleAndMonitoring,
    },
  };
}
