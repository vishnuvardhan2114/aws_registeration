'use client'

import React, { useState, useEffect } from 'react'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Calendar } from '@/app/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
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
    isFoodIncluded: false,
    amount: 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        StartDate: new Date(event.StartDate),
        EndDate: new Date(event.EndDate),
        isFoodIncluded: event.isFoodIncluded,
        amount: event.amount
      })
    } else {
      setFormData({
        name: '',
        StartDate: null,
        EndDate: null,
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

    if (formData.StartDate && formData.EndDate) {
      if (formData.EndDate <= formData.StartDate) {
        newErrors.EndDate = 'End date must be after start date'
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
      onSave({
        ...formData,
        StartDate: formData.StartDate!.toISOString().split('T')[0],
        EndDate: formData.EndDate!.toISOString().split('T')[0]
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription>
            {event 
              ? 'Update the event details below.' 
              : 'Fill in the details to create a new event.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter event name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="StartDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !formData.StartDate && "text-muted-foreground"
                    } ${errors.StartDate ? 'border-red-500' : ''}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.StartDate ? format(formData.StartDate, "PPP") : "Pick a date"}
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
                    className={`w-full justify-start text-left font-normal ${
                      !formData.EndDate && "text-muted-foreground"
                    } ${errors.EndDate ? 'border-red-500' : ''}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.EndDate ? format(formData.EndDate, "PPP") : "Pick a date"}
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

          <div className="space-y-2">
            <Label htmlFor="amount">Event Amount (₹)</Label>
            <Input
              id="amount"
              type="text"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.amount ? 'border-red-500' : ''}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {event ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EventDialog
