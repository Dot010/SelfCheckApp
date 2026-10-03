import { gsap } from "gsap";
import * as THREE from "three";

import { toppingColors } from "@/helpers/topping-visuals";

// A small three.js scene of an açaí bowl. Toppings drop in with GSAP when they
// are selected and fly off when removed; the bowl grows or shrinks with the size.

export interface BowlState {
  scale: number;
  toppings: string[];
}

export interface BowlScene {
  update: (state: BowlState) => void;
  dispose: () => void;
}

const R = 1.5; // açaí surface radius
const CY = 0.6; // height of the açaí surface centre
const SY = 0.42; // how domed the surface is

const surfaceY = (x: number, z: number) =>
  CY + SY * Math.sqrt(Math.max(0, 1 - (x * x + z * z) / (R * R)));

// Deterministic random numbers, so each topping lands in the same place every time.
const seeded = (seed: string) => {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

const scatter = (key: string, count: number, min: number, max: number) => {
  const random = seeded(key);
  return Array.from({ length: count }, () => {
    const angle = random() * Math.PI * 2;
    const radius = (min + random() * (max - min)) * R;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return { x, z, y: surfaceY(x, z), q: random() };
  });
};

const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

interface PieceData {
  restY: number;
  restScale: THREE.Vector3;
  restRotation: THREE.Euler;
}

export const createBowlScene = (
  container: HTMLElement,
  initial: BowlState,
): BowlScene | null => {
  if (!supportsWebGL()) return null;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.touchAction = "pan-y";
  renderer.domElement.style.cursor = "grab";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 5.2, 7.1);
  camera.lookAt(0, 0.35, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x7a5f8c, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(3, 6, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe9dcff, 0.9);
  rim.position.set(-4, 3, -3);
  scene.add(rim);

  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const material = (color: string | number, roughness = 0.6) => {
    const id = `${color}-${roughness}`;
    if (!materials.has(id)) {
      materials.set(
        id,
        track(new THREE.MeshStandardMaterial({ color, roughness })),
      );
    }
    return materials.get(id)!;
  };

  // Soft shadow under the bowl
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  gradient.addColorStop(0, "rgba(40,20,50,.35)");
  gradient.addColorStop(1, "rgba(40,20,50,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    track(new THREE.PlaneGeometry(4.6, 4.6)),
    track(
      new THREE.MeshBasicMaterial({
        map: track(new THREE.CanvasTexture(shadowCanvas)),
        transparent: true,
        depthWrite: false,
      }),
    ),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.67;
  scene.add(shadow);

  const root = new THREE.Group();
  scene.add(root);

  // Bowl: a lathe of the cross-section profile
  const profile = [
    [0, -0.36],
    [0.9, -0.31],
    [1.35, 0],
    [1.55, 0.45],
    [1.62, 0.74],
    [1.7, 0.8],
    [1.79, 0.74],
    [1.73, 0.4],
    [1.49, -0.06],
    [1.06, -0.45],
    [0.72, -0.55],
    [0.72, -0.67],
    [0, -0.67],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const bowlMaterial = track(
    new THREE.MeshStandardMaterial({
      color: "#B8E04A",
      roughness: 0.5,
      side: THREE.DoubleSide,
    }),
  );
  root.add(
    new THREE.Mesh(track(new THREE.LatheGeometry(profile, 72)), bowlMaterial),
  );
  const band = new THREE.Mesh(
    track(new THREE.TorusGeometry(1.66, 0.035, 8, 72)),
    material("#8FB82E"),
  );
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.28;
  root.add(band);

  // Açaí surface: a flattened, slightly wavy dome
  const acaiGeometry = track(
    new THREE.SphereGeometry(R, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2),
  );
  const positions = acaiGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const y = positions.getY(i);
    positions.setY(i, y + Math.sin(x * 5) * Math.cos(z * 4) * 0.03 * (y / R));
  }
  acaiGeometry.computeVertexNormals();
  const acai = new THREE.Mesh(acaiGeometry, material("#4A1D6A", 0.32));
  acai.scale.y = SY / R;
  acai.position.y = CY;
  const acaiPivot = new THREE.Group();
  acaiPivot.add(acai);
  root.add(acaiPivot);

  // Toppings, built once and shown or hidden
  const groups = new Map<string, THREE.Group>();
  const place = (
    group: THREE.Group,
    object: THREE.Object3D,
    point: { x: number; y: number; z: number },
    lift: number,
    rotation?: [number, number, number],
  ) => {
    object.position.set(point.x, point.y + lift, point.z);
    if (rotation) object.rotation.set(...rotation);
    object.userData = {
      restY: object.position.y,
      restScale: object.scale.clone(),
      restRotation: object.rotation.clone(),
    } satisfies PieceData;
    group.add(object);
  };
  const color = (topping: string) => toppingColors[topping] ?? "#ffffff";

  const buildTopping = (topping: string) => {
    const group = new THREE.Group();
    const c = color(topping);
    switch (topping) {
      case "granola": {
        const geometry = track(new THREE.DodecahedronGeometry(0.075));
        scatter(topping, 18, 0.2, 0.82).forEach((p) =>
          place(
            group,
            new THREE.Mesh(geometry, material(p.q > 0.5 ? c : "#CC9350", 0.9)),
            p,
            0.03,
            [p.q * 3, p.q * 5, 0],
          ),
        );
        break;
      }
      case "banana": {
        const geometry = track(
          new THREE.CylinderGeometry(0.21, 0.21, 0.07, 24),
        );
        scatter(topping, 4, 0.3, 0.72).forEach((p) =>
          place(group, new THREE.Mesh(geometry, material(c, 0.55)), p, 0.03, [
            0.25,
            0,
            0.2 - p.q * 0.4,
          ]),
        );
        break;
      }
      case "morango": {
        const geometry = track(new THREE.SphereGeometry(0.17, 20, 14));
        scatter(topping, 4, 0.3, 0.75).forEach((p) => {
          const mesh = new THREE.Mesh(geometry, material(c, 0.35));
          mesh.scale.set(1, 0.8, 1.2);
          place(group, mesh, p, 0.08, [0, p.q * 3, 0]);
        });
        break;
      }
      case "kiwi": {
        const outer = track(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 24));
        const core = track(new THREE.CylinderGeometry(0.075, 0.075, 0.065, 14));
        scatter(topping, 4, 0.3, 0.75).forEach((p) => {
          const slice = new THREE.Group();
          slice.add(new THREE.Mesh(outer, material(c, 0.5)));
          slice.add(new THREE.Mesh(core, material("#EFF0C8", 0.5)));
          place(group, slice, p, 0.03, [0.3, 0, 0.1 - p.q * 0.3]);
        });
        break;
      }
      case "pacoca": {
        const geometry = track(new THREE.BoxGeometry(0.12, 0.07, 0.1));
        scatter(topping, 11, 0.2, 0.82).forEach((p) =>
          place(group, new THREE.Mesh(geometry, material(c, 0.95)), p, 0.04, [
            p.q,
            p.q * 4,
            p.q * 0.6,
          ]),
        );
        break;
      }
      case "ninho": {
        const geometry = track(new THREE.SphereGeometry(0.22, 20, 14));
        scatter(topping, 3, 0.3, 0.65).forEach((p) => {
          const mesh = new THREE.Mesh(geometry, material(c, 0.45));
          mesh.scale.set(1.15, 0.45, 1);
          place(group, mesh, p, 0.04, [0, p.q * 3, 0]);
        });
        break;
      }
      case "coco": {
        const geometry = track(new THREE.BoxGeometry(0.16, 0.015, 0.05));
        scatter(topping, 16, 0.18, 0.85).forEach((p) =>
          place(group, new THREE.Mesh(geometry, material(c, 0.7)), p, 0.02, [
            p.q * 0.5,
            p.q * 6,
            p.q * 0.4,
          ]),
        );
        break;
      }
      case "manga": {
        const geometry = track(new THREE.BoxGeometry(0.15, 0.15, 0.15));
        scatter(topping, 6, 0.3, 0.78).forEach((p) =>
          place(group, new THREE.Mesh(geometry, material(c, 0.45)), p, 0.07, [
            p.q,
            p.q * 2,
            0,
          ]),
        );
        break;
      }
      case "leitepo": {
        const geometry = track(new THREE.SphereGeometry(0.03, 6, 4));
        scatter(topping, 70, 0.05, 0.9).forEach((p) =>
          place(group, new THREE.Mesh(geometry, material(c, 0.9)), p, 0.01),
        );
        break;
      }
      case "condensado": {
        // A drizzle across the bowl, drawn progressively when added.
        const points = [];
        for (let i = 0; i <= 40; i++) {
          const t = i / 40;
          const x = -1.15 + t * 2.3;
          const z =
            Math.sin(t * Math.PI * 5) *
            0.55 *
            Math.sqrt(Math.max(0, 1 - (x * x) / (R * R)));
          points.push(new THREE.Vector3(x, surfaceY(x, z) + 0.05, z));
        }
        const geometry = track(
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points),
            240,
            0.045,
            8,
            false,
          ),
        );
        const mesh = new THREE.Mesh(geometry, material(c, 0.2));
        mesh.userData = { drizzle: true, count: geometry.index!.count };
        group.add(mesh);
        break;
      }
    }
    group.visible = false;
    root.add(group);
    groups.set(topping, group);
  };
  Object.keys(toppingColors).forEach(buildTopping);

  const setTopping = (topping: string, visible: boolean, delay = 0) => {
    const group = groups.get(topping);
    if (!group) return;
    const pieces = group.children;
    pieces.forEach((piece) =>
      gsap.killTweensOf([piece.position, piece.scale, piece.rotation]),
    );

    if (visible) {
      group.visible = true;
      pieces.forEach((piece, i) => {
        if (piece.userData.drizzle) {
          const mesh = piece as THREE.Mesh;
          const total = piece.userData.count as number;
          const progress = { n: 0 };
          mesh.geometry.setDrawRange(0, 0);
          gsap.to(progress, {
            n: total,
            duration: 1.1,
            delay,
            ease: "power2.inOut",
            onUpdate: () =>
              mesh.geometry.setDrawRange(0, Math.floor(progress.n / 3) * 3),
          });
          return;
        }
        const rest = piece.userData as PieceData;
        piece.scale.copy(rest.restScale);
        if (topping === "leitepo") {
          piece.position.y = rest.restY;
          gsap.fromTo(
            piece.scale,
            { x: 0, y: 0, z: 0 },
            {
              x: 1,
              y: 1,
              z: 1,
              duration: 0.35,
              delay: delay + Math.random() * 0.5,
              ease: "back.out(3)",
            },
          );
          return;
        }
        piece.position.y = rest.restY + 2.4 + Math.random() * 0.8;
        gsap.to(piece.position, {
          y: rest.restY,
          duration: 0.85,
          delay: delay + i * 0.035,
          ease: "bounce.out",
        });
        gsap.fromTo(
          piece.rotation,
          { x: rest.restRotation.x + 2.5, z: rest.restRotation.z - 1.5 },
          {
            x: rest.restRotation.x,
            z: rest.restRotation.z,
            duration: 0.85,
            delay: delay + i * 0.035,
            ease: "power2.out",
          },
        );
      });
      return;
    }

    let remaining = pieces.length;
    const done = () => {
      if (--remaining > 0) return;
      group.visible = false;
      pieces.forEach((piece) => {
        const rest = piece.userData as PieceData;
        if (rest.restScale) piece.scale.copy(rest.restScale);
        if (rest.restY !== undefined) piece.position.y = rest.restY;
      });
    };
    pieces.forEach((piece, i) => {
      if (piece.userData.drizzle) {
        const mesh = piece as THREE.Mesh;
        const progress = { n: piece.userData.count as number };
        gsap.to(progress, {
          n: 0,
          duration: 0.35,
          onUpdate: () =>
            mesh.geometry.setDrawRange(0, Math.floor(progress.n / 3) * 3),
          onComplete: done,
        });
        return;
      }
      const rest = piece.userData as PieceData;
      gsap.to(piece.position, {
        y: rest.restY + 1.6,
        duration: 0.32,
        delay: i * 0.01,
        ease: "power2.in",
      });
      gsap.to(piece.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.32,
        delay: i * 0.01,
        ease: "power2.in",
        onComplete: done,
      });
    });
  };

  // Drag to spin; it starts turning on its own again after a pause.
  let autoRotate = true;
  let dragging = false;
  let lastX = 0;
  let velocity = 0;
  let resumeAt = 0;
  const canvas = renderer.domElement;
  const onDown = (event: PointerEvent) => {
    dragging = true;
    autoRotate = false;
    lastX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = "grabbing";
  };
  const onMove = (event: PointerEvent) => {
    if (!dragging) return;
    velocity = (event.clientX - lastX) * 0.012;
    root.rotation.y += velocity;
    lastX = event.clientX;
  };
  const onUp = () => {
    dragging = false;
    resumeAt = performance.now() + 2500;
    canvas.style.cursor = "grab";
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight || width;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  let frame = 0;
  const loop = () => {
    frame = requestAnimationFrame(loop);
    if (!dragging && !reducedMotion) {
      if (!autoRotate && performance.now() > resumeAt) autoRotate = true;
      if (autoRotate) root.rotation.y += 0.004;
      else {
        root.rotation.y += velocity;
        velocity *= 0.92;
      }
    }
    renderer.render(scene, camera);
  };
  loop();

  if (reducedMotion) gsap.globalTimeline.timeScale(20);

  // Entrance: the bowl lands, the açaí rises and the toppings fall in.
  root.scale.setScalar(initial.scale);
  gsap.from(root.position, { y: -1.4, duration: 0.7, ease: "back.out(1.6)" });
  gsap.from(root.rotation, { y: -1.2, duration: 1.1, ease: "power3.out" });
  gsap.fromTo(
    acaiPivot.scale,
    { y: 0.02 },
    { y: 1, duration: 0.7, delay: 0.35, ease: "back.out(2.2)" },
  );
  let current = new Set<string>();
  initial.toppings.forEach((topping, i) =>
    setTopping(topping, true, 0.9 + i * 0.18),
  );
  current = new Set(initial.toppings);
  let currentScale = initial.scale;

  return {
    update: ({ scale, toppings }) => {
      const next = new Set(toppings);
      current.forEach((t) => !next.has(t) && setTopping(t, false));
      next.forEach((t) => !current.has(t) && setTopping(t, true));
      current = next;
      if (scale !== currentScale) {
        currentScale = scale;
        gsap.to(root.scale, {
          x: scale,
          y: scale,
          z: scale,
          duration: 0.55,
          ease: "back.out(2.4)",
        });
      }
    },
    dispose: () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      root.traverse((object) =>
        gsap.killTweensOf([object.position, object.rotation, object.scale]),
      );
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      canvas.remove();
    },
  };
};
