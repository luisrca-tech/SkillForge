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
const CAMERA_TILT_DEG = 3;
const CAMERA_LERP = 0.05;

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

function Particles({ contentLocal }: { contentLocal: MotionValue<number> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors, velocities } = useMemo(buildParticleData, []);
  const velocitiesRef = useRef(velocities);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const progress = contentLocal.get();
    const speedMul = lerp(SPEED_MIN, SPEED_MAX, progress);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] += velocitiesRef.current[i] * speedMul * delta;
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
        size={4}
        blending={THREE.AdditiveBlending}
      />
    </points>
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
}: {
  contentLocal: MotionValue<number>;
}) {
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
      <Particles contentLocal={contentLocal} />
      <CameraController />
    </Canvas>
  );
}
