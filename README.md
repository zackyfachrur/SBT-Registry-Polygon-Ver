
# Academic Credential SBT Registry

A Solidity-based Soulbound Token (SBT) registry enabling decentralized issuance, binding, and verification of academic credentials using non-transferable tokens.


## Features

### *CredentialRegistry.sol*
Stores credential metadata, hash integrity, issuer, validity, and expiration time.
### *CredentialSBT.sol*
Soulbound Token contract responsible for minting non-transferable tokens bound to recipient wallet addresses.

### *Credential lifecycle*
```bash
Attest → Mint SBT → Verify (hash + state + expiry)
```

### Technical Features
- Gas usage and confirmation latency metrics
- Deterministic metadata hashing using solidityPackedKeccak256
- Block-level timestamp validation
- Validator-restricted credential attestation
- Permanent and tamper-proof registry log

### Stack
- Solidity (SBT + Registry Smart Contracts)
- Hardhat (development, deployment, scripting)
- Ethers.js (interaction + metrics)
- Node.js (batch execution + JSON output)

## Installation

#### *Clone this repository*

```bash
git clone https://github.com/zackyfachrur/Academic-Credential-SBT-Registry
```
#### *Goto folder directory*
```bash
cd Academic-Credential-SBT-Registry
```

#### *Install the project using*

#### *BUN*

```bash
bun install
```

## *Command to run Program Charts (Python)*

#### *Run Scatter Plot*
```bash
python scripts/charts/plot_scatter.py
```
#### *Run Latency Plot*
```bash
python scripts/charts/plot_latency.py
```
#### *Run Heatmap Plot*
```bash
python scripts/charts/plot_heatmap.py
```
#### *Run Gas Plot*
```bash
python scripts/charts/plot_gas.py
```
#### *Run Confirm Time Plot*
```bash
python scripts/charts/plot_confirm_time.py
```
#### *Run Average Plot (Gas and Latency Uses)*
```bash
python scripts/charts/plot_average.py
```
#### *Run 3D Gas Latency Uses*
```bash
python scripts/charts/plot_3d_gas_latency.py
```

## *Command to run Program (Javascript)*

#### *Step 1* | Run Deploy Registry
```bash
bunx hardhat run scripts/deployregistry.js
```


#### *Step 2* | Run Deploy Soulbound Token (SBT)
```bash
bunx hardhat run scripts/deploySBT.js
```

#### *Step 3* | Run Program (For Testing)
```bash
bunx hardhat run scripts/full-test.js
```

#### *Step 4* | Run 100 Transaction
```bash
bunx hardhat run scripts/transaction.js
```
