import styled from 'styled-components';
import { T } from '@admiral-ds/react-ui';

type QuarterHeaderProps = {
  quarter: number;
  year: number;
};

const Container = styled('div')`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
`;

const QuarterBadge = styled('div')`
  background: #0132b0;
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 600;
`;

export const QuarterHeader = ({ quarter, year }: QuarterHeaderProps) => {
  return (
    <Container>
      <T font="Header/H5">Подтверждение использования моделей за</T>
      <QuarterBadge>
        <T font="Header/H5" style={{ color: '#fff' }}>
          Q{quarter} {year}
        </T>
      </QuarterBadge>
    </Container>
  );
};
