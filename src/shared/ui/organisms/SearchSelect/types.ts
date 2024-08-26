enum SELECT_TYPE {
  TEMPLATES = 'TEMPLATES',
  TAGS = 'TAGS',
  STRING = 'STRING',
}

type SelectOption = {
  value: string;
  text: string;
  visible?: boolean;
  disabled?: boolean;
  nestedValues?: string[];
  parentsValues?: string[];
};

type SelectTemplatesOptions = Array<{
  text: string;
  options: Array<SelectOption & { filtersCount: number }>;
}>;

type SelectTemplatesProps = {
  type: SELECT_TYPE.TEMPLATES;
  groups: SelectTemplatesOptions;
};

type SelectStringOptions = Array<SelectOption>;

type SelectStringProps = {
  type: SELECT_TYPE.STRING;
  options: SelectStringOptions;
};

type SelectTagsOptions = Array<SelectOption & { type: 'public' | 'private' }>;

type SelectTagsProps = {
  type: SELECT_TYPE.TAGS;
  options: SelectTagsOptions;
};

type OptionsFactoryProps = SelectTemplatesProps | SelectStringProps | SelectTagsProps;

export {
  SELECT_TYPE,
  OptionsFactoryProps,
  SelectOption,
  SelectTemplatesOptions,
  SelectTemplatesProps,
  SelectStringOptions,
  SelectStringProps,
  SelectTagsOptions,
  SelectTagsProps,
};
