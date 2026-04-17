import { Button, Checkbox, T, Toggle } from '@admiral-ds/react-ui';
import { useFiltersStore } from '@shared/stores/filtersStore';
import { CustomSearchSelect } from '@shared/ui/organisms';
import { useExploitationModeStore, useModelsStore, useTemplatesStore } from '@src/shared/stores';
import { modelsSelectOptions } from '@shared/constants';

import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useCallback, useMemo } from 'react';
import { parse, isValid } from 'date-fns';
import {
  useModelsControllerGetModels,
  useTemplatesControllerGetTemplates,
} from '@shared/api/generated/endpoints';
import { getISODateFormat } from '@shared/helpers';
import { useQueryClient } from '@tanstack/react-query';
import { useRoles } from '@shared/hooks';
import { Container, CustomDateField, FiltersDivider, FilterButton, FiltersBox } from '../styles';
import { useGlobalStore } from '../../../shared/stores/globalStore';
import { TemplatesPanel } from '../../TemplatesPanel/organisms/TemplatesPanel';
import { TemplatesFilterInput } from '../molecules/TemplatesFilterInput';
import { useTemplateFiltersModalStoreSelected } from '../../TemplatesPanel/stores/templateFiltersModalStore';
import { ROUTES } from '../../../app/Routes';

export interface FiltersPanelProps {
  compareOnlyChanged?: boolean;
  disabledCompare?: boolean;
  handleCompareOnlyChanged?: (checked: boolean) => void;
  compareModelsTableLoading?: boolean;
  handleUpdateCompareList?: () => void;
}

