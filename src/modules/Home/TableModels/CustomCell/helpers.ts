import { Row } from '../types';

const SumApp = '/sum';

const getModelAliasLink = (modelAlias: string) => {
  const [modelWithNumber, modelVersion] = modelAlias.split('-v');

  if (modelWithNumber.includes('model')) {
    const modelNumber = modelWithNumber.slice('model'.length);

    return [SumApp, '/model', `/${modelNumber}`, `/${modelVersion}`, '/main'].join('');
  }

  return '';
};

export const getLink = (columnName: keyof Row, value?: string) => {
  if (columnName === 'model_alias' && value) {
    return getModelAliasLink(value);
  }

  return '';
};
