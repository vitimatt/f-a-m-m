'use client'

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center } from '@react-three/drei'
import { Suspense, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

interface Model3DViewerProps {
  modelUrl: string
  onClose: () => void
  isAxonometric: boolean
  visible: boolean
}

function Model({ url, isAxonometric, isMobile }: { url: string; isAxonometric: boolean; isMobile: boolean }) {
  const { scene } = useGLTF(url)
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
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        gyroData.current = {
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma
        }
        console.log('Gyro data:', gyroData.current)
      }
    }

    // Request permission for iOS 13+
    const requestPermission = async () => {
      console.log('Requesting gyroscope permission...')
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission()
          console.log('Permission result:', permission)
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
          }
        } catch (error) {
          console.error('Error requesting device orientation permission:', error)
        }
      } else {
        // Non-iOS or older iOS/Android
        console.log('Adding deviceorientation listener (no permission needed)')
        window.addEventListener('deviceorientation', handleOrientation)
      }
    }

    requestPermission()

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [isMobile])

  return (
    <Center key={`${isAxonometric}`}>
      <group ref={groupRef}>
        <primitive object={scene.clone()} scale={scale} rotation={[0, Math.PI, 0]} />
      </group>
    </Center>
  )
}

function CameraController({ isAxonometric }: { isAxonometric: boolean }) {
  const { camera, gl } = useThree()
  const baseZoom = useRef(isAxonometric ? 100 : 1)

  useEffect(() => {
    baseZoom.current = isAxonometric ? 100 : 1
    camera.zoom = baseZoom.current
    camera.updateProjectionMatrix()
  }, [isAxonometric, camera])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) {
        e.preventDefault()
        const zoomSpeed = 0.001
        const delta = e.deltaY * zoomSpeed
        camera.zoom = Math.max(0.1, camera.zoom - delta)
        camera.updateProjectionMatrix()
      }
    }

    const canvas = gl.domElement
    canvas.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [camera, gl])

  return null
}

export default function Model3DViewer({ modelUrl, onClose, isAxonometric, visible }: Model3DViewerProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (visible && isMobile) {
      console.log('3D View opened on mobile, gyroscope will be initialized')
    }
  }, [visible, isMobile])

  return (
    <div className="model-viewer-overlay" style={{ display: visible ? 'flex' : 'none' }}>
      <div className="model-viewer-container">
        <Canvas 
          camera={{ position: [0, 0, 1], fov: 50 }} 
          style={{ background: 'transparent', pointerEvents: isMobile ? 'none' : 'auto' }}
          orthographic={isAxonometric}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <directionalLight position={[-10, -10, -5]} intensity={1.5} />
          <directionalLight position={[0, -10, 0]} intensity={1} />
          <Suspense fallback={null}>
            <Model url={modelUrl} isAxonometric={isAxonometric} isMobile={isMobile} />
            <CameraController isAxonometric={isAxonometric} />
            {!isMobile && <OrbitControls enableZoom={false} enablePan={false} />}
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

