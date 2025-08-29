import { IconButton } from '@admiral-ds/react-ui';
import { ReactComponent as SettingsIcon } from '@admiral-ds/icons/build/system/SettingsOutline.svg';
import { useTemplateFiltersModalStore } from './stores/templateFiltersModalStore';
import { TemplateFiltersModal } from './components/TemplateFiltersModal';

export const TFiltersTest3 = () => {
  const { openModal } = useTemplateFiltersModalStore();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <h2>Управление шаблонами фильтрации</h2>
        <IconButton
          dimension="m"
          onClick={openModal}
          aria-label="Настройки фильтров"
        >
          <SettingsIcon />
        </IconButton>
      </div>

      <TemplateFiltersModal />
    </div>
  );
};

