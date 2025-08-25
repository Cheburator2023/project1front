import { create } from 'zustand';
import { MODEL_FORM_MODE } from '@shared/constants';
import { Row } from '@shared/types';
import { ArtifactApi, CustomError } from '@shared/api/types';
import { useDisplayStore } from './displayStore';
import { useModelsTableStore } from './modelsTableStore';

export interface ModelsOperationsStoreState {
  isLoading: boolean;
}

export interface ModelsOperationsStoreActions {
  setIsLoading: (loading: boolean) => void;
  handleSubmit: (newRow?: Row | CustomError | ArtifactApi[], formMode?: MODEL_FORM_MODE) => void;
  handleOnClose: () => void;
}

export type ModelsOperationsStore = ModelsOperationsStoreState & ModelsOperationsStoreActions;

export const useModelsOperationsStore = create<ModelsOperationsStore>((set, get) => ({
  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  
  handleSubmit: (newRow?: Row | CustomError | ArtifactApi[], formMode?: MODEL_FORM_MODE) => {
    if (newRow && typeof newRow === 'object' && 'system_model_id' in newRow) {
      const newRowWithId = { ...newRow, id: newRow.system_model_id, hover: true };
      const { updateRow, addRow } = useModelsTableStore.getState();
      
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
    
    const { handleOnClose } = get();
    handleOnClose();
  },
  
  handleOnClose: () => {
    const { handleOnClose } = useDisplayStore.getState();
    handleOnClose();
  },
}));