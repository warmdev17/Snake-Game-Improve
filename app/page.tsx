import SnakeGame from "@/components/SnakeGame";

const Home: React.FC = () => {
  return (
    <div className="flex justify-center bg-[#4a752c] items-center h-screen flex-col">
      <SnakeGame />
    </div>
  );
};

export default Home;
