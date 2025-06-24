import { ROWS, COLS } from "./config.js";
import { maze } from "./state.js";

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(x, y) {
  return [
    { x: x + 1, y: y },
    { x: x - 1, y: y },
    { x: x, y: y + 1 },
    { x: x, y: y - 1 },
  ].filter((n) => n.x >= 0 && n.x < COLS && n.y >= 0 && n.y < ROWS);
}

function isObstacle(x, y, dynamicObstacles) {
  if (maze[y] && maze[y][x] === 1) return true;
  return dynamicObstacles.some((obs) => obs.x === x && obs.y === y);
}

export function astarSearch(start, goal, obstacles) {
  const openSet = [{ ...start, g: 0, h: heuristic(start, goal), f: heuristic(start, goal), parent: null }];
  const closedSet = new Set();
  const explored = [];

  while (openSet.length > 0) {
    let current = openSet.reduce((min, node) => (node.f < min.f ? node : min));
    let currentIndex = openSet.indexOf(current);

    openSet.splice(currentIndex, 1);
    closedSet.add(`${current.x},${current.y}`);
    explored.push({ x: current.x, y: current.y });

    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      while (current) {
        path.unshift({ x: current.x, y: current.y });
        current = current.parent;
      }
      return { path, explored };
    }

    const neighbors = getNeighbors(current.x, current.y);
    for (let neighbor of neighbors) {
      if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;
      if (isObstacle(neighbor.x, neighbor.y, obstacles)) continue;

      const g = current.g + 1;
      const h = heuristic(neighbor, goal);
      const f = g + h;

      const existingNode = openSet.find((n) => n.x === neighbor.x && n.y === neighbor.y);
      if (!existingNode) {
        openSet.push({ ...neighbor, g, h, f, parent: current });
      } else if (g < existingNode.g) {
        existingNode.g = g;
        existingNode.f = g + existingNode.h;
        existingNode.parent = current;
      }
    }
  }

  return { path: [], explored };
}

export function greedySearch(start, goal, obstacles) {
  const openSet = [{ ...start, h: heuristic(start, goal), parent: null }];
  const closedSet = new Set();
  const explored = [];

  while (openSet.length > 0) {
    let current = openSet.reduce((min, node) => (node.h < min.h ? node : min));
    let currentIndex = openSet.indexOf(current);

    openSet.splice(currentIndex, 1);
    closedSet.add(`${current.x},${current.y}`);
    explored.push({ x: current.x, y: current.y });

    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      while (current) {
        path.unshift({ x: current.x, y: current.y });
        current = current.parent;
      }
      return { path, explored };
    }

    const neighbors = getNeighbors(current.x, current.y);
    for (let neighbor of neighbors) {
      if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;
      if (isObstacle(neighbor.x, neighbor.y, obstacles)) continue;

      const h = heuristic(neighbor, goal);
      const existingNode = openSet.find((n) => n.x === neighbor.x && n.y === neighbor.y);
      if (!existingNode) {
        openSet.push({ ...neighbor, h, parent: current });
      }
    }
  }

  return { path: [], explored };
}

function simulateRandomPath(startX, startY, goal, obstacles) {
  let x = startX,
    y = startY;
  let steps = 0;
  const maxSteps = 50;

  while (steps < maxSteps) {
    if (x === goal.x && y === goal.y) return 1.0;

    const neighbors = getNeighbors(x, y);
    const validNeighbors = neighbors.filter((n) => !isObstacle(n.x, n.y, obstacles));

    if (validNeighbors.length === 0) return 0.0;

    const next = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
    x = next.x;
    y = next.y;
    steps++;
  }

  return Math.max(0, 1.0 - heuristic({ x, y }, goal) / 100);
}

export function mctsSearch(start, goal, obstacles) {
  const ROOT_SIMULATIONS = 50;
  const TREE_DEPTH = 4;
  const explored = [];

  class MCTSNode {
    constructor(x, y, parent = null) {
      this.x = x;
      this.y = y;
      this.parent = parent;
      this.children = [];
      this.visits = 0;
      this.wins = 0;
    }

    ucb1() {
      if (this.visits === 0) return Infinity;
      return this.wins / this.visits + Math.sqrt((2 * Math.log(this.parent.visits)) / this.visits);
    }

    addChild(x, y) {
      const child = new MCTSNode(x, y, this);
      this.children.push(child);
      return child;
    }

    selectBestChild() {
      return this.children.reduce((best, child) => (child.ucb1() > best.ucb1() ? child : best));
    }
  }

  const root = new MCTSNode(start.x, start.y);

  for (let i = 0; i < ROOT_SIMULATIONS; i++) {
    let node = root;
    const path = [{ x: start.x, y: start.y }];

    for (let depth = 0; depth < TREE_DEPTH; depth++) {
      if (node.children.length === 0) {
        const neighbors = getNeighbors(node.x, node.y);
        for (let neighbor of neighbors) {
          if (!isObstacle(neighbor.x, neighbor.y, obstacles)) {
            node.addChild(neighbor.x, neighbor.y);
          }
        }
      }

      if (node.children.length === 0) break;

      node = node.selectBestChild();
      path.push({ x: node.x, y: node.y });
      explored.push({ x: node.x, y: node.y });

      if (node.x === goal.x && node.y === goal.y) break;
    }

    const reward = simulateRandomPath(node.x, node.y, goal, obstacles);

    while (node) {
      node.visits++;
      node.wins += reward;
      node = node.parent;
    }
  }

  const path = [];
  let current = root;
  while (current && current.children.length > 0) {
    path.push({ x: current.x, y: current.y });
    current = current.children.reduce((best, child) => (child.visits > best.visits ? child : best));
    if (current.x === goal.x && current.y === goal.y) {
      path.push({ x: current.x, y: current.y });
      break;
    }
  }

  return { path, explored };
}
