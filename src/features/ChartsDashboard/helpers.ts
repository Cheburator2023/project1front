import { ModelSource, ModelStatus, Row } from '@src/shared/types';
import { MetricsDeltas, MetricsModels } from './types';
import { format, getMonth, isValid, isWithinInterval, parse, parseISO, subDays } from 'date-fns';

class MetricsAggregator {
  // Константа, определяющая количество дней в неделе
  private static readonly DAYS_IN_WEEK = 7;

  // Поле, которое хранит массив моделей, переданных в конструктор
  private models: Array<Partial<Row>>;

  // Конструктор, который инициализирует поле models
  constructor(models: Array<Partial<Row>> = []) {
    this.models = models;
  }

  // Метод для агрегации метрик по текущему, предыдущему и общему периоду
  public aggregate(
    startDate?: string,
    endDate?: string,
    selectedStream: string = 'Все стримы',
  ): {
    currentMetrics: MetricsModels;
    previousMetrics: MetricsModels;
    totalMetrics: MetricsModels;
  } {
    const currentMetrics = this.initializeMetrics();
    const previousMetrics = this.initializeMetrics();
    const totalMetrics = this.initializeMetrics();

    const parsedStartDate = this.getStartDate(startDate); // Получаем начальную дату
    const parsedEndDate = this.getEndDate(endDate); // Получаем конечную дату
    const parsedPreviousDate = subDays(parsedEndDate, MetricsAggregator.DAYS_IN_WEEK); // Получаем дату за 7 дней до конечной даты

    // Флаг, указывающий, что был задан временный срез
    const isDateRange = !!startDate && !!endDate;

    // Обработка каждой модели для обновления соответствующих метрик
    this.models.forEach((model) => {
      // Фильтруем модели по стримам
      if (!this.isModelInSelectedStream(model, selectedStream)) {
        return;
      }

      // Обновляем метрики для текущего временного среза на основе даты создания модели
      this.updateMetricsBasedOnDate(model, parsedEndDate, currentMetrics);

      // Обновляем метрики для временного среза 7 дней назад
      this.updateMetricsBasedOnDate(model, parsedPreviousDate, previousMetrics);

      // Обновляем totalMetrics на основе временного среза
      this.updateTotalMetrics(model, parsedStartDate, parsedEndDate, totalMetrics, isDateRange);
    });

    // Финальный расчет метрик
    this.finalizeMetrics(currentMetrics);
    this.finalizeMetrics(previousMetrics);
    this.finalizeMetrics(totalMetrics);

    return { currentMetrics, previousMetrics, totalMetrics };
  }

  // Метод для расчета разницы между текущими и предыдущими метриками
  public calculateDeltas(
    currentMetrics: MetricsModels,
    previousMetrics: MetricsModels,
  ): MetricsDeltas {
    const calculateDelta = (current: number, previous: number): number => {
      return current - previous;
    };

    const calculatePercentageDelta = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      const difference = current - previous;
      return Math.round((difference / previous) * 100);
    };

    const deltas = {
      totalModelsDelta: calculateDelta(currentMetrics.totalModels, previousMetrics.totalModels),
      implementedModelsDelta: calculateDelta(
        currentMetrics.implementedModels,
        previousMetrics.implementedModels,
      ),
      developedModelsDelta: calculateDelta(
        currentMetrics.developedModels,
        previousMetrics.developedModels,
      ),
      sumRmModelsDelta: calculateDelta(currentMetrics.sumRmModels, previousMetrics.sumRmModels),
      finalStatusModelsDelta: calculateDelta(
        currentMetrics.finalStatusModels,
        previousMetrics.finalStatusModels,
      ),
      riskCoverageFinalStatusModelsDelta: calculatePercentageDelta(
        currentMetrics.riskCoverageFinalStatusModels,
        previousMetrics.riskCoverageFinalStatusModels,
      ),
      registryCoverageModelsDelta: calculatePercentageDelta(
        currentMetrics.registryCoverageModels,
        previousMetrics.registryCoverageModels,
      ),
      onMonitoringModelsDelta: calculatePercentageDelta(
        currentMetrics.onMonitoringModels,
        previousMetrics.onMonitoringModels,
      ),
      takenOutOfOperationModelsDelta: calculatePercentageDelta(
        currentMetrics.takenOutOfOperationModels,
        previousMetrics.takenOutOfOperationModels,
      ),
    };

