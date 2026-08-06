import { useEffect, useState } from 'react'

type SinceFixture = {
  amount: string
  unit: string
  activity: string
}

export const homePageSinceFixtures: SinceFixture[] = [
  { amount: '3', unit: 'months', activity: 'changed your air filter' },
  { amount: '6', unit: 'months', activity: 'got an oil change' },
  { amount: '1', unit: 'year', activity: 'saw your doctor' },
  { amount: '3', unit: 'months', activity: 'cleaned the oven' },
  { amount: '2', unit: 'years', activity: 'changed your passwords' },
]

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

  const current = homePageSinceFixtures[activeIndex]

  return (
    <h1
      className={`display-title mb-3 max-w-4xl text-3xl font-bold tracking-tight text-foreground transition-opacity duration-[350ms] ease-out motion-reduce:transition-none sm:text-5xl ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      It&apos;s been {current.amount} {current.unit} since you {current.activity}.
    </h1>
  )
}
