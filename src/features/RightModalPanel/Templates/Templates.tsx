import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  T,
  TextInput,
  InputIconButton,
  Menu,
  RenderOptionProps,
  StyledDropdownContainer,
} from '@admiral-ds/react-ui';
import { usePermissions } from '@src/shared/hooks';

import { ReactComponent as PlusCircleOutline } from '@admiral-ds/icons/build/service/PlusCircleOutline.svg';
import { ReactComponent as LockOutline } from '@admiral-ds/icons/build/security/LockOutline.svg';
import { ReactComponent as UnlockOutline } from '@admiral-ds/icons/build/security/UnlockOutline.svg';
import { ReactComponent as SearchIcon } from '@admiral-ds/icons/build/system/SearchOutline.svg';

import {
  useTemplatesControllerCreateTemplate,
  useTemplatesControllerUpdateTemplate,
  useTemplatesControllerDeleteTemplate,
  useTemplatesControllerGetTemplates,
} from '@shared/api/generated/endpoints';
import { Template } from '@shared/api';
import { StatusScreen } from '@shared/ui/molecules';
import { RightPanel } from '@shared/ui/organisms';
import { useFiltersStore } from '@shared/stores/filtersStore';
import { useExploitationModeStore } from '@src/shared/stores';

import { TemplateItem } from './TemplateItem';
import {
  StyledMenuItem,
  IconWrapper,
  BodyWrapper,
  TemplatesGroup,
  TemplatesGroupLabel,
  TemplatesGroupWrapper,
} from './styles';
import { TemplateCreateDto, TemplateUpdateDto } from '../../../shared/api/generated/models';
import { useGlobalStore } from '../../../shared/stores/globalStore';
import { useTemplatesStore } from '../../../shared/stores/templatesStore';
import { initialTopFilters } from '../../../shared/constants';

const options = [
  {
    id: 'private',
    label: 'Приватный',
    icon: <LockOutline />,
  },
  {
    id: 'public',
    label: 'Публичный',
    icon: <UnlockOutline />,
  },
];

export interface TemplatesProps {
  onClose: () => void;
  updateTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  templates: Template[];
}

