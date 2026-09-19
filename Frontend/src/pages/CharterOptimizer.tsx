import { useState, useEffect } from 'react'
import { Settings, AlertCircle, TrendingDown, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { formatCurrency, formatNumber, getRiskColor } from '@/lib/utils'

export default function CharterOptimizer() {
  const [selectedCargo, setSelectedCargo] = useState('')
  const [recommendation, setRecommendation] = useState<any>(null)
  const [shipments, setShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingShipments, setLoadingShipments] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoadingShipments(true)
        const data = await api.getCargoEnquiries()
        setShipments(data)
      } catch (err: any) {
        console.error('Failed to fetch shipments:', err)
      } finally {
        setLoadingShipments(false)
      }
    }
    fetchShipments()
  }, [])

  const generateRecommendation = async () => {
    if (!selectedCargo) return

    try {
      setLoading(true)
      setError(null)
      const result = await api.getCharterRecommendation(selectedCargo)
      
      // Map ML Engine result to UI format
      setRecommendation({
        action: 'Charter Now',
        waitDays: null,
        recommendedVessel: result.vesselName || `Vessel ${result.recommendedVessel}`,
        vesselId: result.recommendedVessel,
        currentFreight: result.predictedFreightRate || 0,
        expectedFreight: result.predictedFreightRate || 0,
        savings: 0,
        totalCost: result.totalCost || 0,
        freightCost: result.freightCost || 0,
        fuelCost: result.fuelCost || 0,
        portCost: result.portCost || 0,
        demurrageCost: result.demurrageCost || 0,
        riskScore: result.riskScore || 0,
        risk: result.riskScore > 0.7 ? 'High' : result.riskScore > 0.4 ? 'Medium' : 'Low',
        confidence: Math.round((1 - (result.riskScore || 0)) * 100),
        recommendedCharterDate: result.recommendedCharterDate || '',
        recommendationReason: result.recommendationReason || '',
        originPort: result.originPort || '',
        destinationPort: result.destinationPort || '',
        comparison: [
          {
            option: `Charter - ${result.vesselName || 'Recommended Vessel'}`,
            freight: result.predictedFreightRate || 0,
            totalCost: result.totalCost || 0,
            savings: 0,
            score: Math.round((1 - (result.riskScore || 0)) * 100),
          },
        ],
      })
    } catch (err: any) {
      console.error('Optimization error:', err)
      setError(err?.response?.data?.error || err.message || 'Optimization failed')
      setRecommendation(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Charter Optimizer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          AI-powered charter timing and vessel selection optimization (connected to ML Engine)
        </p>
      </div>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Optimization Parameters
          </CardTitle>
          <CardDescription>Select a shipment to optimize charter decision</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedCargo} onValueChange={setSelectedCargo}>
              <SelectTrigger>
                <SelectValue placeholder={loadingShipments ? 'Loading shipments...' : 'Select shipment'} />
              </SelectTrigger>
              <SelectContent>
                {shipments.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id}>
                    #{cargo.id} - {cargo.cargoType} {formatNumber(cargo.quantity)} MT
                    ({cargo.origin} → {cargo.destination})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={generateRecommendation} disabled={!selectedCargo || loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running ML Optimization...
                </>
              ) : (
                'Optimize Charter'
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {recommendation && (
        <>
          {/* Recommendation */}
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                ML Engine Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Recommended Vessel
                    </label>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      {recommendation.recommendedVessel}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Route
                    </label>
                    <div className="text-lg text-gray-900 dark:text-gray-100 mt-1">
                      {recommendation.originPort} → {recommendation.destinationPort}
                    </div>
                  </div>

                  {recommendation.recommendedCharterDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Recommended Charter Date
                      </label>
                      <div className="text-lg text-gray-900 dark:text-gray-100 mt-1">
                        {new Date(recommendation.recommendedCharterDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Predicted Freight Rate
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(recommendation.expectedFreight)}/MT
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Estimated Total Cost
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(recommendation.totalCost)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Freight Cost</label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {formatCurrency(recommendation.freightCost)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fuel Cost</label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {formatCurrency(recommendation.fuelCost)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Port Cost</label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {formatCurrency(recommendation.portCost)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Demurrage</label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {formatCurrency(recommendation.demurrageCost)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Risk Level
                  </label>
                  <div className="mt-1">
                    <Badge className={getRiskColor(recommendation.risk)}>
                      {recommendation.risk} ({(recommendation.riskScore * 100).toFixed(0)}%)
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Confidence
                  </label>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {recommendation.confidence}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {recommendation.recommendationReason || 'Optimization complete. The ML engine has evaluated all feasible vessels and selected the best option based on cost, risk, and timing.'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!recommendation && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Select a shipment to run ML-powered charter optimization
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
