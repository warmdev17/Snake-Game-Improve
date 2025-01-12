"use client";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import questions from "../public/questions.json";
import Question from "./Question";
import ScoreBoard from "./ScoreBoard";
import GameOver from "./GameOver";

const GRID_SIZE = 30;

// sound effect
const foodSound = new Audio("/sound_effect/pop.mp3");
const rightSound = new Audio("/sound_effect/right.mp3");
const wrongSound = new Audio("/sound_effect/wrong.mp3");
const clickSound = new Audio("/sound_effect/click.mp3");
const winningSound = new Audio("/sound_effect/winning.mp3");

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
  const usedQuestionIndices = useRef<Set<number>>(new Set());

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
      foodSound.play();

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
      foodSound.play();
      const availableQuestions = questions.filter(
        (_, index) => !usedQuestionIndices.current.has(index),
      );

      if (availableQuestions.length === 0) {
        console.log("All questions have been used!");
        setQuestionFood(null);
      } else {
        const randomIndex = Math.floor(
          Math.random() * availableQuestions.length,
        );
        const selectedQuestion = availableQuestions[randomIndex];

        const actualIndex = questions.findIndex((q) => q === selectedQuestion);
        usedQuestionIndices.current.add(actualIndex);

        setCurrentQuestion(selectedQuestion);
        setShowQuestion(true);
        setTimeRemaining(selectedQuestion.timeLimit);
        startTimer(selectedQuestion.timeLimit);
      }

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
    clickSound.play();
    if (
      currentQuestion &&
      answer.trim().toLowerCase() ===
        currentQuestion.correctAnswer.trim().toLowerCase()
    ) {
      // play sound
      rightSound.play();
      // Correct answer: Add 10 points
      setScore((prevScore) => prevScore + 10);
      setScores((prevScores) => {
        const updatedScores = [...prevScores];
        updatedScores[currentGroup] += 10;
        return updatedScores;
      });
    } else {
      // play sound
      wrongSound.play();
      // Incorrect answer or time up: Deduct 10 points
      setScore((prevScore) => Math.max(prevScore - 10, 0)); // Ensure score doesn't go below zero
      setScores((prevScores) => {
        const updatedScores = [...prevScores];
        updatedScores[currentGroup] = Math.max(
          updatedScores[currentGroup] - 10,
          0,
        ); // Ensure group score doesn't go below zero
        return updatedScores;
      });
    }

    setShowQuestion(false);
    containerRef.current?.focus();
    generateFood();
  };

  // Ensure the Sound Is Non-Intrusive
  useEffect(() => {
    foodSound.load();
    wrongSound.load();
    rightSound.load();
  }, []);

  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, [gameOver]);

  useEffect(() => {
    if (isGameStarted && containerRef.current) containerRef.current.focus();
  }, [isGameStarted]);

  // Adjust speed based on score
  const [nextSpeedThreshold, setNextSpeedThreshold] = useState(10);

  useEffect(() => {
    if (score >= nextSpeedThreshold) {
      setGameSpeed((prevSpeed) => Math.max(prevSpeed - 10, 30)); // Ensure a minimum speed
      setNextSpeedThreshold((prevThreshold) => prevThreshold + 10);
      console.log(gameSpeed);
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
    setGameSpeed(90); // Reset speed when starting a new game
    setNextSpeedThreshold(10); // Reset speed threshold
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
    setGameSpeed(90); // Reset speed for the new group
    setNextSpeedThreshold(10); // Reset speed threshold
    setQuestionFood(null);
    generateFood();
    setCurrentQuestion(null);
    setShowQuestion(false);
    containerRef.current?.focus();
  };

  const getWinningGroup = () => {
    winningSound.play();
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
    <>
      {isGameStarted ? (
        <div className="overflow-y-hidden flex items-center justify-between flex-col">
          <ScoreBoard
            scores={scores}
            currentGroup={currentGroup}
            currentTurn={currentTurn}
          />
          <div className={`text-white text-xl mb-6 text-center`}>
            Điểm hiện tại: {score}
          </div>
          <div
            ref={containerRef}
            onKeyDown={handleKeyPress}
            tabIndex={0}
            autoFocus
            className={`grid grid-cols-${GRID_SIZE} grid-rows-${GRID_SIZE} border-[#578a34] border-8 focus:outline-none`}
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
              <div key={y} className="flex bg-[#aad751] bg-cover bg-center ">
                {Array.from({ length: GRID_SIZE }).map((_, x) => (
                  <div
                    key={x}
                    className={`w-5 h-5 border-[#578a34] ${
                      snake.some(
                        (snakePart) => snakePart.x === x && snakePart.y === y,
                      )
                        ? "bg-[#4472e7]"
                        : food.x === x && food.y === y
                          ? "bg-[#FF5252] rounded-full pulse food"
                          : questionFood &&
                              questionFood.x === x &&
                              questionFood.y === y
                            ? "bg-blue-500 rounded-full pulse food"
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
            className={`z-20 flex justify-around items-center flex-col h-40 font-bold `}
          >
            <h1 className="text-5xl text-white mb-4">Rắn săn mồi</h1>
            <button
              onClick={handleStartGame}
              className="p-4 bg-[#aad751] hover:bg-[#578a34] hover:text-white text-black text-xl rounded mt-4 mb-4"
            >
              Bắt đầu
            </button>
            <div className="text-white font-medium text-center">
              Thiết kế và phát triển bởi warmdev
            </div>
          </div>
        </>
      )}
    </>
  );
}
