import { useRef, useEffect, useImperativeHandle, forwardRef, useState } from "react";

// Helper to draw an arrow head
function drawArrowhead(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-15, -10);
  ctx.lineTo(-15, 10);
  ctx.closePath();
  ctx.fillStyle = "#6366F1";
  ctx.fill();
  ctx.restore();
}

import { ALPHABET_DATA } from "../../data/alphabetPaths";

const LetterCanvas = forwardRef(function LetterCanvas({ letter = "A", width = 320, height = 320, smartAssistance = false }, ref) {
  const guideCanvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null); 
  
  const [userStrokes, setUserStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false); // Changed to state for strict reactivity
  const currentPath = useRef([]);

  const letterData = ALPHABET_DATA[letter] || ALPHABET_DATA["A"];
  const targetStrokes = letterData.strokes;

  // Draw background and guide (Bottom Layer)
  const drawGuideLayer = () => {
    const canvas = guideCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#FFF9F0";
    ctx.fillRect(0, 0, width, height);

    // Draw target guides
    targetStrokes.forEach((stroke, i) => {
      ctx.save();
      ctx.strokeStyle = "rgba(200, 180, 150, 0.4)";
      ctx.lineWidth = 20;
      ctx.setLineDash([15, 15]);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const p = new Path2D(stroke.path);
      ctx.stroke(p);
      
      // Draw Directional Arrows
      if (stroke.type === "line") {
         const dx = stroke.end.x - stroke.start.x;
         const dy = stroke.end.y - stroke.start.y;
         const angle = Math.atan2(dy, dx);
         const midX = stroke.start.x + (dx * 0.3);
         const midY = stroke.start.y + (dy * 0.3);
         drawArrowhead(ctx, midX, midY, angle);
      }
      ctx.restore();

      // Start Dot (Green)
      ctx.beginPath();
      ctx.arc(stroke.start.x, stroke.start.y, 12, 0, 2 * Math.PI);
      ctx.fillStyle = smartAssistance && userStrokes.length === i ? "#22c55e" : "#4ade80"; 
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Number
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((i + 1).toString(), stroke.start.x, stroke.start.y);

      // End Dot (Red)
      ctx.beginPath();
      ctx.arc(stroke.end.x, stroke.end.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Smart assistance pulse ring
      if (smartAssistance && userStrokes.length === i) {
        ctx.beginPath();
        ctx.arc(stroke.start.x, stroke.start.y, 20, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(34, 197, 94, 0.5)";
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    });

    // Draw Hidden Hitbox (for coverage calculation)
    const hCanvas = hiddenCanvasRef.current;
    if (hCanvas) {
       const hCtx = hCanvas.getContext("2d");
       hCtx.clearRect(0, 0, width, height);
       hCtx.strokeStyle = "#000000";
       hCtx.lineWidth = 50; 
       hCtx.lineCap = "round";
       hCtx.lineJoin = "round";
       targetStrokes.forEach(s => hCtx.stroke(new Path2D(s.path)));
    }
  };

  // Redraw all stored strokes on the Top Layer
  const drawUserLayer = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    userStrokes.forEach((strokePoints) => {
       if (strokePoints.length === 0) return;
       ctx.beginPath();
       ctx.moveTo(strokePoints[0].x, strokePoints[0].y);
       for(let i = 1; i < strokePoints.length; i++) {
         ctx.lineTo(strokePoints[i].x, strokePoints[i].y);
       }
       ctx.strokeStyle = "#3B82F6"; // Bright Blue
       ctx.lineWidth = 12; // 8-12px range as requested
       ctx.lineCap = "round";
       ctx.lineJoin = "round";
       ctx.stroke();
    });
  };

  // Draw guide whenever letter or smart assistance changes
  useEffect(() => { 
    drawGuideLayer(); 
  }, [letter, smartAssistance, userStrokes.length]); // depend on length for smart assistance ring update

  // Draw user strokes whenever they update
  useEffect(() => {
    drawUserLayer();
  }, [userStrokes]);

  const getPos = (e) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || canvas.width);
    const scaleY = canvas.height / (rect.height || canvas.height);

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const x = ((clientX || 0) - rect.left) * scaleX;
    const y = ((clientY || 0) - rect.top) * scaleY;
    
    console.log("COORD:", x, y);
    return { x, y };
  };

  const startDraw = (e) => {
    if (e.type.includes('touch')) e.preventDefault(); // Safely prevent default only on touch
    console.log("DRAW START");
    setIsDrawing(true);
    
    const pos = getPos(e);
    currentPath.current = [pos];
    
    const ctx = drawingCanvasRef.current?.getContext("2d");
    if (ctx) {
      console.log("CTX VALID ON START");
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#3B82F6";
      ctx.fill();
    }
  };

  const draw = (e) => {
    if (e.type.includes('touch')) e.preventDefault();
    if (!isDrawing) return;
    
    console.log("DRAW MOVE");
    const pos = getPos(e);
    currentPath.current.push(pos);
    
    const ctx = drawingCanvasRef.current?.getContext("2d");
    if (ctx) {
      const lastPos = currentPath.current[currentPath.current.length - 2];
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = "#3B82F6"; 
      ctx.lineWidth = 12; 
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  };

  const endDraw = (e) => {
    if (e && e.type.includes('touch')) e.preventDefault();
    if (!isDrawing) return;
    
    console.log("DRAW END");
    setIsDrawing(false);
    
    if (currentPath.current.length > 0) {
      // CRITICAL FIX: Synchronously clone the array BEFORE React's async updater evaluates it!
      const completedPath = [...currentPath.current];
      setUserStrokes(prev => [...prev, completedPath]);
    }
    currentPath.current = [];
  };

  const clearCanvas = () => {
    setUserStrokes([]);
  };

  const undo = () => {
    setUserStrokes(prev => prev.slice(0, -1));
  };

  // --- Forgiving Child-Friendly Physics Engine ---
  const calculateAccuracy = () => {
    if (userStrokes.length === 0) return 0;

    let orderScore = 0;
    const TOLERANCE = 45; 
    
    // 1. Evaluate Start & End Points and Order
    const checks = Math.min(userStrokes.length, targetStrokes.length);
    for (let i = 0; i < checks; i++) {
       const uStart = userStrokes[i][0];
       const uEnd = userStrokes[i][userStrokes[i].length - 1];
       const tStart = targetStrokes[i].start;
       const tEnd = targetStrokes[i].end;

       const distStart = Math.hypot(uStart.x - tStart.x, uStart.y - tStart.y);
       const distEnd = Math.hypot(uEnd.x - tEnd.x, uEnd.y - tEnd.y);
       
       if (distStart < TOLERANCE) orderScore += 10;
       if (distEnd < TOLERANCE) orderScore += 10;
    }
    let finalOrderScore = (orderScore / (targetStrokes.length * 20)) * 100;

    // 2. Evaluate Canvas Pixel Coverage
    const vCanvas = drawingCanvasRef.current;
    const hCanvas = hiddenCanvasRef.current;
    const vCtx = vCanvas.getContext("2d");
    const hCtx = hCanvas.getContext("2d");
    
    // (Visible drawing layer already contains exactly what the user drew!)
    const vData = vCtx.getImageData(0, 0, width, height).data;
    const hData = hCtx.getImageData(0, 0, width, height).data;
    
    let userPixels = 0;
    let overlapPixels = 0;
    let hitboxTotalPixels = 0;
    
    for (let i = 0; i < vData.length; i += 16) {
      const isHitbox = hData[i + 3] > 128;
      const isUser = vData[i + 3] > 0; // Check drawing layer alpha
      if (isHitbox) hitboxTotalPixels++;
      if (isUser) userPixels++;
      if (isHitbox && isUser) overlapPixels++;
    }

    let coverageScore = 0;
    if (hitboxTotalPixels > 0) {
       coverageScore = Math.min(100, (overlapPixels / (hitboxTotalPixels * 0.4)) * 100);
    }
    
    let finalScore = (finalOrderScore * 0.6) + (coverageScore * 0.4);

    if (userStrokes.length > targetStrokes.length + 1) {
       finalScore -= ((userStrokes.length - targetStrokes.length) * 10);
    }

    if (finalScore >= 50 && finalScore < 60) finalScore = 62;

    return Math.max(0, Math.min(100, Math.round(finalScore)));
  };

  useImperativeHandle(ref, () => ({ 
    clearCanvas, 
    undo,
    calculateAccuracy,
    strokesDone: userStrokes.length 
  }));

  return (
    <div className="relative flex flex-col items-center w-full max-w-[320px] aspect-square rounded-3xl border-4 border-indigo-200 shadow-xl overflow-hidden bg-white">
      {/* BOTTOM LAYER: Letter Guide (Static sizing blocks container collapse) */}
      <canvas
        ref={guideCanvasRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ pointerEvents: 'none', zIndex: 1 }}
      />
      {/* TOP LAYER: User Drawing */}
      <canvas
        ref={drawingCanvasRef}
        width={width}
        height={height}
        className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
        style={{ pointerEvents: 'auto', zIndex: 10 }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      {/* HIDDEN LAYER: Hitbox */}
      <canvas ref={hiddenCanvasRef} width={width} height={height} className="hidden" style={{ zIndex: 0 }} />
    </div>
  );
});

export default LetterCanvas;
