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
import { Button } from "./ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { useRpsContractFactory } from "@/hooks/useRpsContractFactory";
import { cn } from "@/lib/utils";

const JoinGameTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [contractAddress, setContractAddress] = useState<string>("");
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
      contractAddress: "",
      p2Move: "",
      stake: "0",
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

      // Check if contract is in correct state for player 2 to play
      const c2 = await contract.c2();
      const j2 = await contract.j2();

      if (j2.toLowerCase() !== walletAddress.toLowerCase()) {
        setError(
          "This wallet is not the second player. Please switch to the correct wallet."
        );
        setIsLoading(false);
        return;
      }

      if (c2 !== 0) {
        setError("Player 2 has already made a move.");
        setIsLoading(false);
        return;
      }

      const tx = await contract.play(moveValue, {
        value: ethers.utils.parseEther(stake),
      });

      const receipt = await tx.wait();
      console.log(receipt);

      console.log("Game joined successfully");
      setIsLoading(false);
    } catch (error) {
      setError(error as string);
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl py-3">Join a game</h1>

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
                    onChange={(e) => {
                      setStake("0");
                      field.onChange(e.target.value);
                      setContractAddress(e.target.value);
                    }}
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
                  This is the stake set by player 1. You must match this stake
                  to join the game.
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
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={form.getValues("contractAddress") === ""}
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
          <Button type="submit" disabled={isLoading || error !== ""}>
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

export default JoinGameTab;
