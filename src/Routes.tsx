import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Home } from './modules';

function RoutesComponent() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RoutesComponent;
