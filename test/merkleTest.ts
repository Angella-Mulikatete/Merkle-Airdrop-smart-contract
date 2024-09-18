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
import { ethers } from "hardhat";
// import { generateProofs } from "../";


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

    await helpers.impersonateAccount(nftHolder);
      const impersonatedNftHolder = await ethers.getSigner(nftHolder);
      const [owner, addr1] = await ethers.getSigners();
    
      const leaves = [
        [ impersonatedNftHolder.address,  ethers.parseEther("100") ],
        [addr1.address, ethers.parseEther("50") ],
      ];

      // const values = leaves.map(leaf => [leaf.address, leaf.amount.toString()]);
      const merkleTree = StandardMerkleTree.of(leaves, ["address", "uint256"]);

     // Transfer tokens to merkleAirdropDeployed contract
    await token.transfer(merkleAirdropDeployed, 100000);
    return {merkleAirdropDeployed, token, merkleTree};
  }

  describe("Nft holder should claim", function(){


    it("should allow an eligible user with BAYC NFT to claim tokens", async() => {
      await helpers.impersonateAccount(nftHolder);
      const impersonatedNftHolder = await ethers.getSigner(nftHolder);
      const {merkleAirdropDeployed, token, merkleTree} = await loadFixture(deployMerkleAirdrop);

      const amount =  ethers.parseEther("100");
      const proof = await merkleTree.getProof(0);
      // const proof = proofs[impersonatedNftHolder.address];

      await token.transfer(merkleAirdropDeployed, amount); // Fund the airdrop contract

        await expect(merkleAirdropDeployed.connect(impersonatedNftHolder).claim(amount, proof))
            .to.emit(token, "Transfer")
            .withArgs(merkleAirdropDeployed, impersonatedNftHolder.address, amount);

        // Check if the user has claimed
        expect(await token.balanceOf(impersonatedNftHolder.address)).to.equal(amount);

    
    });
  });
});