    return deltas;
  }

  // Метод для инициализации структуры данных для хранения метрик
  private initializeMetrics(): MetricsModels {
    return {
      developedModels: 0,
      implementedModels: 0,
      finalStatusModels: 0,
      sumRmModels: 0,
      totalModels: 0,
      registryCoverageModels: 0,
      riskCoverageFinalStatusModels: 0,
      onMonitoringModels: 0,
      takenOutOfOperationModels: 0,
      stage05A: 0,
      stage05B: 0,
      finalStatusByMonthModels: new Array(12).fill(0),
      stalledModelsByMonth: Array(12).fill(0),
      lifecycleStageDistribution: {
        initialization: 0,
        dataPilot: 0,
        dataSearch: 0,
        model: 0,
        dataBuild: 0,
        integration: 0,
      },
    };
  }

  private isModelInSelectedStream(model: Partial<Row>, selectedStream: string): boolean {
    return selectedStream === 'Все стримы' || model.ds_stream === selectedStream;
  }

  // Метод для получения начальной даты агрегации
  private getStartDate(startDate?: string): Date {
    // Вычисляем дату начала периода по умолчанию (7 дней назад от текущей даты)
    const defaultStartDate = subDays(new Date(), MetricsAggregator.DAYS_IN_WEEK);
    return startDate ? parseISO(startDate) : defaultStartDate;
  }

  // Метод для получения конечной даты агрегации
  private getEndDate(endDate?: string): Date {
    return endDate ? parseISO(endDate) : new Date();
  }

  // Метод для обновления метрик на основе даты создания модели
  private updateMetricsBasedOnDate(model: Partial<Row>, targetDate: Date, metrics: MetricsModels) {
    if (!model.create_date) return;

    const createDate = parseISO(model.create_date);

    if (createDate <= targetDate) {
      this.updateMetrics(metrics, model);
    }
  }

  // Метод для обновления totalMetrics на основе наличия пользовательского временного интервала
  private updateTotalMetrics(
    model: Partial<Row>,
    parsedStartDate: Date,
    parsedEndDate: Date,
    totalMetrics: MetricsModels,
    isDateRange: boolean,
  ) {
    if (!model.create_date) return;

    const createDate = parseISO(model.create_date);

    if (isDateRange) {
      // Если временной срез задан, учитываем только модели в рамках этого интервала
      if (
        isWithinInterval(createDate, {
          start: parsedStartDate,
          end: parsedEndDate,
        })
      ) {
        this.updateMetrics(totalMetrics, model);
      }
    } else {
      // Если временной срез не задан, учитываем все модели для totalMetrics
      this.updateMetrics(totalMetrics, model);
    }
  }

  // Метод для финализации общих метрик
  private finalizeMetrics(metrics: MetricsModels) {
    this.calculateTotalModels(metrics);
    this.calculateRiskCoverage(metrics);
    this.calculateRegistryCoverage(metrics);
  }

  // Метод для обновления метрик на основе данных модели
  private updateMetrics(metrics: MetricsModels, model: Partial<Row>) {
    if (this.isDevelopedModel(model)) metrics.developedModels++;
    if (this.isImplementedModel(model)) metrics.implementedModels++;
    if (this.isFinalStatusModel(model)) {
      metrics.finalStatusModels++;
      // Определяем месяц создания модели, метод getMonth возвращает индекс месяц
      const monthIndex = getMonth(parseISO(model.create_date!));
      metrics.finalStatusByMonthModels[monthIndex]++;
    }
    if (this.isSumRmModel(model)) metrics.sumRmModels++;
    if (this.isOnMonitoring(model)) metrics.onMonitoringModels++;
    if (this.isTakenOutOfOperation(model)) metrics.takenOutOfOperationModels++;
    if (this.isStage05A(model)) metrics.stage05A++;
    // if (this.isStage05B(model)) metrics.stage05B++;
    if (this.isStalledModel(model)) {
      const monthIndex = getMonth(parseISO(model.update_date!));
      metrics.stalledModelsByMonth[monthIndex]++;
    }
    this.updateLifecycleStageDistrubution(metrics, model.model_status!);
  }

  // Метод для расчета общего количества моделей, поддерживает один или два набора данных
  private calculateTotalModels(currentMetrics: MetricsModels, previousMetrics?: MetricsModels) {
    currentMetrics.totalModels = currentMetrics.developedModels + currentMetrics.implementedModels;
    if (previousMetrics) {
      previousMetrics.totalModels =
        previousMetrics.developedModels + previousMetrics.implementedModels;
    }
  }

  // Метод для расчета покрытия рисков для моделей с финальным статусом, поддерживает один или два набора данных
  private calculateRiskCoverage(currentMetrics: MetricsModels, previousMetrics?: MetricsModels) {
    currentMetrics.riskCoverageFinalStatusModels =
      this.getRiskCoverageWithFinalStatus(currentMetrics);
    if (previousMetrics) {
      previousMetrics.riskCoverageFinalStatusModels =
        this.getRiskCoverageWithFinalStatus(previousMetrics);
    }
  }

  // Метод для расчета покрытия реестра моделей, поддерживает один или два набора данных
  private calculateRegistryCoverage(
    currentMetrics: MetricsModels,
    previousMetrics?: MetricsModels,
  ) {
    currentMetrics.registryCoverageModels = this.getModelsRegistryCoverage(currentMetrics);
    if (previousMetrics) {
      previousMetrics.registryCoverageModels = this.getModelsRegistryCoverage(previousMetrics);
    }
  }

  // Метод для определения, является ли модель разработанной, но не внедренной
  private isDevelopedModel(model: Partial<Row>): boolean {
    return (
      model.solution_to_implement_model === ModelStatus.NOT_IMPLEMENTED ||
      model.model_status === ModelStatus.DEVELOPED_NOT_IMPLEMENTED
    );
  }

  // Метод для определения, является ли модель внедренной
  private isImplementedModel(model: Partial<Row>): boolean {
    return (
      model.solution_to_implement_model === ModelStatus.IN_IMPLEMENTATION ||
      model.model_status === ModelStatus.IMPLEMENTED_IN_PIM ||
      model.model_status === ModelStatus.IMPLEMENTED_OUTSIDE_PIM
    );
  }

  // Метод для определения, имеет ли модель финальный статус
  private isFinalStatusModel(model: Partial<Row>): boolean {
    return (
      model.solution_to_implement_model === ModelStatus.IN_IMPLEMENTATION ||
      model.model_status === ModelStatus.IMPLEMENTED_IN_PIM ||
      model.model_status === ModelStatus.IMPLEMENTED_OUTSIDE_PIM ||
      model.model_status === ModelStatus.DEVELOPED_NOT_IMPLEMENTED ||
      model.model_status === ModelStatus.NOT_EFFECTIVE ||
      model.model_status === ModelStatus.DECOMMISSIONED
    );
  }

  // Метод для определения, является ли модель источником SumRM
  private isSumRmModel(model: Partial<Row>): boolean {
    return model.model_source === ModelSource.SUM_RM;
  }

  // Метод для расчета покрытия реестра моделей
  private getModelsRegistryCoverage(metrics: MetricsModels): number {
    if (metrics.totalModels === 0) return 0;
    return Math.round((metrics.sumRmModels / metrics.totalModels) * 100);
  }

  // Метод для расчета покрытия рисков моделей с финальным статусом
  private getRiskCoverageWithFinalStatus(metrics: MetricsModels): number {
    if (metrics.totalModels === 0) return 0;
    return Math.round((metrics.finalStatusModels / metrics.totalModels) * 100);
  }

  // Метод для определения, находится ли модель на мониторинге
  private isOnMonitoring(model: Partial<Row>): boolean {
    return model.model_epic_12 !== null && model.model_epic_12 !== undefined;
  }

  // Метод для определения, снята ли модель с эксплуатации
  private isTakenOutOfOperation(model: Partial<Row>): boolean {
    return model.active_model === '0';
  }

  private isStage05A(model: Partial<Row>): boolean {
    return model.model_epic_05a !== null && model.model_epic_05a !== undefined;
  }

  private isStalledModel(model: Partial<Row>): boolean {
    if (!model.update_date) return false;

    const updateDate = parseISO(model.update_date);

    // Получаем текущую дату
    const today = new Date();
    // Вычисляем количество дней, прошедших с последнего обновления модели
    const diffDays = Math.floor((today.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24));
    // Если прошло более 5 дней, возвращаем true, иначе false
    return diffDays > 5;
  }

  private updateLifecycleStageDistrubution(metrics: MetricsModels, status: string) {
    switch (status) {
      case 'initialization':
        metrics.lifecycleStageDistribution.initialization++;
        break;
      case 'data_pilot':
        metrics.lifecycleStageDistribution.dataPilot++;
        break;
      case 'data_search':
        metrics.lifecycleStageDistribution.dataSearch++;
        break;
      case 'model':
        metrics.lifecycleStageDistribution.model++;
        break;
      case 'data_build':
        metrics.lifecycleStageDistribution.dataBuild++;
        break;
      case 'integration':
        metrics.lifecycleStageDistribution.integration++;
        break;
      default:
        break;
    }
  }
}

