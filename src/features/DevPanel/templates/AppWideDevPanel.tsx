import { useLocation } from 'react-router-dom';
import { DevPanelShell } from '../atoms/DevPanelShell';
import { isDevPanelEnabled } from '../atoms/isDevPanelEnabled';
import { SeedPimTool } from '../organisms/SeedPimTool';

/**
 * App-wide dev-панель. Выбирает инструмент по текущему роуту.
 * Видна только на dev-сборке и хостах `innodev`.
 */
export const AppWideDevPanel = () => {
  const { pathname } = useLocation();

  if (!isDevPanelEnabled()) {
    return null;
  }

  if (pathname.includes('/allocation-confirmation')) {
    return (
      <DevPanelShell title="Dev · Seed PIM" launcherLabel="🧪 Seed PIM" width={620}>
        <SeedPimTool />
      </DevPanelShell>
    );
  }

  return null;
};
