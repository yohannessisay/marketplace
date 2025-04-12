import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  icon: ReactNode
  title: string
  value: string | number
  hasIncrease?: boolean
  increaseValue?: number | null
}

export function StatCard({ icon, title, value, hasIncrease = false, increaseValue = null }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className="rounded-full p-2 bg-emerald-100 mr-3">{icon}</div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-semibold text-gray-900">{value}</p>
            {increaseValue && (
              <div className={`flex items-center text-xs ${hasIncrease ? "text-emerald-600" : "text-red-600"}`}>
                {hasIncrease ? (
                  <span>▲ {increaseValue}% from last month</span>
                ) : (
                  <span>▼ {increaseValue}% from last month</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
