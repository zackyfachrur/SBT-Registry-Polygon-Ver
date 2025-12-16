    const hre = require("hardhat");
    const { ethers } = hre;

    async function main() {
    const [deployer, validator, holder, verifier] = await ethers.getSigners();

    console.log("\n========== START FULL RUN ==========\n");
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
    const sbtTx = await SBT.connect(deployer).deploy(
        registryAddr,
        "MySBT",
        "MSBT"
    );
    await sbtTx.waitForDeployment();

    const sbt = sbtTx;
    const sbtAddr = await sbt.getAddress();

    console.log("SBT deployed      :", sbtAddr);

    // 3) ATTEST (Anchor Credential)
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

    const attestTx = await registry
        .connect(validator)
        .attest(metadata.issuerID, metadata.subjectID, metadata.credType, metadata.issueDate, expiry);

    const attestReceipt = await attestTx.wait();
    const tokenId = Number(attestReceipt.logs[0].args.tokenId);

    console.log("\nAttest credential:");
    console.log("tokenId :", tokenId);
    console.log("gasUsed :", attestReceipt.gasUsed.toString());
    console.log("latency :", attestReceipt.blockNumber);

    // 4) MINT SBT
    const mintTx = await sbt
        .connect(validator)
        .mintSBT(tokenId, holder.address, metaHash, expiry);

    const mintReceipt = await mintTx.wait();

    console.log("\nMint SBT:");
    console.log("gasUsed :", mintReceipt.gasUsed.toString());
    console.log("latency :", mintReceipt.blockNumber);

    // 5) VERIFIER CHECK
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

    const verifyStartBlock = await ethers.provider.getBlock("latest");

    const credentialValid =
    info[1].toLowerCase() === metaHashVC.toLowerCase() &&         
    Number(info[3]) === 1 &&    
    Number(info[2]) > verifyStartBlock.timestamp; 

    const verifyEndBlock = await ethers.provider.getBlock("latest");

    console.log("\nVerify Credential:");
    console.log("credentialValid :", credentialValid);
    console.log("latency         :", verifyEndBlock.number - verifyStartBlock.number);

    
    console.log("\nDEBUG CHECK");
    console.log("metaHash OnChain:", info[1]);
    console.log("metaHash VC     :", metaHashVC);
    console.log("expiry OnChain  :", info[2].toString());
    console.log("expiry Now      :", verifyStartBlock.timestamp);
    console.log("status OnChain  :", info[3].toString());

    // VISUALIZATION
    const txMetrics = [];

    txMetrics.push({
        step: "Attest",
        gasUsed: attestReceipt.gasUsed.toString(),
        blockNumber: attestReceipt.blockNumber,
    });

    txMetrics.push({
    step: "mint",
    gasUsed: Number(mintReceipt.gasUsed),
    blockNumber: mintReceipt.blockNumber
});

txMetrics.push({
    step: "verify",
    latencyBlocks: verifyEndBlock.number - verifyStartBlock.number
});

console.log("Metrics ready for plotting:", txMetrics);


    // SUMMARY OUTPUT
    console.log("\n========== SUMMARY ==========");
    console.log("Registry deployed :", registryAddr);
    console.log("SBT deployed      :", sbtAddr);
    console.log("TokenID           :", tokenId);
    console.log("------------------------------");
    console.log("GAS — Attest      :", attestReceipt.gasUsed.toString());
    console.log("GAS — Mint SBT    :", mintReceipt.gasUsed.toString());
    console.log("------------------------------");
    console.log("Latency — Attest block :", attestReceipt.blockNumber);
    console.log("Latency — Mint block   :", mintReceipt.blockNumber);
    console.log("Latency — Verify        :", verifyEndBlock.number - verifyStartBlock.number);
    console.log("=====================================\n");
    }


    main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
    });
