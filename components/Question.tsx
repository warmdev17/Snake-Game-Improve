export default function Question() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-800 bg-opacity-75 text-white p-4 rounded-lg">
      <div className="flex flex-col justify-between items-center">
        <p className="text-4xl mb-4 font-semibold">question</p>
        <button className="text-4xl bg-green-500 h-10 mb-5 mt-5 text-left">
          A
        </button>
        <button className="text-4xl bg-green-500 h-10 mb-5 mt-5 text-left">
          B
        </button>
        <button className="text-4xl bg-green-500 h-10 mb-5 mt-5 text-left">
          C
        </button>
        <button className="text-4xl bg-green-500 h-10 mb-5 mt-5 text-left">
          D
        </button>
        <p className="mt-2 text-lg">Thời gian còn lại: {5}s</p>
      </div>
    </div>
  );
}
