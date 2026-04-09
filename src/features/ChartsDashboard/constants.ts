/* eslint-disable object-shorthand */
/* eslint-disable func-names */
import { SELECT_TYPE, SelectStringProps } from '@src/shared/ui/organisms';
import * as Highcharts from 'highcharts';
import { MetricsCaption, MetricsEnum } from './types';

const metricLabelMap: Record<string, string> = {
  // Основные метрики (существующие)
  [MetricsEnum.ImplementedModelsMetric]: MetricsCaption.IMPLEMENTED_MODELS,
  [MetricsEnum.DevelopedModelsMetric]: MetricsCaption.DEVELOPED_MODELS,
  [MetricsEnum.MrmModelsMetric]: MetricsCaption.SUM_RM_MODELS,
  [MetricsEnum.TasksMetric]: MetricsCaption.DYNAMIC_BY_STREAMS_MODELS,
  [MetricsEnum.TakenOutOfOperationModelsMetric]: MetricsCaption.TAKEN_OUT_OF_OPERATION_MODELS,
  [MetricsEnum.StalledModelsByMonthMetric]: MetricsCaption.STALLED_MODLES_BY_MONTH,
  [MetricsEnum.OnMonitoringModelsMetric]: MetricsCaption.ON_MONITORING_MODELS,
  [MetricsEnum.FinalStatusModelsMetric]: MetricsCaption.FINAL_STATUS_MODELS,
  [MetricsEnum.FinalStatusByMonthModelsMetric]: MetricsCaption.FINAL_STATUS_BY_MONTH_MODELS,
  [MetricsEnum.DistributionByLifecycleStageModelsMetric]:
    MetricsCaption.DISTRIBUTION_BY_LIFECYCLE_STAGE_MODELS,

  // Delta метрики (новые)
  [`${MetricsEnum.ImplementedModelsMetric}_delta`]: MetricsCaption.IMPLEMENTED_MODELS_DELTA,
  [`${MetricsEnum.DevelopedModelsMetric}_delta`]: MetricsCaption.DEVELOPED_MODELS_DELTA,
  [`${MetricsEnum.MrmModelsMetric}_delta`]: MetricsCaption.SUM_RM_MODELS_DELTA,
  [`${MetricsEnum.OnMonitoringModelsMetric}_delta`]: MetricsCaption.ON_MONITORING_MODELS_DELTA,
  [`${MetricsEnum.TakenOutOfOperationModelsMetric}_delta`]:
    MetricsCaption.TAKEN_OUT_OF_OPERATION_MODELS_DELTA,
  [`${MetricsEnum.FinalStatusModelsMetric}_delta`]: MetricsCaption.FINAL_STATUS_MODELS_DELTA,
};

const itemsExport = [
  { id: 'pdf', label: 'Экспортировать в PDF', value: 'PDF' },
  { id: 'png', label: 'Экспортировать в PNG', value: 'PNG' },
];

const dsStreamArtifactOptions = {
  type: SELECT_TYPE.STRING,
  options: [
    {
      value: 'Моделирование РБ',
      text: 'Моделирование РБ',
    },
    {
      value: 'Разработка моделей для КМБ и КСБ',
      text: 'Разработка моделей для КМБ и КСБ',
    },
    {
      value: 'Моделирование RnD',
      text: 'Моделирование RnD',
    },
    {
      value: 'Финансовое моделирование',
      text: 'Финансовое моделирование',
    },
    {
      value: 'Модели партнерств и платформы больших данных',
      text: 'Модели партнерств и платформы больших данных',
    },
  ],
} as SelectStringProps;

