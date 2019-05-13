const StarNotary = artifacts.require("StarNotary");

let instance;
let tokenId1;
let tokenId2;

contract('StarNotary', (accs) => {
    accounts = accs;
    user1 = accounts[0];
    user2 = accounts[1];
});

before(async function(){
    instance = await StarNotary.deployed();
})

it('can Create a Star', async() => {
    tokenId1 = 1;
    await instance.createStar('Awesome Star!', tokenId1, {from: user1})

    assert.equal(await instance.tokenIdToStarInfo.call(tokenId1), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    tokenId1 = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', tokenId1, {from: user1});
    await instance.putStarUpForSale(tokenId1, starPrice, {from: user1});

    assert.equal(await instance.starsForSale.call(tokenId1), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    tokenId1 = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', tokenId1, {from: user1});
    await instance.putStarUpForSale(tokenId1, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(tokenId1, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);

    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    tokenId1 = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', tokenId1, {from: user1});
    await instance.putStarUpForSale(tokenId1, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(tokenId1, {from: user2, value: balance});

    assert.equal(await instance.ownerOf.call(tokenId1), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    tokenId1 = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('awesome star', tokenId1, {from: user1});
    await instance.putStarUpForSale(tokenId1, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(tokenId1, {from: user2, value: balance, gasPrice: 0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);

    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    tokenId1 = 6;

    //1. Create a star
    await instance.createStar('Fancy Star', tokenId1, {from: user1});

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let ContractName = await instance.name();
    let ContractSymbol = await instance.symbol();
    let starLookUp = await instance.lookUptokenIdToStarInfo(tokenId1);

    assert.equal(ContractName, 'StarToken');
    assert.equal(ContractSymbol, 'STAR');
    assert.equal(starLookUp, 'Fancy Star');
});

it('lets 2 users exchange stars', async() => {
    tokenId1 = 7;
    tokenId2 = 8;

    // 1. Create 2 Stars
    await instance.createStar('The star 1', tokenId1, {from: user1});
    await instance.createStar('The star 2', tokenId2, {from: user2});

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2);
    let star1Owner = await instance.ownerOf.call(tokenId1);
    let star2Owner = await instance.ownerOf.call(tokenId2);

    // 3. Verify that the owners changed
    assert.equal(star1Owner, user2);
    assert.equal(star2Owner, user1);
});

it('lets a user transfer a star', async() => {
    tokenId1 = 9;

    // 1. create a Star
    await instance.createStar('Massive Star', tokenId1, {from: user1});

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, tokenId1);

    // 3. Verify the star owner changed.
    let starOwner = await instance.ownerOf.call(tokenId1);

    assert.equal(starOwner, user2);
});
