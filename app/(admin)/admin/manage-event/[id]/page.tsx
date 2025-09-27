"use client";

import { RegisteredUsersTable } from '@/app/components/RegisteredUsersTable';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
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
        </CardContent>
      </Card>

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