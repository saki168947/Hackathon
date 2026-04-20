import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  Color,
  FogExp2,
  MathUtils,
  Vector3
} from "three";
import { useEffect, useMemo, useRef } from "react";

const CHAPTER_X = [0, 8, 16, 24, 32];
const MAX_INDEX = CHAPTER_X.length - 1;

const CAMERA_PATH = new CatmullRomCurve3([
  new Vector3(-1.8, 0.42, 7.0),
  new Vector3(2.4, 0.88, 6.25),
  new Vector3(7.6, 0.54, 5.72),
  new Vector3(11.8, -0.08, 5.18),
  new Vector3(16.2, 0.12, 4.88),
  new Vector3(20.5, 0.92, 5.12),
  new Vector3(25.1, 0.62, 5.42),
  new Vector3(29.2, 0.28, 5.06),
  new Vector3(33.8, 0.16, 4.86)
], false, "centripetal", 0.45);

const TARGET_PATH = new CatmullRomCurve3([
  new Vector3(0.2, 0.14, 0),
  new Vector3(3.1, 0.2, 0),
  new Vector3(8.2, 0.16, 0),
  new Vector3(12.2, 0.02, 0),
  new Vector3(16.3, 0.04, 0),
  new Vector3(20.8, 0.18, 0),
  new Vector3(24.5, 0.24, 0),
  new Vector3(28.4, 0.12, 0),
  new Vector3(32.2, 0.06, 0)
], false, "centripetal", 0.45);

const CHAPTER_META = [
  { beamScale: 1.06, beamTilt: 0.03, energy: 0.95, ringOpacity: 0.08, structure: 0.34 },
  { beamScale: 0.88, beamTilt: -0.06, energy: 0.72, ringOpacity: 0.04, structure: 0.22 },
  { beamScale: 0.68, beamTilt: -0.02, energy: 0.56, ringOpacity: 0.1, structure: 0.2 },
  { beamScale: 0.82, beamTilt: 0.08, energy: 0.62, ringOpacity: 0.06, structure: 0.18 },
  { beamScale: 0.58, beamTilt: 0.12, energy: 0.5, ringOpacity: 0.03, structure: 0.12 }
];

function chapterSample(progress) {
  const clamped = Math.max(0, Math.min(MAX_INDEX, progress));
  const startIndex = Math.floor(clamped);
  const endIndex = Math.min(MAX_INDEX, startIndex + 1);
  const alpha = clamped - startIndex;
  const start = CHAPTER_META[startIndex];
  const end = CHAPTER_META[endIndex];

  return {
    beamScale: MathUtils.lerp(start.beamScale, end.beamScale, alpha),
    beamTilt: MathUtils.lerp(start.beamTilt, end.beamTilt, alpha),
    energy: MathUtils.lerp(start.energy, end.energy, alpha),
    ringOpacity: MathUtils.lerp(start.ringOpacity, end.ringOpacity, alpha),
    structure: MathUtils.lerp(start.structure, end.structure, alpha)
  };
}

