import React, { createContext } from 'react';

const IS_DEV = process.env.NODE_ENV === 'development';

// Create a context for the global state
const GlobalsContext = createContext({});

// Create a provider component that wraps the app
const GlobalsProvider: React.FC = ({ children }) => {
  // Return the provider component with the context values
  return (
    <GlobalsContext.Provider value={{}}>
      {IS_DEV ? children : <InnerGlobalsProvider>{children}</InnerGlobalsProvider>}
    </GlobalsContext.Provider>
  );
};

const InnerGlobalsProvider: React.FC = ({ children }) => {
  return <>{children}</>;
};

// Export the provider and the context
export { GlobalsProvider, GlobalsContext };

