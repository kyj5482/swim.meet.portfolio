"""API smoke tests using FastAPI's TestClient."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_extract_returns_race_and_confidence():
    resp = client.post(
        "/api/extraction/extract",
        json={"jobId": "job-1", "sourceType": "photo", "fileRef": "uploads/x.jpg"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["races"]) >= 1
    assert "confidence" in body
    assert 0.0 <= body["confidence"] <= 1.0


def test_confirm_returns_confirmed():
    race = {
        "stroke": "FR",
        "distance": 100,
        "course": "SCY",
        "timeMs": 61320,
        "place": 3,
        "splits": [
            {"segmentMeters": 50, "cumulativeMs": 29180, "intervalMs": 29180},
            {"segmentMeters": 50, "cumulativeMs": 61320, "intervalMs": 32140},
        ],
        "fieldConfidence": {"timeMs": 0.99, "place": 0.99},
    }
    resp = client.post(
        "/api/extraction/confirm",
        json={"jobId": "job-1", "races": [race]},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "confirmed"
