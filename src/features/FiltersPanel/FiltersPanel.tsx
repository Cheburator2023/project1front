import React, { useContext } from 'react';
import { Checkbox, T, Toggle } from '@admiral-ds/react-ui';
import { ReactComponent as FilterOutline } from '@admiral-ds/icons/build/system/FilterOutline.svg';

import { Template, FiltersContext } from '@shared/api';
import { CustomSearchSelect } from '@shared/ui/organisms';
import {
  ACTIVE_SCREEN,
  RIGHT_PANEL_TYPE,
  exploitationSelectOptions,
  modelsSelectOptions,
} from '@shared/constants';
import { TemplatesFilter } from '@entities';

import { Container, CustomDateField, FiltersDivider, FilterButton, FiltersBox } from './styles';

export interface FiltersPanelProps {
  compareMode?: boolean;
  compareOnlyChanged?: boolean;
  handleChangeCompare: (checked: boolean) => void;
  handleCompareOnlyChanged?: (checked: boolean) => void;
  templates: Template[];
  updateActiveScreen: React.Dispatch<React.SetStateAction<ACTIVE_SCREEN>>;
  updateRightPanelType: (value: React.SetStateAction<RIGHT_PANEL_TYPE | null>) => void;
}

export const FiltersPanel = ({
  compareMode = false,
  compareOnlyChanged = false,
  handleChangeCompare,
  handleCompareOnlyChanged = () => null,
  templates,
  updateActiveScreen,
  updateRightPanelType,
}: FiltersPanelProps) => {
  const { topFilters, onChangeTopFilters, onChangeFirstDate, onChangeSecondDate } =
    useContext(FiltersContext);

  const handleChange = (name: string, value: string[]) =>
    onChangeTopFilters({ ...topFilters, templates: [], [name]: value });

  return (
    <Container style={{ justifyContent: 'space-between' }}>
      <FiltersBox>
        <FilterButton
          dimension="s"
          icon={<FilterOutline />}
          onClick={() => updateActiveScreen(ACTIVE_SCREEN.TEMPLATE_FILTERS)}
          appearance={topFilters.templates.length ? 'success' : 'primary'}
          displayAsSquare
        />
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
        </FiltersBox>
      </FiltersBox>
    </Container>
  );
};
