"""
DAST Runner — SmartNotes AI Backend
Reads config from ../automated_test/input.json
Runs all test categories, writes results to report.json
"""

import json
import time
import datetime
import sys
import os

# ── Config ──────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(BASE_DIR, "input.json")
REPORT_FILE = os.path.join(BASE_DIR, "report.json")

with open(INPUT_FILE) as f:
    cfg = json.load(f)

BASE_URL = cfg.get("baseUrl", "http://localhost:5001")

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    print("[WARN] 'requests' not installed. Run: pip install requests")
    sys.exit(1)

RESULTS = []

def ts():
    return datetime.datetime.utcnow().isoformat() + "Z"

def record(endpoint, method, role, status, expected_status,
           finding, severity, response_time_ms, category, note):
    RESULTS.append({
        "endpoint":         endpoint,
        "method":           method,
        "role":             role,
        "status":           status,
        "expected_status":  expected_status,
        "finding":          finding,
        "severity":         severity,
        "response_time_ms": round(response_time_ms, 1),
        "test_category":    category,
        "note":             note,
        "timestamp":        ts()
    })
    icon = "✗ FINDING" if finding else "✓ ok"
    print(f"  [{icon}] {method} {endpoint} → {status} ({category}, sev={severity})")

def probe(method, path, role="unauthenticated", headers=None,
          json_body=None, expected=200, category="misc", note="",
          timeout=10):
    url = BASE_URL + path
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    t0 = time.time()
    try:
        resp = requests.request(method, url, headers=h,
                                json=json_body, timeout=timeout)
        elapsed = (time.time() - t0) * 1000
        status  = resp.status_code
    except requests.exceptions.ConnectionError:
        elapsed = (time.time() - t0) * 1000
        status  = 0
        note += " [CONNECTION_REFUSED]"
    except requests.exceptions.Timeout:
        elapsed = timeout * 1000
        status  = -1
        note += " [TIMEOUT]"
    except Exception as e:
        elapsed = (time.time() - t0) * 1000
        status  = -2
        note += f" [ERROR:{e}]"

    finding  = (status in range(200, 300)) and (expected not in range(200, 300))
    severity = "NONE"
    if finding:
        if category in ("authn_bypass", "token_tampering"):
            severity = "CRITICAL"
        elif category in ("authz_privesc", "idor", "rbac"):
            severity = "HIGH"
        elif category == "injection":
            severity = "MEDIUM"
        elif category == "rate_limiting":
            severity = "MEDIUM"
        else:
            severity = "LOW"

    record(path, method, role, status, expected, finding,
           severity, elapsed, category, note)
    time.sleep(0.2)   # polite throttle
    return status, elapsed


# ════════════════════════════════════════════════════════════════════════════
#  IMPORT SUB-TEST MODULES
# ════════════════════════════════════════════════════════════════════════════
from tests import (
    cat0_auth_enforcement,
    cat1_authn_bypass,
    cat2_authz,
    cat3_idor,
    cat4_rbac,
    cat5_token_tampering,
    cat6_injection,
    cat7_rate_limiting,
    cat8_hardcoded_creds,
)

print("\n═══════════════════════════════════════════════")
print(f"  SmartNotes DAST — BASE_URL: {BASE_URL}")
print("═══════════════════════════════════════════════\n")

for module in [
    cat0_auth_enforcement,
    cat1_authn_bypass,
    cat2_authz,
    cat3_idor,
    cat4_rbac,
    cat5_token_tampering,
    cat6_injection,
    cat7_rate_limiting,
]:
    module.run(probe)

# cat8 is static analysis — runs separately
cat8_results = cat8_hardcoded_creds.run()
RESULTS.extend(cat8_results)

# ── Write report ─────────────────────────────────────────────────────────────
with open(REPORT_FILE, "w") as f:
    json.dump(RESULTS, f, indent=2)

print(f"\n✅  Report written → {REPORT_FILE}")
findings = [r for r in RESULTS if r["finding"]]
by_sev = {}
for r in findings:
    by_sev.setdefault(r["severity"], []).append(r)

print(f"\n{'═'*55}")
print(f"  Total tests run : {len(RESULTS)}")
print(f"  Findings        : {len(findings)}")
for sev in ["CRITICAL","HIGH","MEDIUM","LOW"]:
    cnt = len(by_sev.get(sev, []))
    if cnt:
        print(f"    {sev}: {cnt}")
print(f"{'═'*55}\n")
