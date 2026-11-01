import { XIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '#/components/utils/Button'

export type ErrorAlertProps = {
  children: ReactNode
  onDismiss: () => void
}

/** A dismissible inline error, e.g. for a failed save or task action. */
export function ErrorAlert({ children, onDismiss }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      <p>{children}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Dismiss error"
        onClick={onDismiss}
      >
        <XIcon />
      </Button>
    </div>
  )
}
