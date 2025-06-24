import {
  type Position,
  type Obstacle,
  type Maze,
  ROWS,
  COLS,
} from "@/types/config";

export function initializeMaze(): Maze {
  const maze: Maze = [];
  for (let y = 0; y < ROWS; y++) {
    maze[y] = [];
    for (let x = 0; x < COLS; x++) {
      if (x === 0 || x === COLS - 1 || y === 0 || y === ROWS - 1) {
        maze[y][x] = 1;
      } else if ((x % 6 === 0 || y % 6 === 0) && Math.random() > 0.7) {
        maze[y][x] = 1;
      } else {
        maze[y][x] = 0;
      }
    }
  }
  return maze;
}

export function createObstacles(
  count: number,
  maze: Maze,
  start: Position,
  goal: Position,
): Obstacle[] {
  const obstacles: Obstacle[] = [];
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * (COLS - 4)) + 2;
      y = Math.floor(Math.random() * (ROWS - 4)) + 2;
    } while (
      maze[y][x] === 1 ||
      (x === start.x && y === start.y) ||
      (x === goal.x && y === goal.y)
    );

    obstacles.push({
      x,
      y,
      dx: Math.random() > 0.5 ? 1 : -1,
      dy: Math.random() > 0.5 ? 1 : -1,
      moveCounter: 0,
    });
  }
  return obstacles;
}
