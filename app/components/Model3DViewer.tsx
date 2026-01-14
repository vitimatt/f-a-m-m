'use client'

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center } from '@react-three/drei'
import React, { Suspense, useRef, useEffect, useState, ErrorInfo } from 'react'
import * as THREE from 'three'

interface Model3DViewerProps {
  modelUrl: string
  modelUrlUsdz?: string
  onClose: () => void
  isAxonometric: boolean
  visible: boolean
  lightMultiplier?: number
}

// Detect iOS devices
function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

// USDZ Viewer Component for iOS
function USDZViewer({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    // Load model-viewer script if not already loaded
    if (typeof window !== 'undefined' && !document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js'
      document.head.appendChild(script)
    }
  }, [])

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      backgroundColor: 'transparent'
    }}>
      {/* @ts-ignore - model-viewer is a web component */}
      <model-viewer
        src={url}
        alt="3D Model"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        style={{ width: '100%', height: '100%' }}
        interaction-policy="allow-when-focused"
      />
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          color: 'black',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        Close
      </button>
    </div>
  )
}

// Transform Sanity file URL to ensure it's accessible
function transformSanityUrl(url: string, isMobile: boolean = false): string {
  if (!url) return url
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // For mobile, ensure we're using HTTPS and add cache-busting if needed
    if (isMobile && url.startsWith('http://')) {
      return url.replace('http://', 'https://')
    }
    return url
  }
  
  // If it's a relative URL, make it absolute
  if (url.startsWith('/')) {
    return url
  }
  
  return url
}

// Check if URL is accessible (for mobile pre-check)
async function checkUrlAccessible(url: string, timeout: number = 5000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'cors',
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn('URL accessibility check failed:', error)
    return false
  }
}

// Check WebGL support - more lenient check
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return true // Assume support during SSR
  }
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2') || canvas.getContext('experimental-webgl')
    if (gl && 'createShader' in gl) {
      // Additional check: try to create a shader to ensure WebGL actually works
      const webglContext = gl as WebGLRenderingContext
      const shader = webglContext.createShader(webglContext.VERTEX_SHADER)
      if (shader) {
        webglContext.deleteShader(shader)
        return true
      }
    }
    // If check fails, assume WebGL might still work (let Canvas try)
    return true
  } catch (e) {
    // If check fails, assume WebGL might still work (let Canvas try)
    return true
  }
}

function Model({ url, isAxonometric, isMobile, onError, retryKey }: { url: string; isAxonometric: boolean; isMobile: boolean; onError?: (error: Error) => void; retryKey?: number }) {
  // Transform URL to ensure it's accessible
  const transformedUrl = transformSanityUrl(url, isMobile)
  
  // For mobile, pre-check URL accessibility on first load
  useEffect(() => {
    if (isMobile && retryKey === 0) {
      checkUrlAccessible(transformedUrl, 10000).then((accessible) => {
        if (!accessible && onError) {
          console.warn('Model file accessibility check failed, but attempting to load anyway')
        }
      }).catch(() => {
        // Continue anyway - let useGLTF try
      })
    }
  }, [isMobile, transformedUrl, retryKey, onError])
  
  let gltf
  try {
    // useGLTF will handle loading with Suspense
    gltf = useGLTF(transformedUrl)
  } catch (error) {
    console.error('GLTF loading error:', error)
    if (onError) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      onError(new Error(`Failed to load 3D model: ${errorMessage}`))
    }
    return null
  }
  
  const scale = isAxonometric ? 0.01 : 1
  const groupRef = useRef<THREE.Group>(null)
  const gyroData = useRef({ alpha: 0, beta: 0, gamma: 0 })

  useFrame(() => {
    if (groupRef.current && isMobile) {
      // Convert gyroscope data to rotation
      // gamma: left-right tilt (-90 to 90)
      // beta: front-back tilt (-180 to 180)
      const rotationY = (gyroData.current.gamma || 0) * (Math.PI / 180) * 0.5
      const rotationX = (gyroData.current.beta || 0) * (Math.PI / 180) * 0.3
      
      groupRef.current.rotation.y = rotationY
      groupRef.current.rotation.x = rotationX - Math.PI / 2
    }
  })

  useEffect(() => {
    if (!isMobile) return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      try {
        if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
          gyroData.current = {
            alpha: event.alpha,
            beta: event.beta,
            gamma: event.gamma
          }
        }
      } catch (error) {
        // Silently handle orientation errors
        console.warn('Device orientation error:', error)
      }
    }

    // Request permission for iOS 13+
    const requestPermission = async () => {
      try {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          try {
            const permission = await (DeviceOrientationEvent as any).requestPermission()
            if (permission === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, { passive: true })
            }
          } catch (error) {
            // Permission denied or error - continue without gyro
            console.warn('Device orientation permission denied or error:', error)
          }
        } else {
          // Non-iOS or older iOS/Android
          window.addEventListener('deviceorientation', handleOrientation, { passive: true })
        }
      } catch (error) {
        // Silently fail if device orientation is not available
        console.warn('Device orientation not available:', error)
      }
    }

    requestPermission()

    return () => {
      try {
        window.removeEventListener('deviceorientation', handleOrientation)
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }, [isMobile])

  try {
    return (
      <Center key={`${isAxonometric}`}>
        <group ref={groupRef}>
          <primitive object={gltf.scene.clone()} scale={scale} rotation={[0, Math.PI, 0]} />
        </group>
      </Center>
    )
  } catch (e) {
    console.error('Error rendering model:', e)
    return null
  }
}

