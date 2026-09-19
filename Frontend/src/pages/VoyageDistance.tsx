import { useState, useEffect } from 'react'
import { Calculator, MapPin, Ship, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VESSEL_TYPES, AVG_VESSEL_SPEED } from '@/lib/constants'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'

export default function VoyageDistance() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [vesselType, setVesselType] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [ports, setPorts] = useState<any[]>([])

  useEffect(() => {
    api.getPorts().then(setPorts).catch(console.error)
  }, [])

  const calculateDistance = async () => {
    try {
      setLoading(true)
      const routes = await api.getRoutes()
      
      const route = routes.find(
        (r: any) => 
          r.originPort === origin && 
          r.destinationPort === destination
      )

      const distance = route ? route.distanceNm : 4850 // fallback if route not in DB
      const speed = AVG_VESSEL_SPEED
      const sailingTime = distance / speed / 24 // days
      const fuelConsumption = 30 // MT/day
      const totalFuel = sailingTime * fuelConsumption
      const fuelPrice = 650 // USD/MT
      const fuelCost = totalFuel * fuelPrice

      setResult({
        distance,
        sailingTime: Math.ceil(sailingTime),
        speed,
        fuelConsumption,
        totalFuel: Math.round(totalFuel),
        fuelCost: Math.round(fuelCost),
        portCharges: 85000 + 125000,
        canalCharges: 0,
        totalCost: Math.round(fuelCost + 210000),
        routeCode: route ? route.routeCode : 'Unknown',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Voyage Distance Calculator
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Calculate sea distance and voyage parameters between ports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Route Details
            </CardTitle>
            <CardDescription>Enter voyage parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Origin Port
              </label>
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger>
                  <SelectValue placeholder="Select origin port" />
                </SelectTrigger>
                <SelectContent>
                  {ports.map((port) => (
                    <SelectItem key={port.id} value={port.name}>
                      {port.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Destination Port
              </label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination port" />
                </SelectTrigger>
                <SelectContent>
                  {ports.map((port) => (
                    <SelectItem key={port.id} value={port.name}>
                      {port.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Vessel Type (Optional)
              </label>
              <Select value={vesselType} onValueChange={setVesselType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vessel type" />
                </SelectTrigger>
                <SelectContent>
                  {VESSEL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={calculateDistance}
              disabled={!origin || !destination}
              className="w-full"
            >
              Calculate Distance
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Voyage Summary</CardTitle>
            <CardDescription>
              {result
                ? `${origin} → ${destination}`
                : 'Enter route details to calculate'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Sea Distance
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {formatNumber(result.distance)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      nautical miles
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Sailing Time
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {result.sailingTime}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      days
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Fuel
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {formatNumber(result.totalFuel)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      MT
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Voyage Cost
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {formatCurrency(result.totalCost / 1000)}K
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      estimated
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Cost Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-gray-700 dark:text-gray-300">Fuel Cost</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(result.fuelCost)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-gray-700 dark:text-gray-300">Port Charges</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(result.portCharges)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-gray-700 dark:text-gray-300">Canal Charges</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(result.canalCharges)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 mt-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Total Estimated Cost
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(result.totalCost)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Technical Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Average Speed</span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {result.speed} knots
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fuel Consumption</span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {result.fuelConsumption} MT/day
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MapPin className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Select origin and destination ports to calculate voyage distance
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
