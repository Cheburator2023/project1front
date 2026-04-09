/* eslint-disable no-sequences */
/* eslint-disable no-return-assign */
/* eslint-disable no-constant-condition */
import { useState } from 'react';
import { MODEL_FORM_MODE } from '@shared/constants';
import { Row } from '@shared/types';
import { INPUT_TYPE } from '@shared/ui/organisms';
import { sortBy, unionBy } from 'lodash';
import { useDeepEffect } from '@shared/hooks/useDeepEffect';
import {
  BASE_MODEL_SCHEMA,
  ACTIVE_MODEL_SCHEMA,
  RATING_SYSTEM_MODEL_SCHEMA,
  RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA,
  NOT_ACTIVE_MODEL_SCHEMA,
  SCHEMA_NAME_MAP,
  VALIDATION_MODEL_SCHEMA,
  REST_MODEL_SCHEMA,
} from './constants';
import { FormFieldsSchema, FormValues } from '../types';
import { markSchema } from '../helpers';

interface UseActiveFormSchemaProps {
  values?: FormValues;
  initialRow?: Partial<Row>;
  mode: MODEL_FORM_MODE;
  activeModelByDefault?: boolean;
}

const getUnionSchema = (firstSchema: FormFieldsSchema, secondSchema: FormFieldsSchema) => {
  const unionSchema = [...firstSchema];

  secondSchema.forEach((secondSchemaItem) => {
    // find index in first schema
    const indexUnionSchemaItem = unionSchema.findIndex(
      ({ name }) => name === secondSchemaItem.name,
    );

    // push if index not found in first schema from second
    if (indexUnionSchemaItem === -1) {
      unionSchema.push(secondSchemaItem);
      return;
    }

    unionSchema[indexUnionSchemaItem] = secondSchemaItem;
  });

  return unionSchema;
};

// TODO: Convert data (activeRow and values) to a single format and remove unnecessary conditions
const getEditSchema = (
  activeRow?: Partial<Row>,
  values?: FormValues,
  activeModelByDefault?: boolean,
) => {
  let formSchema = unionBy(
    markSchema(BASE_MODEL_SCHEMA, SCHEMA_NAME_MAP.BASE_MODEL_SCHEMA),
    markSchema(VALIDATION_MODEL_SCHEMA, SCHEMA_NAME_MAP.VALIDATION_MODEL_SCHEMA),
    markSchema(REST_MODEL_SCHEMA, SCHEMA_NAME_MAP.REST_MODEL_SCHEMA),
    'name',
  );

  if (values) {
    if (values.active_model?.value || activeModelByDefault) {
      formSchema = unionBy(
        markSchema(BASE_MODEL_SCHEMA, SCHEMA_NAME_MAP.BASE_MODEL_SCHEMA),
        markSchema(ACTIVE_MODEL_SCHEMA, SCHEMA_NAME_MAP.ACTIVE_MODEL_SCHEMA),
        markSchema(REST_MODEL_SCHEMA, SCHEMA_NAME_MAP.REST_MODEL_SCHEMA),
        'name',
      );

      formSchema = unionBy(
        formSchema,
        markSchema(VALIDATION_MODEL_SCHEMA, SCHEMA_NAME_MAP.VALIDATION_MODEL_SCHEMA),
        'name',
      );

      // TODO: It is necessary to avoid using string values in conditionals, try to switch them to artifact values (prob need another approach)
      if (
        values.rating_model &&
        values.rating_model.type === INPUT_TYPE.SELECT &&
        (Array.isArray(values.rating_model?.value)
          ? values.rating_model?.value.some((item) => item.text === 'Да')
          : values.rating_model?.value?.text === 'Да')
      ) {
        formSchema = getUnionSchema(
          formSchema,
          markSchema(RATING_SYSTEM_MODEL_SCHEMA, SCHEMA_NAME_MAP.RATING_SYSTEM_MODEL_SCHEMA),
        );

        if (
          values.classification_of_rs_by_order_of_application_within_pvr &&
          values.classification_of_rs_by_order_of_application_within_pvr.type ===
            INPUT_TYPE.SELECT &&
          (Array.isArray(values.classification_of_rs_by_order_of_application_within_pvr?.value)
            ? values.classification_of_rs_by_order_of_application_within_pvr?.value?.some(
                (item) => item.text === 'Рейтинговые системы, подлежащие согласованию Регулятором',
              )
            : values.classification_of_rs_by_order_of_application_within_pvr?.value?.text ===
              'Рейтинговые системы, подлежащие согласованию Регулятором')
        ) {
          formSchema = getUnionSchema(
            formSchema,
            markSchema(
              RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA,
              SCHEMA_NAME_MAP.RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA,
            ),
          );
        }
      }
    }

    if (
      (activeRow?.active_model === '1' && !values.active_model?.value) ||
      activeModelByDefault === false
    ) {
      formSchema = unionBy(
        markSchema(BASE_MODEL_SCHEMA, SCHEMA_NAME_MAP.BASE_MODEL_SCHEMA),
        markSchema(NOT_ACTIVE_MODEL_SCHEMA, SCHEMA_NAME_MAP.NOT_ACTIVE_MODEL_SCHEMA),
        markSchema(REST_MODEL_SCHEMA, SCHEMA_NAME_MAP.REST_MODEL_SCHEMA),
        'name',
      );

      formSchema = getUnionSchema(
        formSchema,
        markSchema(VALIDATION_MODEL_SCHEMA, SCHEMA_NAME_MAP.VALIDATION_MODEL_SCHEMA),
      );
    }

    return formSchema;
  }

  return formSchema;
};

