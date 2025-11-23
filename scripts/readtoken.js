// scripts/readToken.js
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const registryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // alamat registry yg sama
  const registry = await ethers.getContractAt("CredentialRegistry", registryAddress);

  const tokenId = 2; // tokenId yang mau dicek

  const [issuerID, metaHash, expiry, status] = await registry.getCredentialInfo(tokenId);

  console.log("=== Credential Info for tokenId", tokenId, "===");
  console.log("issuerID :", issuerID);
  console.log("metaHash :", metaHash);
  console.log("expiry   :", expiry.toString());
  console.log("status   :", status.toString(), "(0=NONE, 1=VALID, 2=REVOKED)");
}

main().catch(console.error);