const metricsOptions = {
  type: SELECT_TYPE.STRING,
  options: [
    // Основные данные
    {
      value: MetricsEnum.ImplementedModelsMetric,
      text: MetricsCaption.IMPLEMENTED_MODELS,
    },
    {
      value: MetricsEnum.DevelopedModelsMetric,
      text: MetricsCaption.DEVELOPED_MODELS,
    },
    {
      value: MetricsEnum.MrmModelsMetric,
      text: MetricsCaption.SUM_RM_MODELS,
    },
    {
      value: MetricsEnum.OnMonitoringModelsMetric,
      text: MetricsCaption.ON_MONITORING_MODELS,
    },
    {
      value: MetricsEnum.TakenOutOfOperationModelsMetric,
      text: MetricsCaption.TAKEN_OUT_OF_OPERATION_MODELS,
    },
    {
      value: MetricsEnum.FinalStatusModelsMetric,
      text: MetricsCaption.FINAL_STATUS_MODELS,
    },
    {
      value: MetricsEnum.FinalStatusByMonthModelsMetric,
      text: MetricsCaption.FINAL_STATUS_BY_MONTH_MODELS,
    },
    {
      value: MetricsEnum.TasksMetric,
      text: MetricsCaption.DYNAMIC_BY_STREAMS_MODELS,
    },
    {
      value: MetricsEnum.StalledModelsByMonthMetric,
      text: MetricsCaption.STALLED_MODLES_BY_MONTH,
    },
    {
      value: MetricsEnum.DistributionByLifecycleStageModelsMetric,
      text: MetricsCaption.DISTRIBUTION_BY_LIFECYCLE_STAGE_MODELS,
    },

    // Delta данные
    {
      value: `${MetricsEnum.ImplementedModelsMetric}_delta`,
      text: MetricsCaption.IMPLEMENTED_MODELS_DELTA,
    },
    {
      value: `${MetricsEnum.DevelopedModelsMetric}_delta`,
      text: MetricsCaption.DEVELOPED_MODELS_DELTA,
    },
    {
      value: `${MetricsEnum.MrmModelsMetric}_delta`,
      text: MetricsCaption.SUM_RM_MODELS_DELTA,
    },
    {
      value: `${MetricsEnum.OnMonitoringModelsMetric}_delta`,
      text: MetricsCaption.ON_MONITORING_MODELS_DELTA,
    },
    {
      value: `${MetricsEnum.TakenOutOfOperationModelsMetric}_delta`,
      text: MetricsCaption.TAKEN_OUT_OF_OPERATION_MODELS_DELTA,
    },
    {
      value: `${MetricsEnum.FinalStatusModelsMetric}_delta`,
      text: MetricsCaption.FINAL_STATUS_MODELS_DELTA,
    },
  ],
} as SelectStringProps;

const initialKPI_SUM = { caption: MetricsCaption.KPI_SUM, value: 0, delta: 0, relative: true };
const initialTotalModels = {
  caption: MetricsCaption.TOTAL_MODELS,
  value: 0,
  delta: 0,
  relative: false,
};
const initialImplementedModels = {
  caption: MetricsCaption.IMPLEMENTED_MODELS,
  value: 0,
  delta: 0,
  relative: false,
};
const initialDevelopedModels = {
  caption: MetricsCaption.DEVELOPED_MODELS,
  value: 0,
  delta: 0,
  relative: false,
};
const initialSumRmModels = {
  caption: MetricsCaption.SUM_RM_MODELS,
  value: 0,
  delta: 0,
  relative: false,
};
const initialFinalStatusModels = {
  caption: MetricsCaption.FINAL_STATUS_MODELS,
  value: 0,
  delta: 0,
  relative: false,
};
const initialRegistryCoverageModels = {
  caption: MetricsCaption.REGISTRY_COVERAGE_MODELS,
  value: 0,
  delta: 0,
  relative: true,
};
const initialRiskCoverageFinalStatusModels = {
  caption: MetricsCaption.RISK_COVERAGE_FINAL_STATUS_MODELS,
  value: 0,
  delta: 0,
  relative: true,
};
const initialOnMonitoringModels = {
  caption: MetricsCaption.ON_MONITORING_MODELS,
  value: 0,
  delta: 0,
  relative: false,
};
const initialTakenOutOfOperationModels = {
  caption: MetricsCaption.TAKEN_OUT_OF_OPERATION_MODELS,
  value: 0,
  delta: 0,
  relative: false,
};

