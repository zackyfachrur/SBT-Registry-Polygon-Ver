// scripts/deployRegistry.js
// npx hardhat run scripts/deployRegistry.js --network localhost
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer, validator] = await ethers.getSigners();

  console.log("Deployer :", deployer.address);
  console.log("Validator:", validator.address);

  const Registry = await ethers.getContractFactory("CredentialRegistry-2");
  const registry = await Registry.connect(deployer).deploy(validator.address);
  await registry.waitForDeployment();

  console.log("CredentialRegistry-2 deployed at:", await registry.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
