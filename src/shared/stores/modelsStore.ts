import { create } from 'zustand';
import { ACTIVE_SCREEN, RIGHT_PANEL_TYPE, MODEL_FORM_MODE } from '@shared/constants';
import { Row } from '@shared/types';
import { ArtifactApi, CustomError } from '@shared/api/types';

interface ModelsState {
  activeScreen: ACTIVE_SCREEN;
  compareMode: boolean;
  rightPanelType: RIGHT_PANEL_TYPE | null;
  activeCellName?: keyof Row;
  activeRowId?: string;
  rows: Partial<Row>[];
  isLoading: boolean;
}

interface ModelsActions {
  setActiveScreen: (newActiveScreen: ACTIVE_SCREEN) => void;
  setCompareMode: (newCompareMode: boolean) => void;
  setRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
  setActiveCellName: (cellName?: keyof Row) => void;
  setActiveRowId: (rowId?: string) => void;
  handleChangeCompare: (checked: boolean) => void;
  handleOnClose: () => void;
  setRows: (rows: Partial<Row>[]) => void;
  updateRow: (updatedRow: Partial<Row>) => void;
  addRow: (newRow: Partial<Row>) => void;
  setIsLoading: (loading: boolean) => void;
  handleSubmit: (newRow?: Row | CustomError | ArtifactApi[], formMode?: MODEL_FORM_MODE) => void;
}

export type ModelsStore = ModelsState & ModelsActions;

const initialState: ModelsState = {
  activeScreen: ACTIVE_SCREEN.TABLE,
  compareMode: false,
  rightPanelType: null,
  activeCellName: undefined,
  activeRowId: undefined,
  rows: [],
  isLoading: false,
};

export const useModelsStore = create<ModelsStore>((set, get) => ({
  ...initialState,

  setActiveScreen: (newActiveScreen: ACTIVE_SCREEN) => set({ activeScreen: newActiveScreen }),
  setCompareMode: (newCompareMode: boolean) => set({ compareMode: newCompareMode }),
  setRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => set({ rightPanelType: newRightPanelType }),
  setActiveCellName: (cellName?: keyof Row) => set({ activeCellName: cellName }),
  setActiveRowId: (rowId?: string) => set({ activeRowId: rowId }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  handleChangeCompare: (checked: boolean) => {
    if (checked) {
      set({ activeScreen: ACTIVE_SCREEN.COMPARE, compareMode: true });
    } else {
      set({ activeScreen: ACTIVE_SCREEN.TABLE, compareMode: false });
    }
  },

  handleOnClose: () => {
    set({
      rightPanelType: null,
      activeCellName: undefined,
      activeRowId: undefined,
    });
  },

  setRows: (rows: Partial<Row>[]) => set({ rows }),

  updateRow: (updatedRow: Partial<Row>) => set((state) => ({
    rows: state.rows.map((row) => 
      row?.system_model_id === updatedRow.system_model_id ? updatedRow : row
    ),
  })),

  addRow: (newRow: Partial<Row>) => set((state) => ({
    rows: [newRow, ...state.rows],
  })),

  handleSubmit: (newRow?: Row | CustomError | ArtifactApi[], formMode?: MODEL_FORM_MODE) => {
    if (newRow && typeof newRow === 'object' && 'system_model_id' in newRow) {
      const newRowWithId = { ...newRow, id: newRow.system_model_id, hover: true };
      const { updateRow, addRow, handleOnClose } = get();
      
      if (
        formMode === MODEL_FORM_MODE.EDIT ||
        formMode === MODEL_FORM_MODE.DELETE ||
        formMode === MODEL_FORM_MODE.DELETE_CONFIRM
      ) {
        updateRow(newRowWithId);
      } else {
        addRow(newRowWithId);
      }
    }
    
    get().handleOnClose();
  },
}));