"""
CAT-7  Rate Limiting
Fires a bounded burst of 30 rapid requests to each endpoint.
If no 429 is ever returned → rate limiting is absent → MEDIUM finding.
Caps at 30 requests per endpoint to stay non-destructive.
"""
import time

ENDPOINTS = [
    ("POST", "/summarize",           {"content": "rate limit test"}),
    ("POST", "/chat",                {"message": "rate limit test", "history": []}),
    ("POST", "/generate-quiz",       {"content": "rate limit test"}),
    ("POST", "/predict-time",        {"content": "rate limit test"}),
    ("POST", "/generate-flashcards", {"content": "rate limit test"}),
    ("POST", "/parse-intent",        {"content": "rate limit test"}),
]

BURST_SIZE = 30

def run(probe):
    print(f"\n── CAT-7: Rate Limiting (burst={BURST_SIZE}) ────────────────────")
    for method, path, body in ENDPOINTS:
        got_429 = False
        for i in range(BURST_SIZE):
            status, _ = probe(
                method, path,
                role="rate_limit_burst",
                json_body=body,
                expected=429,           # EXPECT 429 at some point
                category="rate_limiting",
                note=f"Burst request #{i+1}/{BURST_SIZE} — expecting 429 by end"
            )
            if status == 429:
                got_429 = True
                print(f"    ✓ 429 received on request #{i+1} for {path}")
                break
            time.sleep(0.05)   # 50ms gap — ~20 req/s burst

        if not got_429:
            # Force a synthetic FINDING record for the endpoint
            from automated_test.run_dast import record   # best-effort; runner handles it
