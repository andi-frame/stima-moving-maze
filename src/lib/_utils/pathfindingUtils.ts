import {
  type Position,
  type Obstacle,
  type Maze,
  COLS,
  ROWS,
} from "@/types/config";

export function heuristic(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function getNeighbors(x: number, y: number): Position[] {
  return [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ].filter((n) => n.x >= 0 && n.x < COLS && n.y >= 0 && n.y < ROWS);
}

export function isObstacle(
  x: number,
  y: number,
  dynamicObstacles: Obstacle[],
  maze: Maze,
): boolean {
  if (maze[y] && maze[y][x] === 1) return true;
  return dynamicObstacles.some((obs) => obs.x === x && obs.y === y);
}
