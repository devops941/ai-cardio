"""Shared constants (Section 7) - must stay identical to the TypeScript copy."""

SYMPTOMS: dict[str, str] = {
    "chest_pain": "Chest pain / pressure / tightness",
    "pain_spreading": "Pain spreading to left arm, jaw, neck or back",
    "breathlessness": "Shortness of breath",
    "palpitations": "Palpitations / irregular heartbeat",
    "dizziness": "Dizziness or light-headedness",
    "fainting": "Fainting (loss of consciousness)",
    "cold_sweat": "Cold sweat",
    "nausea_chest": "Nausea or vomiting with chest discomfort",
    "fatigue": "Unusual tiredness or fatigue",
    "leg_swelling": "Swelling of legs, ankles or feet",
    "reduced_exercise_tolerance": "Reduced exercise tolerance",
    "orthopnea": "Breathless when lying flat or waking at night breathless",
    "rapid_weight_gain": "Rapid weight gain (fluid retention)",
    "bluish_skin": "Bluish lips or fingertips",
}

DURATIONS: dict[str, tuple[str, int]] = {
    "lt_15min": ("Less than 15 minutes", 10),
    "15_60min": ("15 to 60 minutes", 30),
    "1_24h": ("1 to 24 hours", 720),
    "1_7d": ("1 to 7 days", 4320),
    "1_4w": ("1 to 4 weeks", 20160),
    "gt_1m": ("More than a month", 60000),
}

RISK_FACTORS: dict[str, str] = {
    "diabetes": "Diabetes",
    "hypertension": "High blood pressure",
    "smoking": "Smoking",
    "high_cholesterol": "High cholesterol",
    "family_history": "Family history of heart disease",
    "obesity": "Obesity",
    "sedentary": "Sedentary lifestyle",
}

DISCLAIMER = (
    "This is an AI-based screening tool for educational purposes, not a medical "
    "diagnosis. Always consult a qualified doctor. In an emergency call 108 or 112."
)
NON_HEART_MESSAGE = (
    "CardioCare AI only checks heart-related symptoms. Please consult a general "
    "physician for other concerns."
)
INSUFFICIENT_KNOWLEDGE_MESSAGE = (
    "Not enough heart-related knowledge in the system for these symptoms; please "
    "consult a cardiologist."
)
LLM_FALLBACK_MESSAGE = (
    "The AI explanation is temporarily unavailable. Please consult a cardiologist, "
    "and use the hospital list below."
)
EMERGENCY_BANNER = "Call 108 (ambulance) / 112 now"

CLINICAL_RANGES: dict[str, tuple[float, float]] = {
    "age": (1, 120),
    "sex": (0, 1),
    "cp": (1, 4),
    "trestbps": (80, 250),
    "chol": (100, 600),
    "fbs": (0, 1),
    "restecg": (0, 2),
    "thalach": (60, 220),
    "exang": (0, 1),
    "oldpeak": (0, 7),
    "slope": (1, 3),
    "ca": (0, 3),
    "thal": (3, 7),
}

EMERGENCY_PHRASES = ("crushing", "heavy weight on chest", "elephant on my chest")

MOCK_HEART_KEYWORDS = (
    "chest",
    "heart",
    "cardiac",
    "palpit",
    "breath",
    "dizz",
    "faint",
    "swell",
    "sweat",
    "jaw",
    "arm pain",
    "blood pressure",
    "cholesterol",
    "angina",
    "pulse",
    "fatigue",
    "tired",
)
