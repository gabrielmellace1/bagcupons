# Blockchain-Based Coupon System

## Overview

This blockchain-based system enables the creation and redemption of coupons for USDT credit incentives, leveraging blockchain technology for secure and transparent transactions. It's designed for peer-to-peer incentive mechanisms within the Ethereum blockchain, focusing on event generation and tracking rather than direct USDT transfers upon coupon redemption.

## Features

- **Coupon Creation:** Users can generate coupons with specific USDT values, transferring the value to a treasury wallet securely.
- **Redemption Events:** Redeeming a coupon generates a blockchain event, logged and indexed for transparency, without direct USDT transfer.
- **Subgraph Integration:** Utilizes The Graph protocol to index redemption events, facilitating real-time monitoring and querying.

## Use Cases

This system is particularly useful for applications and games looking to incorporate a secure and transparent mechanism for awarding users with credits or incentives based on blockchain event data.

## Technical Details

- **Smart Contracts:** Built with Solidity, using EIP712 for secure interactions and the ERC20 token standard for USDT transactions.
- **Data Indexing:** Employs a custom subgraph on The Graph protocol for efficient event tracking and analytics.

