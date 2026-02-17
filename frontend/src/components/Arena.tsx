import { useEffect, useRef, useState } from 'react';

interface Slice {
  x: number;
  y: number;
  size: number;
}

interface Topping {
  x: number;
  y: number;
  toppingId: number;
  eatenAt: number;
}

interface ArenaProps {
  playerSlice: any;
  allSlices: Map<string, Slice>;
  toppings: Topping[];
  onMove: (dx: number, dy: number) => void;
}

const ARENA_RADIUS = 400;
const ARENA_SIZE = 64;
const SCALE = ARENA_RADIUS / (ARENA_SIZE / 2);

export function Arena({ playerSlice, allSlices, toppings, onMove }: ArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  
  // Convert arena coords to canvas coords
  const arenaToCanvas = (x: number, y: number) => {
    const centerX = ARENA_RADIUS;
    const centerY = ARENA_RADIUS;
    return {
      x: centerX + x * SCALE,
      y: centerY + y * SCALE,
    };
  };
  
  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      // Clear
      ctx.fillStyle = '#000033';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw checkered arena background
      ctx.strokeStyle = '#FF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ARENA_RADIUS, ARENA_RADIUS, ARENA_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      
      // Checkered pattern
      const gridSize = 20;
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const dist = Math.sqrt(
            Math.pow(x - ARENA_RADIUS, 2) + Math.pow(y - ARENA_RADIUS, 2)
          );
          if (dist <= ARENA_RADIUS) {
            const isRed = Math.floor(x / gridSize) % 2 === Math.floor(y / gridSize) % 2;
            ctx.fillStyle = isRed ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 215, 0, 0.1)';
            ctx.fillRect(x, y, gridSize, gridSize);
          }
        }
      }
      
      // Draw toppings
      toppings.forEach((topping) => {
        if (topping.eatenAt === 0) {
          const pos = arenaToCanvas(topping.x, topping.y);
          const dist = Math.sqrt(
            Math.pow(pos.x - ARENA_RADIUS, 2) + Math.pow(pos.y - ARENA_RADIUS, 2)
          );
          if (dist <= ARENA_RADIUS) {
            ctx.save();
            ctx.translate(pos.x, pos.y);
            
            // Topping colors
            const colors = ['#FF4444', '#FFD700', '#00FF88']; // pepperoni, cheese, pineapple
            ctx.fillStyle = colors[topping.toppingId] || '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors[topping.toppingId] || '#FFD700';
            ctx.fill();
            ctx.restore();
          }
        }
      });
      
      // Draw all slices (including player)
      const allSlicesArray = Array.from(allSlices.entries());
      
      // Draw other players first
      allSlicesArray.forEach(([address, slice]) => {
        const pos = arenaToCanvas(slice.x, slice.y);
        const radius = Math.max(10, Math.min(50, slice.size / 20));
        const dist = Math.sqrt(
          Math.pow(pos.x - ARENA_RADIUS, 2) + Math.pow(pos.y - ARENA_RADIUS, 2)
        );
        
        if (dist <= ARENA_RADIUS + radius) {
          ctx.save();
          ctx.translate(pos.x, pos.y);
          
          // Slice shape (pizza slice)
          ctx.fillStyle = '#FF6666';
          ctx.strokeStyle = '#FF4444';
          ctx.lineWidth = 2;
          
          // Draw pizza slice shape
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Cheese dripping effect
          ctx.fillStyle = '#FFD700';
          for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 1.5 / 3) * i;
            const dripX = Math.cos(angle) * radius * 0.8;
            const dripY = Math.sin(angle) * radius * 0.8;
            ctx.beginPath();
            ctx.arc(dripX, dripY, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // Glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#FF4444';
          ctx.fill();
          
          // Size label
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '12px "Press Start 2P"';
          ctx.textAlign = 'center';
          ctx.fillText(Math.floor(slice.size / 100).toString(), 0, -radius - 10);
          
          ctx.restore();
        }
      });
      
      // Draw player slice (highlighted) on top
      if (playerSlice && playerSlice.size > 0 && playerSlice.respawn === 0) {
        const pos = arenaToCanvas(playerSlice.x, playerSlice.y);
        const radius = Math.max(10, Math.min(50, playerSlice.size / 20));
        
        ctx.save();
        ctx.translate(pos.x, pos.y);
        
        // Pulsing glow
        const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;
        ctx.shadowBlur = 20 * pulse;
        ctx.shadowColor = '#FFD700';
        
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 3;
        
        // Draw pizza slice shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Cheese dripping effect
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 3; i++) {
          const angle = (Math.PI * 1.5 / 3) * i;
          const dripX = Math.cos(angle) * radius * 0.8;
          const dripY = Math.sin(angle) * radius * 0.8;
          ctx.beginPath();
          ctx.arc(dripX, dripY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Size label
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(Math.floor(playerSlice.size / 100).toString(), 0, -radius - 10);
        
        ctx.restore();
      }
      
      animationFrameRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playerSlice, allSlices, toppings]);
  
  // Mouse/touch controls
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      const moveX = dx > 0 ? 1 : -1;
      const moveY = dy > 0 ? 1 : -1;
      onMove(moveX, moveY);
      setDragStart({ x, y });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        width={ARENA_RADIUS * 2}
        height={ARENA_RADIUS * 2}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          border: '3px solid #FF4444',
          borderRadius: '50%',
          cursor: 'crosshair',
          boxShadow: '0 0 30px #FF4444',
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#FFD700',
        fontFamily: 'Press Start 2P',
        fontSize: '12px',
        textAlign: 'center',
      }}>
        WASD or Click-Drag to Move
      </div>
    </div>
  );
}
