import json
import matplotlib.pyplot as plt

# ============================
# LOAD DATA
# ============================
with open("scripts/charts/tx.json", "r") as f:
    data = json.load(f)

attest = [d for d in data if d["step"] == "attest"]
mint   = [d for d in data if d["step"] == "mint"]

def ints(arr, key):
    return [int(d[key]) for d in arr]

def floats(arr, key):
    return [float(d[key]) for d in arr]

# ============================
# DATA
# ============================
tx_attest = list(range(1, len(attest) + 1))
tx_mint   = list(range(1, len(mint) + 1))

attest_time = floats(attest, "confirmTimeSec")
mint_time   = floats(mint, "confirmTimeSec")

attest_gas  = ints(attest, "gasUsed")
mint_gas    = ints(mint, "gasUsed")

attest_lat  = ints(attest, "latencyBlocks")
mint_lat    = ints(mint, "latencyBlocks")

# ============================
# 1. CONFIRMATION TIME (LINE)
# ============================
plt.figure(figsize=(10,5))
plt.plot(tx_attest, attest_time, marker='o', linestyle='-')
plt.title("Confirmation Time per Transaction (Attest)")
plt.xlabel("Transaction Number")
plt.ylabel("Seconds")
plt.grid(True)
plt.show()

# ============================
# 2. GAS USAGE (LINE)
# ============================
plt.figure(figsize=(10,5))
plt.plot(tx_attest, attest_gas, marker='o', linestyle='-')
plt.title("Gas Usage per Transaction (Attest)")
plt.xlabel("Transaction Number")
plt.ylabel("Gas Used")
plt.grid(True)
plt.show()

# ============================
# 3. BLOCK LATENCY (LINE)
# ============================
plt.figure(figsize=(10,5))
plt.plot(tx_attest, attest_lat, marker='o', linestyle='-')
plt.title("Block Latency per Transaction (Attest)")
plt.xlabel("Transaction Number")
plt.ylabel("Blocks")
plt.grid(True)
plt.show()

# ============================
# 4. GAS DISTRIBUTION
# ============================
plt.figure(figsize=(6,5))
plt.boxplot([attest_gas, mint_gas], labels=["Attest", "Mint"])
plt.title("Gas Usage Distribution")
plt.ylabel("Gas Used")
plt.grid(True)
plt.show()

# ============================
# 5. CONFIRM TIME DISTRIBUTION
# ============================
plt.figure(figsize=(6,5))
plt.boxplot([attest_time, mint_time], labels=["Attest", "Mint"])
plt.title("Confirmation Time Distribution")
plt.ylabel("Seconds")
plt.grid(True)
plt.show()
