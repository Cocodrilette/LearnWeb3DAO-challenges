import { ethers } from "hardhat";
import { CRYPTODEVS_NFT_CONTRACT_ADDRESS } from "../constants";

async function main() {
  const FakeNFTMarketplaceContract = await ethers.getContractFactory(
    "FakeNFTMarketplace"
  );

  const fakeNFTMarketplaceContract = await FakeNFTMarketplaceContract.deploy();
  await fakeNFTMarketplaceContract.deployed();

  console.log(
    "NFT Marketplace deployed at:",
    fakeNFTMarketplaceContract.address
  );

  const CryptoDevDAOContract = await ethers.getContractFactory("CryptoDevsDAO");
  const cryptoDevTokenContract = await CryptoDevDAOContract.deploy(
    fakeNFTMarketplaceContract.address,
    CRYPTODEVS_NFT_CONTRACT_ADDRESS
  );
  await cryptoDevTokenContract.deployed();

  console.log(
    "Crypto dev DAO contract deployed at:",
    cryptoDevTokenContract.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
