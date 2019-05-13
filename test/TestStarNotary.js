const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;
var instance;

contract('StarNotary', (accs) => {
    accounts = accs;
    user1 = accounts[0];
    user2 = accounts[1];
});

before(async function(){
    instance = await StarNotary.deployed();
})

it('can Create a Star', async() => {
    let tokenId = 1;
    await instance.createStar('Awesome Star!', tokenId, {from: user1})

    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});

    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
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
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice: 0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);

    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let starId = 6;

    //1. Create a star
    await instance.createStar('Fancy Star', starId, {from: user1});

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let ContractName = await instance.name();
    let ContractSymbol = await instance.symbol();
    let starLookUp = await instance.lookUptokenIdToStarInfo(starId);

    assert.equal(ContractName, 'StarToken');
    assert.equal(ContractSymbol, 'STAR');
    assert.equal(starLookUp, 'Fancy Star');
});

it('lets 2 users exchange stars', async() => {
    let starId1 = 7;
    let starId2 = 8;

    // 1. Create 2 Stars
    await instance.createStar('The star 1', starId1, {from: user1});
    await instance.createStar('The star 2', starId2, {from: user2});

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId1, starId2);
    let star1Owner = await instance.ownerOf.call(starId1);
    let star2Owner = await instance.ownerOf.call(starId2);

    // 3. Verify that the owners changed
    assert.equal(star1Owner, user2);
    assert.equal(star2Owner, user1);
});

it('lets a user transfer a star', async() => {
    let starId = 9;

    // 1. create a Star
    await instance.createStar('Massive Star', starId, {from: user1});

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, starId);

    // 3. Verify the star owner changed.
    let starOwner = await instance.ownerOf.call(starId);

    assert.equal(starOwner, user2);
});
