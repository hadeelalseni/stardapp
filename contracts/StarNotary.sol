pragma solidity >=0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    string public tName;
    string public symbol;

    struct Star {
        string name;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    constructor() public {
        tName = "Hadeel Token";
        symbol = "HT";

    }
    function getName()public view returns(string memory){
        return tName;
    }
    function getSymbol()public view returns(string memory){
        return symbol;
    }
    //a function lookUptokenIdToStarInfo, that looks up the stars using the Token ID, and then returns the name of the star.
    function lookUptokenIdToStarInfo(uint256 _tokenId) public view returns (string memory starName){
        Star memory requiredStar = tokenIdToStarInfo[_tokenId];
        return requiredStar.name;
    }
    //a function called exchangeStars, so 2 users can exchange their star tokens. No care of price
    function exchangeStars(address user1, address user2, uint256 _tokenIdUser1, uint256 _tokenIdUser2)public{
        _transferFrom(user1, user2, _tokenIdUser1);
        _transferFrom(user2, user1, _tokenIdUser2);

    }
    //a function to Transfer a Star. The function should transfer a star from the address of the caller.
    //The function should accept 2 arguments, the address to transfer the star to, and the token ID of the star.
    function transferStar(address to, uint256 _tokenId)public{
        require(ownerOf(_tokenId) == msg.sender, "You can't transfer the Star you don't owned");
        _transferFrom(msg.sender, to, _tokenId);

    }


    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

}