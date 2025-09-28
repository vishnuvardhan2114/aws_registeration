'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Search,
  Users,
  Utensils,
  XCircle
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

// No need for empty interface since we're not passing any props
const EventDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as Id<"events">

  const [searchTerm, setSearchTerm] = useState('')
  const [filterUsed, setFilterUsed] = useState<'all' | 'used' | 'unused'>('all')
  const [isUsersAccordionOpen, setIsUsersAccordionOpen] = useState(true)

  const event = useQuery(api.events.getEvent, { eventId })
  const eventStats = useQuery(api.events.getEventStats, { eventId })
  const eventRegistrations = useQuery(api.events.getEventRegistrations, { eventId })

  const isLoading = event === undefined || eventStats === undefined || eventRegistrations === undefined

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const isEventActive = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    return now >= start && now <= end
  }

  const isEventUpcoming = (startDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    return start > now
  }

  const filteredRegistrations = eventRegistrations?.filter(registration => {
    const matchesSearch = registration.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (registration.student.email && registration.student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      registration.student.phoneNumber.includes(searchTerm)

    const matchesFilter = filterUsed === 'all' ||
      (filterUsed === 'used' && registration.isUsed) ||
      (filterUsed === 'unused' && !registration.isUsed)

    return matchesSearch && matchesFilter
  }) || []

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'captured':
      case 'paid':
        return 'text-green-600 bg-green-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 w-20 bg-muted animate-pulse rounded mb-2" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Event Not Found</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">The requested event could not be found.</p>
            <Button onClick={() => router.push('/admin/manage-event')} className="mt-4">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{event.name}</h1>
            <p className="text-gray-600">
              Event ID: {event._id.slice(-8)} • Created {new Date(event._creationTime).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge
          variant={
            isEventActive(event.StartDate, event.EndDate)
              ? "default"
              : isEventUpcoming(event.StartDate)
                ? "secondary"
                : "outline"
          }
          className="text-sm"
        >
          {isEventActive(event.StartDate, event.EndDate)
            ? "Active"
            : isEventUpcoming(event.StartDate)
              ? "Upcoming"
              : "Ended"
          }
        </Badge>
      </div>

      {/* Event Details */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Calendar className="h-5 w-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent >
          <div className="grid gap-4 md:grid-cols-2 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Start Date</span>
              </div>
              <p className="text-sm text-muted-foreground">{formatDateTime(event.StartDate)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">End Date</span>
              </div>
              <p className="text-sm text-muted-foreground">{formatDateTime(event.EndDate)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Registration Fee</span>
              </div>
              <p className="text-sm text-muted-foreground">{formatCurrency(event.amount)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Food Included</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {event.isFoodIncluded ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Registrations</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-gray-900">{eventStats?.totalRegistrations || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Amount Collected</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-gray-900">
              {formatCurrency(eventStats?.totalAmountCollected || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Food Coupons Used</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-gray-900">{eventStats?.foodCouponsUsed || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Food Coupons Available</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-gray-900">{eventStats?.foodCouponsAvailable || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Registered Users Accordion */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader
          className="border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsUsersAccordionOpen(!isUsersAccordionOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isUsersAccordionOpen ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
              <div className='space-y-1'>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5" />
                  Registered Users ({filteredRegistrations.length})
                </CardTitle>
                <CardDescription className="text-gray-600">
                  All users who have registered for this event
                </CardDescription>
              </div>
            </div>

          </div>
        </CardHeader>

        {isUsersAccordionOpen && (
          <CardContent className="p-6">
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 w-[40%]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterUsed === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterUsed('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterUsed === 'used' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterUsed('used')}
                >
                  Used
                </Button>
                <Button
                  variant={filterUsed === 'unused' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterUsed('unused')}
                >
                  Unused
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-900">User</TableHead>
                    <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                    <TableHead className="font-semibold text-gray-900">Batch</TableHead>
                    <TableHead className="font-semibold text-gray-900">Payment</TableHead>
                    <TableHead className="font-semibold text-gray-900">Food Coupon</TableHead>
                    <TableHead className="font-semibold text-gray-900">Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No registrations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((registration) => (
                      <TableRow key={registration._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={registration.student.imageUrl} />
                              <AvatarFallback className="text-xs">
                                {getInitials(registration.student.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{registration.student.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {registration.student.email || 'No email provided'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{registration.student.phoneNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {registration.student.batchYear}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {formatCurrency(registration.transaction.amount)}
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getStatusColor(registration.transaction.status)}`}
                            >
                              {registration.transaction.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {registration.isUsed ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">Used</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Not Used</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(registration._creationTime).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default EventDetailPage
