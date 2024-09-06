import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button, Field, Option, Spinner } from '@admiral-ds/react-ui';
import { ReactComponent as DownloadOutline } from '@admiral-ds/icons/build/system/DownloadOutline.svg';

import { ErrorStatus, Loading } from '@src/shared/ui/atoms';
import { dsStreamArtifact } from '@src/shared/types';
import {
  API_ROUTES,
  mockedMetricsResponse,
  mockedModelsResponse,
  ModelsResponseType,
  useFetch,
} from '@src/shared/api';
import { MetricsResponseType } from '@src/shared/api/types';

import {
  generateChartData,
  getPositiveDelta,
  MetricsAggregator,
  switchDateFormat,
  validateDateRange,
} from './helpers';
import {
  initialChartModelDynamicsByStreams,
  initialChartFinalStatusByMonthModels,
  initialChartStalledModelsByMonth,
  initialChartPilots,
  initialChartDistributionByLifecycleStageModels,
  initialChartOnMonitoringModels,
  inititalChartTakenOutOfOperationModels,
  initialTotalModels,
  initialImplementedModels,
  initialDevelopedModels,
  initialSumRmModels,
  initialFinalStatusModels,
  initialRegistryCoverageModels,
  initialRiskCoverageFinalStatusModels,
  initialKPI_SUM,
  initialOnMonitoringModels,
  initialTakenOutOfOperationModels,
} from './constants';
import MetricDisplay from './MetricDisplay';
import './styles.css';
import {
  Column,
  WrapperFilter,
  WrapperTitle,
  CustomDateField,
  Row,
  StatusWrapper,
  Title,
  Container,
  ButtonContainer,
  FlexContainerFilter,
  Back,
  Cover,
  FlexContainerExport,
  CustomSelectField,
  GridRow,
} from './style';
import { MenuIconSelect } from './MenuIconSelect';
import { MetricsCaption } from './types';

