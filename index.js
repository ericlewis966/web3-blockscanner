'use strict'

const ethers = require('ethers');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

const { RPC_URL_HTTP_ENDPOINT } = require('./config');
const ERC721 = require('./abi/ERC721.json');

//define & initizlize ethers project
const provider = new ethers.providers.JsonRpcProvider(RPC_URL_HTTP_ENDPOINT);

//define data items
var collectedAddresses = [], startBlock, lastBlock;

/**
 * @description input the number of start block
 */
const initApp = async () => {
    readline.question("Please input block number: ", async (blockNumber) => {

        startBlock = blockNumber;
        lastBlock = await provider.getBlockNumber();

        await mainProcess(startBlock, lastBlock);
    })
}


/**
 * 
 * @param {String} startBlock 
 * @param {String} lastBlock
 * @description get blocks between two block numbers from parameter and 
 * get ERC721 creation transactions for each block 
 */
const mainProcess = async (startBlock, lastBlock) => {

    console.log("\nSearching...");

    let block;
    for (let i = startBlock; i <= lastBlock; i++) {

        try {
            block = await provider.getBlockWithTransactions(Number(i));
            console.log(`Block ${i}_>`);
        } catch (err) {
            continue;
        }

        for await (const transaction of block.transactions) {

            if (transaction?.creates !== null) {

                try {
                    const contract = new ethers.Contract(transaction?.creates, ERC721.abi, provider);
                    await contract.name();
                    collectedAddresses.push(transaction?.creates);
                } catch (err) {
                    continue;
                }
            }
        }

        if (collectedAddresses.length > 0) {
            console.log(`For block ${i}: `, collectedAddresses);
            collectedAddresses = [];
            console.log("\nSearching...");
        }
    }
    readline.close();
}

initApp();