import React, { useContext } from 'react';

import { ReactComponent as FilterOutline } from '@admiral-ds/icons/build/system/FilterOutline.svg';

import {
  Container,
  CustomSearchSelect,
  CustomToggle,
  CustomDateField,
  FilterButton,
} from './styles';

import { exploitationSelectOptions, modelsSelectOptions } from './constants';
import { TemplatesFilter } from './TemplatesFilter';
import { FiltersContext } from '../FiltersContext';
import { ACTIVE_SCREEN, RIGHT_PANEL_TYPE } from '../types';
import { Template } from 'src/api/types';

interface FiltersPanelProps {
  templates: Template[];
  updateActiveScreen: React.Dispatch<React.SetStateAction<ACTIVE_SCREEN>>;
  updateRightPanelType: (value: React.SetStateAction<RIGHT_PANEL_TYPE | null>) => void;
}

export const FiltersPanel = ({
  templates,
  updateActiveScreen,
  updateRightPanelType,
}: FiltersPanelProps) => {
  const { topFilters, onChangeTopFilters } = useContext(FiltersContext);

  const handleChange = (name: string, value: string[]) =>
    onChangeTopFilters({ ...topFilters, templates: [], [name]: value });

  return (
    <Container>
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
      <CustomDateField
        type="date-range"
        dimension="s"
        id="dates"
        label="Даты состояния реестра:"
        placeholder="Введите отрезок времени"
        dropContainerClassName="dropContainerClass"
        // onChange={() => }
      />
      {/* <TagsFilter
          options={tagsSelectOptions}
          initSelectValues={['Дозаполнить атрибуты', 'Требуется валидация']}
          onChange={() => null}
        /> */}
      <CustomSearchSelect
        id="exploitation"
        maxRowCount={1}
        label="Режим эксплуатации:"
        name="exploitation"
        options={exploitationSelectOptions}
        selectedValues={topFilters.exploitation}
        onChange={handleChange}
      />
      <CustomToggle dimension="s" labelPosition="left">
        Взаимосвязи
      </CustomToggle>
    </Container>
  );
};