export const FiltersPanel = ({
  compareOnlyChanged = false,
  disabledCompare = true,
  compareModelsTableLoading = false,
  handleUpdateCompareList = () => null,
  handleCompareOnlyChanged = () => null,
}: FiltersPanelProps) => {
  const { setPendingTemplate, templates } = useTemplatesStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { compareMode, setCompareMode, modelsParams, setModelsParams } = useModelsStore();

  const {
    topFilters,
    modelsDownloadingDate,
    firstDate,
    secondDate,
    setTopFilters,
    setFirstDate,
    setSecondDate,
    setModelsDownloadingDate,
    resetFilters,
  } = useFiltersStore();
  const { setFiltersResetCount, agGridApi } = useGlobalStore();
  const { getActiveTemplate } = useFiltersStore();
  const initializeFromTemplate = useTemplateFiltersModalStoreSelected.use.initializeFromTemplate();
  const resetState = useTemplateFiltersModalStoreSelected.use.resetState();

  const activeTemplate = useMemo(() => getActiveTemplate(), [getActiveTemplate]);

  // Check if both dates are selected to enable the "Только измененные" checkbox
  const areDatesSelected = useMemo(() => {
    return Boolean(firstDate && secondDate);
  }, [firstDate, secondDate]);

  const rolesRaw: any = useRoles();
  const roles = useMemo(() => {
    const r = Array.isArray(rolesRaw) ? rolesRaw : rolesRaw?.roles ?? rolesRaw?.roleNames ?? [];
    const arr = Array.isArray(r) ? r.slice() : [];
    arr.sort();
    return arr;
  }, [Array.isArray(rolesRaw) ? rolesRaw.join('|') : JSON.stringify(rolesRaw)]);

  const {
    exploitationModeOptions,
    selectedExploitationModes,
    updateSelectedExploitationModes,
    setRoles,
  } = useExploitationModeStore();

  useEffect(() => {
    setRoles(roles);
  }, [setRoles, roles]);

  // Get templates loading state
  const { isLoading: isTemplatesLoading } = useTemplatesControllerGetTemplates({
    mode: selectedExploitationModes,
  });

  const fetchModelsByDate = useCallback(
    (date: string) => {
      const { selectedExploitationModes } = useExploitationModeStore.getState();
      setModelsDownloadingDate(date);

      const isCompleteDate = (value: string) => {
        if (!value) return false;
        if (value.includes('_')) return false;
        if (value.length !== 10) return false;
        const parsed = parse(value, 'dd.MM.yyyy', new Date());
        return isValid(parsed);
      };

      if (date && !isCompleteDate(date)) {
        return;
      }

      if (date) {
        setModelsParams({
          date: getISODateFormat(date),
          mode: selectedExploitationModes,
        });
      } else {
        setModelsParams({
          mode: selectedExploitationModes,
        });
      }

      setTimeout(() => {
        // Invalidate all queries that start with '/models' to ensure all instances get fresh data
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            return Array.isArray(queryKey) && queryKey[0] === '/models';
          },
        });
      }, 100);
    },
    [setModelsDownloadingDate],
  );

  const handleChange = useCallback(
    (name: string, value: string[]) => {
      setTopFilters({ ...topFilters, templates: [], [name]: value });
    },
    [topFilters, setTopFilters],
  );

  const handleResetFilters = useCallback(() => {
    resetFilters();
    setTopFilters({ ...topFilters, templates: [] });
    setFiltersResetCount();
    resetState();
    initializeFromTemplate(undefined);
    setPendingTemplate(undefined);
    // Reset column state (order, width, visibility, sort, pin)
    agGridApi?.resetColumnState();
    // Reset all filters
    agGridApi?.setFilterModel(null);
    // Optional: Reset column groups
    agGridApi?.resetColumnGroupState();
  }, [
    resetFilters,
    setTopFilters,
    topFilters,
    setFiltersResetCount,
    resetState,
    initializeFromTemplate,
    setPendingTemplate,
  ]);

  const handleChangeExploitationModes = useCallback(
    (value: string[]) => {
      updateSelectedExploitationModes(value);
    },
    [updateSelectedExploitationModes],
  );

  const location = useLocation();

  const isComparePage = useMemo(
    () => location.pathname === ROUTES.COMPARE_MODELS,
    [location.pathname],
  );

  useEffect(() => {
    setCompareMode(isComparePage);
  }, [isComparePage, setCompareMode]);

  return (
    <Container>
      <FiltersBox>
        <CustomSearchSelect
          id="objectTypeRegistry"
          maxRowCount={1}
          label="Тип объектов реестра:"
          name="objectTypeRegistry"
          options={modelsSelectOptions}
          selectedValues={topFilters.objectTypeRegistry}
          onChange={handleChange}
        />
        <TemplatesFilterInput
          activeTemplate={activeTemplate}
          templates={templates}
          loading={isTemplatesLoading}
        />
        {compareMode ? (
          <>
            <CustomDateField
              type="date"
              dimension="s"
              id="dates"
              label="Дата состояния реестра 1:"
              placeholder="Введите дату"
              dropContainerClassName="dropContainerClass"
              onChange={(e) => setFirstDate(e.target.value)}
            />
            <CustomDateField
              type="date"
              dimension="s"
              id="dates"
              label="Дата состояния реестра 2:"
              placeholder="Введите дату"
              dropContainerClassName="dropContainerClass"
              onChange={(e) => setSecondDate(e.target.value)}
            />
            <FilterButton
              onClick={handleUpdateCompareList}
              dimension="s"
              disabled={disabledCompare || compareModelsTableLoading}
            >
              {compareModelsTableLoading ? 'Загрузка' : 'Сравнить'}
            </FilterButton>
          </>
        ) : (
          <>
            <CustomSearchSelect
              id="exploitation"
              label="Режим эксплуатации:"
              name="exploitation"
              options={exploitationModeOptions}
              selectedValues={selectedExploitationModes}
              onChange={(_, value) => handleChangeExploitationModes(value)}
            />
            <CustomDateField
              type="date"
              dimension="s"
              id="modelsByDates"
              value={modelsDownloadingDate}
              label="Выгрузка на определенную дату:"
              placeholder="Введите дату"
              dropContainerClassName="dropContainerClass"
              displayClearIcon
              onChange={(e) => fetchModelsByDate(e.target.value)}
            />
          </>
        )}
      </FiltersBox>
      <FiltersBox style={{ gap: 16, marginTop: '21px' }}>
        <T font="Body/Body 2 Short">Режим сравнения:</T>
        <FiltersDivider />
        <Toggle
          checked={compareMode}
          dimension="s"
          labelPosition="right"
          onChange={(event) => {
            setCompareMode(event.target.checked);
            navigate(compareOnlyChanged ? ROUTES.MF_HOME_ROUTE : ROUTES.COMPARE_MODELS);
          }}
        >
          Включен
        </Toggle>
        <FiltersBox style={{ gap: 8 }}>
          {compareMode && (
            <>
              <Checkbox
                checked={compareOnlyChanged}
                dimension="s"
                disabled={!areDatesSelected}
                onChange={(event) => handleCompareOnlyChanged(event.target.checked)}
              />
              <T
                font="Body/Body 2 Short"
                style={{
                  opacity: areDatesSelected ? 1 : 0.5,
                  cursor: areDatesSelected ? 'default' : 'not-allowed',
                }}
              >
                Только измененные
              </T>
            </>
          )}
          <Button
            dimension="s"
            appearance="primary"
            onClick={handleResetFilters}
            style={{ padding: '0 7px' }}
          >
            <T font="Button/Button 2" color="Special/Static White" as="div">
              Очистить фильтры
            </T>
          </Button>
        </FiltersBox>
      </FiltersBox>
    </Container>
  );
};

