import { useRef, useEffect, useImperativeHandle, forwardRef, useState } from "react";

const LETTER_PATHS = {
  A: "M50,10 L90,90 M10,90 L90,90 M30,55 L70,55",
  B: "M20,10 L20,90 M20,10 Q70,10 70,50 Q70,90 20,90",
  C: "M80,20 Q15,10 15,50 Q15,90 80,80",
  D: "M20,10 L20,90 M20,10 Q85,10 85,50 Q85,90 20,90",
  E: "M20,10 L20,90 M20,10 L80,10 M20,50 L65,50 M20,90 L80,90",
  F: "M20,10 L20,90 M20,10 L80,10 M20,50 L65,50",
  G: "M80,20 Q15,10 15,50 Q15,90 80,80 M80,80 L80,55 M80,55 L55,55",
  H: "M20,10 L20,90 M80,10 L80,90 M20,50 L80,50",
  I: "M30,10 L70,10 M50,10 L50,90 M30,90 L70,90",
  J: "M70,10 L70,75 Q70,95 45,95 Q20,95 20,75",
  K: "M20,10 L20,90 M80,10 L20,50 M20,50 L80,90",
  L: "M20,10 L20,90 M20,90 L80,90",
  M: "M10,90 L10,10 L50,55 L90,10 L90,90",
  N: "M20,90 L20,10 L80,90 L80,10",
  O: "M50,10 Q90,10 90,50 Q90,90 50,90 Q10,90 10,50 Q10,10 50,10",
  P: "M20,10 L20,90 M20,10 Q70,10 70,45 Q70,80 20,80",
  Q: "M50,10 Q90,10 90,50 Q90,90 50,90 Q10,90 10,50 Q10,10 50,10 M65,75 L85,95",
  R: "M20,10 L20,90 M20,10 Q70,10 70,45 Q70,80 20,80 M45,80 L80,90",
  S: "M75,20 Q15,5 20,50 Q25,90 75,80",
  T: "M10,10 L90,10 M50,10 L50,90",
  U: "M20,10 L20,65 Q20,90 50,90 Q80,90 80,65 L80,10",
  V: "M10,10 L50,90 L90,10",
  W: "M10,10 L30,90 L50,50 L70,90 L90,10",
  X: "M20,10 L80,90 M80,10 L20,90",
  Y: "M20,10 L50,50 L80,10 M50,50 L50,90",
  Z: "M20,10 L80,10 L20,90 L80,90",
};

const LetterCanvas = forwardRef(function LetterCanvas({ letter = "A", width = 200, height = 200, onStrokeComplete }, ref) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const strokeCount = useRef(0);
  const [strokesDone, setStrokesDone] = useState(0);

  // Draw the dotted guide letter
  const drawGuide = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#FFF9F0";
    ctx.fillRect(0, 0, width, height);

    // Dotted guide path
    ctx.save();
    ctx.strokeStyle = "#D1B896";
    ctx.lineWidth = 6;
    ctx.setLineDash([8, 6]);
    ctx.lineCap = "round";
    ctx.font = `bold ${Math.min(width, height) * 0.75}px Arial`;
    ctx.fillStyle = "rgba(200, 180, 150, 0.18)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, width / 2, height / 2);
    ctx.strokeText(letter, width / 2, height / 2);
    ctx.restore();

    // Direction arrow at top-left of letter
    ctx.save();
    ctx.fillStyle = "#F87171";
    ctx.font = "bold 18px Arial";
    ctx.fillText("↓", width * 0.35, height * 0.2);
    ctx.restore();
  };

  useEffect(() => { drawGuide(); }, [letter]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#6366F1";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([]);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    strokeCount.current += 1;
    setStrokesDone(strokeCount.current);
    if (onStrokeComplete) onStrokeComplete(strokeCount.current);
  };

  const clearCanvas = () => {
    strokeCount.current = 0;
    setStrokesDone(0);
    drawGuide();
  };

  useImperativeHandle(ref, () => ({ clearCanvas, strokesDone: strokeCount.current }));

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-2xl border-4 border-amber-200 shadow-xl touch-none cursor-crosshair"
        style={{ background: "#FFF9F0" }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-500">Strokes: {strokesDone}</span>
        <button
          onClick={clearCanvas}
          className="text-xs font-bold bg-red-100 text-red-500 px-3 py-1 rounded-full hover:bg-red-200 transition cursor-pointer"
        >
          Clear ✕
        </button>
      </div>
    </div>
  );
});

export default LetterCanvas;
