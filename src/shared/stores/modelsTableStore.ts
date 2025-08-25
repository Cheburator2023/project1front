import { create } from 'zustand';
import { Row } from '@shared/types';

export interface ModelsTableStoreState {
  rows: Partial<Row>[];
}

export interface ModelsTableStoreActions {
  setRows: (rows: Partial<Row>[]) => void;
  updateRow: (updatedRow: Partial<Row>) => void;
  addRow: (newRow: Partial<Row>) => void;
}

export type ModelsTableStore = ModelsTableStoreState & ModelsTableStoreActions;

export const useModelsTableStore = create<ModelsTableStore>((set) => ({
  rows: [],
  setRows: (rows: Partial<Row>[]) => set({ rows }),
  updateRow: (updatedRow: Partial<Row>) => set((state) => ({
    rows: state.rows.map((row) => 
      row?.system_model_id === updatedRow.system_model_id ? updatedRow : row
    ),
  })),
  addRow: (newRow: Partial<Row>) => set((state) => ({
    rows: [newRow, ...state.rows],
  })),
}));