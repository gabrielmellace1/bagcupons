import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

pragma solidity ^0.8.7;

contract EIP712BaseUpgradeable is Initializable {
    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    bytes32 internal constant EIP712_DOMAIN_TYPEHASH =
        keccak256(
            bytes(
                "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
            )
        );
    bytes32 internal domainSeperator;

    function __EIP712Base_init(
        string memory name,
        string memory version
    ) internal onlyInitializing {
        __EIP712Base_init_unchained(name, version);
    }

    function __EIP712Base_init_unchained(
        string memory name,
        string memory version
    ) internal onlyInitializing {
        domainSeperator = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                getChainID(),
                address(this)
            )
        );
    }

    function getChainID() internal pure returns (uint256 id) {
        assembly {
            id := 1 // set to Goerli for now, Mainnet later
        }
    }

    function getDomainSeperator() private view returns (bytes32) {
        return domainSeperator;
    }

    /**
     * Accept message hash and returns hash message in EIP712 compatible form
     * So that it can be used to recover signer from signature signed using EIP712 formatted data
     * https://eips.ethereum.org/EIPS/eip-712
     * "\\x19" makes the encoding deterministic
     * "\\x01" is the version byte to make it compatible to EIP-191
     */
    function toTypedMessageHash(
        bytes32 messageHash
    ) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19\x01", getDomainSeperator(), messageHash)
            );
    }
}
