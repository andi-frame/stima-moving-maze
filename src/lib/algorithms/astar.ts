import {
  type Position,
  type PathfindingResult,
  type Obstacle,
  type Maze,
} from "@/types/config";
import { type PathfindingAlgorithm } from "./types";
import {
  getNeighbors,
  isObstacle,
  heuristic,
} from "@/lib/utils/pathfindingUtils";

export class AStar implements PathfindingAlgorithm {
  findPath(
    start: Position,
    goal: Position,
    obstacles: Obstacle[],
    maze: Maze,
  ): PathfindingResult {
    const startTime = performance.now();
    const openSet = [
      {
        ...start,
        g: 0,
        h: heuristic(start, goal),
        f: heuristic(start, goal),
        parent: null,
      },
    ];
    const closedSet = new Set<string>();
    const explored: Position[] = [];

    while (openSet.length > 0) {
      let current = openSet.reduce((min, node) =>
        node.f < min.f ? node : min,
      );
      const currentIndex = openSet.indexOf(current);
      openSet.splice(currentIndex, 1);
      closedSet.add(`${current.x},${current.y}`);
      explored.push({ x: current.x, y: current.y });

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

      const neighbors = getNeighbors(current.x, current.y);
      for (const neighbor of neighbors) {
        if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;
        if (isObstacle(neighbor.x, neighbor.y, obstacles, maze)) continue;

        const g = current.g + 1;
        const h = heuristic(neighbor, goal);
        const f = g + h;

        const existingNode = openSet.find(
          (n) => n.x === neighbor.x && n.y === neighbor.y,
        );
        if (!existingNode) {
          openSet.push({ ...neighbor, g, h, f, parent: current });
        } else if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = g + existingNode.h;
          existingNode.parent = current;
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
