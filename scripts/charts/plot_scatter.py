import json
import matplotlib.pyplot as plt

with open("scripts/charts/txMetrics.json") as f:
    tx_metrics = json.load(f)

indices = [tx['index'] for tx in tx_metrics]
attest_gas = [int(tx['attestGas']) for tx in tx_metrics]
mint_gas = [int(tx['mintGas']) for tx in tx_metrics]

plt.figure(figsize=(12,6))
plt.scatter(indices, attest_gas, color='blue', label='Attest Gas', s=50)
plt.scatter(indices, mint_gas, color='red', label='Mint Gas', s=50)
plt.xlabel("Transaction Index")
plt.ylabel("Gas Used")
plt.title("Scatter Plot Gas Usage per Transaction")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()

# python scripts/charts/plot_scatter.py