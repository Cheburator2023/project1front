import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customInstance } from '@shared/api/customInstance';

export type QuarterInfo = {
  quarter: number;
  year: number;
  startDate: string;
  endDate: string;
  maxDate: string;
};

export type ConfirmationModelRow = {
  model_id: string;
  model_alias: string | null;
  model_name: string | null;
  model_name_dadm: string | null;
  business_customer: string | null;
  business_customer_departament: string | null;
  confirmation_date: string | null;
  is_used: boolean | null;
  prefill_source: 'pim' | 'previous_quarter' | null;
};

export type SaveQuarterlyConfirmationPayload = {
  quarter: number;
  year: number;
  models: {
    model_id: string;
    confirmation_date: string | null;
    is_used: boolean | null;
  }[];
};

const fetchActiveQuarter = (signal?: AbortSignal) => {
  return customInstance<{ data: QuarterInfo | null }>({
    url: '/quarterly-confirmation/active-quarter',
    method: 'GET',
    signal,
  });
};

const fetchModelsForConfirmation = (signal?: AbortSignal) => {
  return customInstance<{ data: { models: ConfirmationModelRow[] } }>({
    url: '/quarterly-confirmation/models',
    method: 'GET',
    signal,
  });
};

const saveQuarterlyConfirmation = (data: SaveQuarterlyConfirmationPayload) => {
  return customInstance<{ data: { success: boolean } }>({
    url: '/quarterly-confirmation/save',
    method: 'POST',
    data,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const useActiveQuarter = () => {
  return useQuery({
    queryKey: ['quarterly-confirmation', 'active-quarter'],
    queryFn: ({ signal }) => fetchActiveQuarter(signal),
  });
};

export const useModelsForConfirmation = (enabled = true) => {
  return useQuery({
    queryKey: ['quarterly-confirmation', 'models'],
    queryFn: ({ signal }) => fetchModelsForConfirmation(signal),
    enabled,
  });
};

export const useSaveQuarterlyConfirmation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveQuarterlyConfirmation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quarterly-confirmation'],
      });
    },
  });
};
