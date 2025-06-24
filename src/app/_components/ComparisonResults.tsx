import React from "react";

interface AlgorithmStats {
  successRate: number;
  pathLength: number[];
  computeTime: number[];
  nodesExplored: number[];
  replanCount: number[];
}

type ComparisonData = Record<string, AlgorithmStats>;
type ComparisonResultsData = ComparisonData | { status: "running" } | null;

interface ComparisonResultsProps {
  data: ComparisonResultsData;
  onClose: () => void;
}

const ComparisonResults: React.FC<ComparisonResultsProps> = ({
  data,
  onClose,
}) => {
  if (!data) {
    return null;
  }

  if ("status" in data) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-gray-800">
          Comparison Results
        </h3>
        <p className="text-gray-700">Running comparison tests...</p>
      </div>
    );
  }

  const algorithms = Object.keys(data);

  return (
    <div className="rounded-xl bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Comparison Results</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-3 text-left">
                Algorithm
              </th>
              <th className="border border-gray-200 p-3 text-left">
                Success Rate
              </th>
              <th className="border border-gray-200 p-3 text-left">
                Avg Path Length
              </th>
              <th className="border border-gray-200 p-3 text-left">
                Avg Compute Time
              </th>
              <th className="border border-gray-200 p-3 text-left">
                Avg Nodes Explored
              </th>
              <th className="border border-gray-200 p-3 text-left">
                Avg Replanning
              </th>
            </tr>
          </thead>
          <tbody>
            {algorithms.map((algo) => {
              const algoData = data[algo];
              if (!algoData) return;
              const avgPathLength =
                algoData.pathLength.length > 0
                  ? (
                      algoData.pathLength.reduce(
                        (a: number, b: number) => a + b,
                        0,
                      ) / algoData.pathLength.length
                    ).toFixed(1)
                  : "N/A";
              const avgComputeTime =
                algoData.computeTime.length > 0
                  ? (
                      algoData.computeTime.reduce(
                        (a: number, b: number) => a + b,
                        0,
                      ) / algoData.computeTime.length
                    ).toFixed(2)
                  : "N/A";
              const avgNodesExplored =
                algoData.nodesExplored.length > 0
                  ? (
                      algoData.nodesExplored.reduce(
                        (a: number, b: number) => a + b,
                        0,
                      ) / algoData.nodesExplored.length
                    ).toFixed(1)
                  : "N/A";
              const avgReplanning =
                algoData.replanCount.length > 0
                  ? (
                      algoData.replanCount.reduce(
                        (a: number, b: number) => a + b,
                        0,
                      ) / algoData.replanCount.length
                    ).toFixed(1)
                  : "N/A";

              return (
                <tr key={algo}>
                  <td className="border border-gray-200 p-3 font-semibold">
                    {algo.toUpperCase()}
                  </td>
                  <td className="border border-gray-200 p-3">
                    {algoData.successRate}%
                  </td>
                  <td className="border border-gray-200 p-3">
                    {avgPathLength}
                  </td>
                  <td className="border border-gray-200 p-3">
                    {avgComputeTime} ms
                  </td>
                  <td className="border border-gray-200 p-3">
                    {avgNodesExplored}
                  </td>
                  <td className="border border-gray-200 p-3">
                    {avgReplanning}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-lg bg-green-50 p-4">
        <h4 className="mb-2 font-bold text-gray-800">Research Analysis:</h4>
        <ul className="list-disc space-y-1 pl-5 text-gray-700">
          <li>
            <strong>A*:</strong> Generally optimal paths but higher
            computational cost
          </li>
          <li>
            <strong>Greedy BFS:</strong> Faster computation but potentially
            suboptimal paths
          </li>
          <li>
            <strong>MCTS:</strong> Adaptive to uncertainty but variable
            performance
          </li>
        </ul>
        <p className="mt-2 text-gray-700 italic">
          Results show performance trade-offs between optimality, speed, and
          adaptability in dynamic environments.
        </p>
      </div>
    </div>
  );
};

export default ComparisonResults;
