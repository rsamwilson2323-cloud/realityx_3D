import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Grid, Lightformer, OrbitControls, PointerLockControls, Sky, TransformControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useWorld, type WorldObject } from "@/lib/world-store";

function Shape({ o }: { o: WorldObject }) {
  const mat = <meshStandardMaterial color={o.color} metalness={o.metalness} roughness={o.roughness} />;
  switch (o.type) {
    case "box": return <mesh castShadow receiveShadow><boxGeometry args={[2, 2, 2]} />{mat}</mesh>;
    case "sphere": return <mesh castShadow><sphereGeometry args={[1, 32, 32]} />{mat}</mesh>;
    case "cylinder": return <mesh castShadow><cylinderGeometry args={[1, 1, 2, 32]} />{mat}</mesh>;
    case "cone": return <mesh castShadow><coneGeometry args={[1, 2, 32]} />{mat}</mesh>;
    case "torus": return <mesh castShadow><torusGeometry args={[0.8, 0.3, 16, 48]} />{mat}</mesh>;
    case "tree": return (<group>
      <mesh castShadow position={[0, 1, 0]}><cylinderGeometry args={[0.2, 0.3, 2, 8]} /><meshStandardMaterial color="#6b4a2f" roughness={0.9} /></mesh>
      <mesh castShadow position={[0, 2.6, 0]}><coneGeometry args={[1.4, 2.4, 8]} />{mat}</mesh>
      <mesh castShadow position={[0, 3.6, 0]}><coneGeometry args={[1, 1.8, 8]} />{mat}</mesh>
    </group>);
    case "rock": return <mesh castShadow position={[0, 0.5, 0]} scale={[1.3, 0.8, 1]}><dodecahedronGeometry args={[0.9, 0]} /><meshStandardMaterial color={o.color} roughness={1} flatShading /></mesh>;
    case "house": return (<group>
      <mesh castShadow receiveShadow position={[0, 1.25, 0]}><boxGeometry args={[4, 2.5, 3.5]} />{mat}</mesh>
      <mesh castShadow position={[0, 3.2, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[3.3, 1.6, 4]} /><meshStandardMaterial color="#8a3b2e" roughness={0.8} /></mesh>
      <mesh position={[0, 0.8, 1.76]}><boxGeometry args={[0.9, 1.6, 0.05]} /><meshStandardMaterial color="#3b2a1f" /></mesh>
    </group>);
    case "character": return (<group>
      <mesh castShadow position={[0, 0.9, 0]}><capsuleGeometry args={[0.35, 0.8, 8, 16]} />{mat}</mesh>
      <mesh castShadow position={[0, 1.75, 0]}><sphereGeometry args={[0.28, 24, 24]} /><meshStandardMaterial color="#f1c7a3" /></mesh>
    </group>);
    case "lamp": return (<group>
      <mesh castShadow position={[0, 1.5, 0]}><cylinderGeometry args={[0.06, 0.08, 3, 8]} /><meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, 3.1, 0]}><sphereGeometry args={[0.25, 16, 16]} /><meshStandardMaterial color={o.color} emissive={o.color} emissiveIntensity={2} /></mesh>
      <pointLight position={[0, 3.1, 0]} color={o.color} intensity={8} distance={10} />
    </group>);
    case "pyramid": return <mesh castShadow position={[0, 1, 0]} rotation-y={Math.PI / 4}><coneGeometry args={[1.4, 2, 4]} />{mat}</mesh>;
    case "capsule": return <mesh castShadow><capsuleGeometry args={[0.5, 1, 8, 16]} />{mat}</mesh>;
    case "gem": return <mesh castShadow><octahedronGeometry args={[0.9, 0]} /><meshStandardMaterial color={o.color} metalness={0.3} roughness={0.1} flatShading /></mesh>;
    case "wall": return <mesh castShadow receiveShadow position={[0, 1.5, 0]}><boxGeometry args={[4, 3, 0.3]} />{mat}</mesh>;
    case "stairs": return (<group>{[0, 1, 2, 3, 4].map((i) => <mesh key={i} castShadow receiveShadow position={[0, 0.2 + i * 0.4, -i * 0.5]}><boxGeometry args={[2, 0.4, 0.5]} />{mat}</mesh>)}</group>);
    case "fence": return (<group>
      {[-1.5, -0.5, 0.5, 1.5].map((x) => <mesh key={x} castShadow position={[x, 0.6, 0]}><boxGeometry args={[0.15, 1.2, 0.15]} />{mat}</mesh>)}
      {[0.4, 0.9].map((y) => <mesh key={y} castShadow position={[0, y, 0]}><boxGeometry args={[3.4, 0.12, 0.08]} />{mat}</mesh>)}
    </group>);
    case "bush": return (<group>
      <mesh castShadow position={[0, 0.6, 0]}><icosahedronGeometry args={[0.8, 1]} /><meshStandardMaterial color={o.color} roughness={1} flatShading /></mesh>
      <mesh castShadow position={[0.6, 0.45, 0.2]}><icosahedronGeometry args={[0.55, 1]} /><meshStandardMaterial color={o.color} roughness={1} flatShading /></mesh>
      <mesh castShadow position={[-0.55, 0.4, -0.1]}><icosahedronGeometry args={[0.5, 1]} /><meshStandardMaterial color={o.color} roughness={1} flatShading /></mesh>
    </group>);
    case "pillar": return (<group>
      <mesh castShadow position={[0, 0.15, 0]}><boxGeometry args={[1.2, 0.3, 1.2]} />{mat}</mesh>
      <mesh castShadow position={[0, 2, 0]}><cylinderGeometry args={[0.4, 0.45, 3.4, 16]} />{mat}</mesh>
      <mesh castShadow position={[0, 3.85, 0]}><boxGeometry args={[1.2, 0.3, 1.2]} />{mat}</mesh>
    </group>);
    case "crate": return (<group>
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}><boxGeometry args={[1.2, 1.2, 1.2]} />{mat}</mesh>
      <mesh position={[0, 0.6, 0]}><boxGeometry args={[1.25, 0.15, 1.25]} /><meshStandardMaterial color="#5e4128" /></mesh>
    </group>);
    case "bench": return (<group>
      <mesh castShadow position={[0, 0.5, 0]}><boxGeometry args={[2, 0.12, 0.6]} />{mat}</mesh>
      <mesh castShadow position={[0, 0.9, -0.27]}><boxGeometry args={[2, 0.5, 0.08]} />{mat}</mesh>
      {[-0.85, 0.85].map((x) => <mesh key={x} castShadow position={[x, 0.25, 0]}><boxGeometry args={[0.1, 0.5, 0.5]} /><meshStandardMaterial color="#333" metalness={0.7} roughness={0.4} /></mesh>)}
    </group>);
    case "car": return (<group>
      <mesh castShadow position={[0, 0.55, 0]}><boxGeometry args={[3.2, 0.6, 1.5]} />{mat}</mesh>
      <mesh castShadow position={[-0.2, 1.1, 0]}><boxGeometry args={[1.7, 0.55, 1.35]} /><meshStandardMaterial color="#9ec6e0" metalness={0.5} roughness={0.15} /></mesh>
      {([[-1, 0.75], [1, 0.75], [-1, -0.75], [1, -0.75]] as const).map(([x, z]) => <mesh key={`${x}${z}`} castShadow position={[x, 0.32, z]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.32, 0.32, 0.25, 16]} /><meshStandardMaterial color="#1c1c1c" /></mesh>)}
    </group>);
    case "flower": return (<group>
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.03, 0.03, 0.8, 6]} /><meshStandardMaterial color="#3f8f4a" /></mesh>
      {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[Math.cos(i * 1.256) * 0.15, 0.82, Math.sin(i * 1.256) * 0.15]}><sphereGeometry args={[0.12, 10, 10]} />{mat}</mesh>)}
      <mesh position={[0, 0.84, 0]}><sphereGeometry args={[0.09, 10, 10]} /><meshStandardMaterial color="#f5d142" /></mesh>
    </group>);
  }
}

