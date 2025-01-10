type ScoreBoardProps = {
  scores: number[];
  currentTurn: number;
  currentGroup: number;
};

export default function ScoreBoard({
  scores,
  currentGroup,
  currentTurn,
}: ScoreBoardProps) {
  return (
    <div className="flex items-center justify-center flex-col h-[180px] mb-4">
      <div className="top-0 mt-16 text-white flex items-center justify-between w-[1200px] mb-12">
        {scores.map((score, index) => (
          <div
            key={index}
            className={`text-xl w-[150px] text-center h-12 bg-[#aad751] pb-2 border-2 border-[#578a34] text-black rounded flex items-center justify-center `}
          >
            <span>
              Nhóm {index + 1}: {score}
            </span>
          </div>
        ))}
      </div>
      <div className=" bg-[#aad751] border-2 border-[#578a34] pb-2 rounded w-[260px] text-center h-10 flex items-center justify-center">
        <span className={`text-lg text-black `}>
          Lượt: {currentTurn} - Nhóm: {currentGroup + 1}
        </span>
      </div>
    </div>
  );
}
