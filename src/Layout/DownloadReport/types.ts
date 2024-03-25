type CSVReportHeader = Array<{
  key: string;
  label: string;
}>;

type CSVReportBody = Array<Record<string, string>>;

type UpdateCSVHeader = {
  type: 'header';
  header: CSVReportHeader;
};

type UpdateCSVBody = {
  type: 'body';
  body: CSVReportBody;
};

type UpdateCSVContentArguments = UpdateCSVHeader | UpdateCSVBody;

export { CSVReportHeader, CSVReportBody, UpdateCSVContentArguments };
