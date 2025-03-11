import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "../../lib/utils"
import { Button } from "./button"

const DatePicker = ({ date, setDate, className }) => {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP") : <span>Pick a date</span>}
      </Button>
      {isCalendarOpen && (
        <div className="absolute top-full z-50 mt-2 rounded-md border bg-popover p-3 shadow-md">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={(day) => {
              setDate(day)
              setIsCalendarOpen(false)
            }}
            className="bg-background"
          />
        </div>
      )}
    </div>
  )
}

DatePicker.displayName = "DatePicker"

export { DatePicker }
