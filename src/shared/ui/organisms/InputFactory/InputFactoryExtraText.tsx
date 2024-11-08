import { ReactComponent as ErrorOutline } from '@admiral-ds/icons/build/service/ErrorOutline.svg';
import styled from 'styled-components';
import { Flexbox, Spacer } from '../../atoms';

export const InputFactoryExtraText = ({
  extraTextInitial = '',
  conditionText = 'Есть условия',
  isError = false,
}) => {
  return extraTextInitial ? (
    <Wrapper title={extraTextInitial} isError={isError}>
      <ErrorOutline width={16} height={16} />
      <Spacer width={5} />
      <div>{conditionText}</div>
    </Wrapper>
  ) : null;
};

const Wrapper = styled(Flexbox)<{ isError?: boolean }>`
  color: ${({ theme, isError }) => isError && theme.color['Error/Error 60 Main']};

  svg path {
    fill: ${({ theme, isError }) => isError && theme.color['Error/Error 60 Main']};
  }
`;

