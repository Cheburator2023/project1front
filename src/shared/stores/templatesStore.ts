import { create } from 'zustand';
import { Template } from '@shared/api';
import React from 'react';

export interface TemplatesStoreState {
  templates: Template[];
}

export interface TemplatesStoreActions {
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
}

export type TemplatesStore = TemplatesStoreState & TemplatesStoreActions;

export const useTemplatesStore = create<TemplatesStore>((set, get) => ({
  templates: [],
  setTemplates: (value: React.SetStateAction<Template[]>) => {
    const newTemplates = typeof value === 'function' ? value(get().templates) : value;
    set({ templates: newTemplates });
  },
}));