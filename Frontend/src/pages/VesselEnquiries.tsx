import { useState, useEffect } from 'react'
import { Plus, Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api'
import { formatNumber, getStatusColor } from '@/lib/utils'
import type { VesselEnquiry } from '@/types'

export default function VesselEnquiries() {
  const [enquiries, setEnquiries] = useState<VesselEnquiry[]>([])
  const [filteredEnquiries, setFilteredEnquiries] = useState<VesselEnquiry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getVesselEnquiries()
        setEnquiries(data)
        setFilteredEnquiries(data)
      } catch (err) {
        console.error('Failed to fetch vessel enquiries:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = enquiries

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.vesselType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.openPort.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredEnquiries(filtered)
  }, [searchTerm, statusFilter, enquiries])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading vessel enquiries...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Vessel Enquiries
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track open vessel positions and identify vessels available for upcoming cargo requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Paste Circular
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Record Vessel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search vessel, port..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Matched">Matched</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Trading Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
              <SelectItem value="indian-ocean">Indian Ocean</SelectItem>
              <SelectItem value="atlantic">Atlantic</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vessel</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>DWT</TableHead>
              <TableHead>Open Date</TableHead>
              <TableHead>Open Port</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Owner/Broker</TableHead>
              <TableHead>Fuel Consumption</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEnquiries.map((enquiry) => (
              <TableRow key={enquiry.id}>
                <TableCell className="font-medium">{enquiry.vesselName}</TableCell>
                <TableCell>{enquiry.vesselType}</TableCell>
                <TableCell>{formatNumber(enquiry.dwt)}</TableCell>
                <TableCell>{new Date(enquiry.openDate).toLocaleDateString()}</TableCell>
                <TableCell>{enquiry.openPort}</TableCell>
                <TableCell>{enquiry.destination || 'Open'}</TableCell>
                <TableCell>{enquiry.ownerBroker}</TableCell>
                <TableCell>{enquiry.fuelConsumption} MT/day</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(enquiry.status)}>
                    {enquiry.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Post to Marketplace
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredEnquiries.length} of {enquiries.length} vessel enquiries
      </div>
    </div>
  )
}
