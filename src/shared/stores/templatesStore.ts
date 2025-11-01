import { create } from 'zustand';
import { Template } from '@shared/api';

export interface TemplatesStoreState {
  templates: Template[];
  pendingTemplate?: Template;
}

export interface TemplatesStoreActions {
  setTemplates: (templates: Template[]) => void;
  updateTemplates: (updater: (templates: Template[]) => Template[]) => void;
  setPendingTemplate: (template?: Template) => void;
  resetPendingTemplate: () => void;
}

export type TemplatesStore = TemplatesStoreState & TemplatesStoreActions;

export const useTemplatesStore = create<TemplatesStore>((set, get) => ({
  templates: [],
  pendingTemplate: undefined,
  setTemplates: (templates: Template[]) => set({ templates }),
  updateTemplates: (updater: (templates: Template[]) => Template[]) => {
    const currentTemplates = get().templates;
    const newTemplates = updater(currentTemplates);
    set({ templates: newTemplates });
  },
  setPendingTemplate: (template?: Template) => {
    set({ pendingTemplate: template });
  },
  resetPendingTemplate: () => {
    set({ pendingTemplate: undefined });
  },
}));