const rnd = (min: number, max: number): number => {
  return min + Math.floor((max - min + 1) * Math.random());
};

const getPositiveDelta = (delta: number): number => {
  return delta > 0 ? delta : 0;
};

const generateChartData = (delta: number): number[] => {
  const metricValue = Math.abs(delta);

  if (metricValue === 0) {
    return [0, 0, 0, 0];
  }

  const firstValue = Math.floor(metricValue * 0.05);
  const secondValue = Math.floor(metricValue * 0.15);
  const thirdValue = Math.floor(metricValue * 0.75);

  if (delta > 0) {
    return [firstValue, secondValue, thirdValue, metricValue];
  } else {
    return [metricValue, thirdValue, secondValue, firstValue];
  }
};

const switchDateFormat = (dateString: string) => {
  if (dateString.includes('.')) {
    const parsedDate = parse(dateString, 'dd.MM.yyyy', new Date());

    return format(parsedDate, 'yyyy-MM-dd');
  }

  if (dateString.includes('-')) {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());

    return format(parsedDate, 'yyyy-MM-dd');
  }

  return dateString;
};

const validateDateRange = (startDate: string, endDate: string): boolean => {
  const parsedStartDate = parse(startDate, 'dd.MM.yyyy', new Date());
  const parsedEndDate = parse(endDate, 'dd.MM.yyyy', new Date());

  return isValid(parsedStartDate) && isValid(parsedEndDate);
};

export {
  MetricsAggregator,
  rnd,
  getPositiveDelta,
  generateChartData,
  switchDateFormat,
  validateDateRange,
};

