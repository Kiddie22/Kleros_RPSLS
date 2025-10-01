import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewGameTab from "./NewGameTab";
import { useWeb3 } from "@/contexts/Web3Context";
import JoinGameTab from "./JoinGameTab";
import SolveGameTab from "./SolveGameTab";
import TimeoutGameTab from "./TimeoutGameTab";

const GameLogic = () => {
  const { walletAddress } = useWeb3();

  return (
    <div>
      <span>Welcome {walletAddress}</span>

      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="new">Start a new game</TabsTrigger>
          <TabsTrigger value="join">Join a game</TabsTrigger>
          <TabsTrigger value="solve">Solve a game</TabsTrigger>
          <TabsTrigger value="timeout">Timeout a game</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <NewGameTab />
        </TabsContent>
        <TabsContent value="join">
          <JoinGameTab />
        </TabsContent>
        <TabsContent value="solve">
          <SolveGameTab />
        </TabsContent>
        <TabsContent value="timeout">
          <TimeoutGameTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameLogic;
