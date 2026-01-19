'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useHospitalStore } from '@/lib/store'
import { ClipboardPlus, UserCheck, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency']

export default function AdmissionsPage() {
  const { admissions, createAdmission, dischargePatient, getAvailableBeds, beds } = useHospitalStore()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    department: 'General Medicine',
    bedId: '',
    diagnosis: '',
    assignedDoctor: ''
  })

  const handleDepartmentChange = (dept: string) => {
    setFormData({ ...formData, department: dept, bedId: '' })
    setError('')
  }

  const availableBeds = getAvailableBeds(formData.department)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const admissionId = createAdmission({
      patientId: formData.patientId,
      patientName: formData.patientName,
      department: formData.department,
      bedId: formData.bedId,
      diagnosis: formData.diagnosis,
      assignedDoctor: formData.assignedDoctor,
      status: 'active'
    })

    if (!admissionId) {
      setError('Selected bed is not available. Please choose another bed.')
      return
    }

    setFormData({
      patientName: '',
      patientId: '',
      department: 'General Medicine',
      bedId: '',
      diagnosis: '',
      assignedDoctor: ''
    })
    setShowForm(false)
  }

  const activeAdmissions = admissions.filter(a => a.status === 'active')
  const recentDischarges = admissions.filter(a => a.status === 'discharged').slice(-10)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold font-serif">Admission Management</h1>
          <p className="text-muted-foreground mt-1">Rule-based admission workflow with bed allocation</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <ClipboardPlus className="mr-2 h-4 w-4" />
          New Admission
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Admission Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Patient Name</label>
                  <Input
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Enter patient name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Patient ID</label>
                  <Input
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    placeholder="Enter patient ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select
                    value={formData.department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Available Bed ({availableBeds.length} available)
                  </label>
                  <Select
                    required
                    value={formData.bedId}
                    onChange={(e) => setFormData({ ...formData, bedId: e.target.value })}
                  >
                    <option value="">Select a bed</option>
                    {availableBeds.map(bed => (
                      <option key={bed.id} value={bed.id}>
                        {bed.bedNumber}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Diagnosis</label>
                  <Input
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assigned Doctor</label>
                  <Input
                    value={formData.assignedDoctor}
                    onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                    placeholder="Enter doctor name"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Admit Patient</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Admissions</CardTitle>
            <Badge variant="outline">{activeAdmissions.length} active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeAdmissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No active admissions</p>
            ) : (
              activeAdmissions.map(admission => {
                const bed = beds.find(b => b.id === admission.bedId)
                
                return (
                  <div
                    key={admission.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{admission.patientName}</p>
                        <Badge variant="outline" className="text-xs">
                          {admission.patientId}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {admission.department} • Bed {bed?.bedNumber}
                      </p>
                      {admission.diagnosis && (
                        <p className="text-sm text-muted-foreground">
                          Diagnosis: {admission.diagnosis}
                        </p>
                      )}
                      {admission.assignedDoctor && (
                        <p className="text-sm text-muted-foreground">
                          Dr. {admission.assignedDoctor}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {format(admission.admissionDate, 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(admission.admissionDate, 'hh:mm a')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dischargePatient(admission.id)}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Discharge
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {recentDischarges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Discharges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentDischarges.map(admission => (
                <div
                  key={admission.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                >
                  <div>
                    <p className="font-medium text-sm">{admission.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {admission.department}
                    </p>
                  </div>
                  <Badge variant="outline">Discharged</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
