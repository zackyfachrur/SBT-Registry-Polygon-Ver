const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");

async function main() {
    const [deployer, validator, holder, verifier] = await ethers.getSigners();

    console.log("\n========== START BULK RUN ==========\n");
    console.log("Deployer :", deployer.address);
    console.log("Validator:", validator.address);
    console.log("Holder   :", holder.address);
    console.log("Verifier :", verifier.address);

    // 1) DEPLOY REGISTRY
    const Registry = await ethers.getContractFactory("contracts/CredentialRegistry.sol:CredentialRegistry");
    const regTx = await Registry.connect(deployer).deploy(validator.address);
    await regTx.waitForDeployment();
    const registry = regTx;
    const registryAddr = await registry.getAddress();
    console.log("\nRegistry deployed:", registryAddr);

    // 2) DEPLOY SBT
    const SBT = await ethers.getContractFactory("CredentialSBT");
    const sbtTx = await SBT.connect(deployer).deploy(registryAddr, "MySBT", "MSBT");
    await sbtTx.waitForDeployment();
    const sbt = sbtTx;
    const sbtAddr = await sbt.getAddress();
    console.log("SBT deployed      :", sbtAddr);

    // Array untuk menyimpan metrics tiap transaksi
    const txMetrics = [];

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    for (let i = 0; i < 100; i++) {
        const metadata = {
            issuerID: `TEL-U-ECON-${i}`,
            subjectID: `NIM-${i}`,
            credType: "BachelorOfIT",
            issueDate: 1719792000 + i,
        };

        const metaHash = ethers.solidityPackedKeccak256(
            ["string", "string", "string", "uint256"],
            [metadata.issuerID, metadata.subjectID, metadata.credType, metadata.issueDate]
        );

        const expiry = 2000000000;

        // Attest
        const attestTx = await registry.connect(validator).attest(
            metadata.issuerID,
            metadata.subjectID,
            metadata.credType,
            metadata.issueDate,
            expiry
        );
        const attestReceipt = await attestTx.wait();
        const tokenId = Number(attestReceipt.logs[0].args.tokenId);


        // Mint SBT
        const mintTx = await sbt.connect(validator).mintSBT(tokenId, holder.address, metaHash, expiry);
        const mintReceipt = await mintTx.wait();

        // Verifikasi
        const verifyStartBlock = await ethers.provider.getBlock("latest");
        const info = await registry.getCredentialInfo(tokenId);
        const metaHashVC = ethers.solidityPackedKeccak256(
            ["string", "string", "string", "uint256"],
            [metadata.issuerID, metadata.subjectID, metadata.credType, metadata.issueDate]
        );
        const credentialValid =
            info[1].toLowerCase() === metaHashVC.toLowerCase() &&
            Number(info[3]) === 1 &&
            Number(info[2]) > verifyStartBlock.timestamp;
        const verifyEndBlock = await ethers.provider.getBlock("latest");

        const sentBlock = await ethers.provider.getBlock(attestReceipt.blockNumber - 1);
        const confirmBlock = await ethers.provider.getBlock(attestReceipt.blockNumber);

        txMetrics.push({
            index: i,
            tokenId,
            attestGas: attestReceipt.gasUsed.toString(),
            mintGas: mintReceipt.gasUsed.toString(),
            verify: credentialValid,
            verifyLatencyBlocks: verifyEndBlock.number - verifyStartBlock.number,
            confirmTimeSec: confirmBlock.timestamp - sentBlock.timestamp,
        });

        if (i % 10 === 0) console.log(`Processed ${i + 1}/100 transactions`);
    }

    console.log("\n========== BULK RUN COMPLETE ==========");
    fs.writeFileSync("scripts/charts/txMetrics.json", JSON.stringify(txMetrics, null, 2));
    console.log("txMetrics saved to scripts/charts/txMetrics.json");
    console.table(txMetrics);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
