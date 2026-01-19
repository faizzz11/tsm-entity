import { create } from 'zustand'

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  contact: string
  checkInTime: Date
  priority: number
  department: string
  status: 'waiting' | 'in-consultation' | 'completed'
}

export interface Bed {
  id: string
  department: string
  bedNumber: string
  status: 'available' | 'occupied'
  patientId?: string
  lastUpdated: Date
}

export interface Admission {
  id: string
  patientId: string
  patientName: string
  department: string
  bedId: string
  admissionDate: Date
  diagnosis?: string
  status: 'active' | 'discharged'
  assignedDoctor?: string
}

export interface InventoryItem {
  id: string
  name: string
  category: 'medicine' | 'consumable' | 'equipment'
  currentStock: number
  minThreshold: number
  unit: string
  lastRestocked: Date
  usageHistory: { date: Date; quantity: number; admissionId?: string }[]
}

interface HospitalState {
  opdQueue: Patient[]
  beds: Bed[]
  admissions: Admission[]
  inventory: InventoryItem[]
  
  addPatientToQueue: (patient: Omit<Patient, 'id' | 'checkInTime' | 'priority'>) => void
  updatePatientStatus: (patientId: string, status: Patient['status']) => void
  removePatientFromQueue: (patientId: string) => void
  
  updateBedStatus: (bedId: string, status: Bed['status'], patientId?: string) => void
  
  createAdmission: (admission: Omit<Admission, 'id' | 'admissionDate'>) => string | null
  dischargePatient: (admissionId: string) => void
  
  updateInventory: (itemId: string, quantity: number, admissionId?: string) => void
  restockItem: (itemId: string, quantity: number) => void
  
  getAvailableBeds: (department?: string) => Bed[]
  getLowStockItems: () => InventoryItem[]
  getAverageWaitTime: (department: string) => number
}

export const useHospitalStore = create<HospitalState>((set, get) => ({
  opdQueue: [],
  beds: generateInitialBeds(),
  admissions: [],
  inventory: generateInitialInventory(),
  
  addPatientToQueue: (patient) => {
    const newPatient: Patient = {
      ...patient,
      id: `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      checkInTime: new Date(),
      priority: calculatePriority(patient.department),
      status: 'waiting'
    }
    
    set((state) => ({
      opdQueue: [...state.opdQueue, newPatient].sort((a, b) => b.priority - a.priority)
    }))
  },
  
  updatePatientStatus: (patientId, status) => {
    set((state) => ({
      opdQueue: state.opdQueue.map(p => 
        p.id === patientId ? { ...p, status } : p
      )
    }))
  },
  
  removePatientFromQueue: (patientId) => {
    set((state) => ({
      opdQueue: state.opdQueue.filter(p => p.id !== patientId)
    }))
  },
  
  updateBedStatus: (bedId, status, patientId) => {
    set((state) => ({
      beds: state.beds.map(b => 
        b.id === bedId 
          ? { ...b, status, patientId, lastUpdated: new Date() } 
          : b
      )
    }))
  },
  
  createAdmission: (admission) => {
    const availableBed = get().beds.find(
      b => b.id === admission.bedId && b.status === 'available'
    )
    
    if (!availableBed) {
      return null
    }
    
    const newAdmission: Admission = {
      ...admission,
      id: `ADM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      admissionDate: new Date(),
      status: 'active'
    }
    
    get().updateBedStatus(admission.bedId, 'occupied', admission.patientId)
    
    set((state) => ({
      admissions: [...state.admissions, newAdmission]
    }))
    
    return newAdmission.id
  },
  
  dischargePatient: (admissionId) => {
    const admission = get().admissions.find(a => a.id === admissionId)
    if (admission) {
      get().updateBedStatus(admission.bedId, 'available')
      set((state) => ({
        admissions: state.admissions.map(a => 
          a.id === admissionId ? { ...a, status: 'discharged' } : a
        )
      }))
    }
  },
  
  updateInventory: (itemId, quantity, admissionId) => {
    set((state) => ({
      inventory: state.inventory.map(item => 
        item.id === itemId 
          ? {
              ...item,
              currentStock: Math.max(0, item.currentStock - quantity),
              usageHistory: [
                ...item.usageHistory,
                { date: new Date(), quantity, admissionId }
              ]
            }
          : item
      )
    }))
  },
  
  restockItem: (itemId, quantity) => {
    set((state) => ({
      inventory: state.inventory.map(item => 
        item.id === itemId 
          ? {
              ...item,
              currentStock: item.currentStock + quantity,
              lastRestocked: new Date()
            }
          : item
      )
    }))
  },
  
  getAvailableBeds: (department) => {
    const beds = get().beds.filter(b => b.status === 'available')
    return department ? beds.filter(b => b.department === department) : beds
  },
  
  getLowStockItems: () => {
    return get().inventory.filter(item => item.currentStock <= item.minThreshold)
  },
  
  getAverageWaitTime: (department) => {
    const patients = get().opdQueue.filter(
      p => p.department === department && p.status === 'waiting'
    )
    
    if (patients.length === 0) return 0
    
    const now = new Date()
    const totalWait = patients.reduce((sum, p) => {
      return sum + (now.getTime() - p.checkInTime.getTime())
    }, 0)
    
    return Math.round(totalWait / patients.length / 60000)
  }
}))

