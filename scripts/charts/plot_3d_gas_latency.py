import json
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

with open("scripts/charts/txMetrics.json") as f:
    tx_metrics = json.load(f)

attest_gas = [int(tx['attestGas']) for tx in tx_metrics]
mint_gas = [int(tx['mintGas']) for tx in tx_metrics]
latency = [tx['verifyLatencyBlocks'] for tx in tx_metrics]
token_ids = [tx['tokenId'] for tx in tx_metrics]

fig = plt.figure(figsize=(12,8))
ax = fig.add_subplot(111, projection='3d')

ax.scatter(token_ids, attest_gas, latency, c='blue', label='Attest Gas')
ax.scatter(token_ids, mint_gas, latency, c='red', label='Mint Gas')

ax.set_xlabel('TokenId')
ax.set_ylabel('Gas Used')
ax.set_zlabel('Verify Latency (Blocks)')
ax.set_title('3D Scatter: Gas vs Latency vs TokenId')
ax.legend()
plt.show()

# python scripts/charts/plot_3d_gas_latency.py