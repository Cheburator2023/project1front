import { useMemo } from 'react';
import { useTemplateFiltersModalStoreSelected } from '../stores/templateFiltersModalStore';
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

import { TemplateFiltersGrid } from './TemplateFiltersGrid';

export const TemplatesPanelContainer = () => {
  const openModal = useTemplateFiltersModalStoreSelected.use.openModal();

  const { topFilters, filterModel, firstDate, secondDate, columnsFilters } = useFiltersStore();

  const { templates } = useTemplatesStore();
  const { compareMode, rows } = useModelsStore();

  const activeFiltersCount = useMemo(
    () => getActiveFiltersCount(columnsFilters, templates, topFilters.templates[0]),
    [columnsFilters, templates, topFilters.templates],
  );

  const hasTemplates = topFilters.templates.length > 0;
  const activeTemplate = hasTemplates
    ? templates.find((t) => t.template_id?.toString() === topFilters.templates[0]?.toString())
    : undefined;

  const activeTemplateFromServiceFilterCount = Object.keys(
    activeTemplate?.filterModel || {},
  ).length;

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
            {activeFiltersCount + activeTemplateFromServiceFilterCount}
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

