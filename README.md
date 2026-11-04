# CardioCare AI

CardioCare AI is an educational heart-symptom screening tool. A person answers a
short questionnaire about heart symptoms, optionally adds recent test-report
values, and receives a plain-language risk result, possible conditions, next
steps and nearby cardiac hospitals.

> **Disclaimer:** CardioCare AI is an AI-based screening tool for educational
> purposes, not a medical diagnosis. It does not analyse ECG or images and does
> not book appointments. Always consult a qualified doctor. In an emergency call
> 108 or 112.

## Architecture

```
Browser (Next.js 15 App Router, TypeScript)
   |  Auth.js session cookie (JWT, httpOnly)
   |  /api/*  route handlers  ->  Prisma  ->  MongoDB 7 (replica set)
   |  /api/*  route handlers  ->  HTTP + X-Internal-Key  ->  FastAPI AI service
                                                            |
                              Chroma vector store  <---------+--> Random Forest (joblib)
                              sentence-transformers embeddings
                              LLM (Claude / Groq) or mock
```

- **web/** - Next.js 15 UI and JSON API. Owns auth, users, predictions,
  hospitals, doctors, feedback, documents metadata and the ML version registry.
- **ai-service/** - FastAPI service. Owns ingestion (parse, chunk, embed,
  store), retrieval, the deterministic red-flag rules, the LLM explanation and
  the Random Forest model.

## Prerequisites

- Node.js >= 20 and npm
- Python 3.11 (a virtualenv is recommended)
- MongoDB 7, either via Docker Compose (recommended) or a native install
- Optional: LibreOffice `soffice` for `.doc` uploads

## First-time setup

### 1. MongoDB

```bash
docker compose up -d mongodb
```

This starts a single-node replica set `rs0`. Prisma's MongoDB connector needs a
replica set, so `DATABASE_URL` must include `replicaSet=rs0`.

Native install alternative:

```bash
mkdir -p data/db
mongod --replSet rs0 --dbpath ./data/db --bind_ip 127.0.0.1
mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

### 2. Environment files

```bash
cp web/.env.example web/.env.local
cp ai-service/.env.example ai-service/.env
```

Every variable is documented inside the example files. Keep `INTERNAL_API_KEY`
identical in both files. Generate `AUTH_SECRET` with
`openssl rand -base64 32`.

### 3. Web app

```bash
cd web
npm install
npx prisma generate
npx prisma db push
npm run db:geo-index   # creates the 2dsphere index; re-run after every db push
npm run db:seed        # seeds the admin account and demo hospitals
```

### 4. AI service

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

The first start downloads the embedding model (`all-MiniLM-L6-v2`, ~90 MB). If
the machine is offline, the service reports this clearly instead of failing
silently.

Train the initial model from the bundled Cleveland CSV (creates `rf_v1`):

```bash
python -m app.ml.train_initial
```

### 5. Sample knowledge base

`docs/knowledge/heart_symptoms_kb.xlsx` and `docs/knowledge/heart_basics.md` are
starter files. Upload them from **Admin -> Knowledge documents**, or ingest them
directly:

```bash
curl -H "X-Internal-Key: $INTERNAL_API_KEY" \
  -F "file=@docs/knowledge/heart_basics.md" -F "document_id=heart-basics" \
  http://localhost:8000/ingest
```

## Run order

1. MongoDB (`docker compose up -d mongodb`)
2. AI service: `cd ai-service && source .venv/bin/activate && uvicorn app.main:app --reload`
3. Web app: `cd web && npm run dev`

The web app is at http://localhost:3000, the AI service at
http://localhost:8000.

## Default accounts

- **Admin** - seeded from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
  (`admin@healthassistant.ai` / `Admin@12345` in the provided environment).
  **Change this password after the first login.**
- **Demo user** - register any account from `/register`; registration requires
  the consent and 18+ checkboxes.

## Mock mode vs real Claude

`ai-service/.env` ships with `LLM_MOCK=true`. In this mode the explanation and
the heart-only classifier are produced locally with no network calls; the rest
of the pipeline (red flags, retrieval, ML, fusion, ranking) runs for real. Mock
mode is for development and testing only.

For real explanations set `ANTHROPIC_API_KEY` and `LLM_MOCK=false`. Optionally
set `GROQ_API_KEY` for the fallback provider. Set a spend limit in the Anthropic
console before enabling real mode. With no key, the real-LLM path is implemented
but unverified.

## Running tests

```bash
# Web (Vitest)
cd web
npx tsc --noEmit
npm run lint
npm run build
npx vitest run

# AI service (pytest)
cd ai-service
source .venv/bin/activate
pytest -q
```

The red-flag, fusion and ranking vectors live in
`docs/test-vectors/red_flags.json` and are executed by both pytest and Vitest,
so the Python rules and the TypeScript mirror cannot drift.

## Smoke test

With the whole stack running in mock mode:

```bash
./scripts/smoke_test.sh
```

It checks the AI health/auth, ingestion, clinical prediction, web auth and
roles, admin document upload, hospital bulk import, the emergency and
non-heart symptom checks, hospital search and the rate limit. It prints a
PASS/FAIL line per step and exits non-zero on the first failure.

## Measured metrics and latency

The metrics below are real values produced by the bundled training run over
`ai-service/datasets/heart_cleveland.csv` (297 rows after cleaning, 80/20
stratified split). They are stored in `ai-service/models/rf_v1.metrics.json`.

| Metric    | Random Forest (rf_v1, active) |
| --------- | ----------------------------- |
| Accuracy  | 0.8852                        |
| Precision | 0.8182                        |
| Recall    | 0.9643                        |
| F1        | 0.8852                        |
| ROC-AUC   | 0.9470                        |

Algorithm comparison from the same run:

| Algorithm           | Accuracy | Precision | Recall | F1     | ROC-AUC |
| ------------------- | -------- | --------- | ------ | ------ | ------- |
| Logistic Regression | 0.8525   | 0.8065    | 0.8929 | 0.8475 | 0.9545  |
| KNN                 | 0.8852   | 0.8387    | 0.9286 | 0.8814 | 0.9443  |
| SVM                 | 0.9180   | 0.8966    | 0.9286 | 0.9123 | 0.9600  |
| Decision Tree       | 0.8689   | 0.8571    | 0.8571 | 0.8571 | 0.8712  |
| Random Forest       | 0.8852   | 0.8182    | 0.9643 | 0.8852 | 0.9470  |

Random Forest is activated by default because it has the highest recall, which
matters most for a screening aid.

**Latency (mock mode, single machine):** the LLM explanation step is local and
returns in a few milliseconds; the dominant costs are embedding and vector
search. Real-LLM latency has not been measured because no API key was supplied.

## Troubleshooting

- **Prisma hangs on connect** - `DATABASE_URL` must contain `replicaSet=rs0`;
  on a native install add `&directConnection=true`. Never upgrade to Prisma 7.
- **Hospital search returns nothing after `db push`** - re-run
  `npm run db:geo-index`. `$geoNear` must be the first pipeline stage and needs
  the 2dsphere index.
- **Map markers missing** - Leaflet is loaded with `ssr: false` and its icons
  are served from `web/public/leaflet/` (no CDN).
- **`.xls` upload fails** - `xlrd` must be installed (it is in
  `requirements.txt`). `.doc` needs LibreOffice; image-only PDFs fail with "no
  extractable text" because there is no OCR.
- **Rate limit surprises during testing** - the check limit is 10/min/user and
  auth is 10/min. The limiter is an in-process store, so it is per web instance.
- **Edge runtime errors in middleware** - keep `middleware.ts` free of
  Prisma/bcrypt imports; the split config (`auth.config.ts`) exists for this.

## Known limitations

- Not a diagnostic device; a screening aid only.
- The ML model uses a small, older, US-based Cleveland dataset skewed towards
  men; its estimate is a rough guide.
- English only; no OCR for image-only PDFs.
- Hospital distances are straight-line, not driving distances.
- Hospital and doctor data is maintained manually by an admin.
- Local single-machine prototype; the rate limiter is in-process.

## Future work

OCR for scanned reports; Tamil and Hindi UI; wearable and ECG integration;
appointment booking and teleconsultation; a locally fine-tuned explanation
model; larger Indian datasets; ABDM integration; a mobile app; cloud
deployment.
