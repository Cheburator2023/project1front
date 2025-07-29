type FrameSizeType =
  | 'stat-sm'
  | 'stat-md'
  | 'stat-lg'
  | 'chart-sm'
  | 'chart-md'
  | 'chart-lg';

type StatisticDataProps = {
  caption: string;
  value: number;
  delta: number;
  relative?: boolean;
};

enum MetricsCaption {
  KPI_SUM = 'КПЭ СУМ',
  TOTAL_MODELS = 'Всего моделей',
  IMPLEMENTED_MODELS = 'Внедренные модели',
  DEVELOPED_MODELS = 'Разработанные модели',
  SUM_RM_MODELS = 'Модели в MPM СУМ',
  FINAL_STATUS_MODELS = 'Модели с финальным статусом',
  REGISTRY_COVERAGE_MODELS = 'Доля моделей, покрытых системой управления моделями',
  RISK_COVERAGE_FINAL_STATUS_MODELS = 'Доля моделей, покрытых системой управления моделями, с финальным статусом',
  ON_MONITORING_MODELS = 'Модели на мониторинге',
  TAKEN_OUT_OF_OPERATION_MODELS = 'Кол-во моделей, выведенных из эксп.',
  FINAL_STATUS_BY_MONTH_MODELS = 'Динамика моделей с финальным статусом',
  STALLED_MODLES_BY_MONTH = 'Количество моделей, которые не продвигаются больше 5 дней',
  DISTRIBUTION_BY_LIFECYCLE_STAGE_MODELS = 'Распределение моделей по этапам жцм',
  PILOTS = 'Пилоты',
  DYNAMIC_BY_STREAMS_MODELS = 'Динамика задач по моделям в разрезе ролей',
}

enum MetricsEnum {
  ImplementedModelsMetric = 'implementedModels',
  DevelopedModelsMetric = 'developedModels',
  MrmModelsMetric = 'sumRmModels',
  // PilotsMetric = 'pilots',
  TasksMetric = 'tasks',
  TakenOutOfOperationModelsMetric = 'takenOutOfOperationModels',
  StalledModelsByMonthMetric = 'stalledModelsByMonth',
  // RiskCoverageFinalStatusModelsMetric = 'riskCoverageFinalStatusModels',
  // RegistryCoverageModelsMetric = 'registryCoverageModels',
  OnMonitoringModelsMetric = 'onMonitoringModels',
  // FinalStatusModelsMetric = 'finalStatusModels',
  // FinalStatusByMonthModelsMetric = 'finalStatusByMonthModels',
  // DistributionByLifecycleStageModelsMetric = 'distributionByLifecycleStageModels',
}

export { MetricsEnum, StatisticDataProps, MetricsCaption, FrameSizeType }