'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useHospitalStore } from '@/lib/store'
import { BedDouble, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency']

export default function BedsPage() {
  const { beds, admissions } = useHospitalStore()
  const [selectedDept, setSelectedDept] = useState<string>('')

  const filteredBeds = selectedDept 
    ? beds.filter(b => b.department === selectedDept)
    : beds

  const getPatientName = (bedId: string) => {
    const bed = beds.find(b => b.id === bedId)
    if (!bed?.patientId) return null
    const admission = admissions.find(a => a.patientId === bed.patientId && a.status === 'active')
    return admission?.patientName
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold font-serif">Bed Availability Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time bed occupancy and availability</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {departments.map(dept => {
          const deptBeds = beds.filter(b => b.department === dept)
          const available = deptBeds.filter(b => b.status === 'available').length
          const occupied = deptBeds.filter(b => b.status === 'occupied').length
          const occupancyRate = Math.round((occupied / deptBeds.length) * 100)
          
          return (
            <Card 
              key={dept}
              className={selectedDept === dept ? 'ring-2 ring-primary' : 'cursor-pointer hover:bg-accent'}
              onClick={() => setSelectedDept(selectedDept === dept ? '' : dept)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{dept}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-semibold text-green-600">{available}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Occupied</span>
                    <span className="font-semibold text-red-600">{occupied}</span>
                  </div>
                  <div className="pt-2">
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{occupancyRate}% occupied</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedDept || 'All Departments'} Beds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredBeds.map(bed => {
              const patientName = getPatientName(bed.id)
              
              return (
                <div
                  key={bed.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    bed.status === 'available'
                      ? 'border-green-200 bg-green-50 hover:bg-green-100'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BedDouble className={`h-5 w-5 ${
                        bed.status === 'available' ? 'text-green-600' : 'text-red-600'
                      }`} />
                      <span className="font-semibold text-sm">{bed.bedNumber}</span>
                    </div>
                    {bed.status === 'available' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <Badge 
                    variant={bed.status === 'available' ? 'success' : 'destructive'}
                    className="text-xs"
                  >
                    {bed.status}
                  </Badge>
                  {patientName && (
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      {patientName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated {formatDistanceToNow(bed.lastUpdated, { addSuffix: true })}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
