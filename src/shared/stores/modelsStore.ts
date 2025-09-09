import { create } from 'zustand';
import { RIGHT_PANEL_TYPE, MODEL_FORM_MODE } from '@shared/constants';
import { Row } from '@shared/types';
import { ArtifactApi, CustomError } from '@shared/api/types';
import { ModelsControllerGetModelsParams } from '@shared/api/generated/models';

interface ModelsState {
  compareMode: boolean;
  rightPanelType: RIGHT_PANEL_TYPE | null;
  activeCellName?: keyof Row;
  activeRowId?: string;
  rows?: Partial<Row>[];
  isLoading: boolean;
  modelsParams: ModelsControllerGetModelsParams;
  selectedDate: string | undefined;
  colOptionsMap: Record<string, string[]>;
  hasEmptyValues: boolean;
}

interface ModelsActions {
  setCompareMode: (newCompareMode: boolean) => void;
  setRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
  setActiveCellName: (cellName?: keyof Row) => void;
  setActiveRowId: (rowId?: string) => void;
  handleOnClose: () => void;
  setRows: (rows: Partial<Row>[]) => void;
  updateRow: (updatedRow: Partial<Row>) => void;
  addRow: (newRow: Partial<Row>) => void;
  setIsLoading: (loading: boolean) => void;
  setSelectedDate: (date: string | undefined) => void;
  setModelsParams: (params: ModelsControllerGetModelsParams) => void;
  handleSubmit: (newRow?: Row | CustomError | ArtifactApi[], formMode?: MODEL_FORM_MODE) => void;
  initColOptionsMap: (rows?: Partial<Row>[]) => void;
  setHasEmptyValues: (hasEmpty: boolean) => void;
}

export type ModelsStore = ModelsState & ModelsActions;

const initialState: ModelsState = {
  compareMode: false,
  rightPanelType: null,
  activeCellName: undefined,
  activeRowId: undefined,
  rows: undefined,
  isLoading: false,
  modelsParams: { mode: [] },
  selectedDate: undefined,
  colOptionsMap: {},
  hasEmptyValues: false,
};

export const useModelsStore = create<ModelsStore>((set, get) => ({
  ...initialState,
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setCompareMode: (newCompareMode: boolean) => set({ compareMode: newCompareMode }),
  setRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) =>
    set({ rightPanelType: newRightPanelType }),
  setActiveCellName: (cellName?: keyof Row) => set({ activeCellName: cellName }),
  setActiveRowId: (rowId?: string) => set({ activeRowId: rowId }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setModelsParams: (modelsParams: ModelsControllerGetModelsParams) => set({ modelsParams }),
  handleOnClose: () => {
    set({
      rightPanelType: null,
      activeCellName: undefined,
      activeRowId: undefined,
    });
  },

  setRows: (rows: Partial<Row>[]) => {
    console.log('🐸 Pepe said >> rows:', rows);

    const { initColOptionsMap } = get();
    set({ rows });
    initColOptionsMap(rows);
  },

  updateRow: (updatedRow: Partial<Row>) =>
    set((state) => ({
      rows: state?.rows?.map((row) =>
        row?.system_model_id === updatedRow.system_model_id ? updatedRow : row,
      ),
    })),

  addRow: (newRow: Partial<Row>) =>
    set((state) => ({
      rows: [newRow, ...(state.rows || [])],
    })),

  handleSubmit: (newRow?: Row | CustomError | ArtifactApi[], formMode?: MODEL_FORM_MODE) => {
    if (newRow && typeof newRow === 'object' && 'system_model_id' in newRow) {
      const newRowWithId = { ...newRow, id: newRow.system_model_id, hover: true };
      const { updateRow, addRow, handleOnClose, initColOptionsMap, rows } = get();

      if (
        formMode === MODEL_FORM_MODE.EDIT ||
        formMode === MODEL_FORM_MODE.DELETE ||
        formMode === MODEL_FORM_MODE.DELETE_CONFIRM
      ) {
        updateRow(newRowWithId);
      } else {
        addRow(newRowWithId);
      }

      initColOptionsMap(rows);
    }

    get().handleOnClose();
  },

  initColOptionsMap: (rows?: Partial<Row>[]) => {
    const colOptionsMap: Record<string, string[]> = {};
    let hasEmptyValues = false;

    if (rows && rows?.length > 0) {
      const firstRow = rows[0];
      if (firstRow) {
        Object.keys(firstRow).forEach((colId) => {
          const uniqueValues = new Set<string>();

          rows.forEach((row) => {
            const value = row[colId as keyof Row];
            if (value !== undefined && value !== null && value !== '') {
              uniqueValues.add(String(value));
            } else {
              hasEmptyValues = true;
            }
          });

          colOptionsMap[colId] = Array.from(uniqueValues).sort();
        });
      }
    }

    set({ colOptionsMap, hasEmptyValues });
  },

  setHasEmptyValues: (hasEmptyValues: boolean) => set({ hasEmptyValues }),
}));

