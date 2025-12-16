const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");

// ================= CONFIG =================
const RESULT_FILE = "scripts/charts/tx-result.json";

// ================= UTIL ===================
function appendTx(entry) {
  let data = [];
  if (fs.existsSync(RESULT_FILE)) {
    data = JSON.parse(fs.readFileSync(RESULT_FILE, "utf8"));
  }
  data.push(entry);
  fs.writeFileSync(RESULT_FILE, JSON.stringify(data, null, 2));
}

// ================= MAIN ===================
async function main() {
  const [deployer, validator, holder, verifier] = await ethers.getSigners();

  console.log("\n========== START FULL RUN ==========\n");
  console.log("Network  :", hre.network.name);
  console.log("Chain ID :", hre.network.config.chainId);
  console.log("Deployer :", deployer.address);
  console.log("Validator:", validator.address);
  console.log("Holder   :", holder.address);
  console.log("Verifier :", verifier.address);

  // ================= 1. DEPLOY REGISTRY =================
  const Registry = await ethers.getContractFactory(
    "contracts/CredentialRegistry.sol:CredentialRegistry"
  );

  const registryDeployTx = await Registry
    .connect(deployer)
    .deploy(validator.address);

  await registryDeployTx.waitForDeployment();
  const registry = registryDeployTx;
  const registryAddr = await registry.getAddress();

  console.log("\nRegistry deployed:", registryAddr);

  // ================= 2. DEPLOY SBT =================
  const SBT = await ethers.getContractFactory("CredentialSBT");

  const sbtDeployTx = await SBT
    .connect(deployer)
    .deploy(registryAddr, "MySBT", "MSBT");

  await sbtDeployTx.waitForDeployment();
  const sbt = sbtDeployTx;
  const sbtAddr = await sbt.getAddress();

  console.log("SBT deployed      :", sbtAddr);

  // ================= 3. METADATA =================
  const metadata = {
    issuerID: "TEL-U-ECON",
    subjectID: "NIM-999888777",
    credType: "BachelorOfIT",
    issueDate: 1719792000,
  };

  const metaHash = ethers.solidityPackedKeccak256(
    ["string", "string", "string", "uint256"],
    [
      metadata.issuerID,
      metadata.subjectID,
      metadata.credType,
      metadata.issueDate,
    ]
  );

  const expiry = 2000000000;

  // ================= 4. ATTEST =================
  const attestStartTime = Date.now();
  const attestStartBlock = await ethers.provider.getBlock("latest");

  const attestTx = await registry
    .connect(validator)
    .attest(
      metadata.issuerID,
      metadata.subjectID,
      metadata.credType,
      metadata.issueDate,
      expiry
    );

  const attestReceipt = await attestTx.wait();
  const attestEndTime = Date.now();
  const attestEndBlock = await ethers.provider.getBlock("latest");

  const tokenId = Number(attestReceipt.logs[0].args.tokenId);

  const attestConfirmTimeSec =
    (attestEndTime - attestStartTime) / 1000;

  const attestLatencyBlocks =
    attestEndBlock.number - attestStartBlock.number;

  appendTx({
    step: "attest",
    tokenId,
    gasUsed: attestReceipt.gasUsed.toString(),
    blockNumber: attestReceipt.blockNumber,
    confirmTimeSec: Number(attestConfirmTimeSec.toFixed(2)),
    latencyBlocks: attestLatencyBlocks,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    timestamp: new Date().toISOString(),
  });

  console.log("\nAttest");
  console.log("TokenID :", tokenId);
  console.log("Gas     :", attestReceipt.gasUsed.toString());
  console.log("Confirm :", attestConfirmTimeSec.toFixed(2), "sec");
  console.log("Latency :", attestLatencyBlocks, "blocks");

  // ================= 5. MINT =================
  const mintStartTime = Date.now();
  const mintStartBlock = await ethers.provider.getBlock("latest");

  const mintTx = await sbt
    .connect(validator)
    .mintSBT(tokenId, holder.address, metaHash, expiry);

  const mintReceipt = await mintTx.wait();
  const mintEndTime = Date.now();
  const mintEndBlock = await ethers.provider.getBlock("latest");

  const mintConfirmTimeSec =
    (mintEndTime - mintStartTime) / 1000;

  const mintLatencyBlocks =
    mintEndBlock.number - mintStartBlock.number;

  appendTx({
    step: "mint",
    tokenId,
    gasUsed: mintReceipt.gasUsed.toString(),
    blockNumber: mintReceipt.blockNumber,
    confirmTimeSec: Number(mintConfirmTimeSec.toFixed(2)),
    latencyBlocks: mintLatencyBlocks,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    timestamp: new Date().toISOString(),
  });

  console.log("\nMint");
  console.log("Gas     :", mintReceipt.gasUsed.toString());
  console.log("Confirm :", mintConfirmTimeSec.toFixed(2), "sec");
  console.log("Latency :", mintLatencyBlocks, "blocks");

  // ================= 6. VERIFY =================
  const verifyStartBlock = await ethers.provider.getBlock("latest");

  const info = await registry.getCredentialInfo(tokenId);

  const metaHashVC = ethers.solidityPackedKeccak256(
    ["string", "string", "string", "uint256"],
    [
      metadata.issuerID,
      metadata.subjectID,
      metadata.credType,
      metadata.issueDate,
    ]
  );

  const credentialValid =
    info[1].toLowerCase() === metaHashVC.toLowerCase() &&
    Number(info[3]) === 1 &&
    Number(info[2]) > verifyStartBlock.timestamp;

  const verifyEndBlock = await ethers.provider.getBlock("latest");

  const verifyLatencyBlocks =
    verifyEndBlock.number - verifyStartBlock.number;

  appendTx({
    step: "verify",
    tokenId,
    verified: credentialValid,
    latencyBlocks: verifyLatencyBlocks,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    timestamp: new Date().toISOString(),
  });

  console.log("\nVerify");
  console.log("Valid   :", credentialValid);
  console.log("Latency :", verifyLatencyBlocks, "blocks");

  // ================= SUMMARY =================
  console.log("\n========== SUMMARY ==========");
  console.log("Registry :", registryAddr);
  console.log("SBT      :", sbtAddr);
  console.log("TokenID  :", tokenId);
  console.log("=============================\n");
}

// ================= RUN =================
main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
