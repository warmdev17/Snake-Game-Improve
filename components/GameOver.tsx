type Props = {
  isLastTurn: boolean;
  handleNextGroup: () => void;
  winningGroup?: { group: string | number; score: number };
};

export default function GameOver({
  isLastTurn,
  handleNextGroup,
  winningGroup,
}: Props) {
  return (
    <>
      {isLastTurn ? (
        <div className="absolute inset-0 flex flex-col justify-center items-center text-4xl font-bold text-red-500 bg-black bg-opacity-60">
          <div className="text-8xl text-center p-4">🏆</div>
          <div className="text-yellow-500 text-center">
            Winner winner Snake Dinner
          </div>
          <div className="text-white text-center">
            Nhóm {winningGroup?.group}
          </div>
          <div className="text-center">Điểm: {winningGroup?.score}</div>
          <button
            onClick={handleNextGroup}
            className="mt-4 p-2 bg-green-500 text-white rounded"
          >
            Play Again
          </button>
        </div>
      ) : (
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
    </>
  );
}