function Obj({ o }: { o: WorldObject }) {
  const ref = useRef<THREE.Group>(null!);
  const [ready, setReady] = useState(false);
  const { selectedId, tool, mode, select, update, commit } = useWorld();
  const selected = selectedId === o.id && mode === "edit";
  useEffect(() => setReady(true), []);
  return (
    <>
      <group ref={ref} position={o.position} rotation={o.rotation} scale={o.scale}
        onClick={(e) => { if (mode !== "edit") return; e.stopPropagation(); select(o.id); }}>
        <Shape o={o} />
        {selected && <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[1.4, 1.55, 48]} /><meshBasicMaterial color="#8b7bff" /></mesh>}
      </group>
      {selected && ready && tool !== "select" && (
        <TransformControls object={ref.current} mode={tool}
          onMouseDown={() => commit()}
          onMouseUp={() => {
            const g = ref.current;
            update(o.id, { position: g.position.toArray() as any, rotation: [g.rotation.x, g.rotation.y, g.rotation.z], scale: g.scale.toArray() as any }, false);
          }} />
      )}
    </>
  );
}

function Walker() {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    camera.position.set(0, 1.7, 12);
    const d = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const u = (e: KeyboardEvent) => (keys.current[e.code] = false);
    addEventListener("keydown", d); addEventListener("keyup", u);
    return () => { removeEventListener("keydown", d); removeEventListener("keyup", u); };
  }, [camera]);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05), k = keys.current, sp = (k["ShiftLeft"] ? 10 : 5) * dt;
    const f = new THREE.Vector3(); camera.getWorldDirection(f); f.y = 0; f.normalize();
    const r = new THREE.Vector3().crossVectors(f, camera.up).normalize();
    if (k["KeyW"]) camera.position.addScaledVector(f, sp);
    if (k["KeyS"]) camera.position.addScaledVector(f, -sp);
    if (k["KeyD"]) camera.position.addScaledVector(r, sp);
    if (k["KeyA"]) camera.position.addScaledVector(r, -sp);
    camera.position.y = 1.7;
  });
  return <PointerLockControls />;
}

