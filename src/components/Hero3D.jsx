import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const BLUE = 0x007bff

// Decorative WebGL scene behind the hero: slowly tumbling wireframe solids and
// a particle field in the brand blue, with gentle camera parallax that follows
// the mouse. Purely visual — pointer events pass straight through, rendering
// pauses while the hero is off-screen, and the whole scene is skipped for
// users who prefer reduced motion.
export default function Hero3D() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    camera.position.z = 11

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const shapeDefs = [
      // Opacities are tuned for the dark theme; the light theme dims the whole
      // canvas via CSS (.hero-3d opacity). Left-side shapes sit behind the
      // headline text, so they stay dimmer.
      { geo: new THREE.IcosahedronGeometry(1.5, 0), pos: [-8.2, 2.6, -3.5], speed: [0.0016, 0.0022], opacity: 0.28 },
      { geo: new THREE.TorusKnotGeometry(0.85, 0.26, 72, 10), pos: [7.6, 3.1, -4], speed: [0.0021, 0.0013], opacity: 0.42 },
      { geo: new THREE.OctahedronGeometry(1.05, 0), pos: [-6.6, -3.4, -2.5], speed: [0.0013, 0.0019], opacity: 0.28 },
      { geo: new THREE.TorusGeometry(1.05, 0.34, 9, 26), pos: [6.8, -2.8, -3], speed: [0.0018, 0.0011], opacity: 0.36 },
      { geo: new THREE.DodecahedronGeometry(0.8, 0), pos: [0.4, 4.4, -6], speed: [0.001, 0.0016], opacity: 0.3 },
    ]
    const shapes = shapeDefs.map(({ geo, pos, speed, opacity }) => {
      const material = new THREE.MeshBasicMaterial({
        color: BLUE,
        wireframe: true,
        transparent: true,
        opacity,
      })
      const mesh = new THREE.Mesh(geo, material)
      mesh.position.set(...pos)
      mesh.userData.speed = speed
      scene.add(mesh)
      return mesh
    })

    const particleCount = 160
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (Math.random() - 0.5) * 24
      positions[i + 1] = (Math.random() - 0.5) * 14
      positions[i + 2] = -2 - Math.random() * 8
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: BLUE,
      size: 0.055,
      transparent: true,
      opacity: 0.75,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Mouse parallax target, eased toward in the render loop.
    const target = { x: 0, y: 0 }
    const onMouse = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 0.6
      target.y = (e.clientY / window.innerHeight - 0.5) * 0.4
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    const setSize = () => {
      const { clientWidth: w, clientHeight: h } = mount
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    setSize()
    window.addEventListener('resize', setSize)

    // Skip render work while the hero is scrolled out of view.
    let running = true
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting
    })
    io.observe(mount)

    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      if (!running) return
      for (const mesh of shapes) {
        mesh.rotation.x += mesh.userData.speed[0]
        mesh.rotation.y += mesh.userData.speed[1]
      }
      particles.rotation.y += 0.00045
      camera.position.x += (target.x - camera.position.x) * 0.04
      camera.position.y += (-target.y - camera.position.y) * 0.04
      camera.lookAt(0, 0, -2)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', setSize)
      shapes.forEach((mesh) => {
        mesh.geometry.dispose()
        mesh.material.dispose()
      })
      particleGeo.dispose()
      particleMat.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="hero-3d" ref={mountRef} aria-hidden="true" />
}
