import { useRef, useMemo, useCallback, useEffect, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import type { HoveredNodeData } from "./WorkflowDiagram";

const PARTICLE_COUNT = 850;
const X_RANGE = 12;
const Y_RANGE = 7;
const Z_MIN = -4;
const Z_MAX = 0;
const MIN_VELOCITY = 0.5;
const MAX_VELOCITY = 1.5;
const MIN_OPACITY = 0.15;
const MAX_OPACITY = 0.35;
const SPEED_MIN = 0.3;
const SPEED_MAX = 1.0;
const WARP_SPEED = 2.5;
const WARP_SIZE = 10;
const DEFAULT_SIZE = 4;
const WARP_LERP = 0.08;
const CAMERA_TILT_DEG = 3;
const CAMERA_LERP = 0.05;

const ATOM_Z_MIN = -5;
const ATOM_Z_MAX = -3;
const ATOM_DRIFT_FACTOR = 0.2;
const ATOM_ORBIT_MIN = 0.3;
const ATOM_ORBIT_MAX = 0.7;
const ATOM_ROTATION_MIN = 0.1;
const ATOM_ROTATION_MAX = 0.3;
const ATOM_NUCLEUS_OPACITY_MIN = 0.1;
const ATOM_NUCLEUS_OPACITY_MAX = 0.15;
const ATOM_RING_OPACITY = 0.06;
const ATOM_ELECTRON_OPACITY = 0.12;
const ATOM_WARP_ELECTRON_MULT = 1.5;
const ATOM_WARP_OPACITY_SPIKE = 1.5;
const ATOM_WARP_DECAY = 4.0;
const ORBIT_SEGMENTS = 64;

const ATOM_BREAKPOINTS: [number, number][] = [
  [1536, 10],
  [1024, 7],
  [768, 5],
  [0, 3],
];

const CONNECTION_DISTANCE = 1.2;
const CONNECTION_MAX = 3;
const CONNECTION_OPACITY_MAX = 0.12;
const CONNECTION_OPACITY_MIN = 0.06;
const MAX_LINE_SEGMENTS = PARTICLE_COUNT * CONNECTION_MAX;
const GRID_CELL_SIZE = CONNECTION_DISTANCE;

const ATTRACTION_RADIUS = 4.5;
const ATTRACTION_STRENGTH = 1.8;
const ATTRACTION_DECAY_MS = 4500;

const EMERALD = new THREE.Color("#34d399");
const CYAN = new THREE.Color("#22d3ee");

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function buildParticleData() {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() * 2 - 1) * X_RANGE;
    const y = (Math.random() * 2 - 1) * Y_RANGE;
    const z = Z_MIN + Math.random() * (Z_MAX - Z_MIN);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const depthNorm = (z - Z_MIN) / (Z_MAX - Z_MIN);
    const color = Math.random() < 0.8 ? EMERALD : CYAN;
    const opacity = lerp(MIN_OPACITY, MAX_OPACITY, depthNorm);
    colors[i * 3] = color.r * opacity;
    colors[i * 3 + 1] = color.g * opacity;
    colors[i * 3 + 2] = color.b * opacity;

    velocities[i] = MIN_VELOCITY + Math.random() * (MAX_VELOCITY - MIN_VELOCITY);
  }

  return { positions, colors, velocities };
}

interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
  velocities: Float32Array;
}

