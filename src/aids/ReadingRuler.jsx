import React, { useState, useEffect } from "react";

const ReadingRuler = ({ isActive }) => {
  const [mousePos, setMousePos] = useState({ y: window.innerHeight / 2 });

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e) => {
      setMousePos({ y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Top overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: `${Math.max(0, mousePos.y - 40)}px`,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />
      {/* Reading window */}
      <div
        style={{
          position: "fixed",
          top: `${Math.max(0, mousePos.y - 40)}px`,
          left: 0,
          right: 0,
          height: "80px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderTop: "2px solid rgba(255, 255, 255, 0.5)",
          borderBottom: "2px solid rgba(255, 255, 255, 0.5)",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
      {/* Bottom overlay */}
      <div
        style={{
          position: "fixed",
          top: `${mousePos.y + 40}px`,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />
    </>
  );
};

export default ReadingRuler;
