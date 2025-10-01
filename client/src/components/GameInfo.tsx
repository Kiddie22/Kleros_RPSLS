import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { truncateAddress } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import JoinGameForm from "./forms/JoinGameForm";
import SolveGameForm from "./forms/SolveGameForm";
import TimeoutGameForm from "./forms/TimeoutGameForm";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/contexts/Web3Context";
import { useRpsContractFactory } from "@/hooks/useRpsContractFactory";
import { Badge } from "./ui/badge";
import CountdownClock from "./CountdownClock";

const GameInfo = ({ game }: { game: any }) => {
  const contractAddress = game.contractAddress;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasPlayer2Moved, setHasPlayer2Moved] = useState<boolean>(false);
  const [hasGameSolved, setHasGameSolved] = useState<boolean>(false);
  const [hasGameTimedOut, setHasGameTimedOut] = useState<boolean>(false);
  const [timeoutThresholdDate, setTimeoutThresholdDate] = useState<Date>(
    new Date()
  );

  const { signer } = useWeb3();
  const { abi } = useRpsContractFactory(signer);

  const fetchGameInfo = async () => {
    if (!signer || !abi) {
      console.log("No signer or abi available, skipping fetch");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching game info...");
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const c2 = await contract.c2();
      const stake = await contract.stake();

      const TIMEOUT_SECONDS = await contract.TIMEOUT();
      const lastActionTimestamp = await contract.lastAction();

      // convert BigNumber to number and create date
      const timeout_seconds = TIMEOUT_SECONDS.toNumber();
      const lastActionDate = new Date(lastActionTimestamp.toNumber() * 1000);
      const currentTime = Date.now();
      const timeoutThreshold =
        lastActionDate.getTime() + timeout_seconds * 1000;

      // Update states
      const player2Moved = c2 !== 0;
      const gameSolved = stake.isZero();
      const gameTimedOut = currentTime > timeoutThreshold;

      console.log("Game state:", {
        player2Moved,
        gameSolved,
        gameTimedOut,
        c2: c2.toString(),
        stake: stake.toString(),
        timeoutThreshold,
        currentTime,
        lastActionDate: lastActionDate.toISOString(),
      });

      setHasPlayer2Moved(player2Moved);
      setHasGameSolved(gameSolved);
      setHasGameTimedOut(gameTimedOut);
      setTimeoutThresholdDate(new Date(timeoutThreshold));

      console.log("Game info fetched successfully");
    } catch (error) {
      console.error("Error fetching game info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered", {
      signer: !!signer,
      abi: !!abi,
      contractAddress,
    });
    if (signer && abi) {
      fetchGameInfo();
    }
  }, [contractAddress, signer, abi]);

  // Set up periodic refresh to keep state updated
  useEffect(() => {
    if (!signer || !abi || hasGameSolved) return;

    const interval = setInterval(() => {
      if (hasGameSolved) return;
      fetchGameInfo();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [signer, abi, contractAddress]);

  // Show loading only when we're actually fetching data
  if (isLoading && signer && abi) {
    return (
      <Card className="w-[40vw] mb-5">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading game info...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-[40vw] mb-5">
        <CardHeader>
          <CardTitle>Game Info</CardTitle>
          <CardDescription>
            Contract: {game.contractAddress}
            {!hasGameSolved && (
              <CountdownClock timeoutThresholdDate={timeoutThresholdDate} />
            )}
            <div className="flex flex-row gap-2 mt-2">
              {/* Show only the game solved badge if the game has been solved */}
              {hasGameSolved && (
                <Badge className="text-xs text-green-500 bg-green-500/10">
                  Game solved
                </Badge>
              )}

              {/* Show the game timed out badge plus next move */}
              {!hasGameSolved && hasGameTimedOut && (
                <Badge className="text-xs text-red-500 bg-red-500/10">
                  Game timed out
                </Badge>
              )}

              {!hasGameSolved && hasPlayer2Moved && (
                <Badge className="text-xs text-blue-500 bg-blue-500/10">
                  Player 1 turn to solve
                </Badge>
              )}

              {!hasGameSolved && !hasPlayer2Moved && (
                <Badge className="text-xs text-blue-500 bg-blue-500/10">
                  Player 2 turn
                </Badge>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row justify-between text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-2">
              <Avatar className="size-10 border-2 border-primary/20">
                <AvatarImage src={`https://robohash.org/${game.player1}`} />
                <AvatarFallback>P1</AvatarFallback>
              </Avatar>
              P1: {truncateAddress(game.player1)}
            </span>

            <span className="text-black font-bold text-2xl">vs</span>

            <span className="flex items-center gap-2">
              <Avatar className="size-10 border-2 border-primary/20">
                <AvatarImage src={`https://robohash.org/${game.player2}`} />
                <AvatarFallback>P2</AvatarFallback>
              </Avatar>
              P2: {truncateAddress(game.player2)}
            </span>
          </div>

          <p>Stake: {game.stake} ETH</p>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Dialog onOpenChange={(open) => !open && fetchGameInfo()}>
            <DialogTrigger asChild>
              <Button
                className="w-full cursor-pointer"
                disabled={hasPlayer2Moved}
                hidden={hasPlayer2Moved}
              >
                Join Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w">
              <DialogHeader className="mb-4">
                <DialogTitle>Join Game</DialogTitle>
                <DialogDescription>
                  Join the game by submitting your move.
                </DialogDescription>
              </DialogHeader>
              <JoinGameForm contractAddress={game.contractAddress} />
            </DialogContent>
          </Dialog>

          <Dialog onOpenChange={(open) => !open && fetchGameInfo()}>
            <DialogTrigger asChild>
              <Button
                className="w-full cursor-pointer"
                disabled={hasGameSolved || !hasPlayer2Moved}
                hidden={hasGameSolved || !hasPlayer2Moved}
              >
                Solve Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w">
              <DialogHeader className="mb-4">
                <DialogTitle>Solve Game</DialogTitle>
                <DialogDescription>
                  Solve the game when all players have submitted their moves.
                </DialogDescription>
              </DialogHeader>
              <SolveGameForm contractAddress={game.contractAddress} />
            </DialogContent>
          </Dialog>

          <Dialog onOpenChange={(open) => !open && fetchGameInfo()}>
            <DialogTrigger asChild>
              <Button
                className="w-full cursor-pointer"
                disabled={hasGameSolved || !hasGameTimedOut}
                hidden={hasGameSolved}
              >
                Timeout Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w">
              <DialogHeader className="mb-4">
                <DialogTitle>Timeout Game</DialogTitle>
                <DialogDescription>
                  Timeout the game when opponent does not respond.
                </DialogDescription>
              </DialogHeader>
              <TimeoutGameForm contractAddress={game.contractAddress} />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </>
  );
};

export default GameInfo;
