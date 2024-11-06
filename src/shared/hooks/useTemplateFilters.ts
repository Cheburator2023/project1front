import { useEffect, useMemo, useState } from 'react';
import { Column, ColumnsFilter } from '@src/shared/types';
import { getActiveTemplate, getModifiedFilters, isSystemSpecificFilter } from '@src/shared/helpers';
import { Template } from '@shared/api';

export const useTemplateFilters = (
  columnsFilters: Partial<ColumnsFilter>,
  templates: Template[],
  topFilters: string[],
) => {
  const [modifiedFilters, setModifiedFilters] = useState(new Set<string>());

  const activeTemplate = useMemo(
    () => getActiveTemplate(templates, topFilters[0]),
    [templates, topFilters],
  );

  const isModifiedFilter = useMemo(() => {
    return getModifiedFilters(columnsFilters, activeTemplate).length > 0;
  }, [columnsFilters, activeTemplate]);

  useEffect(() => {
    const newModifiedFilters = new Set<string>();

    if (activeTemplate) {
      const modifiedFiltersArray = getModifiedFilters(columnsFilters, activeTemplate);
      modifiedFiltersArray.forEach(([filterId]) => {
        newModifiedFilters.add(filterId);
      });
    }

    setModifiedFilters(newModifiedFilters);
  }, [columnsFilters, activeTemplate]);

  const isTemplateFilter = (filterId: string): boolean => {
    return activeTemplate ? filterId in activeTemplate.template_value : false;
  };

  const getFilteredColumns = (initialColumns: Column[], showFilterTemplate: boolean): Column[] => {
    return initialColumns.filter((column) => {
      const isTemplate = isTemplateFilter(column.name);
      const isModified = modifiedFilters.has(column.name);

      if (isSystemSpecificFilter(column.name)) {
        return false;
      }

      return !showFilterTemplate ? isModified || !isTemplate : true;
    });
  };

  const resetFilters = () => {
    setModifiedFilters(new Set());
  };

  const shouldResetTemplateOnInitialFilterRemove = (columnFilterName: string): boolean => {
    return isTemplateFilter(columnFilterName) && !modifiedFilters.has(columnFilterName);
  };

  const shouldResetTemplateOnInitialValueChange = (
    value: string | string[] | undefined,
    initialTemplateValue: string[],
    columnName: string,
  ): boolean => {
    return (
      Array.isArray(initialTemplateValue) &&
      initialTemplateValue.length > 0 &&
      shouldResetTemplateOnInitialFilterRemove(columnName) &&
      (!value?.length || JSON.stringify(value) !== JSON.stringify(initialTemplateValue))
    );
  };

  return {
    modifiedFilters,
    activeTemplate,
    getFilteredColumns,
    resetFilters,
    isModifiedFilter,
    isTemplateFilter,
    shouldResetTemplateOnInitialFilterRemove,
    shouldResetTemplateOnInitialValueChange,
  };
};

