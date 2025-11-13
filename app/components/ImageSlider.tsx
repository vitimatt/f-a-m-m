'use client'

import { useState, useRef, useEffect } from 'react'

interface ImageSliderProps {
  images: Array<{
    asset: {
      url: string
      metadata?: {
        dimensions?: {
          width: number
          height: number
        }
      }
    }
    alt?: string
  }>
}

export default function ImageSlider({ images }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showHint, setShowHint] = useState<'prev' | 'next' | null>(null)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
      }
    )

    if (sliderRef.current) {
      observer.observe(sliderRef.current)
    }

    return () => {
      if (sliderRef.current) {
        observer.unobserve(sliderRef.current)
      }
    }
  }, [])

  if (!images || images.length === 0) return null

  const currentImage = images[currentIndex]
  const aspectRatio = currentImage?.asset?.metadata?.dimensions 
    ? currentImage.asset.metadata.dimensions.width / currentImage.asset.metadata.dimensions.height 
    : undefined

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const isLeftHalf = x < rect.width / 2
    setShowHint(isLeftHalf ? 'prev' : 'next')
    setCursorPosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <div 
      ref={sliderRef}
      className={`image-slider ${isVisible ? 'image-revealed' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowHint(null)}
      style={aspectRatio ? { aspectRatio: aspectRatio.toString() } : undefined}
    >
      <div
        className="slider-left"
        onClick={goToPrev}
      />
      <div
        className="slider-right"
        onClick={goToNext}
      />
      {showHint && images.length > 1 && (
        <span 
          className="slider-hint"
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
          }}
        >
          {showHint === 'prev' ? 'Previous' : 'Next'}
        </span>
      )}
      <img 
        src={images[currentIndex]?.asset.url} 
        alt={images[currentIndex]?.alt || ''} 
        className="slider-image"
      />
      <div className="image-overlay" />
    </div>
  )
}

