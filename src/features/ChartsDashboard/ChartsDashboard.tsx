import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import JS_PDF from 'jspdf';
import { Button, Spinner } from '@admiral-ds/react-ui';
import { ReactComponent as DownloadOutline } from '@admiral-ds/icons/build/system/DownloadOutline.svg';

import { ErrorStatus, Loading, useToast } from '@src/shared/ui/atoms';
import { MetricsResponseType } from '@src/shared/api/types';
import {
  useMetricsControllerGetMetrics,
  useMetricsControllerExportMetricsToExcel,
} from '@shared/api/generated/endpoints';

import { switchDateFormat, validateDateRange } from './helpers';
import {
  initialChartModelDynamicsByStreams,
  initialChartFinalStatusByMonthModels,
  initialChartStalledModelsByMonth,
  initialChartPilots,
  initialChartDistributionByLifecycleStageModels,
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
  dsStreamArtifactOptions,
  metricsOptions,
  itemsExport,
  metricLabelMap,
} from './constants';
import MetricDisplay from './MetricDisplay';
import { BiSyncInterface } from './BiSyncInterface';
import './styles.css';
import {
  Column,
  WrapperFilter,
  WrapperTitle,
  Row,
  StatusWrapper,
  Title,
  Container,
  ButtonContainer,
  FlexContainerFilter,
  Back,
  Cover,
  FlexContainerExport,
  GridRow,
  CustomDateField,
  CustomSearchSelect,
  DisabledMetricWrapper,
} from './style';
import { MenuIconSelect } from './MenuIconSelect';
import { MetricsCaption } from './types';

interface ChartsDashboardProps {
  useDatamart?: boolean;
}

const getQueryParams = (filters: {
  startDate?: string;
  endDate?: string;
  selectedStreams?: string[];
  useDatamart?: boolean;
  metric?: string;
  dataType?: string;
}) => {
  const params: Record<string, any> = {};

  if (filters.startDate) {
    params.startDate = filters.startDate;
  }

  if (filters.endDate) {
    params.endDate = filters.endDate;
  }

  const hasStreamsSelected = filters.selectedStreams && filters.selectedStreams.length > 0;
  const allStreamsSelected =
    filters.selectedStreams?.length === dsStreamArtifactOptions.options.length;

  if (!hasStreamsSelected || allStreamsSelected) {
    dsStreamArtifactOptions.options.forEach((stream, index) => {
      params[`stream[${index}]`] = stream.value;
    });
  } else {
    filters?.selectedStreams?.forEach((stream, index) => {
      params[`stream[${index}]`] = stream;
    });
  }

  if (filters.useDatamart !== undefined) {
    params.useDatamart = filters.useDatamart;
  }

  if (filters.metric) {
    params.metric = filters.metric;
  }

  if (filters.dataType) {
    params.dataType = filters.dataType;
  }

  return params;
};

