import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { compileExpression } from '../../math/parser';

interface GraphCanvas3DProps {
  expression: string; // e.g. "sin(sqrt(x^2 + y^2) - t)"
  mode: 'surface' | 'curve';
  parametricCurve?: { x: string; y: string; z: string };
  tubeRadius?: number; // string / tube radius
  sliders: Record<string, number>;
  gridResolution?: number;
  colormap: 'viridis' | 'cyan-purple' | 'sunset' | 'emerald';
  isWireframe: boolean;
  scale?: number;
}

class Parametric3DPath extends THREE.Curve<THREE.Vector3> {
  evalX: any;
  evalY: any;
  evalZ: any;
  sliders: Record<string, number>;
  scale: number;

  constructor(evalX: any, evalY: any, evalZ: any, sliders: Record<string, number>, scale: number) {
    super();
    this.evalX = evalX;
    this.evalY = evalY;
    this.evalZ = evalZ;
    this.sliders = sliders;
    this.scale = scale;
  }

  getPoint(tFraction: number, optionalTarget = new THREE.Vector3()) {
    // Parameter t traverses one complete period [0, 2*PI]
    const t = tFraction * 2 * Math.PI;
    const scope = { ...this.sliders, t };
    const x = (this.evalX.evaluate(scope) || 0) * this.scale;
    const y = (this.evalY.evaluate(scope) || 0) * this.scale;
    const z = (this.evalZ.evaluate(scope) || 0) * this.scale;
    // In Three.js: X horizontal, Y is UP, Z is depth
    return optionalTarget.set(x, z, y);
  }
}

