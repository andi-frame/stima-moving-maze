"use client";

import React from "react";

interface AlgorithmControlsProps {
  currentAlgorithm: string;
  obstacleSpeed: number;
  obstacleCount: number;
  isRunning: boolean;
  onAlgorithmChange: (algorithm: string) => void;
  onSpeedChange: (speed: number) => void;
  onCountChange: (count: number) => void;
  onStart: () => void;
  onReset: () => void;
  onCompare: () => void;
}

const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  currentAlgorithm,
  obstacleSpeed,
  obstacleCount,
  isRunning,
  onAlgorithmChange,
  onSpeedChange,
  onCountChange,
  onStart,
  onReset,
  onCompare,
}) => {
  const algorithms = [
    { id: "astar", label: "A*" },
    { id: "greedy", label: "Greedy BFS" },
    { id: "mcts", label: "MCTS" },
  ];

  return (
    <div className="rounded-xl bg-gray-100 p-6 shadow-lg">
      <div className="mb-6">
        <label className="mb-2 block font-semibold text-gray-800">
          Select Algorithm:
        </label>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {algorithms.map((algo) => (
            <button
              key={algo.id}
              className={`rounded-lg px-1 py-2 text-center font-medium transition-all ${
                currentAlgorithm === algo.id
                  ? "border-indigo-500 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  : "border border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
              }`}
              onClick={() => onAlgorithmChange(algo.id)}
            >
              {algo.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block font-semibold text-gray-800">
          Obstacle Speed: <span className="font-normal">{obstacleSpeed}</span>
        </label>
        <input
          type="range"
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
          min="1"
          max="5"
          value={obstacleSpeed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value))}
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 block font-semibold text-gray-800">
          Number of Obstacles:{" "}
          <span className="font-normal">{obstacleCount}</span>
        </label>
        <input
          type="range"
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
          min="2"
          max="6"
          value={obstacleCount}
          onChange={(e) => onCountChange(parseInt(e.target.value))}
        />
      </div>

      <button
        className={`mb-3 w-full rounded-xl py-3 font-bold tracking-wider text-white uppercase ${
          isRunning
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        } shadow-md transition-all hover:shadow-lg`}
        onClick={onStart}
      >
        {isRunning ? "Stop" : "Start Pathfinding"}
      </button>

      <button
        className="mb-3 w-full rounded-xl bg-orange-500 py-3 font-bold tracking-wider text-white uppercase shadow-md transition-all hover:bg-orange-600 hover:shadow-lg"
        onClick={onReset}
      >
        Reset Maze
      </button>

      <button
        className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-bold tracking-wider text-white uppercase shadow-md transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg"
        onClick={onCompare}
      >
        Compare All Algorithms
      </button>
    </div>
  );
};

export default AlgorithmControls;
