"""Generate the starter knowledge base (Appendix B).

Writes docs/knowledge/heart_symptoms_kb.xlsx and docs/knowledge/heart_basics.md.
The text is original and deliberately conservative: no medicine names with
doses and no definitive-diagnosis language.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[2]
KNOWLEDGE_DIR = REPO_ROOT / "docs" / "knowledge"

ROWS = [
    (
        "Chest pain or pressure",
        "Squeezing, heaviness or tightness in the centre or left of the chest, "
        "often brought on by exertion and relieved by rest.",
        "Angina; coronary artery disease; myocardial infarction",
        "High",
        "Immediately if it lasts more than 15 minutes, occurs at rest, or comes "
        "with sweating or breathlessness; call 108 or 112.",
    ),
    (
        "Pain spreading to arm, jaw or back",
        "Chest discomfort that travels to the left arm, jaw, neck, shoulder or "
        "back. This pattern is common in reduced blood flow to the heart muscle.",
        "Angina; myocardial infarction",
        "High",
        "Call 108 or 112 immediately; this can be a heart attack warning sign.",
    ),
    (
        "Shortness of breath",
        "Difficulty breathing during activity or when lying flat, sometimes "
        "waking at night gasping for air.",
        "Heart failure; valve disease; cardiomyopathy",
        "Moderate",
        "Within a day if new or worsening; immediately if sudden and severe or "
        "with chest pain.",
    ),
    (
        "Palpitations",
        "Awareness of a fast, pounding or irregular heartbeat.",
        "Arrhythmia such as atrial fibrillation; hypertension-related heart disease",
        "Moderate",
        "Consult a cardiologist if frequent or lasting more than a few minutes; "
        "urgently with fainting or chest pain.",
    ),
    (
        "Dizziness or light-headedness",
        "A spinning or unsteady feeling, sometimes with a drop in blood pressure "
        "or an irregular heart rhythm.",
        "Arrhythmia; aortic valve disease; low blood pressure",
        "Moderate",
        "See a doctor soon; urgently if it happens with fainting or chest pain.",
    ),
    (
        "Fainting",
        "A brief loss of consciousness. In heart conditions it may be caused by a "
        "dangerous rhythm or a narrowed valve.",
        "Arrhythmia; aortic stenosis; structural heart disease",
        "High",
        "Seek emergency care; call 108 or 112.",
    ),
    (
        "Cold sweat",
        "Sudden clammy sweating, especially with chest discomfort, can accompany a "
        "heart attack.",
        "Myocardial infarction; unstable angina",
        "High",
        "Call 108 or 112 immediately if it occurs with chest pain.",
    ),
    (
        "Nausea or vomiting with chest discomfort",
        "Feeling sick or vomiting together with chest symptoms is more common in "
        "heart attacks, particularly in women and older adults.",
        "Myocardial infarction",
        "High",
        "Call 108 or 112 immediately.",
    ),
    (
        "Unusual tiredness or fatigue",
        "Marked tiredness during normal activity, sometimes the main symptom of "
        "heart disease in women and older adults.",
        "Heart failure; coronary artery disease; anaemia",
        "Moderate",
        "Get checked within a few days, sooner if it is new and severe.",
    ),
    (
        "Swelling of legs, ankles or feet",
        "Fluid collecting in the lower limbs, often worse in the evening and with "
        "rapid weight gain.",
        "Heart failure; valve disease",
        "Moderate",
        "Consult a doctor soon, especially with breathlessness or sudden weight gain.",
    ),
    (
        "Reduced exercise tolerance",
        "Getting breathless or tired sooner than before during walking, stairs or "
        "household work.",
        "Coronary artery disease; heart failure; valve disease",
        "Moderate",
        "See a doctor within a week for assessment.",
    ),
    (
        "Breathless when lying flat",
        "Needing extra pillows to breathe at night, or waking up breathless.",
        "Heart failure",
        "Moderate",
        "Consult a doctor soon; urgently if it is severe or worsening quickly.",
    ),
    (
        "Rapid weight gain",
        "A gain of two to three kilograms over a few days, usually from fluid "
        "retention rather than food.",
        "Heart failure",
        "Moderate",
        "Contact your doctor; this can signal worsening heart failure.",
    ),
    (
        "Bluish lips or fingertips",
        "A blue or grey tinge to the lips, tongue or fingertips, caused by low "
        "oxygen in the blood.",
        "Congenital heart disease; severe heart failure; lung disease",
        "High",
        "Seek emergency care; call 108 or 112.",
    ),
    (
        "Angina on exertion",
        "Predictable chest tightness that appears with effort and eases within "
        "minutes of resting. It suggests narrowed coronary arteries.",
        "Stable angina; coronary artery disease",
        "Moderate",
        "See a cardiologist; go to emergency care if it starts occurring at rest.",
    ),
    (
        "Heart attack warning signs",
        "Central chest pressure lasting more than 15 minutes, spreading to the arm "
        "or jaw, with sweating, nausea or breathlessness.",
        "Myocardial infarction",
        "High",
        "Call 108 (ambulance) or 112 immediately. Do not drive yourself.",
    ),
    (
        "Heart failure signs",
        "Breathlessness on effort, breathlessness lying flat, leg swelling and "
        "rapid weight gain from fluid retention.",
        "Heart failure",
        "Moderate",
        "See a doctor promptly; seek emergency care if breathing becomes severe.",
    ),
    (
        "Arrhythmia and atrial fibrillation",
        "An irregular or racing heartbeat that may cause palpitations, dizziness, "
        "breathlessness or fainting. Atrial fibrillation also raises stroke risk.",
        "Atrial fibrillation; other arrhythmias",
        "Moderate",
        "Consult a cardiologist; urgently with fainting or chest pain.",
    ),
    (
        "High blood pressure",
        "Persistently raised blood pressure silently damages the heart, brain, "
        "kidneys and eyes over years.",
        "Hypertension; hypertensive heart disease",
        "Moderate",
        "Get blood pressure checked regularly and treated if raised.",
    ),
    (
        "High cholesterol",
        "Raised LDL cholesterol contributes to fatty deposits in the coronary "
        "arteries, leading to angina and heart attacks.",
        "Atherosclerosis; coronary artery disease",
        "Moderate",
        "Ask for a lipid profile and discuss diet and treatment with a doctor.",
    ),
    (
        "Family history of heart disease",
        "Early heart disease in a parent or sibling, especially before age 55 in "
        "men or 65 in women, raises personal risk.",
        "Familial risk; coronary artery disease",
        "Low",
        "Tell your doctor; screening may start earlier.",
    ),
    (
        "Smoking and heart risk",
        "Smoking damages blood vessels, lowers oxygen and makes clots more likely. "
        "Stopping is one of the most effective ways to reduce heart risk.",
        "Coronary artery disease; peripheral artery disease",
        "Moderate",
        "Ask a doctor about support to quit smoking.",
    ),
    (
        "Diabetes and heart risk",
        "Diabetes raises the risk of heart disease and can mask chest pain, so "
        "symptoms may be less typical.",
        "Coronary artery disease; diabetic heart disease",
        "Moderate",
        "Keep blood sugar controlled and get regular heart checks.",
    ),
    (
        "Obesity and heart risk",
        "Excess weight raises blood pressure, cholesterol and diabetes risk, all "
        "of which strain the heart.",
        "Coronary artery disease; heart failure",
        "Low",
        "Gradual weight loss through diet and activity helps the heart.",
    ),
    (
        "Sedentary lifestyle",
        "Low physical activity weakens the heart and circulation over time.",
        "Coronary artery disease",
        "Low",
        "Aim for regular moderate activity, building up gradually.",
    ),
    (
        "Emergency",
        "Severe or worsening chest pain, fainting, bluish lips or severe "
        "breathlessness need immediate help.",
        "Acute coronary syndrome; severe arrhythmia",
        "High",
        "Call 108 (ambulance) or 112 now.",
    ),
]

COLUMNS = ["symptom", "description", "related_conditions", "severity", "when_to_seek_help"]


HEART_BASICS = """# Heart Basics - A Plain-Language Overview

