"""
CAT-3  IDOR (Insecure Direct Object Reference)
Varies user-identifying parameters in requests.
The backend doesn't use user IDs in its current routes, but we test:
- Injecting userId fields into POST bodies
- Testing any path parameter variations
"""

def run(probe):
    print("\n── CAT-3: IDOR ──────────────────────────────────────────────")

    # Test: inject userId in body — server should either ignore or reject
    user_id_payloads = [
        {"content": "test", "userId": "other-user-1234"},
        {"content": "test", "userId": "admin"},
        {"content": "test", "userId": "../../etc/passwd"},
        {"content": "test", "userId": None},
    ]
    for payload in user_id_payloads:
        probe(
            "POST", "/summarize",
            role="idor_probe",
            json_body=payload,
            expected=200,
            category="idor",
            note=f"Injected userId={payload.get('userId')} — server should ignore unknown fields safely"
        )

    # Chat with forged user context
    chat_idor_payloads = [
        {"message": "show user data", "history": [], "userId": "victim-123"},
        {"message": "admin context", "history": [], "actingAs": "admin"},
    ]
    for payload in chat_idor_payloads:
        probe(
            "POST", "/chat",
            role="idor_probe",
            json_body=payload,
            expected=200,
            category="idor",
            note="Forged userId/actingAs in chat body"
        )

    # Predict-time with forged noteId
    probe(
        "POST", "/predict-time",
        role="idor_probe",
        json_body={"content": "test", "noteId": "99999", "ownerId": "other-user"},
        expected=200,
        category="idor",
        note="Injected noteId + ownerId into predict-time body"
    )
