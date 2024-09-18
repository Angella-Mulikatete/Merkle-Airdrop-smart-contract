import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
// import keccak256 from "keccak256";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
const helpers = require("@nomicfoundation/hardhat-network-helpers");
// import { ethers } from "ethers";
let ethers = require('./node_modules/ethers');

describe("Airdrop", function(){
  const baycAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
  const nftHolder = "0x720A4FaB08CB746fC90E88d1924a98104C0822Cf";
  const merkleRoot = "0x864f709297936d3a5f6e24908eb9ef37bdadfec10d455ebb2a3ead3260c9064f";

  let proofs: {[key: string]: any} = {};

  async function deployToken(){
    const ercToken = await hre.ethers.getContractFactory("MyToken");
    const token = await ercToken.deploy();
    return {token};
  }

  async function deployMerkleAirdrop(){
    const {token} = await loadFixture(deployToken);

    const merkleAirdrop =  await hre.ethers.getContractFactory("MerkleAirdrop");
    const merkleAirdropDeployed =  await merkleAirdrop.deploy(token, merkleRoot);

     // Transfer tokens to merkleAirdropDeployed contract
    await token.transfer(merkleAirdropDeployed, 100000);
    return {merkleAirdropDeployed, token};
  }

  describe("Nft holder should claim", function(){

    it("Should generate a valid merkle root", async function () {
      await helpers.impersonateAccount(nftHolder);
      const impersonatedNftHolder = await ethers.getSigner(nftHolder);
      const [owner, addr1] = await ethers.getSigners();
    
      const leaves = [
        { address: impersonatedNftHolder.address, amount: 100 },
        { address: addr1.address, amount: 50 },
      ];

      const values = leaves.map(leaf => [leaf.address, leaf.amount.toString()]);
      const tree = StandardMerkleTree.of(values, ["address", "uint256"]);
    
      const root = tree.root;
      expect(root).to.equal(merkleRoot);

      // Save proofs 

      for (const [index, value] of tree.entries()) {
        const proof = tree.getProof(index);
        proofs[value[0]] = proof;
      }
    });

    it("should allow an eligible user with BAYC NFT to claim tokens", async() => {
      await helpers.impersonateAccount(nftHolder);
      const impersonatedNftHolder = await ethers.getSigner(nftHolder);
      const {merkleAirdropDeployed, token} = await loadFixture(deployMerkleAirdrop);

      const amount = 100;
      const proof = proofs[impersonatedNftHolder.address];

      await token.transfer(merkleAirdropDeployed, amount); // Fund the airdrop contract

        await expect(merkleAirdropDeployed.connect(impersonatedNftHolder).claim(amount, proof))
            .to.emit(token, "Transfer")
            .withArgs(merkleAirdropDeployed, impersonatedNftHolder.address, amount);

        // Check if the user has claimed
        expect(await token.balanceOf(impersonatedNftHolder.address)).to.equal(amount);

    
    });
  });
});