"use client";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import questions from "../public/questions.json"; // Import the questions JSON file

const GRID_SIZE = 30;

type Point = {
  x: number;
  y: number;
};

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

// Define the Question type based on the structure in questions.json
type Question = {
  question: string;
  choices: string[];
  correctAnswer: string;
  timeLimit: number;
};

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
  const [isQuestion, setIsQuestion] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateFood = () => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    setFood({ x, y });

    // Randomly decide if this food should trigger a question
    setIsQuestion(Math.random() < 0.2); // 20% chance to spawn question food
  };

  const moveSnake = () => {
    if (gameOver || showQuestion) return;

    const newSnake = [...snake];
    const snakeHead = { ...newSnake[0] };

    if (direction === "UP") snakeHead.y -= 1;
    else if (direction === "DOWN") snakeHead.y += 1;
    else if (direction === "LEFT") snakeHead.x -= 1;
    else if (direction === "RIGHT") snakeHead.x += 1;

    if (
      snakeHead.x < 0 ||
      snakeHead.x >= GRID_SIZE ||
      snakeHead.y < 0 ||
      snakeHead.y >= GRID_SIZE ||
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
      if (isQuestion) {
        // Display question
        const randomQuestion = questions[
          Math.floor(Math.random() * questions.length)
        ] as Question;
        setCurrentQuestion(randomQuestion);
        setShowQuestion(true);
        setTimeRemaining(randomQuestion.timeLimit);
        startTimer(randomQuestion.timeLimit);
      } else {
        // Normal food, increase points by 1
        setPoint(point + 1);
        generateFood();
      }
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const startTimer = (duration: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeRemaining(duration);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleQuestionAnswer(""); // Time ran out, treat as incorrect answer
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleQuestionAnswer = (answer: string) => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentQuestion && answer === currentQuestion.correctAnswer) {
      setPoint(point + 10); // Correct answer, +10 points
    } else {
      setPoint(point - 10); // Wrong or no answer, -10 points
    }
    setShowQuestion(false);
    generateFood(); // Generate new food after question
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [gameOver]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 80);
    return () => clearInterval(interval);
  }, [snake, direction, gameOver, showQuestion]);

  useEffect(() => {
    generateFood();
  }, []);

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (showQuestion) {
      // Handling question answers
      if (["a", "b", "c", "d"].includes(event.key.toLowerCase())) {
        handleQuestionAnswer(event.key.toUpperCase());
      }
    } else {
      // Handling movement
      if (event.key === "w" && direction !== "DOWN") setDirection("UP");
      if (event.key === "s" && direction !== "UP") setDirection("DOWN");
      if (event.key === "a" && direction !== "RIGHT") setDirection("LEFT");
      if (event.key === "d" && direction !== "LEFT") setDirection("RIGHT");
    }
  };

  return (
    <div>
      <div>Point: {point}</div>
      <div
        ref={containerRef}
        onKeyDown={handleKeyPress}
        tabIndex={0}
        autoFocus
        className={`grid grid-cols-${GRID_SIZE} grid-rows-${GRID_SIZE} border border-black`}
      >
        {gameOver && (
          <div className="absolute inset-0 flex justify-center items-center text-4xl font-bold text-red-500">
            Game Over
          </div>
        )}
        {showQuestion && currentQuestion && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-800 bg-opacity-75 text-white p-4 rounded-lg">
            <p className="text-xl mb-4">{currentQuestion.question}</p>
            {currentQuestion.choices.map((choice: string, index: number) => (
              <p key={index} className="text-lg">
                {choice}
              </p>
            ))}
            <p className="mt-4 text-sm">Press A, B, C, or D to answer</p>
            <p className="mt-2 text-lg">Time remaining: {timeRemaining}s</p>
          </div>
        )}
        {Array.from({ length: GRID_SIZE }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: GRID_SIZE }).map((_, x) => (
              <div
                key={x}
                className={`w-5 h-5 border border-gray-300 
                ${
                  snake.some(
                    (snakePart) => snakePart.x === x && snakePart.y === y,
                  ) && "bg-green-500"
                }
                ${food.x === x && food.y === y && (isQuestion ? "bg-blue-500" : "bg-red-500")}
              `}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
