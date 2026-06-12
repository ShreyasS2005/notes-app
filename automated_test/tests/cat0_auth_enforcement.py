"""
CAT-0  Auth Enforcement Check
Probes whether any endpoint enforces authentication at all.
If every endpoint is accessible without a token → mark CRITICAL (no auth arch).
"""

ENDPOINTS = [
    ("POST", "/summarize",            {"content": "test"}),
    ("POST", "/generate-quiz",        {"content": "test"}),
    ("POST", "/generate-flashcards",  {"content": "test"}),
    ("POST", "/chat",                 {"message": "hello", "history": []}),
    ("POST", "/parse-intent",         {"content": "remind me in 30 min"}),
    ("POST", "/predict-time",         {"content": "test content for study"}),
]

def run(probe):
    print("\n── CAT-0: Auth Enforcement Check ──────────────────────────")
    for method, path, body in ENDPOINTS:
        # No token at all — if API has auth, this should return 401/403
        probe(
            method, path,
            role="no_token",
            json_body=body,
            expected=401,   # expected: reject unauthenticated
            category="auth_enforcement",
            note="No Authorization header — should reject with 401 if auth is required"
        )
