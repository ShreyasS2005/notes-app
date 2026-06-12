"""
CAT-1  AuthN Bypass
Sends malformed / expired / missing tokens to every endpoint.
Any 2xx response = CRITICAL finding (endpoint bypasses authentication).
"""

ENDPOINTS = [
    ("POST", "/summarize",            {"content": "bypass test"}),
    ("POST", "/generate-quiz",        {"content": "bypass test"}),
    ("POST", "/generate-flashcards",  {"content": "bypass test"}),
    ("POST", "/chat",                 {"message": "bypass", "history": []}),
    ("POST", "/parse-intent",         {"content": "bypass test"}),
    ("POST", "/predict-time",         {"content": "bypass test"}),
]

MALFORMED_TOKENS = [
    ("no_token",           None),
    ("empty_bearer",       ""),
    ("random_string",      "Bearer INVALID_TOKEN_xyz123"),
    ("expired_jwt",        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxfQ.INVALIDSIG"),
    ("null_bearer",        "Bearer null"),
    ("bearer_only",        "Bearer"),
    ("basic_auth",         "Basic dXNlcjpwYXNz"),
]

def run(probe):
    print("\n── CAT-1: AuthN Bypass ─────────────────────────────────────")
    for method, path, body in ENDPOINTS:
        for token_name, token_val in MALFORMED_TOKENS:
            headers = {}
            if token_val is not None:
                headers["Authorization"] = token_val
            probe(
                method, path,
                role=token_name,
                headers=headers if headers else None,
                json_body=body,
                expected=401,
                category="authn_bypass",
                note=f"Token variant: '{token_name}' — server must reject"
            )
