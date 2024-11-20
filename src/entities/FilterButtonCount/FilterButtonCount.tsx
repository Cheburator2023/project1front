import React, { FC, useMemo } from 'react';
import { ACTIVE_SCREEN } from '@src/shared/constants';
import { ColumnsFilter, TopFilters } from '@src/shared/types';
import { Template } from '@src/shared/api/types';
import { getActiveFiltersCount } from '@src/shared/helpers';
import { BadgeCount, ButtonCustom, CheckSolidCustom, FilterOutlineCustom } from './style';

const getButtonApperance = (hasTemplates: boolean) => {
  return hasTemplates ? 'primary' : 'white';
};

const getBadgeApperance = (hasTemplates: boolean, hasActiveFilters: boolean) => {
  return hasTemplates && hasActiveFilters ? 'info' : 'white';
};

export interface FilterButtonCountProps {
  topFilters: TopFilters;
  updateActiveScreen: (newActiveScreen: ACTIVE_SCREEN) => void;
  activeScreen: ACTIVE_SCREEN;
  columnsFilters: Partial<ColumnsFilter>;
  templates: Template[];
}

export const FilterButtonCount: FC<FilterButtonCountProps> = ({
  topFilters,
  updateActiveScreen,
  activeScreen,
  columnsFilters,
  templates,
}) => {
  const activeFiltersCount = useMemo(
    () => getActiveFiltersCount(columnsFilters, templates, topFilters.templates[0]),
    [columnsFilters, templates, topFilters.templates],
  );

  const hasTemplates = topFilters.templates.length > 0;
  const hasActiveFilters = activeFiltersCount > 0;
  const hasNoActiveFilters = activeFiltersCount === 0;

  const buttonAppearance = getButtonApperance(hasTemplates);
  const badgeAppearance = getBadgeApperance(hasTemplates, hasActiveFilters);

  return (
    <div style={{ position: 'relative' }}>
      <ButtonCustom
        appearance={buttonAppearance}
        dimension="s"
        icon={<FilterOutlineCustom appearance={buttonAppearance} />}
        onClick={() => updateActiveScreen(activeScreen)}
        displayAsSquare
      />

      {hasTemplates && hasNoActiveFilters ? (
        <CheckSolidCustom />
      ) : (
        <BadgeCount appearance={badgeAppearance} dimension="s">
          {activeFiltersCount}
        </BadgeCount>
      )}
    </div>
  );
};

