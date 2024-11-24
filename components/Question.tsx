"use client";
type Question = {
  question: string;
  choices: string[];
  correctAnswer: string;
  timeLimit: number;
};

type QuestionDisplayProps = {
  currentQuestion: Question | null;
  timeRemaining: number;
  onAnswer: (answer: string) => void;
};

export default function Question({
  currentQuestion,
  timeRemaining,
  onAnswer,
}: QuestionDisplayProps) {
  if (!currentQuestion) return null;

  // Calculate percentage of time remaining for progress bar
  const progressWidth = (timeRemaining / currentQuestion.timeLimit) * 100;

  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-800 bg-opacity-75 text-white p-4 rounded-lg">
      {/* Timer Bar */}
      <div className="relative w-[80%] h-4 bg-gray-500 rounded-full overflow-hidden mb-10">
        <div
          className="h-full bg-green-500 transition-all duration-100 ease-linear"
          style={{ width: `${progressWidth}%` }}
        />
      </div>
      <div className="flex flex-col justify-between items-center">
        {/* Question Text */}
        <p className="text-4xl mb-4 font-semibold">
          {currentQuestion.question}
        </p>
        {/* Answer Choices */}
        <div className="grid grid-rows-2 grid-cols-2 gap-4">
          {currentQuestion.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onAnswer(choice[0])}
              className="text-2xl bg-green-500 hover:bg-green-700 text-white p-4 rounded"
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
