import { useEffect, useState } from 'react'

import type { DueStatus } from '#/lib/tasks/due'

type SinceFixture = {
  amount: string
  unit: string
  activity: string
  /** How overdue this would be in the app, which colours the time. */
  status: DueStatus
}

export const homePageSinceFixtures: SinceFixture[] = [
  {
    amount: '3',
    unit: 'months',
    activity: 'changed your air filter',
    status: 'overdue',
  },
  {
    amount: '6',
    unit: 'months',
    activity: 'got an oil change',
    status: 'dueSoon',
  },
  { amount: '1', unit: 'year', activity: 'saw your doctor', status: 'dueSoon' },
  {
    amount: '3',
    unit: 'months',
    activity: 'cleaned the oven',
    status: 'upcoming',
  },
  {
    amount: '2',
    unit: 'years',
    activity: 'changed your passwords',
    status: 'overdue',
  },
]

// The badge colours the dashboard uses for each due status.
const STATUS_TEXT: Record<DueStatus, string> = {
  overdue: 'text-state-danger',
  dueSoon: 'text-state-warning',
  upcoming: 'text-state-ok',
}

const ROTATION_DELAY = 5_000
const FADE_DURATION = 350

export function SinceTicker() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    let transitionTimer: ReturnType<typeof setTimeout> | undefined

    const rotationTimer = setInterval(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (prefersReducedMotion) {
        setActiveIndex((index) => (index + 1) % homePageSinceFixtures.length)
        return
      }

      setIsFadingOut(true)
      transitionTimer = setTimeout(() => {
        setActiveIndex((index) => (index + 1) % homePageSinceFixtures.length)
        setIsFadingOut(false)
      }, FADE_DURATION)
    }, ROTATION_DELAY)

    return () => {
      clearInterval(rotationTimer)
      if (transitionTimer) clearTimeout(transitionTimer)
    }
  }, [])

  return (
    // Not `isolate`: the clock spills past this wrapper, and must sink behind
    // the rest of the page (the landing page's isolated `main`), not just
    // behind the heading, or it paints over the buttons below.
    <div className="relative mb-3">
      {/* Keyed so each sentence restarts the sweep. */}
      <ClockBackdrop key={activeIndex} />
      {/* Every sentence shares one grid cell, the inactive ones hidden but
          still laid out, so the heading keeps the height of the longest at
          any width and the page below does not jump as they rotate. */}
      <h1
        className={`display-title grid max-w-4xl text-3xl font-semibold text-foreground transition-opacity duration-[350ms] ease-out motion-reduce:transition-none sm:text-5xl ${
          isFadingOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {homePageSinceFixtures.map((fixture, index) => (
          <span
            key={index}
            className={`col-start-1 row-start-1 self-center ${
              index === activeIndex ? '' : 'invisible'
            }`}
          >
            It’s been{' '}
            <span className={STATUS_TEXT[fixture.status]}>
              {fixture.amount} {fixture.unit}
            </span>{' '}
            since you <span className="italic">{fixture.activity}</span>.
          </span>
        ))}
      </h1>
    </div>
  )
}

/**
 * A faint, oversized take on the logo's clock behind the headline. Its wedge
 * fills over one sentence's time on screen; with reduced motion it stays
 * still at the logo's third.
 */
function ClockBackdrop() {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[min(14rem,70vw)] -translate-x-1/2 sm:size-[var(--hero-clock,20rem)] -translate-y-1/2 text-primary opacity-[0.08] dark:opacity-[0.14]"
    >
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
      />
      {/* A stroke as wide as its own diameter draws a pie wedge. */}
      <circle
        cx="50"
        cy="50"
        r="17"
        fill="none"
        stroke="currentColor"
        strokeWidth="34"
        pathLength={100}
        strokeDasharray="100 100"
        strokeDashoffset={67}
        transform="rotate(-90 50 50)"
        className="animate-clock-sweep motion-reduce:animate-none"
        style={{ animationDuration: `${ROTATION_DELAY}ms` }}
      />
    </svg>
  )
}
