import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AgGridModelsTable } from '@src/features/AgGridTables/templates/AgGridModelsTable';
import { RightModalPanel } from '../../features/RightModalPanel';
import { FiltersPanel } from '../../features/FiltersPanel/organisms/FiltersPanel';
import { TemplatesPanel } from '../../features/TemplatesPanel/organisms/TemplatesPanel';
import { Flexbox } from '../../shared/ui/atoms';
import { useModelsStore, usePanelsStore } from '../../shared/stores';

/** Параметры ссылки на панель: ?edit=<system_model_id> | ?delete=<system_model_id> */
export const MODEL_PANEL_EDIT_PARAM = 'edit';
export const MODEL_PANEL_DELETE_PARAM = 'delete';

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rows } = useModelsStore();
  const {
    editModelPanel,
    deleteModelPanel,
    openEditModelPanel,
    openDeleteModelPanel,
  } = usePanelsStore();

  const urlHydratedRef = useRef(false);
  const prevEditOpenRef = useRef(false);
  const prevDeleteOpenRef = useRef(false);

  // Сначала синхронизируем панель в URL (layout — до эффекта «URL → панель», чтобы не переоткрыть по старому ?edit=)
  useLayoutEffect(() => {
    const next = new URLSearchParams(searchParams);
    const before = searchParams.toString();

    if (editModelPanel.isOpen && editModelPanel.activeRowId) {
      next.delete(MODEL_PANEL_DELETE_PARAM);
      next.set(MODEL_PANEL_EDIT_PARAM, editModelPanel.activeRowId);
    } else if (deleteModelPanel.isOpen && deleteModelPanel.activeRow?.[0]?.system_model_id) {
      const id = deleteModelPanel.activeRow[0].system_model_id;
      if (id) {
        next.delete(MODEL_PANEL_EDIT_PARAM);
        next.set(MODEL_PANEL_DELETE_PARAM, id);
      }
    } else if (!editModelPanel.isOpen && !deleteModelPanel.isOpen) {
      if (urlHydratedRef.current) {
        next.delete(MODEL_PANEL_EDIT_PARAM);
        next.delete(MODEL_PANEL_DELETE_PARAM);
      }
    }

    if (next.toString() !== before) {
      setSearchParams(next, { replace: true });
    }
  }, [
    searchParams,
    editModelPanel.isOpen,
    editModelPanel.activeRowId,
    deleteModelPanel.isOpen,
    deleteModelPanel.activeRow,
    setSearchParams,
  ]);

  // После загрузки строк открыть панель по ссылке (не переоткрывать сразу после закрытия — пока в URL ещё ?edit=)
  useEffect(() => {
    if (rows === undefined) {
      return;
    }

    const editId = searchParams.get(MODEL_PANEL_EDIT_PARAM);
    const deleteId = searchParams.get(MODEL_PANEL_DELETE_PARAM);

    const justClosedEdit = prevEditOpenRef.current && !editModelPanel.isOpen;
    const justClosedDelete = prevDeleteOpenRef.current && !deleteModelPanel.isOpen;

    if (editId) {
      const match = rows.find((r) => r.system_model_id === editId);
      if (match && !justClosedEdit) {
        if (!editModelPanel.isOpen || editModelPanel.activeRowId !== editId) {
          openEditModelPanel(editId, 'model_name');
        }
      }
    } else if (deleteId) {
      const match = rows.find((r) => r.system_model_id === deleteId);
      if (match && !justClosedDelete) {
        if (
          !deleteModelPanel.isOpen ||
          deleteModelPanel.activeRow?.[0]?.system_model_id !== deleteId
        ) {
          openDeleteModelPanel([match]);
        }
      }
    }

    prevEditOpenRef.current = editModelPanel.isOpen;
    prevDeleteOpenRef.current = deleteModelPanel.isOpen;
    urlHydratedRef.current = true;
  }, [
    rows,
    searchParams,
    editModelPanel.isOpen,
    editModelPanel.activeRowId,
    deleteModelPanel.isOpen,
    deleteModelPanel.activeRow,
    openEditModelPanel,
    openDeleteModelPanel,
  ]);

  return (
    <>
      <RightModalPanel />
      <Flexbox alignItems="center" gap={12} style={{ padding: '0px 12px', background: '#e5e7eb' }}>
        <TemplatesPanel />
        <FiltersPanel />
      </Flexbox>
      <AgGridModelsTable />
    </>
  );
};
