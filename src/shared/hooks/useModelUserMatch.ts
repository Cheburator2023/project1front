import { useUserStore } from '../stores';
import { Row } from '../types';

export const useModelUserMatch = () => {
  const { username } = useUserStore();

  const lowerUsername = username?.toLowerCase();

  const isModelCreator = (row: Partial<Row>): boolean => {
    const lowerModelCreator = row.model_creator?.toLowerCase();
    return lowerUsername === lowerModelCreator;
  };

  const isInBusinessCustomers = (row: Partial<Row>): boolean => {
    const lowerBusinessCustomers =
      row?.business_customer
        ?.toLowerCase()
        .split(',')
        .map((customer) => customer.trim()) || [];

    return lowerBusinessCustomers.some((customer) => customer === lowerUsername);
  };

  return { isModelCreator, isInBusinessCustomers };
};

