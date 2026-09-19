import { useState, useEffect } from 'react'
import { Ship } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { formatNumber, getStatusColor } from '@/lib/utils'

export default function Vessels() {
  const [vessels, setVessels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const data = await api.getVessels()
        setVessels(data)
      } catch (err) {
        console.error('Failed to fetch vessels:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVessels()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading vessels...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Vessels
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {vessels.length} vessels from database
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vessels.map((vessel) => (
          <Card key={vessel.id} className="hover:border-blue-500 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{vessel.name}</CardTitle>
                <Badge className={getStatusColor(vessel.status)}>
                  {vessel.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{vessel.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">DWT</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(vessel.dwt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Speed</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{vessel.speed} knots</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fuel</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{vessel.fuelConsumption} MT/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Draft</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{vessel.draft}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">LOA</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{vessel.length}m</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vessels.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ship className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No vessels found in database
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