export const Templates = ({ templates, onClose, updateTemplates }: TemplatesProps) => {
  const { sortState, selectedIds, setTopFilters } = useFiltersStore();

  const { agGridApi } = useGlobalStore();
  const { setPendingTemplate } = useTemplatesStore();
  const selectedExploitationModes = useExploitationModeStore(
    (state) => state.selectedExploitationModes,
  );

  const { isAddPublicTemplateEnabled } = usePermissions();
  const createTemplateMutation = useTemplatesControllerCreateTemplate();
  const updateTemplateMutation = useTemplatesControllerUpdateTemplate();
  const deleteTemplateMutation = useTemplatesControllerDeleteTemplate();
  const getTemplatesQuery = useTemplatesControllerGetTemplates(
    { mode: selectedExploitationModes },
    { query: { enabled: false } },
  );

  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (templates) {
      setFilteredTemplates(templates);
    }
  }, [templates]);

  const inputRef = useRef(null);

  const [isOpened, setIsOpened] = useState(false);
  const [value, setValue] = useState<string | undefined>('Новый шаблон');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);

      const newFilteredTemplates = templates.filter(
        (template) =>
          template.template_name.toLocaleLowerCase().split(e.target.value.toLocaleLowerCase())
            .length > 1,
      );

      setFilteredTemplates(newFilteredTemplates);
    },
    [templates],
  );

  const handleMutationSuccess = (
    responseTemplate: Template,
    getNewTemplates?: (templates: Template[], responseTemplate?: Template) => Template[],
  ) => {
    if (getNewTemplates) {
      updateTemplates((prevTemplates: Template[]) => {
        const newTemplates = getNewTemplates?.(prevTemplates, responseTemplate);

        const result = {
          ...initialTopFilters,
          templates: [String(responseTemplate?.template_id)],
        };

        setTopFilters(result);

        return newTemplates;
      });
      setFilteredTemplates(() => getNewTemplates(templates, responseTemplate));
    }
    setValue('');
    setIsOpened(false);
    setSubmitLoading(false);
  };

  const handleMutationError = (error: any) => {
    const errorMessage = error?.message || 'Ошибка';
    setError(errorMessage);
    setFilteredTemplates(templates);
    setSubmitLoading(false);
  };

  const handleOnAddTemplate = (id: string) => {
    if (!value) {
      return;
    }

    setSubmitLoading(true);
    setError('');

    const columnState = agGridApi?.getColumnState();
    const filterModel: any = agGridApi?.getFilterModel();

    const templateData: TemplateCreateDto = {
      template_name: value,
      public: id === 'public',
      filterModel,
      columnState: columnState
        ?.filter((item) => item.colId !== 'ag-Grid-ControlsColumn')
        ?.map((item) => ({ colId: item.colId, hide: item.hide })),
      selectedIds,
    };

    createTemplateMutation.mutate(
      { data: templateData },
      {
        onSuccess: (responseTemplate) => {
          if (responseTemplate) {
            handleMutationSuccess(responseTemplate, (prevTemplates, responseTemplate) => {
              if (responseTemplate) {
                return [...prevTemplates, responseTemplate];
              }
              return prevTemplates;
            });
          }
          setPendingTemplate(undefined);
          getTemplatesQuery.refetch();
        },
        onError: handleMutationError,
      },
    );
  };

  const handleOnEditTemplate = (templateId: number, newValue: string, isPublic?: boolean) => {
    setSubmitLoading(true);
    setError('');

    const columnState = agGridApi?.getColumnState();
    const filterModel: any = agGridApi?.getFilterModel();

    const templateData: TemplateUpdateDto = {
      template_id: templateId,
      template_name: newValue,
      public: !!isPublic,
      filterModel,
      columnState: columnState
        ?.filter((item) => item.colId !== 'ag-Grid-ControlsColumn')
        ?.map((item) => ({ colId: item.colId, hide: item.hide })),
      selectedIds,
    };

    updateTemplateMutation.mutate(
      { data: templateData },
      {
        onSuccess: (responseTemplate) => {
          if (responseTemplate) {
            handleMutationSuccess(responseTemplate, (prevTemplates, responseTemplate) =>
              prevTemplates.map((template) => {
                if (template.template_id === responseTemplate?.template_id) {
                  return responseTemplate;
                }
                return template;
              }),
            );
          }
          setPendingTemplate(undefined);
        },
        onError: handleMutationError,
      },
    );
  };

  const handleOnDeleteTemplate = (templateId: number) => {
    setSubmitLoading(true);
    setError('');

    deleteTemplateMutation.mutate(
      { id: templateId },
      {
        onSuccess: () => {
          updateTemplates((prevTemplates: Template[]) =>
            prevTemplates.filter(({ template_id }) => template_id !== templateId),
          );
          setFilteredTemplates((prevTemplates: Template[]) =>
            prevTemplates.filter(({ template_id }) => template_id !== templateId),
          );
          setSubmitLoading(false);
        },
        onError: handleMutationError,
      },
    );
  };

  const model = useMemo(
    () =>
      options
        .filter((option) => {
          if (option.id === 'public' && !isAddPublicTemplateEnabled) {
            return false;
          }

          return true;
        })
        .map(({ id, label, icon }) => ({
          id,
          render: (options: RenderOptionProps) => (
            <StyledMenuItem key={id} dimension="s" data-dimension="s" {...options}>
              <IconWrapper>{icon}</IconWrapper>
              {label}
            </StyledMenuItem>
          ),
        })),
    [],
  );

  const { usersTemplates, publicTemplates } = useMemo(() => {
    if (!filteredTemplates) {
      return {
        usersTemplates: [],
        publicTemplates: [],
      };
    }

    return filteredTemplates.reduce(
      (groupedTemplates, template) => {
        if (template.isOwner) {
          return {
            ...groupedTemplates,
            usersTemplates: [...groupedTemplates.usersTemplates, template],
          };
        }

        return {
          ...groupedTemplates,
          publicTemplates: [...groupedTemplates.publicTemplates, template],
        };
      },
      { usersTemplates: [], publicTemplates: [] } as {
        usersTemplates: Template[];
        publicTemplates: Template[];
      },
    );
  }, [filteredTemplates]);

  return (
    <RightPanel
      title="Шаблоны фильтрации"
      showPanel
      onClose={onClose}
      header={
        <TextInput
          style={{ marginTop: '10px' }}
          ref={inputRef}
          dimension="s"
          value={value}
          placeholder="Поиск по шаблонам"
          onChange={handleChange}
          displayClearIcon
          icons={
            value ? (
              <InputIconButton
                icon={PlusCircleOutline}
                onMouseDown={() => setIsOpened((prevValue) => !prevValue)}
                tabIndex={0}
              />
            ) : (
              <SearchIcon />
            )
          }
        >
          {isOpened && (
            <StyledDropdownContainer
              targetRef={inputRef as any}
              onClickOutside={() => setIsOpened(false)}
            >
              <Menu selected={value} model={model} onSelectItem={handleOnAddTemplate} />
            </StyledDropdownContainer>
          )}
        </TextInput>
      }
      body={
        <StatusScreen
          loadingLabel="Данные сохраняются..."
          successLabel="Успешно сохранено"
          apiLoading={submitLoading}
          error={error}
          onFinished={() => {
            setSubmitLoading(false);
          }}
        >
          <BodyWrapper>
            <TemplatesGroupWrapper $users>
              <TemplatesGroupLabel font="Subtitle/Subtitle 3">Пользовательские</TemplatesGroupLabel>
              <TemplatesGroup>
                {usersTemplates.length ? (
                  usersTemplates.map((template) => (
                    <TemplateItem
                      key={template.template_id}
                      template={template}
                      onDelete={handleOnDeleteTemplate}
                      onEdit={handleOnEditTemplate}
                    />
                  ))
                ) : (
                  <T color="Neutral/Neutral 50" font="Caption/Caption 1">
                    Нет доступных шаблонов
                  </T>
                )}
              </TemplatesGroup>
            </TemplatesGroupWrapper>
            <TemplatesGroupWrapper>
              <TemplatesGroupLabel font="Subtitle/Subtitle 3">Публичные</TemplatesGroupLabel>
              <TemplatesGroup>
                {publicTemplates.length ? (
                  publicTemplates.map((template) => (
                    <TemplateItem key={template.template_id} editable={false} template={template} />
                  ))
                ) : (
                  <T color="Neutral/Neutral 50" font="Caption/Caption 1">
                    Нет доступных шаблонов
                  </T>
                )}
              </TemplatesGroup>
            </TemplatesGroupWrapper>
          </BodyWrapper>
        </StatusScreen>
      }
    />
  );
};

