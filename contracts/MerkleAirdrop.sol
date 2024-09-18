// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract MerkleAirdrop{
    bytes32 immutable merkleRoot;
    address immutable tokenAddress;
    address immutable baycAddress = 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D;
    address owner;
    uint256 totalTokensClaimed;


    constructor(address _tokenAddress, bytes32 _merkleRoot){
        require(_tokenAddress != address(0),"invalid address");
        require(_merkleRoot != bytes32(0),"invalid merkle root");

        tokenAddress = _tokenAddress;
        merkleRoot = _merkleRoot;
        owner = msg.sender;
    }

    mapping(address => bool) isClaimed;

    modifier onlyOwner{
        require(owner == msg.sender);
        _;    
    }

    function claim(uint amount, bytes32[] calldata merkleProof) external {
        require(!isClaimed[msg.sender], "User has already claimed");
        require(IERC721(baycAddress).balanceOf(msg.sender) > 0, "User does not hold any nft");
         bytes32 node = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, amount))));

        bool isValidProof = MerkleProof.verify(merkleProof, merkleRoot, node);

        require(isValidProof, "Merkle proof is invalid");

        isClaimed[msg.sender] = true;

        IERC20(tokenAddress).transfer(msg.sender, amount);
    }
}


//Merkle Root:0x864f709297936d3a5f6e24908eb9ef37bdadfec10d455ebb2a3ead3260c9064f