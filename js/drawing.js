import { ctx, canvas, GRID_SIZE, ROWS, COLS } from "./config.js";
import * as state from "./state.js";

export function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (state.maze[y][x] === 1) {
        ctx.fillStyle = "#2d3748";
        ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      }
    }
  }

  ctx.fillStyle = "#3182ce";
  for (let point of state.currentPath) {
    ctx.fillRect(point.x * GRID_SIZE + 2, point.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
  }

  ctx.fillStyle = "#48bb78";
  ctx.fillRect(state.start.x * GRID_SIZE, state.start.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

  ctx.fillStyle = "#ed8936";
  ctx.fillRect(state.goal.x * GRID_SIZE, state.goal.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

  ctx.fillStyle = "#e53e3e";
  for (let obstacle of state.obstacles) {
    ctx.fillRect(obstacle.x * GRID_SIZE, obstacle.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  }

  ctx.fillStyle = "#805ad5";
  ctx.fillRect(state.agent.x * GRID_SIZE + 3, state.agent.y * GRID_SIZE + 3, GRID_SIZE - 6, GRID_SIZE - 6);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvas.width, i * GRID_SIZE);
    ctx.stroke();
  }
}
