import json
import matplotlib.pyplot as plt

with open("scripts/charts/txMetrics.json") as f:
    tx_metrics = json.load(f)

indices = [tx['index'] for tx in tx_metrics]
attest_gas = [int(tx['attestGas']) for tx in tx_metrics]
mint_gas = [int(tx['mintGas']) for tx in tx_metrics]

plt.figure(figsize=(12,6))
plt.plot(indices, attest_gas, marker='o', label='Attest Gas')
plt.plot(indices, mint_gas, marker='x', label='Mint Gas')
plt.xlabel("Transaction Index")
plt.ylabel("Gas Used")
plt.title("Gas Used per Transaction")
plt.grid(True)
plt.legend()
plt.tight_layout()
plt.show()

# python scripts/charts/plot_gas.py