import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyTokenModule = buildModule("MyTokenModule", (m) => {

    const token = m.contract("MyToken");

    return { token };
});

export default MyTokenModule;