const initialChartModelDynamicsByStreams = () => ({
  chart: {
    type: 'bar',
    height: 280,
    spacingBottom: 30,
    zoomType: 'x',
    panning: {
      enabled: true,
      type: 'x' as const,
    },
    panKey: 'shift' as const,
  },
  title: { text: undefined },
  credits: {
    enabled: false,
  },
  xAxis: {
    categories: [
      'Руководитель DS',
      'DS',
      'Руководитель DE',
      'DE',
      'Руководитель ModelOps',
      'ModelOps',
      'Бизнес-партнер',
      'Руководитель Валидации',
      'Валидатор',
    ],
    labels: {
      style: { fontSize: '12px', width: 155 },
    },
    lineWidth: 1,
    gridLineWidth: 1,
    gridLineDashStyle: 'Dash' as Highcharts.DashStyleValue,
  },
  yAxis: {
    title: { text: null },
    min: 0,
    startOnTick: false,
    endOnTick: false,
    minRange: 10,
    labels: {
      formatter: function (this: any) {
        return this.value.toLocaleString();
      },
    },
  },
  legend: { enabled: false },
  tooltip: {
    backgroundColor: '#333',
    borderRadius: 4,
    style: { color: '#fff' },
    formatter: function (this: any) {
      const point = this.point;
      const value = point.y;
      const formattedValue = value.toLocaleString();

      return `<b>${point.category}</b><br/><span>${formattedValue} задач</span>`;
    },
  },
  plotOptions: {
    bar: {
      groupPadding: 0.1,
      pointPadding: 0.1,
      borderRadius: 4,
      dataLabels: { enabled: true },
    },
  },
  colors: [
    '#8DA0CB',
    '#E78AC3',
    '#FC8D62',
    '#A6D854',
    '#FFD92F',
    '#66C2A5',
    '#B3B3B3',
    '#FFB347',
    '#B39EB5',
  ],
  series: [
    {
      name: 'Количество задач',
      type: 'bar',
      data: [12, 18, 8, 15, 5, 9, 6, 7, 10],
      colorByPoint: true,
    },
  ] as Highcharts.SeriesBarOptions[],
});

const initialChartFinalStatusByMonthModels = () => ({
  chart: {
    type: 'areaspline',
    height: 170,
    marginTop: 22,
    zoomType: 'x',
    panning: {
      enabled: true,
      type: 'x' as const,
    },
    panKey: 'shift' as const,
  },
  title: {
    text: undefined,
  },
  accessibility: {
    enabled: true,
  },
  credits: {
    enabled: false,
  },
  yAxis: {
    title: {
      text: null,
    },
    gridLineWidth: 1,
    lineWidth: 1,
    gridLineDashStyle: 'Dash' as Highcharts.DashStyleValue,
    startOnTick: false,
    endOnTick: false,
    minRange: 10,
    min: undefined,
    labels: {
      formatter: function (this: any) {
        return this.value.toLocaleString();
      },
    },
  },
  xAxis: {
    categories: [
      'Янв',
      'Фев',
      'Мар',
      'Апр',
      'Май',
      'Июн',
      'Июл',
      'Авг',
      'Сен',
      'Окт',
      'Ноя',
      'Дек',
    ],
    gridLineWidth: 1,
    lineWidth: 1,
    gridLineDashStyle: 'Dash' as Highcharts.DashStyleValue,
  },
  plotOptions: {
    areaspline: {
      enableMouseTracking: true,
      marker: {
        enabled: true,
        radius: 5,
        lineWidth: 2,
        lineColor: 'var(--neutral-neutral-50, #0E9CFF)',
        fillColor: 'var(--neutral-neutral-00, #ffffff)',
      },
      threshold: null,
      minPointLength: 2,
    },
  },
  legend: {
    enabled: false,
  },
  tooltip: {
    shared: false,
    backgroundColor: 'var(--neutral-neutral-80, #333333)',
    borderRadius: 4,
    shadow: true,
    style: {
      color: 'var(--neutral-neutral-00, #ffffff)',
    },
    hideDelay: 500,
    formatter: function (this: any) {
      const point = this.point;
      const value = point.y;
      const formattedValue = value.toLocaleString();

      if (value >= 1000) {
        return `<span class="tooltip-key">${point.category}</span><br/>
                <span class="tooltip-value">${formattedValue} моделей</span>`;
      }

      return `<span class="tooltip-key">${point.category}</span><br/>
              <span class="tooltip-value">${formattedValue} моделей</span>`;
    },
  },
  series: [
    {
      type: 'areaspline',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      color: 'var(--neutral-neutral-50, #0E9CFF)',
      marker: {
        enabled: true,
        radius: 4,
        lineWidth: 2,
        lineColor: 'var(--neutral-neutral-50, #0E9CFF)',
        fillColor: 'var(--neutral-neutral-00, #ffffff)',
        states: {
          hover: {
            radius: 6,
            lineWidth: 3,
          },
        },
      },
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, 'rgba(14, 156, 255, 0.3)'],
          [1, 'rgba(14, 156, 255, 0)'],
        ],
      },
    } as Highcharts.SeriesAreasplineOptions,
  ],
});

