// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./helpers/EIP712MetaTransactionUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract CouponSystem is  EIP712MetaTransactionUpgradeable {
   
    address public treasuryWallet;
    IERC20 public usdtToken;

    struct Coupon {
        bool valid;
        bool redeemed;
        uint256 value;
    }

    mapping(bytes32 => Coupon) private coupons;

    event CouponRedeemed(address redeemer, bytes32 couponHash, uint256 value);
    event CouponCreated(address creator,bytes32 couponHash, uint256 value);

    function initialize() public initializer {
        __EIP712Base_init("BagCupons", "v1.0");

        treasuryWallet = 0xEA5Fed1D0141F14DE11249577921b08783d6A360;
        usdtToken = IERC20(0xc2132D05D31c914a87C6611C10748AEb04B58e8F);
    }

   
    function createSingleCoupon(bytes32 couponHash, uint256 value) public  {

         address sender = msgSender();
         
        require(!coupons[couponHash].valid, "Coupon already exists.");
        require(usdtToken.transferFrom(sender, treasuryWallet, value), "USDT transfer failed");

        coupons[couponHash] = Coupon({
            valid: true,
            redeemed: false,
            value: value
        });

        emit CouponCreated(sender,couponHash, value);
    }

  
    function createMultipleCoupons(bytes32[] memory couponHashes, uint256[] memory values) public {

    address sender = msgSender();

    require(couponHashes.length == values.length, "Hashes and values length mismatch");

    uint256 totalValue = 0;
    for (uint i = 0; i < values.length; i++) {
        require(!coupons[couponHashes[i]].valid, "One or more coupons already exist.");
        totalValue += values[i];
    }

    require(usdtToken.transferFrom(sender, treasuryWallet, totalValue), "USDT transfer failed");

    for (uint i = 0; i < couponHashes.length; i++) {
        coupons[couponHashes[i]] = Coupon({
            valid: true,
            redeemed: false,
            value: values[i]
        });

        emit CouponCreated(sender,couponHashes[i], values[i]);
    }
}


 
    function redeemCoupon(string memory couponCode) public {
        bytes32 couponHash = keccak256(abi.encodePacked(couponCode));
        require(coupons[couponHash].valid, "Invalid coupon.");
        require(!coupons[couponHash].redeemed, "Coupon already redeemed.");
        
        coupons[couponHash].redeemed = true;
        uint256 amount = coupons[couponHash].value;
       

        emit CouponRedeemed(msgSender(), couponHash, amount);
    }

 
    function isCouponValidAndNotRedeemed(string memory couponCode) public view returns (bool isValid, bool isRedeemed, uint256 value) {
        bytes32 couponHash = keccak256(abi.encodePacked(couponCode));
        Coupon memory coupon = coupons[couponHash];
        return (coupon.valid, coupon.redeemed, coupon.value);
    }

    
}
