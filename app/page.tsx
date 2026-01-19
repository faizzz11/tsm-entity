'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHospitalStore } from '@/lib/store'
import { Users, BedDouble, ClipboardPlus, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useMemo } from 'react'

const COLORS = ['#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#16a34a', '#0891b2']

export default function Dashboard() {
  const { opdQueue, beds, admissions, inventory, getLowStockItems } = useHospitalStore()

  const stats = useMemo(() => {
    const waitingPatients = opdQueue.filter(p => p.status === 'waiting').length
    const availableBeds = beds.filter(b => b.status === 'available').length
    const activeAdmissions = admissions.filter(a => a.status === 'active').length
    const lowStock = getLowStockItems().length

    return { waitingPatients, availableBeds, activeAdmissions, lowStock }
  }, [opdQueue, beds, admissions, getLowStockItems])

  const departmentData = useMemo(() => {
    const deptCount: Record<string, number> = {}
    opdQueue.forEach(p => {
      deptCount[p.department] = (deptCount[p.department] || 0) + 1
    })
    return Object.entries(deptCount).map(([name, value]) => ({ name, value }))
  }, [opdQueue])

  const bedOccupancyData = useMemo(() => {
    const deptBeds: Record<string, { total: number; occupied: number }> = {}
    beds.forEach(b => {
      if (!deptBeds[b.department]) {
        deptBeds[b.department] = { total: 0, occupied: 0 }
      }
      deptBeds[b.department].total++
      if (b.status === 'occupied') deptBeds[b.department].occupied++
    })
    return Object.entries(deptBeds).map(([name, data]) => ({
      name,
      occupied: data.occupied,
      available: data.total - data.occupied,
      occupancy: Math.round((data.occupied / data.total) * 100)
    }))
  }, [beds])

  const inventoryData = useMemo(() => {
    return inventory
      .filter(item => item.currentStock <= item.minThreshold * 1.5)
      .map(item => ({
        name: item.name,
        stock: item.currentStock,
        threshold: item.minThreshold
      }))
      .slice(0, 6)
  }, [inventory])

  const admissionTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        admissions: Math.floor(Math.random() * 15) + 5
      }
    })
    return last7Days
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold font-serif text-gray-900">Operational Command View</h1>
        <p className="text-gray-600 mt-1">Real-time hospital operations monitoring</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">OPD Queue</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.waitingPatients}</div>
            <p className="text-xs text-gray-600">patients waiting</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Available Beds</CardTitle>
            <BedDouble className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.availableBeds}</div>
            <p className="text-xs text-gray-600">of {beds.length} total beds</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Admissions</CardTitle>
            <ClipboardPlus className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.activeAdmissions}</div>
            <p className="text-xs text-gray-600">currently admitted</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Inventory Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStock}</div>
            <p className="text-xs text-gray-600">items below threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Activity className="h-5 w-5 text-blue-500" />
              OPD Load by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Admission Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={admissionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="admissions" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BedDouble className="h-5 w-5 text-purple-500" />
              Bed Occupancy by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bedOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" fill="#dc2626" />
                <Bar dataKey="available" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock" fill="#2563eb" name="Current Stock" />
                <Bar dataKey="threshold" fill="#ea580c" name="Min Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
