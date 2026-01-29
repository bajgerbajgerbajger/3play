import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

interface ThreePlayButtonProps {
  playing: boolean
  onClick: (e: React.MouseEvent) => void
  size?: number
  color?: string
  videoRef?: React.RefObject<HTMLVideoElement>
}

export function ThreePlayButton({ playing, onClick, size = 160, color = "#FF0033", videoRef }: ThreePlayButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  
  // Refs for animation state
  const stateRef = useRef({ playing: false, hover: false })
  const tiltRef = useRef({ x: 0, y: 0 })
  const iconUniformsRef = useRef<{ uMorph: { value: number }, uGlow: { value: number }, uPress: { value: number } } | null>(null)

  // Sync props to ref
  useEffect(() => {
    stateRef.current.playing = playing
  }, [playing])

  // Sync Play/Pause with Video (Direct Listener)
  useEffect(() => {
    const video = videoRef?.current
    if (!video) return

    const updateState = () => {
       const isPlaying = !video.paused && !video.ended
       stateRef.current.playing = isPlaying
    }

    video.addEventListener('play', updateState)
    video.addEventListener('pause', updateState)
    video.addEventListener('ended', updateState)
    
    // Initial check
    updateState()

    return () => {
        video.removeEventListener('play', updateState)
        video.removeEventListener('pause', updateState)
        video.removeEventListener('ended', updateState)
    }
  }, [videoRef])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const WIDTH = size
    const HEIGHT = size

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(WIDTH, HEIGHT)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // --- Scene / Camera ---
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, WIDTH / HEIGHT, 0.1, 100)
    camera.position.set(0, 0.15, 3.2)

    // --- Postprocessing (Bloom) ---
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(WIDTH, HEIGHT),
      1.2,   // strength
      0.65,  // radius
      0.18   // threshold
    )
    composer.addPass(bloomPass)

    // --- Lights ---
    const key = new THREE.DirectionalLight(0xffffff, 2.3)
    key.position.set(2.5, 3.0, 2.0)
    scene.add(key)
    
    const fill = new THREE.DirectionalLight(0xffd3d3, 0.9)
    fill.position.set(-3, 1.2, 2)
    scene.add(fill)
    
    const rim = new THREE.DirectionalLight(0xffffff, 1.2)
    rim.position.set(-1.5, 2.5, -2)
    scene.add(rim)
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))

    // --- 3D Body (Rounded Rect) ---
    function roundedRectShape(width: number, height: number, radius: number) {
      const x = -width / 2, y = -height / 2
      const r = Math.min(radius, width / 2, height / 2)
      const s = new THREE.Shape()
      s.moveTo(x + r, y)
      s.lineTo(x + width - r, y)
      s.quadraticCurveTo(x + width, y, x + width, y + r)
      s.lineTo(x + width, y + height - r)
      s.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
      s.lineTo(x + r, y + height)
      s.quadraticCurveTo(x, y + height, x, y + height - r)
      s.lineTo(x, y + r)
      s.quadraticCurveTo(x, y, x + r, y)
      return s
    }

    const bodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(1.6, 1.2, 0.38), {
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 8,
      curveSegments: 24
    })
    bodyGeo.center()

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color), 
      metalness: 0.25,
      roughness: 0.28,
      clearcoat: 1.0,
      clearcoatRoughness: 0.10,
      sheen: 1.0,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color("#ff6a6a"),
      reflectivity: 0.75
    })

    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.rotation.x = -0.10
    scene.add(body)

    // --- Glass Highlight ---
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ffffff"),
      transparent: true,
      opacity: 0.10,
      roughness: 0.05,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02
    })
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.95), glassMat)
    glass.position.set(0, 0.03, 0.23)
    glass.rotation.x = -0.05
    scene.add(glass)

    // --- Bloom Glow Card ---
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.1),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.18 })
    )
    glow.position.z = -0.25
    scene.add(glow)

    // --- Morph Icon Shader ---
    const iconUniforms = {
      uMorph: { value: stateRef.current.playing ? 1.0 : 0.0 },
      uGlow: { value: 0.9 },
      uPress: { value: 0.0 },
    }
    iconUniformsRef.current = iconUniforms

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform float uMorph; // 0 = play, 1 = pause
      uniform float uGlow;
      uniform float uPress;

      float sdBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }

      // Robust Play Triangle SDF
      float sdTri(vec2 p) {
        p.x += 0.08; 
        const float k = sqrt(3.0);
        p.x = -p.x; // Point right
        p.y = abs(p.y);
        
        if (p.x + k*p.y > 0.0) p = vec2(p.x - k*p.y, -k*p.x - p.y) / 2.0;
        p.x -= clamp(p.x, -0.5, 0.0);
        return -length(p) * sign(p.y);
      }

      void main() {
        vec2 uv = vUv - 0.5;
        
        // --- PLAY SHAPE (Triangle) ---
        // Simple manual SDF for a triangle pointing right
        // Vertices: (-0.15, -0.25), (0.25, 0.0), (-0.15, 0.25)
        vec2 p = uv;
        p.x += 0.05;
        
        // Edge equations
        float d1 = dot(p - vec2(0.25, 0.0), normalize(vec2(-0.5, 0.25)));
        float d2 = dot(p - vec2(0.25, 0.0), normalize(vec2(-0.5, -0.25)));
        float d3 = -(p.x - (-0.15));
        
        float distPlay = max(max(d1, d2), d3);
        distPlay -= 0.04; // Rounded corners

        // --- PAUSE SHAPE (Two Bars) ---
        float distPause = min(
           sdBox(uv - vec2(-0.12, 0.0), vec2(0.05, 0.22), 0.03),
           sdBox(uv - vec2( 0.12, 0.0), vec2(0.05, 0.22), 0.03)
        );

        // --- MORPH ---
        float dist = mix(distPlay, distPause, uMorph);

        // --- RENDER ---
        float alpha = 1.0 - smoothstep(0.0, 0.01, dist);
        float glow = exp(-20.0 * max(dist, 0.0)) * uGlow;
        
        vec3 col = vec3(1.0);
        col *= (1.0 - uPress * 0.3);

        gl_FragColor = vec4(col, alpha + glow * 0.5);
        if (gl_FragColor.a < 0.01) discard;
      }
    `

    const iconMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: iconUniforms,
      vertexShader,
      fragmentShader,
      depthTest: false,
    })

    const icon = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), iconMat)
    icon.position.z = 0.25
    icon.rotation.x = -0.10
    scene.add(icon)

    // --- Animation Loop ---
    let frameId: number
    const animate = () => {
      frameId = requestAnimationFrame(animate)

      // Smooth Tilt
      const tx = tiltRef.current.y * 0.4
      const ty = tiltRef.current.x * 0.4
      
      body.rotation.x += (tx - 0.10 - body.rotation.x) * 0.1
      body.rotation.y += (ty - body.rotation.y) * 0.1
      
      glass.rotation.x = body.rotation.x + 0.05
      glass.rotation.y = body.rotation.y
      
      icon.rotation.x = body.rotation.x
      icon.rotation.y = body.rotation.y
      
      glow.rotation.x = body.rotation.x
      glow.rotation.y = body.rotation.y

      // Morph logic using Ref to avoid stale closure
      const targetMorph = stateRef.current.playing ? 1.0 : 0.0
      iconUniforms.uMorph.value += (targetMorph - iconUniforms.uMorph.value) * 0.1

      composer.render()
    }
    animate()

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(frameId)
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      composer.dispose()
      bodyGeo.dispose()
      bodyMat.dispose()
      glassMat.dispose()
      iconMat.dispose()
    }
  }, []) // Init once

  // --- Event Handlers ---
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
    tiltRef.current = { x, y }
    stateRef.current.hover = true
  }

  const handleMouseLeave = () => {
    tiltRef.current = { x: 0, y: 0 }
    stateRef.current.hover = false
  }
  
  const handlePointerDown = async (e: React.PointerEvent) => {
    if (iconUniformsRef.current) iconUniformsRef.current.uPress.value = 1.0
    if (navigator.vibrate) navigator.vibrate(16)

    const video = videoRef?.current
    if (video) {
        // autoplay policies: play needs user gesture, which we have here
        if (video.paused || video.ended) {
            try { await video.play() } catch (err) { console.error(err) }
        } else {
            video.pause()
        }
    } else {
        // Fallback demo toggle
        stateRef.current.playing = !stateRef.current.playing
        onClick(e) 
    }
  }
  
  const handlePointerUp = (e: React.PointerEvent) => {
    if (iconUniformsRef.current) iconUniformsRef.current.uPress.value = 0.0
    // We handled the action in pointerdown
  }

  // Scroll Parallax
  useEffect(() => {
    const handleScroll = () => {
        if (stateRef.current.hover) return
        const t = Math.min(window.scrollY / 500, 1.0) * 0.5
        tiltRef.current = { x: 0, y: -t }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-[160px] h-[160px] cursor-pointer pointer-events-auto rounded-[42px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ 
        touchAction: 'none',
        filter: 'drop-shadow(0 30px 60px rgba(0,0,0,.70))'
      }}
    />
  )
}
