import { createContext } from 'react';
import { UpdateCSVContentArguments } from './types';

interface DownloadReportContext {
  updateCVSReportContent: (newContent: UpdateCSVContentArguments) => void;
}

export const DownloadReportContext = createContext<DownloadReportContext>({
  updateCVSReportContent: () => null,
});
