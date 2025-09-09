/* eslint-disable import/no-unresolved */
import { createBridgeComponent } from '@module-federation/bridge-react/v18';

import { App } from './app';

export default createBridgeComponent({
  rootComponent: App,
});