This document is general educational material for the CardioCare AI screening
tool. It is not medical advice and it never replaces a consultation with a
qualified doctor.

## What the heart does

The heart is a muscular pump about the size of your fist. It sits behind the
breastbone and beats roughly 60 to 100 times a minute at rest. Each beat pushes
blood first to the lungs, where it picks up oxygen, and then out through the
aorta to the whole body. The heart muscle itself is fed by its own arteries,
called the coronary arteries. When those arteries narrow, the heart muscle gets
less oxygen and symptoms begin.

## Coronary artery disease and angina

Coronary artery disease develops when fatty deposits, called plaque, build up
inside the coronary arteries. The artery becomes narrow and stiff, so it cannot
deliver enough blood when the heart works harder. This produces angina: a
squeezing or heaviness in the centre of the chest that appears with effort and
usually eases within a few minutes of rest. Angina can also be felt in the left
arm, jaw, neck, shoulder or back. Some people, especially women and people with
diabetes, feel breathlessness, tiredness or nausea instead of classic chest pain.
Angina that becomes unpredictable, lasts longer, or appears at rest needs urgent
assessment.

## Heart attack warning signs

A heart attack happens when a coronary artery is suddenly blocked and part of
the heart muscle is starved of oxygen. Warning signs include central chest
pressure or tightness lasting more than about fifteen minutes, pain spreading to
the arm or jaw, cold sweating, nausea, and shortness of breath. A heart attack is
a time-critical emergency: the sooner the blocked artery is opened, the more
heart muscle is saved. In India, call 108 for an ambulance or 112 for the
national emergency service. Do not drive yourself to hospital.

