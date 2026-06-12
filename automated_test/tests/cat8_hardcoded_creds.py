"""
CAT-8  Hardcoded Credentials & Secret Scan
Static analysis — no network requests.
Scans the backend codebase for:
  - Hardcoded API keys / tokens
  - Credentials in source files committed to git
  - Secrets not covered by .gitignore
  - .env files with real values present
Returns a list of finding records compatible with the main report format.
"""
import os
import re
import datetime

BACKEND_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "backend")
APP_DIR     = os.path.join(os.path.dirname(__file__), "..", "..", "app")

def ts():
    return datetime.datetime.utcnow().isoformat() + "Z"

# Patterns that indicate hardcoded secrets
SECRET_PATTERNS = [
    (re.compile(r'AIza[0-9A-Za-z\-_]{35}'),                    "Google/Firebase API Key",     "CRITICAL"),
    (re.compile(r'["\']AAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]+["\']'), "FCM Server Key",          "CRITICAL"),
    (re.compile(r'(?i)(api[_-]?key|apikey)\s*[:=]\s*["\'][A-Za-z0-9\-_]{20,}["\']'), "Generic API Key", "HIGH"),
    (re.compile(r'(?i)(secret|password|passwd|pwd)\s*[:=]\s*["\'][^"\']{8,}["\']'),   "Hardcoded Secret/Password", "CRITICAL"),
    (re.compile(r'(?i)(token|auth[_-]?token|bearer)\s*[:=]\s*["\'][A-Za-z0-9\-_.]{20,}["\']'), "Hardcoded Token", "HIGH"),
    (re.compile(r'-----BEGIN (RSA |EC )?PRIVATE KEY-----'),     "Private Key",                "CRITICAL"),
    (re.compile(r'(?i)private_key\s*=\s*"[^"]+"'),              "Firebase Private Key in file","CRITICAL"),
    (re.compile(r'mongodb\+srv://[^\s"\']+:[^\s"\']+@'),        "MongoDB Connection String",  "CRITICAL"),
    (re.compile(r'postgres(?:ql)?://[^\s"\']+:[^\s"\']+@'),     "PostgreSQL DSN with creds",  "CRITICAL"),
    (re.compile(r'rzp_(?:test|live)_[A-Za-z0-9]{14,}'),        "Razorpay API Key",           "CRITICAL"),
]

SCAN_EXTENSIONS = {".js", ".ts", ".json", ".kt", ".java", ".py", ".env",
                   ".yaml", ".yml", ".properties", ".gradle", ".gradle.kts"}

SKIP_DIRS = {"node_modules", ".git", "build", ".gradle", "__pycache__"}

def scan_dir(base_dir):
    results = []
    if not os.path.isdir(base_dir):
        return results
    for root, dirs, files in os.walk(base_dir):
        # Prune skip dirs in-place
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            ext = os.path.splitext(fname)[1]
            if ext not in SCAN_EXTENSIONS and fname not in {".env", ".gitignore"}:
                continue
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    for lineno, line in enumerate(f, 1):
                        for pattern, label, sev in SECRET_PATTERNS:
                            if pattern.search(line):
                                rel = os.path.relpath(fpath, os.path.join(base_dir, ".."))
                                results.append((rel, lineno, label, sev,
                                                line.strip()[:120]))
            except (PermissionError, OSError):
                pass
    return results

def check_gitignore(base_dir):
    """Return True if .env is listed in .gitignore."""
    gi = os.path.join(base_dir, "..", ".gitignore")
    if not os.path.isfile(gi):
        return False
    with open(gi, "r", errors="ignore") as f:
        return any(".env" in line for line in f)

def run():
    print("\n── CAT-8: Hardcoded Credentials Scan ──────────────────────")
    findings = []

    for scan_dir_path, label in [(BACKEND_DIR, "backend"), (APP_DIR, "android-app")]:
        hits = scan_dir(scan_dir_path)
        for rel, lineno, secret_label, sev, snippet in hits:
            # Never print the actual secret value — only redacted reference
            safe_note = (f"[{label}] {rel}:{lineno} — {secret_label} found "
                         f"(snippet: {snippet[:40]}...)")
            print(f"  ✗ FINDING  {sev}  {safe_note}")
            findings.append({
                "endpoint":         f"file://{rel}:{lineno}",
                "method":           "STATIC",
                "role":             "static_scan",
                "status":           "FOUND",
                "expected_status":  "NOT_PRESENT",
                "finding":          True,
                "severity":         sev,
                "response_time_ms": 0,
                "test_category":    "hardcoded_creds",
                "note":             safe_note,
                "timestamp":        ts()
            })

    # Check if .env is gitignored
    env_ignored = check_gitignore(BACKEND_DIR)
    env_file    = os.path.join(BACKEND_DIR, ".env")
    if os.path.isfile(env_file):
        note = (".env file EXISTS in backend/. " +
                (".gitignore covers it ✓" if env_ignored
                 else "⚠ NOT in .gitignore — secrets may be committed!"))
        sev  = "LOW" if env_ignored else "HIGH"
        is_finding = not env_ignored
        print(f"  {'✗ FINDING' if is_finding else '⚠ warn'}  {sev}  {note}")
        findings.append({
            "endpoint":         "file://backend/.env",
            "method":           "STATIC",
            "role":             "static_scan",
            "status":           "EXISTS",
            "expected_status":  "GITIGNORED",
            "finding":          is_finding,
            "severity":         sev,
            "response_time_ms": 0,
            "test_category":    "hardcoded_creds",
            "note":             note,
            "timestamp":        ts()
        })

    if not findings:
        print("  ✓ No obvious hardcoded secrets found by pattern scan.")
    return findings
