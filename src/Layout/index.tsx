import React, { useCallback, useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { LIGHT_THEME, DropdownProvider } from '@admiral-ds/react-ui';
import { FetchContext } from 'src/api';

import { Header } from './Header';
import { DownloadReportContext } from './DownloadReport/DownloadReportContext';
import { CSVReportBody, CSVReportHeader, UpdateCSVContentArguments } from './DownloadReport/types';

interface LayoutProps {
  children: React.ReactNode;
  protectedFetch?: <T>(routeUrl: string, body?: BodyInit, method?: string) => Promise<T>;
  goToSum?: () => void;
  onLogout?: () => void;
}

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

const Container = styled.div`
  min-width: 1600px;
`;

const Layout = ({ children, protectedFetch, goToSum, onLogout }: LayoutProps) => {
  const [reportHeader, setReportHeader] = useState<CSVReportHeader>([]);
  const [reportBody, setReportBody] = useState<CSVReportBody>([]);

  const updateCVSReportContent = useCallback((newReportContent: UpdateCSVContentArguments) => {
    if (newReportContent.type === 'body') {
      setReportBody(newReportContent.body);
    } else {
      setReportHeader(newReportContent.header);
    }
  }, []);

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <FetchContext.Provider value={{ protectedFetch }}>
      <ThemeProvider theme={LIGHT_THEME}>
        <DropdownProvider>
          <GlobalStyle />
          <DownloadReportContext.Provider value={{ updateCVSReportContent }}>
            <Container>
              <Header
                csvReportContent={{ header: reportHeader, body: reportBody }}
                goToSum={goToSum}
                onLogout={onLogout}
              />
              {children}
            </Container>
          </DownloadReportContext.Provider>
        </DropdownProvider>
      </ThemeProvider>
    </FetchContext.Provider>
  );
};

export default Layout;
