// @flow strict

import ReactGA from 'react-ga';

if (process.env.NODE_ENV === 'production' && process.env.IS_STAGING !== 'true') {
  ReactGA.initialize('UA-134683024-1');
  ReactGA.pageview(window.location.pathname + window.location.search);
}
