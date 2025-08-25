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
  useFetch,
  API_ROUTES,
  MutationProtectedFetchProps,
  Template,
  TemplateAddApi,
  TemplateUpdateApi,

} from '@shared/api';
import { StatusScreen } from '@shared/ui/molecules';
import { RightPanel } from '@shared/ui/organisms';
import { useFiltersStore } from '@shared/stores/filtersStore';

import { TemplateItem } from './TemplateItem';
import {
  StyledMenuItem,
  IconWrapper,
  BodyWrapper,
  TemplatesGroup,
  TemplatesGroupLabel,
  TemplatesGroupWrapper,
} from './styles';


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
  const { filterModel, sortState, selectedIds } = useFiltersStore();


  const { isAddPublicTemplateEnabled } = usePermissions();

  const { mutationProtectedFetch } = useFetch({});

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

  async function runTemplateAction<T>({
    fetchParams,
    getNewTemplates,
  }: {
    fetchParams: MutationProtectedFetchProps<T, Template>;
    getNewTemplates?: (templates: Template[], responseTemplate?: Template) => Template[];
  }) {
    setSubmitLoading(true);
    setError('');

    try {
      // @ts-ignore TODO: fix types
      const res: any = await mutationProtectedFetch<T, Template>(fetchParams);

      if (!res || res.error) {
        const errorMessage = res?.data?.message || 'Ошибка';

        setError(errorMessage);
        setFilteredTemplates(templates);
      } else {
        if (getNewTemplates) {
          updateTemplates((prevTemplates: Template[]) => getNewTemplates(prevTemplates, res.data));
          setFilteredTemplates(() => getNewTemplates(templates, res.data));
        }
      }
    } catch (error) {
      setError('Ошибка');
    }

    setValue('');
    setIsOpened(false);
    setSubmitLoading(false);
  }

  const handleOnAddTemplate = (id: string) => {
    if (!value) {
      return;
    }

    runTemplateAction<TemplateAddApi>({
      fetchParams: {
        body: {
          template_name: value,
          public: id === 'public',
          filterModel,
          sortState,
          selectedIds,
        },
        fetchApiRoute: API_ROUTES.TEMPLATE_ADD,
        fetchMethod: 'POST',
      },
      getNewTemplates: (prevTemplates, responseTemplate) => {
        if (responseTemplate) {
          return [...prevTemplates, responseTemplate];
        }
        return prevTemplates;
      },
    });
  };

  const handleOnEditTemplate = (templateId: number, newValue: string, isPublic?: boolean) => {
    runTemplateAction<TemplateUpdateApi>({
      fetchParams: {
        body: {
          template_id: templateId,
          template_name: newValue,
          public: !!isPublic,
          filterModel,
          sortState,
          selectedIds,
        },
        fetchApiRoute: API_ROUTES.TEMPLATE_EDIT,
        fetchMethod: 'PUT',
      },
      getNewTemplates: (prevTemplates, responseTemplate) =>
        prevTemplates.map((template) => {
          if (template.template_id === responseTemplate?.template_id) {
            return responseTemplate;
          }

          return template;
        }),
    });
  };

  const handleOnDeleteTemplate = (templateId: number) => {
    runTemplateAction<{ template_id: number }>({
      fetchParams: {
        body: {
          template_id: templateId,
        },
        fetchApiRoute: API_ROUTES.TEMPLATE_DELETE,
        fetchMethod: 'DELETE',
        routeParam: templateId,
      },
      getNewTemplates: (prevTemplates: Template[]) =>
        prevTemplates.filter(({ template_id }) => template_id !== templateId),
    });
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
            <StyledMenuItem key={ id } dimension="s" data-dimension="s" { ...options }>
              <IconWrapper>{ icon }</IconWrapper>
              { label }
            </StyledMenuItem>
          )
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
            <StyledDropdownContainer targetRef={inputRef} onClickOutside={() => setIsOpened(false)}>
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

