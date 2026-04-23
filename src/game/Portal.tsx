import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

// ─── constants ───────────────────────────────────────────────────────────────

const PORTAL_RADIUS = 0.72;
const PORTAL_TUBE = 0.09;
const TRIGGER_DIST = 0.65;

// Exit portal — in the doorway (north wall, door opening center)
const EXIT_POS: [number, number, number] = [2.8, 0.75, -5.0];
// Start portal — south area, visible when player spawns facing south
const START_POS: [number, number, number] = [0, 0.75, 4.5];

const EXIT_COLOR = new THREE.Color(0x00ff88);
const START_COLOR = new THREE.Color(0xff4040);

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeParticleGeo(color: THREE.Color, count = 80): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = PORTAL_RADIUS + (Math.random() - 0.5) * 0.25;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.sin(a) * r;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
    col[i * 3] = color.r + Math.random() * 0.2;
    col[i * 3 + 1] = color.g;
    col[i * 3 + 2] = color.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}

function makeLabelTexture(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 56;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.font = "bold 26px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 28);
  return new THREE.CanvasTexture(canvas);
}

function buildExitUrl(name: string): string {
  const url = new URL("https://vibejam.cc/portal/2026");
  url.searchParams.set("username", name);
  url.searchParams.set("color", "cyan");
  url.searchParams.set("speed", "3");
  url.searchParams.set("ref", window.location.hostname);
  return url.toString();
}

function buildReturnUrl(ref: string, name: string): string {
  const base = ref.startsWith("http") ? ref : `https://${ref}`;
  const url = new URL(base);
  url.searchParams.set("username", name);
  url.searchParams.set("color", "cyan");
  url.searchParams.set("speed", "3");
  url.searchParams.set("portal", "true");
  return url.toString();
}

// ─── single portal ring ───────────────────────────────────────────────────────

interface RingProps {
  position: [number, number, number];
  color: THREE.Color;
  label: string;
  particleGeo: THREE.BufferGeometry;
  particleRef: React.RefObject<THREE.BufferGeometry | null>;
}

function PortalRing({ position, color, label, particleGeo, particleRef }: RingProps) {
  const labelTex = useMemo(() => makeLabelTexture(label, `#${color.getHexString()}`), [label, color]);
  const hex = color.getHex();

  return (
    <group position={position}>
      {/* outer glow ring */}
      <mesh>
        <torusGeometry args={[PORTAL_RADIUS, PORTAL_TUBE + 0.025, 16, 64]} />
        <meshBasicMaterial color={hex} transparent opacity={0.25} />
      </mesh>
      {/* main ring */}
      <mesh>
        <torusGeometry args={[PORTAL_RADIUS, PORTAL_TUBE, 16, 64]} />
        <meshStandardMaterial color={hex} emissive={hex} emissiveIntensity={2} />
      </mesh>
      {/* inner fill */}
      <mesh>
        <circleGeometry args={[PORTAL_RADIUS - PORTAL_TUBE * 0.5, 48]} />
        <meshBasicMaterial color={hex} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      {/* particles */}
      <points>
        <primitive object={particleGeo} ref={particleRef} />
        <pointsMaterial size={0.022} vertexColors transparent opacity={0.75} />
      </points>
      {/* label above ring */}
      <mesh position={[0, PORTAL_RADIUS + 0.24, 0]}>
        <planeGeometry args={[1.9, 0.2]} />
        <meshBasicMaterial map={labelTex} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* ambient glow light */}
      <pointLight color={hex} intensity={0.9} distance={2.8} />
    </group>
  );
}

// ─── main export ─────────────────────────────────────────────────────────────

interface PortalProps {
  playerRef: React.MutableRefObject<{ x: number; z: number }>;
}

export function Portal({ playerRef }: PortalProps) {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const isPortalEntry = params.has("portal");
  const refUrl = params.get("ref") ?? "";

  const playerName = useGameStore((s) => s.playerName);
  const setPortalPrompt = useGameStore((s) => s.setPortalPrompt);

  const exitParticleGeo = useMemo(() => makeParticleGeo(EXIT_COLOR), []);
  const startParticleGeo = useMemo(
    () => (isPortalEntry ? makeParticleGeo(START_COLOR) : null),
    [isPortalEntry],
  );

  const exitParticleRef = useRef<THREE.BufferGeometry | null>(null);
  const startParticleRef = useRef<THREE.BufferGeometry | null>(null);
  const nearExitRef = useRef(false);
  const nearStartRef = useRef(false);

  useFrame(() => {
    const t = Date.now() * 0.001;

    if (exitParticleRef.current) {
      const arr = exitParticleRef.current.attributes.position.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) arr[i + 1] += 0.012 * Math.sin(t + i);
      exitParticleRef.current.attributes.position.needsUpdate = true;
    }
    if (startParticleRef.current) {
      const arr = startParticleRef.current.attributes.position.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) arr[i + 1] += 0.012 * Math.sin(t + i);
      startParticleRef.current.attributes.position.needsUpdate = true;
    }

    const px = playerRef.current.x;
    const pz = playerRef.current.z;

    // Exit portal proximity — show prompt on enter, clear on leave
    const exDx = px - EXIT_POS[0];
    const exDz = pz - EXIT_POS[2];
    const nearExit = Math.sqrt(exDx * exDx + exDz * exDz) < TRIGGER_DIST;
    if (nearExit && !nearExitRef.current) {
      nearExitRef.current = true;
      setPortalPrompt({ url: buildExitUrl(playerName || "player"), label: "✦ Vibe Jam Portal ✦" });
    } else if (!nearExit && nearExitRef.current) {
      nearExitRef.current = false;
      setPortalPrompt(null);
    }

    // Return portal proximity
    if (isPortalEntry && refUrl) {
      const stDx = px - START_POS[0];
      const stDz = pz - START_POS[2];
      const nearStart = Math.sqrt(stDx * stDx + stDz * stDz) < TRIGGER_DIST;
      if (nearStart && !nearStartRef.current) {
        nearStartRef.current = true;
        setPortalPrompt({ url: buildReturnUrl(refUrl, playerName || "player"), label: startLabel });
      } else if (!nearStart && nearStartRef.current) {
        nearStartRef.current = false;
        setPortalPrompt(null);
      }
    }
  });

  const startLabel = useMemo(() => {
    if (!refUrl) return "← Return";
    try {
      const base = refUrl.startsWith("http") ? refUrl : `https://${refUrl}`;
      return `← ${new URL(base).hostname}`;
    } catch {
      return "← Return";
    }
  }, [refUrl]);

  return (
    <>
      <PortalRing
        position={EXIT_POS}
        color={EXIT_COLOR}
        label="✦ VIBE JAM PORTAL ✦"
        particleGeo={exitParticleGeo}
        particleRef={exitParticleRef}
      />

      {isPortalEntry && startParticleGeo && (
        <PortalRing
          position={START_POS}
          color={START_COLOR}
          label={startLabel}
          particleGeo={startParticleGeo}
          particleRef={startParticleRef}
        />
      )}
    </>
  );
}