export const GraphCanvas3D: React.FC<GraphCanvas3DProps> = ({
  expression,
  mode = 'surface',
  parametricCurve,
  tubeRadius = 0.35,
  sliders,
  gridResolution = 60,
  colormap = 'viridis',
  isWireframe = false,
  scale = 1.0,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | THREE.Line | null>(null);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 25, theta: Math.PI / 4, phi: Math.PI / 3 });

  // Color gradient function
  const getColor = (normHeight: number): THREE.Color => {
    const t = Math.max(0, Math.min(1, normHeight));
    const c = new THREE.Color();

    if (colormap === 'viridis') {
      // Purple -> Blue -> Green -> Yellow
      if (t < 0.33) c.setRGB(0.26 + t * 0.5, 0.0 + t * 1.2, 0.33 + t * 1.5);
      else if (t < 0.66) c.setRGB(0.12 + (t - 0.33) * 0.8, 0.4 + (t - 0.33) * 1.2, 0.55 - (t - 0.33) * 0.6);
      else c.setRGB(0.5 + (t - 0.66) * 1.4, 0.8 + (t - 0.66) * 0.6, 0.15);
    } else if (colormap === 'cyan-purple') {
      c.setRGB(0.2 + t * 0.7, 0.1 + (1 - t) * 0.8, 0.9);
    } else if (colormap === 'sunset') {
      c.setRGB(0.9, 0.2 + t * 0.6, 0.1 + (1 - t) * 0.4);
    } else {
      // Emerald
      c.setRGB(0.05 + t * 0.3, 0.7 + t * 0.3, 0.4 + (1 - t) * 0.4);
    }
    return c;
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff7cc, 1.5);
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight2.position.set(-15, -10, -20);
    scene.add(dirLight2);

    // 3D Axis Helper & Grid
    const grid = new THREE.GridHelper(20, 20, 0x0f172a, 0xe2e8f0);
    grid.position.y = -5;
    scene.add(grid);

    const axesHelper = new THREE.AxesHelper(10);
    axesHelper.position.set(-10, -5, -10);
    scene.add(axesHelper);

    // Update camera position from spherical
    const updateCamera = () => {
      const { radius, theta, phi } = sphericalRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Surface / 3D Tube geometry when equation, curve, or radius changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old mesh
    if (meshRef.current) {
      scene.remove(meshRef.current);
      if ('geometry' in meshRef.current) meshRef.current.geometry.dispose();
      meshRef.current = null;
    }

    try {
      if (mode === 'surface') {
        const { evaluate, error } = compileExpression(expression);
        if (error) return;

        const res = gridResolution;
        const geom = new THREE.BufferGeometry();
        const positions: number[] = [];
        const colors: number[] = [];
        const indices: number[] = [];

        const span = 10;
        const step = (span * 2) / res;

        let minZ = Infinity;
        let maxZ = -Infinity;

        // Compute vertex positions
        const zGrid: number[][] = [];
        for (let i = 0; i <= res; i++) {
          const row: number[] = [];
          const y = -span + i * step;
          for (let j = 0; j <= res; j++) {
            const x = -span + j * step;
            let z = evaluate({ ...sliders, x, y });
            if (isNaN(z) || !isFinite(z)) z = 0;
            // clamp extreme values
            z = Math.max(-15, Math.min(15, z));
            row.push(z);
            minZ = Math.min(minZ, z);
            maxZ = Math.max(maxZ, z);
          }
          zGrid.push(row);
        }

        const zRange = maxZ - minZ || 1;

        // Build vertex attributes
        for (let i = 0; i <= res; i++) {
          const y = -span + i * step;
          for (let j = 0; j <= res; j++) {
            const x = -span + j * step;
            const z = zGrid[i][j];

            // In Three.js: X is horizontal, Y is UP, Z is depth
            positions.push(x * scale, z * scale, y * scale);

            const normZ = (z - minZ) / zRange;
            const col = getColor(normZ);
            colors.push(col.r, col.g, col.b);
          }
        }

        // Build triangle index grid
        for (let i = 0; i < res; i++) {
          for (let j = 0; j < res; j++) {
            const a = i * (res + 1) + j;
            const b = i * (res + 1) + (j + 1);
            const c = (i + 1) * (res + 1) + j;
            const d = (i + 1) * (res + 1) + (j + 1);

            // Two triangles per quad
            indices.push(a, c, b);
            indices.push(b, c, d);
          }
        }

        geom.setIndex(indices);
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geom.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.35,
          metalness: 0.15,
          wireframe: isWireframe,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geom, mat);
        scene.add(mesh);
        meshRef.current = mesh;
      } else if (mode === 'curve' && parametricCurve) {
        // 3D Parametric Space Knot / Curve rendered as a solid 3D Tube with adjustable radius!
        const evalX = compileExpression(parametricCurve.x);
        const evalY = compileExpression(parametricCurve.y);
        const evalZ = compileExpression(parametricCurve.z);

        const path = new Parametric3DPath(evalX, evalY, evalZ, sliders, scale);
        const tubularSegments = 300;
        // User adjustable string/tube radius (either from slider or prop)
        const radius = Math.max(0.04, tubeRadius || sliders['r'] || 0.35);
        const radialSegments = 16;
        const closed = true;

        const geom = new THREE.TubeGeometry(path, tubularSegments, radius, radialSegments, closed);

        // Color along the 3D tube length with smooth colormap transition!
        const count = geom.attributes.position.count;
        const colors: number[] = [];
        const verticesPerRing = radialSegments + 1;

        for (let i = 0; i < count; i++) {
          const ringIndex = Math.floor(i / verticesPerRing);
          const tFraction = ringIndex / tubularSegments;
          const col = getColor(tFraction);
          colors.push(col.r, col.g, col.b);
        }

        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geom.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.25,
          metalness: 0.3,
          wireframe: isWireframe,
          side: THREE.DoubleSide,
        });

        const tubeMesh = new THREE.Mesh(geom, mat);
        scene.add(tubeMesh);
        meshRef.current = tubeMesh;
      }
    } catch (err) {
      console.error('3D geometry error:', err);
    }
  }, [expression, mode, parametricCurve, tubeRadius, sliders, gridResolution, colormap, isWireframe, scale]);

  // Orbit drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !cameraRef.current) return;

    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    const speed = 0.006;
    sphericalRef.current.theta -= dx * speed;
    sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - dy * speed));

    const { radius, theta, phi } = sphericalRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0, 0);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const zoomSpeed = 0.02;
    sphericalRef.current.radius = Math.max(5, Math.min(100, sphericalRef.current.radius + e.deltaY * zoomSpeed));

    const { radius, theta, phi } = sphericalRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0, 0);
  };

  return (
    <div
      ref={mountRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
};
