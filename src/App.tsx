import React from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';

import RoutesComponent from './Routes';
import Layout from './Layout';

const App = () => (
  <div>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/sum-rm" replace />} />
          <Route path="/sum-rm/*" element={<RoutesComponent />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </div>
);

export default App;
