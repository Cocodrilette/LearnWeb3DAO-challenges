import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Whitelist contract", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployWhitelistFixture() {
    const MAX_ADDRESSES = 5;
    // Contracts are deployed using the first signer/account by default
    const [addr0, addr1, addr2, addr3, addr4, addr5] =
      await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const whitelist = await Whitelist.deploy(MAX_ADDRESSES);

    return {
      MAX_ADDRESSES,
      whitelist,
      addr0,
      addr1,
      addr2,
      addr3,
      addr4,
      addr5,
    };
  }

  describe("Deployment", function () {
    it("Should set the right max address", async function () {
      const { whitelist, MAX_ADDRESSES } = await loadFixture(
        deployWhitelistFixture
      );

      expect(await whitelist.maxWhitelistedAddresses()).to.equal(MAX_ADDRESSES);
    });
  });

  describe("Adding addresses", function () {
    it("Should add an address", async function () {
      const { whitelist, addr0 } = await loadFixture(deployWhitelistFixture);

      await whitelist.connect(addr0).addAddressToWhitelist();
      expect(await whitelist.whitelistedAddresses(addr0.address)).to.equal(
        true
      );
    });
  });

  // ! todo: e2e testing
});
