import type {
  Position,
  PathfindingResult,
  Obstacle,
  Maze,
} from "@/types/config";
import { type PathfindingAlgorithm } from "@/lib/algorithms/types";
import { getNeighbors, isObstacle, heuristic } from "../utils/pathfindingUtils";

export class MCTS implements PathfindingAlgorithm {
  private readonly ROOT_SIMULATIONS = 50;
  private readonly TREE_DEPTH = 4;

  findPath(
    start: Position,
    goal: Position,
    obstacles: Obstacle[],
    maze: Maze,
  ): PathfindingResult {
    const startTime = performance.now();
    const explored: Position[] = [];

    class MCTSNode {
      x: number;
      y: number;
      parent: MCTSNode | null;
      children: MCTSNode[];
      visits: number;
      wins: number;

      constructor(x: number, y: number, parent: MCTSNode | null = null) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.children = [];
        this.visits = 0;
        this.wins = 0;
      }

      ucb1(): number {
        if (this.visits === 0) return Infinity;
        return (
          this.wins / this.visits +
          Math.sqrt((2 * Math.log(this.parent!.visits)) / this.visits)
        );
      }

      addChild(x: number, y: number): MCTSNode {
        const child = new MCTSNode(x, y, this);
        this.children.push(child);
        return child;
      }

      selectBestChild(): MCTSNode {
        return this.children.reduce((best, child) =>
          child.ucb1() > best.ucb1() ? child : best,
        );
      }
    }

    const root = new MCTSNode(start.x, start.y);

    for (let i = 0; i < this.ROOT_SIMULATIONS; i++) {
      let node = root;
      const path: Position[] = [{ x: start.x, y: start.y }];

      // Selection and Expansion
      for (let depth = 0; depth < this.TREE_DEPTH; depth++) {
        if (node.children.length === 0) {
          // Expand
          const neighbors = getNeighbors(node.x, node.y);
          for (const neighbor of neighbors) {
            if (!isObstacle(neighbor.x, neighbor.y, obstacles, maze)) {
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

      // Simulation
      const reward = this.simulateRandomPath(
        node.x,
        node.y,
        goal,
        obstacles,
        maze,
      );

      // Backpropagation
      while (node) {
        node.visits++;
        node.wins += reward;
        node = node.parent!;
      }
    }

    // Build best path
    const path: Position[] = [];
    let current: MCTSNode | null = root;
    while (current && current.children.length > 0) {
      path.push({ x: current.x, y: current.y });
      current = current.children.reduce((best, child) =>
        child.visits > best.visits ? child : best,
      );
      if (current.x === goal.x && current.y === goal.y) {
        path.push({ x: current.x, y: current.y });
        break;
      }
    }

    return {
      path,
      explored,
      computeTime: performance.now() - startTime,
      success:
        path.length > 0 &&
        path[path.length - 1].x === goal.x &&
        path[path.length - 1].y === goal.y,
    };
  }

  private simulateRandomPath(
    startX: number,
    startY: number,
    goal: Position,
    obstacles: Obstacle[],
    maze: Maze,
  ): number {
    let x = startX;
    let y = startY;
    let steps = 0;
    const maxSteps = 50;

    while (steps < maxSteps) {
      if (x === goal.x && y === goal.y) return 1.0;

      const neighbors = getNeighbors(x, y);
      const validNeighbors = neighbors.filter(
        (n) => !isObstacle(n.x, n.y, obstacles, maze),
      );

      if (validNeighbors.length === 0) return 0.0;

      const next =
        validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      x = next.x;
      y = next.y;
      steps++;
    }

    return Math.max(0, 1.0 - heuristic({ x, y }, goal) / 100);
  }
}
