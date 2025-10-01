import Login from "./components/Login";
import GameLogic from "./components/GameLogic";
import { useWeb3 } from "./contexts/Web3Context";

const App = () => {
  const { walletAddress } = useWeb3();

  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="font-bold text-2xl">RPSLS</h1>
      <p>Welcome to Rock, Paper, Scissors, Lizard, Spock </p>
      {!walletAddress ? <Login /> : <GameLogic />}
    </div>
  );
};

export default App;
