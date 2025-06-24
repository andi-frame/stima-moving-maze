import type {
  Position,
  PathfindingResult,
  Obstacle,
  Maze,
} from "@/types/config";
import { type PathfindingAlgorithm } from "@/lib/algorithms/types";
import { getNeighbors, isObstacle, heuristic } from "../utils/pathfindingUtils";

export class Greedy implements PathfindingAlgorithm {
  findPath(
    start: Position,
    goal: Position,
    obstacles: Obstacle[],
    maze: Maze,
  ): PathfindingResult {
    const startTime = performance.now();
    const openSet = [{ ...start, h: heuristic(start, goal), parent: null }];
    const closedSet = new Set<string>();
    const explored: Position[] = [];

    while (openSet.length > 0) {
      // Find node with lowest h score (greedy approach)
      let current = openSet.reduce((min, node) =>
        node.h < min.h ? node : min,
      );
      const currentIndex = openSet.indexOf(current);
      openSet.splice(currentIndex, 1);
      closedSet.add(`${current.x},${current.y}`);
      explored.push({ x: current.x, y: current.y });

      // Goal reached
      if (current.x === goal.x && current.y === goal.y) {
        const path: Position[] = [];
        while (current) {
          path.unshift({ x: current.x, y: current.y });
          current = current.parent;
        }
        return {
          path,
          explored,
          computeTime: performance.now() - startTime,
          success: true,
        };
      }

      // Check neighbors
      const neighbors = getNeighbors(current.x, current.y);
      for (const neighbor of neighbors) {
        if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;
        if (isObstacle(neighbor.x, neighbor.y, obstacles, maze)) continue;

        const h = heuristic(neighbor, goal);
        const existingNode = openSet.find(
          (n) => n.x === neighbor.x && n.y === neighbor.y,
        );

        if (!existingNode) {
          openSet.push({ ...neighbor, h, parent: current });
        }
      }
    }

    return {
      path: [],
      explored,
      computeTime: performance.now() - startTime,
      success: false,
    };
  }
}
