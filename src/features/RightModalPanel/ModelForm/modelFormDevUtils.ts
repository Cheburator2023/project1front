/**
 * Отладочные подсказки и QA-панель формы модели: только dev-сборка и хост с подстрокой `innodev`.
 */
export function isModelFormInnoDevDebug(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    process.env.NODE_ENV === 'development' || window.location.hostname.includes('innodev')
  );
}
