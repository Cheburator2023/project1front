import { create } from 'zustand';
import { MODEL_FORM_MODE } from '../constants';

export type DeleteRightModelPanelStoreState = {
  isDeleteButtonEnabled: boolean;
  selectedModelsCount: number;
  selectedModelSource: string | null;
  activeRowId: string | null;
  formMode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM;
  setFormMode: (mode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM) => void;
  updateDeleteModelState: (count: number, source: string | null) => void;
};

export const useDeleteRightModelPanelStore = create<DeleteRightModelPanelStoreState>((set) => ({
  isDeleteButtonEnabled: false,
  selectedModelsCount: 0,
  selectedModelSource: null,
  activeRowId: null,
  formMode: MODEL_FORM_MODE.DELETE,
  setFormMode: (mode: MODEL_FORM_MODE.DELETE | MODEL_FORM_MODE.DELETE_CONFIRM) =>
    set({ formMode: mode }),
  updateDeleteModelState: (count: number, source: string | null, rowId = null) => {
    set({
      selectedModelsCount: count,
      selectedModelSource: source,
      activeRowId: rowId,
      isDeleteButtonEnabled: count === 1 && source === 'sum-rm',
    });
  },
}));

