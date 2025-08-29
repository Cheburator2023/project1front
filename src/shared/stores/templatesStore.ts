/* eslint-disable @typescript-eslint/ban-types */
import { create } from 'zustand';
import { Template } from '@shared/api';
import React from 'react';

export interface TemplatesStoreState {
  templates: Template[];
  pendingTemplate?: Template;
}

export interface TemplatesStoreActions {
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  setPendingTemplate: (template?: Template) => void;
  resetPendingTemplate: () => void;
}

export type TemplatesStore = TemplatesStoreState & TemplatesStoreActions;

export const useTemplatesStore = create<TemplatesStore>((set, get) => ({
  templates: [],
  pendingTemplate: undefined,
  setTemplates: (value: React.SetStateAction<Template[]>) => {
    const newTemplates = typeof value === 'function' ? value(get().templates) : value;
    set({ templates: newTemplates });
  },
  setPendingTemplate: (template?: Template) => {
    set({ pendingTemplate: template });
  },
  resetPendingTemplate: () => {
    set({ pendingTemplate: undefined });
  },
}));

