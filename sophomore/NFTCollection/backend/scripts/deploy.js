const hre = require("hardhat");
const { ethers } = require("hardhat");
const { METADATA_URL, WHITELIST_CONTRACT_ADDRESS } = require("../constants/index.js");

async function main() {
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL from where we can extract the metadata for a Crypto Dev NFT
  const metadataURL = METADATA_URL;
  /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so cryptoDevsContract here is a factory for instances of our CryptoDevs contract.
  */
  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");

  const deployedCrytoDevsContract = await cryptoDevsContract.deploy(
    metadataURL,
    whitelistContract
  );
  await deployedCrytoDevsContract.deployed();

  console.log(
    "Crypto Devs Contract Address",
    deployedCrytoDevsContract.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
