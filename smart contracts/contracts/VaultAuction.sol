// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract VaultAuction is ReentrancyGuard {

   

    struct NFTItem {
        address nftAddress;
        uint256 tokenId;
    }

    struct Auction {
        address seller;
        uint256 currentBid;
        address highestBidder;
        uint256 endTime;
        bool active;
        bool ended;
    }

    struct Vault {
        NFTItem[] nfts;
        Auction auction;
    }

    

    uint256 public vaultCount;
    mapping(uint256 => Vault) public vaults;

   

    event VaultCreated(uint256 indexed vaultId, address indexed seller);
    event AuctionStarted(uint256 indexed vaultId, uint256 startPrice, uint256 endTime);
    event BidPlaced(uint256 indexed vaultId, address bidder, uint256 amount);
    event AuctionEnded(uint256 indexed vaultId, address winner, uint256 finalPrice);

   

    modifier onlySeller(uint256 vaultId) {
        require(msg.sender == vaults[vaultId].auction.seller, "Not vault seller");
        _;
    }

   

    function createVault(
        address[] calldata nftAddresses,
        uint256[] calldata tokenIds
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

        vaultCount++;

        emit VaultCreated(vaultId, msg.sender);
    }

   

    function startAuction(
        uint256 vaultId,
        uint256 startPrice,
        uint256 duration
    ) external onlySeller(vaultId) {
        Auction storage a = vaults[vaultId].auction;

        require(!a.active, "Auction already active");
        require(duration > 0, "Invalid duration");

        a.currentBid = startPrice;
        a.endTime = block.timestamp + duration;
        a.active = true;
        a.ended = false;

        emit AuctionStarted(vaultId, startPrice, a.endTime);
    }

   

    function bid(uint256 vaultId) external payable nonReentrant {
        Auction storage a = vaults[vaultId].auction;

        require(a.active, "Auction not active");
        require(block.timestamp < a.endTime, "Auction expired");

        require(msg.value == a.currentBid + 1, "Bid must be +1");

        /* 🔁 Refund previous bidder */
        if (a.highestBidder != address(0)) {
            payable(a.highestBidder).transfer(a.currentBid);
        }

        a.currentBid = msg.value;
        a.highestBidder = msg.sender;

        emit BidPlaced(vaultId, msg.sender, msg.value);
    }

    

    function endAuction(uint256 vaultId) external nonReentrant {
        Auction storage a = vaults[vaultId].auction;
        Vault storage v = vaults[vaultId];

        require(a.active, "Auction not active");
        require(block.timestamp >= a.endTime, "Auction still running");
        require(!a.ended, "Auction already ended");

        a.active = false;
        a.ended = true;

        /* 🎯 If bids exist */
        if (a.highestBidder != address(0)) {
            /* Transfer NFTs to winner */
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
            /* No bids → return NFTs to seller */
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

   

    function getVaultNFTs(uint256 vaultId) external view returns (NFTItem[] memory) {
        return vaults[vaultId].nfts;
    }

    function getAuction(uint256 vaultId) external view returns (Auction memory) {
        return vaults[vaultId].auction;
    }
}
