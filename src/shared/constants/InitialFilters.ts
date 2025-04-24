import { SELECT_TYPE, SelectStringProps, SelectTagsProps } from '@shared/ui/organisms';

import { TopFilters } from '@shared/types';

const initialTopFilters: TopFilters = {
  templates: [],
  tags: [],
  objectTypeRegistry: [],
  dates: [],
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

export { tagsSelectOptions, modelsSelectOptions, initialTopFilters };

