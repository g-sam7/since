import { useState } from 'react'
import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

export type FadingScrollListProps = {
  'aria-label': string
  /** The list items. */
  children: ReactNode
}

/**
 * A card list that scrolls within the space the window leaves it rather than
 * scrolling the page, its edges fading to show there is more. Shared by the
 * dashboard and the archive so the two lists behave alike.
 */
export function FadingScrollList({
  'aria-label': ariaLabel,
  children,
}: FadingScrollListProps) {
  // The top fade only appears once the list has scrolled, so the cards look
  // untouched in their resting state.
  const [isScrolled, setIsScrolled] = useState(false)

  return (
    <ul
      aria-label={ariaLabel}
      onScroll={(event) => setIsScrolled(event.currentTarget.scrollTop > 0)}
      // Bottom fade signals there is more to scroll; the extra bottom
      // padding keeps the last card clear of the fade at the end of the
      // list. The 1px inset plus matching negative margin stops the
      // scroll container clipping card borders without shifting them.
      // The height is what the window has left after the header, the
      // heading and the footer (20rem), so the list scrolls rather than
      // the page; on very short windows it keeps 16rem and the page
      // scrolls too, under the pinned footer.
      className={cn(
        '-mx-px flex max-h-[max(16rem,calc(100dvh-20rem))] w-[calc(100%+2px)] flex-col gap-4 overflow-y-auto px-px pt-px pb-16 mask-b-from-95% mask-b-to-100%',
        isScrolled && 'mask-t-from-95% mask-t-to-100%',
      )}
    >
      {children}
    </ul>
  )
}
