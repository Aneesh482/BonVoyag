import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { api } from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { MarketData } from '@/types'

const defaultData: MarketData = {
  balticDryIndex: 0, capesizeIndex: 0, panamaxIndex: 0, supramaxIndex: 0, handysizeIndex: 0,
  bunkerPrice: 0, commodityPrices: {}, exchangeRates: {}, vesselSupply: 0, cargoDemand: 0,
  portCongestionIndex: 0, marketPressureScore: 0, keyDrivers: [], updatedAt: '',
}

export default function MarketIntelligence() {
  const [data, setData] = useState<MarketData>(defaultData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getMarketData()
        setData(result)
      } catch (err) {
        console.error('Failed to fetch market data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading market data...</span>
      </div>
    )
  }

  const indexData = [
    { name: 'BDI', value: data.balticDryIndex, change: -2.3 },
    { name: 'Capesize', value: data.capesizeIndex, change: -3.1 },
    { name: 'Panamax', value: data.panamaxIndex, change: -1.8 },
    { name: 'Supramax', value: data.supramaxIndex, change: -2.1 },
    { name: 'Handysize', value: data.handysizeIndex, change: -1.5 },
  ]

  const supplyDemandData = [
    { month: 'Aug W1', supply: 1820, demand: 1680 },
    { month: 'Aug W2', supply: 1835, demand: 1695 },
    { month: 'Aug W3', supply: 1840, demand: 1710 },
    { month: 'Aug W4', supply: 1847, demand: 1653 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Market Intelligence
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Real-time market indicators and shipping intelligence
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Last updated: {new Date(data.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Market Pressure Score */}
      <Card>
        <CardHeader>
          <CardTitle>Market Pressure Score</CardTitle>
          <CardDescription>
            Overall market conditions assessment (0-100)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-200 dark:text-gray-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(data.marketPressureScore / 100) * 352} 352`}
                  className="text-blue-600 dark:text-blue-400"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {data.marketPressureScore}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">/ 100</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Moderate Market Pressure
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Market conditions are moderately favorable for charterers. Vessel supply exceeds demand,
                and freight rates are showing a declining trend. Consider strategic timing for optimal rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Baltic Indices */}
      <Card>
        <CardHeader>
          <CardTitle>Baltic Dry Indices</CardTitle>
          <CardDescription>Shipping industry benchmark indices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {indexData.map((index) => (
              <div
                key={index.name}
                className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {index.name}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(index.value)}
                </div>
                <div className={`text-sm flex items-center gap-1 mt-1 ${
                  index.change < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {index.change < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  {Math.abs(index.change)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Bunker Price (VLSFO)
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(data.bunkerPrice)}/MT
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
              <TrendingDown className="w-4 h-4" />
              3.8% this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              USD/INR
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ₹{data.exchangeRates['USD/INR']}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
              <Minus className="w-4 h-4" />
              Stable
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Coal Price
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(data.commodityPrices.coal)}/MT
            </div>
            <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" />
              2.1% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Port Congestion Index
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {data.portCongestionIndex}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
              <TrendingDown className="w-4 h-4" />
              Improving
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supply & Demand */}
      <Card>
        <CardHeader>
          <CardTitle>Vessel Supply vs Cargo Demand</CardTitle>
          <CardDescription>Weekly trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supplyDemandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="supply" fill="#0ea5e9" name="Vessel Supply" />
              <Bar dataKey="demand" fill="#8b5cf6" name="Cargo Demand" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Vessel supply currently exceeds cargo demand by ~12%, contributing to downward
              pressure on freight rates. This gap has widened over the past two weeks.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Market Drivers */}
      <Card>
        <CardHeader>
          <CardTitle>Key Market Drivers</CardTitle>
          <CardDescription>Factors influencing current market conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.keyDrivers.map((driver, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {driver.direction === 'up' && (
                    <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  {driver.direction === 'down' && (
                    <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  {driver.direction === 'stable' && (
                    <Minus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {driver.factor}
                  </span>
                </div>
                <Badge
                  className={
                    driver.impact === 'high'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : driver.impact === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }
                >
                  {driver.impact.charAt(0).toUpperCase() + driver.impact.slice(1)} Impact
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
