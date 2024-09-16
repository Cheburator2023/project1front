import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button, Spinner } from '@admiral-ds/react-ui';
import { ReactComponent as DownloadOutline } from '@admiral-ds/icons/build/system/DownloadOutline.svg';

import { ErrorStatus, Loading } from '@src/shared/ui/atoms';
import { API_ROUTES, mockedMetricsResponse, useFetch } from '@src/shared/api';
import { MetricsResponseType } from '@src/shared/api/types';

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
} from './constants';
import MetricDisplay from './MetricDisplay';
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
} from './style';
import { MenuIconSelect } from './MenuIconSelect';
import { MetricsCaption } from './types';

const getQueryParams = (filters: {
  startDate?: string;
  endDate?: string;
  selectedStreams?: string[];
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

  if (hasStreamsSelected && !allStreamsSelected) {
    filters?.selectedStreams?.forEach((stream, index) => {
      params[`stream[${index}]`] = stream;
    });
  }

  return params;
};
const ChartsDashboard = () => {
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

  const {
    responseData: metricsData,
    loading: loadingMetrics,
    error: errorMetrics,
    refetch,
  } = useFetch<MetricsResponseType>({
    apiRoute: API_ROUTES.METRICS,
    params: getQueryParams(filters),
    // mockedResponse: mockedMetricsResponse,
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
  const [distributionByLifecycleStageModels, setDistributionByLifecycleStageModels] = useState(
    initialChartDistributionByLifecycleStageModels(),
  );

  const [isExporting, setIsExporting] = useState(false);

  const [dateError, setDateError] = useState<boolean>(false);

  const itemsExport = [
    { id: 'pdf', label: 'Экспортировать в PDF', value: 'PDF' },
    { id: 'png', label: 'Экспортировать в PNG', value: 'PNG' },
  ];

  useEffect(() => {
    if (!metricsData) return;

    setTotalModels({
      ...totalModels,
      value: metricsData.totalModels.count,
      delta: metricsData.totalModels.delta,
    });
    setImplementedModels({
      ...implementedModels,
      value: metricsData.implementedModels.count,
      delta: metricsData.implementedModels.delta,
    });
    setDevelopedModels({
      ...developedModels,
      value: metricsData.developedModels.count,
      delta: metricsData.developedModels.delta,
    });
    setSumRmModels({
      ...sumRmModels,
      value: metricsData.sumRmModels.count,
      delta: metricsData.sumRmModels.delta,
    });
    setFinalStatusModels({
      ...finalStatusModels,
      value: metricsData.finalStatusModels.count,
      delta: metricsData.finalStatusModels.delta,
    });
    setRegistryCoverageModels({
      ...registryCoverageModels,
      value: metricsData.registryCoverageModels.countPercent,
      delta: metricsData.registryCoverageModels.deltaPercent,
    });
    setRiskCoverageFinalStatusModels({
      ...riskCoverageFinalStatusModels,
      value: metricsData.riskCoverageFinalStatusModels.countPercent,
      delta: metricsData.riskCoverageFinalStatusModels.deltaPercent,
    });

    setOnMonitoringModels({
      ...onMonitoringModels,
      value: metricsData.onMonitoringModels.count,
      delta: metricsData.onMonitoringModels.deltaPercent,
    });

    setTakenOutOfOperationModels({
      ...takenOutOfOperationModels,
      value: metricsData.takenOutOfOperationModels.count,
      delta: metricsData.takenOutOfOperationModels.deltaPercent,
    });

    setStalledModelsByMonth({
      ...stalledModelsByMonth,
      series: [
        {
          ...stalledModelsByMonth.series[0],
          data: metricsData.stalledModelsByMonth,
        },
      ],
    });

    setPilots({
      ...pilots,
      series: [
        {
          ...pilots.series[0],
          data: [metricsData.pilots.stage05A, null],
        },
        {
          ...pilots.series[1],
          data: [null, metricsData.pilots.stage05B],
        },
      ],
    });

    setFinalStatusByMonthModels({
      ...finalStatusByMonthModels,
      series: [
        {
          ...finalStatusByMonthModels.series[0],
          data: metricsData.finalStatusByMonthModels,
        },
      ],
    });

    setDistributionByLifecycleStageModels({
      ...distributionByLifecycleStageModels,
      series: [
        {
          ...distributionByLifecycleStageModels.series[0],
          data: metricsData?.distributionByLifecycleStageModels,
        },
      ],
    });

    setModelDynamicsByStreams({
      ...modelDynamicsByStreams,
      series: [
        {
          ...modelDynamicsByStreams.series[0],
          data: [metricsData.tasks.datasources],
        },
        {
          ...modelDynamicsByStreams.series[1],
          data: [metricsData.tasks.validation],
        },
      ],
    });
  }, [metricsData]);

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

    if (!dateError) {
      const formattedStartDate = tempStartDate ? switchDateFormat(tempStartDate) : undefined;
      const formattedEndDate = tempEndDate ? switchDateFormat(tempEndDate) : undefined;

      setFilters({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        selectedStreams: tempSelectedStreams,
      });

      refetch();
    }
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

    setDateError(false);
    refetch();
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
              placeholder="__.__.____ – __.__.____"
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
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
                    <div style={{ display: 'grid' }}>
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
                          width: '100%',
                          height: 'auto',
                        }}
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

