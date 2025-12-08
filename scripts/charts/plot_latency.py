import json
import matplotlib.pyplot as plt

with open("scripts/charts/txMetrics.json") as f:
    tx_metrics = json.load(f)

indices = [tx['index'] for tx in tx_metrics]
verify_latency = [tx['verifyLatencyBlocks'] for tx in tx_metrics]
verify_status = [tx['verify'] for tx in tx_metrics]

# Latency bar chart
plt.figure(figsize=(12,6))
plt.bar(indices, verify_latency, color='skyblue', label='Latency (Blocks)')
plt.xlabel("Transaction Index")
plt.ylabel("Latency (Blocks)")
plt.title("Verify Latency per Transaction")
plt.grid(axis='y')
plt.legend()
plt.tight_layout()
plt.show()

# Verify status scatter
plt.figure(figsize=(12,3))
plt.scatter(indices, verify_status, c=['green' if v else 'red' for v in verify_status])
plt.xlabel("Transaction Index")
plt.ylabel("Verify Status (True=Valid)")
plt.title("Verify Credential Status")
plt.yticks([0,1], ["False", "True"])
plt.grid(True)
plt.tight_layout()
plt.show()

# python scripts/charts/plot_latency.py