function BeamSystem({ pointer, reducedMotion, progressRef, beamWorldRef, beamStateRef }) {
  const rootRef = useRef();
  const coreRef = useRef();
  const auraRef = useRef();

  useFrame((state, delta) => {
    if (!rootRef.current || !coreRef.current || !auraRef.current) return;

    const t = state.clock.getElapsedTime();
    const progress = progressRef.current;
    const chapter = chapterSample(progress);
    const px = pointer.current.x;
    const py = pointer.current.y;
    const x = MathUtils.lerp(CHAPTER_X[0], CHAPTER_X[MAX_INDEX], progress / MAX_INDEX);

    // Pointer now drives the beam tilt & offset — this IS the light-field response
    const pointerTiltZ = chapter.beamTilt + px * 0.18;
    const pointerTiltY = chapter.beamTilt * 0.5 + px * 0.12;
    const pointerOffsetY = py * 0.35;

    rootRef.current.position.x = MathUtils.damp(rootRef.current.position.x, x, 3.8, delta);
    rootRef.current.position.y = MathUtils.damp(rootRef.current.position.y, 0.16 + pointerOffsetY, 4.2, delta);
    rootRef.current.rotation.y = MathUtils.damp(rootRef.current.rotation.y, pointerTiltY, 4.1, delta);
    rootRef.current.rotation.x = 0;
    rootRef.current.rotation.z = MathUtils.damp(
      rootRef.current.rotation.z,
      pointerTiltZ,
      4.1,
      delta
    );

    const pulse = reducedMotion ? 0 : Math.sin(t * 2.2) * 0.05;
    // Pointer magnitude modulates beam scale slightly
    const pointerMag = Math.sqrt(px * px + py * py);
    const nextScale = chapter.beamScale + pulse + pointerMag * 0.12;
    coreRef.current.scale.y = MathUtils.damp(coreRef.current.scale.y, nextScale, 5, delta);
    auraRef.current.scale.y = MathUtils.damp(auraRef.current.scale.y, nextScale * 1.08, 5, delta);
    auraRef.current.material.opacity = MathUtils.damp(
      auraRef.current.material.opacity,
      0.08 + chapter.energy * 0.08 + pointerMag * 0.06,
      4,
      delta
    );

    if (beamWorldRef) {
      coreRef.current.getWorldPosition(beamWorldRef.current);
      beamWorldRef.current.x += Math.cos(rootRef.current.rotation.z) * 4.35;
      beamWorldRef.current.y += Math.sin(rootRef.current.rotation.z) * 4.6 + 0.18;
    }
    if (beamStateRef) {
      beamStateRef.current.angle = rootRef.current.rotation.z;
      beamStateRef.current.intensity = chapter.energy + pointerMag * 0.15;
    }
  });

  return (
    <group ref={rootRef} position={[0, 0.16, 0]}>
      <mesh ref={auraRef} position={[0.25, 0.1, -0.12]} rotation={[0, 0, 0.08]}>
        <planeGeometry args={[9.8, 2.2]} />
        <meshBasicMaterial
          color="#efe5d0"
          transparent
          opacity={0.14}
          toneMapped={false}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={coreRef} position={[0.25, 0.08, 0]} rotation={[0, 0, 0.08]}>
        <planeGeometry args={[9.1, 0.52]} />
        <meshBasicMaterial
          color="#f7f4eb"
          transparent
          opacity={0.44}
          toneMapped={false}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.18, 0.08, -0.04]} rotation={[0, 0, 0.08]}>
        <planeGeometry args={[9.4, 1.12]} />
        <meshBasicMaterial
          color="#d8c7a2"
          transparent
          opacity={0.1}
          toneMapped={false}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function ChapterStructures({ progressRef }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const progress = progressRef.current;
    const chapter = chapterSample(progress);
    groupRef.current.children.forEach((child, index) => {
      const distance = Math.abs(progress - index);
      const emphasis = Math.max(0, 1 - distance * 0.8);
      child.scale.z = MathUtils.damp(child.scale.z, 0.8 + emphasis * 0.6, 4.2, delta);
          child.position.y = MathUtils.damp(child.position.y, emphasis * 0.22, 4.2, delta);
          child.material.opacity = MathUtils.damp(child.material.opacity, chapter.structure * 0.5 + emphasis * 0.28, 4.2, delta);
          if (child.children.length > 0) {
            child.children[0].material.opacity = MathUtils.damp(child.children[0].material.opacity, chapter.structure * 0.85 + emphasis * 0.42, 4.2, delta);
          }
        });
  });

  return (
    <group ref={groupRef}>
      {CHAPTER_X.map((x, index) => (
        <mesh key={x} position={[x, 0, -0.8 + (index % 2 === 0 ? -0.18 : 0.08)]}>
          <boxGeometry args={[2.6, 3.4, 0.12]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? "#1e222b" : "#171a21"}
            transparent
            opacity={0.24}
            roughness={0.92}
            metalness={0.04}
          />
          <mesh position={[0, -1.6, 0.08]}>
            <planeGeometry args={[2.4, 0.04]} />
            <meshBasicMaterial color="#d8c7a2" transparent opacity={0.34} blending={AdditiveBlending} />
          </mesh>
        </mesh>
      ))}
      {CHAPTER_X.map((x, index) => (
        <mesh key={`line-${x}`} position={[x + 1.15, 0.08, -0.45]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[4.2, 0.02]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? "#3b4046" : "#2b2e33"}
            transparent
            opacity={0.24}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function StagePlane({ progressRef }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;
    const x = MathUtils.lerp(CHAPTER_X[0], CHAPTER_X[MAX_INDEX], progressRef.current / MAX_INDEX);
    ref.current.position.x = MathUtils.damp(ref.current.position.x, x + 8, 3.8, delta);
  });

  return (
    <mesh ref={ref} position={[8, -2.55, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[48, 12]} />
      <meshStandardMaterial color="#070809" roughness={1} metalness={0} transparent opacity={0.72} />
    </mesh>
  );
}

function ParticleField({ pointer, reducedMotion, progressRef }) {
  const pointsRef = useRef();
  const matRef = useRef();
  const positions = useMemo(() => {
    const buffer = new Float32Array(320 * 3);
    for (let i = 0; i < 320; i += 1) {
      const i3 = i * 3;
      buffer[i3] = (Math.random() - 0.5) * 40;
      buffer[i3 + 1] = (Math.random() - 0.5) * 10;
      buffer[i3 + 2] = (Math.random() - 0.5) * 8;
    }
    return buffer;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const progress = progressRef.current;
    const px = pointer.current.x;
    const py = pointer.current.y;
    const pointerMag = Math.sqrt(px * px + py * py);

    // Pointer steers particle drift direction — light sculpting
    pointsRef.current.rotation.y = MathUtils.damp(
      pointsRef.current.rotation.y,
      px * 0.22 + progress * 0.06,
      2.8,
      delta
    );
    pointsRef.current.rotation.x = MathUtils.damp(
      pointsRef.current.rotation.x,
      py * 0.1,
      2.8,
      delta
    );
    pointsRef.current.position.y = Math.sin(t * 0.28) * 0.06;
    pointsRef.current.position.x = MathUtils.damp(
      pointsRef.current.position.x,
      16,
      2.8,
      delta
    );
    // Particles glow brighter near cursor
    if (matRef.current) {
      matRef.current.opacity = MathUtils.damp(
        matRef.current.opacity,
        0.5 + pointerMag * 0.35,
        4,
        delta
      );
      matRef.current.size = MathUtils.damp(
        matRef.current.size,
        0.03 + pointerMag * 0.018,
        4,
        delta
      );
    }
  });

  return (
    <points ref={pointsRef} position={[16, 0, -2.2]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={matRef} color="#dfd7c2" size={0.03} sizeAttenuation transparent opacity={0.6} blending={AdditiveBlending} />
    </points>
  );
}

function AtmosphereRings({ progressRef }) {
  const ringGroup = useRef();

  useFrame((state, delta) => {
    if (!ringGroup.current) return;
    const t = state.clock.getElapsedTime();
    const x = MathUtils.lerp(CHAPTER_X[0], CHAPTER_X[MAX_INDEX], progressRef.current / MAX_INDEX);
    const chapter = chapterSample(progressRef.current);
    ringGroup.current.position.x = MathUtils.damp(ringGroup.current.position.x, x * 0.85 + 2.4, 3.8, delta);
    ringGroup.current.rotation.z += delta * 0.12;
    ringGroup.current.position.y = Math.sin(t * 0.6) * 0.1;
    ringGroup.current.children.forEach((child, index) => {
      const base = index === 0 ? chapter.ringOpacity : chapter.ringOpacity * 0.72;
      child.material.opacity = MathUtils.damp(child.material.opacity, base, 4.2, delta);
    });
  });

  return (
    <group ref={ringGroup} position={[1.4, 0, -1.05]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.18, 96]} />
        <meshBasicMaterial color="#e5ce9e" transparent opacity={0.16} toneMapped={false} blending={AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.06]}>
        <ringGeometry args={[3.0, 3.05, 96]} />
        <meshBasicMaterial color="#b3a286" transparent opacity={0.12} toneMapped={false} blending={AdditiveBlending} />
      </mesh>
    </group>
  );
}

function FramingLines() {
  return (
    <group position={[16, 0, -2.8]}>
      <mesh position={[0, 2.6, 0]}>
        <planeGeometry args={[40, 0.01]} />
        <meshBasicMaterial color="#15171a" />
      </mesh>
      <mesh position={[0, -2.6, 0]}>
        <planeGeometry args={[40, 0.01]} />
        <meshBasicMaterial color="#101113" />
      </mesh>
    </group>
  );
}

function CSSBridge({ progressRef, beamWorldRef, beamStateRef }) {
  const { camera, size } = useThree();
  const projected = useRef(new Vector3());
  const smoothed = useRef({ x: 0.78, y: 0.22 });
  const lastValuesRef = useRef({
    beamX: "",
    beamY: "",
    beamAngle: "",
    beamIntensity: "",
    sceneProgress: "",
    viewportAspect: ""
  });

  useFrame(() => {
    projected.current.copy(beamWorldRef.current).project(camera);

    const rawX = (projected.current.x * 0.5 + 0.5);
    const rawY = (-projected.current.y * 0.5 + 0.5);
    const behind = projected.current.z > 1;
    const targetX = behind ? smoothed.current.x : MathUtils.clamp(rawX, -0.1, 1.1);
    const targetY = behind ? smoothed.current.y : MathUtils.clamp(rawY, -0.1, 1.1);

    smoothed.current.x += (targetX - smoothed.current.x) * 0.14;
    smoothed.current.y += (targetY - smoothed.current.y) * 0.14;

    const root = document.documentElement.style;
    const nextValues = {
      beamX: smoothed.current.x.toFixed(4),
      beamY: smoothed.current.y.toFixed(4),
      beamAngle: (beamStateRef.current.angle * (180 / Math.PI)).toFixed(3),
      beamIntensity: beamStateRef.current.intensity.toFixed(3),
      sceneProgress: (progressRef.current / MAX_INDEX).toFixed(4),
      viewportAspect: (size.width / Math.max(size.height, 1)).toFixed(3)
    };

    Object.entries(nextValues).forEach(([key, value]) => {
      if (lastValuesRef.current[key] === value) return;
      root.setProperty(`--${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`, value);
      lastValuesRef.current[key] = value;
    });
  });

  return null;
}

// Floating glow orb that follows pointer in 3D space — the cursor's "torch"
function PointerGlow({ pointer, reducedMotion, progressRef }) {
  const groupRef = useRef();
  const matRef = useRef();
  const lightRef = useRef();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const px = pointer.current.x;
    const py = pointer.current.y;
    const camX = MathUtils.lerp(CHAPTER_X[0], CHAPTER_X[MAX_INDEX], progressRef.current / MAX_INDEX);

    // Map pointer to a position in front of the camera
    const targetX = camX + px * 4.5;
    const targetY = 0.5 + py * 2.2;
    const targetZ = 3.2 + Math.abs(px) * 0.8;

    // Move the ENTIRE group so both mesh + pointLight follow together
    groupRef.current.position.x = MathUtils.damp(groupRef.current.position.x, targetX, 3.6, delta);
    groupRef.current.position.y = MathUtils.damp(groupRef.current.position.y, targetY, 3.6, delta);
    groupRef.current.position.z = MathUtils.damp(groupRef.current.position.z, targetZ, 3.6, delta);

    const pointerMag = Math.sqrt(px * px + py * py);
    if (matRef.current) {
      matRef.current.opacity = MathUtils.damp(matRef.current.opacity, 0.18 + pointerMag * 0.45, 4.5, delta);
    }
    if (lightRef.current) {
      lightRef.current.intensity = MathUtils.damp(lightRef.current.intensity, 0.3 + pointerMag * 0.8, 4.5, delta);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 3.2]}>
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial
          ref={matRef}
          color="#f5ecd4"
          transparent
          opacity={0.18}
          toneMapped={false}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        intensity={0.4}
        color="#efe5d0"
        distance={12}
        decay={2}
      />
    </group>
  );
}

