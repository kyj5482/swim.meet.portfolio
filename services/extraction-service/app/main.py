"""FastAPI app for extraction-service (/api/extraction).

See docs/03-api-contracts.md (추출 section).
"""

from __future__ import annotations

from fastapi import FastAPI

from .extractor import extract_races
from .models import ConfirmRequest, ExtractRequest, ExtractResponse

app = FastAPI(title="swimvault-extraction")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/extraction/extract", response_model=ExtractResponse)
def extract(req: ExtractRequest) -> ExtractResponse:
    return extract_races(req)


@app.post("/api/extraction/confirm")
def confirm(req: ConfirmRequest) -> dict[str, str]:
    # TODO: forward the parent-verified races to records-service (POST /api/records)
    # for PB judgment and persistence.
    return {"status": "confirmed"}
