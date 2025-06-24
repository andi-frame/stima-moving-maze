import * as state from "./state.js";

export function updateStats(result) {
  document.getElementById("currentAlgo").textContent = state.currentAlgorithm.toUpperCase();
  document.getElementById("pathLength").textContent = result.path.length;
  document.getElementById("computeTime").textContent = result.computeTime + " ms";
  document.getElementById("nodesExplored").textContent = result.explored.length;
  document.getElementById("success").textContent = result.success ? "Yes" : "No";
  document.getElementById("replanCount").textContent = state.replanningCount;
}

export function resetStats() {
  document.getElementById("pathLength").textContent = "-";
  document.getElementById("computeTime").textContent = "-";
  document.getElementById("nodesExplored").textContent = "-";
  document.getElementById("success").textContent = "-";
  document.getElementById("replanCount").textContent = "-";
}

export function displayComparisonResults(results) {
  const content = document.getElementById("comparisonContent");
  let html = '<table style="width: 100%; border-collapse: collapse;">';
  html += '<tr style="background: #f7fafc;"><th style="padding: 10px; border: 1px solid #e2e8f0;">Algorithm</th>';
  html += '<th style="padding: 10px; border: 1px solid #e2e8f0;">Success Rate</th>';
  html += '<th style="padding: 10px; border: 1px solid #e2e8f0;">Avg Path Length</th>';
  html += '<th style="padding: 10px; border: 1px solid #e2e8f0;">Avg Compute Time</th>';
  html += '<th style="padding: 10px; border: 1px solid #e2e8f0;">Avg Nodes Explored</th>';
  html += '<th style="padding: 10px; border: 1px solid #e2e8f0;">Avg Replanning</th></tr>';

  for (let algo in results) {
    const data = results[algo];
    const avgPathLength =
      data.pathLength.length > 0 ? (data.pathLength.reduce((a, b) => a + b, 0) / data.pathLength.length).toFixed(1) : "N/A";
    const avgComputeTime =
      data.computeTime.length > 0 ? (data.computeTime.reduce((a, b) => a + b, 0) / data.computeTime.length).toFixed(2) : "N/A";
    const avgNodesExplored =
      data.nodesExplored.length > 0
        ? (data.nodesExplored.reduce((a, b) => a + b, 0) / data.nodesExplored.length).toFixed(1)
        : "N/A";
    const avgReplanning =
      data.replanCount.length > 0 ? (data.replanCount.reduce((a, b) => a + b, 0) / data.replanCount.length).toFixed(1) : "N/A";

    html += `<tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">${algo.toUpperCase()}</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${data.successRate}%</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${avgPathLength}</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${avgComputeTime} ms</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${avgNodesExplored}</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${avgReplanning}</td>
        </tr>`;
  }

  html += "</table>";

  html += '<div style="margin-top: 20px; padding: 15px; background: #f0fff4; border-radius: 8px;">';
  html += '<h4 style="margin-top: 0; color: #2d3748;">Research Analysis:</h4>';
  html += '<ul style="margin: 10px 0; padding-left: 20px; color: #4a5568;">';
  html += "<li><strong>A*:</strong> Generally optimal paths but higher computational cost</li>";
  html += "<li><strong>Greedy BFS:</strong> Faster computation but potentially suboptimal paths</li>";
  html += "<li><strong>MCTS:</strong> Adaptive to uncertainty but variable performance</li>";
  html += "</ul>";
  html +=
    '<p style="margin: 10px 0; color: #4a5568; font-style: italic;">Results show performance trade-offs between optimality, speed, and adaptability in dynamic environments.</p>';
  html += "</div>";

  content.innerHTML = html;
}
