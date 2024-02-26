const { forceImport } = require("@openzeppelin/hardhat-upgrades/dist/force-import");
const { ethers, upgrades } = require("hardhat");


async function main() {

    const CouponSystem = await ethers.getContractFactory('CouponSystem');

    console.log('Upgrading Coupon system...');
    await upgrades.upgradeProxy('0x9F5d46E892cdd86A815Bd9C345163551F4be5384', CouponSystem);
    console.log('Marketplace Coupon system');
}

main();