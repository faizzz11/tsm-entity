'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useHospitalStore } from '@/lib/store'
import { Package, AlertTriangle, TrendingDown, Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { format, subDays } from 'date-fns'

export default function InventoryPage() {
  const { inventory, updateInventory, restockItem, getLowStockItems } = useHospitalStore()
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [restockAmount, setRestockAmount] = useState('')

  const lowStockItems = getLowStockItems()

  const handleRestock = () => {
    if (selectedItem && restockAmount) {
      restockItem(selectedItem, parseInt(restockAmount))
      setSelectedItem(null)
      setRestockAmount('')
    }
  }

  const usageTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      return {
        date: format(date, 'MMM dd'),
        usage: Math.floor(Math.random() * 50) + 20
      }
    })
    return last7Days
  }

  const categoryData = [
    { 
      name: 'Medicines', 
      count: inventory.filter(i => i.category === 'medicine').length,
      lowStock: lowStockItems.filter(i => i.category === 'medicine').length
    },
    { 
      name: 'Consumables', 
      count: inventory.filter(i => i.category === 'consumable').length,
      lowStock: lowStockItems.filter(i => i.category === 'consumable').length
    },
    { 
      name: 'Equipment', 
      count: inventory.filter(i => i.category === 'equipment').length,
      lowStock: lowStockItems.filter(i => i.category === 'equipment').length
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold font-serif">Inventory Management</h1>
        <p className="text-muted-foreground mt-1">Track medicines, consumables, and equipment stock levels</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.reduce((sum, item) => sum + item.currentStock, 0)}
            </div>
            <p className="text-xs text-muted-foreground">units in stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={usageTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="usage" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2563eb" name="Total Items" />
                <Bar dataKey="lowStock" fill="#dc2626" name="Low Stock" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Low Stock Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border-2 border-destructive/20 bg-destructive/5"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {item.currentStock} {item.unit} • Min: {item.minThreshold} {item.unit}
                    </p>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventory.map(item => {
              const stockPercentage = (item.currentStock / (item.minThreshold * 2)) * 100
              const isLow = item.currentStock <= item.minThreshold
              
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        {isLow && <Badge variant="destructive" className="text-xs">Low</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.currentStock} {item.unit} available • Min threshold: {item.minThreshold} {item.unit}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedItem(item.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Restock
                    </Button>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          isLow ? 'bg-destructive' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Restock Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {inventory.find(i => i.id === selectedItem)?.name}
                </label>
                <Input
                  type="number"
                  placeholder="Enter quantity to add"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRestock}>Confirm Restock</Button>
                <Button variant="outline" onClick={() => {
                  setSelectedItem(null)
                  setRestockAmount('')
                }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
