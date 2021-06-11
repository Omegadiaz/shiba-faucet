import web3 from 'web3';
import Common from '@ethereumjs/common';
import { Transaction } from '@ethereumjs/tx';
import contract from '../../../utils/contract';
import rateLimit from '../../../utils/rateLimit';
import tokenAddress from '../../../utils/tokenAddress';

// SHIB contract
const { abi: CONTRACT_ABI, address: CONTRACT_ADDRESS } = contract;

// Wallet
const FROM_ADDRESS = process.env.MM_PRIVATE_ADDRESS;
const FROM_KEY = Buffer.from(process.env.MM_PRIVATE_KEY, 'hex');

// Requests to /api/faucet/requestTokens
export default async function handler(req, res) {
  try {
    // Express Rate Limit middleware to avoid many petitions from same IP
    await rateLimit(req, res);

    const { body: { address, network }, method } = req;
    if(method !== "POST"){
      return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }

    // Validate if netowrk is sent
    if (["ropsten", "kovan", "rinkeby"].indexOf(network) === -1) {
      return res.status(401).json({ message: "Invalid network" });
    }
    // Validate if address is sent
    if (!address) {
      return res.status(401).json({ message: "Address required" });
    }

    // Validate if address sent is valid
    if (!web3.utils.isAddress(address)) {
      return res.status(401).json({ message: "Invalid address" });
    }

    // Get the latest fund of this address
    const apiRes = await fetch(`https://api-${network}.etherscan.io/api?module=account&action=tokentx&contractaddress=${tokenAddress[network]}&address=${address}&page=1&offset=100&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`)
    
    if (!apiRes.ok) {// Check if fetch failed
      const errorResData = await apiRes.json();
      console.log('requestTokens.js | Error Etherscan Api', errorResData.message);
      throw new Error(errorResData.message);
    }
    
    const data = await apiRes.json();
    if(!Array.isArray(data.result)){ // Check if fetch response has valid information
      return res.status(400).json({
        message: data.message
      });
    }

    // Check if the user has already been given funds in the last 24 hours
    if (data.result.length > 0) {
      const currentDate = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      const createdAt = data.result[0].timeStamp * 1000;

      // At least 24 has passed since the latests transaction of this address
      if ((currentDate - createdAt) <= oneDay) {
        return res.status(403).json({
          message: "Funds already given to address. Wait 24 hours to request SHIB"
        });
      }
    }
    
    // Infura HttpProvider Endpoint
    const web3js = new web3(new web3.providers.HttpProvider(`https://${network}.infura.io/v3/${process.env.INFURA_KEY}`));
    
    // Declaring the Contract
    const contract = new web3js.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS[network]);


    web3js.eth.getTransactionCount(FROM_ADDRESS)
      .then(function (v) {
        // console.log("Count: " + v);
        const count = v;

        // Transfer 100m SHIB
        const amount = web3js.utils.toWei("1000000", "ether");

        // Declare Testnet
        const common = new Common({ chain: network });

        // Declare transaction before signin
        const tx = Transaction.fromTxData({
          nonce: web3js.utils.toHex(count),
          gasPrice: web3js.utils.toHex(20 * 1e9),
          gasLimit: web3js.utils.toHex(210000),
          to: CONTRACT_ADDRESS[network],
          value: '0x00',
          data: contract.methods.transfer(address, amount).encodeABI(),
        }, { common });

        // Sign transaction
        const signedTx = tx.sign(FROM_KEY);

        // Send signed transaction to Blockchain
        web3js.eth.sendSignedTransaction('0x' + signedTx.serialize().toString('hex'))
          .on('transactionHash', function (transactionHash) {
            res.status(200).json({ address, transactionHash });
          });

      });
  } catch (error) {
    console.log('requestTokens.js | handler error', error.message);
    res.status(500).json({
      message: process.env.NODE_ENV === "production"
        ? "There was an error while requesting your SHIB"
        : error.message
    });
  }
}