## Heart failure

Heart failure does not mean the heart has stopped. It means the heart cannot
pump enough blood for the body's needs. Common signs are breathlessness on
effort, breathlessness when lying flat or waking at night gasping, swelling of
the legs, ankles and feet, and rapid weight gain from fluid retention. Treatment
can control symptoms and improve survival, so early review matters.

## Arrhythmias

An arrhythmia is an abnormal heart rhythm. The heart may beat too fast, too
slow, or irregularly. Atrial fibrillation is the most common sustained
arrhythmia; it causes an irregular pulse and raises the risk of stroke. Symptoms
include palpitations, dizziness, breathlessness and tiredness. A pulse check,
an ECG and sometimes a longer monitor are used to confirm the rhythm.

## High blood pressure

Blood pressure is the force of blood against artery walls. Persistently high
blood pressure, called hypertension, usually causes no symptoms but slowly
damages the heart, brain, kidneys and eyes. It is one of the leading causes of
heart failure and stroke. It is detected by measurement and treated with
lifestyle change and, when needed, medication prescribed by a doctor.

## Cholesterol

Cholesterol is a fat-like substance carried in the blood. Low-density
lipoprotein, or LDL, cholesterol contributes to plaque formation in arteries.
High LDL raises the risk of angina and heart attack. A simple blood test, called
a lipid profile, measures it. Diet, activity and, for many people, medication
help bring it down.

## Major risk factors

The main risk factors for heart disease are smoking, high blood pressure,
diabetes, high cholesterol, obesity, physical inactivity, an unhealthy diet,
excess alcohol, and a family history of early heart disease. Age and being male
also raise risk, but many risk factors can be changed.

## Lifestyle measures that help the heart

Stopping smoking is the single most effective step. Regular moderate activity,
such as brisk walking for about thirty minutes on most days, strengthens the
heart. A diet rich in vegetables, fruit, whole grains, legumes and nuts, and low
in salt, sugar and fried food, lowers risk. Keeping blood pressure, blood sugar
and cholesterol under control protects the arteries. Adequate sleep and managing
stress also help.

## When to seek emergency care

Call 108 or 112 immediately for chest pressure lasting more than fifteen
minutes, chest pain with sweating or breathlessness, fainting, bluish lips or
fingertips, or severe sudden breathlessness. In India, 108 connects you to an
ambulance service and 112 is the national emergency number. Emergency care
should never be delayed to try home remedies.

## What to expect at a cardiology visit

A cardiologist will ask about your symptoms, history and risk factors, and
examine you, including your pulse and blood pressure. Common tests include an
ECG, which records the heart's electrical activity; an echocardiogram, which is
an ultrasound picture of the heart's structure and pumping; and a stress test,
which shows how the heart performs under controlled exercise. Depending on the
findings, further tests such as a coronary angiogram may be arranged. Bring a
list of your medicines and any previous reports to the visit.

## How symptoms are grouped

Heart symptoms are often grouped by what they suggest. Chest discomfort brought
on by effort and relieved by rest points towards angina and narrowed coronary
arteries. Chest discomfort at rest, lasting longer than about fifteen minutes,
with sweating, nausea or breathlessness, points towards a heart attack. Breath-
lessness on effort, breathlessness lying flat, leg swelling and rapid weight
gain point towards heart failure. A racing or irregular pulse with dizziness
points towards an arrhythmia. Fainting may come from a dangerous rhythm or a
narrowed valve. Grouping symptoms this way helps decide how urgently to seek
care, but only a doctor can confirm a cause.

## Blood pressure numbers

