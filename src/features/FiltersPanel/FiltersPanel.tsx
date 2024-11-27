import React, { useContext } from 'react';
import { Button, Checkbox, T, Toggle } from '@admiral-ds/react-ui';
import { Template, FiltersContext } from '@shared/api';
import { CustomSearchSelect } from '@shared/ui/organisms';
import {
  ACTIVE_SCREEN,
  RIGHT_PANEL_TYPE,
  exploitationSelectOptions,
  initialColumnsFilters,
  modelsSelectOptions,
} from '@shared/constants';
import { TemplatesFilter, FilterButtonCount } from '@entities';

import { Container, CustomDateField, FiltersDivider, FilterButton, FiltersBox } from './styles';

export interface FiltersPanelProps {
  compareMode?: boolean;
  compareOnlyChanged?: boolean;
  disabledCompare?: boolean;
  handleChangeCompare: (checked: boolean) => void;
  handleCompareOnlyChanged?: (checked: boolean) => void;
  handleUpdateCompareList?: () => void;
  templates: Template[];
  updateActiveScreen: (newActiveScreen: ACTIVE_SCREEN) => void;
  updateRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
}

export const FiltersPanel = ({
  compareMode = false,
  compareOnlyChanged = false,
  disabledCompare = true,
  handleChangeCompare,
  handleUpdateCompareList = () => null,
  handleCompareOnlyChanged = () => null,
  templates,
  updateActiveScreen,
  updateRightPanelType,
}: FiltersPanelProps) => {
  const {
    topFilters,
    modelsDownloadingDate,
    onChangeModelDownloadingDate,
    onChangeColumnsFilters,
    onChangeTopFilters,
    onChangeFirstDate,
    onChangeSecondDate,
    columnsFilters,
  } = useContext(FiltersContext);

  const handleChange = (name: string, value: string[]) => {
    onChangeTopFilters({ ...topFilters, templates: [], [name]: value });
  };

  const handleResetFilters = () => {
    onChangeColumnsFilters(initialColumnsFilters);
    onChangeTopFilters({ ...topFilters, templates: [] });
  };

  return (
    <Container style={{ justifyContent: 'space-between' }}>
      <FiltersBox>
        <div style={{ marginTop: '24px', marginRight: '20px' }}>
          <FilterButtonCount
            topFilters={topFilters}
            updateActiveScreen={updateActiveScreen}
            columnsFilters={columnsFilters}
            activeScreen={ACTIVE_SCREEN.TEMPLATE_FILTERS}
            templates={templates}
          />
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
        <TemplatesFilter templates={templates} updateRightPanelType={updateRightPanelType} />
        {compareMode ? (
          <>
            <CustomDateField
              type="date"
              dimension="s"
              id="dates"
              label="Дата состояния реестра 1:"
              placeholder="Введите дату"
              dropContainerClassName="dropContainerClass"
              onChange={(e) => onChangeFirstDate(e.target.value)}
            />
            <CustomDateField
              type="date"
              dimension="s"
              id="dates"
              label="Дата состояния реестра 2:"
              placeholder="Введите дату"
              dropContainerClassName="dropContainerClass"
              onChange={(e) => onChangeSecondDate(e.target.value)}
            />
            <FilterButton
              onClick={handleUpdateCompareList}
              dimension="s"
              disabled={disabledCompare}
            >
              Сравнить
            </FilterButton>
          </>
        ) : (
          <>
            <CustomSearchSelect
              id="exploitation"
              maxRowCount={1}
              label="Режим эксплуатации:"
              name="exploitation"
              options={exploitationSelectOptions}
              selectedValues={topFilters.exploitation}
              onChange={handleChange}
            />
            <CustomDateField
              type="date"
              dimension="s"
              id="modelsByDates"
              value={modelsDownloadingDate}
              label="Выгрузка на определенную дату:"
              placeholder="Введите дату"
              dropContainerClassName="dropContainerClass"
              onChange={(e) => onChangeModelDownloadingDate(e.target.value)}
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
