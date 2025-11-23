// scripts/attestAndVerify.js
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // 1. Ambil signer
  const [deployer, validator] = await ethers.getSigners();

  console.log("Deployer :", deployer.address);
  console.log("Validator:", validator.address);

  // 2. Deploy kontrak CredentialRegistry
  const Registry = await ethers.getContractFactory("CredentialRegistry");
  const registry = await Registry.connect(deployer).deploy(validator.address);
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("Registry deployed at:", registryAddress);

  // 3. Siapkan metadata (harus sama dengan yg di-hash & yg dilempar ke attest)
  const metadata = {
      issuerID: "TEL-U-ECON",
      subjectID: "NIM-1101234567",
      credType: "BachelorOfManagement",
      issueDate: 1731542400,
      expiry: 1893456000,      // contoh expiry di masa depan
  };

  // 4. Hitung metaHash off-chain (harus sama dengan keccak256(abi.encodePacked(...)) di Solidity)
  const metaHashOffchain = ethers.solidityPackedKeccak256(
    ["string", "string", "string", "uint256"],
    [
      metadata.issuerID,
      metadata.subjectID,
      metadata.credType,
      metadata.issueDate
    ]
  );

  console.log("metaHash off-chain:", metaHashOffchain);

  // 5. Panggil attest() di registry
  const tx = await registry.connect(validator).attest(
    metadata.issuerID,
    metadata.subjectID,
    metadata.credType,
    metadata.issueDate,
    metadata.expiry
  );
  const receipt = await tx.wait();

  // 6. Ambil tokenId dari event CredentialRegistered
  const events = await registry.queryFilter(
    registry.filters.CredentialRegistered(),
    receipt.blockNumber,
    receipt.blockNumber
  );

  if (events.length === 0) {
    console.log("❌ Event CredentialRegistered tidak ditemukan.");
    return;
  }

  const ev = events[0];
  const tokenId = ev.args.tokenId;
  console.log("tokenId anchored:", tokenId.toString());

  // 7. Verifikasi on-chain vs off-chain
  const info = await registry.getCredentialInfo(tokenId);

  console.log("On-chain metaHash :", info.metaHash);
  console.log("Off-chain metaHash:", metaHashOffchain);

  if (info.metaHash === metaHashOffchain) {
    console.log("✅ metaHash cocok. Anchoring sesuai model.");
  } else {
    console.log("❌ metaHash TIDAK cocok. Ada yang salah di input / hashing.");
  }
}

main().catch((error) => {
  console.error(error);
});
