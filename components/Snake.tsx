"use client";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import questions from "../public/questions.json";
import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"] });

const GRID_SIZE = 30;

type Point = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Question = {
  question: string;
  choices: string[];
  correctAnswer: string;
  timeLimit: number;
};
type GroupScore = number[];

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([
    { y: 0, x: 2 },
    { y: 0, x: 1 },
    { y: 0, x: 0 },
  ]);
  const [score, setScore] = useState<number>(0);
  const [food, setFood] = useState<Point>({ x: 0, y: 0 });
  const [questionFood, setQuestionFood] = useState<Point | null>(null);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game control states
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<number>(0);
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [scores, setScores] = useState<GroupScore>([0, 0, 0, 0]);

  const generateFood = () => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    setFood({ x, y });

    if (Math.random() < 0.2) {
      // Generate question food at a random position
      const questionX = Math.floor(Math.random() * GRID_SIZE);
      const questionY = Math.floor(Math.random() * GRID_SIZE);
      setQuestionFood({ x: questionX, y: questionY });

      // Set a timer to remove question food after 5 seconds if not eaten
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
      questionTimerRef.current = setTimeout(() => setQuestionFood(null), 5000);
    }
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
      setScore(score + 1);
      setScores((prevScores) => {
        const updatedScores = [...prevScores];
        updatedScores[currentGroup] += 1;
        return updatedScores;
      });
      generateFood();
    } else if (
      questionFood &&
      snakeHead.x === questionFood.x &&
      snakeHead.y === questionFood.y
    ) {
      const randomQuestion = questions[
        Math.floor(Math.random() * questions.length)
      ] as Question;
      setCurrentQuestion(randomQuestion);
      setShowQuestion(true);
      setTimeRemaining(randomQuestion.timeLimit);
      startTimer(randomQuestion.timeLimit);
      setQuestionFood(null); // Remove question food once eaten
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
          handleQuestionAnswer("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleQuestionAnswer = (answer: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentQuestion && answer === currentQuestion.correctAnswer) {
      setScore(score + 10);
      setScores((prevScores) => {
        const updatedScores = [...prevScores];
        updatedScores[currentGroup] += 10;
        return updatedScores;
      });
    }
    setShowQuestion(false);
    generateFood();
  };

  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, [gameOver]);

  useEffect(() => {
    if (isGameStarted && containerRef.current) containerRef.current.focus();
  }, [isGameStarted]);

  useEffect(() => {
    if (!isGameStarted || gameOver) return;

    const interval = setInterval(moveSnake, 80);
    return () => clearInterval(interval);
  }, [snake, direction, gameOver, showQuestion, isGameStarted]);

  const handleStartGame = () => {
    setIsGameStarted(true);
    setGameOver(false);
    setScore(0);
    setSnake([
      { y: 0, x: 2 },
      { y: 0, x: 1 },
      { y: 0, x: 0 },
    ]);
    setDirection("RIGHT");
    generateFood();
    containerRef.current?.focus();
  };

  const handleNextGroup = () => {
    setCurrentGroup((prevGroup) => (prevGroup + 1) % 4);
    if (currentGroup === 3) {
      setCurrentTurn((prevTurn) => (prevTurn + 1) % 12);
    }

    setGameOver(false);
    setScore(0);
    setDirection("RIGHT");
    setSnake([
      { y: 0, x: 2 },
      { y: 0, x: 1 },
      { y: 0, x: 0 },
    ]);
    generateFood();
    setCurrentQuestion(null);
    setShowQuestion(false);
    containerRef.current?.focus();
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (showQuestion) {
      if (["a", "b", "c", "d"].includes(event.key.toLowerCase())) {
        handleQuestionAnswer(event.key.toUpperCase());
      }
    } else {
      if (event.key === "ArrowUp" && direction !== "DOWN") setDirection("UP");
      if (event.key === "ArrowDown" && direction !== "UP") setDirection("DOWN");
      if (event.key === "ArrowLeft" && direction !== "RIGHT")
        setDirection("LEFT");
      if (event.key === "ArrowRight" && direction !== "LEFT")
        setDirection("RIGHT");
    }
  };

  return (
    <div>
      {isGameStarted ? (
        <div className="flex items-center justify-between flex-col">
          <div className="top-0 mt-16 text-white flex items-center justify-between w-[1200px] mb-12">
            {scores.map((score, index) => (
              <div
                key={index}
                className="text-xl w-[150px] text-center bg-green-500 text-white rounded"
              >
                Group {index + 1}: {score}
              </div>
            ))}
          </div>
          <div className="text-white bg-green-500 rounded text-lg w-[260px] text-center">
            Turn: {currentTurn} - Group: {currentGroup + 1}
          </div>
          <div className="text-white text-xl">Score: {score}</div>
          <div
            ref={containerRef}
            onKeyDown={handleKeyPress}
            tabIndex={0}
            autoFocus
            className={`grid grid-cols-${GRID_SIZE} grid-rows-${GRID_SIZE} border border-[#3A4F63] focus:outline-none`}
          >
            {gameOver && (
              <div className="absolute inset-0 flex flex-col justify-center items-center text-4xl font-bold text-red-500 bg-black bg-opacity-60">
                Game Over
                <button
                  onClick={handleNextGroup}
                  className="mt-4 p-2 bg-green-500 text-white rounded"
                >
                  Next Group
                </button>
              </div>
            )}
            {showQuestion && currentQuestion && (
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-800 bg-opacity-75 text-white p-4 rounded-lg">
                <p className="text-4xl mb-4">{currentQuestion.question}</p>
                {currentQuestion.choices.map((choice, index) => (
                  <p key={index} className="text-4xl">
                    {choice}
                  </p>
                ))}
                <p className="mt-4 text-sm">Press A, B, C, or D to answer</p>
                <p className="mt-2 text-lg">Time remaining: {timeRemaining}s</p>
              </div>
            )}
            {Array.from({ length: GRID_SIZE }).map((_, y) => (
              <div key={y} className="flex bg-[#1e1e28]">
                {Array.from({ length: GRID_SIZE }).map((_, x) => (
                  <div
                    key={x}
                    className={`w-5 h-5 border-gray-300 ${
                      snake.some(
                        (snakePart) => snakePart.x === x && snakePart.y === y,
                      )
                        ? "bg-[#4CAF50]"
                        : food.x === x && food.y === y
                          ? "bg-[#FF5252]"
                          : questionFood &&
                              questionFood.x === x &&
                              questionFood.y === y
                            ? "bg-blue-500"
                            : ""
                    }`}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div
            className={`flex justify-around items-center flex-col h-40 font-bold ${montserrat.className}`}
          >
            <h1 className="text-5xl text-white">RẮN SĂN MỒI</h1>
            <button
              onClick={handleStartGame}
              className="p-4 bg-green-500 text-white text-xl rounded"
            >
              Start Game
            </button>
          </div>
        </>
      )}
    </div>
  );
}