Blood pressure is written as two numbers, such as 120 over 80. The first number
is the systolic pressure, when the heart squeezes; the second is the diastolic
pressure, when the heart relaxes. In general, a reading around 120 over 80 is
considered normal, readings that stay at or above 140 over 90 are usually called
high, and readings at or above 180 over 120 need urgent medical attention. A
single high reading is not a diagnosis; several readings, ideally taken at home
while relaxed, are more useful. High blood pressure rarely causes symptoms, which
is why it is often called a silent condition.

## Cholesterol numbers

A lipid profile reports total cholesterol, LDL cholesterol, HDL cholesterol and
triglycerides. LDL is the harmful fraction that builds plaque in arteries, and
lower is generally better. HDL is often called the good cholesterol because it
helps remove excess cholesterol, and higher is generally better. Triglycerides
are another blood fat that rises with excess sugar, alcohol and refined food.
These numbers are interpreted together with your other risk factors, not in
isolation.

## Diabetes and the heart

Diabetes means blood sugar stays too high. Over years, high sugar damages the
walls of blood vessels, making plaque build up faster. Diabetes also damages the
small nerves that carry pain signals from the heart, so a heart attack can be
felt as mild discomfort, tiredness, nausea or breathlessness instead of classic
chest pain. This is why people with diabetes should treat any new chest symptom,
even a mild one, as important and seek medical advice.

## Smoking and quitting

Smoking harms the heart in several ways at once. The chemicals in tobacco
narrow blood vessels, raise blood pressure, make the blood more likely to clot,
and reduce the oxygen carried in the blood. The risk falls quickly after
stopping: within a year, the extra risk of a heart attack is roughly halved. Many
people need several attempts before they quit for good, and support from a doctor
or a cessation programme greatly improves the chance of success.

## Diet and the heart

A heart-friendly diet emphasises vegetables, fruit, whole grains, legumes, nuts
and fish, and limits salt, added sugar, refined flour and fried food. Replacing
saturated fat with unsaturated fat helps lower LDL cholesterol. Cutting salt
helps lower blood pressure. Portion size and regular meal times help control
weight and blood sugar. No single food protects the heart on its own; the overall
pattern matters most.

## Activity and the heart

Regular moderate activity, such as brisk walking for about thirty minutes on most
days, lowers blood pressure, improves cholesterol, helps control blood sugar and
weight, and reduces stress. People who have been inactive should build up
gradually. Anyone with known heart disease, or with chest pain on effort, should
ask a doctor before starting a vigorous programme.

## Stress, sleep and the heart

Long-term stress and poor sleep raise blood pressure and make unhealthy habits
more likely. Simple measures such as a regular sleep schedule, gentle activity,
slow breathing and time away from screens help. Loud snoring with pauses in
breathing during sleep, called obstructive sleep apnoea, is linked to high blood
pressure and rhythm problems and should be discussed with a doctor.

## Women and heart disease

Heart disease is a leading cause of death in women as well as men, but symptoms
can differ. Women more often report tiredness, breathlessness, nausea or
discomfort in the back or jaw rather than classic chest pain. Because these
symptoms are easy to attribute to other causes, heart problems in women can be
recognised later. Any new, unusual or persistent symptom should be taken
seriously.

## Older adults and heart disease

In older adults, breathlessness, tiredness and confusion may be the main signs of
a heart problem, and chest pain may be absent or mild. Several conditions often
coexist, and medicines can interact, so review with a doctor is especially
important. Keeping blood pressure, sugar and cholesterol controlled, staying
active and avoiding falls all help protect the heart and overall health.

## What this tool does and does not do

CardioCare AI is an educational screening aid. It looks at the symptoms you
describe and the optional clinical values you enter, compares them with a curated
knowledge base, and gives a general risk indication and next steps. It does not
examine you, it cannot see your heart, and it cannot confirm or rule out any
condition. It never replaces a doctor. If you have severe or worsening symptoms,
seek emergency care immediately by calling 108 or 112 in India.
"""


def main() -> int:
    KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)

    df = pd.DataFrame(ROWS, columns=COLUMNS)
    xlsx_path = KNOWLEDGE_DIR / "heart_symptoms_kb.xlsx"
    df.to_excel(xlsx_path, index=False, engine="openpyxl")
    print(f"Wrote {len(df)} rows to {xlsx_path}")

    md_path = KNOWLEDGE_DIR / "heart_basics.md"
    md_path.write_text(HEART_BASICS, encoding="utf-8")
    words = len(HEART_BASICS.split())
    print(f"Wrote {words} words to {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