const initialChartStalledModelsByMonth = () => ({
  chart: {
    type: 'areaspline',
    height: 170,
    marginTop: 22,
    zoomType: 'x',
    panning: {
      enabled: true,
      type: 'x' as const,
    },
    panKey: 'shift' as const,
  },
  title: {
    text: undefined,
  },
  accessibility: {
    enabled: true,
  },
  credits: {
    enabled: false,
  },
  yAxis: {
    title: {
      text: null,
    },
    gridLineWidth: 1,
    lineWidth: 1,
    gridLineDashStyle: 'Dash' as Highcharts.DashStyleValue,
    startOnTick: false,
    endOnTick: false,
    minRange: 10,
    min: undefined,
    labels: {
      formatter: function (this: any) {
        return this.value.toLocaleString();
      },
    },
  },
  xAxis: {
    categories: [
      'Янв',
      'Фев',
      'Мар',
      'Апр',
      'Май',
      'Июн',
      'Июл',
      'Авг',
      'Сен',
      'Окт',
      'Ноя',
      'Дек',
    ],
    gridLineWidth: 1,
    lineWidth: 1,
    gridLineDashStyle: 'Dash' as Highcharts.DashStyleValue,
  },
  plotOptions: {
    areaspline: {
      enableMouseTracking: true,
      marker: {
        enabled: true,
        radius: 5,
        lineWidth: 2,
        lineColor: 'var(--error-error-70, #FF0D0D)',
        fillColor: 'var(--neutral-neutral-00, #ffffff)',
      },
      threshold: null,
      minPointLength: 2,
    },
  },
  legend: {
    enabled: false,
  },
  tooltip: {
    shared: false,
    backgroundColor: 'var(--neutral-neutral-80, #333333)',
    borderRadius: 4,
    shadow: true,
    style: {
      color: 'var(--neutral-neutral-00, #ffffff)',
    },
    hideDelay: 500,
    formatter: function (this: any) {
      const point = this.point;
      const value = point.y;
      const formattedValue = value.toLocaleString();

      return `<span class="tooltip-key">${point.category}</span><br/>
              <span class="tooltip-value">${formattedValue} моделей</span>`;
    },
  },
  series: [
    {
      type: 'areaspline',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      color: 'var(--error-error-70, #FF0D0D)',
      marker: {
        enabled: true,
        radius: 4,
        lineWidth: 2,
        lineColor: 'var(--error-error-70, #FF0D0D)',
        fillColor: 'var(--neutral-neutral-00, #ffffff)',
        states: {
          hover: {
            radius: 6,
            lineWidth: 3,
          },
        },
      },
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, 'rgba(255, 13, 13, 0.3)'],
          [1, 'rgba(255, 13, 13, 0)'],
        ],
      },
    } as Highcharts.SeriesAreasplineOptions,
  ],
});

