import { IconButton } from '@admiral-ds/react-ui';
import { ReactComponent as SettingsIcon } from '@admiral-ds/icons/build/system/SettingsOutline.svg';
import { useMemo, useState } from 'react';
import { useTemplateFiltersModalStore } from './stores/templateFiltersModalStore';
import { TemplateFiltersModal } from './components/TemplateFiltersModal';
import {
  BadgeCount,
  ButtonCustom,
  CheckSolidCustom,
  FilterOutlineCustom,
} from '../../entities/FilterButtonCount/style';
import { useFiltersStore } from '../../shared/stores';
import { useTemplatesStore } from '../../shared/stores/templatesStore';
import { useTableModels } from '../Home/hooks';
import { getActiveFiltersCount } from '../../features/TemplateFilters/helpers';
// import { getActiveFiltersCount } from '../../shared/helpers';

export const TFiltersTest3 = () => {
  const templateFiltersModalStore = useTemplateFiltersModalStore();
  const { topFilters, filterModel } = useFiltersStore();
  const { templates, pendingTemplate } = useTemplatesStore();
  const activeFiltersCount = Object.keys(filterModel).length;

  const hasTemplates = topFilters.templates.length > 0;
  const activeTemplate = hasTemplates
    ? templates.find(t => t.template_id.toString() === topFilters.templates[0])
    : undefined;

  const hasActiveFilters = activeFiltersCount > 0;
  const hasNoActiveFilters = activeFiltersCount === 0;
  const isPendingTemplate = activeTemplate?.isPending || false;

  const buttonAppearance = hasTemplates ? 'primary' : 'white';
  const badgeAppearance = isPendingTemplate
    ? 'warning'
    : hasTemplates && hasActiveFilters
    ? 'info'
    : 'white';

  return (
    <div style={{ position: 'relative' }}>
      <ButtonCustom
        appearance={buttonAppearance}
        dimension="s"
        icon={<FilterOutlineCustom appearance={buttonAppearance} />}
        displayAsSquare
        onClick={() => templateFiltersModalStore.openModal()}
      />

      {hasTemplates && hasNoActiveFilters ? (
        <CheckSolidCustom />
      ) : (
        <BadgeCount appearance={badgeAppearance} dimension="s">
          {activeFiltersCount}
        </BadgeCount>
      )}

      <TemplateFiltersModal />
    </div>
  );
};

