import React from 'react';

import { RightModalPanel } from '../../features/RightModalPanel';
import { CompareModelsWidget } from '../../features/CompareModels/organisms/CompareModelsWidget';

export const CompareModelsPage = () => {
  return (
    <>
      <RightModalPanel />
      <CompareModelsWidget />
    </>
  );
};

