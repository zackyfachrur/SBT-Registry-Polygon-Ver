const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();

  // ISI dengan alamat registry hasil deploy
  const registryAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // address contract registry 1

  // HAPUS / KOMENTARIN blok ini
  // if (registryAddress === "0x5FbDB2315678afecb367f032d93F642f64180aa3") {
  //   console.error("ERROR: ganti variable registryAddress di file dengan address registry-mu dulu.");
  //   process.exit(1);
  // }

  console.log("Deployer:", deployer.address);
  console.log("Registry:", registryAddress);

  const SBT = await ethers.getContractFactory("CredentialSBT");
  const sbt = await SBT.connect(deployer).deploy(registryAddress, "MySBT", "MSBT");
  await sbt.waitForDeployment();

  console.log("CredentialSBT deployed at:", await sbt.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


