export const CUSTOMER_MAP = {
  EVERY_CUSTOMER: {
    name: 'Любой',
    id: 0,
  },
  UMRV: {
    name: 'УМРВ',
    id: 1,
  },
  DADM: {
    name: 'DADM',
    id: 2,
  },
  DIUR: {
    name: 'ДИУР',
    id: 3,
  },
};

export const DEFAULT_CUSTOMER = CUSTOMER_MAP.EVERY_CUSTOMER;
export type CUSTOMER_TYPE = typeof CUSTOMER_MAP.DADM;

