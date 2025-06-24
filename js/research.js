import * as state from "./state.js";
import { COLS, ROWS } from "./config.js";

export function collectResearchData() {
  const data = {
    timestamp: new Date().toISOString(),
    algorithm: state.currentAlgorithm,
    mazeSize: `${COLS}x${ROWS}`,
    obstacleCount: state.obstacles.length,
    obstacleSpeed: parseInt(document.getElementById("obstacleSpeed").value),
    pathLength: parseInt(document.getElementById("pathLength").textContent) || 0,
    computeTime: parseFloat(document.getElementById("computeTime").textContent) || 0,
    nodesExplored: parseInt(document.getElementById("nodesExplored").textContent) || 0,
    success: document.getElementById("success").textContent === "Yes",
    replanCount: parseInt(document.getElementById("replanCount").textContent) || 0,
  };
  return data;
}

export function downloadResearchData() {
  const data = collectResearchData();
  const csvContent = Object.keys(data).join(",") + "\n" + Object.values(data).join(",");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pathfinding_research_data.csv";
  a.click();
}

export function calculatePerformanceMetrics(results) {
  const metrics = {};

  for (let algo in results) {
    const data = results[algo];
    metrics[algo] = {
      efficiency:
        data.pathLength.length > 0 ? data.pathLength.reduce((a, b) => a + b, 0) / data.computeTime.reduce((a, b) => a + b, 0) : 0,
      robustness: parseFloat(data.successRate),
      adaptability: data.replanCount.length > 0 ? 1 / (data.replanCount.reduce((a, b) => a + b, 0) / data.replanCount.length) : 0,
    };
  }

  return metrics;
}
