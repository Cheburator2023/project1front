import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 16px 24px;
  box-sizing: border-box;
`;

export const HistoryChangeItem = styled.div`
  display: flex;
  align-items: start;
  flex-direction: column;
  margin-bottom: 24px;

  .titleContainer {
    display: flex;
    align-items: center;
    flex-direction: row;

    button {
      margin-right: 8px;
    }

    .title {
      display: flex;
      flex-direction: column;

      span {
        color: ${({ theme }) => theme.color['Neutral/Neutral 50']};
      }
    }
  }

  .value {
    margin-top: 8px;
    color: ${({ theme }) => theme.color['Neutral/Neutral 90']};
  }
`;
