import React, { useState } from "react";

interface BoxDropZoneProps {
  onDrop: () => void;
  children: React.ReactNode;
  isDragActive?: boolean;
}

export default function BoxDropZone({ onDrop, children, isDragActive }: BoxDropZoneProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    onDrop();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative transition-all ${isOver ? "py-4" : ""}`}
    >
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 opacity-50 pointer-events-none" />
      )}
      {children}
    </div>
  );
}
