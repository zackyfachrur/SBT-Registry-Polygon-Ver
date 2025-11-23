// scripts/verifyAsVerifier.js
// npx hardhat run scripts/verifyAsVerifier.js --network localhost
// untuk actor verifier yang memverifikasi credential dari holder
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const signers = await ethers.getSigners();
  const verifier = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"; // misal akun ke-3 jadi Verifier

  const registryAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const sbtAddress      = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const tokenId         = 5;

  // Ini data yang "dipresentasikan" Holder ke Verifier:
  const claimedHolder  = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; // wallet holder
  const vc = {
    issuerID:  "TEL-U-ECON",
    subjectID: "NIM-1402222101",
    credType: "BachelorOfInformationTechnology",
    issueDate: 1719792000 // sama persis dg saat attest
  };

  const Registry = await ethers.getContractFactory("CredentialRegistry");
  const registry = Registry.attach(registryAddress);

  const SBT = await ethers.getContractFactory("CredentialSBT");
  const sbt = SBT.attach(sbtAddress);

  console.log("=== Step 1: cek kepemilikan SBT ===");
  const ownerOnchain = await sbt.ownerOf(tokenId);
  console.log("ownerOnchain:", ownerOnchain);
  if (ownerOnchain.toLowerCase() !== claimedHolder.toLowerCase()) {
    console.error("FAIL: tokenId tidak dimiliki claimedHolder");
    return;
  }

  console.log("\n=== Step 2: cek status credential di Registry ===");
  const info = await registry.getCredentialInfo(tokenId);
  const issuerID        = info[0];
  const metaHashOnchain = info[1];
  const expiry          = info[2];
  const status          = info[3];

  console.log("issuerID       :", issuerID);
  console.log("metaHashOnchain:", metaHashOnchain);
  console.log("expiry         :", expiry.toString());
  console.log("status         :", status.toString());

  const latestBlock = await ethers.provider.getBlock("latest");
  const now = latestBlock.timestamp;

  if (status.toString() !== "1") {
    console.error("FAIL: credential status not VALID");
    return;
  }
  if (expiry > 0 && expiry <= now) {
    console.error("FAIL: credential expired");
    return;
  }

  console.log("\n=== Step 3: cek integritas VC (metaHash) ===");
  const metaHashFromVC = ethers.solidityPackedKeccak256(
    ["string", "string", "string", "uint256"],
    [vc.issuerID, vc.subjectID, vc.credType, vc.issueDate]
  );

  console.log("metaHashFromVC :", metaHashFromVC);
  console.log("metaHashOnchain:", metaHashOnchain);

  if (metaHashFromVC !== metaHashOnchain) {
    console.error("FAIL: VC metadata tidak cocok dengan on-chain registry");
    return;
  }

  console.log("\n✅ Credential VALID dan konsisten dengan on-chain state.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
