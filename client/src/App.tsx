import Login from "./components/Login";
import GameLogic from "./components/GameLogic";
import { useWeb3 } from "./contexts/Web3Context";
import { Card } from "./components/ui/card";

const App = () => {
  const { walletAddress } = useWeb3();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full">
        <div className="text-center mb-8">
          <h1 className="font-bold text-3xl text-gray-800 mb-2">RPSLS</h1>
          <p className="text-gray-600">
            Welcome to Rock, Paper, Scissors, Lizard, Spock
          </p>
        </div>
        {!walletAddress ? <Login /> : <GameLogic />}
      </Card>
    </div>
  );
};

export default App;
