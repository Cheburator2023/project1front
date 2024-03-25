import { SELECT_TYPE, SelectStringProps, SelectTagsProps } from 'src/components/SearchSelect/types';

import { TopFilters } from './types';

const initialTopFilters: TopFilters = {
  templates: [],
  tags: [],
  objectTypeRegistry: [],
  dates: [],
  exploitation: [],
};

const modelsSelectOptions = {
  type: SELECT_TYPE.STRING,
  options: [
    {
      value: 'Model',
      text: 'Модели',
    },
    {
      value: 'AutoML',
      text: 'AutoML',
    },
  ],
} as SelectStringProps;

const tagsSelectOptions = {
  type: SELECT_TYPE.TAGS,
  options: [
    {
      value: 'Дозаполнить атрибуты',
      text: 'Дозаполнить атрибуты ',
      type: 'public',
    },
    {
      value: 'Требуется валидация',
      text: 'Требуется валидация',
      type: 'public',
    },
    {
      value: 'Нужна рекалибровка',
      text: 'Нужна рекалибровка',
      type: 'private',
    },
  ],
} as SelectTagsProps;

const exploitationSelectOptions = {
  type: SELECT_TYPE.STRING,
  options: [
    {
      value: 'Active',
      text: 'Действующая',
    },
    {
      value: 'Pilot',
      text: 'Пилотирование',
    },
    {
      value: 'Exploitation',
      text: 'Эксплуатации (модели)',
    },
    {
      value: 'Develop',
      text: 'Разработка',
    },
    {
      value: 'Archive',
      text: 'Архив',
    },
  ],
} as SelectStringProps;

export { tagsSelectOptions, modelsSelectOptions, exploitationSelectOptions, initialTopFilters };
