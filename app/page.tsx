import SnakeGame from "@/components/SnakeGame";

const Home: React.FC = () => {
  return (
    <div className="flex justify-center bg-[#1D1D1D] items-center h-screen flex-col">
      <SnakeGame />
    </div>
  );
};

export default Home;
