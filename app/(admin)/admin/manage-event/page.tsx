'use client'

import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Plus, Calendar, DollarSign, Utensils, Edit, Trash2, Clock } from 'lucide-react'
import EventDialog from '@/app/components/EventDialog'
import { toast } from 'sonner'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Events</h1>
          <p className="text-muted-foreground">
            Create and manage your registration events
          </p>
        </div>
        <Button onClick={handleAddEvent} className="flex items-center gap-2">
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event._id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(event.StartDate)} - {formatDateTime(event.EndDate)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event._id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-lg">
                      {formatCurrency(event.amount)}
                    </span>
                  </div>
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
                </div>
                
                {event.isFoodIncluded && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Utensils className="h-4 w-4" />
                    <span>Food included</span>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Created {new Date(event._creationTime).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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