export const canvas = document.getElementById("maze");
export const ctx = canvas.getContext("2d");
export const GRID_SIZE = 20;
export const ROWS = canvas.height / GRID_SIZE;
export const COLS = canvas.width / GRID_SIZE;