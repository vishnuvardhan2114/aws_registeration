/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { Plus, Calendar, DollarSign, Utensils, Edit, Trash2, Clock, Eye, ArrowUpDown } from 'lucide-react'
import EventDialog from '@/app/components/EventDialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Event {
  _id: Id<"events">
  _creationTime: number
  name: string
  isFoodIncluded: boolean
  amount: number
  EndDate: string
  StartDate: string
}

const ManageEventPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [sortField, setSortField] = useState<'name' | 'StartDate' | 'amount' | '_creationTime'>('_creationTime')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  const router = useRouter()
  const events = useQuery(api.events.getAllEvents) || []
  const addEvent = useMutation(api.events.addEvent)
  const updateEvent = useMutation(api.events.updateEvent)
  const deleteEvent = useMutation(api.events.deleteEvent)

  const handleAddEvent = () => {
    setEditingEvent(null)
    setIsDialogOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setIsDialogOpen(true)
  }

  const handleDeleteEvent = async (eventId: Id<"events">) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent({ eventId })
        toast.success('Event deleted successfully')
      } catch (error) {
        toast.error('Failed to delete event')
        console.error('Error deleting event:', error)
      }
    }
  }

  const handleSaveEvent = async (eventData: {
    name: string
    StartDate: string
    EndDate: string
    isFoodIncluded: boolean
    amount: number
  }) => {
    try {
      if (editingEvent) {
        await updateEvent({
          eventId: editingEvent._id,
          ...eventData
        })
        toast.success('Event updated successfully')
      } else {
        await addEvent(eventData)
        toast.success('Event created successfully')
      }
      setIsDialogOpen(false)
      setEditingEvent(null)
    } catch (error) {
      toast.error('Failed to save event')
      console.error('Error saving event:', error)
    }
  }

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

  const handleSort = (field: 'name' | 'StartDate' | 'amount' | '_creationTime') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedEvents = [...events].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === 'StartDate') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleViewEvent = (eventId: Id<"events">) => {
    router.push(`/admin/manage-event/${eventId}`)
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Events</h1>
          <p className="text-gray-600">
            Create and manage your registration events
          </p>
        </div>
        <Button 
          onClick={handleAddEvent} 
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add New Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first event
            </p>
            <Button onClick={handleAddEvent} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calendar className="h-5 w-5" />
              Events Overview
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage and view all your events in one place
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-200">
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-900"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Event Name
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-900"
                      onClick={() => handleSort('StartDate')}
                    >
                      <div className="flex items-center gap-2">
                        Date & Time
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-900"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-2">
                        Amount
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Features</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-900"
                      onClick={() => handleSort('_creationTime')}
                    >
                      <div className="flex items-center gap-2">
                        Created
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEvents.map((event) => (
                    <TableRow 
                      key={event._id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                      onClick={() => handleViewEvent(event._id)}
                    >
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div className="font-semibold">{event.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {event._id.slice(-8)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            {formatDateTime(event.StartDate)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            to {formatDateTime(event.EndDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">
                            {formatCurrency(event.amount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            isEventActive(event.StartDate, event.EndDate) 
                              ? "default" 
                              : isEventUpcoming(event.StartDate) 
                              ? "secondary" 
                              : "outline"
                          }
                        >
                          {isEventActive(event.StartDate, event.EndDate) 
                            ? "Active" 
                            : isEventUpcoming(event.StartDate) 
                            ? "Upcoming" 
                            : "Ended"
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {event.isFoodIncluded && (
                          <div className="flex items-center gap-2 text-sm">
                            <Utensils className="h-4 w-4 text-orange-600" />
                            <span className="text-orange-600">Food Included</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(event._creationTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewEvent(event._id)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditEvent(event)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteEvent(event._id)
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingEvent(null)
        }}
        onSave={handleSaveEvent}
        event={editingEvent}
      />
      
    </div>
  )
}

export default ManageEventPage