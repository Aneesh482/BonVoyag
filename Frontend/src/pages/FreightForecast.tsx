import { useState } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { CARGO_TYPES, VESSEL_TYPES, FORECAST_HORIZONS } from '@/lib/constants'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { api } from '@/lib/api'

export default function FreightForecast() {
  const [commodity, setCommodity] = useState('Coal')
  const [origin, setOrigin] = useState('Newcastle (Australia)')
  const [destination, setDestination] = useState('Paradip')
  const [vesselType, setVesselType] = useState('Panamax')
  const [horizon, setHorizon] = useState('30d')
  const [forecast, setForecast] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateForecast = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.getFreightForecast({
        commodity,
        origin,
        destination,
        vesselType,
        horizon,
      })
      setForecast(result)
    } catch (err: any) {
      console.error('Forecast error:', err)
      setError(err?.response?.data?.error || 'Failed to generate forecast')
    } finally {
      setLoading(false)
    }
  }

  const allData = forecast?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Freight Forecast
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          AI-powered freight rate predictions with confidence intervals
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Parameters</CardTitle>
          <CardDescription>Configure forecast settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select value={commodity} onValueChange={setCommodity}>
              <SelectTrigger>
                <SelectValue placeholder="Commodity" />
              </SelectTrigger>
              <SelectContent>
                {CARGO_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger>
                <SelectValue placeholder="Origin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Newcastle (Australia)">Newcastle (Australia)</SelectItem>
                <SelectItem value="Richards Bay (South Africa)">Richards Bay</SelectItem>
                <SelectItem value="Port Hedland (Australia)">Port Hedland</SelectItem>
              </SelectContent>
            </Select>

            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger>
                <SelectValue placeholder="Destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paradip">Paradip</SelectItem>
                <SelectItem value="Visakhapatnam">Visakhapatnam</SelectItem>
                <SelectItem value="Chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vesselType} onValueChange={setVesselType}>
              <SelectTrigger>
                <SelectValue placeholder="Vessel Type" />
              </SelectTrigger>
              <SelectContent>
                {VESSEL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={horizon} onValueChange={setHorizon}>
              <SelectTrigger>
                <SelectValue placeholder="Horizon" />
              </SelectTrigger>
              <SelectContent>
                {FORECAST_HORIZONS.map((h) => (
                  <SelectItem key={h.value} value={h.value}>
                    {h.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={generateForecast} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Forecast'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {forecast && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Current Freight
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(forecast.currentRate)}/MT
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Predicted Freight
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(forecast.forecastRate)}/MT
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Expected Change
                </div>
                <div className={`text-2xl font-bold flex items-center gap-2 ${
                  forecast.change < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {forecast.change < 0 ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                  {formatPercentage(forecast.change)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Trend
                </div>
                <div className="mt-2">
                  <Badge className={forecast.trend === 'Decreasing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                    {forecast.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Confidence
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {forecast.confidence}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  High
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Freight Rate Trend & Forecast</CardTitle>
              <CardDescription>
                Historical data and {horizon} forecast with confidence interval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={allData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any, name: string) => {
                      if (name === 'rate') return [`$${value}/MT`, 'Freight Rate']
                      if (name === 'confidence') return [`${value}%`, 'Confidence']
                      return [value, name]
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Forecast Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      Freight rates expected to decrease
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      Market analysis suggests freight rates will decline by approximately {formatPercentage(Math.abs(forecast.change))} over the next {horizon}. Primary factors include increased vessel availability and stabilizing bunker prices.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      Optimal charter window
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      Consider waiting 10-14 days before chartering to capture the forecasted rate decrease. Monitor market conditions daily for any significant changes.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      Confidence level: High ({forecast.confidence}%)
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      Forecast reliability is high based on historical accuracy, market stability, and data quality. Normal volatility expected for this route.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Market Drivers */}
          <Card>
            <CardHeader>
              <CardTitle>Key Market Drivers</CardTitle>
              <CardDescription>Factors influencing the forecast</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Vessel Availability</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">High Impact</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Bunker Prices</span>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Medium Impact</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Coal Demand</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Medium Impact</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Port Congestion</span>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Low Impact</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!forecast && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Configure parameters and generate freight forecast
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
