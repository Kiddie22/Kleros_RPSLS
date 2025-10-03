import { ethers } from "ethers";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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

import { useRpsContractFactory } from "@/hooks/useRpsContractFactory";
import { useWeb3 } from "@/contexts/Web3Context";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NewGameTab = ({
  setIsNewGameLoading,
}: {
  setIsNewGameLoading: (isLoading: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [contractAddress, setContractAddress] = useState<string>("");
  const [saltBigNumber, setSaltBigNumber] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(0)
  );

  const { signer, walletAddress } = useWeb3();
  const { contractFactory } = useRpsContractFactory(signer);

  const moves = {
    Null: 0,
    Rock: 1,
    Paper: 2,
    Scissors: 3,
    Lizard: 4,
    Spock: 5,
  } as const;

  const formSchema = z.object({
    p1Move: z.string().min(1, "Please select a move"),
    p2Address: z
      .string()
      .refine((value) => ethers.utils.isAddress(value), {
        message:
          "Provided address is invalid. Please insure you have typed correctly.",
      })
      .refine((value) => value.toLowerCase() !== walletAddress.toLowerCase(), {
        message: "You cannot play against yourself.",
      }),
    stake: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Stake must be a positive number",
    }),
  });

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      p1Move: "",
      p2Address: "",
      stake: "0",
    },
  });

  // Define a submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError("");
      console.log(values);

      const saltBytes = ethers.utils.randomBytes(16);
      const saltBigNumber = ethers.BigNumber.from(saltBytes);
      const moveValue = parseInt(values.p1Move);

      const hash = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["uint8", "uint256"],
          [moveValue, saltBigNumber]
        )
      );
      setSaltBigNumber(saltBigNumber);

      console.log("Deploying contract...");
      const contract = await contractFactory?.deploy(hash, values.p2Address, {
        value: ethers.utils.parseEther(values.stake),
      });
      console.log("contract address", contract?.address);
      await contract?.deployTransaction.wait();
      console.log("contract deployed");
      setContractAddress(contract?.address!);
      setIsLoading(false);

      // Save game to DB
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/game/new-game`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contractAddress: contract?.address,
            stake: values.stake,
            player1: walletAddress,
            player2: values.p2Address,
          }),
        }
      );

      const data = await response.json();
      console.log({ data });

      // Display toast notification
      toast.success("New game created", {
        description: `Contract deployed to address: ${contract?.address}. Send this to your opponent to join the game.`,
        action: {
          label: "View contract",
          onClick: () => {
            window.open(
              `https://sepolia.etherscan.io/address/${contract?.address}`,
              "_blank"
            );
          },
        },
        position: "top-center",
        duration: 10000,
      });
    } catch (error) {
      console.log({ error });

      if ((error as any).code === "INSUFFICIENT_FUNDS") {
        setError(
          "Insufficient funds to deploy contract. Please add more ETH to your wallet."
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

  useEffect(() => {
    setIsNewGameLoading(isLoading);
  }, [isLoading, setIsNewGameLoading]);

  return (
    <div className="w-[40vw] mb-5">
      {contractAddress ? (
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold">New game created!</span>
          <span className="text-sm">Contract address:</span>
          <span className="text-gray-500 font-bold">{contractAddress}</span>
          <span className="text-sm font-light mb-4">
            Send this to your opponent to join the game
          </span>
          <span className="text-sm">Salt:</span>
          <span className="text-gray-500 font-bold flex items-center gap-8">
            {saltBigNumber.toString()}
            <Button
              className="cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(saltBigNumber.toString());
                console.log("Salt copied to clipboard");
                toast.success("Salt copied to clipboard", {
                  duration: 5000,
                  position: "top-center",
                });
              }}
            >
              Copy salt
            </Button>
          </span>
          <span className="text-sm font-light">
            Do not share it with anyone and do not lose it. You will need it to
            solve the game.
          </span>
        </div>
      ) : (
        <>
          <h1 className="text-2xl py-3 text-center">Start a new game</h1>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 w-full"
            >
              <FormField
                control={form.control}
                name="p1Move"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Your move</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
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

              <FormField
                control={form.control}
                name="p2Address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address of opponent</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0x..."
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      This is who you are playing against.
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
                    <FormLabel>Stake value</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        {...field}
                        type="number"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      This stake will be matched by your opponent.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Deploying..." : "Start game"}
              </Button>
              <p
                data-slot="form-message"
                className={cn("text-destructive text-sm")}
              >
                {error}
              </p>
            </form>
          </Form>
        </>
      )}
    </div>
  );
};

export default NewGameTab;
