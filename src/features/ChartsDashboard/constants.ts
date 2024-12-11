import { SELECT_TYPE, SelectStringProps } from '@src/shared/ui/organisms';
import * as Highcharts from 'highcharts';
import { MetricsCaption } from './types';

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
    height: 300,
    marginTop: 25,
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
    max: 100,
    gridLineWidth: 1,
    lineWidth: 0,
    gridLineDashStyle: 'Dash' as Highcharts.DashStyleValue,
  },
  xAxis: {
    visible: false,
  },
  plotOptions: {
    bar: {
      dataLabels: {
        inside: true,
        enabled: true,
      },
    },
    pointWidth: 25,
    groupPadding: 0.03,
  },
  legend: {
    align: 'left' as Highcharts.AlignValue,
    x: -10,
    symbolRadius: 0,
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
    format:
      '<span class="tooltip-key">{series.name}</span><br/><span class="tooltip-value">{y} моделей</span>',
  },
  series: [
    {
      type: 'bar',
      borderRadius: 0,
      dataLabels: [
        {
          align: 'left' as Highcharts.AlignValue,
          format: '{y}',
        },
      ],
      data: [0],
      name: 'Источники данных',
      color: 'var(--neutral-neutral-50, #8DA0CB)',
    },
    {
      type: 'bar',
      borderRadius: 0,
      dataLabels: [
        {
          align: 'left' as Highcharts.AlignValue,
          format: '{y}',
        },
      ],
      data: [0],
      name: 'Валидация',
      color: 'var(--magenta-magenta-30,  #E78AC3)',
    },
  ] as Highcharts.SeriesBarOptions[],
});

const initialChartFinalStatusByMonthModels = () => ({
  chart: {
    type: 'areaspline',
    height: 170,
    marginTop: 22,
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
        radios: 5,
        lineWidth: 2,
        lineColor: 'var(--neutral-neutral-50, #0E9CFF)',
        fillColor: 'var(--neutral-neutral-00, #ffffff)',
      },
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
    format:
      '<span class="tooltip-key">{key}</span><br/><span class="tooltip-value">{point.y} моделей</span>',
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
    format:
      '<span class="tooltip-key">{key}</span><br/><span class="tooltip-value">{point.y} моделей</span>',
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
    tickAmount: 5,
    min: 0,
    max: 100,
    gridLineWidth: 1,
    lineWidth: 0,
    gridLineDashStyle: 'Dash' as Highcharts.DashStyleValue,
  },
  xAxis: {
    accessibility: {
      enabled: true,
    },
    categories: ['05A', '05B'],
    gridLineWidth: 1,
    lineWidth: 0,
    gridLineDashStyle: 'Dash' as Highcharts.DashStyleValue,
    title: {
      text: undefined,
    },
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
    format:
      '<span class="tooltip-key">{series.name}</span><br/><span class="tooltip-value">{y}</span>',
  },
  series: [
    {
      type: 'bar',
      name: '05A',
      data: [0, null],
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
      data: [null, 0],
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

const initialChartDistributionByLifecycleStageModels = () => ({
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
      width: '100px',
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
    format:
      '<span class="tooltip-key">{key}</span><br/><span class="tooltip-value">{y} моделей</span>',
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
};

