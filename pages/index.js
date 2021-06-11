import { createRef, useState } from 'react';
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import ReCAPTCHA from "react-google-recaptcha";
import web3Utils from 'web3-utils';
import tokenAddress from '../utils/tokenAddress';


export default function Home() {
  const [network, setNetwork] = useState('ropsten');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const recaptchaRef = createRef();

  const handleAddress = (e) => {
    if (loading) return;
    setAddress(e.target.value);
    setError('');
    setTransactionHash('');
  }

  const handleSubmit = () => {
    if (loading) return;
    if (!tokenAddress[network]) {
      return setError('Please, select a testnet network');
    }
    if (!address) {
      return setError('Please, enter your testnet address');
    }
    const validAddress = web3Utils.isAddress(address);
    if (!validAddress) {
      return setError('Please, enter a valid address');
    }

    setLoading(true);
    setError('');
    setTransactionHash('');

    recaptchaRef.current.execute();
  };

  const onReCAPTCHAChange = async (captchaCode) => {
    // If the reCAPTCHA code is null or undefined indicating that
    // the reCAPTCHA was expired then return early
    if (!captchaCode) {
      setLoading(false);
      return;
    }
    recaptchaRef.current.reset();

    try {
      const res = await fetch('/api/faucet/requestTokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address, network }),
      });

      if (!res.ok) {
        const errorResData = await res.json();
        throw new Error(errorResData.message);
      }

      const data = await res.json();
      if (data && data.transactionHash) {
        setTransactionHash(data.transactionHash);
      }

    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>ShibaToken Faucet</title>
        <meta name="description" content="Shiba Token Faucet | This faucet allows you to request SHIB to be used on the Ropsten, Kovan or Rinkeby test network." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.navbar}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            alt=''
            src="/shib_logo_header.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />
          SHIBA TOKEN | Faucet
        </a>
      </div>

      <main className={styles.main}>
        <img
          alt=""
          src="/shib_astronaut.png"
          width="260"
          height="180"
          className="d-inline-block align-top"
        />
        <h1 className={styles.title}>
          Shiba Token <span>Faucet</span>
        </h1>

        <p className={styles.description}>
          This faucet allows you to request Shiba Token (SHIB) to be used on the Ethereum test networks.
        </p>
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Your testnet address"
            value={address}
            onChange={handleAddress}
          />
          <div className={styles.network + " " + styles[network]}/>
          <select value={network} onChange={e => setNetwork(e.target.value)}>
            <option className={styles.ropsten} value="ropsten">Ropsten</option>
            <option className={styles.kovan} value="kovan">Kovan</option>
            <option className={styles.rinkeby} value="rinkeby">Rinkeby</option>
          </select>
        </div>
        <div className={styles.message}>
          {error ? (
            <div className={styles.error}>
              {error}
            </div>
          ) : transactionHash ? (
            <div className={styles.success}>
              Your request was successful! View your transaction <a href={`https://${network}.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">here</a>.
            </div>
          ) : null}
        </div>
        <button className={styles.button} onClick={handleSubmit}>
          {loading ? (
            <div className={styles.loadingRing}><div></div><div></div><div></div><div></div></div>
          ) : (
            "Send me 100m SHIB"
          )}
        </button>
        <p className={styles.disclaimer}>
          {'Token address '}
          <a
            href={`https://${network}.etherscan.io/token/${tokenAddress[network]}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {tokenAddress[network]}
          </a>
        </p>
        
        <ReCAPTCHA
          ref={recaptchaRef}
          size="invisible"
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          onChange={onReCAPTCHAChange}
        />

      </main>

      <footer className={styles.footer}>
        <a
          href="https://www.openshiba.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Shiba Foundation
        </a>
      </footer>
    </div>
  )
}
