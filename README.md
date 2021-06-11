
# Shiba Token Faucet

A faucet web application for SHIBA Token (SHIB) on Ropsten, Kovan and Rinkeby Testnet Network.

## Why

The main purpose of this project get fast SHIB tokens for testing purposes. The intended use case is providing some test SHIB to your wallet in order to help developers create amazing dApp with SHIB. It's not intended for wide audience use.

This faucet handles rate limiting per IP and Wallet address.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

API routes can be accessed on [http://localhost:3001/api/:endpoint](http://localhost:3001/api/:endpoint). This endpoint can be edited.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as instead of React pages.