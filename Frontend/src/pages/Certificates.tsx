import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'
import { getStatusColor } from '@/lib/utils'

export default function Certificates() {
  const [certificates, setCertificates] = useState([])
  const [expiringSoon, setExpiringSoon] = useState(0)
  const [expired, setExpired] = useState(0)

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await api.getCertificates()
        setCertificates(data)
      } catch (err) {
        console.error('Failed to fetch certificates:', err)
      }
    }
    fetchCertificates()
  }, [])

  useEffect(() => {
    setExpiringSoon(
      certificates.filter(c => c.status === 'Expiring Soon').length
    )

    setExpired(
      certificates.filter(c => c.status === 'Expired').length
    )
  }, [certificates])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Certificates
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Vessel certificate management and tracking
        </p>
      </div>

      {(expiringSoon > 0 || expired > 0) && (
        <div className="flex gap-4">
          {expiringSoon > 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />

              <span className="text-sm text-gray-700 dark:text-gray-300">
                {expiringSoon} certificate
                {expiringSoon > 1 ? 's' : ''} expiring soon
              </span>
            </div>
          )}

          {expired > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />

              <span className="text-sm text-gray-700 dark:text-gray-300">
                {expired} certificate
                {expired > 1 ? 's' : ''} expired
              </span>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Certificate Registry</CardTitle>

          <CardDescription>
            All vessel certificates and validity status
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vessel</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Issuing Authority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {certificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">
                    {cert.vesselName}
                  </TableCell>

                  <TableCell>
                    {cert.certificateType}
                  </TableCell>

                  <TableCell>
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    {new Date(cert.expiryDate).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    {cert.issuingAuthority}
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(cert.status)}>
                      {cert.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}