const getAddSchema = (
  activeRow?: Partial<Row>,
  values?: FormValues,
  activeModelByDefault?: boolean,
) => {
  let formSchema = markSchema(BASE_MODEL_SCHEMA, SCHEMA_NAME_MAP.BASE_MODEL_SCHEMA);

  console.log('getAddSchema >> values:', values);

  if (activeModelByDefault) {
    formSchema = getUnionSchema(
      markSchema(BASE_MODEL_SCHEMA, SCHEMA_NAME_MAP.BASE_MODEL_SCHEMA),
      markSchema(ACTIVE_MODEL_SCHEMA, SCHEMA_NAME_MAP.ACTIVE_MODEL_SCHEMA),
    );

    formSchema = getUnionSchema(
      formSchema,
      markSchema(VALIDATION_MODEL_SCHEMA, SCHEMA_NAME_MAP.VALIDATION_MODEL_SCHEMA),
    );

    // TODO: It is necessary to avoid using string values in conditionals, try to switch them to artifact values (prob need another approach)
    if (
      values?.rating_model &&
      values?.rating_model.type === INPUT_TYPE.SELECT &&
      (Array.isArray(values.rating_model?.value)
        ? values?.rating_model?.value.some((item) => item.text === 'Да')
        : values?.rating_model?.value?.text === 'Да')
    ) {
      formSchema = getUnionSchema(
        formSchema,
        markSchema(RATING_SYSTEM_MODEL_SCHEMA, SCHEMA_NAME_MAP.RATING_SYSTEM_MODEL_SCHEMA),
      );

      if (
        values.classification_of_rs_by_order_of_application_within_pvr &&
        values.classification_of_rs_by_order_of_application_within_pvr.type === INPUT_TYPE.SELECT &&
        (Array.isArray(values.classification_of_rs_by_order_of_application_within_pvr?.value)
          ? values.classification_of_rs_by_order_of_application_within_pvr?.value?.some(
              (item) => item.text === 'Рейтинговые системы, подлежащие согласованию Регулятором',
            )
          : values.classification_of_rs_by_order_of_application_within_pvr?.value?.text ===
            'Рейтинговые системы, подлежащие согласованию Регулятором')
      ) {
        formSchema = getUnionSchema(
          formSchema,
          markSchema(
            RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA,
            SCHEMA_NAME_MAP.RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA,
          ),
        );
      }
    }
  }
  return formSchema;

  return formSchema;
};

export const useActiveFormSchema = ({
  initialRow,
  values,
  mode,
  activeModelByDefault,
}: UseActiveFormSchemaProps) => {
  console.log('activeModelByDefault:', activeModelByDefault);

  const nonActiveModelSchema = unionBy(
    markSchema(BASE_MODEL_SCHEMA, SCHEMA_NAME_MAP.BASE_MODEL_SCHEMA),
    markSchema(VALIDATION_MODEL_SCHEMA, SCHEMA_NAME_MAP.VALIDATION_MODEL_SCHEMA),
    markSchema(REST_MODEL_SCHEMA, SCHEMA_NAME_MAP.REST_MODEL_SCHEMA),
    'name',
  );

  const [formSchema, setFormSchema] = useState<FormFieldsSchema>(
    activeModelByDefault
      ? unionBy(
          markSchema(BASE_MODEL_SCHEMA, SCHEMA_NAME_MAP.BASE_MODEL_SCHEMA),
          markSchema(ACTIVE_MODEL_SCHEMA, SCHEMA_NAME_MAP.ACTIVE_MODEL_SCHEMA),
          markSchema(VALIDATION_MODEL_SCHEMA, SCHEMA_NAME_MAP.VALIDATION_MODEL_SCHEMA),
          markSchema(REST_MODEL_SCHEMA, SCHEMA_NAME_MAP.REST_MODEL_SCHEMA),
          'name',
        )
      : nonActiveModelSchema,
  );

  useDeepEffect(() => {
    if (mode === MODEL_FORM_MODE.EDIT) {
      const newFormSchema = getEditSchema(initialRow, values, activeModelByDefault);

      setFormSchema(sortBy(newFormSchema, 'required'));
    }
    if (mode === MODEL_FORM_MODE.ADD) {
      const newFormSchema = getAddSchema(initialRow, values, activeModelByDefault);

      setFormSchema(sortBy(newFormSchema, 'required'));
    }
  }, [
    initialRow,
    mode,
    values?.active_model?.value,
    values?.rating_model,
    values?.classification_of_rs_by_order_of_application_within_pvr,
    activeModelByDefault,
  ]);

  return {
    formSchema,
  };
};

