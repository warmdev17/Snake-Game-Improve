import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"] });
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

  const radius = 50; // radius of the circle
  const strokeWidth = 8; // stroke width of the circle
  const circumference = 2 * Math.PI * radius; // circumference of the circle

  const offset =
    timeRemaining > 0
      ? circumference -
        (timeRemaining / currentQuestion.timeLimit) * circumference
      : circumference;

  return (
    <div
      className={`z-50 absolute inset-0 flex flex-col justify-center items-center bg-gray-800 bg-opacity-75 text-white p-4 rounded-lg ${montserrat.className}`}
    >
      {timeRemaining > 0 && (
        <div className="relative flex justify-center items-center mb-10">
          <svg width="120" height="120" className="transform rotate-90">
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="gray"
              strokeWidth={strokeWidth}
              fill="none"
              className="circle-background"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#aad751"
              strokeWidth={strokeWidth}
              fill="none"
              className="circle-timer"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
                transition: "stroke-dashoffset 1s linear",
              }}
            />
          </svg>
          <div className="absolute text-4xl font-semibold">
            {timeRemaining}s
          </div>
        </div>
      )}

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
              className="text-2xl bg-[#aad751] hover:bg-[#578a34] text-black p-4 rounded"
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
