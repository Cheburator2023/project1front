import { Template } from '@shared/api';
import { SelectOption, SelectTemplatesOptions } from '@shared/ui/organisms';

export const getGroupsOptions = (templates: Template[]): SelectTemplatesOptions => {
  const templatesGroups = Array.from(new Set(templates.map((template) => template.group_label)));

  return <
    Array<{
      text: string;
      options: Array<SelectOption & { filtersCount: number }>;
    }>
  >templatesGroups?.map((groupName) => ({
    text: groupName,
    options: templates
      .filter((template) => template.group_label === groupName)
      .map((template) => ({
        value: String(template.template_id),
        text: template.template_name,
        filtersCount:
          (template.sortState ? template.sortState : []).length +
          Object.values(template.filterModel ? template.filterModel : {}).length,
      })),
  }));
};

