type CellHandler = (params: any) => any;

const createProcessCellCallback = (
  handles: Record<string, CellHandler>,
  defaultHandler?: CellHandler
) => (params: any) => {
  const colId = params.column.getColId()
  const handler = handles[colId]

  if (handler) return handler(params)
  if (defaultHandler) return defaultHandler(params)
  return params.value
}

const excelProcessCellCallback = createProcessCellCallback({
  model_risk_coefficient: (params) => {
    return params.value === null || params.value === undefined ? '100' : params.value
  },
  // artefact_tech_label: ...,
  // artefact_tech_label: ...,
})

export const defaultExcelExportParams = {
  processCellCallback: excelProcessCellCallback
}
