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
  


  async function deployToken(){
    const ercToken = await hre.ethers.getContractFactory("MyToken");
    const token = await ercToken.deploy();
    return {token};
  }

  async function deployMerkleAirdrop(){
    const {token} = await loadFixture(deployToken);

    await helpers.impersonateAccount(nftHolder);
    

    const impersonatedNftHolder = await ethers.getSigner(nftHolder);
      const [owner, addr1] = await ethers.getSigners();
    
      const leaves = [
        [ impersonatedNftHolder.address,  ethers.parseUnits("31", 18) ],
        [addr1.address, ethers.parseEther("50") ],
      ];

      // const values = leaves.map(leaf => [leaf.address, leaf.amount.toString()]);
      const merkleTree = StandardMerkleTree.of(leaves, ["address", "uint256"]);
      const root = merkleTree.root;

      const merkleAirdrop =  await hre.ethers.getContractFactory("MerkleAirdrop");
      const merkleAirdropDeployed =  await merkleAirdrop.deploy(token, root);

      // Transfer tokens to merkleAirdropDeployed contract
      await token.transfer(merkleAirdropDeployed, 100000);
      return {merkleAirdropDeployed, token, merkleTree};
  }

  describe("Nft holder should claim", function(){
    it("should allow an eligible user with BAYC NFT to claim tokens", async() => {
      await helpers.impersonateAccount(nftHolder);
      await helpers.setBalance(nftHolder, ethers.parseEther("100"));

      const impersonatedNftHolder = await ethers.getSigner(nftHolder);
      const {merkleAirdropDeployed, token, merkleTree} = await loadFixture(deployMerkleAirdrop);

      const amount =  ethers.parseUnits("31", 18);
      const leaf = [impersonatedNftHolder.address, amount];
      const proof =  merkleTree.getProof(leaf);

      await token.transfer(merkleAirdropDeployed, amount); 

        await expect(merkleAirdropDeployed.connect(impersonatedNftHolder).claim(amount, proof))
            .to.emit(token, "Transfer")
            .withArgs(merkleAirdropDeployed, impersonatedNftHolder.address, amount);

        // Check if the user has claimed
        expect(await token.balanceOf(impersonatedNftHolder.address)).to.equal(amount);
    });

    it("should not allow ineligible user to claim BAYC NFT", async() =>{
       const {merkleAirdropDeployed, token, merkleTree} = await loadFixture(deployMerkleAirdrop);
       const[owner, addr1] = await ethers.getSigners();

      const amount =  ethers.parseUnits("50", 18);
      const leaf = [addr1.address, amount];
      const proof =  merkleTree.getProof(leaf);

      await token.transfer(merkleAirdropDeployed, amount); 

        // Check if the user has claimed
        expect(await token.balanceOf(addr1.address)).to.be.revertedWith("User does not hold any nft");
    });
  });
});