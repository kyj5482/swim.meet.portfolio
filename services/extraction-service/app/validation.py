"""PURE validation logic — the heart of extraction quality.

These functions drive the mandatory human verification UX (design principle P2:
0.01s matters; 1<->7, 0<->8, colon<->dot OCR errors are catastrophic). No I/O,
no model calls — fully unit-testable.
"""

from __future__ import annotations

from .models import ExtractedRace

# Splits are entered/extracted to centisecond precision; allow small rounding
# slop when summing intervals back to the total time.
SPLIT_SUM_TOLERANCE_MS = 20

# A 50m freestyle (the fastest common event) under the world-class barrier is
# almost certainly an OCR error (e.g. dropped digit). World record is ~20.9s.
IMPLAUSIBLY_FAST_50_MS = 15000


def splits_sum_matches_total(race: ExtractedRace) -> bool:
    """True if the sum of split intervalMs equals timeMs within tolerance.

    Races without splits are treated as consistent (nothing to contradict the
    total).
    """
    if not race.splits:
        return True
    total = sum(s.intervalMs for s in race.splits)
    return abs(total - race.timeMs) <= SPLIT_SUM_TOLERANCE_MS


def flag_low_confidence(race: ExtractedRace, threshold: float = 0.8) -> list[str]:
    """Return field names whose per-field confidence is below `threshold`."""
    return [
        field
        for field, conf in race.field_confidence.items()
        if conf < threshold
    ]


def looks_like_ocr_confusion(time_ms: int) -> list[str]:
    """Heuristic warnings for implausible times (likely OCR digit confusion).

    - time_ms <= 0            -> 'non_positive_time'
    - time_ms < 15000ms       -> 'implausibly_fast' (faster than any 50m swim)

    Intentionally simple; tuned to catch catastrophic digit drops/swaps rather
    than to be a full sanity model.
    """
    warnings: list[str] = []
    if time_ms <= 0:
        warnings.append("non_positive_time")
    elif time_ms < IMPLAUSIBLY_FAST_50_MS:
        warnings.append("implausibly_fast")
    return warnings


def needs_review(race: ExtractedRace) -> bool:
    """True when a human MUST verify this race (P2).

    Triggered by ANY of: a low-confidence field, splits that don't sum to the
    total, or an OCR-confusion warning on the time.
    """
    if flag_low_confidence(race):
        return True
    if not splits_sum_matches_total(race):
        return True
    if looks_like_ocr_confusion(race.timeMs):
        return True
    return False
