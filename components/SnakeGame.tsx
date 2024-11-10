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
  const [gameSpeed, setGameSpeed] = useState<number>(90); // Initial game speed
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

    if (currentQuestion && answer === currentQuestion.correctAnswer) {
      // Correct answer: Add 10 points
      setScore((prevScore) => prevScore + 10);
      setScores((prevScores) => {
        const updatedScores = [...prevScores];
        updatedScores[currentGroup] += 10;
        return updatedScores;
      });
    } else {
      // Incorrect answer or time up: Deduct 5 points
      setScore((prevScore) => prevScore - 5); // Ensure score doesn't go negative
      setScores((prevScores) => {
        const updatedScores = [...prevScores];
        updatedScores[currentGroup] = Math.max(
          updatedScores[currentGroup] - 5,
          0,
        ); // Avoid negative score
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

  // Adjust speed based on score
  useEffect(() => {
    if (score % 10 === 0 && score !== 0) {
      setGameSpeed((prevSpeed) => prevSpeed - 10); // Increase speed
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
    setGameSpeed(80); // Reset speed for the new group
    generateFood();
    setCurrentQuestion(null);
    setShowQuestion(false);
    containerRef.current?.focus();
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (showQuestion) {
      if (["1", "2", "3", "4"].includes(event.key)) {
        const choiceIndex = parseInt(event.key) - 1;
        if (currentQuestion) {
          handleQuestionAnswer(currentQuestion.choices[choiceIndex]);
        }
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
            Lượt: {currentTurn} - Nhóm: {currentGroup + 1}
          </div>
          <div className="text-white text-xl">Điểm hiện tại: {score}</div>
          <div
            ref={containerRef}
            onKeyDown={handleKeyPress}
            tabIndex={0}
            autoFocus
            className={`grid grid-cols-${GRID_SIZE} grid-rows-${GRID_SIZE} border border-[#3A4F63] focus:outline-none`}
          >
            {gameOver && (
              <div className="absolute inset-0 flex flex-col justify-center items-center text-4xl font-bold text-red-500 bg-black bg-opacity-60">
                HAHA gàaaaaaaaa
                <button
                  onClick={handleNextGroup}
                  className="mt-4 p-2 bg-green-500 text-white rounded"
                >
                  Nhóm tiếp theo
                </button>
              </div>
            )}
            {showQuestion && currentQuestion && (
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-800 bg-opacity-75 text-white p-4 rounded-lg">
                <div className="flex flex-col justify-between items-center">
                  <p className="text-4xl mb-4 font-semibold">
                    {currentQuestion.question}
                  </p>
                  {currentQuestion.choices.map((choice, index) => (
                    <button
                      key={index}
                      className="text-4xl bg-green-500 mb-5 mt-5 text-left"
                    >
                      {choice}
                    </button>
                  ))}
                  <p className="mt-2 text-lg">
                    Thời gian còn lại: {timeRemaining}s
                  </p>
                </div>
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
              Bắt đầu
            </button>
          </div>
        </>
      )}
    </div>
  );
}
