// scripts/mintUsingExistingToken.js
// Jalankan (contoh): npx hardhat run scripts/mintUsingExistingToken.js --network localhost
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const signers = await ethers.getSigners();

  // 0) KONFIGURASI — GANTI sesuai lingkunganmu:
  // - addressRegistry: alamat registry yang sudah kamu deploy dan berisi tokenId yang di-anchor
  // - addressSBT: alamat SBT yang sudah kamu deploy (hasil deploySBT.js)
  // - tokenId: tokenId yang sudah di-anchor sebelumnya (nomor)
  // - candidateWallet: alamat penerima SBT
  // - validatorIndexer: index signer di node local yang bertindak sebagai validator (biasanya 1)
  const addressRegistry = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const addressSBT = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // address sbt contract hasil deploy
  const tokenId = 6; // ganti sesuai tokenId yang sudah di-anchor
  const candidateWallet = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"; // wallet hardhat ini wkwkw
  const validatorIndexer = 1; // gunakan signer ke-1 sebagai validator (sesuaikan)

  // if (
  //  addressRegistry.startsWith("0x5FbDB2315678afecb367f032d93F642f64180aa3") ||
  //  addressSBT.startsWith("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") ||
  //  candidateWallet.startsWith("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
  // ) {
  //  console.error("ERROR: ganti addressRegistry, addressSBT, candidateWallet di file sebelum run.");
  //  process.exit(1);
  // }

  const validator = signers[validatorIndexer];
  console.log("Using validator:", validator.address);

  // 1) attach ke registry & sbt
  const Registry = await ethers.getContractFactory("CredentialRegistry");
  const registry = await Registry.attach(addressRegistry);

  const SBT = await ethers.getContractFactory("CredentialSBT");
  const sbt = await SBT.attach(addressSBT);

  // 2) ambil info on-chain dari registry untuk tokenId yang ingin kamu mint
  console.log("\nFetching on-chain credential info for tokenId:", tokenId);
  let issuerID, onchainMetaHash, onchainExpiry, status;
  try {
    const info = await registry.getCredentialInfo(tokenId);
    issuerID = info[0];
    onchainMetaHash = info[1];
    onchainExpiry = info[2];
    status = info[3];
  } catch (err) {
    console.error("Registry.getCredentialInfo failed:", err.message || err);
    process.exit(1);
  }

  console.log("issuerID   :", issuerID);
  console.log("onchainMetaHash:", onchainMetaHash);
  console.log("onchainExpiry  :", onchainExpiry.toString());
  console.log("status (0=NONE,1=VALID,2=REVOKED) :", status.toString());

  // 3) OPTIONAL (safety): cross-check that validator (signer) is the registry.validator()
  const registryValidator = await registry.validator();
  if (registryValidator.toLowerCase() !== validator.address.toLowerCase()) {
    console.warn("WARNING: current signer is NOT registry.validator()");
    console.warn(" registry.validator() = ", registryValidator);
    console.warn(" signer                = ", validator.address);
    console.warn("Mint will fail unless you use the validator account.");
    // You can choose to exit or continue for manual testing
    // process.exit(1);
  }

  // 4) Compute metaHash off-chain from the metadata you used while attesting.
  // IMPORTANT: Off-chain metaHash must be computed using the SAME scheme as registry.
  // If you don't have the original metadata fields locally, you must retrieve them from your application storage or IPFS.
  // Here we assume you have them locally; update these values to match exactly.
  const metadata = {
    // FILL these with the same values you used when you uploaded + attested
    issuerID: "TEL-U-ECON", // recommended: reuse issuerID read from registry
    subjectID: "NIM-1402125199",
    credType: "BachelorOfInformationTechnology",
    issueDate: 1638316800 // the same UNIX issueDate used during attestation
  };

  // Compute off-chain metaHash using same packed encoding
  const metaHashOffchain = ethers.solidityPackedKeccak256(
    ["string", "string", "string", "uint256"],
    [metadata.issuerID, metadata.subjectID, metadata.credType, metadata.issueDate]
  );

  console.log("\nmetaHashOffchain computed:", metaHashOffchain);
  console.log("onchainMetaHash         :", onchainMetaHash);

  // 5) Compare on-chain vs off-chain metaHash & expiry
  if (metaHashOffchain !== onchainMetaHash) {
    console.error("\nERROR: metaHash mismatch. Jangan panggil mintSBT, periksa metadata (subjectID/credType/issueDate).");
    process.exit(1);
  }

  if (Number(onchainExpiry) !== Number(onchainExpiry)) {
    // nonsense guard, keep for pattern. Real check for expiry is below:
  }
  // Check expiry vs block.timestamp
  const latestBlock = await ethers.provider.getBlock("latest");
  const now = latestBlock.timestamp;
  if (onchainExpiry > 0 && onchainExpiry <= now) {
    console.error("\nERROR: credential expired on-chain (expiry <= block.timestamp). Mint not allowed.");
    process.exit(1);
  }

  // 6) Call mintSBT via validator signer
  console.log("\nCalling mintSBT(...) as validator...");
  try {
    const sbtWithValidator = sbt.connect(validator);
    const tx = await sbtWithValidator.mintSBT(tokenId, candidateWallet, metaHashOffchain, onchainExpiry);
    const receipt = await tx.wait();
    console.log("mintSBT tx mined. gasUsed:", receipt.gasUsed.toString());
    console.log("SBT minted for tokenId:", tokenId, "to", candidateWallet);
  } catch (err) {
    console.error("mintSBT failed:", err.message || err);
    process.exit(1);
  }

  // 7) verify owner
  try {
    const owner = await sbt.ownerOf(tokenId);
    console.log("\nownerOf(tokenId):", owner);
  } catch (err) {
    console.error("ownerOf failed:", err.message || err);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
