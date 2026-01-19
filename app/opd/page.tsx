'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useHospitalStore } from '@/lib/store'
import { Clock, UserPlus, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency']

export default function OPDPage() {
  const { opdQueue, addPatientToQueue, updatePatientStatus, getAverageWaitTime } = useHospitalStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedDept, setSelectedDept] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    contact: '',
    department: 'General Medicine'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addPatientToQueue({
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      contact: formData.contact,
      department: formData.department,
      status: 'waiting'
    })
    setFormData({
      name: '',
      age: '',
      gender: 'male',
      contact: '',
      department: 'General Medicine'
    })
    setShowForm(false)
  }

  const filteredQueue = selectedDept 
    ? opdQueue.filter(p => p.department === selectedDept)
    : opdQueue

  const waitingPatients = filteredQueue.filter(p => p.status === 'waiting')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold font-serif">OPD Queue Management</h1>
          <p className="text-muted-foreground mt-1">Real-time patient check-in and queue monitoring</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Check-In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Age</label>
                <Input
                  required
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Enter age"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact</label>
                <Input
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Department</label>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>
              </div>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit">Check In Patient</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {departments.map(dept => {
          const deptPatients = opdQueue.filter(p => p.department === dept && p.status === 'waiting')
          const avgWait = getAverageWaitTime(dept)
          
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
                <div className="text-2xl font-bold">{deptPatients.length}</div>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {avgWait} min avg
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedDept || 'All Departments'} Queue
            </CardTitle>
            <Badge variant="outline">
              {waitingPatients.length} waiting
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {waitingPatients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No patients in queue</p>
            ) : (
              waitingPatients.map((patient, index) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.age}y • {patient.gender} • {patient.contact}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="outline">{patient.department}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(patient.checkInTime, { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => updatePatientStatus(patient.id, 'in-consultation')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
