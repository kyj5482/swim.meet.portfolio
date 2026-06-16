"""Unit tests for the pure validation logic (app/validation.py)."""

from app.models import ExtractedRace, Split
from app.validation import (
    flag_low_confidence,
    looks_like_ocr_confusion,
    needs_review,
    splits_sum_matches_total,
)


def _race(**overrides) -> ExtractedRace:
    base = dict(
        stroke="FR",
        distance=100,
        course="SCY",
        timeMs=61320,
        place=3,
        splits=[
            Split(segmentMeters=50, cumulativeMs=29180, intervalMs=29180),
            Split(segmentMeters=50, cumulativeMs=61320, intervalMs=32140),
        ],
        field_confidence={"timeMs": 0.95, "place": 0.95},
    )
    base.update(overrides)
    return ExtractedRace(**base)


# --- splits_sum_matches_total ---------------------------------------------


def test_splits_sum_exact():
    assert splits_sum_matches_total(_race()) is True


def test_splits_sum_within_tolerance():
    # 29180 + 32155 = 61335, total 61320 -> diff 15ms <= 20ms tolerance
    race = _race(
        splits=[
            Split(segmentMeters=50, cumulativeMs=29180, intervalMs=29180),
            Split(segmentMeters=50, cumulativeMs=61335, intervalMs=32155),
        ]
    )
    assert splits_sum_matches_total(race) is True


def test_splits_sum_outside_tolerance_fails():
    # diff of 100ms exceeds the 20ms tolerance
    race = _race(
        splits=[
            Split(segmentMeters=50, cumulativeMs=29180, intervalMs=29180),
            Split(segmentMeters=50, cumulativeMs=61420, intervalMs=32240),
        ]
    )
    assert splits_sum_matches_total(race) is False


def test_splits_sum_no_splits_is_consistent():
    assert splits_sum_matches_total(_race(splits=[])) is True


# --- flag_low_confidence ---------------------------------------------------


def test_flag_low_confidence_catches_below_threshold():
    race = _race(field_confidence={"timeMs": 0.72, "place": 0.95})
    assert flag_low_confidence(race) == ["timeMs"]


def test_flag_low_confidence_ignores_at_or_above_threshold():
    race = _race(field_confidence={"timeMs": 0.8, "place": 0.95})
    assert flag_low_confidence(race) == []


# --- looks_like_ocr_confusion ----------------------------------------------


def test_ocr_implausibly_fast_flagged():
    assert "implausibly_fast" in looks_like_ocr_confusion(9000)


def test_ocr_normal_not_flagged():
    assert looks_like_ocr_confusion(61320) == []


def test_ocr_non_positive_flagged():
    assert "non_positive_time" in looks_like_ocr_confusion(0)
    assert "non_positive_time" in looks_like_ocr_confusion(-5)


# --- needs_review ----------------------------------------------------------


def test_needs_review_clean_race_false():
    assert needs_review(_race()) is False


def test_needs_review_low_confidence_true():
    assert needs_review(_race(field_confidence={"timeMs": 0.5})) is True


def test_needs_review_bad_splits_true():
    race = _race(
        splits=[
            Split(segmentMeters=50, cumulativeMs=29180, intervalMs=29180),
            Split(segmentMeters=50, cumulativeMs=61420, intervalMs=32240),
        ]
    )
    assert needs_review(race) is True
