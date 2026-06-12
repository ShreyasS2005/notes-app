import json
import time
import datetime
import sys
import os
import urllib.request
import urllib.error
import re
import glob

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(BASE_DIR, "input.json")
REPORT_FILE = os.path.join(BASE_DIR, "report.json")

def get_base_url():
    with open(INPUT_FILE) as f:
        cfg = json.load(f)
    return cfg.get("baseUrl", "http://localhost:3000")

BASE_URL = get_base_url()
ENDPOINTS = ["/summarize", "/parse-intent", "/predict-time"]

def ts():
    return datetime.datetime.utcnow().isoformat() + "Z"

def record(endpoint, method, role, status, expected_status, finding, severity, response_time_ms, category, note):
    try:
        with open(REPORT_FILE, "r") as f:
            results = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        results = []
    
    results.append({
        "endpoint": endpoint,
        "method": method,
        "role": role,
        "status": status,
        "expected_status": expected_status,
        "finding": finding,
        "severity": severity,
        "response_time_ms": response_time_ms,
        "test_category": category,
        "note": note,
        "timestamp": ts()
    })
    
    with open(REPORT_FILE, "w") as f:
        json.dump(results, f, indent=2)

def probe(method, path, payload, category, expected_status=200):
    url = BASE_URL + path
    req = urllib.request.Request(url, method=method)
    req.add_header('Content-Type', 'application/json')
    data = json.dumps(payload).encode('utf-8')
    
    t0 = time.time()
    status = 0
    note = ""
    try:
        resp = urllib.request.urlopen(req, data=data, timeout=10)
        status = resp.getcode()
    except urllib.error.HTTPError as e:
        status = e.code
    except urllib.error.URLError as e:
        status = 0
        note = f"Connection error: {e.reason}"
    except Exception as e:
        status = -1
        note = str(e)
    
    elapsed = round((time.time() - t0) * 1000, 1)
    return status, elapsed, note

def test_cat0_auth():
    print("Running Cat 0: Auth Enforcement")
    for ep in ENDPOINTS:
        status, elapsed, note = probe("POST", ep, {"content": "test"}, "auth_enforcement")
        # Need auth but enforces none -> marked vulnerable
        finding = (status != 401)
        record(ep, "POST", "unauthenticated", status, 401, finding, "HIGH", elapsed, "cat0_auth", "Endpoint needs auth but enforces none. Recommend implementing JWT. " + note)

def test_cat6_injection():
    print("Running Cat 6: Injection")
    payloads = [
        {"content": "test' OR '1'='1"},
        {"content": 'test" OR "1"="1'},
        {"content": "test; SLEEP 5"},
        {"content": "{\"\$gt\": \"\"}"}
    ]
    for ep in ENDPOINTS:
        for p in payloads:
            status, elapsed, note = probe("POST", ep, p, "injection")
            finding = (status >= 500) or (elapsed > 4000)
            record(ep, "POST", "unauthenticated", status, 200, finding, "MEDIUM", elapsed, "cat6_injection", f"Payload: {p['content']}. " + note)
            time.sleep(0.2)

def test_cat7_ratelimit():
    print("Running Cat 7: Rate Limiting")
    for ep in ENDPOINTS:
        print(f"  Bursting {ep}")
        status_codes = set()
        for i in range(30):
            status, elapsed, note = probe("POST", ep, {"content": "burst"}, "rate_limiting")
            status_codes.add(status)
        finding = (429 not in status_codes)
        note = "No 429 received in burst." if finding else "429 received, rate limiting exists."
        record(ep, "POST", "unauthenticated", list(status_codes)[-1] if status_codes else 0, 429, finding, "MEDIUM", elapsed, "cat7_ratelimit", note)

def test_cat8_hardcoded():
    print("Running Cat 8: Hardcoded Creds")
    # search backend folder for potential API keys
    backend_dir = os.path.join(BASE_DIR, "..", "backend")
    finding = False
    note = "No hardcoded secrets found."
    if os.path.exists(backend_dir):
        for root, dirs, files in os.walk(backend_dir):
            if "node_modules" in dirs:
                dirs.remove("node_modules")
            for file in files:
                if file.endswith(".js"):
                    path = os.path.join(root, file)
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                        if "AIza" in content:
                            finding = True
                            note = f"Found potential API key 'AIza...' in {file}"
                            break
            if finding:
                break
    record("codebase", "STATIC", "admin", 0, 0, finding, "CRITICAL", 0, "cat8_hardcoded", note)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cat = sys.argv[1]
        if cat == "0": test_cat0_auth()
        if cat == "6": test_cat6_injection()
        if cat == "7": test_cat7_ratelimit()
        if cat == "8": test_cat8_hardcoded()
    else:
        # Initialize report
        with open(REPORT_FILE, "w") as f:
            json.dump([], f)
        test_cat0_auth()
        test_cat6_injection()
        test_cat7_ratelimit()
        test_cat8_hardcoded()
        
        with open(REPORT_FILE, "r") as f:
            results = json.load(f)
        
        findings = [r for r in results if r["finding"]]
        print("\nReport Summary")
        print("==============")
        print(f"Endpoints discovered: {len(ENDPOINTS)}")
        print(f"Tests run: {len(results)}")
        print(f"Findings: {len(findings)}")
        print("Categories run: 0 (Auth), 6 (Injection), 7 (Rate Limiting), 8 (Hardcoded Creds)")
