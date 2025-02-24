import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './app';

const GIT_REVISION = process.env.GIT_REVISION;

console.log('GIT_REVISION HASH IS:', GIT_REVISION);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

