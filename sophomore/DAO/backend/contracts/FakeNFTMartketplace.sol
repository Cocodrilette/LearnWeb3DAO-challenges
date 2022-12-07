// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract FakeNFTMarketplace {
    /// @dev Maintain a mapping of Fake TokenID to Owner address
    mapping(uint256 => address) public tokens;
    /// @dev Set the purchase price for each Fake NFT
    uint256 private nftPrice = 0.0001 ether;

    /// @dev purcahse() accepts ETH and marks the owner of  of the given
    /// tokenId as the caller address.
    /// @param _tokenId - the fake NFT token Id to pruchase
    function purchase(uint256 _tokenId) external payable {
        require(msg.value == nftPrice, "This NFT cost 0.0001 ether.");
        tokens[_tokenId] = msg.sender;
    }

    /// @dev getPrice() returns the price of one NFT
    function getPrice() external view returns (uint256) {
        return nftPrice;
    }

    /// @dev available() checks whether the given tokenId has been
    /// sold or not.
    /// @param _tokenId - the tokenId to check for
    function available(uint256 _tokenId) external view returns (bool) {
        if (tokens[_tokenId] == address(0)) {
            return true;
        }
        return false;
    }
}