function CameraController({ isAxonometric }: { isAxonometric: boolean }) {
  const { camera, gl } = useThree()
  const baseZoom = useRef(isAxonometric ? 100 : 1)
  const initialized = useRef(false)

  useEffect(() => {
    try {
      baseZoom.current = isAxonometric ? 100 : 1
      camera.zoom = baseZoom.current
      camera.updateProjectionMatrix()
      initialized.current = true
    } catch (error) {
      console.warn('Camera update error:', error)
    }
  }, [isAxonometric, camera])

  // Ensure camera is initialized on mount
  useEffect(() => {
    if (!initialized.current) {
      try {
        baseZoom.current = isAxonometric ? 100 : 1
        camera.zoom = baseZoom.current
        camera.updateProjectionMatrix()
        initialized.current = true
      } catch (error) {
        console.warn('Camera initialization error:', error)
      }
    }
  }, [camera, isAxonometric])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      try {
        if (e.shiftKey) {
          e.preventDefault()
          const zoomSpeed = 0.001
          const delta = e.deltaY * zoomSpeed
          camera.zoom = Math.max(0.1, camera.zoom - delta)
          camera.updateProjectionMatrix()
        }
      } catch (error) {
        console.warn('Wheel handler error:', error)
      }
    }

    try {
      const canvas = gl.domElement
      canvas.addEventListener('wheel', handleWheel, { passive: false })

      return () => {
        try {
          canvas.removeEventListener('wheel', handleWheel)
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    } catch (error) {
      console.warn('Canvas event listener error:', error)
      return () => {}
    }
  }, [camera, gl])

  return null
}

// Error Boundary Component
class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode; onError?: (error: Error) => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('3D Viewer Error:', error, errorInfo)
    if (this.props.onError) {
      this.props.onError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export default function Model3DViewer({ modelUrl, modelUrlUsdz, onClose, isAxonometric, visible, lightMultiplier = 1.0 }: Model3DViewerProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  // Component stays mounted, just visibility changes

  useEffect(() => {
    setIsIOSDevice(isIOS())
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Keep component mounted, just hide/show it

  return (
    <ModelErrorBoundary
      onError={(error) => {
        console.error('Error boundary caught error:', error)
        // Just log, don't block rendering
      }}
      fallback={null}
    >
      {/* Use USDZ viewer on iOS if USDZ URL is available */}
      {isIOSDevice && modelUrlUsdz ? (
        <div className="model-viewer-overlay" style={{ display: visible ? 'flex' : 'none', pointerEvents: visible ? 'auto' : 'none' }}>
          <div className="model-viewer-container">
            <USDZViewer url={modelUrlUsdz} onClose={onClose} />
          </div>
        </div>
      ) : (
        <div className="model-viewer-overlay" style={{ display: visible ? 'flex' : 'none', pointerEvents: visible ? 'auto' : 'none' }}>
          <div className="model-viewer-container">
            <Canvas 
              key={`canvas-${modelUrl}`}
            camera={isAxonometric ? { position: [0, 0, 1] } : { position: [0, 0, 1], fov: 50 }} 
            style={{ background: 'transparent', pointerEvents: isMobile ? 'none' : 'auto' }}
            orthographic={isAxonometric}
            gl={{ 
              antialias: !isMobile, // Disable antialiasing on mobile for performance
              powerPreference: isMobile ? 'default' : 'high-performance', // Use default on mobile to avoid context loss
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false, // Don't fail on low-end devices
              alpha: true,
              stencil: false,
              depth: true,
              logarithmicDepthBuffer: false,
            }}
            onCreated={({ gl }) => {
              // WebGL context was successfully created
              // Handle WebGL context loss (non-blocking)
              gl.domElement.addEventListener('webglcontextlost', (event) => {
                event.preventDefault()
                console.warn('WebGL context lost')
              })
              
              gl.domElement.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context restored')
              })
            }}
            onError={(error) => {
              // Just log errors, don't block rendering
              console.error('Canvas initialization error:', error)
            }}
            dpr={isMobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio} // Limit pixel ratio on mobile
          >
            <ambientLight intensity={1.5 * lightMultiplier} />
            <directionalLight position={[10, 10, 5]} intensity={2 * lightMultiplier} />
            <directionalLight position={[-10, -10, -5]} intensity={1.5 * lightMultiplier} />
            <directionalLight position={[0, -10, 0]} intensity={1 * lightMultiplier} />
            <Suspense 
              fallback={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: 'white',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div>Loading 3D model{isMobile ? ' (mobile)' : ''}...</div>
                  {isMobile && (
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      This may take a moment
                    </div>
                  )}
                </div>
              }
            >
              <Model 
                key={`model-${retryKey}`}
                url={modelUrl} 
                isAxonometric={isAxonometric} 
                isMobile={isMobile}
                retryKey={retryKey}
                onError={(error) => {
                  console.error('Model loading error:', error)
                  // Just log errors, don't block rendering
                }}
              />
              <CameraController isAxonometric={isAxonometric} />
              {!isMobile && <OrbitControls enableZoom={false} enablePan={false} />}
            </Suspense>
          </Canvas>
          </div>
        </div>
      )}
    </ModelErrorBoundary>
  )
}

