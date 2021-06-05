import { createRef, useState } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { signIn, signOut, useSession } from 'next-auth/client'
import ReCAPTCHA from "react-google-recaptcha";
import web3Utils from 'web3-utils';

export default function Home() {
  const [session] = useSession();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const recaptchaRef = createRef();

  const handleAddress = (e) => {
    if(loading) return;
    setAddress(e.target.value);
    setError('');
  }

  const handleSubmit = () => {
    if(loading) return;
    if(!session){
      return setError('Please, log in to request SHIB');
    }
    if(!address){
      return setError('Please, enter your Kovan testnet address');
    }
    const validAddress = web3Utils.isAddress(address);
    if(!validAddress){
      return setError('Please, enter a valid address');
    }

    setLoading(true);
    setError('');

    recaptchaRef.current.execute();
  };
  
  const onReCAPTCHAChange = async (captchaCode) => {
    // If the reCAPTCHA code is null or undefined indicating that
    // the reCAPTCHA was expired then return early
    if(!captchaCode) {
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
        body: JSON.stringify({ address }),
      });
     
      const data = await res.json();
      console.log('pages | onReCAPTCHAChange', data);
    } catch (error) {
      console.log('pages | onReCAPTCHAChange error', error.message);
    } 
    setLoading(false);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>ShibaToken Kovan Faucet</title>
        <meta name="description" content="Shiba Token | Kovan Faucet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.navbar}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt=""
            src="/shib_logo_header.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />
          SHIBA TOKEN | Faucet
        </a>
        {session ? (
          <div className={styles.auth}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: "#54C147" }} />
            <div>Connected as {session.user.name}</div>
            <div onClick={() => signOut()} className={styles.authButton}>Log out</div>
          </div>
        ) : (
          <div className={styles.auth}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: "orange" }} />
            <div>Please, authenticate</div>
            <div onClick={() => signIn()} className={styles.authButton}>Log in</div>
          </div>
        )}
      </div>

      <main className={styles.main}>
        <Image
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
          This faucet allows you to request Shiba Token (SHIB) to be used on the Kovan Ethereum test network.
        </p>
        <div className={styles.inputContainer}>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="Your testnet address"
            value={address}
            onChange={handleAddress}
          />
          <p className={styles.error}>
            {error}
          </p>
        </div>
        <button className={styles.button} onClick={handleSubmit}>
          {loading ? (
            <div className={styles.loadingRing}><div></div><div></div><div></div><div></div></div>
          ) : (
            "Send me 100m SHIB"
          )}
        </button>
        <p className={styles.disclaimer}>
          The faucet is running invisible reCaptcha protection against bots.
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
