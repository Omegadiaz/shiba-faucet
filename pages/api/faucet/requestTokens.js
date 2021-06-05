import web3 from 'web3';
import Common from '@ethereumjs/common';
import { Transaction } from '@ethereumjs/tx';
import { connectToDatabase } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';
import contract from '../../../utils/contract';
import rateLimit from '../../../utils/rateLimit';
import { getSession } from 'next-auth/client'

// SHIB contract
const { abi: CONTRACT_ABI, address: CONTRACT_ADDRESS } = contract;

// Infura HttpProvider Endpoint
const web3js = new web3(new web3.providers.HttpProvider("https://kovan.infura.io/v3/d6eb601abc614d0aa3177301e2131633"));

// Wallet
const FROM_ADDRESS = process.env.MM_PRIVATE_ADDRESS;
const FROM_KEY = Buffer.from(process.env.MM_PRIVATE_KEY, 'hex');


// Requests to /api/faucet/requestTokens
export default async function handler(req, res) {
  try {
    // Express Rate Limit middleware to avoid many petitions from same IP
    await rateLimit(req, res);

    // Require each request to have a session;
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: "Please, authenticate" });
    }

    const { body: { address }, method } = req;
    if (method === "POST") {

      // Validate if address is sent
      if (!address) {
        return res.status(401).json({ message: "Address required" });
      }

      // Validate if address sent is valid
      if (!web3.utils.isAddress(address)) {
        return res.status(401).json({ message: "Invalid address" });
      }

      // Connect to MongoDB database
      const { db } = await connectToDatabase()

      // Get the latest fund of this addres
      const funds = await db
        .collection("funds")
        .find({ address })
        .sort({ created_at: -1 })
        .limit(1)
        .toArray();


      // Check if the user has already been given funds in the last 24 hours
      if (funds.length > 0) {
        const currentDate = new Date();
        const oneDay = 60 * 60 * 24;
        const createdAt = ObjectId(funds[0]._id).getTimestamp();
        if ((currentDate - createdAt) > oneDay) {
          return res.status(403).json({
            message: "Funds already given to address. Wait 24hrs"
          });
        }
      }

      await db.collection("funds").insertOne({ address, transactionHash: 'blabla' });
      return res.status(200).json({ funds, address, transactionHash: 'bkabka' });

      // Declaring the Contract
      const contract = new web3js.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);


      web3js.eth.getTransactionCount(FROM_ADDRESS)
        .then(function (v) {
          console.log("Count: " + v);
          const count = v;

          // Transfer 100m SHIB
          const amount = web3js.utils.toWei("1000000", "ether");

          // Declare Kovan Network
          const common = new Common({ chain: 'kovan' })

          // Declare transaction before signin
          const tx = Transaction.fromTxData({
            nonce: web3js.utils.toHex(count),
            gasPrice: web3js.utils.toHex(20 * 1e9),
            gasLimit: web3js.utils.toHex(210000),
            to: CONTRACT_ADDRESS,
            value: '0x00',
            data: contract.methods.transfer(address, amount).encodeABI(),
          }, { common })

          // Sign transaction
          const signedTx = tx.sign(FROM_KEY);

          // Send signed transaction to Blockchain
          web3js.eth.sendSignedTransaction('0x' + signedTx.serialize().toString('hex'))
            .on('transactionHash', function (transactionHash) {
              db.funds.insert({ address, transactionHash });
              res.status(200).json({ address, transactionHash });
            });

          // Get faucet balance
          contract.methods.balanceOf(FROM_ADDRESS).call()
            .then(function (balance) {
              console.log('requestTokens.js | New balance', balance);
            });

        });
    } else {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.log('requestTokens.js | handler error', error.message);
    res.status(500).json({
      message: process.env.NODE_ENV === "production"
        ? "There was an error while requesting your SHIB"
        : error.message
    });
  }
}