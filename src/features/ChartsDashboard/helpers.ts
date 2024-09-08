import { isAfter, isValid, parse } from 'date-fns';

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
  } else {
    return [metricValue, thirdValue, secondValue, firstValue];
  }
};

const switchDateFormat = (dateString: string) => {
  if (dateString.includes('.')) {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
  }

  return dateString;
};

const validateDateRange = (date: string): boolean => {
  const parsedDate = parse(date, 'dd.MM.yyyy', new Date());
  const today = new Date();

  // Проверяем, что дата корректная и не в будущем
  return isValid(parsedDate) && !isAfter(parsedDate, today);
};

export { generateChartData, switchDateFormat, validateDateRange };

