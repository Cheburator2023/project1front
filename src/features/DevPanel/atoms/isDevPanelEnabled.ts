/**
 * Отладочные инструменты активны только на dev-сборке или на хосте с подстрокой `innodev`.
 */
export const isDevPanelEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    process.env.NODE_ENV === 'development' || window.location.hostname.includes('innodev')
  );
};
