// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VaultAuction
 * @notice Blind vault-based NFT auction protocol
 */
contract VaultAuction is ReentrancyGuard {

    /**
     * @notice Represents a single NFT inside a vault
     */
    struct NFTItem {
        address nftAddress;
        uint256 tokenId;
    }

    /**
     * @notice Auction state and bidding information
     */
    struct Auction {
        address seller;
        uint256 currentBid;
        address highestBidder;
        uint256 endTime;
        bool active;
        bool ended;
        uint256 startPrice;
    }

    /**
     * @notice Vault containing NFTs and its associated auction
     */
    struct Vault {
        NFTItem[] nfts;
        Auction auction;
        string name;
        string description;
    }

    uint256 public vaultCount;
    mapping(uint256 => Vault) public vaults;

    /// @notice List of all vaultIds that have started auctions
    uint256[] public auctionIds;

    event VaultCreated(uint256 indexed vaultId, address indexed seller);
    event AuctionStarted(uint256 indexed vaultId, uint256 startPrice, uint256 endTime);
    event BidPlaced(uint256 indexed vaultId, address bidder, uint256 amount);
    event AuctionEnded(uint256 indexed vaultId, address winner, uint256 finalPrice);

    /**
     * @notice Restricts function access to the vault creator
     */
    modifier onlySeller(uint256 vaultId) {
        require(msg.sender == vaults[vaultId].auction.seller, "Not vault seller");
        _;
    }

    /**
     * @notice Creates a vault by depositing NFTs and setting metadata
     */
    function createVault(
        address[] calldata nftAddresses,
        uint256[] calldata tokenIds,
        string calldata name,
        string calldata description
    ) external {
        require(nftAddresses.length == tokenIds.length, "Length mismatch");
        require(nftAddresses.length > 0, "Empty vault");

        uint256 vaultId = vaultCount;
        Vault storage v = vaults[vaultId];

        for (uint256 i = 0; i < nftAddresses.length; i++) {
            IERC721(nftAddresses[i]).transferFrom(
                msg.sender,
                address(this),
                tokenIds[i]
            );

            v.nfts.push(
                NFTItem({
                    nftAddress: nftAddresses[i],
                    tokenId: tokenIds[i]
                })
            );
        }

        v.auction.seller = msg.sender;
        v.name = name;
        v.description = description;

        vaultCount++;

        emit VaultCreated(vaultId, msg.sender);
    }

    /**
     * @notice Starts an auction for a vault with a minimum price and duration
     */
    function startAuction(
        uint256 vaultId,
        uint256 startPrice,
        uint256 duration
    ) external onlySeller(vaultId) {
        Auction storage a = vaults[vaultId].auction;

        require(!a.active, "Auction already active");
        require(duration > 0, "Invalid duration");

        a.currentBid = startPrice;
        a.startPrice = startPrice;
        a.endTime = block.timestamp + duration;
        a.active = true;
        a.ended = false;

        auctionIds.push(vaultId);

        emit AuctionStarted(vaultId, startPrice, a.endTime);
    }

    /**
     * @notice Places a bid that must be exactly +1 over the current bid
     */
    function bid(uint256 vaultId) external payable nonReentrant {
        Auction storage a = vaults[vaultId].auction;

        require(a.active, "Auction not active");
        require(block.timestamp < a.endTime, "Auction expired");
        require(msg.value == a.currentBid + 1, "Bid must be +1");

        if (a.highestBidder != address(0)) {
            payable(a.highestBidder).transfer(a.currentBid);
        }

        a.currentBid = msg.value;
        a.highestBidder = msg.sender;

        emit BidPlaced(vaultId, msg.sender, msg.value);
    }

    /**
     * @notice Ends an auction and transfers NFTs and funds accordingly
     */
    function endAuction(uint256 vaultId) external nonReentrant {
        Auction storage a = vaults[vaultId].auction;
        Vault storage v = vaults[vaultId];

        require(a.active, "Auction not active");
        require(block.timestamp >= a.endTime, "Auction still running");
        require(!a.ended, "Auction already ended");

        a.active = false;
        a.ended = true;

        if (a.highestBidder != address(0)) {
            for (uint256 i = 0; i < v.nfts.length; i++) {
                IERC721(v.nfts[i].nftAddress).transferFrom(
                    address(this),
                    a.highestBidder,
                    v.nfts[i].tokenId
                );
            }

            payable(a.seller).transfer(a.currentBid);
            emit AuctionEnded(vaultId, a.highestBidder, a.currentBid);
        } else {
            for (uint256 i = 0; i < v.nfts.length; i++) {
                IERC721(v.nfts[i].nftAddress).transferFrom(
                    address(this),
                    a.seller,
                    v.nfts[i].tokenId
                );
            }

            emit AuctionEnded(vaultId, address(0), 0);
        }
    }

    /**
     * @notice Returns all NFTs stored inside a vault
     */
    function getVaultNFTs(uint256 vaultId)
        external
        view
        returns (NFTItem[] memory)
    {
        return vaults[vaultId].nfts;
    }

    /**
     * @notice Returns full auction data for a vault
     */
    function getAuction(uint256 vaultId)
        external
        view
        returns (Auction memory)
    {
        return vaults[vaultId].auction;
    }

    /**
     * @notice Returns all vaultIds that have auctions
     */
    function getAllAuctions()
        external
        view
        returns (uint256[] memory)
    {
        return auctionIds;
    }

    /**
     * @notice Returns minimal auction data for rendering auction cards
     */
    function getAuctionCard(uint256 vaultId)
        external
        view
        returns (
            string memory name,
            string memory description,
            bool isLive,
            bool isEnded,
            uint256 timeRemaining,
            uint256 minimumPrice
        )
    {
        Vault storage v = vaults[vaultId];
        Auction storage a = v.auction;

        return (
            v.name,
            v.description,
            a.active,
            a.ended,
            block.timestamp >= a.endTime ? 0 : a.endTime - block.timestamp,
            a.startPrice
        );
    }
    
/**
 * @notice Returns full vault details including NFTs and auction info
 */
function getVaultWithAuction(uint256 vaultId)
    external
    view
    returns (
        string memory name,
        string memory description,
        NFTItem[] memory nfts,
        address seller,
        uint256 currentBid,
        address highestBidder,
        uint256 endTime,
        bool active,
        bool ended,
        uint256 startPrice
    )
{
    Vault storage v = vaults[vaultId];
    Auction storage a = v.auction;

    return (
        v.name,
        v.description,
        v.nfts,
        a.seller,
        a.currentBid,
        a.highestBidder,
        a.endTime,
        a.active,
        a.ended,
        a.startPrice
    );
}
}
