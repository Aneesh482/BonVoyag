import { useState, useEffect } from 'react'
import { Bell, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import type { Alert } from '@/types'

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const result = await api.getAlerts()
        setAlerts(result)
      } catch (err) {
        console.error('Failed to fetch alerts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  useEffect(() => {
    setUnreadCount(alerts.filter((a) => !a.read).length)
  }, [alerts])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading alerts...</span>
      </div>
    )
  }

  const markAsRead = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)))
  }

  const markAllAsRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })))
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            Alerts
            {unreadCount > 0 && (
              <Badge className="bg-red-600 text-white">{unreadCount} New</Badge>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Important notifications and market alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Mark All as Read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="critical">
            Critical ({alerts.filter((a) => a.severity === 'critical').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`${getSeverityColor(alert.severity)} ${
                !alert.read ? 'border-2' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {alert.title}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {alert.message}
                        </div>
                      </div>
                      {!alert.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(alert.createdAt).toLocaleString()}
                      </div>
                      {!alert.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(alert.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3">
          {alerts
            .filter((a) => !a.read)
            .map((alert) => (
              <Card
                key={alert.id}
                className={`${getSeverityColor(alert.severity)} border-2`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {alert.title}
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {alert.message}
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(alert.createdAt).toLocaleString()}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(alert.id)}
                        >
                          Mark as Read
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          {alerts.filter((a) => !a.read).length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No unread alerts</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-3">
          {alerts
            .filter((a) => a.severity === 'critical')
            .map((alert) => (
              <Card
                key={alert.id}
                className={`${getSeverityColor(alert.severity)} ${
                  !alert.read ? 'border-2' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {alert.title}
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {alert.message}
                          </div>
                        </div>
                        {!alert.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(alert.createdAt).toLocaleString()}
                        </div>
                        {!alert.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(alert.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
