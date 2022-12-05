import { ethers } from "hardhat";
import { CRYPTO_DEVS_NFT_CONTRACT_ADDRESS } from "../constants";

async function main() {
  const cryptoDevsNFTContract = CRYPTO_DEVS_NFT_CONTRACT_ADDRESS;
  const cryptoDevsTokenContract = await ethers.getContractFactory(
    "CryptoDevToken"
  );
  const deployedCryptoDevs = await cryptoDevsTokenContract.deploy(
    cryptoDevsNFTContract
  );
  await deployedCryptoDevs.deployed();

  console.log(
    "Crypto Devs Token Contract Address:",
    deployedCryptoDevs.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
