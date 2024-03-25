import React, { useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { T, Button } from '@admiral-ds/react-ui';
import styled from 'styled-components';

import { CSVReportBody, CSVReportHeader } from './types';
import { format } from 'date-fns';

const CustomButton = styled(Button)`
  margin-right: 10px;

  span {
    color: #fff;
  }
`;

interface DownloadReportProps {
  header: CSVReportHeader;
  body: CSVReportBody;
}

export const DownloadReport = ({ header, body }: DownloadReportProps) => {
  const cvsFileName = useMemo(() => {
    const currentDate = format(new Date(), 'dd-MM-yyyy');

    return `Отчет Реестр моделей ${currentDate}.xlsx`;
  }, []);

  const newBody = useMemo(
    () =>
      body.map((row) =>
        Object.entries(row).reduce((newRows, currentRow) => {
          return {
            ...newRows,
            [currentRow[0]]:
              typeof currentRow[1] === 'string' ? currentRow[1].replace(/[\r\n]/gm, '') : '',
          };
        }, {}),
      ),
    [body],
  );

  return (
    <CSVLink filename={cvsFileName} separator={';'} data={newBody} headers={header}>
      <CustomButton dimension="s">
        <T font="Button/Button 2">Выгрузить отчет</T>
      </CustomButton>
    </CSVLink>
  );
};
