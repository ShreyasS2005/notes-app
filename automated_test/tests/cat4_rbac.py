"""
CAT-4  RBAC Matrix
Build an N-role × N-endpoint matrix.
Since the API has no auth, all cells should return 200 — confirming no RBAC.
Any unexpected 403/401 would indicate partial gating worth investigating.
"""

ENDPOINTS = [
    ("POST", "/summarize",            {"content": "rbac test"}),
    ("POST", "/generate-quiz",        {"content": "rbac test"}),
    ("POST", "/generate-flashcards",  {"content": "rbac test"}),
    ("POST", "/chat",                 {"message": "rbac test", "history": []}),
    ("POST", "/parse-intent",         {"content": "rbac test"}),
    ("POST", "/predict-time",         {"content": "rbac test"}),
]

ROLES = [
    ("anonymous",  {}),
    ("user_role",  {"Authorization": "Bearer fake-user-token",   "X-Role": "user"}),
    ("admin_role", {"Authorization": "Bearer fake-admin-token",  "X-Role": "admin"}),
    ("moderator",  {"Authorization": "Bearer fake-mod-token",    "X-Role": "moderator"}),
]

def run(probe):
    print("\n── CAT-4: RBAC Matrix ───────────────────────────────────────")
    for method, path, body in ENDPOINTS:
        for role_name, headers in ROLES:
            probe(
                method, path,
                role=role_name,
                headers=headers if headers else None,
                json_body=body,
                expected=200,   # expect 200 — no RBAC exists
                category="rbac",
                note=f"RBAC cell: role={role_name} → {path}"
            )
