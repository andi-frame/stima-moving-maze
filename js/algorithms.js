import { ROWS, COLS } from "./config.js";
import { maze } from "./state.js";

// ===================================================================
// Helper Class: Priority Queue (Min-Heap)
// ===================================================================
class PriorityQueue {
  constructor(comparator = (a, b) => a > b) {
    this._heap = [];
    this._comparator = comparator;
  }

  size() {
    return this._heap.length;
  }

  isEmpty() {
    return this.size() === 0;
  }

  peek() {
    return this._heap[0];
  }

  _parent(i) {
    return Math.floor((i - 1) / 2);
  }

  _leftChild(i) {
    return 2 * i + 1;
  }

  _rightChild(i) {
    return 2 * i + 2;
  }

  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }

  _compare(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }

  enqueue(value) {
    this._heap.push(value);
    this._siftUp();
  }

  _siftUp() {
    let nodeIdx = this.size() - 1;
    while (nodeIdx > 0 && this._compare(nodeIdx, this._parent(nodeIdx))) {
      this._swap(nodeIdx, this._parent(nodeIdx));
      nodeIdx = this._parent(nodeIdx);
    }
  }

  dequeue() {
    if (this.size() === 0) return undefined;
    if (this.size() === 1) return this._heap.pop();

    const value = this.peek();
    this._heap[0] = this._heap.pop();
    this._siftDown();
    return value;
  }

  _siftDown() {
    let nodeIdx = 0;
    while (
      (this._leftChild(nodeIdx) < this.size() && this._compare(this._leftChild(nodeIdx), nodeIdx)) ||
      (this._rightChild(nodeIdx) < this.size() && this._compare(this._rightChild(nodeIdx), nodeIdx))
    ) {
      const greaterChildIdx =
        this._rightChild(nodeIdx) < this.size() && this._compare(this._rightChild(nodeIdx), this._leftChild(nodeIdx))
          ? this._rightChild(nodeIdx)
          : this._leftChild(nodeIdx);
      this._swap(nodeIdx, greaterChildIdx);
      nodeIdx = greaterChildIdx;
    }
  }
}

// ===================================================================
// Helper Functions Umum
// ===================================================================
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

// ===================================================================
// Algoritma A*
// ===================================================================
export function astarSearch(start, goal, obstacles) {
  const comparator = (a, b) => a.f < b.f;
  const openSet = new PriorityQueue(comparator);

  const startNode = { ...start, g: 0, h: heuristic(start, goal), f: heuristic(start, goal), parent: null };
  openSet.enqueue(startNode);

  const openSetMap = new Map();
  openSetMap.set(`${start.x},${start.y}`, startNode);

  const closedSet = new Set();
  const explored = [];

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();
    openSetMap.delete(`${current.x},${current.y}`);

    closedSet.add(`${current.x},${current.y}`);
    explored.push({ x: current.x, y: current.y });

    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let temp = current;
      while (temp) {
        path.unshift({ x: temp.x, y: temp.y });
        temp = temp.parent;
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

      const neighborKey = `${neighbor.x},${neighbor.y}`;
      const existingNode = openSetMap.get(neighborKey);

      if (!existingNode || g < existingNode.g) {
        const newNode = { ...neighbor, g, h, f, parent: current };
        if (!existingNode) {
          openSet.enqueue(newNode);
          openSetMap.set(neighborKey, newNode);
        } else {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      }
    }
  }

  return { path: [], explored };
}

// ===================================================================
// Algoritma Greedy BFS
// ===================================================================
export function greedySearch(start, goal, obstacles) {
  const comparator = (a, b) => a.h < b.h;
  const openSet = new PriorityQueue(comparator);

  openSet.enqueue({ ...start, h: heuristic(start, goal), parent: null });
  const closedSet = new Set();
  const explored = [];

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();
    const currentKey = `${current.x},${current.y}`;

    if (closedSet.has(currentKey)) continue;

    closedSet.add(currentKey);
    explored.push({ x: current.x, y: current.y });

    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let temp = current;
      while (temp) {
        path.unshift({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return { path, explored };
    }

    const neighbors = getNeighbors(current.x, current.y);
    for (let neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(neighborKey)) continue;
      if (isObstacle(neighbor.x, neighbor.y, obstacles)) continue;

      openSet.enqueue({ ...neighbor, h: heuristic(neighbor, goal), parent: current });
    }
  }

  return { path: [], explored };
}

// ===================================================================
// Algoritma MCTS
// ===================================================================
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
  const ROOT_SIMULATIONS = 100;
  const TREE_DEPTH = 10;

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
      if (!this.parent || this.parent.visits === 0) return Infinity;
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
  const exploredNodes = new Set([`${start.x},${start.y}`]);

  for (let i = 0; i < ROOT_SIMULATIONS; i++) {
    let node = root;

    // --- 1. Selection & Expansion Phase ---
    for (let depth = 0; depth < TREE_DEPTH; depth++) {
      if (node.x === goal.x && node.y === goal.y) break;

      if (node.children.length === 0) {
        const neighbors = getNeighbors(node.x, node.y);
        for (let neighbor of neighbors) {
          if (!isObstacle(neighbor.x, neighbor.y, obstacles)) {
            node.addChild(neighbor.x, neighbor.y);
            exploredNodes.add(`${neighbor.x},${neighbor.y}`);
          }
        }
      }

      if (node.children.length === 0) break;

      node = node.selectBestChild();
    }

    // --- 2. Simulation Phase ---
    const reward = simulateRandomPath(node.x, node.y, goal, obstacles);

    // --- 3. Backpropagation Phase ---
    let tempNode = node;
    while (tempNode) {
      tempNode.visits++;
      tempNode.wins += reward;
      tempNode = tempNode.parent;
    }
  }

  // --- Final Path ---
  const path = [];
  let current = root;
  while (current && current.children.length > 0) {
    path.push({ x: current.x, y: current.y });
    current = current.children.reduce((best, child) => (child.visits > best.visits ? child : best), current.children[0]);

    if (current.x === goal.x && current.y === goal.y) {
      path.push({ x: current.x, y: current.y });
      break;
    }
  }

  const explored = Array.from(exploredNodes).map((key) => {
    const [x, y] = key.split(",");
    return { x: parseInt(x, 10), y: parseInt(y, 10) };
  });

  return { path, explored };
}
