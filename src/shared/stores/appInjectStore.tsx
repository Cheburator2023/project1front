import { create } from 'zustand';

import { DEFAULT_CUSTOMER, CUSTOMER_TYPE } from '../constants/customers';

export type AppInjectStoreState = {
  currentCustomer: CUSTOMER_TYPE;
};

export type AppInjectStoreActions = {
  setCurrentCustomer: (customer: CUSTOMER_TYPE) => void;
};

const initialState: AppInjectStoreState = {
  currentCustomer: DEFAULT_CUSTOMER,
};

export const useAppInjectStore = create<AppInjectStoreState & AppInjectStoreActions>((set) => ({
  currentCustomer: initialState.currentCustomer,
  setCurrentCustomer: (customer: CUSTOMER_TYPE) => {
    localStorage.setItem('currentCustomer', JSON.stringify(customer));
    return set({ currentCustomer: customer });
  },
}));

