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
# 5. CONFIRM TIME DISTRIBUTION
# ============================
plt.figure(figsize=(6,5))
plt.boxplot([attest_time, mint_time], labels=["Attest", "Mint"])
plt.title("Confirmation Time Distribution on Polygon Amoy")
plt.ylabel("Seconds")
plt.grid(True)
plt.show()
