import { Template } from '@shared/api';
import { SelectOption, SelectTemplatesOptions } from '@shared/ui/organisms';

export const getGroupsOptions = (templates: Template[]): SelectTemplatesOptions => {
  const makeOption = (
    template: Template,
  ): SelectOption & { filtersCount: number; activeCols: number } => {
    const filtersCount = Object.values(template.filterModel ? template.filterModel : {}).length;
    const activeCols = (template.columnState ? template.columnState.filter((col) => !col.hide) : [])
      .length;

    return {
      value: String(template.template_id),
      text: template.template_name,
      filtersCount,
      activeCols,
    };
  };

  const normalize = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();

  const systemTemplates = templates.filter((template) => template.user_id === null);
  const userTemplates = templates.filter((template) => template.user_id !== null);

  const systemPriorityMatchers: Array<(name: string) => boolean> = [
    (name) =>
      name.includes('реестр рейтинговых систем') &&
      (name.includes('пурср') || name.includes('пурс')),
    (name) =>
      name.includes('реестр действующих моделей') &&
      (name.includes('пумр') || name.includes('пумрр')),
    (name) => name.includes('реестр моделей дадм'),
    (name) => name.includes('реестр моделей') && name.includes('rwa'),
  ];

  const getSystemPriorityIndex = (template: Template) => {
    const name = normalize(template.template_name);
    const idx = systemPriorityMatchers.findIndex((matcher) => matcher(name));
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };

  const sortedSystemTemplates = [...systemTemplates].sort((a, b) => {
    const pa = getSystemPriorityIndex(a);
    const pb = getSystemPriorityIndex(b);

    if (pa !== pb) return pa - pb;

    return a.template_name.localeCompare(b.template_name, 'ru');
  });

  const myUserTemplates = userTemplates
    .filter((t) => !!t.isOwner)
    .sort((a, b) => a.template_name.localeCompare(b.template_name, 'ru'));

  const otherUserTemplates = userTemplates
    .filter((t) => !t.isOwner)
    .sort((a, b) => a.template_name.localeCompare(b.template_name, 'ru'));

  const result: Array<{
    text: string;
    options: Array<SelectOption & { filtersCount: number; activeCols: number }>;
  }> = [];

  if (sortedSystemTemplates.length) {
    result.push({
      text: 'Системные шаблоны',
      options: sortedSystemTemplates.map(makeOption),
    });
  }

  if (myUserTemplates.length || otherUserTemplates.length) {
    result.push({
      text: 'Пользовательские шаблоны',
      options: [...myUserTemplates, ...otherUserTemplates].map(makeOption),
    });
  }

  return result as SelectTemplatesOptions;
};