const initialChartPilots = () => ({
  chart: {
    height: 180,
    marginTop: 20,
    zoomType: 'x',
    panning: {
      enabled: true,
      type: 'x' as const,
    },
    panKey: 'shift' as const,
  },
  accessibility: {
    enabled: true,
  },
  credits: {
    enabled: false,
  },
  title: {
    text: undefined,
  },
  yAxis: {
    title: {
      text: undefined,
    },
    min: 0,
    gridLineWidth: 1,
    lineWidth: 0,
    gridLineDashStyle: 'Dash' as Highcharts.DashStyleValue,
    startOnTick: false,
    endOnTick: false,
    minRange: 10,
    labels: {
      enabled: true,
      style: {
        fontSize: '12px',
      },
      formatter: function (this: any) {
        return this.value.toLocaleString();
      },
    },
  },
  xAxis: {
    accessibility: {
      enabled: true,
    },
    title: {
      text: undefined,
    },
    categories: ['05A', '05B'],
    labels: {
      enabled: true,
      style: {
        fontSize: '12px',
      },
    },
    gridLineWidth: 1,
    lineWidth: 0,
    gridLineDashStyle: 'Dash' as Highcharts.DashStyleValue,
  },
  plotOptions: {
    bar: {
      dataLabels: {
        enabled: true,
      },
      groupPadding: 0.5,
      borderRadius: 0,
      pointWidth: 29,
    },
  },
  legend: {
    enabled: false,
  },
  tooltip: {
    shared: false,
    backgroundColor: 'var(--neutral-neutral-80, #333333)',
    borderRadius: 4,
    shadow: true,
    style: {
      color: 'var(--neutral-neutral-00, #ffffff)',
    },
    hideDelay: 500,
    formatter: function (this: any) {
      const point = this.point;
      const value = point.y;
      const formattedValue = value ? value.toLocaleString() : '0';

      return `<span class="tooltip-key">${point.series.name}</span><br/>
              <span class="tooltip-value">${formattedValue}</span>`;
    },
  },
  series: [
    {
      type: 'bar',
      name: '05A',
      data: [150, null], // значения для категорий ['05A', '05B']
      color: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, '#8DA0CB'],
          [1, 'rgba(141, 160, 203, 0)'],
        ],
      },
    },
    {
      type: 'bar',
      name: '05B',
      data: [null, 200], // значения для категорий ['05A', '05B']
      color: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, '#E78AC3'],
          [1, 'rgba(231, 138, 195, 0)'],
        ],
      },
    },
  ] as Highcharts.SeriesBarOptions[],
});

const initialChartDistributionByLifecycleStageModels = (): Highcharts.Options & {
  chart: { plotBorderRadius: number };
} => ({
  chart: {
    height: 185,
    marginTop: 20,
    plotBackgroundColor: undefined,
    plotBorderWidth: undefined,
    plotBorderRadius: 0,
    plotShadow: false,
  },
  accessibility: {
    enabled: true,
  },
  credits: {
    enabled: false,
  },
  title: {
    text: undefined,
  },
  legend: {
    align: 'right' as Highcharts.AlignValue,
    verticalAlign: 'top' as Highcharts.VerticalAlignValue,
    layout: 'vertical' as Highcharts.OptionsLayoutValue,
    itemStyle: {
      width: 100,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  tooltip: {
    shared: false,
    backgroundColor: 'var(--neutral-neutral-80, #333333)',
    borderRadius: 4,
    shadow: true,
    style: {
      color: 'var(--neutral-neutral-00, #ffffff)',
    },
    hideDelay: 500,
    // eslint-disable-next-line object-shorthand
    formatter: function (this: any) {
      const point = this.point;
      const value = point.y;
      const stageName = point.name || point.key || point.category || 'Нет данных';
      const formattedValue = value.toLocaleString();

      return `<span class="tooltip-key">${stageName}</span><br/>
              <span class="tooltip-value">${formattedValue} моделей</span>`;
    },
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
      },
      showInLegend: true,
      innerSize: '50%',
    },
  },
  colors: ['#ADD5F9', '#FC8D62', '#8DA0CB', '#E78AC3', '#A6D854', '#FFD92F'],
  series: [
    {
      type: 'pie',
      colorByPoint: true,
      keys: ['name', 'y', 'sliced', 'selected'],
      dataLabels: [
        {
          distance: -8,
          format: '{y}',
        },
      ],
      data: [
        ['Инициализация', 0, true, true],
        ['Поиск данных', 0],
        ['Разработка витрины', 0],
        ['Разработка модели', 0],
        ['Пилотирование', 0],
        ['Внедрение', 0],
      ],
    } as Highcharts.SeriesPieOptions,
  ],
});

export {
  initialKPI_SUM,
  initialTotalModels,
  initialImplementedModels,
  initialDevelopedModels,
  initialSumRmModels,
  initialFinalStatusModels,
  initialRegistryCoverageModels,
  initialRiskCoverageFinalStatusModels,
  initialOnMonitoringModels,
  initialTakenOutOfOperationModels,
  initialChartModelDynamicsByStreams,
  initialChartFinalStatusByMonthModels,
  initialChartStalledModelsByMonth,
  initialChartPilots,
  initialChartDistributionByLifecycleStageModels,
  dsStreamArtifactOptions,
  itemsExport,
  metricLabelMap,
  metricsOptions,
};
