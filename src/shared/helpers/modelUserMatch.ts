import { useUserStore } from '../stores';
import { Row } from '../types';

export const isModelCreator = (row?: Partial<Row>): boolean => {
  const { username } = useUserStore.getState();
  const lowerUsername = username?.toLowerCase();
  const lowerModelCreator = row?.model_creator?.toLowerCase();
  return lowerUsername === lowerModelCreator;
};

export const isInBusinessCustomers = (row?: Partial<Row>): boolean => {
  const { username } = useUserStore.getState();
  const lowerUsername = username?.toLowerCase();
  const lowerBusinessCustomers =
    row?.business_customer
      ?.toLowerCase()
      .split(',')
      .map((customer) => customer.trim()) || [];

  return lowerBusinessCustomers.some((customer) => customer === lowerUsername);
};

