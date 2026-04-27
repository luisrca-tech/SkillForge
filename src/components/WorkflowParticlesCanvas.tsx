import { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

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

const CONNECTION_DISTANCE = 1.2;
const CONNECTION_MAX = 3;
const CONNECTION_OPACITY_MAX = 0.12;
const CONNECTION_OPACITY_MIN = 0.06;
const MAX_LINE_SEGMENTS = PARTICLE_COUNT * CONNECTION_MAX;
const GRID_CELL_SIZE = CONNECTION_DISTANCE;

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
}: {
  contentLocal: MotionValue<number>;
  warp: boolean;
  data: ParticleData;
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

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] += velocitiesRef.current[i] * currentSpeed.current * delta;
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
}: {
  contentLocal: MotionValue<number>;
  warp?: boolean;
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
      <Particles contentLocal={contentLocal} warp={warp} data={particleData} />
      <ConstellationLines data={particleData} />
      <CameraController />
    </Canvas>
  );
}
