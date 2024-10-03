import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {

    const token = "0x19f166eC11E6CCdc52C76c7DFB82851e227C4691";
    const root = "0x580adec352f214cfe3b3512b0c7d41b24d4aa951f1af1ecc0ae0dc1faefe8b0b"

    const merkle = m.contract("MerkleAirdrop", [token, root]);

    return { merkle };
});

export default MerkleAirdropModule;
