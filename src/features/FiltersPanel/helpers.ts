import { Template } from '@shared/api';
import { SelectOption, SelectTemplatesOptions } from '@shared/ui/organisms';

export const getGroupsOptions = (templates: Template[]): SelectTemplatesOptions => {
  const templatesGroups = Array.from(new Set(templates.map((template) => template.group_label)));

  return <
    Array<{
      text: string;
      options: Array<SelectOption & { filtersCount: number; activeCols: number }>;
    }>
  >templatesGroups?.map((groupName) => ({
    text: groupName,
    options: templates
      .filter((template) => template.group_label === groupName)
      .map((template) => {
        const filtersCount = Object.values(template.filterModel ? template.filterModel : {}).length;
        const activeCols = (template.columnState ? template.columnState.filter((col) => !col.hide) : []).length;

        return {
          value: String(template.template_id),
          text: template.template_name,
          filtersCount,
          activeCols,
        };
      }),
  }));
};

