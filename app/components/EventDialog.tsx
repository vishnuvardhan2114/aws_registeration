'use client'

import React, { useState, useEffect } from 'react'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Calendar } from '@/app/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import { CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

interface Event {
  _id: Id<"events">
  _creationTime: number
  name: string
  isFoodIncluded: boolean
  amount: number
  EndDate: string
  StartDate: string
}

interface EventDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (eventData: {
    name: string
    StartDate: string
    EndDate: string
    isFoodIncluded: boolean
    amount: number
  }) => void
  event?: Event | null
}

const EventDialog: React.FC<EventDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  event
}) => {
  const [formData, setFormData] = useState({
    name: '',
    StartDate: null as Date | null,
    EndDate: null as Date | null,
    StartTime: '',
    EndTime: '',
    isFoodIncluded: false,
    amount: 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (event) {
      const startDate = new Date(event.StartDate)
      const endDate = new Date(event.EndDate)
      
      setFormData({
        name: event.name,
        StartDate: startDate,
        EndDate: endDate,
        StartTime: startDate.toTimeString().slice(0, 5), // HH:MM format
        EndTime: endDate.toTimeString().slice(0, 5), // HH:MM format
        isFoodIncluded: event.isFoodIncluded,
        amount: event.amount
      })
    } else {
      setFormData({
        name: '',
        StartDate: null,
        EndDate: null,
        StartTime: '',
        EndTime: '',
        isFoodIncluded: false,
        amount: 0
      })
    }
    setErrors({})
  }, [event, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required'
    }

    if (!formData.StartDate) {
      newErrors.StartDate = 'Start date is required'
    }

    if (!formData.EndDate) {
      newErrors.EndDate = 'End date is required'
    }

    if (!formData.StartTime) {
      newErrors.StartTime = 'Start time is required'
    }

    if (!formData.EndTime) {
      newErrors.EndTime = 'End time is required'
    }

    if (formData.StartDate && formData.EndDate && formData.StartTime && formData.EndTime) {
      const startDateTime = new Date(formData.StartDate)
      const endDateTime = new Date(formData.EndDate)
      
      // Set time on dates
      const [startHour, startMinute] = formData.StartTime.split(':').map(Number)
      const [endHour, endMinute] = formData.EndTime.split(':').map(Number)
      
      startDateTime.setHours(startHour, startMinute, 0, 0)
      endDateTime.setHours(endHour, endMinute, 0, 0)
      
      if (endDateTime <= startDateTime) {
        newErrors.EndTime = 'End date/time must be after start date/time'
      }
    }

    if (formData.amount < 0) {
      newErrors.amount = 'Amount must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Combine date and time into ISO strings
      const startDateTime = new Date(formData.StartDate!)
      const endDateTime = new Date(formData.EndDate!)
      
      const [startHour, startMinute] = formData.StartTime.split(':').map(Number)
      const [endHour, endMinute] = formData.EndTime.split(':').map(Number)
      
      startDateTime.setHours(startHour, startMinute, 0, 0)
      endDateTime.setHours(endHour, endMinute, 0, 0)
      
      onSave({
        name: formData.name,
        isFoodIncluded: formData.isFoodIncluded,
        amount: formData.amount,
        StartDate: startDateTime.toISOString(),
        EndDate: endDateTime.toISOString()
      })
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {event 
              ? 'Update the event details below.' 
              : 'Fill in the details to create a new event.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Event Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter event name"
              className={`text-sm ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="StartDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal text-sm ${
                        !formData.StartDate && "text-muted-foreground"
                      } ${errors.StartDate ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {formData.StartDate ? format(formData.StartDate, "MMM dd, yyyy") : "Pick a date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.StartDate || undefined}
                      onSelect={(date) => handleInputChange('StartDate', date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.StartDate && (
                  <p className="text-sm text-red-500">{errors.StartDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="EndDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal text-sm ${
                        !formData.EndDate && "text-muted-foreground"
                      } ${errors.EndDate ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {formData.EndDate ? format(formData.EndDate, "MMM dd, yyyy") : "Pick a date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.EndDate || undefined}
                      onSelect={(date) => handleInputChange('EndDate', date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.EndDate && (
                  <p className="text-sm text-red-500">{errors.EndDate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="StartTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Time
                </Label>
                <Input
                  id="StartTime"
                  type="time"
                  value={formData.StartTime}
                  onChange={(e) => handleInputChange('StartTime', e.target.value)}
                  className={errors.StartTime ? 'border-red-500' : ''}
                />
                {errors.StartTime && (
                  <p className="text-sm text-red-500">{errors.StartTime}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="EndTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Time
                </Label>
                <Input
                  id="EndTime"
                  type="time"
                  value={formData.EndTime}
                  onChange={(e) => handleInputChange('EndTime', e.target.value)}
                  className={errors.EndTime ? 'border-red-500' : ''}
                />
                {errors.EndTime && (
                  <p className="text-sm text-red-500">{errors.EndTime}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Event Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={`text-sm ${errors.amount ? 'border-red-500' : ''}`}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFoodIncluded"
              checked={formData.isFoodIncluded}
              onCheckedChange={(checked) => handleInputChange('isFoodIncluded', checked as boolean)}
            />
            <Label htmlFor="isFoodIncluded" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Food included in the event
            </Label>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto"
            >
              {event ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EventDialog
