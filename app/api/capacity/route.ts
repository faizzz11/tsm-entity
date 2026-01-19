import { NextResponse } from 'next/server'

export async function GET() {
  const mockData = {
    hospitalId: 'HSP-001',
    hospitalName: 'City General Hospital',
    timestamp: new Date().toISOString(),
    bedAvailability: {
      cardiology: { total: 10, available: 4 },
      neurology: { total: 10, available: 2 },
      orthopedics: { total: 10, available: 5 },
      pediatrics: { total: 10, available: 7 },
      generalMedicine: { total: 10, available: 3 },
      emergency: { total: 15, available: 6 }
    },
    patientLoad: {
      opdQueue: 12,
      activeAdmissions: 42,
      emergencyCases: 3
    },
    averageWaitTime: {
      cardiology: 25,
      neurology: 35,
      orthopedics: 20,
      pediatrics: 15,
      generalMedicine: 30,
      emergency: 5
    },
    status: 'operational'
  }

  return NextResponse.json(mockData)
}
