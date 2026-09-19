import { useState, useEffect } from 'react'
import { Anchor } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { formatNumber, getCongestionColor } from '@/lib/utils'

export default function Ports() {
  const [ports, setPorts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const data = await api.getPorts()
        setPorts(data)
      } catch (err) {
        console.error('Failed to fetch ports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPorts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading ports...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Ports
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {ports.length} ports from database
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ports.map((port) => (
          <Card key={port.id} className="hover:border-blue-500 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{port.name}</CardTitle>
                <Badge className={getCongestionColor(port.congestion) + ' bg-transparent'}>
                  {port.congestion}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{port.country}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Draft</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{port.maxDraft}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Handling Rate</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(port.cargoHandlingRateTpd)} TPD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Wait Time</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{port.averageWaitingTime}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Berth Availability</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{port.berthAvailabilityPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Location</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {port.location?.lat?.toFixed(2)}, {port.location?.lng?.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ports.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Anchor className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No ports found in database
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
