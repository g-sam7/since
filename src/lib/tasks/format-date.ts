import { UTCDate } from '@date-fns/utc'
import { format } from 'date-fns'

// Dates are formatted in UTC so the server render and the client hydration
// agree regardless of the browser's zone; the due helpers already work in UTC.
// Known limitation: users west of UTC can see the next calendar day for a
// task due late in their evening. The create form stores "last done on" as
// midnight UTC, so a picked date always displays as the day picked.
export function formatTaskDate(date: Date): string {
  return format(new UTCDate(date), 'MMM d, yyyy')
}
