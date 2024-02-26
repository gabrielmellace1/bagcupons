import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import { CouponCreated, CouponRedeemed } from "../generated/CouponSystem/CouponSystem";
import { Coupon, CouponRedemption, LatestRedemptionId } from "../generated/schema";


export function handleCouponCreated(event: CouponCreated): void {
    let coupon = new Coupon(event.params.couponHash.toHexString());
    coupon.couponHash = event.params.couponHash.toHexString();
    coupon.value = event.params.value;
    coupon.redeemed = false;
    coupon.createdAt = event.block.timestamp;
    coupon.createdBy = event.params.creator.toHexString();
    coupon.createdHash = event.transaction.hash.toHexString();

    coupon.save();
  }

  export function handleCouponRedeemed(event: CouponRedeemed): void {
    let couponHash = event.params.couponHash.toHexString();
    let coupon = Coupon.load(couponHash);
    let redeemer = event.params.redeemer.toHexString();

    if (coupon !== null) {
      coupon.redeemed = true;
      coupon.redeemedBy = redeemer;
      coupon.save();

      let latestRedemptionId = LatestRedemptionId.load("latest");

      if (latestRedemptionId == null) {
        latestRedemptionId = new LatestRedemptionId("latest");
        latestRedemptionId.value = 0;
      }
      else {
        latestRedemptionId.value = latestRedemptionId.value +1;
      }
      latestRedemptionId.save();
  
      let redemption = new CouponRedemption(
        event.transaction.hash.toHexString() + "-" + latestRedemptionId.value.toString()
      );
      redemption.redemptionId = latestRedemptionId.value;
      redemption.coupon = coupon.id;
      redemption.valueRedeemed = event.params.value;
      redemption.redeemedAt = event.block.timestamp;
      redemption.redeemedBy = redeemer;
      redemption.redeemedHash = event.transaction.hash.toHexString();
      redemption.save();
    } else {
      log.warning("Coupon not found for hash: {}", [couponHash]);
    }
  }