const web3 = require('web3');
const Common = require('@ethereumjs/common').default;
const { Transaction } = require('@ethereumjs/tx');

// SHIB contract
const contract = require('../../../utils/contract');
const { abi: CONTRACT_ABI, address: CONTRACT_ADDRESS } = contract;

// Infura HttpProvider Endpoint
const web3js = new web3(new web3.providers.HttpProvider("https://kovan.infura.io/v3/d6eb601abc614d0aa3177301e2131633"));

// Wallet
const FROM_ADDRESS = process.env.MM_PRIVATE_ADDRESS;
const FROM_KEY = Buffer.from(process.env.MM_PRIVATE_KEY, 'hex');

export default async function handler(req, res) {
  try {
    const { body: { address }, method } = req;
    if (method === "POST") {
      console.log('requestTokens.js | requesting to address', address);
      const contract = new web3js.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      let count;

      web3js.eth.getTransactionCount(FROM_ADDRESS).then(function (v) {
        console.log("Count: " + v);
        count = v;
        const amount = web3js.utils.toWei("1000000", "ether");

        const txParams = {
          nonce: web3js.utils.toHex(count),
          gasPrice: web3js.utils.toHex(20 * 1e9),
          gasLimit: web3js.utils.toHex(210000),
          to: CONTRACT_ADDRESS,
          value: '0x00',
          data: contract.methods.transfer(address, amount).encodeABI(),
        }

        const common = new Common({ chain: 'kovan' })
        const tx = Transaction.fromTxData(txParams, { common })


        const signedTx = tx.sign(FROM_KEY);

        const serializedTx = signedTx.serialize();

        web3js.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
          .on('transactionHash', console.log);

        contract.methods.balanceOf(FROM_ADDRESS).call()
          .then(function (balance) { console.log(balance) });

        res.status(200).json({ address: `Address ${address}`, success: true })
      })
    } else {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.log('requestTokens.js | handler error', error.message);
    res.status(500).json('There was an error while requesting your SHIB');
  }
}