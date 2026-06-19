// Service metric label/placeholder mapping by organization service_type
// The DB column remains `job_size NUMERIC` — this is purely a UX layer.

const SERVICE_METRICS = {
  print: {
    label: 'Number of pages',
    placeholder: 'e.g. 42',
    unit: 'pages',
    columnHeader: 'Pages',
  },
  equipment: {
    label: 'Duration (minutes)',
    placeholder: 'e.g. 30',
    unit: 'min',
    columnHeader: 'Duration',
  },
  healthcare: {
    label: 'Estimated visit time (min)',
    placeholder: 'e.g. 15',
    unit: 'min',
    columnHeader: 'Est. time',
  },
  support: {
    label: 'Ticket complexity (1–10)',
    placeholder: 'e.g. 5',
    unit: '',
    columnHeader: 'Complexity',
  },
  food: {
    label: 'Number of items',
    placeholder: 'e.g. 3',
    unit: 'items',
    columnHeader: 'Items',
  },
  general: {
    label: 'Service units',
    placeholder: 'e.g. 10',
    unit: 'units',
    columnHeader: 'Size',
  },
}

export const getMetric = (serviceType) =>
  SERVICE_METRICS[serviceType] ?? SERVICE_METRICS.general

export default SERVICE_METRICS
