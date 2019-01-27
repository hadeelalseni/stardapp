const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
  });

it('adds the token name and token symbol properly', async() => {
    let instance = await StarNotary.deployed();
    let name = await instance.getName();
    let symbol = await instance.getSymbol();
    assert.equal(name, "Hadeel Token");
    assert.equal(symbol, "HT");

}); 
it('two users can exchange their stars', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let star1Id = 6;
    let star2Id = 7;
    await instance.createStar('Star from user1 to user2.', star1Id,{from: user1});
    await instance.createStar('Star from user2 to user1.', star2Id, {from: user2});
    await instance.exchangeStars(user1, user2, star1Id, star2Id);
    let ownerOfStar1 = await instance.ownerOf(star1Id);
    let ownerOfStar2 = await instance.ownerOf(star2Id);
    assert.equal(ownerOfStar1, user2);
    assert.equal(ownerOfStar2, user1);

});
it('Stars Tokens can be transferred from one address to another', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    //Dear Reviwer, Here if I change the user1 to another user (except the onwer), 
    //the test fails, and gives me this error: 
    // Error: Returned error: VM Exception while processing transaction: revert
    // and I see that only the owner can call this function, I have confused; 
    // because I thought this function is not much differ from the exchangeStars function.
    // please, could you help me and explain me what the differance. 
    let user2 = accounts[2];
    let star1Id = 8;
    await instance.createStar('Star from user1 to user2.', star1Id,{from: user1});
    await instance.transferStar(user2, star1Id);
    let ownerOfStar1 = await instance.ownerOf(star1Id);
    assert.equal(ownerOfStar1, user2);

});