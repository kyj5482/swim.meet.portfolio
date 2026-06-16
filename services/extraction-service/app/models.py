"""Pydantic models mirroring libs/contracts/src/domain.ts (extraction shapes).

Single source of truth is libs/contracts; these mirror ExtractedRace and the
extraction-service request/response envelopes. Times are always integer
milliseconds (docs/04-data-model.md 시간 규칙).
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

Stroke = Literal["FR", "BK", "BR", "FL", "IM"]
Course = Literal["SCY", "SCM", "LCM"]
SourceType = Literal["photo", "pdf", "result_file"]


class Split(BaseModel):
    """Pick<Split, 'segmentMeters' | 'cumulativeMs' | 'intervalMs'> in domain.ts."""

    segmentMeters: int
    cumulativeMs: int
    intervalMs: int


class ExtractedRace(BaseModel):
    """Extraction result BEFORE parent verification.

    field_confidence (serialized as fieldConfidence) carries per-field 0..1
    confidence; low values are emphasized in the frontend for the mandatory
    review UX (P2).
    """

    stroke: Stroke
    distance: int
    course: Course
    timeMs: int
    place: Optional[int] = None
    splits: list[Split] = Field(default_factory=list)
    # mirrors fieldConfidence: Record<string, number> in domain.ts
    field_confidence: dict[str, float] = Field(
        default_factory=dict, alias="fieldConfidence"
    )

    model_config = {"populate_by_name": True}


class ExtractRequest(BaseModel):
    jobId: str
    sourceType: SourceType
    fileRef: str


class ExtractResponse(BaseModel):
    races: list[ExtractedRace]
    confidence: float


class ConfirmRequest(BaseModel):
    jobId: str
    races: list[ExtractedRace]
