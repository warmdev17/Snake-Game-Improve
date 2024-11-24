"use client";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import questions from "../public/questions.json";
import { Montserrat } from "next/font/google";
import Question from "./Question";
import ScoreBoard from "./ScoreBoard";
import GameOver from "./GameOver";
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
  const [gameSpeed, setGameSpeed] = useState<number>(90); // Initial game speed
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game control states
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<number>(0);
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [scores, setScores] = useState<GroupScore>([0, 0, 0, 0]);
  const [isLastTurn, setIsLastTurn] = useState(false);

  const generateFood = () => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    setFood({ x, y });

    if (Math.random() < 0.25) {
      const questionX = Math.floor(Math.random() * GRID_SIZE);
      const questionY = Math.floor(Math.random() * GRID_SIZE);
      setQuestionFood({ x: questionX, y: questionY });

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
      if (currentTurn === 12 && currentGroup === 3) {
        setIsLastTurn(true);
      }
      return;
    }

    newSnake.unshift(snakeHead);
    if (snakeHead.x === food.x && snakeHead.y === food.y) {
      setScore((prevScore) => prevScore + 1);

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
      setQuestionFood(null);
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
    if (
      currentQuestion &&
      answer.trim().toLowerCase() ===
        currentQuestion.correctAnswer.trim().toLowerCase()
    ) {
      // Correct answer: Add 10 points
      setScore((prevScore) => prevScore + 10);
      setScores((prevScores) => {
        const updatedScores = [...prevScores];
        updatedScores[currentGroup] += 10;
        return updatedScores;
      });
    } else {
      // Incorrect answer or time up: Deduct 5 points
      setScore((prevScore) => Math.max(prevScore - 5, 0)); // Ensure score doesn't go below zero
      setScores((prevScores) => {
        const updatedScores = [...prevScores];
        updatedScores[currentGroup] = Math.max(
          updatedScores[currentGroup] - 5,
          0,
        ); // Ensure group score doesn't go below zero
        return updatedScores;
      });
    }

    setShowQuestion(false);
    containerRef.current?.focus();
    generateFood();
  };

  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, [gameOver]);

  useEffect(() => {
    if (isGameStarted && containerRef.current) containerRef.current.focus();
  }, [isGameStarted]);

  // Adjust speed based on score
  useEffect(() => {
    if (score % 10 === 0 && score !== 0) {
      setGameSpeed((prevSpeed) => prevSpeed - 20); // Increase speed
    }
  }, [score]);

  useEffect(() => {
    if (!isGameStarted || gameOver) return;

    const interval = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(interval);
  }, [snake, direction, gameOver, showQuestion, isGameStarted, gameSpeed]);

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
    setGameSpeed(80); // Reset speed when starting a new game
    generateFood();
    containerRef.current?.focus();
  };

  const handleNextGroup = () => {
    if (isLastTurn) {
      // Reset game for new rounds if necessary
      setCurrentTurn(1);
      setCurrentGroup(0);
      setScores([0, 0, 0, 0]); // Reset scores for all groups
      setIsLastTurn(false);
    } else {
      setCurrentGroup((prevGroup) => (prevGroup + 1) % 4);
      if (currentGroup === 3) {
        setCurrentTurn((prevTurn) => prevTurn + 1);
      }
    }

    setGameOver(false);
    setScore(0);
    setSnake([
      { y: 0, x: 2 },
      { y: 0, x: 1 },
      { y: 0, x: 0 },
    ]);
    setDirection("RIGHT");
    setGameSpeed(80); // Reset speed for the new group
    setQuestionFood(null);
    generateFood();
    setCurrentQuestion(null);
    setShowQuestion(false);
    containerRef.current?.focus();
  };

  const getWinningGroup = () => {
    const maxScore = Math.max(...scores);
    const winners = scores
      .map((score, index) => ({ group: index + 1, score }))
      .filter((item) => item.score === maxScore);
    return winners.length === 1
      ? winners[0]
      : { group: "Tie", score: maxScore }; // Handle ties
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
          <ScoreBoard
            scores={scores}
            currentGroup={currentGroup}
            currentTurn={currentTurn}
          />
          <div className="text-white text-xl">Điểm hiện tại: {score}</div>
          <div
            ref={containerRef}
            onKeyDown={handleKeyPress}
            tabIndex={0}
            autoFocus
            className={`grid grid-cols-${GRID_SIZE} grid-rows-${GRID_SIZE} border border-[#3A4F63] focus:outline-none`}
          >
            {gameOver && (
              <GameOver
                handleNextGroup={handleNextGroup}
                isLastTurn={isLastTurn}
                winningGroup={isLastTurn ? getWinningGroup() : undefined}
              />
            )}
            {showQuestion && currentQuestion && (
              <Question
                currentQuestion={currentQuestion}
                timeRemaining={timeRemaining}
                onAnswer={handleQuestionAnswer}
              />
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
            <h1 className="text-5xl text-white mb-4">RẮN SĂN MỒI</h1>
            <button
              onClick={handleStartGame}
              className="p-4 bg-green-500 hover:bg-green-700 text-white text-xl rounded"
            >
              Bắt đầu
            </button>
            <div className="text-white font-thin">designed by warmdev</div>
          </div>
        </>
      )}
    </div>
  );
}