const ChartsDashboard = () => {
  const {
    responseData: modelsData,
    loading,
    error,
  } = useFetch<ModelsResponseType>({
    apiRoute: API_ROUTES.MODELS,
    mockedResponse: mockedModelsResponse,
  });

  const {
    responseData: metricsData,
    loading: loadingMetrics,
    error: errorMetrics,
  } = useFetch<MetricsResponseType>({
    apiRoute: API_ROUTES.METRICS,
    mockedResponse: mockedMetricsResponse,
  });

  // const [kpiSum, setKpiSum] = useState(initialKPI_SUM);
  const [totalModels, setTotalModels] = useState(initialTotalModels);
  const [implementedModels, setImplementedModels] = useState(initialImplementedModels);
  const [developedModels, setDevelopedModels] = useState(initialDevelopedModels);
  const [sumRmModels, setSumRmModels] = useState(initialSumRmModels);
  const [finalStatusModels, setFinalStatusModels] = useState(initialFinalStatusModels);
  const [registryCoverageModels, setRegistryCoverageModels] = useState(
    initialRegistryCoverageModels,
  );
  const [riskCoverageFinalStatusModels, setRiskCoverageFinalStatusModels] = useState(
    initialRiskCoverageFinalStatusModels,
  );

  const [onMonitoringModels, setOnMonitoringModels] = useState(initialOnMonitoringModels);
  const [statChartOnMonitoringModels, setStatChartOnMonitoringModels] = useState(
    initialChartOnMonitoringModels(),
  );

  const [takenOutOfOperationModels, setTakenOutOfOperationModels] = useState(
    initialTakenOutOfOperationModels,
  );
  const [statChartTakenOutOfOperationModels, setStatChartTakenOutOfOperationModels] = useState(
    inititalChartTakenOutOfOperationModels(),
  );

  const [modelDynamicsByStreams, setModelDynamicsByStreams] = useState(
    initialChartModelDynamicsByStreams(),
  );
  const [finalStatusByMonthModels, setFinalStatusByMonthModels] = useState(
    initialChartFinalStatusByMonthModels(),
  );
  const [stalledModelsByMonth, setStalledModelsByMonth] = useState(
    initialChartStalledModelsByMonth(),
  );
  const [pilots, setPilots] = useState(initialChartPilots());
  const [distributionByLifecycleStageModels, setDistributionByLifecycleStageModels] = useState(
    initialChartDistributionByLifecycleStageModels(),
  );

  const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<[string, string] | undefined>(undefined);
  const [selectedStream, setSelectedStream] = useState<string>('Все стримы');
  const [tempSelectedStream, setTempSelectedStream] = useState<string>('Все стримы');

  const [isExporting, setIsExporting] = useState(false);

  const [dateError, setDateError] = useState<string | null>(null);

  const itemsExport = [
    { id: 'pdf', label: 'Экспортировать в PDF', value: 'PDF' },
    { id: 'png', label: 'Экспортировать в PNG', value: 'PNG' },
  ];

  useEffect(() => {
    if (!modelsData || !metricsData) return;

    const cards = modelsData?.data?.cards;
    const startDate = dateRange ? dateRange[0] : undefined;
    const endDate = dateRange ? dateRange[1] : undefined;

    const aggregator = new MetricsAggregator(cards);

    const { currentMetrics, previousMetrics, totalMetrics } = aggregator.aggregate(
      startDate,
      endDate,
      selectedStream,
    );

    const deltas = aggregator.calculateDeltas(currentMetrics, previousMetrics);

    setTotalModels({
      ...totalModels,
      value: totalMetrics.totalModels,
      delta: getPositiveDelta(deltas.totalModelsDelta),
    });
    setImplementedModels({
      ...implementedModels,
      value: totalMetrics.implementedModels,
      delta: getPositiveDelta(deltas.implementedModelsDelta),
    });
    setDevelopedModels({
      ...developedModels,
      value: totalMetrics.developedModels,
      delta: getPositiveDelta(deltas.developedModelsDelta),
    });
    setSumRmModels({
      ...sumRmModels,
      value: totalMetrics.sumRmModels,
      delta: getPositiveDelta(deltas.sumRmModelsDelta),
    });
    setFinalStatusModels({
      ...finalStatusModels,
      value: totalMetrics.finalStatusModels,
      delta: getPositiveDelta(deltas.finalStatusModelsDelta),
    });
    setRegistryCoverageModels({
      ...registryCoverageModels,
      value: totalMetrics.registryCoverageModels,
      delta: deltas.registryCoverageModelsDelta,
    });
    setRiskCoverageFinalStatusModels({
      ...riskCoverageFinalStatusModels,
      value: totalMetrics.riskCoverageFinalStatusModels,
      delta: deltas.riskCoverageFinalStatusModelsDelta,
    });

    setOnMonitoringModels({
      ...onMonitoringModels,
      value: totalMetrics.onMonitoringModels,
      delta: deltas.onMonitoringModelsDelta,
    });
    setStatChartOnMonitoringModels({
      ...statChartOnMonitoringModels,
      series: [
        {
          ...statChartOnMonitoringModels.series[0],
          data: generateChartData(deltas.onMonitoringModelsDelta),
        },
      ],
    });

    setTakenOutOfOperationModels({
      ...takenOutOfOperationModels,
      value: totalMetrics.takenOutOfOperationModels,
      delta: deltas.takenOutOfOperationModelsDelta,
    });
    setStatChartTakenOutOfOperationModels({
      ...statChartTakenOutOfOperationModels,
      series: [
        {
          ...statChartTakenOutOfOperationModels.series[0],
          data: generateChartData(deltas.takenOutOfOperationModelsDelta),
        },
      ],
    });

    setStalledModelsByMonth({
      ...stalledModelsByMonth,
      series: [
        {
          ...stalledModelsByMonth.series[0],
          data: totalMetrics.stalledModelsByMonth,
        },
      ],
    });

    setPilots({
      ...pilots,
      series: [
        {
          ...pilots.series[0],
          data: [totalMetrics.stage05A, null],
        },
        {
          ...pilots.series[1],
          data: [null, totalMetrics.stage05B],
        },
      ],
    });

    setFinalStatusByMonthModels({
      ...finalStatusByMonthModels,
      series: [
        {
          ...finalStatusByMonthModels.series[0],
          data: totalMetrics.finalStatusByMonthModels,
        },
      ],
    });

    setDistributionByLifecycleStageModels({
      ...distributionByLifecycleStageModels,
      series: [
        {
          ...distributionByLifecycleStageModels.series[0],
          data: metricsData?.distributionByLifecycleStageModels?.data,
        },
      ],
    });
  }, [modelsData, dateRange, selectedStream, metricsData]);

  const handleDateChange = (newDateRange: string | undefined) => {
    setTempDateRange(newDateRange ? (newDateRange.split(' - ') as [string, string]) : undefined);
    setDateError(null);
  };

  const handleStreamChange = (stream: string) => {
    setTempSelectedStream(stream);
  };

  const handleApplyFilters = () => {
    if (tempDateRange) {
      const [startDate, endDate] = tempDateRange;

      if (validateDateRange(startDate, endDate)) {
        const formattedStartDate = switchDateFormat(startDate);
        const formattedEndDate = switchDateFormat(endDate);

        setDateRange([formattedStartDate, formattedEndDate]);
        setSelectedStream(tempSelectedStream);
        setDateError(null);
      } else {
        setDateError('Невалидная дата');
      }
    } else {
      setDateRange(undefined);
      setSelectedStream(tempSelectedStream);
      setDateError(null);
    }
  };

  const handleResetFilters = () => {
    setTempDateRange(undefined);
    setDateRange(undefined);

    setDateError(null);

    setTempSelectedStream('Все стримы');
    setSelectedStream('Все стримы');
  };

  const exportToPDF = () => {
    setIsExporting(true);
    const pdf = new jsPDF('l', 'mm', 'a4');
    const dashboardElement = document.getElementById('dashboard-container');
    const dashboardName = 'Dashboard';
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}.${today.getFullYear()}`;

    if (!dashboardElement) {
      return;
    }

    html2canvas(dashboardElement, { scale: 1 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${dashboardName} ${dateStr}.pdf`;
      pdf.save(fileName);
      setIsExporting(false);
    });
  };

  const exportToPNG = () => {
    setIsExporting(true);
    const dashboardElement = document.getElementById('dashboard-container');
    const dashboardName = 'Dashboard';
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}.${today.getFullYear()}`;

    if (!dashboardElement) {
      return;
    }

    html2canvas(dashboardElement).then((canvas) => {
      const imgWidth = 297;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;

      while (heightLeft > 0) {
        const canvasPage = document.createElement('canvas');
        const ctx = canvasPage.getContext('2d');
        const actualHeight = Math.min(canvas.height - position, canvas.height);

        canvasPage.width = canvas.width;
        canvasPage.height = actualHeight;

        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            position,
            canvas.width,
            actualHeight,
            0,
            0,
            canvas.width,
            actualHeight,
          );
        }

        const pageImageData = canvasPage.toDataURL('image/png');
        const fileName = `${dashboardName} ${pageNumber} ${dateStr}.png`;

        const link = document.createElement('a');
        link.href = pageImageData;
        link.download = fileName;
        link.click();

        heightLeft -= pageHeight;
        position += pageHeight;
        pageNumber++;
      }

      setIsExporting(false);
    });
  };

  const handleExport = (format: string) => {
    if (format === 'PDF') {
      exportToPDF();
    } else if (format === 'PNG') {
      exportToPNG();
    }
  };

  const handleSelect = (value: any) => {
    handleExport(value);
  };

  if (error || errorMetrics) {
    return (
      <StatusWrapper>
        <ErrorStatus text={error} />
      </StatusWrapper>
    );
  }

  return (
    <>
      <WrapperFilter>
        <Container>
          <FlexContainerFilter>
            <CustomDateField
              type="date-range"
              dimension="s"
              id="dates"
              label="Временный срез:"
              placeholder="__.__.____ – __.__.____"
              dropContainerClassName="dropContainerClass"
              value={tempDateRange ? `${tempDateRange[0]} - ${tempDateRange[1]}` : ''}
              onChange={(e) => handleDateChange(e.currentTarget.value)}
              status={dateError ? 'error' : undefined}
            />
            <Field label="Стримы:">
              <CustomSelectField
                dimension="s"
                value={tempSelectedStream}
                onChange={(e) => handleStreamChange(e.target.value)}
                placeholder="Выберите стрим"
                dropContainerClassName="dropContainerClass"
              >
                {dsStreamArtifact?.values.map((option) => (
                  <Option key={option.artefact_value} value={option.artefact_value}>
                    {option.artefact_value}
                  </Option>
                ))}
              </CustomSelectField>
            </Field>

            <ButtonContainer>
              <Button dimension="s" onClick={handleApplyFilters} value="Submit" type="submit">
                Применить
              </Button>
              <Button
                dimension="s"
                onClick={handleResetFilters}
                appearance="secondary"
                value="Submit"
                type="submit"
              >
                Сбросить
              </Button>
            </ButtonContainer>
          </FlexContainerFilter>
        </Container>
      </WrapperFilter>
      <WrapperTitle>
        <Container>
          <FlexContainerExport>
            <Title font="Additional/M" color="Neutral/Neutral 90">
              Графики и диаграмы
            </Title>

            <div style={{ position: 'relative', right: '60px' }}>
              {isExporting ? (
                <Spinner dimension="ms" />
              ) : (
                <MenuIconSelect
                  items={itemsExport}
                  icon={<DownloadOutline />}
                  onSelectItem={handleSelect}
                />
              )}
            </div>
          </FlexContainerExport>
        </Container>
      </WrapperTitle>

      <>
        {loading || loadingMetrics ? (
          <StatusWrapper>
            <Loading text="Загрузка данных ..." />
          </StatusWrapper>
        ) : (
          <Back id="dashboard-container">
            <Container>
              <Cover>
                <Column>
                  <GridRow>
                    {/* <MetricDisplay
                    caption={kpiSum.caption}
                    value={kpiSum.value}
                    delta={kpiSum.delta}
                    relative={kpiSum.relative}
                    size="stat-sm"
                  /> */}
                    <MetricDisplay
                      caption={totalModels.caption}
                      value={totalModels.value}
                      delta={totalModels.delta}
                      relative={totalModels.relative}
                      size="stat-sm"
                      styles={{
                        width: 'auto',
                      }}
                    />
                    <MetricDisplay
                      caption={implementedModels.caption}
                      value={implementedModels.value}
                      delta={implementedModels.delta}
                      relative={implementedModels.relative}
                      size="stat-sm"
                      styles={{
                        width: 'auto',
                      }}
                    />
                    <MetricDisplay
                      caption={developedModels.caption}
                      value={developedModels.value}
                      delta={developedModels.delta}
                      relative={developedModels.relative}
                      size="stat-sm"
                      styles={{
                        width: 'auto',
                      }}
                    />
                    <MetricDisplay
                      caption={sumRmModels.caption}
                      value={sumRmModels.value}
                      delta={sumRmModels.delta}
                      relative={sumRmModels.relative}
                      size="stat-sm"
                      styles={{
                        width: 'auto',
                      }}
                    />
                    <MetricDisplay
                      caption={finalStatusModels.caption}
                      value={finalStatusModels.value}
                      delta={finalStatusModels.delta}
                      relative={finalStatusModels.relative}
                      size="stat-sm"
                      styles={{
                        width: 'auto',
                      }}
                    />
                  </GridRow>
                  <Row>
                    <MetricDisplay
                      caption={MetricsCaption.FINAL_STATUS_BY_MONTH_MODELS}
                      size="chart-lg"
                      showMetrics={false}
                      chartOptions={finalStatusByMonthModels}
                      styles={{
                        frame: { withBorder: true },
                        title: { font: 'Additional/M', color: 'Neutral/Neutral 90' },
                      }}
                    />
                    <MetricDisplay
                      caption={MetricsCaption.STALLED_MODLES_BY_MONTH}
                      showMetrics={false}
                      size="chart-lg"
                      chartOptions={stalledModelsByMonth}
                      styles={{
                        frame: { withBorder: true },
                        title: { font: 'Additional/M', color: 'Neutral/Neutral 90' },
                      }}
                    />
                  </Row>
                  <Row>
                    <MetricDisplay
                      caption={MetricsCaption.DISTRIBUTION_BY_LIFECYCLE_STAGE_MODELS}
                      showMetrics={false}
                      size="chart-md"
                      chartOptions={distributionByLifecycleStageModels}
                      styles={{
                        frame: { withBorder: true },
                        title: { font: 'Additional/M', color: 'Neutral/Neutral 90' },
                      }}
                    />

                    <MetricDisplay
                      caption={MetricsCaption.PILOTS}
                      showMetrics={false}
                      size="chart-md"
                      chartOptions={pilots}
                      styles={{
                        frame: { withBorder: true },
                        title: { font: 'Additional/M', color: 'Neutral/Neutral 90' },
                      }}
                    />

                    <MetricDisplay
                      caption={onMonitoringModels.caption}
                      value={onMonitoringModels.value}
                      delta={onMonitoringModels.delta}
                      relative={onMonitoringModels.relative}
                      isDeltaPercentage
                      size="stat-md"
                      styles={{
                        frame: { withBorder: true },
                        title: { color: 'Neutral/Neutral 90', css: { marginBottom: '17px' } },
                      }}
                      chartOptions={statChartOnMonitoringModels}
                    />

                    <MetricDisplay
                      caption={takenOutOfOperationModels.caption}
                      value={takenOutOfOperationModels.value}
                      delta={takenOutOfOperationModels.delta}
                      relative={takenOutOfOperationModels.relative}
                      isDeltaPercentage
                      size="stat-md"
                      styles={{
                        frame: { withBorder: true },
                        title: { color: 'Neutral/Neutral 90', css: { marginBottom: '17px' } },
                      }}
                      chartOptions={statChartTakenOutOfOperationModels}
                    />
                  </Row>
                </Column>
                <Column>
                  <MetricDisplay
                    caption={MetricsCaption.DYNAMIC_BY_STREAMS_MODELS}
                    showMetrics={false}
                    size="chart-sm"
                    chartOptions={modelDynamicsByStreams}
                    styles={{
                      frame: { withBorder: true },
                      title: { font: 'Additional/M', color: 'Neutral/Neutral 90' },
                    }}
                  />

                  <MetricDisplay
                    caption={registryCoverageModels.caption}
                    value={registryCoverageModels.value}
                    delta={registryCoverageModels.delta}
                    relative={registryCoverageModels.relative}
                    isDeltaPercentage
                    size="stat-lg"
                    styles={{
                      frame: { withBorder: true },
                      title: { font: 'Additional/S' },
                    }}
                  />

                  <MetricDisplay
                    caption={riskCoverageFinalStatusModels.caption}
                    value={riskCoverageFinalStatusModels.value}
                    delta={riskCoverageFinalStatusModels.delta}
                    relative={riskCoverageFinalStatusModels.relative}
                    isDeltaPercentage
                    size="stat-lg"
                    styles={{
                      frame: { withBorder: true },
                      title: { font: 'Additional/S' },
                    }}
                  />
                </Column>
              </Cover>
            </Container>
          </Back>
        )}
      </>
    </>
  );
};

export { ChartsDashboard };
