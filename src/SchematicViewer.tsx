import { Suspense, Component, ReactNode, useState, useEffect } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Html, Center } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import type { BufferGeometry } from 'three'
import { Loader2, Box, AlertCircle } from 'lucide-react'

type Props = {
  src: string
  height?: number
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-neural-400" />
        <span className="text-sm text-gray-400">Loading 3D model...</span>
      </div>
    </Html>
  )
}

// Error Boundary class component
interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[SchematicViewer] Error:', error.message)
    console.error('[SchematicViewer] Component stack:', info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// Model component that loads STL
function Model({ src }: { src: string }) {
  console.log('[SchematicViewer] Attempting to load:', src)
  
  const geom = useLoader(STLLoader, src, () => {
    console.log('[SchematicViewer] Loader initialized')
  }) as BufferGeometry
  
  console.log('[SchematicViewer] Geometry loaded, vertex count:', geom.attributes?.position?.count || 0)
  
  // Center and scale the geometry
  geom.computeBoundingBox()
  geom.center()
  
  // Calculate scale based on bounding box
  const box = geom.boundingBox
  if (box) {
    const size = Math.max(
      box.max.x - box.min.x,
      box.max.y - box.min.y,
      box.max.z - box.min.z
    )
    const scale = 80 / size // Normalize to ~80 units
    geom.scale(scale, scale, scale)
    console.log('[SchematicViewer] Scaled model, original size:', size)
  }

  return (
    <Center>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#9CA3AF" 
          metalness={0.4} 
          roughness={0.6}
        />
      </mesh>
    </Center>
  )
}

// 3D Scene wrapper
function Scene({ src }: { src: string }) {
  return (
    <Canvas 
      camera={{ position: [0, 50, 120], fov: 50, near: 0.1, far: 10000 }}
      style={{ background: 'linear-gradient(180deg, #111827 0%, #0a0a0a 100%)' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[50, 50, 50]} intensity={1} />
      <directionalLight position={[-30, -30, -30]} intensity={0.3} />
      <pointLight position={[0, 100, 0]} intensity={0.4} color="#60a5fa" />
      
      <Suspense fallback={<LoadingSpinner />}>
        <Model src={src} />
      </Suspense>
      
      <OrbitControls 
        enableZoom 
        enablePan 
        autoRotate 
        autoRotateSpeed={0.5}
        minDistance={30}
        maxDistance={400}
      />
    </Canvas>
  )
}

// Error fallback UI with details
function ErrorFallback({ src }: { src: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900/80 text-gray-500 p-6">
      <AlertCircle className="w-10 h-10 mb-3 text-red-500/70" />
      <p className="text-sm font-medium text-gray-400">3D Model Failed to Load</p>
      <p className="text-xs text-gray-600 mt-1 max-w-xs text-center break-all">{src}</p>
      <p className="text-xs text-gray-600 mt-2">Check browser console for details</p>
    </div>
  )
}

// Main component
export default function SchematicViewer({ src, height = 380 }: Props) {
  const [mounted, setMounted] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Delay mounting to prevent SSR issues
  useEffect(() => {
    console.log('[SchematicViewer] Mounting with src:', src)
    setMounted(true)
    
    // Pre-check if file is accessible
    fetch(src, { method: 'HEAD' })
      .then(res => {
        if (!res.ok) {
          console.error('[SchematicViewer] File not accessible:', res.status, res.statusText)
          setLoadError(`HTTP ${res.status}: ${res.statusText}`)
        } else {
          console.log('[SchematicViewer] File accessible, size:', res.headers.get('content-length'))
        }
      })
      .catch(err => {
        console.error('[SchematicViewer] Fetch error:', err)
        setLoadError(err.message)
      })
  }, [src])

  if (!mounted) {
    return (
      <div 
        className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900/50 flex items-center justify-center" 
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-3">
          <Box className="w-10 h-10 text-gray-600" />
          <span className="text-sm text-gray-500">Initializing 3D viewer...</span>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div 
        className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900/50 flex items-center justify-center" 
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-3 p-4">
          <AlertCircle className="w-10 h-10 text-red-500/70" />
          <span className="text-sm text-gray-400">Failed to load model</span>
          <span className="text-xs text-gray-600">{loadError}</span>
          <span className="text-xs text-gray-700 break-all max-w-xs text-center">{src}</span>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="relative rounded-lg overflow-hidden border border-gray-700" 
      style={{ height }}
    >
      <ErrorBoundary fallback={<ErrorFallback src={src} />}>
        <Scene src={src} />
      </ErrorBoundary>
      
      {/* Controls hint overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-gray-500 pointer-events-none">
        <span>Drag to rotate • Scroll to zoom</span>
        <span className="text-neural-400">Auto-rotating</span>
      </div>
    </div>
  )
}
