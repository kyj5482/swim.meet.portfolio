"""Race extraction. This is the ONLY service that calls an LLM/vision model (R5).

In a real run this calls Anthropic Claude vision against the uploaded sheet.
For the skeleton we return a deterministic, internally-consistent MOCK race so
the validation + review path can be exercised without the model.
"""

from __future__ import annotations

import os

from .models import ExtractedRace, ExtractRequest, ExtractResponse, Split


def _mock_race() -> ExtractedRace:
    """A deterministic 100 FR SCY with two 50m splits summing to the total.

    100 FR @ 1:01.32 = 61320ms, split into 29.18 (29180) + 32.14 (32140).
    29180 + 32140 == 61320, so splits_sum_matches_total() passes.
    `timeMs` is given a deliberately low confidence (0.72) so needs_review()
    returns True and the mandatory verification UX is exercised.
    """
    return ExtractedRace(
        stroke="FR",
        distance=100,
        course="SCY",
        timeMs=61320,
        place=3,
        splits=[
            Split(segmentMeters=50, cumulativeMs=29180, intervalMs=29180),
            Split(segmentMeters=50, cumulativeMs=61320, intervalMs=32140),
        ],
        field_confidence={"timeMs": 0.72, "place": 0.95, "stroke": 0.99},
    )


def extract_races(req: ExtractRequest) -> ExtractResponse:
    """Extract races for one child from the referenced source file.

    The sourceType (photo/pdf/result_file) is the 3-tier trust signal (P3):
    result_file is most trustworthy, photo least.
    """
    if os.getenv("ANTHROPIC_API_KEY"):
        # TODO: call Anthropic Claude vision here.
        #   - load file at req.fileRef from object storage
        #   - send to claude with a structured-extraction prompt that asks for
        #     ExtractedRace[] + per-field confidence
        #   - parse tool-use / JSON output into ExtractedRace models
        # Deliberately NOT calling the model in the skeleton; fall through to
        # the deterministic mock so behavior stays offline-safe and testable.
        pass

    race = _mock_race()
    # Overall confidence = the minimum per-field confidence (weakest link).
    confidence = min(race.field_confidence.values()) if race.field_confidence else 1.0
    return ExtractResponse(races=[race], confidence=confidence)
