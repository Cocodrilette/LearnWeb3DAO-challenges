import { ethers } from "hardhat";

async function main() {
  /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so whitelistContract here is a factory for instances of our Whitelist contract.
  */
  const whitelistContract = await ethers.getContractFactory("Whitelist");

  // At this point the contract is sent to the network
  const deployedWhitelistContract = await whitelistContract.deploy(10);

  // Here we wait until the contract was already deployed
  await deployedWhitelistContract.deployed();

  console.log("Whitelist Contract Address:", deployedWhitelistContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
