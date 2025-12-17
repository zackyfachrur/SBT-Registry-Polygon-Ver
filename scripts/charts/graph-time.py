import json
import matplotlib.pyplot as plt

# ============================
# LOAD DATA
# ============================
with open("scripts/charts/tx.json", "r") as f:
    data = json.load(f)

# Ambil hanya step attest atau mint (pilih salah satu)
tx = [d for d in data if d["step"] == "attest"]

# ============================
# PREPARE DATA
# ============================
tx_numbers = list(range(1, len(tx) + 1))
confirm_times = [d["confirmTimeSec"] for d in tx]

# ============================
# 1. CONFIRMATION TIME (LINE)
# ============================
plt.figure(figsize=(10, 5))
plt.plot(
    tx_numbers,
    confirm_times,
    marker='o',
    linestyle='-'
)

plt.title("Confirmation Time per Transaction (0–100) - Polygon Amoy")
plt.xlabel("Confirm Time per Transaction on Polygon Amoy")
plt.ylabel("Confirmation Time (seconds)")
plt.grid(True)

plt.show()
