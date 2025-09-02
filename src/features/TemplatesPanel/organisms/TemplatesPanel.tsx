import { IconButton } from '@admiral-ds/react-ui';
import { ReactComponent as SettingsIcon } from '@admiral-ds/icons/build/system/SettingsOutline.svg';
import { useMemo, useState } from 'react';
import { useTemplateFiltersModalStore } from '../stores/templateFiltersModalStore';
import { TemplateFiltersModal } from '../molecules/TemplateFiltersModal';
import {
  BadgeCount,
  ButtonCustom,
  CheckSolidCustom,
  FilterOutlineCustom,
} from '../atoms/MiscStyledComponents';
import { useFiltersStore } from '../../../shared/stores';
import { useTemplatesStore } from '../../../shared/stores/templatesStore';
import { getActiveFiltersCount } from '../../../shared/helpers';
import { useTableModels } from '../../../pages/HomePage/hooks/useTableModels';
import { useCompareModels } from '../../CompareModels/hooks';

export const TemplatesPanel = () => {
  const templateFiltersModalStore = useTemplateFiltersModalStore();
  const { topFilters, filterModel, firstDate, secondDate } = useFiltersStore();
  const { templates } = useTemplatesStore();
  const { modelsTable } = useTableModels();
  const { compareModelsTable } = useCompareModels();
  const { rowList, columnList, totalRows, setTotalRows } = compareModelsTable;

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
  const noData = !(totalRows > 0 && firstDate && secondDate);
  const buttonAppearance = !noData && hasTemplates ? 'primary' : 'white';
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
        disabled={noData}
        onClick={() => templateFiltersModalStore.openModal()}
      />

      {!noData &&
        (hasTemplates && hasNoActiveFilters ? (
          <CheckSolidCustom />
        ) : (
          <BadgeCount appearance={badgeAppearance} dimension="s">
            {activeFiltersCount}
          </BadgeCount>
        ))}

      <TemplateFiltersModal />
    </div>
  );
};

