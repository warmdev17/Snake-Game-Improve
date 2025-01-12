import { useEffect } from "react";

type Props = {
  isLastTurn: boolean;
  handleNextGroup: () => void;
  winningGroup?: { group: string | number; score: number };
};

const annoy = [
  "kay kay kay",
  "quá gà",
  "non",
  "íu",
  "gêm ô vờ",
  "hahaahahahah",
  "cay chưa",
];

export default function GameOver({
  isLastTurn,
  handleNextGroup,
  winningGroup,
}: Props) {
  const randomAnnoy = () => Math.floor(Math.random() * annoy.length);
  useEffect(() => {
    const handleKeyPress = () => {
      handleNextGroup();
    };

    window.addEventListener("keydown", handleKeyPress);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleNextGroup]);
  return (
    <div className="z-40">
      {isLastTurn ? (
        <div className=" absolute inset-0 flex flex-col justify-center items-center text-4xl font-bold text-red-500 bg-black bg-opacity-60">
          <div className="text-8xl text-center m-4 p-4">🏆</div>
          <div className="text-yellow-500 m-4 text-center">
            Winner winner Snake Dinner
          </div>
          <div className="text-white text-center m-4">
            Nhóm {winningGroup?.group}
          </div>
          <div className="text-center m-4">Điểm: {winningGroup?.score}</div>
          <button
            onClick={handleNextGroup}
            className="mt-4 p-2 pb-4 bg-[#aad751] text-white rounded"
          >
            Làm lại
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col justify-center items-center text-4xl font-bold text-red-500 bg-black bg-opacity-60">
          {annoy[randomAnnoy()]}
          <button
            onClick={handleNextGroup}
            className="mt-8 p-2 bg-[#aad751] pb-6 pt-4 text-white rounded"
          >
            Nhóm tiếp theo
          </button>
          <p className="text-white text-sm pt-4">Ấn phím bất kì để tiếp tục</p>
        </div>
      )}
    </div>
  );
}
