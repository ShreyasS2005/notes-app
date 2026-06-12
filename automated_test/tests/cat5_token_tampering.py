"""
CAT-5  Token Tampering
Sends structurally valid JWTs with flipped claims (role=admin, sub=other-user)
but with an INVALID signature. Server MUST reject these. 2xx = CRITICAL.

JWTs are crafted by base64-encoding modified payloads without signing.
"""
import base64
import json as _json

def _make_tampered_jwt(payload_dict):
    """Build a JWT-shaped string with invalid signature."""
    header  = base64.urlsafe_b64encode(
        _json.dumps({"alg":"HS256","typ":"JWT"}).encode()
    ).rstrip(b"=").decode()
    payload = base64.urlsafe_b64encode(
        _json.dumps(payload_dict).encode()
    ).rstrip(b"=").decode()
    sig     = "INVALIDSIGNATURE_tampered"
    return f"{header}.{payload}.{sig}"

TAMPERED_TOKENS = [
    ("role_admin_flip",  _make_tampered_jwt({"sub":"user1","role":"admin","exp":9999999999})),
    ("role_super_flip",  _make_tampered_jwt({"sub":"user1","role":"superadmin","exp":9999999999})),
    ("sub_other_user",   _make_tampered_jwt({"sub":"victim-user-9999","role":"user","exp":9999999999})),
    ("alg_none_attack",  "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0."
                          + base64.urlsafe_b64encode(
                              _json.dumps({"sub":"admin","role":"admin","exp":9999999999}).encode()
                          ).rstrip(b"=").decode() + "."),
]

ENDPOINTS = [
    ("POST", "/summarize",            {"content": "token tamper test"}),
    ("POST", "/generate-quiz",        {"content": "token tamper test"}),
    ("POST", "/generate-flashcards",  {"content": "token tamper test"}),
    ("POST", "/chat",                 {"message": "tamper", "history": []}),
    ("POST", "/parse-intent",         {"content": "token tamper test"}),
    ("POST", "/predict-time",         {"content": "token tamper test"}),
]

def run(probe):
    print("\n── CAT-5: Token Tampering ──────────────────────────────────")
    for method, path, body in ENDPOINTS:
        for token_name, token_val in TAMPERED_TOKENS:
            probe(
                method, path,
                role=f"tampered_{token_name}",
                headers={"Authorization": f"Bearer {token_val}"},
                json_body=body,
                expected=401,
                category="token_tampering",
                note=f"Tampered JWT variant '{token_name}' — invalid sig, must be rejected"
            )
