import { ROWS, COLS } from "./config.js";

export let maze = [];
export let start = { x: 1, y: 1 };
export let goal = { x: COLS - 2, y: ROWS - 2 };
export let obstacles = [];
export let currentPath = [];
export let agent = { x: start.x, y: start.y };
export let currentAlgorithm = "astar";
export let isRunning = false;
export let animationId;
export let replanningCount = 0;
export let accumulatedComputeTime = 0;
export let distanceTraveled = 0;
export let totalNodesExplored = 0;
export let lastPathSuccess = false;

export function setMaze(newMaze) {
  maze = newMaze;
}
export function setStart(newStart) {
  start = newStart;
}
export function setGoal(newGoal) {
  goal = newGoal;
}
export function setObstacles(newObstacles) {
  obstacles = newObstacles;
}
export function setCurrentPath(newPath) {
  currentPath = newPath;
}
export function setAgent(newAgent) {
  agent = newAgent;
}
export function setCurrentAlgorithm(newAlgo) {
  currentAlgorithm = newAlgo;
}
export function setIsRunning(running) {
  isRunning = running;
}
export function setAnimationId(id) {
  animationId = id;
}
export function setReplanningCount(count) {
  replanningCount = count;
}
export function setAccumulatedComputeTime(time) {
  accumulatedComputeTime = time;
}
export function setDistanceTraveled(distance) {
  distanceTraveled = distance;
}
export function setTotalNodesExplored(nodes) {
  totalNodesExplored = nodes;
}
export function setLastPathSuccess(success) {
  lastPathSuccess = success;
}

export function initMaze() {
  let newMaze = [];
  for (let y = 0; y < ROWS; y++) {
    newMaze[y] = [];
    for (let x = 0; x < COLS; x++) {
      if (x === 0 || x === COLS - 1 || y === 0 || y === ROWS - 1) {
        newMaze[y][x] = 1;
      } else if ((x % 6 === 0 || y % 6 === 0) && Math.random() > 0.7) {
        newMaze[y][x] = 1;
      } else {
        newMaze[y][x] = 0;
      }
    }
  }

  newMaze[start.y][start.x] = 0;
  newMaze[goal.y][goal.x] = 0;
  setMaze(newMaze);

  let newObstacles = [];
  const obstacleCount = parseInt(document.getElementById("obstacleCount").value);
  for (let i = 0; i < obstacleCount; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * (COLS - 4)) + 2;
      y = Math.floor(Math.random() * (ROWS - 4)) + 2;
    } while (
      maze[y][x] === 1 ||
      (x === start.x && y === start.y) ||
      (x === goal.x && y === goal.y) ||
      newObstacles.some((obs) => obs.x === x && obs.y === y)
    );

    newObstacles.push({
      x: x,
      y: y,
      dx: Math.random() > 0.5 ? 1 : -1,
      dy: Math.random() > 0.5 ? 1 : -1,
      moveCounter: 0,
    });
  }
  setObstacles(newObstacles);

  setAgent({ x: start.x, y: start.y });
  setCurrentPath([]);
  setReplanningCount(0);
}

export function moveObstacles() {
  const speed = parseInt(document.getElementById("obstacleSpeed").value);
  for (let obstacle of obstacles) {
    obstacle.moveCounter++;
    if (obstacle.moveCounter % (11 - speed) === 0) {
      let newX = obstacle.x + obstacle.dx;
      let newY = obstacle.y + obstacle.dy;

      if (newX <= 0 || newX >= COLS - 1 || maze[obstacle.y][newX] === 1 || Math.random() > 0.8) {
        obstacle.dx = -obstacle.dx;
        newX = obstacle.x;
      }
      if (newY <= 0 || newY >= ROWS - 1 || maze[newY][obstacle.x] === 1 || Math.random() > 0.8) {
        obstacle.dy = -obstacle.dy;
        newY = obstacle.y;
      }

      obstacle.x = newX;
      obstacle.y = newY;
    }
  }
}
