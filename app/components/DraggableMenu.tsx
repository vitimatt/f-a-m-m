'use client'

import { useState, useRef, useEffect } from 'react'
import Model3DViewer from './Model3DViewer'
import { useGLTF } from '@react-three/drei'

interface Product {
  _id: string
  title: string
  svgOutline?: {
    asset: {
      url: string
    }
  }
  model3dRed?: {
    asset: {
      url: string
    }
  }
  model3dGrey?: {
    asset: {
      url: string
    }
  }
  model3dGreen?: {
    asset: {
      url: string
    }
  }
  model3dRedUsdz?: {
    asset: {
      url: string
    }
  }
  model3dGreyUsdz?: {
    asset: {
      url: string
    }
  }
  model3dGreenUsdz?: {
    asset: {
      url: string
    }
  }
  lightMultiplier?: number
}

type ColorVariant = 'red' | 'grey' | 'green'

interface DraggableMenuProps {
  initialProducts?: Product[]
}

export default function DraggableMenu({ initialProducts = [] }: DraggableMenuProps) {
  const [position, setPosition] = useState({ x: 14, y: typeof window !== 'undefined' ? window.innerHeight + 500 : 2000 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [activeModel, setActiveModel] = useState<string | null>(null)
  const [activeModelUsdz, setActiveModelUsdz] = useState<string | null>(null)
  const [modelVisible, setModelVisible] = useState(false)
  // Default to perspective, can be changed to orthographic
  const [isAxonometric, setIsAxonometric] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSlidingIn, setIsSlidingIn] = useState(false)
  const [isInitialSlideIn, setIsInitialSlideIn] = useState(false)
  const [selectedColor, setSelectedColor] = useState<ColorVariant>('red')
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const hasDraggedRef = useRef(false)
  const initialMousePos = useRef({ x: 0, y: 0 })

  // Preload 3D models on mount
  useEffect(() => {
    // Preload all 3D models for all color variants
    initialProducts.forEach(product => {
      if (product.model3dRed?.asset.url) {
        useGLTF.preload(product.model3dRed.asset.url)
      }
      if (product.model3dGrey?.asset.url) {
        useGLTF.preload(product.model3dGrey.asset.url)
      }
      if (product.model3dGreen?.asset.url) {
        useGLTF.preload(product.model3dGreen.asset.url)
      }
    })
  }, [initialProducts])

  // Initialize position at bottom left, hidden below viewport (or above on mobile)
  useEffect(() => {
    if (!isInitialized && menuRef.current) {
      const windowHeight = window.innerHeight
      const menuHeight = menuRef.current.offsetHeight || 0
      const isMobile = window.innerWidth <= 767
      if (isMobile) {
        // On mobile, start above viewport, left aligned to margin
        setPosition({ x: 7, y: -menuHeight - 20 })
      } else {
        // On desktop, start below viewport
        setPosition({ x: 14, y: windowHeight + 20 })
      }
      setIsInitialized(true)
    }
  }, [isInitialized, products])

  // Handle resize to keep menu hidden if not scrolled yet
  useEffect(() => {
    const handleResize = () => {
      if (!hasScrolled && menuRef.current) {
        const windowHeight = window.innerHeight
        const menuHeight = menuRef.current.offsetHeight || 0
        const isMobileNow = window.innerWidth <= 767
        if (isMobileNow) {
          setPosition({ x: 7, y: -menuHeight - 20 })
        } else {
          setPosition({ x: 14, y: windowHeight + 20 })
        }
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [hasScrolled])

  // Handle scroll to slide in/out menu
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const menuHeight = menuRef.current?.offsetHeight || 0
      const isMobileNow = window.innerWidth <= 767
      
      if (!hasScrolled && window.scrollY > 0) {
        // Slide in on first scroll down
        setHasScrolled(true)
        setIsInitialSlideIn(true)
        
        if (isMobileNow) {
          // On mobile, slide to top, left aligned to margin
          setPosition({ x: 7, y: 7 })
        } else {
          // On desktop, slide to bottom
          setPosition({ x: 14, y: windowHeight - menuHeight - 14 })
        }
        
        // Remove initial-slide-in class after animation completes
        setTimeout(() => {
          setIsInitialSlideIn(false)
        }, 800)
      } else if (hasScrolled && window.scrollY === 0 && isMobileNow) {
        // Slide out when scrolling back to top (mobile only)
        setIsInitialSlideIn(true)
        
        // On mobile, slide back above viewport
        setPosition({ x: 7, y: -menuHeight - 20 })
        
        // Remove initial-slide-in class and reset hasScrolled after animation completes
        setTimeout(() => {
          setIsInitialSlideIn(false)
          setHasScrolled(false)
        }, 800)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasScrolled])

  // Helper function to get the model URL based on selected color
  const getModelUrl = (product: Product, color: ColorVariant): string | null => {
    switch (color) {
      case 'red':
        return product.model3dRed?.asset.url || null
      case 'grey':
        return product.model3dGrey?.asset.url || null
      case 'green':
        return product.model3dGreen?.asset.url || null
      default:
        return null
    }
  }

  // Helper function to get the USDZ model URL based on selected color
  const getModelUrlUsdz = (product: Product, color: ColorVariant): string | null => {
    switch (color) {
      case 'red':
        return product.model3dRedUsdz?.asset.url || null
      case 'grey':
        return product.model3dGreyUsdz?.asset.url || null
      case 'green':
        return product.model3dGreenUsdz?.asset.url || null
      default:
        return null
    }
  }

  // Helper function to set active model and USDZ model
  const setActiveModels = (product: Product, color: ColorVariant) => {
    const modelUrl = getModelUrl(product, color)
    const modelUrlUsdz = getModelUrlUsdz(product, color)
    if (modelUrl) {
      setActiveModel(modelUrl)
      setActiveModelUsdz(modelUrlUsdz)
    }
  }

  const snapToCorner = (x: number, y: number) => {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const menuWidth = menuRef.current?.offsetWidth || 0
    const menuHeight = menuRef.current?.offsetHeight || 0
    const isMobile = windowWidth <= 767

    const centerX = x + menuWidth / 2
    const centerY = y + menuHeight / 2

    const isLeft = centerX < windowWidth / 2
    const isTop = centerY < windowHeight / 2

    if (isMobile) {
      // On mobile, always snap to left margin
      const newY = isTop ? 7 : windowHeight - menuHeight - 7
      return { x: 7, y: newY }
    } else {
      const newX = isLeft ? 14 : windowWidth - menuWidth - 14
      const newY = isTop ? 14 : windowHeight - menuHeight - 14
      return { x: newX, y: newY }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!menuRef.current) return
    
    e.preventDefault()
    hasDraggedRef.current = false
    initialMousePos.current = { x: e.clientX, y: e.clientY }
    const rect = menuRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const deltaX = Math.abs(e.clientX - initialMousePos.current.x)
    const deltaY = Math.abs(e.clientY - initialMousePos.current.y)
    
    // If moved more than 5 pixels, consider it a drag
    if (deltaX > 5 || deltaY > 5) {
      hasDraggedRef.current = true
    }

    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y

    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    setIsSlidingIn(true)
    const snappedPosition = snapToCorner(position.x, position.y)
    setPosition(snappedPosition)
    
    // Remove sliding-in class after snap animation completes
    setTimeout(() => {
      setIsSlidingIn(false)
    }, 300)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, position])

  return (
    <>
      <div
        ref={menuRef}
        className={`draggable-menu ${isDragging ? 'dragging' : ''} ${isSlidingIn ? 'sliding-in' : ''} ${isInitialSlideIn ? 'initial-slide-in' : ''} ${!isInitialized ? 'no-transition' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="menu-content">
          <img 
            src="/logo/logo2.svg" 
            alt="FAMM Design Studio Menu" 
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            loading="lazy"
          />
          <div className="menu-buttons">
            <button 
              className="menu-button"
              onClick={(e) => {
                e.stopPropagation()
                
                if (hasDraggedRef.current) {
                  hasDraggedRef.current = false
                  return
                }
                
                if (activeModel) {
                  setModelVisible(!modelVisible)
                } else {
                  // If no model is active, load the first product
                  if (products.length > 0) {
                    const firstProduct = products[0]
                    
                    // Try to find any available model variant
                    let modelUrl = getModelUrl(firstProduct, selectedColor)
                    
                    if (!modelUrl) {
                      // Try red, grey, green in order
                      const colors: ColorVariant[] = ['red', 'grey', 'green']
                      for (const color of colors) {
                        modelUrl = getModelUrl(firstProduct, color)
                        if (modelUrl) {
                          setSelectedColor(color)
                          break
                        }
                      }
                    }
                    
                    if (modelUrl) {
                      setActiveProductId(firstProduct._id)
                      setActiveModels(firstProduct, selectedColor)
                      setModelVisible(true)
                    }
                  }
                }
              }}
            >
              3D View: {modelVisible ? 'On' : 'Off'}
            </button>
            <button 
              className="menu-button"
              onClick={(e) => {
                e.stopPropagation()
                if (hasDraggedRef.current) {
                  hasDraggedRef.current = false
                  return
                }
                setIsAxonometric(!isAxonometric)
              }}
            >
              Viz: {isAxonometric ? 'Ortho' : 'Perspective'}
            </button>
          </div>
          <div className="menu-buttons">
            <button 
              className="menu-button"
              style={{
                backgroundColor: modelVisible && selectedColor === 'red' ? '#772524' : 'white',
                color: modelVisible && selectedColor === 'red' ? 'transparent' : '#000',
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (hasDraggedRef.current) {
                  hasDraggedRef.current = false
                  return
                }
                setSelectedColor('red')
                // If a product is active, switch to its red variant and show the view
                if (activeProductId) {
                  const product = products.find(p => p._id === activeProductId)
                  if (product) {
                    setActiveModels(product, 'red')
                    setModelVisible(true)
                  }
                }
              }}
            >
              Red
            </button>
            <button 
              className="menu-button"
              style={{
                backgroundColor: modelVisible && selectedColor === 'grey' ? '#ACB2B4' : 'white',
                color: modelVisible && selectedColor === 'grey' ? 'transparent' : '#000',
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (hasDraggedRef.current) {
                  hasDraggedRef.current = false
                  return
                }
                setSelectedColor('grey')
                // If a product is active, switch to its grey variant and show the view
                if (activeProductId) {
                  const product = products.find(p => p._id === activeProductId)
                  if (product) {
                    setActiveModels(product, 'grey')
                    setModelVisible(true)
                  }
                }
              }}
            >
              Steel
            </button>
            <button 
              className="menu-button"
              style={{
                backgroundColor: modelVisible && selectedColor === 'green' ? '#243225' : 'white',
                color: modelVisible && selectedColor === 'green' ? 'transparent' : '#000',
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (hasDraggedRef.current) {
                  hasDraggedRef.current = false
                  return
                }
                setSelectedColor('green')
                // If a product is active, switch to its green variant and show the view
                if (activeProductId) {
                  const product = products.find(p => p._id === activeProductId)
                  if (product) {
                    setActiveModels(product, 'green')
                    setModelVisible(true)
                  }
                }
              }}
            >
              Green
            </button>
          </div>
          <div className="menu-buttons">
            <a 
              href="mailto:info@f-a-m-m.com"
              className="menu-button menu-button-full"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              Inquire for a project
            </a>
          </div>
        </div>
        {products.length > 0 && (
          <div className="product-outlines-inline">
            {products.map((product) => (
              <div 
                key={product._id} 
                className="product-outline-box-inline"
                onClick={(e) => {
                  e.stopPropagation()
                  if (hasDraggedRef.current) {
                    hasDraggedRef.current = false
                    return
                  }
                  const modelUrl = getModelUrl(product, selectedColor)
                  if (modelUrl) {
                    if (activeProductId === product._id) {
                      // Same product, just toggle visibility
                      setModelVisible(!modelVisible)
                    } else {
                      // Different product, load it and show it
                      setActiveProductId(product._id)
                      setActiveModels(product, selectedColor)
                      setModelVisible(true)
                    }
                  }
                }}
                style={{ cursor: getModelUrl(product, selectedColor) ? 'pointer' : 'default' }}
              >
                <img
                  src={product.svgOutline?.asset.url}
                  alt={`${product.title} - Product design by FAMM Design Studio`}
                  className="product-outline-svg-inline"
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {activeModel && (
        <Model3DViewer 
          modelUrl={activeModel}
          modelUrlUsdz={activeModelUsdz || undefined}
          onClose={() => setModelVisible(false)}
          isAxonometric={isAxonometric}
          visible={modelVisible}
          lightMultiplier={activeProductId ? products.find(p => p._id === activeProductId)?.lightMultiplier ?? 1.0 : 1.0}
        />
      )}
    </>
  )
}

