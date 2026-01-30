import { GridApi } from 'ag-grid-community';
import { create } from 'zustand';
import { DEFAULT_CUSTOMER, CUSTOMER_TYPE } from '../constants/customers';

export type GlobalStoreState = {
  filtersResetCount: number;
  agGridApi?: GridApi;
  currentCustomer: CUSTOMER_TYPE;
  searchString: string;
};

export type GlobalStoreActions = {
  setFiltersResetCount: () => void;
  setAgGridApi: (agGridApi: GridApi) => void;
  setCurrentCustomer: (customer: CUSTOMER_TYPE) => void;
  setSearchString: (searchString: string) => void;
};

const initialState: GlobalStoreState = {
  filtersResetCount: 0,
  currentCustomer: DEFAULT_CUSTOMER,
  searchString: '',
};

export const useGlobalStore = create<GlobalStoreState & GlobalStoreActions>((set) => ({
  ...initialState,
  agGridApi: undefined,
  setAgGridApi: (agGridApi: GridApi) => {
    return set({ agGridApi });
  },
  setFiltersResetCount: () => {
    return set((state) => ({ filtersResetCount: state.filtersResetCount + 1 }));
  },
  setCurrentCustomer: (customer: CUSTOMER_TYPE) => {
    localStorage.setItem('currentCustomer', JSON.stringify(customer));
    return set({ currentCustomer: customer });
  },
  setSearchString: (searchString: string) => {
    return set({ searchString });
  },
}));

