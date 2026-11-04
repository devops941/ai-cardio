"""Prediction router: /predict/symptoms, /predict/clinical (Section 8.2)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.concurrency import run_in_threadpool

from app.schemas import ClinicalRequest, ClinicalResponse, SymptomRequest, SymptomResponse
from app.security import verify_internal_key
from app.services import ml_model, rag

router = APIRouter(dependencies=[Depends(verify_internal_key)])


@router.post("/predict/symptoms", response_model=SymptomResponse)
async def predict_symptoms(req: SymptomRequest) -> SymptomResponse:
    return await run_in_threadpool(rag.symptom_check, req)


@router.post("/predict/clinical", response_model=ClinicalResponse)
async def predict_clinical(req: ClinicalRequest) -> ClinicalResponse:
    result = await run_in_threadpool(ml_model.predict, req.model_dump())
    return ClinicalResponse(**result)
