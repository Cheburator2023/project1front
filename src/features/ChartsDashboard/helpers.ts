import { format, isAfter, isValid, parse } from 'date-fns';

const generateChartData = (delta: number): number[] => {
  const metricValue = Math.abs(delta);

  if (metricValue === 0) {
    return [0, 0, 0, 0];
  }

  const firstValue = Math.floor(metricValue * 0.05);
  const secondValue = Math.floor(metricValue * 0.15);
  const thirdValue = Math.floor(metricValue * 0.75);

  if (delta > 0) {
    return [firstValue, secondValue, thirdValue, metricValue];
  }
  return [metricValue, thirdValue, secondValue, firstValue];
};

const switchDateFormat = (dateString: string) => {
  if (dateString.includes('.')) {
    const parsedDate = parse(dateString, 'dd.MM.yyyy', new Date());
    return format(parsedDate, 'yyyy-MM-dd');
  }

  if (dateString.includes('-')) {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    return format(parsedDate, 'yyyy-MM-dd');
  }

  return dateString;
};

const validateDateRange = (startDate: string, endDate: string): boolean => {
  const parsedStartDate = parse(startDate, 'dd.MM.yyyy', new Date());
  const parsedEndDate = parse(endDate, 'dd.MM.yyyy', new Date());
  const currentDate = new Date();

  return (
    isValid(parsedStartDate) &&
    isValid(parsedEndDate) &&
    parsedStartDate <= currentDate &&
    parsedEndDate <= currentDate &&
    parsedStartDate <= parsedEndDate
  );
};
export { generateChartData, switchDateFormat, validateDateRange };

