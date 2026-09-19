import { useState, useEffect } from 'react'
import { StatCard } from '@/components/layout/StatCard'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  Ship,
  Package,
  Anchor,
  DollarSign,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { formatCurrency, formatNumber, getStatusColor, getPriorityColor } from '@/lib/utils'
import { Link } from 'react-router-dom'
import type { DashboardSummary } from '@/types'

const INR_TO_USD = 83.5

const defaultData: DashboardSummary = {
  kpis: {
    currentFreight: 0,
    forecastFreight: 0,
    freightTrend: 0,
    availableVessels: 0,
    activeCargoEnquiries: 0,
    activeVesselEnquiries: 0,
    portCongestionIndex: 0,
    estimatedSavings: 0,
  },
  charts: {
    freightHistory: [],
    marketTrend: [],
    vesselAvailability: [],
    portCongestion: [],
    supplyDemand: [],
  },
  activeEnquiries: { cargo: [], vessel: [] },
  recommendedActions: [],
  marketSummary: [],
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary>(defaultData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const summary = await api.getDashboardSummary()
        setData(summary)
        setError(null)
      } catch (err: any) {
        console.error('Dashboard fetch error:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Make sure the backend is running on port 5000</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Chartering & Freight Market Overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Freight Rate"
          value={data.kpis.currentFreight}
          format="currency"
          subtitle="per MT"
        />
        <StatCard
          title="Freight Rate Forecast"
          value={data.kpis.forecastFreight}
          format="currency"
          subtitle="per MT"
        />
        <StatCard
          title="Available Vessels"
          value={data.kpis.availableVessels}
          format="number"
        />
        <StatCard
          title="Estimated Savings"
          value={data.kpis.estimatedSavings / INR_TO_USD}
          format="currency"
          currency="USD"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Cargo Enquiries"
          value={data.kpis.activeCargoEnquiries}
        />
        <StatCard
          title="Active Vessel Enquiries"
          value={data.kpis.activeVesselEnquiries}
        />
        <StatCard
          title="Port Congestion Index"
          value={data.kpis.portCongestionIndex}
        />
        <StatCard
          title="Freight Trend"
          value={data.kpis.freightTrend}
          format="percentage"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Freight History & Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Freight Rate Trend & Forecast</CardTitle>
            <CardDescription>
              Historical rates from database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.charts.freightHistory}>
                <CartesianGrid strokeDasharray="3 3" 
                stroke="#d1d5db"/>
                <XAxis dataKey="date" stroke="#6b7280" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', {month: 'short',day: 'numeric'})}/>
                <YAxis stroke="#6b7280" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: any) => [`$${value}/MT`, 'Freight']}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.08}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Market Summary</CardTitle>
            <CardDescription>Key market indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.marketSummary.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>
            AI-powered recommendations based on market conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recommendedActions.map((action) => (
              <div
                key={action.id}
                className="flex items-start justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {action.title}
                    </h4>
                    <Badge className={getPriorityColor(action.priority)}>
                      {action.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                  {action.potentialSaving && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-2">
                      Potential Saving: {formatCurrency(action.potentialSaving)}
                    </p>
                  )}
                </div>
                {action.actionUrl && (
                  <Link to={action.actionUrl}>
                    <Button size="sm">View</Button>
                  </Link>
                )}
              </div>
            ))}
            {data.recommendedActions.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recommendations yet. Run an optimization to see results.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cargo Enquiries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Cargo Enquiries</CardTitle>
                <CardDescription>Shipments from database</CardDescription>
              </div>
              <Link to="/enquiries/cargo">
                <Button size="sm" variant="outline">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.activeEnquiries.cargo.map((cargo) => (
                <Link
                  key={cargo.id}
                  to={`/enquiries/cargo/${cargo.id}`}
                  className="block p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {cargo.cargoType} - {formatNumber(cargo.quantity)} MT
                    </div>
                    <Badge className={getStatusColor(cargo.status)}>
                      {cargo.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {cargo.origin} → {cargo.destination}
                  </div>
                  {cargo.laycanStart && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Laycan: {new Date(cargo.laycanStart).toLocaleDateString()} - {cargo.laycanEnd ? new Date(cargo.laycanEnd).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                </Link>
              ))}
              {data.activeEnquiries.cargo.length === 0 && (
                <p className="text-gray-500 text-center py-4">No active cargo enquiries</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vessel Enquiries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Vessel Enquiries</CardTitle>
                <CardDescription>Available vessel positions</CardDescription>
              </div>
              <Link to="/enquiries/vessel">
                <Button size="sm" variant="outline">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.activeEnquiries.vessel.map((vessel) => (
                <div
                  key={vessel.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {vessel.vesselName}
                    </div>
                    <Badge className={getStatusColor(vessel.status)}>
                      {vessel.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {vessel.vesselType} - {formatNumber(vessel.dwt)} DWT
                  </div>
                </div>
              ))}
              {data.activeEnquiries.vessel.length === 0 && (
                <p className="text-gray-500 text-center py-4">No active vessel enquiries</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
