import React from 'react';
import { Button, Checkbox, T, Toggle } from '@admiral-ds/react-ui';
import { Template } from '@shared/api';
import { useFiltersStore } from '@shared/stores/filtersStore';
import { CustomSearchSelect } from '@shared/ui/organisms';
import { useExploitationModeStore, useModelsStore, useTemplatesStore } from '@src/shared/stores';
import { ACTIVE_SCREEN, RIGHT_PANEL_TYPE, modelsSelectOptions } from '@shared/constants';

import { Container, CustomDateField, FiltersDivider, FilterButton, FiltersBox } from '../styles';
import { useGlobalStore } from '../../../shared/stores/globalStore';
import { useTableModels } from '../../../pages/Home/hooks';
import { TemplatesPanel } from '../../TemplatesPanel/organisms/TemplatesPanel';
import { TemplatesFilterInput } from '../molecules/TemplatesFilterInput';
import { useTemplateFiltersModalStore } from '../../TemplatesPanel/stores/templateFiltersModalStore';

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
  const { pendingTemplate, setPendingTemplate } = useTemplatesStore();
  const { filters, fetchModelsByDate } = useTableModels();

  const templates = filters?.templates;

  const { compareMode, setActiveScreen, setRightPanelType, handleChangeCompare } = useModelsStore();
  const {
    topFilters,
    modelsDownloadingDate,
    setModelsDownloadingDate,
    setTopFilters,
    setFirstDate,
    setSecondDate,
    resetFilters,
    filterModel,
  } = useFiltersStore();
  const { setFiltersResetCount } = useGlobalStore();
  const { getActiveTemplate } = useFiltersStore();
  const { initializeFromTemplate, resetState } = useTemplateFiltersModalStore();

  const activeTemplate = getActiveTemplate();

  const { exploitationModeOptions, selectedExploitationModes, updateSelectedExploitationModes } =
    useExploitationModeStore();

  const handleChange = (name: string, value: string[]) => {
    setTopFilters({ ...topFilters, templates: [], [name]: value });
  };

  const handleResetFilters = () => {
    resetFilters();
    setTopFilters({ ...topFilters, templates: [] });
    setFiltersResetCount();
    resetState();
    initializeFromTemplate(undefined);
    setPendingTemplate(undefined);
  };

  const handleChangeExploitationModes = (value: string[]) => {
    updateSelectedExploitationModes(value);
  };

  return (
    <Container style={{ justifyContent: 'space-between' }}>
      <FiltersBox>
        <div style={{ marginTop: '24px', marginRight: '20px' }}>
          <TemplatesPanel />
        </div>

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
          updateRightPanelType={setRightPanelType}
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
          onChange={(event) => handleChangeCompare(event.target.checked)}
        >
          Включен
        </Toggle>
        <FiltersBox style={{ gap: 8 }}>
          <Checkbox
            checked={compareOnlyChanged}
            dimension="s"
            disabled={!compareMode}
            onChange={(event) => handleCompareOnlyChanged(event.target.checked)}
          />
          <T font="Body/Body 2 Short">Только измененные</T>
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

