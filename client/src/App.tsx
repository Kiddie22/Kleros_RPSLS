import Login from "./components/Login";
import GameTabs from "./components/GameTabs";
import { useWeb3 } from "./contexts/Web3Context";
import { Card } from "./components/ui/card";

const App = () => {
  const { walletAddress, isCorrectNetwork } = useWeb3();

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen flex items-center justify-center md:px-8 lg:px-16 xl:px-32 2xl:px-64 bg-gray-50">
        <Card className="w-full">
          <div className="text-center mb-8">
            <h1 className="font-bold text-3xl text-gray-800 mb-2">RPSLS</h1>

            <hr className="my-4 mx-10" />
            <div className="text-center space-y-4">
              <div className="border-red-500 px-4 py-3 rounded">
                <p className="font-bold text-lg text-red-500">Wrong Network!</p>
                <p className="text-gray-600 font-light">
                  This dApp only works on Sepolia testnet.
                </p>
                <p className="text-gray-600 font-light">
                  Please switch networks to begin
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center md:px-8 lg:px-16 xl:px-32 2xl:px-64 bg-gray-50">
      <Card className="w-full">
        <div className="text-center mb-8">
          <h1 className="font-bold text-3xl text-gray-800 mb-2">RPSLS</h1>
          <p className="text-gray-600">
            Welcome to Rock, Paper, Scissors, Lizard, Spock
          </p>
        </div>
        {!walletAddress ? <Login /> : <GameTabs />}
      </Card>
    </div>
  );
};

export default App;
