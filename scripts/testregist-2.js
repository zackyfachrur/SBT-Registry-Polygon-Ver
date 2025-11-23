const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer, validator] = await ethers.getSigners();
  const registryAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // alamat yang tadi
  const registry = await ethers.getContractAt("CredentialRegistry", registryAddress);

  const metadata = {
    issuerID: "TEL-U-ECON",
    subjectID: "NIM-1402125199",
    credType: "BachelorOfInformationTechnology",
    issueDate: 1638316800,
    expiry: 1796083200,
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

  const tx = await registry.connect(validator).attest(
    metadata.issuerID,
    metadata.subjectID,
    metadata.credType,
    metadata.issueDate,
    metadata.expiry
  );
  const receipt = await tx.wait();

  const events = await registry.queryFilter(
    registry.filters.CredentialRegistered(),
    receipt.blockNumber,
    receipt.blockNumber
  );

  const ev = events[0];
  const tokenId = ev.args.tokenId;
  console.log("tokenId anchored:", ev.args.tokenId.toString());

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

main().catch(console.error);

// unused!

