import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Ship, TrendingDown, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatNumber, formatCurrency, getStatusColor, getPriorityColor } from '@/lib/utils'
import type { CargoEnquiry, Vessel } from '@/types'

export default function CargoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cargo, setCargo] = useState<CargoEnquiry | null>(null)
  const [matchedVessels, setMatchedVessels] = useState<Vessel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return
        const cargoData = await api.getCargoEnquiry(id)
        setCargo(cargoData)
        const vessels = await api.getVessels()
        setMatchedVessels(vessels.filter((v: any) => v.status === 'Available').slice(0, 3))
      } catch (err) {
        console.error('Failed to load cargo detail:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading cargo details...</span>
      </div>
    )
  }

  if (!cargo) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cargo Enquiry Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The cargo enquiry you're looking for doesn't exist.
          </p>
          <Link to="/enquiries/cargo">
            <Button className="mt-4">Back to Enquiries</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Cargo Enquiry {cargo.id.toUpperCase()}
            </h1>
            <Badge className={getStatusColor(cargo.status)}>{cargo.status}</Badge>
            <Badge className={getPriorityColor(cargo.priority)}>{cargo.priority}</Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Created on {new Date(cargo.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button>Find Suitable Vessels</Button>
      </div>

      {/* Cargo Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cargo Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cargo Type
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {cargo.cargoType}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Quantity
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {formatNumber(cargo.quantity)} MT
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Origin
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {cargo.origin}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Destination
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {cargo.destination}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Laycan Start
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {new Date(cargo.laycanStart).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Laycan End
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {new Date(cargo.laycanEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Preferred Vessel Type
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {cargo.preferredVesselType || 'Any'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Supplier
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {cargo.supplier || '-'}
                </p>
              </div>
            </div>
            {cargo.specification && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Specification
                </label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {cargo.specification}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Estimate */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Estimate</CardTitle>
              <CardDescription>Estimated logistics cost</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Current Freight Rate
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    $24.80 / MT
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Forecast Freight Rate
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                    $22.90 / MT
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Expected decrease of 7.6%
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Estimated Total Cost
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    $2.74M
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  Consider waiting 10-14 days. Freight rates expected to decrease,
                  potential saving of $152,000.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Matched Vessels */}
      <Card>
        <CardHeader>
          <CardTitle>Matched Vessels ({matchedVessels.length})</CardTitle>
          <CardDescription>
            Suitable vessels based on cargo requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matchedVessels.map((vessel) => (
              <div
                key={vessel.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Ship className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {vessel.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {vessel.type} • {formatNumber(vessel.dwt)} DWT • Built {vessel.builtYear}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Open: {vessel.openDate} at {vessel.openPort}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Suitability Score
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      94%
                    </div>
                  </div>
                  <Link to={`/vessels/${vessel.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {matchedVessels.length === 0 && (
            <div className="text-center py-12">
              <Ship className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No matched vessels found. Try adjusting your requirements.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
