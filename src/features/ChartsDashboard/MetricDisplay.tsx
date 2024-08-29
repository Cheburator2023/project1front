import React from 'react';
import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts';
import { Frame, Row, Title, Value, Delta } from './style';
import { TProps } from '@admiral-ds/react-ui';

import { ReactComponent as ArrowUp } from '@shared/ui/icons/ArrowUpSolid.svg';
import { ReactComponent as ArrowDown } from '@shared/ui/icons/ArrowDownSolid.svg';
import { FrameSizeType } from './types';

interface MetricDisplayProps {
  caption: string;
  value?: number;
  delta?: number;
  relative?: boolean;
  isDeltaPercentage?: boolean;
  size: FrameSizeType;
  chartOptions?: Highcharts.Options;
  showMetrics?: boolean;
  styles?: {
    frame?: React.CSSProperties & { withBorder?: boolean };
    title?: Partial<TProps> & { css?: React.CSSProperties };
    value?: Partial<TProps>;
    delta?: Partial<TProps>;
    width?: string;
  };
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  caption,
  value,
  delta,
  relative,
  isDeltaPercentage = false,
  size,
  showMetrics = true,
  chartOptions,
  styles,
}) => (
  <Frame
    size={size}
    withBorder={styles?.frame?.withBorder}
    style={styles?.frame}
    width={styles?.width}
  >
    <Row>
      <Title
        font={styles?.title?.font || 'Additional/M'}
        color={styles?.title?.color || 'Neutral/Neutral 50'}
        style={styles?.title?.css}
      >
        {caption}
      </Title>
    </Row>
    {showMetrics && (
      <Row css={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Value
          font={styles?.value?.font || 'Header/H5'}
          color={styles?.value?.color || 'Neutral/Neutral 90'}
        >
          {value}
          {relative && '%'}
        </Value>
        {delta !== undefined && (
          <Delta
            font={styles?.delta?.font || 'Caption/Caption 1'}
            color={styles?.delta?.color || 'Neutral/Neutral 90'}
          >
            {delta > 0 && '+'}
            {delta}
            {isDeltaPercentage && '%'}
            {delta < 0 ? <ArrowDown /> : <ArrowUp />}
          </Delta>
        )}
      </Row>
    )}
    {chartOptions && (
      <Row css={{ justifyContent: 'left', alignItems: 'center' }}>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </Row>
    )}
  </Frame>
);

export default MetricDisplay;

