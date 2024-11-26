import { create } from 'zustand';
import { MODEL_FORM_MODE } from '../constants';
import { useUserStore } from './userStore';

export type DeleteRightModelPanelStoreState = {
  isDeleteButtonEnabled: boolean;
  selectedModelsCount: number;
  selectedModelSource: string | null;
  activeRowId: string | null;
  formMode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM;
  userMatches: boolean;
  setFormMode: (mode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM) => void;
  updateDeleteModelState: (
    count: number,
    source: string | null,
    userMatches: boolean,
    rowId?: string | null,
  ) => void;
};

export const useDeleteRightModelPanelStore = create<DeleteRightModelPanelStoreState>((set) => ({
  isDeleteButtonEnabled: false,
  selectedModelsCount: 0,
  selectedModelSource: null,
  activeRowId: null,
  formMode: MODEL_FORM_MODE.DELETE,
  setFormMode: (mode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM) =>
    set({ formMode: mode }),
  updateDeleteModelState: (
    count: number,
    source: string | null,
    userMatches: boolean,
    rowId = null,
  ) => {
    const { roles } = useUserStore.getState();

    debugger;
    const allowedRoles = ['admin_it', 'admin_it_lead'];
    const hasAccess = roles.some((role: string) => allowedRoles.includes(role));

    const isDeleteButtonEnabled = count === 1 && source === 'sum-rm' && (hasAccess || userMatches);

    set({
      selectedModelsCount: count,
      selectedModelSource: source,
      activeRowId: rowId,
      userMatches,
      isDeleteButtonEnabled,
    });
  },
}));

