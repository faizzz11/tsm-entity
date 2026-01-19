export const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'General Medicine',
  'Emergency'
] as const

export const INVENTORY_CATEGORIES = [
  'medicine',
  'consumable',
  'equipment'
] as const

export const PATIENT_STATUS = [
  'waiting',
  'in-consultation',
  'completed'
] as const

export const BED_STATUS = [
  'available',
  'occupied'
] as const

export const ADMISSION_STATUS = [
  'active',
  'discharged'
] as const

export const PRIORITY_WEIGHTS = {
  Emergency: 50,
  Cardiology: 30,
  Neurology: 20,
  default: 0
} as const

export const INVENTORY_THRESHOLDS = {
  critical: 0.5,
  low: 1.0,
  moderate: 1.5,
  good: 2.0
} as const

export const WAIT_TIME_THRESHOLDS = {
  normal: 30,
  high: 45,
  critical: 60
} as const

export const OCCUPANCY_THRESHOLDS = {
  low: 50,
  moderate: 70,
  high: 85,
  critical: 95
} as const

export const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#16a34a',
  warning: '#ea580c',
  danger: '#dc2626',
  info: '#0891b2'
} as const