const ChartsDashboardContent: React.FC<ChartsDashboardProps> = ({ useDatamart = false }) => {
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    selectedStreams: [] as string[],
  });

  const [tempFilters, setTempFilters] = useState({
    tempStartDate: undefined as string | undefined,
    tempEndDate: undefined as string | undefined,
    tempSelectedStreams: dsStreamArtifactOptions.options.map((option) => option.value),
  });

  const [metricsParams, setMetricsParams] = useState(
    getQueryParams({
      ...filters,
      useDatamart,
    }),
  );

  const {
    data: metricsData,
    isFetching: loadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useMetricsControllerGetMetrics(metricsParams, {
    query: {
      enabled: false,
    },
  });

  const typedMetricsData = metricsData as MetricsResponseType | undefined;

  const errorMetrics = metricsError ? String(metricsError) : undefined;

  const [exportParams, setExportParams] = useState<Record<string, string> | undefined>(undefined);
  const {
    isSuccess: isExportSuccess,
    data: exportData,
    error: exportError,
    refetch: refetchExportMetricsToExcel,
  } = useMetricsControllerExportMetricsToExcel(exportParams, {
    query: {
      enabled: false,
    },
  });

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
  const [takenOutOfOperationModels, setTakenOutOfOperationModels] = useState(
    initialTakenOutOfOperationModels,
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
  const [distributionByLifecycleStageModels, setDistributionByLifecycleStageModels] =
    useState<Highcharts.Options>(initialChartDistributionByLifecycleStageModels());

  const [isExporting, setIsExporting] = useState(false);

  const [dateError, setDateError] = useState<boolean>(false);

  const [selectedMetric, setSelectedMetric] = useState<string | undefined>();
  const [isExportingMetric, setIsExportingMetric] = useState(false);
  const [currentExportLabel, setCurrentExportLabel] = useState<string>('');

  useEffect(() => {
    refetchMetrics();
  }, []);

  useEffect(() => {
    if (!typedMetricsData) return;

    setTotalModels({
      ...totalModels,
      value: typedMetricsData.totalModels.count,
      delta: typedMetricsData.totalModels.delta,
    });
    setImplementedModels({
      ...implementedModels,
      value: typedMetricsData.implementedModels.count,
      delta: typedMetricsData.implementedModels.delta,
    });
    setDevelopedModels({
      ...developedModels,
      value: typedMetricsData.developedModels.count,
      delta: typedMetricsData.developedModels.delta,
    });
    setSumRmModels({
      ...sumRmModels,
      value: typedMetricsData.sumRmModels.count,
      delta: typedMetricsData.sumRmModels.delta,
    });
    setFinalStatusModels({
      ...finalStatusModels,
      value: typedMetricsData.finalStatusModels.count,
      delta: typedMetricsData.finalStatusModels.delta,
    });
    setRegistryCoverageModels({
      ...registryCoverageModels,
      value: typedMetricsData.registryCoverageModels.countPercent,
      delta: typedMetricsData.registryCoverageModels.deltaPercent,
    });
    setRiskCoverageFinalStatusModels({
      ...riskCoverageFinalStatusModels,
      value: typedMetricsData.riskCoverageFinalStatusModels.countPercent,
      delta: typedMetricsData.riskCoverageFinalStatusModels.deltaPercent,
    });

    setOnMonitoringModels({
      ...onMonitoringModels,
      value: typedMetricsData.onMonitoringModels.count,
      delta: typedMetricsData.onMonitoringModels.delta,
    });

    setTakenOutOfOperationModels({
      ...takenOutOfOperationModels,
      value: typedMetricsData.takenOutOfOperationModels.count,
      delta: typedMetricsData.takenOutOfOperationModels.delta,
    });

    setStalledModelsByMonth({
      ...stalledModelsByMonth,
      series: [
        {
          ...stalledModelsByMonth.series[0],
          data: typedMetricsData.stalledModelsByMonth,
        },
      ],
    });

    setPilots({
      ...pilots,
      series: [
        {
          ...pilots.series[0],
          data: [typedMetricsData.pilots.stage05A, null],
        },
        {
          ...pilots.series[1],
          data: [null, typedMetricsData.pilots.stage05B],
        },
      ],
    });

    setFinalStatusByMonthModels({
      ...finalStatusByMonthModels,
      series: [
        {
          ...finalStatusByMonthModels.series[0],
          data: typedMetricsData.finalStatusByMonthModels,
        },
      ],
    });

    setDistributionByLifecycleStageModels({
      ...distributionByLifecycleStageModels,
      series: [
        {
          ...distributionByLifecycleStageModels?.series?.[0],
          data: typedMetricsData?.distributionByLifecycleStageModels,
        },
      ],
    } as any);

    setModelDynamicsByStreams({
      ...modelDynamicsByStreams,
      series: [
        {
          ...modelDynamicsByStreams.series[0],
          data: [
            typedMetricsData.tasks.ds_lead,
            typedMetricsData.tasks.ds,
            typedMetricsData.tasks.de_lead,
            typedMetricsData.tasks.de,
            typedMetricsData.tasks.modelops_lead,
            typedMetricsData.tasks.modelops,
            typedMetricsData.tasks.mipm,
            typedMetricsData.tasks.validator_lead,
            typedMetricsData.tasks.validator,
          ],
        },
      ],
    });
  }, [typedMetricsData]);

  useEffect(() => {
    const exportFileAsync = async () => {
      setTimeout(() => {
        if (isExportSuccess && exportData && currentExportLabel) {
          const url = window.URL.createObjectURL(exportData);
          const link = document.createElement('a');
          link.href = url;
          link.download = currentExportLabel;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          setIsExportingMetric(false);
          setExportParams(undefined);
          setCurrentExportLabel('');
        }
      }, 500);
    };
    exportFileAsync();
  }, [isExportSuccess, exportData, currentExportLabel]);

  useEffect(() => {
    if (exportError) {
      showToast({
        message: `Ошибка экспорта: ${exportError}`,
        type: 'error',
        duration: 5000,
      });
      setIsExportingMetric(false);
      setExportParams(undefined);
      setCurrentExportLabel('');
    }
  }, [exportError, showToast]);

  const handleDateChange = (newDateRange: string | undefined) => {
    if (newDateRange) {
      const [startDate, endDate] = newDateRange.split(' - ');
      setTempFilters((prev) => ({
        ...prev,
        tempStartDate: startDate,
        tempEndDate: endDate,
      }));

      if (validateDateRange(startDate, endDate)) {
        setDateError(false);
      } else {
        setDateError(true);
      }
    } else {
      setTempFilters((prev) => ({
        ...prev,
        tempStartDate: undefined,
        tempEndDate: undefined,
      }));
      setDateError(false);
    }
  };

  const handleStreamChange = (name: string, selectedStreams: string[]) => {
    setTempFilters((prev) => ({
      ...prev,
      [name]: selectedStreams,
    }));
  };

  const handleApplyFilters = () => {
    const { tempStartDate, tempEndDate, tempSelectedStreams } = tempFilters;
    let _filters = {} as any;

    if (tempStartDate && tempEndDate) {
      const formattedStartDate = tempStartDate && switchDateFormat(tempStartDate);
      const formattedEndDate = tempEndDate && switchDateFormat(tempEndDate);

      _filters = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        selectedStreams: tempSelectedStreams,
      }

      setFilters(_filters);
    } else {


      _filters = {
        startDate: undefined,
        endDate: undefined,
        selectedStreams: tempSelectedStreams,
      }
      setFilters(_filters);
    }

    const newParams = getQueryParams({
      ..._filters,
      metric: selectedMetric,
      useDatamart,
    });
    setMetricsParams(newParams);

    setTimeout(() => {
      refetchMetrics();
    }, 100);
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      selectedStreams: [],
    });

    setTempFilters({
      tempStartDate: undefined,
      tempEndDate: undefined,
      tempSelectedStreams: dsStreamArtifactOptions.options.map((option) => option.value),
    });

    setSelectedMetric(undefined);

    setDateError(false);
    const newParams = getQueryParams({
      startDate: undefined,
      endDate: undefined,
      selectedStreams: [],
      useDatamart,
    });
    setMetricsParams(newParams);
    refetchMetrics();
  };

  const exportToPDF = () => {
    setIsExporting(true);
    const pdf = new JS_PDF('l', 'mm', 'a4');
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

  const handleExportSelectedMetric = async () => {
    if (!selectedMetric) return;

    setIsExportingMetric(true);

    const isDelta = selectedMetric.endsWith('_delta');
    const baseMetric = isDelta ? selectedMetric.replace('_delta', '') : selectedMetric;
    const dataType = isDelta ? 'delta' : 'current';

    const newExportParams: Record<string, string> = {
      ...(tempFilters.tempStartDate && { startDate: switchDateFormat(tempFilters.tempStartDate) }),
      ...(tempFilters.tempEndDate && { endDate: switchDateFormat(tempFilters.tempEndDate) }),
      metric: baseMetric,
      dataType,
    };

    tempFilters.tempSelectedStreams.forEach((stream, index) => {
      newExportParams[`stream[${index}]`] = stream;
    });

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}.${today.getFullYear()}`;

    const readableLabel = metricLabelMap[selectedMetric] || selectedMetric;
    const fileName = `${readableLabel} ${dateStr}.xlsx`;

    setCurrentExportLabel(fileName);
    setExportParams(newExportParams);

    setTimeout(() => {
      refetchExportMetricsToExcel();
    }, 500);
  };

  if (errorMetrics) {
    return (
      <StatusWrapper>
        <ErrorStatus text={errorMetrics} />
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
              placeholder="__.__.____ - __.__.____"
              dropContainerClassName="dropContainerClass"
              value={
                tempFilters?.tempStartDate && tempFilters.tempEndDate
                  ? `${tempFilters.tempStartDate} - ${tempFilters.tempEndDate}`
                  : ''
              }
              onChange={(e) => handleDateChange(e.currentTarget.value)}
              status={dateError ? 'error' : undefined}
            />

            <CustomSearchSelect
              id="streams"
              label="Стримы:"
              name="tempSelectedStreams"
              options={dsStreamArtifactOptions}
              selectedValues={tempFilters.tempSelectedStreams}
              onChange={handleStreamChange}
            />

            <CustomSearchSelect
              id="metric-select"
              label="Метрика для выгрузки"
              name="selectedMetric"
              options={metricsOptions}
              multiple={false}
              selectAllEnabled={false}
              selectEmptyEnabled={false}
              selectedValues={selectedMetric ? [selectedMetric] : []}
              onChange={(_, [value]) => {
                return setSelectedMetric(value);
              }}
            />

            <ButtonContainer>
              <Button
                dimension="s"
                onClick={handleApplyFilters}
                value="Submit"
                type="submit"
                disabled={dateError}
                loading={loadingMetrics}
              >
                Применить
              </Button>
              <Button
                dimension="s"
                appearance={selectedMetric ? 'primary' : 'secondary'}
                onClick={handleExportSelectedMetric}
                disabled={!selectedMetric}
                loading={isExportingMetric}
              >
                Выгрузить метрику
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

          {/* <BiSyncInterface useDatamart={useDatamart} onSyncComplete={refetchMetrics} /> */}
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
        {loadingMetrics ? (
          <StatusWrapper>
            <Loading text="Загрузка данных ..." />
          </StatusWrapper>
        ) : (
          <Back id="dashboard-container">
            <Container>
              <Cover>
                <Column>
                  <GridRow>
                    <MetricDisplay
                      caption={sumRmModels.caption}
                      value={sumRmModels.value}
                      delta={sumRmModels.delta}
                      relative={sumRmModels.relative}
                      size="stat-sm"
                      styles={{
                        width: '100%',
                      }}
                    />
                    <MetricDisplay
                      caption={implementedModels.caption}
                      value={implementedModels.value}
                      delta={implementedModels.delta}
                      relative={implementedModels.relative}
                      size="stat-sm"
                      styles={{
                        width: '100%',
                      }}
                    />
                    <MetricDisplay
                      caption={developedModels.caption}
                      value={developedModels.value}
                      delta={developedModels.delta}
                      relative={developedModels.relative}
                      size="stat-sm"
                      styles={{
                        width: '100%',
                      }}
                    />
                    <MetricDisplay
                      caption={finalStatusModels.caption}
                      value={finalStatusModels.value}
                      delta={finalStatusModels.delta}
                      relative={finalStatusModels.relative}
                      size="stat-sm"
                      styles={{
                        width: '100%',
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
                        title: {
                          font: 'Additional/M',
                          color: 'Neutral/Neutral 90',
                        },
                      }}
                    />
                    <MetricDisplay
                      caption={MetricsCaption.STALLED_MODLES_BY_MONTH}
                      showMetrics={false}
                      size="chart-lg"
                      chartOptions={stalledModelsByMonth}
                      styles={{
                        frame: { withBorder: true },
                        title: {
                          font: 'Additional/M',
                          color: 'Neutral/Neutral 90',
                        },
                      }}
                    />
                  </Row>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                    }}
                  >
                    <MetricDisplay
                      caption={MetricsCaption.DISTRIBUTION_BY_LIFECYCLE_STAGE_MODELS}
                      showMetrics={false}
                      size="chart-md"
                      chartOptions={distributionByLifecycleStageModels}
                      styles={{
                        frame: { withBorder: true },
                        title: {
                          font: 'Additional/M',
                          color: 'Neutral/Neutral 90',
                        },
                      }}
                    />

                    <MetricDisplay
                      caption={MetricsCaption.PILOTS}
                      showMetrics={false}
                      size="chart-md"
                      chartOptions={pilots}
                      styles={{
                        frame: { withBorder: true },
                        title: {
                          font: 'Additional/M',
                          color: 'Neutral/Neutral 90',
                        },
                      }}
                    />
                    <div style={{ display: 'grid' }}>
                      <MetricDisplay
                        caption={onMonitoringModels.caption}
                        value={onMonitoringModels.value}
                        delta={onMonitoringModels.delta}
                        relative={onMonitoringModels.relative}
                        size="stat-md"
                        styles={{
                          frame: { withBorder: true },
                          title: {
                            color: 'Neutral/Neutral 90',
                            css: { marginBottom: '17px' },
                          },
                          width: '100%',
                          height: 'auto',
                        }}
                      />

                      <MetricDisplay
                        caption={takenOutOfOperationModels.caption}
                        value={takenOutOfOperationModels.value}
                        delta={takenOutOfOperationModels.delta}
                        relative={takenOutOfOperationModels.relative}
                        size="stat-md"
                        styles={{
                          frame: { withBorder: true },
                          title: {
                            color: 'Neutral/Neutral 90',
                            css: { marginBottom: '17px' },
                          },
                          width: '100%',
                          height: 'auto',
                        }}
                      />
                    </div>
                  </div>
                </Column>
                <Column>
                  <MetricDisplay
                    caption={MetricsCaption.DYNAMIC_BY_STREAMS_MODELS}
                    showMetrics={false}
                    size="chart-sm"
                    chartOptions={modelDynamicsByStreams}
                    styles={{
                      frame: { withBorder: true },
                      title: {
                        font: 'Additional/M',
                        color: 'Neutral/Neutral 90',
                      },
                    }}
                  />

                  <DisabledMetricWrapper>
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
                  </DisabledMetricWrapper>

                  <DisabledMetricWrapper>
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
                  </DisabledMetricWrapper>
                </Column>
              </Cover>
            </Container>
          </Back>
        )}
      </>
    </>
  );
};

const ChartsDashboard: React.FC<ChartsDashboardProps> = (props) => {
  return <ChartsDashboardContent {...props} />;
};

export { ChartsDashboard };