function World() {
  const { objects, env, mode, select } = useWorld();
  const sun = useMemo(() => {
    const a = ((env.timeOfDay - 6) / 12) * Math.PI;
    return new THREE.Vector3(Math.cos(a) * 40, Math.max(Math.sin(a) * 40, -5), 15);
  }, [env.timeOfDay]);
  const day = Math.max(0.05, Math.sin(((env.timeOfDay - 6) / 12) * Math.PI));
  const fogColor = new THREE.Color().setHSL(0.58, 0.4, 0.15 + day * 0.6);
  return (
    <>
      <Sky sunPosition={sun} turbidity={6} rayleigh={day < 0.2 ? 0.3 : 1.5} />
      {env.fog && <fogExp2 attach="fog" args={[fogColor, env.fogDensity]} />}
      <ambientLight intensity={0.25 + day * 0.35} />
      <hemisphereLight args={["#bcd7ff", env.ground, 0.4 * day + 0.1]} />
      <directionalLight position={sun} intensity={env.sunIntensity * day} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} />
      <Environment resolution={64}>
        <Lightformer intensity={1.5} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={0.8} color="#8bb" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <mesh rotation-x={-Math.PI / 2} receiveShadow onClick={() => mode === "edit" && select(null)}>
        <planeGeometry args={[env.groundSize, env.groundSize]} />
        <meshStandardMaterial color={env.ground} roughness={1} />
      </mesh>
      {env.showGrid && mode === "edit" && <Grid position={[0, 0.01, 0]} args={[env.groundSize, env.groundSize]} cellColor="#ffffff" sectionColor="#8b7bff" cellThickness={0.4} sectionThickness={0.8} fadeDistance={60} infiniteGrid={false} cellSize={1} sectionSize={5} />}
      {objects.map((o) => <Obj key={o.id} o={o} />)}
      {mode === "edit" ? <OrbitControls makeDefault zoomToCursor screenSpacePanning={false} enableDamping dampingFactor={0.12} minDistance={2} maxDistance={250} maxPolarAngle={Math.PI / 2.05} mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.PAN }} /> : <Walker />}
    </>
  );
}

export function Viewport() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [14, 12, 18], fov: 55 }} gl={{ preserveDrawingBuffer: true }}>
      <World />
    </Canvas>
  );
}
