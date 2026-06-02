import threading
import requests
import time

URL = "http://127.0.0.1:8000/api/purchase/"
results = []
lock = threading.Lock()

def buy():
    try:
        r = requests.post(URL, json={"product_id": 16}, timeout=10)
        with lock:
            results.append(r.status_code)
    except Exception:
        with lock:
            results.append(0)

print("🚀 Firing 100 concurrent requests...")
start = time.time()

threads = [threading.Thread(target=buy) for _ in range(100)]
for t in threads: t.start()
for t in threads: t.join()

end = time.time()

success   = results.count(200)
out_stock = results.count(400)
failed    = results.count(0)

print(f"\n✅ Successful purchases : {success}")
print(f"❌ Out of stock         : {out_stock}")
print(f"⚠️  Failed requests     : {failed}")
print(f"📊 Total responses      : {len(results)}")
print(f"⏱️  Time taken          : {round(end-start, 2)}s")
print()

if success <= 50 and (success + out_stock) == 100:
    print("✅ PASS — Concurrency handled correctly! Stock never went negative.")
else:
    print("❌ FAIL — Race condition may exist.")