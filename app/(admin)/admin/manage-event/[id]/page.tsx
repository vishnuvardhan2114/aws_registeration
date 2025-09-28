"use client";

import { RegisteredUsersTable } from '@/app/components/RegisteredUsersTable';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { ArrowLeft, Calendar, Clock, IndianRupee, Utensils } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const EventDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as Id<"events">
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'exception'>('all')
  const event = useQuery(api.events.getEvent, { eventId })
  
  // Get event statistics for display
  const eventStats = useQuery(api.events.getAllEventRegistrationsForExport, {
    eventId: eventId,
    searchName: undefined,
    statusFilter: 'all'
  })


  const { results, loadMore, status, isLoading } = usePaginatedQuery(
    api.events.getPaginatedEventRegistrations,
    {
      eventId: eventId,
      searchName: searchValue || undefined,
      statusFilter: statusFilter,
    },
    { initialNumItems: 10 }
  );


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



  if (isLoading && status === "LoadingFirstPage" && searchValue === undefined) {
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
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-gray-100 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 truncate">{event.name}</h1>
            <p className="text-sm sm:text-base text-gray-600 truncate">
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
          className="text-sm self-start sm:self-center mt-2 sm:mt-0"
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
      <Accordion type="single" collapsible className="w-full mt-4">
        <AccordionItem value="event-details" className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2 text-gray-900">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">Event Details</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4">
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
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Payment Statistics */}
      {eventStats ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Payment Statistics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* UPI Amount */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">UPI Payments</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(eventStats.summary.totalUpiAmount)}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Amount */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cash Payments</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(eventStats.summary.totalCashAmount)}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <IndianRupee className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Amount */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(eventStats.summary.totalAmount)}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <IndianRupee className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Registrations */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {eventStats.users.length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Status Breakdown */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">User Status Breakdown</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Paid Users */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Paid Users</p>
                      <p className="text-2xl font-bold text-green-600">
                        {eventStats.summary.paidUsers}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Paid
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Users */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Users</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {eventStats.summary.pendingUsers}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Pending
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Exception Users */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Exception Users</p>
                      <p className="text-2xl font-bold text-red-600">
                        {eventStats.summary.exceptionUsers}
                      </p>
                    </div>
                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                      Exception
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Payment Statistics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">User Status Breakdown</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Registered Users Table */}
      <div className="mt-8">
        <RegisteredUsersTable
          users={results}
          loadMore={loadMore}
          status={status}
          eventId={eventId}
          setSearchValue={setSearchValue}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>

    </div>
  )
}

export default EventDetailPage