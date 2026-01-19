export interface HospitalCapacityData {
  hospitalId: string
  hospitalName: string
  timestamp: string
  bedAvailability: Record<string, { total: number; available: number }>
  patientLoad: {
    opdQueue: number
    activeAdmissions: number
    emergencyCases: number
  }
  averageWaitTime: Record<string, number>
  status: 'operational' | 'critical' | 'maintenance'
}

export const fetchHospitalCapacity = async (): Promise<HospitalCapacityData> => {
  const response = await fetch('/api/capacity')
  if (!response.ok) {
    throw new Error('Failed to fetch hospital capacity')
  }
  return response.json()
}

export const fetchMultipleHospitals = async (hospitalIds: string[]): Promise<HospitalCapacityData[]> => {
  const promises = hospitalIds.map(id => 
    fetch(`/api/capacity?hospitalId=${id}`).then(res => res.json())
  )
  return Promise.all(promises)
}

export const getCityWideMetrics = async () => {
  const hospitals = await fetchMultipleHospitals(['HSP-001', 'HSP-002', 'HSP-003'])
  
  const totalBeds = hospitals.reduce((sum, h) => {
    return sum + Object.values(h.bedAvailability).reduce((s, b) => s + b.total, 0)
  }, 0)
  
  const availableBeds = hospitals.reduce((sum, h) => {
    return sum + Object.values(h.bedAvailability).reduce((s, b) => s + b.available, 0)
  }, 0)
  
  const totalPatients = hospitals.reduce((sum, h) => {
    return sum + h.patientLoad.opdQueue + h.patientLoad.activeAdmissions
  }, 0)
  
  return {
    hospitals: hospitals.length,
    totalBeds,
    availableBeds,
    totalPatients,
    occupancyRate: Math.round(((totalBeds - availableBeds) / totalBeds) * 100)
  }
}
