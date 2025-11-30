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
    return /^\d+$/.test(params.value) ? params.value : '100'
  },
  // artefact_tech_label: ...,
  // artefact_tech_label: ...,
})

export const defaultExcelExportParams = {
  processCellCallback: excelProcessCellCallback
}
