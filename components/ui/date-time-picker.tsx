"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  value?: string // datetime-local format: YYYY-MM-DDTHH:mm
  onChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  dateLabel?: string
  timeLabel?: string
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select date",
  className,
  dateLabel = "Date",
  timeLabel = "Time",
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [timeValue, setTimeValue] = React.useState<string>(() => {
    if (value) {
      const date = new Date(value)
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      return `${hours}:${minutes}`
    }
    return "00:00"
  })

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setSelectedDate(date)
        const hours = String(date.getHours()).padStart(2, "0")
        const minutes = String(date.getMinutes()).padStart(2, "0")
        setTimeValue(`${hours}:${minutes}`)
      }
    } else {
      setSelectedDate(undefined)
      setTimeValue("00:00")
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    
    setSelectedDate(date)
    setOpen(false)
    
    // Combine date with time
    if (timeValue) {
      const [hours, minutes] = timeValue.split(":")
      const combinedDate = new Date(date)
      combinedDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0)
      
      // Format as datetime-local: YYYY-MM-DDTHH:mm
      const year = combinedDate.getFullYear()
      const month = String(combinedDate.getMonth() + 1).padStart(2, "0")
      const day = String(combinedDate.getDate()).padStart(2, "0")
      const formattedTime = `${String(combinedDate.getHours()).padStart(2, "0")}:${String(combinedDate.getMinutes()).padStart(2, "0")}`
      const formattedValue = `${year}-${month}-${day}T${formattedTime}`
      
      onChange?.(formattedValue)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTimeValue(newTime)
    
    // If date is already selected, combine and emit immediately
    if (selectedDate && newTime) {
      const [hours, minutes] = newTime.split(":")
      const combinedDate = new Date(selectedDate)
      combinedDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0)
      
      // Format as datetime-local: YYYY-MM-DDTHH:mm
      const year = combinedDate.getFullYear()
      const month = String(combinedDate.getMonth() + 1).padStart(2, "0")
      const day = String(combinedDate.getDate()).padStart(2, "0")
      const formattedTime = `${String(combinedDate.getHours()).padStart(2, "0")}:${String(combinedDate.getMinutes()).padStart(2, "0")}`
      const formattedValue = `${year}-${month}-${day}T${formattedTime}`
      
      onChange?.(formattedValue)
    }
    // If no date selected yet, just store the time - it will be used when date is selected
  }

  return (
    <div className={cn("flex gap-4 w-full", className)}>
      <div className="flex flex-col gap-3 flex-1">
        <Label htmlFor="date-picker" className="px-1">
          {dateLabel}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              disabled={disabled}
              className="w-full justify-between font-normal"
            >
              {selectedDate ? selectedDate.toLocaleDateString() : placeholder}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
              fromYear={1900}
              toYear={2100}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          {timeLabel}
        </Label>
        <Input
          type="time"
          id="time-picker"
          value={timeValue}
          onChange={handleTimeChange}
          disabled={disabled}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  )
}

