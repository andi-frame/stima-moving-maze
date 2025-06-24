"use client";

import React, { useState, useEffect, useCallback } from "react";
import MazeCanvas from "@/app/_components/MazeCanvas";
import AlgorithmControls from "@/app/_components/AlgorithmControls";
import StatsDisplay from "@/app/_components/StatsDisplay";
import Legend from "@/app/_components/Legend";
import ComparisonResults from "@/app/_components/ComparisonResults";
import { AStar } from "@/lib/algorithms/astar";
import { Greedy } from "@/lib/algorithms/greedy";
import { MCTS } from "../lib/algorithms/mcts";
import { initializeMaze, createObstacles } from "../lib/utils/mazeUtils";
import { getNeighbors, isObstacle } from "../lib/utils/pathfindingUtils";
import {
  type Position,
  type Obstacle,
  type Maze,
  type AlgorithmType,
  COLS,
  ROWS,
} from "@/types/config";

export default function PathfindingPage() {
  const [maze, setMaze] = useState<Maze>([]);
  const [start, setStart] = useState<Position>({ x: 1, y: 1 });
  const [goal, setGoal] = useState<Position>({ x: COLS - 2, y: ROWS - 2 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [agent, setAgent] = useState<Position>({ x: 1, y: 1 });
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [currentAlgorithm, setCurrentAlgorithm] =
    useState<AlgorithmType>("astar");
  const [obstacleSpeed, setObstacleSpeed] = useState(3);
  const [obstacleCount, setObstacleCount] = useState(4);
  const [isRunning, setIsRunning] = useState(false);
  const [replanningCount, setReplanningCount] = useState(0);
  const [stats, setStats] = useState({
    pathLength: "-",
    computeTime: "-",
    nodesExplored: "-",
    success: "-",
    replanCount: "-",
  });
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);

  const algorithms = {
    astar: new AStar(),
    greedy: new Greedy(),
    mcts: new MCTS(),
  };

  const initializeGame = useCallback(() => {
    const newMaze = initializeMaze();
    setMaze(newMaze);
    setStart({ x: 1, y: 1 });
    setGoal({ x: COLS - 2, y: ROWS - 2 });
    setAgent({ x: 1, y: 1 });
    setCurrentPath([]);
    setReplanningCount(0);
    setObstacles(
      createObstacles(
        obstacleCount,
        newMaze,
        { x: 1, y: 1 },
        { x: COLS - 2, y: ROWS - 2 },
      ),
    );
    setStats({
      pathLength: "-",
      computeTime: "-",
      nodesExplored: "-",
      success: "-",
      replanCount: "-",
    });
  }, [obstacleCount]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const executeAlgorithm = useCallback(
    (
      algorithm: AlgorithmType,
      startPos: Position,
      goalPos: Position,
      currentObstacles: Obstacle[],
    ) => {
      const result = algorithms[algorithm].findPath(
        startPos,
        goalPos,
        currentObstacles,
        maze,
      );
      return result;
    },
    [maze],
  );

  const moveObstacles = useCallback(() => {
    setObstacles((prevObstacles) =>
      prevObstacles.map((obstacle) => {
        let newX = obstacle.x;
        let newY = obstacle.y;
        let newDx = obstacle.dx;
        let newDy = obstacle.dy;

        obstacle.moveCounter++;
        if (obstacle.moveCounter % (6 - obstacleSpeed) === 0) {
          newX = obstacle.x + obstacle.dx;
          newY = obstacle.y + obstacle.dy;

          if (
            newX <= 0 ||
            newX >= COLS - 1 ||
            maze[obstacle.y][newX] === 1 ||
            Math.random() > 0.8
          ) {
            newDx = -obstacle.dx;
            newX = obstacle.x;
          }
          if (
            newY <= 0 ||
            newY >= ROWS - 1 ||
            maze[newY][obstacle.x] === 1 ||
            Math.random() > 0.8
          ) {
            newDy = -obstacle.dy;
            newY = obstacle.y;
          }
        }

        return {
          ...obstacle,
          x: newX,
          y: newY,
          dx: newDx,
          dy: newDy,
        };
      }),
    );
  }, [maze, obstacleSpeed]);

  const animate = useCallback(() => {
    if (!isRunning) return;

    moveObstacles();

    // Check if agent needs replanning
    const agentBlocked = obstacles.some(
      (obs) => obs.x === agent.x && obs.y === agent.y,
    );
    const pathBlocked = currentPath.some((point) =>
      obstacles.some((obs) => obs.x === point.x && obs.y === point.y),
    );

    if (agentBlocked || pathBlocked || currentPath.length === 0) {
      // Replan
      setReplanningCount((prev) => prev + 1);
      const result = executeAlgorithm(currentAlgorithm, agent, goal, obstacles);
      setCurrentPath(result.path.slice(1));

      setStats({
        pathLength: result.path.length.toString(),
        computeTime: `${result.computeTime.toFixed(2)} ms`,
        nodesExplored: result.explored.length.toString(),
        success: result.success ? "Yes" : "No",
        replanCount: (replanningCount + 1).toString(),
      });
    }

    // Move agent along path
    if (currentPath.length > 0) {
      const nextStep = currentPath[0];
      setAgent(nextStep);
      setCurrentPath((prev) => prev.slice(1));

      // Check if reached goal
      if (nextStep.x === goal.x && nextStep.y === goal.y) {
        setIsRunning(false);
        return;
      }
    }

    requestAnimationFrame(animate);
  }, [
    isRunning,
    moveObstacles,
    obstacles,
    agent,
    currentPath,
    currentAlgorithm,
    goal,
    executeAlgorithm,
    replanningCount,
  ]);

  useEffect(() => {
    if (isRunning) {
      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }
  }, [isRunning, animate]);

  const handleStart = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    setAgent(start);
    setReplanningCount(0);

    const result = executeAlgorithm(currentAlgorithm, start, goal, obstacles);
    setCurrentPath(result.path.slice(1));
    setStats({
      pathLength: result.path.length.toString(),
      computeTime: `${result.computeTime.toFixed(2)} ms`,
      nodesExplored: result.explored.length.toString(),
      success: result.success ? "Yes" : "No",
      replanCount: "0",
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    initializeGame();
  };

  const handleCanvasClick = (
    x: number,
    y: number,
    modifiers: { ctrlKey: boolean; shiftKey: boolean; altKey: boolean },
  ) => {
    if (isRunning) return;

    if (modifiers.ctrlKey) {
      // Add/remove static obstacles
      setMaze((prevMaze) => {
        const newMaze = [...prevMaze];
        if (
          newMaze[y][x] === 0 &&
          !(x === start.x && y === start.y) &&
          !(x === goal.x && y === goal.y)
        ) {
          newMaze[y][x] = 1;
        } else if (newMaze[y][x] === 1) {
          newMaze[y][x] = 0;
        }
        return newMaze;
      });
    } else if (modifiers.shiftKey) {
      // Move start or goal
      if (maze[y][x] === 0) {
        if (modifiers.altKey) {
          setGoal({ x, y });
        } else {
          setStart({ x, y });
          setAgent({ x, y });
        }
      }
    }
  };

  const runComparison = async () => {
    if (isRunning) return;

    const algorithmsToCompare: AlgorithmType[] = ["astar", "greedy", "mcts"];
    const results: Record<string, any> = {};
    const trials = 5;

    setShowComparison(true);
    setComparisonData({ status: "running" });

    for (const algo of algorithmsToCompare) {
      results[algo] = {
        pathLength: [],
        computeTime: [],
        nodesExplored: [],
        successRate: 0,
        replanCount: [],
      };

      for (let trial = 0; trial < trials; trial++) {
        // Reset for each trial
        const newMaze = initializeMaze();
        let trialAgent = { ...start };
        let trialReplanCount = 0;
        let trialSuccess = false;
        let totalPathLength = 0;
        let totalComputeTime = 0;
        let totalNodesExplored = 0;

        // Create obstacles for this trial
        const trialObstacles = createObstacles(
          obstacleCount,
          newMaze,
          start,
          goal,
        );

        // Simulate pathfinding with dynamic obstacles
        for (let step = 0; step < 100; step++) {
          // Move obstacles
          const movedObstacles = trialObstacles.map((obstacle) => {
            let newX = obstacle.x;
            let newY = obstacle.y;
            let newDx = obstacle.dx;
            let newDy = obstacle.dy;

            obstacle.moveCounter++;
            if (obstacle.moveCounter % (6 - obstacleSpeed) === 0) {
              newX = obstacle.x + obstacle.dx;
              newY = obstacle.y + obstacle.dy;

              if (
                newX <= 0 ||
                newX >= COLS - 1 ||
                newMaze[obstacle.y][newX] === 1 ||
                Math.random() > 0.8
              ) {
                newDx = -obstacle.dx;
                newX = obstacle.x;
              }
              if (
                newY <= 0 ||
                newY >= ROWS - 1 ||
                newMaze[newY][obstacle.x] === 1 ||
                Math.random() > 0.8
              ) {
                newDy = -obstacle.dy;
                newY = obstacle.y;
              }
            }

            return {
              ...obstacle,
              x: newX,
              y: newY,
              dx: newDx,
              dy: newDy,
            };
          });

          const result = algorithms[algo].findPath(
            trialAgent,
            goal,
            movedObstacles,
            newMaze,
          );

          if (result.path.length > 0) {
            trialReplanCount++;
            totalPathLength += result.path.length;
            totalComputeTime += result.computeTime;
            totalNodesExplored += result.explored.length;

            // Move agent one step
            if (result.path.length > 1) {
              trialAgent = result.path[1];
            }

            // Check if reached goal
            if (trialAgent.x === goal.x && trialAgent.y === goal.y) {
              trialSuccess = true;
              break;
            }
          }

          // Add delay for realistic comparison
          await new Promise((resolve) => setTimeout(resolve, 10));
        }

        if (trialSuccess) {
          results[algo].successRate++;
          results[algo].pathLength.push(totalPathLength);
          results[algo].computeTime.push(totalComputeTime);
          results[algo].nodesExplored.push(totalNodesExplored);
          results[algo].replanCount.push(trialReplanCount);
        }
      }

      results[algo].successRate = (
        (results[algo].successRate / trials) *
        100
      ).toFixed(1);
    }

    setComparisonData(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white/95 p-6 shadow-2xl">
        <h1 className="mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-center text-4xl font-bold text-transparent">
          Pathfinding Algorithm Comparison
        </h1>
        <p className="mb-8 text-center text-lg text-gray-700">
          Research: A* vs Greedy Best-First vs MCTS in Dynamic Environments
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
          <div className="rounded-xl bg-gray-50 p-4 shadow-lg">
            <MazeCanvas
              maze={maze}
              start={start}
              goal={goal}
              obstacles={obstacles}
              agent={agent}
              currentPath={currentPath}
              onCanvasClick={handleCanvasClick}
            />
            <Legend />
          </div>

          <div className="space-y-6">
            <AlgorithmControls
              currentAlgorithm={currentAlgorithm}
              obstacleSpeed={obstacleSpeed}
              obstacleCount={obstacleCount}
              isRunning={isRunning}
              onAlgorithmChange={setCurrentAlgorithm}
              onSpeedChange={setObstacleSpeed}
              onCountChange={setObstacleCount}
              onStart={handleStart}
              onReset={handleReset}
              onCompare={runComparison}
            />

            <StatsDisplay
              algorithm={currentAlgorithm}
              pathLength={stats.pathLength}
              computeTime={stats.computeTime}
              nodesExplored={stats.nodesExplored}
              success={stats.success}
              replanCount={stats.replanCount}
            />

            {showComparison && (
              <ComparisonResults
                data={comparisonData}
                onClose={() => setShowComparison(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
