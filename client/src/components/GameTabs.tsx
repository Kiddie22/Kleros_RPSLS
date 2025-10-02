import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewGameTab from "./NewGameTab";
import { useWeb3 } from "@/contexts/Web3Context";
import JoinGameTab from "./JoinGameTab";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { truncateAddress } from "@/lib/utils";

const GameTabs = () => {
  const { walletAddress } = useWeb3();

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <span>Hey there,</span>
      <span className="flex items-center gap-2">
        <Avatar className="size-10 border-2 border-primary/20">
          <AvatarImage
            src={`https://robohash.org/${walletAddress.toLowerCase()}`}
          />
          <AvatarFallback>P1</AvatarFallback>
        </Avatar>
        P1: {truncateAddress(walletAddress)}
      </span>

      <Tabs defaultValue="new">
        <TabsList className="w-full">
          <TabsTrigger value="new">Start a new game</TabsTrigger>
          <TabsTrigger value="join">Join a game</TabsTrigger>
        </TabsList>
        <Separator className="my-4" />
        <TabsContent value="new">
          <NewGameTab />
        </TabsContent>
        <TabsContent value="join">
          <JoinGameTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameTabs;
