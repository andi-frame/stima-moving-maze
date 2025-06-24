import React from "react";

interface StatsDisplayProps {
  algorithm: string;
  pathLength: string;
  computeTime: string;
  nodesExplored: string;
  success: string;
  replanCount: string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  algorithm,
  pathLength,
  computeTime,
  nodesExplored,
  success,
  replanCount,
}) => {
  return (
    <div className="rounded-xl bg-white p-5 shadow-lg">
      <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-bold text-gray-800">
        Current Statistics
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Algorithm:</span>
          <span className="font-bold text-gray-900">
            {algorithm.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Path Length:</span>
          <span className="font-bold text-gray-900">{pathLength}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Computation Time:</span>
          <span className="font-bold text-gray-900">{computeTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Nodes Explored:</span>
          <span className="font-bold text-gray-900">{nodesExplored}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Success:</span>
          <span className="font-bold text-gray-900">{success}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Replanning Count:</span>
          <span className="font-bold text-gray-900">{replanCount}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
