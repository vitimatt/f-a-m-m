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
}

type ColorVariant = 'red' | 'grey' | 'green'

interface DraggableMenuProps {
  initialProducts?: Product[]
}

export default function DraggableMenu({ initialProducts = [] }: DraggableMenuProps) {
  const [position, setPosition] = useState({ x: 14, y: typeof window !== 'undefined' ? window.innerHeight + 500 : 2000 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showInfo, setShowInfo] = useState(false)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [activeModel, setActiveModel] = useState<string | null>(null)
  const [modelVisible, setModelVisible] = useState(false)
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
  const [debugInfo, setDebugInfo] = useState('')
  const [showDebug, setShowDebug] = useState(false)

  // Preload 3D models on mount
  useEffect(() => {
    console.log('Products received:', initialProducts.length)
    setDebugInfo(`Products loaded: ${initialProducts.length}\nTitles: ${initialProducts.map(p => p.title).join(', ')}`)
    
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

  // Initialize position at bottom left, hidden below viewport
  useEffect(() => {
    if (!isInitialized && menuRef.current) {
      const windowHeight = window.innerHeight
      const menuHeight = menuRef.current.offsetHeight || 0
      setPosition({ x: 14, y: windowHeight + 20 })
      setIsInitialized(true)
    }
  }, [isInitialized, products])

  // Handle resize to keep menu hidden if not scrolled yet
  useEffect(() => {
    const handleResize = () => {
      if (!hasScrolled && menuRef.current) {
        const windowHeight = window.innerHeight
        setPosition({ x: 14, y: windowHeight + 20 })
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [hasScrolled])

  // Handle scroll to slide in menu
  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 0) {
        setHasScrolled(true)
        setIsInitialSlideIn(true)
        const windowHeight = window.innerHeight
        const menuHeight = menuRef.current?.offsetHeight || 0
        setPosition({ x: 14, y: windowHeight - menuHeight - 14 })
        
        // Remove initial-slide-in class after animation completes
        setTimeout(() => {
          setIsInitialSlideIn(false)
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

  const snapToCorner = (x: number, y: number) => {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const menuWidth = menuRef.current?.offsetWidth || 0
    const menuHeight = menuRef.current?.offsetHeight || 0

    const centerX = x + menuWidth / 2
    const centerY = y + menuHeight / 2

    const isLeft = centerX < windowWidth / 2
    const isTop = centerY < windowHeight / 2

    const newX = isLeft ? 14 : windowWidth - menuWidth - 14
    const newY = isTop ? 14 : windowHeight - menuHeight - 14

    return { x: newX, y: newY }
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
            alt="Menu Logo" 
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
          />
          <div className="menu-buttons">
            <button 
              className="menu-button"
              onClick={(e) => {
                e.stopPropagation()
                
                // Enable debug on mobile
                if (window.innerWidth <= 767) {
                  setShowDebug(true)
                }
                
                let debug = `Button clicked\n`
                
                if (hasDraggedRef.current) {
                  hasDraggedRef.current = false
                  debug += 'BLOCKED: Was dragging\n'
                  setDebugInfo(debug)
                  return
                }
                
                debug += `Products: ${products.length}\n`
                debug += `ActiveModel: ${activeModel ? 'Yes' : 'No'}\n`
                debug += `ModelVisible: ${modelVisible}\n`
                debug += `SelectedColor: ${selectedColor}\n`
                
                if (activeModel) {
                  setModelVisible(!modelVisible)
                  debug += `Action: Toggle to ${!modelVisible ? 'ON' : 'OFF'}\n`
                } else {
                  // If no model is active, load the first product
                  if (products.length > 0) {
                    const firstProduct = products[0]
                    debug += `First product: ${firstProduct.title}\n`
                    
                    // Try to find any available model variant
                    let modelUrl = getModelUrl(firstProduct, selectedColor)
                    let colorToUse = selectedColor
                    
                    if (!modelUrl) {
                      debug += `No ${selectedColor} model, trying others...\n`
                      // Try red, grey, green in order
                      const colors: ColorVariant[] = ['red', 'grey', 'green']
                      for (const color of colors) {
                        modelUrl = getModelUrl(firstProduct, color)
                        if (modelUrl) {
                          colorToUse = color
                          setSelectedColor(color)
                          debug += `Found ${color} model!\n`
                          break
                        }
                      }
                    }
                    
                    if (modelUrl) {
                      debug += `Loading model: ${modelUrl.substring(0, 50)}...\n`
                      setActiveProductId(firstProduct._id)
                      setActiveModel(modelUrl)
                      setModelVisible(true)
                      debug += 'SUCCESS: Model set to visible\n'
                    } else {
                      debug += 'ERROR: No 3D model found!\n'
                    }
                  } else {
                    debug += 'ERROR: No products loaded\n'
                  }
                }
                
                setDebugInfo(debug)
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
                backgroundColor: modelVisible && selectedColor === 'red' ? '#FF0000' : 'white',
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
                    const modelUrl = getModelUrl(product, 'red')
                    if (modelUrl) {
                      setActiveModel(modelUrl)
                      setModelVisible(true)
                    }
                  }
                }
              }}
            >
              Red
            </button>
            <button 
              className="menu-button"
              style={{
                backgroundColor: modelVisible && selectedColor === 'grey' ? '#808080' : 'white',
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
                    const modelUrl = getModelUrl(product, 'grey')
                    if (modelUrl) {
                      setActiveModel(modelUrl)
                      setModelVisible(true)
                    }
                  }
                }
              }}
            >
              Grey
            </button>
            <button 
              className="menu-button"
              style={{
                backgroundColor: modelVisible && selectedColor === 'green' ? '#00FF00' : 'white',
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
                    const modelUrl = getModelUrl(product, 'green')
                    if (modelUrl) {
                      setActiveModel(modelUrl)
                      setModelVisible(true)
                    }
                  }
                }
              }}
            >
              Green
            </button>
          </div>
          <div className="menu-buttons">
            <button 
              className={`menu-button menu-button-full ${showInfo ? 'info-expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                if (hasDraggedRef.current) {
                  hasDraggedRef.current = false
                  return
                }
                setShowInfo(!showInfo)
              }}
            >
              {showInfo ? (
                "Since 1839, the Basler Kunstverein hasn't just shown art; it has continually redefined it. With an unwavering commitment to emerging artists, the Basler Kunstverein initiated the construction of Kunsthalle Basel, which opened its doors to the public in 1872. To this day, Kunsthalle Basel continues to bring groundbreaking artistic positions to the forefront, long before they make it big elsewhere."
              ) : (
                "Information"
              )}
            </button>
          </div>
          <div className="menu-buttons">
            <button 
              className="menu-button menu-button-full"
              onClick={(e) => {
                e.stopPropagation()
                if (hasDraggedRef.current) {
                  hasDraggedRef.current = false
                  return
                }
                setShowDebug(true)
                const info = `
DEBUG INFO
Products loaded: ${products.length}
Titles: ${products.map(p => p.title).join(', ')}
ActiveModel: ${activeModel ? 'Yes' : 'No'}
ModelVisible: ${modelVisible}
SelectedColor: ${selectedColor}
ActiveProductId: ${activeProductId || 'None'}
                `.trim()
                setDebugInfo(info)
              }}
            >
              Debug Info (Mobile)
            </button>
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
                      setActiveModel(modelUrl)
                      setModelVisible(true)
                    }
                  }
                }}
                style={{ cursor: getModelUrl(product, selectedColor) ? 'pointer' : 'default' }}
              >
                <img
                  src={product.svgOutline?.asset.url}
                  alt={product.title}
                  className="product-outline-svg-inline"
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {activeModel && (
        <Model3DViewer 
          modelUrl={activeModel} 
          onClose={() => setModelVisible(false)}
          isAxonometric={isAxonometric}
          visible={modelVisible}
        />
      )}
      {showDebug && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid black',
            padding: '20px',
            zIndex: 99999,
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflow: 'auto'
          }}
          onClick={(e) => {
            e.stopPropagation()
            setShowDebug(false)
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            DEBUG INFO (tap to close)
          </div>
          {debugInfo}
        </div>
      )}
    </>
  )
}

