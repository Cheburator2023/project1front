import { Tags } from '@admiral-ds/react-ui';
import styled from 'styled-components';

const TagsContainer = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;

  & > div:first-child {
    max-width: 170px;
    overflow: hidden;
  }
`;

const MultiSelectContainer = styled.div`
  display: block;
  flex-wrap: nowrap;
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 0;
`;

const SingleSelectContainer = styled.div`
  display: flex;
  flex-direction: row;
  text-wrap: nowrap;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 24px;
  min-height: 24px;
`;

const CustomTags = styled(Tags)`
  margin-left: 5px;
  display: flex;
  flex-direction: row;
  flex-flow: row;
`;

export { TagsContainer, MultiSelectContainer, SingleSelectContainer, CustomTags };
