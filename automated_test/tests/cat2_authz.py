"""
CAT-2  AuthZ / Privilege Escalation
Since no auth exists, this verifies cross-role access wasn't accidentally
gated by any middleware. Each endpoint is called with a simulated
low-privilege vs high-privilege header to confirm the server ignores both.
"""

ENDPOINTS = [
    ("POST", "/summarize",            {"content": "authz test"}),
    ("POST", "/generate-quiz",        {"content": "authz test"}),
    ("POST", "/generate-flashcards",  {"content": "authz test"}),
    ("POST", "/chat",                 {"message": "authz test", "history": []}),
    ("POST", "/parse-intent",         {"content": "authz test"}),
    ("POST", "/predict-time",         {"content": "authz test"}),
]

ROLES = [
    ("guest",    {"X-User-Role": "guest"}),
    ("user",     {"X-User-Role": "user"}),
    ("admin",    {"X-User-Role": "admin"}),
    ("no_role",  {}),
]

def run(probe):
    print("\n── CAT-2: AuthZ / Privilege Escalation ──────────────────────")
    for method, path, body in ENDPOINTS:
        for role_name, role_headers in ROLES:
            # Because there is no auth, any 2xx is actually an authz finding
            # (a legitimate protected endpoint should gate on role)
            probe(
                method, path,
                role=role_name,
                headers=role_headers if role_headers else None,
                json_body=body,
                expected=200,   # we EXPECT 200 — confirming server ignores role
                category="authz_privesc",
                note=f"Role header '{role_name}' sent — server has no role enforcement"
            )
