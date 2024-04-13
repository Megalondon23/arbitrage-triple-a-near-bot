const express = require('express');
const app = express();
const port = 3000;

// Job status variable
let jobStatus = 'Idle';


// supported blockchain
let supportedBlockchain = ['ETH', 'ARB', "OPT"];
// supported pairs; only USDT/ETH for now
let supportedPairs = ['USDT/ETH'];


// Simulate a background job running every second
setInterval(() => {
    jobStatus = 'Running';
    // Simulated job logic
    const result = new Date().toISOString(); // Replace with actual logic
    console.log('Job result at:', result);
    jobStatus = 'Idle';
    findCryptoArbitrage();
}, 1000);

function findArbitrageForPair(pair) {
    // find biggest price difference for given pair between blockchains and return it
    // the idea to buy from one blockchain and sell to another blockchain
    // for example, buy ETH from blockchain A and sell it to blockchain B
    // and make a profit


}

function findCryptoArbitrage() {
    // for each supported pair
    for (let i = 0; i < supportedPairs.length; i++) {
        let pair = supportedPairs[i];
        arbitrage = findArbitrageForPair(pair);
        if (arbitrage == null || arbitrage.priceDiff < 1.0) {
            // skip arbitrage
            continue;
        }

        tradeRoute = findTradeRoute(arbitrage);

        gasPrice = getGasPrice(tradeRoute);

        if (gasPrice > arbitrage.priceDiff) {
            // skip arbitrage
            continue;
        }

        // execute trade
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
