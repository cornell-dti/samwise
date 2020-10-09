import React, { ReactElement } from 'react';

import { AppProps } from 'next/app';
import Head from 'next/head';

import '../index.scss';
import '../firebase';
import { initialize as initializeGA } from '../util/ga-util';
import { registerGateKeeper } from '../util/gate-keeper';
import { initModal } from '../components/Util/Modals';
import { initializeWindowSizeHooksListeners } from '../hooks/window-size-hook';

if (process.browser) {
  initializeGA();
  initializeWindowSizeHooksListeners();
  registerGateKeeper();
  initModal();
}

// Next.js cannot understand process.env destructuring
// eslint-disable-next-line prefer-destructuring
const PUBLIC_URL = process.env.NEXT_PUBLIC_URL ?? '';

const App = (props: AppProps): ReactElement => {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href={`${PUBLIC_URL}/favicon.ico`} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#F7F7F7" />
        <meta
          property="og:description"
          content="Samwise is a task manager for Cornell students who put in work."
        />
        <meta property="og:image" content={`${PUBLIC_URL}/banner.png`} />
        <link rel="manifest" href={`${PUBLIC_URL}/manifest.json`} />
        <title>Samwise</title>
      </Head>
      <Component
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...pageProps}
      />
    </>
  );
};

export default App;