function Scene({ pointer, reducedMotion, progressRef }) {
  const { scene, camera } = useThree();
  const beamWorldRef = useRef(new Vector3(0, 0.2, 0));
  const beamStateRef = useRef({ angle: 0, intensity: 0.8 });
  const keyLightRef = useRef();
  const fillLightRef = useRef();

  useEffect(() => {
    scene.background = new Color("#000000");
    scene.fog = new FogExp2("#000000", 0.03);
  }, [scene]);

  useFrame((_, delta) => {
    const normalized = progressRef.current / MAX_INDEX;
    const pathPoint = CAMERA_PATH.getPointAt(normalized);
    const targetPoint = TARGET_PATH.getPointAt(normalized);
    const px = pointer.current.x;
    const py = pointer.current.y;
    const pointerMag = Math.sqrt(px * px + py * py);

    // Camera: FIXED path only — no pointer offset
    camera.position.x = MathUtils.damp(camera.position.x, pathPoint.x, 3.2, delta);
    camera.position.y = MathUtils.damp(camera.position.y, pathPoint.y, 3.2, delta);
    camera.position.z = MathUtils.damp(camera.position.z, pathPoint.z, 3.2, delta);
    camera.lookAt(targetPoint.x, targetPoint.y, targetPoint.z);

    // Pointer-driven lighting: key light follows cursor direction
    if (keyLightRef.current) {
      const camX = MathUtils.lerp(CHAPTER_X[0], CHAPTER_X[MAX_INDEX], normalized);
      keyLightRef.current.position.x = MathUtils.damp(
        keyLightRef.current.position.x,
        camX + 2.8 + px * 3.5,
        3.5,
        delta
      );
      keyLightRef.current.position.y = MathUtils.damp(
        keyLightRef.current.position.y,
        1.5 + py * 1.8,
        3.5,
        delta
      );
      keyLightRef.current.intensity = MathUtils.damp(
        keyLightRef.current.intensity,
        0.42 + pointerMag * 0.35,
        4,
        delta
      );
    }

    // Fill light reacts inversely
    if (fillLightRef.current) {
      fillLightRef.current.intensity = MathUtils.damp(
        fillLightRef.current.intensity,
        0.12 + (1 - pointerMag) * 0.06,
        4,
        delta
      );
    }

    // Fog density subtly modulated by pointer proximity to center
    if (scene.fog) {
      scene.fog.density = MathUtils.damp(
        scene.fog.density,
        0.03 - pointerMag * 0.008,
        3,
        delta
      );
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.25, 6.8]} fov={34} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[4, 5, 4]} intensity={0.22} color="#f0e4c9" />
      <pointLight ref={keyLightRef} position={[2.8, 1.5, 1.6]} intensity={0.52} color="#e8dcc4" />
      <pointLight ref={fillLightRef} position={[16, -1.4, -1.2]} intensity={0.12} color="#8d8573" />
      <StagePlane progressRef={progressRef} />
      <BeamSystem
        pointer={pointer}
        reducedMotion={reducedMotion}
        progressRef={progressRef}
        beamWorldRef={beamWorldRef}
        beamStateRef={beamStateRef}
      />
      <ChapterStructures progressRef={progressRef} />
      <AtmosphereRings progressRef={progressRef} />
      <ParticleField pointer={pointer} reducedMotion={reducedMotion} progressRef={progressRef} />
      <PointerGlow pointer={pointer} reducedMotion={reducedMotion} progressRef={progressRef} />
      <FramingLines />
      <CSSBridge
        progressRef={progressRef}
        beamWorldRef={beamWorldRef}
        beamStateRef={beamStateRef}
      />
    </>
  );
}

export function HeroCanvas({ pointer, reducedMotion, progressRef }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ alpha: false, antialias: true, powerPreference: "high-performance", stencil: false }}
    >
      <Scene pointer={pointer} reducedMotion={reducedMotion} progressRef={progressRef} />
    </Canvas>
  );
}
