import urllib.request
import json

url = "http://127.0.0.1:8000/generate"
data = json.dumps({"school": "MIT", "language": "de", "audience": "Student"}).encode("utf-8")
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

print("Enviando POST...")
try:
    with urllib.request.urlopen(req) as res:
        print("STATUS:", res.status)
        print("RESPONSE:", res.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("HTTPError STATUS:", e.code)
    print("RESPONSE:", e.read().decode("utf-8"))
except Exception as e:
    print("Error:", e)
