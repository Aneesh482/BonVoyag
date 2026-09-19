import { useState, useEffect } from 'react'
import { ShoppingCart, Ship, Package } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatNumber, formatCurrency } from '@/lib/utils'

export default function Marketplace() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const result = await api.getMarketplaceItems()
        setItems(result)
      } catch (err) {
        console.error('Failed to fetch marketplace items:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading marketplace...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Marketplace
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Browse and post vessel, cargo, and charter opportunities
        </p>
      </div>

      <Tabs defaultValue="vessels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vessels">Vessels</TabsTrigger>
          <TabsTrigger value="cargo">Cargo</TabsTrigger>
          <TabsTrigger value="charters">Charters</TabsTrigger>
        </TabsList>

        <TabsContent value="vessels" className="space-y-4">
          {items
            .filter((item) => item.type === 'vessel')
            .map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Ship className="w-5 h-5" />
                        {item.title}
                      </CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <Badge>Available</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">DWT</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatNumber(item.dwt!)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Open Port</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.origin}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Open Date</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Indicative Rate</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.indicativeRate!)}/MT
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Posted by {item.postedBy}</span>
                    <Button size="sm">Contact</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="cargo" className="space-y-4">
          {items
            .filter((item) => item.type === 'cargo')
            .map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {item.title}
                      </CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <Badge>Open</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Quantity</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatNumber(item.quantity!)} MT
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Origin</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.origin}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Destination</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.destination}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Laycan</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Posted by {item.postedBy}</span>
                    <Button size="sm">Contact</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="charters">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No charter opportunities at the moment
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
