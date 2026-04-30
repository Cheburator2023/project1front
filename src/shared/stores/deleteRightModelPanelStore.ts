import { create } from 'zustand';
import { MODEL_FORM_MODE } from '../constants';
import { useUserStore } from './userStore';
import { Role } from '../types';

const NO_ROLES = process.env.NO_ROLES;

export type DeleteRightModelPanelStoreState = {
  isDeleteButtonEnabled: boolean;
  modelsCount: number;
  modelSource: string | null;
  modelStatus: string | null;
  activeRowId: string | null;
  userMatches: boolean;
  formMode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM;
  setFormMode: (mode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM) => void;
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
  setFormMode: (mode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM) =>
    set({ formMode: mode }),
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
      (NO_ROLES === 'true' || isAdmin || userMatches || isValidatorLead);

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

