"use client";

import { useEffect, useRef } from "react";

export function AnimatedBrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scale = Math.min(rect.width, rect.height) / 2;

      // Draw neural network nodes and connections
      const nodes: Array<{ x: number; y: number; z: number; id: number }> = [];
      
      // Create layered neural network structure
      const layers = 5;
      const nodesPerLayer = 8;
      
      for (let layer = 0; layer < layers; layer++) {
        for (let i = 0; i < nodesPerLayer; i++) {
          const angle = (i / nodesPerLayer) * Math.PI * 2;
          const layerDepth = (layer / (layers - 1)) * 2 - 1;
          
          // Create brain-like symmetrical shape
          const waveAmplitude = Math.sin(layer * 0.5 + time * 0.3) * 0.3;
          const radius = scale * 0.4 * (0.5 + Math.abs(layerDepth) * 0.5);
          
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius * (0.5 + waveAmplitude);
          
          // Rotate around Y axis
          const rotY = time * 0.2;
          const newX = x * Math.cos(rotY) - z * Math.sin(rotY);
          const newZ = x * Math.sin(rotY) + z * Math.cos(rotY);
          
          // Add vertical variation
          const y = layerDepth * scale * 0.6 + Math.sin(angle * 3 + time * 0.5) * scale * 0.15;
          
          nodes.push({
            x: centerX + newX,
            y: centerY + y,
            z: newZ,
            id: layer * nodesPerLayer + i,
          });
        }
      }

      // Sort by depth
      nodes.sort((a, b) => a.z - b.z);

      // Draw connections
      ctx.strokeStyle = "rgba(200, 200, 200, 0.15)";
      ctx.lineWidth = 1;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < Math.min(i + nodesPerLayer + 2, nodes.length); j++) {
          const dx = Math.abs(nodes[j].x - nodes[i].x);
          const dy = Math.abs(nodes[j].y - nodes[i].y);
          
          // Connect nearby nodes
          if (dx < scale * 0.6 && dy < scale * 0.3) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes with glow
      nodes.forEach((node) => {
        const depth = (node.z + scale) / (2 * scale);
        const size = 2 + depth * 3;
        const alpha = 0.3 + depth * 0.5;
        
        // Glow effect
        ctx.fillStyle = `rgba(200, 200, 200, ${alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Core node
        ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      time += 0.016;
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