function Particles({
  contentLocal,
  warp,
  data,
  hoveredNodeRef,
}: {
  contentLocal: MotionValue<number>;
  warp: boolean;
  data: ParticleData;
  hoveredNodeRef?: MutableRefObject<HoveredNodeData>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors, velocities } = data;
  const velocitiesRef = useRef(velocities);
  const currentSize = useRef(DEFAULT_SIZE);
  const currentSpeed = useRef(SPEED_MIN);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const progress = contentLocal.get();
    const baseSpeed = lerp(SPEED_MIN, SPEED_MAX, progress);

    const targetSpeed = warp ? WARP_SPEED : baseSpeed;
    const targetSize = warp ? WARP_SIZE : DEFAULT_SIZE;
    currentSpeed.current = lerp(currentSpeed.current, targetSpeed, WARP_LERP);
    currentSize.current = lerp(currentSize.current, targetSize, WARP_LERP);

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.size = currentSize.current;

    const hovered = hoveredNodeRef?.current;
    const hasAttraction = hovered?.position != null;
    let attractX = 0;
    let attractY = 0;
    let attractionMult = 0;

    if (hasAttraction && hovered.position) {
      attractX = hovered.position.x;
      attractY = hovered.position.y;
      const elapsed = performance.now() - hovered.startTime;
      attractionMult = Math.max(0, 1 - elapsed / ATTRACTION_DECAY_MS);
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] += velocitiesRef.current[i] * currentSpeed.current * delta;

      if (hasAttraction && attractionMult > 0) {
        const px = arr[i * 3];
        const py = arr[i * 3 + 1];
        const dx = attractX - px;
        const dy = attractY - py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ATTRACTION_RADIUS && dist > 0.1) {
          const falloff = 1 - dist / ATTRACTION_RADIUS;
          const force = ATTRACTION_STRENGTH * falloff * attractionMult * delta;
          arr[i * 3] += (dx / dist) * force;
          arr[i * 3 + 1] += (dy / dist) * force;
        }
      }

      if (arr[i * 3] > X_RANGE) {
        arr[i * 3] = -X_RANGE;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        transparent
        depthWrite={false}
        sizeAttenuation={false}
        size={DEFAULT_SIZE}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const GRID_COLS = Math.ceil((X_RANGE * 2) / GRID_CELL_SIZE);
const GRID_ROWS = Math.ceil((Y_RANGE * 2) / GRID_CELL_SIZE);

function ConstellationLines({ data }: { data: ParticleData }) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const buffers = useMemo(() => {
    const linePositions = new Float32Array(MAX_LINE_SEGMENTS * 2 * 3);
    const lineColors = new Float32Array(MAX_LINE_SEGMENTS * 2 * 3);
    const grid: number[][] = new Array(GRID_COLS * GRID_ROWS);
    for (let i = 0; i < grid.length; i++) grid[i] = [];
    return { linePositions, lineColors, grid };
  }, []);

  useFrame(() => {
    if (!lineRef.current) return;

    const { positions, colors } = data;
    const { linePositions, lineColors, grid } = buffers;

    for (let i = 0; i < grid.length; i++) grid[i].length = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const col = Math.floor((x + X_RANGE) / GRID_CELL_SIZE);
      const row = Math.floor((y + Y_RANGE) / GRID_CELL_SIZE);
      const clampedCol = Math.max(0, Math.min(GRID_COLS - 1, col));
      const clampedRow = Math.max(0, Math.min(GRID_ROWS - 1, row));
      grid[clampedRow * GRID_COLS + clampedCol].push(i);
    }

    const connectionCounts = new Uint8Array(PARTICLE_COUNT);
    let segmentCount = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (connectionCounts[i] >= CONNECTION_MAX) continue;

      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const col = Math.floor((x + X_RANGE) / GRID_CELL_SIZE);
      const row = Math.floor((y + Y_RANGE) / GRID_CELL_SIZE);
      const clampedCol = Math.max(0, Math.min(GRID_COLS - 1, col));
      const clampedRow = Math.max(0, Math.min(GRID_ROWS - 1, row));

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = clampedRow + dr;
          const nc = clampedCol + dc;
          if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS) continue;

          const cell = grid[nr * GRID_COLS + nc];
          for (let k = 0; k < cell.length; k++) {
            const j = cell[k];
            if (j <= i) continue;
            if (connectionCounts[i] >= CONNECTION_MAX) break;
            if (connectionCounts[j] >= CONNECTION_MAX) continue;

            const dx = positions[j * 3] - x;
            const dy = positions[j * 3 + 1] - y;
            const dz = positions[j * 3 + 2] - z;
            const distSq = dx * dx + dy * dy + dz * dz;
            const maxDistSq = CONNECTION_DISTANCE * CONNECTION_DISTANCE;

            if (distSq < maxDistSq) {
              const dist = Math.sqrt(distSq);
              const t = dist / CONNECTION_DISTANCE;
              const opacity = lerp(CONNECTION_OPACITY_MAX, CONNECTION_OPACITY_MIN, t) * (1 - t);

              const idx = segmentCount * 6;
              linePositions[idx] = x;
              linePositions[idx + 1] = y;
              linePositions[idx + 2] = z;
              linePositions[idx + 3] = positions[j * 3];
              linePositions[idx + 4] = positions[j * 3 + 1];
              linePositions[idx + 5] = positions[j * 3 + 2];

              const scale = opacity / CONNECTION_OPACITY_MAX;
              lineColors[idx] = colors[i * 3] * scale;
              lineColors[idx + 1] = colors[i * 3 + 1] * scale;
              lineColors[idx + 2] = colors[i * 3 + 2] * scale;
              lineColors[idx + 3] = colors[j * 3] * scale;
              lineColors[idx + 4] = colors[j * 3 + 1] * scale;
              lineColors[idx + 5] = colors[j * 3 + 2] * scale;

              connectionCounts[i]++;
              connectionCounts[j]++;
              segmentCount++;

              if (segmentCount >= MAX_LINE_SEGMENTS) break;
            }
          }
          if (segmentCount >= MAX_LINE_SEGMENTS) break;
          if (connectionCounts[i] >= CONNECTION_MAX) break;
        }
        if (segmentCount >= MAX_LINE_SEGMENTS) break;
        if (connectionCounts[i] >= CONNECTION_MAX) break;
      }
      if (segmentCount >= MAX_LINE_SEGMENTS) break;
    }

    const geom = lineRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const colAttr = geom.attributes.color as THREE.BufferAttribute;

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    geom.setDrawRange(0, segmentCount * 2);
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[buffers.linePositions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[buffers.lineColors, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

interface AtomDef {
  x: number;
  y: number;
  z: number;
  orbitRadius: number;
  rotationSpeed: number;
  electronCount: 1 | 2;
  electronPhases: number[];
  electronSpeed: number;
  color: THREE.Color;
  nucleusOpacity: number;
}

function getAtomCount(): number {
  const w = window.innerWidth;
  for (const [breakpoint, count] of ATOM_BREAKPOINTS) {
    if (w >= breakpoint) return count;
  }
  return 3;
}

function buildAtomDefs(count: number): AtomDef[] {
  const cols = Math.ceil(Math.sqrt(count * (X_RANGE / Y_RANGE)));
  const rows = Math.ceil(count / cols);
  const cellW = (X_RANGE * 2) / cols;
  const cellH = (Y_RANGE * 2) / rows;
  const atoms: AtomDef[] = [];

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = -X_RANGE + (col + 0.5) * cellW;
    const cy = -Y_RANGE + (row + 0.5) * cellH;
    const jitterX = (Math.random() - 0.5) * cellW * 0.7;
    const jitterY = (Math.random() - 0.5) * cellH * 0.7;

    atoms.push({
      x: cx + jitterX,
      y: cy + jitterY,
      z: ATOM_Z_MIN + Math.random() * (ATOM_Z_MAX - ATOM_Z_MIN),
      orbitRadius: ATOM_ORBIT_MIN + Math.random() * (ATOM_ORBIT_MAX - ATOM_ORBIT_MIN),
      rotationSpeed: ATOM_ROTATION_MIN + Math.random() * (ATOM_ROTATION_MAX - ATOM_ROTATION_MIN),
      electronCount: Math.random() < 0.5 ? 1 : 2,
      electronPhases: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
      electronSpeed: 0.8 + Math.random() * 0.4,
      color: Math.random() < 0.8 ? EMERALD : CYAN,
      nucleusOpacity: ATOM_NUCLEUS_OPACITY_MIN + Math.random() * (ATOM_NUCLEUS_OPACITY_MAX - ATOM_NUCLEUS_OPACITY_MIN),
    });
  }
  return atoms;
}

function Atom({ def, contentLocal, warp }: { def: AtomDef; contentLocal: MotionValue<number>; warp: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const electronsRef = useRef<THREE.Points>(null);
  const nucleusRef = useRef<THREE.Points>(null);
  const ringMatRef = useRef<THREE.LineBasicMaterial>(null);
  const elapsed = useRef(0);
  const currentElectronMult = useRef(1);
  const opacityPulse = useRef(0);
  const wasWarping = useRef(false);

  const orbitGeom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
      const angle = (i / ORBIT_SEGMENTS) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * def.orbitRadius, Math.sin(angle) * def.orbitRadius, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [def.orbitRadius]);

  const electronPositions = useMemo(
    () => new Float32Array(def.electronCount * 3),
    [def.electronCount],
  );

  const ringColor = useMemo(() => {
    const c = def.color.clone();
    return new THREE.Color(c.r * ATOM_RING_OPACITY, c.g * ATOM_RING_OPACITY, c.b * ATOM_RING_OPACITY);
  }, [def.color]);

  const nucleusColor = useMemo(() => {
    const c = def.color.clone();
    return new THREE.Color(c.r * def.nucleusOpacity, c.g * def.nucleusOpacity, c.b * def.nucleusOpacity);
  }, [def.color, def.nucleusOpacity]);

  const electronColor = useMemo(() => {
    const c = def.color.clone();
    return new THREE.Color(c.r * ATOM_ELECTRON_OPACITY, c.g * ATOM_ELECTRON_OPACITY, c.b * ATOM_ELECTRON_OPACITY);
  }, [def.color]);

  useFrame((_, delta) => {
    if (!groupRef.current || !electronsRef.current) return;

    if (warp && !wasWarping.current) {
      opacityPulse.current = ATOM_WARP_OPACITY_SPIKE - 1;
    }
    wasWarping.current = warp;

    const targetMult = warp ? ATOM_WARP_ELECTRON_MULT : 1;
    currentElectronMult.current = lerp(currentElectronMult.current, targetMult, WARP_LERP);

    if (opacityPulse.current > 0.01) {
      opacityPulse.current *= Math.exp(-ATOM_WARP_DECAY * delta);
    } else {
      opacityPulse.current = 0;
    }
    const opacityScale = 1 + opacityPulse.current;

    if (nucleusRef.current) {
      const nMat = nucleusRef.current.material as THREE.PointsMaterial;
      nMat.color.set(
        nucleusColor.r * opacityScale,
        nucleusColor.g * opacityScale,
        nucleusColor.b * opacityScale,
      );
    }
    if (ringMatRef.current) {
      ringMatRef.current.color.set(
        ringColor.r * opacityScale,
        ringColor.g * opacityScale,
        ringColor.b * opacityScale,
      );
    }
    const eMat = electronsRef.current.material as THREE.PointsMaterial;
    eMat.color.set(
      electronColor.r * opacityScale,
      electronColor.g * opacityScale,
      electronColor.b * opacityScale,
    );

    elapsed.current += delta * currentElectronMult.current;
    const progress = contentLocal.get();
    const baseSpeed = lerp(SPEED_MIN, SPEED_MAX, progress);
    const drift = baseSpeed * ATOM_DRIFT_FACTOR * delta;
    groupRef.current.position.x += drift;
    if (groupRef.current.position.x > X_RANGE + 1) {
      groupRef.current.position.x = -X_RANGE - 1;
    }

    groupRef.current.rotation.z += def.rotationSpeed * delta;

    for (let e = 0; e < def.electronCount; e++) {
      const angle = elapsed.current * def.electronSpeed + def.electronPhases[e];
      electronPositions[e * 3] = Math.cos(angle) * def.orbitRadius;
      electronPositions[e * 3 + 1] = Math.sin(angle) * def.orbitRadius;
      electronPositions[e * 3 + 2] = 0;
    }
    const posAttr = electronsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[def.x, def.y, def.z]}>
      <points ref={nucleusRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0]), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={nucleusColor}
          transparent
          depthWrite={false}
          sizeAttenuation={false}
          size={4}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <line>
        <primitive object={orbitGeom} attach="geometry" />
        <lineBasicMaterial
          ref={ringMatRef}
          color={ringColor}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </line>

      <points ref={electronsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[electronPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={electronColor}
          transparent
          depthWrite={false}
          sizeAttenuation={false}
          size={2}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function Atoms({ contentLocal, warp }: { contentLocal: MotionValue<number>; warp: boolean }) {
  const atomDefs = useMemo(() => {
    const count = getAtomCount();
    return buildAtomDefs(count);
  }, []);

  return (
    <group>
      {atomDefs.map((def, i) => (
        <Atom key={i} def={def} contentLocal={contentLocal} warp={warp} />
      ))}
    </group>
  );
}

function CameraController() {
  const { camera } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });

  const onPointerMove = useCallback((e: PointerEvent) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    const maxRad = (CAMERA_TILT_DEG * Math.PI) / 180;
    targetRotation.current.x = -ny * maxRad;
    targetRotation.current.y = nx * maxRad;
  }, []);

  const onPointerLeave = useCallback(() => {
    targetRotation.current.x = 0;
    targetRotation.current.y = 0;
  }, []);

  useFrame(() => {
    camera.rotation.x +=
      (targetRotation.current.x - camera.rotation.x) * CAMERA_LERP;
    camera.rotation.y +=
      (targetRotation.current.y - camera.rotation.y) * CAMERA_LERP;
  });

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [onPointerMove, onPointerLeave]);

  return null;
}

export default function WorkflowParticlesCanvas({
  contentLocal,
  warp = false,
  hoveredNodeRef,
}: {
  contentLocal: MotionValue<number>;
  warp?: boolean;
  hoveredNodeRef?: MutableRefObject<HoveredNodeData>;
}) {
  const particleData = useMemo(buildParticleData, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      gl={{ antialias: false, alpha: true }}
      dpr={[1, 1.5]}
    >
      <Atoms contentLocal={contentLocal} warp={warp} />
      <Particles contentLocal={contentLocal} warp={warp} data={particleData} hoveredNodeRef={hoveredNodeRef} />
      <ConstellationLines data={particleData} />
      <CameraController />
    </Canvas>
  );
}
