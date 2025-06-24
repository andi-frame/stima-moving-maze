import { canvas, GRID_SIZE, COLS, ROWS } from "./config.js";
import * as state from "./state.js";
import { astarSearch, greedySearch, mctsSearch } from "./algorithms.js";
import { draw } from "./drawing.js";
import { updateStats, resetStats, displayComparisonResults } from "./ui.js";

function executeAlgorithm(algorithm, start, goal, obstacles) {
  const startTime = performance.now();
  let result;

  switch (algorithm) {
    case "astar":
      result = astarSearch(start, goal, obstacles);
      break;
    case "greedy":
      result = greedySearch(start, goal, obstacles);
      break;
    case "mcts":
      result = mctsSearch(start, goal, obstacles);
      break;
    default:
      result = { path: [], explored: [] };
  }

  const endTime = performance.now();
  const computeTime = (endTime - startTime).toFixed(2);

  return {
    ...result,
    computeTime: computeTime,
    success: result.path.length > 0,
  };
}

function animate() {
  if (!state.isRunning) return;

  state.moveObstacles();

  const agentBlocked = state.obstacles.some((obs) => obs.x === state.agent.x && obs.y === state.agent.y);
  const pathBlocked = state.currentPath.some((point) => state.obstacles.some((obs) => obs.x === point.x && obs.y === point.y));

  if (agentBlocked || pathBlocked || state.currentPath.length === 0) {
    state.setReplanningCount(state.replanningCount + 1);
    const result = executeAlgorithm(state.currentAlgorithm, state.agent, state.goal, state.obstacles);
    state.setLastPathSuccess(result.success);
    state.setCurrentPath(result.path.slice(1));

    const newTotalTime = state.accumulatedComputeTime + parseFloat(result.computeTime);
    state.setAccumulatedComputeTime(newTotalTime);

    const newTotalNodes = state.totalNodesExplored + result.explored.length;
    state.setTotalNodesExplored(newTotalNodes);

    updateStats();
  }

  if (state.currentPath.length > 0) {
    const nextStep = state.currentPath.shift();
    state.setAgent({ x: nextStep.x, y: nextStep.y });
    state.setDistanceTraveled(state.distanceTraveled + 1);

    if (state.agent.x === state.goal.x && state.agent.y === state.goal.y) {
      state.setIsRunning(false);
      updateStats();
      //   alert("Goal reached!");
      return;
    }
  }

  draw();
  state.setAnimationId(requestAnimationFrame(animate));
}

function startPathfinding() {
  if (state.isRunning) {
    state.setIsRunning(false);
    cancelAnimationFrame(state.animationId);
    return;
  }

  state.setIsRunning(true);
  state.setAgent({ x: state.start.x, y: state.start.y });
  state.setReplanningCount(0);
  state.setAccumulatedComputeTime(0);
  state.setDistanceTraveled(0);
  state.setTotalNodesExplored(0);

  const result = executeAlgorithm(state.currentAlgorithm, state.agent, state.goal, state.obstacles);
  state.setCurrentPath(result.path.slice(1));
  state.setLastPathSuccess(result.success);
  state.setAccumulatedComputeTime(state.accumulatedComputeTime + parseFloat(result.computeTime));
  state.setTotalNodesExplored(state.totalNodesExplored + result.explored.length);
  updateStats();

  animate();
}

function resetMaze() {
  state.setIsRunning(false);
  if (state.animationId) cancelAnimationFrame(state.animationId);

  state.initMaze();
  state.setAccumulatedComputeTime(0);
  state.setDistanceTraveled(0);
  state.setTotalNodesExplored(0);
  draw();
  resetStats();
}

async function runComparison() {
  if (state.isRunning) return;

  const algorithms = ["astar", "greedy", "mcts"];
  const results = {};
  const trials = 5;

  document.getElementById("comparisonResults").style.display = "block";
  document.getElementById("comparisonContent").innerHTML = "<p>Running comparison...</p>";

  for (let algo of algorithms) {
    results[algo] = {
      pathLength: [],
      computeTime: [],
      nodesExplored: [],
      successRate: 0,
      replanCount: [],
    };

    for (let trial = 0; trial < trials; trial++) {
      state.initMaze();
      let tempAgent = { x: state.start.x, y: state.start.y };
      let trialReplanCount = 0;
      let trialSuccess = false;
      let totalPathLength = 0;
      let totalComputeTime = 0;
      let totalNodesExplored = 0;

      for (let step = 0; step < 100; step++) {
        state.moveObstacles();

        const result = executeAlgorithm(algo, tempAgent, state.goal, state.obstacles);

        if (result.path.length > 0) {
          trialReplanCount++;
          totalPathLength += result.path.length;
          totalComputeTime += parseFloat(result.computeTime);
          totalNodesExplored += result.explored.length;

          if (result.path.length > 1) {
            tempAgent = result.path[1];
          }

          if (tempAgent.x === state.goal.x && tempAgent.y === state.goal.y) {
            trialSuccess = true;
            break;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      if (trialSuccess) {
        results[algo].successRate++;
        results[algo].pathLength.push(totalPathLength);
        results[algo].computeTime.push(totalComputeTime);
        results[algo].nodesExplored.push(totalNodesExplored);
        results[algo].replanCount.push(trialReplanCount);
      }
    }

    results[algo].successRate = ((results[algo].successRate / trials) * 100).toFixed(1);
  }

  displayComparisonResults(results);
  state.initMaze();
  draw();
}

function setupEventListeners() {
  document.getElementById("startBtn").addEventListener("click", startPathfinding);
  document.getElementById("resetBtn").addEventListener("click", resetMaze);
  document.getElementById("compareBtn").addEventListener("click", runComparison);

  document.querySelectorAll(".algo-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".algo-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      state.setCurrentAlgorithm(this.dataset.algo);
      document.getElementById("currentAlgo").textContent = state.currentAlgorithm.toUpperCase();
    });
  });

  document.getElementById("obstacleSpeed").addEventListener("input", function () {
    document.getElementById("speedValue").textContent = this.value;
  });

  document.getElementById("obstacleCount").addEventListener("input", function () {
    document.getElementById("countValue").textContent = this.value;
    if (!state.isRunning) {
      resetMaze();
    }
  });

  canvas.addEventListener("click", function (e) {
    if (state.isRunning) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);

    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
      if (e.ctrlKey) {
        if (
          state.maze[y][x] === 0 &&
          !(x === state.start.x && y === state.start.y) &&
          !(x === state.goal.x && y === state.goal.y)
        ) {
          state.maze[y][x] = 1;
        } else if (state.maze[y][x] === 1) {
          state.maze[y][x] = 0;
        }
        draw();
      } else if (e.shiftKey) {
        if (state.maze[y][x] === 0) {
          if (e.altKey) {
            state.setGoal({ x, y });
          } else {
            state.setStart({ x, y });
            state.setAgent({ x, y });
          }
          draw();
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  state.initMaze();
  draw();
});
