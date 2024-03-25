import { TemplatesType } from 'src/api/types';
import { SelectTemplatesOptions } from 'src/components/SearchSelect/types';

export const getGroupsOptions = (templates: TemplatesType): SelectTemplatesOptions => {
  const templatesGroups = Array.from(new Set(templates.map((template) => template.group_label)));

  return templatesGroups.map((groupName) => ({
    text: groupName,
    options: templates
      .filter((template) => template.group_label === groupName)
      .map((template) => ({
        value: String(template.template_id),
        text: template.template_label,
        filtersCount: Object.values(template.template_value).length,
      })),
  }));
};
