const { ethers, upgrades } = require("hardhat");


async function main () {



    const CouponSystem = await ethers.getContractFactory('CouponSystem') ;
    console.log("Deploying CouponSystem");
    const couponSystem = await upgrades.deployProxy(CouponSystem, [], { initializer: "initialize" });
    await couponSystem.deployed();
    console.log('CouponSystem deployed to address:', couponSystem.address);
}

main();