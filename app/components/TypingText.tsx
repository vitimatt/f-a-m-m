'use client'

import { useState, useEffect, useRef } from 'react'

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

  // Measure and group words into lines
  useEffect(() => {
    if (!containerRef.current) return

    const wordElements = wordsRef.current.filter(Boolean) as HTMLSpanElement[]
    if (wordElements.length === 0) return

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

    setLines(lineGroups)
  }, [words.length])

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

