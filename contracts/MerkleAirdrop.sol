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
    address immutable baycAddress;
    address owner;
    uint256 totalTokensClaimed;


    constructor(address _tokenAddress, bytes32 _merkleRoot, address _baycAddress){
        require(_tokenAddress != address(0),"invalid address");
        require(_merkleRoot != bytes32(0),"invalid merkle root");

        tokenAddress = _tokenAddress;
        merkleRoot = _merkleRoot;
        owner = msg.sender;
        baycAddress = _baycAddress;
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


//Merkle Root: 0x580adec352f214cfe3b3512b0c7d41b24d4aa951f1af1ecc0ae0dc1faefe8b0b