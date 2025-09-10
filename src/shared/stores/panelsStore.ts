import { create } from 'zustand';
import { Row } from '@shared/types';
import { ArtifactApi, CustomError } from '@shared/api/types';
import { MODEL_FORM_MODE } from '@shared/constants';
import { ModelsControllerGetModelsParams } from '@shared/api/generated/models';

interface PanelsState {
  addModelPanel: {
    isOpen: boolean;
  };
  editModelPanel: {
    isOpen: boolean;
    activeRowId?: string;
    activeCellName?: keyof Row;
  };
  historyChangesPanel: {
    isOpen: boolean;
    activeRowId?: string;
    activeCellName?: keyof Row;
  };
  addTemplatePanel: {
    isOpen: boolean;
    activeRowId?: string;
  };
  deleteModelPanel: {
    isOpen: boolean;
    activeRow?: Partial<Row>[];
    activeCellName?: keyof Row;
  };
}

interface PanelsActions {
  openAddModelPanel: () => void;
  closeAddModelPanel: () => void;

  openEditModelPanel: (rowId: string, cellName: keyof Row) => void;
  closeEditModelPanel: () => void;

  openHistoryChangesPanel: (rowId: string, cellName: keyof Row) => void;
  closeHistoryChangesPanel: () => void;

  openAddTemplatePanel: () => void;
  closeAddTemplatePanel: () => void;

  openDeleteModelPanel: (activeRow: Partial<Row>[], cellName?: keyof Row) => void;
  closeDeleteModelPanel: () => void;

  closeAllPanels: () => void;
}

export type PanelsStore = PanelsState & PanelsActions;

const initialState: PanelsState = {
  addModelPanel: {
    isOpen: false,
  },
  editModelPanel: {
    isOpen: false,
    activeRowId: undefined,
    activeCellName: undefined,
  },
  historyChangesPanel: {
    isOpen: false,
    activeRowId: undefined,
    activeCellName: undefined,
  },
  addTemplatePanel: {
    isOpen: false,
  },
  deleteModelPanel: {
    isOpen: false,
    activeRow: undefined,
    activeCellName: undefined,
  },
};

export const usePanelsStore = create<PanelsStore>((set) => ({
  ...initialState,

  openAddModelPanel: () =>
    set((state) => ({
      ...state,
      addModelPanel: { isOpen: true },
    })),

  closeAddModelPanel: () =>
    set((state) => ({
      ...state,
      addModelPanel: { isOpen: false },
    })),

  openEditModelPanel: (rowId: string, cellName: keyof Row) =>
    set((state) => ({
      ...state,
      editModelPanel: {
        isOpen: true,
        activeRowId: rowId,
        activeCellName: cellName,
      },
    })),

  closeEditModelPanel: () =>
    set((state) => ({
      ...state,
      editModelPanel: {
        isOpen: false,
        activeRowId: undefined,
        activeCellName: undefined,
      },
    })),

  openHistoryChangesPanel: (rowId: string, cellName: keyof Row) =>
    set((state) => ({
      ...state,
      historyChangesPanel: {
        isOpen: true,
        activeRowId: rowId,
        activeCellName: cellName,
      },
    })),

  closeHistoryChangesPanel: () =>
    set((state) => ({
      ...state,
      historyChangesPanel: {
        isOpen: false,
        activeRowId: undefined,
        activeCellName: undefined,
      },
    })),

  openAddTemplatePanel: () =>
    set((state) => ({
      ...state,
      addTemplatePanel: { isOpen: true },
    })),

  closeAddTemplatePanel: () =>
    set((state) => ({
      ...state,
      addTemplatePanel: { isOpen: false },
    })),

  openDeleteModelPanel: (activeRow: Partial<Row>[], cellName?: keyof Row) =>
    set((state) => ({
      ...state,
      deleteModelPanel: {
        isOpen: true,
        activeRow,
        activeCellName: cellName,
      },
    })),

  closeDeleteModelPanel: () =>
    set((state) => ({
      ...state,
      deleteModelPanel: {
        isOpen: false,
        activeRow: undefined,
        activeCellName: undefined,
      },
    })),

  closeAllPanels: () => set(() => initialState),
}));

