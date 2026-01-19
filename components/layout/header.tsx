'use client'

import { Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHospitalStore } from '@/lib/store'
import { useMemo } from 'react'

export function Header() {
  const inventory = useHospitalStore((state) => state.inventory)
  const admissions = useHospitalStore((state) => state.admissions)
  
  const lowStockCount = useMemo(() => {
    return inventory.filter(item => item.currentStock <= item.minThreshold).length
  }, [inventory])
  
  const activeAdmissions = useMemo(() => {
    return admissions.filter(a => a.status === 'active').length
  }, [admissions])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            Hospital Operations Dashboard
          </h2>
          <p className="text-xs text-muted-foreground">
            {activeAdmissions} active admissions
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {lowStockCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {lowStockCount}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
