import json
import matplotlib.pyplot as plt

with open("scripts/charts/txMetrics.json") as f:
    tx_metrics = json.load(f)

indices = [tx['index'] for tx in tx_metrics]
confirm_time = [tx.get('confirmTimeSec', 0) for tx in tx_metrics]

plt.figure(figsize=(12,6))
plt.plot(indices, confirm_time, marker='o', color='purple')
plt.xlabel("Transaction Index")
plt.ylabel("Confirmation Time (seconds)")
plt.title("Confirmation Time per Transaction")
plt.grid(True)
plt.tight_layout()
plt.show()

# python scripts/charts/plot_confirm_time.py