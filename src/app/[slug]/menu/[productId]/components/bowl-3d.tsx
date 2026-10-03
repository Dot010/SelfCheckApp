"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

import { BowlScene, createBowlScene } from "@/lib/bowl-scene";

interface Bowl3DProps {
  scale: number;
  toppings: string[];
  // Shown while three.js loads and on devices without WebGL.
  fallback: ReactNode;
}

const Bowl3D = ({ scale, toppings, fallback }: Bowl3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BowlScene | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );

  // Create the scene once; later changes go through update().
  const initial = useRef({ scale, toppings });
  useEffect(() => {
    const scene = createBowlScene(containerRef.current!, initial.current);
    if (!scene) {
      setStatus("failed");
      return;
    }
    sceneRef.current = scene;
    setStatus("ready");
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  const toppingsKey = toppings.join(",");
  useEffect(() => {
    sceneRef.current?.update({ scale, toppings: toppingsKey.split(",") });
  }, [scale, toppingsKey]);

  return (
    <div className="relative h-full w-full">
      {status !== "ready" && <div className="absolute inset-0">{fallback}</div>}
      <div
        ref={containerRef}
        role="img"
        aria-label="Prévia da tigela com os complementos escolhidos. Arraste para girar."
        className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full"
      />
      {status === "ready" && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
          Arraste para girar
        </span>
      )}
    </div>
  );
};

export default Bowl3D;