function calculatePriority(department: string): number {
  const basePriority = Math.random() * 100
  const departmentBonus = department === 'Emergency' ? 50 : 0
  return basePriority + departmentBonus
}

function generateInitialBeds(): Bed[] {
  const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency']
  const beds: Bed[] = []
  
  departments.forEach((dept, deptIndex) => {
    const bedCount = dept === 'Emergency' ? 15 : 10
    for (let i = 1; i <= bedCount; i++) {
      beds.push({
        id: `BED-${deptIndex}-${i}`,
        department: dept,
        bedNumber: `${dept.substring(0, 3).toUpperCase()}-${i.toString().padStart(3, '0')}`,
        status: Math.random() > 0.6 ? 'available' : 'occupied',
        lastUpdated: new Date()
      })
    }
  })
  
  return beds
}

function generateInitialInventory(): InventoryItem[] {
  return [
    {
      id: 'INV-1',
      name: 'Paracetamol 500mg',
      category: 'medicine',
      currentStock: 1500,
      minThreshold: 500,
      unit: 'tablets',
      lastRestocked: new Date(),
      usageHistory: []
    },
    {
      id: 'INV-2',
      name: 'Amoxicillin 250mg',
      category: 'medicine',
      currentStock: 800,
      minThreshold: 300,
      unit: 'capsules',
      lastRestocked: new Date(),
      usageHistory: []
    },
    {
      id: 'INV-3',
      name: 'IV Drip Set',
      category: 'consumable',
      currentStock: 250,
      minThreshold: 100,
      unit: 'units',
      lastRestocked: new Date(),
      usageHistory: []
    },
    {
      id: 'INV-4',
      name: 'Surgical Gloves',
      category: 'consumable',
      currentStock: 2000,
      minThreshold: 500,
      unit: 'pairs',
      lastRestocked: new Date(),
      usageHistory: []
    },
    {
      id: 'INV-5',
      name: 'Insulin 100IU/ml',
      category: 'medicine',
      currentStock: 150,
      minThreshold: 200,
      unit: 'vials',
      lastRestocked: new Date(),
      usageHistory: []
    },
    {
      id: 'INV-6',
      name: 'Oxygen Cylinder',
      category: 'equipment',
      currentStock: 45,
      minThreshold: 20,
      unit: 'units',
      lastRestocked: new Date(),
      usageHistory: []
    },
    {
      id: 'INV-7',
      name: 'Bandages',
      category: 'consumable',
      currentStock: 450,
      minThreshold: 200,
      unit: 'rolls',
      lastRestocked: new Date(),
      usageHistory: []
    },
    {
      id: 'INV-8',
      name: 'Syringes 10ml',
      category: 'consumable',
      currentStock: 1200,
      minThreshold: 400,
      unit: 'units',
      lastRestocked: new Date(),
      usageHistory: []
    }
  ]
}
