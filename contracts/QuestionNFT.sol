// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QuestionNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    constructor() ERC721("QuestionNFT", "QNFT") Ownable(msg.sender) {
        _tokenIds = 0;
    }

    function mintNFT(address recipient, string memory metadataUri) public onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadataUri);
        return newItemId;
    }
}