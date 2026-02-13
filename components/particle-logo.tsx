"use client"

import { useEffect, useRef } from "react"
import { geoPath, geoMercator } from "d3-geo"

interface ParticleLogoProps {
  scrollProgress: number
  onComplete?: () => void
  onLogoFormed?: (isFormed: boolean) => void
}

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  originalColor?: string
}

export default function ParticleLogo({ scrollProgress, onComplete, onLogoFormed }: ParticleLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const particlesCreatedRef = useRef(false)
  const logoCompleteRef = useRef(false)
  const isCreatingParticlesRef = useRef(false) // Prevent multiple concurrent creations
  const cleanupRef = useRef<(() => void)[]>([]) // Track cleanup functions

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const canvas = canvasRef.current
    if (!canvas) {
      console.log('ParticleLogo: Canvas ref is null')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('ParticleLogo: Could not get 2d context')
      return
    }

    console.log('ParticleLogo: Initializing canvas')

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    // Logo dimensions (centered)
    const logoWidth = 800
    const logoHeight = 400
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const logoX = centerX - logoWidth / 2
    const logoY = centerY - logoHeight / 2

    // Create particles from logo shape - load actual logo image to sample
    const createParticles = async (): Promise<void> => {
      // Prevent concurrent executions
      if (isCreatingParticlesRef.current) {
        return
      }
      isCreatingParticlesRef.current = true
      
      try {
        const particles: Particle[] = []
        const spacing = 2 // Closer spacing for more particles - clearer logo
        const particleDensity = 0.85 // 85% of grid points become particles (was 70%)

        // Load logo image to sample pixels (Futura_Ultimate.png from public)
        const logoImg = new Image()
        logoImg.src = '/Futura_Ultimate.png'
      
      // Load world map data for accurate starting positions
      // Use timeout and retry logic for consistent loading
      let worldMapData: any = null
      let isGeoJSON = false
      
      // Fetch with timeout
      const fetchWithTimeout = async (url: string, timeout: number = 3000): Promise<Response | null> => {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), timeout)
          
          const response = await fetch(url, { signal: controller.signal })
          clearTimeout(timeoutId)
          
          if (response.ok) {
            return response
          }
          return null
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn('Map fetch timeout:', url)
          } else {
            console.warn('Map fetch error:', error)
          }
          return null
        }
      }
      
      // Try to load map data with timeout (3 seconds max)
      try {
        const worldMapResponse = await fetchWithTimeout('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json', 3000)
        if (worldMapResponse) {
          worldMapData = await worldMapResponse.json()
          isGeoJSON = false
        }
      } catch (error) {
        console.warn('Failed to parse world map data:', error)
        worldMapData = null
      }
      
      // If still no data after timeout, use a simple fallback pattern immediately
      // This ensures particles always have starting positions
      if (!worldMapData) {
        console.warn('Using fallback map pattern due to timeout or error')
      }
      
      await new Promise((resolve) => {
        logoImg.onload = resolve
      })

      // Create offscreen canvas to sample logo pixels
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = logoWidth
      tempCanvas.height = logoHeight
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx) {
        tempCtx.drawImage(logoImg, 0, 0, logoWidth, logoHeight)
        const imageData = tempCtx.getImageData(0, 0, logoWidth, logoHeight)
        const data = imageData.data

        // First pass: collect all particles to determine total count
        const particlePositions: Array<{x: number, y: number, isBlue: boolean, r: number, g: number, b: number, targetX: number, targetY: number}> = []
        
        for (let y = 0; y < logoHeight; y += spacing) {
          for (let x = 0; x < logoWidth; x += spacing) {
            if (Math.random() > particleDensity) continue

            const pixelIndex = (y * logoWidth + x) * 4
            const r = data[pixelIndex]
            const g = data[pixelIndex + 1]
            const b = data[pixelIndex + 2]
            const a = data[pixelIndex + 3]

            // Only create particles where logo is visible (alpha > threshold)
            if (a > 50) {
              const isBluePart = b > r + 30 && b > g + 30
              particlePositions.push({
                x,
                y,
                isBlue: isBluePart,
                r,
                g,
                b,
                targetX: logoX + x,
                targetY: logoY + y
              })
            }
          }
        }

        // Extract world map outline points - 100% accurate using actual map geometry
        const worldMapPoints: Array<{x: number, y: number}> = []
        // Use full screen dimensions for maximum accuracy
        const mapWidth = canvas.width
        const mapHeight = canvas.height
        
        // Use d3-geo Mercator projection to convert lat/lon to screen coordinates
        // Properly scale and center the world map
        const projection = geoMercator()
          .scale(mapWidth / (2 * Math.PI)) // Scale based on screen width for accurate proportions
          .translate([centerX, centerY]) // Perfectly center on screen
          .center([0, 20]) // Center map at 0° longitude, 20° latitude for better visual balance
        
        const path = geoPath().projection(projection)
        
        // Create invisible SVG to sample points from paths
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', canvas.width.toString())
        svg.setAttribute('height', canvas.height.toString())
        svg.style.position = 'absolute'
        svg.style.visibility = 'hidden'
        svg.style.pointerEvents = 'none'
        svg.style.top = '0'
        svg.style.left = '0'
        if (document.body) {
          document.body.appendChild(svg)
        }
        
        try {
          let countries: any = null
          
          // If we already have GeoJSON, use it directly
          if (isGeoJSON && worldMapData && worldMapData.features) {
            countries = worldMapData
          } else if (worldMapData && worldMapData.objects) {
            // Convert TopoJSON to GeoJSON with timeout
            let topojsonClient: any = null
            
            // Try to load topojson-client with timeout (2 seconds max)
            try {
              // Try dynamic import first (fastest) with timeout
              const importPromise = import('topojson-client').catch(() => null)
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Import timeout')), 1000)
              )
              
              const topojson = await Promise.race([importPromise, timeoutPromise]).catch(() => null) as any
              if (topojson && topojson.feature) {
                topojsonClient = topojson
              }
            } catch {
              // Import failed or timed out, try CDN
            }
            
            // If import failed, try CDN with timeout
            if (!topojsonClient) {
              try {
                await new Promise((resolve, reject) => {
                  const timeout = setTimeout(() => {
                    reject(new Error('CDN load timeout'))
                  }, 2000)
                  
                  const script = document.createElement('script')
                  script.src = 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js'
                  script.onload = () => {
                    clearTimeout(timeout)
                    topojsonClient = (window as any).topojson
                    resolve(true)
                  }
                  script.onerror = () => {
                    clearTimeout(timeout)
                    reject(new Error('CDN script failed'))
                  }
                  
                  if (typeof document !== 'undefined' && document.head) {
                    document.head.appendChild(script)
                  } else {
                    clearTimeout(timeout)
                    reject(new Error('Document not available'))
                  }
                })
              } catch (cdnError) {
                console.warn('TopoJSON client loading failed:', cdnError)
              }
            }
            
            if (topojsonClient && topojsonClient.feature) {
              try {
                countries = topojsonClient.feature(worldMapData, worldMapData.objects.countries as any)
              } catch (convertError) {
                console.warn('TopoJSON conversion failed:', convertError)
              }
            }
          }
          
          // Extract coordinates from GeoJSON features
          // Process all features to ensure all countries show
          if (countries && countries.features) {
            countries.features.forEach((feature: any) => {
              if (feature.geometry) {
                try {
                  const pathData = path(feature as any)
                  if (pathData && pathData !== 'M0,0' && pathData.length > 3) {
                    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                    pathElement.setAttribute('d', pathData)
                    svg.appendChild(pathElement)
                    
                    const pathLength = pathElement.getTotalLength()
                    if (pathLength > 0) {
                      // Sample points every 1 pixel for 100% accuracy
                      // This ensures all country outlines are fully captured
                      const numSamples = Math.max(20, Math.floor(pathLength / 1))
                      
                      for (let i = 0; i < numSamples; i++) {
                        const length = (i / numSamples) * pathLength
                        const point = pathElement.getPointAtLength(length)
                        if (point && !isNaN(point.x) && !isNaN(point.y) && 
                            point.x >= 0 && point.x <= canvas.width &&
                            point.y >= 0 && point.y <= canvas.height) {
                          worldMapPoints.push({ x: point.x, y: point.y })
                        }
                      }
                      
                      // Also add the last point to ensure path closure
                      if (numSamples > 0) {
                        const lastPoint = pathElement.getPointAtLength(pathLength)
                        if (lastPoint && !isNaN(lastPoint.x) && !isNaN(lastPoint.y)) {
                          worldMapPoints.push({ x: lastPoint.x, y: lastPoint.y })
                        }
                      }
                    }
                    
                    svg.removeChild(pathElement)
                  }
                } catch (pathError) {
                  // Skip invalid features
                }
              }
            })
          }
          
          // Fallback: Manual TopoJSON decoding if topojson-client failed
          // Process all geometries to ensure all countries show
          if (worldMapPoints.length === 0 && worldMapData && worldMapData.objects && worldMapData.objects.countries) {
            // Basic TopoJSON arc decoder (simplified)
            const arcs = worldMapData.arcs || []
            const geometries = (worldMapData.objects.countries as any).geometries || []
            
            // Process all geometries (not skipping any)
            
            // Decode arcs to coordinates
            const decodeArc = (arcIndex: number): number[][] => {
              const arc = arcs[Math.abs(arcIndex)]
              if (!arc) return []
              
              let x = 0, y = 0
              const coordinates: number[][] = []
              
              arc.forEach((point: number[]) => {
                x += point[0]
                y += point[1]
                coordinates.push([x, y])
              })
              
              // If arc index is negative, reverse the coordinates
              if (arcIndex < 0) {
                coordinates.reverse()
              }
              
              return coordinates
            }
            
            geometries.forEach((geo: any) => {
              if (geo.arcs) {
                // This is a TopoJSON geometry with arcs
                const coordinates: number[][][] = []
                
                if (Array.isArray(geo.arcs[0]) && Array.isArray(geo.arcs[0][0])) {
                  // MultiPolygon
                  geo.arcs.forEach((polygon: number[][]) => {
                    const polygonCoords: number[][] = []
                    polygon.forEach((ring: number[]) => {
                      const decoded = decodeArc(ring[0])
                      decoded.forEach(coord => {
                        // Convert quantized coordinates to lat/lon
                        // TopoJSON uses quantized coordinates, need to unquantize
                        const lon = coord[0] / 1000 // Simplified unquantization
                        const lat = coord[1] / 1000
                        const projected = projection([lon, lat])
                        if (projected && !isNaN(projected[0]) && !isNaN(projected[1])) {
                          polygonCoords.push([projected[0], projected[1]])
                        }
                      })
                    })
                    if (polygonCoords.length > 0) {
                      coordinates.push(polygonCoords)
                    }
                  })
                } else {
                  // Polygon
                  const polygonCoords: number[][] = []
                  geo.arcs.forEach((ring: number[]) => {
                    if (Array.isArray(ring)) {
                      ring.forEach((arcIndex: number) => {
                        const decoded = decodeArc(arcIndex)
                        decoded.forEach(coord => {
                          const lon = coord[0] / 1000
                          const lat = coord[1] / 1000
                          const projected = projection([lon, lat])
                          if (projected && !isNaN(projected[0]) && !isNaN(projected[1])) {
                            polygonCoords.push([projected[0], projected[1]])
                          }
                        })
                      })
                    }
                  })
                  if (polygonCoords.length > 0) {
                    coordinates.push(polygonCoords)
                  }
                }
                
                // Create path from coordinates
                if (coordinates.length > 0) {
                  const feature = {
                    type: 'Feature',
                    geometry: {
                      type: geo.type || 'Polygon',
                      coordinates: coordinates
                    }
                  }
                  
                  try {
                    const pathData = path(feature as any)
                    if (pathData && pathData !== 'M0,0' && pathData.length > 3) {
                      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                      pathElement.setAttribute('d', pathData)
                      svg.appendChild(pathElement)
                      
                      const pathLength = pathElement.getTotalLength()
                      if (pathLength > 0) {
                        // Sample points every 1 pixel for 100% accuracy
                        const numSamples = Math.max(20, Math.floor(pathLength / 1))
                        for (let i = 0; i < numSamples; i++) {
                          const length = (i / numSamples) * pathLength
                          const point = pathElement.getPointAtLength(length)
                          if (point && !isNaN(point.x) && !isNaN(point.y)) {
                            worldMapPoints.push({ x: point.x, y: point.y })
                          }
                        }
                        
                        // Add the last point to ensure path closure
                        if (numSamples > 0) {
                          const lastPoint = pathElement.getPointAtLength(pathLength)
                          if (lastPoint && !isNaN(lastPoint.x) && !isNaN(lastPoint.y)) {
                            worldMapPoints.push({ x: lastPoint.x, y: lastPoint.y })
                          }
                        }
                      }
                      
                      svg.removeChild(pathElement)
                    }
                  } catch (e) {
                    // Skip invalid paths
                  }
                }
              }
            })
          }
          
          console.log(`Extracted ${worldMapPoints.length} world map points`)
        } catch (error) {
          console.error('Error processing world map:', error)
        } finally {
          // Clean up SVG element (if still attached)
          if (svg && svg.parentNode && typeof document !== 'undefined' && document.body) {
            try {
              document.body.removeChild(svg)
            } catch (e) {
              // SVG might already be removed or document not available
            }
          }
        }
        
        // Sample points from world map outline to match particle count
        // Use all points to ensure 100% accuracy - distribute particles evenly
        let sampledMapPoints: Array<{x: number, y: number}> = []
        
        if (worldMapPoints.length > 0) {
          // Distribute particles evenly across all map points for maximum accuracy
          const step = worldMapPoints.length / particlePositions.length
          
          for (let i = 0; i < particlePositions.length; i++) {
            const index = Math.floor(i * step) % worldMapPoints.length
            sampledMapPoints.push(worldMapPoints[index])
          }
          
          // If we have fewer map points than particles, cycle through them
          if (worldMapPoints.length < particlePositions.length) {
            while (sampledMapPoints.length < particlePositions.length) {
              const needed = particlePositions.length - sampledMapPoints.length
              sampledMapPoints = [...sampledMapPoints, ...worldMapPoints.slice(0, needed)]
            }
          }
        } else {
          // Fallback: Create a simple world map pattern if no points extracted
          // This ensures particles always have starting positions
          console.warn('No map points extracted, using fallback pattern')
          const gridSize = 30
          const margin = 50
          for (let x = margin; x < canvas.width - margin; x += gridSize) {
            for (let y = margin; y < canvas.height - margin; y += gridSize) {
              // Create a rough world map shape (rectangular with some variation)
              const normalizedX = (x - margin) / (canvas.width - 2 * margin)
              const normalizedY = (y - margin) / (canvas.height - 2 * margin)
              
              // Simple world map approximation (continents shape)
              if (normalizedX > 0.1 && normalizedX < 0.9 && 
                  normalizedY > 0.15 && normalizedY < 0.85) {
                if (Math.random() > 0.3) { // 70% density
                  sampledMapPoints.push({ x, y })
                }
              }
            }
          }
          
          // Ensure we have enough points
          while (sampledMapPoints.length < particlePositions.length) {
            const needed = particlePositions.length - sampledMapPoints.length
            sampledMapPoints = [...sampledMapPoints, ...sampledMapPoints.slice(0, needed)]
          }
        }
        
        // Second pass: assign particles to world map positions
        particlePositions.forEach((pos, index) => {
          let startX: number
          let startY: number
          
          if (sampledMapPoints.length > 0) {
            // Assign particle to world map outline point
            const mapPointIndex = index % sampledMapPoints.length
            const mapPoint = sampledMapPoints[mapPointIndex]
            
            // Add minimal random variation for natural look (particles sit on outline)
            const variation = 2 // Very small variation - particles should be ON the outline
            const angle = Math.random() * Math.PI * 2
            const distance = Math.random() * variation
            
            if (pos.isBlue) {
              // Blue particles cluster tightly on map outline
              startX = mapPoint.x + Math.cos(angle) * distance * 0.4
              startY = mapPoint.y + Math.sin(angle) * distance * 0.4
            } else {
              // White particles on map outline
              startX = mapPoint.x + Math.cos(angle) * distance
              startY = mapPoint.y + Math.sin(angle) * distance
            }
          } else {
            // Fallback if map loading fails - use center
            startX = centerX
            startY = centerY
          }
          
          // Store original logo color for color transition
          particles.push({
            x: startX,
            y: startY,
            targetX: pos.targetX,
            targetY: pos.targetY,
            vx: 0,
            vy: 0,
            size: 2.5 + Math.random() * 1.5,
            opacity: 1, // Start fully visible
            color: pos.isBlue ? `rgba(100, 150, 255, 1)` : `rgba(255, 255, 255, 1)`, // Blue or white
            originalColor: `rgba(${pos.r}, ${pos.g}, ${pos.b}, 1)` // Store for transition
          } as Particle & { originalColor?: string })
        })
      }

      particlesRef.current = particles
      console.log('ParticleLogo: Created', particles.length, 'particles from logo image')
    } catch (error) {
      console.error('Error in createParticles:', error)
      // Create minimal fallback particles
      const fallbackParticles: Particle[] = []
      for (let i = 0; i < 500; i++) {
        fallbackParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          targetX: logoX + (i % logoWidth),
          targetY: logoY + Math.floor(i / logoWidth),
          vx: 0,
          vy: 0,
          size: 2.5,
          opacity: 1,
          color: 'rgba(255, 255, 255, 1)'
        })
      }
      particlesRef.current = fallbackParticles
    } finally {
      isCreatingParticlesRef.current = false
    }
  }

    // Create particles once with timeout and proper guards to ensure consistency
    if (!particlesCreatedRef.current && !isCreatingParticlesRef.current) {
      let particleCreationTimeout: NodeJS.Timeout | null = null
      
      const createWithTimeout = async () => {
        try {
          await Promise.race([
            createParticles(),
            new Promise((_, reject) => {
              particleCreationTimeout = setTimeout(() => {
                reject(new Error('Particle creation timeout'))
              }, 4000)
            })
          ])
          
          if (particleCreationTimeout) {
            clearTimeout(particleCreationTimeout)
            particleCreationTimeout = null
          }
          
          if (particlesRef.current.length > 0) {
            particlesCreatedRef.current = true
          } else {
            throw new Error('No particles created')
          }
        } catch (error) {
          if (particleCreationTimeout) {
            clearTimeout(particleCreationTimeout)
            particleCreationTimeout = null
          }
          
          console.warn('Particle creation failed or timed out, using fallback:', error)
          
          // Create reliable fallback particles
          const fallbackParticles: Particle[] = []
          const gridSize = 40
          const numParticles = 1000
          
          for (let i = 0; i < numParticles; i++) {
            const x = (i % Math.floor(canvas.width / gridSize)) * gridSize
            const y = Math.floor(i / Math.floor(canvas.width / gridSize)) * gridSize
            
            fallbackParticles.push({
              x: Math.max(0, Math.min(x, canvas.width)),
              y: Math.max(0, Math.min(y, canvas.height)),
              targetX: logoX + (i % logoWidth),
              targetY: logoY + Math.floor(i / logoWidth),
              vx: 0,
              vy: 0,
              size: 2.5,
              opacity: 1,
              color: 'rgba(255, 255, 255, 1)'
            })
          }
          
          particlesRef.current = fallbackParticles
          particlesCreatedRef.current = true
          console.log('ParticleLogo: Created', fallbackParticles.length, 'fallback particles')
        }
      }
      
      createWithTimeout().then(() => {
        console.log('ParticleLogo: Particle creation completed, total particles:', particlesRef.current.length)
      }).catch((err) => {
        console.error('ParticleLogo: Particle creation error:', err)
      })
      
      // Track cleanup
      cleanupRef.current.push(() => {
        if (particleCreationTimeout) {
          clearTimeout(particleCreationTimeout)
        }
      })
    }

    // Animation driven by scroll progress
    const animate = () => {
      if (!canvas || !ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw particles even if array is empty initially (will populate)
      if (particlesRef.current.length === 0) {
        // Still continue animation loop to wait for particles
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }
      
      // Debug: log particle count occasionally
      if (Math.random() < 0.01) {
        console.log('ParticleLogo: Drawing', particlesRef.current.length, 'particles, progress:', scrollProgress)
      }

      // Use animation progress to drive animation (0 to 1)
      // 0-1.5 seconds: World map display (particles stay in map positions)
      // 1.5-9.5 seconds: Logo formation (particles move from map to logo)
      const mapDisplayEnd = 1.5 / 19 // 1.5 seconds = 7.9% of 19 seconds
      const logoFormationEnd = 9.5 / 19 // 9.5 seconds = 50% of 19 seconds
      
      // Only start formation after map display period
      const formationStartProgress = mapDisplayEnd
      const formationProgress = scrollProgress < formationStartProgress 
        ? 0 // Stay at 0 during map display
        : Math.min(Math.max((scrollProgress - formationStartProgress) / (logoFormationEnd - formationStartProgress), 0), 1)
      const progress = Math.min(Math.max(formationProgress, 0), 1)
      
      // Check if all particles have reached their targets
      const allParticlesInPosition = particlesRef.current.every(p => {
        const dx = p.targetX - p.x
        const dy = p.targetY - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < 2 // Consider particle in position if within 2 pixels
      })
      
      // Mark logo as complete only when all particles are in position AND we've scrolled enough
      if (allParticlesInPosition && progress >= 0.95 && !logoCompleteRef.current) {
        logoCompleteRef.current = true
        if (onLogoFormed) {
          onLogoFormed(true)
        }
      }
      
      // Notify parent of logo formation status
      if (onLogoFormed) {
        onLogoFormed(logoCompleteRef.current)
      }
      
      // Smooth easing for particle movement
      const eased = 1 - Math.pow(1 - progress, 3)

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {

        // Calculate direction to target
        const dx = particle.targetX - particle.x
        const dy = particle.targetY - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Move particle towards target (smooth and slow)
        // Ensure particles have enough time to reach their targets
        if (distance > 1) {
          // Staggered start - particles start moving at different times for organic feel
          const delay = (particle.targetX % 100 + particle.targetY % 100) / 200
          const adjustedProgress = Math.max(0, (progress - delay) / (1 - delay))
          
          if (adjustedProgress > 0) {
            // Faster initial speed to ensure particles reach targets in time
            const speed = 0.08 * (1 - adjustedProgress * 0.4) // Faster to ensure completion
            particle.vx += (dx / distance) * speed
            particle.vy += (dy / distance) * speed
            
            // Less friction for more direct movement
            particle.vx *= 0.98
            particle.vy *= 0.98

            particle.x += particle.vx
            particle.y += particle.vy
          }
        } else {
          // Snap to target when close - ensure logo is fully formed
          particle.x = particle.targetX
          particle.y = particle.targetY
        }

        // Keep particles fully visible
        particle.opacity = 1
        
        // Check if particle started as blue (center particles)
        const isBlueParticle = particle.color.includes('100, 150, 255')
        
        // Blue particles always stay blue - never transition
        if (!isBlueParticle) {
          // Only white particles transition to logo color
          const colorProgress = Math.min(progress * 1.5, 1) // Faster color transition
          if (colorProgress > 0.3 && particle.originalColor) {
            // Start transitioning to logo color
            const originalMatch = particle.originalColor.match(/rgba\((\d+), (\d+), (\d+),/)
            if (originalMatch) {
              const r = parseInt(originalMatch[1])
              const g = parseInt(originalMatch[2])
              const b = parseInt(originalMatch[3])
              const colorTransition = Math.min((colorProgress - 0.3) / 0.7, 1)
              
              // White particles transition from white to logo color
              const whiteAmount = 1 - colorTransition
              const finalR = Math.round(255 * whiteAmount + r * colorTransition)
              const finalG = Math.round(255 * whiteAmount + g * colorTransition)
              const finalB = Math.round(255 * whiteAmount + b * colorTransition)
              particle.color = `rgba(${finalR}, ${finalG}, ${finalB}, 1)`
            }
          }
        }
        // Blue particles remain blue - no color transition applied

        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Always continue animating while component is mounted
      animationFrameRef.current = requestAnimationFrame(animate)
      
      // Call onComplete when logo is actually complete (all particles in position)
      if (logoCompleteRef.current && onComplete) {
        onComplete()
      }
    }

    // Start animation loop immediately - particles will appear as they're created
    // This ensures the map appears progressively, not all at once
    console.log('ParticleLogo: Starting animation loop')
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      
      // Remove resize listener
      window.removeEventListener('resize', setCanvasSize)
      
      // Run all cleanup functions
      cleanupRef.current.forEach(cleanup => {
        try {
          cleanup()
        } catch (e) {
          console.warn('Cleanup error:', e)
        }
      })
      cleanupRef.current = []
      
      // Reset flags to allow re-initialization
      isCreatingParticlesRef.current = false
    }
  }, [scrollProgress, onComplete, onLogoFormed])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 100000,
        mixBlendMode: 'screen',
        backgroundColor: 'transparent'
      }}
    />
  )
}

