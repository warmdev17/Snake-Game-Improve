"use client";
import { KeyboardEvent, useEffect, useState } from "react";
const GRID_SIZE = 30;

type Point = {
  x: number;
  y: number;
};

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([
    { y: 0, x: 2 },
    { y: 0, x: 1 },
    { y: 0, x: 0 },
  ]);
  const [point, setPoint] = useState<number>(0);
  const [food, setFood] = useState<Point>({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const generateFood = () => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    setFood({ x, y });
  };
  const moveSnake = () => {
    const newSnake = [...snake];
    const snakeHead = { ...newSnake[0] };

    if (direction === "UP") snakeHead.y -= 1;
    else if (direction === "DOWN") snakeHead.y += 1;
    else if (direction === "LEFT") snakeHead.x -= 1;
    else if (direction === "RIGHT") snakeHead.x += 1;

    if (
      snakeHead.x < 0 ||
      snakeHead.x > GRID_SIZE ||
      snakeHead.y < 0 ||
      snakeHead.y > GRID_SIZE ||
      newSnake.some(
        (snakePart) =>
          snakePart.x === snakeHead.x && snakePart.y === snakeHead.y,
      )
    ) {
      setGameOver(true);
      return;
    }
    newSnake.unshift(snakeHead);

    if (snakeHead.x === food.x && snakeHead.y === food.y) {
      setPoint(point + 1);
      generateFood();
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  };
  useEffect(() => {
    const interval = setInterval(moveSnake, 80);
    return () => clearInterval(interval);
  }, [snake, direction]);
  useEffect(() => {
    generateFood();
  }, []);
  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "w" && direction !== "DOWN") setDirection("UP");
    if (event.key === "s" && direction !== "UP") setDirection("DOWN");
    if (event.key === "a" && direction !== "RIGHT") setDirection("LEFT");
    if (event.key === "d" && direction !== "LEFT") setDirection("RIGHT");
  };
  return (
    <div>
      <div>Point: {point}</div>
      <div
        onKeyDown={handleKeyPress}
        tabIndex={0}
        autoFocus
        className="grid grid-cols-20 grid-rows-20 border border-black"
      >
        {gameOver && (
          <div className="absolute inset-0 flex justify-center items-center text-4xl font-bold text-red-500">
            Game Over
          </div>
        )}
        {Array.from({ length: GRID_SIZE }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: GRID_SIZE }).map((_, x) => (
              <div
                key={x}
                className={`w-5 h-5 border border-gray-3to-zinc-300 
                ${
                  snake.some(
                    (snakePart) => snakePart.x === x && snakePart.y === y,
                  ) && "bg-green-500"
                }
                ${food.x === x && food.y === y && "bg-red-500"}
              `}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
