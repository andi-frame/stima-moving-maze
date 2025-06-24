export const GRID_SIZE = 20;
export const CANVAS_SIZE = 600;
export const ROWS = CANVAS_SIZE / GRID_SIZE;
export const COLS = CANVAS_SIZE / GRID_SIZE;

export type Position = {
  x: number;
  y: number;
};

export type Obstacle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  moveCounter: number;
};

export type PathfindingResult = {
  path: Position[];
  explored: Position[];
  computeTime: number;
  success: boolean;
};

export type AlgorithmType = 'astar' | 'greedy' | 'mcts';

export type Maze = number[][];