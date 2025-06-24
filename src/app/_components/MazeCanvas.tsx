"use client";

import React, { useEffect, useRef } from "react";
import {
  type Position,
  type Obstacle,
  type Maze,
  GRID_SIZE,
  COLS,
  ROWS,
} from "@/types/config";

interface MazeCanvasProps {
  maze?: Maze;
  start: Position;
  goal: Position;
  obstacles: Obstacle[];
  agent: Position;
  currentPath: Position[];
  onCanvasClick?: (
    x: number,
    y: number,
    modifiers: { ctrlKey: boolean; shiftKey: boolean; altKey: boolean },
  ) => void;
}

const MazeCanvas: React.FC<MazeCanvasProps> = ({
  maze = [],
  start,
  goal,
  obstacles,
  agent,
  currentPath,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw maze
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
      const row = maze[y] ?? [];
      for (let x = 0; x < COLS; x++) {
        if (row[x] === 1) {
          ctx.fillStyle = "#2d3748";
          ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
      }
    }

    // Draw path
    ctx.fillStyle = "#3182ce";
    for (const point of currentPath) {
      ctx.fillRect(
        point.x * GRID_SIZE + 2,
        point.y * GRID_SIZE + 2,
        GRID_SIZE - 4,
        GRID_SIZE - 4,
      );
    }

    // Draw start and goal
    ctx.fillStyle = "#48bb78";
    ctx.fillRect(
      start.x * GRID_SIZE,
      start.y * GRID_SIZE,
      GRID_SIZE,
      GRID_SIZE,
    );
    ctx.fillStyle = "#ed8936";
    ctx.fillRect(goal.x * GRID_SIZE, goal.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    // Draw obstacles
    ctx.fillStyle = "#e53e3e";
    for (const obstacle of obstacles) {
      ctx.fillRect(
        obstacle.x * GRID_SIZE,
        obstacle.y * GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE,
      );
    }

    // Draw agent
    ctx.fillStyle = "#805ad5";
    ctx.fillRect(
      agent.x * GRID_SIZE + 3,
      agent.y * GRID_SIZE + 3,
      GRID_SIZE - 6,
      GRID_SIZE - 6,
    );

    // Draw grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(canvas.width, i * GRID_SIZE);
      ctx.stroke();
    }
  }, [maze, start, goal, obstacles, agent, currentPath]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCanvasClick || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);

    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
      onCanvasClick(x, y, {
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={COLS * GRID_SIZE}
      height={ROWS * GRID_SIZE}
      onClick={handleClick}
      className="rounded-lg border-2 border-gray-800 shadow-lg"
    />
  );
};

export default MazeCanvas;
