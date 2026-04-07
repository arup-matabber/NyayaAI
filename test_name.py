import urllib.request, json

url = "http://127.0.0.1:8000/api/chat/stream"
tests = [
    "Draft a bail application for Rahul Kumar who was arrested for theft in Delhi",
    "bail for Arjun Sharma arrested under BNS 103 murder case in Mumbai",
    "my client's name is Priya Singh, she needs anticipatory bail for NDPS case",
]

for prompt in tests:
    print(f"\n{'='*55}")
    print(f"PROMPT: {prompt[:60]}")
    print('='*55)
    payload = json.dumps({"prompt": prompt}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            found_name = None
            for raw in resp:
                line = raw.decode("utf-8").strip()
                if line.startswith("data: "):
                    ev = json.loads(line[6:])
                    if ev.get("type") == "token":
                        content = ev["content"]
                        # Look for the applicant name in first 500 chars
                        if not found_name and ("applicant" in content.lower() or "bail to" in content.lower()):
                            found_name = content
                    elif ev.get("type") == "done":
                        break
            print(f"NAME FOUND in draft: {found_name or 'not detected in first tokens'}")
    except Exception as e:
        print(f"ERROR: {e}")
    break  # Just test one to be quick
