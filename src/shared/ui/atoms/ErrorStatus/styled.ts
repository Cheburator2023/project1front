import { css } from 'styled-components';

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
