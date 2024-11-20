import { create } from 'zustand';

export type DeleteRightModelPanelStoreState = {
  isDeleteButtonEnabled: boolean;
  selectedModelsCount: number;
  selectedModelSource: string | null;
  activeRowId: string | null;
  updateDeleteModelState: (count: number, source: string | null) => void;
};

export const useDeleteRightModelPanelStore = create<DeleteRightModelPanelStoreState>((set) => ({
  isDeleteButtonEnabled: false,
  selectedModelsCount: 0,
  selectedModelSource: null,
  activeRowId: null,
  updateDeleteModelState: (count: number, source: string | null, rowId = null) => {
    set({
      selectedModelsCount: count,
      selectedModelSource: source,
      activeRowId: rowId,
      isDeleteButtonEnabled: count === 1 && source === 'sum-rm',
    });
  },
}));

