import { IconButton } from '@admiral-ds/react-ui';
import { ReactComponent as SettingsIcon } from '@admiral-ds/icons/build/system/SettingsOutline.svg';
import { useMemo, useState } from 'react';
import {
  useTemplateFiltersModalStore,
  useTemplateFiltersModalStoreSelected,
} from '../stores/templateFiltersModalStore';
import { TemplateFiltersModal } from './TemplateFiltersModal';
import {
  BadgeCount,
  ButtonCustom,
  CheckSolidCustom,
  FilterOutlineCustom,
} from '../atoms/MiscStyledComponents';
import { useFiltersStore, useModelsStore } from '../../../shared/stores';
import { useTemplatesStore } from '../../../shared/stores/templatesStore';
import { getActiveFiltersCount } from '../../../shared/helpers';

import { useCompareModels } from '../../CompareModels/hooks';
import { TemplateFiltersGrid } from './TemplateFiltersGrid';

export const TemplatesPanelContainer = () => {
  const openModal = useTemplateFiltersModalStoreSelected.use.openModal();

  const { topFilters, filterModel, firstDate, secondDate } = useFiltersStore();
  const { templates } = useTemplatesStore();
  const { compareMode, rows } = useModelsStore();

  const activeFiltersCount = useMemo(
    () => getActiveFiltersCount(filterModel, templates, topFilters.templates[0]),
    [filterModel, templates, topFilters.templates],
  );

  const hasTemplates = topFilters.templates.length > 0;
  const activeTemplate = hasTemplates
    ? templates.find((t) => t.template_id.toString() === topFilters.templates[0])
    : undefined;

  const hasActiveFilters = activeFiltersCount > 0;
  const hasNoActiveFilters = activeFiltersCount === 0;
  const isPendingTemplate = activeTemplate?.isPending || false;
  const noData = !(firstDate && secondDate);
  const buttonAppearance = (!noData || !compareMode) && hasTemplates ? 'primary' : 'white';
  const badgeAppearance = isPendingTemplate
    ? 'warning'
    : hasTemplates && hasActiveFilters
    ? 'info'
    : 'white';

  return (
    <>
      <ButtonCustom
        appearance={buttonAppearance}
        dimension="s"
        icon={<FilterOutlineCustom appearance={buttonAppearance} />}
        displayAsSquare
        disabled={compareMode ? noData : !rows}
        onClick={() => openModal()}
      />

      {(!noData || !compareMode) &&
        (hasTemplates && hasNoActiveFilters ? (
          <CheckSolidCustom />
        ) : (
          <BadgeCount appearance={badgeAppearance} dimension="s">
            {activeFiltersCount}
          </BadgeCount>
        ))}
    </>
  );
};

export const TemplatesPanel = () => {
  const isOpen = useTemplateFiltersModalStoreSelected.use.isOpen();

  return (
    <div style={{ position: 'relative', top: 11 }}>
      <TemplatesPanelContainer />

      {isOpen && (
        <TemplateFiltersModal>
          <TemplateFiltersGrid />
        </TemplateFiltersModal>
      )}
    </div>
  );
};

