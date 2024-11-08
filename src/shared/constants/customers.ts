export const CUSTOMER_MAP = {
  EVERY_CUSTOMER: {
    name: 'Любой',
    id: 0,
  },
  UMRV: {
    name: 'УМРВ',
    id: 1,
  },
};

export const DEFAULT_CUSTOMER = CUSTOMER_MAP.UMRV;
export type CUSTOMER_TYPE = typeof CUSTOMER_MAP.EVERY_CUSTOMER;

