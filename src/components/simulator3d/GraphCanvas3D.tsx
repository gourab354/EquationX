import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { compileExpression } from '../../math/parser';

interface GraphCanvas3DProps {
  expression: string; // e.g. "sin(sqrt(x^2 + y^2) - t)"
  mode: 'surface' | 'curve';
  parametricCurve?: { x: string; y: string; z: string };
  sliders: Record<string, number>;
  gridResolution?: number;
  colormap: 'viridis' | 'cyan-purple' | 'sunset' | 'emerald';
  isWireframe: boolean;
  scale?: number;
}

export const GraphCanvas3D: React.FC<GraphCanvas3DProps> = ({
  expression,
  mode = 'surface',
  parametricCurve,
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

    const dirLight1 = new THREE.DirectionalLight(0xfff7cc, 1.4);
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
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

  // Update Surface / Curve geometry when equation or sliders change
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
        // 3D Parametric Curve (e.g. Torus knot or Lorenz attractor)
        const evalX = compileExpression(parametricCurve.x);
        const evalY = compileExpression(parametricCurve.y);
        const evalZ = compileExpression(parametricCurve.z);

        const curvePts: THREE.Vector3[] = [];
        const curveCols: number[] = [];
        const steps = 600;

        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * 4 * Math.PI;
          const scope = { ...sliders, t };
          const x = evalX.evaluate(scope) || 0;
          const y = evalY.evaluate(scope) || 0;
          const z = evalZ.evaluate(scope) || 0;

          curvePts.push(new THREE.Vector3(x * scale, z * scale, y * scale));
          const col = getColor(i / steps);
          curveCols.push(col.r, col.g, col.b);
        }

        const geom = new THREE.BufferGeometry().setFromPoints(curvePts);
        geom.setAttribute('color', new THREE.Float32BufferAttribute(curveCols, 3));

        const mat = new THREE.LineBasicMaterial({
          vertexColors: true,
          linewidth: 3,
        });

        const line = new THREE.Line(geom, mat);
        scene.add(line);
        meshRef.current = line;
      }
    } catch (err) {
      console.error('3D surface error:', err);
    }
  }, [expression, mode, parametricCurve, sliders, gridResolution, colormap, isWireframe, scale]);

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

    const sph = sphericalRef.current;
    sph.theta -= dx * 0.008;
    sph.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sph.phi - dy * 0.008));

    const camera = cameraRef.current;
    camera.position.x = sph.radius * Math.sin(sph.phi) * Math.sin(sph.theta);
    camera.position.y = sph.radius * Math.cos(sph.phi);
    camera.position.z = sph.radius * Math.sin(sph.phi) * Math.cos(sph.theta);
    camera.lookAt(0, 0, 0);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;

    const sph = sphericalRef.current;
    sph.radius = Math.max(6, Math.min(80, sph.radius + (e.deltaY > 0 ? 2 : -2)));

    const camera = cameraRef.current;
    camera.position.x = sph.radius * Math.sin(sph.phi) * Math.sin(sph.theta);
    camera.position.y = sph.radius * Math.cos(sph.phi);
    camera.position.z = sph.radius * Math.sin(sph.phi) * Math.cos(sph.theta);
    camera.lookAt(0, 0, 0);
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

