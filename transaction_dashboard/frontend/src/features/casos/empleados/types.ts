// frontend/src/features/casos/empleados/types.ts

export interface EmpleadoMetric {
  empleadoId: number
  nombre: string
  totalTransactions: number
  totalDetails: number
  totalSalesNet: string
  totalDiscounts: string
  avgDiscount: string
}

export interface EmpleadoTop {
  empleadoId: number
  nombre: string
  totalTransactions: number
}

export interface EmployeeHourly {
  dia: string
  hora: string
  transacciones: number
  ventasNeta: string
}
