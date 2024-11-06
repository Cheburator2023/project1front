import styled, { css } from 'styled-components';

export const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

export const SuccessColor = css`
  color: ${(p) => p.theme.color['Success/Success 50 Main']};
  > div {
    svg {
      path {
        fill: ${(p) => p.theme.color['Success/Success 50 Main']};
      }
    }
  }
`;

export const ErrorColor = css`
  color: ${(p) => p.theme.color['Error/Error 60 Main']};
  > div {
    svg {
      path {
        fill: ${(p) => p.theme.color['Error/Error 60 Main']};
      }
    }
  }
`;

