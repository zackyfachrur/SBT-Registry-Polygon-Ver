import json
import matplotlib.pyplot as plt
import numpy as np

with open("scripts/charts/txMetrics.json") as f:
    tx_metrics = json.load(f)

attest_gas = [int(tx['attestGas']) for tx in tx_metrics]
mint_gas = [int(tx['mintGas']) for tx in tx_metrics]

gas_array = np.array([attest_gas, mint_gas])

fig, ax = plt.subplots(figsize=(12,4))

cax = ax.imshow(gas_array, cmap='YlGnBu', aspect='auto')

ax.set_yticks([0, 1])
ax.set_yticklabels(['Attest Gas', 'Mint Gas'])
ax.set_xticks(range(len(attest_gas)))
ax.set_xlabel("Transaction Index")
ax.set_title("Heatmap of Gas Usage per Transaction")

cbar = fig.colorbar(cax)
cbar.set_label('Gas Used')

for i in range(gas_array.shape[0]):
    for j in range(gas_array.shape[1]):
        ax.text(j, i, gas_array[i, j], ha='center', va='center', color='black', fontsize=6)

plt.tight_layout()
plt.show()
