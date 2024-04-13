const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Job status variable
let jobStatus = 'Idle';

// supported blockchains
let supportedBlockchain = ['ETH', 'ARB', "OPT"];
// supported pairs; only USDT/ETH for now
let supportedPairs = ['USDT/ETH'];


// Simulate a background job running every second
setInterval(async () => {
    jobStatus = 'Running';
    await findCryptoArbitrage();
    jobStatus = 'Idle';
}, 1000);

async function findArbitrageForPair(pair) {
    // find biggest price difference for given pair between blockchains and return it
    const prices = await Promise.all(supportedBlockchain.map(getPriceForBlockchain));
    console.log("Prices", prices);

    let maxPriceDiff = 0;
    let bestArbitrage = null;

    // Compare prices between blockchains
    for (let i = 0; i < prices.length; i++) {
        for (let j = 0; j < prices.length; j++) {
            if (i !== j) {
                // is price is empty, skip
                if (prices[i] === undefined || prices[j] === undefined) {
                    console.log("Price is empty", prices[i], prices[j]);
                    continue;
                }

                const priceDiff = Math.abs(prices[i].price - prices[j].price);
                if (priceDiff > maxPriceDiff) {
                    maxPriceDiff = priceDiff;
                    bestArbitrage = {
                        buyFrom: prices[j].blockchain,
                        sellTo: prices[i].blockchain,
                        priceDiff
                    };
                }
            }
        }
    }

    return bestArbitrage;
}

async function getPriceForBlockchain(blockchain) {
    // ETH
    if (blockchain === 'ETH') {
        url = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'

        // Get the price of ETH/USDT pair
        const response = await axios.post(url, {
            query: `
            { bundle(id: "1") {  ethPrice } }
            `
        });
        // console.log("ETH", response.data);
        // { data: { bundle: { ethPrice: '2929.54718953714228276282878888858' } } }
        price = parseFloat(response.data.data.bundle.ethPrice);
        return { blockchain, price };
    }
    if (blockchain === 'OPT') {
        url = 'https://api.thegraph.com/subgraphs/name/katori216/sushiswap-v3-optimism'

        const response = await axios.post(url, {
            query: `
            {
                bundles(where: {id: "1"}) {
                  id
                  ethPriceUSD
                }
              }
            `
        });
        // console.log("OPT", JSON.stringify(response.data));
        // {"data":{"bundles":[{"id":"1","ethPriceUSD":"0.0003396683508418388495818855817590162"}]}}
        price = parseFloat(response.data.data.bundles[0].ethPriceUSD);
        price = 1 / price;
        return { blockchain, price };
    }

    // if (blockchain === 'ARB') {
    //     url = 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap02'

    //     const response = await axios.post(url, {
    //         query: `
    //         {
    //             bundles(where: {id: "1"}) {
    //               id
    //               ethPriceUSD
    //             }
    //           }
    //         `
    //     });
}


function findTradeRoute(arbitrage) {
    // Determine the optimal route for the trade
    return {
        buyBlockchain: arbitrage.buyFrom,
        sellBlockchain: arbitrage.sellTo,
        priceDifference: arbitrage.priceDiff
    };
}

function getGasPrice(tradeRoute) {
    // Stub function for getting gas prices
    return 0.5; // Replace this with dynamic calculation based on current network conditions
}

function executeTrade(tradeRoute) {
    // Stub function to execute the trade
    console.log(`Executing trade: Buy on ${tradeRoute.buyBlockchain}, Sell on ${tradeRoute.sellBlockchain}`);
}

async function findCryptoArbitrage() {
    // for each supported pair
    for (let i = 0; i < supportedPairs.length; i++) {
        let pair = supportedPairs[i];
        let arbitrage = await findArbitrageForPair(pair);
        if (!arbitrage || arbitrage.priceDiff < 1.0) {
            continue;
        }

        let tradeRoute = findTradeRoute(arbitrage);
        let gasPrice = getGasPrice(tradeRoute);

        if (gasPrice > arbitrage.priceDiff) {
            continue;
        }

        executeTrade(tradeRoute);
    }
}

// API to get the job status
app.get('/status', (req, res) => {
    res.json({ status: jobStatus });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
