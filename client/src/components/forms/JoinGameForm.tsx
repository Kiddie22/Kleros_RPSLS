import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { useRpsContractFactory } from "@/hooks/useRpsContractFactory";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

const JoinGameForm = ({
  contractAddress,
  setIsJoinGameLoading,
}: {
  contractAddress: string;
  setIsJoinGameLoading?: (isLoading: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [stake, setStake] = useState<string>("0");

  const { walletAddress, provider, signer } = useWeb3();
  const { abi } = useRpsContractFactory(signer);

  const moves = {
    Null: 0,
    Rock: 1,
    Paper: 2,
    Scissors: 3,
    Lizard: 4,
    Spock: 5,
  } as const;

  const formSchema = z.object({
    contractAddress: z
      .string()
      .refine((value) => ethers.utils.isAddress(value), {
        message:
          "Provided address is invalid. Please insure you have typed correctly.",
      }),
    p2Move: z.string().min(1, "Please select a move"),
    stake: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractAddress: contractAddress,
      p2Move: "",
      stake: stake,
    },
  });

  const getContractStake = async (contractAddress: string) => {
    try {
      const contract = new ethers.Contract(contractAddress, abi, provider!);
      const stake = await contract.stake();
      // convert to ether
      return ethers.utils.formatEther(stake);
    } catch (error) {
      console.log((error as Error).message);
      throw error;
    }
  };

  useEffect(() => {
    const fetchStake = async () => {
      setError("");
      try {
        const stake = await getContractStake(contractAddress);
        setStake(stake!);
      } catch (error) {
        console.log((error as Error).message);
        setError("This does not seem to be a valid RPS contract address.");
      }
    };

    if (contractAddress && ethers.utils.isAddress(contractAddress)) {
      fetchStake();
    }
  }, [contractAddress]);

  // Notify parent component of loading state changes
  useEffect(() => {
    setIsJoinGameLoading?.(isLoading);
  }, [isLoading, setIsJoinGameLoading]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      console.log(values);

      setError("");

      const contract = new ethers.Contract(
        values.contractAddress,
        abi,
        signer!
      );
      const moveValue = parseInt(values.p2Move);

      // Validate move value
      if (isNaN(moveValue) || moveValue < 1 || moveValue > 5) {
        throw new Error("Invalid move value. Must be between 1 and 5.");
      }

      // Fetch required contract info
      const [j2, stake, c2] = await Promise.all([
        contract.j2(),
        contract.stake(),
        contract.c2(),
      ]);

      // Ensure this wallet is player 2
      if (j2.toLowerCase() !== walletAddress.toLowerCase()) {
        setError(
          "This wallet is not the second player. Please switch to the correct wallet."
        );
        setIsLoading(false);
        return;
      }

      // Ensure not already solved
      if (stake.isZero()) {
        setError("This game has already been solved.");
        setIsLoading(false);
        return;
      }

      // Ensure player 2 has not made a move
      if (c2 !== 0) {
        setError("Player 2 has already made a move.");
        setIsLoading(false);
        return;
      }

      const tx = await contract.play(moveValue, {
        value: ethers.utils.parseEther(ethers.utils.formatEther(stake)),
      });

      const receipt = await tx.wait();
      console.log(receipt);

      console.log("Game joined successfully");
      setSuccess(true);
      setIsLoading(false);
    } catch (error) {
      console.log({ error });

      if ((error as any).code === "INSUFFICIENT_FUNDS") {
        setError(
          "Insufficient funds to join the game. Please add more ETH to your wallet."
        );
        setIsLoading(false);
        return;
      } else if ((error as any).code === "ACTION_REJECTED") {
        setError("Transaction was rejected. Please try again.");
        setIsLoading(false);
        return;
      }

      setError((error as Error).message);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="flex items-center gap-2">
          <CheckIcon className="w-10 h-10 text-green-500 animate-pulse border-2 border-green-500 rounded-full p-1" />
          <p className=" text-xl">Game joined!</p>
        </div>
        <p className="text-sm text-gray-500">
          Wait till player 1 solves the game, our cash out if the game times
          out.
        </p>
      </>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="contractAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0x..."
                    {...field}
                    value={contractAddress}
                    disabled={true}
                  />
                </FormControl>
                <FormDescription>
                  This is the address of the contract you are joining.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stake"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stake</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    type="string"
                    {...field}
                    value={`${stake} ETH`}
                    disabled={true}
                  />
                </FormControl>
                <FormDescription>
                  You cannot change this value. It will match the stake set by
                  player 1.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="p2Move"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Your move</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setError("");
                    }}
                    value={field.value}
                    disabled={
                      form.getValues("contractAddress") === "" || isLoading
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem
                        value={moves.Rock.toString()}
                        key={moves.Rock}
                      >
                        Rock
                      </SelectItem>
                      <SelectItem
                        value={moves.Paper.toString()}
                        key={moves.Paper}
                      >
                        Paper
                      </SelectItem>
                      <SelectItem
                        value={moves.Scissors.toString()}
                        key={moves.Scissors}
                      >
                        Scissors
                      </SelectItem>
                      <SelectItem
                        value={moves.Lizard.toString()}
                        key={moves.Lizard}
                      >
                        Lizard
                      </SelectItem>
                      <SelectItem
                        value={moves.Spock.toString()}
                        key={moves.Spock}
                      >
                        Spock
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Joining..." : "Join game"}
          </Button>
          <p
            data-slot="form-message"
            className={cn("text-destructive text-sm")}
          >
            {error}
          </p>
        </form>
      </Form>
    </div>
  );
};

export default JoinGameForm;
