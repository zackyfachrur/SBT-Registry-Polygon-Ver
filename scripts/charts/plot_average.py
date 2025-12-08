import json
import matplotlib.pyplot as plt
import numpy as np

with open("scripts/charts/txMetrics.json") as f:
    tx_metrics = json.load(f)

attest_gas = np.array([int(tx['attestGas']) for tx in tx_metrics])
mint_gas = np.array([int(tx['mintGas']) for tx in tx_metrics])
verify_latency = np.array([tx['verifyLatencyBlocks'] for tx in tx_metrics])

def avg_per_n(arr, n=10):
    return [arr[i:i+n].mean() for i in range(0, len(arr), n)]

ranges = [f"{i}-{i+9}" for i in range(0, len(attest_gas), 10)]
attest_avg = avg_per_n(attest_gas)
mint_avg = avg_per_n(mint_gas)
latency_avg = avg_per_n(verify_latency)

# Average Gas
plt.figure(figsize=(12,6))
plt.plot(ranges, attest_avg, marker='o', label='Attest Gas Avg')
plt.plot(ranges, mint_avg, marker='x', label='Mint Gas Avg')
plt.xlabel("Transaction Range")
plt.ylabel("Average Gas Used")
plt.title("Average Gas per 10 Transactions")
plt.grid(True)
plt.legend()
plt.tight_layout()
plt.show()

# Average Latency
plt.figure(figsize=(12,6))
plt.bar(ranges, latency_avg, color='lightgreen')
plt.xlabel("Transaction Range")
plt.ylabel("Average Verify Latency (Blocks)")
plt.title("Average Verify Latency per 10 Transactions")
plt.grid(axis='y')
plt.tight_layout()
plt.show()

# python scripts/charts/plot_average.py