import {
  type Position,
  type PathfindingResult,
  type Obstacle,
  type Maze,
} from "@/types/config";

export interface PathfindingAlgorithm {
  findPath(
    start: Position,
    goal: Position,
    obstacles: Obstacle[],
    maze: Maze,
  ): PathfindingResult;
}
