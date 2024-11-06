import { initialColumns, SYSTEM_SPECIFIC_FLAGS } from '@src/shared/constants';
import { COLUMN_TYPE, ColumnsFilter } from '@src/shared/types';
import { Template } from '@src/shared/api/types';

const getActiveTemplate = (templates: Template[], activeTemplateId: string) => {
  return templates.find((template) => String(template.template_id) === activeTemplateId);
};

const isSystemSpecificFilter = (filterId: string): boolean => {
  return Object.values(SYSTEM_SPECIFIC_FLAGS).includes(filterId as SYSTEM_SPECIFIC_FLAGS);
};

const isFilterDifferentFromTemplate = (
  columnName: string,
  filters: string[],
  activeTemplate?: Template,
) => {
  if (!activeTemplate) return true;

  const templateFilterValue =
    (activeTemplate.template_value as Record<string, string[]>)[columnName] ?? [];

  return JSON.stringify(filters) !== JSON.stringify(templateFilterValue);
};

const getModifiedFilters = (columnsFilters: Partial<ColumnsFilter>, activeTemplate?: Template) => {
  return Object.entries(columnsFilters).filter(([columnName, filters]) =>
    isFilterDifferentFromTemplate(columnName, filters, activeTemplate),
  );
};

const processFiltersByType = (columnName: string, filters: string[]): string[] => {
  const filterType = initialColumns.find((column) => column.name === columnName)?.type;

  if (filterType === COLUMN_TYPE.DATE && filters.length) {
    return [filters.join(' - ')];
  }

  return filters;
};

const getActiveFiltersCount = (
  columnsFilters: Partial<ColumnsFilter>,
  templates: Template[],
  activeTemplateId: string,
) => {
  const activeTemplate = getActiveTemplate(templates, activeTemplateId);
  const modifiedFilters = getModifiedFilters(columnsFilters, activeTemplate);

  const processedFilters = modifiedFilters.flatMap(([columnName, filters]) => {
    return processFiltersByType(columnName, filters);
  });

  return processedFilters.length;
};

export {
  getActiveTemplate,
  isFilterDifferentFromTemplate,
  getModifiedFilters,
  processFiltersByType,
  getActiveFiltersCount,
  isSystemSpecificFilter,
};

