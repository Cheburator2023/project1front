const switchDateFormat = (dateString: string) => {
  // Change from "dd.mm.yyyy" format to "yyyy-mm-dd"
  if (dateString.includes('.')) {
    return dateString.split('.').reverse().join('-');
  }

  if (dateString.includes('-')) {
    return dateString;
  }

  // Change from "yyyy-mm-dd" format to "dd.mm.yyyy"
  return dateString.split('-').reverse().join('.');
};

export const getDateRange = (newValue?: string) => {
  if (!newValue) {
    return [];
  }

  const dateRange = newValue.split(' - ');

  if (!dateRange.length) {
    return [];
  }

  if (dateRange[0].includes('_') || dateRange[1].includes('_')) {
    return null;
  }

  const formattedStartDate = switchDateFormat(dateRange[0]);
  const formattedEndDate = switchDateFormat(dateRange[1]);

  return [formattedStartDate, formattedEndDate];
};

const getDateRangeInputValueFormat = (startDate: string, endDate: string) =>
  `${switchDateFormat(startDate)} - ${switchDateFormat(endDate)}`;

export const getFormattedDateValue = (filterValue?: string | string[]) => {
  if (!filterValue) {
    return '';
  }

  if (filterValue.length && filterValue[0] !== 'not-null') {
    const [startDate, endDate] = filterValue;

    return getDateRangeInputValueFormat(startDate, endDate);
  }

  return '';
};

export const getFormattedQuarterDateValue = (filterValue?: string | string[]) => {
  if (!filterValue && !Array.isArray(filterValue)) {
    return '';
  }

  return '';
};
