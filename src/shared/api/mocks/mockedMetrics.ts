import { MetricsResponseType } from '../types';

export const mockedMetricsResponse: MetricsResponseType = {
  developedModels: {
    count: 361,
    delta: 0,
  },
  implementedModels: {
    count: 349,
    delta: 0,
  },
  sumRmModels: {
    count: 927,
    delta: 0,
  },
  pilots: {
    stage05A: 170,
    stage05B: 0,
  },
  finalStatusModels: {
    count: 375,
    delta: 0,
  },
  onMonitoringModels: {
    count: 38,
    delta: 0,
  },
  takenOutOfOperationModels: {
    count: 16,
    delta: 0,
  },
  tasks: {
    ds_lead: 12,
    ds: 18,
    de_lead: 8,
    de: 15,
    modelops_lead: 5,
    modelops: 9,
    mipm: 6,
    validator_lead: 7,
    validator: 10,
  },
  stalledModelsByMonth: [13, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  finalStatusByMonthModels: [1000, 1004, 1025, 1027, 1027, 1050, 1055, 1058, 1060, 1065, 1070, 1075],
  distributionByLifecycleStageModels: [
    ['Инициализация', 235],
    ['Внедрена', 207],
    ['Разработана, не внедрена', 166],
    ['Поиск данных', 3],
    ['Разработка модели', 190],
    ['Первичная валидация', 4],
    ['Модель неэффективна в БП Заказчика', 3],
    ['Данные', 10],
    ['Разработка витрины', 36],
    ['Отмена разработки модели', 11],
    ['Разработка промышленной витрины', 5],
    ['нет в сум', 1],
    ['Модель не эффективна в БП Заказчика', 1],
    ['Архив', 7],
    ['Сокращенное заведение разработанных моделей', 14],
    ['Пилотирование модели', 2],
    ['Настройка среды применения', 1],
    ['Вывод модели из эксплуатации', 2],
    ['Продуктивизация модели', 2],
    ['Тестирование на препрод и перенос на прод контур', 1],
  ],
  totalModels: {
    count: 710,
    delta: 0,
  },
  registryCoverageModels: {
    countPercent: 77,
    deltaPercent: 0,
  },
  riskCoverageFinalStatusModels: {
    countPercent: 40,
    deltaPercent: 0,
  },
};