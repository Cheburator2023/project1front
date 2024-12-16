import { create } from 'zustand';
import { MODEL_FORM_MODE } from '../constants';
import { useUserStore } from './userStore';
import { Role } from '../types';

export type DeleteRightModelPanelStoreState = {
  isDeleteButtonEnabled: boolean;
  modelsCount: number;
  modelSource: string | null;
  modelStatus: string | null;
  activeRowId: string | null;
  userMatches: boolean;
  formMode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM;
  excludeError: boolean;
  setFormMode: (mode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM) => void;
  updateExcludeError: (value: boolean) => void;
  updateDeleteModelState: (
    count: number,
    source?: string | null,
    status?: string | null,
    rowId?: string | null,
    userMatches?: boolean,
  ) => void;
};

export const useDeleteRightModelPanelStore = create<DeleteRightModelPanelStoreState>((set) => ({
  isDeleteButtonEnabled: false,
  modelsCount: 0,
  modelSource: null,
  modelStatus: null,
  activeRowId: null,
  userMatches: false,
  formMode: MODEL_FORM_MODE.DELETE,
  excludeError: false,
  setFormMode: (mode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM) =>
    set({ formMode: mode }),
  updateExcludeError: (value: boolean) => set({ excludeError: value }),
  updateDeleteModelState: (
    count: number,
    source?: string | null,
    status?: string | null,
    rowId?: string | null,
    userMatches?: boolean,
  ) => {
    const { hasRole } = useUserStore.getState();
    const isAdmin = hasRole(Role.ADMIN_IT) || hasRole(Role.ADMIN_IT_LEAD);
    const isValidatorLead = hasRole(Role.VALIDATOR_LEAD);

    const isDeleteButtonEnabled =
      count === 1 &&
      source === 'sum-rm' &&
      (isAdmin || userMatches || (isValidatorLead && !!status));

    set({
      modelsCount: count,
      modelSource: source,
      modelStatus: status,
      activeRowId: rowId,
      userMatches,
      isDeleteButtonEnabled,
    });
  },
}));

