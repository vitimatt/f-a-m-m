'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'

interface TypingTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
}

export default function TypingText({ text, className = '', delay = 2000, speed = 15 }: TypingTextProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [started, setStarted] = useState(false)
  const [lines, setLines] = useState<number[][]>([])
  const containerRef = useRef<HTMLParagraphElement>(null)
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([])
  
  const words = text.split(' ')

  const measureLines = (wordCount: number) => {
    if (wordCount === 0) {
      setLines([])
      return
    }

    const container = containerRef.current
    if (!container) return

    const wordElements = wordsRef.current.filter(Boolean) as HTMLSpanElement[]
    if (wordElements.length === 0 || wordElements.length !== wordCount) return

    const lineGroups: number[][] = []
    let currentLine: number[] = []
    let currentTop = wordElements[0]?.offsetTop

    wordElements.forEach((element, index) => {
      const elementTop = element.offsetTop

      if (elementTop !== currentTop) {
        if (currentLine.length > 0) {
          lineGroups.push([...currentLine])
        }
        currentLine = [index]
        currentTop = elementTop
      } else {
        currentLine.push(index)
      }
    })

    if (currentLine.length > 0) {
      lineGroups.push(currentLine)
    }

    if (lineGroups.length > 0) {
      setLines(lineGroups)
    }
  }

  // After layout, fonts, and width changes — otherwise `lines` stays [] and nothing un-hides.
  useLayoutEffect(() => {
    const wordCount = words.length
    setVisibleLines(0)
    setLines([])

    const container = containerRef.current
    if (!container) return

    let raf = 0

    const runMeasure = () => {
      measureLines(wordCount)
      if (wordCount > 0 && wordsRef.current.filter(Boolean).length !== wordCount) {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => {
          measureLines(wordCount)
          raf = requestAnimationFrame(() => measureLines(wordCount))
        })
      }
    }

    runMeasure()

    const ro = new ResizeObserver(() => runMeasure())
    ro.observe(container)

    const fonts = document.fonts
    const fontsDone = fonts?.ready?.then(() => runMeasure())

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      void fontsDone
    }
  }, [text, words.length])

  // If measurement never commits (edge ref timing), still run the line-reveal as a single block.
  useEffect(() => {
    const wc = text.split(' ').length
    if (wc === 0) return
    const t = window.setTimeout(() => {
      setLines((prev) =>
        prev.length > 0 ? prev : [Array.from({ length: wc }, (_, i) => i)]
      )
    }, 400)
    return () => clearTimeout(t)
  }, [text])

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started || visibleLines >= lines.length || lines.length === 0) return

    const timer = setTimeout(() => {
      setVisibleLines(prev => prev + 1)
    }, speed)

    return () => clearTimeout(timer)
  }, [visibleLines, lines.length, started, speed])

  const isWordVisible = (wordIndex: number) => {
    for (let i = 0; i < visibleLines; i++) {
      if (lines[i]?.includes(wordIndex)) {
        return true
      }
    }
    return false
  }

  return (
    <p ref={containerRef} className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          ref={(el) => { wordsRef.current[index] = el }}
          style={{
            visibility: isWordVisible(index) ? 'visible' : 'hidden'
          }}
        >
          {word}{index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  )
}
