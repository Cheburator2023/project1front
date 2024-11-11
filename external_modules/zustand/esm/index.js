import { createStore } from 'zustand/vanilla';
import { useDebugValue } from 'react';
import useSyncExternalStoreExports from 'use-sync-external-store/shim/with-selector.js';

export * from 'zustand/vanilla';

const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
function useStore(api, selector = api.getState, equalityFn) {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getState,
    selector,
    equalityFn,
  );
  useDebugValue(slice);
  return slice;
}
/**
 * Creates a store. If a function is passed, it is given an `set` function to update the state.
 * The hook returns the api object, which contains the state and methods to update it.
 * @ deprecated Passing a vanilla store will be unsupported in a future version.
 * Instead use `import { useStore } from 'zustand'`.
 * @param {Function|Object} createState
 * @returns {Object}
 * @example
 * const useStore = create((set) => ({
 *   bears: 0,
 *   increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
 * }))
 */
/** ***********  ✨ Codeium Command ⭐  ************ */
/** ****  4b91b1e9-6851-4a22-95b1-4f15b1051122  ****** */
const createImpl = (createState) => {
  if (process.env.NODE_ENV !== 'production' && typeof createState !== 'function') {
    console.warn(
      "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`.",
    );
  }
  const api = typeof createState === 'function' ? createStore(createState) : createState;
  const useBoundStore = (selector, equalityFn) => useStore(api, selector, equalityFn);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create = (createState) => (createState ? createImpl(createState) : createImpl);
const react = (createState) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      "[DEPRECATED] Default export is deprecated. Instead use `import { create } from 'zustand'`.",
    );
  }
  return create(createState);
};

export { create, react as default, useStore };

