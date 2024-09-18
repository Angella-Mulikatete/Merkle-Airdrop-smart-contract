import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
// import keccak256 from "keccak256";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { Contract, ContractFactory } from "ethers";
// import { ethers } from "ethers";
let ethers = require('./node_modules/ethers');

describe("Airdrop", function(){
    async function deployToken(){
        const [owner, addr1] = 
    }
});